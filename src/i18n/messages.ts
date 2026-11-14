/** Interface strings for every supported language. */
import type { Locale } from "@/i18n/locale";

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export interface Messages {
  readonly meta: { readonly title: string; readonly description: string };
  readonly intro: { readonly tagline: string; readonly role: string; readonly quote: string; readonly scroll: string };
  readonly about: {
    readonly bio: string;
    readonly job: string;
    readonly study: string;
    readonly focus: readonly string[];
  };
  readonly hud: {
    readonly chapters: string;
    readonly sound: (on: boolean) => string;
    readonly lightYears: string;
    readonly language: string;
    readonly progress: string;
    readonly volume: string;
    readonly explore: string;
    readonly exploreDone: string;
    readonly exploreHint: string;
  };
  readonly labels: {
    readonly systems: (count: number) => string;
    readonly projects: (count: number) => string;
    readonly linked: (count: number) => string;
    readonly enter: string;
    readonly companion: string;
    readonly wormhole: string;
    readonly orbiting: (count: number) => string;
    readonly noPublicProjects: string;
    readonly nebula: (name: string) => string;
  };
  readonly panel: {
    readonly universe: string;
    readonly galaxy: (name: string) => string;
    readonly system: (name: string) => string;
    readonly blackHoles: string;
    readonly breadcrumb: string;
    readonly totalProjects: (count: number) => string;
    readonly solarSystems: string;
    readonly planets: string;
    readonly wormholes: string;
    readonly livesIn: (name: string) => string;
    readonly inOrbit: string;
    readonly beltTraining: string;
    readonly back: string;
    readonly backToJourney: string;
    readonly hide: string;
    readonly show: string;
  };
  readonly dossier: {
    readonly label: string;
    readonly close: string;
    readonly completed: string;
    readonly inProgress: string;
    readonly team: string;
    readonly company: string;
    readonly moons: string;
    readonly databases: string;
    readonly tools: string;
    readonly wormholes: string;
    readonly alsoConnects: (targets: string) => string;
    readonly and: string;
    readonly repository: string;
    readonly privateRepository: string;
    readonly live: string;
  };
  readonly selection: { readonly close: string; readonly usedBy: string; readonly viewRepository: string };
  readonly contact: {
    readonly kicker: string;
    readonly title: string;
    readonly body: string;
    readonly connecting: string;
    readonly transmitting: (channel: string) => string;
    readonly skip: string;
    readonly blocked: string;
  };
  readonly index: {
    readonly label: string;
    readonly projects: string;
    readonly training: string;
    readonly contact: string;
    readonly demo: (name: string) => string;
  };
}

const ES: Messages = {
  meta: {
    title: "Andrés «Zerik» · Desarrollador Full Stack",
    description:
      "Portafolio de Andrés «Zerik», desarrollador full stack en Colombia: una expedición 3D por sus lenguajes, frameworks y proyectos con Python, TypeScript, React y C++.",
  },
  intro: {
    tagline: "Una expedición por mi universo",
    role: "FULL STACK DEVELOPER · COLOMBIA",
    quote: "La programación es un universo inmenso, y yo soy el astronauta que recorre sus planetas.",
    scroll: "DESPLÁZATE PARA COMENZAR",
  },
  about: {
    bio: "Soy Andrés, conocido como Zerik. Llevo más de tres años automatizando procesos y construyendo herramientas que resuelven problemas reales. Python es mi hogar; la ingeniería inversa, mi curiosidad.",
    job: "Desarrollador de automatización y Sub-Jefe del departamento · NaerZone · 2023–2026",
    study: "Desarrollo de Software · Riwi · Barranquilla",
    focus: [
      "Automatización end-to-end con Python y Playwright",
      "Backends con FastAPI y Flask",
      "Interfaces con React, TypeScript y Three.js",
      "Ingeniería inversa en C++ con Ghidra",
      "Docker, CI y despliegue con dominios propios",
    ],
  },
  hud: {
    chapters: "Capítulos",
    sound: (on: boolean): string => `Sonido: ${on ? "sí" : "no"}`,
    lightYears: "años luz",
    language: "Cambiar a inglés",
    progress: "Progreso del viaje",
    volume: "Volumen",
    explore: "Explorar",
    exploreDone: "Listo",
    exploreHint: "Arrastra para moverte por la constelación",
  },
  labels: {
    systems: (count: number): string => plural(count, "sistema", "sistemas"),
    projects: (count: number): string => plural(count, "proyecto", "proyectos"),
    linked: (count: number): string => plural(count, "conectado", "conectados"),
    enter: "entrar",
    companion: "galaxia compañera",
    wormhole: "↗ conexión por agujero de gusano",
    orbiting: (count: number): string => `${plural(count, "proyecto", "proyectos")} en órbita`,
    noPublicProjects: "sin proyectos públicos aún",
    nebula: (name: string): string => `Nebulosa ${name}`,
  },
  panel: {
    universe: "Universo",
    galaxy: (name: string): string => `Galaxia ${name}`,
    system: (name: string): string => `Sistema ${name}`,
    blackHoles: "Agujeros negros",
    breadcrumb: "Ruta",
    totalProjects: (count: number): string => `${plural(count, "proyecto", "proyectos")} en total.`,
    solarSystems: "Sistemas solares",
    planets: "Planetas · proyectos",
    wormholes: "Conectados por agujero de gusano",
    livesIn: (name: string): string => `vive en ${name}`,
    inOrbit: "Proyectos en órbita",
    beltTraining: "Formación en el cinturón",
    back: "← Atrás",
    backToJourney: "Volver al viaje",
    hide: "Ocultar detalles",
    show: "Ver detalles",
  },
  dossier: {
    label: "Archivo de proyecto",
    close: "Cerrar",
    completed: "Completado",
    inProgress: "En desarrollo",
    team: "Proyecto en equipo",
    company: "Proyecto de empresa",
    moons: "Lunas · librerías",
    databases: "Agujeros negros · datos",
    tools: "Herramientas",
    wormholes: "Agujeros de gusano",
    alsoConnects: (targets: string): string => `También conecta con ${targets}.`,
    and: " y ",
    repository: "Repositorio ↗",
    privateRepository: "Repositorio privado",
    live: "Ver en vivo ↗",
  },
  selection: { close: "Cerrar", usedBy: "Proyectos que la usan", viewRepository: "Ver repositorio ↗" },
  contact: {
    kicker: "Fin de la expedición",
    title: "Abre un canal",
    body: "¿Un proyecto, una idea o una oportunidad? Encuéntrame en cualquiera de estas frecuencias.",
    connecting: "Contactando…",
    transmitting: (channel: string): string => `Enviando señal a ${channel}`,
    skip: "Saltar",
    blocked: "¿No se abrió? Toca para abrir ↗",
  },
  index: {
    label: "Índice de proyectos",
    projects: "Proyectos",
    training: "Formación",
    contact: "Contacto",
    demo: (name: string): string => `Demo de ${name}`,
  },
};

