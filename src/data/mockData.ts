import {
  OfficialAct,
  VerificationCase,
  AccreditedUser,
  AuditLogEntry,
  InvestigationQueueItem
} from '../types';
import Logo from "@/public/Logo.png"

export const LOGO_URL = Logo;

export const MOCK_OFFICIAL_ACTS: OfficialAct[] = [
  {
    id: 'act-1',
    title: "Conditions d'obtention et renouvellement de la Carte Nationale d'Identité (CNI) biométrique",
    organization: "DGSN • SÛRETÉ NATIONALE",
    category: 'DGSN',
    status: 'en-vigueur',
    statusLabel: 'En vigueur',
    certifiedDate: '10 Fév 2025',
    fee: '2 800 FCFA',
    feeNote: "Payable exclusivement contre quittance légale informatisée DGSN ou pré-enrôlement officiel. Tout frais annexe est illégal.",
    requirements: [
      "Copie certifiée conforme d'acte de naissance (moins de 3 mois)",
      "Ancienne CNI originale ou certificat de perte valide délivré par un commissariat",
      "Justificatif de profession (si mention demandée sur le titre)"
    ],
    reference: "Réf: DGSN/SG/2024-C",
    actionText: "Formulaire Officiel",
    region: "National (Toutes régions)",
    downloadName: "Circulaire_DGSN_CNI_2025.pdf"
  },
  {
    id: 'act-2',
    title: "Calendrier et modalités des examens officiels session 2025 (Baccalauréat, Probatoire, GCE A/O Level)",
    organization: "OBC & GCE BOARD",
    category: 'OBC',
    status: 'limite-proche',
    statusLabel: 'Dates limites proches',
    certifiedDate: '04 Fév 2025',
    fee: 'Clôture: 15 Mars 2025',
    feeNote: "Les listes définitives des candidats seront scellées le 28 mars 2025. Aucun dossier tardif n'est accepté dans les centres.",
    requirements: [
      "Épreuves écrites Probatoire : 02 Juin au 06 Juin 2025",
      "Épreuves écrites Baccalauréat : 09 Juin au 13 Juin 2025",
      "GCE General/Technical Sessions : 27 Mai au 14 Juin 2025"
    ],
    reference: "Circulaire N° 004/MINESEC/OBC",
    actionText: "Voir le Calendrier",
    region: "National (Toutes régions)",
    downloadName: "Calendrier_Examens_OBC_GCE_2025.pdf"
  },
  {
    id: 'act-3',
    title: "Bourses nationales de formation universitaire pour le cycle Master (Session 2025-2026)",
    organization: "MINESUP • ENSEIGNEMENT SUPÉRIEUR",
    category: 'MINESUP',
    status: 'en-vigueur',
    statusLabel: 'En vigueur',
    certifiedDate: '28 Janv 2025',
    fee: '0 FCFA (Dépôt direct)',
    feeNote: "Les dépôts s'effectuent sans intermédiaires via la Direction de l'Assistance et des Œuvres Universitaires (DAOU).",
    requirements: [
      "Moyenne minimale de Licence : 13.50/20 ou Grade B+",
      "Âge limite légal : 28 ans au 31 décembre 2025",
      "Relevés de notes originaux certifiés par l'université émettrice"
    ],
    reference: "Arrêté N° 25/0012/MINESUP",
    actionText: "Guide & Pièces",
    region: "National (Toutes régions)",
    downloadName: "Guide_Bourses_Master_MINESUP_2025.pdf"
  },
  {
    id: 'act-4',
    title: "Recrutement spécial des personnels de santé - Promotion 2024 (Médecins et Infirmiers)",
    organization: "MINSANTE • SANTÉ PUBLIQUE",
    category: 'MINSANTE',
    status: 'archive',
    statusLabel: 'Archivé / Clôturé',
    certifiedDate: 'Clôturé le 31 Déc 2024',
    fee: 'Opération close',
    feeNote: "Ce concours est définitivement clos. Les messages WhatsApp annonçant un 'rattrapage de candidatures' ou demandant des frais de dossier sont des tentatives d'escroquerie.",
    requirements: [
      "Listes des admis publiées au babillard officiel du MINSANTE",
      "Aucun dossier additionnel n'est habilité à être reçu",
      "Signalez toute tentative de démarchage monnayé"
    ],
    reference: "Réf: MINSANTE/DRH/2024/774",
    actionText: "Consulter l'archive",
    region: "National (Toutes régions)",
    downloadName: "Archive_Resultats_MINSANTE_2024.pdf",
    consultationArchive: true,
    alertWarning: "Avis de vigilance : Aucune prolongation en cours"
  },
  {
    id: 'act-5',
    title: "Procédure d'enrôlement et délivrance du Passeport Biométrique Camerounais sous 48h",
    organization: "DGSN • SÛRETÉ NATIONALE",
    category: 'DGSN',
    status: 'en-vigueur',
    statusLabel: 'En vigueur',
    certifiedDate: '15 Janv 2025',
    fee: '110 000 FCFA',
    feeNote: "Frais légaux fixés par décret présidentiel N° 2021/347. Paiement exclusivement en ligne sur passcam.cm ou centres d'enrôlement agréés.",
    requirements: [
      "Quittance de paiement générée sur passcam.cm",
      "Copie certifiée d'acte de naissance et originale de la CNI",
      "Justificatif de domicile ou attestation de résidence"
    ],
    reference: "Décret N° 2021/347/PR",
    actionText: "Portail Passcam",
    region: "National & Centres Pilotes",
    downloadName: "Decret_Passeport_Passcam_DGSN.pdf"
  },
  {
    id: 'act-6',
    title: "Ouverture des concours directs d'entrée à la Fonction Publique (Session 2025)",
    organization: "MINFOPRA • FONCTION PUBLIQUE",
    category: 'MINFOPRA',
    status: 'limite-proche',
    statusLabel: 'Dates limites proches',
    certifiedDate: '01 Fév 2025',
    fee: '15 000 FCFA (Quittance Trésor)',
    feeNote: "Aucun versement n'est accepté sur des numéros Mobile Money ou comptes personnels d'intermédiaires.",
    requirements: [
      "Inscription préalable sur concours.minfopra.gov.cm",
      "Reçu de versement délivré par le Trésor Public",
      "Certificat médical délivré par un médecin assermenté"
    ],
    reference: "Arrêté N° 00214/MINFOPRA/CAB",
    actionText: "Calendrier Officiel",
    region: "National (10 Régions)",
    downloadName: "Arrete_Concours_MINFOPRA_2025.pdf"
  }
];

