import { useFrame } from "@react-three/fiber";
import { type JSX, useMemo, useRef } from "react";
import { AdditiveBlending, type Group } from "three";

import { getTech } from "@/data/techs";
import type { Nebula } from "@/data/types";
import { useI18n } from "@/i18n/useI18n";
import { createRandom, hashString } from "@/lib/math";
import { getGlowTexture } from "@/lib/textures";
import { SpaceLabel } from "@/scene/SpaceLabel";
import { TechBadge } from "@/scene/TechBadge";
import { useUniverse } from "@/state/store";
import { useGateActive } from "@/scene/StopGate";

interface Puff {
  readonly position: [number, number, number];
  readonly size: number;
  readonly opacity: number;
}

export function NebulaView({ nebula }: { readonly nebula: Nebula }): JSX.Element {
  const group = useRef<Group>(null);
  const { m, tx } = useI18n();
  const tech = getTech(nebula.techId);
  const anyFocus: boolean = useUniverse((state) => state.focus.kind !== "none");
  const puffs: readonly Puff[] = useMemo((): Puff[] => {
    const random: () => number = createRandom(hashString(nebula.id));
    return Array.from({ length: 34 }, (): Puff => {
      const radius: number = Math.pow(random(), 0.7) * 16;
      const theta: number = random() * Math.PI * 2;
      const phi: number = (random() - 0.5) * 1.2;
      return {
        position: [Math.cos(theta) * radius, Math.sin(phi) * radius * 0.6, Math.sin(theta) * radius * 0.7],
        size: 10 + random() * 16,
        opacity: 0.05 + random() * 0.09,
      };
    });
  }, [nebula.id]);

  const gate = useGateActive();
  useFrame((_, delta: number): void => {
    if (!gate.current) return;
    if (group.current) group.current.rotation.y += delta * 0.02;
  });

  return (
    <group position={nebula.position as [number, number, number]}>
      <group ref={group}>
        {puffs.map((puff: Puff, index: number): JSX.Element => (
          <sprite key={index} position={puff.position} scale={[puff.size, puff.size, 1]}>
            <spriteMaterial map={getGlowTexture()} color={nebula.color} transparent opacity={puff.opacity} blending={AdditiveBlending} depthWrite={false} />
          </sprite>
        ))}
      </group>
      <TechBadge techId={nebula.techId} size={3.2} opacity={0.9} />
      <SpaceLabel position={[0, -8, 0]} far={260} visible={!anyFocus} collide>
        <div className="space-label space-label--static">
          <span className="space-label__title">{m.labels.nebula(tech.name)}</span>
          <span className="space-label__body">{tx(nebula.description)}</span>
        </div>
      </SpaceLabel>
    </group>
  );
}
