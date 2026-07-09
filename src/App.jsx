import { useState, useEffect } from "react";
import Ambient from "./components/Ambient.jsx";
import Home from "./components/Home.jsx";
import Ritual from "./components/Ritual.jsx";
import Deck from "./components/Deck.jsx";
import Saved from "./components/Saved.jsx";
import Readings from "./components/Readings.jsx";
import BottomNav from "./components/BottomNav.jsx";
import { loadSaved, persistSaved } from "./lib/storage.js";

const NAV = [
  ["home", "Home"],
  ["ritual", "Daily"],
  ["readings", "Readings"],
  ["deck", "Deck"],
  ["saved", "Saved"],
];

export default function App() {
  const [view, setView] = useState("home");
  const [saved, setSaved] = useState(loadSaved);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    persistSaved(saved);
  }, [saved]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  const onSave = (r) => {
    setSaved((s) => [...s, r]);
    setToast("Reading saved to your archive");
    setTimeout(() => setToast(null), 2600);
  };

  const onRemove = (id) => setSaved((s) => s.filter((r) => r.id !== id));

  return (
    <div className="mc-root">
      <Ambient />
      <nav className="mc-nav">
        <button className="mc-word" onClick={() => setView("home")}>
          <span className="mc-glyph">✳</span>
          <span>
            <span className="mc-wordtitle">MINDCOD.ING</span>
            <span className="mc-wordsub" style={{ display: "block" }}>EST. MMXXVI · RECODING ARCANA</span>
          </span>
        </button>
        <div className="mc-links">
          {NAV.map(([k, label]) => (
            <button key={k} className={`mc-link ${view === k ? "mc-linkon" : ""}`} onClick={() => setView(k)}>
              {label}
              {k === "saved" && saved.length > 0 ? ` · ${saved.length}` : ""}
            </button>
          ))}
        </div>
      </nav>

      <main className="mc-main">
        <div className="mc-view" key={view}>
          {view === "home" && <Home go={setView} />}
          {view === "ritual" && <Ritual onSave={onSave} />}
          {view === "readings" && <Readings onSave={onSave} />}
          {view === "deck" && <Deck />}
          {view === "saved" && <Saved saved={saved} onRemove={onRemove} go={setView} />}
        </div>
      </main>

      <BottomNav view={view} go={setView} />

      <footer className="mc-footer">
        <b>MINDCOD.ING</b>
        Tarot reveals the pattern. MindCod.ing helps you recode it. · Free, always.
        <br />
        For reflection, journaling, and personal growth. MindCod.ing does not predict the future or replace medical,
        mental-health, financial, legal, or professional advice.
      </footer>

      {toast && <div className="mc-toast">{toast}</div>}
    </div>
  );
}
