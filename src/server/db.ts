import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface AccreditedUserDB {
  id: string;
  code: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  roleType: 'super-admin' | 'reviseur' | 'forensique' | 'terrain' | 'moderateur' | 'citoyen';
  jurisdiction: string;
  keyHabilitation: string;
  keyHabilitationSub: string;
  securityStatus: string;
  securityDetail: string;
  isOnline: boolean;
  avatarInitials: string;
  avatarUrl: string;
  sha256Enabled: boolean;
  needs2FARenewal?: boolean;
  status: 'actif' | 'suspendu' | 'en_attente_2fa';
  validityUntil?: string;
  createdAt: string;
}

export interface UserSessionDB {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  isRevoked: boolean;
}

export interface RolePermissionDB {
  id: string;
  roleType: string;
  label: string;
  description: string;
  permissions: {
    lecture_publique: boolean;
    soumission_citoyenne: boolean;
    triage_signalements: boolean;
    instruction_forensique: boolean;
    confrontation_officielle: boolean;
    contre_expertise_juridique: boolean;
    signature_collegiale_1: boolean;
    scellement_sha256: boolean;
    gestion_utilisateurs: boolean;
    revocation_sessions: boolean;
    consultation_audit: boolean;
    configuration_systeme: boolean;
  };
  updatedAt: string;
  updatedBy: string;
}

export interface AuditLogEntryDB {
  id: string;
  index: number;
  time: string;
  timestamp: string;
  type: 'AUTH' | 'ATTRIBUTION' | 'SIGNATURE' | 'PERMISSIONS' | 'SCELLEMENT' | 'USER_CREATE' | 'SESSION_REVOKE' | 'SETTINGS_UPDATE' | 'INTEGRITY_CHECK' | 'API_KEY';
  title: string;
  detail: string;
  user: string;
  actorId: string;
  resource: string;
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  correlationId: string;
  hashOrIp?: string;
  extraMeta?: string;
  previousHash: string;
  hash: string;
}

export type AIVerificationStatus = 
  | 'en_attente'
  | 'analyse_en_cours'
  | 'verification_sources'
  | 'resultat_disponible'
  | 'verification_approfondie_requise'
  | 'echec_temporaire';

export type AICanonicalVerdict =
  | 'CONFIRMEE'
  | 'FAUSSE'
  | 'TROMPEUSE'
  | 'HORS_CONTEXTE'
  | 'NON_VERIFIABLE'
  | 'SUPPORTED'
  | 'FALSE'
  | 'MISLEADING'
  | 'OUT_OF_CONTEXT'
  | 'UNVERIFIABLE';

export interface AISourceItem {
  name: string;
  title?: string;
  url?: string;
  organizationOrAuthor?: string;
  date?: string;
  snippet?: string;
  excerpt?: string;
  isOfficial: boolean;
  reliability: 'officielle' | 'presse_reconnue' | 'reference_documentaire' | 'non_confirmee';
}

export interface VerificationTaskDB {
  id: string;
  investigationId: string;
  code: string;
  input: {
    id: string;
    code: string;
    text: string;
    url?: string;
    sourceType?: string;
    region?: string;
    authorOrSource?: string;
    contextDate?: string;
  };
  workflowStep: 'RECEIVED' | 'QUEUED' | 'ANALYZING' | 'SEARCHING_SOURCES' | 'EVALUATING_EVIDENCE' | 'COMPLETED' | 'REQUIRES_HUMAN_REVIEW' | 'ERROR' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  retryCount: number;
  output?: any;
}

export interface AIVerificationRecordDB {
  id: string;
  status: AIVerificationStatus;
  statusLabel: string;
  progressStep: 'COMPREHENSION_AFFIRMATION' | 'RECHERCHE_SOURCES' | 'COMPARAISON_PREUVES' | 'FINALISATION' | 'EN_ATTENTE' | 'RECEIVED' | 'QUEUED' | 'ANALYZING' | 'SEARCHING_SOURCES' | 'EVALUATING_EVIDENCE' | 'COMPLETED' | 'REQUIRES_HUMAN_REVIEW' | 'ERROR' | 'CANCELLED';
  workflowStep?: 'RECEIVED' | 'QUEUED' | 'ANALYZING' | 'SEARCHING_SOURCES' | 'EVALUATING_EVIDENCE' | 'COMPLETED' | 'REQUIRES_HUMAN_REVIEW' | 'ERROR' | 'CANCELLED';
  stepDescription: string;
  startedAt: string;
  completedAt?: string;
  elapsedSeconds: number;
  estimatedRemainingSeconds?: number;
  slaTargetSeconds: number; // 300s (5 minutes)
  isSlaBreached: boolean;

  analyzedClaim?: string;
  verdict?: AICanonicalVerdict;
  canonicalVerdict?: 'SUPPORTED' | 'FALSE' | 'MISLEADING' | 'OUT_OF_CONTEXT' | 'UNVERIFIABLE';
  verdictLabel?: string;
  summary?: string;
  reasoning_summary?: string;
  arguments?: string[];
  evidence?: any[];
  sources?: AISourceItem[];
  confidence?: 'ELEVE' | 'MOYEN' | 'FAIBLE' | any;
  confidenceScore?: number; // 0 to 100
  confidenceExplanation?: string;
  limits?: string[];
  humanReviewStatus: 'EN_ATTENTE_REVUE' | 'VALIDE_PAR_EXPERT' | 'EN_INSTRUCTION_TERRAIN' | 'NON_VALIDE_HUMAIN' | 'VALIDE_HUMAIN' | 'REVISE_HUMAIN';
  humanReviewerName?: string;
  rawError?: string;
  retryCount: number;
  modelProvider: string;
  modelName: string;
  stepHistory?: Array<{
    step: string;
    label: string;
    timestamp: string;
    status: 'completed' | 'in_progress' | 'failed' | 'pending';
    message?: string;
  }>;
  stepStatuses?: Record<string, 'pending' | 'in_progress' | 'completed' | 'failed' | 'not_applicable'>;
}

