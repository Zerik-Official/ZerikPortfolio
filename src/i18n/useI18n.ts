import { useCallback, useEffect } from "react";

import type { Localized } from "@/data/types";
import { type Locale, useLocale } from "@/i18n/locale";
import { MESSAGES, type Messages } from "@/i18n/messages";

export interface I18n {
  readonly locale: Locale;
  readonly m: Messages;
  /** Picks the active language from a bilingual text. */
  readonly tx: (text: Localized) => string;
}

export function useI18n(): I18n {
  const locale: Locale = useLocale((state) => state.locale);
  const tx = useCallback((text: Localized): string => text[locale], [locale]);
  return { locale, m: MESSAGES[locale], tx };
}

/** Keeps `<html lang>`, the title and the meta description in the active language. */
export function useDocumentLocale(): void {
  const { locale, m } = useI18n();
  useEffect((): void => {
    document.documentElement.lang = locale;
    document.title = m.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", m.meta.description);
  }, [locale, m]);
}