export const MOCK_DETAILED_DOSSIER: VerificationCase = {
  id: 'dossier-7729',
  code: '#VRF-237-7729',
  title: "Non, le Ministère des Finances n'a pas ouvert de recrutement de 5 000 agents à la DGI avec versement par Mobile Money",
  claim: "Arrêté portant ouverture d'un test spécial de sélection de 5 000 agents d'assiette et de recouvrement à la Direction Générale des Impôts",
  verdict: 'FAUX',
  verdictLabel: "FAUX ET TENTATIVE D'ESCROQUERIE",
  ministry: 'DGI / MINFI',
  author: 'Emmanuel Mballa',
  authorRole: "Réviseur Sénior & Juriste d'État",
  dateAudit: '14 Février 2025',
  lastUpdate: '14h30 (Heure de Yaoundé)',
  primarySourcesCount: 5,
  sha256Hash: 'b89c42c2a93ff7e4d8120b41aa89c42f0a1c784e207917e489ab7e436814c99d',
  summaryCitizen: "Le prétendu arrêté ministériel qui circule activement sur WhatsApp et Facebook est un faux grossier. Aucun recrutement public au Cameroun ne conditionne l'étude d'un dossier à des transferts Orange Money ou MTN Mobile Money vers des numéros privés individuels.",
  viralityChannel: 'WhatsApp, Facebook, TikTok',
  viralityLevel: 'Très forte',
  evidenceImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHHN6X-S6UiXJi2rsXGzvfYkG6RzaUd4oNubfimEWNPsjsQlkeBMZs0CBQJnOaNLx_uZqtj_tYX4JkraiUxvtcGY2oZ010WruhUrKTqT82dZNkB_53qsuQ96m7__VEWDQEDrg4PYPCt_ceha-2X4dP-aLklHd_gi4g10fw2acptsQ5o4IePIGU_aohjW9ts38RLlzkW7iODqE3dOhjX5wxvM56zgwThoVqrt9Lb0NadhUj78kvhTxEAg',
  evidenceTitle: "Pièce à conviction : Document viral falsifié et points critiques relevés",
  evidenceBadge: "Document Frelaté",
  evidenceAnomalies: [
    {
      id: 1,
      title: "Fausse devise républicaine",
      description: "L'en-tête mentionne « Paix - Progrès - Travail » au lieu de la formule officielle constitutionnelle : « Paix - Travail - Patrie »."
    },
    {
      id: 2,
      title: "Numéros de téléphone mobile particuliers",
      description: "Les paiements sont exigés vers des comptes enregistrés sous des prête-noms (690 XX XX 12 et 674 XX XX 89) au lieu d'un compte de consignation du Trésor Public."
    },
    {
      id: 3,
      title: "Signature scannée d'un ancien responsable",
      description: "La griffe numérique attribuée au Ministre des Finances est le calque basse définition d'une signature issue d'un arrêté caduc de l'exercice budgétaire 2018."
    }
  ],
  proofs: [
    {
      id: 'proof-a',
      letter: 'A',
      title: 'Démenti formel n°00421/MINFI/CAB',
      description: "Le Ministre des Finances, Louis Paul Motaze, a formellement réagi par le communiqué radio-presse N°00421/MINFI/CAB daté du 13 février 2025. Le ministre précise qu’aucun recrutement spécial n’est ouvert à la Direction Générale des Impôts et appelle la jeunesse à la plus grande vigilance face aux réseaux cybercriminels récurrents qui sévissent lors des périodes d'attente d'affectation.",
      refLink: 'minfi.gov.cm/communique-dgi-00421-2025'
    },
    {
      id: 'proof-b',
      letter: 'B',
      title: 'Procédure réglementaire stricte de paiement public',
      description: "En République du Cameroun, la perception des droits de concours administratifs et de timbres fiscaux est strictement encadrée par le Code Général des Impôts et le Régime Financier de l'État : les paiements se font soit via quittances sécurisées délivrées aux guichets des recettes des impôts et du Trésor Public, soit via la plateforme gouvernementale cryptée officielle de télédéclaration fiscale (impots.cm), jamais sur des comptes SIM personnels détenus par des particuliers.",
      inviolableTag: 'Loi de Finances inviolable'
    },
    {
      id: 'proof-c',
      letter: 'C',
      title: 'Recyclage et anachronismes juridiques',
      description: "Le corps de texte de la fausse annonce reprend mot pour mot les visas d'un arrêté interministériel abrogé en 2018. Les escrocs ont simplement modifié le millésime, substitué le nombre de postes (gonflé à 5 000 pour susciter un afflux massif de candidatures) et inséré les coordonnées téléphoniques de leurs complices chargés de collecter les versements mobiles frauduleux."
    }
  ],
  truthComparison: {
    facts: [
      "Aucun concours direct n'est ouvert actuellement à la DGI pour l'exercice 2025.",
      "Les concours de la fonction publique financière sont systématiquement centralisés par le Ministère de la Fonction Publique et de la Réforme Administrative (MINFOPRA).",
      "Les avis officiels sont publiés dans le quotidien national bilingue Cameroon Tribune et sur les sites .cm vérifiés."
    ],
    falseClaims: [
      "L'existence d'un test spécial de recrutement de 5 000 agents d'assiette.",
      "L'obligation d'effectuer un dépôt de 15 000 FCFA sur des lignes d'opérateurs privés.",
      "L'adresse e-mail de réception de dossiers en @gmail.com figurant sur l'annonce."
    ],
    sourceLabel: "MINFOPRA & Direction Générale des Impôts",
    modusOperandi: "Tentative d'extorsion de fonds ciblée"
  },
  primarySources: [
    {
      title: "Démenti officiel N°00421/MINFI/CAB (Format PDF scanné)",
      subtitle: "Capturé le 13/02/2025 à 16:12:08 UTC • 842 Ko",
      hash: "4d28f0e5b721",
      icon: "description"
    },
    {
      title: "Portail officiel de la Direction Générale des Impôts",
      subtitle: "Section « Concours & Carrières » • Capture Wayback Archive",
      link: "https://www.impots.cm",
      icon: "language"
    },
    {
      title: "Cellule de Communication du Ministère des Finances",
      subtitle: "Immeuble ministériel N°1, Yaoundé • Contact presse certifié",
      phone: "+237 222 23 20 54",
      icon: "call"
    }
  ],
  antiScamTips: [
    "Jamais d'OM ou MoMo : Aucun service de l'État n'encaisse d'argent sur le compte privé d'un individu.",
    "Pas de Gmail / Yahoo : Les administrations communiquent uniquement via leurs domaines institutionnels (ex: @minfopra.gov.cm).",
    "L'épreuve de Cameroon Tribune : Si le texte n'a pas été publié dans le journal officiel du Cameroun, il n'a aucune valeur juridique."
  ],
  relatedVerifications: [
    {
      id: 'rel-1',
      title: "Faux concours de recrutement de 2 500 agents à la Direction Générale des Douanes camerounaises",
      verdict: 'FAUX',
      timeAgo: 'Il y a 6 jours',
      subtitle: "Arnaque aux faux dossiers physiques • Enquête clôturée"
    },
    {
      id: 'rel-2',
      title: "Prétendues bourses d'études gouvernementales « Cameroun Emergent » avec frais d'assurance préalables",
      verdict: 'FAUX',
      timeAgo: 'Il y a 2 semaines',
      subtitle: "MINESUP • Réseau d'escroquerie démantelé"
    },
    {
      id: 'rel-3',
      title: "Ouverture effective du concours d'entrée à l'ENAM (Session 2025/2026)",
      verdict: 'VRAI',
      timeAgo: 'Janvier 2025',
      subtitle: "Arrêté ministériel authentifié auprès du MINFOPRA"
    }
  ]
};

