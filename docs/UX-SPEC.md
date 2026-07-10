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

## Music programs + format decisions (added 2026-07-10, session 2)
- **Music is organized into PROGRAMS: 7 / 14 / 30-day ordered song sequences (DECIDED).** Listen tab leads with a Programs shelf; individual songs remain browsable below.
- **One sequence engine powers both programs and Journeys**: sequence = ordered {day, contentId} with progress tracking; a program is an all-song sequence, a Journey is mixed-format. Same Continue-strip surfacing on Discover.
- **OPEN FORK — program day model:** sequential (new song each day, catalog-hungry) vs phased repetition (same song daily for a phase, then advance — on-thesis with "what you repeatedly listen to", and 4 songs = a complete 30-day program). Claude strongly recommends phased repetition. Awaiting Jad's call.
- **Visualizations are caption-forward audiograms, NOT full cinematic video (DECIDED).** Words do the recoding; visuals must not compete. Pipeline converges with narrations: script → voice → Reap audiogram with burned captions → YouTube. Pick ONE signature Reap caption style for the whole brand and never deviate.
- **Ambient background library**: 4-6 slow atmospheric loops (Higgsfield), one per emotional register, reused across all audiograms. No per-video visual production.
- Visualization vs narration remains a GENRE split (guided imagery vs direct address), not a format split. Tabs unchanged.

## Decode pillar (added 2026-07-10, session 2)
- **New content genre: DECODE** — pattern-recognition / influence-awareness videos (Chase Hughes register): how persuasion, media framing, manipulation, and dark patterns program people; how to recognize it. Completes the tagline: Decode = "your mind is always being programmed" (see it), Recode = "choose what goes into it" (everything else on the platform).
- **Brand pairing: Decode / Recode** is the master architecture language.
- **Funnel role:** Decode = top of YouTube funnel (searchable, shareable, algorithm-friendly); every Decode video ends with a bridge to Recode content. Recode content = retention.
- **Register containment:** Decode is daytime-only — NEVER in the Subconscious night layer, never adjacent to sleep content. Gets a sharper visual treatment; sanctuary content stays soft.
- **Ethical line (hard rule):** recognition, not technique. Teach "how this works on you and how to notice it," never offensive manipulation how-tos.
- **Placement:** no new tab. Discover row + Library filter (+ desktop nav item if it earns one).
- **Founding batch:** one Decode video doubling as brand manifesto/channel trailer, e.g. "You're Being Programmed Every Day — Here's How to See It."

## SIMPLIFIED IA v2 (2026-07-10, supersedes the 5-tab nav above)
**Three tabs: Discover · Decode · Recode.** My Space stays a top-right icon. Desktop: Home · Decode · Recode.
- **Discover** = router: hero, feelings-first chips (intentions second row), Continue strip, one featured item per side.
- **Decode** = awareness feed (pattern-recognition videos, series grouping later). Sharper skin, daytime-only register.
- **Recode** = the sanctuary, organized by NEED not format: Continue → Programs → 7 collections → Tools (tarot as "Reflect", journal) → night = Subconscious register after ~21:00. Format is a filter chip, never a nav level.
- Killed: Listen/Visualize/Reflect/Library as tabs. Unchanged underneath: manifest, sequence engine, detail template, My Space, night layer, tarot containment, Safari rules.

## DEFAULTS LOCKED (2026-07-10 — Jad may veto)
1. Program day model = PHASED REPETITION (same song daily per phase; 4 songs = complete 30-day program).
2. Discover chips = FEELINGS-FIRST, intentions second row.
3. Programs/journeys = DAY-GATED WITH GRACE (catch up allowed, no binge-ahead).
4. Decode = confirmed pillar; founding batch includes one manifesto Decode video.
Founding batch (11): 4 songs (= first program), 4 narrations, 1 flagship visualization, 1 journey, 1 Decode manifesto.
