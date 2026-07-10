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
1. ✅ MINOR ARCANA COMPLETE — ALL FOUR SUITS DONE. WANDS DONE & COUNT-VERIFIED (2026-07-10): all 14 live (ids acewand…tenwand, pagewand, knightwand, queenwand, kingwand). Pips two–ten verified via zoomed crops — 9/9 correct, zero surgical fixes needed. User-directed regens during review: Seven (first draw had 6 — fixed with "row of 6 (3+3) + 1 held = 7" restructure), Eight (composition redo: strict parallel 45° ladder formation), Nine (composition redo as dignified sentinel + palisade; second regen fixed fence 9→8 with "2+2+2+2=8, not nine, not seven" forcing), Ten (first draw had 12 — fixed with fan-of-cards layout so all 10 tips countable in one arc), King (user wants NO salamanders/lizards — regenerated with hard "no animals of any kind" clause; keep this rule if King is ever redone). SW cache bumped to v6 with the content commit.
   ✅ SWORDS DONE & COUNT-VERIFIED (2026-07-10): all 14 cards live. Ids: aceswd, twoswd…tenswd, pageswd, knightswd, queenswd, kingswd. Nine was regenerated (first attempt drew 2 columns = 14 blades; layout-forcing prompt "ONE SINGLE VERTICAL COLUMN … ladder" fixed it). Six was regenerated (5 blades) then surgically corrected (regen gave 7): rightmost blade removed via cv2.seamlessClone(NORMAL_CLONE) of adjacent water + TELEA inpaint on the two residual edge strips — user-verified, then REPLACED with a user-provided clean render (sixswd is committed directly in public/art and its manifest entry is REMOVED so the courier can't overwrite it — never re-add sixswd to the manifest). The "off-style Queen/King of Cups" flag was a false alarm (stale cache, see below).
✅ CUPS DONE (2026-07-10): all 14 cards (art via courier, 13-field content, lore). Ids: acecup…kingcup, same conventions as Pentacles. Pip counts two–ten VERIFIED ✓ (2026-07-10, incl. zoomed Nine/Ten).
✅ PENTACLES DONE (2026-07-09): all 14 cards (Ace–King) have art (art/<id>pent.webp via Art Courier), 13-field cards.js content, and lore.js entries. Card ids: acepent, twopent … tenpent, pagepent, knightpent, queenpent, kingpent. Court cards use numeral: "" (minors with art don't render the numeral plate). NOTE: the Art Courier pushes with GITHUB_TOKEN, which does NOT trigger the deploy workflow — after the courier commits art, push any real commit (or dispatch deploy.yml) to get the art live.
2. ⚠️ PRODUCT REFRAME (2026-07-09, supersedes everything): MindCod.ing is now **Mind Coding** — a free cinematic self-reflection MEDIA platform (Music, Visualizations, Narrations, Tarot, Journeys). Tarot is ONE contained section, not the brand. READ docs/PRODUCT-DIRECTION.md IN FULL before any homepage/nav/UX work. Homepage, nav, and messaging must be de-tarot-ed. Development order per the doc: homepage reframe → nav → library structure → pillar categories → reusable YouTube content cards/detail pages → tarot-results-to-content recommendations → remove tarot-dominant messaging → scalable content manifest for hundreds of future items. Content is YouTube-hosted; the site is the curated layer. Do NOT rebuild tarot (it's done); contain it.
3. Earlier "recode loop" mechanics proposal (Today/Recode/active-beliefs) is NOT the plan anymore — elements may survive inside the tarot section (post-reading recommendations + journal prompts) per the direction doc.
4. Belief Recode tool, Philosophy page, more spreads, per-card + per-content SEO URLs (big GEO opportunity — now includes song/visualization/narration pages).

## Security
- Previous fine-grained PAT was exposed in chat history — user must REVOKE and mint a fresh one (repo-scoped: mvpsites/mindcoding, Contents+Workflows RW) for each session.

## PWA cache gotcha (learned 2026-07-10)
- The service worker (public/sw.js) is CACHE-FIRST for same-origin assets. Replacing an art file under the same filename does NOT reach users — they keep the cached version indefinitely (this is why "regenerated" Queen/King of Pentacles appeared unchanged). WHENEVER art changes under an existing filename, bump the CACHE version constant in public/sw.js (currently "mindcoding-v4") in the same commit. Users need up to two refreshes (install new SW, then serve fresh).

## Pip-count playbook (learned 2026-07-09, Pentacles)
- Image models miscount pips ~30% of the time even with count-hardened prompts (exact totals + grouped arithmetic like "3 + 3 = 6, no more, no fewer" + fixed positions). Bake the arithmetic in anyway — it helps.
- VERIFY COUNTS YOURSELF: after the Art Courier commits, `git pull` and `view` each pip webp (2–10). Do not rely on the user to catch miscounts.
- FIX SURGICALLY, don't regenerate: extra coins/cups → cv2.inpaint (TELEA for flat sky, NS for foliage), r ≈ pip radius + 25 for glow. Missing → clone an existing pip (crop r+6, feathered circular alpha mask) and paste in a clean spot continuing the arrangement. Verify in-frame, save webp q82, commit public/art directly — a direct art push triggers deploy by itself (no courier, no trigger commit needed).
- If sandbox image rendering is down (view returns empty placeholders), counts can often be verified NUMERICALLY: self-similarity template matching (crop one pip as template, cv2.matchTemplate TM_CCOEFF_NORMED > 0.6, cluster x-centers) counted sword blades reliably; morphological opening with long thin kernels finds horizontal/vertical blade structures; vertical-vs-horizontal Sobel energy ratio distinguishes blades from engraved water lines. Big miscounts with wrong LAYOUT (e.g. two columns instead of one) should be regenerated with layout-forcing prompts, not repaired.
- Hough circles (cv2.HoughCircles, minR 35 maxR 70) locates coin-discs well but is noisy — classify candidates via cropped contact sheet. Cups/swords/wands are not circles; locate by eye instead.
