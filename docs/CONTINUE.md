# CONTINUE.md — Mind Coding session handoff
## ⚖ THE LAW lives in /AGENTS.md (repo root) — stable rules for ANY agent
## (Claude, ChatGPT, etc.). Read it FIRST. This file is the CURRENT STATE:
## in-flight work, owed rulings, latest gotchas. Newer dated rulings here
## override older text; Jad's live instructions override everything.
## Written 2026-07-12 (the marathon session) · supersedes ALL prior handoffs
## main HEAD at write time: see git log — every ruling below is DEPLOYED unless marked owed

---

## ⚡ 2026-07-13 ADDENDUM — HERO INSTALL SEQUENCE (RULED by Jad; branch feat/hero-install, NOT merged)

- SECTION 01 NOW *INSTALLS* THE BELIEFS instead of displaying them: gold
  boot plate (MIND CODING — v1.0 / LOADING INSTALLED PATTERNS…), the SIX
  beliefs type in (copy untouched) with a forensic mono stamp each —
  RULED annotations: logged by: others / logged by: self (the
  too-much/not-enough contradiction pair) / origin: inherited /
  installed: early / source: unknown / last run: today (always final) —
  then ⚠ 6 PATTERNS ACTIVE — STILL RUNNING (red) with one hard blink,
  then beliefs-after fades in 600ms. BE REAL + 420ms + ISTIC. hesitation.
- TIMING (ruled amendment): accelerating installer — lines 1–2 34ms/char
  ±40% jitter, −15%/line after (floor 20), word pauses 90–110ms (the
  space char IS the pause), gaps 200→100ms, boot ≤550ms; a BUDGET
  GOVERNOR squeezes only scalable deltas to pin total at 6450ms (fixed
  beats never squeezed). Harness: 500 plans, all 6450ms exactly.
- FILES: public/hero-install.js (engine: pure plan() + DOM layer, one rAF
  flat schedule, drains due events after throttling — verified); markup +
  CSS + pre-paint mc-hi head gate in index.html; sw v53→v54. All copy
  static ALWAYS (SEO gate: dist diff vs main = only the 3 intended files;
  link check 298 refs clean). Concealment only under html.mc-hi; no JS =
  static hero. FAILSAFE HANDSHAKE (ruled): the head gate arms a 2.5s
  hatch that force-reveals the static hero; the module clears it as its
  FIRST act on init. Slow connection / blocked script / any JS failure →
  static hero, never darkness. ACCEPTANCE GATE (ruled, verified): kill
  the module script tag → section renders static within 2.5s (measured
  2.6s page-time incl. head-parse offset); module present → hatch
  cleared, concealment owned, sequence plays.
- UX: starts when .beliefs enters viewport (after mc:enter on the gated
  landing); skip = pointerdown/keydown instant, wheel/touchmove after a
  700ms grace (trackpad momentum from the arming scroll must not kill
  it — found + fixed this session); sessionStorage.mc_hero_played gates
  replay; reduced motion never conceals; settle restores the source DOM
  VERBATIM. Zero layout drift verified at desktop + 390-class width
  against fonts-loaded baselines, across every beat.
- TEST HOOK: ?hi-debug exposes HeroInstall._test {start/advance/finish/
  state} (debugExpose pattern) — embedded/headless panes report
  visibilityState hidden and never run rAF/IntersectionObserver; pump
  the schedule manually. Also logs planned total + governor scale.
- GOTCHAS: machine currently has NO system node/npm/brew — gates ran on
  the ChatGPT.app bundled node v24 ('/Applications/ChatGPT.app/Contents/
  Resources/cua_node/bin/node', read-only use). Neither deploy workflow
  triggers on non-main branches and Cloudflare deploys are wrangler
  direct-upload → NO branch preview exists; Jad to rule: dispatchable
  wrangler --branch preview workflow, or review locally / merge.
- OWED: Jad's device verdict on the feel (jitter, hesitation, cursor,
  grace), the two new annotation strings are RULED (not placeholder),
  boot plate + stamps persist in the settled frame (ruled: reserved
  space never collapses).

## ⚡ 2026-07-12 EVE ADDENDUM — GRAPHIFY FULL GRAPH + AGENT WIRING (Jad's ruling: "full run with the HTML visualization")

- KNOWLEDGE GRAPH EXPANDED code-only → full corpus (Jad's explicit "full
  run" ruling supersedes the earlier code-only .graphifyignore ruling for
  graph.json content; the ignore file itself is unchanged and still scopes
  art/dist/fonts out). graph.json now 81 nodes / 118 edges / 16 communities
  (was 50/53/13): workflows + all HTML pages semantically extracted via
  subagent (no API key). New committed outputs: GRAPH_REPORT.md, graph.html
  (interactive viz), .graphify_labels.json (community names).
