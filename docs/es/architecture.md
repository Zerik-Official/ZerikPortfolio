# Arquitectura

El portafolio es una sola página: un canvas WebGL fijo detrás de capas DOM, controlado por el scroll de la página.

## El modelo del universo

Todo lo que se muestra sale de los registros tipados en `src/data/`, así que cada proyecto vive en un único lugar:

| Concepto | Significado | Origen |
| --- | --- | --- |
| Galaxia | Un lenguaje de programación | `universe.ts` |
| Nebulosa | Lenguajes de marcado (HTML, CSS) | `universe.ts` |
| Sistema solar | Un framework o ecosistema dentro de una galaxia; su estrella es el logo del framework | `universe.ts` |
| Planeta | Un proyecto, ubicado en su sistema principal | `projects.ts` |
| Planeta eco | El mismo proyecto visto desde otro sistema al que llega (un "agujero de gusano") | `routes` en `projects.ts` |
| Luna | Una librería que usa el proyecto | `moons` en `projects.ts` |
| Agujero negro | Una base de datos; los proyectos que la usan orbitan a su alrededor | `universe.ts`, `databases` en `projects.ts` |
| Constelación | Herramientas y cómo se relacionan | `tools.ts` |
| Cinturón de asteroides | Proyectos de formación | `learning.ts` |

`src/lib/layout.ts` deriva posiciones y relaciones a partir de esos registros (ubicación de los sistemas dentro de cada galaxia, proyectos por sistema, proyectos por base de datos, enlaces por herramienta y poses de cámara).

## El viaje

- `src/data/journey.ts` define los **keyframes** de la cámara y los **capítulos** a los que pertenecen.
- `CameraRig` convierte el progreso del scroll en una posición entre keyframes, con una pausa suavizada en cada parada, paralaje con el puntero y un alejamiento en pantallas angostas.
- Al enfocar una galaxia, un sistema o un agujero negro, la cámara vuela a su pose y el scroll queda bloqueado hasta que el visitante vuelve.
- Los valores por cuadro (progreso, parada actual, distancia, mezcla de enfoque) viven en un objeto mutable en `src/state/journey.ts`. Las capas se suscriben con `useJourneyFrame` y escriben estilos directamente, así que el scroll nunca vuelve a renderizar React.

## Renderizado y rendimiento

- Las galaxias son `Points` con un shader propio: cada partícula guarda su órbita y el vertex shader la rota, así que la CPU no trabaja por partícula.
- `StopGate` dibuja y anima cada capítulo solo cerca de sus paradas; las galaxias además se desvanecen y dejan de dibujarse cuando quedan detrás de la cámara o lejos.
- `PerformanceMonitor` apaga el bloom en equipos lentos, y el bloom se calcula a la mitad de la resolución.
- Los logos se rasterizan una sola vez como texturas y quedan en caché durante la sesión.

## Etiquetas

Las etiquetas son DOM normal para que se vean nítidas y sean accesibles, pero comparten un solo árbol de React:

1. `SpaceLabel` (dentro del canvas) registra un ancla y su contenido en `src/state/labels.ts`.
2. `LabelLayer` (en el DOM) renderiza el contenido.
3. `LabelProjector` proyecta cada ancla una vez por cuadro, aplica el desvanecimiento por distancia y resuelve choques: las etiquetas que participan se ubican por prioridad (gana la que tiene el mouse encima) y luego de la más cercana a la más lejana; si una taparía a otra ya ubicada, se desvanece hasta que quede libre.

## Internacionalización

- `src/i18n/locale.ts` elige español o inglés según el navegador, recuerda la elección y expone el cambio de idioma.
- Los textos de la interfaz están en `src/i18n/messages.ts`; los textos de los datos son objetos `Localized` creados con `l(es, en)`.
- `useDocumentLocale` mantiene sincronizados `<html lang>`, el título y la meta descripción.

## Accesibilidad y SEO

- El canvas es `aria-hidden`; cada cuerpo interactivo tiene un botón DOM como etiqueta.
- `ProjectIndex` renderiza una lista solo para lectores de pantalla con proyectos, formación y enlaces de contacto.
- `index.html` incluye metadatos Open Graph, Twitter Card y JSON-LD `Person`; `robots.txt` y `sitemap.xml` están en `public/`.
