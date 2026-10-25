import React, { useState } from 'react';
import { OfficialAct, NavPage } from '../types';
import { MOCK_OFFICIAL_ACTS } from '../data/mockData';

interface OfficialActsViewProps {
  setCurrentPage: (page: NavPage) => void;
  onOpenSuggestModal: (mode: 'suggerer' | 'signaler_faux', docTitle?: string) => void;
  onOpenPdfModal: (type: 'dossier' | 'index_actes') => void;
}

export const OfficialActsView: React.FC<OfficialActsViewProps> = ({
  setCurrentPage,
  onOpenSuggestModal,
  onOpenPdfModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('certif-desc');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownload = (filename: string) => {
    setDownloadNotice(`Téléchargement de « ${filename} » démarré...`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  // Filter logic
  const filteredActs = MOCK_OFFICIAL_ACTS.filter((act) => {
    const matchesSearch =
      searchTerm === '' ||
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.feeNote.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMinistry =
      selectedMinistry === '' || act.category === selectedMinistry;

    const matchesStatus =
      selectedStatus === '' || act.status === selectedStatus;

    return matchesSearch && matchesMinistry && matchesStatus;
  });

  return (
    <div className="flex flex-col w-full space-y-8 animate-fade-in">
      {/* Editorial Header Section & Multi-criteria Search Engine */}
      <section className="relative bg-white dark:bg-[#111c2e] rounded-2xl p-6 md:p-10 shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-gradient-to-br from-teal-500/10 to-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl flex flex-col space-y-3">
          <div className="flex items-center gap-2 text-[#005c55] dark:text-[#2dd4bf] text-xs md:text-sm font-bold tracking-wider uppercase">
            <span className="material-symbols-outlined text-[18px]">gavel</span>
            <span>Base Publique Certifiée • République du Cameroun</span>
          </div>

          <h1 className="font-headline font-extrabold text-2xl md:text-4xl text-slate-900 dark:text-white tracking-tight">
            Répertoire National des Informations & Actes Officiels Vérifiés
          </h1>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            Consultez les textes authentiques, les calendriers officiels d’examens et les procédures administratives certifiées conformes par nos équipes documentaires.
          </p>
        </div>

        {/* Multi-criteria Filter Engine */}
        <div className="relative z-10 mt-6 bg-[#edf4ff] dark:bg-[#182438] rounded-xl p-4 md:p-5 shadow-inner border border-slate-200/60 dark:border-slate-700/60 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch">
            <div className="flex-1 flex items-center bg-white dark:bg-[#111c2e] rounded-lg px-4 py-2.5 shadow-sm border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-[#005c55]">
              <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 mr-2 text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un arrêté, une circulaire, une démarche..."
                className="w-full bg-transparent border-0 outline-none text-xs md:text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Effacer la recherche"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {}}
              className="bg-[#005c55] hover:bg-[#0f766e] text-white px-6 py-2.5 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm shrink-0 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">manage_search</span>
              <span>Explorer les actes</span>
            </button>
          </div>

          {/* Select Filter Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Filter: Organisme */}
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Organisme Émetteur
              </label>
              <div className="relative">
                <select
                  value={selectedMinistry}
                  onChange={(e) => setSelectedMinistry(e.target.value)}
                  className="w-full bg-white dark:bg-[#111c2e] text-slate-900 dark:text-slate-100 text-xs rounded-lg py-2 px-3 pr-8 appearance-none shadow-sm border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-[#005c55]"
                >
                  <option value="">Tous ministères & agences</option>
                  <option value="DGSN">DGSN (Sûreté Nationale)</option>
                  <option value="MINESUP">MINESUP (Enseignement Supérieur)</option>
                  <option value="OBC">OBC & GCE Board</option>
                  <option value="MINSANTE">MINSANTE (Santé Publique)</option>
                  <option value="MINFOPRA">MINFOPRA (Fonction Publique)</option>
                  <option value="MINFI">MINFI (Finances)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Filter: Région */}
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Région Territoriale
              </label>
              <div className="relative">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-white dark:bg-[#111c2e] text-slate-900 dark:text-slate-100 text-xs rounded-lg py-2 px-3 pr-8 appearance-none shadow-sm border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-[#005c55]"
                >
                  <option value="">National (Toutes régions)</option>
                  <option value="Centre">Centre (Yaoundé)</option>
                  <option value="Littoral">Littoral (Douala)</option>
                  <option value="Ouest">Ouest (Bafoussam)</option>
                  <option value="Sud">Sud (Ebolowa)</option>
                  <option value="Nord">Nord (Garoua)</option>
                  <option value="Extreme-Nord">Extrême-Nord (Maroua)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Filter: Statut */}
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Statut Légal
              </label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-white dark:bg-[#111c2e] text-slate-900 dark:text-slate-100 text-xs rounded-lg py-2 px-3 pr-8 appearance-none shadow-sm border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-[#005c55]"
                >
                  <option value="">Tous statuts</option>
                  <option value="en-vigueur">En vigueur (Actif)</option>
                  <option value="limite-proche">Date limite proche</option>
                  <option value="archive">Expiré / Archivé</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Filter: Ordre */}
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Ordre de Classement
              </label>
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full bg-white dark:bg-[#111c2e] text-slate-900 dark:text-slate-100 text-xs rounded-lg py-2 px-3 pr-8 appearance-none shadow-sm border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-[#005c55]"
                >
                  <option value="certif-desc">Certification Vérif 237 (Récents)</option>
                  <option value="parution-desc">Date de publication officielle</option>
                  <option value="consult-desc">Nombre de consultations</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Quick Filter Tag Buttons */}
          <div className="flex items-center flex-wrap gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Recherches citoyennes fréquentes :
            </span>
            {['CNI Biométrique', "Bourses d'études 2025", 'Dates Bac & Probatoire', 'Quittance fiscale'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchTerm(tag.includes('CNI') ? 'CNI' : tag.includes('Bourses') ? 'Bourses' : tag.includes('Dates') ? 'Baccalauréat' : 'Quittance')}
                className="bg-white dark:bg-[#111c2e] hover:bg-slate-100 dark:hover:bg-slate-800 text-[#30628a] dark:text-[#60a5fa] text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Bannière de Repère Civique Antifraude (Loi N° 2018/011) */}
      <aside className="relative bg-[#cde5ff]/30 dark:bg-[#104a71]/25 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#a1d1ff]/50 dark:border-slate-700 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#30628a] text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div className="flex flex-col space-y-0.5">
            <span className="font-headline font-bold text-sm md:text-base text-[#001d32] dark:text-[#cde5ff]">
              Conseil Pratique de Salubrité Publique
            </span>
            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
              Une démarche officielle a toujours un tarif et des pièces fixés par la loi camerounaise. Si un intermédiaire ou un démarcheur vous demande des frais supplémentaires, consultez la fiche officielle correspondante ci-dessous.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 bg-white/80 dark:bg-[#111c2e] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="material-symbols-outlined text-[#005c55] dark:text-[#2dd4bf] text-[18px]">policy</span>
          <span className="text-xs text-[#005c55] dark:text-[#2dd4bf] font-bold">Loi N° 2018/011</span>
        </div>
      </aside>

      {/* Grille des Fiches Documentaires Certifiées */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005c55] dark:text-[#2dd4bf] text-[22px]">folder_check</span>
            <h2 className="font-headline font-bold text-lg md:text-xl text-slate-900 dark:text-white">
              Actes Administratifs & Procédures Certifiés
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Affichage de {filteredActs.length} fiches prioritaires certifiées
          </span>
        </div>

        {/* 2-Column Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredActs.map((act) => (
            <article
              key={act.id}
              className="bg-white dark:bg-[#111c2e] rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow border border-slate-200/80 dark:border-slate-800"
            >
              <div className="flex flex-col space-y-4">
                {/* Top Row: Badge et Date */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      act.status === 'en-vigueur'
                        ? 'bg-[#9cf2e8]/40 dark:bg-teal-950 text-[#005c55] dark:text-[#2dd4bf] border border-[#005c55]/20 dark:border-teal-800'
                        : act.status === 'limite-proche'
                        ? 'bg-[#ffdcc3]/50 dark:bg-amber-950 text-[#7d4200] dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {act.status === 'en-vigueur' ? 'check_circle' : act.status === 'limite-proche' ? 'alarm' : 'archive'}
                    </span>
                    <span>{act.statusLabel}</span>
                  </span>

                  <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[13px]">verified_user</span>
                    <span>{act.certifiedDate}</span>
                  </span>
                </div>

                {/* Titre & Organisme */}
                <div>
                  <span className="text-xs font-bold text-[#30628a] dark:text-[#60a5fa] uppercase tracking-wider block">
                    {act.organization}
                  </span>
                  <h3 className="font-headline font-bold text-base md:text-lg text-slate-900 dark:text-white mt-1 leading-snug">
                    {act.title}
                  </h3>
                </div>

                {/* Warning callout if any */}
                {act.alertWarning && (
                  <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 text-xs font-bold">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                      <span>{act.alertWarning}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Ce concours est définitivement clos. Les messages WhatsApp annonçant un "rattrapage de candidatures" sont des tentatives d'escroquerie.
                    </p>
                  </div>
                )}

                {/* Détails clés / Tarifs légaux */}
                <div className="bg-[#edf4ff] dark:bg-[#182438] rounded-xl p-3.5 space-y-1 border border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Frais légaux confirmés :</span>
                    <span className="text-xs md:text-sm font-bold font-mono text-[#005c55] dark:text-[#2dd4bf] bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded">
                      {act.fee}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {act.feeNote}
                  </p>
                </div>

                {/* Liste pièces requises sommaire */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
                    {act.status === 'limite-proche' ? 'Périodes certifiées :' : 'Pièces exigibles :'}
                  </span>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 pl-4 list-disc marker:text-[#005c55]">
                    {act.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer Card */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs font-mono">
                  <span className="material-symbols-outlined text-[15px]">fingerprint</span>
                  <span className="truncate max-w-[160px]">{act.reference}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(act.downloadName)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[#30628a] dark:text-[#60a5fa] transition-colors border border-slate-200 dark:border-slate-700"
                    title="Télécharger la fiche officielle scellée"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (act.id === 'act-4') {
                        onOpenSuggestModal('signaler_faux', act.title);
                      } else {
                        onOpenPdfModal('index_actes');
                      }
                    }}
                    className={`inline-flex items-center gap-1 text-xs font-bold px-3.5 py-2 rounded-lg shadow-xs transition-colors active:scale-95 ${
                      act.id === 'act-4'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        : 'bg-[#005c55] hover:bg-[#0f766e] text-white'
                    }`}
                  >
                    <span>{act.actionText}</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Floating notice if file was downloaded */}
      {downloadNotice && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-xs font-medium shadow-2xl flex items-center gap-2 animate-fade-in border border-slate-700">
          <span className="material-symbols-outlined text-[16px] text-teal-400">download_done</span>
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Barre d'outils et Pagination Accessible */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#111c2e] rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenPdfModal('index_actes')}
            className="inline-flex items-center gap-2 bg-[#edf4ff] dark:bg-[#182438] hover:bg-[#dfe9f7] text-slate-800 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          >
            <span className="material-symbols-outlined text-[18px] text-red-600">picture_as_pdf</span>
            <span>Télécharger l'index complet (PDF)</span>
          </button>
          <button
            type="button"
            onClick={() => handleDownload('flux-nouveaux-actes.xml')}
            className="inline-flex items-center gap-2 bg-[#edf4ff] dark:bg-[#182438] hover:bg-[#dfe9f7] text-slate-800 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-600">rss_feed</span>
            <span>Flux des nouveaux actes</span>
          </button>
        </div>

        {/* Pagination Buttons */}
        <nav aria-label="Pagination des actes certifiés" className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPageNum === 1}
            onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 disabled:opacity-40 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentPageNum(1)}
            className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center ${
              currentPageNum === 1
                ? 'bg-[#005c55] text-white'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            1
          </button>
          <button
            type="button"
            onClick={() => setCurrentPageNum(2)}
            className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center ${
              currentPageNum === 2
                ? 'bg-[#005c55] text-white'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            2
          </button>
          <button
            type="button"
            onClick={() => setCurrentPageNum(3)}
            className="w-8 h-8 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center"
          >
            3
          </button>
          <span className="px-1 text-slate-400 text-xs">...</span>
          <button
            type="button"
            className="w-8 h-8 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center"
          >
            14
          </button>
          <button
            type="button"
            onClick={() => setCurrentPageNum((p) => p + 1)}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </nav>
      </div>

      {/* Boîte d'Alerte et de Suggestion Citoyenne */}
      <section className="bg-teal-50/60 dark:bg-teal-950/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-teal-200/80 dark:border-teal-900 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#005c55] text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[26px]">post_add</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-headline font-bold text-base md:text-lg text-[#005c55] dark:text-[#2dd4bf]">
              Une information officielle manque à ce répertoire ?
            </h3>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Suggérez l’ajout d’un texte, d'un formulaire ou d’une procédure administrative. Notre équipe de documentalistes et de juristes se chargera d'authentifier les sources auprès des ministères compétents.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => onOpenSuggestModal('suggerer')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#005c55] hover:bg-[#0f766e] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_task</span>
            <span>Suggérer un document</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenSuggestModal('signaler_faux')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-[#111c2e] hover:bg-slate-100 dark:hover:bg-slate-800 text-[#30628a] dark:text-[#60a5fa] text-xs font-bold px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">help_center</span>
            <span>Signaler un faux arrêté</span>
          </button>
        </div>
      </section>
    </div>
  );
};
