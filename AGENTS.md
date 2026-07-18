# AGENTS.md — THE GOLDEN RULES OF mvpsites/mindcoding

> READ THIS ENTIRE FILE BEFORE TOUCHING ANYTHING. This is the stable LAW of
> the repo. The CURRENT STATE (what's in flight, what's owed, latest rulings)
> lives in `docs/CONTINUE.md` — read that second. When they conflict, the
> newer dated ruling in CONTINUE.md wins.
>
> Jad Farran is the owner and final authority. His explicit instructions in
> the current conversation override anything written here. Nothing else does.

---

## 1. WHAT THIS IS

Mind Coding (https://mindcod.ing) — a consciousness/personal-growth web
product: a print-zine-styled editorial site with an interactive particle
emblem, a 78-card tarot draw experience ("THE THEATRE"), and five content
pillars (abundance · love · spirit · wellness · wisdom), each a "roll" page
of video entries. Launching August 2026.

**The zine is the site root.** One continuous journey on the landing page:
masthead → 01 THE INSTALLATION → 02 THE PATTERN (interactive emblem) →
03 THE THEATRE (keyhole iris → wheel → five-part reading) → closing →
04 THE CHOICE (five pillars) → footer.

## 2. ARCHITECTURE — DO NOT COMPLICATE IT

- **Static site. No frameworks. No build step. No npm dependencies.**
  Plain HTML/CSS/JS. `npm run build` = verbatim copy `public/` → `dist/`
  (`tools/build_site.mjs`). Do NOT introduce React, Vue, bundlers, vite,
  Tailwind, TypeScript, or any dependency without Jad's explicit ruling.
- **Layout of `public/` (= the deployed site, served relative-path-agnostic):**
  - `index.html` — the landing (the whole journey)
  - `draw/` — deep-link mirror of the draw experience
  - `channels/` + `channels/<id>/` — hub + five roll pages
  - `channels.json` — THE CMS (see §5)
  - `deck.json` + `art/` — the 78-card deck data + card art (LOCKED, see §4)
  - `shared/` — engines: `programmed-self.js` (emblem), `keyhole-iris.js`,
    `emblem-points.js` (particle map = source of truth)
  - `draw-experience.js/.css` — the extracted draw component
    (`MindDraw.mount(rootEl, opts)`) used identically by landing and /draw/
  - `scroll-life.js/.css` — scroll reveal/drift motion on all pages
  - `fonts/` — SELF-HOSTED Archivo Black + Space Mono. Never link external
    fonts or any external asset. Everything is self-hosted, always.
  - `sw.js` — service worker. Cache name `mindcoding-vNN`.
- **All internal links and asset refs are RELATIVE** (the same build serves
  the Cloudflare root and the GitHub Pages subpath). Never use absolute
  `/paths` in pages. Mind directory depth when adding refs.

## 3. THE DESIGN LANGUAGE — NEVER DEVIATE

- Colors: midnight `#070B1A` (paper) · bone `#EFE7D6` (ink) · gold
  `#D79A4A` (accent) · red `#FF2B06` (alarms/hover-invert only).
- Type: Archivo Black (display) + Space Mono (everything else).
- Borders: `--bd: 8px`. Zine/print aesthetic: plates, kickers, rules,
  halftone. ALL-CAPS mono labels with letter-spacing.
- One idea per section. Copy is Jad's voice — any new line an agent writes
  is a PLACEHOLDER awaiting his ruling; mark it as such in the commit.
- **Restyle, don't rebuild.** Improve what exists; never rewrite working
  systems wholesale.

## 4. LOCKED — DO NOT TOUCH WITHOUT JAD'S EXPLICIT INSTRUCTION

- **Wheel physics** in `draw-experience.js`: MAXSTEER .20, DECAY .965,
  tap-to-draw ≤9px/<350ms. Session-locked. Never retune.
- **Card data**: `deck.json` (all 78 cards, upright + reversed fields
  complete) and `art/` (the finished deck art). Never regenerate, edit,
  or "improve."
- **Emblem physics** (`programmed-self.js` constants) are Jad-tuned.
  Bug fixes fine; feel changes need his ruling.
- **No saving/persistence in the draw**: ruled — each reading is unique.
  Never add localStorage, accounts, or archives to the reading flow.
- No intention input in the veil — the question is held in mind, never typed.

## 5. HOW TO ADD/EDIT CONTENT (the normal change)

`public/channels.json` is the CMS. Each channel has `items` with:
`title` / `type` / `status` ("live" or in-prep) / `ytId` / `line`
(the what-to-do description).

**To publish a video:** set its `ytId`, set `status:"live"`, write `line`,
push to main. That's it. The generator (`tools/build_rolls.mjs`, runs in
both deploy workflows after the build) statically renders the roll pages
AND emits one SEO page per item at `/channels/<ch>/<slug>/` with unique
title/description/canonical and VideoObject JSON-LD when live.

