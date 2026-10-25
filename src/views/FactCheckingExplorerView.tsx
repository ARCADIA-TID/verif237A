import React, { useState } from 'react';
import { NavPage, VerdictType } from '../types';
import { MOCK_RECENT_VERIFICATIONS, MOCK_DETAILED_DOSSIER, DOSSIER_65F123ABC456 } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

interface FactCheckingExplorerViewProps {
  setCurrentPage: (page: NavPage) => void;
  onSelectInformation?: (id: string) => void;
  onOpenSuggestModal: () => void;
}

export const FactCheckingExplorerView: React.FC<FactCheckingExplorerViewProps> = ({
  setCurrentPage,
  onSelectInformation,
  onOpenSuggestModal
}) => {
  const { isAuthenticated, setRedirectAfterLogin } = useAuth();
  const { t } = useI18n();

  const [selectedCategory, setSelectedCategory] = useState<string>('Tous les faits');
  const [selectedVerdict, setSelectedVerdict] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleVerifyClick = () => {
    if (isAuthenticated) {
      setCurrentPage('verifier');
    } else {
      setRedirectAfterLogin('verifier');
      setCurrentPage('auth');
    }
  };

  const categories = [
    'Tous les faits',
    'Diplômes & Concours',
    'Économie & Impôts',
    'Santé Publique',
    'Politique & Sécurité',
    'Infrastructures'
  ];

  // Extended catalog combining the detailed dossier with the recent verifications
  const fullCatalog = [
    {
      id: MOCK_DETAILED_DOSSIER.id,
      refCode: MOCK_DETAILED_DOSSIER.code,
      title: MOCK_DETAILED_DOSSIER.title,
      verdict: 'FAUX' as VerdictType,
      verdictLabel: "FAUX ET ESCROQUERIE",
      category: 'Économie & Impôts',
      date: MOCK_DETAILED_DOSSIER.dateAudit,
      imageUrl: MOCK_DETAILED_DOSSIER.evidenceImageUrl,
      summary: MOCK_DETAILED_DOSSIER.summaryCitizen,
      region: 'National',
      virality: 'Très forte',
      sourcesCount: 3,
      isFlagship: true
    },
    {
      id: DOSSIER_65F123ABC456.id,
      refCode: DOSSIER_65F123ABC456.code,
      title: DOSSIER_65F123ABC456.title,
      verdict: DOSSIER_65F123ABC456.verdict,
      verdictLabel: DOSSIER_65F123ABC456.verdictLabel,
      category: 'Diplômes & Concours',
      date: DOSSIER_65F123ABC456.dateAudit,
      imageUrl: DOSSIER_65F123ABC456.evidenceImageUrl,
      summary: DOSSIER_65F123ABC456.summaryCitizen,
      region: 'National',
      virality: 'Très forte',
      sourcesCount: DOSSIER_65F123ABC456.primarySourcesCount,
      isFlagship: false
    },
    ...MOCK_RECENT_VERIFICATIONS.map((item) => ({
      id: item.id,
      refCode: item.refCode,
      title: item.title,
      verdict: item.verdict,
      verdictLabel: item.verdictLabel,
      category: item.category === 'MINESUP' ? 'Diplômes & Concours' : item.category,
      date: item.date,
      imageUrl: item.imageUrl,
      summary: item.summary,
      region: 'National',
      virality: 'Forte',
      sourcesCount: item.sources.length,
      isFlagship: false
    })),
    {
      id: 'case-5',
      refCode: '#2025-021F',
      title: "« Liste secrète d'admis au concours direct de la douane camerounaise avant les oraux »",
      verdict: 'FAUX' as VerdictType,
      verdictLabel: 'FAUX / DOCUMENT TRUQUÉ',
      category: 'Diplômes & Concours',
      date: '02 Février 2025',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxq9SV5bIS0T2UXHzX0pK8qduPTvPM0BuUtQah4k3qSJoSB5_jqIjw9ZR18YcjGcFK8DpP0fzxPshzHdtxnpELhOGGUYgvU2xzb8QS52dvLIl1XAQ3r2eKLC6Aaoo-JtTxbOygtlZO0CQcWXgw8ENPYGhknvUedfAyVWfOAHtJGtOQCaO7kFgVoHZnMofB4aFyYlYntohr5ZS3i61qRyMIzbqY0PibSr3iuUGwO2d9xqmz6nKVUwmIUg',
      summary: "La Direction Générale des Douanes confirme qu'aucune publication anticipée n'a été autorisée. Les faux documents circulant comportent un logo anachronique de 2014.",
      region: 'Littoral (Douala)',
      virality: 'Moyenne',
      sourcesCount: 2,
      isFlagship: false
    },
    {
      id: 'case-6',
      refCode: '#2025-018T',
      title: "« Prétendue gratuité des accouchements dans tous les hôpitaux de district dès janvier 2025 »",
      verdict: 'TROMPEUR' as VerdictType,
      verdictLabel: 'TROMPEUR / DISPOSITIF PARTIEL',
      category: 'Santé Publique',
      date: '25 Janvier 2025',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeF-xl5D0zN0IdFMRL9njFHOdweRFWBDY4ThO1Jjh4euZTZ4nPT71Ad-4RId_VbUZNLUGdkQP-teu5JK3w76ERKExCPhQq6_038WcZvVfTOIfkHno6zXnz-nC2BRVkt-0tK7rO7j9O7dXD0Vrshsc1zrauRWTN64A2iUUO-AP1676brux7kRLn1SFgPHPGAfhVa__BoAiw0qhhZLUKyLdu1kPAs8OP4iNZOPBNFt8Pbf-WTdqfhwytOw',
      summary: "Le projet de Couverture Santé Universelle (CSU) prend en charge le forfait mère-enfant pour un montant forfaitaire subventionné de 6 000 FCFA, mais ne constitue pas une gratuité absolue sans affiliation préalable.",
      region: 'Centre (Yaoundé)',
      virality: 'Très forte',
      sourcesCount: 3,
      isFlagship: false
    }
  ];

  const filteredItems = fullCatalog.filter((item) => {
    // Category match
    if (selectedCategory !== 'Tous les faits' && item.category !== selectedCategory) {
      return false;
    }
    // Verdict match
    if (selectedVerdict !== 'all' && item.verdict !== selectedVerdict) {
      return false;
    }
    // Search query match
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchCode = item.refCode.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchCode) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumbs & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <button onClick={() => setCurrentPage('accueil')} className="hover:text-emerald-700">Accueil</button>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Observatoire des faits</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Centre de Détection & Veille Active des Fausses Informations
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
                Base de données publique des rumeurs, faux arrêtés ministériels, manipulations numériques 
                et communiqués frelatés audités par l'équipe indépendante de Vérif 237.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setCurrentPage('signaler')}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors shadow flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">flag</span>
                <span>Signaler une rumeur</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Multi-Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
              <input
                type="text"
                placeholder="Chercher par mots-clés, ministère, nom de fichier ou numéro de référence (#VRF)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {/* Verdict Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedVerdict}
                onChange={(e) => setSelectedVerdict(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="all">Tous les verdicts</option>
                <option value="FAUX">FAUX (Intox / Frelaté)</option>
                <option value="VRAI">VRAI (Confirmé conforme)</option>
                <option value="TROMPEUR">TROMPEUR (Hors contexte)</option>
              </select>

              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="all">Toutes les régions</option>
                <option value="Centre">Centre (Yaoundé)</option>
                <option value="Littoral">Littoral (Douala)</option>
                <option value="Ouest">Ouest (Bafoussam)</option>
                <option value="Nord">Nord (Garoua)</option>
                <option value="Extrême-Nord">Extrême-Nord (Maroua)</option>
                <option value="Nord-Ouest">Nord-Ouest (Bamenda)</option>
                <option value="Sud-Ouest">Sud-Ouest (Buea)</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter & Active Filter Pills */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500">
          <div>
            Affichage de <strong>{filteredItems.length}</strong> dossier(s) vérifié(s)
          </div>
          {(selectedCategory !== 'Tous les faits' || selectedVerdict !== 'all' || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedCategory('Tous les faits');
                setSelectedVerdict('all');
                setSelectedRegion('all');
                setSearchQuery('');
              }}
              className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">restart_alt</span>
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Image Header with Verdict Tag */}
                <div className="relative h-48 bg-slate-950 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider shadow ${
                        item.verdict === 'FAUX'
                          ? 'bg-red-600 text-white'
                          : item.verdict === 'VRAI'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {item.verdictLabel}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/75 px-2 py-0.5 rounded text-[10px] font-mono text-slate-200">
                    {item.refCode}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-emerald-950/80 backdrop-blur-sm border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] text-emerald-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">verified</span>
                    <span>Scellé SHA-256</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">{item.category}</span>
                    <span>{item.date}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2.5 leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-4">
                    {item.summary}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs text-slate-400">policy</span>
                  <span>{item.sourcesCount} sources primaires</span>
                </div>

                <button
                  onClick={() => {
                    if (onSelectInformation) onSelectInformation(item.id);
                    else setCurrentPage('information');
                  }}
                  className="bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Consulter</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submission Callout at bottom */}
        <div className="mt-14 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-xl font-bold mb-1">
              Vous avez un doute sur un document ou une publication virale ?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200">
              Nos juristes et analystes OSINT traitent les signalements citoyens sous 4 à 24 heures en toute confidentialité.
            </p>
          </div>
          <button
            onClick={handleVerifyClick}
            className="shrink-0 bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs px-6 py-3 rounded-xl transition-all shadow cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">verified</span>
            <span>Soumettre pour vérification</span>
          </button>
        </div>

      </div>
    </div>
  );
};
