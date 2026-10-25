import React, { useState } from 'react';
import { api, ApiKeyItem } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeyItem[];
  onRefresh: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  onRefresh
}) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [service, setService] = useState('Passerelle Institutionnelle');
  const [newlyCreatedSecret, setNewlyCreatedSecret] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsCreating(true);

    try {
      const res = await api.createApiKey({
        name,
        service,
        permissions: ['read:verifications', 'read:official_acts'],
        actorName: user?.name || 'Dr. F. Kamga'
      });

      setNewlyCreatedSecret(res.rawSecret);
      setName('');
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la génération de la clé.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Confirmez-vous la révocation irréversible de cette clé API ?')) return;
    try {
      await api.revokeApiKey(id, user?.name);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyToClipboard = () => {
    if (!newlyCreatedSecret) return;
    navigator.clipboard.writeText(newlyCreatedSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">vpn_key</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Gestion des Clés API & Passerelles Partenaires
              </h3>
              <p className="text-[11px] text-slate-500">
                Accès programmatique chiffré pour les ministères et plateformes médias certifiées
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Secret One-Time Reveal Banner */}
          {newlyCreatedSecret && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold">
                <span className="material-symbols-outlined text-base">vpn_key_alert</span>
                <span>Clé Secrète Générée (Affichage Unique)</span>
              </div>
              <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80">
                Copiez immédiatement ce secret. Pour des impératifs de sécurité déontologique, ce jeton ne sera plus jamais consultable en clair par la suite :
              </p>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] select-all">
                <span className="flex-1 text-slate-900 dark:text-slate-100 break-all">{newlyCreatedSecret}</span>
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 rounded-lg bg-[#007953] hover:bg-[#006344] text-white font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">{copied ? 'done' : 'content_copy'}</span>
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Form Create */}
          <form onSubmit={handleCreate} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#007953]">add_circle</span>
              <span>Générer un nouveau jeton d'accès API</span>
            </h4>

            {errorMessage && (
              <div className="p-2.5 bg-red-50 text-red-700 rounded-xl">{errorMessage}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Nom du projet ou de l'application
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Widget Portail MINSANTE"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Service bénéficiaire
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-semibold"
                >
                  <option value="Passerelle Institutionnelle">Passerelle Institutionnelle (Ministère / Direction)</option>
                  <option value="Flux Médias Partenaires">Flux Médias Partenaires (Radio / TV / Presse Web)</option>
                  <option value="API Enquêteurs Terrain">API Enquêteurs Terrain (Application Mobile)</option>
                  <option value="Veille Cryptographique WORM">Veille Cryptographique WORM</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 rounded-xl bg-[#007953] hover:bg-[#006344] text-white font-bold flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">key</span>
                <span>{isCreating ? 'Génération...' : 'Créer le jeton'}</span>
              </button>
            </div>
          </form>

          {/* List of Keys */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-wider">
              Clés enregistrées ({apiKeys.length})
            </h4>

            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{key.name}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                      key.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}>
                      {key.status === 'active' ? 'Active' : 'Révoquée'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{key.service}</div>
                  <div className="font-mono text-[10px] text-slate-400 mt-1">
                    Empreinte : {key.maskedKey} • Dernier usage : {key.lastUsedAt}
                  </div>
                </div>

                {key.status === 'active' && (
                  <button
                    onClick={() => handleRevoke(key.id)}
                    className="px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 font-bold self-start sm:self-auto cursor-pointer"
                  >
                    Révoquer
                  </button>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
