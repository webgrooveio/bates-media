# Research SOP — audit + keyword research (SEMrush)

Source: extracted from the "Claude Code WordPress SEO Masterclass" workflow,
adapted for our engine. Two ways to reach SEMrush:
- **Interactive / hands-on:** SEMrush MCP connector in claude.ai (Settings →
  Connectors → add SEMrush → "always allow").
- **Automated / headless:** SEMrush API with `SEMRUSH_API_KEY` (what our
  GitHub Actions runs use). This is the path we're building on.

## Step 1 — Site audit (baseline)
1. Run a SEMrush Site Audit against the domain (use the sitemap URL as the crawl
   source if one exists — it finds every page).
2. Pull the audit into Claude: errors, warnings, notices, plus core web vitals,
   crawlability, HTTPS.
3. Record the starting **Site Health %** (top-decile sites ≈ 92%).
4. After fixes, re-run the audit and log before/after in the client's
   `content-plan.md`. Iterate until health is high — this can run unattended.

## Step 2 — Keyword research (two distinct passes)

Not every keyword is equal. We build **two separate keyword lists** with
different filters, because blog intent ≠ money intent.

### Pass A — Blog keywords (authority / "rising tide")
Keyword Magic Tool → root term (e.g. "plumbing"). Filters:
- **Volume ≥ 100** /mo
- **Intent = Informational**
- **Keyword Difficulty (KD) ≤ 30**
- Prefer the **Questions** tab ("how much does a plumber cost", "how to use a
  plumbing snake").
- Skip job-seeker / competitor queries ("how to become a plumber").
- Export → `clients/<slug>/blog-keywords.csv`

### Pass B — Service / money keywords (transactional)
Keyword Magic Tool → same root, correct country. Filters:
- **Volume ≥ 30** (low volume is fine — these are buyers)
- **Intent = Transactional**
- **CPC > 0** (advertisers paying = proven money intent)
- **No KD filter** (we want to map the whole money surface)
- **Strip all "near me" terms** — Google reads them as spam signals.
- Pull the *root services* (e.g. "emergency plumber", "water heater repair"),
  not "plumbing supply" (wrong buyer).
- Export → `clients/<slug>/service-keywords.csv`

## Step 3 — Keyword clusters (1 primary + 4 secondary)
Each page targets a **cluster**: one primary keyword + ~4 secondary variants
(e.g. primary "emergency plumber Toronto"; secondary "24-hour plumbing Toronto",
"burst pipe repair Toronto", …). Take 5 shots per page, not 1.
Output: `clients/<slug>/keyword-clusters.md` (one cluster per planned page).

## Step 4 — The zipper (service × city matrix)
For service pages, build a matrix: every service × every municipality in the
service area. "Water heater repair" → Toronto, Mississauga, Vaughan, Markham…
- **Volume guidance:** 5 pages minimum, **~50 to start**, **400 hard max.**
  Do NOT mass-produce thousands of thin pages — Google filters them and it reads
  as spam (see RISKS.md).
- Every page must carry unique local content, not template mad-libs.

## Outputs of this phase (per client)
- `blog-keywords.csv`, `service-keywords.csv`
- `keyword-clusters.md`
- `content-plan.md` (ordered queue: which clusters → blog vs service, priority)
