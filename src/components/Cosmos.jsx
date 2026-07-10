import { useMemo, useState } from "react";
import { CARDS } from "../data/cards.js";
import CardBack from "./CardBack.jsx";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const rnd = (min, max) => min + Math.random() * (max - min);

function makeField() {
  // every floating card IS a real card, face down
  return shuffle(CARDS.map((c) => c.id)).map((cardId, i) => ({
    cardId,
    left: rnd(2, 90),
    top: rnd(2, 86),
    dur: rnd(14, 30),
    delay: -rnd(0, 30),
    dx: rnd(-26, 26),
    dy: rnd(-20, 20),
    r0: rnd(-14, 14),
    r1: rnd(-14, 14),
    z: 1 + (i % 7),
  }));
}

export default function Cosmos({ pickedIds = [], onPick, done = false, hint }) {
  const [field, setField] = useState(makeField);
  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  return (
    <>
      <div className="mc-cosmos" role="group" aria-label="Seventy-eight cards adrift. Choose one.">
        <div className="mc-deckglow" />
        {field.map((s) => {
          const picked = pickedIds.includes(s.cardId);
          return (
            <button
              key={s.cardId}
              className={`mc-star ${picked ? "mc-starpicked" : ""} ${done && !picked ? "mc-starfade" : ""}`}
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                zIndex: picked ? 60 : s.z,
                "--dur": `${s.dur}s`,
                "--delay": `${s.delay}s`,
                "--dx": `${s.dx}px`,
                "--dy": `${s.dy}px`,
                "--r0": `${s.r0}deg`,
                "--r1": `${s.r1}deg`,
                animationPlayState: picked || done ? "paused" : undefined,
                animation: reduceMotion ? "none" : undefined,
              }}
              onClick={() => !done && !picked && onPick(s.cardId)}
              disabled={done || picked}
              aria-label="Draw this card"
            >
              <CardBack />
            </button>
          );
        })}
      </div>
      <div className="mc-deckcontrols">
        <button className="mc-ghost mc-small" onClick={() => setField(makeField())} disabled={done || pickedIds.length > 0}>
          <b>Stir the cosmos</b>
        </button>
      </div>
      {hint && <div className="mc-hint">{hint}</div>}
    </>
  );
}
