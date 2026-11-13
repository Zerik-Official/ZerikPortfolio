/**
 * Derived placement and relations of the universe, computed from the data
 * records so nothing is positioned or linked by hand twice.
 */
import { Euler, Vector3 } from "three";

import { ASTEROIDS } from "@/data/learning";
import { PROJECTS } from "@/data/projects";
import { TOOL_LINKS } from "@/data/tools";
import type { Asteroid, Galaxy, GalaxySize, Project, SolarSystem, TechId, ToolLink } from "@/data/types";
import { BLACK_HOLES, GALAXIES, SYSTEMS } from "@/data/universe";
import type { Vec3 } from "@/data/journey";

const GALAXY_RADIUS: Readonly<Record<GalaxySize, number>> = { major: 60, medium: 40, dwarf: 22 };

export const SYSTEM_SCALE: number = 1;
export const PLANET_ORBIT_START: number = 4.2;
export const PLANET_ORBIT_STEP: number = 2.4;

export function galaxyRadius(galaxy: Galaxy): number {
  return GALAXY_RADIUS[galaxy.size];
}

export function galaxyEuler(galaxy: Galaxy): Euler {
  return new Euler(galaxy.tilt[0], 0, galaxy.tilt[1]);
}

export function galaxyNormal(galaxy: Galaxy): Vector3 {
  return new Vector3(0, 1, 0).applyEuler(galaxyEuler(galaxy));
}

export function getGalaxy(id: string): Galaxy | undefined {
  return GALAXIES.find((galaxy: Galaxy): boolean => galaxy.id === id);
}

export function getSystem(id: string): SolarSystem | undefined {
  return SYSTEMS.find((system: SolarSystem): boolean => system.id === id);
}

export function systemsOf(galaxyId: string): readonly SolarSystem[] {
  return SYSTEMS.filter((system: SolarSystem): boolean => system.galaxyId === galaxyId);
}

/** Position of a system in its galaxy's local (disc) space. */
export function systemLocalPosition(system: SolarSystem): Vector3 {
  const galaxy: Galaxy | undefined = getGalaxy(system.galaxyId);
  if (!galaxy) return new Vector3();
  const siblings: readonly SolarSystem[] = systemsOf(galaxy.id);
  const index: number = siblings.indexOf(system);
  const radius: number = galaxyRadius(galaxy) * (siblings.length === 1 ? 0.3 : 0.48);
  const angle: number = (index / siblings.length) * Math.PI * 2 + 0.6;
  return new Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
}

export function systemWorldPosition(system: SolarSystem): Vector3 {
  const galaxy: Galaxy | undefined = getGalaxy(system.galaxyId);
  if (!galaxy) return new Vector3();
  return systemLocalPosition(system)
    .applyEuler(galaxyEuler(galaxy))
    .add(new Vector3(...galaxy.position));
}

export function projectsInSystem(systemId: string): readonly Project[] {
  return PROJECTS.filter((project: Project): boolean => project.systemId === systemId);
}

export function projectsRoutedTo(systemId: string): readonly Project[] {
  return PROJECTS.filter((project: Project): boolean => project.routes.includes(systemId));
}

export function projectsInGalaxy(galaxyId: string): readonly Project[] {
  const ids: ReadonlySet<string> = new Set(systemsOf(galaxyId).map((system: SolarSystem): string => system.id));
  return PROJECTS.filter((project: Project): boolean => ids.has(project.systemId));
}

export function asteroidsOfTech(techIds: readonly TechId[]): readonly Asteroid[] {
  return ASTEROIDS.filter((asteroid: Asteroid): boolean => techIds.includes(asteroid.techId));
}

export function projectsUsingDatabase(techId: TechId): readonly Project[] {
  return PROJECTS.filter((project: Project): boolean => project.databases.includes(techId));
}

export function projectsUsingTool(techId: TechId): readonly Project[] {
  return PROJECTS.filter((project: Project): boolean => project.tools.includes(techId));
}

export function linksOfTool(techId: TechId): readonly ToolLink[] {
  return TOOL_LINKS.filter((link: ToolLink): boolean => link.from === techId || link.to === techId);
}

export interface CameraPose {
  readonly position: Vec3;
  readonly lookAt: Vec3;
}

function toTuple(vector: Vector3): Vec3 {
  return [vector.x, vector.y, vector.z];
}

export function galaxyPose(galaxy: Galaxy): CameraPose {
  const center: Vector3 = new Vector3(...galaxy.position);
  const radius: number = galaxyRadius(galaxy);
  const eye: Vector3 = center
    .clone()
    .add(galaxyNormal(galaxy).multiplyScalar(radius * 1.25))
    .add(new Vector3(0, 0, radius * 0.7));
  return { position: toTuple(eye), lookAt: toTuple(center) };
}

export function systemPose(system: SolarSystem): CameraPose {
  const galaxy: Galaxy | undefined = getGalaxy(system.galaxyId);
  const center: Vector3 = systemWorldPosition(system);
  const normal: Vector3 = galaxy ? galaxyNormal(galaxy) : new Vector3(0, 1, 0);
  const count: number = projectsInSystem(system.id).length + projectsRoutedTo(system.id).length;
  const reach: number = PLANET_ORBIT_START + PLANET_ORBIT_STEP * Math.max(count, 1);
  const eye: Vector3 = center
    .clone()
    .add(normal.multiplyScalar(reach * 1.5))
    .add(new Vector3(0, 0, reach * 1.1));
  return { position: toTuple(eye), lookAt: toTuple(center) };
}

export function blackHolePose(techId: TechId): CameraPose | null {
  const hole = BLACK_HOLES.find((item): boolean => item.techId === techId);
  if (!hole) return null;
  const [x, y, z] = hole.position;
  return { position: [x, y + 4 * hole.scale, z + 34 * hole.scale], lookAt: [x, y, z] };
}
