# Kickoff — starting the SEO agent in a client session

Use this when you open a **client session** (separate from the engine workshop).
The workshop session is only for editing the skill/scripts; client work runs here.

## Using an EXISTING session (already on the Bates Media repo)
You cannot repoint a running session to a different repo — the repo is fixed when
the session starts. But the Bates Media website session is already on
`webgrooveio/bates-media`, which is also where the engine lives, so you only need
to switch branches. Paste this verification first (it won't lose work):

```
Run and show me the output:
  git remote -v
  git branch --show-current
  git status -s
If there are uncommitted changes, commit them on the current branch (or git stash)
BEFORE switching. Then:
  git fetch origin && git checkout claude/wordpress-seo-automation-9p1h9g && git pull
Confirm the remote is webgrooveio/bates-media.
```

If the remote is NOT `webgrooveio/bates-media`, that session is on a different repo
and can't see the engine directly — start a session on `webgrooveio/bates-media`
instead (or we vendor the engine into that repo from the workshop).

## Pre-flight (do this once when the session starts)
1. **Repo + branch:** open `webgrooveio/bates-media` on branch
   `claude/wordpress-seo-automation-9p1h9g` (this is where the engine, skill, and
   the Bates Media client live). For other clients, the engine must be present in
   that project's repo too (until the engine is extracted to its own repo).
2. **Connectors:** make sure **SEMrush** and **GitHub** are connected/enabled in
   that session (SEMrush is what powers real keyword research).
3. **Publish access:** have the **Netlify Site ID** for the site you're publishing
   to on hand (and confirm it's the right project before any deploy).

## Paste this prompt to start (Bates Media)

```
First, switch to the engine branch:
  git fetch origin && git checkout claude/wordpress-seo-automation-9p1h9g && git pull

You are running the local-seo-engine skill from this repo. Read seo-engine/AGENT.md
and .claude/skills/local-seo-engine/SKILL.md first, then follow the pipeline.

Project: Bates Media (client zero). Its profile + 21 generated pages already exist
at seo-engine/clients/bates-media/. Target: static site on Netlify (this repo).

Do this:
1. Phase 0 onboarding: load seo-engine/clients/bates-media/site.json and confirm
   what's there. DO NOT publish anything to a live site until I confirm the Netlify
   Site ID is correct AND we account for the existing "contractors" page (a full
   deploy must NOT wipe it — see the safety rules in AGENT.md/SKILL.md).
2. Pull REAL keyword data via the SEMrush connector for my services
   (web design, AI automation, lead generation, content & video production) across
   Palm Beach County (Jupiter, Tequesta, Juno Beach, Palm Beach Gardens,
   North Palm Beach). Save to seo-engine/clients/bates-media/.
3. Use that data to refine page titles/priority for the existing pages.
4. Then stop and show me the plan before publishing.

Rules: no pricing on pages; confirm the deploy target before going live; never
blind-deploy.
```

## Generic template (any other client)

```
Run the local-seo-engine skill from this repo (read seo-engine/AGENT.md + the
SKILL first). New client: <NAME>.
- target: <wordpress | static>   domain: <domain>
- services: <list>               cities: <list>
- research: SEMrush connector (or API key / CSV)
- publish: <WordPress app password | Netlify Site ID>  — CONFIRM target first
- rules: <e.g. no pricing>
Start with Phase 0 onboarding, scaffold seo-engine/clients/<slug>/, pull SEMrush
data, build the zipper, generate pages, and STOP for my review before publishing.
```

## Division of sessions
- **Engine workshop (the other session):** edit the skill, scripts, references,
  safety rules. Commit. Those changes flow to client sessions via git.
- **Client session (here):** run the agent for one client. Don't edit the engine
  itself — if the skill needs a fix, do it in the workshop and pull.
