export interface OfficialInstitution {
  id: string;
  acronym: string;
  fullName: string;
  category: 'Sécurité & Défense' | 'Éducation & Formation' | 'Économie & Finances' | 'Santé & Social' | 'Souveraineté & Justice' | 'Numérique & Médias' | 'Infrastructures & Territoire';
  officialWebsite: string;
  pressContact: string;
  pressEmail: string;
  verifiedDomain: boolean;
  status: 'OPERATIONNEL' | 'MAINTENANCE' | 'ATTENTION';
  lastConsulted: string;
  competence: string;
  latestBulletins: { title: string; date: string; url?: string; isConfirmedOfficial: boolean }[];
}

export const CAMEROON_OFFICIAL_INSTITUTIONS: OfficialInstitution[] = [
  {
    id: 'inst-1',
    acronym: 'DGSN',
    fullName: 'Délégation Générale à la Sûreté Nationale',
    category: 'Sécurité & Défense',
    officialWebsite: 'https://dgsn.cm',
    pressContact: '+237 222 21 28 84 / 117 (Numéro Vert)',
    pressEmail: 'cellulecom@dgsn.cm',
    verifiedDomain: true,
    status: 'OPERATIONNEL',
    lastConsulted: 'Aujourd’hui 11h20',
    competence: 'Délivrance CNI biométrique, passeports, sécurité publique et concours de police.',
    latestBulletins: [
      { title: "Mise en garde contre les faux avis de recrutement direct d'officiers", date: "12 Fév 2025", isConfirmedOfficial: true },
      { title: "Nouveau système de pré-enrôlement passeport en ligne (Rappel des tarifs légaux)", date: "02 Fév 2025", isConfirmedOfficial: true }
    ]
  },
  {
    id: 'inst-2',
    acronym: 'MINFOPRA',
    fullName: 'Ministère de la Fonction Publique et de la Réforme Administrative',
    category: 'Éducation & Formation',
    officialWebsite: 'https://minfopra.gov.cm',
    pressContact: '+237 222 22 14 36',
    pressEmail: 'contact@minfopra.gov.cm',
    verifiedDomain: true,
    status: 'OPERATIONNEL',
    lastConsulted: 'Aujourd’hui 10h45',
    competence: 'Gestion des carrières des fonctionnaires, ouverture des concours directs (ENAM, Douanes, Cadres).',
    latestBulletins: [
      { title: "Démenti formel sur la note de recrutement exceptionnel de 3 500 instituteurs", date: "14 Fév 2025", isConfirmedOfficial: true },
      { title: "Arrêté portant calendrier annuel des concours de la fonction publique 2025", date: "15 Janv 2025", isConfirmedOfficial: true }
    ]
  },
  {
    id: 'inst-3',
    acronym: 'MINSANTE',
    fullName: 'Ministère de la Santé Publique',
    category: 'Santé & Social',
    officialWebsite: 'https://minsante.cm',
    pressContact: '+237 222 22 29 01 / 1510 (Urgences Médicales)',
    pressEmail: 'communication@minsante.cm',
    verifiedDomain: true,
    status: 'OPERATIONNEL',
    lastConsulted: 'Hier 16h00',
    competence: 'Politique sanitaire nationale, alertes épidémiologiques, gratuité des soins ciblés.',
    latestBulletins: [
      { title: "Gratuité effective du traitement du paludisme simple chez les enfants de moins de 5 ans", date: "08 Fév 2025", isConfirmedOfficial: true },
      { title: "Alerte de vigilance sanitaire sur les faux médicaments de rue", date: "29 Janv 2025", isConfirmedOfficial: true }
    ]
  },
  {
    id: 'inst-4',
    acronym: 'MINESUP',
    fullName: 'Ministère de l’Enseignement Supérieur',
    category: 'Éducation & Formation',
    officialWebsite: 'https://minesup.gov.cm',
    pressContact: '+237 222 22 13 70',
    pressEmail: 'infos@minesup.gov.cm',
    verifiedDomain: true,
    status: 'OPERATIONNEL',
    lastConsulted: 'Aujourd’hui 09h15',
    competence: 'Universités d’État, IPES reconnus, homologation des diplômes et bourses de coopération.',
    latestBulletins: [
      { title: "Mise en garde contre les pages Facebook pirates promettant des bourses au Canada", date: "10 Fév 2025", isConfirmedOfficial: true },
      { title: "Liste officielle des Instituts Privés d'Enseignement Supérieur (IPES) accrédités 2025", date: "18 Janv 2025", isConfirmedOfficial: true }
    ]
  },
  {
    id: 'inst-5',
    acronym: 'MINFI / DGI',
    fullName: 'Ministère des Finances & Direction Générale des Impôts',
    category: 'Économie & Finances',
    officialWebsite: 'https://dgi.minfi.gov.cm',
    pressContact: '+237 222 23 20 86 / 8200 (Centre Fiscal)',
    pressEmail: 'dgi.communication@minfi.gov.cm',
    verifiedDomain: true,
    status: 'OPERATIONNEL',
    lastConsulted: 'Aujourd’hui 11h00',
    competence: 'Fiscalité, tarifs des timbres fiscaux, télédéclaration, régimes fiscaux PME.',
    latestBulletins: [
      { title: "Précision juridique sur le tarif du timbre fiscal en vigueur (Loi de Finances 2025)", date: "14 Fév 2025", isConfirmedOfficial: true },
      { title: "Guide de dématérialisation des attestations de non-redevance (ANR)", date: "05 Janv 2025", isConfirmedOfficial: true }
    ]
  },
  {
    id: 'inst-6',
    acronym: 'ANTIC',
    fullName: 'Agence Nationale des Technologies de l’Information et de la Communication',
    category: 'Numérique & Médias',
    officialWebsite: 'https://antic.cm',
    pressContact: '+237 222 20 66 11 / CSIRT Cameroun',
    pressEmail: 'contact@antic.cm',
    verifiedDomain: true,
    status: 'OPERATIONNEL',
    lastConsulted: 'Aujourd’hui 08h30',
    competence: 'Sécurité du cyberespace camerounais, veille phishing, certification électronique et protection des données.',
    latestBulletins: [
      { title: "Alerte Phishing : Vague de faux messages de récompense usurpent MTN MoMo & Orange Money", date: "11 Fév 2025", isConfirmedOfficial: true },
      { title: "Guide pratique de signalement des arnaques en ligne et usurpations d'identité", date: "24 Janv 2025", isConfirmedOfficial: true }
    ]
  },
  {
    id: 'inst-7',
    acronym: 'ELECAM',
    fullName: 'Elections Cameroon',
    category: 'Souveraineté & Justice',
    officialWebsite: 'https://elecam.cm',
    pressContact: '+237 222 21 00 24',
    pressEmail: 'contact@elecam.cm',
    verifiedDomain: true,
    status: 'OPERATIONNEL',
    lastConsulted: 'Hier 14h20',
    competence: 'Organisation des scrutins électoraux et référendaires, révision annuelle des listes électorales.',
    latestBulletins: [
      { title: "Modalités d'inscription biométrique sur les listes électorales (Clôture légale au 31 août)", date: "03 Janv 2025", isConfirmedOfficial: true }
    ]
  },
  {
    id: 'inst-8',
    acronym: 'MINPOSTEL',
    fullName: 'Ministère des Postes et Télécommunications',
    category: 'Numérique & Médias',
    officialWebsite: 'https://minpostel.gov.cm',
    pressContact: '+237 222 23 27 52',
    pressEmail: 'contact@minpostel.gov.cm',
    verifiedDomain: true,
    status: 'OPERATIONNEL',
    lastConsulted: 'Hier 11h10',
    competence: 'Régulation des communications électroniques, inclusion numérique, infrastructures de données souveraines.',
    latestBulletins: [
      { title: "Campagne nationale pour l'usage responsable des réseaux sociaux et la lutte contre les infox", date: "06 Fév 2025", isConfirmedOfficial: true }
    ]
  },
  {
    id: 'inst-9',
    acronym: 'MINJUSTICE',
    fullName: 'Ministère de la Justice, Garde des Sceaux',
    category: 'Souveraineté & Justice',
    officialWebsite: 'https://minjustice.gov.cm',
    pressContact: '+237 222 22 21 04',
    pressEmail: 'chancellerie@minjustice.gov.cm',
    verifiedDomain: true,
    status: 'OPERATIONNEL',
    lastConsulted: 'Il y a 2 jours',
    competence: 'Délivrance du casier judiciaire (bulletin n°3), code pénal et répression de la propagation de fausses nouvelles.',
    latestBulletins: [
      { title: "Rappel des peines de l'Article 240 du Code Pénal sur la propagation de fausses nouvelles", date: "18 Déc 2024", isConfirmedOfficial: true }
    ]
  },
  {
    id: 'inst-10',
    acronym: 'OBC',
    fullName: 'Office du Baccalauréat du Cameroun',
    category: 'Éducation & Formation',
    officialWebsite: 'https://obc.cm',
    pressContact: '+237 222 30 55 66',
    pressEmail: 'contact@obc.cm',
    verifiedDomain: true,
    status: 'OPERATIONNEL',
    lastConsulted: 'Aujourd’hui 07h50',
    competence: 'Organisation du Baccalauréat de l’enseignement secondaire général et technique francophone.',
    latestBulletins: [
      { title: "Calendrier officiel des épreuves du Baccalauréat Session 2025 confirmé (Épreuves du 09 au 13 Juin)", date: "04 Fév 2025", isConfirmedOfficial: true }
    ]
  },
  {
    id: 'inst-11',
    acronym: 'GCE Board',
    fullName: 'General Certificate of Education Board (Buea)',
    category: 'Éducation & Formation',
    officialWebsite: 'https://camgceboard.org',
    pressContact: '+237 233 32 23 88',
    pressEmail: 'info@camgceboard.org',
    verifiedDomain: true,
    status: 'OPERATIONNEL',
    lastConsulted: 'Hier 18h10',
    competence: 'Conduite des examens officiels du sous-système anglophone (GCE Ordinary & Advanced Levels).',
    latestBulletins: [
      { title: "Registration deadlines and official timetable for GCE 2025 examination sessions", date: "28 Janv 2025", isConfirmedOfficial: true }
    ]
  },
  {
    id: 'inst-12',
    acronym: 'MINAT',
    fullName: 'Ministère de l’Administration Territoriale',
    category: 'Souveraineté & Justice',
    officialWebsite: 'https://minat.gov.cm',
    pressContact: '+237 222 22 28 62',
    pressEmail: 'contact@minat.gov.cm',
    verifiedDomain: true,
    status: 'OPERATIONNEL',
    lastConsulted: 'Aujourd’hui 10h00',
    competence: 'Autorisations des ONG, sécurité territoriale, gouvernorats et préfectures des 10 régions.',
    latestBulletins: [
      { title: "Circulaire aux Gouverneurs de Région sur la vigilance face aux rumeurs perturbatrices", date: "22 Janv 2025", isConfirmedOfficial: true }
    ]
  },
  {
    id: 'inst-13',
    acronym: 'CONAC',
    fullName: 'Commission Nationale Anti-Corruption',
    category: 'Souveraineté & Justice',
    officialWebsite: 'https://conac.cm',
    pressContact: '+237 222 20 37 32 / 1517 (Numéro Vert Gratuit)',
    pressEmail: 'info@conac.cm',
    verifiedDomain: true,
    status: 'OPERATIONNEL',
    lastConsulted: 'Il y a 3 jours',
    competence: 'Enquêtes sur les malversations, extorsions dans les concours et faux frais administratifs.',
    latestBulletins: [
      { title: "Rapport sur les arnaques financières exigeant des transferts Mobile Money pour l'accès aux emplois publics", date: "15 Janv 2025", isConfirmedOfficial: true }
    ]
  },
  {
    id: 'inst-14',
    acronym: 'CNPS',
    fullName: 'Caisse Nationale de Prévoyance Sociale',
    category: 'Santé & Social',
    officialWebsite: 'https://cnps.cm',
    pressContact: '+237 222 23 40 11',
    pressEmail: 'contact@cnps.cm',
    verifiedDomain: true,
    status: 'OPERATIONNEL',
    lastConsulted: 'Aujourd’hui 09h30',
    competence: 'Pensions de retraite, allocations familiales, prise en charge des accidents du travail.',
    latestBulletins: [
      { title: "Alerte aux fausses promesses de déblocage anticipé des allocations familiales", date: "07 Fév 2025", isConfirmedOfficial: true }
    ]
  },
  {
    id: 'inst-15',
    acronym: 'MINCOMMERCE',
    fullName: 'Ministère du Commerce',
    category: 'Économie & Finances',
    officialWebsite: 'https://mincommerce.gov.cm',
    pressContact: '+237 222 22 24 18 / 1502 (Brigade des Prix)',
    pressEmail: 'contact@mincommerce.gov.cm',
    verifiedDomain: true,
    status: 'OPERATIONNEL',
    lastConsulted: 'Il y a 1 jour',
    competence: 'Plafonds de prix des denrées de première nécessité, homologation des tarifs de transport.',
    latestBulletins: [
      { title: "Grille tarifaire officielle du gaz domestique et du carburant à la pompe", date: "01 Fév 2025", isConfirmedOfficial: true }
    ]
  }
];
