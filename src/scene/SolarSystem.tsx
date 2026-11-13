import type { ThreeEvent } from "@react-three/fiber";
import { type JSX, useMemo, useState } from "react";
import { AdditiveBlending, type Vector3 } from "three";

import { getTech } from "@/data/techs";
import type { Project, SolarSystem } from "@/data/types";
import { useI18n } from "@/i18n/useI18n";
import { usePointerCursor } from "@/hooks/usePointerCursor";
import { PLANET_ORBIT_START, PLANET_ORBIT_STEP, projectsInSystem, projectsRoutedTo, systemLocalPosition } from "@/lib/layout";
import { getGlowTexture } from "@/lib/textures";
import { Planet } from "@/scene/Planet";
import { SpaceLabel } from "@/scene/SpaceLabel";
import { TechBadge } from "@/scene/TechBadge";
import { useUniverse } from "@/state/store";

interface SolarSystemViewProps {
  readonly system: SolarSystem;
  readonly galaxyFocused: boolean;
  readonly focused: boolean;
}

export function SolarSystemView({ system, galaxyFocused, focused }: SolarSystemViewProps): JSX.Element {
  const local: Vector3 = useMemo((): Vector3 => systemLocalPosition(system), [system]);
  const { m, tx } = useI18n();
  const tech = getTech(system.starTechId);
  const residents: readonly Project[] = projectsInSystem(system.id);
  const visitors: readonly Project[] = projectsRoutedTo(system.id);
  const setFocus = useUniverse((state) => state.setFocus);
  const [hovered, setHovered] = useState<boolean>(false);
  const pointer = usePointerCursor(setHovered);
  const glowSize: number = focused ? 10 : galaxyFocused ? (hovered ? 9 : 7) : 4.5;

  const enter = (event?: ThreeEvent<MouseEvent>): void => {
    event?.stopPropagation();
    setFocus({ kind: "system", id: system.id });
  };

  return (
    <group position={[local.x, local.y, local.z]}>
      <sprite scale={[glowSize, glowSize, 1]}>
        <spriteMaterial
          map={getGlowTexture()}
          color={tech.color}
          transparent
          opacity={focused ? 0.95 : 0.75}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
      <sprite scale={[1.6, 1.6, 1]}>
        <spriteMaterial map={getGlowTexture()} color="#fff8ec" transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
      {galaxyFocused && <TechBadge techId={system.starTechId} size={focused ? 2.4 : 2.1} />}
      {galaxyFocused && !focused && (
        <mesh onClick={enter} {...pointer}>
          <sphereGeometry args={[3.4, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      {focused && <pointLight color="#fff1dc" intensity={90} decay={2} />}
      <group visible={focused}>
        {residents.map((project: Project, index: number): JSX.Element => (
          <Planet
            key={project.id}
            project={project}
            orbit={PLANET_ORBIT_START + PLANET_ORBIT_STEP * index}
            phase={index * 2.2}
            echo={false}
            active={focused}
          />
        ))}
        {visitors.map((project: Project, index: number): JSX.Element => (
          <Planet
            key={`echo-${project.id}`}
            project={project}
            orbit={PLANET_ORBIT_START + PLANET_ORBIT_STEP * (residents.length + index)}
            phase={index * 2.2 + 1.1}
            echo
            active={focused}
          />
        ))}
      </group>
      <SpaceLabel position={[0, 0, 0]} far={260} offsetY={40} visible={galaxyFocused && !focused} collide priority={hovered ? 1 : 0}>
        <button type="button" className="space-tag" onClick={(): void => enter()}>
          <span className="space-tag__name">{tx(system.name)}</span>
          <span className="space-tag__meta">
            {m.labels.projects(residents.length)}
            {visitors.length > 0 ? ` · ${m.labels.linked(visitors.length)}` : ""}
          </span>
        </button>
      </SpaceLabel>
    </group>
  );
}
