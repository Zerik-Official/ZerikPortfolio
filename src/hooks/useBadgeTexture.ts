import { useEffect, useState } from "react";
import type { Texture } from "three";

import type { TechId } from "@/data/types";
import { loadBadgeTexture } from "@/lib/textures";

export function useBadgeTexture(techId: TechId): Texture | null {
  const [texture, setTexture] = useState<Texture | null>(null);
  useEffect((): (() => void) => {
    let active: boolean = true;
    void loadBadgeTexture(techId).then((loaded: Texture): void => {
      if (active) setTexture(loaded);
    });
    return (): void => {
      active = false;
    };
  }, [techId]);
  return texture;
}
