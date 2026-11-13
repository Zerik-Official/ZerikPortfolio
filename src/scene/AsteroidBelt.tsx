import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { type JSX, useLayoutEffect, useMemo, useRef, useState } from "react";
import { DodecahedronGeometry, type Group, type InstancedMesh, Object3D } from "three";

import { ASTEROIDS } from "@/data/learning";
import type { Asteroid } from "@/data/types";
import { usePointerCursor } from "@/hooks/usePointerCursor";
import { clamp, createRandom } from "@/lib/math";
import { SpaceLabel } from "@/scene/SpaceLabel";
import { TechBadge } from "@/scene/TechBadge";
import { useUniverse } from "@/state/store";
import { useGateActive } from "@/scene/StopGate";

export const BELT_CENTER: readonly [number, number, number] = [0, -4, -205];
const BELT_RADIUS: number = 58;

function createRockGeometry(seed: number, detail: number): DodecahedronGeometry {
  const geometry: DodecahedronGeometry = new DodecahedronGeometry(1, detail);
  const random: () => number = createRandom(seed);
  const position = geometry.attributes.position;
  if (position) {
    for (let i: number = 0; i < position.count; i += 1) {
      const scale: number = 0.75 + random() * 0.45;
      position.setXYZ(i, position.getX(i) * scale, position.getY(i) * scale * 0.8, position.getZ(i) * scale);
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

function Rubble({ count }: { readonly count: number }): JSX.Element {
  const mesh = useRef<InstancedMesh>(null);
  const spin = useRef<Group>(null);
  const geometry: DodecahedronGeometry = useMemo((): DodecahedronGeometry => createRockGeometry(3, 0), []);

  useLayoutEffect((): void => {
    if (!mesh.current) return;
    const random: () => number = createRandom(11);
    const dummy: Object3D = new Object3D();
    for (let i: number = 0; i < count; i += 1) {
      const angle: number = random() * Math.PI * 2;
      const radius: number = BELT_RADIUS + (random() - 0.5) * 26;
      dummy.position.set(Math.cos(angle) * radius, (random() - 0.5) * 7, Math.sin(angle) * radius);
      dummy.rotation.set(random() * 6, random() * 6, random() * 6);
      dummy.scale.setScalar(0.12 + Math.pow(random(), 3) * 1.3);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [count]);

  const gate = useGateActive();
  useFrame((_, delta: number): void => {
    if (!gate.current) return;
    if (spin.current) spin.current.rotation.y += delta * 0.012;
  });

  return (
    <group ref={spin}>
      <instancedMesh ref={mesh} args={[geometry, undefined, count]} frustumCulled={false}>
        <meshStandardMaterial color="#8d8274" roughness={0.95} flatShading />
      </instancedMesh>
    </group>
  );
}

interface NamedAsteroidProps {
  readonly asteroid: Asteroid;
  readonly position: [number, number, number];
  readonly index: number;
}

function NamedAsteroid({ asteroid, position, index }: NamedAsteroidProps): JSX.Element {
  const body = useRef<Group>(null);
  const select = useUniverse((state) => state.select);
  const selected: boolean = useUniverse((state) => state.selection.kind === "asteroid" && state.selection.id === asteroid.id);
  const [hovered, setHovered] = useState<boolean>(false);
  const pointer = usePointerCursor(setHovered);
  const geometry: DodecahedronGeometry = useMemo((): DodecahedronGeometry => createRockGeometry(index + 40, 1), [index]);

  const gate = useGateActive();
  useFrame(({ clock }): void => {
    if (!gate.current) return;
    if (!body.current) return;
    const time: number = clock.elapsedTime;
    body.current.position.y = Math.sin(time * 0.6 + index) * 0.4;
    body.current.rotation.set(time * 0.15 + index, time * 0.1, 0);
  });

  const choose = (event?: ThreeEvent<MouseEvent>): void => {
    event?.stopPropagation();
    select({ kind: "asteroid", id: asteroid.id });
  };
  const active: boolean = hovered || selected;

  return (
    <group position={position}>
      <group ref={body}>
        <mesh geometry={geometry} scale={active ? 1.9 : 1.6} onClick={choose} {...pointer}>
          <meshStandardMaterial color={active ? "#c9a27a" : "#7d7366"} roughness={0.9} flatShading emissive="#ffb36b" emissiveIntensity={active ? 0.25 : 0} />
        </mesh>
      </group>
      <TechBadge techId={asteroid.techId} size={active ? 2.1 : 1.7} position={[0, 2.8, 0]} onClick={choose} {...pointer} />
      <SpaceLabel position={[0, -2.6, 0]} far={70}>
        <button type="button" className="asteroid-tag" data-active={active} onClick={(): void => choose()}>
          {asteroid.name}
        </button>
      </SpaceLabel>
    </group>
  );
}

export function AsteroidBelt({ density }: { readonly density: number }): JSX.Element {
  const aspect: number = useThree((state) => state.size.width / state.size.height);
  const spread: number = clamp(aspect * 0.55, 0.55, 1.15);
  const placements: [number, number, number][] = useMemo(
    (): [number, number, number][] =>
      ASTEROIDS.map((_: Asteroid, index: number): [number, number, number] => {
        const t: number = ASTEROIDS.length === 1 ? 0.5 : index / (ASTEROIDS.length - 1);
        const angle: number = (t - 0.5) * 2 * spread;
        const radius: number = 40 + (index % 2) * 6;
        return [Math.sin(angle) * radius, (index % 3) * 3 - 3, Math.cos(angle) * radius];
      }),
    [spread],
  );

  return (
    <group position={BELT_CENTER as [number, number, number]}>
      <Rubble count={Math.round(900 * density)} />
      {ASTEROIDS.map((asteroid: Asteroid, index: number): JSX.Element => (
        <NamedAsteroid key={asteroid.id} asteroid={asteroid} index={index} position={placements[index] as [number, number, number]} />
      ))}
    </group>
  );
}
