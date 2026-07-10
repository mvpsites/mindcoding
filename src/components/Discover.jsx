import { useEffect, useRef, useState } from "react";
import { Reveal, useParallax, useMagnetic } from "../lib/motion.jsx";

const ART = (f) => import.meta.env.BASE_URL + "art/" + f;

/* LANDING — pivoted 2026-07-10. Jad's locked copy (docs/LANDING-COPY.md).
   One scroll, ~45 seconds, every section points at one action: Start Your Check-In.
   Boot sequence and five-act journey removed by decision — explanation over cinema.
   Returning visitors (any check-in logged) land on the check-in view directly (App.jsx). */

function HeroMedia() {
  const vid = useRef(null);
  const [useVideo, setUseVideo] = useState(() => {
    if (typeof window === "undefined") return false;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sd = navigator.connection?.saveData;
    return !rm && !sd;
  });
  useEffect(() => {
    if (!useVideo) return;
    const wake = () => { vid.current?.play().catch(() => {}); };
    window.addEventListener("touchstart", wake, { once: true, passive: true });
    window.addEventListener("pointerdown", wake, { once: true, passive: true });
    return () => { window.removeEventListener("touchstart", wake); window.removeEventListener("pointerdown", wake); };
  }, [useVideo]);
  if (!useVideo) return <img className="mc-heroimg" src={ART("signal-hero.webp")} alt="" />;
  return (
    <video
      ref={vid}
      className="mc-heroimg mc-herovideo"
      poster={ART("signal-hero.webp")}
      autoPlay muted loop playsInline
      preload="auto"
      onError={() => setUseVideo(false)}
      aria-hidden="true"
    >
      <source src={ART("vid-signal.webm")} type="video/webm" />
      <source src={ART("vid-signal.mp4")} type="video/mp4" />
    </video>
  );
}

const STEPS = [
  ["01", "Name the feeling",
    "Choose what is present right now: anxious, stuck, heartbroken, unmotivated, overwhelmed, disconnected, or lost. No quizzes. No journaling. No need to explain yourself."],
  ["02", "Reveal the pattern",
    "See the thought loop beneath the feeling and the belief quietly reinforcing it. Not a diagnosis. Not a horoscope. A mirror."],
  ["03", "Run your protocol",
    "Receive one focused experience built for the pattern you selected: a song to repeat, a reframe to remember, a visualization to step into, a narration for morning or night. No browsing. No decision fatigue. Just press play."],
];

const PATHS = [
  ["health", "Health & Peace", "Calm the noise. Restore balance. Feel safe in your own mind."],
  ["confidence", "Confidence & Power", "Break hesitation. Reclaim your voice. Move with conviction."],
  ["love", "Love & Connection", "Release old wounds. Strengthen self-worth. Create healthier bonds."],
  ["abundance", "Abundance", "Challenge scarcity. Expand possibility. Build a mind that can receive."],
  ["spirit", "Spiritual Mastery", "Move beyond reaction. Deepen awareness. Live with intention."],
];

const TOOLS = [
  ["Music", "Original songs designed around powerful ideas you can return to until the words become familiar."],
  ["Narrations", "Guided audio for your mornings, evenings, quiet moments, and inner resets."],
  ["Visualizations", "Immersive experiences that help your mind see and feel the reality you are working toward."],
  ["The Deck", "A reimagined 78-card system for revealing the pattern, tension, or possibility you may not yet have words for."],
];

