# MindCod.ing — Session Handoff Brief

**Live:** https://mvpsites.github.io/mindcoding/ · **Repo:** mvpsites/mindcoding (private)
**Stack:** Vite + React, GitHub Pages via Actions (deploys on push to main). PWA installed via manifest + sw.js.

## Approved design (locked — do not re-litigate)
- **Face style anchor:** The Hierophant — bold antique gold engraved linework on midnight (#0A0E23), bone-ivory flesh/highlights, oxblood only in shadow recesses, ceremonial composition. Higgsfield job `968a03c0-51ad-4096-a68f-f7197dcc4fa7`; committed file `public/art/hierophant.webp`.
- **Card back:** user's dual-profile brain-keyhole design, `public/art/card-back.webp`.
- **Option A titles:** artwork is full-bleed and WORDLESS; the app typesets name + numeral (CardFace.jsx title plate). Generation prompts must forbid text/letters/numbers/borders/frames.
- **Master generation recipe:** model `nano_banana_pro`, aspect 4:5, reference the Hierophant job (or hierophant.webp re-uploaded), prompt = style block + canonical RWS scene + "NO text, NO letters, NO numbers, NO borders, NO frames, NO watermark."

## Art pipeline (works, use it)
1. Generate on Higgsfield → collect job URLs via show_generations.
2. Add entries to `tools/art-manifest.json` (`"cardid": "url"`).
3. Push — the **Art Courier** workflow downloads on GitHub runners, converts to 720px webp in `public/art/`, commits; that commit auto-deploys. Sandbox can NOT fetch CloudFront directly; the courier is the workaround.
4. All art must be self-hosted in repo (standing rule).

## Data conventions
- `src/data/cards.js`: 13 fields per card (energy, upright, reversed, love, career, money, spiritual, reveals, lack, recode, affirmation, journal, action) + `art` path. Names/numerals are canon-verified RWS (Strength=VIII, Justice=XI, "Judgement", six no-"The" titles, Pentacles suit, Page/Knight/Queen/King).
- `src/data/lore.js`: long-form per card — `symbolism` (The Card), `pattern` (The Pattern), `recodePath` (Living the Recode), ~240 words/card, second person, warm-direct voice, no fluff.

## Remaining work (in order)
1. **56 Minor Arcana**: generate suit-by-suit (Pentacles → Cups → Swords → Wands), canonical RWS scenes, ~2 credits each. Write cards.js content + lore.js for each. Five of Pentacles content already exists (needs art).
2. **Mechanics/UX session**: user was unhappy with current mechanics implementation (bottom-nav/native layer shipped but flagged for rework — "we need to figure out the mechanics" together). Do NOT assume current UX is approved.
3. Belief Recode tool (selection-based, static — designed, not built), Philosophy page, more spreads, per-card SEO URLs (big GEO opportunity).

## Security
- Previous fine-grained PAT was exposed in chat history — user must REVOKE and mint a fresh one (repo-scoped: mvpsites/mindcoding, Contents+Workflows RW) for each session.
