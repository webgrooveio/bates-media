---
name: local-seo-engine
description: >-
  Run the local SEO engine for a client — audit, SEMrush keyword research,
  programmatic service×location ("zipper") pages, blog posts, on-page/technical/
  AI (GEO) optimization, indexing, and backlinks. Publishes to WordPress (REST
  API) OR static HTML on Netlify, same pipeline. Use when researching, planning,
  generating, optimizing, or publishing SEO content for a specific client, or
  setting up the recurring schedule.
---

# Local SEO Engine

The dispatch system for Stryker-style local SEO at scale, driven by the
SEMrush + Claude workflow. Architecture in `seo-engine/ARCHITECTURE.md`;
compliance in `seo-engine/RISKS.md`. The methodology is target-agnostic — same
pipeline whether the client is on WordPress or static HTML/Netlify.

## Phases (read the matching reference before running each)

1. **Load client** — `seo-engine/clients/<slug>/profile.yaml` (sets `target`,
   services, locations, voice, secrets refs).
2. **Audit** → `references/research-sop.md` §1. SEMrush site audit, log baseline
   health, fix, re-audit.
3. **Research** → `references/research-sop.md` §2–4. Two keyword passes (blog:
   vol≥100/informational/KD≤30; service: vol≥30/transactional/CPC>0/strip
   "near me"), clusters (1 primary + 4 secondary), zipper matrix (service×city,
   ~50 start / 400 max).
4. **Plan** → ordered `content-plan.md` queue (blog vs service, priority).
5. **Generate** → `references/content-sop.md`. SERP-average the top 3, write in
   the client's voice (no AI slop), blog posts lift service pages via internal
   links, CRO on money pages.
6. **Optimize** → `references/onpage-technical-ai-seo.md`. 80 on-page signals →
   Lighthouse fixes → GEO (answer-first, tables, FAQ/HowTo schema, author,
   llms.txt).
7. **Publish** → `references/publishing-adapters.md`. Route by `target`:
   WordPress REST API (`status=future` drip) or static HTML → Netlify via
   GitHub Actions.
8. **Index** → `references/offpage-and-indexing.md`. GSC verify + sitemap +
   request indexing.
9. **Off-page** → `references/offpage-and-indexing.md`. HARO / guest / broken-
   link drafts + NAP citations. No paid links / PBNs.

WordPress clients also run plugin setup → `references/wordpress-setup.md`.

## Quick commands (intended)
- `/blog <keyword>` — research + write + optimize + queue a blog post.
- `/service <service> <city>` — build one money page from the zipper.
- `/audit` — pull SEMrush audit and fix the site.

## Guardrails
- Legit GBP listings only; no thin/duplicate pages; no PBNs/paid links.
- Human-verify facts (licensing, guarantees, pricing) before publish.
- Secrets (WP app passwords, SEMrush/ShortPixel keys) in env / GitHub secrets,
  never in git.
- Cap zipper pages (≤400); start conservative (~50).

## Status
Knowledge base complete (references/). Next: client `profile.yaml` schema +
scripts (wp/static publish, SEMrush research) + `seo-publish.yml` cron.
