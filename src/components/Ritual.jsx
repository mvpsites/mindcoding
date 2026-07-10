import { useState, useRef, useMemo, useEffect } from "react";
import { CARDS } from "../data/cards.js";
import { loadDaily, persistDaily, todayKey } from "../lib/storage.js";
import CardBack from "./CardBack.jsx";
import CardFace from "./CardFace.jsx";
import Field from "./Field.jsx";

const N = 16; // sixteen live cards in true 3D space, like the reference

function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Ritual({ onSave }) {
  const daily = useMemo(loadDaily, []); // today's locked pull, if any
  const dCard = daily ? CARDS.find((c) => c.id === daily.cardId) || null : null;
  const [mode, setMode] = useState("stack"); // stack | fan
  const [order, setOrder] = useState(() => Array.from({ length: N }, (_, i) => i));
  const [chosen, setChosen] = useState(null); // card id that was drawn
  const [drawn, setDrawn] = useState(!!dCard); // flip stage active
  const [card, setCard] = useState(dCard);
  const [reversed, setReversed] = useState(daily ? daily.reversed : false);
  const [flipped, setFlipped] = useState(!!dCard);
  const [revealed, setRevealed] = useState(!!dCard);
  const [note, setNote] = useState(daily?.note || "");
  const [savedThis, setSavedThis] = useState(!!daily?.saved);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const stageRef = useRef(null);
  const revealRef = useRef(null);

  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // visual position of each card id in the current order
  const posOf = useMemo(() => {
    const m = {};
    order.forEach((id, p) => (m[id] = p));
    return m;
  }, [order]);

  // pointer-parallax tilt on the stage (reference technique), off under reduced motion
  const onPointer = (e) => {
    if (reduceMotion || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    setTilt({
      x: ((e.clientX - r.left) / r.width - 0.5) * 7,
      y: ((e.clientY - r.top) / r.height - 0.5) * -5,
    });
  };

  // the fan is trigonometry: rotation ∝ offset, dip ∝ offset², wings pushed back in Z
  const cardStyle = (id) => {
    const p = posOf[id];
    const off = p - (N - 1) / 2;
    const isChosen = chosen === id;
    if (chosen != null) {
      return isChosen
        ? {
            transform: `translateX(-50%) translateY(-70px) translateZ(90px) rotate(0deg) scale(1.1)`,
            zIndex: 99,
          }
        : {
            transform: `translateX(-50%) translateY(60px) translateZ(-40px) rotate(${off * 4}deg)`,
            opacity: 0,
            zIndex: p,
          };
    }
    if (mode === "stack") {
      return {
        transform: `translateX(-50%) translateY(${-p * 0.5}px) translateZ(${p * 0.9}px) rotate(${((p % 3) - 1) * 1.1}deg)`,
        zIndex: p,
      };
    }
    const spread = "min(5.2vw, 33px)";
    return {
      transform: `translateX(-50%) translateX(calc(${off} * ${spread})) translateY(${(off * off * 2.3).toFixed(1)}px) translateZ(${(60 - Math.abs(off) * 7).toFixed(1)}px) rotate(${(off * 4.1).toFixed(2)}deg)`,
      zIndex: 40 - Math.abs(off) * 2,
    };
  };

  const shuffle = () => setOrder((o) => fisherYates(o)); // real Fisher–Yates; transforms make the travel visible
  const fan = () => setMode("fan");
  const gather = () => setMode("stack");

  const draw = (id) => {
    if (mode !== "fan" || chosen != null) return;
    setChosen(id);
    const pick = CARDS[Math.floor(Math.random() * CARDS.length)];
    const rev = Math.random() < 0.3;
    setCard(pick);
    setReversed(rev);
    persistDaily({ date: todayKey(), cardId: pick.id, reversed: rev, note: "", saved: false });
    setTimeout(() => setDrawn(true), 720);
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

  useEffect(() => {
    const onBlur = () => setTilt({ x: 0, y: 0 });
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  return (
    <section className="mc-ritual">
      <div className="mc-eyebrow">THE DAILY MIND CODE</div>
      <h2 className="mc-h2">
        {!drawn && mode === "stack" && "Still your mind. Then fan the deck."}
        {!drawn && mode === "fan" && chosen == null && "Shuffle until it feels right. Then draw."}
        {!drawn && chosen != null && "The card is chosen."}
        {drawn && !flipped && "Turn the card when you're ready."}
        {drawn && flipped && (reversed ? `${card.name} — Reversed` : card.name)}
      </h2>

      {!drawn && (
        <>
          <div
            className="mc-deckarea"
            ref={stageRef}
            onPointerMove={onPointer}
            onPointerLeave={() => setTilt({ x: 0, y: 0 })}
          >
            <div className="mc-deckglow" />
            <div
              className="mc-stage3d"
              style={{ transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}
            >
              {Array.from({ length: N }, (_, id) => (
                <button
                  key={id}
                  className="mc-card3d"
                  style={cardStyle(id)}
                  onClick={() => draw(id)}
                  disabled={mode !== "fan" || chosen != null}
                  aria-label="Draw this card"
                >
                  <CardBack />
                </button>
              ))}
            </div>
          </div>

          <div className="mc-deckcontrols">
            {mode === "stack" ? (
              <button className="mc-cta" onClick={fan}>
                <b>Fan</b>
                <small>Spread the spread</small>
              </button>
            ) : (
              <>
                <button className="mc-ghost" onClick={shuffle} disabled={chosen != null}>
                  <b>Shuffle</b>
                  <small>Fisher–Yates cut</small>
                </button>
                <button className="mc-ghost" onClick={gather} disabled={chosen != null}>
                  <b>Gather</b>
                  <small>Square the deck</small>
                </button>
              </>
            )}
          </div>
          {mode === "fan" && chosen == null && (
            <div className="mc-hint">Trust the first card that calls you.</div>
          )}
        </>
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
