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

A portable agent for local SEO at scale, driven by the SEMrush + Claude
workflow. **Read `${CLAUDE_PLUGIN_ROOT}/docs/AGENT.md` first** — it is the
operating contract (what to collect per project, the cross-project model, and
the safety rules). Architecture in `${CLAUDE_PLUGIN_ROOT}/docs/ARCHITECTURE.md`;
compliance in `${CLAUDE_PLUGIN_ROOT}/docs/RISKS.md`. The methodology is
target-agnostic — same pipeline whether the client is on WordPress or static
HTML/Netlify.

## Where things live (this is an installed plugin)
- **Engine** (this plugin, read-only): scripts at `${CLAUDE_PLUGIN_ROOT}/scripts/`,
  docs at `${CLAUDE_PLUGIN_ROOT}/docs/`, references adjacent to this file.
- **Client data** (the project you're working in): create and edit under
  `clients/<slug>/` in the CURRENT repo — `site.json`, `content/*.json`,
  `content-plan.md`. The engine never stores client data inside itself.
- See `examples/` in the engine repo for a worked client (`bates-media`).

## Phases (read the matching reference before running each)

0. **Onboard the project** — runs first in every session. Read or create
   `clients/<slug>/site.json` (or `profile.yaml`) in the current repo. Confirm
   which inputs/access you have (target, domain, services, locations, research
   access, publish access) per `docs/AGENT.md` → "What I need from you".
   **Confirm the publish target** (which Netlify Site ID / WordPress install)
   before anything could go live. If access is missing, ask — don't guess.
1. **Load client** — `clients/<slug>/site.json` (sets `target`, services,
   locations, voice, content rules, secret refs).
2. **Audit** → `references/research-sop.md` §1. SEMrush site audit, log baseline
   health, fix, re-audit.
3. **Research** → `references/research-sop.md` §2–4. Two keyword passes (blog:
   vol≥100/informational/KD≤30; service: vol≥30/transactional/CPC>0/strip
   "near me"), clusters (1 primary + 4 secondary), zipper matrix.
   Tools: SEMrush connector (interactive), or
   `node ${CLAUDE_PLUGIN_ROOT}/scripts/research/semrush.mjs` (API, in CI/local),
   or `node ${CLAUDE_PLUGIN_ROOT}/scripts/research/import-csv.mjs` (CSV export).
4. **Plan** → expand the matrix:
   `node ${CLAUDE_PLUGIN_ROOT}/scripts/zipper.mjs --client clients/<slug>` →
   `content-plan.md`. Prioritize blog vs service by real volume.
5. **Generate** → `references/content-sop.md`. SERP-average the top 3, write in
   the client's voice (no AI slop), one `clients/<slug>/content/<slug>.json` per
   page; blog posts internally link to service pages.
6. **Optimize** → `references/onpage-technical-ai-seo.md`. 80 on-page signals →
   Lighthouse → GEO (answer-first, tables, FAQ/HowTo schema, author, llms.txt).
7. **Publish** → `references/publishing-adapters.md`. Route by `target`:
   - static: `node ${CLAUDE_PLUGIN_ROOT}/scripts/static-publish/build.mjs --client clients/<slug> --out <publish-dir>` → Netlify via the client repo's workflow.
   - wordpress: REST API (`status=future` drip).
8. **Index** → `references/offpage-and-indexing.md`. GSC verify + sitemap +
   request indexing.
9. **Off-page** → `references/offpage-and-indexing.md`. HARO / guest / broken-
   link drafts + NAP citations. No paid links / PBNs.

WordPress clients also run plugin setup → `references/wordpress-setup.md`.

## Guardrails
- **Confirm the deploy target before any production publish.** Never assume which
  Netlify site / WordPress install a project points to. A full static deploy
  REPLACES the live site — include every page that must be preserved (or deploy
  additively), and verify the Site ID first. (Lesson: the "contractors page"
  must never get wiped by a blind deploy.)
- Never publish to a live site without an explicit go-ahead.
- Legit GBP listings only; no thin/duplicate pages; no PBNs/paid links.
- Human-verify facts (licensing, guarantees, claims) before publish. Respect
  per-client content rules (e.g., no pricing) in `clients/<slug>/site.json`.
- Secrets (WP app passwords, SEMrush/ShortPixel keys) in env / GitHub secrets,
  never in git.
- Cap zipper pages (≤400); start conservative (~50).

## Status
Static/Netlify path built + proven (see `examples/bates-media`). WordPress
adapter + cron scheduling + backlink automation are the next build increments.
