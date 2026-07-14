# Graph Report - mindcoding  (2026-07-14)

## Corpus Check
- 17 files · ~47,839 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 86 nodes · 110 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.64)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `435a9098`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Static Roll Page Builder
- Home Page Experience Engine
- Recode Channel Pages
- Stencil Art Sampler
- Tarot Draw Pipeline
- Package Manifest
- Deploy Workflows
- Nav Iris Transition
- Art Fetcher Script

## God Nodes (most connected - your core abstractions)
1. `Recode Channels Index Page` - 9 edges
2. `canvas()` - 8 edges
3. `channels.json Channel Data` - 7 edges
4. `finish()` - 5 edges
5. `esc()` - 5 edges
6. `entryArticle()` - 5 edges
7. `The Draw Page` - 5 edges
8. `run()` - 4 edges
9. `snap()` - 4 edges
10. `snapScroll()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Cloudflare Admin Workflow` --references--> `Books Channel Roll Page`  [EXTRACTED]
  .github/workflows/cf-admin.yml → public/channels/books/index.html
- `Art Courier Workflow` --conceptually_related_to--> `The Draw Page`  [INFERRED]
  .github/workflows/fetch-art.yml → public/draw/index.html
- `Deploy to GitHub Pages Workflow` --semantically_similar_to--> `Deploy to Cloudflare Pages Workflow`  [INFERRED] [semantically similar]
  .github/workflows/deploy.yml → .github/workflows/deploy-cloudflare.yml
- `The Draw (Card as Mirror)` --conceptually_related_to--> `The Recode Channels (Abundance, Love, Spirit, Wellness, Books)`  [INFERRED]
  public/draw/index.html → public/channels/index.html
- `Cloudflare Admin Workflow` --shares_data_with--> `Deploy to Cloudflare Pages Workflow`  [INFERRED]
  .github/workflows/cf-admin.yml → .github/workflows/deploy-cloudflare.yml

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Channel Roll Rendering Flow (channels.json consumers)** — public_channels_index_channels_page, public_channels_abundance_index_abundance_roll, public_channels_love_index_love_roll, public_channels_spirit_index_spirit_roll, public_channels_wellness_index_wellness_roll, public_channels_books_index_books_roll, public_channels_channels_json [EXTRACTED 1.00]
- **Site Deployment and Verification Pipelines** — _github_workflows_deploy_deploy_to_github_pages, _github_workflows_deploy_cloudflare_deploy_to_cloudflare_pages, _github_workflows_cf_admin_cloudflare_admin [INFERRED 0.85]

## Communities (16 total, 2 thin omitted)

### Community 0 - "Static Roll Page Builder"
Cohesion: 0.22
Nodes (11): BASE, chans, entryArticle(), entryHow(), entryMedia(), esc(), HAND, LEDE (+3 more)

### Community 1 - "Home Page Experience Engine"
Cohesion: 0.50
Nodes (5): Cloudflare Admin Workflow, Deploy to Cloudflare Pages Workflow, Deploy to GitHub Pages Workflow, sw.js Service Worker (mindcoding-v37), build_rolls.mjs Static Roll Generator

### Community 2 - "Recode Channel Pages"
Cohesion: 0.39
Nodes (9): Abundance Channel Roll Page, Books Channel Roll Page, channels.json Channel Data, Recode Channels Index Page, The Recode Channels (Abundance, Love, Spirit, Wellness, Books), Insight Reveals, Repetition Recodes, Love Channel Roll Page, Spirit Channel Roll Page (+1 more)

### Community 3 - "Stencil Art Sampler"
Cohesion: 0.36
Nodes (8): canvas(), cardback(), coin(), crown(), dollar(), flame(), heart(), meditator()

### Community 4 - "Tarot Draw Pipeline"
Cohesion: 0.33
Nodes (7): Art Courier Workflow, deck.json Tarot Deck Data, MindDraw Card Draw Engine (draw-experience.js), The Draw Page, The Draw (Card as Mirror), art-manifest.json Card Art Manifest, fetch_art.py Art Fetcher

### Community 5 - "Package Manifest"
Cohesion: 0.29
Nodes (6): name, private, scripts, build, type, version

### Community 7 - "Deploy Workflows"
Cohesion: 0.27
Nodes (11): arm(), bind(), finish(), moveCursor(), run(), show(), snap(), snapScroll() (+3 more)

## Knowledge Gaps
- **14 isolated node(s):** `name`, `private`, `version`, `type`, `build` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Recode Channels Index Page` connect `Recode Channel Pages` to `Tarot Draw Pipeline`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `The Draw Page` connect `Tarot Draw Pipeline` to `Recode Channel Pages`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `Books Channel Roll Page` connect `Recode Channel Pages` to `Home Page Experience Engine`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._