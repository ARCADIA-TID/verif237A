export interface CitizenPortalArticle {
  id: string;
  category: 'education' | 'bourses' | 'demarches' | 'sante' | 'emploi' | 'agriculture' | 'transport' | 'justice';
  categoryLabel: string;
  title: string;
  summary: string;
  officialSource: string;
  sourceUrl: string;
  publishedDate: string;
  lastUpdated: string;
  region: string;
  status: 'CONFIRME_OFFICIEL' | 'EN_VIGUEUR' | 'ALERTE_ARNAQUE' | 'SUSPENDU';
  statusLabel: string;
  officialFee?: string;
  requirements?: string[];
  contactPhone?: string;
  actionText?: string;
}

export const CITIZEN_PORTAL_ARTICLES: CitizenPortalArticle[] = [
  // 1. Éducation et concours d'État
  {
    id: 'edu-1',
    category: 'education',
    categoryLabel: 'Éducation & Concours d\'État',
    title: 'Arrêté d\'ouverture des concours d\'entrée à l\'ENAM (Session 2025)',
    summary: 'Le Ministre de la Fonction Publique et de la Réforme Administrative (MINFOPRA) porte à la connaissance des candidats l\'ouverture des sections Magistrature, Greffe et Administration Générale.',
    officialSource: 'MINFOPRA • Arrêté N° 00412/MINFOPRA',
    sourceUrl: 'https://minfopra.gov.cm',
    publishedDate: '15 Janvier 2025',
    lastUpdated: '10 Février 2025',
    region: 'Centre',
    status: 'EN_VIGUEUR',
    statusLabel: 'Dossiers en cours',
    officialFee: '15 000 FCFA (Quittance Trésor Public exclusivement)',
    requirements: [
      'Diplôme de Licence en Droit ou équivalent pour la division administrative',
      'Certificat médical délivré par un médecin du secteur public',
      'Casier judiciaire (bulletin n° 3) datant de moins de 3 mois',
      'Copie certifiée conforme d\'acte de naissance'
    ],
    contactPhone: '+237 222 22 14 36',
    actionText: 'Consulter l\'Arrêté officiel'
  },
  {
    id: 'edu-2',
    category: 'education',
    categoryLabel: 'Éducation & Concours d\'État',
    title: 'Calendrier officiel et modalités des examens du Baccalauréat et GCE 2025',
    summary: 'L\'Office du Baccalauréat du Cameroun (OBC) et le GCE Board confirment les dates des sessions : épreuves écrites du Baccalauréat du 09 au 13 juin 2025.',
    officialSource: 'OBC & GCE BOARD • Circulaire conjointe',
    sourceUrl: 'https://obc.cm',
    publishedDate: '04 Février 2025',
    lastUpdated: '14 Février 2025',
    region: 'National (Toutes régions)',
    status: 'CONFIRME_OFFICIEL',
    statusLabel: 'Dates scellées',
    requirements: [
      'Clôture définitive du dépôt des listes nominatives le 15 mars 2025',
      'Aucun dossier tardif ou individuel n\'est admis dans les délégations'
    ],
    actionText: 'Voir le Calendrier officiel'
  },

  // 2. Bourses et formations
  {
    id: 'bourse-1',
    category: 'bourses',
    categoryLabel: 'Bourses & Formations',
    title: 'Bourses de coopération bilatérale Cameroun-Algérie (Session 2025-2026)',
    summary: 'Le MINESUP informe les étudiants titulaires du Baccalauréat scientifique de l\'attribution de 80 bourses d\'études universitaires en ingénierie et médecine.',
    officialSource: 'MINESUP • Direction de l\'Assistance Académique',
    sourceUrl: 'https://minesup.gov.cm',
    publishedDate: '28 Janvier 2025',
    lastUpdated: '12 Février 2025',
    region: 'National (Toutes régions)',
    status: 'CONFIRME_OFFICIEL',
    statusLabel: 'Dépôt gratuit ouvert',
    officialFee: '0 FCFA (Tout intermédiaire est passible de poursuites)',
    requirements: [
      'Avoir obtenu le Baccalauréat C, D ou F avec mention Assez Bien minimum',
      'Âge inférieur à 22 ans au 31 décembre 2024',
      'Formulaire de candidature officiel MINESUP timbré à 1 500 FCFA'
    ],
    actionText: 'Télécharger le Dossier MINESUP'
  },
  {
    id: 'bourse-2',
    category: 'bourses',
    categoryLabel: 'Bourses & Formations',
    title: 'Alerte fraude : Fausses offres de bourses pour le Canada sur les réseaux sociaux',
    summary: 'Mise en garde officielle du Ministère des Relations Extérieures (MINREX) contre des pages Facebook frauduleuses exigeant des frais de visa d\'étudiant.',
    officialSource: 'MINREX & Haut-Commissariat du Canada',
    sourceUrl: 'https://diplocam.cm',
    publishedDate: '02 Février 2025',
    lastUpdated: '11 Février 2025',
    region: 'National (Toutes régions)',
    status: 'ALERTE_ARNAQUE',
    statusLabel: 'Alerte Phishing Active',
    requirements: [
      'Ne jamais transférer d\'argent sur des numéros Mobile Money privés',
      'Les seules bourses officielles sont publiées sur www.minesup.gov.cm'
    ],
    actionText: 'Lire la mise en garde'
  },

  // 3. Démarches administratives
  {
    id: 'dem-1',
    category: 'demarches',
    categoryLabel: 'Démarches Administratives',
    title: 'Tarif officiel et pièces pour la Carte Nationale d\'Identité (CNI)',
    summary: 'Rappel des dispositions légales de la Délégation Générale à la Sûreté Nationale (DGSN) : le tarif légal de la CNI est de 2 800 FCFA.',
    officialSource: 'DGSN • Sûreté Nationale',
    sourceUrl: 'https://dgsn.cm',
    publishedDate: '10 Février 2025',
    lastUpdated: '14 Février 2025',
    region: 'National (Toutes régions)',
    status: 'EN_VIGUEUR',
    statusLabel: 'Tarif légal en vigueur',
    officialFee: '2 800 FCFA (Quittance informatique DGSN uniquement)',
    requirements: [
      'Copie certifiée conforme d\'acte de naissance de moins de 3 mois',
      'Ancienne CNI ou certificat de perte valide',
      'Justificatif de profession le cas échéant'
    ],
    contactPhone: '117 (Numéro Vert DGSN)',
    actionText: 'Guide d\'enrôlement officiel'
  },
  {
    id: 'dem-2',
    category: 'demarches',
    categoryLabel: 'Démarches Administratives',
    title: 'Pré-enrôlement en ligne pour le Passeport biométrique CEMAC',
    summary: 'Plateforme officielle de pré-enrôlement pour les citoyens camerounais de l\'intérieur et de la diaspora.',
    officialSource: 'DGSN • Cellule des Titres d\'Identité',
    sourceUrl: 'https://passcam.dgsn.cm',
    publishedDate: '01 Janvier 2025',
    lastUpdated: '05 Février 2025',
    region: 'National (Toutes régions)',
    status: 'EN_VIGUEUR',
    statusLabel: 'Portail opérationnel',
    officialFee: '110 000 FCFA (Paiement en ligne sécurisé DGSN)',
    requirements: [
      'CNI valide ou acte de naissance légalisé',
      'Prise de rendez-vous obligatoire pour enrôlement physique (48h de délai)'
    ],
    actionText: 'Accéder à PassCam DGSN'
  },

  // 4. Santé et épidémiologie
  {
    id: 'sante-1',
    category: 'sante',
    categoryLabel: 'Santé & Épidémiologie',
    title: 'Gratuité du traitement du paludisme simple pour les enfants de moins de 5 ans',
    summary: 'Le Ministère de la Santé Publique (MINSANTE) rappelle que les combinaisons thérapeutiques (CTA) et tests de diagnostic rapide (TDR) sont strictement gratuits dans les formations sanitaires publiques.',
    officialSource: 'MINSANTE • Programme National de Lutte contre le Paludisme',
    sourceUrl: 'https://minsante.cm',
    publishedDate: '18 Janvier 2025',
    lastUpdated: '08 Février 2025',
    region: 'National (Toutes régions)',
    status: 'EN_VIGUEUR',
    statusLabel: 'Protocole National',
    officialFee: '0 FCFA (Tout monnayage doit être signalé au 1510)',
    requirements: [
      'Enfants âgés de 0 à 59 mois révolus',
      'Consultation dans un centre de santé intégré (CSI) ou hôpital de district'
    ],
    contactPhone: '1510 (Numéro Vert Gratuit)',
    actionText: 'Consulter la directive ministérielle'
  },
  {
    id: 'sante-2',
    category: 'sante',
    categoryLabel: 'Santé & Épidémiologie',
    title: 'Alerte sanitaire : Surveillance épidémiologique du choléra dans les zones côtières',
    summary: 'Dispositif de veille renforcé dans les districts de santé de Douala et Kribi. Rappel des règles d\'hygiène alimentaire et d\'accès à l\'eau potable.',
    officialSource: 'MINSANTE • Direction de la Lutte contre les Épidémies',
    sourceUrl: 'https://minsante.cm',
    publishedDate: '25 Janvier 2025',
    lastUpdated: '02 Février 2025',
    region: 'Littoral',
    status: 'CONFIRME_OFFICIEL',
    statusLabel: 'Veille épidémique active',
    requirements: [
      'Signalement immédiat de tout cas de diarrhée aiguë aqueuse',
      'Chloration systématique de l\'eau de puits'
    ],
    actionText: 'Voir le protocole de prévention'
  },

  // 5. Emploi et entrepreneuriat
  {
    id: 'emp-1',
    category: 'emploi',
    categoryLabel: 'Emploi & Entrepreneuriat',
    title: 'Programme d\'appui aux jeunes entrepreneurs (Fonds National de l\'Emploi)',
    summary: 'Le FNE lance la session 2025 du programme PRESER : financements et micro-crédits à taux préférentiel pour les projets agropastoraux et technologiques.',
    officialSource: 'FNE • Ministère du Travail et de la Sécurité Sociale',
    sourceUrl: 'https://fnecm.org',
    publishedDate: '20 Janvier 2025',
    lastUpdated: '12 Février 2025',
    region: 'National (Toutes régions)',
    status: 'EN_VIGUEUR',
    statusLabel: 'Inscriptions ouvertes',
    requirements: [
      'Jeunes diplômés camerounais âgés de 18 à 35 ans',
      'Plan d\'affaires simplifié validé par un conseiller FNE'
    ],
    contactPhone: '+237 222 22 27 03',
    actionText: 'Postuler au programme FNE'
  },

  // 6. Agriculture
  {
    id: 'agri-1',
    category: 'agriculture',
    categoryLabel: 'Agriculture',
    title: 'Subventions aux producteurs de cacao et café (Guichet Producteurs FODECC)',
    summary: 'Le MINADER annonce la distribution des subventions électroniques pour l\'acquisition d\'engrais et de produits phytosanitaires pour la campagne 2025.',
    officialSource: 'MINADER & FODECC • Direction de l\'Agriculture',
    sourceUrl: 'https://minader.cm',
    publishedDate: '10 Janvier 2025',
    lastUpdated: '06 Février 2025',
    region: 'Centre',
    status: 'EN_VIGUEUR',
    statusLabel: 'Campagne active',
    requirements: [
      'Être enregistré au registre national des producteurs de cacao/café',
      'Posséder une parcelle identifiée avec géolocalisation'
    ],
    actionText: 'Accéder au Guichet FODECC'
  },

  // 7. Transport et tarifs publics
  {
    id: 'trans-1',
    category: 'transport',
    categoryLabel: 'Transport & Tarifs Publics',
    title: 'Grille tarifaire officielle des transports urbains par taxi (Arrêté MINCOMMERCE)',
    summary: 'Le tarif légal du ramassage de jour en taxi est fixé à 300 FCFA et le tarif de nuit à 350 FCFA. Tout dépassement unilatéral peut être dénoncé à la brigade de contrôle.',
    officialSource: 'Ministère du Commerce • Arrêté conjoint MINT/MINCOMMERCE',
    sourceUrl: 'https://mincommerce.gov.cm',
    publishedDate: '15 Février 2024',
    lastUpdated: '01 Janvier 2025',
    region: 'Centre',
    status: 'EN_VIGUEUR',
    statusLabel: 'Grille légale opposable',
    officialFee: '300 FCFA (Jour : 06h - 22h) • 350 FCFA (Nuit : 22h - 06h)',
    requirements: [
      'Applicable aux agglomérations de Yaoundé et Douala',
      'Affichage obligatoire du tarif à bord des véhicules'
    ],
    contactPhone: '1502 (Brigade des Prix MINCOMMERCE)',
    actionText: 'Consulter la grille complète'
  },

  // 8. Justice et droits citoyens
  {
    id: 'jus-1',
    category: 'justice',
    categoryLabel: 'Justice & Droits Citoyens',
    title: 'Procédure d\'obtention de l\'Assistance Juridictionnelle Gratuite',
    summary: 'Guide pratique du Ministère de la Justice : comment les citoyens aux revenus modestes peuvent bénéficier de la désignation d\'un avocat d\'office sans frais.',
    officialSource: 'MINJUSTICE • Garde des Sceaux',
    sourceUrl: 'https://minjustice.gov.cm',
    publishedDate: '05 Janvier 2025',
    lastUpdated: '10 Février 2025',
    region: 'National (Toutes régions)',
    status: 'CONFIRME_OFFICIEL',
    statusLabel: 'Dispositif permanent',
    officialFee: '0 FCFA (Service public républicain)',
    requirements: [
      'Demande écrite adressée au Président de la Commission d\'Assistance Juridictionnelle',
      'Certificat d\'imposition ou attestation de non-imposition délivré par le centre des impôts',
      'Certificat d\'indigence délivré par la mairie ou sous-préfecture'
    ],
    actionText: 'Télécharger le modèle de requête'
  }
];

