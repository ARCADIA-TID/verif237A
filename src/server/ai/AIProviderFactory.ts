/**
 * VÉRIF237 — Fabrique des Fournisseurs d'IA (AIProviderFactory)
 * Permet l'interchangeabilité dynamique des modèles (OpenAI / Gemini / AgNES Souverain)
 * sans modifier le reste du système.
 */

import { AIProvider, AIAnalysisRequest, AIAnalysisResult } from './types';
import { GeminiProvider } from './GeminiProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { institutionalGroundingEngine, InstitutionalGroundingEngine } from './InstitutionalGroundingEngine';

export class AIProviderFactory {
  private static geminiInstance: GeminiProvider | null = null;
  private static openAIInstance: OpenAIProvider | null = null;

  public static getPreferredProvider(): AIProvider {
    const configured = (process.env.AI_PROVIDER || '').toLowerCase();

    if (configured === 'openai') {
      if (!this.openAIInstance) this.openAIInstance = new OpenAIProvider();
      return this.openAIInstance;
    }

    if (configured === 'gemini') {
      if (!this.geminiInstance) this.geminiInstance = new GeminiProvider();
      return this.geminiInstance;
    }

    // Détection automatique selon les clés fournies
    if (process.env.GEMINI_API_KEY) {
      if (!this.geminiInstance) this.geminiInstance = new GeminiProvider();
      return this.geminiInstance;
    }

    if (process.env.OPENAI_API_KEY) {
      if (!this.openAIInstance) this.openAIInstance = new OpenAIProvider();
      return this.openAIInstance;
    }

    // Fournisseur institutionnel souverain par défaut
    return institutionalGroundingEngine as unknown as AIProvider;
  }

  /**
   * Exécute l'analyse avec bascule automatique de tolérance aux pannes :
   * Fournisseur Principal (Gemini ou OpenAI) -> Fallback Moteur Souverain Cameroun (AgNES).
   */
  public static async executeWithResilience(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    const provider = this.getPreferredProvider();

    try {
      const isAvailable = await provider.isAvailable();
      if (isAvailable) {
        return await provider.analyzeEvidence(request);
      }
    } catch (err: any) {
      console.warn(`[AIProviderFactory] Échec du fournisseur ${provider.providerName} (${err.message}). Activation du repli souverain.`);
    }

    // Bascule automatique de secours
    return institutionalGroundingEngine.analyzeEvidence(request);
  }
}
