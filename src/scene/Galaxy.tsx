import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { type JSX, useEffect, useMemo, useRef, useState } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, DoubleSide, type Group, ShaderMaterial, Sphere, type SpriteMaterial, Vector3 } from "three";

import { getTech } from "@/data/techs";
import type { Galaxy, SolarSystem } from "@/data/types";
import { usePointerCursor } from "@/hooks/usePointerCursor";
import { useI18n } from "@/i18n/useI18n";
import { galaxyRadius, getSystem, projectsInGalaxy, systemsOf } from "@/lib/layout";
import { clamp, createRandom, dampFactor, hashString } from "@/lib/math";
import { getGlowTexture } from "@/lib/textures";
import { GALAXY_FRAGMENT, GALAXY_VERTEX } from "@/scene/shaders";
import { SolarSystemView } from "@/scene/SolarSystem";
import { SpaceLabel } from "@/scene/SpaceLabel";
import { journey } from "@/state/journey";
import { type Focus, useUniverse } from "@/state/store";

/** Galaxies fade out past this journey stop, once the black holes come into view. */
const GALAXIES_UNTIL: number = 7.1;
/** Galaxy labels wait until the learning belt is behind, so they never cover it. */
const LABELS_FROM: number = 2.55;

function galaxiesReachable(): boolean {
  return journey.stop >= LABELS_FROM;
}

const PARTICLES: Readonly<Record<Galaxy["size"], number>> = { major: 14000, medium: 8000, dwarf: 3500 };

interface GalaxyViewProps {
  readonly galaxy: Galaxy;
  readonly density: number;
}

