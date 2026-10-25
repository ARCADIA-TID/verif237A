import React, { useState } from 'react';
import { NavPage } from '../types';

interface FooterProps {
  setCurrentPage: (page: NavPage) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  setCurrentPage,
  selectedRegion,
  setSelectedRegion,
}) => {
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const showNotice = (text: string) => {
    setFeedbackNotice(text);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  return (
    <footer className="w-full bg-white dark:bg-[#111c2e] text-[#121c26] dark:text-[#f1f5f9] py-10 shadow-[0_-1px_6px_rgba(0,0,0,0.02)] border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-[1240px] mx-auto px-4 md:px-6 lg:px-8">
        {/* 5-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10 text-xs">
          {/* Col 1 */}
          <div className="flex flex-col gap-2.5">
            <span className="font-bold uppercase tracking-wider text-[#005c55] dark:text-[#2dd4bf]">
              Mission & Neutralité
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Plateforme civique camerounaise indépendante pour la transparence de l'information publique et l'authentification des communiqués.
            </p>
            <button
              onClick={() => setCurrentPage('a-propos')}
              className="text-[#30628a] dark:text-[#60a5fa] hover:text-[#005c55] dark:hover:text-[#2dd4bf] text-left transition-colors font-medium mt-1 cursor-pointer"
            >
              À propos & Charte d'éthique
            </button>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[#005c55] dark:text-[#2dd4bf]">
              Méthodologie & Guide
            </span>
            <button
              onClick={() => setCurrentPage('a-propos')}
              className="hover:text-slate-900 dark:hover:text-white text-left transition-colors cursor-pointer"
            >
              Guide pratique & Barème de vérification
            </button>
            <button
              onClick={() => setCurrentPage('a-propos')}
              className="hover:text-slate-900 dark:hover:text-white text-left transition-colors cursor-pointer"
            >
              Archivage & hachage cryptographique
            </button>
            <button
              onClick={() => setCurrentPage('faq')}
              className="hover:text-slate-900 dark:hover:text-white text-left transition-colors font-semibold text-[#007953] dark:text-emerald-400"
            >
              Questions Fréquentes (FAQ)
            </button>
            <button
              onClick={() => showNotice("Comité éditorial : 12 universitaires, juristes et journalistes camerounais.")}
              className="hover:text-slate-900 dark:hover:text-white text-left transition-colors"
            >
              Comité éditorial & Observateurs
            </button>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[#005c55] dark:text-[#2dd4bf]">
              Actes Officiels
            </span>
            <button
              onClick={() => setCurrentPage('actes')}
              className="hover:text-slate-900 dark:hover:text-white text-left transition-colors"
            >
              Consultation du Journal Officiel
            </button>
            <button
              onClick={() => setCurrentPage('actes')}
              className="hover:text-slate-900 dark:hover:text-white text-left transition-colors"
            >
              Annuaire des ministères & délégations
            </button>
            <button
              onClick={() => setCurrentPage('actes')}
              className="hover:text-slate-900 dark:hover:text-white text-left transition-colors"
            >
              Authentification des démarches
            </button>
          </div>

          {/* Col 4 */}
          <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[#005c55] dark:text-[#2dd4bf]">
              Droits & Correction
            </span>
            <button
              onClick={() => setCurrentPage('a-propos')}
              className="hover:text-slate-900 dark:hover:text-white text-left transition-colors cursor-pointer"
            >
              Politique de correction immédiate (48h)
            </button>
            <button
              onClick={() => setCurrentPage('signaler')}
              className="hover:text-slate-900 dark:hover:text-white text-left transition-colors"
            >
              Formulaire de droit de réponse
            </button>
            <button
              onClick={() => showNotice("Protection absolue des lanceurs d'alerte : chiffrement TLS 256 bits et zéro traçage IP.")}
              className="hover:text-slate-900 dark:hover:text-white text-left transition-colors"
            >
              Confidentialité & Lanceurs d'alerte
            </button>
          </div>

          {/* Col 5 */}
          <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[#005c55] dark:text-[#2dd4bf]">
              Contact & Données
            </span>
            <button
              onClick={() => showNotice("API Publique OpenData disponible aux rédactions et chercheurs universitaires.")}
              className="hover:text-slate-900 dark:hover:text-white text-left transition-colors"
            >
              API Publique Données Ouvertes
            </button>
            <button
              onClick={() => showNotice("Antenne centrale : Quartier Administratif, Yaoundé • Email : contact@verif237.cm")}
              className="hover:text-slate-900 dark:hover:text-white text-left transition-colors"
            >
              Contact Rédaction & Antenne Yaoundé
            </button>
            <div className="flex items-center gap-2 mt-2 p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900">
              <span className="w-2 h-2 rounded-full bg-[#005c55] dark:bg-[#2dd4bf] animate-pulse"></span>
              <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300">
                Statut services : 100% Opérationnel
              </span>
            </div>
          </div>
        </div>

        {/* Region Focus and Civic Notice Strip */}
        <div className="bg-[#edf4ff] dark:bg-[#182438] rounded-xl p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-700 dark:text-amber-400 text-[20px] shrink-0">
              info
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Vérif 237 ne remplace pas les autorités officielles et référence systématiquement les sources primaires consultables.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium">
              Focus Région :
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-white dark:bg-[#111c2e] text-slate-900 dark:text-slate-100 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none shadow-sm cursor-pointer font-medium"
            >
              <option value="all">Toutes les Régions (National)</option>
              <option value="centre">Centre (Yaoundé)</option>
              <option value="littoral">Littoral (Douala)</option>
              <option value="ouest">Ouest (Bafoussam)</option>
              <option value="nord">Nord (Garoua)</option>
              <option value="extreme-nord">Extrême-Nord (Maroua)</option>
              <option value="adamaoua">Adamaoua (Ngaoundéré)</option>
              <option value="nord-ouest">Nord-Ouest (Bamenda)</option>
              <option value="sud-ouest">Sud-Ouest (Buea)</option>
              <option value="sud">Sud (Ebolowa)</option>
              <option value="est">Est (Bertoua)</option>
            </select>
          </div>
        </div>

        {/* Legal Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>© 2025 Vérif 237 • République du Cameroun • Intérêt Public & Données Libres</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => showNotice("Mentions légales conformes aux lois camerounaises sur la cybersécurité et l'information.")}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Mentions Légales
            </button>
            <button
              onClick={() => showNotice("Norme d'accessibilité WCAG 2.2 niveau AA strictement respectée.")}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Accessibilité Numérique
            </button>
            <button
              onClick={() => showNotice("Flux RSS et alertes WhatsApp actives pour les citoyens.")}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Flux RSS & Alertes
            </button>
          </div>
        </div>

        {/* Temporary floating feedback notification */}
        {feedbackNotice && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-fade-in border border-slate-700">
            <span className="material-symbols-outlined text-[16px] text-teal-400">check_circle</span>
            <span>{feedbackNotice}</span>
          </div>
        )}
      </div>
    </footer>
  );
};
