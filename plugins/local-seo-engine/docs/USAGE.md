# How to use the SEO Engine (and use it across sessions)

The thing you're worried about — "all this knowledge is stuck in one session" —
isn't actually true once you understand what the engine *is*.

## The engine is a git repo + a skill. Not a session.

Claude Code sessions are throwaway. What persists is what's **committed to git**.
Everything we've built — the playbook, the scripts, the client configs — lives in
two places **inside this repo**:

- `.claude/skills/local-seo-engine/` — the **skill**: the 9-phase playbook
  Claude follows (research → … → publish). This is the "brain."
- `seo-engine/` — the **engine**: scripts (`research/`, `static-publish/`),
  client folders (`clients/<name>/`), and these docs.

**Any Claude Code session that has this repo checked out has the entire system.**
Web session, your laptop, a teammate's machine — clone the repo, and the skill +
scripts + all client data are right there. Nothing is locked to "this session."

So the answer to "how do I use this in other sessions" is: **open this repo in
that session.** That's it.

## Why it currently feels stuck in one place

Right now it lives on a *branch* (`claude/wordpress-seo-automation-9p1h9g`) inside
the **bates-media** repo. Two fixes make it truly portable:

1. **Dedicated repo (decided).** Move `seo-engine/` + `.claude/skills/` into their
   own repo, e.g. `webgrooveio/seo-engine`. Then *that* repo is the one home for
   the engine and every client. (I can't create repos from this scoped session —
   you create the empty repo + grant access, and I move everything over in one
   step. Until then it's built to lift out cleanly.)
2. **(Optional) Install the skill globally.** Copy `local-seo-engine` into
   `~/.claude/skills/` on your machine. Then `/local-seo-engine` works in *every*
   project/session automatically, not just when this repo is open.

## Secrets live OUTSIDE git (this is the other half of "access")

Credentials never get committed. They live in two places, and whichever session
runs the scripts reads them from there:

- **GitHub Actions secrets** (repo → Settings → Secrets → Actions): used by the
  scheduled cron. Put `SEMRUSH_API_KEY`, `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`,
  and any `WP_APP_PASSWORD_<CLIENT>` here.
- **Local `.env`** (gitignored): used when you run a script on your own machine.

This is why "the other session has WordPress/Netlify access" doesn't matter much:
the engine doesn't depend on a session's connectors — it depends on these secrets.
Store them once, and any runner (cron, laptop, this session) can use them.

## The daily workflow

| Step | What you do | What Claude/scripts do |
|---|---|---|
| 1. Research | Export keywords from SEMrush UI (or run the API script in Actions/local) | `import-csv.mjs` → `blog-keywords.csv` + `service-keywords.csv` |
| 2. Plan | — | Claude builds keyword clusters + the service×city zipper → `content-plan.md` |
| 3. Generate | Review/approve | Claude writes one `content/<slug>.json` per page (voice + on-page + GEO) |
| 4. Build | — | `static-publish/build.mjs` → HTML + sitemap + robots + llms.txt |
| 5. Publish | `git push` (or approve the cron) | GitHub Actions → Netlify deploys. **Push = deploy.** |
| 6. Index | Submit sitemap in Google Search Console once | — |

For WordPress clients, step 4–5 use the WordPress adapter (REST API) instead of
the static one — same steps 1–3.

## TL;DR
- **Code/knowledge** → in git (the repo). Open the repo anywhere = full system.
- **Secrets** → GitHub Actions secrets + local `.env`. Never in git.
- **Publishing** → git push triggers Netlify. No direct Netlify access needed.
- **Next step for portability** → create `webgrooveio/seo-engine` and I move it.
