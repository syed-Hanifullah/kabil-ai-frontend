/**
 * Client-side i18n. Manages the active locale (en/ar), derives text direction,
 * and exposes a `t()` lookup over the constant dictionaries. The toggle is pure
 * client state (no URL locale segment) persisted to localStorage, so a reload
 * keeps the chosen language. Direction (ltr/rtl) is mirrored onto <html> and
 * feeds the MUI RTL cache in app/providers.js.
 */
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  RTL_LOCALES,
  TRANSLATIONS,
} from "./translations";

const STORAGE_KEY = "qabil.locale";

const directionFor = (locale) => (RTL_LOCALES.includes(locale) ? "rtl" : "ltr");

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);

  // Hydrate the persisted choice on mount (client only).
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && LOCALES.includes(stored)) setLocaleState(stored);
  }, []);

  // Keep <html lang/dir> in sync so native text direction + a11y are correct.
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("lang", locale);
    el.setAttribute("dir", directionFor(locale));
  }, [locale]);

  const setLocale = useCallback((next) => {
    if (!LOCALES.includes(next)) return;
    window.localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "ar" : "en");
  }, [locale, setLocale]);

  const t = useCallback(
    (key) => TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS[DEFAULT_LOCALE]?.[key] ?? key,
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      direction: directionFor(locale),
      isRtl: directionFor(locale) === "rtl",
      setLocale,
      toggleLocale,
      t,
    }),
    [locale, setLocale, toggleLocale, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within <LanguageProvider>");
  return ctx;
};