// Real meteorological data structure for Cameroon localities
export interface CameroonWeatherForecast {
  town: string;
  region: string;
  temperatureC: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeedKmh: number;
  updatedAt: string;
  source: string;
  forecastNotice: string;
}

export const CAMEROON_WEATHER_DATA: CameroonWeatherForecast[] = [
  {
    town: 'Yaoundé',
    region: 'Centre',
    temperatureC: 28,
    condition: 'Éclaircies et brumes matinales',
    icon: 'partly_cloudy_day',
    humidity: 78,
    windSpeedKmh: 11,
    updatedAt: 'Aujourd\'hui 11h00 UTC+1',
    source: 'ONACC Cameroun & Service Climatologique National',
    forecastNotice: 'Risque d\'averses orageuses éparses en fin d\'après-midi sur les collines du Mfoundi.'
  },
  {
    town: 'Douala',
    region: 'Littoral',
    temperatureC: 31,
    condition: 'Chaud et humide, nuages maritimes',
    icon: 'sunny',
    humidity: 85,
    windSpeedKmh: 14,
    updatedAt: 'Aujourd\'hui 11h00 UTC+1',
    source: 'ONACC & Station Portuaire Douala',
    forecastNotice: 'Indice UV élevé (9/10). Température ressentie 36°C en zone portuaire.'
  },
  {
    town: 'Maroua',
    region: 'Extrême-Nord',
    temperatureC: 36,
    condition: 'Ensoleillé, brume sèche de poussière (Harmattan)',
    icon: 'wb_sunny',
    humidity: 24,
    windSpeedKmh: 20,
    updatedAt: 'Aujourd\'hui 10h45 UTC+1',
    source: 'ONACC • Délégation Régionale Extrême-Nord',
    forecastNotice: 'Vent de nord-est chargé de poussière sahélienne. Vigilance respiratoire recommandée.'
  },
  {
    town: 'Bamenda',
    region: 'Nord-Ouest',
    temperatureC: 23,
    condition: 'Ciel voilé et brise fraîche des plateaux',
    icon: 'cloud',
    humidity: 65,
    windSpeedKmh: 9,
    updatedAt: 'Aujourd\'hui 10h30 UTC+1',
    source: 'ONACC & Station Météo Mezam',
    forecastNotice: 'Climat tempéré d\'altitude, nuit fraîche avec températures descendant à 16°C.'
  },
  {
    town: 'Garoua',
    region: 'Nord',
    temperatureC: 35,
    condition: 'Chaleur sahélienne intense et ciel dégagé',
    icon: 'wb_sunny',
    humidity: 28,
    windSpeedKmh: 16,
    updatedAt: 'Aujourd\'hui 10h00 UTC+1',
    source: 'ONACC & Météo Vallée de la Bénoué',
    forecastNotice: 'Pointe de chaleur attendue à 38°C aux heures médianes.'
  },
  {
    town: 'Bafoussam',
    region: 'Ouest',
    temperatureC: 24,
    condition: 'Nuageux avec éclaircies douces',
    icon: 'partly_cloudy_day',
    humidity: 70,
    windSpeedKmh: 8,
    updatedAt: 'Aujourd\'hui 11h15 UTC+1',
    source: 'ONACC Hauts-Plateaux de l\'Ouest',
    forecastNotice: 'Conditions optimales pour les activités maraîchères.'
  }
];
