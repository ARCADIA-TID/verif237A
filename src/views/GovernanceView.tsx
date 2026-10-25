import React, { useState } from 'react';
import { NavPage } from '../types';

interface GovernanceViewProps {
  setCurrentPage: (page: NavPage) => void;
  onOpenSuggestModal: () => void;
}

export const GovernanceView: React.FC<GovernanceViewProps> = ({
  setCurrentPage,
  onOpenSuggestModal
}) => {
  const [rectificationModalOpen, setRectificationModalOpen] = useState(false);
  const [rectificationSent, setRectificationSent] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <button onClick={() => setCurrentPage('accueil')} className="hover:text-emerald-700">Accueil</button>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">Gouvernance & Charte d'Éthique</span>
        </div>

        {/* Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-sm">balance</span>
            Neutralité • Rigueur • Indépendance Républicaine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Charte de Gouvernance & d'Éthique Civique
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
            Vérif 237 opère sous mandat citoyen d'intérêt public. Notre seule allégeance va à la vérité des faits, 
            à l'exactitude des textes légaux de la République du Cameroun et à la protection des droits des usagers.
          </p>
        </div>

        {/* 5 Pillars of Trust */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined">gavel</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              1. Non-Partisanerie & Équidistance Politique
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Aucun membre de notre rédaction ne peut détenir de mandat électif ou de responsabilité active dans un parti politique. 
              Toute déclaration ou rumeur fait l'objet de la même rigueur d'instruction, quel que soit le bord de son auteur.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined">menu_book</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              2. Primauté des Sources Officielles Primaires
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Nous n'affirmons rien sur la foi d'une simple rumeur d'antenne. 
              Chaque verdict s'appuie sur la confrontation directe avec les arrêtés publiés au Journal Officiel, 
              le quotidien national Cameroon Tribune et les démentis signés des ministres en exercice.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              3. Double Relecture Collégiale Obligatoire
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Aucun dossier ne peut être publié sans la validation conjointe d'un expert forensique (analyse des métadonnées) 
              et d'un juriste réviseur d'État (validation des visas de textes de loi applicables au Cameroun).
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined">published_with_changes</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              4. Politique Transparente de Droit de Réponse
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Si un élément factuel nouveau et authentifié est apporté, notre collège réexamine le dossier sous 48 heures. 
              Toute modification de verdict est signalée de façon visible dans l'historique WORM immuable.
            </p>
          </div>

        </div>

        {/* Scientific Committee & Institutional Backing */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm mb-12">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-2">
            <span className="material-symbols-outlined text-sm">groups</span>
            Gouvernance Collégiale
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Conseil d'Orientation Civique & Scientifique
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            L'indépendance de Vérif 237 est garantie par un conseil consultatif pluraliste composé d'universitaires en droit public, 
            d'ingénieurs en cybersécurité et de doyens du journalisme d'investigation camerounais issus des dix régions administratives.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <div className="font-bold text-slate-900 dark:text-white">Pôle Juridique & Textes</div>
              <div className="text-[11px] text-slate-500 mt-1">Confrontation avec le Code Pénal, le Code Général des Impôts et la Constitution.</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <div className="font-bold text-slate-900 dark:text-white">Pôle OSINT & Forensique</div>
              <div className="text-[11px] text-slate-500 mt-1">Analyse des fichiers EXIF, inversion d'images InVID et cartographie satellitaire.</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <div className="font-bold text-slate-900 dark:text-white">Réseau Correspondants Régionaux</div>
              <div className="text-[11px] text-slate-500 mt-1">Enquêtes directes auprès des préfectures, commissariats et délégations ministérielles.</div>
            </div>
          </div>
        </div>

        {/* Rectification Request Box */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold mb-1">
              Vous représentez une institution citée ou souhaitez signaler une inexactitude ?
            </h3>
            <p className="text-xs text-slate-300">
              Formulez une demande de réexamen déontologique avec pièces justificatives officielles scannées.
            </p>
          </div>
          <button
            onClick={() => setRectificationModalOpen(true)}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors shadow flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">edit_note</span>
            <span>Déposer une demande de réexamen</span>
          </button>
        </div>

        {/* Modal for Rectification */}
        {rectificationModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 text-slate-900 dark:text-white">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-base">Demande de Réexamen Factuel</h3>
                <button onClick={() => setRectificationModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {rectificationSent ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-emerald-600 mb-2">check_circle</span>
                  <div className="font-bold text-sm">Demande Transmise au Collège Déontologique</div>
                  <div className="text-xs text-slate-500 mt-1">Délai d'instruction garanti : 48 heures ouvrées.</div>
                  <button
                    onClick={() => {
                      setRectificationSent(false);
                      setRectificationModalOpen(false);
                    }}
                    className="mt-6 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-xs font-semibold"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setRectificationSent(true);
                  }}
                  className="space-y-4 pt-4 text-xs"
                >
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Référence du dossier contesté (ex: #VRF-237-7729)
                    </label>
                    <input
                      type="text"
                      placeholder="#VRF-237-XXXX"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Organisme émetteur ou Identité de l'autorité requérante
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Direction de la Communication, MINFI"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Motif détaillé de la contestation et pièces probantes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Indiquez le numéro de l'acte au Journal Officiel ou joignez la référence du communiqué contradictoire..."
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRectificationModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-600 transition-colors"
                    >
                      Transmettre la Requête
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
