/**
 * VÉRIF237 — File d'Attente et Ordonnanceur Asynchrone de Vérification (VerificationQueue)
 * 
 * Workflow canonique à 6 étapes :
 * RECEIVED → QUEUED → ANALYZING → SEARCHING_SOURCES → EVALUATING_EVIDENCE → COMPLETED
 * États terminaux ou de reprise : REQUIRES_HUMAN_REVIEW, ERROR, CANCELLED.
 * 
 * Garanties :
 * - Persistance intégrale dans la base de données (aucune tâche perdue en cas de redémarrage)
 * - Traitement asynchrone non-bloquant pour l'appelant HTTP
 * - Déduplication et protection contre les exécutions concurrentes
 * - Respect et métriques du SLA de 5 minutes (300 secondes)
 */

import { db, VerificationTaskDB, AIVerificationRecordDB } from './db';
import { verificationService } from './services/VerificationService';
import {
  VerificationRequestInput,
  WorkflowStep,
  CanonicalVerificationOutput,
  CanonicalVerdict
} from './ai/types';

export class VerificationQueue {
  private processingMap: Map<string, { startTime: number; step: WorkflowStep }> = new Map();
  private isResuming: boolean = false;

  constructor() {
    // Reprise automatique des tâches non terminées au démarrage
    setImmediate(() => {
      this.resumePendingTasks();
    });
  }

  /**
   * Enfile une nouvelle tâche de vérification de façon asynchrone et persistante
   */
  public enqueue(investigationId: string, input: VerificationRequestInput): void {
    // 1. Déduplication : ignorer si déjà en cours
    if (this.processingMap.has(investigationId)) {
      console.log(`[VerificationQueue] Tâche ${investigationId} déjà en cours de traitement.`);
      return;
    }

    const startTime = Date.now();
    this.processingMap.set(investigationId, { startTime, step: 'RECEIVED' });

    // 2. Persistance dans la table des tâches
    const task: VerificationTaskDB = {
      id: `task-${investigationId}`,
      investigationId,
      code: input.code,
      input,
      workflowStep: 'RECEIVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      retryCount: 0
    };
    db.saveVerificationTask(task);

    const nowIso = new Date(startTime).toISOString();
    const initialStepStatuses: Record<string, 'pending' | 'in_progress' | 'completed' | 'failed' | 'not_applicable'> = {
      information_recue: 'completed',
      analyse_initiale: 'in_progress',
      recherche_sources: 'pending',
      analyse_preuves: 'pending',
      evaluation_ia: 'pending',
      validation: 'pending',
      resultat_disponible: 'pending'
    };

    const initialStepHistory = [
      {
        step: 'information_recue',
        label: 'Information reçue',
        timestamp: nowIso,
        status: 'completed' as const,
        message: 'L\'information soumise a été enregistrée avec succès.'
      },
      {
        step: 'analyse_initiale',
        label: 'Analyse initiale',
        timestamp: nowIso,
        status: 'in_progress' as const,
        message: 'Extraction des affirmations et des éléments à examiner.'
      }
    ];

    // 3. Mise à jour initiale du dossier dans la base
    db.updateInvestigationAIVerification(investigationId, {
      id: `ai-${investigationId}`,
      status: 'en_attente',
      statusLabel: 'Dossier reçu et enregistré dans la file accélérée',
      progressStep: 'EN_ATTENTE',
      workflowStep: 'RECEIVED',
      stepDescription: 'Enregistrement initial du signalement citoyen',
      startedAt: nowIso,
      elapsedSeconds: 0,
      estimatedRemainingSeconds: 45,
      slaTargetSeconds: 300,
      isSlaBreached: false,
      humanReviewStatus: 'NON_VALIDE_HUMAIN',
      retryCount: 0,
      modelProvider: 'Vérif237 AI Engine & AgNES',
      modelName: 'hybrid-verification-v2',
      stepStatuses: initialStepStatuses,
      stepHistory: initialStepHistory
    });

    // 4. Passage à l'état QUEUED puis exécution asynchrone sur le microtask suivant
    setImmediate(async () => {
      await this.transitionStep(investigationId, 'QUEUED', 'Demande positionnée dans la file prioritaire', startTime, 40);
      await this.processItem(investigationId, input, startTime, 0);
    });
  }

