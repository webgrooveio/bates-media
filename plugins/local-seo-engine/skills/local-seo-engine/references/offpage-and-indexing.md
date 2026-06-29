# Off-page SEO + Indexing

## Off-page / backlinks — do this carefully

Backlinks = third-party sites linking to the client. More trusted links →
more authority. But **not all links are equal**, and bad links can tank a site.
The source author is openly skeptical: every ~6 months Google ships an algo
update and cheap/paid link profiles can crater overnight. We treat backlinks as
*supporting*, not the foundation.

Four methods, ranked by how we'd actually use them:

1. **HARO / "Help a Reporter Out"** (low risk, high quality). Reporters post
   questions; the client answers as the expert and earns an editorial link.
   Automatable part: monitor queries, draft expert answers in the client's
   voice. A human sends them.
2. **Guest posting** (medium). Google `"write for us" + <niche>` to find sites
   accepting contributions. Automatable: find prospects, draft the post + pitch.
   Human approves and sends.
3. **Broken link building** (medium). Use SEMrush backlink/lost-backlink reports
   to find dead links on relevant sites, then offer the client's matching
   article as the replacement. Automatable: find + draft outreach.
4. **Paid backlinks** (high risk — avoid). Google frowns on it; this is the
   "deck of cards" that gets sites penalized. Not recommended.

Also safe and underrated for *local*: **NAP citations** (consistent
name/address/phone across local + industry directories). This is the citation
half of what competitors sell as "backlinks" and it's low-risk.

See `RISKS.md` — no PBNs, no link networks.

## Indexing — so the work actually ranks

Pages that Google never indexes earn nothing. After publishing:

1. **Google Search Console** — add the property (domain or URL-prefix).
2. **Verify ownership** — easiest is the HTML meta tag method; have Claude add
   the tag to the site (`<head>`), purge cache, then click Verify.
3. **Submit the sitemap** — GSC → Sitemaps → paste sitemap URL. Generate one if
   it doesn't exist. This lets Google discover every page in one go.
4. **Request indexing** for stubborn individual pages (GSC search bar → URL →
   Request indexing). Do this for every important new page — sitemap submission
   doesn't guarantee indexing.

This step is part of the publish workflow, not an afterthought — unindexed pages
= wasted generation effort.
