import React, { useState, useEffect } from 'react';
import { NavPage, SubmissionReport } from '../types';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { api, InvestigationItem } from '../services/api';
import { VerificationLiveTracker } from '../components/verification/VerificationLiveTracker';
import { offlineStorage, OfflinePendingSubmission } from '../services/offlineStorage';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface ReportSubmissionViewProps {
  setCurrentPage: (page: NavPage) => void;
  onSubmitSuccess?: (report: SubmissionReport) => void;
  onSelectInformation?: (id: string) => void;
}

export const ReportSubmissionView: React.FC<ReportSubmissionViewProps> = ({
  setCurrentPage,
  onSubmitSuccess,
  onSelectInformation
}) => {
  const { user, isAuthenticated, setRedirectAfterLogin } = useAuth();
  const { t } = useI18n();
  const isOnline = useOnlineStatus();

  // Navigation tab within the verification view
  const [activeTab, setActiveTab] = useState<'submit' | 'track' | 'history'>('submit');

  // Form states
  const [supportType, setSupportType] = useState<'text' | 'link' | 'screenshot' | 'pdf'>('text');
  const [messageContent, setMessageContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [authorOrSource, setAuthorOrSource] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [region, setRegion] = useState('National / Tout le Cameroun');
  const [firstSeenDate, setFirstSeenDate] = useState(new Date().toISOString().slice(0, 10));
  const [channel, setChannel] = useState('Groupe ou transfert WhatsApp');
  const [civicPledge, setCivicPledge] = useState(false);

  // Active tracking state
  const [activeVerificationId, setActiveVerificationId] = useState<string | null>(null);
  const [activeTrackingCode, setActiveTrackingCode] = useState<string | null>(null);
  const [isOfflinePending, setIsOfflinePending] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState<OfflinePendingSubmission[]>([]);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Lookup form state (for Tab "Suivre une demande")
  const [lookupCodeInput, setLookupCodeInput] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // User past verifications
  const [userVerifications, setUserVerifications] = useState<InvestigationItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load tracker session or URL param + offline queue on mount
  useEffect(() => {
    let isCancelled = false;

    const restoreSession = async () => {
      // 1. Check URL query param ?track=
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const trackCode = urlParams.get('track');
        if (trackCode) {
          const res = await api.trackVerificationByCode(trackCode);
          if (!isCancelled && res.investigation) {
            setActiveVerificationId(res.investigation.id);
            setActiveTrackingCode(res.investigation.code);
            return;
          }
        }
      } catch (e) {
        // ignore
      }

      // 2. Check IndexedDB active tracker session
      try {
        const session = await offlineStorage.getActiveTrackerSession();
        if (session && !isCancelled) {
          setActiveVerificationId(session.investigationId);
          setActiveTrackingCode(session.trackingCode);
          if (session.investigationId.startsWith('offline-')) {
            setIsOfflinePending(true);
          }
        }
      } catch (e) {
        // ignore
      }

      // 3. Load pending offline submissions
      try {
        const pending = await offlineStorage.getPendingSubmissions();
        if (!isCancelled) {
          setPendingSubmissions(pending);
        }
      } catch (e) {}
    };

    restoreSession();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Load user's history when clicking history tab
  useEffect(() => {
    if (activeTab === 'history' && user?.name) {
      setHistoryLoading(true);
      api.getMyVerifications(user.name)
        .then(res => {
          setUserVerifications(res.verifications);
        })
        .catch(() => {})
        .finally(() => setHistoryLoading(false));
    }
  }, [activeTab, user?.name]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">verified_user</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {t('verify.auth_required_title')}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            {t('verify.auth_required_desc')}
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => {
                setRedirectAfterLogin('verifier');
                setCurrentPage('auth');
              }}
              className="w-full py-2.5 rounded-xl bg-[#007953] hover:bg-[#006344] text-white text-xs font-bold transition-all shadow cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>{t('verify.login_to_submit')}</span>
            </button>
            <button
              onClick={() => setCurrentPage('accueil')}
              className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              {t('nav.back_to_home')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleExampleInsert = () => {
    setMessageContent("« Communiqué Spécial MINFOPRA : Recrutement exceptionnel de 3 500 instituteurs de l'enseignement technique. Dépôt des dossiers auprès de M. Abena au 677 82 14 00 avec 12 500 FCFA de frais de quittance par Orange Money ou MTN MoMo. »");
    setSourceUrl('https://whatsapp.com/channel/fake-concours-cameroun');
    setAuthorOrSource('Prétendu délégué MINFOPRA M. Abena');
    setChannel('Groupe ou transfert WhatsApp');
    setRegion('Centre (Yaoundé)');
  };

  const handleSyncPending = async () => {
    if (!navigator.onLine) return;
    const pending = await offlineStorage.getPendingSubmissions();
    if (pending.length === 0) return;

    let syncedCount = 0;
    for (const item of pending) {
      try {
        const res = await api.submitReport({
          ...item.payload,
          idempotencyKey: item.idempotencyKey
        });
        await offlineStorage.removeOfflineSubmission(item.id);
        syncedCount++;

        // If currently viewing this offline task, upgrade to server version!
        if (activeVerificationId === item.id) {
          const newId = res.investigationId || res.investigation.id;
          const newCode = res.trackingCode || res.investigation.code;
          setActiveVerificationId(newId);
          setActiveTrackingCode(newCode);
          setIsOfflinePending(false);
          await offlineStorage.setActiveTrackerSession(newId, newCode, res.investigation);
          try {
            window.history.replaceState(null, '', `?track=${encodeURIComponent(newCode)}`);
          } catch {}
        }
      } catch (err) {
        console.warn('Sync failed for item', item.id, err);
      }
    }

    const updated = await offlineStorage.getPendingSubmissions();
    setPendingSubmissions(updated);
    if (syncedCount > 0) {
      setSyncNotice(`${syncedCount} signalement(s) hors ligne synchronisé(s) avec succès !`);
      setTimeout(() => setSyncNotice(null), 4000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!civicPledge) return;
    setErrorMessage(null);
    setIsSubmitting(true);

    const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `idem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const payload = {
      text: messageContent,
      url: sourceUrl || undefined,
      sourceType: supportType === 'screenshot' || supportType === 'pdf' ? 'Capture ou document multimédia' : supportType === 'link' ? 'Lien Web / Réseau Social' : 'Texte WhatsApp',
      region,
      submittedBy: user?.name ? `${user.name} (${user.roleLabel})` : 'Citoyen Connecté',
      authorOrSource: authorOrSource || undefined,
      contextDate: firstSeenDate
    };

    // If offline or network unavailable, save directly to IndexedDB
    if (!navigator.onLine) {
      try {
        const savedOffline = await offlineStorage.saveOfflineSubmission(payload);
        setActiveVerificationId(savedOffline.id);
        setActiveTrackingCode(savedOffline.trackingCode);
        setIsOfflinePending(true);
        await offlineStorage.setActiveTrackerSession(savedOffline.id, savedOffline.trackingCode, {
          id: savedOffline.id,
          code: savedOffline.trackingCode,
          title: `« ${payload.text.slice(0, 100)} »`,
          status: 'offline_pending',
          submittedAt: savedOffline.createdAt,
          description: payload.text
        });
        const updatedPending = await offlineStorage.getPendingSubmissions();
        setPendingSubmissions(updatedPending);
        setIsSubmitting(false);
        return;
      } catch (err: any) {
        setErrorMessage("Impossible d'enregistrer le signalement hors ligne.");
        setIsSubmitting(false);
        return;
      }
    }

    // Online submission
    try {
      const res = await api.submitReport({
        ...payload,
        idempotencyKey
      });

      const invId = res.investigationId || res.investigation.id;
      const code = res.trackingCode || res.investigation.code;
      setActiveVerificationId(invId);
      setActiveTrackingCode(code);
      setIsOfflinePending(false);

      // Persist tracker session and update URL history
      await offlineStorage.setActiveTrackerSession(invId, code, res.investigation);
      try {
        window.history.replaceState(null, '', `?track=${encodeURIComponent(code)}`);
      } catch {}

      setIsSubmitting(false);

      if (onSubmitSuccess) {
        onSubmitSuccess({
          id: res.investigation.id,
          code: res.investigation.code,
          formatType: supportType === 'screenshot' || supportType === 'pdf' ? 'media' : supportType === 'link' ? 'link' : 'text',
          text: messageContent,
          url: sourceUrl || undefined,
          fileName: selectedFile || undefined,
          region,
          firstSeenDate,
          channel,
          civicPledge: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'en_attente'
        });
      }
    } catch (err: any) {
      // If error was due to network drop during request, fallback gracefully to offline queue
      if (!navigator.onLine || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        try {
          const savedOffline = await offlineStorage.saveOfflineSubmission(payload);
          setActiveVerificationId(savedOffline.id);
          setActiveTrackingCode(savedOffline.trackingCode);
          setIsOfflinePending(true);
          await offlineStorage.setActiveTrackerSession(savedOffline.id, savedOffline.trackingCode);
          const updatedPending = await offlineStorage.getPendingSubmissions();
          setPendingSubmissions(updatedPending);
          setIsSubmitting(false);
          return;
        } catch (inner) {}
      }
      setErrorMessage(err.message || 'Erreur lors de la transmission du signalement.');
      setIsSubmitting(false);
    }
  };

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    const code = lookupCodeInput.trim();
    if (!code) return;

    setLookupLoading(true);
    try {
      const res = await api.trackVerificationByCode(code);
      setActiveVerificationId(res.investigation.id);
      setActiveTrackingCode(res.investigation.code);
      setIsOfflinePending(false);
      await offlineStorage.setActiveTrackerSession(res.investigation.id, res.investigation.code, res.investigation);
      try {
        window.history.replaceState(null, '', `?track=${encodeURIComponent(res.investigation.code)}`);
      } catch {}
      setActiveTab('submit'); // Switch to main tracker display
    } catch (err: any) {
      // Check offline cache as fallback
      const cached = await offlineStorage.getCachedVerification(code);
      if (cached) {
        setActiveVerificationId(cached.id);
        setActiveTrackingCode(cached.code);
        setIsOfflinePending(false);
        setActiveTab('submit');
      } else {
        setLookupError(err.message || `Aucun dossier ne correspond à ${code}.`);
      }
    } finally {
      setLookupLoading(false);
    }
  };

  const handleReset = async () => {
    await offlineStorage.clearActiveTrackerSession();
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch {}
    setActiveVerificationId(null);
    setActiveTrackingCode(null);
    setIsOfflinePending(false);
    setMessageContent('');
    setSourceUrl('');
    setAuthorOrSource('');
    setSelectedFile(null);
    setCivicPledge(false);
    setActiveTab('submit');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c1420] text-slate-800 dark:text-slate-100 transition-colors py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP BAR BADGES */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#007953]" />
            <span>UNITÉ CITOYENNE DE RECOUPEMENT • OBJECTIF ACCÉLÉRÉ &lt; 5 MIN</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <span className="material-symbols-outlined text-sm text-[#007953]">lock</span>
            <span>Session sécurisée de {user?.name} · Loi N° 2010/012</span>
          </div>
        </div>

        {/* HEADER TITLE */}
        <div className="max-w-4xl space-y-2">
          <div className="text-xs font-bold text-[#007953] dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">fact_check</span>
            SYSTÈME DE VÉRIFICATION RAPIDE ASSISTÉ PAR IA
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-headline">
            Vérifier une information ou un acte suspect
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Soumettez une rumeur WhatsApp, un faux concours, une quittance mobile ou un visuel viral. Notre intelligence artificielle analyse et recoupe l’allégation avec un objectif de réponse en moins de 5 minutes.
          </p>
        </div>

        {/* TAB SWITCHER */}
        {!activeVerificationId && (
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('submit')}
              className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'submit'
                  ? 'border-[#007953] text-[#007953] dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>Nouvelle vérification accélérée</span>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'track'
                  ? 'border-[#007953] text-[#007953] dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-base">pin</span>
              <span>Suivre une demande (#VRF)</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'border-[#007953] text-[#007953] dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-base">history</span>
              <span>Mes demandes ({userVerifications.length})</span>
            </button>
          </div>
        )}

        {/* IF AN ACTIVE VERIFICATION IS CURRENTLY TRACKED */}
        {activeVerificationId ? (
          <VerificationLiveTracker
            investigationId={activeVerificationId}
            initialCode={activeTrackingCode || undefined}
            isOfflinePending={isOfflinePending}
            onReset={handleReset}
            onSyncOffline={handleSyncPending}
            onViewInRegistry={(code) => {
              if (onSelectInformation) onSelectInformation(activeVerificationId);
              else setCurrentPage('actualites');
            }}
          />
        ) : (
          <>
            {/* Sync feedback notice */}
            {syncNotice && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>{syncNotice}</span>
                </div>
              </div>
            )}

            {/* Offline Pending Queue Notice */}
            {pendingSubmissions.length > 0 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-lg text-amber-600">cloud_queue</span>
                  <div>
                    <strong>{pendingSubmissions.length} signalement(s) hors ligne enregistré(s)</strong>
                    <div className="text-[11px] text-amber-700 dark:text-amber-300">
                      Vos demandes sont conservées en sécurité dans ce navigateur et prêtes à être transmises.
                    </div>
                  </div>
                </div>
                {isOnline && (
                  <button
                    onClick={handleSyncPending}
                    className="px-4 py-2 rounded-xl bg-[#007953] hover:bg-[#006344] text-white font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-sm">sync</span>
                    <span>Synchroniser tout</span>
                  </button>
                )}
              </div>
            )}

            {/* TAB 1: SUBMIT NEW VERIFICATION */}
            {activeTab === 'submit' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form Column (7 Cols) */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                  
                  {errorMessage && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-2xl text-xs text-red-700 dark:text-red-300 mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">error</span>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Step 1: Support Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#007953] text-white text-xs font-bold flex items-center justify-center">1</span>
                          <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                            Nature du support à examiner
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">Canal de réception</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => setSupportType('text')}
                          className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            supportType === 'text'
                              ? 'border-[#007953] bg-emerald-50 dark:bg-emerald-950/40 text-[#007953] dark:text-emerald-300 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">chat</span>
                          <span>Texte / WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSupportType('link')}
                          className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            supportType === 'link'
                              ? 'border-[#007953] bg-emerald-50 dark:bg-emerald-950/40 text-[#007953] dark:text-emerald-300 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">link</span>
                          <span>Lien Web / Post</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSupportType('screenshot')}
                          className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            supportType === 'screenshot'
                              ? 'border-[#007953] bg-emerald-50 dark:bg-emerald-950/40 text-[#007953] dark:text-emerald-300 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">photo_camera</span>
                          <span>Capture d'écran</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSupportType('pdf')}
                          className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            supportType === 'pdf'
                              ? 'border-[#007953] bg-emerald-50 dark:bg-emerald-950/40 text-[#007953] dark:text-emerald-300 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">description</span>
                          <span>Document PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* Message content textarea */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Texte exact de l'information à vérifier *
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleExampleInsert}
                            className="text-[#007953] dark:text-emerald-400 text-[11px] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">auto_awesome</span>
                            <span>Insérer exemple type</span>
                          </button>
                          <span className="text-[11px] text-slate-400">{messageContent.length} / 5 000 caractères</span>
                        </div>
                      </div>

                      <textarea
                        rows={4}
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Collez ici le texte intégral du message, de la publication Facebook, de l'annonce WhatsApp ou de la rumeur..."
                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-[#007953] transition-colors resize-none"
                        required
                        minLength={10}
                        maxLength={5000}
                      />
                    </div>

                    {/* Optional Fields Grid: Author & Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Auteur ou source présumée <span className="font-normal text-slate-400">(facultatif)</span>
                        </label>
                        <input
                          type="text"
                          value={authorOrSource}
                          onChange={(e) => setAuthorOrSource(e.target.value)}
                          placeholder="Ex: Page Facebook 'Infos Concours', M. Abena..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-[#007953]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Lien web de publication <span className="font-normal text-slate-400">(facultatif)</span>
                        </label>
                        <input
                          type="url"
                          value={sourceUrl}
                          onChange={(e) => setSourceUrl(e.target.value)}
                          placeholder="Ex: https://facebook.com/..., https://t.me/..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-[#007953]"
                        />
                      </div>
                    </div>

                    {/* Step 2: Context territorial */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-[#007953] text-white text-xs font-bold flex items-center justify-center">2</span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                          Contexte territorial et date
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Région d'observation
                          </label>
                          <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none"
                          >
                            <option value="National / Tout le Cameroun">National / Tout le Cameroun</option>
                            <option value="Centre (Yaoundé)">Centre (Yaoundé)</option>
                            <option value="Littoral (Douala)">Littoral (Douala)</option>
                            <option value="Ouest (Bafoussam)">Ouest (Bafoussam)</option>
                            <option value="Nord-Ouest (Bamenda)">Nord-Ouest (Bamenda)</option>
                            <option value="Sud-Ouest (Buea)">Sud-Ouest (Buea)</option>
                            <option value="Extrême-Nord (Maroua)">Extrême-Nord (Maroua)</option>
                            <option value="Nord (Garoua)">Nord (Garoua)</option>
                            <option value="Adamaoua (Ngaoundéré)">Adamaoua (Ngaoundéré)</option>
                            <option value="Est (Bertoua)">Est (Bertoua)</option>
                            <option value="Sud (Ebolowa)">Sud (Ebolowa)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Date constatée
                          </label>
                          <input
                            type="date"
                            value={firstSeenDate}
                            onChange={(e) => setFirstSeenDate(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none"
                          >
                          </input>
                        </div>
                      </div>
                    </div>

                    {/* Civic Pledge Checkbox */}
                    <div>
                      <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                        <input
                          type="checkbox"
                          checked={civicPledge}
                          onChange={(e) => setCivicPledge(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-[#007953] focus:ring-[#007953]"
                          required
                        />
                        <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          <strong>Engagement civique & conformité à la charte :</strong><br />
                          Je certifie que cette information relève de l'intérêt public camerounais. Je comprends que l'analyse automatisée par IA sera délivrée avec un objectif de moins de 5 minutes, avant examen par le collège déontologique.
                        </span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || !civicPledge}
                        className="w-full py-3.5 rounded-2xl bg-[#007953] hover:bg-[#006344] active:bg-[#004e35] text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-lg">bolt</span>
                        <span>
                          {isSubmitting
                            ? 'Lancement de l’analyse accélérée...'
                            : 'Lancer la vérification accélérée (Objectif < 5 min)'}
                        </span>
                      </button>
                    </div>

                  </form>
                </div>

                {/* Right Info Column (5 Cols) */}
                <div className="lg:col-span-5 space-y-5 text-xs">
                  
                  {/* SLA Target Banner */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-6 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-[#007953] dark:text-emerald-300 font-extrabold uppercase text-[11px]">
                      <span className="material-symbols-outlined text-lg">speed</span>
                      <span>ENGAGEMENT DE SERVICE VÉRIF 237</span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Objectif technique : Moins de 5 minutes
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      L'intelligence artificielle dédiée exécute en arrière-plan la détection des entités administratives, le croisement avec les arrêtés du Journal Officiel et l'examen des indicateurs de fraude.
                    </p>
                    <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between font-mono text-[11px]">
                      <span>Délai médian mesuré :</span>
                      <strong className="text-[#007953] dark:text-emerald-400">45 secondes</strong>
                    </div>
                  </div>

                  {/* 4 Steps Explainer */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3.5">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      Déroulement de l'analyse automatique
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">Compréhension de l'affirmation</div>
                          <div className="text-[11px] text-slate-500">Extraction des faits vérifiables et des dates clés.</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">Recherche des sources officielles</div>
                          <div className="text-[11px] text-slate-500">Confrontation aux 37 ministères camerounais.</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">Comparaison des preuves</div>
                          <div className="text-[11px] text-slate-500">Détection des contradictions et quittances illégales.</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#007953] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                        <div>
                          <div className="font-bold text-[#007953] dark:text-emerald-400">Verdict & Limites claires</div>
                          <div className="text-[11px] text-slate-500">Classification argumentée sans hallucination.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Anti-Scam Reminder */}
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-3xl p-5 space-y-2">
                    <div className="flex items-center gap-1.5 text-red-700 dark:text-red-300 font-bold uppercase text-[11px]">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      <span>Rappel Anti-Fraude Cameroun</span>
                    </div>
                    <p className="text-red-900 dark:text-red-200 text-xs leading-relaxed">
                      Aucun concours d'État (Police, ENAM, Douanes, MINFOPRA) ne réclame de versement par Orange Money ou MTN MoMo. Tout message exigeant un tel paiement est une tentative d'arnaque.
                    </p>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: TRACK BY CODE (#VRF-XXXX) */}
            {activeTab === 'track' && (
              <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[#007953] dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                    <span className="material-symbols-outlined text-2xl">pin</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Retrouver une demande de vérification
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Saisissez votre matricule unique de suivi (ex : <code className="font-bold text-[#007953]">#VRF-2025-8842</code>) pour consulter le statut ou le résultat de l'analyse.
                  </p>
                </div>

                {lookupError && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    <span>{lookupError}</span>
                  </div>
                )}

                <form onSubmit={handleLookupSubmit} className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={lookupCodeInput}
                      onChange={(e) => setLookupCodeInput(e.target.value)}
                      placeholder="#VRF-2025-XXXX ou identifiant"
                      className="flex-1 p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl font-mono text-sm text-slate-900 dark:text-white outline-none focus:border-[#007953]"
                      required
                    />
                    <button
                      type="submit"
                      disabled={lookupLoading}
                      className="px-6 py-3.5 rounded-2xl bg-[#007953] hover:bg-[#006344] text-white text-xs font-bold transition-all shadow cursor-pointer disabled:opacity-50"
                    >
                      {lookupLoading ? 'Recherche...' : 'Consulter'}
                    </button>
                  </div>
                </form>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
                  Vous n'avez pas de matricule ? Les demandes soumises lors de votre session sont enregistrées dans l'onglet « Mes demandes ».
                </div>
              </div>
            )}

            {/* TAB 3: USER PAST VERIFICATIONS */}
            {activeTab === 'history' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Historique de vos vérifications
                    </h2>
                    <p className="text-xs text-slate-500">
                      Demandes transmises par votre compte civique ({user?.name}).
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="px-4 py-2 rounded-xl bg-[#007953] text-white text-xs font-bold hover:bg-[#006344] cursor-pointer"
                  >
                    + Nouvelle demande
                  </button>
                </div>

                {historyLoading ? (
                  <div className="p-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-3xl animate-spin mb-2">sync</span>
                    <p className="text-xs">Chargement de votre historique...</p>
                  </div>
                ) : userVerifications.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <span className="material-symbols-outlined text-3xl mb-2">inbox</span>
                    <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">Aucune demande enregistrée sous ce profil.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Soumettez votre premier signalement pour initier une analyse assistée par IA.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userVerifications.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#007953] dark:text-emerald-400">{item.code}</span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="text-slate-400">{item.timeAgo}</span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="text-slate-500">{item.sourceType}</span>
                          </div>
                          <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                            {item.title}
                          </div>
                          {item.aiVerification?.verdictLabel && (
                            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                              Verdict IA : {item.aiVerification.verdictLabel}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setActiveVerificationId(item.id);
                            setActiveTrackingCode(item.code);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold shrink-0 cursor-pointer self-start sm:self-auto"
                        >
                          Consulter résultat
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
