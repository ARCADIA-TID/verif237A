// Frontend API Client for Verif237 Backend

export interface DashboardStats {
  totalUsers: number;
  activeSessionsCount: number;
  activeStaffCount: number;
  totalSubmitted: number;
  pendingVerifications: number;
  inReviewVerifications: number;
  completedVerifications: number;
  openIntegrityAlerts: number;
  totalAuditEvents: number;
  pendingDoubleSignatures: number;
  activeSessions: any[];
  systemIntegrityStatus: string;
  lastSyncTimestamp: string;
}

export interface UserItem {
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

export interface SessionItem {
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
  isExpired: boolean;
}

export interface RoleItem {
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

export interface AuditItem {
  id: string;
  index: number;
  time: string;
  timestamp: string;
  type: string;
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

export interface AIEvidenceItem {
  claim: string;
  supports: boolean;
  sourceTitle: string;
  sourceUrl?: string;
  excerpt?: string;
  reliability: string;
}

export interface AIVerificationItem {
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
  slaTargetSeconds: number;
  isSlaBreached: boolean;

  analyzedClaim?: string;
  verdict?: AICanonicalVerdict;
  canonicalVerdict?: 'SUPPORTED' | 'FALSE' | 'MISLEADING' | 'OUT_OF_CONTEXT' | 'UNVERIFIABLE';
  verdictLabel?: string;
  summary?: string;
  reasoning_summary?: string;
  arguments?: string[];
  evidence?: AIEvidenceItem[];
  sources?: AISourceItem[];
  confidence?: 'ELEVE' | 'MOYEN' | 'FAIBLE' | any;
  confidenceScore?: number;
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

export interface InvestigationItem {
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
  aiVerification?: AIVerificationItem;
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
  verdict?: string;
  verdictLabel?: string;
}

export interface DoubleSignatureItem {
  id: string;
  targetType: string;
  targetId: string;
  targetTitle: string;
  requestedBy: string;
  requestedAt: string;
  status: 'en_attente_sig1' | 'en_attente_sig2' | 'approuve' | 'rejete';
  signature1?: { userId: string; userName: string; signedAt: string; signatureHash: string };
  signature2?: { userId: string; userName: string; signedAt: string; signatureHash: string };
  completedAt?: string;
}

export interface IntegrityAlertItem {
  id: string;
  level: 'CRITIQUE' | 'AVERTISSEMENT' | 'INFO';
  type: string;
  title: string;
  description: string;
  detectedAt: string;
  status: 'OUVERTE' | 'RESOLUE';
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  service: string;
  prefix: string;
  maskedKey: string;
  createdAt: string;
  lastUsedAt: string;
  status: 'active' | 'revoked';
  permissions: string[];
}

// Universal fetch helper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!res.ok) {
    let errMessage = `Erreur réseau (${res.status})`;
    try {
      const errorJson = await res.json();
      if (errorJson.error) errMessage = errorJson.error;
    } catch {
      // Ignore
    }
    throw new Error(errMessage);
  }

  return res.json();
}

export interface StatsTrendsData {
  summary: {
    totalActsVerified: number;
    totalSubmissions: number;
    overallDisinformationRate: number;
    citizensProtectedEstimate: string;
    averageVerificationHours: number;
    sealedHashCount: number;
  };
  monthlyActivity: {
    month: string;
    signalements: number;
    actesVerifies: number;
    fauxDetectes: number;
    desinformationRate: number;
  }[];
  verdictDistribution: {
    name: string;
    value: number;
    percentage: number;
    color: string;
  }[];
  actsByInstitution: {
    institution: string;
    name: string;
    verified: number;
    fakeDetected: number;
  }[];
  channelsDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
}

export const api = {
  // Stats
  getDashboardStats: () => request<DashboardStats>('/api/stats'),
  getStatsTrends: () => request<StatsTrendsData>('/api/stats/trends'),

  // Users
  getUsers: (filters?: { role?: string; search?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.role) params.set('role', filters.role);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.status) params.set('status', filters.status);
    return request<{ users: UserItem[]; total: number }>(`/api/users?${params.toString()}`);
  },

