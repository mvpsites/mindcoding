/* THE FIELD v5 — five movements on the EIDOLON engine. Copy is Jad's,
   verbatim from the 2026-07-11 launch brief. The particle field IS the
   website; plaques carry only the lines below. */
import { useEffect, useRef, useState } from "react";
import { createFieldV5 } from "../lib/fieldV5.js";
import { createField } from "../lib/fieldEngine.js";
import "../styles/field5.css";

const CHOICES = [
  { key: "mountain", label: "Abundance", coll: "abundance" },
  { key: "heart", label: "Love", coll: "love" },
  { key: "flame", label: "Spiritual Growth", coll: "spirit" },
];

export default function TheFieldV5({ go, openCollection }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const sectionRefs = useRef([]);
  const dispRef = useRef(null);
  const focRef = useRef(null);
  const counterRef = useRef(null);
  const [torn, setTorn] = useState(false);
  const [choice, setChoice] = useState(null);
  const [locked, setLocked] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engineOpts = {
      onTelemetry: (S) => {
        if (dispRef.current)
          dispRef.current.textContent =
            `DISPLACEMENT ${String(Math.round(S.displacement * 100)).padStart(2, "0")}% · PATTERN CHANGE 0%`;
        if (focRef.current) {
          const q = S.coherence >= 1 ? 100 : S.coherence >= 0.81 ? 81 : S.coherence >= 0.47 ? 47 : S.coherence >= 0.12 ? 12 : 0;
          focRef.current.textContent = !S.choice
            ? "choose, then press and hold"
            : S.locked ? "FOCUS 100%"
            : S.holding || S.coherence > 0 ? `FOCUS ${q}%` : "press and hold";
        }
      },
      onState: (ev) => {
        if (ev === "reformed") setTorn(true);
        if (ev === "locked") setLocked(true);
      },
    };
    let engine = null;
    try { engine = createFieldV5(canvas, engineOpts); } catch (e) { engine = null; }
    if (!engine) {
      engine = createField(canvas, engineOpts); // WebGL-unavailable fallback only
      setWebgl(false);
    }
    engineRef.current = engine;
    engine.start();
    let cancelHoldOnScroll = () => {};

    const io = new IntersectionObserver((es) => {
      es.forEach((en) => { if (en.isIntersecting) en.target.classList.add("f5-inview"); });
    }, { threshold: 0.25 });
    document.querySelectorAll(".f5-plaque, .f5-beat").forEach((el) => io.observe(el));

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    const onScroll = () => {
      cancelHoldOnScroll();
      const mid = window.innerHeight * 0.5;
      let active = 0, centered = 0, sub = 0;
      sectionRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const c = r.top + r.height / 2;
        const cv = 1 - Math.min(1, Math.abs(c - mid) / (r.height * 0.55));
        if (cv > centered) { centered = cv; active = i; }
      });
      const el1 = sectionRefs.current[1];
      if (el1) {
        const r = el1.getBoundingClientRect();
        sub = Math.min(1, Math.max(0, (mid - r.top) / (r.height || 1)));
      }
      const eased = centered * centered * (3 - 2 * centered);
      if (engine.setMovement) engine.setMovement(active, eased, sub);
      else engine.setMovement?.(active, eased);
      if (counterRef.current)
        counterRef.current.textContent = `0${Math.min(5, active)} / 05`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const toLocal = (e) => {
      const t = e.touches ? e.touches[0] : e;
      return { x: t.clientX, y: t.clientY };
    };
    let holdTimer = null, holdActive = false, downP = null, stirLock = false;
    const cancelHold = () => { clearTimeout(holdTimer); holdTimer = null; };
    cancelHoldOnScroll = cancelHold;
    const onMove = (e) => {
      const p = toLocal(e);
      engine.pointerMove(p.x, p.y);
      if (downP && !holdActive && Math.hypot(p.x - downP.x, p.y - downP.y) > 12) cancelHold();
    };
    const onDown = (e) => {
      if (e.target.closest("button, a")) return;
      if (e.touches && e.touches.length > 1) return;   // pinch/zoom: never ours
      const p = toLocal(e); downP = p; stirLock = false;
      engine.pointerDown(p.x, p.y);
      const S = engine.state || {};
      if (S.mv === 4 && S.choice && !S.locked) {
        holdTimer = setTimeout(() => { holdActive = true; engine.holdStart(); }, 250);
      }
    };
    const onUp = () => {
      engine.pointerUp();
      cancelHold();
      if (holdActive) { holdActive = false; engine.holdEnd(); }
      downP = null; stirLock = false;
    };
    // Touch: vertical scrolling stays native (touch-action: pan-y). We only
    // capture the gesture (a) during an active hold, or (b) in THE HIDDEN
    // PATTERN once the visitor clearly begins a horizontal swipe.
    const onTouchMove = (e) => {
      const p = toLocal(e);
      if (downP && !stirLock && !holdActive) {
        const dx = p.x - downP.x, dy = p.y - downP.y;
        const S = engine.state || {};
        if (S.mv === 2 && Math.abs(dx) > 24 && Math.abs(dx) > Math.abs(dy) * 1.5) stirLock = true;
      }
      if ((holdActive || stirLock) && e.cancelable) e.preventDefault();
      onMove(e);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onUp);

    // capture helper: /preview/?movement=3 jumps straight to a movement
    const mvParam = new URLSearchParams(location.search).get("movement");
    if (mvParam != null) {
      const el = sectionRefs.current[Math.max(0, Math.min(5, +mvParam))];
      if (el) setTimeout(() => el.scrollIntoView({ block: "center", behavior: "instant" }), 60);
    }

    return () => {
      engine.stop();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  const pick = (key) => {
    setChoice(key);
    setLocked(false);
    engineRef.current?.setChoice?.(key);
  };
  const sec = (i) => (el) => { sectionRefs.current[i] = el; };

  return (
    <div className="f5-root">
      <canvas ref={canvasRef} className="f5-canvas" aria-hidden="true" />
      <div className="f5-vignette" aria-hidden="true" />
      <div className="f5-grain" aria-hidden="true" />

      <header className="f5-head">
        <span className="f5-brand"><span className="f5-dot" aria-hidden="true" /> MINDCOD.ING</span>
        <span ref={counterRef} className="f5-count">00 / 05</span>
      </header>

      {/* 00 / 05 — THE FIELD */}
      <section ref={sec(0)} className="f5-mv f5-hero">
        <div className="f5-plaque f5-center">
          <h1 className="f5-h1">Your mind is being<br className="f5-deskbr" /> shaped every&nbsp;day.</h1>
          <p className="f5-sub">Most of it happens without you noticing.</p>
          {!webgl && (
            <p className="f5-fallback">The field needs WebGL to move. Everything below still works.</p>
          )}
        </div>
        <div className="f5-cue" aria-hidden="true">
          <span className="f5-cueword">Enter the field</span>
          <span className="f5-cueline" />
        </div>
      </section>

      {/* 01 / 05 — THE LONGINGS: three forms, ONE movement */}
      <section ref={sec(1)} className="f5-mv f5-longings">
        <div className="f5-beat"><h2 className="f5-h">You learned what it means to succeed.</h2></div>
        <div className="f5-beat"><h2 className="f5-h">You learned what it means to be loved.</h2></div>
        <div className="f5-beat"><h2 className="f5-h">You learned what it means to awaken.</h2></div>
        <div className="f5-beat f5-beat-close">
          <p className="f5-body">The longing may be yours.<br />The meaning attached to it may have been inherited.</p>
        </div>
      </section>

      {/* 02 / 05 — THE HIDDEN PATTERN */}
      <section ref={sec(2)} className="f5-mv">
        <div className="f5-plaque">
          <h2 className="f5-h">The thought is visible.<br />The pattern beneath it is not.</h2>
          <p className="f5-instr">Try to break it.</p>
          <p ref={dispRef} className="f5-mono f5-telemetry">DISPLACEMENT 00% · PATTERN CHANGE 0%</p>
          <div className={`f5-reveal ${torn ? "f5-on" : ""}`}>
            <p className="f5-body">You moved the particles.<br />Not what brings them back.</p>
          </div>
        </div>
      </section>

      {/* 03 / 05 — THE MIRROR */}
      <section ref={sec(3)} className="f5-mv">
        <div className="f5-plaque">
          <h2 className="f5-h">The card is not a command.<br />It is a mirror.</h2>
          <p className="f5-body">A symbol can help you notice what words sometimes miss.</p>
          <button className="f5-cta" onClick={() => go("reflect")}>Draw With Intention</button>
        </div>
      </section>

      {/* 04 / 05 — THE CHOICE */}
      <section ref={sec(4)} className="f5-mv f5-tall">
        <div className="f5-plaque">
          <h2 className="f5-h">Awareness reveals the pattern.<br />Attention gives it direction.</h2>
          <p className="f5-instr">Choose what you want to strengthen.</p>
          <div className="f5-choices">
            {CHOICES.map((c) => (
              <button
                key={c.key}
                className={`f5-choice ${choice === c.key ? "f5-chosen" : ""}`}
                onClick={() => pick(c.key)}
              >{c.label}</button>
            ))}
          </div>
          <p ref={focRef} className="f5-mono f5-telemetry">choose, then press and hold</p>
          <div className={`f5-reveal ${locked ? "f5-on" : ""}`}>
            <p className="f5-body">What you repeatedly return to becomes easier to believe, notice and act upon.</p>
          </div>
        </div>
      </section>

      {/* 05 / 05 — THE PRACTICE */}
      <section ref={sec(5)} className="f5-mv f5-tall">
        <div className="f5-plaque">
          <h2 className="f5-h">Choose what you will practice.</h2>
          <p className="f5-body">Free music, affirmations, visualization and life scripts for the direction you choose.</p>
          <div className="f5-paths">
            <button className="f5-cta" onClick={() => openCollection("abundance")}>Explore Abundance</button>
            <button className="f5-cta" onClick={() => openCollection("love")}>Explore Love</button>
            <button className="f5-cta" onClick={() => openCollection("spirit")}>Explore Spiritual Growth</button>
          </div>
          <p className="f5-close">Everything is free.<br />Use what helps. Share what may help another.</p>
        </div>
      </section>

      <footer className="f5-foot">
        <span className="f5-mono">MINDCOD.ING</span>
        <span className="f5-footnote">For reflection and personal growth. Not medical, mental-health, financial, or professional advice.</span>
      </footer>
    </div>
  );
}
