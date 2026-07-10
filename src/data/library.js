/* Mind Coding content manifest — the entire CMS.
   To publish an item: fill ytId (YouTube video id) and set status:"live".
   Optional: cover (self-hosted path under /art or /covers — NEVER external CDNs),
   variants { sleep, loop, instrumental, short } as extra ytIds.
   type: "song" | "narration" | "visualization" | "decode"
   collection: health | confidence | love | abundance | spirit  (decode items use collection:null) */

export const LIBRARY = [
  // ——— Songs (the founding program) ———
  { id: "song-identity", slug: "i-remember-who-i-am", type: "song",
    title: "I Remember Who I Am", collection: "confidence",
    duration: "3:30", ytId: null, cover: null, status: "soon",
    blurb: "An anthem for returning to yourself — the self that existed before the doubt was installed.",
    prompt: "What did you love before anyone told you who to be?",
    variants: {} },
  { id: "song-release", slug: "i-release-what-no-longer-chooses-me", type: "song",
    title: "I Release What No Longer Chooses Me", collection: "love",
    duration: "3:45", ytId: null, cover: null, status: "soon",
    blurb: "A letting-go ballad. Both hands open. What is yours will never need convincing.",
    prompt: "What are you still holding a seat for?",
    variants: {} },
  { id: "song-favor", slug: "everything-is-working-in-my-favor", type: "song",
    title: "Everything Is Working in My Favor", collection: "abundance",
    duration: "3:20", ytId: null, cover: null, status: "soon",
    blurb: "Music for the mindset that notices doors instead of walls.",
    prompt: "What went right today that you almost didn't count?",
    variants: {} },
  { id: "song-peace", slug: "nothing-can-break-my-peace", type: "song",
    title: "Nothing Can Break My Peace", collection: "health",
    duration: "4:00", ytId: null, cover: null, status: "soon",
    blurb: "A slow, unshakeable calm. Also arriving as a one-hour sleep version.",
    prompt: "Where in your body does peace live when you find it?",
    variants: { sleep: null } },

  // ——— Narrations ———
  { id: "narr-behind", slug: "you-are-not-behind", type: "narration",
    title: "You Are Not Behind", collection: "confidence",
    duration: "6:00", ytId: null, cover: null, status: "soon",
    blurb: "A direct message for anyone measuring their life against an imaginary schedule.",
    prompt: "Whose timeline have you been grading yourself on?",
    variants: {} },
  { id: "narr-becoming", slug: "a-message-from-the-person-you-are-becoming", type: "narration",
    title: "A Message From the Person You Are Becoming", collection: "spirit",
    duration: "7:00", ytId: null, cover: null, status: "soon",
    blurb: "Your future self has something to say about the chapter you're in right now.",
    prompt: "What would the finished version of you thank you for starting today?",
    variants: {} },
  { id: "narr-again", slug: "it-is-safe-to-start-again", type: "narration",
    title: "It Is Safe to Start Again", collection: "love",
    duration: "8:00", ytId: null, cover: null, status: "soon",
    blurb: "A gentle bedtime narration for closing one door and sleeping on the threshold of another.",
    prompt: "What ending are you ready to stop apologizing for?",
    variants: {} },
  { id: "narr-permission", slug: "stop-asking-for-permission", type: "narration",
    title: "Stop Asking for Permission", collection: "abundance",
    duration: "5:30", ytId: null, cover: null, status: "soon",
    blurb: "The version of you who no longer waits to be appointed.",
    prompt: "What are you waiting to be allowed to do?",
    variants: {} },

  // ——— Visualization (flagship) ———
  { id: "vis-becoming", slug: "meet-the-person-you-are-becoming", type: "visualization",
    title: "Meet the Person You Are Becoming", collection: "spirit",
    duration: "12:00", ytId: null, cover: null, status: "soon",
    blurb: "A guided, eyes-closed encounter with your future self. Words carry it; the screen stays quiet.",
    prompt: "Describe the room where you met them. What was on the walls?",
    variants: {} },

  // ——— Decode ———
  { id: "dec-manifesto", slug: "youre-being-programmed-every-day", type: "decode",
    title: "You're Being Programmed Every Day — Here's How to See It", collection: null,
    duration: "9:00", ytId: null, cover: null, status: "soon",
    blurb: "The manifesto. The inputs shaping your beliefs were chosen by someone — usually not you.",
    prompt: "Name one belief you hold that you never actually chose.",
    variants: {} },
  { id: "dec-scarcity", slug: "the-scarcity-script", type: "decode",
    title: "The Scarcity Script: Why Urgency Works on You", collection: null,
    duration: "8:00", ytId: null, cover: null, status: "soon",
    blurb: "Countdown timers, limited stock, last chance. The oldest compliance pattern, decoded.",
    prompt: "When did urgency last make a decision for you?",
    variants: {} },
  { id: "dec-mirror", slug: "the-agreement-ladder", type: "decode",
    title: "The Agreement Ladder: Small Yeses, Big Commitments", collection: null,
    duration: "8:00", ytId: null, cover: null, status: "soon",
    blurb: "How tiny agreements are stacked into decisions you'd never have made cold.",
    prompt: "Trace one big yes backward. What were the small yeses before it?",
    variants: {} },
];

export const byType = (t) => LIBRARY.filter((x) => x.type === t);
export const byCollection = (c) => LIBRARY.filter((x) => x.collection === c);
export const itemById = (id) => LIBRARY.find((x) => x.id === id);

export const TYPE_LABEL = { song: "Song", narration: "Narration", visualization: "Visualization", decode: "Decode" };
