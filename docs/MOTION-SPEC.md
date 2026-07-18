# MOTION-SPEC — the Motion+ pass · ruled 2026-07-17

> The law of every animated moment on mindcod.ing. Written and committed
> BEFORE implementation (Jad's instruction, 07-17). This is a MOTION LAYER,
> not a redesign: all content, functions, text, and layout stay intact.
> Implementation lands one phase per commit, Device Truth after each phase.

## THE FOUNDATION

- **Library:** Motion v12.42.2 (motion.dev, Motion+ tier purchased), vanilla
  JS UMD build exposing `window.Motion`. **Self-hosted** at
  `public/vendor/motion-12.42.2.min.js` exactly like the fonts — never a
  runtime CDN. Loaded `defer` on all 8 pages ahead of `scroll-life.js`.
- **Guarded everywhere:** every use is behind `window.Motion &&` — a missing
  or blocked bundle degrades to the current shipped static behavior, never
  to breakage. Canvas 2D remains the only way drawn graphics render; Motion
  drives *values*, never pixels.
- **THE REDUCED-MOTION LAW:** every moment below has a defined twin, gated
  by `prefers-reduced-motion`. The current shipped static site IS the
  reduced-motion experience — RM users see essentially what is live today.
  Never freeze mid-animation; twins are complete static states. Existing
  ruled RM behaviors (07-14 gate dissolve, 07-15 drag-binds-under-RM, the
  ticker's RM exemption) are law and must not regress.
- **Palette discipline:** gold `#D79A4A` is the primary motion accent, red
  `#FF2B06` stays reserved (the existing letterpress `.r` slam and telemetry
  reassert remain the page's red moments — this pass adds NO new red),
  bone `#EFE7D6` for text reveals. Nothing animates outside the
  two-inks-on-midnight system.

---

## PHASE 1 — THE UNLOCK (splash)

**Magnetic attraction** · trigger: pointer drag, key center enters 2.4× the
lock radius · the rendered key position blends toward the lock center with
pull strength `0 → 0.45`, eased quadratically as distance closes. Raw drag
offset tracked separately so the hand never loses authority.
**RM twin:** none — raw 1:1 drag exactly as shipped.

**Spring seat** · trigger: key overlaps the lock (same threshold as shipped)
· Motion spring on the key's offset to the exact lock center:
`visualDuration 0.45, bounce 0.3` — slight overshoot, settle. Then the
existing 90° key-turn tick (CSS `.13s cubic-bezier(.3,1.6,.4,1)`), +140ms.
**RM twin:** shipped path verbatim — instant dissolve, no seat, no turn.

**Beat of stillness** · 400ms hold after the turn settles. Nothing moves.

**The unveiling** · trigger: stillness elapses · `iris.open()` — the gold
light spills from the keyhole (the iris engine's own flare + bloom,
exponential ease ≈1.3s to swallow the frame). The gate's own background goes
transparent and the interior glow fades out over 500ms easeOut as the
aperture grows, so the SITE is revealed through the opening keyhole — an
unveiling, not a fade. Ask/hint/key fade 300ms. Gate removed on iris
`onOpen`; `mc:enter` fires as today.
**RM twin:** shipped 07-14 ruling verbatim: drag binds under RM (07-15
mobile ruling), unlock = instant dissolve, gate removed, no transition.

**Failsafes kept:** the 2.5s head hatch stays armed; the new choreography is
wrapped — any error falls through to immediate `finish()`.

---

## PHASE 2 — HERO INSTALL RESURRECTION (section 01, landing)

Runs ON TOP of the static hero: the markup is the final frame; the module
only conceals-then-reveals what exists. It never injects copy (SEO pipeline
untouched). Removed via PR #3 only because RM froze it — the fix is that
concealment now happens strictly inside the motion-mode branch.

- **Trigger:** after `mc:enter` (or immediately when the splash was already
  passed this session), section 01 entering the viewport ARMS: boot line 1
  visible with a blinking gold `▌` cursor. First pointer interaction with
  the section starts the install; if armed 4000ms with no interaction,
  autoplay. Plays once per session (`sessionStorage.mc_hero_played`).
- **Typing (the device-ruled 07-14 pacing, verbatim):** flat 40ms/char
  ±40% jitter · word-boundary pause 140–180ms (the space IS the pause) ·
  the 420ms "BE REAL … ISTIC." hesitation · 350ms inter-line gap · boot
  beat 0.8s. Beliefs type in bone.
- **Gold annotations:** each belief's forensic stamp slides in from the
  margin 150ms after its line completes: Motion `x 18→0, opacity 0→1`,
  spring `visualDuration 0.5, bounce 0.15`.
- **Status line resolves LAST:** `⚠ 6 PATTERNS ACTIVE — STILL RUNNING`
  blink-resolves (80ms double-blink, then settles at full opacity).
- **Skip is sacred:** once typing starts, pointerdown / wheel / touchmove /
  keydown SNAPS everything to the final static state.
- **Never-blank failsafes:** concealment only ever applied in motion mode;
  a 3s hatch force-reveals if the run stalls; any thrown error → final
  state. The section below the fold conceals invisibly.

**RM twin:** the module exits before touching the DOM — the current static
hero, unchanged, exactly as shipped.

---

## PHASE 3 — SCROLL LIFE (all 8 pages)

The existing scroll-life system (rise + fade with 70ms sibling stagger,
once per load; letterpress strikes; kick sweeps; drift) is KEPT as the
foundation — it already satisfies "sections reveal on scroll entry."
Additions:

- **Gold rules draw themselves** · trigger: a section heading's letterpress
  strike lands · an inserted `.sl-rule` (2px, gold) under `h2.big` /
  `h1.big` (not the masthead) draws `scaleX 0→1`, origin left, Motion
  spring `visualDuration 0.6, bounce 0` (a rule never overshoots), delay
  120ms after the strike.
- **Belief annotations below the fold** · where the install has already
  played or been skipped this session (notes statically visible), the six
  gold stamps become scroll-triggered: `x 18→0, opacity 0→1`, 90ms stagger,
  on section 01 entry. (Annotations exist only on the landing; when the
  Phase-2 install owns the section this pass stands down.)
- **Kept, untouched:** the 7s belief breathing pulse (`beliefRun`) and its
  existing RM exemption via CSS; the ticker keeps ITS RM exemption (runs
  under RM, as shipped and ruled).

**RM twin:** `scroll-life.js` exits entirely under RM (shipped behavior) —
everything visible immediately, no translation, no concealment. The new
rule elements render at full scale via CSS RM override.

---

## PHASE 4 — PILLAR TRANSITIONS

Between the five pillar roll pages ONLY (abundance · love · spirit ·
wellness · wisdom, nav within `/channels/<id>/`): a zine page-flip so
midnight persists and navigation feels continuous. Everything else keeps
the keyhole nav-iris (ruled 07-12).

- **Decision:** the cross-document View Transitions API is REJECTED for
  this build — Firefox has no support (those visitors would get a broken
  mixed model) and it stacks unpredictably with nav-iris's click
  interception. Motion-driven exit/enter is deterministic everywhere.
- **Exit** · trigger: plain left-click on a sibling pillar link (same
  qualification rules as nav-iris) · body `opacity 1→0, x 0→∓24px`, 240ms
  `ease [0.22,0.9,0.3,1]`, then navigate. Direction: toward a higher pillar
  № the page slides left (turning forward); lower, right.
- **Arrival** · the existing `mc-nav` pre-paint overlay blanks the paint;
  body pre-set to `opacity 0, x ±24px`; overlay drops; Motion enter to
  identity, 320ms same ease; `mc:enter` fires for scroll-life.
- **Midnight persists:** roll pages gain `html{background:var(--paper)}`
  so no flash under the body fade (invisible change otherwise).

**RM twin:** instant navigation — the pillar lane exits under RM exactly
where nav-iris already does; shipped behavior.

---

## PHASE 5 — SIGNATURE PHYSICS

- **Programmed Self emblem** · the pointer position feeding the field is
  spring-smoothed through Motion motionValues (`visualDuration 0.30,
  bounce 0.22`) — the stir gains elastic lag and whip. Motion drives the
  values; Canvas 2D still renders every pixel. The Jad-tuned `BEHAVIOR`
  constants and `DRAG_AUTHORITY` are UNTOUCHED (AGENTS.md §4).
  **RM twin:** direct pointer, shipped behavior (touch still binds under
  RM per the 07-15 ruling; idle choreography still exits).
- **Tarot wheel** · **NO CHANGE.** Real inertia on flick (`DECAY .965`)
  and magnetic snap to cards (`SNAP .16`) are ALREADY the shipped,
  session-locked, Jad-tuned physics (AGENTS.md §4 — "never retune"). The
  ask is the live behavior; a retune requires Jad's explicit ruling.
  **RM twin:** identical — current shipped behavior for both modes.

---

## QA GATE (every phase)

Device Truth on iPhone 390×844 + desktop 1440×900, BOTH reduced-motion
modes: console errors, overflow, tap targets, key drag must unlock, emblem
must respond. `device-truth.spec.mjs` gains, in the same PR: (a) section 01
must end with all six beliefs, their notes, and the status line fully
visible in BOTH motion modes; (b) pillar→pillar navigation must land with
body at full opacity. Service worker bumped every phase commit. Full gate
(§7 AGENTS.md): build + generate + link check + `node --check` on every
touched engine.
