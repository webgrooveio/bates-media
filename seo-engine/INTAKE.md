# Client Intake — what I need to launch the engine

Fill this once per client. Items marked **(secret)** never get committed — they
go into GitHub Actions secrets / environment variables.

## 1. Business profile
- [ ] Business name (exact, as it appears on Google)
- [ ] Niche / industry (e.g. pest control)
- [ ] Services offered (list — these become page "service" axis)
- [ ] Service-area cities / neighborhoods (list — the "location" axis)
- [ ] Physical address(es) — real operating locations only
- [ ] Phone, email, hours (NAP for citations + schema)
- [ ] Primary brand voice / any do-not-say items

## 2. WordPress access
- [ ] Site URL
- [ ] REST API reachable? (`<site>/wp-json/wp/v2` returns JSON)
- [ ] **(secret)** Application Password — WP Admin → Users → Profile →
      Application Passwords (preferred over raw login)
- [ ] Page builder in use? (Gutenberg / Elementor / Divi) — affects content format
- [ ] Existing pages/posts to avoid duplicating

## 3. Research tools (which do we actually have?)
- [ ] **(secret)** SEMrush API key — or are we pulling exports manually?
- [ ] **(secret)** Ahrefs API key
- [ ] Top 2–3 competitor domains to gap-analyze

## 4. Google Business Profile
- [ ] GBP listing URL / verified?
- [ ] Number of legitimate physical locations
- [ ] Do they want GBP Post automation? (needs Google API OAuth)

## 5. The YouTube workflow
- [ ] Paste the full transcript of "Automating WordPress with SEO and blogging
      through Claude" → I'll extract his exact research + publishing SOP into
      `.claude/skills/local-seo-engine/references/research-sop.md`

## First client to build for
- Name: ____________________
- It's the pest-control client mentioned: yes / no
