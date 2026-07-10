import { byType } from "../data/library.js";
import ContentCard from "./ContentCard.jsx";
import { Reveal } from "../lib/motion.jsx";

export default function DecodeTab({ openItem }) {
  const items = byType("decode");
  return (
    <section className="mc-decodetab">
      <Reveal className="mc-decodebanner">
        <img src={import.meta.env.BASE_URL + "art/scene-decode.webp"} alt="" />
        <span className="mc-decodeveil" aria-hidden="true" />
      </Reveal>
      <Reveal className="mc-eyebrow mc-eyebrow-v">DECODE</Reveal>
      <Reveal as="h2" delay={90} className="mc-h2">See the programming.</Reveal>
      <Reveal as="p" delay={180} className="mc-lead">
        Persuasion patterns, media framing, compliance techniques — the scripts running on you every day.
        Learn to recognize them. Recognition is the off switch.
      </Reveal>
      <div className="mc-decodefeed">
        {items.map((x, i) => (
          <Reveal key={x.id} delay={i * 110}>
            <ContentCard item={x} onOpen={openItem} wide />
          </Reveal>
        ))}
      </div>
      <Reveal as="p" className="mc-decodeethic">
        Decode teaches recognition, never technique. How these patterns work on you — not how to run them on anyone.
      </Reveal>
    </section>
  );
}
