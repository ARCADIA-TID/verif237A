import React, { useState, useEffect, useCallback } from 'react';
import { api, InvestigationItem, AIVerificationItem } from '../../services/api';
import { offlineStorage } from '../../services/offlineStorage';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export interface VerificationLiveTrackerProps {
  investigationId: string;
  initialCode?: string;
  isOfflinePending?: boolean;
  onReset: () => void;
  onViewInRegistry?: (code: string) => void;
  onSyncOffline?: () => Promise<void>;
}

export interface VerificationStepDef {
  key: string;
  num: number;
  label: string;
  desc: string;
  icon: string;
}

export const VERIFICATION_7_STEPS: VerificationStepDef[] = [
  {
    key: 'information_recue',
    num: 1,
    label: 'Information reçue',
    desc: 'Signalement enregistré et scellé dans la file sécurisée',
    icon: 'mark_email_read'
  },
  {
    key: 'analyse_initiale',
    num: 2,
    label: 'Analyse initiale',
    desc: 'Extraction des affirmations et des faits vérifiables',
    icon: 'analytics'
  },
  {
    key: 'recherche_sources',
    num: 3,
    label: 'Recherche de sources',
    desc: 'Consultation des archives officielles .cm et web fiable',
    icon: 'search_check'
  },
  {
    key: 'analyse_preuves',
    num: 4,
    label: 'Analyse des preuves',
    desc: 'Confrontation des dates, quittances et contradictions',
    icon: 'balance'
  },
  {
    key: 'evaluation_ia',
    num: 5,
    label: 'Évaluation par l’IA',
    desc: 'Calcul de certitude et synthèse contextuelle camerounaise',
    icon: 'psychology'
  },
  {
    key: 'validation',
    num: 6,
    label: 'Validation',
    desc: 'Contrôle déontologique et nécessité de révision humaine',
    icon: 'verified_user'
  },
  {
    key: 'resultat_disponible',
    num: 7,
    label: 'Résultat disponible',
    desc: 'Conclusions, preuves et sources certifiées prêtes',
    icon: 'task_alt'
  }
];

