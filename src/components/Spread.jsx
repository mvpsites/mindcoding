import { useState, useMemo, useRef } from "react";
import { CARDS } from "../data/cards.js";
import CardBack from "./CardBack.jsx";
import CardFace from "./CardFace.jsx";
import Field from "./Field.jsx";

const N = 16;
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
  const [mode, setMode] = useState("stack"); // stack | fan | spread
  const [order, setOrder] = useState(() => Array.from({ length: N }, (_, i) => i));
  const [consumed, setConsumed] = useState([]); // fan card ids already drawn
  const [drawnCards, setDrawnCards] = useState([]); // [{card, reversed}]
  const [flippedArr, setFlippedArr] = useState([]);
  const [note, setNote] = useState("");
  const [savedThis, setSavedThis] = useState(false);
  const revealRef = useRef(null);

  const posOf = useMemo(() => {
    const m = {};
    order.forEach((id, p) => (m[id] = p));
    return m;
  }, [order]);

  const allFlipped = drawnCards.length === K && flippedArr.filter(Boolean).length === K;
  const revealed = mode === "spread" && allFlipped;

  const cardStyle = (id) => {
    const p = posOf[id];
    const off = p - (N - 1) / 2;
    if (consumed.includes(id))
      return { transform: `translateX(-50%) translateY(-120px) translateZ(80px) rotate(0deg)`, opacity: 0, zIndex: 90 };
    if (mode === "stack")
      return {
        transform: `translateX(-50%) translateY(${-p * 0.5}px) translateZ(${p * 0.9}px) rotate(${((p % 3) - 1) * 1.1}deg)`,
        zIndex: p,
      };
    const spread = "min(5.2vw, 33px)";
    return {
      transform: `translateX(-50%) translateX(calc(${off} * ${spread})) translateY(${(off * off * 2.3).toFixed(1)}px) translateZ(${(60 - Math.abs(off) * 7).toFixed(1)}px) rotate(${(off * 4.1).toFixed(2)}deg)`,
      zIndex: 40 - Math.abs(off) * 2,
    };
  };

  const draw = (id) => {
    if (mode !== "fan" || consumed.includes(id) || drawnCards.length >= K) return;
    // draw without replacement from card data
    const used = drawnCards.map((d) => d.card.id);
    const pool = CARDS.filter((c) => !used.includes(c.id));
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setConsumed((c) => [...c, id]);
    setDrawnCards((d) => [...d, { card: pick, reversed: Math.random() < 0.3 }]);
    if (drawnCards.length + 1 === K) setTimeout(() => setMode("spread"), 750);
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
      note: note.trim(),
    });
    setSavedThis(true);
  };

  const meaningOf = (d) =>
    config.meaningField === "money" ? d.card.money : d.reversed ? d.card.reversed : d.card.upright;

  const lackCard = drawnCards[config.lackFrom]?.card;
  const recodeCard = drawnCards[config.recodeFrom]?.card;

  return (
    <section className="mc-ritual">
      <div className="mc-eyebrow">{config.title.toUpperCase()}</div>
      <h2 className="mc-h2">
        {mode === "stack" && config.intro}
        {mode === "fan" && drawnCards.length < K && `Draw ${["the first", "the second", "the third"][drawnCards.length]} card — ${config.positions[drawnCards.length]}.`}
        {mode === "fan" && drawnCards.length === K && "The cards are chosen."}
        {mode === "spread" && !allFlipped && "Turn each card."}
        {mode === "spread" && allFlipped && "The pattern is on the table."}
      </h2>

      {mode !== "spread" && (
        <>
          <div className="mc-deckarea">
            <div className="mc-deckglow" />
            <div className="mc-stage3d">
              {Array.from({ length: N }, (_, id) => (
                <button
                  key={id}
                  className="mc-card3d"
                  style={cardStyle(id)}
                  onClick={() => draw(id)}
                  disabled={mode !== "fan" || consumed.includes(id) || drawnCards.length >= K}
                  aria-label="Draw this card"
                >
                  <CardBack />
                </button>
              ))}
            </div>
          </div>
          <div className="mc-deckcontrols">
            {mode === "stack" ? (
              <>
                <button className="mc-cta" onClick={() => setMode("fan")}>
                  <b>Fan</b>
                  <small>Spread the spread</small>
                </button>
                <button className="mc-ghost" onClick={onExit}>
                  <b>Back</b>
                  <small>All readings</small>
                </button>
              </>
            ) : (
              <button className="mc-ghost" onClick={() => setOrder(fisherYates)} disabled={drawnCards.length > 0}>
                <b>Shuffle</b>
                <small>Fisher–Yates cut</small>
              </button>
            )}
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
              {meaningOf(d)}
            </Field>
          ))}
          <Field label="LACK PATTERN" tone="mc-lack" delay={360} on>
            &ldquo;{lackCard.lack}&rdquo;
          </Field>
          <Field label="ABUNDANCE RECODE" tone="mc-abun" delay={450} on>
            &ldquo;{recodeCard.recode}&rdquo;
          </Field>
          <div className="mc-affirm mc-field mc-on" style={{ transitionDelay: "540ms" }}>
            <div className="mc-affline" />
            <div className="mc-label" style={{ textAlign: "center" }}>AFFIRMATION</div>
            <div className="mc-afftext">{recodeCard.affirmation}</div>
            <div className="mc-affline" />
          </div>
          <Field label="JOURNAL PROMPT" delay={630} on>
            {recodeCard.journal}
            <textarea
              className="mc-journal"
              placeholder="Write what rises…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </Field>
          <Field label="ALIGNED ACTION" tone="mc-abun" delay={700} on>
            {recodeCard.action}
          </Field>
          <div className="mc-actions mc-field mc-on" style={{ transitionDelay: "770ms" }}>
            <button className="mc-cta" onClick={save} disabled={savedThis}>
              <b>{savedThis ? "Saved" : "Save"}</b>
              <small>{savedThis ? "In your archive" : "To your archive"}</small>
            </button>
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
