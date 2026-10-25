/**
 * VÉRIF237 — Moteur de Persistance Hors Ligne (IndexedDB)
 * 
 * Assure la continuité de service en cas de réseau faible ou inexistant :
 * - Stockage sécurisé des demandes hors ligne en attente de synchronisation
 * - Conservation des fiches d'investigation et résultats consultés pour lecture offline
 * - Persistance de l'état de suivi actif pour empêcher tout démontage prématuré lors d'un rechargement
 * - Gestion des clés d'idempotence pour prévenir les soumissions en double
 */

import { InvestigationItem, AIVerificationItem } from './api';

export interface OfflinePendingSubmission {
  id: string; // ex: VRF-LOCAL-1739...
  trackingCode: string;
  idempotencyKey: string;
  status: 'offline_pending';
  payload: {
    text: string;
    url?: string;
    sourceType?: string;
    region?: string;
    submittedBy?: string;
    authorOrSource?: string;
    contextDate?: string;
  };
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

export interface CachedVerificationRecord {
  id: string;
  code: string;
  investigation: InvestigationItem;
  aiVerification?: AIVerificationItem;
  cachedAt: string;
}

export interface ActiveTrackerSession {
  investigationId: string;
  trackingCode: string;
  lastUpdated: string;
  cachedSnapshot?: any;
}

const DB_NAME = 'verif237_offline_db';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error("IndexedDB n'est pas supporté par ce navigateur."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('pending_submissions')) {
        const store = db.createObjectStore('pending_submissions', { keyPath: 'id' });
        store.createIndex('idempotencyKey', 'idempotencyKey', { unique: true });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('cached_verifications')) {
        const store = db.createObjectStore('cached_verifications', { keyPath: 'id' });
        store.createIndex('code', 'code', { unique: false });
        store.createIndex('cachedAt', 'cachedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('tracker_session')) {
        db.createObjectStore('tracker_session', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const offlineStorage = {
  /**
   * Enregistre une soumission en mode hors ligne
   */
  async saveOfflineSubmission(payload: OfflinePendingSubmission['payload']): Promise<OfflinePendingSubmission> {
    const db = await openDB();
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `#VRF-LOCAL-${new Date().getFullYear()}-${randomSuffix}`;
    const id = `offline-${timestamp}-${randomSuffix}`;
    
    // Génération d'une clé d'idempotence UUID v4
    const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `idem-${timestamp}-${Math.random().toString(36).slice(2, 10)}`;

    const record: OfflinePendingSubmission = {
      id,
      trackingCode,
      idempotencyKey,
      status: 'offline_pending',
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('pending_submissions', 'readwrite');
      const store = tx.objectStore('pending_submissions');
      const req = store.put(record);

      req.onsuccess = () => {
        // Enregistrer également cette demande comme suivi actif par défaut
        offlineStorage.setActiveTrackerSession(record.id, record.trackingCode, {
          id: record.id,
          code: record.trackingCode,
          title: `« ${payload.text.slice(0, 100)} »`,
          status: 'offline_pending',
          submittedAt: record.createdAt,
          description: payload.text
        }).catch(() => {});

        resolve(record);
      };
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Récupère toutes les soumissions en attente de synchronisation
   */
  async getPendingSubmissions(): Promise<OfflinePendingSubmission[]> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('pending_submissions', 'readonly');
        const store = tx.objectStore('pending_submissions');
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  },

  /**
   * Récupère une soumission en attente par ID ou Code
   */
  async getPendingSubmission(idOrCode: string): Promise<OfflinePendingSubmission | null> {
    try {
      const list = await this.getPendingSubmissions();
      return list.find(item => item.id === idOrCode || item.trackingCode === idOrCode) || null;
    } catch {
      return null;
    }
  },

  /**
   * Supprime une soumission de la file hors ligne une fois synchronisée
   */
  async removeOfflineSubmission(id: string): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('pending_submissions', 'readwrite');
        const store = tx.objectStore('pending_submissions');
        const req = store.delete(id);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Ignorer
    }
  },

  /**
   * Met en cache un résultat vérifié pour consultation ultérieure hors ligne
   */
  async cacheVerification(investigation: InvestigationItem, aiVerification?: AIVerificationItem): Promise<void> {
    try {
      const db = await openDB();
      const record: CachedVerificationRecord = {
        id: investigation.id,
        code: investigation.code,
        investigation,
        aiVerification: aiVerification || investigation.aiVerification,
        cachedAt: new Date().toISOString()
      };

      return new Promise((resolve, reject) => {
        const tx = db.transaction('cached_verifications', 'readwrite');
        const store = tx.objectStore('cached_verifications');
        const req = store.put(record);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Ignorer si échec de mise en cache
    }
  },

  /**
   * Récupère un résultat mis en cache par identifiant ou code
   */
  async getCachedVerification(idOrCode: string): Promise<CachedVerificationRecord | null> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('cached_verifications', 'readonly');
        const store = tx.objectStore('cached_verifications');
        const req = store.get(idOrCode);

        req.onsuccess = () => {
          if (req.result) {
            resolve(req.result);
            return;
          }
          // Recherche par code
          const index = store.index('code');
          const codeReq = index.get(idOrCode);
          codeReq.onsuccess = () => resolve(codeReq.result || null);
          codeReq.onerror = () => resolve(null);
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  /**
   * Récupère la liste de tous les dossiers mis en cache localement
   */
  async getAllCachedVerifications(): Promise<CachedVerificationRecord[]> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('cached_verifications', 'readonly');
        const store = tx.objectStore('cached_verifications');
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  },

  /**
   * Mémorise la session de suivi actif (pour survivre aux rechargements de page)
   */
  async setActiveTrackerSession(investigationId: string, trackingCode: string, cachedSnapshot?: any): Promise<void> {
    try {
      const db = await openDB();
      const sessionData = {
        key: 'active',
        investigationId,
        trackingCode,
        lastUpdated: new Date().toISOString(),
        cachedSnapshot
      };

      return new Promise((resolve, reject) => {
        const tx = db.transaction('tracker_session', 'readwrite');
        const store = tx.objectStore('tracker_session');
        const req = store.put(sessionData);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback localStorage
      try {
        localStorage.setItem('verif237_active_tracker', JSON.stringify({ investigationId, trackingCode }));
      } catch {}
    }
  },

  /**
   * Récupère la session de suivi actif
   */
  async getActiveTrackerSession(): Promise<ActiveTrackerSession | null> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction('tracker_session', 'readonly');
        const store = tx.objectStore('tracker_session');
        const req = store.get('active');

        req.onsuccess = () => {
          if (req.result) {
            resolve({
              investigationId: req.result.investigationId,
              trackingCode: req.result.trackingCode,
              lastUpdated: req.result.lastUpdated,
              cachedSnapshot: req.result.cachedSnapshot
            });
          } else {
            // Fallback localStorage
            try {
              const raw = localStorage.getItem('verif237_active_tracker');
              if (raw) resolve(JSON.parse(raw));
              else resolve(null);
            } catch {
              resolve(null);
            }
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  /**
   * Efface la session de suivi actif (lorsque l'utilisateur clique sur "Nouvelle vérification")
   */
  async clearActiveTrackerSession(): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction('tracker_session', 'readwrite');
      tx.objectStore('tracker_session').delete('active');
    } catch {}
    try {
      localStorage.removeItem('verif237_active_tracker');
    } catch {}
  }
};
