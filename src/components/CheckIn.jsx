import { useMemo, useState } from "react";
import { byCollection, byType } from "../data/library.js";
import { collectionById } from "../data/collections.js";
import ContentCard from "./ContentCard.jsx";
import { Reveal } from "../lib/motion.jsx";
import { loadCheckins, addCheckin } from "../lib/storage.js";

/* CHECK-IN — the daily loop. Name the feeling → see the pattern (the mirror) →
   run the protocol. No quizzes, no journaling, one tap. History stays on-device. */

export const CHECKIN_FEELINGS = [
  {
    id: "anxious", label: "Anxious", to: "health",
    mirror: "Your nervous system is running a threat loop — scanning for danger on a day that may not contain any. The loop isn't broken; it's overprotective. It was installed to keep you safe, and it doesn't know the alarm is louder than the threat.",
    reframe: "My body is trying to protect me. I can thank it — and turn the volume down.",
  },
  {
    id: "stuck", label: "Stuck", to: "abundance",
    mirror: "Same inputs, same output. The loop under this feeling isn't laziness — it's a belief that the available doors are locked, so the mind stops checking the handles. Stuck is rarely a wall. It's usually a script that says the wall is there.",
    reframe: "I am one changed input away from a different output.",
  },
  {
    id: "heartbroken", label: "Heartbroken", to: "love",
    mirror: "A connection closed, but your mind is still holding the port open — replaying, re-arguing, re-living. That's not weakness; it's how minds process loss: repetition. The pattern only becomes a problem when the replay starts writing your future instead of releasing your past.",
    reframe: "What is mine will never need convincing. Both hands open.",
  },
  {
    id: "unmotivated", label: "Unmotivated", to: "confidence",
    mirror: "No signal worth moving for — that's what this feeling reports. Underneath is usually a quieter script: 'it won't matter' or 'I'm behind anyway.' Motivation doesn't die; it goes silent when the mind stops believing action changes the outcome.",
    reframe: "Action creates the evidence. The evidence creates the drive.",
  },
  {
    id: "overwhelmed", label: "Overwhelmed", to: "health",
    mirror: "Too many processes open, all flagged urgent. The pattern here is a mind treating everything as now — and a nervous system billing you for all of it at once. Nothing is wrong with your capacity. Something is wrong with the queue.",
    reframe: "One thing is next. Everything else is later.",
  },
  {
    id: "disconnected", label: "Disconnected", to: "spirit",
    mirror: "Running, but not present — the days execute, and no one's home to feel them. This pattern usually isn't emptiness; it's armor. Somewhere the system decided feeling less was safer than feeling this. Numb is a setting, not an identity.",
    reframe: "I am allowed to come back online, one honest moment at a time.",
  },
  {
    id: "lost", label: "Lost", to: "spirit",
    mirror: "No destination set — so every road feels equally wrong. The loop under 'lost' is often an old script that the next step must be certain before it's taken. But direction isn't found by standing still; it compiles from motion.",
    reframe: "I don't need the whole map. I need the next honest step.",
  },
];

function protocolFor(collectionId) {
  const pool = byCollection(collectionId);
  const pick = (t) => pool.find((x) => x.type === t) || byType(t)[0] || null;
  return {
    song: pick("song"),
    visualization: pick("visualization"),
    narration: pick("narration"),
  };
}

export default function CheckIn({ openItem, go, openCollection }) {
  const [picked, setPicked] = useState(null);
  const history = useMemo(loadCheckins, [picked]);
  const feeling = CHECKIN_FEELINGS.find((f) => f.id === picked) || null;
  const proto = feeling ? protocolFor(feeling.to) : null;
  const col = feeling ? collectionById(feeling.to) : null;

  const choose = (id) => {
    setPicked(id);
    addCheckin(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!feeling) {
    return (
      <section className="mc-checkin">
        <Reveal className="mc-eyebrow">CHECK-IN</Reveal>
        <Reveal as="h2" delay={90} className="mc-h2">Where is your head right now?</Reveal>
        <Reveal as="p" delay={180} className="mc-lead">
          One tap. No quizzes, no journaling, no need to explain yourself.
        </Reveal>
        <div className="mc-feelgrid">
          {CHECKIN_FEELINGS.map((f, i) => (
            <Reveal key={f.id} delay={220 + i * 60}>
              <button className="mc-feelcard" onClick={() => choose(f.id)}>
                <span className="mc-feelword">{f.label}</span>
              </button>
            </Reveal>
          ))}
        </div>
        {history.length > 0 && (
          <Reveal delay={300} as="p" className="mc-checkfaint">
            {history.length === 1 ? "1 check-in" : `${history.length} check-ins`} logged — stored only in this browser.
          </Reveal>
        )}
      </section>
    );
  }

  return (
    <section className="mc-checkin">
      <Reveal className="mc-eyebrow">CHECK-IN · {feeling.label.toUpperCase()}</Reveal>
      <Reveal as="h2" delay={80} className="mc-h2">The pattern under it</Reveal>
      <Reveal as="p" delay={160} className="mc-mirror">{feeling.mirror}</Reveal>
      <Reveal delay={240} className="mc-reframebox">
        <div className="mc-label">THE REFRAME — REPEAT IT ONCE, SLOWLY</div>
        <p className="mc-reframetext">&ldquo;{feeling.reframe}&rdquo;</p>
      </Reveal>

      <Reveal delay={320} className="mc-eyebrow mc-protoeyebrow">YOUR PROTOCOL — JUST PRESS PLAY</Reveal>
      <div className="mc-protorow">
        {[proto.song, proto.visualization, proto.narration].filter(Boolean).map((item, i) => (
          <Reveal key={item.id} delay={360 + i * 90} className="mc-protoslot">
            <ContentCard item={item} onOpen={openItem} />
          </Reveal>
        ))}
      </div>
      <Reveal delay={620} as="p" className="mc-checkfaint">
        The narration is for tonight. Everything releases free — anything marked coming soon lands on the channel first.
      </Reveal>

      <Reveal delay={680} className="mc-checkactions">
        <button className="mc-cta" onClick={() => go("reflect")}>
          <b>Pull a card on this</b><small>LET THE DECK READ IT</small>
        </button>
        <button className="mc-ghost" onClick={() => openCollection(feeling.to)}>
          <b>Open {col.name}</b><small>THE FULL MODULE</small>
        </button>
        <button className="mc-ghost mc-small" onClick={() => setPicked(null)}>
          <b>Change feeling</b><small>BACK</small>
        </button>
      </Reveal>
    </section>
  );
}
