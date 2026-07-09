# MindCod.ing

**Recode your mind. Rewrite your reality.**

Tarot reveals the pattern. MindCod.ing helps you recode it — a free tarot,
manifestation, and belief-recoding ritual app. No accounts, no tracking,
no ads. All readings and journal entries live in the visitor's own browser
(localStorage). Free, always.

## Status — Phase 1 (visual shell)

- ✅ Full ritual arc: shuffle → fan → draw → 3D flip → staged reveal
- ✅ 5 sample cards with complete 13-field content (Fool, Magician, Star, Moon, Five of Pentacles)
- ✅ Deck library with suit filters + card detail view
- ✅ Saved-readings archive (localStorage)
- ✅ Placeholder engraved SVG card faces with an art slot for generated artwork
- ⬜ Remaining 73 cards (content + artwork)
- ⬜ Three-card spreads (Clarity, Lack→Abundance, Money Energy)
- ⬜ Belief Recode tool (static taxonomy — see project notes)
- ⬜ Philosophy page

## Stack

Vite + React 18, hand-rolled CSS (design tokens in `src/styles.css`), no backend.

## Develop

```bash
npm install
npm run dev
```

## Deploy

Pushing to `main` auto-builds and deploys via GitHub Actions → GitHub Pages
(`.github/workflows/deploy.yml`). One-time setup: repo **Settings → Pages →
Source: GitHub Actions**.

The Vite `base` is `"./"`, so the build works on a `*.github.io/mindcoding/`
subpath **and** on the `mindcod.ing` custom domain without changes.

## Artwork pipeline

See `docs/artwork-prompts.md`. Key rule: the image model generates only the
central illustration — the app renders frames, numerals, and names in real
typography (Cinzel) so all 78 cards stay perfectly consistent. Art files are
committed into `public/art/` (self-hosted, never external CDN links).

## Content structure

Every card in `src/data/cards.js` carries 13 fields: upright, reversed, love,
career, money, spiritual, reveals, lack pattern, abundance recode, affirmation,
journal prompt, aligned action, plus a one-line daily energy.

## Disclaimer

MindCod.ing is for reflection, journaling, and personal growth. It does not
predict the future or replace medical, mental-health, financial, legal, or
professional advice.
