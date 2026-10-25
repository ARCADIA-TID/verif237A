import { db, InvestigationQueueItemDB, sha256 } from './db';
import { CAMEROON_OFFICIAL_INSTITUTIONS } from './ministriesData';

export interface PreAnalysisInput {
  text: string;
  url?: string;
  sourceType: string;
  region?: string;
  submittedBy?: string;
  idempotencyKey?: string;
}

export function runAutomaticPreAnalysis(input: PreAnalysisInput): InvestigationQueueItemDB {
  const cleanText = (input.text || '').trim();
  const now = new Date();
  const year = now.getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const code = `#VRF-${year}-${randomSuffix}`;
  const id = `inv-${Date.now()}-${randomSuffix}`;

  // 1. Extraction of claims
  const sentences = cleanText
    .split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);
  const extractedClaims = sentences.length > 0 ? sentences.slice(0, 3) : [cleanText.slice(0, 160)];

  // 2. Entity recognition (Cameroon context)
  const lowerText = cleanText.toLowerCase();
  const detectedMinistries: string[] = [];
  CAMEROON_OFFICIAL_INSTITUTIONS.forEach(inst => {
    if (lowerText.includes(inst.acronym.toLowerCase()) || lowerText.includes(inst.fullName.toLowerCase())) {
      detectedMinistries.push(`${inst.acronym} — ${inst.fullName}`);
    }
  });

  const CAMEROON_REGIONS = [
    'Centre', 'Yaoundé', 'Littoral', 'Douala', 'Nord-Ouest', 'Bamenda',
    'Sud-Ouest', 'Buea', 'Extrême-Nord', 'Maroua', 'Nord', 'Garoua',
    'Adamaoua', 'Ngaoundéré', 'Ouest', 'Bafoussam', 'Sud', 'Ebolowa', 'Est', 'Bertoua'
  ];
  const detectedLocations: string[] = [];
  CAMEROON_REGIONS.forEach(loc => {
    if (lowerText.includes(loc.toLowerCase()) && !detectedLocations.includes(loc)) {
      detectedLocations.push(loc);
    }
  });
  if (detectedLocations.length === 0 && input.region) {
    detectedLocations.push(input.region);
  }

  // Dates detection
  const dateRegex = /\b(\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|\d{1,2})|\d{4})\b/gi;
  const detectedDates: string[] = Array.from(new Set(cleanText.match(dateRegex) || []));

  // Individuals or titles
  const TITLES = ['ministre', 'délégué général', 'gouverneur', 'préfet', 'recteur', 'directeur', 'président'];
  const detectedIndividuals: string[] = [];
  TITLES.forEach(t => {
    if (lowerText.includes(t)) {
      detectedIndividuals.push(`Mention de la fonction : ${t}`);
    }
  });

  // 3. Duplicate check against database
  const snapshot = db.getSnapshot();
  const duplicatesFound: { id: string; code: string; title: string; similarity: string }[] = [];
  const words = new Set(lowerText.split(/\W+/).filter(w => w.length > 4));

  snapshot.investigations.forEach(inv => {
    const otherWords = new Set((inv.title || '').toLowerCase().split(/\W+/).filter(w => w.length > 4));
    let matchCount = 0;
    words.forEach(w => {
      if (otherWords.has(w)) matchCount++;
    });
    if (words.size > 0) {
      const simRatio = Math.round((matchCount / Math.min(words.size, otherWords.size || 1)) * 100);
      if (simRatio >= 35) {
        duplicatesFound.push({
          id: inv.id,
          code: inv.code,
          title: inv.title || 'Dossier sans titre',
          similarity: `${simRatio}%`
        });
      }
    }
  });

  // 4. URL analysis and safety
  let urlCheck = {
    url: input.url,
    isReachable: !!input.url,
    isSuspicious: false,
    flags: [] as string[]
  };

  if (input.url) {
    const u = input.url.toLowerCase();
    if (u.includes('orange') || u.includes('momo') || u.includes('bonus') || u.includes('gain') || u.includes('free') || u.includes('wa.me') || u.includes('t.me')) {
      urlCheck.isSuspicious = true;
      urlCheck.flags.push("Lien vers service de messagerie ou paiement instantané non officiel");
    }
    if (!u.includes('.gov.cm') && !u.includes('.cm') && (u.includes('concours') || u.includes('recrutement') || u.includes('bourse'))) {
      urlCheck.isSuspicious = true;
      urlCheck.flags.push("Nom de domaine n'appartenant pas au registre public camerounais (.gov.cm)");
    }
  }

  // 5. Urgency calculation
  let urgency: 'haute' | 'normale' | 'faible' = 'normale';
  let urgencyLabel = 'Priorité standard';

  if (
    lowerText.includes('argent') ||
    lowerText.includes('fcfa') ||
    lowerText.includes('momo') ||
    lowerText.includes('orange money') ||
    lowerText.includes('caution') ||
    lowerText.includes('mort') ||
    lowerText.includes('fraude') ||
    lowerText.includes('arnaque') ||
    urlCheck.isSuspicious
  ) {
    urgency = 'haute';
    urgencyLabel = '⚠️ URGENCE HAUTE • Risque de préjudice financier ou trouble';
  }

  // 6. Limits of automatic analysis
  const limitsOfAnalysis = [
    "Cette synthèse automatique est préliminaire et ne constitue pas un verdict officiel.",
    "Nécessite la confrontation contradictoire avec l'administration émettrice présumée.",
    "Scellement légal conditionné par la double signature collégiale d'enquêteurs assermentés."
  ];

  // 7. Structured neutral summary
  const topic = detectedMinistries.length > 0 ? detectedMinistries[0].split('—')[0].trim() : 'Société & Actualité';
  const neutralSummary = `Le signalement porte sur une allégation concernant ${topic}. L'affirmation principale rapporte que « ${extractedClaims[0] || cleanText.slice(0, 100)} ». ${
    detectedMinistries.length > 0 ? `L'organisme de référence identifié est ${detectedMinistries[0]}.` : 'Aucun organisme officiel formellement identifié.'
  } Les vérificateurs devront confronter ce document aux archives légales.`;

  const newInvestigation: InvestigationQueueItemDB = {
    id,
    code,
    idempotencyKey: input.idempotencyKey,
    title: extractedClaims[0] ? `« ${extractedClaims[0].slice(0, 120)} »` : `Signalement citoyen ${code}`,
    description: cleanText,
    sourceType: input.sourceType || 'WhatsApp citoyen',
    sourceUrl: input.url,
    urgency,
    urgencyLabel,
    timeAgo: 'À l’instant',
    submittedAt: now.toISOString(),
    submittedBy: input.submittedBy || 'Citoyen vérifié (Session sécurisée)',
    assignedTo: 'En attente d’attribution',
    status: 'pending_review',
    statusLabel: 'En attente d’attribution (Analyse préliminaire prête)',
    scope: detectedLocations.length > 0 ? detectedLocations.join(', ') : 'National',
    previewTag: input.url ? 'Lien Web / Post' : 'Texte WhatsApp',
    preAnalysis: {
      extractedClaims,
      neutralSummary,
      detectedEntities: {
        ministries: detectedMinistries,
        locations: detectedLocations,
        dates: detectedDates,
        individuals: detectedIndividuals
      },
      duplicatesFound,
      urlCheck,
      limitsOfAnalysis,
      analyzedAt: now.toISOString()
    },
    signatures: {
      isSealed: false
    },
    notes: [
      {
        id: `note-${Date.now()}`,
        author: 'Système Forensique Automatisé',
        content: `Dépouillement initial terminé : ${extractedClaims.length} affirmation(s) isolée(s), priorité fixée à « ${urgencyLabel} ».`,
        createdAt: now.toISOString()
      }
    ]
  };

  // Add to db
  snapshot.investigations.unshift(newInvestigation);
  db.appendAuditLog({
    type: 'ATTRIBUTION',
    title: `Nouvelle soumission enregistrée ${code}`,
    detail: `Analyse préliminaire automatique achevée pour le dossier ${code}. Statut : En attente d'instruction.`,
    user: input.submittedBy || 'Citoyen Connecté',
    actorId: 'system',
    resource: `Dossier ${code}`,
    result: 'SUCCESS',
    extraMeta: `Urgence : ${urgency}`
  });

  db.commit();
  return newInvestigation;
}
