# MindCod.ing — Deck Artwork Prompt Pack

## The one production decision that makes or breaks the deck

**Do not let the image model generate any text, card names, numerals, or frames.**

AI image models garble text and cannot keep a frame identical across 78 generations. Instead:

- The image model generates **only the central illustration panel** (the scene).
- The app renders the **frame, gold border, roman numeral, card name, and MindCod.ing signature** in real typography (Cinzel), identically on every card.

This guarantees perfect deck consistency, lets you regenerate any single card without breaking the set, and makes the cards look typeset rather than AI-generated. The visual shell I built already has this art slot waiting.

**Generate at portrait 2:3 (e.g. 1024×1536).** The app will crop/fit it into the panel.

---

## Master Style Block

Paste this at the start of EVERY card prompt, unchanged:

```
Luxury engraved tarot illustration in fine-line copperplate etching style.
Antique gold metallic linework on a deep midnight-blue-black background (#0B1020).
Oxblood red (#5B0E1A) used sparingly in shadows and drapery. Bone-ivory (#F3EFE6)
highlights. Subtle sacred geometry woven into the composition. Faint hair-thin
neural filament lines and tiny circuit-like glyphs hidden inside the engraving,
barely visible. Letterpress texture, gold-foil feeling, cotton-rag paper grain.
Symmetposition-aware classical tarot composition, original characters, elegant and
mystical, dark, expensive, cinematic soft glow. Portrait orientation 2:3.
NO text, NO lettering, NO numbers, NO borders, NO frames, NO watermark.
```

## Avoid / Negative Block

If your tool supports negative prompts, add:

```
text, letters, numbers, typography, watermark, frame, border, cartoon, anime,
neon purple gradient, clipart, 3D render, plastic, photorealism, cute, glitter,
crowded composition, low detail, modern clothing
```

---

## Card Back (generate this first — it sets the deck's identity)

```
[MASTER STYLE BLOCK]
Ornamental tarot card back design, perfectly symmetrical both vertically and
horizontally. A central circular neural-labyrinth emblem: concentric engraved
rings containing a maze pattern whose paths subtly resemble circuit traces,
with a small radiant node at the exact center. Around it, a ring of moon phases
(new to full to new) in fine gold line. A field of tiny eight-pointed stars
scattered sparsely on the midnight background. Thin sacred-geometry lattice
faint behind everything. Corners anchored by small key, mirror, crown, and
portal motifs. Deep midnight background, antique gold engraving, whisper of
oxblood at the outer edges.
```

Generate 6–10 variations, pick the one that feels most like "a rare object," and keep it as your **style anchor** (see workflow below).

---

## Consistency Workflow (important)

1. **Lock a style anchor.** Once you love one image (the card back is ideal), use it as a reference image in every future generation if your tool supports image reference/style reference. If it supports seeds, note the seed.
2. **One suit per session.** Generate all Wands together, all Cups together, etc. Models drift; batching keeps siblings consistent.
3. **Character sheets for court cards.** Before generating the 16 court cards, write one fixed description per figure archetype and reuse it verbatim (e.g. "a serene androgynous monarch with a circlet of gold filament, robes of oxblood with gold thread").
4. **Fixed suit motifs.** Decide once and reuse in every minor arcana prompt:
   - **Wands** — living branches tipped with small flames + rising gold filaments
   - **Cups** — chalices of engraved gold holding luminous ivory light (water = intuition)
   - **Swords** — slender engraved blades with thread-thin light along the edge (air = thought)
   - **Pentacles** — gold coin-discs bearing a five-pointed star inside a circuit-etched ring (earth = matter)
5. **Generate 4, keep 1.** Expect to discard most outputs. That's normal and cheap.
6. **Test at card size.** Shrink every winner to ~240px tall. If it reads clearly small, it's a keeper. Engraving that only works large will fail in the app.

---

## The Five Test Cards (match the demo app)

The visual shell ships with these five cards, so generate these first and drop them in to judge the vibe.

### 0 — The Fool

```
[MASTER STYLE BLOCK]
A young traveler in engraved robes stands at the very edge of a midnight cliff,
one foot lifted over the void, face turned upward in serene trust. A small white
rose in one hand, a modest bundle on a staff over the shoulder. Behind them an
enormous rising sun rendered as concentric gold rings of engraved rays. A small
loyal dog of gold linework leaps at their heel. Below the cliff, instead of rocks,
a soft spiral of faint neural filaments descends into darkness — the unknown as
circuitry not yet written. Vast negative space, single figure, monumental calm.
```

### I — The Magician

```
[MASTER STYLE BLOCK]
A poised figure stands behind a stone altar, one arm raised holding a slender
wand toward the sky, the other hand pointing to the earth. Above their head, a
horizontal figure-eight infinity loop drawn as one continuous glowing gold
filament. On the altar rest four objects in fine engraving: a branch tipped with
flame, a gold chalice, an upright sword, and a coin-disc bearing a five-pointed
star. Around the figure, a faint vertical column of sacred geometry connects sky
to ground like a channel of light. Roses and lilies engraved sparsely at the base.
```

### XVII — The Star

```
[MASTER STYLE BLOCK]
A kneeling figure at the edge of a still midnight pool pours water from two
vessels — one stream into the pool creating engraved ripple rings, one onto the
earth where it branches into thin gold filament roots. Above, one enormous
eight-pointed star dominates the sky, its rays rendered as long fine engraved
lines, surrounded by seven smaller eight-pointed stars. The pool reflects the
great star as a soft ivory glow. Atmosphere of absolute quiet, healing, and
replenishment. Generous negative space in the sky.
```

### XVIII — The Moon

```
[MASTER STYLE BLOCK]
A great crescent moon with a serene closed-eyed profile face, engraved in gold,
dominates the upper third, dripping thin threads of light like falling dew. Below,
a winding path of pale ivory line travels from a dark pool at the bottom edge,
between two distant engraved watchtowers, toward mountains on the horizon. A wolf
and a dog howl upward from either side of the path, drawn in restrained fine line.
From the pool, a crayfish emerges — its shell subtly patterned with faint circuit
glyphs, the unconscious surfacing. Mist rendered as sparse horizontal engraving.
```

### Five of Pentacles

```
[MASTER STYLE BLOCK]
A snowy midnight scene: two cloaked figures in oxblood-shadowed robes walk bowed
through falling engraved snowflakes, one leaning on a crutch. Behind them, set
into a dark stone wall, glows a tall arched stained-glass window holding five
gold coin-discs, each bearing a five-pointed star inside a circuit-etched ring,
arranged like a tree of light. The window casts warm gold light onto the snow —
a doorway of help the figures have not yet noticed, just steps away. The emotion:
hardship in the foreground, sanctuary within reach.
```

---

## Formula for the remaining 73 cards

```
[MASTER STYLE BLOCK]
[2–4 sentences describing the traditional Rider-Waite-Smith scene for the card,
reinterpreted with: original figures, the fixed suit motif, one subtle
"subconscious code" detail (faint filaments, circuit glyphs, a mirror, a portal,
a labyrinth), and one dominant focal element with generous negative space.]
```

Rules of thumb:

- **Respect the traditional symbolism** (the app's meanings depend on it) but never reference "Rider Waite" by name in the prompt — describe the scene instead, so the model doesn't copy the copyrighted deck's exact look.
- **One focal point per card.** The reference decks you love are powerful because they are quiet.
- **Pips (Ace–Ten) can be more symbolic, courts and majors more figurative.** This is traditional and reduces your workload — an Ace of Cups can simply be one magnificent chalice.

When you're ready, send me any suit and I'll write all 14 scene descriptions in this format in one pass.
