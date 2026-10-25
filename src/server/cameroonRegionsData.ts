export interface CameroonRegionInfo {
  id: string;
  name: string;
  capital: string;
  departments: string[];
  majorTowns: string[];
  latitude: number;
  longitude: number;
  description: string;
  institutionsLocated: string[];
}

export const CAMEROON_REGIONS: Record<string, CameroonRegionInfo> = {
  'Centre': {
    id: 'centre',
    name: 'Centre',
    capital: 'Yaoundé',
    departments: ['Mfoundi', 'Lekié', 'Mbam-et-Inoubou', 'Mbam-et-Kim', 'Méfou-et-Afamba', 'Méfou-et-Akono', 'Nyong-et-Kéllé', 'Nyong-et-Mfoumou', 'Nyong-et-So\'o', 'Haute-Sanaga'],
    majorTowns: ['Yaoundé', 'Mbalmayo', 'Bafia', 'Obala', 'Monatélé', 'Nanga-Eboko', 'Eseka'],
    latitude: 3.8480,
    longitude: 11.5021,
    description: 'Siège des institutions républicaines, ministères, ambassades et Journal Officiel.',
    institutionsLocated: ['DGSN', 'MINFOPRA', 'MINSANTE', 'MINFI', 'MINESUP', 'MINJUSTICE', 'ELECAM', 'OBC']
  },
  'Littoral': {
    id: 'littoral',
    name: 'Littoral',
    capital: 'Douala',
    departments: ['Wouri', 'Moungo', 'Sanaga-Maritime', 'Nkam'],
    majorTowns: ['Douala', 'Nkongsamba', 'Edéa', 'Yabassi', 'Manjo', 'Loum', 'Mbanga'],
    latitude: 4.0511,
    longitude: 9.7679,
    description: 'Capitale économique, port autonome, hub industriel et forte activité médiatique.',
    institutionsLocated: ['DGD (Douanes)', 'Port Autonome de Douala', 'Cellule Forensique Régionale']
  },
  'Extrême-Nord': {
    id: 'extreme-nord',
    name: 'Extrême-Nord',
    capital: 'Maroua',
    departments: ['Diamaré', 'Logone-et-Chari', 'Mayo-Danay', 'Mayo-Kani', 'Mayo-Sava', 'Mayo-Tsanaga'],
    majorTowns: ['Maroua', 'Kousséri', 'Mora', 'Yagoua', 'Kaélé', 'Mokolo'],
    latitude: 10.5956,
    longitude: 14.3247,
    description: 'Zone sahélienne, surveillance des frontières, vigilance contre les rumeurs sécuritaires.',
    institutionsLocated: ['Gouvernorat de Maroua', 'Université de Maroua', 'Délégation Régionale Santé']
  },
  'Nord': {
    id: 'nord',
    name: 'Nord',
    capital: 'Garoua',
    departments: ['Bénoué', 'Faro', 'Mayo-Louti', 'Mayo-Rey'],
    majorTowns: ['Garoua', 'Guider', 'Poli', 'Tcholliré', 'Figuil'],
    latitude: 9.3014,
    longitude: 13.3977,
    description: 'Bassin de la Bénoué, agropastoralisme, carrefour commercial septentrional.',
    institutionsLocated: ['Délégation Régionale MINADER', 'Université de Garoua']
  },
  'Adamaoua': {
    id: 'adamaoua',
    name: 'Adamaoua',
    capital: 'Ngaoundéré',
    departments: ['Vina', 'Djerem', 'Faro-et-Déo', 'Mayo-Banyo', 'Mbéré'],
    majorTowns: ['Ngaoundéré', 'Meiganga', 'Tibati', 'Banyo', 'Tignère'],
    latitude: 7.3276,
    longitude: 13.5847,
    description: 'Château d\'eau du Cameroun, élevage bovin, terminus ferroviaire Camrail.',
    institutionsLocated: ['Université de Ngaoundéré', 'Gare ferroviaire Camrail']
  },
  'Ouest': {
    id: 'ouest',
    name: 'Ouest',
    capital: 'Bafoussam',
    departments: ['Mifi', 'Bamboutos', 'Haut-Nkam', 'Hauts-Plateaux', 'Koung-Khi', 'Menoua', 'Ndé', 'Noun'],
    majorTowns: ['Bafoussam', 'Dschang', 'Foumban', 'Bafang', 'Mbouda', 'Bangangté'],
    latitude: 5.4777,
    longitude: 10.4176,
    description: 'Région des hauts plateaux, dynamisme entrepreneurial, culture maraîchère et chefferies traditionnelles.',
    institutionsLocated: ['Université de Dschang', 'Chambre de Commerce Régionale']
  },
  'Nord-Ouest': {
    id: 'nord-ouest',
    name: 'Nord-Ouest',
    capital: 'Bamenda',
    departments: ['Mezam', 'Boyo', 'Bui', 'Donga-Mantung', 'Menchum', 'Momo', 'Ngo-Ketunjia'],
    majorTowns: ['Bamenda', 'Kumbo', 'Fundong', 'Nkambe', 'Wum', 'Mbengwi', 'Ndop'],
    latitude: 5.9631,
    longitude: 10.1591,
    description: 'Sous-système éducatif anglophone, vigilance face à la désinformation sur les réseaux sociaux.',
    institutionsLocated: ['Université de Bamenda', 'Délégation Régionale MINESEC']
  },
  'Sud-Ouest': {
    id: 'sud-ouest',
    name: 'Sud-Ouest',
    capital: 'Buea',
    departments: ['Fako', 'Koupé-Manengouba', 'Lebialem', 'Manyu', 'Meme', 'Ndian'],
    majorTowns: ['Buea', 'Limbe', 'Kumba', 'Mamfe', 'Tiko', 'Idenau', 'Bangem'],
    latitude: 4.1534,
    longitude: 9.2423,
    description: 'Silicon Mountain, GCE Board, raffinerie Sonara, ouverture maritime.',
    institutionsLocated: ['GCE Board Buea', 'Université de Buea', 'SONARA']
  },
  'Sud': {
    id: 'sud',
    name: 'Sud',
    capital: 'Ebolowa',
    departments: ['Mvila', 'Dja-et-Lobo', 'Océan', 'Vallée-du-Ntem'],
    majorTowns: ['Ebolowa', 'Kribi', 'Sangmélima', 'Ambam', 'Zoétélé', 'Akom II'],
    latitude: 2.9167,
    longitude: 11.1500,
    description: 'Port en eau profonde de Kribi, réserve du Dja, corridor frontalier Gabon/Guinée Équatoriale.',
    institutionsLocated: ['Port Autonome de Kribi', 'Antenne Douanes Sud']
  },
  'Est': {
    id: 'est',
    name: 'Est',
    capital: 'Bertoua',
    departments: ['Lom-et-Djérem', 'Haut-Nyong', 'Kadey', 'Boumba-et-Ngoko'],
    majorTowns: ['Bertoua', 'Batouri', 'Abong-Mbang', 'Yokadouma', 'Garoua-Boulaï'],
    latitude: 4.5773,
    longitude: 13.6846,
    description: 'Plus vaste région, richesses forestières et minières, accueil humanitaire frontalier RCA.',
    institutionsLocated: ['Université de Bertoua', 'Délégation Régionale MINFOF']
  }
};

