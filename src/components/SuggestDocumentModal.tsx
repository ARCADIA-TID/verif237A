import React, { useState } from 'react';

interface SuggestDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'suggerer' | 'signaler_faux';
  targetDocumentTitle?: string;
}

export const SuggestDocumentModal: React.FC<SuggestDocumentModalProps> = ({
  isOpen,
  onClose,
  mode,
  targetDocumentTitle = '',
}) => {
  const [title, setTitle] = useState(targetDocumentTitle);
  const [ministry, setMinistry] = useState('DGSN');
  const [details, setDetails] = useState('');
  const [contact, setContact] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111c2e] rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in relative text-slate-900 dark:text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          title="Fermer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-950 text-[#005c55] dark:text-[#2dd4bf] flex items-center justify-center text-2xl">
              <span className="material-symbols-outlined text-[32px]">task_alt</span>
            </div>
            <h3 className="text-lg font-bold font-headline">Signalement enregistré</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm">
              Merci pour votre vigilance civique. Notre équipe documentaire et juridique initie le recoupement auprès des ministères concernés.
            </p>
            <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded text-[#005c55]">
              Ticket #ACTE-{Math.floor(1000 + Math.random() * 9000)}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  mode === 'signaler_faux'
                    ? 'bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400'
                    : 'bg-teal-100 dark:bg-teal-950/80 text-[#005c55] dark:text-[#2dd4bf]'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {mode === 'signaler_faux' ? 'warning' : 'add_task'}
                </span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                  {mode === 'signaler_faux' ? 'Signaler un faux arrêté ou document falsifié' : 'Suggérer un document officiel à certifier'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {mode === 'signaler_faux'
                    ? 'Alertez nos juristes sur un texte trompeur en circulation'
                    : "Proposez l'ajout d'une procédure ou d'un acte manquant au répertoire"}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Intitulé du document ou de la démarche *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Concours spécial Douanes 2025, Frais CNI..."
                className="w-full bg-[#edf4ff] dark:bg-[#182438] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005c55]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Organisme émetteur présumé
                </label>
                <select
                  value={ministry}
                  onChange={(e) => setMinistry(e.target.value)}
                  className="w-full bg-[#edf4ff] dark:bg-[#182438] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="DGSN">DGSN (Sûreté Nationale)</option>
                  <option value="MINESUP">MINESUP (Ens. Supérieur)</option>
                  <option value="MINFOPRA">MINFOPRA (Fonction Publique)</option>
                  <option value="MINFI">MINFI (Finances)</option>
                  <option value="MINSANTE">MINSANTE (Santé)</option>
                  <option value="OBC">OBC & GCE Board</option>
                  <option value="AUTRE">Autre ministère</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Votre contact (optionnel)
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Email ou WhatsApp"
                  className="w-full bg-[#edf4ff] dark:bg-[#182438] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Détails des faits ou motifs du doute *
              </label>
              <textarea
                required
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Précisez où vous avez vu passer ce document, s'il y a une demande de paiement d'argent, des fautes flagrantes..."
                className="w-full bg-[#edf4ff] dark:bg-[#182438] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005c55] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Fichier ou capture (optionnel)
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">attach_file</span>
                  <span>{fileName ? 'Changer de fichier' : 'Joindre un PDF ou image'}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFileName(e.target.files[0].name);
                      }
                    }}
                  />
                </label>
                {fileName && (
                  <span className="text-xs text-teal-700 dark:text-teal-400 font-mono truncate max-w-xs">
                    {fileName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                className={`px-5 py-2 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 ${
                  mode === 'signaler_faux' ? 'bg-red-700 hover:bg-red-800' : 'bg-[#005c55] hover:bg-[#0f766e]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Transmettre à Vérif 237</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
