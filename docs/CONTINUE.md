# CONTINUE.md — Mind Coding session handoff
## ⚖ THE LAW lives in /AGENTS.md (repo root) — stable rules for ANY agent
## (Claude, ChatGPT, etc.). Read it FIRST. This file is the CURRENT STATE:
## in-flight work, owed rulings, latest gotchas. Newer dated rulings here
## override older text; Jad's live instructions override everything.
## Written 2026-07-12 (the marathon session) · supersedes ALL prior handoffs
## main HEAD at write time: see git log — every ruling below is DEPLOYED unless marked owed

---

## ⚡ 2026-07-17/18 — THE MOTION+ PASS (branch feat/motion-pass, NOT merged —
## awaiting Jad's on-device ruling before main)

- Jad purchased Motion+ (motion.dev) and instructed the pass in-conversation:
  a MOTION LAYER, not a redesign — all content/functions/text/layout intact.
  `docs/MOTION-SPEC.md` is the ruled artifact (committed before any
  implementation): every moment with trigger, spring parameters, and its
  reduced-motion twin. THE LAW: the shipped static site IS the RM
  experience; twins are complete states. AGENTS.md §2 amended — Motion
  vanilla UMD is the ONE approved dependency, self-hosted at
  `public/vendor/motion-12.42.2.min.js` like the fonts; every use guarded
  (`window.Motion &&`) so a blocked bundle degrades to shipped behavior.
- SIX COMMITS, one per phase, LOCAL Device Truth green (4 combos, plus the
  two new spec checks) after every phase: spec/law → P1 unlock (magnet +
  spring seat + 400ms stillness + iris unveiling) → P2 hero install
  RESURRECTED (see below) → P3 scroll life (gold rules draw in, stamps
  scroll-trigger, breathing + ticker exemption kept) → P4 pillar page-flip
  (Motion, View Transitions rejected: no Firefox) → P5 emblem sprung
  pointer (BEHAVIOR constants untouched). sw v69→v73 across the phases.
- HERO INSTALL RESURRECTION supersedes the 07-15 retirement per Jad's
  07-17 instruction: the freeze cause (RM concealment) is structurally
  gone — the RM guard is the module's first line, nothing is ever
  concealed under RM; 6s stall watchdog + 8s gate hatch + try/catch→snap.
  The 07-14 device-ruled pacing verbatim. The intro-video plan remains
  Jad's alternative — his call which survives.
- WHEEL: NO CHANGE, deliberately — flick inertia (DECAY .965) + magnetic
  snap (SNAP .16) already ARE the shipped session-locked physics the
  instruction described; a retune needs Jad's explicit word (AGENTS.md §4).
- FOUND IN PASSING (pre-existing, unfixed, needs its own ruling): at 390px
  the subnav row on roll pages measures ~459px — WISDOM fully off-screen,
  WELLNESS clipped (BOOKS had the same fate pre-rename). The generic
  overflow gate misses it because the mobile layout viewport expands to
  match. device-truth PILLAR NAV check drives LOVE (on-screen) meanwhile.
- device-truth.spec.mjs gained: INSTALL COMPLETES (start→skip→full frame,
  both modes) and PILLAR NAV LANDS (flip must land at opacity 1). First
  install-check run caught its own click landing above the viewport on the
  1209px-tall section — clamp your click points on tall sections.
- OWED: Jad's on-device verdicts — unlock feel (magnet strength .45, seat
  bounce .3, the 400ms beat), install pacing on his Safari/trackpad (the
  original repro debt), rule width/weight taste, pillar flip distance
  (24px), emblem spring (vd .30 bounce .22). Then merge to main.

## ⚡ 2026-07-15 — HERO INSTALL ANIMATION RETIRED + BRAND ASSETS INTEGRATED (branch
## feat/static-hero-brand-assets, owner's ruling — see workstream brief)

- INSTALL ANIMATION RETIRED (owner decision): the section 01 type-in sequence
  (shipped feat/hero-install, merged 66413da, ruled 07-13/07-14) is gone.
  The 07-14 SHIPPED entry's OWED (1) — investigating whether the armed/
  trigger state fails on Jad's Safari/trackpad — is now CLOSED, superseded.
  He never witnessed it working, and rather than keep chasing the device
  repro the animation is retired outright. Hero returns to fully static —
  the animation's FINAL FRAME (all six beliefs + stamps, boot lines,
  6 PATTERNS ACTIVE — STILL RUNNING flag), not the pre-animation design.
  public/hero-install.js deleted; all mc-hi concealment CSS, the head-gate
  script, #hi-cursor/.hi-vh scaffolding, and data-boot/data-type/data-
  status/data-fade/data-hesitate hooks removed from index.html. THE
  ENTRANCE splash (drag-the-key) and the particle emblem untouched.
