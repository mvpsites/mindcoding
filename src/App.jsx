import { useState, useEffect } from "react";
import Ambient from "./components/Ambient.jsx";
import Discover from "./components/Discover.jsx";
import DecodeTab from "./components/DecodeTab.jsx";
import RecodeTab from "./components/RecodeTab.jsx";
import Reflect from "./components/Reflect.jsx";
import MySpace from "./components/MySpace.jsx";
import BottomNav from "./components/BottomNav.jsx";
import { ContentModal } from "./components/ContentCard.jsx";
import { loadSaved, persistSaved } from "./lib/storage.js";

const TABS = [
  ["discover", "Discover"],
  ["decode", "Decode"],
  ["recode", "Recode"],
];

export default function App() {
  const [view, setView] = useState("discover");
  const [scrolled, setScrolled] = useState(false);
  const [focusCollection, setFocusCollection] = useState(null);
  const [openItem, setOpenItem] = useState(null);
  const [saved, setSaved] = useState(loadSaved);
  const [toast, setToast] = useState(null);

  useEffect(() => { persistSaved(saved); }, [saved]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [view]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const say = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };
  const onSave = (r) => { setSaved((s) => [...s, r]); say("Reading saved to My Space"); };
  const onRemove = (id) => setSaved((s) => s.filter((r) => r.id !== id));

  const go = (v) => { setFocusCollection(null); setView(v); };
  const openCollection = (id) => { setFocusCollection(id); setView("recode"); };

  return (
    <div className="mc-root">
      <Ambient />
      <header className={`mc-nav ${scrolled ? "mc-nav-scrolled" : ""}`}>
        <button className="mc-word" onClick={() => go("discover")}>
          <span className="mc-glyph" aria-hidden="true">✳</span> MIND CODING
        </button>
        <div className="mc-toptabs">
          {TABS.map(([k, label]) => (
            <button
              key={k}
              className={`mc-link ${view === k || (k === "recode" && (view === "reflect")) ? "mc-linkon" : ""}`}
              onClick={() => go(k)}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="mc-me" onClick={() => go("myspace")} aria-label="My Space">
          <span aria-hidden="true">◐</span>
        </button>
      </header>

      <main className="mc-main">
        <div className="mc-view" key={view + (focusCollection || "")}>
          {view === "discover" && <Discover go={go} openItem={setOpenItem} openCollection={openCollection} />}
          {view === "decode" && <DecodeTab openItem={setOpenItem} />}
          {view === "recode" && (
            <RecodeTab openItem={setOpenItem} go={go} focusCollection={focusCollection} onToast={say} />
          )}
          {view === "reflect" && <Reflect onSave={onSave} />}
          {view === "myspace" && (
            <MySpace saved={saved} onRemove={onRemove} go={go} openItem={setOpenItem} />
          )}
        </div>
      </main>

      {openItem && <ContentModal item={openItem} onClose={() => setOpenItem(null)} onToast={say} />}
      {toast && <div className="mc-toast" role="status">{toast}</div>}
      <BottomNav view={view} go={go} />
      <footer className="mc-foot">
        <div className="mc-footmark">MIND CODING</div>
        <p>
          Decode the programming. Recode your mind. · Free, always.
          <br />
          For reflection, journaling, and personal growth. Mind Coding does not predict the future or replace
          medical, mental-health, financial, legal, or professional advice.
        </p>
      </footer>
    </div>
  );
}
