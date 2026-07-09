export default function Saved({ saved, onRemove, go }) {
  if (saved.length === 0) {
    return (
      <section className="mc-savedpage">
        <div className="mc-eyebrow">YOUR ARCHIVE</div>
        <h2 className="mc-h2">Nothing saved yet</h2>
        <p className="mc-sub">Your archive holds every reading you choose to keep. Pull today's card to begin.</p>
        <button className="mc-cta" onClick={() => go("ritual")}>
          <b>Begin</b>
          <small>Pull today's card</small>
        </button>
      </section>
    );
  }
  const fmt = (iso) =>
    new Date(iso).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return (
    <section className="mc-savedpage">
      <div className="mc-eyebrow">YOUR ARCHIVE</div>
      <h2 className="mc-h2">Saved readings</h2>
      <div className="mc-timeline">
        {[...saved].reverse().map((r) => (
          <article key={r.id} className="mc-entry">
            <div className="mc-entrydate">{fmt(r.date)}</div>
            <div className="mc-entryname">
              {r.name}
              {r.reversed ? " — Reversed" : ""}
            </div>
            <div className="mc-entryaff">&ldquo;{r.affirmation}&rdquo;</div>
            <div className="mc-entryaction">
              <span className="mc-label">ALIGNED ACTION</span> {r.action}
            </div>
            {r.note && (
              <div className="mc-entrynote">
                <span className="mc-label">JOURNAL</span> {r.note}
              </div>
            )}
            <button className="mc-remove" onClick={() => onRemove(r.id)} aria-label="Remove this reading">
              Remove
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
