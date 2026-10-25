import React, { useState } from 'react';
import { api, UserItem } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface NewInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  accreditedUsers: UserItem[];
  onCreated: () => void;
}

export const NewInvestigationModal: React.FC<NewInvestigationModalProps> = ({
  isOpen,
  onClose,
  accreditedUsers,
  onCreated
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceType, setSourceType] = useState('WhatsApp citoyen');
  const [sourceUrl, setSourceUrl] = useState('');
  const [urgency, setUrgency] = useState<'haute' | 'normale' | 'faible'>('normale');
  const [scope, setScope] = useState('National (Toutes régions)');
  const [assignedToId, setAssignedToId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || !description.trim()) {
      setErrorMessage('Le titre et la description détaillée de la rumeur sont obligatoires.');
      return;
    }

    const assignedUser = accreditedUsers.find(u => u.id === assignedToId);
    setIsSubmitting(true);

    try {
      await api.createInvestigation({
        title,
        description,
        sourceType,
        sourceUrl,
        urgency,
        scope,
        assignedTo: assignedUser ? `${assignedUser.name} (${assignedUser.role})` : 'En attente d’attribution',
        assignedToId: assignedUser?.id,
        actorName: user?.name || 'Vérificateur Accrédité'
      });

      onCreated();
      onClose();
      setTitle('');
      setDescription('');
      setSourceUrl('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la création du dossier.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#007953] dark:text-emerald-300 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">note_add</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Ouvrir une Nouvelle Fiche d'Investigation
              </h3>
              <p className="text-[11px] text-slate-500">
                Instruction forensique et enregistrement dans la file de vérification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Affirmation ou rumeur à instruire *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : « Prétendue suspension des épreuves écrites du Baccalauréat 2025 »"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description factuelle et pièces à conviction reçues *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails du message circulant, montants réclamés, dates clés et premier contact administratif..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Source initiale de diffusion
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              >
                <option value="WhatsApp citoyen">Groupe ou transfert WhatsApp</option>
                <option value="Facebook / Méta">Page ou publication Facebook</option>
                <option value="TikTok / Vidéo courte">TikTok / Vidéo Virale</option>
                <option value="X (ex-Twitter)">Réseau X (Twitter)</option>
                <option value="Presse Web">Presse en ligne / Blog</option>
                <option value="Signalement Direct">Signalement Direct en Préfecture</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lien web ou référence
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Niveau de priorité déontologique
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-bold"
              >
                <option value="haute">⚠️ Haute (Arnaque financière / Trouble à l'ordre)</option>
                <option value="normale">Normale (Rumeur récurrente / Calendrier)</option>
                <option value="faible">Faible (Déclaration d'opinion isolée)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assigner à un enquêteur accrédité
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-semibold"
              >
                <option value="">Attribution ultérieure (En attente)</option>
                {accreditedUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.role} ({u.jurisdiction})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#007953] hover:bg-[#006344] text-white font-bold flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>{isSubmitting ? 'Création...' : 'Ouvrir le dossier'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