const EN: Messages = {
  meta: {
    title: "Andrés “Zerik” · Full Stack Developer",
    description:
      "Portfolio of Andrés “Zerik”, a full stack developer from Colombia: a 3D expedition through his languages, frameworks and projects with Python, TypeScript, React and C++.",
  },
  intro: {
    tagline: "An expedition through my universe",
    role: "FULL STACK DEVELOPER · COLOMBIA",
    quote: "Programming is an immense universe, and I am the astronaut who travels its planets.",
    scroll: "SCROLL TO BEGIN",
  },
  about: {
    bio: "I'm Andrés, known as Zerik. For more than three years I've been automating processes and building tools that solve real problems. Python is my home; reverse engineering, my curiosity.",
    job: "Automation developer and deputy head of the department · NaerZone · 2023–2026",
    study: "Software Development · Riwi · Barranquilla",
    focus: [
      "End-to-end automation with Python and Playwright",
      "Backends with FastAPI and Flask",
      "Interfaces with React, TypeScript and Three.js",
      "Reverse engineering in C++ with Ghidra",
      "Docker, CI and deployments on my own domains",
    ],
  },
  hud: {
    chapters: "Chapters",
    sound: (on: boolean): string => `Sound: ${on ? "on" : "off"}`,
    lightYears: "light-years",
    language: "Switch to Spanish",
    progress: "Journey progress",
    volume: "Volume",
    explore: "Explore",
    exploreDone: "Done",
    exploreHint: "Drag to move around the constellation",
  },
  labels: {
    systems: (count: number): string => plural(count, "system", "systems"),
    projects: (count: number): string => plural(count, "project", "projects"),
    linked: (count: number): string => `${count} linked`,
    enter: "enter",
    companion: "companion galaxy",
    wormhole: "↗ linked through a wormhole",
    orbiting: (count: number): string => `${plural(count, "project", "projects")} in orbit`,
    noPublicProjects: "no public projects yet",
    nebula: (name: string): string => `${name} Nebula`,
  },
  panel: {
    universe: "Universe",
    galaxy: (name: string): string => `${name} galaxy`,
    system: (name: string): string => `${name} system`,
    blackHoles: "Black holes",
    breadcrumb: "Breadcrumb",
    totalProjects: (count: number): string => `${plural(count, "project", "projects")} in total.`,
    solarSystems: "Solar systems",
    planets: "Planets · projects",
    wormholes: "Linked through wormholes",
    livesIn: (name: string): string => `lives in ${name}`,
    inOrbit: "Projects in orbit",
    beltTraining: "Training in the belt",
    back: "← Back",
    backToJourney: "Back to the journey",
    hide: "Hide details",
    show: "Show details",
  },
  dossier: {
    label: "Project record",
    close: "Close",
    completed: "Completed",
    inProgress: "In progress",
    team: "Team project",
    company: "Company project",
    moons: "Moons · libraries",
    databases: "Black holes · data",
    tools: "Tools",
    wormholes: "Wormholes",
    alsoConnects: (targets: string): string => `Also connects to ${targets}.`,
    and: " and ",
    repository: "Repository ↗",
    privateRepository: "Private repository",
    live: "Live demo ↗",
  },
  selection: { close: "Close", usedBy: "Projects using it", viewRepository: "View repository ↗" },
  contact: {
    kicker: "End of the expedition",
    title: "Open a channel",
    body: "A project, an idea or an opportunity? Find me on any of these frequencies.",
    connecting: "Contacting…",
    transmitting: (channel: string): string => `Sending signal to ${channel}`,
    skip: "Skip",
    blocked: "Didn't open? Tap to open it ↗",
  },
  index: {
    label: "Project index",
    projects: "Projects",
    training: "Training",
    contact: "Contact",
    demo: (name: string): string => `${name} demo`,
  },
};

export const MESSAGES: Readonly<Record<Locale, Messages>> = { es: ES, en: EN };
