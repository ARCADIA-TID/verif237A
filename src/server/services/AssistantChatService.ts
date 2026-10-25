/**
 * VÉRIF237 — Moteur Conversationnel de l'Assistant IA (AssistantChatService)
 * 
 * - Orchestre les conversations multi-tours pour les citoyens camerounais.
 * - Connexion native au modèle gemini-3.8-flash via le SDK @google/genai.
 * - Recherche Web et ancrage Google Search ({ googleSearch: {} }).
 * - Interrogation et enrichissement par la base de données interne de Vérif237 (actes officiels, alertes, décrets).
 * - Système d'instruction spécifique et strict respectant la charte déontologique Vérif237.
 * - Moteur résilient de repli civique en cas d'absence de clé ou d'indisponibilité réseau.
 */

import { GoogleGenAI } from '@google/genai';
import { db, AssistantConversationDB, AssistantMessageDB, AssistantSourceDB } from '../db';
import { internalKnowledgeService } from './InternalKnowledgeService';
import { CAMEROON_OFFICIAL_INSTITUTIONS } from '../ministriesData';

export interface ChatRequestInput {
  conversationId?: string;
  message: string;
  userId?: string;
  userSessionId?: string;
}

export interface ChatResponseOutput {
  conversationId: string;
  title: string;
  message: AssistantMessageDB;
  sources: AssistantSourceDB[];
  groundingSearchQueries: string[];
}

