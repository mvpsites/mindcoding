# CONTINUE.md — Mind Coding session handoff
## Written 2026-07-12 (the marathon session) · supersedes ALL prior handoffs
## main HEAD at write time: see git log — every ruling below is DEPLOYED unless marked owed

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
