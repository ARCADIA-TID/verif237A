import React, { useState, useEffect } from 'react';
import { NavPage } from '../types';
import { api, DashboardStats, InvestigationItem, UserItem } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { NewInvestigationModal } from '../components/verifier/NewInvestigationModal';
import { MinistriesDirectoryModal } from '../components/verifier/MinistriesDirectoryModal';
import { ReverseSearchModal } from '../components/verifier/ReverseSearchModal';
import { ExifViewerModal } from '../components/verifier/ExifViewerModal';
import { AgnesOSINTModal } from '../components/verifier/AgnesOSINTModal';

interface VerifierModeratorViewProps {
  setCurrentPage: (page: NavPage) => void;
  onOpenSuggestModal: () => void;
}

export const VerifierModeratorView: React.FC<VerifierModeratorViewProps> = ({
  setCurrentPage,
  onOpenSuggestModal
}) => {
  const { user } = useAuth();

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [investigations, setInvestigations] = useState<InvestigationItem[]>([]);
  const [accreditedUsers, setAccreditedUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterPill, setFilterPill] = useState<'active' | 'assigned' | 'review' | 'archived'>('active');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected dossier for detailed inspection modal
  const [inspectDossier, setInspectDossier] = useState<InvestigationItem | null>(null);

  // Reassignment Modal state
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [targetDossierToReassign, setTargetDossierToReassign] = useState<InvestigationItem | null>(null);
  const [selectedNewAssigneeId, setSelectedNewAssigneeId] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  // Modals for the 4 Investigation Tools
  const [newInvModalOpen, setNewInvModalOpen] = useState(false);
  const [ministriesModalOpen, setMinistriesModalOpen] = useState(false);
  const [reverseSearchModalOpen, setReverseSearchModalOpen] = useState(false);
  const [exifModalOpen, setExifModalOpen] = useState(false);
  const [agnesModalOpen, setAgnesModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'info'>('success');

  const showToast = (msg: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sData, invData, uData] = await Promise.all([
        api.getDashboardStats(),
        api.getInvestigations({
          status: selectedStatus,
          urgency: selectedPriority,
          region: selectedRegion,
          search: searchQuery
        }),
        api.getUsers()
      ]);

      setStats(sData);
      setInvestigations(invData.investigations);
      setAccreditedUsers(uData.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 25000); // 25s auto-refresh
    return () => clearInterval(interval);
  }, [selectedStatus, selectedPriority, selectedRegion, searchQuery]);

  // Actions on investigations
  const handleTakeInCharge = async (dossier: InvestigationItem) => {
    try {
      const res = await api.takeInvestigation(dossier.id, {
        userId: user?.id || 'user-2',
        userName: user?.name || 'Emmanuel Mballa'
      });
      showToast(res.message);
      loadData();
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  const handleOpenReassign = (dossier: InvestigationItem) => {
    setTargetDossierToReassign(dossier);
    setSelectedNewAssigneeId('');
    setReassignReason('');
    setReassignModalOpen(true);
  };

  const handleConfirmReassign = async () => {
    if (!targetDossierToReassign || !selectedNewAssigneeId) return;
    const targetUser = accreditedUsers.find(u => u.id === selectedNewAssigneeId);
    if (!targetUser) return;

    try {
      const res = await api.assignInvestigation(targetDossierToReassign.id, {
        targetUserId: targetUser.id,
        targetUserName: `${targetUser.name} (${targetUser.role})`,
        reason: reassignReason,
        actorName: user?.name || 'Superviseur'
      });
      showToast(res.message);
      setReassignModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  const handleSignDossier = async (dossier: InvestigationItem) => {
    try {
      const res = await api.signInvestigation(dossier.id, {
        userId: user?.id || 'user-2',
        userName: user?.name || 'Emmanuel Mballa',
        role: user?.roleLabel || 'Réviseur Sénior',
        verdict: 'FAUX',
        verdictLabel: 'FAUX ET TENTATIVE D’ESCROQUERIE'
      });

      showToast(res.message);
      loadData();
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  // Filter pills
  const filteredCases = investigations.filter((item) => {
    if (filterPill === 'assigned') {
      return item.assignedTo.includes(user?.name?.split(' ')[0] || 'Mballa');
    }
    if (filterPill === 'review') {
      return item.status === 'contre_expertise';
    }
    if (filterPill === 'archived') {
      return item.status === 'completed' || item.status === 'rejected';
    }
    return item.status !== 'completed' && item.status !== 'rejected';
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0c1420] text-slate-800 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8 transition-colors">
      
      {/* Toast Alert */}
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
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Espace Vérificateur & Modérateur</span>
            <span>&gt;</span>
            <span className="text-[#007953] dark:text-emerald-400 font-bold">Console d'Investigation Factuelle</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 font-mono text-[11px]">
              <span className="material-symbols-outlined text-xs">key</span>
              <span>Clé cryptographique active (SHA-256 scellé)</span>
            </span>

            <span className="inline-flex items-center gap-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Session : {user?.name || 'E. Mballa (Cellule Juridique • Réviseur Senior)'}</span>
            </span>
          </div>
        </div>

        {/* HEADER TITLE & ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-headline">
              Console d'Investigation & Modération Civique
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Traitement déontologique des signalements citoyens, analyse forensique des pièces à conviction et validation collégiale des verdicts pour l'ensemble du territoire camerounais.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                loadData();
                showToast("Flux WhatsApp, Facebook et signalements citoyens synchronisés en direct.");
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">sync</span>
              <span>Synchroniser flux</span>
            </button>

            <button
              onClick={() => setNewInvModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#007953] hover:bg-[#006344] text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>+ Nouvelle fiche d'investigation</span>
            </button>
          </div>
        </div>

        {/* 5 TOP DYNAMIC METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
              <span>EN ATTENTE</span>
              <span className="material-symbols-outlined text-red-500 text-base">inbox</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.pendingVerifications ?? 2}
            </div>
            <div className="text-[10px] text-red-600 dark:text-red-400 font-bold mt-1">
              ! Urgences arnaques actives
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
              <span>EN INSTRUCTION</span>
              <span className="material-symbols-outlined text-blue-500 text-base">assignment</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.inReviewVerifications ?? 2}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Dépouillement technique</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
              <span>CONTRE-EXPERTISE</span>
              <span className="material-symbols-outlined text-amber-500 text-base">draw</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.pendingDoubleSignatures ?? 1}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Règle des 2 signatures</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
              <span>PUBLIÉS SCELLÉS</span>
              <span className="material-symbols-outlined text-emerald-500 text-base">verified</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.completedVerifications ?? 1}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              Hachage SHA-256 certifié
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
              <span>ACTES VALIDÉS</span>
              <span className="material-symbols-outlined text-purple-500 text-base">history</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">37</div>
            <div className="text-[10px] text-slate-500 mt-1">Ministères interconnectés</div>
          </div>

        </div>

        {/* COUPE-FILE D'URGENCE VIRALE (Red Card) */}
        <div className="bg-[#fef2f2] dark:bg-red-950/40 border border-red-300 dark:border-red-900/60 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-red-700 text-white font-extrabold px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
                  COUPE-FILE D'URGENCE VIRALE #VIGIE-991
                </span>
                <span className="text-red-800 dark:text-red-300 font-bold">
                  ⏱ Échéance d'intervention recommandée : &lt; 35 min
                </span>
                <span className="text-slate-500">• Diffusion estimée : +400 groupes WhatsApp (Douala & Yaoundé)</span>
              </div>

              <h2 className="text-base sm:text-lg font-extrabold text-red-950 dark:text-red-100">
                Alerte Phishing / Fraude : Faux concours direct à la Douane camerounaise avec lien de paiement Orange Money & MTN MoMo
              </h2>

              <p className="text-xs text-red-900/80 dark:text-red-200/80 leading-relaxed max-w-4xl">
                Les escrocs réclament 12 500 FCFA de « frais de dossier express ». Risque de préjudice financier élevé pour des milliers de candidats étudiants. Aucune trace dans le Journal Officiel.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  showToast(`Dossier #VIGIE-991 pris en charge par ${user?.name || 'E. Mballa'}`);
                  loadData();
                }}
                className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">front_hand</span>
                <span>Prendre en charge</span>
              </button>
              <button
                onClick={() => {
                  showToast("Dossier #VIGIE-991 attribué à la cellule de garde DGD.");
                  loadData();
                }}
                className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Assigner de garde
              </button>
            </div>
          </div>
        </div>

        {/* FILTERS & PILLS BAR */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Statut :</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending_review">En attente d'attribution</option>
                <option value="en_instruction">En instruction</option>
                <option value="contre_expertise">Contre-expertise (2e signature)</option>
                <option value="completed">Scellés & Publiés</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Priorité :</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
              >
                <option value="all">Toutes priorités</option>
                <option value="haute">Urgences hautes</option>
                <option value="normale">Priorité standard</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Recherche mot-clé :</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex : Police, timbre, bourses..."
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Région :</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
              >
                <option value="all">National (Toutes)</option>
                <option value="Centre">Centre (Yaoundé)</option>
                <option value="Littoral">Littoral (Douala)</option>
                <option value="Nord-Ouest">Nord-Ouest</option>
                <option value="Extrême-Nord">Extrême-Nord</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <button
              onClick={() => setFilterPill('active')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterPill === 'active'
                  ? 'bg-slate-900 text-white dark:bg-emerald-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              File active <span className="ml-1 opacity-80">{investigations.filter(i => i.status !== 'completed').length}</span>
            </button>

            <button
              onClick={() => setFilterPill('assigned')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterPill === 'assigned'
                  ? 'bg-slate-900 text-white dark:bg-emerald-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Mes dossiers assignés
            </button>

            <button
              onClick={() => setFilterPill('review')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterPill === 'review'
                  ? 'bg-slate-900 text-white dark:bg-emerald-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              En attente de signature 2 (Relecteur collégial) <span className="ml-1 opacity-80">{investigations.filter(i => i.status === 'contre_expertise').length}</span>
            </button>

            <button
              onClick={() => setFilterPill('archived')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterPill === 'archived'
                  ? 'bg-slate-900 text-white dark:bg-emerald-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Dossiers scellés & Archives
            </button>
          </div>
        </div>

        {/* CASE CARDS LIST */}
        <div className="space-y-4">
          {filteredCases.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2">find_in_page</span>
              <p className="font-semibold text-sm">Aucun dossier ne correspond aux critères de filtre sélectionnés.</p>
            </div>
          ) : (
            filteredCases.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {item.previewImageUrl ? (
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-950 shrink-0 relative border border-slate-200 dark:border-slate-700">
                        <img
                          src={item.previewImageUrl}
                          alt="Preuve"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/80 px-1 text-[9px] font-mono text-white rounded">
                          {item.previewTag || 'Pièce'}
                        </span>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                        <span className="material-symbols-outlined text-2xl">description</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-[#007953] dark:text-emerald-400">{item.code}</span>
                        <span className="text-slate-400">• {item.timeAgo}</span>
                        <span className="text-slate-400">• {item.sourceType}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.urgency === 'haute'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {item.urgencyLabel}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Assigné à : <strong>{item.assignedTo}</strong>
                        </span>
                        <span>• Portée : {item.scope}</span>
                        {item.signatures?.isSealed && item.signatures.sealedHash && (
                          <span className="font-mono text-[10px] text-emerald-600 font-bold">
                            Hash SHA-256 : {item.signatures.sealedHash.slice(0, 16)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons on card */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-center">
                    
                    <button
                      onClick={() => setInspectDossier(item)}
                      className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      <span>Détails & Analyse</span>
                    </button>

                    <button
                      onClick={() => handleTakeInCharge(item)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">front_hand</span>
                      <span>Prendre en charge</span>
                    </button>

                    <button
                      onClick={() => handleOpenReassign(item)}
                      className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      Assigner
                    </button>

                    {item.status !== 'completed' && (
                      <button
                        onClick={() => handleSignDossier(item)}
                        className="px-4 py-2 rounded-xl bg-[#007953] hover:bg-[#006344] text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">draw</span>
                        <span>
                          {item.status === 'contre_expertise'
                            ? 'Contresigner & Sceller (Signature 2)'
                            : 'Apposer Signature 1'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Pre-analysis quick accordion if available */}
                {item.preAnalysis && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-[#007953]">auto_awesome</span>
                      <span>Synthèse Automatique Préliminaire :</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      {item.preAnalysis.neutralSummary}
                    </p>
                    {item.preAnalysis.detectedEntities.ministries.length > 0 && (
                      <div className="text-[10px] text-slate-500 pt-0.5">
                        Institutions identifiées : <strong>{item.preAnalysis.detectedEntities.ministries.join(', ')}</strong>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ))
          )}
        </div>

        {/* BOTTOM TWO WIDE CARDS (Matches Image 12) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 text-xs">
          
          {/* Protocole Déontologique des 4 Étapes */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#007953]">verified_user</span>
                Protocole Déontologique des 4 Étapes
              </h3>
              <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300">
                Standard IFCN Cameroun
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-6">
              Chaque verdict publié par Vérif 237 engage la neutralité républicaine de la plateforme. Aucune fiche ne peut être scellée sans la validation intégrale des étapes ci-dessous :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-[#007953] text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>Forensique & EXIF</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Extraction des métadonnées, recherche inversée multi-moteurs (Google, TinEye, Yandex) et analyse d'artefacts graphiques.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-[#007953] text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>Confrontation Primaire</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Consultation directe du Journal Officiel de la République ou contact vérifié avec la cellule de communication ministérielle.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-[#007953] text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  <span>Rédaction Dispassionnée</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Interdiction formelle de jugements de valeur ou d'adjectifs polémiques. Présentation purement factuelle des pièces probantes.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-[#007953] text-white text-[10px] flex items-center justify-center font-bold">4</span>
                  <span>Double Signature Collégiale</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Contre-lecture obligatoire par un juriste ou réviseur indépendant avant scellement horodaté SHA-256 dans l'archive publique.
                </p>
              </div>
            </div>
          </div>

          {/* Ressources & Outils Forensiques (Interactive real tools!) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#007953]">handyman</span>
                  <span>Ressources & Outils Forensiques Connectés</span>
                </h3>
                <span className="text-slate-400 text-[11px]">Services Opérationnels</span>
              </div>

              <div className="space-y-2.5">
                
                {/* Tool 1: Répertoire Officiel */}
                <div
                  onClick={() => setMinistriesModalOpen(true)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between group cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#007953] text-lg">menu_book</span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Répertoire Officiel Vérif 237</div>
                      <div className="text-[11px] text-slate-500">Recherche plein texte dans 4 200 lois, décrets et arrêtés</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-slate-600">open_in_new</span>
                </div>

                {/* Tool 2: Recherche Inversée */}
                <div
                  onClick={() => setReverseSearchModalOpen(true)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between group cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#007953] text-lg">travel_explore</span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Méta-moteur Recherche Inversée</div>
                      <div className="text-[11px] text-slate-500">Lancement multi-moteurs Google Lens / TinEye / Yandex / Wayback</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-slate-600">open_in_new</span>
                </div>

                {/* Tool 3: Visualiseur EXIF */}
                <div
                  onClick={() => setExifModalOpen(true)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between group cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#007953] text-lg">data_object</span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Visualiseur EXIF & Détection Photoshop</div>
                      <div className="text-[11px] text-slate-500">Analyse des couches d'erreur ELA et artefacts de compression</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-slate-600">open_in_new</span>
                </div>

                {/* Tool 4: Module AgNES */}
                <div
                  onClick={() => setAgnesModalOpen(true)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between group cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-purple-600 text-lg">psychology</span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Module AgNES & Rapprochement Juridique</div>
                      <div className="text-[11px] text-slate-500">Algorithme National d'Enquête & Scellement (Confrontation JO)</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-slate-600">open_in_new</span>
                </div>

              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 text-center">
              Tous les outils sont conformes au RGPD et à la loi camerounaise N° 2010/012 sur la cybersécurité.
            </div>
          </div>

        </div>

      </div>

      {/* REASSIGNMENT MODAL */}
      {reassignModalOpen && targetDossierToReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#007953]">assignment_ind</span>
              <span>Assigner le dossier {targetDossierToReassign.code}</span>
            </h3>

            <p className="text-slate-500 text-[11px]">
              Sélectionnez un enquêteur ou juriste accrédité pour prendre en charge l'instruction contradictoire.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Collaborateur accrédité :
              </label>
              <select
                value={selectedNewAssigneeId}
                onChange={(e) => setSelectedNewAssigneeId(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-semibold"
              >
                <option value="">Sélectionner un collaborateur...</option>
                {accreditedUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.role} ({u.jurisdiction})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Motif de l'attribution / consignes :
              </label>
              <input
                type="text"
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="Ex : Compétence territoriale Littoral & contact DGSN requis"
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setReassignModalOpen(false)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmReassign}
                disabled={!selectedNewAssigneeId}
                className="px-4 py-2 rounded-xl bg-[#007953] hover:bg-[#006344] text-white font-bold cursor-pointer disabled:opacity-50"
              >
                Confirmer l'attribution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT DOSSIER MODAL */}
      {inspectDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl p-6 text-xs space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="font-mono font-bold text-[#007953] dark:text-emerald-400 text-sm">
                  {inspectDossier.code}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {inspectDossier.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectDossier(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px]">Déclaration intégrale :</h4>
                <p className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {inspectDossier.description}
                </p>
              </div>

              {inspectDossier.preAnalysis && (
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    <span>Analyse Automatique Préliminaire</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    {inspectDossier.preAnalysis.neutralSummary}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60 text-[11px]">
                    <div>
                      <span className="text-slate-400 block font-semibold">Institutions concernées :</span>
                      <span>{inspectDossier.preAnalysis.detectedEntities.ministries.join(', ') || 'Aucune'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Lieux identifiés :</span>
                      <span>{inspectDossier.preAnalysis.detectedEntities.locations.join(', ') || 'National'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] mb-1">
                  Journal des investigations ({inspectDossier.notes?.length || 0}) :
                </h4>
                <div className="space-y-1.5">
                  {inspectDossier.notes?.map((n, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{n.author}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(n.createdAt).toLocaleTimeString('fr-FR')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{n.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectDossier(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALL TOOL MODALS */}
      <NewInvestigationModal
        isOpen={newInvModalOpen}
        onClose={() => setNewInvModalOpen(false)}
        accreditedUsers={accreditedUsers}
        onCreated={() => {
          showToast("Nouvelle fiche d'investigation enregistrée.");
          loadData();
        }}
      />

      <MinistriesDirectoryModal
        isOpen={ministriesModalOpen}
        onClose={() => setMinistriesModalOpen(false)}
        onSelectMinistry={(m) => showToast(`Institution ${m} sélectionnée pour confrontation.`)}
      />

      <ReverseSearchModal
        isOpen={reverseSearchModalOpen}
        onClose={() => setReverseSearchModalOpen(false)}
        onSaveReference={(engine, refUrl) => showToast(`Référence ${engine} consignée.`)}
      />

      <ExifViewerModal
        isOpen={exifModalOpen}
        onClose={() => setExifModalOpen(false)}
        onSaveEvidence={(evidence) => showToast(`Preuve d'analyse d'image ajoutée au dossier.`)}
      />

      <AgnesOSINTModal
        isOpen={agnesModalOpen}
        onClose={() => setAgnesModalOpen(false)}
        onAttachDecree={(d) => showToast(`Arrêté officiel ${d} joint au dossier.`)}
      />

    </div>
  );
};
