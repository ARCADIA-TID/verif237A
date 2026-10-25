export type UserRole = 'visitor' | 'citoyen' | 'verificateur' | 'admin' | 'super_admin';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  roleLabel: string;
  region?: string;
  badgeCode?: string;
  avatarUrl?: string;
  twoFactorEnabled?: boolean;
}

export type NavPage = 
  | 'accueil' 
  | 'information' 
  | 'actes' 
  | 'actualites' 
  | 'verifier' 
  | 'assistant-ia'
  | 'ia'
  | 'a-propos'
  | 'about'
  | 'guides'
  | 'console-verif' 
  | 'console-admin' 
  | 'auth'
  | 'gouvernance' 
  | 'design-system'
  | 'acces-refuse'
  | 'signaler'
  | 'dossier'
  | 'dossiers-actus'
  | 'espace-visiteur'
  | 'admin'
  | 'faq';

export interface AssistantSource {
  title: string;
  url?: string;
  organization?: string;
  date?: string;
  excerpt?: string;
  isOfficial?: boolean;
  reliability?: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: AssistantSource[];
  groundingSearchQueries?: string[];
  isThinking?: boolean;
  isError?: boolean;
}

export interface AssistantConversation {
  id: string;
  title: string;
  userId?: string;
  userSessionId?: string;
  createdAt: string;
  updatedAt: string;
  messages: AssistantMessage[];
}

export type Language = 'FR' | 'EN';

export type VerdictType = 'FAUX' | 'VRAI' | 'TROMPEUR' | 'EN_COURS' | 'NON_CONFIRME' | 'ARCHIVE';

export interface OfficialAct {
  id: string;
  title: string;
  organization: string;
  category: 'DGSN' | 'OBC' | 'MINESUP' | 'MINSANTE' | 'MINFOPRA' | 'MINFI';
  status: 'en-vigueur' | 'limite-proche' | 'archive';
  statusLabel: string;
  certifiedDate: string;
  fee: string;
  feeNote: string;
  requirements: string[];
  reference: string;
  actionText: string;
  region: string;
  downloadName: string;
  alertWarning?: string;
  consultationArchive?: boolean;
}

export interface VerificationAnomaly {
  id: number;
  title: string;
  description: string;
}

export interface VerificationProof {
  id: string;
  letter: string;
  title: string;
  description: string;
  refLink?: string;
  inviolableTag?: string;
}

export interface PrimarySourceItem {
  title: string;
  subtitle: string;
  hash?: string;
  link?: string;
  phone?: string;
  icon: string;
}

export interface RelatedVerificationItem {
  id: string;
  title: string;
  verdict: VerdictType;
  timeAgo: string;
  subtitle: string;
}

export interface VerificationCase {
  id: string;
  code: string;
  title: string;
  claim: string;
  verdict: VerdictType;
  verdictLabel: string;
  ministry: string;
  author?: string;
  authorRole?: string;
  dateAudit: string;
  lastUpdate: string;
  primarySourcesCount: number;
  sha256Hash: string;
  summaryCitizen: string;
  viralityChannel: string;
  viralityLevel: string;
  evidenceImageUrl?: string;
  evidenceTitle?: string;
  evidenceBadge?: string;
  evidenceAnomalies?: VerificationAnomaly[];
  proofs?: VerificationProof[];
  truthComparison?: {
    facts: string[];
    falseClaims: string[];
    sourceLabel: string;
    modusOperandi: string;
  };
  primarySources?: PrimarySourceItem[];
  antiScamTips?: string[];
  relatedVerifications?: RelatedVerificationItem[];
}

export interface AccreditedUser {
  id: string;
  code: string;
  name: string;
  titleBadge: string;
  role: string;
  roleType: 'super-admin' | 'reviseur' | 'forensique' | 'terrain' | 'moderateur';
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
}

export interface AuditLogEntry {
  id: string;
  time: string;
  type: 'AUTH' | 'ATTRIBUTION' | 'SIGNATURE' | 'PERMISSIONS' | 'SCELLEMENT';
  title: string;
  detail: string;
  user: string;
  hashOrIp?: string;
  extraMeta?: string;
}

export interface SubmissionReport {
  id: string;
  code: string;
  formatType: 'text' | 'link' | 'media' | 'document';
  text: string;
  url?: string;
  fileName?: string;
  region: string;
  firstSeenDate: string;
  channel: string;
  civicPledge: boolean;
  timestamp: string;
  status: 'en_attente' | 'en_instruction' | 'en_relecture' | 'scelle';
  urgencyLevel?: 'standard' | 'haute' | 'coupe_file';
  authorName?: string;
  authorEmail?: string;
}

export interface InvestigationQueueItem {
  id: string;
  code: string;
  title: string;
  description: string;
  sourceType: string;
  urgency: 'normale' | 'haute' | 'vigie_urgence';
  urgencyLabel: string;
  timeAgo: string;
  assignedTo: string;
  status: 'en_attente' | 'en_instruction' | 'contre_expertise' | 'pret_scellement';
  statusLabel: string;
  scope: string;
  previewImageUrl: string;
  previewTag: string;
  hash?: string;
}

export interface CivicRegistrationState {
  step: 1 | 2 | 3 | 4;
  fullName: string;
  contactType: 'email' | 'phone';
  contactValue: string;
  region: string;
  password: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  participationMode: 'citoyen_veilleur' | 'relais_local' | 'expert_juriste';
  digestFrequency: 'quotidienne' | 'hebdomadaire' | 'alertes_urgentes';
  acceptedCharter: boolean;
  receiveMonthlyKit: boolean;
  assignedBadgeCode?: string;
}
