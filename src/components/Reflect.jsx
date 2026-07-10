import { useState } from "react";
import Ritual from "./Ritual.jsx";
import Readings from "./Readings.jsx";
import Deck from "./Deck.jsx";

const SUB = [
  ["daily", "Daily"],
  ["readings", "Readings"],
  ["deck", "Deck"],
];

export default function Reflect({ onSave }) {
  const [sub, setSub] = useState("daily");
  return (
    <section className="mc-reflect">
      <div className="mc-eyebrow">RECODE · REFLECT</div>
      <div className="mc-subnav" role="tablist" aria-label="Reflect sections">
        {SUB.map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={sub === k}
            className={`mc-subtab ${sub === k ? "mc-subtabon" : ""}`}
            onClick={() => setSub(k)}
          >
            {label}
          </button>
        ))}
      </div>
      <div key={sub} className="mc-view">
        {sub === "daily" && <Ritual onSave={onSave} />}
        {sub === "readings" && <Readings onSave={onSave} />}
        {sub === "deck" && <Deck />}
      </div>
    </section>
  );
}
