# The SEO Agent — operating contract

This is the one doc that answers: *what is this, how do I use it on any project,
and what do you need from me each time.*

## What it is

A portable Claude **skill** (`local-seo-engine`) + scripts that run the full
local-SEO pipeline for any client/project:

audit → keyword research (SEMrush) → service×city pages + blog posts →
on-page / technical / AI (GEO) optimization → publish (WordPress **or**
static/Netlify) → indexing → backlink & blog scheduling.

The method comes from the masterclass SOP captured in
`.claude/skills/local-seo-engine/references/`. Bates Media (`clients/bates-media`)
is the proven reference build.

## The cross-project model (how you actually use it)

The agent lives in **git**, not in a session. Sessions are disposable.

For each client/project:
1. Open a Claude Code session in **that project's repo** (it must contain this
   `seo-engine/` + `.claude/skills/` — either it's the dedicated engine repo, or
   the engine is vendored/submoduled in).
2. Invoke the skill: **`/local-seo-engine`**.
3. Hand me the four inputs below. I write `seo-engine/clients/<slug>/` and run
   the pipeline.
4. We set the cadence; I publish and refresh on schedule.

Secrets travel in env / GitHub Actions secrets — never in git. So no session
"owns" the access; any session with the repo + the secrets can run the agent.

## What I need from you — per project (the contract)

### 1. The site
- `target`: `wordpress` or `static`
- `domain` (the real one — drives canonicals + sitemap)
- `services[]` and `locations[]` (the zipper axes)
- brand: for `static`, colors/fonts (or point me at the existing site to match);
  for `wordpress`, the page builder (Gutenberg/Elementor/PHP)
- content rules (e.g., "no pricing on pages")

### 2. Research access — one of
- **SEMrush connector** added in your claude.ai/desktop session (interactive), OR
- **`SEMRUSH_API_KEY`** in a GitHub Actions secret / local `.env` (for automation), OR
- **CSV exports** from the Keyword Magic Tool (works anywhere)

### 3. Publish access — by target
- **WordPress:** site URL + an **Application Password** (stored as
  `WP_APP_PASSWORD_<CLIENT>` secret). Optional: Nova-Mira-style connector for
  interactive edits.
- **Static/Netlify:** the target repo + **confirmed** `NETLIFY_SITE_ID` and
  `NETLIFY_AUTH_TOKEN`. See SAFETY — I confirm the deploy target before any
  production publish.

### 4. Schedule — optional, for automation
- cadence (e.g., weekly batch / monthly refresh) → GitHub Actions cron
  (template: `scripts/static-publish/deploy.workflow.template.yml`).

## What happens when you invoke me (session flow)

- **Phase 0 — Onboard.** I read or create `clients/<slug>/profile`, confirm which
  inputs/access I have, and confirm the publish target. I do **not** publish to
  any live site without confirming the target and getting an explicit go-ahead.
- **Phases 1–9 — the pipeline** (research → … → index → off-page), per `SKILL.md`.

## SAFETY (hard rules — learned the hard way)

- **Confirm the deploy target before any production publish.** Never assume which
  Netlify site / WordPress install a project points to. (The "contractors page"
  incident: a full static deploy *replaces* the live site — if a page we don't
  manage lives there, it gets wiped. Always either include every page to
  preserve, or deploy additively, and verify the Site ID first.)
- **No pricing** if the client says so; **no PBNs / paid links**; **legit GBP
  listings only** (see `RISKS.md`).
- **Human-verify facts** (licensing, guarantees, claims) before publish.
- **Secrets never committed.**

## Status of the agent itself

| Capability | State |
|---|---|
| Knowledge base / SOP | ✅ built |
| Research — SEMrush API script | ✅ built (runs in CI/local) |
| Research — CSV import | ✅ built + tested |
| Zipper (service×city plan) | ✅ built + tested |
| Generate + theme + static output | ✅ built + tested (Bates Media) |
| Publish — static/Netlify | ✅ built (deploy via per-project workflow) |
| Publish — WordPress (REST API) | ⬜ designed, not built (needs a WP target) |
| Scheduling cron | ⬜ template ready, not wired |
| Backlinks / blog automation | ⬜ documented, not automated |

## What I need from you to keep BUILDING the agent
- A **WordPress test site + Application Password** → I build & test the WordPress
  adapter (the other half of "any project").
- A decision on **scheduling** (cadence + where it runs) → I wire the cron.
- Whether to build the **backlink/HARO + blog-cadence** automation next.
