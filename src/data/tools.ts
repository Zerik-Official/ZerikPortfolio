import type { ToolLink, ToolNode } from "@/data/types";
import { l } from "@/i18n/localized";

export const TOOLS_CENTER: readonly [number, number, number] = [0, 0, -1262];

export const TOOL_NODES: readonly ToolNode[] = [
  { techId: "vscode", position: [-44, 12, -1262] },
  { techId: "git", position: [-26, 22, -1270] },
  { techId: "github", position: [-4, 26, -1258] },
  { techId: "githubactions", position: [18, 16, -1266] },
  { techId: "mkdocs", position: [40, 24, -1272] },
  { techId: "docker", position: [10, -2, -1256] },
  { techId: "nginx", position: [34, -6, -1268] },
  { techId: "linux", position: [-6, -20, -1262] },
  { techId: "ubuntu", position: [18, -26, -1272] },
  { techId: "bun", position: [-14, 4, -1250] },
  { techId: "vite", position: [-36, -6, -1258] },
  { techId: "supabase", position: [44, 6, -1252] },
  { techId: "cloudflare", position: [50, -20, -1260] },
  { techId: "cmake", position: [-48, -22, -1270] },
  { techId: "ghidra", position: [-28, -30, -1264] },
  { techId: "blender", position: [-52, 30, -1274] },
];

export const TOOL_LINKS: readonly ToolLink[] = [
  { from: "vscode", to: "git", relation: l("Control de versiones integrado en el editor", "Version control built into the editor") },
  { from: "git", to: "github", relation: l("Cada commit llega al repositorio remoto", "Every commit reaches the remote repository") },
  { from: "github", to: "githubactions", relation: l("Cada push dispara la integración continua", "Every push triggers continuous integration") },
  { from: "githubactions", to: "docker", relation: l("Construye y valida las imágenes", "Builds and validates the images") },
  { from: "githubactions", to: "mkdocs", relation: l("Compila y publica la documentación", "Builds and publishes the documentation") },
  { from: "mkdocs", to: "github", relation: l("La documentación se sirve desde GitHub Pages", "The documentation is served from GitHub Pages") },
  { from: "docker", to: "nginx", relation: l("Nginx hace de proxy inverso dentro de Compose", "Nginx acts as the reverse proxy inside Compose") },
  { from: "docker", to: "linux", relation: l("Los contenedores comparten el kernel de Linux", "Containers share the Linux kernel") },
  { from: "ubuntu", to: "linux", relation: l("Distribución construida sobre el kernel Linux", "A distribution built on the Linux kernel") },
  { from: "bun", to: "vite", relation: l("Bun instala dependencias y ejecuta Vite", "Bun installs dependencies and runs Vite") },
  { from: "bun", to: "docker", relation: l("Imágenes multietapa que corren sobre Bun", "Multi-stage images that run on Bun") },
  { from: "supabase", to: "docker", relation: l("PostgreSQL en Docker en local y en Supabase en producción", "PostgreSQL in Docker locally and on Supabase in production") },
  { from: "ghidra", to: "cmake", relation: l("Ghidra encuentra las funciones; CMake compila la DLL que las llama", "Ghidra finds the functions; CMake builds the DLL that calls them") },
  { from: "cmake", to: "vscode", relation: l("Configuración y compilación de C++ desde el editor", "C++ configuration and builds from the editor") },
];
