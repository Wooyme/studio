// src/lib/locales/server.ts
import 'server-only';
import type { SupportedLocale } from '@/lib/types';

const translations = {
  en: () => import('@/lib/locales/en.json').then((module) => module.default),
  zh: () => import('@/lib/locales/zh.json').then((module) => module.default),
};

export const getTranslations = async (locale: SupportedLocale) => translations[locale]();
