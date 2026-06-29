# Kickoff — running the SEO agent in a client session

The agent ships as a Claude Code **plugin** (`local-seo-engine`). You install it
once per client session, then run it. Engine code stays in the plugin; client
data stays in the client's repo.

## Per client (web or local session)

1. **Open a session on the CLIENT's repo** (the client's site repo — WordPress
   export or static site). Web: claude.ai/code → pick the repo. Local: open that
   project folder.
2. **Install the plugin** (two lines):
   ```
   /plugin marketplace add webgrooveio/bates-media@claude/wordpress-seo-automation-9p1h9g
   /plugin install local-seo-engine@webgroove-seo
   ```
   (After the engine moves to its own repo: `/plugin marketplace add webgrooveio/seo-engine`.)
3. **Make sure SEMrush + GitHub are connected** in that session.
4. **Run the agent** and give it the client details:

```
/local-seo-engine:local-seo-engine

New client: <NAME>.
- target: <wordpress | static>     domain: <domain>
- services: <list>                 cities: <list>
- research: SEMrush connector (or API key / CSV)
- publish: <WordPress app password | Netlify Site ID>  — CONFIRM the target first
- rules: <e.g. no pricing>

Start with Phase 0 onboarding, scaffold clients/<slug>/ in THIS repo, pull SEMrush
data, build the zipper, generate pages, and STOP for my review before publishing.
Never blind-deploy; confirm the publish target first.
```

## Auto-enable (skip step 2 every time)
Commit to the client repo's `.claude/settings.json`:
```json
{
  "extraKnownMarketplaces": {
    "webgroove-seo": { "source": { "source": "github", "repo": "webgrooveio/bates-media" } }
  },
  "enabledPlugins": { "local-seo-engine@webgroove-seo": true }
}
```
Then opening that repo's session loads the agent automatically (after the trust prompt).

## Division of sessions
- **Engine workshop** (the engine repo): edit the plugin — skill, scripts,
  references, safety rules — commit, push. Clients pick it up via
  `/plugin marketplace update webgroove-seo`.
- **Client session**: install + run the agent for one client. Don't edit the
  engine here; fix it in the workshop and update.
