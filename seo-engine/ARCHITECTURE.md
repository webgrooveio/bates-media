# Local SEO Engine — Architecture

Goal: replicate (and beat) the "Stryker Digital" style local-SEO offer as a
repeatable, Claude-driven system we can deploy across clients.

## What the competitor's offer actually is (decoded)

Their $2,000/mo + $1,200 setup offer is **programmatic local SEO**:

1. **Service × Location pages.** For a pest-control client they generate a page
   for every (service × city/neighborhood) combination —
   "Termite Control in Tampa", "Bed Bug Removal in Brandon", etc. This is the
   bulk of the "we create a bunch of pages directly correlated to the map" part.
2. **Google Business Profile (GBP / "Google Maps").** Optimize the primary
   listing for the 3-pack, plus GBP Posts, review velocity, and Q&A. The
   "we set up 5 different Google Maps" pitch = multiple GBP listings. **Flag:**
   creating listings for locations a business does not physically operate from
   violates Google's guidelines and gets them suspended — we do this the
   legitimate way (see RISKS.md).
3. **Backlinks.** Local citations (NAP directories), niche/industry directories,
   and some outreach/PR. The genuinely automatable part is citations + internal
   linking; high-authority editorial links are relationship work, not a script.
4. **Research stack.** SEMrush + Ahrefs for keyword/competitor/gap analysis to
   decide which service×location pages to build and what to write.

The whole thing is AI-assisted content at scale + on-page/technical SEO + GBP +
citations, dripped out on a schedule. That's exactly what we can build.

## System components

```
seo-engine/
  ARCHITECTURE.md          <- this file
  RISKS.md                 <- GBP / backlink compliance notes (read before selling)
  INTAKE.md                <- what we collect per client before launch
  clients/
    <client-slug>/
      profile.yaml         <- niche, services[], locations[], GBP, WP site URL
      keywords.csv         <- research output (service × location × volume × difficulty)
      content-plan.md      <- the ordered queue of pages + posts to publish
  scripts/                 <- (built once direction is locked)
    wp_client.*            <- WordPress REST API client (create/update pages & posts)
    research.*             <- SEMrush/Ahrefs pulls -> keywords.csv
    generate.*             <- Claude API: turn a queue item into page/post HTML
    publish.*              <- push to WP, staggered via WP "future" scheduling
.claude/skills/local-seo-engine/
  SKILL.md                 <- the playbook Claude follows (the "dispatch system")
  references/              <- templates, research SOP, page schemas
.github/workflows/
  seo-publish.yml          <- cron: replenish queue + drip-publish (built later)
```

## How the pieces connect

- **Research** (SEMrush/Ahrefs) → produces `keywords.csv` per client.
- **Plan** → Claude turns keywords into an ordered `content-plan.md` (which
  service×location pages, which blog topics, priority order).
- **Generate** → Claude API writes each page/post (on-page SEO: title, meta,
  H1/H2, schema.org LocalBusiness/Service, internal links, FAQ).
- **Publish** → WordPress REST API. Bulk-create with `status=future` and
  staggered dates so WP itself drips them out (no server needed to babysit).
- **Schedule** → GitHub Actions cron monthly/weekly replenishes the queue and
  triggers the next batch. (This repo already uses Actions + secrets, so the
  pattern is proven here.)
- **GBP** → Google Business Profile API for posts/updates (legit listings only).

## Scheduling — the honest answer

Three layers, used together:

1. **WordPress native future-publish.** Generate 20–40 pieces in one run, set
   each to `future` with staggered publish dates → WP drips them live on its
   own. Zero infrastructure.
2. **GitHub Actions cron.** A scheduled workflow re-runs research + generates
   the next batch and refills the queue (e.g. monthly). Same secrets pattern as
   the existing Netlify deploy.
3. **Claude scheduling** for our own hands-on review cadence between batches.

## Decisions (locked with the user 2026-06-28)

- [x] **Engine lives in a dedicated repo.** Built portable inside `seo-engine/`
      for now (this session is scoped to `bates-media`); lifts out via `git mv`
      once the dedicated repo exists and is accessible.
- [x] **Research = SEMrush API.** `research.*` targets the SEMrush API;
      key stored as a secret (`SEMRUSH_API_KEY`).
- [ ] WordPress auth method per client (Application Passwords recommended)
- [ ] One client folder per business; multi-client orchestration TBD

## Blocking on (from the user)
- YouTube transcript → research/publishing SOP
- First client: niche, services, target cities
- WordPress site URL + Application Password
- SEMrush API key (into secrets, not git)
