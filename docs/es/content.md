# Editar el contenido

Todo el contenido son datos. Agregar un proyecto o una herramienta nunca requiere tocar el código de la escena.

## Textos bilingües

Cada texto visible en los datos es un objeto `Localized`. Se crea con el helper `l`, primero en español:

```ts
import { l } from "@/i18n/localized";

tagline: l("Banca multi-tenant como servicio", "Multi-tenant banking as a service"),
```

Los textos de la interfaz (botones, títulos, plurales) están en `src/i18n/messages.ts`, con un bloque por idioma.

## Agregar un proyecto

Añade un registro en `src/data/projects.ts`:

```ts
{
  id: "mi-proyecto",
  name: "Mi Proyecto",
  tagline: l("...", "..."),
  description: l("...", "..."),
  status: "in-progress",           // o "completed"
  systemId: "fastapi",              // el único sistema donde vive
  routes: ["react"],                // otros sistemas a los que llega (ecos opcionales)
  moons: ["pydantic", "sqlalchemy"],// librerías, se muestran como lunas con su logo
  databases: ["postgresql"],        // agujeros negros que orbita
  tools: ["docker"],                // herramientas de la constelación
  highlights: [l("...", "...")],
  repo: "https://github.com/...",   // omítelo en proyectos privados
  demo: "https://...",              // opcional
  color: "#c9a27a",                 // color del planeta
  role: l("...", "..."),            // opcional, para trabajo en equipo o de empresa
}
```

- Un proyecto sin `repo` muestra "Repositorio privado" y, si tiene `role`, aparece como proyecto de empresa.
- Cada id en `moons`, `databases` y `tools` debe existir en `src/data/techs.ts`.

## Agregar una tecnología

1. Agrega su id a la unión `TechId` en `src/data/types.ts`.
2. Agrega un registro en `src/data/techs.ts` con su nombre, tipo, color de marca y una descripción bilingüe.
3. Importa su logo en `src/lib/icons.ts`. Prefiere el original a color de Devicon; si Devicon no tiene la marca, usa el path de Simple Icons teñido con `tint()`. Sin logo, la insignia muestra las dos primeras letras.

## Agregar un sistema solar o una galaxia

- Los sistemas están en `SYSTEMS` (`src/data/universe.ts`) y se reparten solos alrededor de su galaxia.
- Las galaxias están en `GALAXIES`. Si agregas una, dale un lugar libre en el recorrido y añade en `src/data/journey.ts` un keyframe de cámara que la mire.

## Agregar una relación entre herramientas

Edita `src/data/tools.ts`: `TOOL_NODES` ubica cada herramienta en la constelación y `TOOL_LINKS` describe cómo se relacionan dos herramientas. Al seleccionar una herramienta se iluminan sus enlaces y se listan los proyectos que la usan.

## Agregar un proyecto de formación

Añádelo a `ASTEROIDS` en `src/data/learning.ts`. El cinturón reparte solo los asteroides con nombre.

## Enlaces de contacto

`SOCIAL_LINKS` en `src/data/journey.ts`. Los logos salen de `SOCIAL_ICONS` en `src/lib/icons.ts`.
