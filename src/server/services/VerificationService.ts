/**
 * VÉRIF237 — Service Général d'Orchestration de la Vérification (VerificationService)
 * Orchestre de bout en bout l'extraction factuelle, la recherche hybride (interne + web),
 * l'évaluation des preuves et l'exécution du fournisseur d'IA.
 */

import {
  VerificationRequestInput,
  AIAnalysisRequest,
  AIAnalysisResult,
  CanonicalVerificationOutput,
  EvidenceItem,
  VerificationSourceItem
} from '../ai/types';
import { internalKnowledgeService } from './InternalKnowledgeService';
import { webSearchService } from './WebSearchService';
import { evidenceEvaluationService } from './EvidenceEvaluationService';
import { AIProviderFactory } from '../ai/AIProviderFactory';

export class VerificationService {
  /**
   * Exécute l'orchestration complète de la vérification
   */
  public async verifyClaim(input: VerificationRequestInput): Promise<CanonicalVerificationOutput> {
    const startTime = Date.now();
    const cleanText = input.text.trim();

    // 1. Recherche dans la base interne
    const internalRes = await internalKnowledgeService.searchInternalKnowledge(cleanText);

    // 2. Recherche sur le Web (avec anti-SSRF et cache)
    const webRes = await webSearchService.collectWebEvidence(cleanText, input.url);

    // 3. Fusion des preuves
    const combinedEvidence: EvidenceItem[] = [
      ...internalRes.evidenceItems,
      ...webRes.evidenceItems
    ];

    // 4. Évaluation objective des preuves
    const evalOutcome = evidenceEvaluationService.evaluate(combinedEvidence, cleanText);

    // 5. Formulation de la requête pour le fournisseur d'IA
    const aiRequest: AIAnalysisRequest = {
      claim: cleanText,
      contextDate: input.contextDate,
      region: input.region,
      authorOrSource: input.authorOrSource,
      internalEvidence: internalRes.evidenceItems,
      externalEvidence: webRes.evidenceItems
    };

    // 6. Exécution du fournisseur d'IA (Gemini / OpenAI / repli AgNES)
    const aiResult: AIAnalysisResult = await AIProviderFactory.executeWithResilience(aiRequest);

    // Fusion et déduplication des sources
    const allSources: VerificationSourceItem[] = [
      ...aiResult.sources,
      ...webRes.sources
    ];

    const uniqueSourcesMap = new Map<string, VerificationSourceItem>();
    for (const s of allSources) {
      if (!uniqueSourcesMap.has(s.title)) {
        uniqueSourcesMap.set(s.title, s);
      }
    }

    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
    const slaTargetSeconds = 300; // 5 minutes

    // 7. Sortie canonique strictement validée côté serveur
    return {
      claim: aiResult.analyzedClaim,
      verdict: aiResult.verdict,
      verdictLabel: aiResult.verdictLabel,
      summary: aiResult.summary,
      reasoning_summary: aiResult.reasoning_summary || evalOutcome.confidence.explanation,
      evidence: aiResult.evidence.length > 0 ? aiResult.evidence : combinedEvidence,
      sources: Array.from(uniqueSourcesMap.values()),
      confidence: aiResult.confidence,
      limitations: aiResult.limitations.length > 0
        ? aiResult.limitations
        : ['Analyse algorithmique automatisée sous réserve de confrontation humaine.'],
      humanReviewStatus: 'NON_VALIDE_HUMAIN', // Jamais de faux sceau officiel
      createdAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      elapsedSeconds,
      slaTargetSeconds,
      isSlaBreached: elapsedSeconds > slaTargetSeconds,
      workflowStep: 'COMPLETED',
      modelProvider: aiResult.modelProvider,
      modelName: aiResult.modelName
    };
  }
}

export const verificationService = new VerificationService();