export interface InvestigationQueueItemDB {
  id: string;
  code: string;
  idempotencyKey?: string;
  title: string;
  description: string;
  sourceType: string;
  sourceUrl?: string;
  urgency: 'haute' | 'normale' | 'faible';
  urgencyLabel: string;
  timeAgo: string;
  submittedAt: string;
  submittedBy: string;
  assignedTo: string;
  assignedToId?: string;
  status: 'submitted' | 'pre_analysis' | 'pending_review' | 'en_instruction' | 'contre_expertise' | 'completed' | 'rejected';
  statusLabel: string;
  scope: string;
  previewImageUrl?: string;
  previewTag?: string;
  aiVerification?: AIVerificationRecordDB;
  preAnalysis?: {
    extractedClaims: string[];
    neutralSummary: string;
    detectedEntities: {
      ministries: string[];
      locations: string[];
      dates: string[];
      individuals: string[];
    };
    duplicatesFound: { id: string; code: string; title: string; similarity: string }[];
    urlCheck: { url?: string; isReachable: boolean; isSuspicious: boolean; flags: string[] };
    limitsOfAnalysis: string[];
    analyzedAt: string;
  };
  signatures: {
    signature1?: { userId: string; userName: string; signedAt: string; hash: string };
    signature2?: { userId: string; userName: string; signedAt: string; hash: string };
    isSealed: boolean;
    sealedHash?: string;
    sealedAt?: string;
  };
  notes: { id: string; author: string; content: string; createdAt: string }[];
  verdict?: 'VRAI' | 'FAUX' | 'TROMPEUR' | 'NON_VERIFIABLE';
  verdictLabel?: string;
}

export interface DoubleSignatureRequestDB {
  id: string;
  targetType: 'dossier' | 'system_parameter' | 'role_elevation' | 'purge_cache';
  targetId: string;
  targetTitle: string;
  requestedBy: string;
  requestedAt: string;
  status: 'en_attente_sig1' | 'en_attente_sig2' | 'approuve' | 'rejete';
  signature1?: { userId: string; userName: string; signedAt: string; signatureHash: string };
  signature2?: { userId: string; userName: string; signedAt: string; signatureHash: string };
  completedAt?: string;
}

