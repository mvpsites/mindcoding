import { useState, useMemo, useRef } from "react";
import { CARDS } from "../data/cards.js";
import CardBack from "./CardBack.jsx";
import Wheel from "./Wheel.jsx";
import CardFace from "./CardFace.jsx";
import Field from "./Field.jsx";
import { shareReading } from "../lib/shareframe.js";

function fisherYates(a0) {
  const a = [...a0];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Spread({ config, onSave, onExit }) {
  const K = config.positions.length;
  const [mode, setMode] = useState("draw"); // draw | spread
  const [drawnCards, setDrawnCards] = useState([]); // [{card, reversed}]
  const [flippedArr, setFlippedArr] = useState([]);
  const [savedThis, setSavedThis] = useState(false);
  const revealRef = useRef(null);

  const allFlipped = drawnCards.length === K && flippedArr.filter(Boolean).length === K;
  const revealed = mode === "spread" && allFlipped;

  const draw = (cardId) => {
    if (mode !== "draw" || drawnCards.length >= K) return;
    if (drawnCards.some((d) => d.card.id === cardId)) return;
    const pick = CARDS.find((c) => c.id === cardId);
    setDrawnCards((d) => [...d, { card: pick, reversed: config.noReversals ? false : Math.random() < 0.3 }]);
    if (drawnCards.length + 1 === K) setTimeout(() => setMode("spread"), 900);
  };

  const flipAt = (i) => {
    if (!drawnCards[i] || flippedArr[i]) return;
    setFlippedArr((f) => {
      const n = [...f];
      n[i] = true;
      if (n.filter(Boolean).length === K)
        setTimeout(() => revealRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 900);
      return n;
    });
  };

  const save = () => {
    const rc = drawnCards[config.recodeFrom].card;
    onSave({
      id: Date.now(),
      kind: "spread",
      date: new Date().toISOString(),
      name: config.title,
      cards: drawnCards.map((d) => ({ name: d.card.name, reversed: d.reversed })),
      affirmation: rc.affirmation,
      action: rc.action,
    });
    setSavedThis(true);
  };

  const meaningOf = (d, i) => {
    if (config.meaningField === "slots") {
      const f = config.slotFields[i];
      return f === "lack" ? `\u201C${d.card.lack}\u201D` : d.card[f];
    }
    return config.meaningField === "money" ? d.card.money : d.reversed ? d.card.reversed : d.card.upright;
  };

  const recodeCard = drawnCards[config.recodeFrom]?.card;

  const [shareState, setShareState] = useState("idle"); // idle | busy | done | fail
  const share = async () => {
    if (shareState === "busy") return;
    setShareState("busy");
    try {
      await shareReading({
        spreadTitle: config.title,
        slots: drawnCards.map((d, i) => ({
          position: config.positions[i],
          cardName: d.card.name,
          reversed: d.reversed,
        })),
        recode: recodeCard.recode,
        affirmation: recodeCard.affirmation,
        action: recodeCard.action,
      });
      setShareState("done");
      setTimeout(() => setShareState("idle"), 2500);
    } catch {
      setShareState("fail");
      setTimeout(() => setShareState("idle"), 2500);
    }
  };

  return (
    <section className="mc-ritual">
      <div className="mc-eyebrow">{config.title.toUpperCase()}</div>
      <h2 className="mc-h2">
        {mode === "draw" && drawnCards.length < K && `Draw ${["the first", "the second", "the third", "the fourth", "the fifth"][drawnCards.length]} card — ${config.positions[drawnCards.length]}.`}
        {mode === "draw" && drawnCards.length === K && "The cards are chosen."}
        {mode === "spread" && !allFlipped && "Turn each card."}
        {mode === "spread" && allFlipped && "The pattern is on the table."}
      </h2>

      {mode !== "spread" && (
        <>
          <Wheel
            pickedIds={drawnCards.map((d) => d.card.id)}
            onPick={draw}
            done={drawnCards.length >= K}
            hint={drawnCards.length < K ? config.intro : null}
          />
          <div className="mc-deckcontrols">
            <button className="mc-ghost mc-small" onClick={onExit}>
              <b>Back</b>
              <small>All readings</small>
            </button>
          </div>
        </>
      )}

      {mode === "spread" && (
        <div className="mc-spreadrow">
          {drawnCards.map((d, i) => (
            <div key={i} className="mc-spreadslot">
              <div
                className={`mc-flip mc-flip-sm ${flippedArr[i] ? "mc-flipped" : ""}`}
                onClick={() => flipAt(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && flipAt(i)}
                aria-label={`Turn card ${i + 1}`}
              >
                <div className="mc-flipinner">
                  <div className="mc-face mc-front"><CardBack /></div>
                  <div className="mc-face mc-backface">
                    <div className={d.reversed ? "mc-rev" : ""}><CardFace card={d.card} small /></div>
                  </div>
                </div>
              </div>
              <div className="mc-poslabel">{config.positions[i]}</div>
            </div>
          ))}
        </div>
      )}

      {revealed && (
        <div className="mc-readout" ref={revealRef}>
          {drawnCards.map((d, i) => (
            <Field key={i} label={config.positions[i].toUpperCase()} delay={i * 110} on>
              <strong className="mc-cardline">
                {d.card.name}
                {d.reversed ? " — Reversed" : ""}
              </strong>
              {meaningOf(d, i)}
            </Field>
          ))}
          <Field label="THE RECODE" tone="mc-abun" delay={450} on>
            &ldquo;{recodeCard.recode}&rdquo;
          </Field>
          <div className="mc-affirm mc-field mc-on" style={{ transitionDelay: "540ms" }}>
            <div className="mc-affline" />
            <div className="mc-label" style={{ textAlign: "center" }}>AFFIRMATION</div>
            <div className="mc-afftext">{recodeCard.affirmation}</div>
            <div className="mc-affline" />
          </div>
          <Field label="ALIGNED ACTION" tone="mc-abun" delay={630} on>
            {recodeCard.action}
          </Field>
          <div className="mc-actions mc-field mc-on" style={{ transitionDelay: "770ms" }}>
            <button className="mc-cta" onClick={save} disabled={savedThis}>
              <b>{savedThis ? "Saved" : "Save"}</b>
              <small>{savedThis ? "In your archive" : "To your archive"}</small>
            </button>
            {config.shareable && (
              <button className="mc-ghost" onClick={share} disabled={shareState === "busy"}>
                <b>{shareState === "busy" ? "Framing…" : shareState === "done" ? "Ready" : shareState === "fail" ? "Try again" : "Share"}</b>
                <small>{shareState === "done" ? "Frame delivered" : "The result frame"}</small>
              </button>
            )}
            <button className="mc-ghost" onClick={onExit}>
              <b>Readings</b>
              <small>Choose another</small>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
