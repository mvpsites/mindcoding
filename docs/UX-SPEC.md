# Mind Coding — UX Specification (v1, decided with Jad 2026-07-10)
Read PRODUCT-DIRECTION.md first. This doc records the concrete UX decisions layered on top of it.

## Navigation
- **Mobile: 5 bottom tabs — Discover · Listen · Visualize · Reflect · Library.** Desktop header: Mind Coding wordmark, nav = Music · Visualize · Narrations · Reflect (tarot) · Journeys · Library, My Space icon right.
- **Journeys is NOT a tab.** Active journey = top card of Discover's Continue strip; browsing journeys = Library + Discover rail.
- **My Space = persistent top-right icon on every screen**, never a tab. Contents: Favorites, Journal (all answered prompts across every content type, one stream), Journey progress, Saved readings.

## Tabs
- **Discover (home):** hero (first-visit only; returning users get compressed greeting) → emotion/intention chips → Continue strip (active journey day, today's card if drawn, last played) → one full-bleed featured experience → compact pillar rows → journeys rail → YouTube subscribe band.
- **Listen:** Music + Narrations merged on mobile (desktop keeps separate nav entries). Shelves: per format, per collection, per time of day, Subconscious shelf. All items open the shared detail template.
- **Visualize:** flagship first, then by intention; transcripts on detail pages.
- **Reflect:** the ENTIRE existing tarot app nests here with sub-nav Daily · Readings · Deck. Mystical skin stays scoped inside this tab. Every completed reading ends with "Continue this thread" → 2-3 library items matched to card themes. Saved readings move to My Space.
- **Library:** filters = format × 7 collections × emotion × length × time of day. Journeys index lives here too.

## Detail page template (one template, 3 variants: song / visualization-narration / journey-step)
Cover header → lite-YouTube embed → meta (length, theme, time of day) → description → lyrics/transcript fold → journal prompt card → related row → favorite.

## The Subconscious night layer (DECIDED: Option A)
- "Sleep" collection is renamed **Subconscious** in the taxonomy.
- **After ~21:00 local:** Discover greeting = "Program your subconscious tonight"; Subconscious row moves to top; ambient layer dims one step. Before 21:00 the register never appears.
- Detail pages offer sleep-variant ytIds first at night.
- Copy system: daytime = "code your mind"; night = "program your subconscious". Philosophy page explains input → subconscious encoding → identity output.
- Tarot tab stays named **Reflect** (Subconscious-as-tarot was considered and rejected).

## My Space storage (DECIDED: no database)
- localStorage only. No accounts, no backend. Framed as a privacy FEATURE: "your journal never leaves your device."
- Ship an export/backup button (JSON/text download). Import optional later.
- Cross-device sync explicitly out of scope for v1/v2; if ever needed, Cloudflare D1 exists, but drags in auth + privacy policy. Avoid.

## Journey mechanics (RECOMMENDED, not yet confirmed by Jad)
Day-gated with grace: today's step unlocks daily; missed days can be caught up; no bingeing ahead. Confirm before building Journeys.

## Open questions
- Discover chips: feelings-first ("I feel anxious") vs intentions-first ("I need peace"). Sets the front door's emotional register. UNDECIDED.
- Mini-player (floating persistent YouTube mini-frame): deferred to v2, biggest UX upgrade for listening.

## Founding batch implications
"Nothing Can Break My Peace" ships with a 1-hour sleep version at launch; "It Is Safe to Start Again" is produced as the bedtime narration.

## Known-good technical fixes (2026-07-10)
Safari/WebKit: never put CSS `filter` on 3D-transformed elements (breaks hit-testing) and never use negative translateZ on interactive cards — both caused total interaction failure in Safari; fixed by moving to box-shadow + all-positive Z. Preserve this rule in any new mechanics.
