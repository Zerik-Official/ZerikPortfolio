import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import type { Texture } from "three";

import type { TechId } from "@/data/types";
import { loadBadgeTexture } from "@/lib/textures";

/**
 * Logo badge texture for a technology. It is uploaded to the GPU as soon as it
 * loads, so a chapter full of badges does not upload them all on arrival.
 */
export function useBadgeTexture(techId: TechId): Texture | null {
  const gl = useThree((state) => state.gl);
  const [texture, setTexture] = useState<Texture | null>(null);
  useEffect((): (() => void) => {
    let active: boolean = true;
    void loadBadgeTexture(techId).then((loaded: Texture): void => {
      if (!active) return;
      gl.initTexture(loaded);
      setTexture(loaded);
    });
    return (): void => {
      active = false;
    };
  }, [techId, gl]);
  return texture;
}
