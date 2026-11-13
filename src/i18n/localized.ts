import type { Localized } from "@/data/types";

/** Builds a bilingual text, Spanish first. */
export function l(es: string, en: string): Localized {
  return { es, en };
}