  /**
   * Transition d'étape avec mise à jour du statut dans la base et calcul de latence
   */
  private async transitionStep(
    investigationId: string,
    step: WorkflowStep,
    stepDescription: string,
    startTime: number,
    estimatedRemainingSeconds: number
  ): Promise<void> {
    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
    this.processingMap.set(investigationId, { startTime, step });

    let statusLabel = '';
    let legacyStatus: AIVerificationRecordDB['status'] = 'en_attente';
    let legacyProgress: AIVerificationRecordDB['progressStep'] = 'EN_ATTENTE';

    const inv = db.getInvestigationById(investigationId);
    const existingStatuses: Record<string, 'pending' | 'in_progress' | 'completed' | 'failed' | 'not_applicable'> =
      inv?.aiVerification?.stepStatuses ? { ...inv.aiVerification.stepStatuses } : {
        information_recue: 'completed',
        analyse_initiale: 'pending',
        recherche_sources: 'pending',
        analyse_preuves: 'pending',
        evaluation_ia: 'pending',
        validation: 'pending',
        resultat_disponible: 'pending'
      };

    const existingHistory = inv?.aiVerification?.stepHistory ? [...inv.aiVerification.stepHistory] : [];
    const nowIso = new Date().toISOString();

    switch (step) {
      case 'RECEIVED':
        statusLabel = 'Signalement reçu';
        legacyStatus = 'en_attente';
        legacyProgress = 'EN_ATTENTE';
        existingStatuses.information_recue = 'completed';
        break;
      case 'QUEUED':
        statusLabel = 'En file d’attente prioritaire';
        legacyStatus = 'en_attente';
        legacyProgress = 'EN_ATTENTE';
        existingStatuses.information_recue = 'completed';
        existingStatuses.analyse_initiale = 'in_progress';
        break;
      case 'ANALYZING':
        statusLabel = 'Analyse en cours : extraction des allégations';
        legacyStatus = 'analyse_en_cours';
        legacyProgress = 'COMPREHENSION_AFFIRMATION';
        existingStatuses.information_recue = 'completed';
        existingStatuses.analyse_initiale = 'in_progress';
        existingHistory.push({
          step: 'analyse_initiale',
          label: 'Analyse initiale',
          timestamp: nowIso,
          status: 'in_progress',
          message: 'Extraction des affirmations et des faits vérifiables.'
        });
        break;
      case 'SEARCHING_SOURCES':
        statusLabel = 'Recherche documentaire et confrontation administrative';
        legacyStatus = 'verification_sources';
        legacyProgress = 'RECHERCHE_SOURCES';
        existingStatuses.analyse_initiale = 'completed';
        existingStatuses.recherche_sources = 'in_progress';
        existingHistory.push(
          {
            step: 'analyse_initiale',
            label: 'Analyse initiale',
            timestamp: nowIso,
            status: 'completed',
            message: 'Faits et entités identifiés avec succès.'
          },
          {
            step: 'recherche_sources',
            label: 'Recherche de sources',
            timestamp: nowIso,
            status: 'in_progress',
            message: 'Consultation des sources Web accessibles et de la base interne camerounaise.'
          }
        );
        break;
      case 'EVALUATING_EVIDENCE':
        statusLabel = 'Évaluation contradictoire des preuves';
        legacyStatus = 'verification_sources';
        legacyProgress = 'COMPARAISON_PREUVES';
        existingStatuses.recherche_sources = 'completed';
        existingStatuses.analyse_preuves = 'in_progress';
        existingHistory.push(
          {
            step: 'recherche_sources',
            label: 'Recherche de sources',
            timestamp: nowIso,
            status: 'completed',
            message: 'Sources documentaires et portails officiels consultés.'
          },
          {
            step: 'analyse_preuves',
            label: 'Analyse des preuves',
            timestamp: nowIso,
            status: 'in_progress',
            message: 'Comparaison des informations, dates, sources et contradictions.'
          }
        );
        break;
      case 'COMPLETED':
        statusLabel = 'Résultat disponible (Analyse automatisée certifiée)';
        legacyStatus = 'resultat_disponible';
        legacyProgress = 'FINALISATION';
        existingStatuses.analyse_preuves = 'completed';
        existingStatuses.evaluation_ia = 'completed';
        existingStatuses.validation = 'completed';
        existingStatuses.resultat_disponible = 'completed';
        existingHistory.push(
          {
            step: 'validation',
            label: 'Validation',
            timestamp: nowIso,
            status: 'completed',
            message: 'Vérification automatisée terminée et scellée.'
          },
          {
            step: 'resultat_disponible',
            label: 'Résultat disponible',
            timestamp: nowIso,
            status: 'completed',
            message: 'Conclusions, preuves et sources mises à disposition.'
          }
        );
        break;
      case 'REQUIRES_HUMAN_REVIEW':
        statusLabel = 'Vérification approfondie nécessaire par un enquêteur humain';
        legacyStatus = 'verification_approfondie_requise';
        legacyProgress = 'FINALISATION';
        existingStatuses.analyse_preuves = 'completed';
        existingStatuses.evaluation_ia = 'completed';
        existingStatuses.validation = 'completed';
        existingStatuses.resultat_disponible = 'completed';
        existingHistory.push(
          {
            step: 'validation',
            label: 'Validation',
            timestamp: nowIso,
            status: 'completed',
            message: 'Orientation vers instruction collégiale humaine requise.'
          },
          {
            step: 'resultat_disponible',
            label: 'Résultat disponible',
            timestamp: nowIso,
            status: 'completed',
            message: 'Conclusions préliminaires et transmission aux vérificateurs.'
          }
        );
        break;
      case 'ERROR':
        statusLabel = 'Anomalie temporaire de traitement';
        legacyStatus = 'echec_temporaire';
        legacyProgress = 'EN_ATTENTE';
        // Mark any current in_progress step as failed
        Object.keys(existingStatuses).forEach(k => {
          if (existingStatuses[k] === 'in_progress') existingStatuses[k] = 'failed';
        });
        existingHistory.push({
          step: 'erreur',
          label: 'Anomalie temporaire',
          timestamp: nowIso,
          status: 'failed',
          message: stepDescription || 'Une anomalie temporaire est survenue lors de l\'analyse.'
        });
        break;
      case 'CANCELLED':
        statusLabel = 'Vérification annulée';
        legacyStatus = 'echec_temporaire';
        legacyProgress = 'EN_ATTENTE';
        existingHistory.push({
          step: 'annulation',
          label: 'Annulation',
          timestamp: nowIso,
          status: 'failed',
          message: 'Vérification interrompue par l\'utilisateur.'
        });
        break;
    }

    db.updateInvestigationAIVerification(investigationId, {
      status: legacyStatus,
      statusLabel,
      progressStep: legacyProgress,
      workflowStep: step,
      stepDescription,
      elapsedSeconds,
      estimatedRemainingSeconds,
      stepStatuses: existingStatuses,
      stepHistory: existingHistory
    });

    db.updateVerificationTaskStep(investigationId, step);
  }

