import type { Localized, SocialLink } from "@/data/types";
import { l } from "@/i18n/localized";

export type Vec3 = readonly [number, number, number];

export type ChapterId =
  | "ignition"
  | "pilot"
  | "learning"
  | "galaxies"
  | "blackholes"
  | "tools"
  | "contact";

export interface Keyframe {
  readonly chapter: ChapterId;
  readonly position: Vec3;
  readonly lookAt: Vec3;
}

export interface Chapter {
  readonly id: ChapterId;
  readonly name: Localized;
  readonly subtitle?: Localized;
}

/** Camera stops along the scroll journey; the camera eases between them. */
export const KEYFRAMES: readonly Keyframe[] = [
  { chapter: "ignition", position: [0, 0, 30], lookAt: [0, 0, -100] },
  { chapter: "pilot", position: [0, 2, -40], lookAt: [0, 0, -140] },
  { chapter: "learning", position: [0, 9, -132], lookAt: [0, -4, -205] },
  { chapter: "galaxies", position: [-18, 28, -212], lookAt: [-72, 6, -360] },
  { chapter: "galaxies", position: [52, 30, -370], lookAt: [118, 14, -580] },
  { chapter: "galaxies", position: [-30, 24, -560], lookAt: [-62, 4, -720] },
  { chapter: "blackholes", position: [0, 10, -866], lookAt: [0, 0, -1020] },
  { chapter: "tools", position: [-14, 9, -1172], lookAt: [-8, 7, -1262] },
  { chapter: "contact", position: [0, 8, -1340], lookAt: [0, -26, -1460] },
];

export const CHAPTERS: readonly Chapter[] = [
  { id: "ignition", name: l("Ignición", "Ignition") },
  { id: "pilot", name: l("Piloto", "Pilot") },
  {
    id: "learning",
    name: l("Cinturón de aprendizaje", "Learning belt"),
    subtitle: l("mis proyectos de formación · toca un asteroide", "my training projects · tap an asteroid"),
  },
  { id: "galaxies", name: l("Galaxias", "Galaxies"), subtitle: l("lenguajes · toca una galaxia para entrar", "languages · tap a galaxy to enter") },
  {
    id: "blackholes",
    name: l("Agujeros negros", "Black holes"),
    subtitle: l("bases de datos · toca uno para ver qué orbita", "databases · tap one to see what orbits it"),
  },
  {
    id: "tools",
    name: l("Constelación", "Constellation"),
    subtitle: l("herramientas · toca una para ver sus conexiones", "tools · tap one to see its connections"),
  },
  { id: "contact", name: l("Contacto", "Contact") },
];

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { id: "github", label: "GitHub", handle: "Zerik-Official", url: "https://github.com/Zerik-Official" },
  { id: "discord", label: "Discord", handle: "Zerik", url: "https://discord.com/users/738137581295763576" },
  { id: "linkedin", label: "LinkedIn", handle: "Gustavo Andrés Guzmán Mejía", url: "https://www.linkedin.com/in/gustavo-andr%C3%A9s-guzm%C3%A1n-mej%C3%ADa-701a37425" },
];

/** Index of the first keyframe of each chapter, used by the chapter nav. */
export function firstKeyframeOf(chapter: ChapterId): number {
  return KEYFRAMES.findIndex((frame: Keyframe): boolean => frame.chapter === chapter);
}
