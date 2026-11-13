/**
 * Domain model of the portfolio universe.
 *
 * Hierarchy: galaxy (language) → solar system (framework or ecosystem) →
 * planet (project) → moons (libraries). Databases are black holes and
 * tools form a relationship graph. Everything is derived from these records,
 * so a project lives in exactly one place.
 */

/** Text available in every supported language. */
export interface Localized {
  readonly es: string;
  readonly en: string;
}

export type TechKind =
  | "language"
  | "markup"
  | "framework"
  | "library"
  | "database"
  | "tool";

export type TechId =
  | "python"
  | "typescript"
  | "javascript"
  | "cpp"
  | "lua"
  | "html"
  | "css"
  | "sql"
  | "react"
  | "nextjs"
  | "fastapi"
  | "flask"
  | "nodejs"
  | "express"
  | "threejs"
  | "tailwind"
  | "zustand"
  | "zod"
  | "framer"
  | "reactrouter"
  | "prisma"
  | "sqlalchemy"
  | "pydantic"
  | "vitest"
  | "pytest"
  | "nextintl"
  | "discord"
  | "inquirer"
  | "pyqt"
  | "pywebview"
  | "playwright"
  | "socketio"
  | "mysql"
  | "sqlite"
  | "postgresql"
  | "mongodb"
  | "supabase"
  | "git"
  | "github"
  | "githubactions"
  | "vscode"
  | "docker"
  | "linux"
  | "ubuntu"
  | "nginx"
  | "vite"
  | "bun"
  | "cloudflare"
  | "mkdocs"
  | "cmake"
  | "ghidra"
  | "blender";

export interface Tech {
  readonly id: TechId;
  readonly name: string;
  readonly kind: TechKind;
  readonly color: string;
  readonly description: Localized;
}

export type GalaxySize = "major" | "medium" | "dwarf";

export interface Galaxy {
  readonly id: string;
  readonly techId: TechId;
  readonly description: Localized;
  readonly hue: number;
  readonly size: GalaxySize;
  readonly arms: number;
  readonly position: readonly [number, number, number];
  readonly tilt: readonly [number, number];
  /** Galaxy this one is gravitationally bound to (collision or satellite). */
  readonly companionOf?: string;
}

export interface Nebula {
  readonly id: string;
  readonly techId: TechId;
  readonly description: Localized;
  readonly color: string;
  readonly position: readonly [number, number, number];
}

export interface SolarSystem {
  readonly id: string;
  readonly galaxyId: string;
  readonly name: Localized;
  /** Technology whose logo shines as the star. */
  readonly starTechId: TechId;
  readonly description: Localized;
}

export type ProjectStatus = "completed" | "in-progress";

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly tagline: Localized;
  readonly description: Localized;
  readonly status: ProjectStatus;
  /** The one system where the project lives. */
  readonly systemId: string;
  /** Other systems it reaches through a wormhole (e.g. its backend). */
  readonly routes: readonly string[];
  readonly moons: readonly TechId[];
  readonly databases: readonly TechId[];
  readonly tools: readonly TechId[];
  readonly highlights: readonly Localized[];
  /** Public repository; omitted for private client work. */
  readonly repo?: string;
  readonly demo?: string;
  readonly color: string;
  /** My role when the project was built by a team. */
  readonly role?: Localized;
}

export interface Asteroid {
  readonly id: string;
  readonly name: string;
  readonly description: Localized;
  readonly techId: TechId;
  readonly repo: string;
}

export interface BlackHole {
  readonly techId: TechId;
  readonly description: Localized;
  readonly position: readonly [number, number, number];
  readonly scale: number;
}

export interface ToolNode {
  readonly techId: TechId;
  readonly position: readonly [number, number, number];
}

export interface ToolLink {
  readonly from: TechId;
  readonly to: TechId;
  readonly relation: Localized;
}

export interface SocialLink {
  readonly id: "github" | "discord" | "linkedin";
  readonly label: string;
  readonly handle: string;
  readonly url: string;
}