- NEXT: a hero intro video (~35s, muted autoplay) is planned to perform the
  install sequence as rendered video instead. Production happens OUTSIDE
  this repo (Jad is producing it separately); integration into the hero
  will be a future branch once the file exists.
- BRAND ASSETS INTEGRATED (owner-supplied mindcoding-logo-assets.zip): new
  keyhole mark replaces the old two-face/brain/key logo — the only logo
  image files in the repo were public/icons/{apple-touch-icon,icon-192,
  icon-512}.png, now overwritten with the new mark (icon-192/512 resized
  from favicon-512.png). favicon-32/64.png added as <link rel="icon"> on
  all 8 pages (replacing the inline crosshair-SVG data URI); apple-touch-
  icon newly linked (didn't exist before). Footer lockup
  (lockup-horizontal-gold-transparent.png, public/assets/) replaces the
  text wordmark on the LANDING PAGE footer only — the other 7 pages have
  colophon-only footers with no existing mark/grid to place it in, left
  untouched (flag for Jad: does he want it added there too?). Nav/header
  untouched everywhere (type-only, no logo image existed to swap).
- OG/SOCIAL CARD: og-image-1200x630.png (public/assets/) wired as
  og:image + twitter:image with og:image:width/height on all 8 hand-
  authored pages AND in tools/build_rolls.mjs's setCanonical (the one
  place the generator emits this meta for every roll/entry page).
  ⚠ PROVENANCE: the owner's actual og-image-1200x630.png never landed as
  an uploadable file in this session (pasted inline twice, no file
  bytes reachable) — this is a reconstruction, composited from his own
  lockup-vertical-gold-transparent.png onto the #070B1A brand background,
  matched pixel-for-pixel against what he pasted. NOT a new design
  decision, but flagged: swap in the master file if/when he sends it.
  BONUS FIX while touching this: the 5 channel pages' og:image was
  pointing at a stale pre-cleanse URL (mvpsites.github.io/mindcoding/
  preview-zine-v2/cardback.webp, dead since the 07-12 root-swap) — never
  actually shipped to production (setCanonical always overwrote it when
  BASE_URL was set) but was live on GH Pages previews. Fixed to the new
  og-image alongside everything else.
- HOMEPAGE SEO META (owner-ruled copy, homepage only): `<title>` → MIND
  CODING — Recode Your Mind. Change Your Reality.; meta description →
  Your beliefs were installed. Recode them. Free music, affirmations,
  visualization and life scripts to rewrite the patterns running your
  life.; og:title aligned to the new title. og:description, canonical,
  robots left untouched. Channel pages keep their existing meta.
- sw v56→v57 (index.html + all 8 pages' head + icons + build_rolls.mjs
  changed). Verified: dist-wide link check clean (357 refs, 0 missing
  beyond a known JS-string false positive baked into the checker pattern
  itself), zero failed requests / console errors on a full page load,
  hero renders byte-identical with JS on vs off, footer lockup crisp at
  desktop + 390px with reduced motion, dist diff vs main = exactly the
  files this brief touched (verified via a comparison worktree build).

## ⚡ 2026-07-14 SHIPPED — HERO INSTALL + ENTRANCE v2 MERGED TO MAIN (RULED: "approved to ship")

- PR #2 (feat/hero-install → main) merged at 66413da. BOTH deploy
  workflows green ON THAT SHA; https://mindcod.ing VERIFIED serving the
  new build in-browser (install markup, key splash, TAKE THE KEY. /
  IT WAS ALWAYS YOURS., sw v56, robots index,follow intact). The
  "NOT merged" notes in the addenda below are now historical.
  preview-cloudflare.yml is on main → its workflow_dispatch is now
  API/UI-visible for future branches.
- OWED (1): Jad's on-device verdict on install-sequence pacing, the
  BE REAL hesitation, the cursor, and hover-start feel. ⚠ IMPORTANT:
  the owner has NOT yet successfully witnessed the animation on-device —
  before assuming user timing, INVESTIGATE whether the armed/trigger
  state fails on his hardware (Safari, trackpad): check IO threshold .5
  on the boot plate actually fires in Safari, pointerenter behavior with
  trackpads, and whether the 4s autoplay rescued him (if he saw the
  final state instantly, suspect a skip-path misfire; ?hi-debug logs
  beat marks). The armed boot-line + blinking cursor should be visible
  evidence — ask what he saw.
