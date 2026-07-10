import { useState } from "react";
import { CARDS } from "../data/cards.js";
import { LORE } from "../data/lore.js";
import CardFace from "./CardFace.jsx";
import Field from "./Field.jsx";

const SUITS = ["All", "Major Arcana", "Wands", "Cups", "Swords", "Pentacles"];

export default function Deck() {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(null);
  const shown = CARDS.filter((c) => filter === "All" || c.suit === filter);

  return (
    <section className="mc-deckpage">
      <div className="mc-eyebrow">THE DECK</div>
      <h2 className="mc-h2">Seventy-eight arcana, engraved anew</h2>
      <p className="mc-sub">
        The authentic tarot system — all seventy-eight cards, original artwork, engraved anew.
      </p>
      <div className="mc-chips">
        {SUITS.map((s) => (
          <button key={s} className={`mc-chip ${filter === s ? "mc-chipon" : ""}`} onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="mc-grid">
        {shown.map((c) => (
          <button key={c.id} className="mc-gridcard" onClick={() => setOpen(c)}>
            <CardFace card={c} small />
          </button>
        ))}
      </div>
      {shown.length === 0 && <div className="mc-hint">This suit is still being engraved.</div>}

      {open && (
        <div className="mc-modal" onClick={() => setOpen(null)}>
          <div className="mc-modalcard" onClick={(e) => e.stopPropagation()}>
            <div className="mc-modalface">
              <CardFace card={open} />
            </div>
            <div className="mc-modalbody">
              <div className="mc-eyebrow">
                {open.suit.toUpperCase()} · {open.numeral}
              </div>
              <h3 className="mc-h3">{open.name}</h3>
              <p className="mc-cardenergy">{open.energy}</p>
              {LORE[open.id] && (
                <Field label="THE CARD" on>{LORE[open.id].symbolism}</Field>
              )}
              <Field label="UPRIGHT" on>{open.upright}</Field>
              <Field label="REVERSED" on>{open.reversed}</Field>
              {LORE[open.id] && (
                <Field label="THE PATTERN" on>{LORE[open.id].pattern}</Field>
              )}
              <div className="mc-2col">
                <Field label="LOVE" on>{open.love}</Field>
                <Field label="CAREER" on>{open.career}</Field>
                <Field label="MONEY" on>{open.money}</Field>
                <Field label="SPIRITUAL" on>{open.spiritual}</Field>
              </div>
              <Field label="ABUNDANCE RECODE" tone="mc-abun" on>
                &ldquo;{open.recode}&rdquo;
              </Field>
              {LORE[open.id] && (
                <Field label="LIVING THE RECODE" tone="mc-abun" on>{LORE[open.id].recodePath}</Field>
              )}
              <Field label="AFFIRMATION" on>{open.affirmation}</Field>
              <Field label="ALIGNED ACTION" tone="mc-abun" on>
                {open.action}
              </Field>
              <button className="mc-ghost" onClick={() => setOpen(null)}>
                <b>Close</b>
                <small>Back to the deck</small>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
