import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { fr, TranslationKey } from '../locales/fr';
import { en } from '../locales/en';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('verif237_lang');
      if (saved === 'FR' || saved === 'EN') return saved;
    } catch {
      // Ignore localStorage errors
    }
    return 'FR';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('verif237_lang', newLang);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang.toLowerCase();
  }, [lang]);

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = lang === 'EN' ? en : fr;
    if (dict[key]) return dict[key];
    // Fallback to FR if missing in EN
    if (fr[key]) return fr[key];
    return fallback || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
