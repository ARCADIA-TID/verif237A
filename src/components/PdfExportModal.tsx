import React from 'react';
import { MOCK_DETAILED_DOSSIER, LOGO_URL } from '../data/mockData';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'dossier' | 'index_actes';
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  documentType,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111c2e] rounded-2xl p-6 w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 max-h-[90vh] flex flex-col">
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005c55] dark:text-[#2dd4bf] text-[24px]">
              picture_as_pdf
            </span>
            <div>
              <h3 className="font-headline font-bold text-sm md:text-base text-slate-900 dark:text-white">
                {documentType === 'dossier'
                  ? 'Fiche Certifiée Récapitulative • Dossier #VRF-237-7729'
                  : "Index National des Actes & Démarches Officielles (Édition 2025)"}
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Document horodaté • Empreinte SHA-256 certifiée
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-[#005c55] hover:bg-[#0f766e] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Imprimer / Sauvegarder PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              title="Fermer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Printable Document Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#0b1220] rounded-xl my-4 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-sans print-page">
          {/* Header of the facsimile */}
          <div className="border-b-2 border-[#005c55] pb-4 mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Logo" className="h-10 w-auto object-contain" />
              <div>
                <span className="font-headline font-extrabold text-xl text-[#005c55] dark:text-[#2dd4bf] block leading-none">
                  Vérif 237
                </span>
                <span className="text-[11px] tracking-widest uppercase font-semibold text-slate-500">
                  République du Cameroun • Intérêt Public & Données Libres
                </span>
              </div>
            </div>
            <div className="text-right text-[11px] font-mono text-slate-500">
              <span>Date d'émission : 14 Février 2025</span><br />
              <span>Scellé WORM : #VRF-CMR-094</span>
            </div>
          </div>

          {documentType === 'dossier' ? (
            <div className="space-y-5 text-xs leading-relaxed">
              {/* Verdict Banner */}
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-3 rounded-lg flex items-center justify-between">
                <span className="font-bold text-red-700 dark:text-red-400 tracking-wider uppercase text-sm">
                  {MOCK_DETAILED_DOSSIER.verdictLabel}
                </span>
                <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                  Niveau de preuve : 100% (Formel)
                </span>
              </div>

              <div>
                <h4 className="font-headline font-bold text-base text-slate-900 dark:text-white mb-2">
                  {MOCK_DETAILED_DOSSIER.title}
                </h4>
                <p className="p-3 bg-white dark:bg-[#111c2e] rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                  {MOCK_DETAILED_DOSSIER.summaryCitizen}
                </p>
              </div>

              {/* 3 Preuves Irréfutables */}
              <div className="space-y-3 pt-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Démonstration et pièces opposables :
                </h5>
                {(MOCK_DETAILED_DOSSIER.proofs || []).map((proof) => (
                  <div key={proof.id} className="p-3 bg-white dark:bg-[#111c2e] rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-teal-800 dark:text-teal-400 block mb-1">
                      Preuve {proof.letter} : {proof.title}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      {proof.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Cryptographic Footprint */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-500 break-all">
                EMPREINTE SHA-256 : {MOCK_DETAILED_DOSSIER.sha256Hash}
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <h4 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                Index Officiel des Démarches Administratives Camerounaises
              </h4>
              <p className="text-slate-600 dark:text-slate-300">
                Extrait légal des tarifs officiels certifiés par le Trésor Public et les ministères de tutelle (Loi N° 2018/011).
              </p>

              <div className="space-y-2">
                <div className="p-3 bg-white dark:bg-[#111c2e] rounded border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between font-bold text-[#005c55] dark:text-[#2dd4bf]">
                    <span>DGSN • Carte Nationale d'Identité (CNI)</span>
                    <span>2 800 FCFA</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Payable exclusivement contre quittance sécurisée. Tout montant annexe est illégal.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-[#111c2e] rounded border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between font-bold text-[#005c55] dark:text-[#2dd4bf]">
                    <span>DGSN • Passeport Biométrique (Procédure 48h)</span>
                    <span>110 000 FCFA</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Décret N° 2021/347. Paiement exclusif via la plateforme passcam.cm.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-[#111c2e] rounded border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between font-bold text-[#005c55] dark:text-[#2dd4bf]">
                    <span>MINESUP • Bourses Nationales Universitaires</span>
                    <span>0 FCFA (Gratuit)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Dépôt direct DAOU. Interdiction absolue de rémunérer un intermédiaire.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
          <span>Plateforme civique certifiée Vérif 237</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