export class AssistantChatService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string | null = null;

  // Instruction système officielle requise pour l'Assistant Vérif237
  public readonly SYSTEM_INSTRUCTION = `Tu es l'Assistant IA officiel de Vérif237, une plateforme camerounaise qui contribue à la lutte contre la désinformation et la sous-information.

Ta mission est d'aider les citoyens à comprendre l'information, à analyser les affirmations qui circulent en ligne, à identifier les sources fiables et à développer leur esprit critique.

Tu réponds en français par défaut. Tu peux également répondre en anglais et, lorsque tes capacités le permettent, aider les utilisateurs qui s'expriment dans d'autres langues utilisées au Cameroun.

Tu peux répondre aux questions générales sur la technologie, l'éducation, la culture, les démarches administratives, l'actualité, l'environnement, la santé publique et d'autres sujets utiles aux citoyens.

Tu dois privilégier des réponses claires, structurées, pédagogiques et adaptées au contexte camerounais.

Tu ne dois jamais inventer une source, une citation, une date, un résultat de recherche ou une information officielle.

Lorsqu'une question concerne une information récente, une actualité, un concours administratif, une bourse, une offre d'emploi ou une annonce gouvernementale, tu dois rechercher des sources actualisées lorsque les outils nécessaires sont disponibles.

Privilégie les sources primaires : sites officiels des administrations camerounaises, communiqués institutionnels, documents originaux et publications des organismes concernés.

Distingue clairement les faits établis, les affirmations non confirmées, les interprétations et les hypothèses.

Si les sources disponibles ne permettent pas de conclure, explique honnêtement cette limite au lieu d'inventer une réponse.

Lorsque l'utilisateur soumet une information à analyser, identifie les affirmations vérifiables, examine les éléments disponibles et explique les raisons de ton analyse.

Ne présente jamais une information comme officiellement vérifiée uniquement parce qu'elle semble plausible.

Tu dois distinguer ton analyse préliminaire de la vérification officielle éventuellement réalisée par les vérificateurs humains de Vérif237.

Tu ne dois jamais prétendre avoir effectué une recherche sur Internet si aucun outil de recherche n'a été exécuté.

Ne demande pas inutilement des données personnelles. Invite l'utilisateur à masquer les numéros de téléphone, pièces d'identité et autres informations privées dans les documents ou captures qu'il partage.

Ton objectif est d'informer, d'expliquer et d'aider les citoyens à exercer leur esprit critique, sans propager de fausses informations.`;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || null;
    if (this.apiKey && this.apiKey.trim().length > 0) {
      try {
        this.ai = new GoogleGenAI({});
      } catch (err) {
        console.warn('[AssistantChatService] Erreur initialisation GoogleGenAI:', err);
      }
    }
  }

  public isAiConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && this.ai);
  }

  /**
   * Traitement d'un message utilisateur et retour de la réponse assistée
   */
  public async processMessage(input: ChatRequestInput): Promise<ChatResponseOutput> {
    const rawText = input.message.trim();
    if (!rawText) {
      throw new Error('Le message ne peut pas être vide.');
    }

    if (rawText.length > 4000) {
      throw new Error('Le message dépasse la taille maximale autorisée (4 000 caractères).');
    }

    const nowIso = new Date().toISOString();

    // 1. Récupération ou création de la conversation
    let conversation: AssistantConversationDB;
    if (input.conversationId) {
      const existing = db.getAssistantConversation(input.conversationId);
      if (existing) {
        conversation = existing;
      } else {
        conversation = {
          id: input.conversationId,
          title: this.generateConversationTitle(rawText),
          userId: input.userId,
          userSessionId: input.userSessionId,
          createdAt: nowIso,
          updatedAt: nowIso,
          messages: []
        };
      }
    } else {
      const convId = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      conversation = {
        id: convId,
        title: this.generateConversationTitle(rawText),
        userId: input.userId,
        userSessionId: input.userSessionId,
        createdAt: nowIso,
        updatedAt: nowIso,
        messages: []
      };
    }

    // 2. Enregistrement du message utilisateur
    const userMsg: AssistantMessageDB = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: 'user',
      content: rawText,
      timestamp: nowIso
    };
    conversation.messages.push(userMsg);

    // 3. Interrogation de la base de connaissances interne Vérif237
    const internalKnowledge = await internalKnowledgeService.searchInternalKnowledge(rawText);

    // Construction d'un bloc de contexte factuel vérifié issu de la base interne
    let internalContext = '';
    const collectedSources: AssistantSourceDB[] = [];

    if (internalKnowledge.matchedInvestigations.length > 0) {
      internalContext += '\n--- VÉRIFICATIONS ET DOSSIERS ANTÉRIEURS DANS VÉRIF237 ---\n';
      for (const inv of internalKnowledge.matchedInvestigations.slice(0, 3)) {
        internalContext += `- Réf ${inv.code} : « ${inv.title} » | Verdict : ${inv.verdict || 'En cours'} (Date: ${inv.submittedAt.split('T')[0]})\n`;
        collectedSources.push({
          title: `Dossier Vérif237 (${inv.code})`,
          organization: 'Observatoire Citoyen Vérif237',
          date: inv.submittedAt.split('T')[0],
          url: `/dossiers-actus`,
          isOfficial: true,
          reliability: 'officielle'
        });
      }
    }

    if (internalKnowledge.matchedInstitutions.length > 0) {
      internalContext += '\n--- RÉPERTOIRE DES INSTITUTIONS OFFICIELLES DU CAMEROUN ---\n';
      for (const inst of internalKnowledge.matchedInstitutions.slice(0, 3)) {
        internalContext += `- ${inst.fullName} (${inst.acronym}) : Portail officiel ${inst.officialWebsite}\n`;
        collectedSources.push({
          title: `Portail Officiel — ${inst.fullName} (${inst.acronym})`,
          organization: inst.acronym,
          url: inst.officialWebsite,
          isOfficial: true,
          reliability: 'officielle'
        });
      }
    }

    // 4. Appel au modèle d'intelligence artificielle ou repli déontologique
    let assistantReply = '';
    let groundingSearchQueries: string[] = [];

    // Limiter l'historique multi-tours aux 10 derniers messages pour respecter le contexte
    const recentMessages = conversation.messages.slice(-10);

    if (this.ai && this.apiKey) {
      try {
        const contents = recentMessages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

        // Injection du contexte interne dans la dernière question utilisateur
        if (internalContext.trim().length > 0) {
          const lastIdx = contents.length - 1;
          contents[lastIdx].parts[0].text += `\n\n[CONTEXTE FACTUEL VÉRIFIÉ DE LA BASE INTERNE VÉRIF237 (Données institutionnelles camerounaises réelles) :${internalContext}]`;
        }

        // Appel de gemini-3.8-flash avec Search Grounding
        const response = await this.ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: this.SYSTEM_INSTRUCTION,
            temperature: 0.3,
            maxOutputTokens: 2048,
            tools: [{ googleSearch: {} }]
          }
        });

        assistantReply = response.text || '';

        // Extraction des métadonnées de grounding et des sources Google Search réelles
        const candidate = response.candidates?.[0];
        const groundingMeta = candidate?.groundingMetadata;

        if (groundingMeta?.webSearchQueries && Array.isArray(groundingMeta.webSearchQueries)) {
          groundingSearchQueries = groundingMeta.webSearchQueries;
        }

        if (groundingMeta?.groundingChunks && Array.isArray(groundingMeta.groundingChunks)) {
          for (const chunk of groundingMeta.groundingChunks) {
            const web = (chunk as any).web;
            if (web && web.uri) {
              const uri = web.uri;
              const title = web.title || 'Source Web consultée';
              const isCmOfficial = uri.includes('.cm') || uri.includes('.gov.cm') || uri.includes('prc.cm');

              // Éviter les doublons
              if (!collectedSources.some(s => s.url === uri)) {
                collectedSources.push({
                  title,
                  url: uri,
                  organization: isCmOfficial ? 'Administration Camerounaise' : 'Web public',
                  isOfficial: isCmOfficial,
                  reliability: isCmOfficial ? 'officielle' : 'reference_documentaire'
                });
              }
            }
          }
        }
      } catch (err: any) {
        console.warn('[AssistantChatService] Erreur lors de l’appel Gemini, activation du repli déontologique:', err.message);
        assistantReply = this.generateResilientCivicResponse(rawText, internalKnowledge);
      }
    } else {
      // Repli civique structuré lorsque l'API externe n'est pas encore configurée
      assistantReply = this.generateResilientCivicResponse(rawText, internalKnowledge);
    }

    if (!assistantReply || assistantReply.trim().length === 0) {
      assistantReply = "Je n'ai pas pu générer une réponse complète pour le moment. Veuillez vérifier la formulation de votre question ou consulter directement notre répertoire des actes officiels.";
    }

    // 5. Enregistrement du message assistant
    const assistantMsg: AssistantMessageDB = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: 'assistant',
      content: assistantReply,
      timestamp: new Date().toISOString(),
      sources: collectedSources.length > 0 ? collectedSources : undefined,
      groundingSearchQueries: groundingSearchQueries.length > 0 ? groundingSearchQueries : undefined
    };

    conversation.messages.push(assistantMsg);
    conversation.updatedAt = new Date().toISOString();

    // Mettre à jour le titre si c'est la première réponse
    if (conversation.messages.length <= 2) {
      conversation.title = this.generateConversationTitle(rawText);
    }

    db.saveAssistantConversation(conversation);

    return {
      conversationId: conversation.id,
      title: conversation.title,
      message: assistantMsg,
      sources: collectedSources,
      groundingSearchQueries
    };
  }

  /**
   * Générateur de titre concis pour une conversation
   */
  private generateConversationTitle(firstMessage: string): string {
    const cleaned = firstMessage
      .replace(/[\r\n]+/g, ' ')
      .replace(/^(bonjour|bonsoir|salut|hello|aide-moi|peux-tu|est-ce que|comment)\s+/i, '')
      .trim();
    if (!cleaned) return 'Nouvelle conversation';
    if (cleaned.length <= 45) return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    return cleaned.slice(0, 42).trim() + '…';
  }

  /**
   * Moteur de repli civique expert (Civic Knowledge & Fact-Checking Fallback)
   * Fournit des réponses factuelles complètes basées sur les bases officielles du Cameroun.
   */
  private generateResilientCivicResponse(query: string, internal: any): string {
    const qLower = query.toLowerCase();

    // 1. Détection des arnaques fréquentes (frais via Orange Money / MTN MoMo, faux concours)
    if (qLower.includes('orange money') || qLower.includes('mtn momo') || qLower.includes('mobile money') || qLower.includes('frais de quittance') || qLower.includes('frais de dossier')) {
      return `### ⚠️ Alerte Déontologique : Examen des frais et modalités de paiement

Au Cameroun, **aucun concours administratif de la Fonction Publique (MINFOPRA, Police, Douanes, ENAM) ni aucun acte d'état civil ne perçoit de frais via Orange Money ou MTN Mobile Money**.

#### Règle institutionnelle stricte :
1. **Légalité du paiement :** Tout droit de timbre ou frais d'inscription légal s'acquitte obligatoirement auprès des régies du **Trésor Public** ou d'agences bancaires agréées donnant lieu à une quittance sécurisée.
2. **Signalement d'escroquerie :** Toute annonce exigeant un transfert d'argent sur un numéro de téléphone personnel sous prétexte de « réserver une place » ou de « valider un dossier » est une **tentative d'escroquerie avérée**.
3. **Canal de vérification :** Consultez toujours les arrêtés signés sur le portail officiel du ministère concerné (ex: *minfopra.gov.cm* pour la Fonction Publique).

*Cette mise en garde fait partie des protocoles d'alerte certifiés par l'Observatoire Vérif237.*`;
    }

    // 2. Détection des questions sur la Carte Nationale d'Identité (CNI)
    if (qLower.includes('cni') || qLower.includes('carte nationale d\'identité') || qLower.includes('enrôlement') || qLower.includes('dgsn')) {
      return `### 🛂 Procédure Officielle de Délivrance de la CNI au Cameroun

La délivrance de la Carte Nationale d'Identité relève de la compétence exclusive de la **Délégation Générale à la Sûreté Nationale (DGSN)**.

#### Éléments clés de la démarche :
- **Pré-enrôlement en ligne obligatoire :** Effectuez votre démarche préalable sur la plateforme officielle de la DGSN : \`https://dgsn.cm\`.
- **Frais légaux fixés par décret :** Le droit de timbre officiel est fixé par la loi de finances. Aucun frais supplémentaire non quittancé ne peut être exigé dans les postes d'identification.
- **Pièces requises :** 
  - Extrait d'acte de naissance certifié conforme ou copie certifiée.
  - Ancienne CNI (en cas de renouvellement) ou certificat de perte officiel.
  - Justificatif de profession (titre professionnel, attestation de travail ou diplôme).
- **Rappel civique :** Méfiez-vous des intermédiaires informels aux abords des commissariats. Aucune procédure d'urgence payante non officielle n'est reconnue.`;
    }

    // 3. Détection des concours MINFOPRA / Fonction Publique
    if (qLower.includes('minfopra') || qLower.includes('fonction publique') || qLower.includes('concours administratif') || qLower.includes('recrutement instituteur')) {
      return `### 📋 Concours Administratifs et Recrutements de la Fonction Publique (MINFOPRA)

Les recrutements au sein de la Fonction Publique camerounaise obéissent à des règles de publication précises :

1. **Publication par Arrêté ministériel :** Seuls les arrêtés signés par le Ministre de la Fonction Publique et de la Réforme Administrative font foi. Ils sont publiés au Journal Officiel et sur le site officiel \`http://www.minfopra.gov.cm\`.
2. **Dépôt des dossiers :** Le dépôt s'effectue directement auprès des Délégations Régionales du MINFOPRA ou via la plateforme de télé-procédure officielle.
3. **Quittances légales :** Les droits d'inscription sont versés auprès des comptables du Trésor Public. Les transferts électroniques privés sont formellement exclus.

> **Conseil pratique :** Si vous avez reçu un message WhatsApp annonçant un recrutement massif sans référence d'arrêté ministériel vérifiable, il s'agit très probablement d'un document falsifié. Vous pouvez soumettre ce texte dans notre onglet **« Vérifier »** pour une analyse forensique complète.`;
    }

    // 4. Démarche générale de vérification d'une information
    if (qLower.includes('comment vérifier') || qLower.includes('reconnaitre une fausse') || qLower.includes('fake news') || qLower.includes('whatsapp')) {
      return `### 🔍 Guide Pratique : Comment vérifier une information circulant en ligne

Pour évaluer la fiabilité d'une information au Cameroun, appliquez le protocole en 5 étapes recommandé par Vérif237 :

1. **Remonter à la source première :**
   - Qui est l'auteur réel de l'information ?
   - Le texte comporte-t-il un numéro de décret, une date précise et la signature d'une autorité habilitée ?
2. **Contrôler les éléments graphiques et tampons :**
   - Les fausses circulaires comportent souvent des polices disparates, des armoiries déformées ou des tampons recadrés provenant d'anciens documents.
3. **Se méfier des injonctions émotionnelles :**
   - Les formulations comme *« Partagez vite avant suppression »* ou *« Information urgente à diffuser à tous vos groupes »* sont les marqueurs typiques des chaînes virales manipulatrices.
4. **Vérifier l'existence de canaux de paiement frauduleux :**
   - Toute demande de versement d'argent par messagerie mobile pour un service public gratuit est une arnaque.
5. **Consulter le répertoire officiel :**
   - Utilisez l'onglet **« Actes »** de Vérif237 pour comparer le document avec les arrêtés certifiés en vigueur.`;
    }

    // 5. Réponse générale adaptée
    return `### 🏛️ Réponse de l'Assistant IA Vérif237

Merci pour votre question : **« ${query} »**.

En tant qu'assistant de Vérif237, j'analyse votre demande à la lumière des sources institutionnelles et des pratiques déontologiques au Cameroun :

1. **Sources recommandées :** Pour toute démarche ou vérification d'actualité, privilégiez toujours les portails officiels de l'État camerounais (domaines \`.cm\` et \`.gov.cm\`) ainsi que les organes de presse reconnus.
2. **Documents administratifs :** Si votre interrogation concerne un document précis (arrêté, concours, communiqué), vous pouvez consulter notre répertoire dans l'onglet **« Actes »** ou soumettre le texte directement dans l'onglet **« Vérifier »**.
3. **Prudence déontologique :** Aucune affirmation circulant sur les réseaux sociaux ne doit être considérée comme authentique sans recoupement direct auprès de l'organisme émetteur.

*Avez-vous un texte précis, un lien ou une affirmation spécifique que vous souhaitez que nous analysions ensemble ?*`;
  }
}

export const assistantChatService = new AssistantChatService();