function buildGeometry(galaxy: Galaxy, radius: number, count: number): BufferGeometry {
  const random: () => number = createRandom(hashString(galaxy.id));
  const orbits: Float32Array = new Float32Array(count * 3);
  const sizes: Float32Array = new Float32Array(count);
  const colors: Float32Array = new Float32Array(count * 3);
  const color: Color = new Color();
  for (let i: number = 0; i < count; i += 1) {
    const r: number = Math.pow(random(), 0.62) * radius;
    const arm: number = i % galaxy.arms;
    const spread: number = (random() - 0.5) * 0.95 * (r / radius + 0.18);
    orbits[i * 3] = r;
    orbits[i * 3 + 1] = (r / radius) * 3.1 + (arm * Math.PI * 2) / galaxy.arms + spread;
    orbits[i * 3 + 2] = (random() - 0.5) * radius * 0.1 * (1.25 - r / radius);
    sizes[i] = 0.35 + random() * 0.9;
    const core: number = 1 - r / radius;
    const hue: number = (galaxy.hue + (random() - 0.5) * 36 + 360) % 360;
    color.setHSL(hue / 360, 0.85 - core * 0.45, 0.55 + core * 0.3 + random() * 0.1);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  const geometry: BufferGeometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute("aOrbit", new BufferAttribute(orbits, 3));
  geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
  geometry.setAttribute("aColor", new BufferAttribute(colors, 3));
  geometry.boundingSphere = new Sphere(new Vector3(), radius * 1.05);
  return geometry;
}

function galaxyFocusState(focus: Focus, galaxyId: string): { readonly here: boolean; readonly systemId: string | null } {
  if (focus.kind === "galaxy") return { here: focus.id === galaxyId, systemId: null };
  if (focus.kind === "system") return { here: getSystem(focus.id)?.galaxyId === galaxyId, systemId: focus.id };
  return { here: false, systemId: null };
}

export function GalaxyView({ galaxy, density }: GalaxyViewProps): JSX.Element {
  const radius: number = galaxyRadius(galaxy);
  const tech = getTech(galaxy.techId);
  const { m, tx } = useI18n();
  const focus: Focus = useUniverse((state) => state.focus);
  const setFocus = useUniverse((state) => state.setFocus);
  const { here, systemId } = galaxyFocusState(focus, galaxy.id);
  const anyFocus: boolean = focus.kind !== "none";
  const systems: readonly SolarSystem[] = systemsOf(galaxy.id);
  const projectCount: number = projectsInGalaxy(galaxy.id).length;
  const [hovered, setHovered] = useState<boolean>(false);
  const pointer = usePointerCursor(setHovered, galaxiesReachable);
  const [coreMaterial, setCoreMaterial] = useState<SpriteMaterial | null>(null);
  const center: Vector3 = useMemo((): Vector3 => new Vector3(...galaxy.position), [galaxy.position]);
  const systemsGroup = useRef<Group>(null);
  const body = useRef<Group>(null);
  const labelGroup = useRef<Group>(null);

  const geometry: BufferGeometry = useMemo(
    (): BufferGeometry => buildGeometry(galaxy, radius, Math.round(PARTICLES[galaxy.size] * density)),
    [galaxy, radius, density],
  );
  const material: ShaderMaterial = useMemo(
    (): ShaderMaterial =>
      new ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uRadius: { value: radius }, uScale: { value: 400 }, uOpacity: { value: 0 } },
        vertexShader: GALAXY_VERTEX,
        fragmentShader: GALAXY_FRAGMENT,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [radius],
  );
  useEffect((): (() => void) => (): void => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useFrame((state, delta: number): void => {
    const uniforms = material.uniforms as Record<string, { value: number }>;
    (uniforms.uTime as { value: number }).value = state.clock.elapsedTime;
    const fov: number = (state.camera as { fov?: number }).fov ?? 55;
    (uniforms.uScale as { value: number }).value = (state.size.height * state.viewport.dpr * 0.5) / Math.tan((fov * Math.PI) / 360) * 0.5;
    const reveal: number = clamp((400 - journey.viewer.distanceTo(center)) / 150) * clamp((GALAXIES_UNTIL - journey.stop) / 0.4) * clamp((journey.stop - 1.4) / 0.6);
    const target: number = here ? (systemId ? 0.3 : 0.75) : (anyFocus ? 0.12 : hovered ? 1.35 : 1) * reveal;
    const opacity = uniforms.uOpacity as { value: number };
    opacity.value += (target - opacity.value) * dampFactor(4, delta);
    if (coreMaterial) coreMaterial.opacity = opacity.value * 0.9;
    if (systemsGroup.current) systemsGroup.current.visible = here || reveal > 0.05;
    if (body.current) body.current.visible = here || opacity.value > 0.004;
    if (labelGroup.current) labelGroup.current.visible = journey.stop > LABELS_FROM && reveal > 0.3;
  });

  const enter = (event?: ThreeEvent<MouseEvent>): void => {
    if (event && journey.stop < LABELS_FROM) return;
    event?.stopPropagation();
    setFocus({ kind: "galaxy", id: galaxy.id });
  };

  return (
    <>
      <group ref={body} position={galaxy.position as [number, number, number]} rotation={[galaxy.tilt[0], 0, galaxy.tilt[1]]}>
        <points geometry={geometry} material={material} />
        <sprite scale={[radius * 0.95, radius * 0.95, 1]}>
          <spriteMaterial
            ref={setCoreMaterial}
            map={getGlowTexture()}
            color={new Color().setHSL(galaxy.hue / 360, 1, 0.78)}
            transparent
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
        {!anyFocus && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={enter} {...pointer}>
            <circleGeometry args={[radius * 0.85, 40]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} side={DoubleSide} />
          </mesh>
        )}
        <group ref={systemsGroup}>
          {systems.map((system: SolarSystem): JSX.Element => (
            <SolarSystemView key={system.id} system={system} galaxyFocused={here} focused={systemId === system.id} />
          ))}
        </group>
      </group>
      <group ref={labelGroup} visible={false}>
        <SpaceLabel
          position={[galaxy.position[0], galaxy.position[1] - radius * 0.62, galaxy.position[2]]}
          far={radius * 6}
          visible={!anyFocus}
          collide
          priority={hovered ? 1 : 0}
        >
          <button type="button" className="space-label" data-hovered={hovered} onClick={(): void => enter()}>
            <span className="space-label__title">{tech.name}</span>
            <span className="space-label__body">{tx(galaxy.description)}</span>
            <span className="space-label__cta">
              {systems.length > 0
                ? `${m.labels.systems(systems.length)} · ${m.labels.projects(projectCount)} · ${m.labels.enter}`
                : `${m.labels.companion} · ${m.labels.enter}`}
            </span>
          </button>
        </SpaceLabel>
      </group>
    </>
  );
}
