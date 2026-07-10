

## SESSION UPDATE — 2026-07-10 (cinematic pass + cosmos shuffle)
- **Cosmos shuffle shipped:** Shuffle button gathers all 78 to a center stack (glow rises + flares), re-deals while stacked, scatters with staggered ripple. Timing consts GATHER_MS/SCATTER_MS in Cosmos.jsx; keep in sync with the .8s left/top CSS transition.
- **Cinematic motion system shipped (src/lib/motion.jsx + CSS block "CINEMATIC MOTION SYSTEM" in styles.css):**
  - `Reveal` — shared-IntersectionObserver scroll entrance (opacity+translateY), per-child stagger via delay prop → --rvd. Used across Discover/Decode/Recode.
  - `MaskLines` — hero headline lines rise out of overflow clips on mount (page-load choreography with eyebrow tracking-in, sub/CTAs staggered via .mc-herolate --d).
  - `ScrollIgnite` — SIGNATURE: scroll-linked word-by-word ignition of the brand premise on Discover ("What you repeatedly listen to… shape how you live." — last 4 words gold via :nth-last-child).
  - Foil headline has an infinite 9s gold specular sweep; nebula parallax layers in Ambient.jsx (rAF, nebula -0.1x / stars -0.045x); nav deepens on scroll (mc-nav-scrolled, state in App.jsx); view transitions .62s; card cover light-sweep on hover; hero is full-viewport (100svh minus chrome).
  - ALL entrance motion gated behind prefers-reduced-motion: no-preference — content never hidden without JS/with reduced motion. 2D transforms + opacity only (Safari rules hold).
- Visually verified via Playwright (/opt/pw-browsers chromium works in sandbox; serve `vite preview`, base "./" → use localhost:4173/ root).




## SESSION UPDATE 5 — 2026-07-10 (VIDEO + full cover art — the mvpsites treatment)
- **Living hero shipped**: 10s cinematic video generated from the hero still (kling3_0_turbo image-to-video, job 3624ff7f; when a prompt matches a Higgsfield preset, retry with declined_preset_id to generate literally). Self-hosted via courier: vid-hero.mp4 (658KB h264) + vid-hero.webm (427KB vp9). HeroMedia component in Discover.jsx: poster=scene-hero.webp, autoplay/muted/loop/playsinline, onError→still fallback, skips video for reduced-motion/Save-Data, TOUCH-WAKE (one-time pointerdown/touchstart play() for iOS Low Power Mode — mvpsites pattern).
- **Courier now handles video**: manifest ids starting "vid-" → ffmpeg → 1280w mp4 (crf27) + webm (vp9 crf37); workflow installs ffmpeg. Courier triggers ONLY on manifest path changes — dispatch fetch-art.yml manually otherwise.
- **All 12 library items have real cover art** (10 new: cov-song-*, cov-narr-*, cov-dec-* in manifest → public/art). No more empty gradient/"glyph" cards.
- **SANDBOX LEARNING: Playwright chromium has NO H.264** (canPlayType avc1 = ""); mp4 "failure" in sandbox = codec, not code. webm added partly so playback is verifiable in-sandbox. Real Safari/Chrome/Edge play the mp4 fine.
- Verified: video playing, looping, currentTime advancing in sandbox via webm.



