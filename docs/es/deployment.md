# Despliegue

El sitio es estático y lo sirve **Cloudflare Pages** en <https://zerikapi.site>.

## Despliegue continuo

`.github/workflows/deploy.yml` se ejecuta en cada push a `main` (y cuando se lanza a mano):

1. Instala Bun 1.4.4 y las dependencias fijadas.
2. Ejecuta `bun run build`, que verifica los tipos y genera `dist/`.
3. Crea el proyecto de Pages si todavía no existe.
4. Publica `dist/` en el proyecto `zerik-portfolio` como rama de producción.

Por lo tanto, fusionar un pull request de release de `dev` a `main` es lo que publica una nueva versión.

### Secretos y variables del repositorio

| Nombre | Tipo | Para qué sirve |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | Secreto | Token de API con el permiso *Cloudflare Pages: Edit* |
| `CLOUDFLARE_ACCOUNT_ID` | Secreto | Cuenta de Cloudflare dueña del proyecto |
| `CLOUDFLARE_PAGES_PROJECT` | Variable (opcional) | Cambia el nombre del proyecto; por defecto `zerik-portfolio` |

## Dominios

`zerikapi.site` y `www.zerikapi.site` son dominios personalizados del proyecto de Pages, con registros CNAME con proxy que apuntan a `zerik-portfolio.pages.dev`.

## Banda sonora

La banda sonora supera el límite de 25 MiB por archivo de Pages, así que no forma parte del build. Vive en el bucket R2 que sirve `cdn.zerikapi.site`, dentro de `audio/`. Para reemplazarla, sube el archivo nuevo a esa carpeta y actualiza el nombre en `src/audio/Soundtrack.ts`.

## Vistas previas para redes

`public/og-image.png` (1200×630) es la imagen de Open Graph y Twitter Card. Las vistas previas del README están en `.github/preview.en.png` y `.github/preview.es.png`.
