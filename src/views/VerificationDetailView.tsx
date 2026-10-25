import React, { useState, useEffect } from 'react';
import { findVerificationById, MOCK_DETAILED_DOSSIER, ALL_VERIFICATION_DOSSIERS } from '../data/mockData';
import { NavPage, VerificationCase } from '../types';
import { useI18n } from '../context/I18nContext';

interface VerificationDetailViewProps {
  informationId?: string;
  setCurrentPage: (page: NavPage) => void;
  onSelectInformation?: (id: string) => void;
  onOpenPdfModal: (type: 'dossier' | 'index_actes') => void;
  onOpenSuggestModal: (mode: 'suggerer' | 'signaler_faux', docTitle?: string) => void;
  previousPage?: NavPage;
}

export const VerificationDetailView: React.FC<VerificationDetailViewProps> = ({
  informationId = 'dossier-7729',
  setCurrentPage,
  onSelectInformation,
  onOpenPdfModal,
  onOpenSuggestModal,
  previousPage = 'actualites'
}) => {
  const { t } = useI18n();
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [searchSidebarQuery, setSearchSidebarQuery] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [dossier, setDossier] = useState<VerificationCase | null>(null);

  useEffect(() => {
    setLoading(true);
    // Simulate real network fetch with smooth fast feedback
    const timer = setTimeout(() => {
      const found = findVerificationById(informationId);
      setDossier(found || null);
      setLoading(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [informationId]);

  const handleShareWhatsApp = () => {
    if (!dossier) return;
    const text = `🛑 ALERTE VÉRIF 237 : ${dossier.title} — Statut : ${dossier.verdictLabel}. Consultez le démenti officiel sur Vérif 237 : ${window.location.origin}/information/${dossier.id}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setCopyFeedback("Alerte WhatsApp ouverte pour diffusion !");
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleCopyLink = () => {
    if (!dossier) return;
    const url = `${window.location.origin}/information/${dossier.id}`;
    navigator.clipboard?.writeText(url);
    setCopyFeedback("Lien officiel copié dans le presse-papiers !");
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopyFeedback("Empreinte SHA-256 copiée !");
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  // 1. LOADING STATE SKELETON
  if (loading) {
    return (
      <div className="flex flex-col w-full max-w-7xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
          </div>
          <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="h-20 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl"></div>
          <div className="grid grid-cols-4 gap-3 pt-4">
            <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
          </div>
        </div>
        <div className="text-center py-6 text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
          <span className="material-symbols-outlined animate-spin text-emerald-600">progress_activity</span>
          <span>{t('loading.title')}</span>
        </div>
      </div>
    );
  }

  // 2. NOT FOUND (404) STATE
  if (!dossier) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
          <span className="material-symbols-outlined text-4xl">search_off</span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase mb-4">
          <span>{t('not_found.code')}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
          {t('not_found.title')} : <span className="font-mono text-red-600 dark:text-red-400">#{informationId}</span>
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
          {t('not_found.message')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setCurrentPage('actualites')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#007953] hover:bg-[#006344] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">newspaper</span>
            <span>{t('not_found.back_to_news')}</span>
          </button>

          <button
            onClick={() => setCurrentPage('accueil')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            <span>{t('not_found.back_home')}</span>
          </button>
        </div>

        {/* Suggestion of valid information files */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-left">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">
            Dossiers d'investigation vérifiés disponibles :
          </h3>
          <div className="space-y-2.5">
            {ALL_VERIFICATION_DOSSIERS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (onSelectInformation) onSelectInformation(item.id);
                  else setCurrentPage('information');
                }}
                className="w-full text-left p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="truncate font-semibold text-slate-800 dark:text-slate-200">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 mr-2">{item.code}</span>
                  {item.title}
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm shrink-0">arrow_forward</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. COMPLETE VERIFICATION DETAILS
  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 py-4 animate-fade-in space-y-6">
      
      {/* Toast Feedback */}
      {copyFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#007953] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* FIL D'ARIANE INSTITUTIONNEL AVEC RETOUR */}
      <div className="flex items-center justify-between gap-4 py-1 text-xs">
        <nav aria-label="Fil d'ariane" className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setCurrentPage('accueil')}
            className="text-[#30628a] dark:text-[#60a5fa] hover:text-[#005c55] dark:hover:text-[#2dd4bf] transition-colors flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[14px]">home</span>
            <span>{t('detail.breadcrumb_home')}</span>
          </button>
          <span className="material-symbols-outlined text-[14px] text-slate-300 dark:text-slate-600">chevron_right</span>
          
          <button
            onClick={() => setCurrentPage('actualites')}
            className="text-[#30628a] dark:text-[#60a5fa] hover:text-[#005c55] transition-colors font-medium"
          >
            {t('detail.breadcrumb_news')}
          </button>
          <span className="material-symbols-outlined text-[14px] text-slate-300 dark:text-slate-600">chevron_right</span>
          
          <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-xs">{dossier.ministry}</span>
          <span className="material-symbols-outlined text-[14px] text-slate-300 dark:text-slate-600">chevron_right</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{dossier.code}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => setCurrentPage(previousPage || 'actualites')}
          className="shrink-0 inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>{t('nav.back_to_list')}</span>
        </button>
      </div>

      {/* BANDEAU DE VERDICT MAJEUR & SYNTHÈSE CITOYENNE */}
      <section className="bg-white dark:bg-[#111c2e] shadow-sm rounded-2xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
        {/* Top Badges Row */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                dossier.verdict === 'FAUX'
                  ? 'bg-red-50 dark:bg-red-950/60 text-[#c62828] dark:text-red-400 border-red-200 dark:border-red-900'
                  : dossier.verdict === 'VRAI'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {dossier.verdict === 'FAUX' ? 'gpp_bad' : dossier.verdict === 'VRAI' ? 'verified' : 'warning'}
              </span>
              <span>{dossier.verdictLabel}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#edf4ff] dark:bg-[#182438] text-[#30628a] dark:text-[#60a5fa] text-xs font-bold">
              <span className="material-symbols-outlined text-[14px]">assured_workload</span>
              <span>{dossier.ministry}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-xs">
              ID : {dossier.id}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span className="material-symbols-outlined text-[16px] text-[#005c55] dark:text-[#2dd4bf]">verified</span>
            <span>Revue collégiale par 3 vérificateurs indépendants</span>
          </div>
        </div>

        {/* Titre Principal & Synthèse D'alerte */}
        <div className="max-w-4xl mb-6">
          <h1 className="font-headline font-extrabold text-xl md:text-2xl lg:text-3xl text-slate-900 dark:text-white mb-4 leading-tight">
            {dossier.title}
          </h1>

          <div className="p-4 md:p-5 bg-[#edf4ff] dark:bg-[#182438] rounded-xl flex items-start gap-3 border border-slate-200/60 dark:border-slate-700/60">
            <span className="material-symbols-outlined text-[#005c55] dark:text-[#2dd4bf] text-[26px] mt-0.5 shrink-0">
              announcement
            </span>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#005c55] dark:text-[#2dd4bf] uppercase tracking-wider block">
                {t('detail.summary_title')}
              </span>
              <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {dossier.summaryCitizen}
              </p>
            </div>
          </div>
        </div>

        {/* Métadonnées Techniques sous forme de Registre Officiel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#f7f9ff] dark:bg-[#0b1220] p-4 rounded-xl mb-6 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex flex-col">
            <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
              {t('detail.published_on')}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {dossier.dateAudit}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
              {t('detail.last_update')}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {dossier.lastUpdate}
            </span>
          </div>

          {/* Conditional Author */}
          {dossier.author ? (
            <div className="flex flex-col">
              <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                {t('detail.lead_author')}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                {dossier.author} {dossier.authorRole ? `(${dossier.authorRole})` : ''}
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                Sources primaires
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {dossier.primarySourcesCount} documents officiels
              </span>
            </div>
          )}

          <div className="flex flex-col">
            <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
              {t('detail.sha256')}
            </span>
            <button
              onClick={() => handleCopyHash(dossier.sha256Hash)}
              className="font-mono text-[#30628a] dark:text-[#60a5fa] hover:underline text-left truncate mt-0.5"
              title="Cliquer pour copier l'empreinte complète"
            >
              {dossier.sha256Hash.slice(0, 10)}...{dossier.sha256Hash.slice(-6)}
            </button>
          </div>
        </div>

        {/* Barre d'Actions Civiques */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>{t('detail.share_whatsapp')}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">link</span>
              <span>{t('detail.copy_link')}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenPdfModal('dossier')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>{t('detail.download_pdf')}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <span>Réf. Vérif 237 :</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">/information/{dossier.id}</span>
          </div>
        </div>
      </section>

      {/* GRILLE CENTRALE DE DÉMONSTRATION SCIENTIFIQUE (2 Colonnes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLONNE GAUCHE (8 Colonnes) : Preuves, Anomalies, Confrontation */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. ÉLÉMENTS DE PREUVE & ANOMALIES (si disponibles) */}
          {dossier.evidenceAnomalies && dossier.evidenceAnomalies.length > 0 && (
            <div className="bg-white dark:bg-[#111c2e] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#005c55] dark:text-[#2dd4bf]">fact_check</span>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    {t('detail.evidence_title')}
                  </h2>
                </div>
                {dossier.evidenceBadge && (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                    {dossier.evidenceBadge}
                  </span>
                )}
              </div>

              {/* Image if available */}
              {dossier.evidenceImageUrl && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-72 bg-slate-900">
                  <img
                    src={dossier.evidenceImageUrl}
                    alt={dossier.evidenceTitle || dossier.title}
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                  />
                  {dossier.evidenceTitle && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-3 text-white text-xs">
                      {dossier.evidenceTitle}
                    </div>
                  )}
                </div>
              )}

              {/* Anomalies List */}
              <div className="space-y-2.5 pt-2">
                {dossier.evidenceAnomalies.map((ano) => (
                  <div key={ano.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {ano.id}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{ano.title}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{ano.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. CONFRONTATION FAITS RÉELS VS FAUX (si disponible) */}
          {dossier.truthComparison && (
            <div className="bg-white dark:bg-[#111c2e] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="material-symbols-outlined text-[#30628a] dark:text-[#60a5fa]">compare_arrows</span>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  {t('detail.confrontation_title')}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Established facts */}
                <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2.5">
                  <div className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    <span>{t('detail.facts_column')}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
                    {dossier.truthComparison.facts.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* False claims */}
                <div className="p-4 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-800 space-y-2.5">
                  <div className="font-bold text-xs text-red-800 dark:text-red-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">cancel</span>
                    <span>{t('detail.false_column')}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
                    {dossier.truthComparison.falseClaims.map((claim, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-red-600 font-bold">•</span>
                        <span>{claim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 3. SOURCES PRIMAIRES OFFICIELLES (si disponibles) */}
          {dossier.primarySources && dossier.primarySources.length > 0 && (
            <div className="bg-white dark:bg-[#111c2e] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="material-symbols-outlined text-emerald-600">policy</span>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  {t('detail.primary_sources_title')}
                </h2>
              </div>

              <div className="space-y-2">
                {dossier.primarySources.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-slate-400">{s.icon}</span>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-white">{s.title}</div>
                        <div className="text-[11px] text-slate-500">{s.subtitle}</div>
                      </div>
                    </div>
                    {s.link && (
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                      >
                        Consulter
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* COLONNE DROITE (4 Colonnes) : Conseils anti-scam & Dossiers connexes */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Anti-Scam Box */}
          {dossier.antiScamTips && dossier.antiScamTips.length > 0 && (
            <div className="bg-amber-50/80 dark:bg-amber-950/40 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/80 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-base">shield</span>
                <span>{t('detail.anti_scam_title')}</span>
              </div>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                {dossier.antiScamTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dossiers connexes */}
          {dossier.relatedVerifications && dossier.relatedVerifications.length > 0 && (
            <div className="bg-white dark:bg-[#111c2e] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                {t('detail.related_verifications_title')}
              </h3>
              <div className="space-y-2">
                {dossier.relatedVerifications.map((rel) => (
                  <button
                    key={rel.id}
                    onClick={() => {
                      if (onSelectInformation) onSelectInformation(rel.id);
                      else setCurrentPage('information');
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800 transition-colors block text-xs"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                      {rel.title}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span className={`font-bold ${rel.verdict === 'FAUX' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {rel.verdict}
                      </span>
                      <span>{rel.timeAgo}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Signaler un acte similaire callout */}
          <div className="bg-gradient-to-br from-[#005c55] to-slate-900 text-white p-5 rounded-2xl space-y-3 text-xs">
            <div className="font-bold text-sm">Vous avez repéré un document suspect similaire ?</div>
            <p className="text-slate-200 leading-relaxed text-[11px]">
              Transmettez-le à la vigie citoyenne pour analyse documentaire et confrontation avec les actes officiels de la République.
            </p>
            <button
              onClick={() => onOpenSuggestModal('signaler_faux', dossier.title)}
              className="w-full py-2 bg-white text-[#005c55] font-bold rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">campaign</span>
              <span>Signaler une version similaire</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
