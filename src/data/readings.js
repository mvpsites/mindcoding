/* Spread definitions. meaningField: which card field carries the position meaning
   ('auto' = upright/reversed general). lackFrom/recodeFrom: which drawn card
   (by position index) supplies the lack pattern and the recode block. */
export const SPREADS = [
  {
    id: "clarity",
    title: "Three-Card Clarity",
    sub: "Past energy · Present pattern · Next step",
    intro: "Where you've been, what repeats, and the door that opens next.",
    positions: ["Past energy", "Present pattern", "Next step"],
    meaningField: "auto",
    lackFrom: 1,
    recodeFrom: 2,
  },
  {
    id: "lack",
    title: "Lack to Abundance",
    sub: "Where lack shows up · The belief behind it · The abundance shift",
    intro: "Name the scarcity, find the code that runs it, and rewrite it.",
    positions: ["Where lack is showing up", "The belief behind it", "The abundance shift"],
    meaningField: "auto",
    lackFrom: 1,
    recodeFrom: 2,
  },
  {
    id: "money",
    title: "Money Energy",
    sub: "Current pattern · Hidden block · Next aligned action",
    intro: "Your money story, told back to you — then rewritten.",
    positions: ["Current money pattern", "Hidden money block", "Next aligned action"],
    meaningField: "money",
    lackFrom: 1,
    recodeFrom: 2,
  },
];