export const MOCK_RECENT_VERIFICATIONS = [
  {
    id: 'verif-1',
    refCode: '#2025-014F',
    title: "« Bourses d'études gratuites pour le Canada via un formulaire WhatsApp attribué au MINESUP »",
    verdict: 'FAUX' as const,
    verdictLabel: 'FAUX / DÉMENTI',
    category: 'MINESUP',
    date: '14 Janvier 2025',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBt2OrFXDftYc8zWAKqwnDatzMUo1jyd7cqi3M-yIaJxhLibI2MUFkWZJwyr1zEb52xZ_Pwv0vezaVJF3PVc-Ck4NqJgpPOxCwuYQF_E7bKaNSoVBazlHiLVYxH5TOlVxY0uAIyBYeB_CGgzKrmnzTJrDYJAUpLhVwKKodUAxz-SMmqJ4-wch0tq_CFOcoinn916czEeLGQQNilRLhsWmleWP_agkARR8eVHd3NDwP2oUq2oMwp86WCxQ',
    summary: "Le lien redirige vers un site de phishing collectant des données bancaires privées. Le Ministère de l'Enseignement Supérieur n'a émis aucun partenariat de ce type par messagerie tierce.",
    sources: [
      "Communiqué officiel MINESUP n°25/0012/CAB",
      "Analyse technique du nom de domaine frauduleux"
    ]
  },
  {
    id: 'verif-2',
    refCode: '#2025-009V',
    title: "« Lancement officiel de la campagne de vaccination contre le choléra dans la région du Littoral »",
    verdict: 'VRAI' as const,
    verdictLabel: 'CONFIRMÉ',
    category: 'Santé Publique',
    date: '12 Janvier 2025',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeF-xl5D0zN0IdFMRL9njFHOdweRFWBDY4ThO1Jjh4euZTZ4nPT71Ad-4RId_VbUZNLUGdkQP-teu5JK3w76ERKExCPhQq6_038WcZvVfTOIfkHno6zXnz-nC2BRVkt-0tK7rO7j9O7dXD0Vrshsc1zrauRWTN64A2iUUO-AP1676brux7kRLn1SFgPHPGAfhVa__BoAiw0qhhZLUKyLdu1kPAs8OP4iNZOPBNFt8Pbf-WTdqfhwytOw',
    summary: "L'opération est rigoureusement confirmée par les autorités sanitaires camerounaises avec l'appui logistique de l'OMS. Les centres de distribution communautaires sont désormais actifs.",
    sources: [
      "Arrêté MINSANTE D7/31/MINSANTE/SG/DPS",
      "Bulletin épidémiologique OMS Région Afrique"
    ]
  },
  {
    id: 'verif-3',
    refCode: '#2025-004T',
    title: "« Vidéo d'inondations spectaculaires attribuée au Boulevard du 20 Mai à Yaoundé »",
    verdict: 'TROMPEUR' as const,
    verdictLabel: 'TROMPEUR / SORTI DU CONTEXTE',
    category: 'Infrastructure',
    date: '09 Janvier 2025',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-gjom1fRpcYRp20XF5uMwqnnX4338fP7_zKPFgokIZO1xQ9EStb81NZMKn0CwJScIbke3lS-PKnq6nR35AB3NhPgmdVVDDmw40N1_h1d8Gj0sEQdtVQ3lODAv-nxlkM7GhiLfOqhMUj2l_UginbIKLp-XWrqMjdvCBUqw1RLTPU8chcmA6KQ9sXbvGLPK-NAghnozhU34pGhRop0F_184iDHZrSGXO7LhXNhacPZh2vigi_WjyO3zGA',
    summary: "La vidéo est authentique mais a été enregistrée à Kinshasa en novembre 2022. Elle a été republiée sans contexte temporel ni géographique pour alimenter la panique locale.",
    sources: [
      "Recherche d'images inversées (InVID / Yandex)",
      "Constat de terrain CUY (Communauté Urbaine Yaoundé)"
    ]
  }
];

