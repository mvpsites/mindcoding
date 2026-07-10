import { useState, useRef, useMemo } from "react";
import { CARDS } from "../data/cards.js";
import { loadDaily, persistDaily, todayKey } from "../lib/storage.js";
import CardBack from "./CardBack.jsx";
import Cosmos from "./Cosmos.jsx";
import CardFace from "./CardFace.jsx";
import Field from "./Field.jsx";

export default function Ritual({ onSave }) {
  const daily = useMemo(loadDaily, []); // today's locked pull, if any
  const dCard = daily ? CARDS.find((c) => c.id === daily.cardId) || null : null;
  const [chosen, setChosen] = useState(null); // card id that was drawn
  const [drawn, setDrawn] = useState(!!dCard); // flip stage active
  const [card, setCard] = useState(dCard);
  const [reversed, setReversed] = useState(daily ? daily.reversed : false);
  const [flipped, setFlipped] = useState(!!dCard);
  const [revealed, setRevealed] = useState(!!dCard);
  const [note, setNote] = useState(daily?.note || "");
  const [savedThis, setSavedThis] = useState(!!daily?.saved);
  const revealRef = useRef(null);

  const draw = (cardId) => {
    if (chosen != null) return;
    setChosen(cardId);
    const pick = CARDS.find((c) => c.id === cardId);
    const rev = Math.random() < 0.3;
    setCard(pick);
    setReversed(rev);
    persistDaily({ date: todayKey(), cardId: pick.id, reversed: rev, note: "", saved: false });
    setTimeout(() => setDrawn(true), 850);
  };

  const flip = () => {
    if (flipped) return;
    setFlipped(true);
    setTimeout(() => {
      setRevealed(true);
      setTimeout(() => revealRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    }, 750);
  };

  const save = () => {
    onSave({
      id: Date.now(),
      kind: "daily",
      date: new Date().toISOString(),
      cardId: card.id,
      name: card.name,
      reversed,
      affirmation: card.affirmation,
      action: card.action,
      note: note.trim(),
    });
    persistDaily({ date: todayKey(), cardId: card.id, reversed, note: note.trim(), saved: true });
    setSavedThis(true);
  };

  return (
    <section className="mc-ritual">
      <div className="mc-eyebrow">THE DAILY MIND CODE</div>
      <h2 className="mc-h2">
        {!drawn && chosen == null && "Seventy-eight adrift. One is calling you."}
        {!drawn && chosen != null && "The card is chosen."}
        {drawn && !flipped && "Turn the card when you're ready."}
        {drawn && flipped && (reversed ? `${card.name} — Reversed` : card.name)}
      </h2>

      {!drawn && (
        <Cosmos
          pickedIds={chosen ? [chosen] : []}
          onPick={draw}
          done={chosen != null}
          hint={chosen == null ? "Trust the first card that calls you." : null}
        />
      )}

      {drawn && (
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
            <div className="mc-hint" style={{ alignSelf: "center" }}>A new card awaits tomorrow.</div>
          </div>
        </div>
      )}
    </section>
  );
}
