import { useEffect, useMemo, useRef, useState } from "react";
import { FEELINGS, COLLECTIONS } from "../data/collections.js";
import { LIBRARY, itemById } from "../data/library.js";
import { activePrograms, contentForDay } from "../data/programs.js";
import { loadDaily } from "../lib/storage.js";
import { CARDS } from "../data/cards.js";
import ContentCard from "./ContentCard.jsx";
import { Reveal, MaskLines, ScrollIgnite, useParallax, useMagnetic } from "../lib/motion.jsx";

const ART = (f) => import.meta.env.BASE_URL + "art/" + f;

/* Living hero: video when the device allows it, our still otherwise.
   Touch-wake handles iOS Low Power Mode blocking autoplay (mvpsites pattern). */
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
  if (!useVideo) return <img className="mc-heroimg" src={ART("scene-hero.webp")} alt="" />;
  return (
    <video
      ref={vid}
      className="mc-heroimg mc-herovideo"
      poster={ART("scene-hero.webp")}
      autoPlay muted loop playsInline
      preload="auto"
      onError={() => setUseVideo(false)}
      aria-hidden="true"
    >
      <source src={ART("vid-hero.webm")} type="video/webm" />
      <source src={ART("vid-hero.mp4")} type="video/mp4" />
    </video>
  );
}

export default function Discover({ go, openItem, openCollection }) {
  const heroPx = useParallax(0.22);
  const magA = useMagnetic(9);
  const magB = useMagnetic(9);
  const daily = useMemo(loadDaily, []);
  const dCard = daily ? CARDS.find((c) => c.id === daily.cardId) : null;
  const active = useMemo(activePrograms, []);
  const featuredRecode = itemById("vis-becoming");
  const featuredDecode = itemById("dec-manifesto");

  return (
    <section className="mc-discover">
      <div className="mc-hero mc-heroanim mc-herocine">
        <div className="mc-heroimgwrap" aria-hidden="true" ref={heroPx}>
          <HeroMedia />
        </div>
        <div className="mc-heroscrim" aria-hidden="true" />
        <div className="mc-eyebrow mc-heroeyebrow">MIND CODING</div>
        <h1 className="mc-h1">
          <MaskLines
            lines={[
              { text: "Your mind is always being programmed.", className: "mc-decodeink" },
              { text: "Choose what goes into it.", className: "mc-foil" },
            ]}
          />
        </h1>
        <p className="mc-herosub mc-herolate" style={{ "--d": "640ms" }}>
          Decode the patterns shaping you. Recode them with music, narration, visualization, and reflection. Free, always.
        </p>
        <div className="mc-herocta mc-herolate" style={{ "--d": "820ms" }}>
          <button ref={magA} className="mc-ctav" onClick={() => go("decode")}><b>Enter Decode</b><small>See the patterns</small></button>
          <button ref={magB} className="mc-cta" onClick={() => go("recode")}><b>Enter Recode</b><small>Choose what goes in</small></button>
        </div>
        <div className="mc-scrollcue mc-herolate" style={{ "--d": "1400ms" }} aria-hidden="true">
          <span />
        </div>
      </div>

      <div className="mc-block">
        <Reveal className="mc-eyebrow">HOW DO YOU FEEL TODAY?</Reveal>
        <div className="mc-chips">
          {FEELINGS.map((f, i) => (
            <Reveal as="button" key={f.id} delay={i * 45} className="mc-chip" onClick={() => openCollection(f.to)}>
              {f.label}
            </Reveal>
          ))}
        </div>
        <div className="mc-chips mc-chips2">
          {COLLECTIONS.map((c, i) => (
            <Reveal as="button" key={c.id} delay={220 + i * 55} className="mc-chip mc-chipgold" onClick={() => openCollection(c.id)}>
              {c.name}
            </Reveal>
          ))}
        </div>
      </div>

      {(active.length > 0 || dCard) && (
        <div className="mc-block">
          <Reveal className="mc-eyebrow">CONTINUE</Reveal>
          <div className="mc-continue">
            {active.map(({ program, progress }, i) => {
              const item = itemById(contentForDay(program, progress.current));
              return (
                <Reveal as="button" key={program.id} delay={i * 90} className="mc-contcard" onClick={() => go("recode")}>
                  <span className="mc-contkicker">Day {progress.current} of {program.days}</span>
                  <span className="mc-conttitle">{program.title}</span>
                  {item && <span className="mc-contsub">Today: {item.title}</span>}
                </Reveal>
              );
            })}
            {dCard && (
              <Reveal as="button" delay={active.length * 90} className="mc-contcard" onClick={() => go("reflect")}>
                <span className="mc-contkicker">Today's card</span>
                <span className="mc-conttitle">{dCard.name}{daily.reversed ? " — Reversed" : ""}</span>
                <span className="mc-contsub">Return to your reflection</span>
              </Reveal>
            )}
          </div>
        </div>
      )}

      <div className="mc-premise">
        <Reveal className="mc-eyebrow">THE PREMISE</Reveal>
        <ScrollIgnite text="What you repeatedly listen to, imagine, feel, and believe begins to shape how you live." />
      </div>

      <div className="mc-block">
        <Reveal className="mc-eyebrow">FEATURED</Reveal>
        <div className="mc-featured">
          <Reveal><ContentCard item={featuredRecode} onOpen={openItem} wide /></Reveal>
          <Reveal delay={140}><ContentCard item={featuredDecode} onOpen={openItem} wide /></Reveal>
        </div>
      </div>

      <div className="mc-block">
        <Reveal className="mc-eyebrow">NEW IN THE LIBRARY</Reveal>
        <div className="mc-rail">
          {LIBRARY.filter((x) => x.type !== "decode").slice(0, 6).map((x, i) => (
            <Reveal key={x.id} delay={i * 80} className="mc-railslot">
              <ContentCard item={x} onOpen={openItem} />
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal className="mc-ytband">
        <div className="mc-eyebrow">EVERY RELEASE IS FREE ON YOUTUBE</div>
        <p>New music, narrations, and Decode drops land on the channel first.</p>
        <a className="mc-cta mc-small" href="https://www.youtube.com/@mindcoding" target="_blank" rel="noreferrer"><b>Visit the channel</b></a>
      </Reveal>
    </section>
  );
}