export const MOCK_ACCREDITED_USERS: AccreditedUser[] = [
  {
    id: 'user-1',
    code: '#ADM-001',
    name: 'Dr. François Kamga',
    titleBadge: 'Super-Admin',
    role: 'Délégué Déontologique',
    roleType: 'super-admin',
    jurisdiction: 'Centre (Yaoundé)',
    keyHabilitation: 'Gestion globale & audit légal',
    keyHabilitationSub: 'Révocation clés RSA',
    securityStatus: 'En ligne (il y a 4m)',
    securityDetail: '2FA FIDO2 / YubiKey',
    isOnline: true,
    avatarInitials: 'FK',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrndTEp_20Sq33hxNopGO3aiW1LKL-Yox2XTqgw-FUpWdqdh2kmtHt1jyVo2CtwMlpXZ0_k1xdeCudIBb44qAP6s3Qh9bNGb4UglEd1OQMnIc6HtaehfwrgTlNTc8vim0NTtUZN5SX49-YtnQYHrvgkuuEcxrldj8wZmCCFFx89o5tXlqBf3xLHjFFa0PR0uNgpyTXA_6vP0v12Rb9TPtRZuT8ysuRwYO94l4nhICxLftwEpL-B2Rzrw',
    sha256Enabled: true
  },
  {
    id: 'user-2',
    code: '#REV-014',
    name: 'Emmanuel Mballa',
    titleBadge: "Juriste d'État",
    role: 'Réviseur Sénior',
    roleType: 'reviseur',
    jurisdiction: 'Centre (Yaoundé)',
    keyHabilitation: 'Scellement SHA-256',
    keyHabilitationSub: 'Contre-expertise légale',
    securityStatus: 'Actif (il y a 18m)',
    securityDetail: 'Dossier #VRF-7731 • 2FA OK',
    isOnline: true,
    avatarInitials: 'EM',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjhSY8a389bT3wqKUGoKhQLq5xkFngaxrcbWF-IUtflM8Tu6GJhKskzcaGMcYGfGbzD3C2cIlnsYzoly0wE7wBwcYqj34lv4V-zUQ411FEq_pr_2acfFmlbQe0wKSPS4S7y1jzmbX9BBOOvgZ6VXOm9xMdaGuS6f2jn-PVeYiT4sgzZxjl4WRaLbjm2MENFfvZS5N9xB2z4MO5DdYc3_mfRgxegYDp-9PaAtUyquidNkMBga16zyCbsw',
    sha256Enabled: true
  },
  {
    id: 'user-3',
    code: '#FOR-028',
    name: 'Chantal Nji',
    titleBadge: 'Forensique',
    role: 'Expert Forensique & OSINT',
    roleType: 'forensique',
    jurisdiction: 'Littoral (Douala Hub)',
    keyHabilitation: 'Métadonnées EXIF & InVID',
    keyHabilitationSub: 'Dépouillement technique',
    securityStatus: 'Actif (il y a 42m)',
    securityDetail: '2FA TOTP Validé',
    isOnline: true,
    avatarInitials: 'CN',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzOn1M0VzryOi7C3rsBVguSsOB_szw9ssvg9U4RXIFK7AnKHVENq_u9qRrxtoJ-UDSg8OrjGdgsEtml9BlaNwwRA9EzMSWPfnQfBDGYSYuTIyiolgfrG04kb_YGvFYdRO-_aIrx6FIymU0nhTyxb6E-hAS0T_kj2sd7g5jKSD_icmKnVZ5bc0sh8KTE7EnrEIzaaxjX4Zn9KQfqg-yrM1FidDPWDwdJ-NiLzV18cRN0lYu2XgVifVFuA',
    sha256Enabled: true
  },
  {
    id: 'user-4',
    code: '#ENQ-041',
    name: 'Moussa Bouba',
    titleBadge: 'Enquêteur Terrain',
    role: 'Correspondant Régional',
    roleType: 'terrain',
    jurisdiction: 'Extrême-Nord (Maroua / Diamaré)',
    keyHabilitation: 'Recueil preuves préfectures',
    keyHabilitationSub: 'Délégations & Hôpitaux',
    securityStatus: 'Actif (il y a 2h)',
    securityDetail: '2FA Authenticator OK',
    isOnline: false,
    avatarInitials: 'MB',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvp5Jj9-9HvdLZrbSCaRP05_P0jWFN2pYVi9v-p4UFSAU7VJYFk3rcd7oZsEB2IJFqbuXMxdzDsbfKpIE9MBCB3Z8xSf4Ww4eI3FCWynjPpnm-I7RsyebR-zDBpVfCjzEjfk1PQcu2PoudPoF3Loe4if2GJ0c-lM7gPVnqEFLvIxyn0cteCthxxOVj3f9vEh4fukJJos570Yxb5C_yal92zYZP7mANvgjtzsoC2E8Ibfk7bACXhLWleA',
    sha256Enabled: false
  },
  {
    id: 'user-5',
    code: '#MOD-053',
    name: 'Brenda Bih',
    titleBadge: 'Modération',
    role: 'Triage Flux Signalements',
    roleType: 'moderateur',
    jurisdiction: 'Nord-Ouest (Bamenda Hub)',
    keyHabilitation: 'Qualification WhatsApp / SMS',
    keyHabilitationSub: 'Détection doublons',
    securityStatus: 'Renouvellement 2FA requis',
    securityDetail: 'Dernier accès : Hier 17h10',
    isOnline: false,
    avatarInitials: 'BB',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnf4-a6Oeq2FrqmXl05l45VWeV6OeYnfiTrJhuenjGxts8yKjEdvOgrX4MNgNSN3wKF8GLAnMB1CfOqltJ7gktY4I5YZSivXsGcuenN3v5aIYATrYscC_smOU9hAhOFP1gRsK_LZhDp8pOV-v_D__kNvF9l_woemc6CnwVZLnF03KR4JJElAvcKcbc6ZtCAzjZNca_V4l3uv9TLPcatl9qyX_O96eoCuRId3T1iHKg_wWcZRMbpk895g',
    sha256Enabled: false,
    needs2FARenewal: true
  }
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    time: '14:38:12',
    type: 'AUTH',
    title: 'Connexion sécurisée 2FA',
    detail: 'Connexion réussie via 2FA par E. Mballa (#REV-014)',
    user: 'E. Mballa (#REV-014)',
    hashOrIp: '197.234.219.*** (Yaoundé)'
  },
  {
    id: 'log-2',
    time: '14:15:04',
    type: 'ATTRIBUTION',
    title: 'Attribution dossier',
    detail: 'Attribution du dossier #VRF-7734 à C. Nji (#FOR-028)',
    user: 'Dr. F. Kamga',
    extraMeta: 'Objet : Vidéo manipulée sur les concours ENAM'
  },
  {
    id: 'log-3',
    time: '13:52:40',
    type: 'SIGNATURE',
    title: 'Signature collégiale',
    detail: 'Validation collégiale Signature 1/2 sur dossier #VRF-7731 par C. Nji',
    user: 'C. Nji (#FOR-028)',
    hashOrIp: '7b84a920a...34e1'
  },
  {
    id: 'log-4',
    time: '11:20:18',
    type: 'PERMISSIONS',
    title: 'Élévation de droits déontologiques',
    detail: 'Élévation de droits pour A. Tagne (Relecture Niveau 2)',
    user: 'Dr. F. Kamga (#ADM-001)',
    extraMeta: 'Parrainage validé par Dr. F. Kamga'
  },
  {
    id: 'log-5',
    time: '09:05:00',
    type: 'SCELLEMENT',
    title: 'Scellement immuable WORM',
    detail: 'Sauvegarde automatique chiffrée de la base d\'audit légale',
    user: 'Système WORM Automatisé',
    hashOrIp: 'd41d8cd98f00b204e9800998ecf8427e'
  }
];

