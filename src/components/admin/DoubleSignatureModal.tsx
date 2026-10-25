import React, { useState } from 'react';
import { api, DoubleSignatureItem } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface DoubleSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: DoubleSignatureItem[];
  onRefresh: () => void;
}

export const DoubleSignatureModal: React.FC<DoubleSignatureModalProps> = ({
  isOpen,
  onClose,
  requests,
  onRefresh
}) => {
  const { user } = useAuth();
  const [signingId, setSigningId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSign = async (reqItem: DoubleSignatureItem) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSigningId(reqItem.id);

    try {
      const res = await api.signDoubleSignature(reqItem.id, {
        userId: user?.id || 'user-2',
        userName: user?.name || 'Emmanuel Mballa',
        actorRole: user?.roleLabel || 'Réviseur Sénior'
      });

      setSuccessMessage(res.message);
      onRefresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la signature.');
    } finally {
      setSigningId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">shield</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Contrôle Collégial & Double Signature Déontologique
              </h3>
              <p className="text-[11px] text-slate-500">
                Norme IFCN Cameroun : Deux approbateurs distincts requis pour tout scellement public
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">warning</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <span className="material-symbols-outlined text-3xl mb-1">done_all</span>
                <p>Aucune procédure en attente de double signature.</p>
              </div>
            ) : (
              requests.map((r) => {
                const isPendingSig1 = !r.signature1;
                const isPendingSig2 = r.signature1 && !r.signature2;
                const isSameUserAsSig1 = r.signature1?.userId === (user?.id || 'user-2');

                return (
                  <div
                    key={r.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                            {r.targetType.toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'approuve'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {r.status === 'approuve' ? 'Scellé & Approuvé' : isPendingSig1 ? 'En attente Signature 1' : 'En attente Signature 2 (Contre-expertise)'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {r.targetTitle}
                        </h4>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Demandé par : {r.requestedBy} • {new Date(r.requestedAt).toLocaleTimeString('fr-FR')}
                        </div>
                      </div>

                      {/* Action buttons */}
                      {r.status !== 'approuve' && (
                        <div className="shrink-0">
                          {isPendingSig2 && isSameUserAsSig1 ? (
                            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 inline-block">
                              🔒 En attente d'un 2nd réviseur distinct
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSign(r)}
                              disabled={signingId === r.id}
                              className="px-4 py-2 rounded-xl bg-[#007953] hover:bg-[#006344] text-white font-bold flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-sm">draw</span>
                              <span>
                                {signingId === r.id
                                  ? 'Signature en cours...'
                                  : isPendingSig1
                                  ? 'Apposer Signature 1'
                                  : 'Contresigner & Sceller (Signature 2)'}
                              </span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Signatures status block */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 font-mono text-[10px]">
                      <div className={`p-2.5 rounded-xl border ${
                        r.signature1
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 border-dashed border-slate-300 text-slate-400'
                      }`}>
                        <div className="font-bold">SIGNATURE 1 (INITIATEUR)</div>
                        {r.signature1 ? (
                          <>
                            <div>{r.signature1.userName}</div>
                            <div className="truncate text-slate-500">Hash : {r.signature1.signatureHash.slice(0, 18)}...</div>
                          </>
                        ) : (
                          <div>En attente de signature</div>
                        )}
                      </div>

                      <div className={`p-2.5 rounded-xl border ${
                        r.signature2
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 border-dashed border-slate-300 text-slate-400'
                      }`}>
                        <div className="font-bold">SIGNATURE 2 (CONTRE-EXPERTISE)</div>
                        {r.signature2 ? (
                          <>
                            <div>{r.signature2.userName}</div>
                            <div className="truncate text-slate-500">Hash : {r.signature2.signatureHash.slice(0, 18)}...</div>
                          </>
                        ) : (
                          <div>Relecteur indépendant requis</div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
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
