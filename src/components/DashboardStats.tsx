import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { api, StatsTrendsData } from '../services/api';
import { useI18n } from '../context/I18nContext';
import { NavPage } from '../types';

interface DashboardStatsProps {
  setCurrentPage?: (page: NavPage) => void;
}

// Fallback data in case backend is loading or unavailable
const FALLBACK_DATA: StatsTrendsData = {
  summary: {
    totalActsVerified: 1420,
    totalSubmissions: 2100,
    overallDisinformationRate: 61.8,
    citizensProtectedEstimate: '345 000+',
    averageVerificationHours: 3.2,
    sealedHashCount: 1420
  },
  monthlyActivity: [
    { month: 'Avr 24', signalements: 94, actesVerifies: 68, fauxDetectes: 42, desinformationRate: 61.7 },
    { month: 'Mai 24', signalements: 112, actesVerifies: 85, fauxDetectes: 54, desinformationRate: 63.5 },
    { month: 'Juin 24', signalements: 148, actesVerifies: 110, fauxDetectes: 72, desinformationRate: 65.4 },
    { month: 'Juil 24', signalements: 185, actesVerifies: 135, fauxDetectes: 89, desinformationRate: 65.9 },
    { month: 'Août 24', signalements: 165, actesVerifies: 122, fauxDetectes: 76, desinformationRate: 62.3 },
    { month: 'Sept 24', signalements: 190, actesVerifies: 145, fauxDetectes: 98, desinformationRate: 67.5 },
    { month: 'Oct 24', signalements: 178, actesVerifies: 138, fauxDetectes: 86, desinformationRate: 62.3 },
    { month: 'Nov 24', signalements: 205, actesVerifies: 156, fauxDetectes: 99, desinformationRate: 63.4 },
    { month: 'Déc 24', signalements: 230, actesVerifies: 172, fauxDetectes: 108, desinformationRate: 62.8 },
    { month: 'Jan 25', signalements: 245, actesVerifies: 184, fauxDetectes: 114, desinformationRate: 61.9 },
    { month: 'Fév 25', signalements: 260, actesVerifies: 198, fauxDetectes: 122, desinformationRate: 61.6 },
    { month: 'Mars 25', signalements: 285, actesVerifies: 212, fauxDetectes: 131, desinformationRate: 61.8 }
  ],
  verdictDistribution: [
    { name: 'Faux & Arnaques financières', value: 878, percentage: 61.8, color: '#dc2626' },
    { name: 'Trompeur & Décontextualisé', value: 312, percentage: 22.0, color: '#d97706' },
    { name: 'Actes Authentiques (Vrai)', value: 230, percentage: 16.2, color: '#007953' }
  ],
  actsByInstitution: [
    { institution: 'MINFOPRA', name: 'Fonction Publique (Concours)', verified: 420, fakeDetected: 268 },
    { institution: 'DGSN', name: 'Police Nationale & Passeports', verified: 310, fakeDetected: 195 },
    { institution: 'MINESUP', name: 'Enseignement Sup. & Bourses', verified: 285, fakeDetected: 172 },
    { institution: 'MINFI', name: 'Douanes & Trésor Public', verified: 185, fakeDetected: 124 },
    { institution: 'MINSANTE', name: 'Santé Publique & Épidémies', verified: 120, fakeDetected: 48 },
    { institution: 'OBC/GCE', name: 'Examens Officiels (Bac/GCE)', verified: 100, fakeDetected: 62 }
  ],
  channelsDistribution: [
    { name: 'Transferts WhatsApp', value: 64, color: '#25D366' },
    { name: 'Pages Facebook / Méta', value: 19, color: '#1877F2' },
    { name: 'TikTok / Vidéos virales', value: 9, color: '#FE2C55' },
    { name: 'Réseau X (Twitter)', value: 5, color: '#0ea5e9' },
    { name: 'Signalement Direct / SMS', value: 3, color: '#8b5cf6' }
  ]
};

