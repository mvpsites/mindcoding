const TABS = [
  ["decode", "Decode", "▲"],
  ["discover", "Discover", "✳"],
  ["recode", "Recode", "◈"],
];

export default function BottomNav({ view, go }) {
  const active = view === "reflect" || view === "myspace" ? "recode" : view;
  return (
    <nav className="mc-bnav" aria-label="Primary">
      {TABS.map(([k, label, glyph]) => (
        <button
          key={k}
          className={`mc-btab ${active === k ? "mc-btabon" : ""} mc-btab-${k}`}
          onClick={() => go(k)}
          aria-current={active === k ? "page" : undefined}
        >
          <span className="mc-bglyph" aria-hidden="true">{glyph}</span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
