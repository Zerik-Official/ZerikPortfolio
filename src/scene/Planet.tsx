import { Line } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { type JSX, useMemo, useRef, useState } from "react";
import type { Group } from "three";

import type { Project, TechId } from "@/data/types";
import { useI18n } from "@/i18n/useI18n";
import { usePointerCursor } from "@/hooks/usePointerCursor";
import { SpaceLabel } from "@/scene/SpaceLabel";
import { TechBadge } from "@/scene/TechBadge";
import { useUniverse } from "@/state/store";

interface PlanetProps {
  readonly project: Project;
  readonly orbit: number;
  readonly phase: number;
  /** A project whose home is another system, reached through a wormhole. */
  readonly echo: boolean;
  /** Whether its system is focused; inactive planets stay mounted but idle. */
  readonly active: boolean;
}

interface MoonProps {
  readonly techId: TechId;
  readonly index: number;
  readonly planetRadius: number;
}

function Moon({ techId, index, planetRadius }: MoonProps): JSX.Element {
  const pivot = useRef<Group>(null);
  const orbit: number = planetRadius + 0.75 + index * 0.42;
  const speed: number = 0.9 - index * 0.08;
  useFrame(({ clock }): void => {
    const angle: number = clock.elapsedTime * speed + index * 2.4;
    pivot.current?.position.set(Math.cos(angle) * orbit, Math.sin(angle * 0.7) * 0.25, Math.sin(angle) * orbit);
  });
  return (
    <group ref={pivot}>
      <TechBadge techId={techId} size={0.55} />
    </group>
  );
}

function circlePoints(radius: number): [number, number, number][] {
  return Array.from({ length: 129 }, (_: unknown, i: number): [number, number, number] => {
    const angle: number = (i / 128) * Math.PI * 2;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  });
}

export function Planet({ project, orbit, phase, echo, active }: PlanetProps): JSX.Element {
  const body = useRef<Group>(null);
  const { m, tx } = useI18n();
  const openProject = useUniverse((state) => state.openProject);
  const [hovered, setHovered] = useState<boolean>(false);
  const pointer = usePointerCursor(setHovered);
  const points = useMemo((): [number, number, number][] => circlePoints(orbit), [orbit]);
  const speed: number = 0.32 / Math.sqrt(orbit);
  const radius: number = echo ? 0.55 : 0.8 + Math.min(project.moons.length, 6) * 0.05;

  useFrame(({ clock }): void => {
    if (!active) return;
    const angle: number = phase + clock.elapsedTime * speed;
    body.current?.position.set(Math.cos(angle) * orbit, 0, Math.sin(angle) * orbit);
  });

  const open = (event: ThreeEvent<MouseEvent>): void => {
    event.stopPropagation();
    openProject(project.id);
  };

  return (
    <group>
      <Line
        points={points}
        color={echo ? "#ffb36b" : "#ffffff"}
        transparent
        opacity={echo ? 0.4 : 0.16}
        lineWidth={1}
        dashed={echo}
        dashSize={0.5}
        gapSize={0.35}
      />
      <group ref={body}>
        <mesh onClick={open} {...pointer} scale={hovered ? 1.18 : 1}>
          <sphereGeometry args={[radius, 40, 40]} />
          {echo ? (
            <meshBasicMaterial color={project.color} wireframe transparent opacity={0.6} />
          ) : (
            <meshStandardMaterial
              color={project.color}
              emissive={project.color}
              emissiveIntensity={hovered ? 0.6 : 0.2}
              roughness={0.7}
              metalness={0.1}
            />
          )}
        </mesh>
        {!echo && active && project.moons.map((techId: TechId, index: number): JSX.Element => (
          <Moon key={techId} techId={techId} index={index} planetRadius={radius} />
        ))}
        <SpaceLabel position={[0, 0, 0]} far={70} offsetY={26} visible={active} collide priority={hovered ? 1 : 0}>
          <button
            type="button"
            className="space-tag space-tag--compact"
            data-echo={echo}
            data-active={hovered}
            onPointerEnter={(): void => setHovered(true)}
            onPointerLeave={(): void => setHovered(false)}
            onClick={(): void => openProject(project.id)}
          >
            <span className="space-tag__name">{project.name}</span>
            <span className="space-tag__meta">{echo ? m.labels.wormhole : tx(project.tagline)}</span>
          </button>
        </SpaceLabel>
      </group>
    </group>
  );
}
