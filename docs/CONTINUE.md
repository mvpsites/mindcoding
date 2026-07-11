# CONTINUE.md — Mind Coding session handoff
## Written 2026-07-11 end of day · previous launch brief archived at docs/archive-CONTINUE-2026-07-11-launch-brief.md

---

## START HERE — WHAT HAPPENED TODAY (read all of this before touching anything)

Today was a full product pivot. In one day the project went:
FIELD v4 (live root, untouched) → FIELD v5 (branch, abandoned) → EIDOLON
parity pages (abandoned) → **THE ZINE** (approved) → **the connected zine
journey at /preview-zine-final/ — THIS IS THE PRODUCT DIRECTION NOW.**

Jad explicitly scrapped the particle-experience direction ("scrap the whole
thing", "don't keep anything") and approved the RAW MATTER zine system
(reference: https://fable-25.netlify.app/rawmatter/ + its /guide/) re-inked
in Mind Coding colors. Everything since has been built inside that system.

**The approved experience (all live, all static, no build step):**
- `/preview-zine-final/` — landing. Simplified 4-section copy flow (Jad-approved
  ~110 words), two-ink system, fingerprint-whorl Canvas2D proof interaction.
- `/preview-zine-final/draw/` — the tarot draw: authentic 78-card deck + lore,
  the ported magnetic Wheel (wash-shuffle → fan → spin → tap-to-draw),
  4-part reflective interpretation, saved readings (localStorage).
- `/preview-zine-final/channels/` — the three collections from the real catalog
  (LIVE items link to recordings; unreleased marked IN PRESS).

**Old root app is still live and untouched at `/` (mvpsites.github.io/mindcoding/).**
The Avalon launch date (07-12) was NOT met — the pivot consumed it. Jad has
not re-dated it.

---

## THE DESIGN SYSTEM (locked by approval — do not redesign)

Two inks on midnight. From the RAW MATTER guide, discipline intact:
- `--paper:#070B1A` (midnight) · `--ink:#EFE7D6` (bone) · `--ink-dim:#B8B0A3` · `--ink-faint:#6d6a5e`
- `--gold:#D79A4A` — **what you choose** (brand, CTAs, the turn lines, centered card)
- `--red:#FF2B06` — **what chose you** (the pattern, telemetry, hover-invert rows, alarms). Sparingly.
- `--bd:8px` — ONE border token, everywhere. 2px for inner rules only.
- Type: **Archivo Black** display · **Space Mono** metadata · system stack body.
- Zero frameworks, zero build step, zero images except card plates (self-hosted).
- CSS-only textures: gold radial halftone, 1px repeating-gradient grain.
- Crosshair cursor + rAF-throttled X/Y readout (desktop only).
- Tickers: two duplicated spans translated −50%, 34s, red ✦ separators.
- NO glassmorphism, NO gimmick easter eggs (Jad removed the stamp taunts),
  tone: "cinematic, precise, intelligent and respectful."
- Copy discipline: Jad rejected wordy v1 hard. Sections carry ONE idea each.
  His approved lines only; no invented connective prose.

## THE WHORL (landing proof interaction — spec'd by Jad, thresholds exact)

Canvas 2D only. 900 particles desktop / 500 phone, DPR ≤ 2, IO-paused offscreen.
Fingerprint: 7 nested distorted ellipses (`baseRadius = 0.22 + ring*0.075`,
x/y formulas per Jad's correction doc), staggered ridge openings on odd rings
feed a core spiral (~6% of grains), `unit = min(W/1.55, H/1.16)`.
Homes are permanent; spring K=.045, damp .88 (.80 reduced-motion).
Telemetry: `disp = min(100, round((sum/pts.length)/(R*0.12)*100))`,
reveal at `peak >= 8 && disp < peak*0.55`. PATTERN CHANGE is 0% forever, honestly.
Touch: pan-y; horizontal intent = ≥20px && ≥1.4× vertical.

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

1. **DECISIONS JAD OWES (ask first, they gate everything):**
   a. Production architecture: rebuild the React app's shell in the zine
      system (keep app, reskin), or promote the static zine pages to be the
      product and embed/port app features into them? The correction doc
      says "keep existing application logic, replace its visual shell" —
      that means reskinning the React app is the stated intent.
   b. Root swap: when does /preview-zine-final/ (or its production version)
      replace the live root? Requires his explicit approval per standing order.
   c. New launch date for Project Avalon.
   d. `/preview-codex/` ruling — three commits pushed from HIS account
      (jadf23, 10:36–10:37 on 07-11) with a complete particle experience.
      He never answered whether it's his parallel work. KEEP PARKED until ruled.
   e. Card art regeneration? He said "scrap them too" but the deck art is
      already gold-on-midnight (matches the zine). Current assumption: KEEP.
      Confirm.
2. **Production reskin (the big one):** apply the zine system to the React
   app — TheField/landing replaced by the zine cover (with the whorl),
   Reflect/Wheel restyled (the Wheel component itself needs Jad's new
   retunes ported BACK into src/components/Wheel.jsx: MAXSTEER .20,
   DECAY .965, tap-to-draw replacing the 900ms hold), Recode/collections
   in the channels style, three primary channels with Peace + Confidence
   folded INSIDE collections (data model change in collections.js/library.js
   — spec'd in the correction doc).
3. **Storage unification:** static preview's `mc-zine-readings` vs app's
   storage.js daily/saved format — production must use the app's store.
4. **Launch prep redo for the new design:** OG image (the whorl or the
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
8. **REVOKE THE PAT** pasted in chat (again) once the session ends —
   github_pat_11CHL5AFY0i… It has been in two conversations now.

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

## ROUTE INVENTORY (as of 296e512)

| Route | What | Status |
|---|---|---|
| `/` | Old FIELD v4 React app | LIVE, untouched, still the public root |
| `/preview-zine-final/` (+ /draw/, /channels/) | **THE DIRECTION** | Active work |
| `/preview-zine/` | Zine gate 1 (superseded) | Park until ruling |
| `/preview/` | FIELD v5 build (18MB) | Park until ruling |
| `/preview-parity/`, `/preview-parity-2/` | EIDOLON parity stages | Park until ruling |
| `/preview-codex/` | Mystery push from jadf23 | DO NOT TOUCH — needs ruling |
| branch `field-v5`, PR #1 | v5 source | Keep intact per his order |

Last commits: `296e512` (wheel retune) ← `d4a660b` (wheel UX) ← `7056bd1`
(wheel port) ← `32e098c` (pick restore) ← `af74fa8` (connected journey).
