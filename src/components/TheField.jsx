/* THE FIELD — landing chamber. EXPERIENCE-SPEC §4 copy is verbatim; do not
   edit lines here without editing the spec. Fixed canvas behind scrolling
   movement sections; engine in lib/fieldEngine.js. */
import { useEffect, useRef, useState } from "react";
import { createField } from "../lib/fieldEngine.js";
import { createFieldGL } from "../lib/fieldGL.js";

const CHANNELS = [
  ["ABUNDANCE", "Everything is working in your favor.", "abundance"],
  ["LOVE", "Release what no longer chooses you.", "love"],
  ["PEACE", "The coherent field itself, at rest.", "health"],
  ["CONFIDENCE", "Remember who you are.", "confidence"],
  ["SPIRIT", "Meet the person you are becoming.", "spirit"],
];

export default function TheField({ go, openCollection }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const sectionRefs = useRef([]);
  const dispRef = useRef(null);
  const cohRef = useRef(null);
  const counterRef = useRef(null);
  const [locked, setLocked] = useState(false);
  const [proofSeen, setProofSeen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engineOpts = {
      onTelemetry: (S) => {
        if (dispRef.current) dispRef.current.textContent =
          `DISPLACEMENT ${String(Math.round(S.displacement * 100)).padStart(2, "0")}%`;
        if (cohRef.current) {
          const q = S.coherence >= 1 ? 100 : S.coherence >= 0.81 ? 81 : S.coherence >= 0.47 ? 47 : S.coherence >= 0.12 ? 12 : 0;
          cohRef.current.textContent = S.holding || S.coherence > 0
            ? `SIGNAL DETECTED · COHERENCE ${q}%` : `press and remain`;
        }
      },
      onState: (ev) => {
        if (ev === "locked") setLocked(true);
        if (ev === "reformed") setProofSeen(true);
      },
    };
    let engine = null;
    try { engine = createFieldGL(canvas, engineOpts); } catch (e) { engine = null; }
    if (!engine) engine = createField(canvas, engineOpts); // canvas-2D fallback
    engineRef.current = engine;
    engine.start();

    // EIDOLON reveal grammar: cards fade up + amber bar draws in on view
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => { if (en.isIntersecting) en.target.classList.add("fd-inview"); });
    }, { threshold: 0.25 });
    document.querySelectorAll(".fd-card, .fd-hero .fd-plaque, .fd-hinge").forEach((el) => io.observe(el));

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    let hingeEl = null;
    const onScroll = () => {
      const mid = window.innerHeight * 0.5;
      let active = 0, prog = 0, hinge = false;
      sectionRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) {
          active = i;
          prog = Math.min(1, Math.max(0, (mid - r.top) / r.height));
        }
      });
      if (hingeEl) {
        const hr = hingeEl.getBoundingClientRect();
        hinge = hr.top <= mid && hr.bottom > mid;
      }
      engine.setMovement(active, prog);
      engine.setHinge(hinge);
      if (counterRef.current) counterRef.current.textContent =
        `0${Math.min(5, active)} / 05`;
    };
    hingeEl = document.getElementById("mc-hinge");
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const toLocal = (e) => {
      const r = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    };
    let lastP = null, holdTimer = null, holdActive = false, downP = null;

    const onMove = (e) => {
      const p = toLocal(e);
      const v = lastP ? { vx: p.x - lastP.x, vy: p.y - lastP.y } : { vx: 0, vy: 0 };
      lastP = p;
      engine.pointerMove(p.x, p.y, v.vx, v.vy);
      if (downP && !holdActive && Math.hypot(p.x - downP.x, p.y - downP.y) > 12) {
        clearTimeout(holdTimer); holdTimer = null;
      }
    };
    const onDown = (e) => {
      const p = toLocal(e); downP = p;
      engine.pointerDown(p.x, p.y);
      if (engine.state.mv === 4 && !engine.state.locked) {
        holdTimer = setTimeout(() => { holdActive = true; engine.holdStart(); }, 250);
      }
    };
    const onUp = () => {
      engine.pointerUp();
      clearTimeout(holdTimer); holdTimer = null;
      if (holdActive) { holdActive = false; engine.holdEnd(); }
      downP = null;
    };
    const onTouchMove = (e) => { if (holdActive) e.preventDefault(); onMove(e); };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onUp);

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

  const sec = (i) => (el) => { sectionRefs.current[i] = el; };

  return (
    <div className="fd-root">
      <canvas ref={canvasRef} className="fd-canvas" aria-hidden="true" />
      <div className="fd-vignette" aria-hidden="true" />
      <div className="fd-grainlayer" aria-hidden="true" />

      <header className="fd-head">
        <span className="fd-mark"><span className="fd-dot" aria-hidden="true" /> MINDCOD.ING</span>
        <span className="fd-headmid">THE FIELD OF ATTENTION · ACTIVE SIGNAL</span>
        <span ref={counterRef} className="fd-count">00 / 05</span>
      </header>

      <section ref={sec(0)} className="fd-mv fd-hero">
        <div className="fd-plaque">
          <p className="fd-mono">AN EXPERIMENT IN CONSCIOUS ATTENTION</p>
          <h1 className="fd-h">Your mind is being programmed every&nbsp;day.<br />Choose what gets installed.</h1>
          <p className="fd-sub">Not by accident. By design.</p>
        </div>
        <div className="fd-descend" aria-hidden="true">
          <span className="fd-mono">descend into the field</span>
          <span className="fd-line" />
        </div>
      </section>

      <section ref={sec(1)} className="fd-mv">
        <div className="fd-plaque fd-card">
          <div className="fd-cardhead"><p className="fd-mono">MOVEMENT I · THE INSTALLED DESIRES</p><span className="fd-acc">ACC. MC·001</span></div>
          <div className="fd-beats">
            <p className="fd-beat">You were shown what success looks like.</p>
            <p className="fd-beat">You were taught what safety requires.</p>
            <p className="fd-beat">You learned what it means to be chosen.</p>
            <p className="fd-beat">You inherited even your idea of the sacred.</p>
          </div>
          <h2 className="fd-h">Eventually, the program<br />began speaking in your voice.</h2>
          <p className="fd-mono fd-inscribe">inherited pattern · attractor established</p>
        </div>
      </section>

      <section ref={sec(2)} className="fd-mv">
        <div className="fd-plaque fd-card">
          <div className="fd-cardhead"><p className="fd-mono">MOVEMENT II · THE PROGRAM BENEATH</p><span className="fd-acc">ACC. MC·002</span></div>
          <h2 className="fd-h">The thought is visible.<br />The program is not.</h2>
          <p className="fd-body">A thought repeated becomes a belief. A belief repeated becomes a direction. A direction repeated becomes a life.</p>
          <p className="fd-mono fd-inscribe">4,096 grains · one governing pattern</p>
        </div>
      </section>

      <section ref={sec(3)} className="fd-mv fd-tall">
        <div className="fd-plaque fd-card">
          <div className="fd-cardhead"><p className="fd-mono">MOVEMENT III · THE RETURN</p><span className="fd-acc">ACC. MC·003</span></div>
          <h2 className="fd-h">Try to break it.</h2>
          <p className="fd-mono fd-telemetry">
            <span ref={dispRef}>DISPLACEMENT 00%</span>
            <span className="fd-ox"> · PROGRAM CHANGE 0%</span>
          </p>
          <div className={`fd-reveal ${proofSeen ? "fd-on" : ""}`}>
            <h2 className="fd-h">You moved the grains.<br />Not what calls them back.</h2>
            <p className="fd-body">You can reject the thought. The program keeps producing another one. That is why force fails. That is why January fails.</p>
          </div>
        </div>
        <div id="mc-hinge" className="fd-hinge">
          <h2 className="fd-h fd-hq">If your thoughts are shaping your life,<br />who shaped your thoughts?</h2>
        </div>
      </section>

      <section ref={sec(4)} className="fd-mv fd-tall">
        <div className="fd-plaque fd-card">
          <div className="fd-cardhead"><p className="fd-mono">MOVEMENT IV · ENTRAINMENT</p><span className="fd-acc">ACC. MC·004</span></div>
          <h2 className="fd-h">Do not push.<br />Introduce another order.</h2>
          <p ref={cohRef} className="fd-mono fd-telemetry">press and remain</p>
          <div className={`fd-reveal ${locked ? "fd-on" : ""}`}>
            <h2 className="fd-h">Hold the signal until<br />the field remembers differently.</h2>
          </div>
        </div>
      </section>

      <section ref={sec(5)} className="fd-mv fd-tall">
        <div className="fd-plaque fd-card">
          <div className="fd-cardhead"><p className="fd-mono">MOVEMENT V · THE CHOSEN SIGNAL</p><span className="fd-acc">ACC. MC·005</span></div>
          <h2 className="fd-h">A coherent mind can be pointed anywhere.</h2>
          <p className="fd-body">Code it for abundance, and the field arranges around abundance. Code it for love, and it arranges around love. Code it for awakening, and it arranges around that. The same desires. This time, yours.</p>
          <h2 className="fd-h fd-close">First, see the thought that has been shaping&nbsp;you.<br />Then choose the one that shapes what's&nbsp;next.</h2>
          <nav className="fd-paths">
            <button className="fd-path" onClick={() => go("reflect")}>ENTER THE DECK</button>
            <button className="fd-path" onClick={() => go("recode")}>MIND RECODING PROGRAMS</button>
          </nav>
        </div>
      </section>

      <section className="fd-strip">
        <p className="fd-mono">MIND RECODING PROGRAMS · chosen thoughts, repeated until they hold</p>
        <div className="fd-channels">
          {CHANNELS.map(([name, line, coll]) => (
            <button key={name} className="fd-channel" onClick={() => openCollection(coll)}>
              <span className="fd-mono fd-chname">{name}</span>
              <span className="fd-chline">{line}</span>
            </button>
          ))}
        </div>
        <footer className="fd-foot">
          <span className="fd-mono">MINDCOD.ING</span>
          <span className="fd-footnote">For reflection and personal growth. Not medical, mental-health, financial, or professional advice.</span>
        </footer>
      </section>
    </div>
  );
}
