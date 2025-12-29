"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { withTolgee, Tolgee, I18nextPlugin, DevTools } from "@tolgee/i18next";

// Import static translation data
import thTranslation from "@/messages/th.json";
import enTranslation from "@/messages/en.json";

// Get stored language from localStorage or cookie
export function getStoredLanguage(serverLocale?: string): string {
  // If server provided a locale (via props from layout), use it as source of truth
  if (serverLocale) return serverLocale;

  if (typeof window !== "undefined") {
    // Check document.documentElement.lang first (set by layout)
    if (document.documentElement.lang) {
      return document.documentElement.lang;
    }

    // First check localStorage
    const storedLang = localStorage.getItem("language");
    if (storedLang) {
      return storedLang;
    }
    
    // Then check cookie
    const cookieMatch = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
    if (cookieMatch) {
      return cookieMatch[1];
    }
  }
  return "th";
}

// Set language to localStorage, cookie, and HTML lang attribute
export function setStoredLanguage(lang: string): void {
  if (typeof window !== "undefined") {
    // Save to localStorage
    localStorage.setItem("language", lang);
    
    // Update HTML lang attribute for accessibility and SEO
    document.documentElement.lang = lang;
    
    // Set cookie for server-side detection (1 year expiry)
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `NEXT_LOCALE=${lang};expires=${expires.toUTCString()};path=/`;
  }
}

// Initialize Tolgee
const isDev = process.env.NODE_ENV === "development";

const tolgee = Tolgee()
  .use(DevTools())
  .use(I18nextPlugin())
  .init({
    // Tolgee Cloud connection (for in-context editing in development)
    apiUrl: process.env.NEXT_PUBLIC_TOLGEE_API_URL,
    apiKey: process.env.NEXT_PUBLIC_TOLGEE_API_KEY,
    
    // Fallback static data (for production or when API is unavailable)
    staticData: {
      "th:translation": thTranslation,
      "en:translation": enTranslation,
    },
  });

// Initialize Tolgee
// We export an init function to be called by Providers with server-detected locale
export function initTolgee(locale?: string) {
  const lng = getStoredLanguage(locale);

  // If already initialized, just change language if needed
  if (i18n.isInitialized) {
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
    return;
  }

  withTolgee(i18n, tolgee)
    .use(initReactI18next)
    .init({
      lng: lng,
      fallbackLng: "th",
      supportedLngs: ["th", "en"],
      defaultNS: "translation",
      interpolation: {
        escapeValue: false, // React already escapes
      },
    });
}

export { i18n, tolgee };
