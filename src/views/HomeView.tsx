import React, { useState } from 'react';
import { NavPage } from '../types';
import { MOCK_RECENT_VERIFICATIONS, MOCK_DETAILED_DOSSIER } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { DynamicQuotesHero } from '../components/DynamicQuotesHero';
import { UrgentAlertBanner } from '../components/UrgentAlertBanner';
import { DashboardStats } from '../components/DashboardStats';

interface HomeViewProps {
  setCurrentPage: (page: NavPage) => void;
  onSelectInformation?: (id: string) => void;
  onOpenSuggestModal: () => void;
  onRequireAuthToVerify?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setCurrentPage,
  onSelectInformation,
  onOpenSuggestModal,
  onRequireAuthToVerify
}) => {
  const { isAuthenticated, setRedirectAfterLogin } = useAuth();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  const handleVerifyClick = () => {
    if (isAuthenticated) {
      setCurrentPage('verifier');
    } else {
      if (onRequireAuthToVerify) {
        onRequireAuthToVerify();
      }
      setRedirectAfterLogin('verifier');
      setCurrentPage('auth');
    }
  };

  const officialCategories = [
    {
      id: 'cat-1',
      icon: 'school',
      title: "Éducation & Concours d'État",
      desc: "Arrêtés d'ouverture ENAM, ENS, Police, Douanes et calendriers d'examens officiels.",
      badge: "18 concours ouverts • Vérifiés",
      badgeColor: "text-emerald-700 dark:text-emerald-400"
    },
    {
      id: 'cat-2',
      icon: 'computer',
      title: "Bourses & Formations",
      desc: "Offres bilatérales certifiées par le MINESUP, critères d'éligibilité et démarches gratuites.",
      badge: "4 alertes arnaques actives",
      badgeColor: "text-amber-700 dark:text-amber-400"
    },
    {
      id: 'cat-3',
      icon: 'badge',
      title: "Démarches Administratives",
      desc: "Tarifs légaux pour la CNI, enrôlement passeport DGSN, légalisation et actes d'état civil.",
      badge: "Guides tarifaires à jour",
      badgeColor: "text-blue-700 dark:text-blue-400"
    },
    {
      id: 'cat-4',
      icon: 'local_hospital',
      title: "Santé & Épidémiologie",
      desc: "Communiqués sanitaires MINSANTE, gratuité du traitement paludisme et alertes épidémiques.",
      badge: "Protocole national officiel",
      badgeColor: "text-slate-600 dark:text-slate-300"
    },
    {
      id: 'cat-5',
      icon: 'work',
      title: "Emploi & Entrepreneuriat",
      desc: "Subventions du FNE, création d'entreprises (CFCE) et régimes fiscaux pour PME.",
      badge: "Dispositifs d'appui légaux",
      badgeColor: "text-slate-600 dark:text-slate-300"
    },
    {
      id: 'cat-6',
      icon: 'agriculture',
      title: "Agriculture & Météo Régions",
      desc: "Alertes climatologiques MINADER/ONACC et soutiens aux filières cacao, café et maraîchage.",
      badge: "10 délégations régionales",
      badgeColor: "text-slate-600 dark:text-slate-300"
    },
    {
      id: 'cat-7',
      icon: 'directions_bus',
      title: "Transport & Tarifs Publics",
      desc: "Grilles officielles des tarifs de taxis, péages, permis de conduire et fret routier.",
      badge: "Arrêtés MINT & MINCOMMERCE",
      badgeColor: "text-slate-600 dark:text-slate-300"
    },
    {
      id: 'cat-8',
      icon: 'balance',
      title: "Justice & Droits Citoyens",
      desc: "Assistance juridictionnelle, textes pénaux usuels, et recours auprès de la Commission Nationale des Droits.",
      badge: "Modèles de requêtes certifiés",
      badgeColor: "text-slate-600 dark:text-slate-300"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c1420] text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* 1. TOP BREAKING ALERT BAR (Disappears automatically after 90s, leaves zero leftover space) */}
      <UrgentAlertBanner
        defaultDurationSeconds={90}
        onConsultAlert={() => {
          if (onSelectInformation) onSelectInformation('dossier-7729');
          else setCurrentPage('information');
        }}
      />

      {/* 2. HERO SECTION */}
      <section className="pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-4">
          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm">verified</span>
          <span>{t('hero.pill')}</span>
        </div>

        {/* Dynamic Civic Quotes (Requirement 1: 10 rotating quotes, 15s default configurable to 60s, smooth transition) */}
        <div className="mb-4">
          <DynamicQuotesHero initialDuration={15} />
        </div>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
          {t('hero.subtitle')}
        </p>

        {/* Search Input Box */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-lg flex flex-col sm:flex-row items-center gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 w-full">
            <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('hero.search_placeholder')}
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter') setCurrentPage('actualites');
              }}
            />
          </div>
          <button
            onClick={() => setCurrentPage('actualites')}
            className="w-full sm:w-auto bg-[#007953] hover:bg-[#006344] active:bg-[#004e35] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>{t('nav.verify')}</span>
            <span className="material-symbols-outlined text-sm">search</span>
          </button>
        </div>

        {/* Frequent Searches Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 mb-8">
          <span className="font-semibold text-slate-400 uppercase text-[11px]">{t('hero.popular_searches')}</span>
          {['#Concours2025', '#SantéPublique', '#BoursesCanada', '#CommuniquésMINREX', '#FauxProfilsMINAT'].map((tag) => (
            <button
              key={tag}
              onClick={() => setCurrentPage('actualites')}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 transition-colors text-xs font-mono font-medium cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* 3 Primary CTA Buttons (Including Discuter avec l'IA) */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setCurrentPage('assistant-ia')}
            className="bg-gradient-to-r from-[#005c55] to-[#047857] hover:from-[#004e48] hover:to-[#065f46] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer group hover:scale-[1.02]"
            title="Poser une question ou analyser une rumeur avec l'Assistant IA"
          >
            <span className="material-symbols-outlined text-lg text-emerald-300 group-hover:rotate-12 transition-transform">smart_toy</span>
            <span>Discuter avec l'IA</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold font-mono">237</span>
          </button>

          <button
            onClick={handleVerifyClick}
            className="bg-[#007953] hover:bg-[#006344] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">verified_user</span>
            <span>{t('hero.quick_verify_btn')}</span>
          </button>

          <button
            onClick={() => setCurrentPage('actes')}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">account_balance</span>
            <span>{t('hero.consult_official_btn')}</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-headline">1 420</div>
            <div className="font-bold text-xs text-slate-700 dark:text-slate-300 mt-1">Vérifications publiées</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Analyses factuelles documentées</div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-headline">98,4%</div>
            <div className="font-bold text-xs text-slate-700 dark:text-slate-300 mt-1">Sources primaires archivées</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Dépôts juridiques & scellés numériques</div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-headline">10 / 10</div>
            <div className="font-bold text-xs text-slate-700 dark:text-slate-300 mt-1">Régions couvertes</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Réseau de correspondants certifiés</div>
          </div>
        </div>

        {/* ASSISTANT IA SPOTLIGHT BANNER */}
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950 via-[#005c55] to-teal-900 text-white shadow-xl border border-emerald-500/30 text-left relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 -translate-y-8 translate-x-8 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 max-w-xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Nouveau • Assistant IA Vérif237</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-headline">
              Une question sur l'actualité ou un acte au Cameroun ?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Discutez en direct avec notre intelligence artificielle conversationnelle. Elle recoupe vos allégations avec le Journal Officiel, les arrêtés ministériels et les sources vérifiées du pays.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 relative z-10">
            <button
              onClick={() => setCurrentPage('assistant-ia')}
              className="px-6 py-3 rounded-2xl bg-white text-[#005c55] hover:bg-emerald-50 font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">forum</span>
              <span>Lancer une conversation</span>
            </button>
            <div className="text-[11px] text-emerald-200/80 text-center font-medium">
              Gratuit • Accès direct • Modèle supervisé
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 BAROMÈTRE & STATISTIQUES RECHARTS (Actes vérifiés, Taux de désinformation, Activité mensuelle) */}
      <DashboardStats setCurrentPage={setCurrentPage} />

      {/* 3. LATEST INVESTIGATIONS SECTION */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="text-xs font-bold text-[#007953] dark:text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">rss_feed</span>
              VEILLE FACTUELLE RÉCENTE
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Dernières enquêtes et verdicts publics
            </h2>
          </div>

          <button
            onClick={() => setCurrentPage('actualites')}
            className="text-[#007953] dark:text-emerald-400 hover:text-emerald-800 font-bold text-xs sm:text-sm flex items-center gap-1 group self-start sm:self-auto cursor-pointer"
          >
            <span>{t('home.view_all_news')}</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_RECENT_VERIFICATIONS.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Image */}
                <div 
                  onClick={() => {
                    if (onSelectInformation) onSelectInformation(item.id);
                    else setCurrentPage('information');
                  }}
                  className="relative h-48 bg-slate-950 overflow-hidden cursor-pointer group"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider shadow ${
                        item.verdict === 'FAUX'
                          ? 'bg-red-600 text-white'
                          : item.verdict === 'VRAI'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {item.verdictLabel}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                    {item.refCode}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{item.category}</span>
                    <span>{item.date}</span>
                  </div>

                  <h3 
                    onClick={() => {
                      if (onSelectInformation) onSelectInformation(item.id);
                      else setCurrentPage('information');
                    }}
                    className="font-bold text-slate-900 dark:text-white text-base mb-3 leading-snug line-clamp-2 cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-4">
                    {item.summary}
                  </p>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-[11px] text-slate-500">
                    <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-emerald-600">verified</span>
                      <span>{t('home.sources_consulted')}</span>
                    </div>
                    {item.sources.map((s, idx) => (
                      <div key={idx} className="truncate">• {s}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    if (onSelectInformation) onSelectInformation(item.id);
                    else setCurrentPage('information');
                  }}
                  className="text-[#007953] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('home.consult_full_analysis')}</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>

                <button
                  onClick={() => {
                    const url = `${window.location.origin}/information/${item.id}`;
                    navigator.clipboard?.writeText(url);
                    alert("Lien de l'analyse copié dans le presse-papier !");
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title="Partager"
                >
                  <span className="material-symbols-outlined text-sm">share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PORTAIL CITOYEN DE L'INFORMATION OFFICIELLE (8-Grid) */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">account_balance</span>
              ACTES, CONCOURS & RÉGLEMENTATIONS
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Portail Citoyen de l'Information Officielle
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Consultez les référentiels authentifiés et arrêtés ministériels en vigueur dans les 10 régions de la République du Cameroun.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Bases juridiques synchronisées</span>
          </div>
        </div>

        {/* 8-Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {officialCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setCurrentPage('actes')}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer shadow-sm hover:shadow flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold flex items-center justify-between">
                <span className={cat.badgeColor}>{cat.badge}</span>
                <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. COMMENT FONCTIONNE VÉRIF 237 ? (3 Steps) */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-xs font-bold text-[#007953] dark:text-emerald-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-sm">balance</span>
            NEUTRALITÉ & RIGUEUR DÉONTOLOGIQUE
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Comment fonctionne Vérif 237 ?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Un protocole d'investigation public en 3 étapes. Aucune décision n'est déléguée à une intelligence artificielle : chaque verdict est validé par des vérificateurs humains selon notre charte éthique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-2xl font-black text-emerald-600 mb-3 font-mono">01</div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Signalement citoyen & Détection virale
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Alertes envoyées par nos utilisateurs via WhatsApp et notre formulaire public. Nos outils mesurent la viralité sur les canaux locaux pour prioriser les sujets ayant un fort impact civique.
            </p>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-2xl font-black text-emerald-600 mb-3 font-mono">02</div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Confrontation aux sources primaires
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Recherche d'archives officielles, analyse forensique des métadonnées (InVID, EXIF), et contact direct avec les secrétariats ministériels ou experts sectoriels impartiaux.
            </p>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-2xl font-black text-emerald-600 mb-3 font-mono">03</div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Verdict public & Droit de réponse
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Publication de la fiche avec preuves téléchargeables, empreinte d'archivage immuable et ouverture transparente aux rectifications contradictoires sous 48 heures.
            </p>
          </div>
        </div>
      </section>

      {/* 6. 4 RÉFLEXES SIMPLES AVANT DE TRANSFÉRER UN MESSAGE */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Navy box left (5 cols) */}
          <div className="lg:col-span-5 bg-[#0a192f] text-white p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-950/80 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-800/40">
                <span className="material-symbols-outlined text-xs">school</span>
                ÉDUCATION AUX MÉDIAS & CITOYENNETÉ
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 leading-tight font-headline">
                4 réflexes simples avant de transférer un message.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                La désinformation se propage souvent par bienveillance entre proches. Adoptez ces principes d'hygiène numérique pour briser les chaînes d'intoxication d'opinion.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-400 text-2xl">verified_user</span>
              <div className="text-xs text-slate-300">
                <strong>Un doute sur un texte ?</strong> Transférez-le directement à notre numéro de signalement civic.
              </div>
            </div>
          </div>

          {/* 4 Cards Right (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <span className="text-emerald-600 font-mono font-bold">1.</span>
                <span>Qui est l'auteur ?</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Méfiez-vous de la mention « Transféré de nombreuses fois » et des messages sans signature institutionnelle vérifiable.
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <span className="text-emerald-600 font-mono font-bold">2.</span>
                <span>Examiner le lien</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Les plateformes gouvernementales camerounaises officielles se terminent en <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-600 font-bold">.cm</code> ou <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-600 font-bold">.gov.cm</code>, jamais en formulaires gratuits type Blogspot.
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <span className="text-emerald-600 font-mono font-bold">3.</span>
                <span>Suspecter l'émotion</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Si un message suscite immédiatement la colère, l'effroi ou une opportunité d'argent miraculeuse, il est très probablement manipulé.
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <span className="text-emerald-600 font-mono font-bold">4.</span>
                <span>Marquer une pause</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Vérifiez sur Vérif 237 avant d'appuyer sur Partager. En attendant 60 secondes, vous protégez vos proches de fausses alertes.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. BOTTOM BANNER CALLOUT */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#032b21] text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <div className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-2">
              ACTION CITOYENNE DIRECTE
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 font-headline">
              Vous avez repéré une publication suspecte ?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Soumettez une capture d'écran, un fichier audio ou un texte WhatsApp. Notre équipe de vérificateurs indépendants initiera une enquête documentée.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentPage('signaler')}
              className="bg-[#00c282] hover:bg-[#00ab73] text-[#032b21] font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow"
            >
              Transmettre une information
            </button>
            <button
              onClick={() => setCurrentPage('a-propos')}
              className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl transition-colors cursor-pointer"
            >
              À propos & Charte éthique
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