export const MOCK_INVESTIGATION_QUEUE: InvestigationQueueItem[] = [
  {
    id: 'q-1',
    code: '#VRF-7734',
    title: "« Prétendue dispense d'épreuve physique au concours de la Police pour les détenteurs de Master 2 »",
    description: "Un faux communiqué estampillé DGSN circule massivement sur Facebook et WhatsApp, invitant les postulants à verser une caution de dispense de 30 000 FCFA. Vérification initiée auprès de la cellule DGSN.",
    sourceType: "WhatsApp citoyen",
    urgency: 'haute',
    urgencyLabel: 'URGENCE HAUTE • Fraude Concours',
    timeAgo: 'Reçu il y a 22 min',
    assignedTo: 'C. Nji (Spécialiste DGSN & Sécurité)',
    status: 'en_instruction',
    statusLabel: "En cours d'instruction (Dépouillement technique)",
    scope: 'National (Yaoundé / Douala)',
    previewImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxq9SV5bIS0T2UXHzX0pK8qduPTvPM0BuUtQah4k3qSJoSB5_jqIjw9ZR18YcjGcFK8DpP0fzxPshzHdtxnpELhOGGUYgvU2xzb8QS52dvLIl1XAQ3r2eKLC6Aaoo-JtTxbOygtlZO0CQcWXgw8ENPYGhknvUedfAyVWfOAHtJGtOQCaO7kFgVoHZnMofB4aFyYlYntohr5ZS3i61qRyMIzbqY0PibSr3iuUGwO2d9xqmz6nKVUwmIUg',
    previewTag: 'JPG • Faux Cachet'
  },
  {
    id: 'q-2',
    code: '#VRF-7731',
    title: "« Arrêté ministériel fixant le nouveau prix du timbre fiscal à 2 500 FCFA dès le 1er mars »",
    description: "Confrontation réalisée avec la Loi de Finances 2025 et le DGI. Le document circulant est une version préliminaire rejetée lors des débats parlementaires. Texte d'explication juridique prêt.",
    sourceType: "Signalement Presse Web",
    urgency: 'normale',
    urgencyLabel: "Acte d'État à authentifier",
    timeAgo: 'Reçu il y a 1h 10min',
    assignedTo: 'E. Mballa (Vous)',
    status: 'contre_expertise',
    statusLabel: 'Relecture collégiale en cours (Signature 1/2 effectuée par C. Nji)',
    scope: 'National',
    previewImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMzPh-lQGGwYjT7pB5aBVVA3shWZwgrq84WBR4Fe3oYT9snHgJVd-YHBXZAZD0bEiUhchlpybFgAVpOh9sgvbhJQlsh2_F8OXZo7_etdayFsSjw-JjWZmyvYTHAWdGzzDN1f9V4JrZSuQ5BcAD8-etvd9fjN969DeCpdl5qp_ySx4Q-HSFg6dfDBbZaUMlHeWtBRfSB7b1UXeI7zdXgETEh6q1YzkUYkhD-zsrJejx6FzeZiQxLolHVw',
    previewTag: 'PDF • Arrêté MinFi'
  },
  {
    id: 'q-3',
    code: '#VRF-7728',
    title: "« Vidéo virale d'affrontements armés présentée comme survenue à Bamenda hier soir »",
    description: "Découpage en images-clés : la séquence originale a été tournée en 2021 dans un autre pays de la sous-région. Recherche géolocalisée par satellite en cours de finalisation pour certifier les repères visuels.",
    sourceType: "TikTok / X (Twitter)",
    urgency: 'haute',
    urgencyLabel: 'Désinformation visuelle / Hors contexte',
    timeAgo: 'Reçu il y a 3h',
    assignedTo: 'Cellule OSINT Yaoundé',
    status: 'en_instruction',
    statusLabel: 'Analyse forensique InVID & Geolocation OSINT',
    scope: 'Nord-Ouest & Réseaux Sociaux',
    previewImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkBtu3huaNyUNyZVUwJnYFoohGmv084JOKfZPVD0rdltdTYHSyg75k77cqO-2c5tPgxiytYiKW4DaaZwX3n4AQ_QblEUj_S7Psnz4AUIlx4ib3RFf8paDV--iq6_jhQiyW3kLmyWdWh8hGPPTVX8MZaqSJpU4TChouP-NP7mnY8Q70pGMVpOU6AkOeqlD4jwUYA98hSLs50QLnXN4D0k9K9BYa9Ms4x2-BQfBNRXJJT7kLJ2IgvKBgZQ',
    previewTag: 'MP4 • Forensique InVID'
  },
  {
    id: 'q-4',
    code: '#VRF-7725',
    title: "« Bourses d'excellence universitaire attribuées par tirage au sort sur une fausse page Minesup »",
    description: "Démenti formel recueilli auprès du Ministère de l'Enseignement Supérieur (MINESUP). Deux relectures terminées. Fiche rédigée en FR et EN selon le standard IFCN.",
    sourceType: "Page sponsorisée Facebook",
    urgency: 'normale',
    urgencyLabel: 'Verdict FAUX validé',
    timeAgo: 'Reçu il y a 5h',
    assignedTo: 'Cellule Vérification Académique',
    status: 'pret_scellement',
    statusLabel: 'Prêt pour publication immédiate & Scellement cryptographique',
    scope: 'National & Diaspora',
    previewImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABUcgGdouL952t-aHtaDtSQL1lBETGzs6dsaRdvVWu49vH-ejuKjWcE0jX7J9qTXFfKdZeXo03AEGYGE9K_Y4kZntIdV_AAmE6-jWS2V_motsKlGeFWpanXELap6b0N5N4SymjjCyGQE5ATO_WCAViefbrC45ejBxTx5ZKOrK_aFnsZ0dAfwOIYbdMuxrRSXIFCi_qsuMuXUgD1dgYWT0gerw_eSVvKouZL3prlj3fpDyDjdP1muw_NQ',
    previewTag: 'URL & Campagne Phishing',
    hash: '8f3b9a...44c1'
  }
];

