import { useState, useRef } from "react";
import { CARDS } from "../data/cards.js";
import CardBack from "./CardBack.jsx";
import CardFace from "./CardFace.jsx";
import Field from "./Field.jsx";

const FAN = 12;

export default function Ritual({ onSave }) {
  const [stage, setStage] = useState("idle"); // idle | shuffling | fan | drawn
  const [chosen, setChosen] = useState(null);
  const [card, setCard] = useState(null);
  const [reversed, setReversed] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [note, setNote] = useState("");
  const [savedThis, setSavedThis] = useState(false);
  const revealRef = useRef(null);

  const shuffle = () => {
    setStage("shuffling");
    setTimeout(() => setStage("fan"), 1700);
  };

  const draw = (i) => {
    if (stage !== "fan" || chosen != null) return;
    setChosen(i);
    setCard(CARDS[Math.floor(Math.random() * CARDS.length)]);
    setReversed(Math.random() < 0.3);
    setTimeout(() => setStage("drawn"), 750);
  };

  const flip = () => {
    if (flipped) return;
    setFlipped(true);
    setTimeout(() => {
      setRevealed(true);
      setTimeout(() => revealRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    }, 750);
  };

  const again = () => {
    setStage("idle");
    setChosen(null);
    setCard(null);
    setFlipped(false);
    setRevealed(false);
    setNote("");
    setSavedThis(false);
  };

  const save = () => {
    onSave({
      id: Date.now(),
      date: new Date().toISOString(),
      cardId: card.id,
      name: card.name,
      reversed,
      affirmation: card.affirmation,
      action: card.action,
      note: note.trim(),
    });
    setSavedThis(true);
  };

  return (
    <section className="mc-ritual">
      <div className="mc-eyebrow">THE DAILY MIND CODE</div>
      <h2 className="mc-h2">
        {stage === "idle" && "Still your mind. Then shuffle."}
        {stage === "shuffling" && "The deck is listening."}
        {stage === "fan" && "Draw one card."}
        {stage === "drawn" && !flipped && "Turn the card when you're ready."}
        {stage === "drawn" && flipped && (reversed ? `${card.name} — Reversed` : card.name)}
      </h2>

      {stage !== "drawn" && (
        <div className={`mc-deckarea ${stage}`}>
          <div className="mc-deckglow" />
          {Array.from({ length: FAN }).map((_, i) => {
            const angle = -33 + (i * 66) / (FAN - 1);
            const isChosen = chosen === i;
            const fanStyle =
              stage === "fan"
                ? {
                    transform: isChosen
                      ? "rotate(0deg) translateY(-56px) scale(1.08)"
                      : chosen != null
                      ? `rotate(${angle}deg) translateY(40px)`
                      : `rotate(${angle}deg)`,
                    opacity: chosen != null && !isChosen ? 0 : 1,
                    zIndex: isChosen ? 40 : i,
                    transitionDelay: chosen == null ? `${i * 45}ms` : "0ms",
                  }
                : {
                    transform: `rotate(${(i % 2 ? 1 : -1) * (i % 4) * 0.7}deg) translateY(${-i * 0.5}px)`,
                    zIndex: i,
                  };
            return (
              <div key={i} className="mc-slot" style={fanStyle}>
                <button
                  className={`mc-fancard ${stage === "shuffling" ? "mc-shuf" : ""}`}
                  style={{ animationDelay: `${(i % 6) * 90}ms` }}
                  onClick={() => draw(i)}
                  disabled={stage !== "fan" || chosen != null}
                  aria-label="Draw this card"
                >
                  <CardBack />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {stage === "idle" && (
        <button className="mc-cta" onClick={shuffle}>
          <b>Shuffle</b>
          <small>Still the mind</small>
        </button>
      )}
      {stage === "fan" && chosen == null && <div className="mc-hint">Trust the first card that calls you.</div>}

      {stage === "drawn" && (
        <div className="mc-flipwrap">
          <div
            className={`mc-flip ${flipped ? "mc-flipped" : ""}`}
            onClick={flip}
            role="button"
            aria-label="Turn the card"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && flip()}
          >
            <div className="mc-flipinner">
              <div className="mc-face mc-front">
                <CardBack />
              </div>
              <div className="mc-face mc-backface">
                <div className={reversed ? "mc-rev" : ""}>
                  <CardFace card={card} />
                </div>
              </div>
            </div>
          </div>
          {!flipped && <div className="mc-hint">Tap the card</div>}
          {flipped && reversed && <div className="mc-revtag">REVERSED</div>}
        </div>
      )}

      {revealed && card && (
        <div className="mc-readout" ref={revealRef}>
          <Field label="TODAY'S ENERGY" delay={0} on={revealed}>
            {card.energy}
          </Field>
          <Field
            label={reversed ? "TRADITIONAL MEANING — REVERSED" : "TRADITIONAL MEANING — UPRIGHT"}
            delay={90}
            on={revealed}
          >
            {reversed ? card.reversed : card.upright}
          </Field>
          <Field label="WHAT THIS REVEALS" delay={180} on={revealed}>
            {card.reveals}
          </Field>
          <Field label="LACK PATTERN" tone="mc-lack" delay={270} on={revealed}>
            &ldquo;{card.lack}&rdquo;
          </Field>
          <Field label="ABUNDANCE RECODE" tone="mc-abun" delay={360} on={revealed}>
            &ldquo;{card.recode}&rdquo;
          </Field>

          <div className={`mc-affirm mc-field ${revealed ? "mc-on" : ""}`} style={{ transitionDelay: "460ms" }}>
            <div className="mc-affline" />
            <div className="mc-label" style={{ textAlign: "center" }}>
              AFFIRMATION
            </div>
            <div className="mc-afftext">{card.affirmation}</div>
            <div className="mc-affline" />
          </div>

          <Field label="JOURNAL PROMPT" delay={560} on={revealed}>
            {card.journal}
            <textarea
              className="mc-journal"
              placeholder="Write what rises…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </Field>
          <Field label="ALIGNED ACTION" tone="mc-abun" delay={650} on={revealed}>
            {card.action}
          </Field>

          <div className={`mc-actions mc-field ${revealed ? "mc-on" : ""}`} style={{ transitionDelay: "740ms" }}>
            <button className="mc-cta" onClick={save} disabled={savedThis}>
              <b>{savedThis ? "Saved" : "Save"}</b>
              <small>{savedThis ? "In your archive" : "To your archive"}</small>
            </button>
            <button className="mc-ghost" onClick={again}>
              <b>Return</b>
              <small>To the deck</small>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
