import { type JSX, useMemo } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color } from "three";

import { createRandom } from "@/lib/math";
import { getGlowTexture } from "@/lib/textures";

interface StarfieldProps {
  readonly count: number;
}

const STAR_TINTS: readonly string[] = ["#cfe3ff", "#ffffff", "#ffe2bf", "#bcd2ff", "#ffd1a1"];

export function Starfield({ count }: StarfieldProps): JSX.Element {
  const geometry: BufferGeometry = useMemo((): BufferGeometry => {
    const random: () => number = createRandom(7);
    const positions: Float32Array = new Float32Array(count * 3);
    const colors: Float32Array = new Float32Array(count * 3);
    const color: Color = new Color();
    for (let i: number = 0; i < count; i += 1) {
      positions[i * 3] = (random() - 0.5) * 1400;
      positions[i * 3 + 1] = (random() - 0.5) * 900;
      positions[i * 3 + 2] = 120 - random() * 1750;
      color.set(STAR_TINTS[Math.floor(random() * STAR_TINTS.length)] as string).multiplyScalar(0.45 + random() * 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    const built: BufferGeometry = new BufferGeometry();
    built.setAttribute("position", new BufferAttribute(positions, 3));
    built.setAttribute("color", new BufferAttribute(colors, 3));
    return built;
  }, [count]);

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={2.2}
        sizeAttenuation
        vertexColors
        map={getGlowTexture()}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