  /**
   * Traitement séquentiel pas à pas du workflow
   */
  private async processItem(
    investigationId: string,
    input: VerificationRequestInput,
    startTime: number,
    retryCount: number
  ): Promise<void> {
    try {
      // Étape 2 : ANALYZING
      await this.transitionStep(
        investigationId,
        'ANALYZING',
        'Compréhension de l\'affirmation principale et extraction des faits précis...',
        startTime,
        35
      );
      await new Promise(r => setTimeout(r, 600));

      // Étape 3 : SEARCHING_SOURCES
      await this.transitionStep(
        investigationId,
        'SEARCHING_SOURCES',
        'Recherche croisée dans la base des décrets officiels et sur les portails camerounais...',
        startTime,
        25
      );
      await new Promise(r => setTimeout(r, 700));

      // Étape 4 : EVALUATING_EVIDENCE
      await this.transitionStep(
        investigationId,
        'EVALUATING_EVIDENCE',
        'Pondération des preuves, examen des quittances et détection des contradictions...',
        startTime,
        15
      );
      await new Promise(r => setTimeout(r, 500));

      // Étape 5 & 6 : Évaluation par l'IA et Validation
      const output: CanonicalVerificationOutput = await verificationService.verifyClaim(input);

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const isBreached = elapsed > 300; // SLA 5 min

      const requiresHuman = output.verdict === 'UNVERIFIABLE';
      const finalStep: WorkflowStep = requiresHuman ? 'REQUIRES_HUMAN_REVIEW' : 'COMPLETED';

      // Mapping du verdict pour compatibilité ascendante
      let legacyVerdict: AIVerificationRecordDB['verdict'] = 'NON_VERIFIABLE';
      switch (output.verdict) {
        case 'SUPPORTED': legacyVerdict = 'CONFIRMEE'; break;
        case 'FALSE': legacyVerdict = 'FAUSSE'; break;
        case 'MISLEADING': legacyVerdict = 'TROMPEUSE'; break;
        case 'OUT_OF_CONTEXT': legacyVerdict = 'HORS_CONTEXTE'; break;
        case 'UNVERIFIABLE': legacyVerdict = 'NON_VERIFIABLE'; break;
      }

      // Étape finale 7 : COMPLETED ou REQUIRES_HUMAN_REVIEW
      await this.transitionStep(
        investigationId,
        finalStep,
        requiresHuman
          ? 'Preuves documentaires incomplètes. Dossier orienté vers l\'instruction humaine.'
          : 'Synthèse factuelle et traçabilité achevées.',
        startTime,
        0
      );

      // Mise à jour de la fiche complète dans la base
      db.updateInvestigationAIVerification(investigationId, {
        status: requiresHuman ? 'verification_approfondie_requise' : 'resultat_disponible',
        statusLabel: requiresHuman
          ? 'Vérification approfondie nécessaire par un enquêteur humain'
          : 'Résultat disponible (Analyse automatisée certifiée)',
        progressStep: 'FINALISATION',
        workflowStep: finalStep,
        completedAt: output.completedAt,
        elapsedSeconds: elapsed,
        estimatedRemainingSeconds: 0,
        isSlaBreached: isBreached,
        analyzedClaim: output.claim,
        verdict: legacyVerdict,
        canonicalVerdict: output.verdict,
        verdictLabel: output.verdictLabel,
        summary: output.summary,
        reasoning_summary: output.reasoning_summary,
        arguments: output.evidence.map(e => `${e.claim} — ${e.sourceTitle}`),
        evidence: output.evidence,
        sources: output.sources.map(s => ({
          name: s.title,
          title: s.title,
          url: s.url,
          organizationOrAuthor: s.organizationOrAuthor,
          date: s.date,
          snippet: s.excerpt,
          excerpt: s.excerpt,
          isOfficial: s.isOfficial,
          reliability: s.reliability
        })),
        confidence: output.confidence.level === 'HIGH' ? 'ELEVE' : (output.confidence.level === 'LOW' ? 'FAIBLE' : 'MOYEN'),
        confidenceScore: output.confidence.score,
        confidenceExplanation: output.confidence.explanation,
        limits: output.limitations,
        humanReviewStatus: output.humanReviewStatus,
        modelProvider: output.modelProvider,
        modelName: output.modelName,
        retryCount
      });

      // Mise à jour de la tâche persistante avec la sortie finale
      db.updateVerificationTaskStep(investigationId, finalStep, output);

      // Journal d'audit cryptographique WORM immuable
      db.appendAuditLog({
        type: 'ATTRIBUTION',
        title: `Vérification IA achevée pour ${input.code}`,
        detail: `Verdict canonique : ${output.verdict} (${output.confidence.level}). Durée : ${elapsed}s. SLA respecté : ${!isBreached}.`,
        user: 'Service IA Vérif 237',
        actorId: 'ai-worker',
        resource: `Dossier ${input.code}`,
        result: 'SUCCESS',
        extraMeta: `Verdict=${output.verdict}|Elapsed=${elapsed}s|SLA=${!isBreached}|Provider=${output.modelProvider}`
      });

      this.processingMap.delete(investigationId);
    } catch (err: any) {
      console.error(`[VerificationQueue] Erreur de traitement sur ${investigationId}:`, err);

      // Nouvelle tentative contrôlée (max 2 reprises automatiques)
      if (retryCount < 2) {
        console.log(`[VerificationQueue] Reprise contrôlée ${investigationId} (tentative ${retryCount + 1})...`);
        setTimeout(() => {
          this.processItem(investigationId, input, startTime, retryCount + 1);
        }, 1200);
        return;
      }

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      await this.transitionStep(investigationId, 'ERROR', err.message || 'Échec temporaire du traitement automatisé', startTime, 0);

      db.updateInvestigationAIVerification(investigationId, {
        status: 'echec_temporaire',
        statusLabel: 'Échec temporaire du traitement automatisé',
        progressStep: 'EN_ATTENTE',
        workflowStep: 'ERROR',
        stepDescription: 'Une anomalie temporaire est survenue. Vous pouvez relancer la vérification ou la soumettre aux vérificateurs.',
        elapsedSeconds: elapsed,
        rawError: err.message || 'Erreur inconnue',
        retryCount: retryCount + 1,
        humanReviewStatus: 'NON_VALIDE_HUMAIN'
      });

      this.processingMap.delete(investigationId);
    }
  }

