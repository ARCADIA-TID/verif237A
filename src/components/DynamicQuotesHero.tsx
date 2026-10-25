import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../context/I18nContext';

export interface CivicQuote {
  id: number;
  textFr: string;
  textEn: string;
  themeFr: string;
  themeEn: string;
  authorFr?: string;
  authorEn?: string;
}

export const CIVIC_QUOTES: CivicQuote[] = [
  {
    id: 1,
    textFr: "Avant de partager une information, prenons le temps de la vérifier.",
    textEn: "Before sharing any information, let's take a moment to verify it.",
    themeFr: "Esprit Critique",
    themeEn: "Critical Thinking",
    authorFr: "Principe citoyen Vérif 237",
    authorEn: "Vérif 237 Civic Principle"
  },
  {
    id: 2,
    textFr: "Une information vérifiée est un pas de plus vers une société mieux informée.",
    textEn: "A verified fact is one more step toward a better-informed society.",
    themeFr: "Démocratie & Vérité",
    themeEn: "Democracy & Truth",
    authorFr: "Observatoire Républicain",
    authorEn: "Republican Observatory"
  },
  {
    id: 3,
    textFr: "Ensemble, faisons de la vérité notre responsabilité citoyenne.",
    textEn: "Together, let us make truth our collective civic responsibility.",
    themeFr: "Responsabilité Civique",
    themeEn: "Civic Duty",
    authorFr: "Vigie Citoyenne Cameroun",
    authorEn: "Cameroon Civic Watch"
  },
  {
    id: 4,
    textFr: "Ne partage pas seulement une information : assure-toi qu'elle est fiable.",
    textEn: "Don't just forward information: make sure it is trustworthy.",
    themeFr: "Vigilance Numérique",
    themeEn: "Digital Awareness",
    authorFr: "Réflexe 237",
    authorEn: "237 Reflex"
  },
  {
    id: 5,
    textFr: "Face aux rumeurs, adoptons le réflexe de la vérification.",
    textEn: "When rumors arise, adopt the verification reflex.",
    themeFr: "Démarche Rationnelle",
    themeEn: "Rational Fact-Checking",
    authorFr: "Charte IFCN Cameroun",
    authorEn: "IFCN Charter Cameroon"
  },
  {
    id: 6,
    textFr: "Une communauté bien informée est une communauté plus forte.",
    textEn: "A well-informed community is an empowered and stronger community.",
    themeFr: "Cohésion Nationale",
    themeEn: "National Cohesion",
    authorFr: "Unité Républicaine",
    authorEn: "Republican Unity"
  },
  {
    id: 7,
    textFr: "Au Cameroun, chaque citoyen peut contribuer à lutter contre la désinformation.",
    textEn: "In Cameroon, every citizen has the power to combat disinformation.",
    themeFr: "Engagement Local",
    themeEn: "Local Engagement",
    authorFr: "Réseau des 10 Régions",
    authorEn: "10-Region Network"
  },
  {
    id: 8,
    textFr: "Vérifier aujourd'hui, c'est éviter de tromper demain.",
    textEn: "Verifying today prevents misleading people tomorrow.",
    themeFr: "Éthique de Partage",
    themeEn: "Sharing Ethics",
    authorFr: "Déontologie de l'Information",
    authorEn: "Information Ethics"
  },
  {
    id: 9,
    textFr: "L'esprit critique commence par une simple question : cette information est-elle vraie ?",
    textEn: "Critical thinking begins with a simple question: is this information true?",
    themeFr: "Doute Méthodique",
    themeEn: "Inquiry & Evidence",
    authorFr: "Pédagogie Citoyenne",
    authorEn: "Civic Pedagogy"
  },
  {
    id: 10,
    textFr: "La bonne information mérite d'être recherchée, vérifiée et partagée.",
    textEn: "Good information deserves to be researched, verified, and shared.",
    themeFr: "Valeur Publique",
    themeEn: "Public Good",
    authorFr: "Vérif 237",
    authorEn: "Vérif 237"
  }
];

interface DynamicQuotesHeroProps {
  initialDuration?: number; // duration in seconds (15s default, configurable to 60s)
}