  createUser: (data: {
    name: string;
    email: string;
    phone?: string;
    role: string;
    roleType: string;
    jurisdiction?: string;
    validityUntil?: string;
    actorName?: string;
  }) => request<{ user: UserItem; message: string }>('/api/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateUserStatus: (id: string, status: 'actif' | 'suspendu', actorName?: string) =>
    request<{ user: UserItem; message: string }>(`/api/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, actorName })
    }),

  renewUser2FA: (id: string, actorName?: string) =>
    request<{ message: string }>(`/api/users/${id}/renew-2fa`, {
      method: 'POST',
      body: JSON.stringify({ actorName })
    }),

  // Sessions
  getSessions: () => request<{ sessions: SessionItem[] }>('/api/sessions'),

  revokeSession: (id: string, actorName?: string) =>
    request<{ message: string }>(`/api/sessions/${id}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ actorName })
    }),

  // Roles
  getRoles: () => request<{ roles: RoleItem[] }>('/api/roles'),

  updateRolePermissions: (id: string, permissions: Partial<RoleItem['permissions']>, actorName?: string) =>
    request<{ role: RoleItem; message: string }>(`/api/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ permissions, actorName })
    }),

  // Audit
  getAuditLogs: (filters?: { type?: string; actor?: string; result?: string; limit?: number; offset?: number }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.actor) params.set('actor', filters.actor);
    if (filters?.result) params.set('result', filters.result);
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.offset) params.set('offset', String(filters.offset));
    return request<{ logs: AuditItem[]; total: number; limit: number; offset: number }>(`/api/audit?${params.toString()}`);
  },

  verifyAuditChain: () =>
    request<{ isValid: boolean; checkedCount: number; brokenAtIndex?: number; error?: string }>('/api/audit/verify-chain'),

  // Settings & API Keys
  getSettings: () => request<{ settings: any }>('/api/settings'),

  updateSettings: (settings: any, actorName?: string) =>
    request<{ settings: any; message: string }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings, actorName })
    }),

  getApiKeys: () => request<{ apiKeys: ApiKeyItem[] }>('/api/api-keys'),

  createApiKey: (data: { name: string; service: string; permissions?: string[]; actorName?: string }) =>
    request<{ key: ApiKeyItem; rawSecret: string; message: string }>('/api/api-keys', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  revokeApiKey: (id: string, actorName?: string) =>
    request<{ message: string }>(`/api/api-keys/${id}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ actorName })
    }),

  // Double Signature
  getDoubleSignatures: () => request<{ requests: DoubleSignatureItem[] }>('/api/double-signature'),

  signDoubleSignature: (id: string, data: { userId: string; userName: string; actorRole?: string }) =>
    request<{ request: DoubleSignatureItem; message: string }>(`/api/double-signature/${id}/sign`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Integrity Alerts
  getIntegrityAlerts: () => request<{ alerts: IntegrityAlertItem[] }>('/api/integrity-alerts'),

  runIntegrityCheck: (actorName?: string) =>
    request<{ status: string; checkedCount?: number; message?: string; alert?: IntegrityAlertItem }>('/api/integrity-alerts/check', {
      method: 'POST',
      body: JSON.stringify({ actorName })
    }),

  resolveIntegrityAlert: (id: string, notes: string, actorName?: string) =>
    request<{ alert: IntegrityAlertItem; message: string }>(`/api/integrity-alerts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ notes, actorName })
    }),

  // Submissions & Asynchronous AI Verification (Citizen)
  submitReport: (data: {
    text: string;
    url?: string;
    sourceType?: string;
    region?: string;
    submittedBy?: string;
    authorOrSource?: string;
    contextDate?: string;
    idempotencyKey?: string;
  }) =>
    request<{
      investigation: InvestigationItem;
      trackingCode: string;
      investigationId: string;
      status: string;
      message: string;
    }>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  retryVerification: (id: string) =>
    request<{
      message: string;
      investigation: InvestigationItem;
      trackingCode: string;
    }>(`/api/verifications/${id}/retry`, {
      method: 'POST'
    }),

  getVerificationStatus: (id: string) =>
    request<{
      investigation: InvestigationItem;
      aiVerification?: AIVerificationItem;
      status: string;
      isComplete: boolean;
    }>(`/api/verifications/${id}`),

  trackVerificationByCode: (code: string) =>
    request<{
      investigation: InvestigationItem;
      aiVerification?: AIVerificationItem;
      trackingCode: string;
    }>(`/api/verifications/track/${encodeURIComponent(code)}`),

  getMyVerifications: (userName: string) =>
    request<{ verifications: InvestigationItem[]; total: number }>(`/api/my-verifications?userName=${encodeURIComponent(userName)}`),

  getVerificationSlaMetrics: () =>
    request<{
      totalEvaluated: number;
      completedWithin5Min: number;
      breachedCount: number;
      medianSeconds: number;
      p95Seconds: number;
      slaComplianceRate: number;
      slaTargetFormatted: string;
      durationsSample: number[];
    }>('/api/verifications/metrics'),

  // Investigations (Verifiers)
  getInvestigations: (filters?: { status?: string; urgency?: string; region?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.urgency) params.set('urgency', filters.urgency);
    if (filters?.region) params.set('region', filters.region);
    if (filters?.search) params.set('search', filters.search);
    return request<{ investigations: InvestigationItem[]; total: number }>(`/api/investigations?${params.toString()}`);
  },

  getInvestigationById: (id: string) =>
    request<{ investigation: InvestigationItem }>(`/api/investigations/${id}`),

  createInvestigation: (data: {
    title: string;
    description: string;
    sourceType?: string;
    sourceUrl?: string;
    urgency?: string;
    scope?: string;
    assignedTo?: string;
    assignedToId?: string;
    actorName?: string;
  }) => request<{ investigation: InvestigationItem; message: string }>('/api/investigations', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  takeInvestigation: (id: string, data: { userId: string; userName: string }) =>
    request<{ investigation: InvestigationItem; message: string }>(`/api/investigations/${id}/take`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  assignInvestigation: (id: string, data: { targetUserId: string; targetUserName: string; reason?: string; actorName?: string }) =>
    request<{ investigation: InvestigationItem; message: string }>(`/api/investigations/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  signInvestigation: (id: string, data: { userId: string; userName: string; role?: string; verdict?: string; verdictLabel?: string }) =>
    request<{ investigation: InvestigationItem; step: number; sealedHash?: string; message: string }>(`/api/investigations/${id}/sign`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  addInvestigationNote: (id: string, data: { author: string; content: string }) =>
    request<{ note: any; message: string }>(`/api/investigations/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Investigation Tools
  getMinistries: (filters?: { category?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.search) params.set('search', filters.search);
    return request<{ institutions: any[]; total: number }>(`/api/tools/ministries?${params.toString()}`);
  },

  runReverseSearch: (data: { query?: string; imageUrl?: string }) =>
    request<{ targets: { engine: string; url: string; description: string }[] }>('/api/tools/reverse-search', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  runExifAnalysis: (data: { fileName: string; samplePreset?: string }) =>
    request<{ report: any }>('/api/tools/exif', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  runAgnesSearch: (query: string) =>
    request<{ engineVersion: string; jurisdiction: string; matchedDecrees: any[]; rumorIndexScore: string; republicanEthicNote: string }>('/api/tools/agnes', {
      method: 'POST',
      body: JSON.stringify({ query })
    }),

  // Assistant IA Conversationnel
  sendAssistantMessage: (data: {
    conversationId?: string;
    message: string;
    userId?: string;
    userSessionId?: string;
  }) =>
    request<{
      conversationId: string;
      title: string;
      message: any;
      sources: any[];
      groundingSearchQueries: string[];
    }>('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getAssistantConversations: (userIdOrSession?: string) => {
    const params = new URLSearchParams();
    if (userIdOrSession) params.set('userId', userIdOrSession);
    return request<{
      conversations: Array<{
        id: string;
        title: string;
        createdAt: string;
        updatedAt: string;
        messageCount: number;
        lastMessage: string;
      }>;
      total: number;
    }>(`/api/assistant/conversations?${params.toString()}`);
  },

  getAssistantConversation: (id: string) =>
    request<{ conversation: any }>(`/api/assistant/conversations/${id}`),

  deleteAssistantConversation: (id: string, userIdOrSession?: string) => {
    const params = new URLSearchParams();
    if (userIdOrSession) params.set('userId', userIdOrSession);
    return request<{ success: boolean; message: string }>(`/api/assistant/conversations/${id}?${params.toString()}`, {
      method: 'DELETE'
    });
  },

  renameAssistantConversation: (id: string, title: string, userIdOrSession?: string) =>
    request<{ success: boolean; message: string }>(`/api/assistant/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title, userId: userIdOrSession })
    })
};