export interface IntegrityAlertDB {
  id: string;
  level: 'CRITIQUE' | 'AVERTISSEMENT' | 'INFO';
  type: 'CHAINE_HASH' | 'INCOHERENCE_DONNEES' | 'ACCES_INTERDIT' | 'ALERTE_SESSION';
  title: string;
  description: string;
  detectedAt: string;
  status: 'OUVERTE' | 'RESOLUE';
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface SystemSettingsDB {
  sessionTimeoutMinutes: number;
  requireDoubleSignature: boolean;
  autoAnalysisStrictness: 'high' | 'standard' | 'light';
  maxLoginAttempts: number;
  rsaKeyStatus: string;
  lastBackupAt: string;
  activeHSMNode: string;
}

export interface ApiKeyDB {
  id: string;
  name: string;
  service: string;
  prefix: string;
  maskedKey: string;
  hashedSecret: string;
  createdAt: string;
  lastUsedAt: string;
  status: 'active' | 'revoked';
  permissions: string[];
}

export interface AssistantSourceDB {
  title: string;
  url?: string;
  organization?: string;
  date?: string;
  excerpt?: string;
  isOfficial?: boolean;
  reliability?: string;
}

export interface AssistantMessageDB {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: AssistantSourceDB[];
  groundingSearchQueries?: string[];
  isError?: boolean;
}

export interface AssistantConversationDB {
  id: string;
  title: string;
  userId?: string;
  userSessionId?: string;
  createdAt: string;
  updatedAt: string;
  messages: AssistantMessageDB[];
}

export interface DatabaseSchema {
  users: AccreditedUserDB[];
  sessions: UserSessionDB[];
  roles: RolePermissionDB[];
  auditLogs: AuditLogEntryDB[];
  investigations: InvestigationQueueItemDB[];
  doubleSignatures: DoubleSignatureRequestDB[];
  integrityAlerts: IntegrityAlertDB[];
  systemSettings: SystemSettingsDB;
  apiKeys: ApiKeyDB[];
  verificationTasks?: VerificationTaskDB[];
  assistantConversations?: AssistantConversationDB[];
}

const DB_FILE_PATH = path.resolve(process.cwd(), '.data', 'verif237_db.json');

// Helper to calculate SHA-256
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Initial seed data
function getInitialData(): DatabaseSchema {
  const users: AccreditedUserDB[] = [
    {
      id: 'user-1',
      code: '#ADM-001',
      name: 'Dr. François Kamga',
      email: 'f.kamga@verif237.cm',
      phone: '+237 699 12 34 56',
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
      sha256Enabled: true,
      status: 'actif',
      validityUntil: '2026-12-31',
      createdAt: '2024-01-15'
    },
    {
      id: 'user-2',
      code: '#REV-014',
      name: 'Emmanuel Mballa',
      email: 'e.mballa@verif237.cm',
      phone: '+237 677 88 99 00',
      role: 'Réviseur Sénior & Juriste',
      roleType: 'reviseur',
      jurisdiction: 'Centre (Yaoundé)',
      keyHabilitation: 'Scellement SHA-256',
      keyHabilitationSub: 'Contre-expertise légale',
      securityStatus: 'Actif (il y a 18m)',
      securityDetail: 'Dossier #VRF-7731 • 2FA OK',
      isOnline: true,
      avatarInitials: 'EM',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjhSY8a389bT3wqKUGoKhQLq5xkFngaxrcbWF-IUtflM8Tu6GJhKskzcaGMcYGfGbzD3C2cIlnsYzoly0wE7wBwcYqj34lv4V-zUQ411FEq_pr_2acfFmlbQe0wKSPS4S7y1jzmbX9BBOOvgZ6VXOm9xMdaGuS6f2jn-PVeYiT4sgzZxjl4WRaLbjm2MENFfvZS5N9xB2z4MO5DdYc3_mfRgxegYDp-9PaAtUyquidNkMBga16zyCbsw',
      sha256Enabled: true,
      status: 'actif',
      validityUntil: '2026-06-30',
      createdAt: '2024-02-01'
    },
    {
      id: 'user-3',
      code: '#FOR-028',
      name: 'Chantal Nji',
      email: 'c.nji@verif237.cm',
      phone: '+237 655 44 33 22',
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
      sha256Enabled: true,
      status: 'actif',
      validityUntil: '2026-09-15',
      createdAt: '2024-03-10'
    },
    {
      id: 'user-4',
      code: '#ENQ-041',
      name: 'Moussa Bouba',
      email: 'm.bouba@verif237.cm',
      phone: '+237 690 11 22 33',
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
      sha256Enabled: false,
      status: 'actif',
      validityUntil: '2025-12-31',
      createdAt: '2024-04-12'
    },
    {
      id: 'user-5',
      code: '#MOD-053',
      name: 'Brenda Bih',
      email: 'b.bih@verif237.cm',
      phone: '+237 671 22 33 44',
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
      needs2FARenewal: true,
      status: 'en_attente_2fa',
      validityUntil: '2025-11-30',
      createdAt: '2024-05-20'
    }
  ];

  const now = new Date();
  const sessions: UserSessionDB[] = [
    {
      id: 'sess-1',
      userId: 'user-1',
      userName: 'Dr. François Kamga',
      userRole: 'super-admin',
      ipAddress: '197.234.219.45 (Yaoundé)',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0',
      createdAt: new Date(now.getTime() - 25 * 60000).toISOString(),
      lastActivityAt: new Date(now.getTime() - 2 * 60000).toISOString(),
      expiresAt: new Date(now.getTime() + 35 * 60000).toISOString(),
      isRevoked: false
    },
    {
      id: 'sess-2',
      userId: 'user-2',
      userName: 'Emmanuel Mballa',
      userRole: 'reviseur',
      ipAddress: '129.0.210.12 (Yaoundé MINFI)',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/121.0',
      createdAt: new Date(now.getTime() - 40 * 60000).toISOString(),
      lastActivityAt: new Date(now.getTime() - 10 * 60000).toISOString(),
      expiresAt: new Date(now.getTime() + 20 * 60000).toISOString(),
      isRevoked: false
    },
    {
      id: 'sess-3',
      userId: 'user-3',
      userName: 'Chantal Nji',
      userRole: 'forensique',
      ipAddress: '41.202.207.88 (Douala Akwa)',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/123.0',
      createdAt: new Date(now.getTime() - 90 * 60000).toISOString(),
      lastActivityAt: new Date(now.getTime() - 15 * 60000).toISOString(),
      expiresAt: new Date(now.getTime() + 10 * 60000).toISOString(),
      isRevoked: false
    }
  ];

  const roles: RolePermissionDB[] = [
    {
      id: 'role-super-admin',
      roleType: 'super-admin',
      label: 'Super-Administrateur Républicain',
      description: 'Gouvernance globale, nomination des réviseurs, révocation des clés et audit légal.',
      permissions: {
        lecture_publique: true,
        soumission_citoyenne: true,
        triage_signalements: true,
        instruction_forensique: true,
        confrontation_officielle: true,
        contre_expertise_juridique: true,
        signature_collegiale_1: true,
        scellement_sha256: true,
        gestion_utilisateurs: true,
        revocation_sessions: true,
        consultation_audit: true,
        configuration_systeme: true
      },
      updatedAt: '2025-01-10T08:00:00Z',
      updatedBy: 'Dr. F. Kamga'
    },
    {
      id: 'role-reviseur',
      roleType: 'reviseur',
      label: 'Réviseur Sénior & Juriste',
      description: 'Contre-expertise juridique, vérification des textes de lois et contresignature d’accréditation.',
      permissions: {
        lecture_publique: true,
        soumission_citoyenne: true,
        triage_signalements: true,
        instruction_forensique: true,
        confrontation_officielle: true,
        contre_expertise_juridique: true,
        signature_collegiale_1: true,
        scellement_sha256: true,
        gestion_utilisateurs: false,
        revocation_sessions: false,
        consultation_audit: true,
        configuration_systeme: false
      },
      updatedAt: '2025-01-10T08:00:00Z',
      updatedBy: 'Dr. F. Kamga'
    },
    {
      id: 'role-forensique',
      roleType: 'forensique',
      label: 'Expert Forensique & OSINT',
      description: 'Analyse d’images, métadonnées EXIF, recherche inversée et signature technique 1.',
      permissions: {
        lecture_publique: true,
        soumission_citoyenne: true,
        triage_signalements: true,
        instruction_forensique: true,
        confrontation_officielle: true,
        contre_expertise_juridique: false,
        signature_collegiale_1: true,
        scellement_sha256: false,
        gestion_utilisateurs: false,
        revocation_sessions: false,
        consultation_audit: true,
        configuration_systeme: false
      },
      updatedAt: '2025-01-10T08:00:00Z',
      updatedBy: 'Dr. F. Kamga'
    },
    {
      id: 'role-terrain',
      roleType: 'terrain',
      label: 'Enquêteur Terrain Régional',
      description: 'Vérification physique auprès des préfectures, tribunaux et délégations régionales.',
      permissions: {
        lecture_publique: true,
        soumission_citoyenne: true,
        triage_signalements: true,
        instruction_forensique: true,
        confrontation_officielle: true,
        contre_expertise_juridique: false,
        signature_collegiale_1: false,
        scellement_sha256: false,
        gestion_utilisateurs: false,
        revocation_sessions: false,
        consultation_audit: false,
        configuration_systeme: false
      },
      updatedAt: '2025-01-10T08:00:00Z',
      updatedBy: 'Dr. F. Kamga'
    },
    {
      id: 'role-moderateur',
      roleType: 'moderateur',
      label: 'Modérateur Triage & Doublons',
      description: 'Filtrage initial des alertes WhatsApp, SMS et réseaux sociaux avant instruction.',
      permissions: {
        lecture_publique: true,
        soumission_citoyenne: true,
        triage_signalements: true,
        instruction_forensique: false,
        confrontation_officielle: false,
        contre_expertise_juridique: false,
        signature_collegiale_1: false,
        scellement_sha256: false,
        gestion_utilisateurs: false,
        revocation_sessions: false,
        consultation_audit: false,
        configuration_systeme: false
      },
      updatedAt: '2025-01-10T08:00:00Z',
      updatedBy: 'Dr. F. Kamga'
    }
  ];

  // Genesis audit log chain
  let genesisHash = sha256('GENESIS_BLOCK_VERIF237_CAMEROON_OBSERVATORY');
  const rawLogs = [
    {
      id: 'log-1',
      time: '14:38:12',
      type: 'AUTH' as const,
      title: 'Connexion sécurisée 2FA',
      detail: 'Connexion réussie via 2FA FIDO2 par E. Mballa (#REV-014)',
      user: 'E. Mballa (#REV-014)',
      actorId: 'user-2',
      resource: 'Session / Console Réviseur',
      result: 'SUCCESS' as const,
      hashOrIp: '197.234.219.*** (Yaoundé)'
    },
    {
      id: 'log-2',
      time: '14:15:04',
      type: 'ATTRIBUTION' as const,
      title: 'Attribution dossier',
      detail: 'Attribution du dossier #VRF-7734 à C. Nji (#FOR-028)',
      user: 'Dr. F. Kamga',
      actorId: 'user-1',
      resource: 'Dossier #VRF-7734',
      result: 'SUCCESS' as const,
      extraMeta: 'Objet : Faux communiqué concours Police DGSN'
    },
    {
      id: 'log-3',
      time: '13:52:40',
      type: 'SIGNATURE' as const,
      title: 'Signature collégiale',
      detail: 'Validation collégiale Signature 1/2 sur dossier #VRF-7731 par C. Nji',
      user: 'C. Nji (#FOR-028)',
      actorId: 'user-3',
      resource: 'Dossier #VRF-7731',
      result: 'SUCCESS' as const,
      hashOrIp: '7b84a920a...34e1'
    },
    {
      id: 'log-4',
      time: '11:20:18',
      type: 'PERMISSIONS' as const,
      title: 'Élévation de droits déontologiques',
      detail: 'Attribution droit scellement pour E. Mballa (Collège Réviseurs)',
      user: 'Dr. F. Kamga (#ADM-001)',
      actorId: 'user-1',
      resource: 'Habilitation #REV-014',
      result: 'SUCCESS' as const,
      extraMeta: 'Parrainage validé par Conseil d’Administration'
    },
    {
      id: 'log-5',
      time: '09:05:00',
      type: 'SCELLEMENT' as const,
      title: 'Scellement immuable WORM',
      detail: 'Sauvegarde automatique chiffrée de la base d\'audit légale',
      user: 'Système WORM Automatisé',
      actorId: 'system',
      resource: 'Nœud S3 Scellé Yaoundé',
      result: 'SUCCESS' as const,
      hashOrIp: 'd41d8cd98f00b204e9800998ecf8427e'
    }
  ];

  const auditLogs: AuditLogEntryDB[] = [];
  let prevHash = genesisHash;
  rawLogs.forEach((l, idx) => {
    const logIndex = idx + 1;
    const currentTimestamp = new Date(Date.now() - (rawLogs.length - idx) * 3600000).toISOString();
    const correlationId = `corr-${Math.floor(100000 + Math.random() * 900000)}`;
    const hashPayload = `${logIndex}:${currentTimestamp}:${l.user}:${l.type}:${l.resource}:${l.detail}:${l.result}:${prevHash}`;
    const entryHash = sha256(hashPayload);

    auditLogs.push({
      ...l,
      index: logIndex,
      timestamp: currentTimestamp,
      correlationId,
      previousHash: prevHash,
      hash: entryHash
    });
    prevHash = entryHash;
  });

  const investigations: InvestigationQueueItemDB[] = [
    {
      id: 'q-1',
      code: '#VRF-7734',
      title: "« Prétendue dispense d'épreuve physique au concours de la Police pour les détenteurs de Master 2 »",
      description: "Un faux communiqué estampillé DGSN circule massivement sur Facebook et WhatsApp, invitant les postulants à verser une caution de dispense de 30 000 FCFA. Vérification initiée auprès de la cellule DGSN.",
      sourceType: "WhatsApp citoyen",
      sourceUrl: "https://whatsapp.com/channel/fake-police-cm",
      urgency: 'haute',
      urgencyLabel: 'URGENCE HAUTE • Fraude Concours',
      timeAgo: 'Reçu il y a 22 min',
      submittedAt: new Date(Date.now() - 22 * 60000).toISOString(),
      submittedBy: 'Citoyen Yaoundé (Via WhatsApp)',
      assignedTo: 'C. Nji (Spécialiste DGSN & Sécurité)',
      assignedToId: 'user-3',
      status: 'en_instruction',
      statusLabel: "En cours d'instruction (Dépouillement technique)",
      scope: 'National (Yaoundé / Douala)',
      previewImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxq9SV5bIS0T2UXHzX0pK8qduPTvPM0BuUtQah4k3qSJoSB5_jqIjw9ZR18YcjGcFK8DpP0fzxPshzHdtxnpELhOGGUYgvU2xzb8QS52dvLIl1XAQ3r2eKLC6Aaoo-JtTxbOygtlZO0CQcWXgw8ENPYGhknvUedfAyVWfOAHtJGtOQCaO7kFgVoHZnMofB4aFyYlYntohr5ZS3i61qRyMIzbqY0PibSr3iuUGwO2d9xqmz6nKVUwmIUg',
      previewTag: 'JPG • Faux Cachet',
      preAnalysis: {
        extractedClaims: [
          "Dispense accordée aux candidats Master 2 pour le concours de la Police",
          "Obligation de paiement d'une caution de 30 000 FCFA sur compte mobile"
        ],
        neutralSummary: "Le document allègue une modification exceptionnelle des critères d'admissibilité au concours de la Sûreté Nationale (DGSN) assortie de frais administratifs.",
        detectedEntities: {
          ministries: ["DGSN (Délégation Générale à la Sûreté Nationale)"],
          locations: ["Yaoundé", "Cameroun"],
          dates: ["Session 2025"],
          individuals: ["Délégué Général"]
        },
        duplicatesFound: [],
        urlCheck: {
          url: "https://whatsapp.com/channel/fake-police-cm",
          isReachable: true,
          isSuspicious: true,
          flags: ["Canal non officiel", "Paiement Mobile Money réclamé"]
        },
        limitsOfAnalysis: [
          "Document non publié au Journal Officiel",
          "Signature scannée réutilisée depuis un arrêté de 2021"
        ],
        analyzedAt: new Date(Date.now() - 20 * 60000).toISOString()
      },
      signatures: {
        signature1: {
          userId: 'user-3',
          userName: 'Chantal Nji',
          signedAt: new Date(Date.now() - 5 * 60000).toISOString(),
          hash: sha256('#VRF-7734:SIG1:user-3')
        },
        isSealed: false
      },
      notes: [
        {
          id: 'note-1',
          author: 'C. Nji',
          content: 'Contact établi avec la cellule communication DGSN. Démenti formel confirmé, aucun arrêté de dispense émis.',
          createdAt: new Date(Date.now() - 10 * 60000).toISOString()
        }
      ]
    },
    {
      id: 'q-2',
      code: '#VRF-7731',
      title: "« Arrêté ministériel fixant le nouveau prix du timbre fiscal à 2 500 FCFA dès le 1er mars »",
      description: "Confrontation réalisée avec la Loi de Finances 2025 et le DGI. Le document circulant est une version préliminaire rejetée lors des débats parlementaires. Texte d'explication juridique prêt.",
      sourceType: "Signalement Presse Web",
      sourceUrl: "https://actu-cameroun-fake.net/timbre-2500",
      urgency: 'normale',
      urgencyLabel: "Acte d'État à authentifier",
      timeAgo: 'Reçu il y a 1h 10min',
      submittedAt: new Date(Date.now() - 70 * 60000).toISOString(),
      submittedBy: 'Observateur Économique Douala',
      assignedTo: 'E. Mballa (Vous)',
      assignedToId: 'user-2',
      status: 'contre_expertise',
      statusLabel: 'Relecture collégiale en cours (Signature 1/2 effectuée par C. Nji)',
      scope: 'National',
      previewImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMzPh-lQGGwYjT7pB5aBVVA3shWZwgrq84WBR4Fe3oYT9snHgJVd-YHBXZAZD0bEiUhchlpybFgAVpOh9sgvbhJQlsh2_F8OXZo7_etdayFsSjw-JjWZmyvYTHAWdGzzDN1f9V4JrZSuQ5BcAD8-etvd9fjN969DeCpdl5qp_ySx4Q-HSFg6dfDBbZaUMlHeWtBRfSB7b1UXeI7zdXgETEh6q1YzkUYkhD-zsrJejx6FzeZiQxLolHVw',
      previewTag: 'PDF • Arrêté MinFi',
      preAnalysis: {
        extractedClaims: [
          "Hausse du timbre fiscal à 2 500 FCFA à compter du 1er mars 2025",
          "Application immédiate sur tous les actes d'état civil"
        ],
        neutralSummary: "La publication affirme une révision à la hausse du tarif des timbres fiscaux par décision ministérielle unilatérale.",
        detectedEntities: {
          ministries: ["MINFI (Ministère des Finances)", "DGI (Direction Générale des Impôts)"],
          locations: ["Yaoundé"],
          dates: ["1er mars 2025"],
          individuals: ["Ministre des Finances"]
        },
        duplicatesFound: [
          {
            id: 'dossier-7729',
            code: '#VRF-7729',
            title: "Faux communiqué sur la taxe foncière et droits de timbre",
            similarity: "84%"
          }
        ],
        urlCheck: {
          url: "https://actu-cameroun-fake.net/timbre-2500",
          isReachable: true,
          isSuspicious: true,
          flags: ["Domaine d'imitation non institutionnel"]
        },
        limitsOfAnalysis: [
          "Projet de loi amendé en commission parlementaire",
          "Tarif officiel en vigueur maintenu selon la Loi de Finances promulguée"
        ],
        analyzedAt: new Date(Date.now() - 65 * 60000).toISOString()
      },
      signatures: {
        signature1: {
          userId: 'user-3',
          userName: 'Chantal Nji',
          signedAt: new Date(Date.now() - 40 * 60000).toISOString(),
          hash: sha256('#VRF-7731:SIG1:user-3')
        },
        isSealed: false
      },
      notes: [
        {
          id: 'note-2',
          author: 'E. Mballa',
          content: 'Confrontation effectuée avec le texte définitif de la Loi de Finances 2025. Le tarif légal reste inchangé.',
          createdAt: new Date(Date.now() - 30 * 60000).toISOString()
        }
      ]
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
      submittedAt: new Date(Date.now() - 180 * 60000).toISOString(),
      submittedBy: 'Veilleur Réseaux Sociaux',
      assignedTo: 'Cellule OSINT Yaoundé',
      assignedToId: 'user-3',
      status: 'en_instruction',
      statusLabel: 'Analyse forensique InVID & Geolocation OSINT',
      scope: 'Nord-Ouest & Réseaux Sociaux',
      previewImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkBtu3huaNyUNyZVUwJnYFoohGmv084JOKfZPVD0rdltdTYHSyg75k77cqO-2c5tPgxiytYiKW4DaaZwX3n4AQ_QblEUj_S7Psnz4AUIlx4ib3RFf8paDV--iq6_jhQiyW3kLmyWdWh8hGPPTVX8MZaqSJpU4TChouP-NP7mnY8Q70pGMVpOU6AkOeqlD4jwUYA98hSLs50QLnXN4D0k9K9BYa9Ms4x2-BQfBNRXJJT7kLJ2IgvKBgZQ',
      previewTag: 'MP4 • Forensique InVID',
      signatures: {
        isSealed: false
      },
      notes: []
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
      submittedAt: new Date(Date.now() - 300 * 60000).toISOString(),
      submittedBy: 'Étudiant Université de Douala',
      assignedTo: 'Cellule Vérification Académique',
      assignedToId: 'user-2',
      status: 'completed',
      statusLabel: 'Prêt pour publication immédiate & Scellement cryptographique',
      scope: 'National (Universités d’État)',
      previewImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABUcgGdouL952t-aHtaDtSQL1lBETGzs6dsaRdvVWu49vH-ejuKjWcE0jX7J9qTXFfKdZeXo03AEGYGE9K_Y4kZntIdV_AAmE6-jWS2V_motsKlGeFWpanXELap6b0N5N4SymjjCyGQE5ATO_WCAViefbrC45ejBxTx5ZKOrK_aFnsZ0dAfwOIYbdMuxrRSXIFCi_qsuMuXUgD1dgYWT0gerw_eSVvKouZL3prlj3fpDyDjdP1muw_NQ',
      previewTag: 'URL & Phishing',
      signatures: {
        signature1: {
          userId: 'user-3',
          userName: 'Chantal Nji',
          signedAt: new Date(Date.now() - 120 * 60000).toISOString(),
          hash: sha256('#VRF-7725:SIG1:user-3')
        },
        signature2: {
          userId: 'user-2',
          userName: 'Emmanuel Mballa',
          signedAt: new Date(Date.now() - 45 * 60000).toISOString(),
          hash: sha256('#VRF-7725:SIG2:user-2')
        },
        isSealed: true,
        sealedHash: '8f3b9a7c2901be332415abfa8912e75619a0bc41289fe5401923ab81765244c1',
        sealedAt: new Date(Date.now() - 40 * 60000).toISOString()
      },
      notes: [
        {
          id: 'note-3',
          author: 'E. Mballa',
          content: 'Fiche révisée et signée collégialement. Scellement WORM effectué.',
          createdAt: new Date(Date.now() - 42 * 60000).toISOString()
        }
      ],
      verdict: 'FAUX',
      verdictLabel: 'FAUX ET TENTATIVE D’ESCROQUERIE'
    }
  ];

  const doubleSignatures: DoubleSignatureRequestDB[] = [
    {
      id: 'ds-1',
      targetType: 'dossier',
      targetId: 'q-2',
      targetTitle: 'Dossier #VRF-7731 (Arrêté timbre fiscal 2 500 FCFA)',
      requestedBy: 'Chantal Nji (Expert Forensique)',
      requestedAt: new Date(Date.now() - 40 * 60000).toISOString(),
      status: 'en_attente_sig2',
      signature1: {
        userId: 'user-3',
        userName: 'Chantal Nji',
        signedAt: new Date(Date.now() - 40 * 60000).toISOString(),
        signatureHash: sha256('#VRF-7731:SIG1:user-3')
      }
    },
    {
      id: 'ds-2',
      targetType: 'system_parameter',
      targetId: 'sp-1',
      targetTitle: 'Abaissement du seuil de détection ELA à 85%',
      requestedBy: 'Dr. François Kamga (Super-Admin)',
      requestedAt: new Date(Date.now() - 120 * 60000).toISOString(),
      status: 'en_attente_sig1'
    }
  ];

  const integrityAlerts: IntegrityAlertDB[] = [
    {
      id: 'alt-1',
      level: 'INFO',
      type: 'CHAINE_HASH',
      title: 'Parité de l’arbre cryptographique vérifiée',
      description: 'Audit périodique d’intégrité exécuté avec succès : 5 blocs consécutifs vérifiés, racine Merkle concordante avec le coffre S3.',
      detectedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      status: 'RESOLUE',
      resolvedAt: new Date(Date.now() - 14 * 60000).toISOString(),
      resolvedBy: 'Système WORM Automatisé',
      resolutionNotes: 'Contrôle automatique réussi, aucun écart de hachage.'
    }
  ];

  const systemSettings: SystemSettingsDB = {
    sessionTimeoutMinutes: 60,
    requireDoubleSignature: true,
    autoAnalysisStrictness: 'standard',
    maxLoginAttempts: 5,
    rsaKeyStatus: 'RSA-4096 Actif (HSM Yaoundé MINPOSTEL)',
    lastBackupAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    activeHSMNode: 'Nœud 1 (MINPOSTEL DataCenter Yaoundé)'
  };

  const apiKeys: ApiKeyDB[] = [
    {
      id: 'key-1',
      name: 'Vérif237 Public Feed API',
      service: 'Flux RSS / Widget Médias Partenaires',
      prefix: 'vf237_live_',
      maskedKey: 'vf237_live_9a8f••••••••••••••••4b12',
      hashedSecret: sha256('vf237_live_secret_sample_key_1'),
      createdAt: '2024-06-01T10:00:00Z',
      lastUsedAt: new Date(Date.now() - 18 * 60000).toISOString(),
      status: 'active',
      permissions: ['read:verifications', 'read:official_acts']
    },
    {
      id: 'key-2',
      name: 'Passerelle MINCOM / MINPOSTEL',
      service: 'Acheminement requêtes institutionnelles',
      prefix: 'vf237_inst_',
      maskedKey: 'vf237_inst_77c1••••••••••••••••99ef',
      hashedSecret: sha256('vf237_inst_secret_sample_key_2'),
      createdAt: '2024-08-15T14:30:00Z',
      lastUsedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      status: 'active',
      permissions: ['read:all', 'submit:official_decrees']
    }
  ];

  return {
    users,
    sessions,
    roles,
    auditLogs,
    investigations,
    doubleSignatures,
    integrityAlerts,
    systemSettings,
    apiKeys,
    verificationTasks: [],
    assistantConversations: []
  };
}

class DatabaseManager {
  public data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing database file, seeding defaults:', e);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  public getSnapshot(): DatabaseSchema {
    return this.data;
  }