## SESSION UPDATE 6 — 2026-07-10 (HERO'S JOURNEY REBUILD — Jad's direction, supersedes parts of UX-SPEC)
Jad: site experience rebuilt around the HERO'S JOURNEY; imagery + videos must map to journey stages.
- **Discover = five full-bleed acts** below the (unchanged, locked-copy) doorway-video hero + premise ScrollIgnite: I THE CALL (scene-call → Decode) · II THE TRIALS (scene-confidence + collection/feeling chips) · III THE ORACLE (scene-oracle → Reflect) · IV THE BECOMING (scene-becoming + programs) · V THE RETURN (scene-return + library rail + YT). Act component in Discover.jsx; .mc-act CSS (alternating veils, roman numerals — the numbering IS the journey sequence).
- **Tarot (Jad's explicit cuts, SUPERSEDE UX-SPEC):** Daily reading REMOVED (Ritual.jsx now unused like Home.jsx; Reflect subnav = Readings·Deck). "Lack to Abundance" + "Money" spreads REMOVED. Readings are exactly: One Card, Three Cards, Five Cards — The Journey (positions: Where you stand/The call/The trial/What to release/Who you are becoming; recodeFrom=4). Spread reveal: LACK PATTERN field removed (→ "THE RECODE"); Deck detail: LACK PATTERN + JOURNAL PROMPT fields removed. cards.js data untouched (lack/journal fields dormant).
- **JOURNALING REMOVED ENTIRELY (supersedes UX-SPEC):** no prompt cards in ContentModal, no note textarea in Spread, no Journal stream in My Space (Favorites + Saved readings only; export intact). storage.js journal fns dormant.
- Fixed latent Spread.jsx crash: posOf useMemo referenced undefined `order` — would have thrown the moment anyone opened a reading.
- New journey scenes: scene-call / scene-oracle / scene-return (16:9, same style block). First Return job (f45a116e) never completed — regenerated as 36b45e9f.

## ⚠️ SESSION UPDATE 5 — 2026-07-10 (PARALLEL-SESSION COLLISION — read before working)
TWO Claude sessions worked this repo simultaneously today. The other session shipped a working hero-video pipeline (vid- prefix, mp4+webm, HeroMedia w/ touch-wake + save-data + reduced-motion fallbacks — KEEP THEIRS, it is canonical). This session's duplicate landed on top and broke two things: (1) a duplicate "video-hero" manifest entry fell through the vid- prefix check into the image branch → PIL crashed the courier; (2) an orphaned .mc-herovideo CSS rule set the video to opacity:0 waiting for a class nobody adds → THE VIDEO PLAYED INVISIBLY ON THE LIVE SITE (user saw "no video"). Both fixed: orphan CSS deleted, duplicate manifest entry removed, courier hardened (any id starting vid-/video- OR any .mp4/.webm/.mov URL routes to the video branch).
RULE GOING FORWARD: one session per repo at a time. If commits appear that this session didn't make, STOP, git pull, and reconcile before pushing anything.
Verified post-fix: hero video exists/playing/opacity .92 full-bleed on desktop + iPhone viewports.

## SESSION UPDATE 4 — 2026-07-10 (iPhone/iPad performance pass — measured, not guessed)
Method: playwright chromium mobile emulation + CDP 4x CPU throttle, ISOLATED browser per device (measuring two live contexts in one process contaminates results — learned the hard way). Baseline: phone home 15fps / deck 24fps.
Fixes, in order of impact:
1. **Grain layer mix-blend-mode:overlay REMOVED** (plain low-opacity overlay now). Full-screen blend forced whole-viewport re-composite whenever anything beneath animated — this + stars was the killer. Never reintroduce blend modes on fixed full-viewport layers.
2. **Ambient stars: box-shadow glow → baked radial-gradient background** (+will-change:opacity). Animated opacity on 60 shadowed spans under the blend layer was the other half of the kill.
3. **`will-change:transform` on .mc-star is LOAD-BEARING** — removing it demoted 78 per-frame-transformed cards to full repaints (deck 24→10fps). It's back; keep it.
4. **Per-card blurred box-shadow removed during drift** (subtle outline on the back image instead); shadow only on .mc-starnear/.mc-starpicked.
5. **Heavy effects gated to `(hover:hover) and (pointer:fine)`**: foil sweep (also fixed: .mc-masklift shorthand was silently overriding it — now combined `.mc-masklift.mc-foil{mcLineUp, mcFoilSweep 1.8s-delay}`), hero+banner Ken Burns, nebula drift, hero/ambient JS parallax. Touch devices get the cinema fade + static depth.
6. **Cosmos pointer handlers: cached rect** (refreshed on scroll/resize via rAF) — no getBoundingClientRect per touchmove; touchstart added so a resting finger attracts cards (verified 23px pull on tap).
Final (4x throttle, isolated): PHONE 60fps home / 44 deck; TABLET 25/22 throttled, 56/46 unthrottled software-raster → real GPUs pin at refresh.
Cosmos is now v3: rAF physics field (sine-blend wander, depth scale/opacity/z, magnetic pointer attraction + gold-lift nearest, physics gather/re-deal/scatter, physics pick-swoop to center, entry deal-out). No CSS keyframes on cards. React never touches frames.

## SESSION UPDATE 2 — 2026-07-10 (THE IMAGE LAYER — cinematic imagery shipped)
- Jad's verdict on the text-only motion pass: "looks cheap, no images, nothing for the subconscious." Correct — fixed with a full image layer.
- **9 cinematic scenes generated (nano_banana_pro, 1k)**: scene-hero (16:9 doorway of light), scene-decode (16:9 dissolving profile), scene-becoming + scene-manifesto (16:9 featured covers), scene-{health,confidence,love,abundance,spirit} (4:5 door panels). Shared style block: midnight/indigo + burnished gold + ivory, volumetric light, film grain, "NO text/letters/numbers/watermark/borders/frames". All in tools/art-manifest.json → self-hosted via Art Courier.
- **Courier upgraded (tools/fetch_art.py):** scene-* ids → 1600px q84 (cards stay 720/q88); skips existing files (delete webp to force refetch); only upsizes never upscales (1k model output = 1376px wide, kept as-is).
- **Front-end:** hero = full-bleed backdrop (.mc-herocine breakout, Ken Burns 44s, parallax 0.22 via useParallax in motion.jsx, dual-gradient scrim, 2.4s cinema fade-in); Recode doors = 4:5 image panels w/ hover zoom + bottom veil; Decode tab = 21:9 banner; vis-becoming + dec-manifesto have real covers (Cover component now prepends BASE_URL).
- REMEMBER the deploy gotcha: courier commits with GITHUB_TOKEN → does NOT trigger deploy; dispatch deploy.yml after courier finishes (done this session via API).
- If hero crispness is ever criticized: upscale_image the hero job (97753d96-20a4-4bd9-a053-8f63c29d9a8d) to 4K, re-courier at higher width.
- Sandbox image `view` went down mid-session again — verified via DOM naturalWidth checks + numpy pixel-variance instead (playwright chromium at /opt/pw-browsers works).

## SESSION HANDOFF — 2026-07-10 (shell v2 shipped)
Read docs/PRODUCT-DIRECTION.md and docs/UX-SPEC.md FIRST. Then this state:

**SHIPPED TODAY (all live on GitHub Pages, deploys green):**
- Wands suit complete → full 78-card deck done, pip-verified.
- Safari fix: NEVER put CSS filter on 3D-transformed elements or use negative translateZ on interactive elements (was breaking ALL tarot interactions in WebKit).
- Mind Coding shell v2: 3-tab IA (Discover / Decode / Recode), My Space icon (◐) top-right. New files: src/data/{library,programs,collections}.js, src/components/{Discover,DecodeTab,RecodeTab,Reflect,MySpace,ContentCard,Cosmos}.jsx. App.jsx + BottomNav.jsx rewritten. Home.jsx now unused (still present).
- Content publishing = edit src/data/library.js: set ytId + status:"live". That's the whole CMS. Never hot-link covers; self-host via Art Courier pattern.
- Program engine: phased repetition, day-gated with grace (tested: binge-ahead blocked). Programs: becoming-30, letting-go-7.
- Cosmos draw mechanic: all 78 real cards drift in .mc-cosmos; tap = that card; Ritual (daily) and Spread (3-card) both use it. 2D transforms only — keep it that way (Safari).
- Hero CTAs: Decode (violet, left) then Recode (gold, right).

**JAD'S PENDING TEST LIST (his bug notes drive next session):** daily draw chain on Safari/iPhone, 3-card reading, program day-gating, journal prompt → My Space, backup download, cosmos drift speed/card size tuning.

**NEXT PRIORITIES (deadline: Jad has Claude until July 12):**
1. Fix whatever Jad's testing surfaces (mechanics polish > new features).
2. Founding batch scripts: 4 songs (Suno prompts+lyrics — exemplar "I Release What No Longer Chooses Me" already written in chat, register approved implicitly), 4 narrations, 1 visualization script, 1 Decode manifesto script. Pipeline: Suno → Reap audiogram w/ ONE signature caption style → YouTube; Higgsfield TTS for narration voice (voice not yet chosen).
3. Tarot post-reading → related library items bridge (tag map).
4. Later: real URL routing + prerender (slugs already in manifest), per-card SEO pages.

**OPEN DECISIONS:** YouTube channel handle (placeholder link @mindcoding in Discover.jsx — verify/replace), narrator voice (clone vs synthetic), publish cadence, email capture via GHL, Spiritual Mastery has no founding song (gap is known).

**SECURITY:** the PAT used 2026-07-10 is exposed in that chat — Jad must revoke it and mint a fresh repo-scoped token (Contents+Workflows RW) for the next session.

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