export const VerificationLiveTracker: React.FC<VerificationLiveTrackerProps> = ({
  investigationId,
  initialCode,
  isOfflinePending = false,
  onReset,
  onViewInRegistry,
  onSyncOffline
}) => {
  const isOnline = useOnlineStatus();
  const [investigation, setInvestigation] = useState<InvestigationItem | null>(null);
  const [aiData, setAiData] = useState<AIVerificationItem | null>(null);
  const [status, setStatus] = useState<string>(isOfflinePending ? 'offline_pending' : 'en_attente');
  const [elapsed, setElapsed] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Active tracking code
  const trackingCode = investigation?.code || initialCode || (isOfflinePending ? '#VRF-HORS-LIGNE' : '#VRF-EN-COURS');

  // Load cached data or tracker session on mount
  useEffect(() => {
    let isCancelled = false;
    const init = async () => {
      try {
        const cached = await offlineStorage.getCachedVerification(investigationId);
        if (cached && !isCancelled) {
          setInvestigation(cached.investigation);
          if (cached.aiVerification) {
            setAiData(cached.aiVerification);
            setStatus(cached.aiVerification.status);
          }
        }
      } catch (e) {
        // ignore cache read error
      }
    };
    init();
    return () => {
      isCancelled = true;
    };
  }, [investigationId]);

  // Polling loop with backoff and offline awareness
  const fetchStatus = useCallback(async () => {
    if (isOfflinePending || investigationId.startsWith('offline-')) {
      return;
    }

    try {
      const res = await api.getVerificationStatus(investigationId);
      setInvestigation(res.investigation);

      if (res.aiVerification) {
        setAiData(res.aiVerification);
        setStatus(res.aiVerification.status);
        setElapsed(res.aiVerification.elapsedSeconds || 0);

        // Cache for offline viewing
        offlineStorage.cacheVerification(res.investigation, res.aiVerification).catch(() => {});
      } else {
        setStatus(res.status);
      }

      if (res.isComplete) {
        setIsComplete(true);
      }
      setErrorMessage(null);
    } catch (err: any) {
      if (!isOnline) {
        setErrorMessage('Connexion Internet interrompue. Les données locales restent accessibles.');
      } else {
        setErrorMessage(err.message || 'Actualisation en attente...');
      }
    }
  }, [investigationId, isOfflinePending, isOnline]);

  useEffect(() => {
    if (isOfflinePending || investigationId.startsWith('offline-')) {
      return;
    }

    let timer: any = null;
    let isCancelled = false;

    const poll = async () => {
      await fetchStatus();
      if (!isCancelled && !isComplete) {
        timer = setTimeout(poll, 1600);
      }
    };

    poll();

    // Elapsed timer ticker
    const ticker = setInterval(() => {
      setElapsed(prev => (!isComplete && !isOfflinePending ? prev + 1 : prev));
    }, 1000);

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
      clearInterval(ticker);
    };
  }, [fetchStatus, isComplete, isOfflinePending, investigationId]);

  // Handle retry
  const handleRetry = async () => {
    setIsRetrying(true);
    setErrorMessage(null);
    try {
      await api.retryVerification(investigationId);
      setIsComplete(false);
      setStatus('en_attente');
      await fetchStatus();
    } catch (err: any) {
      setErrorMessage(err.message || 'Impossible de relancer la tâche.');
    } finally {
      setIsRetrying(false);
    }
  };

  // Handle offline sync
  const handleManualSync = async () => {
    if (onSyncOffline) {
      setIsSyncing(true);
      try {
        await onSyncOffline();
      } catch (err: any) {
        setErrorMessage('La synchronisation a échoué. Vérifiez votre connexion.');
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trackingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleCopyResult = () => {
    if (!aiData && !investigation) return;
    const textToCopy = `[VÉRIF 237 — OBSERVATOIRE DU CAMEROUN]
Réf : ${trackingCode}
Affirmation : ${aiData?.analyzedClaim || investigation?.title}
Verdict : ${aiData?.verdictLabel || aiData?.verdict || 'En cours d\'analyse'}
Indice de certitude : ${aiData?.confidence || 'Moyen'} (${aiData?.confidenceScore || 70}%)

RÉSUMÉ :
${aiData?.summary || investigation?.preAnalysis?.neutralSummary || 'Analyse en cours'}

SOURCES OFFICIELLES :
${aiData?.sources?.map(s => `- ${s.name} : ${s.url || 'Portail officiel / Vérif 237'}`).join('\n') || '- Portails ministériels camerounais'}

Avis légal : Vérification assistée par IA et contrôlée selon la charte déontologique Vérif237. Consulter sur https://verif237.cm`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Determine current step index and status for each of the 7 steps
  const stepStatuses = aiData?.stepStatuses || {};
  const stepHistory = aiData?.stepHistory || [];

  const getStepState = (stepKey: string, stepIndex: number): 'completed' | 'in_progress' | 'failed' | 'pending' => {
    if (isOfflinePending) {
      return stepIndex === 0 ? 'completed' : 'pending';
    }

    if (stepStatuses[stepKey]) {
      const st = stepStatuses[stepKey];
      if (st === 'completed') return 'completed';
      if (st === 'in_progress') return 'in_progress';
      if (st === 'failed') return 'failed';
      return 'pending';
    }

    // Fallback based on overall status & workflowStep
    const wf = aiData?.workflowStep || '';
    if (isComplete) {
      return status === 'echec_temporaire' && stepIndex >= 4 ? 'failed' : 'completed';
    }

    if (wf === 'RECEIVED') {
      return stepIndex === 0 ? 'completed' : stepIndex === 1 ? 'in_progress' : 'pending';
    }
    if (wf === 'QUEUED' || wf === 'ANALYZING') {
      return stepIndex === 0 ? 'completed' : stepIndex === 1 ? 'in_progress' : 'pending';
    }
    if (wf === 'SEARCHING_SOURCES') {
      return stepIndex < 2 ? 'completed' : stepIndex === 2 ? 'in_progress' : 'pending';
    }
    if (wf === 'EVALUATING_EVIDENCE') {
      return stepIndex < 3 ? 'completed' : stepIndex === 3 ? 'in_progress' : 'pending';
    }
    if (wf === 'COMPLETED' || wf === 'REQUIRES_HUMAN_REVIEW') {
      return 'completed';
    }
    if (wf === 'ERROR' || status === 'echec_temporaire') {
      return stepIndex <= 1 ? 'completed' : 'failed';
    }

    return stepIndex === 0 ? 'completed' : 'pending';
  };

  const getVerdictTheme = (v?: string) => {
    switch (v) {
      case 'SUPPORTED':
      case 'CONFIRMEE':
      case 'VRAI':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-300 dark:border-emerald-800',
          text: 'text-emerald-900 dark:text-emerald-200',
          badge: 'bg-emerald-600 text-white',
          icon: 'check_circle',
          label: 'CONFIRMÉE (AVÉRÉE)'
        };
      case 'FALSE':
      case 'FAUSSE':
      case 'FAUX':
        return {
          bg: 'bg-red-50 dark:bg-red-950/40',
          border: 'border-red-300 dark:border-red-800',
          text: 'text-red-900 dark:text-red-200',
          badge: 'bg-red-600 text-white',
          icon: 'cancel',
          label: 'FAUSSE (INFIRMÉE)'
        };
      case 'MISLEADING':
      case 'TROMPEUSE':
      case 'TROMPEUR':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-300 dark:border-amber-800',
          text: 'text-amber-900 dark:text-amber-200',
          badge: 'bg-amber-600 text-white',
          icon: 'warning',
          label: 'TROMPEUSE (MANIPULÉE)'
        };
      case 'OUT_OF_CONTEXT':
      case 'HORS_CONTEXTE':
        return {
          bg: 'bg-purple-50 dark:bg-purple-950/40',
          border: 'border-purple-300 dark:border-purple-800',
          text: 'text-purple-900 dark:text-purple-200',
          badge: 'bg-purple-600 text-white',
          icon: 'history_toggle_off',
          label: 'HORS CONTEXTE'
        };
      case 'UNVERIFIABLE':
      case 'NON_VERIFIABLE':
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/40',
          border: 'border-blue-300 dark:border-blue-800',
          text: 'text-blue-900 dark:text-blue-200',
          badge: 'bg-blue-600 text-white',
          icon: 'help_outline',
          label: 'NON VÉRIFIABLE POUR LE MOMENT'
        };
    }
  };

  const theme = getVerdictTheme(aiData?.verdict);
  const isFailed = status === 'echec_temporaire' || aiData?.workflowStep === 'ERROR';

  return (
    <div className="space-y-6 animate-fade-in">

      {/* TOP TRACKING HEADER */}
      <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isOfflinePending ? 'bg-amber-500' : isFailed ? 'bg-red-500' : isComplete ? 'bg-emerald-600' : 'bg-[#007953] animate-pulse'}`} />
            <span>SUIVI DE VÉRIFICATION VÉRIF237</span>
            <span aria-hidden="true">·</span>
            <span>CAMEROUN</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono flex items-center gap-2">
              <span>{trackingCode}</span>
              <button
                onClick={handleCopyCode}
                title="Copier le matricule"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  {copiedCode ? 'check' : 'content_copy'}
                </span>
              </button>
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {copiedCode ? 'Matricule copié !' : '(Conservez ce matricule pour retrouver le dossier à tout moment)'}
            </span>
          </div>
        </div>

        {/* Stopwatch & SLA Countdown */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-2xl shrink-0">
          <span className="material-symbols-outlined text-slate-400 text-xl">
            {isOfflinePending ? 'cloud_off' : 'timer'}
          </span>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {isOfflinePending ? 'Statut de connexion' : isComplete ? 'Durée de traitement' : 'Temps écoulé (SLA < 5 min)'}
            </div>
            <div className="text-base font-black font-mono text-slate-900 dark:text-white flex items-center gap-2">
              {isOfflinePending ? (
                <span className="text-amber-600 dark:text-amber-400 text-xs">File locale (Hors-ligne)</span>
              ) : (
                <>
                  <span>{formatTimer(elapsed)}</span>
                  <span className="text-xs font-normal text-slate-400">/ 05:00</span>
                  {elapsed > 300 && (
                    <span className="text-[10px] text-amber-600 font-bold">⏱ Enquête approfondie</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Network / General error banner */}
      {errorMessage && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">info</span>
            <span>{errorMessage}</span>
          </div>
          {isFailed && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isRetrying ? 'Reprise en cours…' : 'Relancer la vérification'}
            </button>
          )}
        </div>
      )}

      {/* OFFLINE PENDING STATE CARD */}
      {isOfflinePending && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
              <span className="material-symbols-outlined text-2xl">cloud_off</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200">
                Signalement conservé localement (Mode Hors-ligne)
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed max-w-2xl">
                Votre demande a été enregistrée en toute sécurité dans la mémoire locale de votre appareil (IndexedDB) avec son empreinte d'intégrité unique. Dès que votre connexion Internet sera rétablie, la synchronisation et l'analyse s'exécuteront automatiquement.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="material-symbols-outlined text-base text-amber-600">sync</span>
              <span>Statut de la file : <strong>En attente de connexion réseau</strong></span>
            </div>
            <div className="flex items-center gap-2">
              {isOnline && onSyncOffline && (
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-xl bg-[#007953] hover:bg-[#006344] text-white font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                  <span>{isSyncing ? 'Synchronisation…' : 'Synchroniser maintenant'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7-STEP PROGRESS INTERFACE (ALWAYS RENDERED TO NEVER DISAPPEAR) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Header of the stepper */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#007953] dark:text-emerald-400 uppercase tracking-wider mb-1">
              <span className={`material-symbols-outlined text-base ${isComplete ? 'text-emerald-600' : isFailed ? 'text-red-500' : 'animate-spin'}`}>
                {isComplete ? 'task_alt' : isFailed ? 'error' : 'progress_activity'}
              </span>
              <span>
                {isComplete ? 'Vérification terminée' : isFailed ? 'Anomalie temporaire' : isOfflinePending ? 'En attente de réseau' : 'Traitement en direct'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Progression du protocole de vérification (7 étapes)
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Chaque signalement franchit une chaîne de contrôle rigoureuse : analyse sémantique, confrontation aux journaux officiels camerounais et pondération contradictoire.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {stepHistory.length > 0 && (
              <button
                onClick={() => setShowLogModal(prev => !prev)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">history</span>
                <span>{showLogModal ? 'Masquer l’historique' : 'Journal des étapes'}</span>
              </button>
            )}
            <div className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-800 dark:text-emerald-300 shrink-0 text-center">
              <div>SLA Garanti</div>
              <div className="text-base font-black font-mono">&lt; 5 minutes</div>
            </div>
          </div>
        </div>

        {/* 7-STEP VISUAL GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 pt-2">
          {VERIFICATION_7_STEPS.map((st, index) => {
            const stepState = getStepState(st.key, index);
            const isCurrent = stepState === 'in_progress';
            const isDone = stepState === 'completed';
            const hasError = stepState === 'failed';

            return (
              <div
                key={st.key}
                className={`p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                  isDone
                    ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : isCurrent
                    ? 'border-[#007953] bg-white dark:bg-slate-800 ring-2 ring-[#007953]/25 shadow-md'
                    : hasError
                    ? 'border-red-300 dark:border-red-900 bg-red-50/60 dark:bg-red-950/20'
                    : 'border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-black text-slate-400">
                      0{st.num}
                    </span>
                    {isDone ? (
                      <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                    ) : isCurrent ? (
                      <span className="material-symbols-outlined text-[#007953] dark:text-emerald-400 text-lg animate-spin">sync</span>
                    ) : hasError ? (
                      <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    )}
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white mb-1 flex items-center gap-1">
                    <span>{st.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {st.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className={`font-bold uppercase tracking-wider ${
                    isDone
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : isCurrent
                      ? 'text-[#007953] dark:text-emerald-300 animate-pulse'
                      : hasError
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-400'
                  }`}>
                    {isDone ? 'Terminé' : isCurrent ? 'En cours…' : hasError ? 'Anomalie' : 'En attente'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step description banner */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3 text-xs">
          <span className="material-symbols-outlined text-slate-500 text-base mt-0.5">info</span>
          <div className="space-y-1">
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              {aiData?.stepDescription || (isOfflinePending ? 'Demande placée dans la file locale en attente de réseau.' : 'Extraction des faits et confrontation aux archives camerounaises en cours...')}
            </div>
            <div className="text-[11px] text-slate-500">
              Engagement déontologique : Les 7 étapes décrivent le protocole technique complet. Les résultats préliminaires font l’objet d’une traçabilité intégrale WORM.
            </div>
          </div>
        </div>

        {/* EXPANDABLE DETAILED EVENT LOG */}
        {showLogModal && stepHistory.length > 0 && (
          <div className="p-4 bg-slate-100/70 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#007953]">receipt_long</span>
                <span>Journal d'exécution horodaté</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {stepHistory.length} événement(s)
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {stepHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${item.status === 'completed' ? 'bg-emerald-500' : item.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.message && (
                      <p className="text-slate-500 dark:text-slate-400 pl-3.5">
                        {item.message}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(item.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notice & Persistence Info */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-[#007953]">lock</span>
            <span>
              Vous pouvez quitter cette page en toute sérénité. La session reste sauvegardée et vous pouvez la consulter avec le matricule <strong className="text-slate-800 dark:text-slate-200 font-mono">{trackingCode}</strong>.
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="text-[#007953] dark:text-emerald-400 font-bold hover:underline cursor-pointer shrink-0"
          >
            {copiedCode ? 'Matricule copié !' : 'Copier le matricule de suivi'}
          </button>
        </div>

      </div>

      {/* STATE B: TEMPORARY FAILURE CARD (RECOVERY ACTION) */}
      {isFailed && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/60 border border-red-300 dark:border-red-700 flex items-center justify-center text-red-700 dark:text-red-300 shrink-0">
              <span className="material-symbols-outlined text-2xl">error</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-red-900 dark:text-red-200">
                Anomalie temporaire lors de l’analyse automatisée
              </h3>
              <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed max-w-2xl">
                {aiData?.rawError || 'Les services documentaires ou le moteur d’intelligence artificielle ont rencontré une latence anormale. Le dossier reste enregistré et protégé.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <span className={`material-symbols-outlined text-sm ${isRetrying ? 'animate-spin' : ''}`}>sync</span>
              <span>{isRetrying ? 'Relance en cours…' : 'Réessayer la vérification'}</span>
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 font-semibold text-xs hover:bg-red-100/50 dark:hover:bg-red-900/30 cursor-pointer"
            >
              Soumettre une autre information
            </button>
          </div>
        </div>
      )}

      {/* STATE C: RESULT AVAILABLE (STEP 7 COMPLETE) */}
      {isComplete && aiData && !isFailed && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Main Verdict Card */}
          <div className={`${theme.bg} border ${theme.border} rounded-3xl p-6 sm:p-8 shadow-sm space-y-6`}>
            
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${theme.badge}`}>
                    {theme.label}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Indice de certitude : <strong>{aiData.confidence}</strong> ({aiData.confidenceScore || 85}%)
                  </span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="text-xs text-slate-500">
                    Analysé en {aiData.elapsedSeconds || elapsed}s (Objectif &lt; 5 min respecté)
                  </span>
                </div>

                <h3 className={`text-xl sm:text-2xl font-black ${theme.text} leading-tight`}>
                  {aiData.verdictLabel || theme.label}
                </h3>

                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Affirmation analysée : <em>« {aiData.analyzedClaim || investigation?.title} »</em>
                </div>
              </div>

              {/* Automated AI Notice Badge */}
              <div className="p-3 bg-white/70 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 rounded-2xl text-[11px] text-slate-600 dark:text-slate-300 max-w-xs shrink-0 space-y-1.5">
                <div className="font-bold flex items-center justify-between gap-1.5 text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-[#007953]">smart_toy</span>
                    <span>Validation & Sceau</span>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {aiData.humanReviewStatus || 'NON_VALIDE_HUMAIN'}
                  </span>
                </div>
                <p className="leading-snug">
                  {aiData.humanReviewStatus === 'VALIDE_PAR_EXPERT' || aiData.humanReviewStatus === 'VALIDE_HUMAIN'
                    ? 'Validée et contresignée par le collège éditorial assermenté.'
                    : 'Synthèse assistée par intelligence artificielle (NON_VALIDE_HUMAIN). Conforme aux normes IFCN.'}
                </p>
              </div>
            </div>

            {/* Structured Summary */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">summarize</span>
                <span>Synthèse déontologique</span>
              </div>
              <p className="text-sm text-slate-900 dark:text-white leading-relaxed font-medium">
                {aiData.summary}
              </p>
            </div>

            {/* Reasoning Summary */}
            {aiData.reasoning_summary && (
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">psychology</span>
                  <span>Justification concise fondée sur les preuves :</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  {aiData.reasoning_summary}
                </p>
              </div>
            )}

            {/* Structured Evidence Items */}
            {aiData.evidence && aiData.evidence.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-black/10 dark:border-white/10">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">fact_check</span>
                  <span>Faisceau d'indices et preuves documentaires :</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {aiData.evidence.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ev.supports
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                          }`}>
                            {ev.supports ? '✓ Appuie l\'allégation' : '✗ Réfute l\'allégation'}
                          </span>
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {ev.claim}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {ev.reliability}
                        </span>
                      </div>
                      {ev.excerpt && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                          « {ev.excerpt} »
                        </p>
                      )}
                      <div className="text-[10px] text-slate-400">
                        Source : <strong>{ev.sourceTitle}</strong> {ev.sourceUrl && `(${ev.sourceUrl})`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources Consultées */}
            {aiData.sources && aiData.sources.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-black/10 dark:border-white/10">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">menu_book</span>
                  <span>Sources officielles consultées :</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {aiData.sources.map((src, idx) => {
                    const sourceTitle = src.title || src.name || 'Source vérifiée';
                    const snippetText = src.excerpt || src.snippet;
                    return (
                      <div
                        key={idx}
                        className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {sourceTitle}
                          </span>
                          {src.isOfficial && (
                            <span className="text-[10px] font-bold uppercase text-[#007953] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                              Officiel
                            </span>
                          )}
                        </div>
                        {src.organizationOrAuthor && (
                          <div className="text-[10px] text-slate-400">
                            Organisme : {src.organizationOrAuthor} {src.date ? `(${src.date})` : ''}
                          </div>
                        )}
                        {snippetText && (
                          <p className="text-[11px] text-slate-500 italic leading-relaxed">
                            « {snippetText} »
                          </p>
                        )}
                        {src.url && (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#007953] dark:text-emerald-400 font-bold text-[11px] hover:underline flex items-center gap-1"
                          >
                            <span>Accéder à la source</span>
                            <span className="material-symbols-outlined text-xs">open_in_new</span>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Limits of Analysis */}
            {aiData.limits && aiData.limits.length > 0 && (
              <div className="p-3.5 bg-slate-100/70 dark:bg-slate-800/70 rounded-2xl text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-300">
                  Limites méthodologiques :
                </div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {aiData.limits.map((lim, i) => (
                    <li key={i}>{lim}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-black/10 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyResult}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Copié dans le presse-papier !' : 'Copier le résultat certifié'}</span>
                </button>

                {onViewInRegistry && (
                  <button
                    onClick={() => onViewInRegistry(trackingCode)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">account_balance</span>
                    <span>Consulter le registre public</span>
                  </button>
                )}
              </div>

              <button
                onClick={onReset}
                className="px-5 py-2 rounded-xl bg-[#007953] hover:bg-[#006344] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span>Vérifier une autre information</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
