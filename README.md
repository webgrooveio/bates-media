# Local SEO Engine — Claude Code plugin + marketplace

This repo hosts **`local-seo-engine`**, an installable Claude Code plugin that runs
the full local-SEO + GEO pipeline for any client site: SEMrush keyword research,
programmatic service×city ("zipper") pages, blog posts, on-page/technical/AI
optimization, and publishing to **WordPress** or **static/Netlify** — same pipeline.

> Note: this is currently hosted inside the `webgrooveio/bates-media` repo for
> convenience. The clean long-term home is a dedicated repo (e.g.
> `webgrooveio/seo-engine`); moving it is a copy of `plugins/` + `.claude-plugin/`.

## Layout
```
.claude-plugin/marketplace.json        # the marketplace catalog
plugins/local-seo-engine/              # THE AGENT (installable plugin)
  .claude-plugin/plugin.json
  skills/local-seo-engine/             # the skill Claude runs (SKILL.md + references/)
  scripts/                             # research, zipper, static-publish
  docs/                                # AGENT.md (contract), ARCHITECTURE, RISKS, KICKOFF, ...
examples/                              # worked client data (bates-media, demo-pest) — NOT part of the plugin
```

## Install it in a client session (web or local)
In a session opened on the **client's** repo:
```
/plugin marketplace add webgrooveio/bates-media@claude/wordpress-seo-automation-9p1h9g
/plugin install local-seo-engine@webgroove-seo
```
(Once moved to a dedicated repo on its default branch, it's just
`/plugin marketplace add webgrooveio/seo-engine`.)

Then run the skill and hand it the client's details:
```
/local-seo-engine:local-seo-engine
```
It reads `${CLAUDE_PLUGIN_ROOT}/docs/AGENT.md` (the operating contract), scaffolds
`clients/<slug>/` **in the client's repo**, and runs research → pages → optimize →
publish. Client data never lives inside the plugin.

## Auto-enable per client repo (optional)
Commit this to the client repo's `.claude/settings.json` so the plugin loads on
session start:
```json
{
  "extraKnownMarketplaces": {
    "webgroove-seo": { "source": { "source": "github", "repo": "webgrooveio/bates-media" } }
  },
  "enabledPlugins": { "local-seo-engine@webgroove-seo": true }
}
```

## Develop / update the agent
Edit under `plugins/local-seo-engine/` here (the "workshop"), commit, push. Client
sessions pick up changes with `/plugin marketplace update webgroove-seo`.
Validate before publishing: `claude plugin validate ./plugins/local-seo-engine`
and `claude plugin validate .`.
