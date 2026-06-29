# Research scripts — SEMrush → keyword lists

Two ways to get the same output (`blog-keywords.csv` + `service-keywords.csv`,
normalized to `keyword,volume,cpc,kd,intent`). Both apply the SOP filters
(`.claude/skills/local-seo-engine/references/research-sop.md`):

| List | Filters |
|---|---|
| **blog** | volume ≥ 100, KD ≤ 30, intent = Informational |
| **service** | volume ≥ 30, CPC > 0, intent = Transactional, "near me" stripped |

## Path A — API (automated, for cron / local)
`semrush.mjs` hits the SEMrush Analytics API directly.

```bash
SEMRUSH_API_KEY=xxx node semrush.mjs --root "pest control" --db us \
  --out seo-engine/clients/<slug> --limit 200
```

⚠️ **`api.semrush.com` is blocked in the Claude cloud sandbox by egress policy.**
Run this where SEMrush is reachable:
- **GitHub Actions** (the cron) — runners aren't behind the sandbox proxy. Put
  the key in a repo **Actions secret** named `SEMRUSH_API_KEY`.
- **Your local machine** — `SEMRUSH_API_KEY=xxx node semrush.mjs ...`

The key must NEVER be committed. Locally it can live in a gitignored `.env`.

## Path B — CSV import (manual, works anywhere incl. sandbox)
`import-csv.mjs` parses a Keyword Magic Tool export (the method shown in the
video) — no network needed.

1. In SEMrush: SEO → Keyword Magic Tool → search your root keyword.
2. Export to CSV (include the **Intent** column for best filtering).
3. Run:
```bash
node import-csv.mjs --in export.csv --preset both --out seo-engine/clients/<slug>
```

Tolerant of comma/semicolon/tab delimiters and SEMrush's column naming.

## Output → next step
Both produce the two CSVs per client. The planning phase (Claude) turns these
into keyword clusters (1 primary + 4 secondary) and the service×city zipper,
then the generate phase emits one page JSON per cluster for the publishing
adapter.
