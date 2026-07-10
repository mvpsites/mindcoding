# CONTINUE — Mind Coding session handoff

## ═══ START HERE (updated 2026-07-10, second post-pivot session) ═══

**Direction unchanged since the pivot — docs/PIVOT-SPEC.md is still product truth.**
Frictionless daily tool: Check in → Mirror → Protocol, deck as second door via
THE WHEEL. Landing copy locked (docs/LANDING-COPY.md).

**Shipped this session (commit on main, deployed via deploy.yml):**
- **Wash-shuffle intro on THE WHEEL** (Wheel.jsx) — the full ritual is now live:
  wash → wheel → hold-to-draw. Opens each fresh reading as a swirling pile
  (14 visible cards, rest opacity-0 for flat perf); swirling accumulates gesture
  entropy (xorshift mix of pointer deltas) that seeds a mulberry32 Fisher–Yates —
  the user's hands literally shuffle the deck. Release fans the pile onto the
  wheel (750ms, hidden cards snap to pile-center first so nothing flies in from
  origin). Tap-without-swirl still fans (nobody gets stuck). ALL locked wheel
  tunings untouched — wash is a pre-phase branch in tick()/handlers only.
  Verified numerically: seeded shuffle deterministic, permutation-valid, card-0
  lands on all 78 positions across 2000 seeds, entropy gesture-sensitive.
- **"Input · Pattern · Recode" spread** (id: mindos, 2nd in the readings list) —
  new `slots` meaning mode: per-position card fields (Input→`lack` rendered in
  quotes, Pattern→`reveals`, Recode→`recode`), `noReversals` (slot fields aren't
  orientation-dependent), recodeFrom: 2. All 78 cards verified to carry all three
  slot fields. Mechanism is generic — any spread can adopt slotFields.
- **Shareable result frame** (src/lib/shareframe.js + Share button in Spread.jsx,
  gated by `shareable: true` on the spread config — currently mindos only).
  1080×1920 canvas PNG in SIGNAL tokens (awaits document.fonts): wordmark,
  positions+card names, THE RECODE, affirmation, hero line + mindcod.ing footer.
  Web Share API with download fallback; layout fits up to 5 slots.
- **Founding batch scripts** — content/scripts/ 01–10 + README: 4 Suno-ready
  songs (style prompts + full lyrics), 4 narration VO scripts with pause markers,
  the 12-min visualization, and the Decode manifesto opening cold on the MINDOS
  boot lines (recovered from git fbfe7ff — the boot lives on as the manifesto
  opening). README has delivered-duration estimates; correct library.js durations
  when ytIds are filled, don't pad scripts.
- SW cache bumped to v10.

**NOT done this session:** Jad's phone-testing notes on the deployed pivot loop
(the priority-1 slot) were an empty placeholder in his message — still owed.
When they arrive they outrank everything below.

**Priorities for next session:**
1. Jad's phone-testing verdict — now includes the wash-shuffle and share frame.
2. Produce the founding batch (Suno → VO → audiogram → YouTube → fill ytId,
   set status:"live", fix duration) — scripts are ready in content/scripts/.
3. Check-in trendline from localStorage history (`mindcoding.checkins.v1`).
4. Backlog from PIVOT-SPEC: fate mode, cut-the-deck, recurring-card memory;
   card-back SIGNAL regen (Jad to decide).

**Superseded / parked:** unchanged — 5 SIGNAL door panels sit unused in the
library (style-ref a979bbbc); doors demoted, not deleted.

## Operating rules (unchanged)
- One session on this repo at a time — if you see commits you didn't make, STOP
  and reconcile with Jad before proceeding.
- Verify visually/numerically before pushing (build must pass; smoke-test dist
  over HTTP; count checks on data).
- Dispatch deploy.yml after any push (and after any courier run).
- Art is self-hosted in public/art via the Art Courier (tools/fetch_art.py +
  art-manifest.json). NEVER hot-link CloudFront — it expires and the sandbox
  can't reach it. Courier skips existing files; delete the webp to force refetch;
  bump the SW CACHE version whenever art changes under an existing filename.
- nano_banana_pro (nano_banana_2), 4:5 for card-format art; count-hardened
  prompts + visual pip verification for any pip cards.

## Background docs
- docs/PIVOT-SPEC.md — product truth (2026-07-10). Wins all conflicts.
- docs/LANDING-COPY.md — locked landing copy.
- docs/PRODUCT-DIRECTION.md, docs/UX-SPEC.md — historical context from the
  SIGNAL/MindOS era; still useful for brand voice and collection definitions,
  superseded on structure/UX by PIVOT-SPEC.md.
- docs/artwork-prompts.md — SIGNAL art prompt patterns (still the style for any
  new imagery).