- Graph health caveat: 14 dangling-endpoint edges (semantic refs into
  channels.json/deck.json — AST emits no nodes for JSON data files) and
  6 collapsed duplicate edges. Usable; noted per graphify honesty rules.
- HOOKS INSTALLED: git post-commit + post-checkout auto-rebuild the graph
  (AST-only, code files, no API cost). Doc/HTML edits need a manual
  `/graphify . --update`.
- CLAUDE.md CREATED at root: orders agents to read AGENTS.md FIRST (the
  law), then routes codebase questions through `graphify query` before
  grep. .claude/settings.json gained graphify PreToolUse hooks.
- Gitignored (machine-local): graphify-out/.graphify_python, .graphify_root.
  graphify-out/.graphify_analysis.json deleted (temp sidecar, was
  mistakenly committed 9f43d63).
- No public/ changes — no sw bump. Deploys ship identical content.

## ⚡ 2026-07-12 PM ADDENDUM — THE CLEANSE + ROOT SWAP (Jad's ruling: "forget the rules, clean everything, self-host all assets")
## This section OVERRIDES stale paths/rulings below. Read it first.

- THE ZINE IS THE SITE ROOT. /preview-zine-v2/ no longer exists — its whole
  tree was promoted verbatim into public/ (landing = /, /draw/, /channels/,
  /channels/<id>/, engines + data at root). Internal structure unchanged;
  only boundary refs were rebased (../shared→shared from landing,
  ../../shared→../shared from /draw/, artBase '../'→'./' and '../../'→'../').
- PURGED (recoverable forever at tags archive/pre-cleanse-2026-07-12 and
  archive/field-v4): public/preview (20M FIELD-era snapshot), preview-parity,
  preview-parity-2, preview-zine (v1), preview-symbol-lab, directions,
  preview-codex, preview-zine-final, src/ (FIELD v4 React app), root
  index.html, vite.config.js. The untouchable designations on zine-final and
  codex were RESCINDED by Jad in this ruling. Wheel.jsx back-port source
  lives at tag archive/field-v4.
- BUILD SYSTEM: vite + React + three REMOVED. npm run build =
  tools/build_site.mjs (verbatim copy public/→dist). package.json has zero
  deps. Both workflows unchanged (they call npm run build + build_rolls).
