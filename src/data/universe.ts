import type { BlackHole, Galaxy, Nebula, SolarSystem } from "@/data/types";
import { l } from "@/i18n/localized";

export const GALAXIES: readonly Galaxy[] = [
  {
    id: "python",
    techId: "python",
    description: l(
      "Mi galaxia principal. Aquí nacen los backends, los clientes de red y las herramientas de automatización.",
      "My home galaxy. This is where backends, network clients and automation tools are born.",
    ),
    hue: 46,
    size: "major",
    arms: 4,
    position: [-72, 6, -360],
    tilt: [1.05, 0.25],
  },
  {
    id: "typescript",
    techId: "typescript",
    description: l(
      "Donde viven mis interfaces y servicios Node. JavaScript orbita muy cerca.",
      "Where my interfaces and Node services live. JavaScript orbits close by.",
    ),
    hue: 212,
    size: "major",
    arms: 3,
    position: [76, -8, -520],
    tilt: [1.15, -0.3],
  },
  {
    id: "javascript",
    techId: "javascript",
    description: l(
      "Galaxia compañera de TypeScript: los fundamentos con los que empecé y las interfaces sin framework.",
      "TypeScript's companion galaxy: the fundamentals I started with and framework-free interfaces.",
    ),
    hue: 54,
    size: "medium",
    arms: 2,
    position: [186, 46, -652],
    tilt: [0.9, 0.5],
    companionOf: "typescript",
  },
  {
    id: "cpp",
    techId: "cpp",
    description: l(
      "Bajo nivel: memoria de procesos, punteros y el arte de entender binarios ajenos.",
      "Low level: process memory, pointers and the craft of understanding someone else's binaries.",
    ),
    hue: 262,
    size: "medium",
    arms: 3,
    position: [-80, -12, -700],
    tilt: [1.2, 0.15],
  },
  {
    id: "lua",
    techId: "lua",
    description: l(
      "Galaxia enana, satélite de C++: el lenguaje que los juegos incrustan para dejarse modificar.",
      "A dwarf galaxy orbiting C++: the language games embed so they can be modded.",
    ),
    hue: 232,
    size: "dwarf",
    arms: 2,
    position: [-22, 30, -752],
    tilt: [0.8, -0.4],
    companionOf: "cpp",
  },
];

export const NEBULAE: readonly Nebula[] = [
  {
    id: "html",
    techId: "html",
    description: l(
      "No es un lenguaje de programación sino una nebulosa: la materia de la que se forma cada interfaz.",
      "Not a programming language but a nebula: the matter every interface is made of.",
    ),
    color: "#e44d26",
    position: [14, 62, -596],
  },
  {
    id: "css",
    techId: "css",
    description: l("La nebulosa gemela: luz, color y forma para esa materia.", "The twin nebula: light, color and shape for that matter."),
    color: "#2f8fe0",
    position: [42, 72, -620],
  },
];

export const SYSTEMS: readonly SolarSystem[] = [
  {
    id: "fastapi",
    galaxyId: "python",
    name: l("FastAPI", "FastAPI"),
    starTechId: "fastapi",
    description: l("APIs tipadas con Pydantic y SQLAlchemy. Aquí orbitan mis backends.", "Typed APIs with Pydantic and SQLAlchemy. My backends orbit here."),
  },
  {
    id: "flask",
    galaxyId: "python",
    name: l("Flask", "Flask"),
    starTechId: "flask",
    description: l("APIs REST y microservidores web ligeros.", "REST APIs and lightweight web microservers."),
  },
  {
    id: "python-native",
    galaxyId: "python",
    name: l("Python puro", "Pure Python"),
    starTechId: "python",
    description: l("Sin framework: redes, criptografía, scraping y juegos.", "No framework: networking, cryptography, scraping and games."),
  },
  {
    id: "react",
    galaxyId: "typescript",
    name: l("React", "React"),
    starTechId: "react",
    description: l("Interfaces por componentes con Vite, Tailwind y Zustand.", "Component interfaces with Vite, Tailwind and Zustand."),
  },
  {
    id: "nextjs",
    galaxyId: "typescript",
    name: l("Next.js", "Next.js"),
    starTechId: "nextjs",
    description: l("Aplicaciones completas con App Router y servidor.", "Full applications with the App Router and a server."),
  },
  {
    id: "node",
    galaxyId: "typescript",
    name: l("Node.js · Express", "Node.js · Express"),
    starTechId: "nodejs",
    description: l("Servicios HTTP en TypeScript sobre Node y Bun.", "TypeScript HTTP services on Node and Bun."),
  },
  {
    id: "vanilla",
    galaxyId: "javascript",
    name: l("Vanilla JS", "Vanilla JS"),
    starTechId: "vite",
    description: l("Interfaces sin framework: JavaScript puro servido con Vite.", "Framework-free interfaces: plain JavaScript served by Vite."),
  },
  {
    id: "reverse",
    galaxyId: "cpp",
    name: l("Ingeniería inversa", "Reverse engineering"),
    starTechId: "ghidra",
    description: l("DLLs inyectadas y funciones internas de clientes de juego.", "Injected DLLs and the internal functions of game clients."),
  },
  {
    id: "modding",
    galaxyId: "lua",
    name: l("Modding", "Modding"),
    starTechId: "lua",
    description: l("Mods de juegos guiados por eventos.", "Event-driven game mods."),
  },
];

export const BLACK_HOLES: readonly BlackHole[] = [
  {
    techId: "postgresql",
    description: l("El más denso: transacciones, tipos ricos y una base aislada por servicio.", "The densest: transactions, rich types and one isolated database per service."),
    position: [0, -4, -990],
    scale: 1.25,
  },
  {
    techId: "sqlite",
    description: l("Compacto: un archivo y un horizonte de eventos. Ideal para backends autocontenidos.", "Compact: one file and one event horizon. Ideal for self-contained backends."),
    position: [62, 14, -1035],
    scale: 0.8,
  },
  {
    techId: "mysql",
    description: l("Masivo y relacional, con gravedad de servidor. Lo usé en producción en NaerZone y en CoDecide.", "Massive and relational, with server-sized gravity. I ran it in production at NaerZone and in CoDecide."),
    position: [-58, 20, -1060],
    scale: 0.75,
  },
  {
    techId: "mongodb",
    description: l("Un agujero distinto: documentos sin esquema fijo, junto a MySQL en CoDecide.", "A different kind of hole: schemaless documents, next to MySQL in CoDecide."),
    position: [-30, -24, -1100],
    scale: 0.55,
  },
];
