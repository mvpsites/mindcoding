# CONTINUE.md — Mind Coding session handoff
## Written 2026-07-11 late session · supersedes the zine-pivot handoff from earlier today (same day, two sessions)

---

## START HERE — CURRENT STATE (read all of this before touching anything)

Two sessions happened on 2026-07-11. Session 1: the zine pivot (see git
history; the archived brief is at docs/archive-CONTINUE-2026-07-11-launch-brief.md).
Session 2 (this one) shipped TWO deployments to main, both live:

1. **`ddbd3ef` — mind-symbol-v2 merged.** The V2 copy contract applied to
   `/preview-zine-v2/` (+ /draw/ + /channels/), plus `/preview-symbol-lab/`
   and the shared symbol engine `/shared/programmed-self.js`.
2. **`4fcfde1` — mind-emblem-v3 merged (current main HEAD).** Jad supplied a
   finished prototype handoff (Mind-Coding-Interactive-Emblem-Handoff.zip);
   the single-profile/fingerprint symbol was REPLACED by the real Mind
   Coding emblem: two mirrored profiles, circuit-brain paths, central
   keyhole, star, circular seal. **The generated particle map is the source
   of truth — never redraw the logo with approximate curves.**

**Live now:**
- `/preview-symbol-lab/` — emblem bench (+ `?debug=1` instrumentation)
- `/preview-zine-v2/` — complete V2 journey with the emblem in 02 THE PATTERN
- `/` (root React app) and `/preview-zine-final/` — UNTOUCHED, byte-identical

**NOT yet done:** Jad's on-device verification of the emblem (FPS with 1767
desktop particles is the top question), all copy rulings, all parked
decisions. See the work queue.

## THE PROGRAMMED SELF — now the MIND CODING EMBLEM (spec as shipped, 4fcfde1)

- Geometry: `/shared/emblem-points.js` (`window.MIND_EMBLEM_POINTS`),
  generated from `mindcoding-emblem-transparent.png` by the handoff's
  `tools/build-points.py` (Pillow; regenerable). **Desktop map 1767 pts
  above 700px; mobile map 982 pts at ≤700px — never a shrunken desktop
  field.** Regions: circuit 866/480 · seal 540/304 · key 212/108 ·
  star 149/90. Load the map BEFORE programmed-self.js (both pages do).
- Mapping: `fit = min(W,H)*0.82`, center `(W/2, H/2 + min(24, H*.025))`,
  `home = center + q*fit`. Homes permanent after build; rebuild on the
  700px boundary swaps maps (forcePhone debug does too).
- Region physics (prototype verbatim): force circuit 1.0 / seal .28 /
  key .20 / star .16; springs .050/.083/.098/.105; damping .835/.82/.80/.80.
  Pull = force·(1−d/R)^1.65·press·1.45, press 1 down / .16 hover,
  tangential ·.24 while down. R = phone ? max(82, fit·.18) : max(118, fit·.20).
  Velocity cap 9 phone / 12 desktop. Reduced motion: static emblem, no forces.
- Release: **center-out reformation wave** — spring=0 while
  elapsed < 70 + coreDist·150ms (coreDist = |home−center|/(fit/2)),
  then spring×1.12, window 900ms.