export const DOSSIER_65F123ABC456: VerificationCase = {
  id: '65f123abc456',
  code: '#VRF-65F123ABC',
  title: "Non, les épreuves officielles du Baccalauréat et du GCE 2025 ne sont pas suspendues au Cameroun",
  claim: "Une fausse lettre circulaire portant le logo du MINESEC annonce un report sine die de la session d'examens 2025 pour motif budgétaire.",
  verdict: 'FAUX',
  verdictLabel: "FAUX ET DÉSINFORMATION VIRALE",
  ministry: 'MINESEC / OBC / GCE BOARD',
  author: 'Chantal Nji',
  authorRole: 'Experte Forensique & Détection Numérique',
  dateAudit: '16 Octobre 2025',
  lastUpdate: '11h15 (Heure de Yaoundé)',
  primarySourcesCount: 4,
  sha256Hash: 'e7a12cb598df0987c65342a1bc43de78921f008891dca4377bb4e5a91024bc65',
  summaryCitizen: "La circulaire partagée sur WhatsApp est un montage grossier. Les services conjoints de l'Office du Baccalauréat du Cameroun (OBC) et du Cameroon GCE Board confirment que les épreuves se dérouleront strictement selon le calendrier officiel promulgué en début d'année scolaire.",
  viralityChannel: 'WhatsApp, Groupes de parents d’élèves, Facebook',
  viralityLevel: 'Très forte',
  evidenceImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxq9SV5bIS0T2UXHzX0pK8qduPTvPM0BuUtQah4k3qSJoSB5_jqIjw9ZR18YcjGcFK8DpP0fzxPshzHdtxnpELhOGGUYgvU2xzb8QS52dvLIl1XAQ3r2eKLC6Aaoo-JtTxbOygtlZO0CQcWXgw8ENPYGhknvUedfAyVWfOAHtJGtOQCaO7kFgVoHZnMofB4aFyYlYntohr5ZS3i61qRyMIzbqY0PibSr3iuUGwO2d9xqmz6nKVUwmIUg',
  evidenceTitle: "Document manipulé : Fausse circulaire MINESEC / OBC",
  evidenceBadge: "Falsification Graphique",
  evidenceAnomalies: [
    {
      id: 1,
      title: "Typographie non institutionnelle",
      description: "Le texte utilise une police Arial étirée sans la mise en page normalisée des décrets du Ministère des Enseignements Secondaires."
    },
    {
      id: 2,
      title: "Numérotation chronologique incohérente",
      description: "Le numéro d'enregistrement mentionné correspond à un visa de 2021 sans rapport avec la direction des examens."
    },
    {
      id: 3,
      title: "Absence de cachet humide officiel",
      description: "Le cachet est une image PNG découpée avec des artefacts visuels manifestes au niveau des bords."
    }
  ],
  proofs: [
    {
      id: 'proof-1',
      letter: 'A',
      title: 'Confirmation officielle de l’Office du Baccalauréat du Cameroun',
      description: "La Direction Générale de l'OBC a publié un rappel formel réaffirmant que le calendrier officiel 2025 reste scellé et inchangé sur l’ensemble du territoire national.",
      refLink: 'obc.cm/calendrier-officiel-2025'
    },
    {
      id: 'proof-2',
      letter: 'B',
      title: 'Communiqué conjoint Cameroon GCE Board',
      description: "Le Registrar du GCE Board à Buea a démenti tout report des épreuves écrites et pratiques de la session 2025 pour les régions anglophones et les centres extérieurs.",
      inviolableTag: 'Calendrier National Intouchable'
    }
  ],
  truthComparison: {
    facts: [
      "Le calendrier officiel des examens OBC et GCE 2025 reste scrupuleusement maintenu.",
      "Les inscriptions et validations de listes d'élèves se poursuivent normalement dans les délégations régionales.",
      "Aucune contrainte budgétaire n'affecte l'organisation matérielle des centres d'examen."
    ],
    falseClaims: [
      "Le report sine die de la session des examens officiels 2025.",
      "L'existence d'une circulaire ministérielle suspensive du Ministre des Enseignements Secondaires."
    ],
    sourceLabel: 'MINESEC & OBC Cameroun',
    modusOperandi: "Déstabilisation psychologique des candidats et de leurs familles en période de préparation"
  },
  primarySources: [
    {
      title: "Direction des Examens et Concours (MINESEC)",
      subtitle: "Cellule de veille institutionnelle • Yaoundé",
      phone: "+237 222 23 10 59",
      icon: "call"
    },
    {
      title: "Office du Baccalauréat du Cameroun (OBC)",
      subtitle: "Portail officiel de publication des actes",
      link: "https://www.obc.cm",
      icon: "language"
    }
  ],
  antiScamTips: [
    "Toujours vérifier auprès de l’établissement scolaire de votre enfant avant de relayer une annonce d’examen.",
    "Ne partagez pas de documents scannés anonymes sans cachet officiel républicain vérifiable.",
    "Consultez les canaux certifiés de l'OBC et du GCE Board."
  ],
  relatedVerifications: [
    {
      id: 'dossier-7729',
      title: "Non, le Ministère des Finances n'a pas ouvert de recrutement de 5 000 agents à la DGI",
      verdict: 'FAUX',
      timeAgo: 'Il y a 3 jours',
      subtitle: "Escroquerie financière déjouée"
    },
    {
      id: 'verif-1',
      title: "Bourses d'études gratuites pour le Canada via WhatsApp",
      verdict: 'FAUX',
      timeAgo: 'Il y a 1 semaine',
      subtitle: "Phishing MINESUP"
    }
  ]
};