export default function Discover({ go, openCollection }) {
  const heroPx = useParallax(0.22);
  const magA = useMagnetic(9);

  return (
    <section className="mc-discover">
      {/* 1 · HERO */}
      <div className="mc-hero mc-heroanim mc-herocine">
        <div className="mc-heroimgwrap" aria-hidden="true" ref={heroPx}>
          <HeroMedia />
        </div>
        <div className="mc-heroscrim" aria-hidden="true" />
        <div className="mc-eyebrow mc-heroeyebrow">MIND CODING</div>
        <h1 className="mc-h1">
          <span className="mc-decodeink">Your mind is being programmed every day.</span>
          <br />
          <span className="mc-foil">Choose what gets installed.</span>
        </h1>
        <p className="mc-herosub mc-herolate" style={{ "--d": "300ms" }}>
          Everything you watch, hear, and repeat becomes part of the pattern running your life.
          Mind Coding helps you recognize that pattern, interrupt it, and replace it with something stronger.
        </p>
        <p className="mc-herosub mc-heroline2 mc-herolate" style={{ "--d": "440ms" }}>
          One daily check-in. One song. One reframe. One visualization.
          <br />
          <span className="mc-herofree">Free. Private. No signup. No endless feed.</span>
        </p>
        <div className="mc-herocta mc-herolate" style={{ "--d": "580ms" }}>
          <button ref={magA} className="mc-cta" onClick={() => go("checkin")}>
            <b>Start Your Check-In</b><small>TAKES ABOUT 60 SECONDS</small>
          </button>
        </div>
        <div className="mc-scrollcue mc-herolate" style={{ "--d": "1100ms" }} aria-hidden="true"><span /></div>
      </div>

      {/* 2 · HOW IT WORKS */}
      <div className="mc-landsec">
        <Reveal className="mc-eyebrow">HOW IT WORKS</Reveal>
        <Reveal as="h2" delay={90} className="mc-h2">Check in. Decode the pattern. Change the input.</Reveal>
        <div className="mc-landsteps">
          {STEPS.map(([n, t, d], i) => (
            <Reveal key={n} delay={160 + i * 130} className="mc-landstep">
              <div className="mc-landstepnum">{n}</div>
              <div className="mc-landsteptitle">{t}</div>
              <p className="mc-landstepdesc">{d}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* 3 · WHY IT WORKS */}
      <div className="mc-premise">
        <Reveal className="mc-eyebrow">WHY IT WORKS</Reveal>
        <Reveal as="h2" delay={90} className="mc-h2">Your life follows the patterns your mind repeats.</Reveal>
        <Reveal as="p" delay={180} className="mc-landwhy">
          Most beliefs do not arrive as conscious decisions. They are formed through repetition: the words you heard,
          the experiences you replayed, the content you consumed, and the thoughts you practiced until they began to feel true.
        </Reveal>
        <div className="mc-pipe" aria-label="Inputs become patterns, beliefs, identity, and finally your life">
          {["INPUTS", "PATTERNS", "BELIEFS", "IDENTITY", "LIFE"].map((st, i) => (
            <Reveal as="span" key={st} delay={i * 160} className="mc-pipestage">
              {st}
              {i < 4 && <i className="mc-pipearrow" aria-hidden="true">→</i>}
            </Reveal>
          ))}
        </div>
        <Reveal as="p" delay={850} className="mc-landwhy">
          What enters your mind repeatedly begins shaping what you notice, what you expect, and how you act.
          Mind Coding uses that same process deliberately. One intentional input may shift your perspective for a moment.
          Repeated daily, it can help build a new default.
        </Reveal>
        <Reveal as="p" delay={950} className="mc-landwhy mc-landwhykey">
          You cannot always control what reaches you.
          <br />You can choose what you reinforce.
        </Reveal>
      </div>

      {/* 4 · WHAT'S INSIDE */}
      <div className="mc-landsec">
        <Reveal className="mc-eyebrow">WHAT&rsquo;S INSIDE</Reveal>
        <Reveal as="h2" delay={90} className="mc-h2">Five paths. Four tools. One place to begin.</Reveal>
        <Reveal as="p" delay={170} className="mc-lead">Explore the area of life that needs your attention now:</Reveal>
        <div className="mc-pathgrid">
          {PATHS.map(([id, name, line], i) => (
            <Reveal key={id} delay={220 + i * 80}>
              <button className="mc-pathcard" onClick={() => openCollection(id)}>
                <span className="mc-pathname">{name}</span>
                <span className="mc-pathline">{line}</span>
              </button>
            </Reveal>
          ))}
        </div>
        <Reveal delay={340} as="p" className="mc-lead mc-toolslead">Every path uses four forms of mental input:</Reveal>
        <div className="mc-toolgrid">
          {TOOLS.map(([t, d], i) => (
            <Reveal key={t} delay={380 + i * 80} className="mc-toolcard">
              <span className="mc-toolname">{t}</span>
              <span className="mc-toolline">{d}</span>
            </Reveal>
          ))}
        </div>
        <Reveal delay={620} className="mc-decklink">
          <button className="mc-linklike" onClick={() => go("reflect")}>Let the deck reveal your pattern →</button>
        </Reveal>
      </div>

      {/* 5 · PRIVACY */}
      <div className="mc-landsec mc-landpriv">
        <Reveal className="mc-eyebrow">PRIVACY</Reveal>
        <Reveal as="h2" delay={90} className="mc-h2">Your inner world stays yours.</Reveal>
        <Reveal as="p" delay={180} className="mc-landwhy">
          Mind Coding is free to use. No account is required. Your check-ins and history remain stored in your browser,
          on your device. They are not attached to a profile, sent to a social feed, or used to keep you scrolling.
        </Reveal>
        <Reveal as="p" delay={260} className="mc-landwhy mc-landwhykey">
          This is not another platform competing for your attention.
          <br />It is a ritual you open, use, and leave.
        </Reveal>
      </div>

      {/* 6 · CLOSING */}
      <div className="mc-landsec mc-landclose">
        <Reveal as="h2" className="mc-h2">
          The programming never stops.
          <br />The question is whether it happens by accident or by choice.
        </Reveal>
        <Reveal delay={160} className="mc-herocta">
          <button className="mc-cta" onClick={() => go("checkin")}>
            <b>Start Your Check-In</b><small>YOUR FIRST CHECK-IN IS 60 SECONDS AWAY</small>
          </button>
        </Reveal>
      </div>
    </section>
  );
}