- build_rolls.mjs: rebased to root (zine=dist, canonicals /channels/...).
  LATENT BUG FIXED: entry pages are one dir deeper than the roll shell they
  template from — relative refs now gain one ../ (applied before injections
  so the generator's own ../ back-to-roll link keeps its depth). Entry-page
  assets were silently broken before this; a dist-wide link checker
  (217 refs, 0 missing) now exists as a pattern — rerun it before pushes.
- FONTS SELF-HOSTED: Google Fonts links stripped from all 8 pages; /fonts/
  has Archivo Black 400 + Space Mono 400/700 woff2 (via @fontsource) +
  fonts.css, linked depth-correctly per page. Zero external asset deps
  remain (share intents are not assets).
- sw cache v35. Engines byte-identical to the verified c9fc384 state
  (diffed against the tag). Emblem render harness re-run: 1767 pts, 0 error.
- CLOUDFLARE IS LIVE ON THE REAL DOMAIN: https://mindcod.ing (+www), zone
  active in Jad's account (nameservers moved from Spaceship 07-12), both
  hostnames CNAME->mindcoding.pages.dev proxied, certs issued, SITE_URL var
  set -> canonicals/og/JSON-LD regenerate against mindcod.ing. Workflow
  gained two permanent steps: sanitized credential verify + ensure-project
  (wrangler CANNOT create a missing Pages project in CI — folklore wrong).
  NEW: .github/workflows/cf-admin.yml — dispatchable CF ops (zone-status /
  attach-domains / verify-live) reporting via ::notice:: annotations, the
  session-readable channel (job logs are NOT readable from the sandbox).
  Note: curl from CI gets a bot-challenge 403 on the live domain — that is
  Cloudflare challenging datacenter IPs, not an outage; browsers pass.
  GOTCHA: Spaceship parking A records re-appeared after zone activation and
  had to be deleted manually; the account API token attaches Pages domains
  but gets Authentication error on zone DNS writes.
  STILL PENDING: Jad's device verdicts + the copy ruling pile (below).

---


## START HERE — WHAT THE PRODUCT IS NOW

The V2 zine (/preview-zine-v2/) was restructured on 07-12 into ONE CONTINUOUS
JOURNEY and is the de-facto product:

  masthead (+ subnav) → 01 THE INSTALLATION → 02 THE PATTERN (interactive
  emblem + collapsible staged reveal) → 03 THE THEATRE (the full draw:
  keyhole iris → auto-wash → wheel → five-part reading, mounted at #mcdraw)
  → closing (YOUR MIND WILL KEEP LEARNING, no CTA) → 04 THE CHOICE with
  FIVE pillars → footer with SHARE strip.

FIVE PILLARS (each with its own roll page /channels/<id>/):
  01 abundance · 02 love · 03 spirit · 04 wellness · 05 books
  (wellness + books built 07-12 per the approved July roadmap).
/draw/ still exists for deep links: mirror intro + the same component.
/channels/ is the hub. All 8 pages carry: top subnav (THE THEATRE +
5 pillars), keyhole-glyph MIND CODING — HOME mark, keyhole favicon
(replaced the crosshair), og meta + twitter card, scroll-life.

## THE DRAW EXPERIENCE — COMPONENT (extraction 07-12)

/preview-zine-v2/draw-experience.js + .css — extracted VERBATIM from the
draw page so landing and /draw/ run identical code.
  MindDraw.mount(rootEl, { deckUrl, artBase, cardback, kickB, kickS,
    debugExpose })   ← debugExpose is the test hook the harness uses.
Requires /shared/keyhole-iris.js loaded first.
- THE VEIL: big centered ask (ASK A QUESTION YOUR AUTOPILOT CANNOT ANSWER /
  HOLD IT SILENTLY in gold), keyhole alone in the center (ruled: keep it
  clean), LOOK BEYOND THE VEIL button — PULSING (btn--veil keyframe).
  No intention input EVER (ruled: hold it in mind). No typed anything.
- THE IRIS (/shared/keyhole-iris.js): sealed midnight + halftone grain,
  punched keyhole mark at 0.21·min(W,H) with pulsing gold leak (0.34 alpha,
  2.6 radius), flare 0–14% then bloom pow(1.7) in the keyhole’s own shape,
  halftone fringe on the edge, canvas removes itself at open. Bugs fixed via
  green-sentinel pixel audit: arc direction + destination-out needing an
  OPAQUE fillStyle — keep both.
- Stage: 470px / 620px≥561px (centerpiece ruling), gold inner frame line,
  SHUFFLE AGAIN chip INSIDE the stage bottom-center (small btn, note
  stacked under), appears only on fanOut.
- Wash: auto (pileVel kick +0.30 over the 0.0022 idle drift), entropy ^=
  crypto.getRandomValues, fanOut at 1400ms; the swirl gesture still works
  and can fan early. WHEEL PHYSICS UNTOUCHED AND SESSION-LOCKED
  (MAXSTEER .20, DECAY .965, tap-to-draw ≤9px/<350ms).
- READING (five parts): 01 SYMBOL · 02 PATTERN · ⟲ THE REVERSAL (red-ruled,
  shows the card’s own reversed field — data complete on all 78 — while the
  meta keeps the upright field under an UPRIGHT FIELD label; art rotates) ·
  03 QUESTION · 04 RECODE (now includes recodePath, the practice text) ·
  05 THE LIFE PATTERN (ponder lead naming the card, reversal-aware, + three
  mono questions). NO SAVING — ruled 07-12, each reading is unique; the
  whole localStorage system, KEEP THIS MIRROR, and the ARCHIVE are deleted.
  Only action: ASK DEEPER (reshuffles).

## THE EMBLEM (02 THE PATTERN)

/shared/programmed-self.js — map (/shared/emblem-points.js) is the source of
truth, 1767/982 pts. TWO retunes ruled 07-12, both live:
- FLUID: hover press .6 (≈33× the original coupling), PULL 1.2, falloff 1.35,
  radius .24/.26 of fit; and then
- ELASTIC: DRAG_AUTHORITY 0.15 (springs barely fight while HELD — the user
  believes they changed it), release springs circuit .030/seal .048/
  star .060/key .054, damping .87–.90 — travels farther, snaps back faster.
  Measured: swipe peak 17% desktop / 35% phone, settle 333/617ms, 0px error.
- Reform lock peak≥4; the LANDING reveal threshold is ALSO 4 (the page had
  its own stale copy of 8 — fixed; remember thresholds live in TWO places).
- The staged reveal COLLAPSES (grid 0fr→1fr) — no reserved dead space.
- FPS still never measured headlessly. Jad’s device verdict STILL OWED.

## PUBLISHING MODEL (the mvpsites playbook — ruled 07-12)

channels.json is the CMS. Per item: title / type / status / ytId / line.
To publish: set ytId, status:"live", write the what-to-do into line, push.
tools/build_rolls.mjs runs in BOTH workflows after vite build, against dist:
- renders all 5 roll pages statically (entries in crawler-visible HTML,
  client fetch stripped, titles link to entry pages);
- emits ONE PAGE PER ITEM at /channels/<ch>/<slug>/ — unique title, meta
  description, canonical (BASE_URL env), VideoObject JSON-LD when live;
- INDEXABLE=1 flips noindex→index,follow (Cloudflare only; GH previews
  stay noindex).
Workflows: deploy.yml (GH Pages, includes generator) and
deploy-cloudflare.yml (npm ci → build → generator INDEXABLE=1 BASE_URL from
SITE_URL var or mindcoding.pages.dev → wrangler pages deploy dist
--project-name=mindcoding).
⚠ CLOUDFLARE IS RED: repo secrets CLOUDFLARE_API_TOKEN +
CLOUDFLARE_ACCOUNT_ID not yet added — JAD’S NEXT ACTION. Wrangler creates
the Pages project on first successful deploy. Custom domain mindcod.ing +
SITE_URL var come after. vite base is "./" — path-agnostic by design.

## SITE CHROME + MOTION (07-12)

- THE SHEET: ≥1240px everything centers at 1200px with 2px trim rails;
  selectors per page include body>#mcdraw. Spine stays left — ruled.
- scroll-life.js/.css on all 8 pages: staggered rise-in reveals + faint
  headline counter-drift. Transform/opacity only; EXCLUSION ZONE:
  .prosc/.wheelstage/.veil (their transforms belong to the wheel/iris).
  Reduced motion exits before tagging. Drift factor + 22px rise are the
  tuning knobs; mobile trim not yet judged by Jad.
- SHARE strip (X/FB/WhatsApp/copy) on landing + rolls. sw cache = v34;
  BUMP IT whenever content changes under an existing filename.

## HARNESSES

/tmp/theatre_check.cjs pattern (rebuild if lost): stubs DOM, loads
keyhole-iris.js + draw-experience.js, mounts with debugExpose, drives
veil→wash→fan→reshuffle→reversed reveal. ALL PASS as of this writing.
Iris renders: @napi-rs/canvas harness w/ green-sentinel background
(the veil is paper-colored — never audit holes against paper).
Emblem: tools/render_check_symbol.cjs + measure_symbol.cjs.
GOTCHAS: Node 22 navigator/crypto globals are getter-only; the draw source
contains JS-escaped sequences (\u2713 style) — use index-based cuts, not
string anchors; grep-with-&& chains die on empty matches; GATE PUSHES ON
HARNESS EXIT CODES (one FAIL got pushed before verification this morning —
it was benign, the lesson stands).

## WORK QUEUE

0. JAD: add the two Cloudflare secrets → dispatch Deploy to Cloudflare →
   mindcoding.pages.dev live. Then domain + SITE_URL.
1. JAD’S DEVICE VERDICTS OWED: emblem FPS (fluid+elastic physics now),
   theatre feel at the new 470/620 heights, scroll-life drift/rise taste
   (mobile especially — offer hover-gating the drift), keyhole pulse rate.
2. COPY RULING PILE (all placeholder lines are Claude’s, Jad’s words
   pending): veil ask arrangement, reversal framing + UPRIGHT FIELD label,
   ponder block, wash line, chip note, wellness + books ledes/support,
   roll labels (WHAT TO DO / IN PREPARATION / INKED · AWAITING PRINT),
   share strip, og descriptions.
3. Content: real videos into channels.json (books = strongest SEO play,
   people search titles). Reap/Activepieces distribution pipeline is
   queued post-reskin per the 07-11 ruling.
4. Parked, unchanged: production architecture (the zine has de facto become
   the product — a root-swap ruling is now URGENT before launch),
   /preview-codex/ (still unruled, DO NOT TOUCH), August launch date,
   wheel retunes back-port into src/components/Wheel.jsx, settle-hint
   (element deleted; rehome or forget).

## HOUSE RULES (unchanged, enforce)
Two inks on midnight + gold + red (bright-gold #F4C85C in the emblem awaits
ruling), Archivo Black + Space Mono, --bd:8px. No WebGL/frameworks.
Restyle don’t rebuild. Never touch production root, /preview-zine-final/,
card data, or wheel physics without explicit instruction. Render 2D
headlessly and LOOK at it. Honest telemetry. One session at a time —
CHECK git log AGAINST YOUR KNOWN HEAD BEFORE BRANCHING (a parallel-session
commit slipped through a quiet pull on 07-12). Confirm deploys succeed ON
THE NEW SHA. PAT policy: Jad’s token stays live at his discretion, supplied
via his handoff prompt, NEVER committed (secret scanning would revoke it).
