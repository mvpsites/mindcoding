# CONTINUE — Mind Coding session handoff

## ═══ START HERE (updated 2026-07-10, post-pivot session) ═══

**THE DIRECTION CHANGED TODAY. Read docs/PIVOT-SPEC.md before anything else.**

Jad stopped the SIGNAL asset build and pivoted the product from cinematic media
site to **frictionless daily tool**: Check in → Mirror → Protocol, with the deck
as the second door. The idea (Mind Coding, decode/recode, MindOS language) stays;
the boot sequence, five-act scroll story, and Cosmos picker are gone. The landing
page is Jad's own locked copy (docs/LANDING-COPY.md). The deck is now THE WHEEL —
wash/spin/hold-to-draw — spec'd to the pixel in PIVOT-SPEC.md after five live
prototype rounds with Jad.

**Shipped this session (commit on main, deployed via deploy.yml):**
- New landing (Discover.jsx) — Jad's copy verbatim, one CTA: Start Your Check-In.
  New hero line RE-LOCKED: "Your mind is being programmed every day. / Choose
  what gets installed."
- CheckIn.jsx — 7 feelings → mirror copy → protocol (song/reframe/visualization/
  narration from LIBRARY by collection) + deck link. History in localStorage;
  returning visitors land on Check-In, not the landing.
- Wheel.jsx — replaces Cosmos everywhere (Spread.jsx readings + dead Ritual.jsx).
  All 78 cards, drag/flick mobile, hover-steer desktop (dead zone 26%, quad curve,
  max 0.13 rad/frame — Jad-tuned), hold-to-draw 900ms ring, pointer-capture
  hardening. Cosmos.jsx deleted.
- Nav: "Check In" replaces "Discover" in top tabs and bottom nav (logo still goes
  to the landing). SW cache bumped to v9. Meta description updated to new line.

**Priorities for next session (Jad's phone testing verdict comes first):**
1. Fix anything Jad flags from testing the deployed loop.
2. Wash-shuffle intro on the Wheel (spec in PIVOT-SPEC.md).
3. "Input · Pattern · Recode" 3-card spread config + shareable result frame.
4. Founding batch content scripts (4 songs, 4 narrations, 1 visualization,
   1 Decode manifesto opening with the MINDOS boot lines, narrated).
5. Check-in trendline from localStorage history.

**Superseded / parked:** the 5 SIGNAL door-panel regens (images were generated on
Higgsfield 2026-07-10 pre-pivot, style-ref job a979bbbc-2316-4a2e-b061-a08636a144e3;
they sit unused in the library). Doors are demoted, not deleted. The old five-act
copy is preserved in git history if any line is wanted later.

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
