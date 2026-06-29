# Content SOP — blog posts, service pages, voice, CRO

Turn a keyword cluster into a page that ranks AND converts. Same process for
WordPress and static/Netlify sites — only the publish step differs (see
`publishing-adapters.md`).

## Before writing — research the SERP
For the target keyword:
1. Pull ~20 articles online on the topic.
2. Analyze the **top 3 Google results** and take the *average* of what's
   working: length, structure, headings, what questions they answer, schema.
3. Write to beat that average, not match it.

## Voice — do not ship AI slop
Service-business blog posts are usually dry; dry = bounce = bad Google signals.
Dwell time is the lever. Build a reusable voice profile per client:
`clients/<slug>/writing-style/` capturing tone, vocabulary, humor, stories,
stats, business context.

Train it from real sources (more = better):
- Sent emails (Gmail connector), LinkedIn posts, call transcripts (Fireflies),
  the client's existing website.
- Humor / personality is the single biggest retention lever for boring niches —
  use it throughout, not once.

Rule of thumb from the source: the reader is often annoyed (something broke,
they're about to spend money). Open with empathy + a hook, answer fast, keep
them engaged. Compare:
- ❌ "There are two ways a plumber will price your job, and knowing the
  difference helps you read a quote correctly."
- ✅ "Nobody wakes up hoping to learn how much a plumber costs. You learn it the
  way most people learn things — violently, and at the worst possible time."

## Blog posts (authority / "rising tide")
- Target a blog keyword cluster (informational).
- Answer-first, genuinely useful, in the client's voice.
- Internal-link to relevant **service pages** (this is how blog authority lifts
  the money pages).

## Service pages (money pages)
- Target a service keyword cluster (transactional) from the zipper matrix.
- One page per service × city. Unique local content each (neighborhoods served,
  local proof, local schema).
- Layer in **CRO** — these are where the wallet comes out. Clear offer, trust
  signals, reviews, strong CTA, phone click-to-call. SEO brings the visitor; CRO
  converts them. (If we have a CRO blueprint per client, store it at
  `clients/<slug>/cro.md` and apply it.)

## Build formats (WordPress) — pick per client
| Format | Looks | Editable by non-coders | Notes |
|---|---|---|---|
| Custom PHP/code | 10/10 | No (needs Claude) | Best design, fastest to iterate with Claude |
| Gutenberg | 5–6/10 | Yes | Default WP builder; client/team can edit |
| Elementor | 5–6/10 | Yes (or hybrid) | Can mix editable blocks + code blocks |

Set per client in `profile.yaml` → `build_format`. For **static/Netlify** sites
the format is just clean semantic HTML we control end to end.

## Existing pages
The same pipeline rewrites/refreshes outdated pages — feed the old URL, apply
current research + voice + on-page/AI optimization.

## Outputs
- Draft page (HTML/blocks) per queue item, ready for the optimization pass
  (`onpage-technical-ai-seo.md`) before publish.
