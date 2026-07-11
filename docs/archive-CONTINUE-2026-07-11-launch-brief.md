# CONTINUE — Mind Coding session handoff

## ═══ START HERE (updated 2026-07-11 ~2am — LAUNCH DAY. Avalon post is TOMORROW 07-12) ═══

**Truth docs:** docs/EXPERIENCE-SPEC.md for concept/copy/tokens, PLUS the v4
addendum at its top — the EXHIBIT architecture (below) supersedes the spec's
§4 movement structure. TheField.jsx is now the copy source of truth.

**What is LIVE (commit 9504f20, GH Pages: https://mvpsites.github.io/mindcoding/):**
THE FIELD v4 — Three.js engine (src/lib/fieldGL.js) on EIDOLON's real
architecture, with the canvas-2D engine (fieldEngine.js) as automatic WebGL
fallback. **EIDOLON's coherence rule is now law: one shape = one scroll
section = one plaque.** Nine exhibits, counter 00/08:
0 hero dust · I crown · II dollar · III heart · IV meditator (each with its
own full plaque + one line) · V fractured mandala ("began speaking in your
voice") · VI the return (tear → recapture, honest DISPLACEMENT/PROGRAM CHANGE
telemetry, program cycles on reform; hinge question inside) · VII entrainment
(press-and-remain, 6s to lock: heal → helix → seed-ranked phyllotaxis bloom,
6/min breath) · VIII the chosen signal (card condensation, ENTER THE DECK /
MIND RECODING PROGRAMS) · programs strip (5 channels → LIBRARY collections).
Assembly = section centeredness (assemble on approach, HOLD while reading,
exhale on leave). 20k points desktop / 12k mobile, additive glow, fog, camera
parallax, film grain + vignette, full EIDOLON plaque anatomy (num / title /
staggered meta / gradient rule / dotted tag / ACC stamp).

**Hard-won session lessons (do not relearn):**
- Sandbox egress CANNOT reach *.github.io or netlify upload endpoints
  (x-deny-reason: host_not_allowed). ALL visual verification so far is
  numeric/headless. web_fetch reaches netlify.app pages and should reach
  pages.dev.
- Repo was private → made PUBLIC (Pages requires it; history secret-scanned).
- Netlify MCP deploy returned a proxied npx command; upload 403'd on egress.
  UNBLOCK: Jad adds netlify-mcp.netlify.app + api.netlify.com to the chat's
  allowed network domains, then rerun the MCP deploy-site call.
- Cloudflare is the FINAL host. Cloudflare MCP has NO deploy op. Path: Jad
  connects mvpsites/mindcoding in dashboard (Workers & Pages → Pages →
  Connect to Git, build `npm run build`, output `dist`) + attaches
  mindcod.ing. vite base is "./" — already works at root domains. No repo
  secrets exist for CF.
- Jad-supplied "code" attachments arrived EMPTY earlier — if he attaches
  files, confirm content actually arrived before claiming to use it.
- Two montage-render regressions: verify images via ASCII/numeric checks too.

**Priorities for 07-11 (in order):**
1. Jad's visual pass notes on v4 (github.io, hard refresh) — fix everything.
2. THE VERIFICATION LOOP: as soon as a pages.dev or Netlify URL exists, do
   EIDOLON-style hostile passes (fetch/inspect served page, per-exhibit
   critique desktop+mobile framing) — this was the sprint's biggest gap.
3. Polish list: dollar/meditator readability at particle scale, exhibit dwell
   pacing (section heights), tear feel on touch, bloom petal definition,
   brightness curve, programs strip styling.
4. Launch prep: OG image (bloom still, 1200×630 gilt on ink), meta
   description, favicon check, first-paint <2s on 4G gate, mindcod.ing domain
   if CF connected. Update EXPERIENCE-SPEC §4 to exhibit copy if time.
5. SECURITY: the GitHub PAT used this sprint was pasted in chat repeatedly —
   Jad should REVOKE it after launch and mint fresh per session.

**Launch 07-12:** Jad writes the Project Avalon thread; page must stand cold
from a forum link on mobile.

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
