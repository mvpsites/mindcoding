const ICONS = {
  home: <path d="M3 11 L12 3 L21 11 M6 10 V20 H18 V10" />,
  ritual: <><rect x="7" y="3" width="10" height="17" rx="2" /><path d="M12 9 l1.2 2.2 2.3.4-1.7 1.7.4 2.4-2.2-1.1-2.2 1.1.4-2.4-1.7-1.7 2.3-.4z" /></>,
  readings: <><rect x="9" y="4" width="9" height="15" rx="2" transform="rotate(8 13 11)" /><rect x="6" y="4" width="9" height="15" rx="2" transform="rotate(-8 10 11)" /></>,
  deck: <><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></>,
  saved: <path d="M7 3 H17 V21 L12 17 L7 21 Z" />,
};
const TABS = [
  ["home", "Home"],
  ["ritual", "Daily"],
  ["readings", "Readings"],
  ["deck", "Deck"],
  ["saved", "Saved"],
];

export default function BottomNav({ view, go }) {
  return (
    <nav className="mc-tabbar" aria-label="Primary">
      {TABS.map(([k, label]) => (
        <button key={k} className={`mc-tab ${view === k ? "mc-tabon" : ""}`} onClick={() => go(k)} aria-label={label}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            {ICONS[k]}
          </svg>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
