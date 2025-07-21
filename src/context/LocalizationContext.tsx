"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { SupportedLocale } from '@/lib/types';
import en from '@/lib/locales/en.json';
import zh from '@/lib/locales/zh.json';

type Translations = typeof en;

interface LocalizationContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: keyof Translations, params?: Record<string, string>) => string;
}

const translationsData = { en, zh };

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<SupportedLocale>('en');
  const [translations, setTranslations] = useState<Translations>(translationsData.en);

  useEffect(() => {
    setTranslations(translationsData[locale]);
  }, [locale]);
  
  const t = useCallback((key: keyof Translations, params?: Record<string, string>): string => {
    let translation = translations[key] || key;
    if (params) {
        for (const [paramKey, paramValue] of Object.entries(params)) {
            translation = translation.replace(`{${paramKey}}`, paramValue);
        }
    }
    return translation;
  }, [translations]);

  const value = {
    locale,
    setLocale,
    t,
  };

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}
