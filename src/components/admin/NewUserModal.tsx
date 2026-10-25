import React, { useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export const NewUserModal: React.FC<NewUserModalProps> = ({ isOpen, onClose, onUserCreated }) => {
  const { user: currentAuthUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Réviseur Sénior & Juriste');
  const [roleType, setRoleType] = useState('reviseur');
  const [jurisdiction, setJurisdiction] = useState('Centre (Yaoundé)');
  const [validityUntil, setValidityUntil] = useState('2026-12-31');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setRoleType(val);
    if (val === 'super-admin') setRole('Superviseur Général Déontologique');
    else if (val === 'reviseur') setRole('Réviseur Sénior & Juriste d’État');
    else if (val === 'forensique') setRole('Expert Forensique & Analyse OSINT');
    else if (val === 'terrain') setRole('Enquêteur Terrain Régional');
    else if (val === 'moderateur') setRole('Modérateur Triage & Signalements');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim() || !email.trim()) {
      setErrorMessage('Le nom complet et l’adresse email institutionnelle sont obligatoires.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createUser({
        name,
        email,
        phone,
        role,
        roleType,
        jurisdiction,
        validityUntil,
        actorName: currentAuthUser?.name || 'Dr. François Kamga (Super-Admin)'
      });

      setSuccessMessage(res.message);
      setTimeout(() => {
        onUserCreated();
        onClose();
        setName('');
        setEmail('');
        setPhone('');
        setSuccessMessage(null);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la création du compte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#007953] dark:text-emerald-300 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">person_add</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Accréditer un Nouvel Utilisateur Institutionnel
              </h3>
              <p className="text-[11px] text-slate-500">
                Protocole de cooptation conforme aux statuts déontologiques de Vérif 237
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">verified</span>
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nom complet et titre *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex : Me Alain Tagne"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-[#007953]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Adresse e-mail institutionnelle *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="a.tagne@verif237.cm"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-[#007953]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Numéro de téléphone sécurisé
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+237 699 00 00 00"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-[#007953]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rôle & Habilitation déontologique *
              </label>
              <select
                value={roleType}
                onChange={handleRoleTypeChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-[#007953] font-semibold"
              >
                <option value="reviseur">Réviseur Sénior & Juriste (Contresignature)</option>
                <option value="forensique">Expert Forensique & OSINT (Analyse EXIF/InVID)</option>
                <option value="terrain">Enquêteur Régional de Terrain</option>
                <option value="moderateur">Modérateur Triage & Doublons</option>
                <option value="super-admin">Super-Administrateur (Gestion & Clés)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Juridiction / Hub régional
              </label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-[#007953]"
              >
                <option value="Centre (Yaoundé)">Centre (Yaoundé Hub Central)</option>
                <option value="Littoral (Douala)">Littoral (Douala Port & Économie)</option>
                <option value="Nord-Ouest (Bamenda)">Nord-Ouest (Bamenda Hub)</option>
                <option value="Sud-Ouest (Buea)">Sud-Ouest (Buea Universités)</option>
                <option value="Extrême-Nord (Maroua)">Extrême-Nord (Maroua / Diamaré)</option>
                <option value="Ouest (Bafoussam)">Ouest (Bafoussam)</option>
                <option value="Nord (Garoua)">Nord (Garoua / Bénoué)</option>
                <option value="Adamaoua (Ngaoundéré)">Adamaoua (Ngaoundéré)</option>
                <option value="Est (Bertoua)">Est (Bertoua)</option>
                <option value="Sud (Ebolowa)">Sud (Ebolowa)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Durée de validité de l’accréditation
              </label>
              <input
                type="date"
                value={validityUntil}
                onChange={(e) => setValidityUntil(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-[#007953]"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#007953]">lock</span>
              <span>Sécurité & Activation Déontologique</span>
            </div>
            <p className="text-slate-500">
              Aucun mot de passe temporaire n'est transmis en clair. Un jeton cryptographique à usage unique FIDO2/2FA sera expédié à l’adresse électronique certifiée. L'événement est consigné au journal d'audit légal WORM.
            </p>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#007953] hover:bg-[#006344] text-white font-bold flex items-center gap-2 shadow cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enregistrement sécurisé...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">check</span>
                  <span>Confirmer l’accréditation</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
