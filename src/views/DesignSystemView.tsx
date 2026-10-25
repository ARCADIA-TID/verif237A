import React, { useState } from 'react';
import { NavPage } from '../types';
import { LOGO_URL } from '../data/mockData';

interface DesignSystemViewProps {
  setCurrentPage: (page: NavPage) => void;
}

export const DesignSystemView: React.FC<DesignSystemViewProps> = ({
  setCurrentPage
}) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToClipboard = (token: string) => {
    navigator.clipboard?.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <button onClick={() => setCurrentPage('accueil')} className="hover:text-emerald-700">Accueil</button>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">Design System Républicain</span>
        </div>

        {/* Title */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-sm">palette</span>
            Charte Graphique & Éléments Républicains
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Design System Officiel Vérif 237
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
            Spécifications de l'interface visuelle inspirée des couleurs républicaines du Cameroun : 
            Émeraude forêt, or solaire, rouge civique et marine institutionnel.
          </p>
        </div>

        {/* 1. Official Republic Seal & Crest */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm mb-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">verified_user</span>
            1. Sceau & Identité Institutionnelle
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Armoiries et logotype officiel de l'observatoire citoyen camerounais.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-6">
              <img
                src={LOGO_URL}
                alt="Logo Vérif 237"
                className="w-20 h-20 object-contain drop-shadow"
              />
              <div>
                <div className="font-extrabold text-base text-slate-900 dark:text-white font-headline">
                  Vérif 237
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                  Observatoire des Actes Officiels
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Typographie d'en-tête : Manrope ExtraBold
                </div>
              </div>
            </div>

            <div className="p-6 bg-emerald-950 text-white rounded-xl border border-emerald-900 flex flex-col justify-between">
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">
                Devise Constitutionnelle Intègre
              </div>
              <div className="text-lg font-extrabold tracking-wide mb-1">
                « PAIX - TRAVAIL - PATRIE »
              </div>
              <div className="text-[11px] text-emerald-300">
                « PEACE - WORK - FATHERLAND » • Sceau constitutionnel de l'Article 1er alinéa 4.
              </div>
            </div>
          </div>
        </section>

        {/* 2. Color Palette Tokens */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm mb-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">colorize</span>
            2. Palette Chromatique Républicaine
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Couleurs standardisées représentant la souveraineté camerounaise et la lisibilité civique.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Emerald */}
            <div
              onClick={() => copyToClipboard('#004732')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="h-16 rounded-lg bg-[#004732] mb-3 shadow-inner" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">Vert Forêt National</div>
              <div className="font-mono text-[11px] text-slate-500">#004732</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Souveraineté & Espérance</div>
            </div>

            {/* Gold */}
            <div
              onClick={() => copyToClipboard('#d97706')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="h-16 rounded-lg bg-[#d97706] mb-3 shadow-inner" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">Or Solaire Cameroun</div>
              <div className="font-mono text-[11px] text-slate-500">#D97706</div>
              <div className="text-[10px] text-amber-600 mt-0.5">Étoile d'Unité & Richesse</div>
            </div>

            {/* Red */}
            <div
              onClick={() => copyToClipboard('#dc2626')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="h-16 rounded-lg bg-[#dc2626] mb-3 shadow-inner" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">Rouge Déontologique</div>
              <div className="font-mono text-[11px] text-slate-500">#DC2626</div>
              <div className="text-[10px] text-red-600 mt-0.5">Alerte Fraude & Faux Actes</div>
            </div>

            {/* Navy */}
            <div
              onClick={() => copyToClipboard('#0f172a')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="h-16 rounded-lg bg-[#0f172a] mb-3 shadow-inner" />
              <div className="font-bold text-xs text-slate-900 dark:text-white">Marine Institutionnel</div>
              <div className="font-mono text-[11px] text-slate-500">#0F172A</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Sceau & Journal Officiel</div>
            </div>

          </div>

          {copiedToken && (
            <div className="mt-4 text-xs font-mono text-emerald-600 font-semibold">
              Valeur copiée dans le presse-papier : {copiedToken}
            </div>
          )}
        </section>

        {/* 3. Status Badges & Pills */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm mb-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">badge</span>
            3. Badges de Verdict & Étiquettes Légales
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Composants standardisés pour qualifier immédiatement le degré de véracité des pièces.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            
            <div className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-sm">cancel</span>
              <span>FAUX ET ESCROQUERIE</span>
            </div>

            <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>CONFIRMÉ / AUTHENTIQUE</span>
            </div>

            <div className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>TROMPEUR / SORTI DU CONTEXTE</span>
            </div>

            <div className="bg-purple-900 text-purple-200 border border-purple-600 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span>SCELLÉ WORM (SHA-256)</span>
            </div>

            <div className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">hourglass_top</span>
              <span>EN COURS D'INSTRUCTION</span>
            </div>

          </div>
        </section>

        {/* 4. Cryptographic Seal Preview */}
        <section className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-8 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">fingerprint</span>
              4. Spécimen de Scellement Immuable
            </h2>
            <span className="text-xs font-mono text-emerald-400">RFC-3161 Timestamp Compliant</span>
          </div>

          <div className="bg-black/60 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
            <div><strong>HASH:</strong> e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</div>
            <div><strong>ISSUER:</strong> REPUBLIQUE DU CAMEROUN • OBSERVATOIRE VERIF 237</div>
            <div><strong>TIMESTAMP:</strong> 2025-02-14T14:38:12.894Z (GMT+1)</div>
            <div><strong>ALGORITHM:</strong> ED25519-SHA256 • NON-REPUDIABLE</div>
          </div>
        </section>

      </div>
    </div>
  );
};
