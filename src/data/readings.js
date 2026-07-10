/* Spread definitions. meaningField: which card field carries the position meaning
   ('auto' = upright/reversed general; 'slots' = per-position card fields listed in
   slotFields). recodeFrom: which drawn card (by position index) supplies the recode
   block, affirmation, and action. noReversals: reversals don't apply (slot fields
   aren't orientation-dependent). shareable: offers the shareable result frame. */
export const SPREADS = [
  {
    id: "one",
    title: "One Card",
    sub: "The heart of it",
    intro: "One card. One clear signal. Ask your question, then draw.",
    positions: ["The heart of it"],
    meaningField: "auto",
    recodeFrom: 0,
  },
  {
    id: "mindos",
    title: "Input · Pattern · Recode",
    sub: "The installed belief · The loop it runs · The rewrite",
    intro: "The MindOS reading. Three cards: what was installed, the loop it keeps running, and the line that rewrites it.",
    positions: ["The Input", "The Pattern", "The Recode"],
    meaningField: "slots",
    slotFields: ["lack", "reveals", "recode"],
    noReversals: true,
    shareable: true,
    recodeFrom: 2,
  },
  {
    id: "clarity",
    title: "Three Cards",
    sub: "Past energy · Present pattern · Next step",
    intro: "Where you've been, what repeats, and the door that opens next.",
    positions: ["Past energy", "Present pattern", "Next step"],
    meaningField: "auto",
    recodeFrom: 2,
  },
  {
    id: "journey",
    title: "Five Cards — The Journey",
    sub: "Where you stand · The call · The trial · What to release · Who you are becoming",
    intro: "The hero's journey, dealt to you. Five cards trace the road from where you are to who you're becoming.",
    positions: ["Where you stand", "The call", "The trial", "What to release", "Who you are becoming"],
    meaningField: "auto",
    recodeFrom: 4,
  },
];
