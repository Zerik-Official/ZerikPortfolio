/**
 * Procedural textures: a shared soft glow and logo "badges" rasterised from
 * the bundled SVG icons onto a light disc so dark logos stay readable.
 */
import { CanvasTexture, SRGBColorSpace, type Texture } from "three";

import type { TechId } from "@/data/types";
import { getIconUrl } from "@/lib/icons";
import { getTech } from "@/data/techs";

const BADGE_SIZE: number = 256;

let glowTexture: CanvasTexture | null = null;

export function getGlowTexture(): CanvasTexture {
  if (glowTexture) return glowTexture;
  const canvas: HTMLCanvasElement = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
  const gradient: CanvasGradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.18, "rgba(255,255,255,0.55)");
  gradient.addColorStop(0.45, "rgba(255,255,255,0.12)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  glowTexture = new CanvasTexture(canvas);
  return glowTexture;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject): void => {
    const image: HTMLImageElement = new Image();
    image.decoding = "async";
    image.onload = (): void => resolve(image);
    image.onerror = (): void => reject(new Error(`Failed to load icon ${url}`));
    image.src = url;
  });
}

function drawBadge(context: CanvasRenderingContext2D, accent: string, image: HTMLImageElement | null, fallback: string): void {
  const center: number = BADGE_SIZE / 2;
  const radius: number = BADGE_SIZE * 0.46;
  const plate: CanvasGradient = context.createRadialGradient(center * 0.8, center * 0.7, radius * 0.1, center, center, radius);
  plate.addColorStop(0, "#fffaf1");
  plate.addColorStop(1, "#d9d2c4");
  context.fillStyle = plate;
  context.beginPath();
  context.arc(center, center, radius, 0, Math.PI * 2);
  context.fill();
  context.lineWidth = BADGE_SIZE * 0.025;
  context.strokeStyle = accent;
  context.stroke();
  if (image) {
    const size: number = radius * 1.18;
    context.drawImage(image, center - size / 2, center - size / 2, size, size);
    return;
  }
  context.fillStyle = "#1b1712";
  context.font = `500 ${BADGE_SIZE * 0.26}px Jost, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(fallback, center, center + 4);
}

const badgeCache: Map<TechId, Promise<Texture>> = new Map();

/** Logo badge texture for a technology, cached for the whole session. */
export function loadBadgeTexture(techId: TechId): Promise<Texture> {
  const cached: Promise<Texture> | undefined = badgeCache.get(techId);
  if (cached) return cached;
  const tech = getTech(techId);
  const url: string | null = getIconUrl(techId);
  const promise: Promise<Texture> = (url ? loadImage(url).catch((): null => null) : Promise.resolve(null)).then(
    (image: HTMLImageElement | null): Texture => {
      const canvas: HTMLCanvasElement = document.createElement("canvas");
      canvas.width = canvas.height = BADGE_SIZE;
      const context: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
      drawBadge(context, tech.color, image, tech.name.slice(0, 2));
      const texture: CanvasTexture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = 4;
      return texture;
    },
  );
  badgeCache.set(techId, promise);
  return promise;
}
