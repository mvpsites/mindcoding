import { useEffect, useMemo, useRef, useState } from "react";
import { CARDS } from "../data/cards.js";
import CardBack from "./CardBack.jsx";

/* ═══ THE COSMOS, v3 — a physics field, not an animation ═══
   Every card wanders its own non-repeating path (blended sine drift),
   lives at a depth (scale/opacity/z), and the whole field responds to
   the pointer: nearby cards lean in, lift, and glow — magnetic.
   One rAF loop writes transforms directly; React never touches frames.
   2D transforms only (Safari rules). Honors prefers-reduced-motion. */

const TAU = Math.PI * 2;
const rnd = (a, b) => a + Math.random() * (b - a);

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dealParams(c) {
  // fresh base position, depth, and wander character
  c.bx = rnd(0.06, 0.94);
  c.by = rnd(0.07, 0.9);
  c.depth = rnd(0, 1);
  const amp = 0.55 + c.depth * 0.75; // near cards roam more
  c.ax = rnd(16, 38) * amp;
  c.ay = rnd(13, 30) * amp;
  c.f1 = rnd(0.045, 0.11); c.p1 = rnd(0, TAU);
  c.f2 = rnd(0.025, 0.07); c.p2 = rnd(0, TAU);
  c.f3 = rnd(0.045, 0.11); c.p3 = rnd(0, TAU);
  c.f4 = rnd(0.02, 0.06);  c.p4 = rnd(0, TAU);
  c.rf = rnd(0.02, 0.055); c.rp = rnd(0, TAU); c.ra = rnd(3, 7);
  return c;
}

function makeField() {
  return shuffled(CARDS.map((x) => x.id)).map((cardId) =>
    dealParams({ cardId, x: 0, y: 0, r: 0, s: 0, h: 0, el: null })
  );
}

