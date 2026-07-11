# THE FIELD — Master Experience Spec
**Status: PRODUCT TRUTH as of 2026-07-10 (evening). Supersedes PIVOT-SPEC.md and
all prior landing/loop direction. Approved by Jad in session. Build day: 2026-07-11.
Launch: 2026-07-12 (Project Avalon thread).**

---

## 1 · Concept

One continuous field of ~4,096 gold grains on a midnight ground. The grains are
the visitor's mind. Invisible attractors — inherited programs — give the grains
their shape. Across six states the visitor watches their mind take forms it never
chose, tries to change it by force and fails measurably, then changes it by held
attention and succeeds physically. The field finally condenses into the product
itself: the deck's card back, assembled particle by particle, above the Mind
Recoding Programs catalog.

**Positioning (Jad, locked):** Mind Coding is level-agnostic — the layer beneath
material gains, love, and spiritual growth alike. The page never preaches
renunciation and never guarantees outcomes in copy. The mechanism makes the
promise: *whatever you hold, the field arranges itself around.* The demonstration
IS the claim.

**The interaction thesis:** force moves the grains, only the pattern beneath
moves the mind. Movement III makes visitors fail measurably (PROGRAM CHANGE 0%).
Movement IV makes them succeed physically (press and remain → coherence → bloom).
Movement V hands them the instrument their own hands assembled.

**Creative north star:** *EIDOLON is a museum of forms reconstructed from dust.
MindCod.ing is a chamber where the visitor discovers what gives the dust its
form.* Museum restraint, editorial typography, telemetry as honesty, no glowing
chakra clichés, nothing that smells like an ad.

**What dies:** the daily check-in loop (CheckIn.jsx flow), the current Discover
landing, the "frictionless daily tool" frame.
**What survives untouched:** THE WHEEL (wash → browse → hold-to-draw, all locked
tunings), the deck, spreads incl. mindos, share frame, founding-batch scripts
(repositioned as Mind Recoding Programs), memory/archive.

---

## 2 · Design language

### Tokens (deck-derived + OBOLUS)
| Token | Value | Role |
|---|---|---|
| --ink | #070B1A | page ground (midnight blue-black; meta theme-color) |
| --ink-deep | #04060F | field canvas ground / gradients |
| --gilt | #C9A96A | grains, rules, primary accent |
| --gilt-bright | #E8CB8F | grain flare (recapture, coherence lock-in) |
| --gilt-dim | rgba(201,169,106,.38) | hairlines, inactive rules |
| --oxblood | #5A1F24 | rare accent only: the fracture, PROGRAM CHANGE readout |
| --bone | #EFE9DA | display serif headlines |
| --mist | #8B93A8 | body copy (muted blue-gray) |
| --plaque | rgba(7,11,26,.86) | mobile copy band backing |

Existing --gold* token names get these values (SIGNAL cyan dies everywhere; the
wheel ring, nav, buttons inherit gilt automatically via tokens, then hand-check).

### Type trio
- **Display (the voice):** Cormorant Garamond 500/600 — bone, large, tight
  leading. Headlines only. (Engraved, literary, deck-era.)
- **Body:** Outfit 400 (already loaded) — mist, max 34ch on mobile plaques.
- **Machine (telemetry):** IBM Plex Mono 500 — gilt, letterspaced .12em, 12–13px.
  ALL movement labels, inscriptions, readouts, counter.
- No uppercase display; uppercase lives in mono only.

### Header (fixed, minimal)
Left: `● MINDCOD.ING` (breathing gilt point, 4s cycle). Right: `00 / 05` counter,
advances as each movement takes the field. Desktop center: `THE FIELD OF
ATTENTION · ACTIVE SIGNAL`. Nothing else. Existing site nav appears only on
inner pages (deck, programs), not on the field.

### Mobile composition (EIDOLON rule)
Field: upper ~58vh, fixed canvas. Copy plaque: lower band, --plaque backing with
soft top fade. Headlines ≤7 words on screen; body ≤2 short sentences per beat.
Each movement ≈150–170vh of scroll. Interaction zone is the field band only.

---

## 3 · Particle engine (canvas 2D — NO Three.js, no WebGL)

