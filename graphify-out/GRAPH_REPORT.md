# Graph Report - /Users/jadf/Desktop/mindcoding  (2026-07-12)

## Corpus Check
- Corpus is ~45,552 words - fits in a single context window. You may not need a graph.

## Summary
- 81 nodes · 118 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 77% EXTRACTED · 23% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.84)
- Token cost: 129,600 input · 0 output

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
1. `MIND CODING Home Page (No. 01)` - 18 edges
2. `Recode Channels Index Page` - 10 edges
3. `canvas()` - 8 edges
4. `Zine Design System (Two Inks on Midnight)` - 8 edges
5. `channels.json Channel Data` - 7 edges
6. `The Draw Page` - 7 edges
7. `Cloudflare Admin Workflow` - 6 edges
8. `Books Channel Roll Page` - 6 edges
9. `Share Widget (X / Facebook / WhatsApp / Copy Link)` - 6 edges
10. `esc()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Cloudflare Admin Workflow` --references--> `Books Channel Roll Page`  [EXTRACTED]
  .github/workflows/cf-admin.yml → public/channels/books/index.html
- `Cloudflare Admin Workflow` --references--> `scroll-life.js Scroll Effects`  [EXTRACTED]
  .github/workflows/cf-admin.yml → public/index.html
- `Art Courier Workflow` --conceptually_related_to--> `The Draw Page`  [INFERRED]
  .github/workflows/fetch-art.yml → public/draw/index.html
- `Cloudflare Admin Workflow` --shares_data_with--> `Deploy to Cloudflare Pages Workflow`  [INFERRED]
  .github/workflows/cf-admin.yml → .github/workflows/deploy-cloudflare.yml
- `Cloudflare Admin Workflow` --references--> `MIND CODING Home Page (No. 01)`  [EXTRACTED]
  .github/workflows/cf-admin.yml → public/index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Channel Roll Rendering Flow (channels.json consumers)** — public_channels_index_channels_page, public_channels_abundance_index_abundance_roll, public_channels_love_index_love_roll, public_channels_spirit_index_spirit_roll, public_channels_wellness_index_wellness_roll, public_channels_books_index_books_roll, public_channels_channels_json [EXTRACTED 1.00]
- **Site Deployment and Verification Pipelines** — _github_workflows_deploy_deploy_to_github_pages, _github_workflows_deploy_cloudflare_deploy_to_cloudflare_pages, _github_workflows_cf_admin_cloudflare_admin [INFERRED 0.85]
- **Iris Transition System (keyhole entrance + nav transitions across all pages)** — public_shared_keyhole_iris_iris, public_shared_nav_iris_nav_iris, public_index_home_page, public_draw_index_draw_page, public_channels_index_channels_page, public_channels_abundance_index_abundance_roll, public_channels_love_index_love_roll, public_channels_spirit_index_spirit_roll, public_channels_wellness_index_wellness_roll, public_channels_books_index_books_roll [EXTRACTED 1.00]

## Communities (16 total, 2 thin omitted)

### Community 0 - "Static Roll Page Builder"
Cohesion: 0.22
Nodes (11): BASE, chans, entryArticle(), entryHow(), entryMedia(), esc(), HAND, LEDE (+3 more)

### Community 1 - "Home Page Experience Engine"
Cohesion: 0.27
Nodes (11): Cloudflare Admin Workflow, Insight Reveals, Repetition Recodes, MIND CODING Home Page (No. 01), The Programmed Self Interactive Emblem, THE ENTRANCE Veil Gate, scroll-life.js Scroll Effects, Emblem Points Geometry (emblem-points.js), Iris Keyhole Engine (keyhole-iris.js) (+3 more)

### Community 2 - "Recode Channel Pages"
Cohesion: 0.53
Nodes (10): Abundance Channel Roll Page, Books Channel Roll Page, channels.json Channel Data, Recode Channels Index Page, The Recode Channels (Abundance, Love, Spirit, Wellness, Books), Love Channel Roll Page, Spirit Channel Roll Page, Wellness Channel Roll Page (+2 more)

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
Cohesion: 1.00
Nodes (3): Deploy to Cloudflare Pages Workflow, Deploy to GitHub Pages Workflow, build_rolls.mjs Static Roll Generator

## Knowledge Gaps
- **14 isolated node(s):** `name`, `private`, `version`, `type`, `build` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MIND CODING Home Page (No. 01)` connect `Home Page Experience Engine` to `Recode Channel Pages`, `Tarot Draw Pipeline`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `Cloudflare Admin Workflow` connect `Home Page Experience Engine` to `Recode Channel Pages`, `Deploy Workflows`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `The Draw Page` connect `Tarot Draw Pipeline` to `Home Page Experience Engine`, `Recode Channel Pages`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `Zine Design System (Two Inks on Midnight)` (e.g. with `Abundance Channel Roll Page` and `Books Channel Roll Page`) actually correct?**
  _`Zine Design System (Two Inks on Midnight)` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._