- Reformation lock: ONE gold keyhole pulse (ring derived from the key
  region's own bounds) + `vibrate(8)` once, phones only, when
  disp<3 && peak≥4 after release. **Threshold retuned 8→4 this session:**
  seal/star/key barely move by design so the averaged meter runs lower than
  the old single-profile field; a deliberate swipe measures 4–7%
  (verified firing, both viewports). If it feels wrong on device it is a
  one-number edit in programmed-self.js.
- Telemetry: disp = min(100, round(avgErr/(fit·0.12)·100)). PROGRAM CHANGE
  is 0% by construction, honestly.
- Preserved shell: pan-y + 20px/1.4× horizontal intent, 26px vertical
  cancel, multi-touch bail, pointercancel/scroll/blur cleanup, IO +
  visibilitychange rAF pause, mount API (reset/getStats/setDebug/rebuild/
  destroy, onFrame/onReform), gold trail, debug overlays.
- Rendering: transparent canvas (page bg shows through); core (key+star) =
  bone w/ subtle pulse; others gold, seed>.88 = bright gold `#F4C85C`
  **(new tint introduced by Jad's approved prototype — flagged, not yet
  explicitly ruled against the two-ink palette)**; grain 2.05/2.15 + bumps.
- sw.js cache is `mindcoding-v15` — **bump it whenever any file changes
  under an existing filename** (programmed-self.js counts; it happened
  this session).
- Harnesses: `tools/render_check_symbol.cjs` (asserts counts 1767/982,
  bounds, vertical span ≈88–89% of fit; emits point cloud for PIL
  rasterization) and `tools/measure_symbol.cjs` (synthetic swipe →
  peak 4% desktop / 7% phone, <3% in 233/267ms, 0px final home error).
  Both eval the REAL files with stubbed DOM. `.cjs` because package.json
  is type:module; never assign `navigator` in Node 22 (getter-only).
  FPS is NEVER measured headlessly — Jad's device is the FPS check.

## THE WHEEL (draw page — ported verbatim from src/components/Wheel.jsx, THEN retuned)

Ported line-for-line, then **Jad retuned it today — these override the old
"session-locked 2026-07-10" values:**
- `MAXSTEER 0.13 → 0.20` (faster hover-steer)
- `DECAY 0.955 → 0.965` (flicks glide farther)
- **900ms hold-to-draw REMOVED.** Now tap-to-draw: tap gold-edged centered
  card = draw; tap a side card = seek-glide to center (`SEEK 0.14`);
  tap = ≤9px movement && <350ms (`TAP_MS`). Charge ring code fully deleted.
- Centered card affordance: border flips to gold at `near > 0.6`.
Unchanged: wash-shuffle (swirl entropy seeds Fisher-Yates — mulberry32,
golden-angle pile of 14), STEP .24, SNAP .16, DEADZONE .26, fan 750ms,
9px hold→drag conversion, edge resistance .85, reversal `Math.random()<0.3`
decided at draw.
Mobile: stage `touch-action` is phase-aware — `none` during wash (circular
gesture), `pan-y` once fanned. Haptic `vibrate(12)` on draw. Counter is an
absolute overlay inside the stage, top-right, gold ("N / 78 IN THE SPREAD",
"78 IN THE PILE" during wash) — it must be re-created on stage rebuild
(innerHTML wipe) — already handled.

## DATA PIPELINE (static pages ← React app data)

`/preview-zine-final/deck.json` and `channels.json` are generated from the
app's own sources (cards.js + lore.js merged; library.js + collections.js).
Regenerate with the extractor pattern (strip imports/exports, eval, emit JSON)
whenever app data changes — see conversation 2026-07-11 or rewrite in
`tools/extract_zine_data.mjs` (TODO below). Interpretation mapping:
symbolism→01 THE SYMBOL · pattern→02 THE PATTERN IT MAY REFLECT ·
journal→03 THE QUESTION TO SIT WITH · recode+affirmation→04 PRACTICE.
Card art: `../../art/<file>` (the deployed root /art). Card back:
`cardback.webp` (Jad's new plate, 169KB WebP, in preview-zine-final/).
Saved readings: localStorage key `mc-zine-readings`
({date, cardId, name, reversed, intention, saved}) — NOT yet unified with
the app's storage.js format.

---

## NEXT SESSION — THE WORK (in rough priority order)

0. **JAD'S ON-DEVICE EMBLEM VERIFICATION (blocks emblem sign-off):**
   Lab at ?debug=1 on desktop + phone: FPS (1767 desktop particles ≈2× the
   old count — the top question), drag feel (circuits yield, profiles+seal
   resist, star+keyhole planted), center-out reformation visible, ONE pulse
   + ONE haptic, both faces readable at 390px, scroll not trapped.
   Tuning levers if needed: region force table, PULL 1.45, reform threshold
   (peak≥4) — in the module ONLY, both routes stay byte-identical imports.
   NOTE: his first load may serve the OLD symbol from the v14 service
   worker — close tab / hard refresh once.
0b. **COPY RULINGS JAD OWES:** he never line-approved the V2 page copy
   (built verbatim from his pasted contract). Also: does the lab/zine copy
   ("fingerprint", "TOUCH THE MIND") need updating for the emblem? Copy
   changes are simple string edits; his approved lines only.
1. **DECISIONS JAD OWES (ask first, they gate everything):**
   a. Production architecture: rebuild the React app's shell in the zine
      system (keep app, reskin), or promote the static zine pages to be the
      product and embed/port app features into them? The correction doc
      says "keep existing application logic, replace its visual shell" —
      that means reskinning the React app is the stated intent.
   b. Root swap: when does /preview-zine-final/ (or its production version)
      replace the live root? Requires his explicit approval per standing order.
   c. Launch date — **RULED 07-11 session 3: the July 12 hard launch is
      CANCELLED.** Jad is spending all of July building the product fully;
      launch moves to August (specific date TBD — ask when launch prep
      starts, not before). Nothing is deadline-driven anymore; sequence for
      quality. Also ruled in principle: TWO NEW CHANNELS are coming —
      WELLNESS/HEALTH and BOOKS (video summaries of mind-programming reads).
      They ride the same collections.js/library.js data-model change already
      spec'd in item 2. A social-video automation pipeline (Reap clipping/
      captions/scheduling, optionally Activepieces orchestration, approval
      gate TBD) is wanted for the BOOKS videos — spec after the reskin.
   d. `/preview-codex/` ruling — three commits pushed from HIS account
      (jadf23, 10:36–10:37 on 07-11) with a complete particle experience.
      He never answered whether it's his parallel work. KEEP PARKED until ruled.
   e. Card art: **SETTLED = KEPT** (ruled 07-11 session 2). Only the cover
      changed. Do not regenerate the deck plates.
2. **Production reskin (the big one):** apply the zine system to the React
   app — TheField/landing replaced by the zine cover (with the EMBLEM — same shared module),
   Reflect/Wheel restyled (the Wheel component itself needs Jad's new
   retunes ported BACK into src/components/Wheel.jsx: MAXSTEER .20,
   DECAY .965, tap-to-draw replacing the 900ms hold), Recode/collections
   in the channels style, three primary channels with Peace + Confidence
   folded INSIDE collections (data model change in collections.js/library.js
   — spec'd in the correction doc).
3. **Storage unification:** static preview's `mc-zine-readings` vs app's
   storage.js daily/saved format — production must use the app's store.
4. **Launch prep redo for the new design:** OG image (the emblem or the
   card-back plate, 1200×630), meta description in zine voice, favicon
   (crosshair mark already inline in preview pages — promote it).
5. **Cleanup (ONLY after Jad's rulings):** `/preview/` (18MB art dup),
   `/preview-parity/`, `/preview-parity-2/`, `/preview-zine/` (superseded
   by -final), field-v5 branch + PR #1 (close or keep as record),
   preview-codex per ruling. Do not delete anything without his word.
6. **Hosting:** still GH Pages by his order ("neither for now"). Cloudflare
   Pages + mindcod.ing domain wait until the experience is approved.
7. **Write `tools/extract_zine_data.mjs`** so the deck/channels JSON
   regeneration is a committed script, not a conversation artifact.
8. **PAT policy (Jad's standing ruling, 07-11 session 2):** the fine-grained
   token stays LIVE until Jad decides to revoke it — his explicit call, do
   not nag about it. The token is supplied in the session-handoff prompt
   Jad pastes, NEVER committed to this repo (GitHub secret scanning would
   auto-revoke it on push, and it would live in history forever). Scope
   remains: contents+workflows, this repo only.

---

## PROCESS RULES (hard-won today — follow them)

- **Jad's screenshots are the render check.** The height:auto image bug was
  invisible to every static check and obvious in one screenshot. Ask for
  1440 + 390 screenshots at every visual gate; give him one-line-per-problem
  format.
- **Render 2D geometry before shipping it.** The whorl was rendered with PIL
  and VIEWED in-session before deploy (caught an edge-clipping issue). Any
  2D particle/layout math: render a PNG, look at it. This works; use it.
- **"Restyle, don't rebuild" protects the tuned interactions, not just data.**
  Two regressions today (auto-draw replacing pick-your-card; grid replacing
  the magnetic Wheel) came from preserving data/logic but discarding feel.
  The feel IS the product. Port physics verbatim, then let Jad retune.
- **Placeholders happen.** Twice now Jad's messages arrived with unfilled
  [brackets] or empty attachments. Verify content arrived before acting;
  quote back what was received.
- **Concurrency cancels push-triggered deploys.** Always dispatch deploy.yml
  after push AND confirm the success run is on the NEW sha — run 115 built
  the old commit while 116 got cancelled; re-dispatch was needed.
- **One-session rule:** foreign commits appeared once today (preview-codex,
  from Jad's own account). git pull --rebase reconciled cleanly (disjoint
  paths). Always `git log HEAD..origin/main` before pushing; stop and report
  if commits aren't yours.
- **Heredoc quoting:** escaped quotes inside python-in-bash heredocs killed a
  patch run silently before the write (all checks then failed against the
  unpatched file). Write engines/scripts to separate temp files; use
  `&#39;` entities in HTML attrs instead of escape gymnastics.
- **My sandbox cannot reach github.io** (egress 403 is the proxy, not the
  site). Deploy success = the Actions run conclusion, not a curl.
- Netlify egress domains still NOT allowed in the sandbox; Netlify MCP
  deploy-site still requires CLI egress. Irrelevant while GH Pages holds.

## ROUTE INVENTORY (as of 4fcfde1)

| Route | What | Status |
|---|---|---|
| `/` | Old FIELD v4 React app | LIVE, untouched, still the public root |
| `/preview-zine-v2/` (+ /draw/, /channels/) | **THE DIRECTION — V2 copy + emblem** | Active work |
| `/preview-symbol-lab/` | Emblem inspection bench (?debug=1) | Active work |
| `/preview-zine-final/` (+ /draw/, /channels/) | V1 zine journey (superseded by -v2) | FROZEN — do not touch |
| `/preview-zine/` | Zine gate 1 (superseded) | Park until ruling |
| `/preview/` | FIELD v5 build (18MB) | Park until ruling |
| `/preview-parity/`, `/preview-parity-2/` | EIDOLON parity stages | Park until ruling |
| `/preview-codex/` | Mystery push from jadf23 | DO NOT TOUCH — needs ruling |
| branch `field-v5`, PR #1 | v5 source | Keep intact per his order |

Last commits: `4fcfde1` (emblem integration, main HEAD) ← `ddbd3ef`
(mind-symbol-v2: V2 copy + symbol engine) ← `d64381b` (zine-pivot handoff)
← `296e512` (wheel retune) ← `d4a660b` (wheel UX).
Branches on origin: `mind-symbol-v2` (=ddbd3ef), `mind-emblem-v3` (=4fcfde1),
both merged into main — safe to delete after Jad's device sign-off.
