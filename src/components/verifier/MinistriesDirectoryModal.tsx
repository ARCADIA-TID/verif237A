import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface MinistriesDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMinistry?: (ministryAcronym: string) => void;
}

export const MinistriesDirectoryModal: React.FC<MinistriesDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectMinistry
}) => {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.getMinistries({ search, category })
      .then(res => setInstitutions(res.institutions))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [isOpen, search, category]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#007953] dark:text-emerald-300 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">account_balance</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Répertoire Officiel & Annuaire des 37 Ministères et Institutions du Cameroun
              </h3>
              <p className="text-[11px] text-slate-500">
                Canaux certifiés pour confrontation contradictoire des sources primaires
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

        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
            <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par ministère, acronyme, domaine de compétence..."
              className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
          >
            <option value="all">Toutes catégories</option>
            <option value="Sécurité & Défense">Sécurité & Défense</option>
            <option value="Éducation & Formation">Éducation & Formation</option>
            <option value="Économie & Finances">Économie & Finances</option>
            <option value="Santé & Social">Santé & Social</option>
            <option value="Souveraineté & Justice">Souveraineté & Justice</option>
            <option value="Numérique & Médias">Numérique & Médias</option>
          </select>
        </div>

        {/* List of Ministries */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <span className="w-6 h-6 border-2 border-[#007953] border-t-transparent rounded-full animate-spin" />
              <span>Chargement du répertoire institutionnel...</span>
            </div>
          ) : institutions.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <span className="material-symbols-outlined text-3xl mb-1">search_off</span>
              <p>Aucune institution ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {institutions.map((inst) => (
                <div
                  key={inst.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[#007953] dark:text-emerald-400 text-sm">
                          {inst.acronym}
                        </span>
                        {inst.verifiedDomain && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            <span>.cm officiel</span>
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {inst.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
                      {inst.fullName}
                    </h4>

                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {inst.competence}
                    </p>

                    <div className="mt-3 space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <span className="material-symbols-outlined text-xs text-[#007953]">call</span>
                        <span className="font-mono">{inst.pressContact}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <span className="material-symbols-outlined text-xs text-blue-500">mail</span>
                        <span className="font-mono">{inst.pressEmail}</span>
                      </div>
                    </div>

                    {/* Latest official notices */}
                    {inst.latestBulletins && inst.latestBulletins.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 text-[10px]">
                        <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Dernier communiqué vérifié :
                        </span>
                        <div className="text-slate-700 dark:text-slate-300 italic">
                          « {inst.latestBulletins[0].title} » ({inst.latestBulletins[0].date})
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                    <a
                      href={inst.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#007953] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Consulter portail officiel</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>

                    {onSelectMinistry && (
                      <button
                        onClick={() => {
                          onSelectMinistry(inst.acronym);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-200 cursor-pointer"
                      >
                        Associer au dossier
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold cursor-pointer text-xs"
          >
            Fermer l'annuaire
          </button>
        </div>

      </div>
    </div>
  );
};
