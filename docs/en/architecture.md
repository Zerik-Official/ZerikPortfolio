# Architecture

The portfolio is a single page: a fixed WebGL canvas behind DOM overlays, driven by the page scroll.

## The universe model

Everything shown comes from the typed records in `src/data/`, so each project lives in exactly one place:

| Concept | Meaning | Source |
| --- | --- | --- |
| Galaxy | A programming language | `universe.ts` |
| Nebula | Markup that is not a language (HTML, CSS) | `universe.ts` |
| Solar system | A framework or ecosystem inside a galaxy; its star is the framework logo | `universe.ts` |
| Planet | A project, placed in its main system | `projects.ts` |
| Echo planet | The same project seen from another system it reaches (a "wormhole") | `routes` in `projects.ts` |
| Moon | A library the project uses | `moons` in `projects.ts` |
| Black hole | A database; projects that use it orbit it | `universe.ts`, `databases` in `projects.ts` |
| Constellation | Tools and how they relate | `tools.ts` |
| Asteroid belt | Training projects | `learning.ts` |

`src/lib/layout.ts` derives positions and relations from these records (system placement inside a galaxy, projects per system, projects per database, links per tool, camera poses).

## The journey

- `src/data/journey.ts` lists camera **keyframes** and the **chapters** they belong to.
- `CameraRig` maps the scroll progress to a position between keyframes, with an eased dwell at each stop, pointer parallax and a pull-back on narrow screens.
- When a galaxy, system or black hole is focused, the rig flies to its pose and the page scroll is locked until the visitor goes back.
- Per-frame values (progress, current stop, distance, focus blend) live in a mutable object in `src/state/journey.ts`. Overlays subscribe with `useJourneyFrame` and write styles directly, so scrolling never re-renders React.

## Rendering and performance

- Galaxies are `Points` with a custom shader: each particle stores its orbit and the vertex shader rotates it, so the CPU does no per-particle work.
- `StopGate` renders and animates each chapter only around the stops where it belongs; galaxies also fade and stop drawing when they are behind the camera or far away.
- `PerformanceMonitor` turns bloom off on slow devices, and the bloom pass runs at half resolution.
- Logos are rasterised once into badge textures and cached for the session.

## Labels

Labels are regular DOM so they stay crisp and accessible, but there is only one React tree for them:

1. `SpaceLabel` (inside the canvas) registers an anchor and its content in `src/state/labels.ts`.
2. `LabelLayer` (in the DOM) renders the content.
3. `LabelProjector` projects every anchor once per frame, fades by distance, and resolves collisions: labels that opt in are placed by priority (the hovered one wins) and then nearest first; a label that would overlap one already placed fades out until it is clear.

## Internationalization

- `src/i18n/locale.ts` picks Spanish or English from the browser, remembers the choice and exposes a toggle.
- Interface strings live in `src/i18n/messages.ts`; data texts are `Localized` objects built with `l(es, en)`.
- `useDocumentLocale` keeps `<html lang>`, the title and the meta description in sync.

## Accessibility and SEO

- The canvas is `aria-hidden`; every interactive body has a DOM button label.
- `ProjectIndex` renders a screen-reader-only list of projects, training and contact links.
- `index.html` carries Open Graph, Twitter Card and JSON-LD `Person` metadata; `robots.txt` and `sitemap.xml` live in `public/`.
