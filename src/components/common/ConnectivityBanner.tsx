import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { offlineStorage, OfflinePendingSubmission } from '../../services/offlineStorage';
import { api } from '../../services/api';

export const ConnectivityBanner: React.FC<{ onSyncSuccess?: () => void }> = ({ onSyncSuccess }) => {
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Monitor pending submissions
  const refreshPendingCount = async () => {
    try {
      const items = await offlineStorage.getPendingSubmissions();
      setPendingCount(items.length);
    } catch {
      setPendingCount(0);
    }
  };

  useEffect(() => {
    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 4000);
    return () => clearInterval(interval);
  }, []);

  // Track reconnection
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setJustReconnected(false);
    } else if (wasOffline) {
      setJustReconnected(true);
      // Auto-sync pending submissions on reconnection
      handleSyncAll();
      const timer = setTimeout(() => {
        setJustReconnected(false);
        setWasOffline(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  const handleSyncAll = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncFeedback(null);

    try {
      const items: OfflinePendingSubmission[] = await offlineStorage.getPendingSubmissions();
      if (items.length === 0) {
        setIsSyncing(false);
        return;
      }

      let successCount = 0;
      for (const item of items) {
        try {
          const res = await api.submitReport({
            ...item.payload,
            idempotencyKey: item.idempotencyKey
          });

          // Once confirmed by server, update local session and remove from pending queue
          await offlineStorage.removeOfflineSubmission(item.id);
          await offlineStorage.cacheVerification(res.investigation);
          
          // If active tracker was pointing to this local id, migrate to server investigation id
          const active = await offlineStorage.getActiveTrackerSession();
          if (active && (active.investigationId === item.id || active.trackingCode === item.trackingCode)) {
            await offlineStorage.setActiveTrackerSession(res.investigationId || res.investigation.id, res.trackingCode);
          }

          successCount++;
        } catch (err: any) {
          console.warn(`Sync failed for item ${item.id}:`, err);
        }
      }

      await refreshPendingCount();
      if (successCount > 0) {
        setSyncFeedback(`${successCount} demande(s) synchronisée(s) avec succès avec le serveur !`);
        if (onSyncSuccess) onSyncSuccess();
        setTimeout(() => setSyncFeedback(null), 4000);
      }
    } catch (err: any) {
      setSyncFeedback('Échec de la synchronisation automatique. Réessayez manuellement.');
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && !justReconnected && pendingCount === 0 && !syncFeedback) {
    return null;
  }

  return (
    <aside aria-label="État de la connexion et synchronisation" className="sticky top-0 z-40 w-full text-xs font-semibold shadow-md transition-all">
      {/* 1. Offline Mode Active */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-amber-700">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base animate-pulse">cloud_off</span>
            <span>
              <strong>Mode hors ligne actif :</strong> Connexion Internet interrompue ou instable au Cameroun. Vos consultations utilisent les données locales en cache.
            </span>
          </div>
          {pendingCount > 0 && (
            <div className="bg-amber-800/80 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
              <span>{pendingCount} demande(s) enregistrée(s) localement en attente de réseau</span>
            </div>
          )}
        </div>
      )}

      {/* 2. Reconnection Banner */}
      {isOnline && justReconnected && (
        <div className="bg-emerald-700 text-white px-4 py-2 flex items-center justify-between gap-2 border-b border-emerald-800 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">cloud_sync</span>
            <span>
              <strong>Connexion rétablie !</strong> Synchronisation automatique des données et du suivi en cours...
            </span>
          </div>
          {isSyncing && (
            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
          )}
        </div>
      )}

      {/* 3. Pending Submissions Notice (when online but items are still in queue) */}
      {isOnline && !justReconnected && pendingCount > 0 && (
        <div className="bg-blue-700 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-blue-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">sync_problem</span>
            <span>
              {pendingCount} demande(s) créée(s) hors ligne en attente de synchronisation avec les serveurs de Vérif 237.
            </span>
          </div>
          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="px-3 py-1 rounded-lg bg-white text-blue-900 hover:bg-blue-50 font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                <span>Synchronisation...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xs">sync</span>
                <span>Synchroniser maintenant</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Feedback Toast Banner */}
      {syncFeedback && (
        <div className="bg-slate-900 text-white px-4 py-2 text-center text-xs border-b border-slate-800 animate-fade-in">
          {syncFeedback}
        </div>
      )}
    </aside>
  );
};