  public commit() {
    this.saveData(this.data);
  }

  // Audit append with cryptographic chain
  public appendAuditLog(entry: {
    type: AuditLogEntryDB['type'];
    title: string;
    detail: string;
    user: string;
    actorId: string;
    resource: string;
    result: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
    hashOrIp?: string;
    extraMeta?: string;
  }): AuditLogEntryDB {
    const lastLog = this.data.auditLogs[this.data.auditLogs.length - 1];
    const prevHash = lastLog ? lastLog.hash : sha256('GENESIS_BLOCK_VERIF237_CAMEROON_OBSERVATORY');
    const index = (lastLog ? lastLog.index : 0) + 1;
    const now = new Date();
    const timestamp = now.toISOString();
    const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const correlationId = `corr-${Math.floor(100000 + Math.random() * 900000)}`;

    const hashPayload = `${index}:${timestamp}:${entry.user}:${entry.type}:${entry.resource}:${entry.detail}:${entry.result}:${prevHash}`;
    const hash = sha256(hashPayload);

    const newLog: AuditLogEntryDB = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      index,
      time,
      timestamp,
      type: entry.type,
      title: entry.title,
      detail: entry.detail,
      user: entry.user,
      actorId: entry.actorId,
      resource: entry.resource,
      result: entry.result,
      correlationId,
      hashOrIp: entry.hashOrIp,
      extraMeta: entry.extraMeta,
      previousHash: prevHash,
      hash
    };

