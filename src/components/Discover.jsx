import { useEffect, useRef, useState } from "react";
import { FEELINGS, COLLECTIONS } from "../data/collections.js";
import { LIBRARY, itemById } from "../data/library.js";
import ContentCard from "./ContentCard.jsx";
import { Reveal, MaskLines, ScrollIgnite, useParallax, useMagnetic } from "../lib/motion.jsx";

const ART = (f) => import.meta.env.BASE_URL + "art/" + f;

const BOOT_LINES = [
  "MINDOS // boot",
  "scanning inputs… thousands of messages received today",
  "source: unknown · consent: not found",
  "write access: AVAILABLE",
];

function BootSequence({ onDone }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { onDone(); return; }
    const t = [];
    BOOT_LINES.forEach((_, i) => t.push(setTimeout(() => setShown(i + 1), 380 + i * 560)));
    t.push(setTimeout(onDone, 380 + BOOT_LINES.length * 560 + 420));
    return () => t.forEach(clearTimeout);
  }, [onDone]);
  return (
    <div className="mc-boot" onClick={onDone} role="button" aria-label="Skip intro" tabIndex={0}>
      {BOOT_LINES.slice(0, shown).map((l, i) => (
        <div key={i} className="mc-bootline">&gt; {l}</div>
      ))}
      <span className="mc-cursor" aria-hidden="true" />
    </div>
  );
}

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
  const [booted, setBooted] = useState(() =>
    typeof window !== "undefined" && sessionStorage.getItem("mc-booted") === "1"
  );
  const finishBoot = () => { setBooted(true); try { sessionStorage.setItem("mc-booted", "1"); } catch {} };

  return (
    <section className="mc-discover">
      {/* ── THE OPENING: the door. The locked words. ── */}
      <div className="mc-hero mc-heroanim mc-herocine">
        <div className="mc-heroimgwrap" aria-hidden="true" ref={heroPx}>
          <HeroMedia />
        </div>
        <div className="mc-heroscrim" aria-hidden="true" />
        {!booted ? (
          <BootSequence onDone={finishBoot} />
        ) : (
          <>
            <div className="mc-eyebrow mc-heroeyebrow">MINDOS // SYSTEM ACTIVE · WRITE ACCESS GRANTED</div>
            <h1 className="mc-h1">
              <MaskLines
                lines={[
                  { text: "Your mind is always being programmed.", className: "mc-decodeink" },
                  { text: "Choose what goes into it.", className: "mc-foil" },
                ]}
              />
            </h1>
            <p className="mc-herosub mc-herolate" style={{ "--d": "640ms" }}>
              Your mind is an operating system. Everyone writes to it — feeds, ads, other people's fear. This is where you take the keyboard back.
            </p>
            <div className="mc-herocta mc-herolate" style={{ "--d": "820ms" }}>
              <button ref={magA} className="mc-ctav" onClick={() => go("decode")}><b>Run Decode</b><small>READ THE SOURCE</small></button>
              <button ref={magB} className="mc-cta" onClick={() => go("recode")}><b>Open Recode</b><small>WRITE ACCESS</small></button>
            </div>
            <div className="mc-scrollcue mc-herolate" style={{ "--d": "1400ms" }} aria-hidden="true"><span /></div>
          </>
        )}
      </div>

      <div className="mc-premise">
        <Reveal className="mc-eyebrow">HOW THE SYSTEM RUNS</Reveal>
        <ScrollIgnite text="What you repeatedly listen to, imagine, feel, and believe begins to shape how you live." />
        <div className="mc-pipe" aria-label="Inputs become patterns, beliefs, identity, and finally your life">
          {["INPUTS", "PATTERNS", "BELIEFS", "IDENTITY", "LIFE"].map((st, i) => (
            <Reveal as="span" key={st} delay={i * 180} className="mc-pipestage">
              {st}
              {i < 4 && <i className="mc-pipearrow" aria-hidden="true">→</i>}
            </Reveal>
          ))}
        </div>
        <Reveal delay={950} className="mc-pipeinject">
          <span className="mc-pipearrowup" aria-hidden="true">⤴</span> RECODE writes here — at the inputs — and everything downstream recompiles.
        </Reveal>
      </div>

      {/* ── ACT I — THE CALL ── */}
      <Act
        numeral="PHASE 01 // SCAN"
        kicker="THE CALL"
        title="See the code you're running."
        copy="Feeds, ads, family scripts, other people's fear — code was written to your mind for years without asking. Most people never look at the source. The journey begins the moment you scan it and see the programming for what it is."
        img="signal-call.webp"
        cta="Run Decode"
        sub="READ THE SOURCE"
        onCta={() => go("decode")}
      />

      {/* ── ACT II — THE TRIALS ── */}
      <Act
        numeral="PHASE 02 // SELECT"
        kicker="THE TRIALS"
        title="Select the module to rewrite."
        copy="Every hero faces trials — yours are running processes. Health. Confidence. Love. Abundance. Spiritual mastery. Open the module where the old code is costing you the most."
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
        numeral="PHASE 03 // QUERY"
        kicker="THE ORACLE"
        title="Query the deck."
        copy="Seventy-eight original works — a symbolic debugger for your own head. Draw one card for a clear signal, three for the pattern, or five to trace the full stack: from where you stand to who you are becoming."
        img="signal-oracle.webp"
        cta="Draw your cards"
        sub="One · Three · Five"
        onCta={() => go("reflect")}
      />

      {/* ── ACT IV — THE BECOMING ── */}
      <Act
        numeral="PHASE 04 // COMPILE"
        kicker="THE BECOMING"
        title="Repetition compiles belief."
        copy="One exposure is a comment. Daily repetition is a commit. Programs sequence music and narration day by day until the new belief stops being something you play — and starts being something you run."
        img="signal-becoming.webp"
        flip
        cta="Install a program"
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
        numeral="PHASE 05 // DEPLOY"
        kicker="THE RETURN"
        title="Ship it to real life."
        copy="The journey ends where it began — the ordinary world — except you're running different code. Every song, narration, and visualization releases free on YouTube, so the build ships with you everywhere."
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
