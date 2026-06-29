# Publishing adapters — WordPress vs static/Netlify

The SEO pipeline (research → plan → generate → optimize) is **identical** for
every client. Only the final publish step changes. A client's `profile.yaml`
sets `target: wordpress` or `target: static`, and the engine routes accordingly.
This keeps us from being trapped in WordPress — many of Jack's sites (Bates
Media, the construction client) are Claude-built HTML on Netlify, and they
should get the same SEO machine.

## Why this matters
- WordPress is great when the client already runs it / wants self-serve editing.
- Static HTML on Netlify is faster, cheaper, more secure, and trivially
  Claude-editable — ideal for sites we build from scratch.
- We decide per client, not per system. Same playbook either way.

## Adapter A — WordPress (`target: wordpress`)
- **Auth:** WordPress Application Password (Users → Profile → Application
  Passwords). Stored as a secret, never committed.
- **API:** WordPress REST API (`/wp-json/wp/v2/posts`, `/pages`, `/media`).
  (The video uses a connector plugin "Nova Mira" for hands-on editing; for our
  automated engine we hit the REST API directly with the app password.)
- **Build format:** per `profile.yaml.build_format` — custom PHP / Gutenberg /
  Elementor (see content-sop.md tradeoffs).
- **Plugins:** Yoast SEO, W3 Total Cache, ShortPixel (see `wordpress-setup.md`).
- **Scheduling:** bulk-create with `status=future` + staggered `date` → WP drips
  posts live itself. No server to babysit.
- **Sitemap:** Yoast generates it; submit to GSC.

## Adapter B — Static / Netlify (`target: static`)
- **Output:** clean semantic HTML pages generated into the client's repo (each
  service/blog page = a file or route), plus `sitemap.xml`, `robots.txt`,
  `llms.txt`, and JSON-LD schema inline.
- **Deploy:** commit to the repo → GitHub Actions → Netlify (the exact pattern
  already in `.github/workflows/deploy.yml` here). Push = deploy.
- **Scheduling:** GitHub Actions cron generates the next batch and commits on a
  schedule; "future" posts can be held in a queue dir and released by date.
- **Build format:** full control of markup — bake on-page + GEO best practices
  directly (clean headings, schema, fast assets).
- **Sitemap:** we generate it in the build; submit to GSC.

## Shared (both adapters)
- Same keyword clusters, same voice profile, same on-page/technical/AI pass.
- Same indexing workflow (GSC verify + sitemap + request indexing).
- Same `content-plan.md` queue; the adapter is just the last mile.

## profile.yaml keys that drive routing
```yaml
target: static            # or: wordpress
site_url: https://...
# wordpress only:
wp_app_user: ""           # secret ref
wp_app_password_ref: WP_APP_PASSWORD_<CLIENT>   # GitHub secret name
build_format: gutenberg   # custom_php | gutenberg | elementor
# static only:
repo: webgrooveio/<client-site>
deploy: netlify
```
