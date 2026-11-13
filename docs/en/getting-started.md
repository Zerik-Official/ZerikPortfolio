# Getting started

## Requirements

- [Bun](https://bun.sh) 1.4.4 or newer. The repository pins it in `packageManager`.
- A browser with WebGL 2. Any recent Chrome, Edge, Firefox or Safari works.

Node.js is not required: Bun installs the dependencies and runs Vite.

## Install

```bash
bun install
```

## Commands

| Command | What it does |
| --- | --- |
| `bun run dev` | Starts the Vite dev server at <http://localhost:5173> with hot reload. |
| `bun run typecheck` | Runs the TypeScript compiler without emitting files. |
| `bun run build` | Type-checks and builds the production bundle into `dist/`. |
| `bun run preview` | Serves `dist/` locally to check the production build. |

## Soundtrack in development

The soundtrack is too large to live in the repository (Cloudflare Pages accepts files up to 25 MiB). In production it streams from `https://cdn.zerikapi.site/audio/`. In development it is read from `public/`, so place the file there with its exact name:

```
public/Interstellar by  Hans Zimmer.mp3
```

`public/*.mp3` is ignored by Git. Without the file everything works except the sound button.

## Project layout

```
src/
├── audio/        # Soundtrack player with fades and a remembered volume
├── data/         # Every galaxy, system, project, tool and asteroid
├── hooks/        # Shared React hooks (journey frame, overlay fades, textures)
├── i18n/         # Spanish and English strings and the active locale
├── lib/          # Layout math, icons, procedural textures
├── scene/        # React Three Fiber components of the 3D universe
├── state/        # Zustand stores and per-frame journey state
└── ui/           # DOM overlays: HUD, panels, record drawer, contact
```

Continue with the [architecture](architecture.md).
