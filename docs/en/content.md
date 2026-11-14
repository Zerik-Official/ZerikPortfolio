# Editing the content

All content is data. Adding a project or a tool never requires touching the scene code.

## Bilingual texts

Every visible text in the data is a `Localized` object. Build it with the `l` helper, Spanish first:

```ts
import { l } from "@/i18n/localized";

tagline: l("Banca multi-tenant como servicio", "Multi-tenant banking as a service"),
```

Interface strings (buttons, headings, plurals) live in `src/i18n/messages.ts`, with one block per language.

## Add a project

Append a record to `src/data/projects.ts`:

```ts
{
  id: "my-project",
  name: "My Project",
  tagline: l("...", "..."),
  description: l("...", "..."),
  status: "in-progress",           // or "completed"
  systemId: "fastapi",              // the one system where it lives
  routes: ["react"],                // other systems it reaches (optional echoes)
  moons: ["pydantic", "sqlalchemy"],// libraries, shown as moons with their logo
  databases: ["postgresql"],        // black holes it orbits
  tools: ["docker"],                // tools in the constellation
  highlights: [l("...", "...")],
  repo: "https://github.com/...",   // omit for private projects
  demo: "https://...",              // optional
  color: "#c9a27a",                 // planet color
  role: l("...", "..."),            // optional, for team or company work
}
```

- A project without `repo` shows "Private repository" and is labelled as company work when it has a `role`.
- Every id in `moons`, `databases` and `tools` must exist in `src/data/techs.ts`.

## Add a technology

1. Add its id to the `TechId` union in `src/data/types.ts`.
2. Add a record to `src/data/techs.ts` with its name, kind, brand color and a bilingual description.
3. Import its logo in `src/lib/icons.ts`. Prefer the full-color Devicon original; when Devicon lacks the brand, use a Simple Icons path tinted with `tint()`. Without a logo, the badge falls back to the first two letters.

## Add a solar system or a galaxy

- Systems live in `SYSTEMS` (`src/data/universe.ts`). They are spread automatically around their galaxy.
- Galaxies live in `GALAXIES`. If you add one, give it a free spot along the journey and add a camera keyframe that looks at it in `src/data/journey.ts`.

## Add a tool relation

Edit `src/data/tools.ts`: `TOOL_NODES` places each tool in the constellation and `TOOL_LINKS` describes how two tools relate. Selecting a tool lights up its links and lists the projects that use it.

## Add a training project

Append it to `ASTEROIDS` in `src/data/learning.ts`. The belt spreads named asteroids automatically: along an arc on wide screens and in rows of three on portrait screens.

## Contact links

`SOCIAL_LINKS` in `src/data/journey.ts`. Logos come from `SOCIAL_ICONS` in `src/lib/icons.ts`. Every link goes through the contact transmission described in the [architecture](architecture.md#contact-transmission).
