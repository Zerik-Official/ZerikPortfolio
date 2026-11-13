/**
 * Active language: detected from the browser, remembered per visitor and
 * mirrored to `<html lang>` and the document metadata.
 */
import { create } from "zustand";

export type Locale = "es" | "en";

const STORAGE_KEY: string = "zerik.locale";

function readStoredLocale(): Locale | null {
  try {
    const stored: string | null = window.localStorage.getItem(STORAGE_KEY);
    return stored === "es" || stored === "en" ? stored : null;
  } catch {
    return null;
  }
}

function detectLocale(): Locale {
  if (typeof window === "undefined") return "es";
  return readStoredLocale() ?? (navigator.language.toLowerCase().startsWith("es") ? "es" : "en");
}

interface LocaleStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useLocale = create<LocaleStore>()((set, get) => ({
  locale: detectLocale(),
  setLocale: (locale: Locale): void => {
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* Private mode: the choice simply is not remembered. */
    }
    set({ locale });
  },
  toggleLocale: (): void => get().setLocale(get().locale === "es" ? "en" : "es"),
}));
