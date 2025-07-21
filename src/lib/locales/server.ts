// src/lib/locales/server.ts
import 'server-only';
import type { SupportedLocale } from '@/lib/types';

const translations = {
  en: () => import('@/lib/locales/en.json').then((module) => module.default),
  zh: () => import('@/lib/locales/zh.json').then((module) => module.default),
};

export const getTranslations = async (locale: SupportedLocale) => translations[locale]();

type Translations = Awaited<ReturnType<typeof getTranslations>>;

export const getTranslator = async (locale: SupportedLocale) => {
  const dictionary = await getTranslations(locale);

  return (key: keyof Translations, params?: Record<string, string>): string => {
    let translation = dictionary[key] || key;
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        translation = translation.replace(`{${paramKey}}`, paramValue);
      }
    }
    return translation;
  };
};
