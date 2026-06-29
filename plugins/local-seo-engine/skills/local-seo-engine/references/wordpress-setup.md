# WordPress setup — plugins & config (target: wordpress only)

For WordPress clients, Claude installs and configures the SEO plugin stack.
Big historical pain point: plugins conflicting and taking the site down — so we
analyze for conflicts before activating (keep a changelog to revert safely).

## The plugin stack
| Plugin | Job | Needs |
|---|---|---|
| **Yoast SEO** | On-page SEO, titles/meta, XML sitemap, schema, archive controls | — |
| **W3 Total Cache** | Caching + lazy-load → faster repeat loads | — |
| **ShortPixel** | Bulk image compression/resize | **API key** (`SHORTPIXEL_API_KEY`) |

## Process
1. Install the three plugins.
2. **Conflict check** before/after activation; if anything breaks, revert via
   changelog. Never activate blind.
3. Configure each:
   - **ShortPixel** — API key, compression level, resize, bulk-optimize.
   - **W3 Total Cache** — enable caching, lazy-load, minify sensibly.
   - **Yoast** — titles/meta templates, turn off author archives and other
     thin-content archives, enable schema + XML sitemap.
4. Keep a **changelog** of every change so any regression is one revert away.

## Secrets
- `SHORTPIXEL_API_KEY` — from shortpixel.com (free tier).
- `WP_APP_PASSWORD_<CLIENT>` — WordPress Application Password.
All in env / GitHub Actions secrets. Never commit.

## Connecting Claude to WordPress
- **Automated engine:** WordPress REST API + Application Password.
- **Hands-on editing:** a connector plugin (e.g. Nova Mira) exposes the site to
  Claude for interactive changes. Optional; the REST API covers the pipeline.