- OWED (2): install Homebrew + Node LTS on this machine before the next
  session. Gates currently run on a borrowed app-bundled node
  ('/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node',
  v24) — works, but it is not ours and can vanish with an app update.

## ⚡ 2026-07-14 ADDENDUM — DEVICE RULINGS: PACING + THE ENTRANCE v2 (branch feat/hero-install, merged above; supersedes the 07-13 pacing text below)

- PACING RE-RULED from device review: the accelerating governor and the
  6.5s ceiling are REMOVED — skip is the bounce protection, not the
  budget. Flat 40ms/char ±40% jitter, word pauses 140–180ms, gap 350ms,
  boot 0.8s, BE REAL+420ms verbatim. Harness now REPORTS totals: 500
  plans → 9669/9974/10321 ms (min/median/max, approved ~9–10s band).
- THE ENTRANCE v2 (ruled): hold-the-keyhole replaced by TAKE THE KEY —
  gold key dragged to the iris keyhole (pointer events); on overlap it
  snaps, turns 90° hard tick, iris blooms, splash dissolves 600ms,
  mc:enter. Hint fades at 1.5s idle (TAKE THE KEY. / small: the ruled
  07-12 CTA line — hierarchy inverted, Jad may re-rule). Fallbacks:
  keyhole click-target + focusable aria-labelled key with Enter/Space.
  REDUCED MOTION now SEES the splash (click unlock, instant dissolve) —
  the old RM auto-skip is gone. Once-per-session unchanged (mc-in); the
  hero install arms on BOTH paths (mc:enter or plain viewport entry).
  FAILSAFE PARITY: __mcGateHatch 2.5s teardown in the head gate (removes
  splash, mc-in class, dispatches mc:enter so no waiter hangs; does NOT
  persist mc-in), disarmed as the entrance script's last init act.
  Geometry rides gate.getBoundingClientRect(), not window.inner*.
- Gates re-run green: killed-entrance + killed-module hatch pages, both
  arming paths, wheel grace, snap skip, replay, zero drift at every beat
  (fonts-loaded baselines), build+rolls+link check, dist diff vs main =
  index.html/sw.js/hero-install.js only. sw v54→v55. OWED: device pass
  on the drag feel + RM verdict (pane could not exercise real drag).

- DEVICE PASS 2 (ruled later 07-14): splash small line now IT WAS ALWAYS
  YOURS. (PUT YOUR FINGER ON IT deleted); key scaled ~1.6× (21vmin/134px,
  seated at +24vmin — still clear of the snap zone at rest, verified
  desktop + 390 incl. hint/ask clearance). INSTALL TRIGGER v2: viewport
  entry only ARMS (boot line 1 + blinking cursor); START = first pointer
  interaction with section 01 (hover-enter or first tap — the starting
  gesture cannot self-skip, skip binds a macrotask later); armed 4s with
  no interaction → AUTOPLAY (no inert sections, ruled); interactions
  after start snap-skip, wheel grace kept; RM/replay/hatch unchanged.
  All paths re-verified in pane + zero drift incl. armed phase.
  sw v55→v56.

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
  Resources/cua_node/bin/node', read-only use). BRANCH PREVIEWS (ruled
  07-14): .github/workflows/preview-cloudflare.yml deploys any non-main
  push as a wrangler --branch PREVIEW (noindex, production alias
  untouched, refuses main). LIVE + VERIFIED:
  https://feat-hero-install.mindcoding.pages.dev serves the branch;
  mindcod.ing confirmed unchanged. GOTCHA: its workflow_dispatch is
  API/UI-invisible until the file reaches main (GitHub indexes
  dispatchables from the default branch — the dispatch API 404s); the
  push trigger is what runs until merge.
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
  01 abundance · 02 love · 03 spirit · 04 wellness · 05 wisdom
  (wellness + books built 07-12 per the approved July roadmap;
  books pillar renamed WISDOM 07-17 — /channels/books/ redirects kept).
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
   ponder block, wash line, chip note, wellness + wisdom ledes/support,
   roll labels (WHAT TO DO / IN PREPARATION / INKED · AWAITING PRINT),
   share strip, og descriptions.
3. Content: real videos into channels.json (wisdom = strongest SEO play,
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