export default function Cosmos({ pickedIds = [], onPick, done = false, hint }) {
  const [cards] = useState(makeField);
  const [phase, setPhase] = useState("enter"); // enter | drift | gather | scatter
  const phaseRef = useRef("enter");
  const pickedRef = useRef(pickedIds);
  const doneRef = useRef(done);
  const wrap = useRef(null);
  const pointer = useRef({ x: 0, y: 0, on: false });
  const timers = useRef([]);
  pickedRef.current = pickedIds;
  doneRef.current = done;

  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const setPhaseBoth = (p) => { phaseRef.current = p; setPhase(p); };

  useEffect(() => {
    const field = wrap.current;
    if (!field) return;

    let rect = field.getBoundingClientRect();
    const onResize = () => { rect = field.getBoundingClientRect(); };
    window.addEventListener("resize", onResize, { passive: true });

    let rectDirty = false;
    const refreshRect = () => { if (!rectDirty) { rectDirty = true; requestAnimationFrame(() => { rect = field.getBoundingClientRect(); rectDirty = false; }); } };
    window.addEventListener("scroll", refreshRect, { passive: true });
    const onMove = (e) => {
      const t = e.touches ? e.touches[0] : e;
      pointer.current = { x: t.clientX - rect.left, y: t.clientY - rect.top, on: true };
    };
    const onLeave = () => { pointer.current.on = false; };
    field.addEventListener("mousemove", onMove, { passive: true });
    field.addEventListener("mouseleave", onLeave, { passive: true });
    field.addEventListener("touchstart", onMove, { passive: true });
    field.addEventListener("touchmove", onMove, { passive: true });
    field.addEventListener("touchend", onLeave, { passive: true });

    // start clustered at the heart of the field: the cards deal themselves out
    for (const c of cards) {
      c.x = rect.width * 0.5 + rnd(-14, 14);
      c.y = rect.height * 0.46 + rnd(-10, 10);
      c.s = 0.2;
      if (c.el) { c.el.style.opacity = String(0.62 + c.depth * 0.38); c.el.style.zIndex = String(2 + Math.round(c.depth * 8)); }
    }

    if (reduceMotion) {
      // static, honest placement — no loop
      for (const c of cards) {
        if (!c.el) continue;
        c.el.style.transform = `translate(${c.bx * rect.width}px, ${c.by * rect.height}px) translate(-50%,-50%) rotate(${rnd(-8, 8)}deg) scale(${0.74 + c.depth * 0.4})`;
        c.el.style.opacity = String(0.62 + c.depth * 0.38);
      }
      setPhaseBoth("drift");
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }

    timers.current.push(setTimeout(() => setPhaseBoth("drift"), 1500));

    let raf = 0;
    let prevNearest = null;
    const MAG_R = 150;          // magnetic radius
    const loop = () => {
      const t = performance.now() / 1000;
      const ph = phaseRef.current;
      const pt = pointer.current;
      const W = rect.width, H = rect.height;
      let nearest = null, nearestD = 1e9;

      for (const c of cards) {
        if (!c.el) continue;
        const isPicked = pickedRef.current.includes(c.cardId);

        let gx, gy, gr, k;
        if (isPicked) {
          // the chosen card swoops to the heart of the field
          gx = W * 0.5; gy = H * 0.44; gr = 0; k = 0.1;
        } else if (ph === "gather") {
          gx = W * 0.5 + Math.sin(t * 2 + c.p1) * 7;
          gy = H * 0.44 + Math.cos(t * 2 + c.p2) * 5;
          gr = (c.p1 - Math.PI) * 3.2;
          k = 0.09;
        } else {
          // stately non-repeating wander
          gx = c.bx * W
            + Math.sin(t * TAU * c.f1 + c.p1) * c.ax
            + Math.sin(t * TAU * c.f2 + c.p2) * c.ax * 0.55;
          gy = c.by * H
            + Math.cos(t * TAU * c.f3 + c.p3) * c.ay
            + Math.sin(t * TAU * c.f4 + c.p4) * c.ay * 0.55;
          gr = Math.sin(t * TAU * c.rf + c.rp) * c.ra;
          k = ph === "enter" || ph === "scatter" ? 0.055 : 0.075;
        }

        // magnetic pointer: nearby cards lean toward the cursor and lift
        let hot = 0;
        if (pt.on && ph === "drift" && !doneRef.current && !isPicked) {
          const dx = pt.x - c.x, dy = pt.y - c.y;
          const d = Math.hypot(dx, dy);
          if (d < MAG_R && d > 0.001) {
            const f = (1 - d / MAG_R) ** 2;
            gx += (dx / d) * f * 34 * (0.6 + c.depth * 0.7);
            gy += (dy / d) * f * 26 * (0.6 + c.depth * 0.7);
            gr += (dx / d) * f * 7; // lean into the pull
            hot = f;
            if (d < nearestD) { nearestD = d; nearest = c; }
          }
        }

        c.x += (gx - c.x) * k;
        c.y += (gy - c.y) * k;
        c.r += (gr - c.r) * 0.08;
        c.h += (hot - c.h) * 0.14;
        const sTarget = isPicked ? 1.9 : (ph === "gather" ? 0.92 : 0.74 + c.depth * 0.4) + c.h * 0.2;
        c.s += (sTarget - c.s) * 0.1;

        // glow bookkeeping inline (prevNearest from last frame; 1-frame lag is invisible)
        const should = c === prevNearest && !isPicked;
        if (should !== c._near) {
          c._near = should;
          c.el.classList.toggle("mc-starnear", should);
          c.el.style.zIndex = should ? "40" : isPicked ? "60" : String(2 + Math.round(c.depth * 8));
        } else if (isPicked && c.el.style.zIndex !== "60") {
          c.el.style.zIndex = "60";
        }

        c.el.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px) translate(-50%,-50%) rotate(${c.r.toFixed(2)}deg) scale(${c.s.toFixed(3)})`;
      }
      prevNearest = nearestD < 110 ? nearest : null;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", refreshRect);
      timers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function doShuffle() {
    if (done || pickedIds.length > 0 || phaseRef.current !== "drift") return;
    if (reduceMotion) return; // static field: nothing meaningful to show
    setPhaseBoth("gather");
    timers.current.push(
      setTimeout(() => {
        // true re-deal while stacked: identities shuffle across slots, fresh bases
        const ids = shuffled(cards.map((c) => c.cardId));
        cards.forEach((c, i) => { c.cardId = ids[i]; dealParams(c); });
        setPhaseBoth("scatter");
      }, 1050),
      setTimeout(() => setPhaseBoth("drift"), 2100)
    );
  }

  const shuffling = phase === "gather" || phase === "scatter";

  return (
    <>
      <div
        ref={wrap}
        className={`mc-cosmos ${phase === "gather" ? "mc-cosmos-gather" : ""}`}
        role="group"
        aria-label="Seventy-eight cards adrift. Choose one."
      >
        <div className="mc-deckglow" />
        {cards.map((c, i) => {
          const picked = pickedIds.includes(c.cardId);
          return (
            <button
              key={i}
              ref={(el) => { c.el = el; }}
              className={`mc-star ${picked ? "mc-starpicked" : ""} ${done && !picked ? "mc-starfade" : ""}`}
              onClick={() => !done && !picked && !shuffling && onPick(c.cardId)}
              disabled={done || picked || shuffling}
              aria-label="Draw this card"
            >
              <CardBack />
            </button>
          );
        })}
      </div>
      <div className="mc-deckcontrols">
        <button className="mc-ghost mc-small" onClick={doShuffle} disabled={done || pickedIds.length > 0 || shuffling}>
          <b>{shuffling ? "Shuffling…" : "Shuffle"}</b>
        </button>
      </div>
      {hint && <div className="mc-hint">{hint}</div>}
    </>
  );
}