export const DOSSIER_VERIF_1: VerificationCase = {
  id: 'verif-1',
  code: '#2025-014F',
  title: "« Bourses d'études gratuites pour le Canada via un formulaire WhatsApp attribué au MINESUP »",
  claim: "Une campagne virale promet des bourses gouvernementales d'études au Canada en échange d'un formulaire rempli sur une adresse web externe.",
  verdict: 'FAUX',
  verdictLabel: 'FAUX / DÉMENTI',
  ministry: 'MINESUP',
  author: 'Moussa Bouba',
  authorRole: 'Enquêteur & Correspondant Régional',
  dateAudit: '14 Janvier 2025',
  lastUpdate: '18h00 (Heure de Yaoundé)',
  primarySourcesCount: 3,
  sha256Hash: '9a842b102ef765c91bce0459341aa08453ef0021cda452b45e901452dfbca120',
  summaryCitizen: "Le lien redirige vers un site de phishing collectant des données bancaires et des coordonnées privées. Le Ministère de l'Enseignement Supérieur n'a émis aucun partenariat de ce type via messagerie instantanée.",
  viralityChannel: 'WhatsApp, Telegram, Groupes d’étudiants',
  viralityLevel: 'Forte',
  evidenceImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBt2OrFXDftYc8zWAKqwnDatzMUo1jyd7cqi3M-yIaJxhLibI2MUFkWZJwyr1zEb52xZ_Pwv0vezaVJF3PVc-Ck4NqJgpPOxCwuYQF_E7bKaNSoVBazlHiLVYxH5TOlVxY0uAIyBYeB_CGgzKrmnzTJrDYJAUpLhVwKKodUAxz-SMmqJ4-wch0tq_CFOcoinn916czEeLGQQNilRLhsWmleWP_agkARR8eVHd3NDwP2oUq2oMwp86WCxQ',
  evidenceTitle: "Capture du faux formulaire de bourse d'études canadienne",
  evidenceBadge: "Phishing Agressif",
  truthComparison: {
    facts: [
      "Les bourses de coopération bilatérale sont exclusivement publiées sur minesup.gov.cm.",
      "Le dépôt des dossiers physiques ou numériques ne requiert aucun versement préalable par messagerie."
    ],
    falseClaims: [
      "Attribution immédiate par tirage au sort WhatsApp.",
      "Frais de traitement de 12 500 FCFA à transférer pour valider le passeport étudiant."
    ],
    sourceLabel: "Direction de l'Assistance Académique (MINESUP)",
    modusOperandi: "Vol de données personnelles et escroquerie aux faux frais consulaires"
  },
  primarySources: [
    {
      title: "Communiqué officiel MINESUP n°25/0012/CAB",
      subtitle: "Cabinet du Ministre d'État • Yaoundé",
      icon: "description"
    }
  ],
  antiScamTips: [
    "Une vraie bourse d'État n'exige jamais d'argent pour la délivrance d'une attestation préliminaire.",
    "Ne remplissez jamais un formulaire sur Google Forms ou Blogspot au nom d'un ministère camerounais."
  ],
  relatedVerifications: [
    {
      id: '65f123abc456',
      title: "Non, les épreuves officielles du Baccalauréat et GCE 2025 ne sont pas suspendues",
      verdict: 'FAUX',
      timeAgo: 'Hier',
      subtitle: "MINESEC / OBC"
    }
  ]
};

