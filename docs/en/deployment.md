# Deployment

The site is static and is served by **Cloudflare Pages** at <https://zerikapi.site>.

## Continuous deployment

`.github/workflows/deploy.yml` runs on every push to `main` (and on demand):

1. Installs Bun 1.4.4 and the locked dependencies.
2. Runs `bun run build`, which type-checks and builds `dist/`.
3. Creates the Pages project if it does not exist yet.
4. Publishes `dist/` to the `zerik-portfolio` project as the production branch.

Merging a release pull request from `dev` into `main` is therefore what publishes a new version.

### Repository secrets and variables

| Name | Kind | Purpose |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | Secret | API token with the *Cloudflare Pages: Edit* permission |
| `CLOUDFLARE_ACCOUNT_ID` | Secret | Cloudflare account that owns the project |
| `CLOUDFLARE_PAGES_PROJECT` | Variable (optional) | Overrides the project name, `zerik-portfolio` by default |

## Domains

Both `zerikapi.site` and `www.zerikapi.site` are custom domains of the Pages project, with proxied CNAME records pointing to `zerik-portfolio.pages.dev`.

## Soundtrack

The soundtrack is larger than the 25 MiB per-file limit of Pages, so it is not part of the build. It lives in the R2 bucket behind `cdn.zerikapi.site`, under `audio/`. To replace it, upload the new file to that folder and update the file name in `src/audio/Soundtrack.ts`.

## Social previews

`public/og-image.png` (1200×630) is the Open Graph and Twitter Card image. The README previews live in `.github/preview.en.png` and `.github/preview.es.png`.
