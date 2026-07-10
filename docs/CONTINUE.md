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
1. **14 remaining Minor Arcana (Wands only)**: canonical RWS scenes, ~2 credits each, cards.js + lore.js content. ✅ SWORDS DONE (2026-07-10): all 14 cards (art via courier + trigger-commit deploy, 13-field content, lore). Ids: aceswd, twoswd…tenswd, pageswd, knightswd, queenswd, kingswd. ⚠️ Pip COUNT VERIFICATION incomplete: Two–Five verified ✓; Six–Ten UNVERIFIED (sandbox image rendering went down mid-session) — verify blade counts on sixswd–tenswd at next session, fix surgically per playbook. Also flagged: Queen/King of Cups may be off-style (ivory background vs midnight deck) per user's live-site screenshot — confirm and regenerate if so (~4 credits).
✅ CUPS DONE (2026-07-10): all 14 cards (art via courier, 13-field content, lore). Ids: acecup…kingcup, same conventions as Pentacles. Pip counts two–ten VERIFIED ✓ (2026-07-10, incl. zoomed Nine/Ten).
✅ PENTACLES DONE (2026-07-09): all 14 cards (Ace–King) have art (art/<id>pent.webp via Art Courier), 13-field cards.js content, and lore.js entries. Card ids: acepent, twopent … tenpent, pagepent, knightpent, queenpent, kingpent. Court cards use numeral: "" (minors with art don't render the numeral plate). NOTE: the Art Courier pushes with GITHUB_TOKEN, which does NOT trigger the deploy workflow — after the courier commits art, push any real commit (or dispatch deploy.yml) to get the art live.
2. **Mechanics/UX session**: user was unhappy with current mechanics implementation (bottom-nav/native layer shipped but flagged for rework — "we need to figure out the mechanics" together). Do NOT assume current UX is approved.
3. Belief Recode tool (selection-based, static — designed, not built), Philosophy page, more spreads, per-card SEO URLs (big GEO opportunity).

## Security
- Previous fine-grained PAT was exposed in chat history — user must REVOKE and mint a fresh one (repo-scoped: mvpsites/mindcoding, Contents+Workflows RW) for each session.

## Pip-count playbook (learned 2026-07-09, Pentacles)
- Image models miscount pips ~30% of the time even with count-hardened prompts (exact totals + grouped arithmetic like "3 + 3 = 6, no more, no fewer" + fixed positions). Bake the arithmetic in anyway — it helps.
- VERIFY COUNTS YOURSELF: after the Art Courier commits, `git pull` and `view` each pip webp (2–10). Do not rely on the user to catch miscounts.
- FIX SURGICALLY, don't regenerate: extra coins/cups → cv2.inpaint (TELEA for flat sky, NS for foliage), r ≈ pip radius + 25 for glow. Missing → clone an existing pip (crop r+6, feathered circular alpha mask) and paste in a clean spot continuing the arrangement. Verify in-frame, save webp q82, commit public/art directly — a direct art push triggers deploy by itself (no courier, no trigger commit needed).
- Hough circles (cv2.HoughCircles, minR 35 maxR 70) locates coin-discs well but is noisy — classify candidates via cropped contact sheet. Cups/swords/wands are not circles; locate by eye instead.
