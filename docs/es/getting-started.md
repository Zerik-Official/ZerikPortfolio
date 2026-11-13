# Primeros pasos

## Requisitos

- [Bun](https://bun.sh) 1.4.4 o superior. El repositorio lo fija en `packageManager`.
- Un navegador con WebGL 2. Sirve cualquier versión reciente de Chrome, Edge, Firefox o Safari.

No hace falta Node.js: Bun instala las dependencias y ejecuta Vite.

## Instalación

```bash
bun install
```

## Comandos

| Comando | Qué hace |
| --- | --- |
| `bun run dev` | Inicia el servidor de desarrollo de Vite en <http://localhost:5173> con recarga en caliente. |
| `bun run typecheck` | Ejecuta el compilador de TypeScript sin generar archivos. |
| `bun run build` | Verifica los tipos y genera el bundle de producción en `dist/`. |
| `bun run preview` | Sirve `dist/` en local para revisar el build de producción. |

## Banda sonora en desarrollo

La banda sonora es demasiado grande para el repositorio (Cloudflare Pages acepta archivos de hasta 25 MiB). En producción se transmite desde `https://cdn.zerikapi.site/audio/`. En desarrollo se lee desde `public/`, así que coloca el archivo ahí con su nombre exacto:

```
public/Interstellar by  Hans Zimmer.mp3
```

`public/*.mp3` está ignorado por Git. Sin el archivo todo funciona excepto el botón de sonido.

## Estructura del proyecto

```
src/
├── audio/        # Reproductor de la banda sonora con fundidos y volumen recordado
├── data/         # Cada galaxia, sistema, proyecto, herramienta y asteroide
├── hooks/        # Hooks de React compartidos (cuadro del viaje, fundidos, texturas)
├── i18n/         # Textos en español e inglés y el idioma activo
├── lib/          # Cálculos de posición, íconos y texturas procedurales
├── scene/        # Componentes de React Three Fiber del universo 3D
├── state/        # Stores de Zustand y estado del viaje por cuadro
└── ui/           # Capas DOM: HUD, paneles, ficha de proyecto y contacto
```

Sigue con la [arquitectura](architecture.md).
