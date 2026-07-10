/* The five Recode doors. Feelings map routes Discover chips into a door. */

export const COLLECTIONS = [
  { id: "health",    name: "Health",            line: "Peace, calm, and a settled nervous system." },
  { id: "confidence",name: "Confidence",        line: "Identity, courage, and being seen." },
  { id: "love",      name: "Love",              line: "Releasing, receiving, and healthy bonds." },
  { id: "abundance", name: "Abundance",         line: "Money mindset, opportunity, and receiving." },
  { id: "spirit",    name: "Spiritual Mastery", line: "Stillness, purpose, and the deeper pattern." },
];

export const FEELINGS = [
  { id: "anxious",     label: "I feel anxious",      to: "health" },
  { id: "lost",        label: "I feel lost",         to: "spirit" },
  { id: "heartbroken", label: "I feel heartbroken",  to: "love" },
  { id: "unmotivated", label: "I feel unmotivated",  to: "confidence" },
  { id: "overwhelmed", label: "I feel overwhelmed",  to: "health" },
  { id: "stuck",       label: "I feel stuck",        to: "abundance" },
];

export const collectionById = (id) => COLLECTIONS.find((c) => c.id === id);
