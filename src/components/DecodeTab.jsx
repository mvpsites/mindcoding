import { byType } from "../data/library.js";
import ContentCard from "./ContentCard.jsx";

export default function DecodeTab({ openItem }) {
  const items = byType("decode");
  return (
    <section className="mc-decodetab">
      <div className="mc-eyebrow mc-eyebrow-v">DECODE</div>
      <h2 className="mc-h2">See the programming.</h2>
      <p className="mc-lead">
        Persuasion patterns, media framing, compliance techniques — the scripts running on you every day.
        Learn to recognize them. Recognition is the off switch.
      </p>
      <div className="mc-decodefeed">
        {items.map((x) => (
          <ContentCard key={x.id} item={x} onOpen={openItem} wide />
        ))}
      </div>
      <p className="mc-decodeethic">
        Decode teaches recognition, never technique. How these patterns work on you — not how to run them on anyone.
      </p>
    </section>
  );
}