**To add a channel:** extend `channels.json`, add the roll page under
`channels/<id>/` (copy an existing one), add it to the subnav on ALL pages,
add its number to the `NUM` map in `build_rolls.mjs`.

## 6. HOW TO ADD A PAGE

Copy the structure of an existing page (head meta, fonts link at the
correct relative depth, subnav, keyhole favicon, og/twitter meta,
scroll-life includes). Keep refs relative and depth-correct. Add it to the
subnav on every page. Then run the full gate (§7).

## 7. THE GATE — EVERY CHANGE, BEFORE EVERY PUSH

> **CODE CHECKS ARE NOT DEVICE CHECKS (ruled 07-15).** Static analysis,
> link checks, and harnesses verify code truth only. Never report them as
> proof the site works on a device. Device truth comes from the Device
> Truth workflow (real headless browser, iPhone + desktop, reduced-motion
> both ways, interaction simulation) — it runs on every push to main and
> must be green. New interactive features get a check added to
> `device-truth.spec.mjs` in the same PR. Other repos adopt it via the
> caller snippet documented inside `.github/workflows/device-truth.yml`.

1. **Bump the service worker cache** (`public/sw.js`, `mindcoding-vNN` →
   vNN+1) whenever ANY deployed file changes under an existing filename.
   Skipping this ships stale content to returning visitors.
2. **Build + generate + LINK CHECK:** `npm run build`, then
   `node tools/build_rolls.mjs dist`, then verify every relative
   `src`/`href` in every `dist/**/*.html` resolves (script contents
   excluded). A python one-file checker pattern is in CONTINUE.md /
   git history (commit 42f9777). Zero missing refs or you do not push.
3. **Engine changes:** `node --check` the file, run
   `tools/render_check_symbol.cjs` (emblem must draw its full particle
   count with 0 home error). For draw-experience changes, rebuild the
   theatre harness per the pattern in CONTINUE.md §HARNESSES.
4. **Gate pushes on harness exit codes.** A failing check = no push.
5. Pushing to `main` auto-deploys BOTH targets (GH Pages + Cloudflare).
   Confirm both workflow runs are green ON YOUR NEW SHA after pushing.
6. Headless 2D renders: LOOK at the output. Never audit pale/paper-colored
   surfaces against a paper background (use a green sentinel background).

## 8. SESSIONS, GIT, AND SAFETY

- **One session at a time.** Before branching or committing: `git log` and
  verify HEAD matches the last known SHA from the handoff/CONTINUE.md.
  Unexplained commits = STOP and ask Jad.
- Work on `main` (the deploy branch) unless Jad says otherwise. Write clear,
  ruling-referenced commit messages (they double as the project log).
- **Credentials:** Jad supplies tokens in-conversation at his discretion.
  NEVER commit a token, key, or secret to the repo (GitHub secret scanning
  will revoke and it may break live systems). Mask tokens in any command
  output. Cloudflare secrets live only in GitHub Actions repo secrets.
- **Recovery tags:** `archive/pre-cleanse-2026-07-12` (full repo before the
  07-12 purge) and `archive/field-v4` (the old React app, incl. Wheel.jsx).
  Deleted history is retrievable — never force-push or rewrite history.
- Update `docs/CONTINUE.md` at the end of any significant session: what
  changed, what's owed, new gotchas. It is the handoff spec.

## 9. DEPLOY PIPELINE

- `.github/workflows/deploy.yml` → GitHub Pages (preview; noindex).
- `.github/workflows/deploy-cloudflare.yml` → Cloudflare Pages project
  `mindcoding` → https://mindcod.ing (+www). Runs with INDEXABLE=1 and
  BASE_URL from the `SITE_URL` repo variable (= https://mindcod.ing) so
  canonicals/og/JSON-LD point at the real domain. Contains permanent
  credential-verify and ensure-project steps — leave them in.
- `.github/workflows/cf-admin.yml` → dispatchable Cloudflare ops
  (zone-status / attach-domains / verify-live), reporting via `::notice::`
  annotations (readable through the GitHub API when logs aren't).
- Known quirks: wrangler cannot create a missing Pages project in CI;
  curl from CI gets a Cloudflare bot-challenge 403 on the live domain
  (not an outage — browsers pass); the account API token attaches Pages
  domains but is refused zone DNS writes.

## 10. WHAT "GOOD" LOOKS LIKE

Small, surgical, ruling-referenced changes. Zero new dependencies. Relative
paths that survive both deploy targets. Copy marked as placeholder unless
Jad wrote it. Harnesses green, link check clean, sw bumped, both deploys
verified. When in doubt about ANYTHING aesthetic, behavioral, or structural:
propose, don't act — Jad rules, agents execute.
