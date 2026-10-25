import React from 'react';
import { NavPage } from '../types';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

interface AccessDeniedViewProps {
  setCurrentPage: (page: NavPage) => void;
  requiredRole?: string;
  targetPageName?: string;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  setCurrentPage,
  requiredRole = 'Vérificateur Accrédité ou Super-Administrateur',
  targetPageName = "Espace Vérificateurs & Administration"
}) => {
  const { user, role, switchRole } = useAuth();
  const { t } = useI18n();

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return { label: t('header.role_admin'), color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300' };
      case 'verificateur':
        return { label: t('header.role_verifier'), color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' };
      case 'citoyen':
        return { label: t('header.role_citizen'), color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300' };
      default:
        return { label: t('header.role_visitor'), color: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  const badge = getRoleBadge();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl text-center">
        
        {/* Shield Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400 mb-6 shadow-inner">
          <span className="material-symbols-outlined text-4xl">shield_lock</span>
        </div>

        {/* Badge & Code */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100/80 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs font-bold tracking-wider uppercase mb-4">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>{t('forbidden.code')}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3 font-headline">
          {t('forbidden.title')}
        </h1>

        {/* Explanation */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          {t('forbidden.message')}
        </p>

        {/* Role Inspection Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 text-xs text-left mb-8 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t('forbidden.current_role')}</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${badge.color}`}>
              {badge.label} {user?.name ? `(${user.name})` : ''}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Destination ciblée :</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{targetPageName}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">Habilitation requise :</span>
            <span className="font-bold text-red-600 dark:text-red-400">{requiredRole}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setCurrentPage('accueil')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            <span>{t('forbidden.return_home')}</span>
          </button>

          <button
            onClick={() => setCurrentPage('auth')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">switch_account</span>
            <span>{t('forbidden.switch_account')}</span>
          </button>
        </div>

        {/* Quick Demo Switcher for Evaluation */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-[11px] text-slate-400 mb-3 font-semibold uppercase tracking-wider">
            {t('auth.demo_accounts_title')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => {
                switchRole('admin');
                setCurrentPage('console-admin');
              }}
              className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold transition-colors border border-purple-200 dark:border-purple-800 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-xs">admin_panel_settings</span>
              <span>Passer Super-Admin</span>
            </button>

            <button
              onClick={() => {
                switchRole('verificateur');
                setCurrentPage('console-verif');
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-colors border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-xs">verified</span>
              <span>Passer Vérificateur</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