// Helper function to extract or propose region from text
export function detectCameroonRegion(text: string): {
  region: string;
  town?: string;
  confidence: 'HAUTE' | 'MOYENNE' | 'LOCALISATION_A_CONFIRMER';
  reason: string;
} {
  const lower = text.toLowerCase();

  for (const [regionName, info] of Object.entries(CAMEROON_REGIONS)) {
    // Check towns first
    for (const town of info.majorTowns) {
      if (lower.includes(town.toLowerCase())) {
        return {
          region: regionName,
          town,
          confidence: 'HAUTE',
          reason: `Ville « ${town} » explicitement identifiée dans le texte.`
        };
      }
    }
    // Check departments
    for (const dep of info.departments) {
      if (lower.includes(dep.toLowerCase())) {
        return {
          region: regionName,
          confidence: 'HAUTE',
          reason: `Département « ${dep} » mentionné.`
        };
      }
    }
    // Check region name
    if (lower.includes(regionName.toLowerCase())) {
      return {
        region: regionName,
        confidence: 'MOYENNE',
        reason: `Région « ${regionName} » mentionnée explicitement.`
      };
    }
  }

  return {
    region: 'National (Toutes régions)',
    confidence: 'LOCALISATION_A_CONFIRMER',
    reason: 'Aucune mention géographique formelle relevée dans le document.'
  };
}
