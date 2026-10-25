import React, { useState, useEffect } from 'react';
import { NavPage } from '../types';
import { LOGO_URL } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { PWAInstallButton } from './common/PWAInstallButton';

interface HeaderProps {
  currentPage: NavPage;
  setCurrentPage: (page: NavPage) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onRequireAuthToVerify?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  setCurrentPage,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  isDark,
  setIsDark,
  onRequireAuthToVerify
}) => {
  const { user, isAuthenticated, role, logout, switchRole, setRedirectAfterLogin } = useAuth();
  const { lang, setLang, t } = useI18n();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock body scroll and handle Escape key when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileMenuOpen]);

  // Close desktop dropdown on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && userMenuOpen) {
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userMenuOpen]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit(searchQuery);
    }
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery);
      setMobileMenuOpen(false);
    }
  };

  // Button "Vérifier" handler according to requirement 1 & 2
  const handleVerifyButtonClick = () => {
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

  const navigateTo = (page: NavPage) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isStaff = role === 'admin' || role === 'verificateur';

  return (
    <header className="sticky top-0 w-full z-40 bg-white/95 dark:bg-[#111c2e]/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-[1240px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex flex-col justify-between py-2">
        
        {/* ========================================================
            BARRE PRINCIPALE : LOGO + RECHERCHE + ACTIONS
           ======================================================== */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 min-h-[44px]">
          
          {/* Logo & Platform Title (Compact on Mobile, Full on Desktop) */}
          <button
            onClick={() => navigateTo('accueil')}
            className="flex items-center gap-2 sm:gap-2.5 text-left focus:outline-hidden group cursor-pointer shrink-0"
            title="Retour à l'accueil"
          >
            <img
              alt="Logo Vérif 237"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
              src={LOGO_URL}
            />
            <div className="flex flex-col justify-center">
              <span className="font-headline font-bold text-base sm:text-lg md:text-xl tracking-tight text-[#005c55] dark:text-[#2dd4bf] leading-tight">
                Vérif 237
              </span>
              {/* Le slogan est MASQUÉ sur mobile (< 1024px) et visible sur desktop pour épurer l'interface */}
              <span className="hidden lg:block text-[10px] md:text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold leading-tight">
                {t('header.tagline')}
              </span>
            </div>
          </button>

          {/* Quick Header Search Bar (Desktop & Tablets >= 768px, hidden on mobile) */}
          <div className="hidden md:flex items-center bg-[#edf4ff] dark:bg-[#182438] px-3 py-1.5 rounded-lg gap-2 border border-slate-200/60 dark:border-slate-700/60 flex-1 max-w-xs lg:max-w-md mx-2">
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t('header.search_placeholder')}
              className="bg-transparent border-0 outline-hidden text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Effacer"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            )}
          </div>

          {/* ========================================================
              ACTIONS HEADER (DIFFÉRENCIÉES MOBILE / DESKTOP)
             ======================================================== */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* --- DESKTOP-ONLY UTILITIES (>= 768px) --- */}
            {/* Language Switcher FR / EN */}
            <div className="hidden md:flex items-center bg-[#e4effd] dark:bg-[#182438] rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setLang('FR')}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  lang === 'FR'
                    ? 'bg-white dark:bg-[#111c2e] text-[#005c55] dark:text-[#2dd4bf] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Passer en Français"
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLang('EN')}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  lang === 'EN'
                    ? 'bg-white dark:bg-[#111c2e] text-[#005c55] dark:text-[#2dd4bf] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Switch to English"
              >
                EN
              </button>
            </div>

            {/* PWA Install Button (Desktop & Tablet) */}
            <div className="hidden md:block">
              <PWAInstallButton />
            </div>

            {/* Dark Mode Toggle (Desktop & Tablet) */}
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              aria-label="Basculer le mode d'affichage"
              className="hidden md:flex p-1.5 rounded-lg bg-[#e4effd] dark:bg-[#182438] hover:bg-[#dfe9f7] text-slate-700 dark:text-slate-200 transition-colors items-center justify-center border border-slate-200/50 dark:border-slate-700 cursor-pointer"
              title={isDark ? 'Mode clair' : 'Mode sombre'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Bouton: "Assistant IA" direct (Visible sur écran large >= 1024px) */}
            <button
              type="button"
              onClick={() => navigateTo('assistant-ia')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === 'assistant-ia' || currentPage === 'ia'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}
              title="Discuter avec l'Assistant IA Vérif237"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">smart_toy</span>
              <span>Assistant IA</span>
            </button>

            {/* Action principale essentielle : "Vérifier" (toujours accessible, compact sur mobile) */}
            <button
              onClick={handleVerifyButtonClick}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#007953] hover:bg-[#006344] text-white transition-all shadow-xs active:scale-95 text-xs font-bold tracking-wide cursor-pointer shrink-0"
              title="Vérifier une information ou soumettre un signalement"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>{t('nav.verify')}</span>
            </button>

            {/* Compte utilisateur Desktop (>= 768px) */}
            <div className="relative hidden md:block">
              {isAuthenticated && user ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 cursor-pointer transition-all active:scale-95"
                  title={`${user.name} (${user.roleLabel})`}
                  aria-expanded={userMenuOpen}
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-500"
                  />
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 pr-1 truncate max-w-[100px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="material-symbols-outlined text-xs text-emerald-700 dark:text-emerald-400">expand_more</span>
                </button>
              ) : (
                <button
                  onClick={() => navigateTo('auth')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  title="Se connecter ou s'inscrire"
                >
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  <span>{t('nav.login')}</span>
                </button>
              )}

              {/* Menu Déroulant Utilisateur Desktop */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="font-bold text-slate-900 dark:text-white truncate">{user.name}</div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{user.roleLabel}</div>
                        {user.badgeCode && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{user.badgeCode}</div>
                        )}
                      </div>

                      {/* Sélecteur de rôle Démo */}
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          {t('auth.demo_accounts_title')}
                        </span>
                        <div className="grid grid-cols-2 gap-1 text-[11px]">
                          <button
                            onClick={() => {
                              switchRole('citoyen');
                              setUserMenuOpen(false);
                            }}
                            className={`p-1.5 rounded text-left transition-colors cursor-pointer ${
                              role === 'citoyen' ? 'bg-blue-100 text-blue-900 font-bold dark:bg-blue-950 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            👤 Citoyen
                          </button>
                          <button
                            onClick={() => {
                              switchRole('verificateur');
                              setUserMenuOpen(false);
                            }}
                            className={`p-1.5 rounded text-left transition-colors cursor-pointer ${
                              role === 'verificateur' ? 'bg-emerald-100 text-emerald-900 font-bold dark:bg-emerald-950 dark:text-emerald-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            🛡️ Vérificateur
                          </button>
                          <button
                            onClick={() => {
                              switchRole('admin');
                              setUserMenuOpen(false);
                            }}
                            className={`p-1.5 rounded text-left transition-colors cursor-pointer ${
                              role === 'admin' ? 'bg-purple-100 text-purple-900 font-bold dark:bg-purple-950 dark:text-purple-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            ⚡ Super-Admin
                          </button>
                          <button
                            onClick={() => {
                              switchRole('visitor');
                              setUserMenuOpen(false);
                            }}
                            className={`p-1.5 rounded text-left transition-colors cursor-pointer ${
                              role === 'visitor' ? 'bg-slate-200 text-slate-900 font-bold dark:bg-slate-700 dark:text-slate-100' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            👁️ Visiteur
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          navigateTo('accueil');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        <span>{t('nav.logout')}</span>
                      </button>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {/* --- BOUTON HAMBURGER MOBILE (Visible < 768px) --- */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors shrink-0"
              title={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu de navigation'}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
            >
              <span className="material-symbols-outlined text-[22px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>

          </div>
        </div>

        {/* ========================================================
            BARRE DE NAVIGATION SECONDAIRE (DESKTOP & TABLET >= 768px)
           ======================================================== */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 scrollbar-none">
          <button
            onClick={() => navigateTo('accueil')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentPage === 'accueil'
                ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf] font-bold'
                : 'hover:bg-[#edf4ff] dark:hover:bg-slate-800 hover:text-slate-900'
            }`}
          >
            {t('nav.home')}
          </button>

          {/* Assistant IA Link avec badge camerounais */}
          <button
            onClick={() => navigateTo('assistant-ia')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer font-bold ${
              currentPage === 'assistant-ia' || currentPage === 'ia'
                ? 'bg-[#007953] text-white shadow-xs'
                : 'bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300/70 dark:border-emerald-800/80'
            }`}
            title="Discuter avec l'Assistant IA Vérif237"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">smart_toy</span>
            <span>Assistant IA</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-600 text-white font-mono uppercase tracking-wider font-extrabold">237</span>
          </button>

          {/* Espace visiteur link for authenticated staff */}
          {isStaff && (
            <button
              onClick={() => navigateTo('accueil')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'accueil' || currentPage === 'actualites' || currentPage === 'actes'
                  ? 'text-slate-700 dark:text-slate-200 hover:bg-[#edf4ff] dark:hover:bg-slate-800'
                  : 'hover:bg-[#edf4ff] dark:hover:bg-slate-800 text-slate-500'
              }`}
              title="Naviguer sur le portail public en tant que visiteur"
            >
              <span className="material-symbols-outlined text-sm text-slate-400">visibility</span>
              <span>{t('nav.visitor_space')}</span>
            </button>
          )}

          {/* Bouton direct Administration pour Admins */}
          {role === 'admin' && (
            <button
              onClick={() => navigateTo('console-admin')}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer font-bold ${
                currentPage === 'console-admin'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
              }`}
              title="Accès direct au tableau de bord d'administration et d'audit"
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span>{t('nav.admin')}</span>
            </button>
          )}

          {/* Lien direct pour Vérificateurs */}
          {role === 'verificateur' && (
            <button
              onClick={() => navigateTo('console-verif')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer font-bold ${
                currentPage === 'console-verif'
                  ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf]'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
              title="Accès direct à la console d'investigation"
            >
              <span className="material-symbols-outlined text-sm">troubleshoot</span>
              <span>{t('nav.verifier_space')}</span>
            </button>
          )}

          <button
            onClick={() => navigateTo('actes')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentPage === 'actes'
                ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf] font-bold'
                : 'hover:bg-[#edf4ff] dark:hover:bg-slate-800 hover:text-slate-900'
            }`}
          >
            {t('nav.official')}
          </button>

          <button
            onClick={() => navigateTo('actualites')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentPage === 'actualites'
                ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf] font-bold'
                : 'hover:bg-[#edf4ff] dark:hover:bg-slate-800 hover:text-slate-900'
            }`}
          >
            {t('nav.news')}
          </button>

          <button
            onClick={() => navigateTo('a-propos')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentPage === 'a-propos' || currentPage === 'about' || currentPage === 'gouvernance' || currentPage === 'guides'
                ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf] font-bold'
                : 'hover:bg-[#edf4ff] dark:hover:bg-slate-800 hover:text-slate-900'
            }`}
          >
            {t('nav.about')}
          </button>

          <button
            onClick={() => navigateTo('faq')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentPage === 'faq'
                ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf] font-bold'
                : 'hover:bg-[#edf4ff] dark:hover:bg-slate-800 hover:text-slate-900'
            }`}
          >
            {t('nav.faq')}
          </button>
        </nav>

      </div>

      {/* ========================================================
          TIROIR DE NAVIGATION MOBILE MODERNE & COMPLET (< 768px)
          Regroupe tous les éléments secondaires de manière fluide
         ======================================================== */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end">
          
          {/* Arrière-plan obscurci avec fermeture au clic */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Panneau coulissant latéral (Drawer) */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation mobile"
            className="relative w-[88vw] max-w-sm bg-white dark:bg-[#0f172a] h-full shadow-2xl z-10 flex flex-col overflow-hidden border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200"
          >
            {/* En-tête du menu mobile */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <img
                  alt="Logo Vérif 237"
                  className="h-8 w-auto object-contain"
                  src={LOGO_URL}
                />
                <div className="flex flex-col">
                  <span className="font-headline font-bold text-lg text-[#005c55] dark:text-[#2dd4bf] leading-tight">
                    Vérif 237
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                    Cameroun • Vigie Citoyenne
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Fermer le menu"
                aria-label="Fermer le menu"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Contenu déroulant du menu */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm">
              
              {/* 1. Recherche Mobile */}
              <form onSubmit={handleMobileSearchSubmit} className="relative">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-slate-400 text-lg mr-2 shrink-0">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('header.search_placeholder')}
                    className="bg-transparent border-0 outline-hidden text-xs w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">cancel</span>
                    </button>
                  )}
                </div>
              </form>

              {/* 2. Actions prioritaires mises en valeur */}
              <div className="space-y-2">
                {/* Carte Assistant IA */}
                <button
                  onClick={() => navigateTo('assistant-ia')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    currentPage === 'assistant-ia' || currentPage === 'ia'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-emerald-50/80 hover:bg-emerald-100/70 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/70'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${currentPage === 'assistant-ia' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'}`}>
                    <span className="material-symbols-outlined text-xl">smart_toy</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span>Assistant IA Vérif237</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-600 text-white font-mono uppercase font-bold">IA</span>
                    </div>
                    <div className="text-[11px] opacity-80 truncate mt-0.5">
                      Vérifiez rumeurs et actes officiels
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-sm opacity-60">chevron_right</span>
                </button>

                {/* Bouton de vérification citoyenne */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleVerifyButtonClick();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#007953] hover:bg-[#006344] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">verified</span>
                  <span>Soumettre une information à vérifier</span>
                </button>
              </div>

              {/* 3. Navigation Principale */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
                  Navigation
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => navigateTo('accueil')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                      currentPage === 'accueil'
                        ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf] font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg opacity-70">home</span>
                    <span>{t('nav.home')}</span>
                  </button>

                  <button
                    onClick={() => navigateTo('actes')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                      currentPage === 'actes'
                        ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf] font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg opacity-70">gavel</span>
                    <span>{t('nav.official')}</span>
                  </button>

                  <button
                    onClick={() => navigateTo('actualites')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                      currentPage === 'actualites'
                        ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf] font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg opacity-70">newspaper</span>
                    <span>{t('nav.news')}</span>
                  </button>

                  <button
                    onClick={() => navigateTo('a-propos')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                      currentPage === 'a-propos' || currentPage === 'about' || currentPage === 'gouvernance' || currentPage === 'guides'
                        ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf] font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg opacity-70">info</span>
                    <span>{t('nav.about')}</span>
                  </button>

                  <button
                    onClick={() => navigateTo('faq')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                      currentPage === 'faq'
                        ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf] font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg opacity-70">help_outline</span>
                    <span>{t('nav.faq')}</span>
                  </button>
                </div>
              </div>

              {/* 4. Espaces Réservés aux Membres Accrédités (Staff & Admins) */}
              {isStaff && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2 px-1">
                    Espaces Accrédités
                  </div>
                  <div className="space-y-1">
                    {role === 'admin' && (
                      <button
                        onClick={() => navigateTo('console-admin')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-colors text-left cursor-pointer ${
                          currentPage === 'console-admin'
                            ? 'bg-purple-700 text-white'
                            : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                        <span>{t('nav.admin')}</span>
                      </button>
                    )}

                    {(role === 'verificateur' || role === 'admin') && (
                      <button
                        onClick={() => navigateTo('console-verif')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-colors text-left cursor-pointer ${
                          currentPage === 'console-verif'
                            ? 'bg-[#007953] text-white'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">troubleshoot</span>
                        <span>{t('nav.verifier_space')}</span>
                      </button>
                    )}

                    <button
                      onClick={() => navigateTo('accueil')}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">visibility</span>
                      <span>{t('nav.visitor_space')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 5. Section Compte & Authentification */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
                  Compte Utilisateur
                </div>

                {isAuthenticated && user ? (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {user.roleLabel}
                        </div>
                        {user.badgeCode && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {user.badgeCode}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sélecteur de rôle de test pour démonstration */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        {t('auth.demo_accounts_title')}
                      </span>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <button
                          onClick={() => switchRole('citoyen')}
                          className={`p-1.5 rounded text-left transition-colors cursor-pointer ${
                            role === 'citoyen' ? 'bg-blue-100 text-blue-900 font-bold dark:bg-blue-950 dark:text-blue-200' : 'bg-white dark:bg-slate-850 hover:bg-slate-100'
                          }`}
                        >
                          👤 Citoyen
                        </button>
                        <button
                          onClick={() => switchRole('verificateur')}
                          className={`p-1.5 rounded text-left transition-colors cursor-pointer ${
                            role === 'verificateur' ? 'bg-emerald-100 text-emerald-900 font-bold dark:bg-emerald-950 dark:text-emerald-200' : 'bg-white dark:bg-slate-850 hover:bg-slate-100'
                          }`}
                        >
                          🛡️ Vérificateur
                        </button>
                        <button
                          onClick={() => switchRole('admin')}
                          className={`p-1.5 rounded text-left transition-colors cursor-pointer ${
                            role === 'admin' ? 'bg-purple-100 text-purple-900 font-bold dark:bg-purple-950 dark:text-purple-200' : 'bg-white dark:bg-slate-850 hover:bg-slate-100'
                          }`}
                        >
                          ⚡ Super-Admin
                        </button>
                        <button
                          onClick={() => switchRole('visitor')}
                          className={`p-1.5 rounded text-left transition-colors cursor-pointer ${
                            role === 'visitor' ? 'bg-slate-200 text-slate-900 font-bold dark:bg-slate-700 dark:text-slate-100' : 'bg-white dark:bg-slate-850 hover:bg-slate-100'
                          }`}
                        >
                          👁️ Visiteur
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        navigateTo('accueil');
                      }}
                      className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-2.5">
                      Connectez-vous pour soumettre des dossiers et suivre les investigations républicaines.
                    </p>
                    <button
                      onClick={() => navigateTo('auth')}
                      className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">login</span>
                      <span>{t('nav.login')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 6. Préférences : Langue, Thème et Application PWA */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
                  Préférences & Accès
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  
                  {/* Commutateur de Langue FR / EN */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">translate</span>
                      <span>Langue</span>
                    </span>
                    <div className="flex items-center bg-slate-200/80 dark:bg-slate-700 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setLang('FR')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          lang === 'FR'
                            ? 'bg-white dark:bg-[#111c2e] text-[#005c55] dark:text-[#2dd4bf] shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Français
                      </button>
                      <button
                        type="button"
                        onClick={() => setLang('EN')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          lang === 'EN'
                            ? 'bg-white dark:bg-[#111c2e] text-[#005c55] dark:text-[#2dd4bf] shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  {/* Commutateur de Thème Clair / Sombre */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">
                        {isDark ? 'dark_mode' : 'light_mode'}
                      </span>
                      <span>Thème d'affichage</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDark(!isDark)}
                      className="px-3 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{isDark ? 'Mode sombre' : 'Mode clair'}</span>
                    </button>
                  </div>

                  {/* Bouton d'installation de la PWA si disponible */}
                  <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700">
                    <PWAInstallButton className="w-full justify-center" />
                  </div>

                </div>
              </div>

            </div>

            {/* Pied du menu mobile */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center shrink-0">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Vérif 237 • République du Cameroun
              </p>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};
