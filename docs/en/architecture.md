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
| Earth | Home, where the contact signal lands in Colombia | `Earth.tsx`, `earthMap.ts` |

`src/lib/layout.ts` derives positions and relations from these records (system placement inside a galaxy, projects per system, projects per database, links per tool, camera poses).

## The journey

- `src/data/journey.ts` lists camera **keyframes** and the **chapters** they belong to.
- `CameraRig` maps the scroll progress to a position between keyframes, with an eased dwell at each stop, pointer parallax and a pull-back on narrow screens.
- The galaxies chapter has one stop per main galaxy, in this order: Python, JavaScript, TypeScript and C++ (with Lua as its companion).
- When a galaxy, system or black hole is focused, the rig flies to its pose and the page scroll is locked until the visitor goes back.
- In the constellation, **Explore** (`ExploreToggle`) locks the scroll and lets the visitor drag the camera in both directions within fixed limits; **Done** or Escape returns to the journey.
- Scroll progress is measured against the large viewport height (`scrollRange` in `src/state/journey.ts`), so a mobile address bar sliding in or out does not nudge the camera. The canvas is sized to `100lvh` for the same reason.
- Per-frame values (progress, current stop, distance, focus and flight blends, free-look offset) live in a mutable object in `src/state/journey.ts`. Overlays subscribe with `useJourneyFrame` and write styles directly, so scrolling never re-renders React.

## Rendering and performance

- Galaxies are `Points` with a custom shader: each particle stores its orbit and the vertex shader rotates it, so the CPU does no per-particle work.
- `StopGate` renders and animates each chapter only around the stops where it belongs; galaxies also fade and stop drawing when they are behind the camera or far away.
- `PerformanceMonitor` turns bloom off on slow devices, and the bloom pass runs at half resolution.
- Logos are rasterised once into badge textures, cached for the session and uploaded to the GPU as soon as they load.
- drei's `Preload` compiles every shader and uploads every texture at start-up, so no chapter stalls the first time it appears. Galaxies start hidden and fade in on arrival.
- On touch screens labels drop their backdrop blur, the most expensive effect to composite on a phone.

## Labels

Labels are regular DOM so they stay crisp and accessible, but there is only one React tree for them:

1. `SpaceLabel` (inside the canvas) registers an anchor and its content in `src/state/labels.ts`.
2. `LabelLayer` (in the DOM) renders the content.
3. `LabelProjector` projects every anchor once per frame, fades by distance, and resolves collisions: labels that opt in are placed by priority (the hovered one wins) and then nearest first; a label that would overlap one already placed fades out until it is clear.

Galaxy, nebula, black hole, asteroid and tool relation labels all opt into collisions. On portrait screens the belt stacks its asteroids in rows so their names do not pile up, and touch input never "hovers", so a tapped card does not stay expanded.

## Contact transmission

Clicking a contact channel does not open the link straight away:

1. The card shows a spinner and "Contacting…" (`src/ui/Contact.tsx`).
2. The camera flies to a satellite orbiting Earth, which beams a signal down to Bogotá; the signal then spreads across Colombia only, with the Colombian flag floating over the country (`src/scene/Earth.tsx`).
3. The link opens in a new tab with `noopener,noreferrer`, and the camera flies back to the contact chapter.

`src/state/contactSignal.ts` owns the timeline; the scene reads the elapsed time each frame and writes the camera pose that `CameraRig` follows. From the second transmission on, the loader offers **Skip**. Browsers may block a tab opened a few seconds after the click; when the page keeps focus afterwards, the card offers to open the link directly on the next tap. With reduced motion the link opens immediately.

Earth uses real geography: `src/lib/earthMap.ts` rasterises land, borders and Colombia from Natural Earth (`world-atlas`) into the channels of a world texture plus a sharper close-up around Colombia. The data loads lazily when the browser is idle. The flag comes from `country-flag-icons`, so it renders the same on devices without flag emoji.

## Internationalization

- `src/i18n/locale.ts` picks Spanish or English from the browser, remembers the choice and exposes a toggle.
- Interface strings live in `src/i18n/messages.ts`; data texts are `Localized` objects built with `l(es, en)`.
- `useDocumentLocale` keeps `<html lang>`, the title and the meta description in sync.

## Accessibility and SEO

- The canvas is `aria-hidden`; every interactive body has a DOM button label.
- `ProjectIndex` renders a screen-reader-only list of projects, training and contact links.
- `index.html` carries Open Graph, Twitter Card and JSON-LD `Person` metadata; `robots.txt` and `sitemap.xml` live in `public/`.
