> **SUPERSEDED 2026-07-10 by docs/EXPERIENCE-SPEC.md (THE FIELD).** The wheel
> interaction spec below remains valid; the daily check-in loop and landing
> direction do not.

# PIVOT SPEC — 2026-07-10 · "Tool, not media site"

Jad stopped the SIGNAL asset build mid-session and redirected: the *idea* stays
(Mind Coding, decode/recode, MindOS language), the *execution model* changes.
The site was becoming a cinematic media brand (boot sequence, five-act scroll
story, lore to wander). It is now a **frictionless daily tool**. This document is
the product truth going forward; it supersedes PRODUCT-DIRECTION.md and UX-SPEC.md
where they conflict.

## The core loop: Check in → Mirror → Protocol

1. **Check in (one tap).** "Where is your head right now?" Seven feelings:
   anxious, stuck, heartbroken, unmotivated, overwhelmed, disconnected, lost.
   No quizzes, no journaling. (CheckIn.jsx · CHECKIN_FEELINGS)
2. **Mirror (instant readout).** The loop under the feeling + the belief
   reinforcing it, in plain language. "Not a diagnosis. Not a horoscope. A mirror."
3. **Protocol (the prescription).** One song, one reframe, one visualization,
   one narration for tonight — handed, not browsed. Plus "Pull a card on this"
   (deck as second door) and the mapped collection module.
4. History persists in localStorage (`mindcoding.checkins.v1`, capped 400).
   Returning visitors (≥1 check-in) skip the landing and open on Check-In
   (App.jsx initial-view logic). Future: trendline view from this history.

Feeling → collection routing: anxious/overwhelmed→health · stuck→abundance ·
heartbroken→love · unmotivated→confidence · disconnected/lost→spirit.

## What was cut (deliberately — do not resurrect without Jad)

- **Boot sequence** — friction on the most important screen.
- **Five-act hero's-journey scroll** — replaced by a 45-second explanatory landing.
- **Cosmos picker** (drifting-cards mechanic) — replaced by THE WHEEL. Cosmos.jsx deleted.
- **Door-panel gallery emphasis** — doors are one tap deep, not a destination.
  (5 SIGNAL door images were generated on Higgsfield before the pivot and sit
  unused in the library — jobs from 2026-07-10, style-ref a979bbbc. Usable later.)
- Ritual.jsx and Home.jsx were ALREADY dead code before this session (not imported
  anywhere). Ritual got the Wheel swap anyway in case it's revived as the daily pull.

## THE WHEEL — deck interaction system (Wheel.jsx)

Arrived at through five live prototype iterations with Jad on 2026-07-10.
The full ritual: **wash to shuffle → wheel to browse → hold to draw.**
(Wash-shuffle intro SHIPPED second post-pivot session: swirl entropy seeds a
mulberry32 Fisher–Yates; release fans the pile onto the wheel in 750ms.)

Locked interaction rules and tunings:
- All 78 cards on the wheel, face-down (card-back.webp), Fisher–Yates shuffled.
  Position counter "n / 78 in the spread". Only ~10 cards near center render
  (rest opacity 0) so perf is flat regardless of deck size.
- Geometry: STEP 0.24 rad between cards; R 235px mobile / 300px desktop;
  card 96×134 mobile / 118×165 desktop; center card lifts 16px and scales 1.12.
- **Mobile:** drag/flick. Momentum decay 0.955 per frame; magnetic snap eases at
  0.16 toward nearest STEP multiple; rubber-band at both deck ends (×0.85 overshoot).
- **Desktop:** hover-steer — bare cursor position drives spin. Dead zone: middle
  26% each side of center (so you can rest and hold). Quadratic speed curve,
  max 0.13 rad/frame at the rim (Jad-tuned: "much better" at ~2.5× the first cut;
  full deck crossable in ~2–3s). Drag also works. Touch devices never hover-steer.
- **Draw = press-and-hold 900ms** on the centered card. A cyan ring (r=60) charges
  around it; early release cancels; moving >9px converts the hold into a drag.
  On completion the card lifts out and `onPick(cardId)` fires.
- **Gesture robustness (bugfixes from Jad's live testing — keep all of these):**
  `setPointerCapture` on pointerdown (cursor leaving the stage mid-gesture froze v1);
  drag resumes after a draw without lifting (`e.buttons & 1` re-entry);
  rAF loop schedules FIRST and wraps the frame in try/catch so nothing kills it;
  window-level pointerup + blur handlers as escape hatches.
- Component interface is Cosmos-compatible: `pickedIds, onPick, done, hint` —
  used by Spread.jsx (all readings) and Ritual.jsx.

## Deck product decisions (from session)

- **Hold-to-draw is the commitment gesture** (symmetric ritual: hold to shuffle,
  hold to draw). Tap-to-draw rejected as ceremony-free.
- **3-card MindOS spread** maps slots to existing card data:
  Input (the installed belief → `card.lack`) · Pattern (the loop → `card.reveals`
  / `lore.pattern`) · Recode (the rewrite → `card.recode` + `action`).
  The current "Three Cards" spread (past/present/next) still exists alongside it.
  SHIPPED second post-pivot session as spread id "mindos" ('slots' meaning mode,
  noReversals, shareable result frame) — Jad greenlit it in his session brief.
- Shareable result frame SHIPPED (canvas 1080×1920, Web Share API + download
  fallback, gated by `shareable` on the spread config). Fate mode ("let the deck
  choose"), cut-the-deck jump, recurring-card memory ("The Tower again — third
  time this month") — discussed and liked; backlog, not built.

## Landing page

Jad's locked copy — see docs/LANDING-COPY.md. Implemented in Discover.jsx.
One scroll, six sections, single repeated CTA (Start Your Check-In), returning
visitors skip it entirely. SIGNAL hero video kept as backdrop; motion budget
otherwise spent on the check-in→mirror transition (future) not on scroll cinema.

## Next (in rough priority)

1. Jad phone-tests the deployed loop end to end (check-in, protocol, wheel draw,
   readings) — collect friction notes.
2. Wash-shuffle intro on the wheel (swirl the pile → release → fan onto wheel;
   swirl entropy seeds the Fisher–Yates).
3. "Input · Pattern · Recode" spread config + shareable result frame.
4. Founding batch content (4 songs, 4 narrations, 1 visualization, 1 Decode
   manifesto opening on the MINDOS boot lines — the boot lines live on as the
   manifesto's opening even though the UI boot screen is gone).
5. Check-in trendline view from localStorage history.
6. Card-back could get a SIGNAL-style regen to match the new direction (current
   card-back.webp is the gilded-era design) — Jad to decide.
