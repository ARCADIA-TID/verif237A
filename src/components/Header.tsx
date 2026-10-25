import React, { useState } from 'react';
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

  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit(searchQuery);
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

  const isStaff = role === 'admin' || role === 'verificateur';

  return (
    <header className="sticky top-0 w-full z-50 bg-[#ffffff]/95 dark:bg-[#111c2e]/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-[1240px] mx-auto px-4 md:px-6 lg:px-8 flex flex-col justify-between py-2">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Platform Name */}
          <button
            onClick={() => setCurrentPage('accueil')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
            title="Retour à l'accueil"
          >
            <img
              alt="Logo Vérif 237"
              className="h-8 md:h-9 w-auto object-contain transition-transform group-hover:scale-105"
              src={LOGO_URL}
            />
            <div className="flex flex-col">
              <span className="font-headline font-bold text-lg md:text-xl tracking-tight text-[#005c55] dark:text-[#2dd4bf]">
                Vérif 237
              </span>
              <span className="text-[10px] md:text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                {t('header.tagline')}
              </span>
            </div>
          </button>

          {/* Quick Header Search Bar (Desktop) */}
          <div className="hidden md:flex items-center bg-[#edf4ff] dark:bg-[#182438] px-3 py-1.5 rounded-lg gap-2 border border-slate-200/60 dark:border-slate-700/60 flex-1 max-w-sm lg:max-w-md">
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t('header.search_placeholder')}
              className="bg-transparent border-0 outline-none text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Effacer"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            )}
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2">
            
            {/* Language Switcher (Centralized i18n FR / EN) */}
            <div className="flex items-center bg-[#e4effd] dark:bg-[#182438] rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setLang('FR')}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  lang === 'FR'
                    ? 'bg-white dark:bg-[#111c2e] text-[#005c55] dark:text-[#2dd4bf] shadow-sm'
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
                    ? 'bg-white dark:bg-[#111c2e] text-[#005c55] dark:text-[#2dd4bf] shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Switch to English"
              >
                EN
              </button>
            </div>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              aria-label="Basculer le mode d'affichage"
              className="p-1.5 rounded-lg bg-[#e4effd] dark:bg-[#182438] hover:bg-[#dfe9f7] text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center border border-slate-200/50 dark:border-slate-700 cursor-pointer"
              title={isDark ? 'Mode clair' : 'Mode sombre'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Bouton: "Assistant IA" direct */}
            <button
              type="button"
              onClick={() => setCurrentPage('assistant-ia')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === 'assistant-ia' || currentPage === 'ia'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}
              title="Discuter avec l'Assistant IA Vérif237"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">smart_toy</span>
              <span className="hidden sm:inline">Assistant IA</span>
              <span className="sm:hidden">IA</span>
            </button>

            {/* Button: "Vérifier" (Requirement 2: replaces "Signaler" and requires authentication) */}
            <button
              onClick={handleVerifyButtonClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#007953] hover:bg-[#006344] text-white transition-all shadow-sm active:scale-95 text-xs font-bold tracking-wide cursor-pointer"
              title="Vérifier une information ou soumettre un signalement"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>{t('nav.verify')}</span>
            </button>

            {/* User Session Profile & Role Dropdown */}
            <div className="relative">
              {isAuthenticated && user ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 cursor-pointer transition-all active:scale-95"
                  title={`${user.name} (${user.roleLabel})`}
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-500"
                  />
                  <span className="hidden sm:inline text-xs font-bold text-emerald-800 dark:text-emerald-300 pr-1 truncate max-w-[100px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="material-symbols-outlined text-xs text-emerald-700 dark:text-emerald-400">expand_more</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentPage('auth')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  title="Se connecter ou s'inscrire"
                >
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  <span className="hidden sm:inline">{t('nav.login')}</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 text-xs">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="font-bold text-slate-900 dark:text-white truncate">{user.name}</div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{user.roleLabel}</div>
                        {user.badgeCode && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{user.badgeCode}</div>
                        )}
                      </div>

                      {/* Demo Quick Role Switcher for Test and Evaluation */}
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
                            className={`p-1.5 rounded text-left transition-colors ${
                              role === 'citoyen' ? 'bg-blue-100 text-blue-900 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            👤 Citoyen
                          </button>
                          <button
                            onClick={() => {
                              switchRole('verificateur');
                              setUserMenuOpen(false);
                            }}
                            className={`p-1.5 rounded text-left transition-colors ${
                              role === 'verificateur' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            🛡️ Vérificateur
                          </button>
                          <button
                            onClick={() => {
                              switchRole('admin');
                              setUserMenuOpen(false);
                            }}
                            className={`p-1.5 rounded text-left transition-colors ${
                              role === 'admin' ? 'bg-purple-100 text-purple-900 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            ⚡ Super-Admin
                          </button>
                          <button
                            onClick={() => {
                              switchRole('visitor');
                              setUserMenuOpen(false);
                            }}
                            className={`p-1.5 rounded text-left transition-colors ${
                              role === 'visitor' ? 'bg-slate-200 text-slate-900 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
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
                          setCurrentPage('accueil');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        <span>{t('nav.logout')}</span>
                      </button>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              title="Menu"
            >
              <span className="material-symbols-outlined text-[20px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>

          </div>
        </div>

        {/* Secondary Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 scrollbar-none">
          <button
            onClick={() => setCurrentPage('accueil')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentPage === 'accueil'
                ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf] font-bold'
                : 'hover:bg-[#edf4ff] dark:hover:bg-slate-800 hover:text-slate-900'
            }`}
          >
            {t('nav.home')}
          </button>

          {/* Assistant IA Link */}
          <button
            onClick={() => setCurrentPage('assistant-ia')}
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

          {/* Requirement 3: Espace visiteur link for authenticated admins and staff */}
          {isStaff && (
            <button
              onClick={() => setCurrentPage('accueil')}
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

          {/* Requirement 3: Direct Administration button for Admins (no intermediate steps) */}
          {role === 'admin' && (
            <button
              onClick={() => setCurrentPage('console-admin')}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer font-bold ${
                currentPage === 'console-admin'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
              }`}
              title="Accès direct au tableau de bord d'administration et d'audit"
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span>{t('nav.admin')}</span>
            </button>
          )}

          {/* Direct link for Verifiers */}
          {role === 'verificateur' && (
            <button
              onClick={() => setCurrentPage('console-verif')}
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
            onClick={() => setCurrentPage('actes')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentPage === 'actes'
                ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf] font-bold'
                : 'hover:bg-[#edf4ff] dark:hover:bg-slate-800 hover:text-slate-900'
            }`}
          >
            {t('nav.official')}
          </button>

          <button
            onClick={() => setCurrentPage('actualites')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentPage === 'actualites'
                ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf] font-bold'
                : 'hover:bg-[#edf4ff] dark:hover:bg-slate-800 hover:text-slate-900'
            }`}
          >
            {t('nav.news')}
          </button>

          <button
            onClick={() => setCurrentPage('a-propos')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentPage === 'a-propos' || currentPage === 'about' || currentPage === 'gouvernance' || currentPage === 'guides'
                ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf] font-bold'
                : 'hover:bg-[#edf4ff] dark:hover:bg-slate-800 hover:text-slate-900'
            }`}
          >
            {t('nav.about')}
          </button>

          <button
            onClick={() => setCurrentPage('faq')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentPage === 'faq'
                ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf] font-bold'
                : 'hover:bg-[#edf4ff] dark:hover:bg-slate-800 hover:text-slate-900'
            }`}
          >
            {t('nav.faq')}
          </button>

        </nav>

        {/* Mobile Nav Accordion / Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1.5 text-xs font-semibold">
            <button
              onClick={() => {
                setCurrentPage('accueil');
                setMobileMenuOpen(false);
              }}
              className="p-2 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('nav.home')}
            </button>

            {/* Assistant IA on mobile */}
            <button
              onClick={() => {
                setCurrentPage('assistant-ia');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl text-left bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800/60"
            >
              <span className="material-symbols-outlined text-base text-emerald-600 dark:text-emerald-400">smart_toy</span>
              <span>Discuter avec l'Assistant IA</span>
              <span className="ml-auto text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-mono">IA</span>
            </button>

            {/* Requirement 3: Admin & visitor links on mobile */}
            {isStaff && (
              <button
                onClick={() => {
                  setCurrentPage('accueil');
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                <span>{t('nav.visitor_space')}</span>
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => {
                  setCurrentPage('console-admin');
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg text-left bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                <span>{t('nav.admin')}</span>
              </button>
            )}

            {role === 'verificateur' && (
              <button
                onClick={() => {
                  setCurrentPage('console-verif');
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg text-left bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">troubleshoot</span>
                <span>{t('nav.verifier_space')}</span>
              </button>
            )}

            <button
              onClick={() => {
                setCurrentPage('actes');
                setMobileMenuOpen(false);
              }}
              className="p-2 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('nav.official')}
            </button>
            <button
              onClick={() => {
                setCurrentPage('actualites');
                setMobileMenuOpen(false);
              }}
              className="p-2 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('nav.news')}
            </button>
            <button
              onClick={() => {
                setCurrentPage('a-propos');
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded-lg text-left transition-colors font-semibold ${
                currentPage === 'a-propos' || currentPage === 'about' || currentPage === 'gouvernance' || currentPage === 'guides'
                  ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf] font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t('nav.about')}
            </button>
            <button
              onClick={() => {
                setCurrentPage('faq');
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded-lg text-left transition-colors font-bold ${
                currentPage === 'faq'
                  ? 'bg-[#dfe9f7] dark:bg-teal-950/70 text-[#005c55] dark:text-[#2dd4bf]'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-[#007953] dark:text-emerald-400'
              }`}
            >
              {t('nav.faq')}
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
