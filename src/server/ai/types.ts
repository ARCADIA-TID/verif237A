/**
 * VÉRIF237 — Types et Interfaces Canoniques du Système de Vérification par IA
 * Définit le contrat universel pour les fournisseurs d'IA, le workflow et les formats de sortie.
 */

export type CanonicalVerdict =
  | 'SUPPORTED'
  | 'FALSE'
  | 'MISLEADING'
  | 'OUT_OF_CONTEXT'
  | 'UNVERIFIABLE';

export type HumanReviewStatus =
  | 'NON_VALIDE_HUMAIN'
  | 'VALIDE_HUMAIN'
  | 'REVISE_HUMAIN';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type WorkflowStep =
  | 'RECEIVED'
  | 'QUEUED'
  | 'ANALYZING'
  | 'SEARCHING_SOURCES'
  | 'EVALUATING_EVIDENCE'
  | 'COMPLETED'
  | 'REQUIRES_HUMAN_REVIEW'
  | 'ERROR'
  | 'CANCELLED';

export interface EvidenceItem {
  claim: string;
  supports: boolean;
  sourceTitle: string;
  sourceUrl?: string;
  excerpt?: string;
  date?: string;
  reliability: 'officielle' | 'presse_reconnue' | 'reference_documentaire' | 'non_confirmee';
}

export interface VerificationSourceItem {
  title: string;
  url?: string;
  organizationOrAuthor?: string;
  date?: string;
  excerpt?: string;
  isOfficial: boolean;
  reliability: 'officielle' | 'presse_reconnue' | 'reference_documentaire' | 'non_confirmee';
}

export interface ConfidenceAssessment {
  score: number; // 0 à 100
  level: ConfidenceLevel;
  explanation: string;
}

export interface VerificationRequestInput {
  id: string;
  code: string;
  text: string;
  url?: string;
  sourceType?: string;
  region?: string;
  contextDate?: string;
  authorOrSource?: string;
}

export interface AIAnalysisRequest {
  claim: string;
  contextDate?: string;
  region?: string;
  authorOrSource?: string;
  internalEvidence: EvidenceItem[];
  externalEvidence: EvidenceItem[];
}

export interface AIAnalysisResult {
  analyzedClaim: string;
  verdict: CanonicalVerdict;
  verdictLabel: string;
  summary: string;
  reasoning_summary: string;
  evidence: EvidenceItem[];
  sources: VerificationSourceItem[];
  confidence: ConfidenceAssessment;
  limitations: string[];
  requiresHumanInvestigation: boolean;
  modelProvider: string;
  modelName: string;
}

export interface CanonicalVerificationOutput {
  claim: string;
  verdict: CanonicalVerdict;
  verdictLabel: string;
  summary: string;
  reasoning_summary: string;
  evidence: EvidenceItem[];
  sources: VerificationSourceItem[];
  confidence: ConfidenceAssessment;
  limitations: string[];
  humanReviewStatus: HumanReviewStatus;
  createdAt: string;
  completedAt?: string;
  elapsedSeconds: number;
  slaTargetSeconds: number;
  isSlaBreached: boolean;
  workflowStep: WorkflowStep;
  modelProvider: string;
  modelName: string;
}

/**
 * Interface commune pour tous les fournisseurs d'IA (OpenAI, Gemini, etc.)
 */
export interface AIProvider {
  readonly providerName: string;
  readonly modelName: string;
  isAvailable(): Promise<boolean>;
  analyzeEvidence(request: AIAnalysisRequest): Promise<AIAnalysisResult>;
}
