import React, { useState } from 'react';
import { NavPage, CivicRegistrationState } from '../types';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

interface CivicAuthViewProps {
  setCurrentPage: (page: NavPage) => void;
  onLoginSuccess?: (userName: string, role: string) => void;
}

export const CivicAuthView: React.FC<CivicAuthViewProps> = ({
  setCurrentPage,
  onLoginSuccess
}) => {
  const { login, redirectAfterLogin, setRedirectAfterLogin, switchRole } = useAuth();
  const { t } = useI18n();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [loginEmail, setLoginEmail] = useState('citoyen@exemple.cm');
  const [loginPhone, setLoginPhone] = useState('670 00 00 00');
  const [loginPassword, setLoginPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Registration step state
  const [regData, setRegData] = useState<CivicRegistrationState>({
    step: 1,
    fullName: 'Ahmed Tidjani',
    contactType: 'email',
    contactValue: 'ahmed.tidjani@exemple.cm',
    region: 'Centre (Yaoundé, Mbalmayo...)',
    password: 'Cameroun@2025#',
    confirmPassword: 'Cameroun@2025#',
    twoFactorEnabled: true,
    participationMode: 'citoyen_veilleur',
    digestFrequency: 'hebdomadaire',
    acceptedCharter: true,
    receiveMonthlyKit: false,
    assignedBadgeCode: '#VRF-9824'
  });

  const handleStepJump = (step: 1 | 2 | 3 | 4) => {
    setAuthMode('register');
    setRegData(prev => ({ ...prev, step }));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = loginEmail.toLowerCase();
    const isAdminUser = emailLower.includes('admin') || emailLower.includes('kamga');
    const isVerifierUser = emailLower.includes('mballa') || emailLower.includes('verif');

    if (isAdminUser) {
      switchRole('admin');
      if (onLoginSuccess) {
        onLoginSuccess('Dr. François Kamga', 'Super-Administrateur');
      }
      const destination = (redirectAfterLogin as NavPage) || 'console-admin';
      setRedirectAfterLogin(null);
      setCurrentPage(destination);
      return;
    }

    if (isVerifierUser) {
      switchRole('verificateur');
      if (onLoginSuccess) {
        onLoginSuccess('Emmanuel Mballa', 'Réviseur Sénior');
      }
      const destination = (redirectAfterLogin as NavPage) || 'console-verif';
      setRedirectAfterLogin(null);
      setCurrentPage(destination);
      return;
    }

    login({
      id: 'usr-citoyen-01',
      name: loginEmail.split('@')[0] || 'Ahmed Tidjani',
      email: loginEmail,
      role: 'citoyen',
      roleLabel: 'Citoyen Veilleur',
      region: 'Centre (Yaoundé)',
      badgeCode: '#VRF-9824',
      twoFactorEnabled: true
    });

    if (onLoginSuccess) {
      onLoginSuccess('Ahmed Tidjani', 'Citoyen Veilleur');
    }

    const destination = (redirectAfterLogin as NavPage) || 'accueil';
    setRedirectAfterLogin(null);
    setCurrentPage(destination);
  };

  const handleQuickDemoLogin = (role: 'citoyen' | 'verificateur' | 'admin') => {
    switchRole(role);
    const destination = (redirectAfterLogin as NavPage) || (role === 'admin' ? 'console-admin' : role === 'verificateur' ? 'console-verif' : 'accueil');
    setRedirectAfterLogin(null);
    setCurrentPage(destination);
  };

  const handleRegisterFinalSubmit = () => {
    setRegData(prev => ({ ...prev, step: 4 }));
    login({
      id: `usr-${Date.now()}`,
      name: regData.fullName,
      email: regData.contactValue,
      role: 'citoyen',
      roleLabel: regData.participationMode === 'expert_juriste' ? 'Expert Juriste Associé' : 'Citoyen Veilleur',
      region: regData.region,
      badgeCode: regData.assignedBadgeCode || '#VRF-NEW',
      twoFactorEnabled: regData.twoFactorEnabled
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8 transition-colors">
      
      {/* Top Banner Navigation */}
      <div className="max-w-6xl mx-auto flex items-center justify-between pb-6 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Infos fiables</span>
          </div>
          <span>|</span>
          <span>Citoyens engagés</span>
          <span>|</span>
          <span className="flex items-center gap-1">
            <span>Cameroun plus fort</span>
            <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1 rounded">CM</span>
          </span>
        </div>

        <button
          onClick={() => setCurrentPage('accueil')}
          className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Retour au portail</span>
        </button>
      </div>

      {/* Main Container Card */}
      <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* LEFT COLUMN: Civic Manifesto Dark Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#06181e] via-[#092225] to-[#041217] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Intérêt public et vigilance citoyenne</span>
              <span className="text-slate-400 font-mono text-[10px] ml-1">PROT-CIV-2025</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4 font-headline">
              Votre voix compte.<br />
              Votre vigilance <span className="text-emerald-400 underline decoration-emerald-500/50">aussi</span>.
            </h2>

            <p className="text-sm text-slate-300 mb-8 leading-relaxed">
              Rejoignez Vérif 237 et devenez acteur d'une information fiable, équilibrée et responsable au Cameroun. Ensemble, combattons la désinformation au quotidien.
            </p>

            {/* Feature list */}
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/40">
                  <span className="material-symbols-outlined text-base">search</span>
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Vérifiez les informations qui vous entourent</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Accédez aux alertes citoyennes géolocalisées en temps réel.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/40">
                  <span className="material-symbols-outlined text-base">campaign</span>
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Partagez vos signalements</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Transmettez anonymement rumeurs et infox repérées sur les réseaux.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/40">
                  <span className="material-symbols-outlined text-base">diversity_3</span>
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Aidez la communauté camerounaise</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Éclairez vos proches dans les groupes de quartier et de famille.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/40">
                  <span className="material-symbols-outlined text-base">shield</span>
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Construisez un Cameroun plus informé</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Participez à la cohésion nationale par la vérité factuelle.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="font-bold text-white">Yaoundé • Douala • Bafoussam • Garoua</span>
            </div>
            <span className="text-emerald-400 font-bold">#237SansFakeNews</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Form / Wizard (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Top Switcher (Se connecter / Créer un compte) */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    authMode === 'login'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Se connecter
                </button>
                <button
                  onClick={() => {
                    setAuthMode('register');
                    if (regData.step === 4) setRegData(prev => ({ ...prev, step: 1 }));
                  }}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    authMode === 'register'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Créer un compte
                </button>
              </div>

              <div className="text-xs text-slate-500">
                {authMode === 'register' ? (
                  <span>
                    Déjà membre ?{' '}
                    <button
                      onClick={() => setAuthMode('login')}
                      className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                    >
                      Se connecter
                    </button>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                    <span className="material-symbols-outlined text-xs">lock</span>
                    Chiffrement AES-256
                  </span>
                )}
              </div>
            </div>

            {/* CASE 1: LOGIN MODE */}
            {authMode === 'login' && (
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
                  Heureux de vous revoir !
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Connectez-vous pour accéder à votre espace citoyen et suivre les alertes certifiées.
                </p>

                {/* Login Method Toggle */}
                <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl p-1 mb-6 bg-slate-50 dark:bg-slate-800/50 max-w-xs">
                  <button
                    onClick={() => setLoginMethod('email')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      loginMethod === 'email'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500'
                    }`}
                  >
                    E-mail
                  </button>
                  <button
                    onClick={() => setLoginMethod('phone')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      loginMethod === 'phone'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500'
                    }`}
                  >
                    Téléphone (+237)
                  </button>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-lg">
                  {loginMethod === 'email' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Adresse e-mail
                      </label>
                      <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800">
                        <span className="material-symbols-outlined text-slate-400 text-lg">alternate_email</span>
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="exemple@domaine.cm"
                          className="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Numéro de téléphone (+237)
                      </label>
                      <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800">
                        <span className="material-symbols-outlined text-slate-400 text-lg">call</span>
                        <input
                          type="tel"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          placeholder="670 00 00 00"
                          className="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Mot de passe
                      </label>
                      <button
                        type="button"
                        onClick={() => alert("Un code de réinitialisation sécurisé sera envoyé à votre adresse déclarée.")}
                        className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                      Rester connecté sur cet appareil
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Se connecter</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </form>

                {/* Quick Demo Logins for Fast Testing of Roles */}
                <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
                    {t('auth.demo_accounts_title')}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('citoyen')}
                      className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 cursor-pointer text-left"
                    >
                      <span className="material-symbols-outlined text-sm">person</span>
                      <span>Citoyen Veilleur</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('verificateur')}
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 cursor-pointer text-left"
                    >
                      <span className="material-symbols-outlined text-sm">shield</span>
                      <span>Vérificateur</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('admin')}
                      className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 cursor-pointer text-left"
                    >
                      <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                      <span>Super-Admin</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-600">verified_user</span>
                  <span>Données citoyennes protégées et non partagées à des fins commerciales.</span>
                </div>
              </div>
            )}

            {/* CASE 2: REGISTER STEP 1 (Identité & Contact) */}
            {authMode === 'register' && regData.step === 1 && (
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                  Rejoignez la vigie citoyenne !
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Complétez ces 3 étapes simples pour créer votre profil certifié et contribuer à la vérité.
                </p>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-wider">
                    <span>ÉTAPE 1 SUR 3 • IDENTITÉ & CONTACT</span>
                    <span>33% complété</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full w-1/3 transition-all duration-300" />
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">1</span>
                      <span>Contact</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px]">2</span>
                      <span>Sécurité</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px]">3</span>
                      <span>Engagement</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Nom complet ou pseudonyme civique *
                    </label>
                    <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800">
                      <span className="material-symbols-outlined text-slate-400 text-lg">person</span>
                      <input
                        type="text"
                        value={regData.fullName}
                        onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                        placeholder="Ex: Ahmed Tidjani"
                        className="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Le pseudonyme est accepté pour protéger les lanceurs d'alerte.
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Canal de contact privilégié *
                      </label>
                      <div className="flex gap-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setRegData({ ...regData, contactType: 'email' })}
                          className={`px-2.5 py-0.5 rounded font-bold ${regData.contactType === 'email' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'text-slate-400'}`}
                        >
                          E-mail
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegData({ ...regData, contactType: 'phone' })}
                          className={`px-2.5 py-0.5 rounded font-bold ${regData.contactType === 'phone' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'text-slate-400'}`}
                        >
                          Téléphone (+237)
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800">
                      <span className="material-symbols-outlined text-slate-400 text-lg">
                        {regData.contactType === 'email' ? 'alternate_email' : 'call'}
                      </span>
                      <input
                        type={regData.contactType === 'email' ? 'email' : 'tel'}
                        value={regData.contactValue}
                        onChange={(e) => setRegData({ ...regData, contactValue: e.target.value })}
                        placeholder={regData.contactType === 'email' ? 'ahmed.tidjani@exemple.cm' : '670 00 00 00'}
                        className="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Région camerounaise de rattachement
                    </label>
                    <select
                      value={regData.region}
                      onChange={(e) => setRegData({ ...regData, region: e.target.value })}
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium outline-none"
                    >
                      <option value="Centre (Yaoundé, Mbalmayo...)">Centre (Yaoundé, Mbalmayo...)</option>
                      <option value="Littoral (Douala, Nkongsamba...)">Littoral (Douala, Nkongsamba...)</option>
                      <option value="Ouest (Bafoussam, Dschang...)">Ouest (Bafoussam, Dschang...)</option>
                      <option value="Nord-Ouest (Bamenda, Kumbo...)">Nord-Ouest (Bamenda, Kumbo...)</option>
                      <option value="Sud-Ouest (Buea, Limbe...)">Sud-Ouest (Buea, Limbe...)</option>
                      <option value="Extrême-Nord (Maroua, Kousséri...)">Extrême-Nord (Maroua, Kousséri...)</option>
                      <option value="Nord (Garoua, Guider...)">Nord (Garoua, Guider...)</option>
                      <option value="Adamaoua (Ngaoundéré, Meiganga...)">Adamaoua (Ngaoundéré, Meiganga...)</option>
                      <option value="Est (Bertoua, Batouri...)">Est (Bertoua, Batouri...)</option>
                      <option value="Sud (Ebolowa, Kribi...)">Sud (Ebolowa, Kribi...)</option>
                      <option value="Diaspora & Étranger">Diaspora & Étranger</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setRegData({ ...regData, step: 2 })}
                      className="w-full bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Continuer vers la sécurité</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-600">shield_lock</span>
                  <span>Données citoyennes protégées et non partagées à des fins commerciales.</span>
                </div>
              </div>
            )}

            {/* CASE 3: REGISTER STEP 2 (Sécurité & Accès) */}
            {authMode === 'register' && regData.step === 2 && (
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                  Rejoignez la vigie citoyenne !
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Définissez un mot de passe sécurisé pour sceller vos données d'enquêteur citoyen.
                </p>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-wider">
                    <span>ÉTAPE 2 SUR 3 • SÉCURITÉ & ACCÈS</span>
                    <span>66% complété</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full w-2/3 transition-all duration-300" />
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      <span>1. Contact (Validé)</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">2</span>
                      <span>2. Sécurité (En cours)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px]">3</span>
                      <span>3. Engagement</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 max-w-lg">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Mot de passe civique *
                      </label>
                      <span className="text-emerald-600 text-xs font-bold font-mono">Très Solide (100%)</span>
                    </div>
                    <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={regData.password}
                        onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                        className="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>

                    {/* Gauge */}
                    <div className="flex gap-1.5 mt-2">
                      <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                      <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                      <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                      <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <span className="bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded flex items-center gap-1">✓ 8+ car.</span>
                      <span className="bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded flex items-center gap-1">✓ 1 Majuscule</span>
                      <span className="bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded flex items-center gap-1">✓ 1 Chiffre</span>
                      <span className="bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded flex items-center gap-1">✓ 1 Symbole</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Confirmer le mot de passe *
                    </label>
                    <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800">
                      <input
                        type="password"
                        value={regData.confirmPassword}
                        onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                        className="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white font-mono"
                      />
                      <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                    </div>
                  </div>

                  {/* 2FA Toggle Card */}
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-lg">smartphone</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">Double authentification citoyenne (+237)</span>
                          <span className="bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 px-1.5 py-0.2 rounded text-[9px] font-bold">RECOMMANDÉ</span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                          Recevoir une clé OTP par WhatsApp ou SMS au Cameroun lors de chaque signalement public.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRegData({ ...regData, twoFactorEnabled: !regData.twoFactorEnabled })}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        regData.twoFactorEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          regData.twoFactorEnabled ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      onClick={() => setRegData({ ...regData, step: 1 })}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span>
                      <span>Retour</span>
                    </button>

                    <button
                      onClick={() => setRegData({ ...regData, step: 3 })}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Continuer vers l'engagement</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-600">shield_lock</span>
                  <span>Données citoyennes protégées et non partagées à des fins commerciales.</span>
                </div>
              </div>
            )}

            {/* CASE 4: REGISTER STEP 3 (Rôle & Engagement) */}
            {authMode === 'register' && regData.step === 3 && (
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                  Finalisez votre engagement citoyen
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Choisissez votre posture de veille et validez la charte républicaine pour activer vos accès au centre de démenti.
                </p>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-wider">
                    <span>ÉTAPE 3 SUR 3 • RÔLE & ENGAGEMENT</span>
                    <span>100% complété</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full w-full transition-all duration-300" />
                  </div>
                </div>

                {/* 3 Role Selection Cards */}
                <div className="space-y-4 max-w-lg mb-6">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Choisissez votre mode de participation
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Citoyen Veilleur */}
                    <div
                      onClick={() => setRegData({ ...regData, participationMode: 'citoyen_veilleur' })}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                        regData.participationMode === 'citoyen_veilleur'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="material-symbols-outlined text-emerald-600 text-xl">radar</span>
                          {regData.participationMode === 'citoyen_veilleur' && (
                            <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                          )}
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white">Citoyen Veilleur</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Signalement de rumeurs, consultation des démentis officiels.
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-emerald-200/50 dark:border-emerald-800/40 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        ACCÈS STANDARD
                      </div>
                    </div>

                    {/* Relais Local */}
                    <div
                      onClick={() => setRegData({ ...regData, participationMode: 'relais_local' })}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                        regData.participationMode === 'relais_local'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="material-symbols-outlined text-slate-500 text-xl">campaign</span>
                          {regData.participationMode === 'relais_local' && (
                            <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                          )}
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white">Relais Local</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Diffusion des fiches certifiées sur WhatsApp de quartier et groupes locaux.
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500">
                        KITS VISUELS OFFERTS
                      </div>
                    </div>

                    {/* Expert & Juriste */}
                    <div
                      onClick={() => setRegData({ ...regData, participationMode: 'expert_juriste' })}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                        regData.participationMode === 'expert_juriste'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="material-symbols-outlined text-slate-500 text-xl">gavel</span>
                          {regData.participationMode === 'expert_juriste' && (
                            <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                          )}
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white">Expert & Juriste</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Analyse documentaire, veille juridique et contre-expertise collégiale.
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500">
                        REVUE COLLÉGIALE
                      </div>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Fréquence des synthèses d'alerte
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRegData({ ...regData, digestFrequency: 'quotidienne' })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border ${regData.digestFrequency === 'quotidienne' ? 'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-200' : 'border-slate-200 dark:border-slate-700'}`}
                      >
                        Quotidienne
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegData({ ...regData, digestFrequency: 'hebdomadaire' })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border ${regData.digestFrequency === 'hebdomadaire' ? 'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-200' : 'border-slate-200 dark:border-slate-700'}`}
                      >
                        Hebdomadaire
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegData({ ...regData, digestFrequency: 'alertes_urgentes' })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border ${regData.digestFrequency === 'alertes_urgentes' ? 'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-200' : 'border-slate-200 dark:border-slate-700'}`}
                      >
                        Alertes urgentes
                      </button>
                    </div>
                  </div>

                  {/* Checkbox agreements */}
                  <div className="pt-3 space-y-2.5">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={regData.acceptedCharter}
                        onChange={(e) => setRegData({ ...regData, acceptedCharter: e.target.checked })}
                        className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        required
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        <strong>J'adhère à la Charte d'impartialité et de vérité factuelle de Vérif 237 *</strong><br />
                        <span className="text-[11px] text-slate-500">
                          Je m'engage sur l'honneur à ne pas fabriquer ni propager délibérément de fausses informations menaçant la paix publique.
                        </span>
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={regData.receiveMonthlyKit}
                        onChange={(e) => setRegData({ ...regData, receiveMonthlyKit: e.target.checked })}
                        className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        Recevoir le kit mensuel de décryptage des deepfakes et infox au Cameroun (guides imprimables).
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={() => setRegData({ ...regData, step: 2 })}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span>
                      <span>Retour</span>
                    </button>

                    <button
                      disabled={!regData.acceptedCharter}
                      onClick={handleRegisterFinalSubmit}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Valider mon inscription citoyenne</span>
                      <span className="material-symbols-outlined text-sm">check</span>
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-emerald-600">lock</span>
                    <span>Données hébergées selon le cadre légal MINPOSTEL</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">ID Dossier : 237-CIV-8849</span>
                </div>
              </div>
            )}

            {/* CASE 5: STEP 4 (Inscription Confirmée & Succès) */}
            {authMode === 'register' && regData.step === 4 && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-4">
                  <span className="material-symbols-outlined text-sm">task_alt</span>
                  <span>Inscription civique validée avec succès</span>
                </div>

                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl">check</span>
                </div>

                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
                  Bienvenue dans la vigie citoyenne !
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Votre profil certifié <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{regData.assignedBadgeCode}</strong> est maintenant activé pour un Cameroun mieux informé.
                </p>

                {/* Recap card */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-left max-w-md mx-auto mb-6 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-3">
                    <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">RÉCAPITULATIF DE L'ACCRÉDITATION</span>
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">Vérifié ✓</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Nom & Prénom</div>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">{regData.fullName}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Région de veille</div>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">Centre <span className="font-normal text-slate-500">(Yaoundé)</span></div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Statut d'engagement</div>
                      <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">shield</span>
                        Citoyen Veilleur
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Empreinte d'authentification</div>
                      <div className="font-mono text-[10px] text-slate-600 dark:text-slate-300 mt-0.5">8F4A • 7C91 • DE23</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 max-w-md mx-auto">
                  <button
                    onClick={() => {
                      if (onLoginSuccess) onLoginSuccess(regData.fullName, 'Citoyen Veilleur');
                      setCurrentPage('accueil');
                    }}
                    className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Accéder à mon tableau de bord citoyen</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>

                  <button
                    onClick={() => alert("Numéro WhatsApp officiel Vérif 237 : +237 670 23 72 37. Ajoutez-le pour envoyer vos signalements !")}
                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2"
                  >
                    <span>📲 Installer le bot WhatsApp de vérification (+237)</span>
                  </button>
                </div>

                <div className="mt-6 text-[11px] text-slate-500">
                  <span className="material-symbols-outlined text-xs align-middle mr-1">mail</span>
                  Un e-mail récapitulatif contenant votre clé d'accès sécurisée a été envoyé à {regData.contactValue}.
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM INTERACTIVE TEST BAR (matches exact screenshot) */}
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">PARCOURS CIVIQUE VÉRIF237 :</span>
                <span className="text-slate-400 text-[11px] hidden sm:inline">Naviguez pour tester les scénarios</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleStepJump(1)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    authMode === 'register' && regData.step === 1
                      ? 'bg-emerald-700 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  1. Coordonnées
                </button>

                <button
                  onClick={() => handleStepJump(2)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    authMode === 'register' && regData.step === 2
                      ? 'bg-emerald-700 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  2. Sécurité & Région
                </button>

                <button
                  onClick={() => handleStepJump(3)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    authMode === 'register' && regData.step === 3
                      ? 'bg-emerald-700 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  3. Rôle & Charte
                </button>

                <button
                  onClick={() => handleStepJump(4)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    authMode === 'register' && regData.step === 4
                      ? 'bg-emerald-700 text-white shadow'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  4. Confirmation Succès
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
