# Static / Netlify publishing adapter

Turns optimized page sources (JSON) into SEO-complete static HTML + `sitemap.xml`
+ `robots.txt` + `llms.txt`. Zero dependencies — Node 18+ only. This is the
`target: static` half of the engine (see
`.claude/skills/local-seo-engine/references/publishing-adapters.md`).

## Run

```bash
node seo-engine/scripts/static-publish/build.mjs \
  --client seo-engine/clients/<slug> \
  --out <output-dir> \
  [--base https://override-domain.com]
```

Demo:
```bash
node seo-engine/scripts/static-publish/build.mjs \
  --client seo-engine/clients/demo-pest \
  --out seo-engine/clients/demo-pest/_preview
```

## Client layout

```
clients/<slug>/
  site.json            # business, domain, NAP, nav, brand color
  content/
    <slug>.json        # one page per file (type: service | blog)
  _preview/            # build output (gitignored)
```

## Page JSON fields

| field | required | notes |
|---|---|---|
| `type` | yes | `service` → Service schema; `blog` → Article schema |
| `slug` | yes | becomes `/<slug>/index.html` (clean URL) |
| `title` | yes | `<title>` + H1 + OG |
| `description` | rec. | meta description + OG |
| `answer` | rec. | answer-first GEO block (1st line, extractable) |
| `body_html` | yes | the page body (Claude generates this in the optimize phase) |
| `faq` | opt. | `[{q,a}]` → renders accordion + FAQPage schema |
| `service`,`city` | service pages | drive Service schema `areaServed` |
| `author`,`date` | rec. | author block + Article `datePublished` |
| `cta` | opt. | `{text, href}` button |

## What every page gets automatically
- `<title>`, meta description, canonical, Open Graph
- JSON-LD: LocalBusiness/`business_type`, BreadcrumbList, Service **or** Article,
  FAQPage (when `faq` present)
- Answer-first block, semantic headings, FAQ accordion, author/date, NAP footer
- Fast inline CSS (no external requests → strong Lighthouse)

Site-level files: `sitemap.xml`, `robots.txt`, `llms.txt`.

## Deploy
Point Netlify's publish dir at the `--out` directory, or copy the output into the
client site repo root. See `deploy.workflow.template.yml` for a GitHub Actions
cron that builds + deploys on a schedule (the same Actions→Netlify pattern as
this repo's `.github/workflows/deploy.yml`).

## Scheduling
Generate a batch, commit, and let cron release/deploy them over time. For
drip-publishing, hold not-yet-due pages in `content/_queue/` and move them into
`content/` by date in the scheduled run.