// Custom Tooltip for Area and Bar Charts
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1.5 backdrop-blur-xs min-w-[180px]">
        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-slate-400 font-mono">Vérif 237 Data</span>
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.stroke || entry.fill }} />
              <span className="text-slate-300">{entry.name}:</span>
            </div>
            <span className="font-bold font-mono text-white">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              {entry.unit || ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1 backdrop-blur-xs">
        <div className="font-bold flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
          <span>{data.name}</span>
        </div>
        <div className="text-[11px] text-slate-300 flex items-center justify-between gap-4 font-mono">
          <span>{data.value} dossiers</span>
          <span className="font-bold text-emerald-400">{data.payload.percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardStats: React.FC<DashboardStatsProps> = ({ setCurrentPage }) => {
  const { lang } = useI18n();
  const [data, setData] = useState<StatsTrendsData>(FALLBACK_DATA);
  const [timeRange, setTimeRange] = useState<'6m' | '12m'>('12m');
  const [activityMetric, setActivityMetric] = useState<'volume' | 'rate'>('volume');
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.getStatsTrends();
      if (res && res.monthlyActivity) {
        setData(res);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch {
      // Fallback data is preserved
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Filtered monthly data according to selected time range
  const displayedMonthlyData = useMemo(() => {
    if (timeRange === '6m') {
      return data.monthlyActivity.slice(-6);
    }
    return data.monthlyActivity;
  }, [data.monthlyActivity, timeRange]);

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-bold text-[#007953] dark:text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#007953] animate-pulse" />
            <span>BAROMÈTRE CITOYEN • DONNÉES NATIONALES OUVERTES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-headline">
            {lang === 'EN'
              ? 'Public Information & Disinformation Barometer'
              : 'Tableau de Bord & Baromètre de la Désinformation'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            {lang === 'EN'
              ? 'Real-time indicators on authenticated official acts, detected fraud patterns, and monthly fact-checking momentum across Cameroon.'
              : 'Indicateurs en temps réel des actes officiels authentifiés, des tentatives d’escroqueries détectées et de l’activité mensuelle de vérification au Cameroun.'}
          </p>
        </div>

        {/* Controls: Time range & refresh */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeRange === '6m'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              6 mois
            </button>
            <button
              onClick={() => setTimeRange('12m')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeRange === '12m'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              12 mois
            </button>
          </div>

          <button
            onClick={loadStats}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Rafraîchir les métriques"
          >
            <span className={`material-symbols-outlined text-sm ${isLoading ? 'animate-spin' : ''}`}>sync</span>
            <span className="hidden sm:inline font-mono text-[11px]">{lastUpdated}</span>
          </button>
        </div>
      </div>

      {/* 4 TOP KEY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-xs">
        
        {/* Card 1: Total Actes Vérifiés */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[11px]">
            <span>Actes Vérifiés Scellés</span>
            <span className="material-symbols-outlined text-[#007953] dark:text-emerald-400 text-lg">verified</span>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-headline">
              {data.summary.totalActsVerified.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              <span>+18% de couverture ce trimestre</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            Dépôts juridiques & sceaux SHA-256
          </div>
        </div>

        {/* Card 2: Taux de Désinformation */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[11px]">
            <span>Taux de Faux & Infox</span>
            <span className="material-symbols-outlined text-red-500 text-lg">gpp_bad</span>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 font-headline">
              {data.summary.overallDisinformationRate}%
            </div>
            <div className="text-[11px] text-red-700 dark:text-red-300 font-semibold flex items-center gap-1 mt-0.5">
              <span>878 tentatives d’escroquerie déjouées</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            Faux arrêtés & quittances frauduleuses
          </div>
        </div>

        {/* Card 3: Citoyens protégés */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[11px]">
            <span>Audience Protégée</span>
            <span className="material-symbols-outlined text-blue-500 text-lg">groups</span>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-headline">
              {data.summary.citizensProtectedEstimate}
            </div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 mt-0.5">
              <span>Dans les 10 régions du Cameroun</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            Relais WhatsApp, radios & presse web
          </div>
        </div>

        {/* Card 4: Délai d'Instruction */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[11px]">
            <span>Délai Moyen Réponse</span>
            <span className="material-symbols-outlined text-amber-500 text-lg">timer</span>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-headline">
              {data.summary.averageVerificationHours} h
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
              <span>&lt; 45 min pour les arnaques financières</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            Coupe-file d'urgence opérationnel
          </div>
        </div>

      </div>

      {/* MAIN CHARTS GRID: 2 COLUMNS (Left 7 Cols: Monthly Activity, Right 5 Cols: Disinformation Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* CHART 1: ACTIVITÉ MENSUELLE SUR LA PLATEFORME (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#007953]">trending_up</span>
                  <span>Activité Mensuelle de Vérification & Signalements</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Évolution des dossiers citoyens reçus, des actes vérifiés et des faux interceptés.
                </p>
              </div>

              {/* View Switcher: Volume vs Rate */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-300 self-start sm:self-auto">
                <button
                  onClick={() => setActivityMetric('volume')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activityMetric === 'volume'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Volumes
                </button>
                <button
                  onClick={() => setActivityMetric('rate')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activityMetric === 'rate'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Taux Faux (%)
                </button>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {activityMetric === 'volume' ? (
                  <AreaChart data={displayedMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSignalements" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorActes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#007953" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#007953" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorFaux" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      formatter={(val) => <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{val}</span>}
                    />
                    <Area
                      type="monotone"
                      name="Signalements reçus"
                      dataKey="signalements"
                      stroke="#0284c7"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSignalements)"
                    />
                    <Area
                      type="monotone"
                      name="Actes vérifiés"
                      dataKey="actesVerifies"
                      stroke="#007953"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorActes)"
                    />
                    <Area
                      type="monotone"
                      name="Faux & Arnaques"
                      dataKey="fauxDetectes"
                      stroke="#dc2626"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorFaux)"
                    />
                  </AreaChart>
                ) : (
                  <AreaChart data={displayedMonthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      domain={[50, 80]}
                      tickLine={false}
                      axisLine={false}
                      unit="%"
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      formatter={(val) => <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{val}</span>}
                    />
                    <Area
                      type="monotone"
                      name="Taux de désinformation mensuel"
                      dataKey="desinformationRate"
                      unit="%"
                      stroke="#dc2626"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRate)"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span>Traçabilité complète des signalements : 100% anonymisée et cryptographiquement intègre.</span>
            {setCurrentPage && (
              <button
                onClick={() => setCurrentPage('actualites')}
                className="text-[#007953] dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Voir toutes les vérifications &gt;
              </button>
            )}
          </div>
        </div>

        {/* CHART 2: TAUX & TYPOLOGIE DE LA DÉSINFORMATION (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">pie_chart</span>
                <span>Typologie des Rumeurs & Taux de Faux</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Proportion des allégations démenties face aux actes républicains authentifiés.
              </p>
            </div>

            {/* Recharts Pie Chart */}
            <div className="h-52 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.verdictDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    onMouseEnter={(_, index) => setHoveredPieIndex(index)}
                    onMouseLeave={() => setHoveredPieIndex(null)}
                  >
                    {data.verdictDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                        style={{
                          filter: hoveredPieIndex === index ? 'brightness(1.15) drop-shadow(0 4px 6px rgba(0,0,0,0.2))' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center stat inside Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 dark:text-white font-headline">
                  {data.summary.overallDisinformationRate}%
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Infox Détectées
                </span>
              </div>
            </div>

            {/* Legend List (Clean Zero-Pill format) */}
            <div className="space-y-2 mt-4 text-xs">
              {data.verdictDistribution.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="font-medium text-[11px] sm:text-xs">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-400">{entry.value}</span>
                    <span className="font-bold text-slate-900 dark:text-white w-10 text-right">{entry.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Channels Distribution */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Principaux Canaux de Propagation Virale
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              {data.channelsDistribution.slice(0, 3).map((chan, i) => (
                <div key={i} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <span className="truncate text-slate-600 dark:text-slate-400">{chan.name}</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white shrink-0 ml-1">{chan.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* CHART 3: ACTES VÉRIFIÉS PAR INSTITUTION PUBLIQUE (Full Width Bar Chart) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">account_balance</span>
              <span>Actes Vérifiés & Fraudes Évitées par Institution Publique</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Confrontation des arrêtés certifiés conformes face aux faux communiqués interceptés pour chaque ministère clé.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#007953]" />
              <span className="font-medium">Actes authentifiés</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-600" />
              <span className="font-medium">Faux concours déjoués</span>
            </div>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.actsByInstitution}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} vertical={false} />
              <XAxis
                dataKey="institution"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Bar
                name="Actes authentifiés"
                dataKey="verified"
                fill="#007953"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                name="Faux communiqués déjoués"
                dataKey="fakeDetected"
                fill="#dc2626"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Institutions Quick Legend Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          {data.actsByInstitution.map((inst) => (
            <div key={inst.institution} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
              <div className="font-bold text-slate-900 dark:text-white">{inst.institution}</div>
              <div className="text-[10px] text-slate-400 truncate" title={inst.name}>{inst.name}</div>
              <div className="mt-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                {inst.verified} vérifiés
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
