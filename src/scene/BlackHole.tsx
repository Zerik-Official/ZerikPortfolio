import { Billboard } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { type JSX, useMemo, useState } from "react";
import { AdditiveBlending, Color, DoubleSide, ShaderMaterial } from "three";

import { getTech } from "@/data/techs";
import type { BlackHole } from "@/data/types";
import { useI18n } from "@/i18n/useI18n";
import { usePointerCursor } from "@/hooks/usePointerCursor";
import { projectsUsingDatabase } from "@/lib/layout";
import { getGlowTexture } from "@/lib/textures";
import { ACCRETION_FRAGMENT, ACCRETION_VERTEX, HALO_FRAGMENT } from "@/scene/shaders";
import { SpaceLabel } from "@/scene/SpaceLabel";
import { TechBadge } from "@/scene/TechBadge";
import { useUniverse } from "@/state/store";
import { useGateActive } from "@/scene/StopGate";

const HORIZON: number = 4;

function createDiscMaterial(fragmentShader: string, hot: string, cool: string): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uHot: { value: new Color(hot) },
      uCool: { value: new Color(cool) },
    },
    vertexShader: ACCRETION_VERTEX,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
  });
}

/** Ring geometry with uv.x = angle and uv.y = normalised radius. */
function RingUv({ inner, outer }: { readonly inner: number; readonly outer: number }): JSX.Element {
  return <ringGeometry args={[inner, outer, 160, 24]} onUpdate={(geometry): void => {
    const position = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    if (!position || !uv) return;
    for (let i: number = 0; i < position.count; i += 1) {
      const x: number = position.getX(i);
      const y: number = position.getY(i);
      const angle: number = (Math.atan2(y, x) / (Math.PI * 2) + 1) % 1;
      const radius: number = (Math.hypot(x, y) - inner) / (outer - inner);
      uv.setXY(i, angle, radius);
    }
    uv.needsUpdate = true;
  }} />;
}

export function BlackHoleView({ hole }: { readonly hole: BlackHole }): JSX.Element {
  const tech = getTech(hole.techId);
  const { m } = useI18n();
  const focus = useUniverse((state) => state.focus);
  const setFocus = useUniverse((state) => state.setFocus);
  const focused: boolean = focus.kind === "blackhole" && focus.techId === hole.techId;
  const anyFocus: boolean = focus.kind !== "none";
  const [hovered, setHovered] = useState<boolean>(false);
  const pointer = usePointerCursor(setHovered);
  const orbiting: number = projectsUsingDatabase(hole.techId).length;
  const disc: ShaderMaterial = useMemo((): ShaderMaterial => createDiscMaterial(ACCRETION_FRAGMENT, "#fff3df", tech.color), [tech.color]);
  const halo: ShaderMaterial = useMemo((): ShaderMaterial => createDiscMaterial(HALO_FRAGMENT, "#ffd9a8", tech.color), [tech.color]);

  const gate = useGateActive();
  useFrame(({ clock }): void => {
    if (!gate.current) return;
    const time: number = clock.elapsedTime;
    (disc.uniforms.uTime as { value: number }).value = time;
    const glow: number = hovered || focused ? 1.35 : 1;
    (disc.uniforms.uOpacity as { value: number }).value = glow;
    (halo.uniforms.uOpacity as { value: number }).value = glow;
  });

  const enter = (event?: ThreeEvent<MouseEvent>): void => {
    event?.stopPropagation();
    setFocus({ kind: "blackhole", techId: hole.techId });
  };

  return (
    <group position={hole.position as [number, number, number]} scale={hole.scale}>
      <sprite scale={[42, 42, 1]}>
        <spriteMaterial map={getGlowTexture()} color={tech.color} transparent opacity={0.22} blending={AdditiveBlending} depthWrite={false} />
      </sprite>
      <mesh>
        <sphereGeometry args={[HORIZON, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Generous invisible hit area, so the smaller holes are easy to tap. */}
      <mesh onClick={enter} {...pointer}>
        <sphereGeometry args={[HORIZON * 2.6, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      <group rotation={[Math.PI / 2 - 0.22, 0, 0.12]}>
        <mesh material={disc}>
          <RingUv inner={HORIZON * 1.35} outer={HORIZON * 4.2} />
        </mesh>
      </group>
      <Billboard>
        <mesh material={halo}>
          <RingUv inner={HORIZON * 1.02} outer={HORIZON * 1.75} />
        </mesh>
      </Billboard>
      <TechBadge techId={hole.techId} size={3} position={[0, HORIZON * 2.6, 0]} onClick={enter} {...pointer} />
      <SpaceLabel position={[0, -HORIZON * 2.4, 0]} far={260} visible={!anyFocus || focused} collide priority={hovered || focused ? 1 : 0}>
        <button type="button" className="space-label space-label--compact" data-hovered={hovered} onClick={(): void => enter()}>
          <span className="space-label__title">{tech.name}</span>
          <span className="space-label__cta">
            {orbiting > 0 ? m.labels.orbiting(orbiting) : m.labels.noPublicProjects}
          </span>
        </button>
      </SpaceLabel>
    </group>
  );
}
