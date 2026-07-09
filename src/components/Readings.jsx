import { useState } from "react";
import { SPREADS } from "../data/readings.js";
import Spread from "./Spread.jsx";

export default function Readings({ onSave }) {
  const [active, setActive] = useState(null);
  if (active) return <Spread config={active} onSave={onSave} onExit={() => setActive(null)} />;
  return (
    <section className="mc-readingspage">
      <div className="mc-eyebrow">READINGS</div>
      <h2 className="mc-h2">Choose your ritual</h2>
      <p className="mc-sub">Three-card spreads. Each ends the same way every reading here does: a belief to recode, an affirmation, a prompt, and one aligned action.</p>
      <div className="mc-spreadlist">
        {SPREADS.map((s) => (
          <button key={s.id} className="mc-spreadcard" onClick={() => setActive(s)}>
            <div className="mc-spreadtitle">{s.title}</div>
            <div className="mc-spreadsub">{s.sub}</div>
            <div className="mc-spreadintro">{s.intro}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
