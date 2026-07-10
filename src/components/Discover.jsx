import { useMemo } from "react";
import { FEELINGS, COLLECTIONS } from "../data/collections.js";
import { LIBRARY, itemById } from "../data/library.js";
import { activePrograms, contentForDay } from "../data/programs.js";
import { loadDaily } from "../lib/storage.js";
import { CARDS } from "../data/cards.js";
import ContentCard from "./ContentCard.jsx";

export default function Discover({ go, openItem, openCollection }) {
  const daily = useMemo(loadDaily, []);
  const dCard = daily ? CARDS.find((c) => c.id === daily.cardId) : null;
  const active = useMemo(activePrograms, []);
  const featuredRecode = itemById("vis-becoming");
  const featuredDecode = itemById("dec-manifesto");

  return (
    <section className="mc-discover">
      <div className="mc-hero">
        <div className="mc-eyebrow">MIND CODING</div>
        <h1 className="mc-h1">
          <span className="mc-decodeink">Your mind is always being programmed.</span>
          <br />
          <span className="mc-foil">Choose what goes into it.</span>
        </h1>
        <p className="mc-herosub">
          Decode the patterns shaping you. Recode them with music, narration, visualization, and reflection. Free, always.
        </p>
        <div className="mc-herocta">
          <button className="mc-ctav" onClick={() => go("decode")}><b>Enter Decode</b><small>See the patterns</small></button>
          <button className="mc-cta" onClick={() => go("recode")}><b>Enter Recode</b><small>Choose what goes in</small></button>
        </div>
      </div>

      <div className="mc-block">
        <div className="mc-eyebrow">HOW DO YOU FEEL TODAY?</div>
        <div className="mc-chips">
          {FEELINGS.map((f) => (
            <button key={f.id} className="mc-chip" onClick={() => openCollection(f.to)}>{f.label}</button>
          ))}
        </div>
        <div className="mc-chips mc-chips2">
          {COLLECTIONS.map((c) => (
            <button key={c.id} className="mc-chip mc-chipgold" onClick={() => openCollection(c.id)}>{c.name}</button>
          ))}
        </div>
      </div>

      {(active.length > 0 || dCard) && (
        <div className="mc-block">
          <div className="mc-eyebrow">CONTINUE</div>
          <div className="mc-continue">
            {active.map(({ program, progress }) => {
              const item = itemById(contentForDay(program, progress.current));
              return (
                <button key={program.id} className="mc-contcard" onClick={() => go("recode")}>
                  <span className="mc-contkicker">Day {progress.current} of {program.days}</span>
                  <span className="mc-conttitle">{program.title}</span>
                  {item && <span className="mc-contsub">Today: {item.title}</span>}
                </button>
              );
            })}
            {dCard && (
              <button className="mc-contcard" onClick={() => go("reflect")}>
                <span className="mc-contkicker">Today's card</span>
                <span className="mc-conttitle">{dCard.name}{daily.reversed ? " — Reversed" : ""}</span>
                <span className="mc-contsub">Return to your reflection</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mc-block">
        <div className="mc-eyebrow">FEATURED</div>
        <div className="mc-featured">
          <ContentCard item={featuredRecode} onOpen={openItem} wide />
          <ContentCard item={featuredDecode} onOpen={openItem} wide />
        </div>
      </div>

      <div className="mc-block">
        <div className="mc-eyebrow">NEW IN THE LIBRARY</div>
        <div className="mc-rail">
          {LIBRARY.filter((x) => x.type !== "decode").slice(0, 6).map((x) => (
            <ContentCard key={x.id} item={x} onOpen={openItem} />
          ))}
        </div>
      </div>

      <div className="mc-ytband">
        <div className="mc-eyebrow">EVERY RELEASE IS FREE ON YOUTUBE</div>
        <p>New music, narrations, and Decode drops land on the channel first.</p>
        <a className="mc-cta mc-small" href="https://www.youtube.com/@mindcoding" target="_blank" rel="noreferrer"><b>Visit the channel</b></a>
      </div>
    </section>
  );
}
