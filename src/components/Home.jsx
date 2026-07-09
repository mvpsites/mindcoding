import { CARDS } from "../data/cards.js";
import CardFace from "./CardFace.jsx";
import CardBack from "./CardBack.jsx";

const STEPS = [
  ["I", "Pull the card", "One card, drawn with intention, mirrors the energy moving through your day."],
  ["II", "Reveal the pattern", "Authentic tarot meaning first — then the hidden belief the card is pointing to."],
  ["III", "Recode the belief", "The lack pattern is named, and rewritten into its abundance code."],
  ["IV", "Take aligned action", "Every reading ends in one small, real step. Action is how the recode becomes proof."],
];

export default function Home({ go }) {
  return (
    <section className="mc-home">
      <div className="mc-hero">
        <div className="mc-eyebrow">MINDCOD.ING — THE GILDED SUBCONSCIOUS DECK</div>
        <h1 className="mc-h1">
          Recode your mind.
          <br />
          Rewrite your <span className="mc-foil">reality.</span>
        </h1>
        <p className="mc-sub">
          Tarot reveals the pattern. MindCod.ing helps you recode it — from lack, fear, and doubt into abundance,
          clarity, and aligned action. <em>Pull the card. Read the pattern. Recode the belief.</em>
        </p>
        <div className="mc-herobtns">
          <button className="mc-cta" onClick={() => go("ritual")}>
            <b>Begin</b>
            <small>Pull today's card</small>
          </button>
          <button className="mc-ghost" onClick={() => go("readings")}>
            <b>Readings</b>
            <small>Three-card spreads</small>
          </button>
        </div>
        <div className="mc-herofan" aria-hidden="true">
          {[-24, -12, 0, 12, 24].map((a, i) => (
            <div
              key={i}
              className="mc-herocard"
              style={{
                transform: `rotate(${a}deg)`,
                zIndex: i === 2 ? 9 : 5 - Math.abs(i - 2),
                animationDelay: `${i * 120}ms`,
              }}
            >
              {i === 2 ? <CardFace card={CARDS[2]} small /> : <CardBack />}
            </div>
          ))}
        </div>
      </div>

      <div className="mc-how">
        {STEPS.map(([n, t, d]) => (
          <div key={n} className="mc-step">
            <div className="mc-stepnum">{n}</div>
            <div className="mc-steptitle">{t}</div>
            <div className="mc-stepdesc">{d}</div>
          </div>
        ))}
      </div>

      <div className="mc-philo">
        <div className="mc-affline" />
        <p>
          &ldquo;The card reveals the pattern. The ritual helps you rewrite it. Do not only ask what will happen — ask
          what pattern is creating what keeps happening.&rdquo;
        </p>
        <div className="mc-affline" />
      </div>
    </section>
  );
}
