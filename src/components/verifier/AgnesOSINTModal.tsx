import React, { useState } from 'react';
import { api } from '../../services/api';

interface AgnesOSINTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachDecree?: (decreeTitle: string) => void;
}

export const AgnesOSINTModal: React.FC<AgnesOSINTModalProps> = ({
  isOpen,
  onClose,
  onAttachDecree
}) => {
  const [query, setQuery] = useState('timbre fiscal 2500 FCFA');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.runAgnesSearch(query);
      setResult(res);
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
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">psychology</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Module AgNES — Intelligence Juridique & Rapprochement des Textes
              </h3>
              <p className="text-[11px] text-slate-500">
                Algorithme National d'Enquête & Scellement (Confrontation Journal Officiel Cameroun)
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
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          
          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Requête d'authentification juridique (Loi, Décret, Arrêté, Rumeur) :
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ex : Arrêté tarif timbre fiscal 2500 FCFA MINFI"
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#007953] hover:bg-[#006344] text-white font-bold rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Analyse...' : 'Interroger AgNES'}
                </button>
              </div>
            </div>
          </form>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
            <span>Suggestions rapides :</span>
            {['CNI 2800 FCFA', 'Dispense police master 2', 'Baccalauréat 2025 dates', 'Paludisme gratuité'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuery(s);
                  api.runAgnesSearch(s).then(r => setResult(r));
                }}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Result view */}
          {result && (
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-300 flex items-center justify-between">
                <div className="font-semibold">
                  Moteur : {result.engineVersion} • {result.jurisdiction}
                </div>
                <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  {result.rumorIndexScore}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px] tracking-wider">
                  Textes de loi et décrets concordants au Journal Officiel :
                </h4>

                {result.matchedDecrees.length === 0 ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center text-slate-500">
                    Aucun acte officiel ne corrobore cette allégation dans le Journal Officiel. Indice fort de faux arrêté ou rumeur apocryphe.
                  </div>
                ) : (
                  result.matchedDecrees.map((d: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {d.title}
                        </span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                          {d.journalOfficielRef}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {d.summaryLegal}
                      </p>
                      <div className="text-[10px] text-slate-400">
                        Promulgué le : {d.datePromulgation} • Émetteur : {d.organization}
                      </div>

                      {onAttachDecree && (
                        <div className="pt-2 text-right">
                          <button
                            onClick={() => {
                              onAttachDecree(`${d.title} (${d.journalOfficielRef})`);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#007953] hover:bg-[#006344] text-white font-bold text-[10px] cursor-pointer"
                          >
                            Insérer comme preuve formelle
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="text-[10px] text-slate-400 italic">
                {result.republicanEthicNote}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold cursor-pointer text-xs"
          >
            Fermer AgNES
          </button>
        </div>

      </div>
    </div>
  );
};
