/* MindCod.ing card data.
   ART PIPELINE: when a card's artwork is ready, drop the image into
   /public/art/ (self-hosted in this repo — never hot-link external CDNs)
   and set art: "art/<file>.jpg" on the card. The placeholder engraved
   sigil is replaced automatically. */

export const CARDS = [
  {
    id: "fool",
    name: "The Fool",
    numeral: "0",
    suit: "Major Arcana",
    energy: "Beginnings are asking for your yes.",
    upright:
      "New beginnings, innocence, a leap of faith, open horizons, trusting the unknown.",
    reversed:
      "Hesitation at the edge, recklessness, fear of starting, holding back the leap.",
    love: "An open heart. A fresh connection, or renewed innocence inside an old one.",
    career: "A new venture or role. Beginner's mind is your advantage, not your weakness.",
    money: "A fresh financial chapter. Leap wisely — pack light, but pack.",
    spiritual: "The soul before the story. Trust as a spiritual technology.",
    reveals:
      "This card reveals where you are being invited to begin before you feel ready. The pattern is waiting for a certainty that only starting can create.",
    lack: "I can't start until I'm sure it will work.",
    recode: "Clarity comes from motion. I am allowed to begin as a beginner.",
    affirmation: "I trust the step I cannot yet see.",
    journal: "What would I start this week if being new at it were safe?",
    action:
      "Take the first visible step on one thing you've been circling — today, imperfectly.",
  },
  {
    id: "magician",
    name: "The Magician",
    numeral: "I",
    suit: "Major Arcana",
    energy: "You are more equipped than you feel.",
    upright:
      "Manifestation, focused will, resourcefulness. Everything needed is already on the table.",
    reversed: "Scattered energy, untapped talent, doubt in your own tools.",
    love: "Intentional connection. Say what you actually want.",
    career: "You have the skills. Alignment of word and action creates the result.",
    money: "Resourcefulness over resources. Channel what you already have.",
    spiritual: "As above, so below. Attention is the wand.",
    reveals:
      "This card reveals the gap between what you have and what you believe you have. The tools are present — it is the belief in your own hands that flickers.",
    lack: "I don't have what it takes yet.",
    recode:
      "Everything I need to begin is already within reach. I direct my energy, and my energy directs my reality.",
    affirmation: "My attention is my power.",
    journal: "Which of my existing tools am I pretending I don't have?",
    action: "Use one skill you already possess, in service of one goal, before the day ends.",
  },
  {
    id: "hierophant",
    name: "The Hierophant",
    numeral: "V",
    suit: "Major Arcana",
    art: "art/hierophant.webp",
    energy: "Wisdom is offered — discernment is yours.",
    upright:
      "Tradition, spiritual guidance, learning from a teacher or a proven system, shared values, belonging.",
    reversed:
      "Questioning tradition, restriction by convention, breaking from dogma, finding your own path.",
    love: "Shared values and commitment. Common ground — or pressure to conform to someone else's script.",
    career: "Institutions, mentors, established paths. Learn the rules deeply before you rewrite them.",
    money: "Proven systems over shortcuts. Conventional wisdom is conventional because it worked.",
    spiritual: "The bridge between heaven and earth. Wisdom carried through lineage.",
    reveals:
      "This card reveals where you are seeking permission from an authority you may have outgrown — or refusing guidance that could genuinely help. The question is not follow or rebel, but which teachings are truly yours.",
    lack: "I need someone qualified to approve my path before I can walk it.",
    recode: "I can honor wisdom and still author my own life. Teachers guide — they do not own my becoming.",
    affirmation: "I am both student and authority of my life.",
    journal: "Whose approval am I still waiting for — and what would I do if it never came?",
    action: "Take one step today on a decision you've been outsourcing to someone else's authority.",
  },
  {
    id: "star",
    name: "The Star",
    numeral: "XVII",
    suit: "Major Arcana",
    energy: "Let yourself be replenished.",
    upright: "Hope, renewal, healing after the storm, quiet faith, being replenished.",
    reversed: "Dimmed faith, disconnection, forgetting your own light.",
    love: "Healing openness. Hope after disappointment.",
    career: "Renewed vision. Your work finds its guiding light again.",
    money: "Recovery and steady replenishment. What you pour out returns.",
    spiritual: "Direct connection. The universe pours without measuring.",
    reveals:
      "This card reveals that the storm has passed, even if your nervous system hasn't noticed yet. You are safe enough now to hope on purpose.",
    lack: "If I hope again, I'll only be disappointed again.",
    recode:
      "Hope is not naive — it is how I aim. I can be healing and hopeful at the same time.",
    affirmation: "I am being replenished, even now.",
    journal: "What am I quietly hoping for that I haven't dared to say out loud?",
    action:
      "Name one hope — out loud or on paper — and take one gentle step toward it today.",
  },
  {
    id: "moon",
    name: "The Moon",
    numeral: "XVIII",
    suit: "Major Arcana",
    energy: "Walk gently. Not everything in the dark is a threat.",
    upright: "Intuition, the unseen, dreams, illusion, the path through uncertainty.",
    reversed:
      "Fog lifting. Fears exposed as smaller than they appeared. Clarity returning.",
    love: "Feelings beneath the surface. Ask — don't assume.",
    career: "Incomplete information. Move slowly and trust your pattern-sense.",
    money: "An unclear picture. Look at the real numbers before the real fear.",
    spiritual: "The inner tide. Intuition speaks in imagery, not proof.",
    reveals:
      "This card reveals where fear is filling in the blanks. Much of what frightens you is projection on fog — the path itself is still under your feet.",
    lack: "If I can't see it clearly, something must be wrong.",
    recode: "I can walk without the full map. My intuition is data too.",
    affirmation: "I move through the unknown without abandoning myself.",
    journal:
      "Which of my current fears is a fact, and which is a story told in the dark?",
    action:
      "Take one fear and check it against reality today — one question, one number, one conversation.",
  },
  {
    id: "fivepent",
    name: "Five of Pentacles",
    numeral: "V",
    suit: "Pentacles",
    energy: "Support is closer than it appears.",
    upright:
      "Financial hardship, scarcity, isolation, feeling unsupported, a difficult season.",
    reversed:
      "Recovery, receiving help, improving finances, finding support, moving out of lack.",
    love: "Feeling shut out in connection. Warmth exists — knock.",
    career: "A hard season, not a permanent identity. Help is nearer than pride admits.",
    money: "Scarcity in view, doorway in reach. Support systems exist to be used.",
    spiritual: "The sanctuary was never closed. Separation is the illusion.",
    reveals:
      "This card reveals where scarcity has become familiar. You may be identifying with struggle, or believing support is unavailable — even when a doorway is closer than it appears.",
    lack: "I am alone, unsupported, and there is never enough.",
    recode:
      "Support is available to me. I am learning to receive, rebuild, and recognize the resources around me.",
    affirmation: "I am not abandoned by abundance.",
    journal: "Where am I refusing help because I believe I have to struggle alone?",
    action: "Ask for one form of support, advice, or help today.",
  },
];