export const DynamicQuotesHero: React.FC<DynamicQuotesHeroProps> = ({
  initialDuration = 15
}) => {
  const { lang } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [duration, setDuration] = useState<number>(initialDuration); // in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');
  const [progress, setProgress] = useState(0);

  const durationOptions = [15, 30, 45, 60];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const activeQuote = CIVIC_QUOTES[currentIndex];
  const quoteText = lang === 'EN' ? activeQuote.textEn : activeQuote.textFr;
  const quoteTheme = lang === 'EN' ? activeQuote.themeEn : activeQuote.themeFr;
  const quoteAuthor = lang === 'EN' ? activeQuote.authorEn : activeQuote.authorFr;

  const goToNext = () => {
    setFadeState('out');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % CIVIC_QUOTES.length);
      setFadeState('in');
      setProgress(0);
    }, 280);
  };

  const goToPrev = () => {
    setFadeState('out');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + CIVIC_QUOTES.length) % CIVIC_QUOTES.length);
      setFadeState('in');
      setProgress(0);
    }, 280);
  };

  const jumpToIndex = (idx: number) => {
    if (idx === currentIndex) return;
    setFadeState('out');
    setTimeout(() => {
      setCurrentIndex(idx);
      setFadeState('in');
      setProgress(0);
    }, 280);
  };

  // Timer loop for automatic quote rotation
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const intervalMs = duration * 1000;
    const stepMs = 100;
    setProgress(0);

    // Progress bar ticker
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (stepMs / intervalMs) * 100;
        return next >= 100 ? 100 : next;
      });
    }, stepMs);

    // Main quote switch timer
    timerRef.current = setInterval(() => {
      goToNext();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, duration, isPaused]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative max-w-4xl mx-auto px-4 py-4 group"
    >
      {/* Top micro-bar: Theme, Rotation Speed & Pause Controls */}
      <div className="flex items-center justify-between gap-2 mb-3 text-xs">
        <div className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            {quoteTheme}
          </span>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            • Citation #{currentIndex + 1} / {CIVIC_QUOTES.length}
          </span>
        </div>

        {/* Speed Config & Pause Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px]">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            title={isPaused ? "Reprendre la rotation automatique" : "Suspendre la rotation"}
          >
            <span className="material-symbols-outlined text-[15px]">
              {isPaused ? 'play_arrow' : 'pause'}
            </span>
            <span className="font-semibold">{isPaused ? (lang === 'EN' ? 'Paused' : 'En pause') : `${duration}s`}</span>
          </button>

          <span className="text-slate-300 dark:text-slate-600">|</span>

          {/* Config Menu Toggle (15s to 60s as required) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-0.5 cursor-pointer font-bold"
              title="Configurer la fréquence de rotation (15s - 60s)"
            >
              <span className="material-symbols-outlined text-[14px]">tune</span>
              <span className="text-[10px]">Cadence</span>
            </button>

            {showConfig && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-30 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                  {lang === 'EN' ? 'Rotation interval' : 'Délai d’affichage'}
                </div>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setDuration(opt);
                        setShowConfig(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg font-bold text-center transition-colors cursor-pointer ${
                        duration === opt
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {opt} sec {opt === 15 ? '(défaut)' : opt === 60 ? '(max)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Quote Title with Smooth Transition */}
      <div className="min-h-[110px] sm:min-h-[130px] md:min-h-[140px] flex items-center justify-center relative">
        {/* Decorative Quote Mark Background */}
        <span className="absolute -top-6 left-2 md:left-6 text-7xl md:text-8xl font-serif text-emerald-600/10 dark:text-emerald-400/10 select-none pointer-events-none">
          “
        </span>

        <h1
          className={`text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug md:leading-tight transition-all duration-300 font-headline relative z-10 px-2 sm:px-8 ${
            fadeState === 'in'
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-2 scale-98'
          }`}
        >
          «&nbsp;{quoteText}&nbsp;»
        </h1>
      </div>

      {/* Quote Author / Republican Source Attribution */}
      {quoteAuthor && (
        <div
          className={`text-xs md:text-sm font-semibold text-emerald-800 dark:text-emerald-400 mt-2 transition-opacity duration-300 flex items-center justify-center gap-1.5 ${
            fadeState === 'in' ? 'opacity-90' : 'opacity-0'
          }`}
        >
          <span className="w-4 h-0.5 bg-emerald-500 rounded"></span>
          <span>{quoteAuthor}</span>
          <span className="w-4 h-0.5 bg-emerald-500 rounded"></span>
        </div>
      )}

      {/* Interactive Controls & Pagination Dots */}
      <div className="flex items-center justify-center gap-3 mt-5">
        {/* Prev Arrow */}
        <button
          type="button"
          onClick={goToPrev}
          aria-label="Citation précédente"
          className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        {/* 10 Navigation Dots */}
        <div className="flex items-center gap-1.5">
          {CIVIC_QUOTES.map((q, idx) => (
            <button
              key={q.id}
              type="button"
              onClick={() => jumpToIndex(idx)}
              aria-label={`Aller à la citation ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-7 bg-emerald-600 dark:bg-emerald-400'
                  : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        {/* Next Arrow */}
        <button
          type="button"
          onClick={goToNext}
          aria-label="Citation suivante"
          className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>

      {/* Live Rotation Progress Bar */}
      <div className="w-36 mx-auto mt-3 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all ease-linear"
          style={{ width: `${isPaused ? 0 : progress}%` }}
        />
      </div>
    </div>
  );
};
