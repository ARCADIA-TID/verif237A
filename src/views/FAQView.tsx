import React, { useState, useMemo } from 'react';
import { NavPage } from '../types';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';

interface FAQViewProps {
  setCurrentPage: (page: NavPage) => void;
  onOpenSuggestModal?: () => void;
}

interface FAQItem {
  id: string;
  category: 'method' | 'signalement' | 'actes' | 'admin' | 'deontologie';
  categoryLabel: string;
  question: string;
  questionEn: string;
  answer: React.ReactNode;
  answerEn: React.ReactNode;
  tags: string[];
  icon: string;
  action?: {
    label: string;
    targetPage: NavPage;
  };
}

export const FAQView: React.FC<FAQViewProps> = ({
  setCurrentPage,
  onOpenSuggestModal
}) => {
  const { lang, t } = useI18n();
  const { isAuthenticated, role } = useAuth();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'q-1': true, // Open the first question by default
    'q-2': true
  });
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'yes' | 'no'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    faqList.forEach(item => { allOpen[item.id] = true; });
    setOpenIds(allOpen);
  };

  const collapseAll = () => {
    setOpenIds({});
  };

  const handleFeedback = (id: string, type: 'yes' | 'no') => {
    setFeedbackGiven(prev => ({ ...prev, [id]: type }));
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/#faq-${id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const categories = [
    { id: 'all', label: lang === 'EN' ? 'All Questions' : 'Toutes les questions', icon: 'help_outline' },
    { id: 'method', label: lang === 'EN' ? 'Methodology & Operation' : 'Fonctionnement & Méthodologie', icon: 'psychology' },
    { id: 'signalement', label: lang === 'EN' ? 'Reporting & Submissions' : 'Signalement & Vérification', icon: 'fact_check' },
    { id: 'actes', label: lang === 'EN' ? 'Official Decrees & Exams' : 'Actes officiels & Concours', icon: 'verified' },
    { id: 'admin', label: lang === 'EN' ? 'Accreditation & Access' : 'Accréditation, Rôles & Accès', icon: 'shield_person' },
    { id: 'deontologie', label: lang === 'EN' ? 'Ethics & Data Privacy' : 'Déontologie & Données citoyennes', icon: 'policy' }
  ];

  const faqList: FAQItem[] = [
    {
      id: 'q-1',
      category: 'method',
      categoryLabel: lang === 'EN' ? 'Methodology' : 'Fonctionnement général',
      icon: 'verified_user',
      question: 'Qu’est-ce que Vérif 237 et quelle est sa mission au Cameroun ?',
      questionEn: 'What is Verif 237 and what is its mission in Cameroon?',
      tags: ['Mission', 'Neutralité', 'Cameroun', 'Intérêt public'],
      action: {
        label: 'Consulter la Charte d’Éthique',
        targetPage: 'a-propos'
      },
      answer: (
        <div className="space-y-3">
          <p>
            <strong>Vérif 237</strong> est une plateforme civique et indépendante d’intérêt général consacrée à la lutte contre la désinformation, les arnaques financières en ligne et la falsification de documents administratifs en République du Cameroun.
          </p>
          <p>
            Créée pour répondre à la prolifération de fausses notes ministérielles, de faux arrêtés de concours et d'escroqueries par paiements mobiles (Orange Money / MTN MoMo), la plateforme permet à tout citoyen d'accéder à des informations vérifiées, recoupées auprès des sources primaires et scellées par empreinte cryptographique SHA-256.
          </p>
          <div className="pt-2 text-slate-600 dark:text-slate-400">
            Principes cardinaux : <em>Neutralité républicaine</em>, <em>recoupement contradictoire</em>, <em>transparence des preuves</em> et <em>gratuité absolue d'accès</em> pour tous les Camerounais des 10 régions et de la diaspora.
          </div>
        </div>
      ),
      answerEn: (
        <div className="space-y-3">
          <p>
            <strong>Verif 237</strong> is an independent civic platform dedicated to combating digital disinformation, online financial scams, and forged official documents across the Republic of Cameroon.
          </p>
          <p>
            Created in response to the spread of fake ministerial circulars, fraudulent recruitment notices, and Mobile Money fraud schemes, the platform enables citizens to access verified facts cross-referenced against primary official sources and cryptographically sealed with SHA-256.
          </p>
        </div>
      )
    },
    {
      id: 'q-2',
      category: 'method',
      categoryLabel: lang === 'EN' ? 'Methodology' : 'Méthode de vérification',
      icon: 'rule',
      question: 'Comment se déroule le protocole de vérification en 4 étapes ?',
      questionEn: 'How does the 4-step fact-checking protocol work?',
      tags: ['Protocole', 'IFCN', 'Collégialité', 'SHA-256'],
      action: {
        label: 'Explorer les analyses publiées',
        targetPage: 'actualites'
      },
      answer: (
        <div className="space-y-3">
          <p>
            Pour garantir une rigueur conforme aux standards internationaux du fact-checking (IFCN) et éviter toute décision partisane, chaque signalement suit un protocole immuable en 4 étapes :
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-slate-700 dark:text-slate-300">
            <li>
              <strong>Triage & Détection :</strong> Les signalements soumis par les citoyens veilleurs sont réceptionnés, dédoublonnés et indexés avec un code unique (ex : <code>#VRF-2025-0812</code>).
            </li>
            <li>
              <strong>Instruction Forensique & OSINT :</strong> Nos enquêteurs et analystes techniques vérifient les métadonnées (EXIF), recherchent l’antériorité de l’image via les moteurs inversés (Google Lens, TinEye) et analysent les artefacts graphiques (retouches, faux cachets).
            </li>
            <li>
              <strong>Contre-Expertise Juridique :</strong> Le dossier est confronté aux textes légaux, au Journal Officiel et aux 37 ministères camerounais (MINFOPRA, DGSN, MINSANTE, etc.). Un deuxième réviseur assermenté examine les éléments de preuve.
            </li>
            <li>
              <strong>Scellement Public SHA-256 & Double Signature :</strong> Aucun verdict d’infox n’est publié sans la contresignature de deux réviseurs distincts. Le verdict est ensuite scellé dans le registre d'audit inaltérable.
            </li>
          </ol>
        </div>
      ),
      answerEn: (
        <div className="space-y-3">
          <p>
            To guarantee fairness and adherence to IFCN standards, every alert follows a rigorous 4-step protocol:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-slate-700 dark:text-slate-300">
            <li><strong>Intake & Triage:</strong> De-duplication and indexing with a unique case ID.</li>
            <li><strong>Forensic & OSINT Investigation:</strong> EXIF metadata extraction, reverse image search, and forgery detection.</li>
            <li><strong>Official Cross-Examination:</strong> Cross-referencing against the 37 Cameroonian ministries and the Official Gazette.</li>
            <li><strong>Cryptographic Sealing & Double Signature:</strong> Two distinct certified reviewers must counter-sign before public release.</li>
          </ol>
        </div>
      )
    },
    {
      id: 'q-3',
      category: 'method',
      categoryLabel: lang === 'EN' ? 'Verdicts' : 'Échelle de notation',
      icon: 'label',
      question: 'Que signifient les verdicts VRAI, FAUX, TROMPEUR ou EN COURS ?',
      questionEn: 'What do the verdicts TRUE, FALSE, MISLEADING, or IN PROGRESS mean?',
      tags: ['Barème', 'Verdicts', 'Démentis'],
      answer: (
        <div className="space-y-3">
          <p>Vérif 237 applique un barème d'évaluation rigoureux et transparent :</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">✓ VRAI :</span>
              <span>L’information, la note ou l’acte administratif émane authentiquement de l'autorité compétente et est actuellement en vigueur.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-red-600 dark:text-red-400">✗ FAUX :</span>
              <span>Document fabriqué, fausse rumeur, calendrier inventé ou usurpation d’identité ministérielle formellement démentie.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-amber-600 dark:text-amber-400">⚠ TROMPEUR :</span>
              <span>L’information contient un fond réel (ex : ancien concours de 2021) mais ressorti hors de son contexte temporel ou géographique pour induire en erreur.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 dark:text-blue-400">⏱ EN COURS :</span>
              <span>Dossier actuellement sous instruction contradictoire auprès des services compétents. Le statut est mis à jour dès confirmation.</span>
            </li>
          </ul>
        </div>
      ),
      answerEn: (
        <div className="space-y-3">
          <p>Verif 237 uses a clear, evidence-based rating scale:</p>
          <ul className="space-y-2">
            <li><strong>TRUE:</strong> The document or statement is fully authentic and officially active.</li>
            <li><strong>FALSE:</strong> Fabricated notice, forged signature, fake exam, or financial scam.</li>
            <li><strong>MISLEADING:</strong> Partially accurate information taken out of context or recycled from previous years.</li>
            <li><strong>IN PROGRESS:</strong> Currently undergoing official cross-examination.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'q-4',
      category: 'signalement',
      categoryLabel: lang === 'EN' ? 'Reporting' : 'Signalement citoyen',
      icon: 'add_alert',
      question: 'Comment puis-je soumettre une rumeur ou un document suspect ?',
      questionEn: 'How can I submit a rumor or suspicious document for verification?',
      tags: ['Soumission', 'WhatsApp', 'Capture', 'Matricule'],
      action: {
        label: 'Soumettre une vérification',
        targetPage: 'verifier'
      },
      answer: (
        <div className="space-y-3">
          <p>
            Pour faire vérifier un message viral ou un document :
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
            <li>Rendez-vous dans la rubrique <strong>« Vérifier »</strong> du menu principal.</li>
            <li>Si vous n'êtes pas encore connecté, identifiez-vous (l’authentification civique prévient les signalements abusifs et robots spammeurs).</li>
            <li>Sélectionnez le format de votre pièce à conviction : message texte WhatsApp, lien web, capture d'écran ou document PDF.</li>
            <li>Indiquez la région camerounaise où vous avez constaté la diffusion et la date de première observation.</li>
            <li>Validez le serment civique et transmettez le dossier.</li>
          </ol>
          <p>
            Dès l'envoi, un système de pré-analyse automatique analyse les entités administratives mentionnées et vous attribue un <strong>code de suivi unique</strong> (ex : <code>#VRF-2025-XXXX</code>).
          </p>
        </div>
      ),
      answerEn: (
        <div className="space-y-3">
          <p>
            To submit an alert:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
            <li>Click on <strong>“Verify”</strong> in the main navigation.</li>
            <li>Log in with your civic account (required to protect against spam).</li>
            <li>Choose your medium: WhatsApp text, web link, image screenshot, or PDF file.</li>
            <li>Select the region and earliest date you observed the message.</li>
            <li>Submit to receive your unique tracking code (e.g. <code>#VRF-2025-XXXX</code>).</li>
          </ol>
        </div>
      )
    },
    {
      id: 'q-5',
      category: 'signalement',
      categoryLabel: lang === 'EN' ? 'Reporting' : 'Délai d’instruction',
      icon: 'hourglass_top',
      question: 'Quel est le délai moyen pour obtenir une réponse ou un démenti ?',
      questionEn: 'What is the average turnaround time for an official debunk?',
      tags: ['Délai', 'Urgence', 'Coupe-file', 'Temps réel'],
      answer: (
        <div className="space-y-3">
          <p>
            Le délai dépend du niveau d’urgence et de la viralité du message :
          </p>
          <ul className="space-y-2">
            <li>
              <strong>Urgence Haute (Coupe-file immédiat &lt; 2h) :</strong> Les arnaques financières réclamant des versements d’argent immédiats (faux frais de quittance par Mobile Money), les alertes sécuritaires ou les rumeurs pouvant troubler l'ordre public sont traitées en priorité absolue.
            </li>
            <li>
              <strong>Délai Standard (6h à 24h) :</strong> Les faux calendriers d'examens (OBC, GCE Board) ou de concours nécessitant la saisine directe d'une délégation régionale ou d'un directeur ministériel.
            </li>
            <li>
              <strong>Instruction Approfondie (24h à 48h) :</strong> Les dossiers complexes nécessitant des expertises graphologiques ou des enquêtes de terrain dans les régions éloignées.
            </li>
          </ul>
        </div>
      ),
      answerEn: (
        <div className="space-y-3">
          <p>
            Turnaround times vary based on urgency:
          </p>
          <ul className="space-y-2">
            <li><strong>High Urgency (Under 2 hours):</strong> Mobile Money fraud schemes, urgent financial scams, or public safety rumors.</li>
            <li><strong>Standard (6 to 24 hours):</strong> Fake exam calendars (OBC, GCE Board) and recruitment circulars.</li>
            <li><strong>In-depth (24 to 48 hours):</strong> Complex cases requiring ministerial correspondence or on-the-ground regional confirmation.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'q-6',
      category: 'actes',
      categoryLabel: lang === 'EN' ? 'Official Acts' : 'Authentification des actes',
      icon: 'gavel',
      question: 'Comment Vérif 237 authentifie-t-il les concours et actes ministériels ?',
      questionEn: 'How does Verif 237 authenticate public exams and ministerial notices?',
      tags: ['MINFOPRA', 'DGSN', 'MINESUP', 'Journal Officiel', 'Concours'],
      action: {
        label: 'Consulter le répertoire des actes',
        targetPage: 'actes'
      },
      answer: (
        <div className="space-y-3">
          <p>
            Vérif 237 maintient une passerelle documentaire directe avec les registres publics et les cellules de communication des institutions camerounaises.
          </p>
          <p>
            Pour chaque acte (concours de la Police / DGSN, recrutements MINFOPRA, examens de l'OBC ou du GCE Board, arrêtés MINFI) :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
            <li>Nous comparons le numéro d'enregistrement officiel au Journal Officiel de la République.</li>
            <li>Nous contrôlons la concordance des signatures et du sceau de l'État (la composition du cachet et de la devise nationale).</li>
            <li>Nous vérifions les modalités réelles de paiement des frais de dossier (le Trésor Public n'exige jamais de virement direct vers un compte personnel ou numéro WhatsApp inconnu).</li>
            <li>Nous publions l'extrait certifié conforme téléchargeable gratuitement au format PDF scellé.</li>
          </ul>
        </div>
      ),
      answerEn: (
        <div className="space-y-3">
          <p>
            Verif 237 cross-checks every public act against official registers and direct institutional press officers (MINFOPRA, DGSN, MINESUP, MINFI, OBC, GCE Board).
          </p>
          <p>
            We verify registration numbers, official seal typography, and legitimate Treasury fee collection channels (official revenue offices vs. fraudulent mobile transfer requests).
          </p>
        </div>
      )
    },
    {
      id: 'q-7',
      category: 'actes',
      categoryLabel: lang === 'EN' ? 'Official Acts' : 'Fraude & Faux concours',
      icon: 'warning',
      question: 'Quels sont les indices fréquents d’un faux communiqué ministériel ?',
      questionEn: 'What are common signs of a forged ministerial press release?',
      tags: ['Arnaques', 'Signes', 'Fautes', 'Paiement mobile'],
      action: {
        label: 'Lire le guide d’autodéfense',
        targetPage: 'a-propos'
      },
      answer: (
        <div className="space-y-3">
          <p>
            Les faussaires utilisent souvent des canevas répétitifs. Voici les 5 signaux d'alerte immédiats :
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
            <li>
              <strong>Paiement Mobile Money demandé :</strong> Les communiqués officiels ne demandent jamais d'envoyer des frais de quittance par Orange Money ou MTN MoMo vers le numéro personnel d'un prétendu « chef de bureau ».
            </li>
            <li>
              <strong>Incohérences de date ou d’en-tête :</strong> Coquilles dans la devise nationale (« Paix - Travail - Patrie »), absence du bilinguisme légal (Français / Anglais), ou date antérieure au mandat du ministre signataire.
            </li>
            <li>
              <strong>Police de caractère déformée :</strong> Cachet mal scanné avec contour blanc artificiel, signatures superposées de mauvaise qualité.
            </li>
            <li>
              <strong>Diffusion exclusive sur WhatsApp :</strong> Absence totale de publication sur le site web officiel du ministère concerné ou dans les éditions du quotidien national Cameroon Tribune.
            </li>
            <li>
              <strong>Urgence artificielle :</strong> Délais anormalement courts (ex : « dépôt sous 48 heures ») pour paniquer les candidats et forcer le paiement.
            </li>
          </ol>
        </div>
      ),
      answerEn: (
        <div className="space-y-3">
          <p>
            Common signs of forged public documents in Cameroon:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
            <li>Demand for payments to private Mobile Money numbers (Orange Money / MTN MoMo).</li>
            <li>Missing bilingual headers (French/English) or incorrect national motto.</li>
            <li>Low-resolution pixelated seals and superimposed copy-pasted signatures.</li>
            <li>Circulation exclusively in private WhatsApp groups with zero mention on official portals.</li>
            <li>Artificial panic deadlines (e.g. "submit within 48 hours").</li>
          </ol>
        </div>
      )
    },
    {
      id: 'q-8',
      category: 'admin',
      categoryLabel: lang === 'EN' ? 'Access & Roles' : 'Accès & Espace administration',
      icon: 'admin_panel_settings',
      question: 'Comment les administrateurs et réviseurs accèdent-ils à leurs espaces de travail ?',
      questionEn: 'How do administrators and verifiers access their workspaces?',
      tags: ['Administration', 'Connexion', 'Rôles', 'Espace visiteur'],
      action: {
        label: role === 'admin' ? 'Aller à la console d’administration' : 'Connexion civique',
        targetPage: role === 'admin' ? 'console-admin' : 'auth'
      },
      answer: (
        <div className="space-y-3">
          <p>
            L'accès à la gestion de Vérif 237 est direct, sans détour ni procédure inutile :
          </p>
          <ul className="space-y-2">
            <li>
              <strong>Pour les administrateurs (`admin` ou `super_admin`) :</strong> Dès connexion réussie, un bouton violet <strong>« Administration »</strong> apparaît dans le menu de navigation. Il donne un accès instantané à la console de gestion (gestion des comptes accrédités, matrice ontologique des rôles, journal d’audit immuable, clés API). Aucun passage obligé par la consultation d'une dépêche n'est imposé.
            </li>
            <li>
              <strong>Pour les réviseurs (`verificateur`) :</strong> Un bouton vert <strong>« Espace Vérificateurs »</strong> donne accès à la console d'investigation factuelle, à la file de traitement et aux outils OSINT.
            </li>
            <li>
              <strong>Bascule vers l’« Espace visiteur » :</strong> Les membres du collège peuvent à tout moment cliquer sur le lien « Espace visiteur » pour consulter le portail avec le même regard que le grand public camerounais.
            </li>
          </ul>
        </div>
      ),
      answerEn: (
        <div className="space-y-3">
          <p>
            Access is direct and strictly governed:
          </p>
          <p>
            Authenticated administrators see a dedicated <strong>“Administration”</strong> shortcut in the header navigation, granting immediate access to the governance dashboard, audit log, and role permissions. Verifiers have direct access to the <strong>“Verifier Space”</strong>. Both can return to the public portal in one click via <strong>“Visitor Space”</strong>.
          </p>
        </div>
      )
    },
    {
      id: 'q-9',
      category: 'admin',
      categoryLabel: lang === 'EN' ? 'Accreditation' : 'Rôles et habilitations',
      icon: 'badge',
      question: 'Qui peut devenir vérificateur accrédité sur Vérif 237 ?',
      questionEn: 'Who can become an accredited fact-checker on Verif 237?',
      tags: ['Accréditation', 'Journalistes', 'Juristes', 'Candidature'],
      answer: (
        <div className="space-y-3">
          <p>
            L'accréditation des vérificateurs est soumise à une sélection rigoureuse par le Conseil d'Administration et le Comité Éthique :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
            <li>Journalistes professionnels détenteurs d'une carte de presse ou spécialisés en journalisme d'investigation.</li>
            <li>Juristes, documentalistes et universitaires camerounais spécialisés en droit public ou en sciences de l'information.</li>
            <li>Engagement écrit de neutralité politique et d'absence de conflit d'intérêts direct avec des partis ou organisations partisanes.</li>
            <li>Signature de la Charte Déontologique IFCN et formation certifiante aux outils OSINT (recherche inversée, visualiseur EXIF, traçabilité WORM).</li>
          </ul>
        </div>
      ),
      answerEn: (
        <div className="space-y-3">
          <p>
            Accreditation is granted following strict review by the Ethics Committee. Applicants must be professional journalists, legal researchers, or information science scholars, with a proven track record, signed political neutrality pledge, and training in OSINT forensics.
          </p>
        </div>
      )
    },
    {
      id: 'q-10',
      category: 'deontologie',
      categoryLabel: lang === 'EN' ? 'Corrections' : 'Droit de réponse & Correction',
      icon: 'published_with_changes',
      question: 'Quelle est la procédure pour demander une rectification ou exercer un droit de réponse ?',
      questionEn: 'How can an entity or citizen request a correction or reply?',
      tags: ['Rectification', 'Droit de réponse', 'Transparence'],
      action: {
        label: 'Consulter la politique de correction',
        targetPage: 'a-propos'
      },
      answer: (
        <div className="space-y-3">
          <p>
            Vérif 237 applique une politique de correction transparente et ouverte :
          </p>
          <p>
            Si une institution publique, un citoyen ou un auteur visé apporte une pièce officielle probante nouvelle que nos équipes n’avaient pu obtenir lors de l’enquête initiale :
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
            <li>La demande est instruite en urgence sous <strong>2 heures ouvrées</strong> par deux réviseurs indépendants de l’enquêteur initial.</li>
            <li>Si l’erreur ou la nuance est avérée, la fiche est modifiée avec la mention explicite <em>« RECTIFICATIF DÉONTOLOGIQUE APPORTÉ LE [DATE] »</em>.</li>
            <li><strong>Règle d’or :</strong> Aucun article n’est supprimé en silence. La traçabilité de la correction reste consultable dans le journal d'audit pour garantir la transparence républicaine.</li>
          </ol>
        </div>
      ),
      answerEn: (
        <div className="space-y-3">
          <p>
            Verif 237 guarantees a prompt and transparent correction mechanism:
          </p>
          <p>
            Any entity providing new documentary evidence receives a formal reassessment within 2 business hours. If an update is warranted, the fact-check is updated with a transparent correction note. Articles are never deleted silently; all revisions are archived permanently in the audit registry.
          </p>
        </div>
      )
    },
    {
      id: 'q-11',
      category: 'deontologie',
      categoryLabel: lang === 'EN' ? 'Data Privacy' : 'Confidentialité des données',
      icon: 'lock',
      question: 'Mes données et mon numéro sont-ils protégés lorsque je transmets une alerte ?',
      questionEn: 'Are my personal details and phone number protected when I submit an alert?',
      tags: ['RGPD', 'Loi 2010/012', 'Anonymat', 'Cybersécurité'],
      answer: (
        <div className="space-y-3">
          <p>
            <strong>Oui, sans réserve.</strong> La sécurité des lanceurs d'alerte et des citoyens veilleurs est au cœur de notre architecture :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
            <li>Conformité stricte à la loi camerounaise N° 2010/012 sur la cybersécurité et la protection de la vie privée.</li>
            <li>Votre numéro de téléphone ou adresse électronique n'est jamais rendu public ni partagé avec des tiers ou des régies publicitaires.</li>
            <li>Les métadonnées privées (géolocalisation GPS de vos photos personnelles) sont automatiquement purgées avant tout archivage public.</li>
            <li>Seul le contenu textuel de la rumeur et la référence publique sont intégrés au dossier d'instruction.</li>
          </ul>
        </div>
      ),
      answerEn: (
        <div className="space-y-3">
          <p>
            <strong>Yes, strictly protected.</strong> Under Cameroonian Cybercrime Law No. 2010/012, your identity and contact information remain confidential. Uploaded images have private GPS metadata automatically stripped before publication, and no personal data is ever commercialized or transferred to third parties.
          </p>
        </div>
      )
    },
    {
      id: 'q-12',
      category: 'method',
      categoryLabel: lang === 'EN' ? 'Security & WORM' : 'Scellement & Intégrité',
      icon: 'enhanced_encryption',
      question: 'Pourquoi un verdict est-il scellé avec une empreinte SHA-256 ?',
      questionEn: 'Why is every verdict sealed with a SHA-256 cryptographic hash?',
      tags: ['SHA-256', 'WORM', 'Inaltérabilité', 'Anti-censure'],
      answer: (
        <div className="space-y-3">
          <p>
            Pour prévenir toute censure, manipulation rétroactive ou pression extérieure :
          </p>
          <p>
            Dès qu'un verdict est validé par la double signature collégiale, un hachage cryptographique <strong>SHA-256</strong> (ex : <code>9f86d081884c7d659a2feaa0c55ad015a3bf4f1b...</code>) est calculé sur l'ensemble des éléments du dossier (titre, sources, date, conclusions, pièces justificatives).
          </p>
          <p>
            Ce condensé est consigné dans notre registre d'audit immuable de type WORM (<em>Write Once, Read Many</em>). Toute tentative de modification ultérieure briserait la chaîne d'intégrité et déclencherait immédiatement une alerte publique d'altération.
          </p>
        </div>
      ),
      answerEn: (
        <div className="space-y-3">
          <p>
            To prevent censorship or retroactive tampering, every validated debunk is sealed with a <strong>SHA-256 hash</strong> chained into an immutable WORM audit log. Any attempt to modify text or evidence post-publication invalidates the cryptographic proof and triggers an automatic alert.
          </p>
        </div>
      )
    }
  ];

  // Filtered FAQ items based on category and search query
  const filteredFaqs = useMemo(() => {
    return faqList.filter(item => {
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const inQuestion = item.question.toLowerCase().includes(query) || item.questionEn.toLowerCase().includes(query);
      const inTags = item.tags.some(t => t.toLowerCase().includes(query));
      const inCategory = item.categoryLabel.toLowerCase().includes(query);

      return inQuestion || inTags || inCategory;
    });
  }, [activeCategory, searchQuery, lang]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c1420] text-slate-800 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* BREADCRUMB & HEADER */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <button
              onClick={() => setCurrentPage('accueil')}
              className="hover:text-[#007953] dark:hover:text-emerald-400 cursor-pointer font-medium"
            >
              {t('nav.home')}
            </button>
            <span aria-hidden="true">/</span>
            <span className="text-[#007953] dark:text-emerald-400 font-bold">
              {lang === 'EN' ? 'Frequently Asked Questions' : 'Questions Fréquentes (FAQ)'}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <span className="w-2.5 h-2.5 rounded-full bg-[#007953]" />
                <span>OBSERVATOIRE CITOYEN • CENTRE D'AIDE & DÉONTOLOGIE</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-headline">
                {lang === 'EN' ? 'Frequently Asked Questions' : 'Questions Fréquentes sur Vérif 237'}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                {lang === 'EN'
                  ? 'Find answers on how the fact-checking protocol works, how to submit rumors, official accreditation, and our republican neutrality principles.'
                  : 'Comprenez le fonctionnement de la plateforme, notre protocole de recoupement en 4 étapes, l’authentification des concours officiels et la protection des lanceurs d’alerte.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
              >
                {lang === 'EN' ? 'Expand all' : 'Tout déplier'}
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
              >
                {lang === 'EN' ? 'Collapse all' : 'Tout replier'}
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH BAR & CATEGORIES */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'EN' ? 'Search a topic (e.g., WhatsApp, exam fee, SHA-256, admin access...)' : 'Rechercher une question (ex : WhatsApp, concours, frais, SHA-256, admin, délai...)'}
              className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007953] transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Effacer la recherche"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          {/* Category Tabs (Segmented Buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#007953] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Filter summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              {filteredFaqs.length}{' '}
              {filteredFaqs.length > 1
                ? (lang === 'EN' ? 'questions found' : 'questions trouvées')
                : (lang === 'EN' ? 'question found' : 'question trouvée')}
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#007953] dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                {lang === 'EN' ? 'Clear search' : 'Réinitialiser la recherche'}
              </button>
            )}
          </div>
        </div>

        {/* ACCORDION LIST */}
        <div className="space-y-3.5">
          {filteredFaqs.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-slate-400">help_center</span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {lang === 'EN' ? 'No questions match your search' : 'Aucune question ne correspond à votre recherche'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {lang === 'EN'
                  ? 'Try other keywords or contact our team directly to submit your inquiry.'
                  : 'Essayez avec un autre terme ou posez directement votre question à la cellule civique.'}
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="px-4 py-2 rounded-xl bg-[#007953] text-white text-xs font-bold hover:bg-[#006344] cursor-pointer"
              >
                {lang === 'EN' ? 'Reset filters' : 'Afficher toutes les questions'}
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = !!openIds[faq.id];
              const questionText = lang === 'EN' ? faq.questionEn : faq.question;
              const answerNode = lang === 'EN' ? faq.answerEn : faq.answer;
              const feedback = feedbackGiven[faq.id];

              return (
                <div
                  key={faq.id}
                  id={`faq-${faq.id}`}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl transition-all overflow-hidden ${
                    isOpen
                      ? 'border-[#007953]/50 dark:border-emerald-500/40 shadow-sm ring-1 ring-[#007953]/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Header / Question Accordion Trigger */}
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isOpen
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-[#007953] dark:text-emerald-400 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                      }`}>
                        <span className="material-symbols-outlined text-base">{faq.icon}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <span>{faq.categoryLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span>{faq.tags.slice(0, 2).join(' · ')}</span>
                        </div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#007953] dark:group-hover:text-emerald-400 transition-colors">
                          {questionText}
                        </h2>
                      </div>
                    </div>

                    <div className="shrink-0 p-1 rounded-lg text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                      <span className={`material-symbols-outlined text-xl transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#007953] dark:text-emerald-400' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </button>

                  {/* Body Content */}
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 animate-fade-in">
                      
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {answerNode}
                      </div>

                      {/* Tags & Action Link */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <span className="font-semibold">{lang === 'EN' ? 'Topics:' : 'Mots-clés :'}</span>
                          <span>{faq.tags.join(' · ')}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {faq.action && (
                            <button
                              onClick={() => setCurrentPage(faq.action!.targetPage)}
                              className="inline-flex items-center gap-1 text-[#007953] dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                            >
                              <span>{faq.action.label}</span>
                              <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleCopyLink(faq.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                            title="Copier le lien direct vers cette question"
                          >
                            <span className="material-symbols-outlined text-xs">
                              {copiedId === faq.id ? 'check' : 'link'}
                            </span>
                            <span>{copiedId === faq.id ? (lang === 'EN' ? 'Copied' : 'Lien copié') : (lang === 'EN' ? 'Share' : 'Partager')}</span>
                          </button>
                        </div>
                      </div>

                      {/* Helpful Feedback */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-[11px] text-slate-500">
                        <span>{lang === 'EN' ? 'Was this answer helpful?' : 'Cette réponse vous a-t-elle été utile ?'}</span>

                        {feedback ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            <span>{lang === 'EN' ? 'Thank you for your feedback!' : 'Merci pour votre retour citoyen !'}</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleFeedback(faq.id, 'yes')}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 font-semibold cursor-pointer"
                            >
                              👍 {lang === 'EN' ? 'Yes' : 'Oui'}
                            </button>
                            <button
                              onClick={() => handleFeedback(faq.id, 'no')}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-500 hover:text-red-600 font-semibold cursor-pointer"
                            >
                              👎 {lang === 'EN' ? 'No' : 'Non'}
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* BOTTOM HELP BANNER */}
        <div className="bg-[#f0fdf4] dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
              <span className="material-symbols-outlined text-base">support_agent</span>
              <span>{lang === 'EN' ? 'Civic Assistance Desk' : 'Cellule d’Assistance Civique & Presse'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-emerald-950 dark:text-emerald-100">
              {lang === 'EN' ? 'Have a question not listed here?' : 'Vous n’avez pas trouvé réponse à votre question ?'}
            </h3>
            <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 max-w-xl">
              {lang === 'EN'
                ? 'Submit a rumor for urgent investigation or propose a public decree to be added to the official authenticated index.'
                : 'Transmettez un message viral pour examen prioritaire ou proposez l’ajout d’un texte ministériel dans notre registre officiel.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentPage('verifier')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#007953] hover:bg-[#006344] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
              <span>{lang === 'EN' ? 'Submit an alert' : 'Vérifier une information'}</span>
            </button>
            <button
              onClick={() => {
                if (onOpenSuggestModal) {
                  onOpenSuggestModal();
                } else {
                  setCurrentPage('actes');
                }
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-xs font-bold text-emerald-900 dark:text-emerald-200 transition-colors cursor-pointer"
            >
              {lang === 'EN' ? 'Suggest a document' : 'Suggérer un document'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
