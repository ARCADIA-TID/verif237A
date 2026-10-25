import React, { useState } from 'react';
import { api } from '../../services/api';

interface ReverseSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialImageUrl?: string;
  onSaveReference?: (engineName: string, refUrl: string) => void;
}

export const ReverseSearchModal: React.FC<ReverseSearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  initialImageUrl = '',
  onSaveReference
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [targets, setTargets] = useState<{ engine: string; url: string; description: string }[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLaunchSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.runReverseSearch({ query, imageUrl });
      setTargets(res.targets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#007953] dark:text-emerald-300 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">travel_explore</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Méta-Moteur de Recherche Inversée Forensique
              </h3>
              <p className="text-[11px] text-slate-500">
                Lancement simultané Google Lens, TinEye, Yandex et Internet Archive Wayback
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

        {/* Search form */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          
          <form onSubmit={handleLaunchSearch} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mots-clés ou allégation textuelle à confronter :
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex : Faux concours douane cameroun recrutement mobile money 2025"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                URL de l'image ou de la capture suspecte (optionnel) :
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://.../capture_whatsapp.jpg"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#007953] hover:bg-[#006344] text-white font-bold flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">search</span>
              <span>{loading ? 'Génération des faisceaux...' : 'Générer les requêtes multi-moteurs'}</span>
            </button>
          </form>

          {/* Engines List */}
          {targets.length > 0 && (
            <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px] tracking-wider">
                Moteurs prêts pour investigation :
              </h4>

              {targets.map((tgt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#007953]">radar</span>
                      <span>{tgt.engine}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {tgt.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={tgt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600 font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <span>Lancer recherche</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>

                    {onSaveReference && (
                      <button
                        onClick={() => onSaveReference(tgt.engine, tgt.url)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                        title="Consigner cette référence dans la fiche d'investigation"
                      >
                        <span className="material-symbols-outlined text-xs">bookmark_add</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
            <strong>Rappel déontologique :</strong> La recherche inversée est une méthode d'orientation. Une concordance d'image nécessite toujours l'analyse du contexte et de la date originale avant de conclure à un recyclage d'infox.
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold cursor-pointer text-xs"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
