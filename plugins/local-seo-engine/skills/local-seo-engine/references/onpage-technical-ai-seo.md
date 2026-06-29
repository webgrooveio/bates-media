# On-page + Technical + AI (GEO) SEO — the optimization pass

Run on every page before publish (and on existing pages to upgrade them).
Three layers, one pass.

## 1. On-page SEO (~80 signals)
The non-technical optimization of the page itself:
- **Meta title** + **meta description** (compelling, keyword-aligned, within
  length limits).
- **URL** slug clean and keyword-relevant.
- **Heading hierarchy** — one H1, logical H2/H3, primary keyword in H1, cluster
  variants in subheads naturally.
- **Images** — descriptive alt text, compressed, right dimensions, lazy-loaded.
- **Internal linking** — link to related service/blog pages (spread authority).
- **External linking** — cite a few authoritative sources where relevant.
- Keyword placement that reads naturally — no stuffing.

## 2. Technical SEO (Lighthouse-driven)
- Run **Lighthouse** (Chrome DevTools → More tools → Developer tools →
  Lighthouse) on the page. For static/Netlify sites we can run it in CI.
- Fix everything red, then orange: performance, accessibility, best practices,
  SEO. Iterate by re-running until scores are near-perfect (e.g. 71→99 perf).
- Core web vitals, caching, lazy-loading, HTTPS, crawlability.
- On WordPress, plugins carry much of this load (see `wordpress-setup.md`):
  W3 Total Cache (caching/lazy-load), ShortPixel (image compression), Yoast
  (on-page + sitemaps).

## 3. AI / Generative Engine Optimization (GEO)
Get cited in Google AI Overviews, ChatGPT, Claude, Gemini.
- **Be in Google's top 10** for the query — near non-negotiable; LLMs/AI
  overviews mostly pull from page one.
- **Answer-first:** put the direct answer in line 1 under each question so it's
  trivially extractable.
- **Extractable formats:** tables, lists, bullet points the AI can lift cleanly.
- **FAQ + How-To schema:** FAQ questions that mirror the exact search query get
  pulled into AI overviews. Add `FAQPage` / `HowTo` structured data.
- **Author block + date:** E-E-A-T signals.
- **`llms.txt`** at the site root so LLMs can crawl and find answers directly.
- **LocalBusiness / Service schema** on service pages (NAP, area served).

## Workflow
1. Generate/refresh the page (content-sop.md).
2. Apply on-page checklist (80 signals).
3. Run Lighthouse → fix → re-run until clean.
4. Add GEO layer (answer-first, tables, FAQ/HowTo schema, author, llms.txt).
5. Hand to the publishing adapter.