export const DOSSIER_VERIF_2: VerificationCase = {
  id: 'verif-2',
  code: '#2025-009V',
  title: "« Lancement officiel de la campagne de vaccination contre le choléra dans la région du Littoral »",
  claim: "Une campagne de sensibilisation et de vaccination porte-à-porte contre le choléra se déploie à Douala et dans les districts de santé voisins.",
  verdict: 'VRAI',
  verdictLabel: 'CONFIRMÉ / AUTHENTIQUE',
  ministry: 'MINSANTE',
  author: 'Dr. François Kamga',
  authorRole: 'Délégué Déontologique & Médecin Référent',
  dateAudit: '12 Janvier 2025',
  lastUpdate: '10h00',
  primarySourcesCount: 4,
  sha256Hash: '4f7b11c039ab6d81992e5410940fa21bc8209e8432b49842f1a0e908920bc91a',
  summaryCitizen: "L'opération est rigoureusement confirmée par les autorités sanitaires camerounaises avec l'appui logistique de l'OMS. Les équipes d'agents communautaires sont munies de badges officiels et le vaccin est 100% gratuit.",
  viralityChannel: 'Radios communautaires, Groupes WhatsApp, Affichage public',
  viralityLevel: 'Moyenne',
  evidenceImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeF-xl5D0zN0IdFMRL9njFHOdweRFWBDY4ThO1Jjh4euZTZ4nPT71Ad-4RId_VbUZNLUGdkQP-teu5JK3w76ERKExCPhQq6_038WcZvVfTOIfkHno6zXnz-nC2BRVkt-0tK7rO7j9O7dXD0Vrshsc1zrauRWTN64A2iUUO-AP1676brux7kRLn1SFgPHPGAfhVa__BoAiw0qhhZLUKyLdu1kPAs8OP4iNZOPBNFt8Pbf-WTdqfhwytOw',
  evidenceTitle: "Avis sanitaire officiel certifié : Délégation Régionale MINSANTE Littoral",
  evidenceBadge: "Acte Vérifié Conforme",
  truthComparison: {
    facts: [
      "La campagne de vaccination orale est effective et gratuite.",
      "Les agents de santé disposent d'un ordre de mission signé par le Délégué Régional de la Santé Publique du Littoral."
    ],
    falseClaims: [
      "Rumeurs prétendant qu'il s'agit d'une expérimentation clandestine ou payante."
    ],
    sourceLabel: 'MINSANTE Littoral & OMS',
    modusOperandi: "Information de santé publique avérée à relayer positivement"
  },
  primarySources: [
    {
      title: "Arrêté MINSANTE D7/31/MINSANTE/SG/DPS",
      subtitle: "Ministère de la Santé Publique",
      icon: "verified"
    }
  ],
  antiScamTips: [
    "Les vaccins de santé publique du MINSANTE sont toujours gratuits : signalez toute tentative de monnayage."
  ],
  relatedVerifications: []
};

export const DOSSIER_VERIF_3: VerificationCase = {
  id: 'verif-3',
  code: '#2025-004T',
  title: "« Vidéo d'inondations spectaculaires attribuée au Boulevard du 20 Mai à Yaoundé »",
  claim: "Une vidéo partagée massivement sur TikTok et WhatsApp affirme que le Boulevard du 20 Mai à Yaoundé est totalement sous les eaux suite aux pluies récentes.",
  verdict: 'TROMPEUR',
  verdictLabel: 'TROMPEUR / HORS CONTEXTE',
  ministry: 'Infrastructures & Urbanisme',
  author: 'Chantal Nji',
  authorRole: 'Experte Forensique & OSINT',
  dateAudit: '09 Janvier 2025',
  lastUpdate: '16h45',
  primarySourcesCount: 3,
  sha256Hash: '7c8901be332415abfa8912e75619a0bc41289fe5401923ab817652410a9cb481',
  summaryCitizen: "La vidéo est authentique mais a été filmée à Kinshasa en novembre 2022. Elle a été republiée sans contexte temporel ni géographique pour générer du buzz et semer la panique.",
  viralityChannel: 'TikTok, X (ex-Twitter), Facebook',
  viralityLevel: 'Très forte',
  evidenceImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-gjom1fRpcYRp20XF5uMwqnnX4338fP7_zKPFgokIZO1xQ9EStb81NZMKn0CwJScIbke3lS-PKnq6nR35AB3NhPgmdVVDDmw40N1_h1d8Gj0sEQdtVQ3lODAv-nxlkM7GhiLfOqhMUj2l_UginbIKLp-XWrqMjdvCBUqw1RLTPU8chcmA6KQ9sXbvGLPK-NAghnozhU34pGhRop0F_184iDHZrSGXO7LhXNhacPZh2vigi_WjyO3zGA',
  evidenceTitle: "Analyse d'images InVID / Google Lens : Origine Kinshasa 2022",
  evidenceBadge: "Recyclage d'Images",
  truthComparison: {
    facts: [
      "Aucune inondation majeure n'a submergé le Boulevard du 20 Mai à Yaoundé.",
      "Les plaques d'immatriculation et les enseignes commerciales visibles sur la vidéo originale indiquent la RDC."
    ],
    falseClaims: [
      "Prétendu effondrement des canaux d'évacuation de la Communauté Urbaine de Yaoundé (CUY)."
    ],
    sourceLabel: "Communauté Urbaine de Yaoundé (CUY)",
    modusOperandi: "Recyclage d'anciennes vidéos catastrophes pour capter de l'audience"
  },
  primarySources: [
    {
      title: "Rapport d'analyse forensique InVID / Yandex",
      subtitle: "Cellule OSINT Vérif 237",
      icon: "travel_explore"
    }
  ],
  antiScamTips: [
    "Prêtez attention aux détails de l'arrière-plan (plaques minéralogiques, enseignes, accent linguistique).",
    "Utilisez la recherche d'images inversées avant de partager une vidéo anxiogène."
  ],
  relatedVerifications: []
};

// Master database containing all dossiers indexed by their various aliases
export const ALL_VERIFICATION_DOSSIERS: VerificationCase[] = [
  MOCK_DETAILED_DOSSIER,
  DOSSIER_65F123ABC456,
  DOSSIER_VERIF_1,
  DOSSIER_VERIF_2,
  DOSSIER_VERIF_3
];

export const findVerificationById = (idOrCode: string): VerificationCase | undefined => {
  if (!idOrCode) return undefined;
  const clean = idOrCode.trim().toLowerCase().replace('#', '').replace('vrf-', '');
  return ALL_VERIFICATION_DOSSIERS.find((item) => {
    const itemId = item.id.toLowerCase();
    const itemCode = item.code.toLowerCase().replace('#', '').replace('vrf-', '');
    return (
      itemId === clean ||
      itemCode === clean ||
      itemId.includes(clean) ||
      clean.includes(itemId) ||
      (clean === '7729' && item.id.includes('7729')) ||
      (clean.includes('65f123') && item.id.includes('65f123'))
    );
  });
};

