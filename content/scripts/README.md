# Founding batch — production scripts

Ten scripts matching the LIBRARY stubs in `src/data/library.js` (ids in each file's
header). Pipeline per item: produce audio (Suno for songs; narrator VO for the rest)
→ audiogram → YouTube → fill `ytId` in library.js and set `status:"live"`.

| # | LIBRARY id | Type | Title | Target |
|---|-----------|------|-------|--------|
| 1 | song-identity | song | I Remember Who I Am | 3:30 |
| 2 | song-release | song | I Release What No Longer Chooses Me | 3:45 |
| 3 | song-favor | song | Everything Is Working in My Favor | 3:20 |
| 4 | song-peace | song | Nothing Can Break My Peace | 4:00 (+1h sleep variant) |
| 5 | narr-behind | narration | You Are Not Behind | 6:00 |
| 6 | narr-becoming | narration | A Message From the Person You Are Becoming | 7:00 |
| 7 | narr-again | narration | It Is Safe to Start Again (bedtime) | 8:00 |
| 8 | narr-permission | narration | Stop Asking for Permission | 5:30 |
| 9 | vis-becoming | visualization | Meet the Person You Are Becoming | 12:00 |
| 10 | dec-manifesto | decode | You're Being Programmed Every Day | 9:00 |

Voice direction (all VO): grounded, unhurried, close-mic, low-mid register.
Direct address, never breathless, never guru. The MindOS vocabulary — input,
pattern, installed, recode — is used sparingly and lands harder for it.
Pause markers: `[p1]` ≈ 1s, `[p2]` ≈ 2s, `[p4]` ≈ 4s beat, `[p8]` ≈ 8s (vis only).

**Delivered-duration estimates** (performance pace + pauses + music beds) vs the
library.js stubs: narr-behind ≈ 5:30 · narr-becoming ≈ 5:45–6:00 · narr-again
≈ 7:00–7:15 · narr-permission ≈ 5:00 · vis-becoming ≈ 11:30 · dec-manifesto
≈ 7:45–8:00. The stub durations were aspirational; correct them in library.js
when each ytId is filled (do not pad scripts to hit the stubs).

Songs: each file carries a Suno style prompt + full structured lyrics.
Generate 3–4 takes per song; pick by chorus clarity first, production second.
