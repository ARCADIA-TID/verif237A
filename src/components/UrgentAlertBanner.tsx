import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../context/I18nContext';

interface UrgentAlertBannerProps {
  onConsultAlert: () => void;
  defaultDurationSeconds?: number; // 90 seconds by default
}

export const UrgentAlertBanner: React.FC<UrgentAlertBannerProps> = ({
  onConsultAlert,
  defaultDurationSeconds = 90
}) => {
  const { t, lang } = useI18n();

  const [duration, setDuration] = useState<number>(defaultDurationSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(defaultDurationSeconds);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger smooth disappearance
  const dismissBanner = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 450); // Matches CSS transition duration
  };

  // Setup countdown and auto-disappear timer
  useEffect(() => {
    if (!isVisible) return;

    if (isHovered) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    // Interval to decrease remaining seconds
    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          dismissBanner();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible, isHovered, duration]);

  // If already dismissed, return null to leave ZERO DOM footprint or empty container
  if (!isVisible) {
    return null;
  }

  const durationOptions = [60, 90, 120];

  return (
    <aside
      role="alert"
      aria-live="polite"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${
        isExiting
          ? 'max-h-0 opacity-0 py-0 border-none'
          : 'max-h-24 opacity-100 bg-[#fef2f2] dark:bg-red-950/40 border-b border-red-200 dark:border-red-900/50 py-2.5 px-4'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        
        {/* Left: Badge & Urgent Text */}
        <div className="flex items-center gap-2.5 overflow-hidden text-ellipsis whitespace-nowrap text-red-900 dark:text-red-200 flex-1">
          <span className="bg-red-600 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1 shrink-0 shadow-xs animate-pulse">
            <span className="material-symbols-outlined text-[13px]">warning</span>
            <span>{t('alert.urgent_label')}</span>
          </span>
          
          <span className="truncate text-xs">
            <strong>Faux calendrier de recrutement :</strong> Une fausse note MINFOPRA circule intensivement sur WhatsApp — Rumeur démentie par arrêté officiel.
          </span>
        </div>

        {/* Right: Timer pill, Actions & Dismiss Button */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          
          {/* Remaining countdown indicator */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-[11px] font-mono text-red-700 dark:text-red-300 bg-red-100/80 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
              title="Configurer la durée d'affichage (60s, 90s, 120s)"
            >
              <span className="material-symbols-outlined text-[12px]">timer</span>
              <span>{isHovered ? (lang === 'EN' ? 'Paused' : 'En pause') : `${secondsRemaining}s`}</span>
              <span className="material-symbols-outlined text-[10px]">arrow_drop_down</span>
            </button>

            {/* Duration Selector Popup (60s to 120s configurable) */}
            {showConfig && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-40 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                  {lang === 'EN' ? 'Alert Duration' : 'Délai d’affichage'}
                </div>
                <div className="flex flex-col gap-1">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setDuration(opt);
                        setSecondsRemaining(opt);
                        setShowConfig(false);
                      }}
                      className={`px-2 py-1 rounded text-left text-xs font-semibold cursor-pointer ${
                        duration === opt
                          ? 'bg-red-600 text-white'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {opt} secondes {opt === 90 ? '(défaut)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action button: Consulter le démenti */}
          <button
            type="button"
            onClick={onConsultAlert}
            className="text-red-700 dark:text-red-300 hover:text-red-950 dark:hover:text-white font-bold flex items-center gap-1 text-xs hover:underline cursor-pointer bg-white/70 dark:bg-red-950/70 px-2.5 py-0.5 rounded-lg border border-red-300/60 dark:border-red-800"
          >
            <span>{t('alert.consult_debunk')}</span>
            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
          </button>

          {/* Dismiss close button */}
          <button
            type="button"
            onClick={dismissBanner}
            aria-label="Fermer la bannière d'alerte"
            className="p-1 rounded-md text-red-600 dark:text-red-400 hover:bg-red-200/60 dark:hover:bg-red-900/60 transition-colors flex items-center justify-center cursor-pointer"
            title="Masquer l'alerte maintenant"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

      </div>
    </aside>
  );
};