- **One buffer, morphing homes** (EIDOLON's trick, CPU form): per grain
  `home(x,y)`, `dust(x,y)`, `seed`, `flare`. A global `assembly` + per-movement
  attractor sets write `home`; grains spring toward home with seed-staggered
  strength; a cheap 3-term sine curl gives idle drift; cursor/touch applies a
  Gaussian tangential shove (EIDOLON's stir).
- **Counts:** 4,096 grains desktop, 2,600 mobile (device-memory / width gate).
  r 0.6–1.2px, gilt with alpha by seed; flare lerps to gilt-bright and decays.
- **Perf budget:** single rAF, one canvas, additive-ish via globalAlpha (no
  shadowBlur — it kills mobile). Target 60fps desktop / stable 40+ on a mid
  phone; auto-degrade to 1,800 grains if frame > 28ms for 60 consecutive frames.
- **Scroll driver:** movement index + local progress from scroll position
  (IntersectionObserver + scrollY mapping). All morphs are `home` rewrites +
  assembly eases — never teleports.
- **prefers-reduced-motion:** grains render static at each movement's final
  form; scroll crossfades between stills; interactions become instant-state
  swaps. Full copy intact.
- **No-JS / crawler fallback:** semantic HTML of all copy renders regardless;
  canvas is progressive enhancement. (Prerender standard applies — this page
  must be crawler-visible like everything MVP ships.)

### Shape sources
1. **Equations (runtime):** fractured mandala, helix, phyllotaxis — computed.
2. **Stencils (offline, build-day step 1):** car, dollar sign, heart, card back.
   Pipeline: procedural silhouettes → `tools/sample_stencil.py` (new)
   rasterizes and rejection-samples N points → JSON arrays shipped in bundle.
   Card back stencil is procedural (rounded border + rosette), echoing the
   existing CardBack component. Stencil style rule: iconic, hieroglyphic,
   archetypal — never consumer objects.

### The attractor math (locked)
- **Fractured mandala (Mv I end → III):** 6-fold radial figure, polygonal rings
  + straight spokes (imposed order = straight lines). Sextant k=4 rotated +4°
  with 6% radial decay and per-grain jitter ×1.8 — "almost beautiful, one arm
  bent." Fracture grains tint 12% toward oxblood.
- **Recapture wave (III):** on release after a tear, homes reassert
  center-outward at 480px/s; each grain flares (gilt-bright, 300ms decay) the
  frame it's recaptured. Iron-filings snap, not a soft ease.
- **Helix (IV mid):** conical spiral from hold point: θ=t·9π, r=(1−t)·R·0.4,
  y=lerp(holdY, crownY, t), grains assigned by seed order.
- **Phyllotaxis lotus (IV end):** golden angle 137.507°, r=c·√n, built in index
  order center-outward (the bloom *grows*). Petal shading: alpha by ring band.
  Completed bloom breathes at **6 cycles/min** (0.1Hz — heart-coherence rate),
  scale ±2.5%.
- **Card condensation (V):** outer lotus rings straighten into a rounded-rect
  border; interior grains take card-back stencil homes; when assembly ≥ .97 the
  real cardback image crossfades in over its particle ghost (1.2s).

### Telemetry (honest, computed — never faked)
- `DISPLACEMENT n%` = live share of grains > 14px from home.
- `PROGRAM CHANGE 0%` = attractor set delta — literally zero during III; the
  label is oxblood, the only oxblood text on the page.
- `COHERENCE n%` = hold-phase assembly toward the new attractor, quantized to
  read as 12% … 47% … 81% … 100% steps at thresholds.

---

## 4 · The six states — choreography + FINAL COPY

Counter states 00→05. Mono labels verbatim. Display lines verbatim (line breaks
as written). Body copy verbatim. Nothing added on build day without Jad.

### 00 · THE FIELD (hero)
*Particles:* pulled-in-a-thousand-directions: 5–7 weak roaming attractors tug
subfields; clusters *almost* form figures (2s ghost-coalesce, dissolve). Cursor
wake active from first frame. No instructions.
*Inscription (mono):* `AN EXPERIMENT IN CONSCIOUS ATTENTION`
*Headline (locked hero):*
> **Your mind is being programmed every day.**
> **Choose what gets installed.**
*Subline:* Not by accident. By design.
*Bottom cue (mono):* `descend into the field` + thin gilt line pulsing down.

### 01 · MOVEMENT I — THE INSTALLED DESIRES
Label: `MOVEMENT I · THE INSTALLED DESIRES`
*Particles:* grains converge into four archetype stencils in sequence (~22%
scroll each), morphing form to form, each slightly ragged (inherited, not
chosen). SYMBOLS ARE ARCHETYPES, NEVER CONSUMER OBJECTS (Jad, locked):
1. **Crown** — body: *You were shown what success looks like.*
2. **Coin** — body: *You were taught what safety requires.*
3. **Heart** — body: *You learned what it means to be chosen.*
4. **Flame** — body: *You inherited even your idea of the sacred.*
Then all four dissolve into the **fractured mandala**.
*Headline over the mandala:*
> **Eventually, the program**
> **began speaking in your voice.**
*Inscription:* `inherited pattern · attractor established`

### 02 · MOVEMENT II — THE PROGRAM BENEATH
Label: `MOVEMENT II · THE PROGRAM BENEATH`
*Particles:* mandala holds; slow rotation; the bent sextant subtly strains.
*Headline:*
> **The thought is visible.**
> **The program is not.**
*Body:* A thought repeated becomes a belief. A belief repeated becomes a
direction. A direction repeated becomes a life.
*Inscription:* `4,096 grains · one governing pattern`

### 03 · MOVEMENT III — THE RETURN (the proof)
Label: `MOVEMENT III · THE RETURN`
*Headline (before interaction, nothing else):*
> **Try to break it.**
*Particles:* any pointer/touch crossing the field tears it — grains flee in a
wide wake, momentary void. On settle: **recapture wave**, and the pattern that
reforms CYCLES — mandala → heart → coin → crown → mandala (destroy the thought,
the program prints another).
*Telemetry (mono, live, under the field):*
`DISPLACEMENT 84%` (live value) · `PROGRAM CHANGE 0%` (oxblood)
*Copy revealed only after first full reform:*
> **You moved the grains.**
> **Not what calls them back.**
*Body:* You can reject the thought. The program keeps producing another one.
That is why force fails. That is why January fails.
*Then — THE HINGE (full-viewport beat, field nearly still, dimmed):*
> **If your thoughts are shaping your life,**
> **who shaped your thoughts?**
(No label, no telemetry, no cue. Longest quiet on the page.)

### 04 · MOVEMENT IV — ENTRAINMENT (the ascent)
Label: `MOVEMENT IV · ENTRAINMENT`
*Opening lines:*
> **Do not push.**
> **Introduce another order.**
*Instruction (mono):* `press and remain`
*Particles — one continuous hold, three phases:*
- **Phase A · Healing (coherence 0→30%):** faint ghosts of car/dollar/heart
  surface once and dissolve (desires released from their meanings — 4s total);
  the bent sextant rotates back into true. Quiet on purpose.
- **Phase B · Rising (30→65%):** healed figure turns and lifts; grains stream
  into the conical golden helix climbing from the hold point.
- **Phase C · Blooming (65→100%):** helix unfurls at the crown into the
  phyllotaxis lotus, opening center-outward in growth order; on 100% the bloom
  locks with a full-field flare and begins the 6/min breath.
*Telemetry:* `SIGNAL DETECTED` → `COHERENCE 12% … 47% … 81% … 100%`
*Early release:* coherence decays ~2×  build rate; column sinks back toward the
mandala. The page demands ~6 held seconds. Ceremony, not friction.
*Line at lock:*
> **Hold the signal until**
> **the field remembers differently.**

### 05 · MOVEMENT V — THE CHOSEN SIGNAL
Label: `MOVEMENT V · THE CHOSEN SIGNAL`
*Particles, beat 1 — the symbols return, authored:* the coherent field re-forms
crown → coin → heart → flame once more, now crisp, whole, bright (chosen, not
installed). Channel mapping: coin=ABUNDANCE, heart=LOVE, crown=CONFIDENCE,
flame=SPIRIT; PEACE is the coherent field itself (say so in the strip). Copy across the three:
> **A coherent mind can be pointed anywhere.**
*Body:* Code it for abundance, and the field arranges around abundance. Code it
for love, and it arranges around love. Code it for awakening, and it arranges
around that. The same desires. This time, yours.
*Particles, beat 2 — condensation:* bloom/symbols contract into the **card
back**, particle-built, then the real card image crossfades in.
*Headline:*
> **First, see the thought that has been shaping you.**
> **Then choose the one that shapes what's next.**
*Pathways (editorial links, thin gilt rules that draw outward on hover/touch —
NO buttons):*
`ENTER THE DECK` → /deck (the Wheel)
`MIND RECODING PROGRAMS` → /programs

### Below the field · THE PROGRAMS STRIP
Mono eyebrow: `MIND RECODING PROGRAMS · chosen thoughts, repeated until they hold`
Five **channels** mapping to the founding batch (existing LIBRARY collections):
`ABUNDANCE · LOVE · PEACE · CONFIDENCE · SPIRIT`
Each channel: serif title, one line, count of programs, gilt rule. Catalogue
register (OBOLUS), never cards/thumbnails grid. Links to /programs filtered.
Footer: minimal — wordmark, deck, programs, contact.

---

## 5 · Interaction risk plan (named, decided now)

**The Movement III mobile conflict:** vertical swipe = scroll. Resolution:
- The tear triggers on ANY touch/pointer whose path crosses the field band
  during natural scrolling — no special gesture requested, so the proof happens
  for free while they scroll. Desktop cursors have zero conflict.
- The field band never calls preventDefault on vertical moves; scrolling is
  never hijacked.
- Fallback (pre-approved, use only if the free-tear reads weak on Jad's phone
  pass): a contained `disturb the field` zone — horizontal-swipe affordance
  inside the band, mono-labeled.
**Movement IV hold vs. scroll:** `press and remain` targets the field band;
touchstart+stationary ≥250ms enters hold mode (then preventDefault while held);
movement >12px before 250ms = scroll, never captured. Desktop: mouse-down hold.
**iOS Safari:** no 100vh units (use dvh + JS fallback); passive listeners
except during confirmed hold.

---

## 6 · Information architecture

- `/` — THE FIELD (this spec).
- `/deck` — the Wheel + spreads (existing, gilt re-token pass only).
- `/programs` — Mind Recoding Programs: five channels, items from LIBRARY
  manifest (founding batch; ytIds filled as produced). Replaces the old
  Discover/library presentation.
- `/archive` — saved readings (existing).
- Check-in routes removed; redirects to `/`.

---

## 7 · Build plan — 2026-07-11 (one session)

1. Stencil pipeline: `tools/sample_stencil.py`, generate crown/coin/heart/
   flame/cardback point JSONs. Eyeball render of each (montage PNG).
2. Token flip + type trio (Cormorant via fonts, weights 500/600 only).
3. Field engine: buffer, curl, spring, stir, scroll driver, degrade ladder,
   reduced-motion stills.
4. Movements 00→05 choreography + all copy (verbatim from §4), header/counter,
   plaque bands.
5. Telemetry components (live math, mono).
6. Movement III tear + recapture wave + symbol cycling; Movement IV hold state
   machine (A/B/C phases, decay); Movement V condensation + crossfade + links.
7. Programs page (channels) + routes + redirects; wheel/nav gilt hand-check.
8. Verification: numeric (attractor deltas, coherence curve, fps trace at
   4,096/2,600/1,800), visual (screenshots at 390 + 1440 per movement,
   reduced-motion pass), copy diff against §4 verbatim.
9. SW cache bump, CONTINUE.md update, push, deploy dispatch, live URL to Jad
   for the phone pass.
Cut-line if the day runs long (pre-agreed): the programs page ships as a single
channel list without filtering; the hinge beat and telemetry are NOT cuttable.

## 8 · Launch — 2026-07-12
Jad's phone pass → fixes → OG image (lotus frame still, 1200×630, gilt on ink)
→ meta description update → Avalon thread (Jad writes; page must stand cold on
mobile from a forum link — first paint < 2s on 4G is the gate).