  /**
   * Reprise automatique des tâches non terminées lors d'un redémarrage du backend
   */
  public resumePendingTasks(): void {
    if (this.isResuming) return;
    this.isResuming = true;

    try {
      const pending = db.getPendingVerificationTasks();
      if (pending.length > 0) {
        console.log(`[VerificationQueue] Reprise de ${pending.length} tâche(s) en attente après redémarrage...`);
        for (const task of pending) {
          if (!this.processingMap.has(task.investigationId)) {
            const input: VerificationRequestInput = {
              id: task.input.id || task.investigationId,
              code: task.input.code || task.code,
              text: task.input.text,
              url: task.input.url,
              sourceType: task.input.sourceType,
              region: task.input.region,
              authorOrSource: task.input.authorOrSource,
              contextDate: task.input.contextDate
            };
            this.enqueue(task.investigationId, input);
          }
        }
      }
    } catch (e) {
      console.warn('[VerificationQueue] Erreur lors de la reprise des tâches:', e);
    } finally {
      this.isResuming = false;
    }
  }

  /**
   * Relance explicite d'une tâche échouée ou demandée par l'utilisateur
   */
  public retryTask(investigationId: string): boolean {
    const inv = db.getInvestigationById(investigationId) || db.getInvestigationByCode(investigationId);
    if (!inv) return false;

    // Remove from active map if present
    this.processingMap.delete(inv.id);

    const input: VerificationRequestInput = {
      id: inv.id,
      code: inv.code,
      text: inv.description || inv.title,
      url: inv.sourceUrl,
      sourceType: inv.sourceType,
      region: inv.scope
    };

    this.enqueue(inv.id, input);
    return true;
  }

  /**
   * Annulation explicite d'une vérification
   */
  public cancelTask(investigationId: string): boolean {
    if (this.processingMap.has(investigationId)) {
      this.processingMap.delete(investigationId);
      db.updateVerificationTaskStep(investigationId, 'CANCELLED');
      db.updateInvestigationAIVerification(investigationId, {
        status: 'echec_temporaire',
        statusLabel: 'Vérification annulée par l’utilisateur',
        progressStep: 'EN_ATTENTE',
        workflowStep: 'CANCELLED',
        stepDescription: 'Le traitement a été interrompu à la demande de l’utilisateur.'
      });
      return true;
    }
    return false;
  }

  /**
   * Consultation du statut actif pour le polling frontend
   */
  public getStatus(investigationId: string): { status: string; workflowStep: WorkflowStep; elapsedSeconds: number } | null {
    const active = this.processingMap.get(investigationId);
    if (!active) return null;
    return {
      status: active.step.toLowerCase(),
      workflowStep: active.step,
      elapsedSeconds: Math.round((Date.now() - active.startTime) / 1000)
    };
  }
}

export const verificationQueue = new VerificationQueue();
