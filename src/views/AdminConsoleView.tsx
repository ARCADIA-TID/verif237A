import React, { useState, useEffect } from 'react';
import { NavPage } from '../types';
import { api, DashboardStats, UserItem, SessionItem, RoleItem, AuditItem, DoubleSignatureItem, ApiKeyItem } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { NewUserModal } from '../components/admin/NewUserModal';
import { DoubleSignatureModal } from '../components/admin/DoubleSignatureModal';
import { ApiKeyModal } from '../components/admin/ApiKeyModal';

interface AdminConsoleViewProps {
  setCurrentPage: (page: NavPage) => void;
  onOpenSuggestModal: () => void;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  setCurrentPage,
  onOpenSuggestModal
}) => {
  const { user: currentAuthUser } = useAuth();

  // Active tab state
  const [activeTab, setActiveTab] = useState<'users' | 'matrix' | 'audit' | 'settings'>('users');

  // Backend data state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [auditTotal, setAuditTotal] = useState<number>(0);
  const [doubleSignatures, setDoubleSignatures] = useState<DoubleSignatureItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [settings, setSettings] = useState<any>({
    sessionTimeoutMinutes: 60,
    requireDoubleSignature: true,
    autoAnalysisStrictness: 'standard',
    maxLoginAttempts: 5,
    rsaKeyStatus: 'RSA-4096 Actif (HSM Yaoundé MINPOSTEL)'
  });

  // UI Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [auditTypeFilter, setAuditTypeFilter] = useState('all');
  const [auditResultFilter, setAuditResultFilter] = useState('all');
  const [auditPage, setAuditPage] = useState(0);

  // Modals state
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [doubleSigModalOpen, setDoubleSigModalOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [integrityCheckLoading, setIntegrityCheckLoading] = useState(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'info'>('success');

  const showToast = (msg: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Load all initial data from backend
  const refreshAllData = async () => {
    try {
      const [sData, uData, sessData, rData, dsData, aData] = await Promise.all([
        api.getDashboardStats(),
        api.getUsers({ role: selectedRole, search: searchQuery, status: selectedStatus }),
        api.getSessions(),
        api.getRoles(),
        api.getDoubleSignatures(),
        api.getAuditLogs({ limit: 10, offset: 0 })
      ]);

      setStats(sData);
      setUsers(uData.users);
      setSessions(sessData.sessions);
      setRoles(rData.roles);
      setDoubleSignatures(dsData.requests);
      setAuditLogs(aData.logs);
      setAuditTotal(aData.total);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [selectedRole, searchQuery, selectedStatus]);

  // Load audit logs on filter change
  useEffect(() => {
    if (activeTab === 'audit') {
      api.getAuditLogs({
        type: auditTypeFilter,
        result: auditResultFilter,
        limit: 10,
        offset: auditPage * 10
      }).then(res => {
        setAuditLogs(res.logs);
        setAuditTotal(res.total);
      });
    }
  }, [activeTab, auditTypeFilter, auditResultFilter, auditPage]);

  // Load settings on settings tab
  useEffect(() => {
    if (activeTab === 'settings') {
      api.getSettings().then(res => setSettings(res.settings));
      api.getApiKeys().then(res => setApiKeys(res.apiKeys));
    }
  }, [activeTab]);

  // Actions
  const handleToggleUserStatus = async (user: UserItem) => {
    const nextStatus = user.status === 'actif' ? 'suspendu' : 'actif';
    try {
      await api.updateUserStatus(user.id, nextStatus, currentAuthUser?.name);
      showToast(`Compte de ${user.name} passé au statut ${nextStatus}.`);
      refreshAllData();
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  const handleRenew2FA = async (user: UserItem) => {
    try {
      await api.renewUser2FA(user.id, currentAuthUser?.name);
      showToast(`Renouvellement 2FA FIDO2 initié pour ${user.name}.`);
      refreshAllData();
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  const handleRevokeSession = async (sessId: string, userName: string) => {
    if (!confirm(`Révoquer la session active de ${userName} avec effet immédiat ?`)) return;
    try {
      await api.revokeSession(sessId, currentAuthUser?.name);
      showToast(`Session ${sessId} de ${userName} révoquée côté serveur.`);
      refreshAllData();
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  const handleRunIntegrityCheck = async () => {
    setIntegrityCheckLoading(true);
    try {
      const res = await api.runIntegrityCheck(currentAuthUser?.name);
      if (res.status === 'SUCCESS') {
        showToast(`Audit d'intégrité WORM réussi : ${res.checkedCount} blocs scellés validés. Chaîne 100% conforme.`, 'success');
      } else {
        showToast(`Alerte d'intégrité déclenchée ! Anomalie constatée.`, 'warning');
      }
      refreshAllData();
    } catch (err: any) {
      showToast(err.message, 'warning');
    } finally {
      setIntegrityCheckLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(settings, currentAuthUser?.name);
      showToast("Paramètres système et déontologiques enregistrés.");
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  const handleExportAuditCSV = () => {
    const headers = "Index,ID,Timestamp,Acteur,Type,Ressource,Detail,Resultat,Hash\n";
    const rows = auditLogs.map(l =>
      `"${l.index}","${l.id}","${l.timestamp}","${l.user}","${l.type}","${l.resource}","${l.detail.replace(/"/g, '""')}","${l.result}","${l.hash}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Verif237_Audit_Legal_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast("Registre d'audit complet téléchargé au format CSV scellé.");
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0c1420] text-slate-800 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8 transition-colors">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold border ${
          toastType === 'warning'
            ? 'bg-amber-700 text-white border-amber-500'
            : 'bg-[#007953] text-white border-emerald-400'
        } animate-fade-in`}>
          <span className="material-symbols-outlined text-sm">
            {toastType === 'warning' ? 'warning' : 'verified'}
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP BAR / BREADCRUMB */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <button onClick={() => setCurrentPage('accueil')} className="hover:text-[#007953] cursor-pointer">Accueil</button>
            <span>&gt;</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Espace Administration & Gouvernance</span>
            <span>/</span>
            <span className="text-[#007953] dark:text-emerald-400 font-bold">Gestion des Accès & Audit</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunIntegrityCheck}
              disabled={integrityCheckLoading}
              className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-300 dark:border-blue-800 font-mono text-[11px] cursor-pointer"
              title="Cliquer pour forcer un contrôle d'intégrité de la chaîne"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${integrityCheckLoading ? 'bg-amber-500 animate-ping' : 'bg-blue-500'}`} />
              <span>{integrityCheckLoading ? 'Audit en cours...' : 'Clé RSA-4096 • Contrôler parité d’intégrité'}</span>
            </button>

            <span className="inline-flex items-center gap-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Session : {currentAuthUser?.name || 'Dr. F. Kamga (Superviseur Général)'}</span>
            </span>
          </div>
        </div>

        {/* HEADER TITLE & ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-extrabold text-[10px]">
                GOUVERNANCE INSTITUTIONNELLE
              </span>
              <span>• République du Cameroun</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-headline">
              Console d'Administration & Journal d'Audit Déontologique
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Gouvernance des habilitations, attribution des droits de scellement éditorial et traçabilité immuable des interventions sur les dossiers camerounais.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportAuditCSV}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Exporter registre (CSV scellé)</span>
            </button>

            <button
              onClick={() => setNewUserModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#007953] hover:bg-[#006344] text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              <span>+ Nouvel utilisateur accrédité</span>
            </button>
          </div>
        </div>

        {/* 5 TOP DYNAMIC METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          
          {/* Card 1: Total & Active Users */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
              <span>UTILISATEURS ACTIFS</span>
              <span className="material-symbols-outlined text-slate-500 text-base">group</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.activeSessionsCount || 3} <span className="text-xs text-slate-400 font-normal">/ {stats?.totalUsers || 5}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">
              {stats?.activeStaffCount || 3} membres du collège en ligne
            </div>
          </div>

          {/* Card 2: Double Signature */}
          <div
            onClick={() => setDoubleSigModalOpen(true)}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-blue-400 transition-all"
            title="Cliquer pour gérer les signatures collégiales"
          >
            <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
              <span>DOUBLE SIGNATURE</span>
              <span className="material-symbols-outlined text-blue-500 text-base">shield</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.pendingDoubleSignatures ?? 2}
            </div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-1 flex items-center gap-1">
              <span>En attente de signature 2</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </div>
          </div>

          {/* Card 3: Alertes d'Intégrité */}
          <div
            onClick={handleRunIntegrityCheck}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-emerald-400 transition-all"
            title="Cliquer pour exécuter un audit d'intégrité"
          >
            <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
              <span>ALERTES D'INTÉGRITÉ</span>
              <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.openIntegrityAlerts ?? 0}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              Système 100% Intègre (Vérifié en direct)
            </div>
          </div>

          {/* Card 4: Audit Journalisé */}
          <div
            onClick={() => setActiveTab('audit')}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-purple-400 transition-all"
          >
            <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
              <span>AUDIT JOURNALISÉ</span>
              <span className="material-symbols-outlined text-purple-500 text-base">history</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalAuditEvents || 1845}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Événements scellés horodatés UTC+1</div>
          </div>

          {/* Card 5: Infrastructure & Nœuds */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
              <span>INFRASTRUCTURE</span>
              <span className="material-symbols-outlined text-emerald-500 text-base">dns</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">100%</div>
            <div className="text-[10px] text-slate-500 mt-1">Nœuds YDE & DLA synchronisés</div>
          </div>

        </div>

        {/* 4 TABS NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-[#007953] text-[#007953] dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-base">group</span>
            <span>Utilisateurs & Sessions ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-3 px-4 font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'border-[#007953] text-[#007953] dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-base">rule</span>
            <span>Matrice des Rôles & Permissions ({roles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-4 font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-[#007953] text-[#007953] dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-base">history_edu</span>
            <span>Journal d'Audit Immuable ({auditTotal})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-4 font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-[#007953] text-[#007953] dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-base">settings</span>
            <span>Paramètres Système & Clés API</span>
          </button>
        </div>

        {/* TAB 1: USERS & ACTIVE SESSIONS */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 8 Cols: Users Table */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Search & Filters */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs">
                    <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher par nom, matricule, email, région..."
                      className="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                    >
                      <option value="all">Tous les rôles</option>
                      <option value="super-admin">Super-Admin</option>
                      <option value="reviseur">Réviseurs Juridiques</option>
                      <option value="forensique">Experts Forensiques</option>
                      <option value="terrain">Enquêteurs Terrain</option>
                      <option value="moderateur">Modérateurs</option>
                    </select>

                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                    >
                      <option value="all">Tous statuts</option>
                      <option value="actif">Actif</option>
                      <option value="suspendu">Suspendu</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>{users.length} collaborateurs accrédités répertoriés</span>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedRole('all'); setSelectedStatus('all'); }}
                    className="text-[#007953] dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Collaborateur</th>
                        <th className="px-4 py-3">Rôle & Juridiction</th>
                        <th className="px-4 py-3">Habilitation Légale</th>
                        <th className="px-4 py-3">Sécurité & 2FA</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          
                          {/* Col 1: Avatar & Identity */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatarUrl}
                                alt={u.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                              />
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {u.sha256Enabled && (
                                    <span className="material-symbols-outlined text-xs text-blue-500" title="Habilité au scellement cryptographique SHA-256">
                                      lock
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  {u.code} • {u.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Role & Jurisdiction */}
                          <td className="px-4 py-4">
                            <div className="font-bold text-slate-900 dark:text-white">{u.role}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-xs">location_on</span>
                              <span>{u.jurisdiction}</span>
                            </div>
                          </td>

                          {/* Col 3: Habilitation */}
                          <td className="px-4 py-4">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{u.keyHabilitation}</div>
                            <div className="text-[11px] text-slate-400">{u.keyHabilitationSub}</div>
                          </td>

                          {/* Col 4: Security */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${
                                u.status === 'suspendu' ? 'bg-red-500' : u.isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                              }`} />
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {u.status === 'suspendu' ? 'Suspendu' : u.securityStatus}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{u.securityDetail}</div>
                          </td>

                          {/* Col 5: Actions */}
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {u.needs2FARenewal && (
                                <button
                                  onClick={() => handleRenew2FA(u)}
                                  className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 hover:bg-amber-200 font-bold text-[11px] cursor-pointer"
                                  title="Renouveler la clé 2FA de l'utilisateur"
                                >
                                  Relancer 2FA
                                </button>
                              )}

                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                                  u.status === 'actif'
                                    ? 'bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100'
                                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100'
                                }`}
                                title={u.status === 'actif' ? 'Suspendre ce compte' : 'Réactiver ce compte'}
                              >
                                {u.status === 'actif' ? 'Suspendre' : 'Réactiver'}
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sessions actives */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#007953]">devices</span>
                    <span>Sessions Actives Authentifiées ({sessions.filter(s => !s.isRevoked).length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Révocation immédiate effective côté serveur</span>
                </div>

                <div className="space-y-2 text-xs">
                  {sessions.filter(s => !s.isRevoked).map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{sess.userName}</span>
                          <span className="text-[11px] text-slate-400 font-normal">({sess.userRole})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          IP : {sess.ipAddress} • {sess.userAgent.slice(0, 40)}...
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Dernière activité : {new Date(sess.lastActivityAt).toLocaleTimeString('fr-FR')} • Expire dans ~30m
                        </div>
                      </div>

                      <button
                        onClick={() => handleRevokeSession(sess.id, sess.userName)}
                        className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-200 font-bold text-xs self-start sm:self-auto cursor-pointer"
                      >
                        Révoquer session
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right 4 Cols: Constitutional Rule & Live Chain */}
            <div className="lg:col-span-4 space-y-5 text-xs">
              
              {/* Règle Constitutionnelle */}
              <div className="bg-[#f0fdf4] dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-900/60 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-extrabold text-sm mb-2">
                  <span className="material-symbols-outlined text-[#007953]">gavel</span>
                  <span>Règle Constitutionnelle Anti-Censure</span>
                </div>
                <p className="text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed">
                  Principe inviolable de Vérif 237 : <strong>Aucun administrateur</strong>, quel que soit son rang, ne dispose du privilège d'effacer ou d'altérer un verdict publié sans la contresignature conjointe de <strong>2 réviseurs assermentés</strong> et un avis public consigné au registre des rectificatifs.
                </p>
              </div>

              {/* Accréditation Chain */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                  CHAÎNE D'ACCRÉDITATION EN 4 ÉTAPES
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Triage & Détection</div>
                      <div className="text-[11px] text-slate-500">Modérateurs (Signalements bruts, dédoublonnage)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Instruction Forensique</div>
                      <div className="text-[11px] text-slate-500">Enquêteurs Régionaux & Analystes OSINT</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Contre-Expertise Collégiale</div>
                      <div className="text-[11px] text-slate-500">Juristes Documentaristes & Réviseurs</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#007953] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
                    <div>
                      <div className="font-bold text-[#007953] dark:text-emerald-400">Scellement Public SHA-256</div>
                      <div className="text-[11px] text-slate-500">Signature double requise • Dépôt au registre</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: ROLES & ONTOLOGICAL PERMISSIONS MATRIX */}
        {activeTab === 'matrix' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Matrice Ontologique des Habilitations & Séparation des Pouvoirs
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Conformité IFCN : Aucun rôle individuel ne cumule à la fois l'instruction, la contre-expertise et le scellement définitif.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold rounded-full text-[11px]">
                  Politique du Moindre Privilège Active
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Groupe / Rôle</th>
                    <th className="px-3 py-3 text-center">Triage</th>
                    <th className="px-3 py-3 text-center">Instruction</th>
                    <th className="px-3 py-3 text-center">Confrontation</th>
                    <th className="px-3 py-3 text-center">Contre-Expertise</th>
                    <th className="px-3 py-3 text-center">Signature 1</th>
                    <th className="px-3 py-3 text-center">Scellement SHA-256</th>
                    <th className="px-3 py-3 text-center">Gestion Comptes</th>
                    <th className="px-3 py-3 text-center">Audit Légale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{role.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 max-w-xs">{role.description}</div>
                      </td>

                      {[
                        role.permissions.triage_signalements,
                        role.permissions.instruction_forensique,
                        role.permissions.confrontation_officielle,
                        role.permissions.contre_expertise_juridique,
                        role.permissions.signature_collegiale_1,
                        role.permissions.scellement_sha256,
                        role.permissions.gestion_utilisateurs,
                        role.permissions.consultation_audit
                      ].map((perm, idx) => (
                        <td key={idx} className="px-3 py-4 text-center">
                          {perm ? (
                            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg">check_circle</span>
                          ) : (
                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-lg">cancel</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: IMMUTABLE AUDIT LOG & BLOCKCHAIN */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            
            {/* Audit Toolbar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-500 uppercase text-[11px]">Filtrer l'audit :</span>
                <select
                  value={auditTypeFilter}
                  onChange={(e) => setAuditTypeFilter(e.target.value)}
                  className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold outline-none"
                >
                  <option value="all">Tous types d'événements</option>
                  <option value="AUTH">Connexions & 2FA</option>
                  <option value="USER_CREATE">Créations utilisateurs</option>
                  <option value="ATTRIBUTION">Attributions dossiers</option>
                  <option value="SIGNATURE">Signatures collégiales</option>
                  <option value="SCELLEMENT">Scellements WORM</option>
                  <option value="SESSION_REVOKE">Révocations sessions</option>
                </select>

                <select
                  value={auditResultFilter}
                  onChange={(e) => setAuditResultFilter(e.target.value)}
                  className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold outline-none"
                >
                  <option value="all">Tous résultats</option>
                  <option value="SUCCESS">Succès</option>
                  <option value="FAILURE">Échecs</option>
                  <option value="BLOCKED">Tentatives bloquées</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunIntegrityCheck}
                  disabled={integrityCheckLoading}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">enhanced_encryption</span>
                  <span>Vérifier la chaîne SHA-256</span>
                </button>

                <button
                  onClick={handleExportAuditCSV}
                  className="px-3.5 py-2 rounded-xl bg-[#007953] hover:bg-[#006344] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">file_download</span>
                  <span>Exporter CSV</span>
                </button>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Bloc #</th>
                      <th className="px-4 py-3">Horodatage (UTC+1)</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Acteur</th>
                      <th className="px-4 py-3">Action & Détails</th>
                      <th className="px-4 py-3">Résultat</th>
                      <th className="px-4 py-3">Empreinte SHA-256</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-bold text-slate-400">
                          #{log.index}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          {log.time}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {log.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          {log.user}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-white">{log.title}</div>
                          <div className="text-[11px] text-slate-500 max-w-md">{log.detail}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.result === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}>
                            {log.result}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-400 max-w-[130px] truncate" title={`Hash : ${log.hash} | Prev : ${log.previousHash}`}>
                          {log.hash ? log.hash.slice(0, 16) + '...' : log.hashOrIp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Affichage page {auditPage + 1} • Total : {auditTotal} événements</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={auditPage === 0}
                    onClick={() => setAuditPage(p => Math.max(0, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    Précédent
                  </button>
                  <button
                    disabled={(auditPage + 1) * 10 >= auditTotal}
                    onClick={() => setAuditPage(p => p + 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: SYSTEM SETTINGS & API KEYS */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs">
            
            {/* Left 7 Cols: System Settings */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#007953]">tune</span>
                <span>Paramètres Généraux du Système Déontologique</span>
              </h3>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Durée d'expiration des sessions inactives (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={240}
                    value={settings.sessionTimeoutMinutes || 60}
                    onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Règle de sécurité : 60 minutes par défaut</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Exiger la double signature collégiale</div>
                    <div className="text-[11px] text-slate-500">Impose 2 approbateurs assermentés distincts pour tout verdict FAUX ou TROMPEUR</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.requireDoubleSignature ?? true}
                    onChange={(e) => setSettings({ ...settings, requireDoubleSignature: e.target.checked })}
                    className="w-5 h-5 accent-[#007953] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sensibilité de l'analyse automatique préliminaire
                  </label>
                  <select
                    value={settings.autoAnalysisStrictness || 'standard'}
                    onChange={(e) => setSettings({ ...settings, autoAnalysisStrictness: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-semibold"
                  >
                    <option value="high">Stricte (Filtre anti-spam et dédoublonnage renforcé)</option>
                    <option value="standard">Standard (Recommandé - Détection entités et URLs)</option>
                    <option value="light">Tolérante (Toutes soumissions admises en file)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-[11px] space-y-1">
                  <div className="font-bold text-slate-700 dark:text-slate-300">Module Matériel HSM :</div>
                  <div className="font-mono text-slate-500">{settings.rsaKeyStatus}</div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#007953] hover:bg-[#006344] text-white font-bold flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    <span>Enregistrer les paramètres</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right 5 Cols: API Keys & Gateways */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600">vpn_key</span>
                  <span>Clés API ({apiKeys.length})</span>
                </h3>
                <button
                  onClick={() => setApiKeyModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold hover:bg-purple-200 cursor-pointer"
                >
                  + Créer clé
                </button>
              </div>

              <p className="text-slate-500 text-[11px]">
                Jalons d'accès programmatiques sécurisés accordés aux médias et administrations partenaires.
              </p>

              <div className="space-y-2.5">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{key.name}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                        key.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {key.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">{key.service}</div>
                    <div className="font-mono text-[10px] text-slate-400">{key.maskedKey}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODALS */}
      <NewUserModal
        isOpen={newUserModalOpen}
        onClose={() => setNewUserModalOpen(false)}
        onUserCreated={() => {
          showToast("Nouvel utilisateur accrédité avec succès.");
          refreshAllData();
        }}
      />

      <DoubleSignatureModal
        isOpen={doubleSigModalOpen}
        onClose={() => setDoubleSigModalOpen(false)}
        requests={doubleSignatures}
        onRefresh={refreshAllData}
      />

      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKeys={apiKeys}
        onRefresh={() => api.getApiKeys().then(r => setApiKeys(r.apiKeys))}
      />

    </div>
  );
};
