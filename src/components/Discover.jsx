import { useEffect, useRef, useState } from "react";
import { FEELINGS, COLLECTIONS } from "../data/collections.js";
import { LIBRARY, itemById } from "../data/library.js";
import ContentCard from "./ContentCard.jsx";
import { Reveal, MaskLines, ScrollIgnite, useParallax, useMagnetic } from "../lib/motion.jsx";

const ART = (f) => import.meta.env.BASE_URL + "art/" + f;

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

/* One act of the journey: full-bleed scene, numbered, copy, one door forward. */
function Act({ numeral, kicker, title, copy, img, flip = false, cta, sub, onCta, children }) {
  return (
    <section className={`mc-act ${flip ? "mc-actflip" : ""}`}>
      <div className="mc-actmedia" aria-hidden="true">
        <img src={ART(img)} alt="" loading="lazy" />
        <span className="mc-actveil" />
      </div>
      <div className="mc-actbody">
        <Reveal className="mc-actnum">{numeral}</Reveal>
        <Reveal as="div" delay={80} className="mc-eyebrow">{kicker}</Reveal>
        <Reveal as="h2" delay={160} className="mc-acttitle">{title}</Reveal>
        <Reveal as="p" delay={240} className="mc-actcopy">{copy}</Reveal>
        {cta && (
          <Reveal delay={320}>
            <button className="mc-cta" onClick={onCta}><b>{cta}</b>{sub && <small>{sub}</small>}</button>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

export default function Discover({ go, openItem, openCollection }) {
  const heroPx = useParallax(0.22);
  const magA = useMagnetic(9);
  const magB = useMagnetic(9);
  const featured = itemById("vis-becoming");

  return (
    <section className="mc-discover">
      {/* ── THE OPENING: the door. The locked words. ── */}
      <div className="mc-hero mc-heroanim mc-herocine">
        <div className="mc-heroimgwrap" aria-hidden="true" ref={heroPx}>
          <HeroMedia />
        </div>
        <div className="mc-heroscrim" aria-hidden="true" />
        <div className="mc-eyebrow mc-heroeyebrow">MIND CODING // SYSTEM ACTIVE</div>
        <h1 className="mc-h1">
          <MaskLines
            lines={[
              { text: "Your mind is always being programmed.", className: "mc-decodeink" },
              { text: "Choose what goes into it.", className: "mc-foil" },
            ]}
          />
        </h1>
        <p className="mc-herosub mc-herolate" style={{ "--d": "640ms" }}>
          Your identity runs on inputs. Music, visualization, and structured repetition — written directly to the system underneath.
        </p>
        <div className="mc-herocta mc-herolate" style={{ "--d": "820ms" }}>
          <button ref={magA} className="mc-ctav" onClick={() => go("decode")}><b>Run Decode</b><small>SEE THE SCRIPTS</small></button>
          <button ref={magB} className="mc-cta" onClick={() => go("recode")}><b>Open Recode</b><small>WRITE NEW INPUTS</small></button>
        </div>
        <div className="mc-scrollcue mc-herolate" style={{ "--d": "1400ms" }} aria-hidden="true"><span /></div>
      </div>

      <div className="mc-premise">
        <Reveal className="mc-eyebrow">THE PREMISE</Reveal>
        <ScrollIgnite text="What you repeatedly listen to, imagine, feel, and believe begins to shape how you live." />
      </div>

      {/* ── ACT I — THE CALL ── */}
      <Act
        numeral="PHASE 01"
        kicker="THE CALL"
        title="You've already heard it."
        copy="The restlessness. The sense that the life running on autopilot isn't the one you'd choose. Most people walk past the light. The journey begins the moment you turn toward it — and see the programming for what it is."
        img="signal-call.webp"
        cta="See the programming"
        sub="Enter Decode"
        onCta={() => go("decode")}
      />

      {/* ── ACT II — THE TRIALS ── */}
      <Act
        numeral="PHASE 02"
        kicker="THE TRIALS"
        title="Choose your arena."
        copy="Every hero faces trials — theirs are dragons, yours are patterns. Health. Confidence. Love. Abundance. Spiritual mastery. Pick the door where your real work is waiting."
        img="signal-trials.webp"
        flip
      >
        <Reveal delay={380} className="mc-chips">
          {COLLECTIONS.map((c) => (
            <button key={c.id} className="mc-chip mc-chipgold" onClick={() => openCollection(c.id)}>{c.name}</button>
          ))}
        </Reveal>
        <Reveal delay={480} className="mc-chips mc-chips2">
          {FEELINGS.slice(0, 4).map((f) => (
            <button key={f.id} className="mc-chip" onClick={() => openCollection(f.to)}>{f.label}</button>
          ))}
        </Reveal>
      </Act>

      {/* ── ACT III — THE ORACLE ── */}
      <Act
        numeral="PHASE 03"
        kicker="THE ORACLE"
        title="Consult the cards."
        copy="Seventy-eight original works, painted for this deck alone. Draw one card for a clear signal, three for the pattern, or five to walk the full journey — from where you stand to who you are becoming."
        img="signal-oracle.webp"
        cta="Draw your cards"
        sub="One · Three · Five"
        onCta={() => go("reflect")}
      />

      {/* ── ACT IV — THE BECOMING ── */}
      <Act
        numeral="PHASE 04"
        kicker="THE BECOMING"
        title="Repetition is the transformation."
        copy="Heroes aren't changed by one moment — they're changed by what they return to daily. Programs sequence music and narration day by day, so the new belief doesn't just visit. It moves in."
        img="signal-becoming.webp"
        flip
        cta="Begin a program"
        sub="30 Days of Becoming"
        onCta={() => go("recode")}
      >
        {featured && (
          <Reveal delay={420} className="mc-actcardrow">
            <ContentCard item={featured} onOpen={openItem} />
          </Reveal>
        )}
      </Act>

      {/* ── ACT V — THE RETURN ── */}
      <Act
        numeral="PHASE 05"
        kicker="THE RETURN"
        title="Carry it back into your life."
        copy="The journey ends where it began — the ordinary world — except you're not the same. Every song, narration, and visualization releases free on YouTube, so the work travels with you."
        img="signal-return.webp"
      >
        <Reveal delay={380} className="mc-rail mc-actrail">
          {LIBRARY.filter((x) => x.type !== "decode").slice(0, 6).map((x) => (
            <div key={x.id} className="mc-railslot"><ContentCard item={x} onOpen={openItem} /></div>
          ))}
        </Reveal>
        <Reveal delay={460}>
          <a className="mc-cta mc-small" href="https://www.youtube.com/@mindcoding" target="_blank" rel="noreferrer"><b>Visit the channel</b><small>Every release is free</small></a>
        </Reveal>
      </Act>
    </section>
  );
}
