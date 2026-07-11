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
      let active = 0, centered = 0, hinge = false;
      sectionRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const c = r.top + r.height / 2;
        const cv = 1 - Math.min(1, Math.abs(c - mid) / (r.height * 0.55));
        if (cv > centered) { centered = cv; active = i; }
      });
      if (hingeEl) {
        const hr = hingeEl.getBoundingClientRect();
        hinge = hr.top <= mid && hr.bottom > mid;
      }
      const eased = centered * centered * (3 - 2 * centered); // smoothstep
      if (engine.setExhibit) engine.setExhibit(active, eased);
      else {
        // 2D fallback: map exhibits onto the legacy movement engine
        const MAP = [0, 1, 1, 1, 1, 2, 3, 4, 5];
        const P = [0, 0.08, 0.28, 0.48, 0.68, 0.5, 0.3, 0.5, 0.95];
        engine.setMovement(MAP[Math.min(8, active)], P[Math.min(8, active)]);
      }
      engine.setHinge(hinge);
      if (counterRef.current) counterRef.current.textContent =
        `0${Math.min(8, active)} / 08`;
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
        <span ref={counterRef} className="fd-count">00 / 08</span>
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
        <div className="fd-plaque fd-card" data-acc="MC·001">
          <p className="fd-num">Exhibit I</p>
          <h2 className="fd-cardtitle">What Success Looks Like</h2>
          <div className="fd-meta"><span>Attractor one of four</span><span>Installed in childhood</span><span>Origin: everyone around you</span></div>
          <div className="fd-rule" aria-hidden="true" />
          <h2 className="fd-h">You were shown what success looks like.</h2>
          <p className="fd-body">The image arrived long before you could evaluate it — repeated until it stopped looking like an image and started looking like the goal.</p>
          <p className="fd-tag">Shape held without consent</p>
        </div>
      </section>

      <section ref={sec(2)} className="fd-mv">
        <div className="fd-plaque fd-card" data-acc="MC·002">
          <p className="fd-num">Exhibit II</p>
          <h2 className="fd-cardtitle">What Safety Requires</h2>
          <div className="fd-meta"><span>Attractor two of four</span><span>Revises upward on approach</span><span>Never reports “enough”</span></div>
          <div className="fd-rule" aria-hidden="true" />
          <h2 className="fd-h">You were taught what safety requires.</h2>
          <p className="fd-body">The number that would finally be enough. Notice that it moves every time you get close — that is a feature of the program, not a flaw in you.</p>
          <p className="fd-tag">Attractor active</p>
        </div>
      </section>

      <section ref={sec(3)} className="fd-mv">
        <div className="fd-plaque fd-card" data-acc="MC·003">
          <p className="fd-num">Exhibit III</p>
          <h2 className="fd-cardtitle">What It Means to Be Chosen</h2>
          <div className="fd-meta"><span>Attractor three of four</span><span>Inherited terms of worth</span><span>Still running</span></div>
          <div className="fd-rule" aria-hidden="true" />
          <h2 className="fd-h">You learned what it means to be chosen.</h2>
          <p className="fd-body">Whose attention counts. What must be traded for it. Which version of you is presentable enough to deserve it. None of it was your idea.</p>
          <p className="fd-tag">Inherited · unexamined</p>
        </div>
      </section>

      <section ref={sec(4)} className="fd-mv">
        <div className="fd-plaque fd-card" data-acc="MC·004">
          <p className="fd-num">Exhibit IV</p>
          <h2 className="fd-cardtitle">Even the Sacred</h2>
          <div className="fd-meta"><span>Attractor four of four</span><span>The subtlest installation</span><span>Looks like the way out</span></div>
          <div className="fd-rule" aria-hidden="true" />
          <h2 className="fd-h">You inherited even your idea of the sacred.</h2>
          <p className="fd-body">The posture of peace, the shape of the search itself — handed down like everything else. The deepest program is the one wearing the robes.</p>
          <p className="fd-tag">Handle with attention</p>
        </div>
      </section>

      <section ref={sec(5)} className="fd-mv">
        <div className="fd-plaque fd-card" data-acc="MC·005">
          <p className="fd-num">Exhibit V</p>
          <h2 className="fd-cardtitle">The Program Beneath</h2>
          <div className="fd-meta"><span>Six-fold figure, one sextant bent</span><span>Formed by repetition alone</span><span>Holds its shape unaided</span></div>
          <div className="fd-rule" aria-hidden="true" />
          <h2 className="fd-h">Eventually, the program began speaking in your voice.</h2>
          <p className="fd-body">A thought repeated becomes a belief. A belief repeated becomes a direction. A direction repeated becomes a life. Look closely at the figure: it is almost perfect. One sixth of it was never yours.</p>
          <p className="fd-tag">20,000 grains · one governing pattern</p>
        </div>
      </section>

      <section ref={sec(6)} className="fd-mv fd-tall">
        <div className="fd-plaque fd-card" data-acc="MC·006">
          <p className="fd-num">Exhibit VI</p>
          <h2 className="fd-cardtitle">The Return</h2>
          <div className="fd-meta"><span>Subject: willpower vs. pattern</span><span>Method: direct disturbance</span><span>Result recorded below</span></div>
          <div className="fd-rule" aria-hidden="true" />
          <h2 className="fd-h">Try to break it.</h2>
          <p className="fd-mono fd-telemetry">
            <span ref={dispRef}>DISPLACEMENT 00%</span>
            <span className="fd-ox"> · PROGRAM CHANGE 0%</span>
          </p>
          <div className={`fd-reveal ${proofSeen ? "fd-on" : ""}`}>
            <h2 className="fd-h">You moved the grains.<br />Not what calls them back.</h2>
            <p className="fd-body">You can reject the thought. The program keeps producing another one. That is why force fails. That is why January fails.</p>
            <p className="fd-tag">Displacement is not change</p>
          </div>
        </div>
        <div id="mc-hinge" className="fd-hinge">
          <h2 className="fd-h fd-hq">If your thoughts are shaping your life,<br />who shaped your thoughts?</h2>
        </div>
      </section>

      <section ref={sec(7)} className="fd-mv fd-tall">
        <div className="fd-plaque fd-card" data-acc="MC·007">
          <p className="fd-num">Exhibit VII</p>
          <h2 className="fd-cardtitle">Entrainment</h2>
          <div className="fd-meta"><span>Method: sustained attention</span><span>Thresholds 12 · 47 · 81</span><span>Yields: phyllotaxis bloom</span></div>
          <div className="fd-rule" aria-hidden="true" />
          <h2 className="fd-h">Do not push.<br />Introduce another order.</h2>
          <p ref={cohRef} className="fd-mono fd-telemetry">press and remain</p>
          <div className={`fd-reveal ${locked ? "fd-on" : ""}`}>
            <h2 className="fd-h">Hold the signal until<br />the field remembers differently.</h2>
            <p className="fd-tag">Coherence sustained · six breaths per minute</p>
          </div>
        </div>
      </section>

      <section ref={sec(8)} className="fd-mv fd-tall">
        <div className="fd-plaque fd-card" data-acc="MC·008">
          <p className="fd-num">Exhibit VIII</p>
          <h2 className="fd-cardtitle">The Chosen Signal</h2>
          <div className="fd-meta"><span>Same mechanism · new author</span><span>Five channels, one practice</span><span>Condenses to instrument</span></div>
          <div className="fd-rule" aria-hidden="true" />
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
