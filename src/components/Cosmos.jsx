import { useEffect, useMemo, useRef, useState } from "react";
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
  const sign = () => (Math.random() < 0.5 ? -1 : 1);
  return shuffle(CARDS.map((c) => c.id)).map((cardId, i) => ({
    cardId,
    left: rnd(4, 88),
    top: rnd(3, 84),
    dur: rnd(7, 14),
    delay: -rnd(0, 14),
    dx: sign() * rnd(30, 64),
    dy: sign() * rnd(24, 52),
    r0: rnd(-18, 18),
    r1: rnd(-18, 18),
    bdur: rnd(3.4, 6.8),
    bdelay: -rnd(0, 7),
    z: 1 + (i % 7),
  }));
}

// gather → hold → scatter timing (ms); keep in sync with the .8s CSS transition
const GATHER_MS = 1150;
const SCATTER_MS = 1000;

export default function Cosmos({ pickedIds = [], onPick, done = false, hint }) {
  const [field, setField] = useState(makeField);
  const [phase, setPhase] = useState("drift"); // drift | gather | scatter
  const timers = useRef([]);
  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function doShuffle() {
    if (done || pickedIds.length > 0 || phase !== "drift") return;
    if (reduceMotion) {
      setField(makeField());
      return;
    }
    setPhase("gather");
    timers.current.push(
      setTimeout(() => {
        setField(makeField()); // re-deal identities + destinations while stacked
        setPhase("scatter");
      }, GATHER_MS),
      setTimeout(() => setPhase("drift"), GATHER_MS + SCATTER_MS)
    );
  }

  const shuffling = phase !== "drift";

  return (
    <>
      <div
        className={`mc-cosmos ${phase === "gather" ? "mc-cosmos-gather" : ""}`}
        role="group"
        aria-label="Seventy-eight cards adrift. Choose one."
      >
        <div className="mc-deckglow" />
        {field.map((s, i) => {
          const picked = pickedIds.includes(s.cardId);
          const gathered = phase === "gather" && !picked;
          // deterministic per-slot jitter so the stack reads as a loose deck
          const stackRot = ((i % 9) - 4) * 2.2;
          const ripple = (i % 13) * 16; // ms — organic stagger in and out
          return (
            <button
              key={s.cardId}
              className={`mc-star ${picked ? "mc-starpicked" : ""} ${done && !picked ? "mc-starfade" : ""}`}
              style={{
                left: gathered ? "50%" : `${s.left}%`,
                top: gathered ? "46%" : `${s.top}%`,
                zIndex: picked ? 60 : s.z,
                "--dur": `${s.dur}s`,
                "--delay": `${s.delay}s`,
                "--dx": `${s.dx}px`,
                "--dy": `${s.dy}px`,
                "--r0": `${s.r0}deg`,
                "--r1": `${s.r1}deg`,
                "--bdur": `${s.bdur}s`,
                "--bdelay": `${s.bdelay}s`,
                transform: shuffling
                  ? `translate(-50%,-50%) rotate(${gathered ? stackRot : s.r0}deg)${gathered ? " scale(.94)" : ""}`
                  : undefined,
                transitionDelay: shuffling ? `${ripple}ms` : undefined,
                animation: reduceMotion || shuffling ? "none" : undefined,
                animationPlayState: picked || done ? "paused" : undefined,
                pointerEvents: shuffling ? "none" : undefined,
              }}
              onClick={() => !done && !picked && !shuffling && onPick(s.cardId)}
              disabled={done || picked || shuffling}
              aria-label="Draw this card"
            >
              <span className="mc-starinner">
                <CardBack />
              </span>
            </button>
          );
        })}
      </div>
      <div className="mc-deckcontrols">
        <button
          className="mc-ghost mc-small"
          onClick={doShuffle}
          disabled={done || pickedIds.length > 0 || shuffling}
        >
          <b>{shuffling ? "Shuffling…" : "Shuffle"}</b>
        </button>
      </div>
      {hint && <div className="mc-hint">{hint}</div>}
    </>
  );
}