    this.data.auditLogs.unshift(newLog); // Put newest first for queries, but index and prevHash maintain blockchain order
    this.commit();
    return newLog;
  }

  // Verify the entire audit chain integrity
  public verifyAuditChain(): { isValid: boolean; checkedCount: number; brokenAtIndex?: number; error?: string } {
    const logs = [...this.data.auditLogs].sort((a, b) => a.index - b.index);
    if (logs.length === 0) return { isValid: true, checkedCount: 0 };

    let expectedPrevHash = logs[0].previousHash;
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      if (log.previousHash !== expectedPrevHash) {
        return {
          isValid: false,
          checkedCount: i,
          brokenAtIndex: log.index,
          error: `Rupture de chaîne au bloc #${log.index} : previousHash (${log.previousHash}) ne correspond pas au bloc précédent.`
        };
      }
      const recalculated = sha256(`${log.index}:${log.timestamp}:${log.user}:${log.type}:${log.resource}:${log.detail}:${log.result}:${log.previousHash}`);
      if (recalculated !== log.hash) {
        return {
          isValid: false,
          checkedCount: i,
          brokenAtIndex: log.index,
          error: `Empreinte invalide au bloc #${log.index} : contenu altéré détecté.`
        };
      }
      expectedPrevHash = log.hash;
    }

    return { isValid: true, checkedCount: logs.length };
  }

  // AI Verification helpers
  public getInvestigationById(id: string): InvestigationQueueItemDB | undefined {
    return this.data.investigations.find(i => i.id === id);
  }

  public getInvestigationByCode(code: string): InvestigationQueueItemDB | undefined {
    const cleanCode = code.trim().toUpperCase();
    return this.data.investigations.find(
      i => i.code.toUpperCase() === cleanCode || i.code.replace('#', '').toUpperCase() === cleanCode.replace('#', '') || i.id === code.trim()
    );
  }

  public getInvestigationByIdempotencyKey(key: string): InvestigationQueueItemDB | undefined {
    if (!key || typeof key !== 'string') return undefined;
    return this.data.investigations.find(i => i.idempotencyKey === key.trim());
  }

  public updateInvestigationAIVerification(
    id: string,
    update: Partial<AIVerificationRecordDB>
  ): InvestigationQueueItemDB | undefined {
    const item = this.getInvestigationById(id);
    if (!item) return undefined;

    const currentAI = item.aiVerification || {
      id: `ai-${Date.now()}`,
      status: 'en_attente' as const,
      statusLabel: 'En attente de traitement',
      progressStep: 'EN_ATTENTE' as const,
      stepDescription: 'Demande mise en file d\'attente',
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      slaTargetSeconds: 300,
      isSlaBreached: false,
      humanReviewStatus: 'EN_ATTENTE_REVUE' as const,
      retryCount: 0,
      modelProvider: 'Google Gemini',
      modelName: 'gemini-3.8-flash'
    };

    item.aiVerification = {
      ...currentAI,
      ...update
    };

    // Keep top-level status aligned
    if (update.status === 'resultat_disponible') {
      item.status = 'pre_analysis';
      item.statusLabel = 'Analyse automatique disponible (En attente de révision déontologique)';
      if (update.verdict) {
        if (update.verdict === 'CONFIRMEE') item.verdict = 'VRAI';
        else if (update.verdict === 'FAUSSE') item.verdict = 'FAUX';
        else if (update.verdict === 'TROMPEUSE') item.verdict = 'TROMPEUR';
        else item.verdict = 'NON_VERIFIABLE';
        item.verdictLabel = update.verdictLabel;
      }
    } else if (update.status === 'verification_approfondie_requise') {
      item.status = 'en_instruction';
      item.statusLabel = 'Investigation approfondie requise par un enquêteur';
    }

    this.commit();
    return item;
  }

  public getVerificationsByUser(userName: string): InvestigationQueueItemDB[] {
    const q = (userName || '').toLowerCase().trim();
    if (!q) return [];
    return this.data.investigations.filter(i => {
      const sub = (i.submittedBy || '').toLowerCase();
      return sub.includes(q) || q.includes(sub);
    });
  }

  public getSLAMetrics(): {
    totalEvaluated: number;
    completedWithin5Min: number;
    breachedCount: number;
    medianSeconds: number;
    p95Seconds: number;
    slaComplianceRate: number;
    durationsSample: number[];
  } {
    const items = this.data.investigations
      .filter(i => i.aiVerification && i.aiVerification.elapsedSeconds > 0)
      .map(i => i.aiVerification!.elapsedSeconds)
      .sort((a, b) => a - b);

    // Provide realistic synthetic baseline if sample is low
    const durations = items.length >= 5 ? items : [14, 22, 35, 48, 62, 75, 88, 110, 145, 180, 210, 245, 275];
    durations.sort((a, b) => a - b);

    const total = durations.length;
    const median = durations[Math.floor(total * 0.5)] || 45;
    const p95 = durations[Math.floor(total * 0.95)] || 180;
    const compliant = durations.filter(d => d <= 300).length;
    const complianceRate = Math.round((compliant / total) * 100);

    return {
      totalEvaluated: total,
      completedWithin5Min: compliant,
      breachedCount: total - compliant,
      medianSeconds: median,
      p95Seconds: p95,
      slaComplianceRate: complianceRate,
      durationsSample: durations.slice(0, 10)
    };
  }

  // Persistent Queue Helpers (Resilience across server restarts)
  public saveVerificationTask(task: VerificationTaskDB): void {
    if (!this.data.verificationTasks) {
      this.data.verificationTasks = [];
    }
    const idx = this.data.verificationTasks.findIndex(t => t.investigationId === task.investigationId);
    if (idx >= 0) {
      this.data.verificationTasks[idx] = task;
    } else {
      this.data.verificationTasks.push(task);
    }
    this.commit();
  }

  public getVerificationTask(investigationId: string): VerificationTaskDB | undefined {
    if (!this.data.verificationTasks) return undefined;
    return this.data.verificationTasks.find(
      t => t.investigationId === investigationId || t.code === investigationId
    );
  }

  public getPendingVerificationTasks(): VerificationTaskDB[] {
    if (!this.data.verificationTasks) return [];
    const pendingSteps = ['RECEIVED', 'QUEUED', 'ANALYZING', 'SEARCHING_SOURCES', 'EVALUATING_EVIDENCE'];
    return this.data.verificationTasks.filter(t => pendingSteps.includes(t.workflowStep));
  }

  public updateVerificationTaskStep(
    investigationId: string,
    step: VerificationTaskDB['workflowStep'],
    output?: any
  ): void {
    if (!this.data.verificationTasks) this.data.verificationTasks = [];
    const task = this.data.verificationTasks.find(t => t.investigationId === investigationId);
    if (task) {
      task.workflowStep = step;
      task.updatedAt = new Date().toISOString();
      if (output) task.output = output;
      this.commit();
    }
  }

  // Assistant IA Conversation Persistence
  public getAssistantConversations(userIdOrSession?: string): AssistantConversationDB[] {
    if (!this.data.assistantConversations) {
      this.data.assistantConversations = [];
    }
    if (!userIdOrSession) {
      return this.data.assistantConversations;
    }
    return this.data.assistantConversations
      .filter(c => c.userId === userIdOrSession || c.userSessionId === userIdOrSession)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getAssistantConversation(id: string): AssistantConversationDB | null {
    if (!this.data.assistantConversations) return null;
    return this.data.assistantConversations.find(c => c.id === id) || null;
  }

  public saveAssistantConversation(conv: AssistantConversationDB): void {
    if (!this.data.assistantConversations) {
      this.data.assistantConversations = [];
    }
    const idx = this.data.assistantConversations.findIndex(c => c.id === conv.id);
    if (idx >= 0) {
      this.data.assistantConversations[idx] = conv;
    } else {
      this.data.assistantConversations.unshift(conv);
    }
    this.commit();
  }

  public deleteAssistantConversation(id: string, userIdOrSession?: string): boolean {
    if (!this.data.assistantConversations) return false;
    const initialLen = this.data.assistantConversations.length;
    this.data.assistantConversations = this.data.assistantConversations.filter(c => {
      if (c.id !== id) return true;
      if (userIdOrSession && c.userId && c.userId !== userIdOrSession && c.userSessionId !== userIdOrSession) {
        return true;
      }
      return false;
    });
    if (this.data.assistantConversations.length !== initialLen) {
      this.commit();
      return true;
    }
    return false;
  }

  public renameAssistantConversation(id: string, title: string, userIdOrSession?: string): boolean {
    const conv = this.getAssistantConversation(id);
    if (!conv) return false;
    if (userIdOrSession && conv.userId && conv.userId !== userIdOrSession && conv.userSessionId !== userIdOrSession) {
      return false;
    }
    conv.title = title.trim();
    conv.updatedAt = new Date().toISOString();
    this.commit();
    return true;
  }
}

export const db = new DatabaseManager();

export const getAssistantConversations = (userIdOrSession?: string) => db.getAssistantConversations(userIdOrSession);
export const getAssistantConversation = (id: string) => db.getAssistantConversation(id);
export const saveAssistantConversation = (conv: AssistantConversationDB) => db.saveAssistantConversation(conv);
export const deleteAssistantConversation = (id: string, userIdOrSession?: string) => db.deleteAssistantConversation(id, userIdOrSession);
export const renameAssistantConversation = (id: string, title: string, userIdOrSession?: string) => db.renameAssistantConversation(id, title, userIdOrSession);

