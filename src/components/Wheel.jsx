import { useEffect, useRef } from "react";
import { CARDS } from "../data/cards.js";

/* THE WHEEL — the deck as a spinnable arc. Session-locked interaction (2026-07-10):
   · Mobile: drag/flick with momentum (decay .955) + magnetic snap (.16 ease)
   · Desktop: hover-steer — cursor position drives spin; dead zone 26% each side of
     center; quadratic speed curve, max 0.13 rad/frame at the rim ("much better, faster")
   · Draw: press-and-hold the centered card 900ms; a ring charges; early release cancels.
     Moving >9px converts the hold into a drag. After a draw, dragging resumes without
     lifting (e.buttons check). Pointer capture keeps gestures alive outside the stage.
   Drop-in replacement for the old Cosmos picker: same props. */

const HOLD_MS = 900;
const STEP = 0.24;
const DECAY = 0.955;
const SNAP = 0.16;
const DEADZONE = 0.26;
const MAXSTEER = 0.13;
const CIRC = 377; // 2πr for r=60 ring

/* Wash-shuffle intro (PIVOT-SPEC): swirl the pile → release → fan onto the wheel.
   The swirl gesture accumulates entropy which seeds the Fisher–Yates, so the
   user's hands literally shuffle the deck. Additive pre-phase only — all wheel
   tunings above are untouched. */
const WASH_VISIBLE = 14;   // cards shown in the pile (rest stay opacity 0 — perf flat)
const WASH_DECAY = 0.96;   // pile spin momentum decay
const FAN_MS = 750;        // pile → wheel fan-out transition

const ART = (f) => import.meta.env.BASE_URL + f;

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Deterministic PRNG seeded by the wash gesture. */
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(a, seed) {
  const rnd = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Wheel({ pickedIds = [], onPick, done = false, hint = null }) {
  const stageRef = useRef(null);
  const ringRef = useRef(null);
  const ringProgRef = useRef(null);
  const ctrRef = useRef(null);
  const washRef = useRef(null);
  const howRef = useRef(null);
  const cardEls = useRef({});
  const S = useRef(null); // mutable interaction state

  if (!S.current) {
    const initial = shuffle(CARDS.map((c) => c.id).filter((id) => !pickedIds.includes(id)));
    const fresh = pickedIds.length === 0 && !done; // wash only opens an untouched reading
    S.current = {
      order: initial,
      rendered: [...initial], // stable render list — physics order mutates, DOM does not
      rot: 0, vel: 0,
      dragging: false, holding: false, chargeStart: 0,
      lastX: 0, moved: 0, hoverX: null,
      raf: null, cx: 190, R: 235, W: 96, H: 134, top: 34,
      done, onPick,
      // wash phase
      phase: fresh ? "wash" : "wheel",
      washing: false,
      entropy: (Date.now() & 0xffffffff) >>> 0,
      stirred: 0,               // total angular stir (radians) — feedback only
      pileAngle: 0, pileVel: 0,
      lastAng: null, lastY: 0,
      fanUntil: 0,
      washSet: initial.slice(0, WASH_VISIBLE).map((id, i) => ({
        id,
        orbitR: 8 + (i * 37) % 40,
        ph: (i * 2.399) % (Math.PI * 2), // golden-angle spacing — even, organic pile
        spin: 0.6 + ((i * 53) % 80) / 100,
        tilt: -24 + (i * 29) % 49,
      })),
    };
    S.current.rot = Math.floor(S.current.order.length / 2) * STEP;
  }
  // keep latest props visible to the imperative loop
  S.current.done = done;
  S.current.onPick = onPick;

  useEffect(() => {
    const st = S.current;
    const stage = stageRef.current;
    const ring = ringRef.current;
    const prog = ringProgRef.current;

    const measure = () => {
      const w = stage.clientWidth || 380;
      st.cx = w / 2;
      const compact = w < 560;
      st.W = compact ? 96 : 118;
      st.H = compact ? 134 : 165;
      st.R = compact ? 235 : 300;
      st.top = compact ? 34 : 30;
      ring.style.left = st.cx - 76 + "px";
      ring.style.top = st.top + st.H / 2 - 76 + "px";
    };
    measure();
    window.addEventListener("resize", measure);

    const layout = () => {
      const n = st.order.length;
      if (ctrRef.current) {
        const cpos = Math.min(Math.max(Math.round(st.rot / STEP), 0), Math.max(n - 1, 0));
        ctrRef.current.textContent = n ? `${cpos + 1} / ${n} in the spread` : "";
      }
      for (let pos = 0; pos < n; pos++) {
        const el = cardEls.current[st.order[pos]];
        if (!el) continue;
        const a = pos * STEP - st.rot;
        const abs = Math.abs(a);
        if (abs > 1.25) { if (el.style.opacity !== "0") { el.style.opacity = 0; el.style.pointerEvents = "none"; } continue; }
        el.style.opacity = Math.min(1, 1.4 - abs);
        const near = Math.max(0, 1 - abs / STEP);
        const x = st.cx + st.R * Math.sin(a) - st.W / 2;
        const y = st.top + st.R * (1 - Math.cos(a)) - 16 * near;
        el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(a * 43).toFixed(1)}deg) scale(${(1 + 0.12 * near).toFixed(3)})`;
        el.style.zIndex = Math.round(100 - abs * 40);
      }
    };

    /* ——— Wash phase ——— */
    const pileCy = () => st.top + st.H / 2 + 18;
    const layoutWash = () => {
      if (ctrRef.current && ctrRef.current.textContent !== "") ctrRef.current.textContent = "";
      const cy = pileCy();
      for (const w of st.washSet) {
        const el = cardEls.current[w.id];
        if (!el) continue;
        const a = st.pileAngle * w.spin + w.ph;
        const x = st.cx + Math.cos(a) * w.orbitR - st.W / 2;
        const y = cy + Math.sin(a) * w.orbitR * 0.62 - st.H / 2;
        el.style.opacity = 0.92;
        el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(w.tilt + a * 18).toFixed(1)}deg)`;
        el.style.zIndex = 50 + Math.round(Math.sin(a) * 20);
      }
    };
    const fanOut = () => {
      if (st.phase !== "wash") return;
      st.phase = "wheel";
      st.washing = false;
      // gesture entropy seeds the deck order — the swirl IS the shuffle
      st.entropy = (st.entropy ^ (performance.now() * 1000)) >>> 0;
      seededShuffle(st.order, st.entropy);
      st.rot = Math.floor(st.order.length / 2) * STEP;
      st.vel = 0;
      if (washRef.current) washRef.current.style.display = "none";
      if (howRef.current) howRef.current.style.display = "";
      // hidden (non-pile) cards start from the pile center too — never from the stage origin
      const inPile = new Set(st.washSet.map((w) => w.id));
      const cy = pileCy();
      for (const id of st.order) {
        const el = cardEls.current[id];
        if (el && !inPile.has(id)) {
          el.style.transition = "";
          el.style.transform = `translate(${(st.cx - st.W / 2).toFixed(1)}px,${(cy - st.H / 2).toFixed(1)}px)`;
        }
      }
      void stage.offsetWidth; // flush the snap before transitions arm
      for (const id of st.order) {
        const el = cardEls.current[id];
        if (el) el.style.transition = `transform ${FAN_MS}ms cubic-bezier(.22,.9,.3,1), opacity ${FAN_MS}ms ease`;
      }
      layout(); // write wheel targets once; transitions carry the cards there
      st.fanUntil = performance.now() + FAN_MS;
      setTimeout(() => {
        for (const id of st.order) {
          const el = cardEls.current[id];
          if (el) el.style.transition = "";
        }
      }, FAN_MS + 40);
    };

    const drawCentered = () => {
      const n = st.order.length;
      if (!n || st.done) return;
      const pos = Math.min(Math.max(Math.round(st.rot / STEP), 0), n - 1);
      const id = st.order[pos];
      const el = cardEls.current[id];
      st.order.splice(pos, 1);
      st.rot = Math.min(st.rot, Math.max(st.order.length - 1, 0) * STEP);
      if (el) {
        el.style.transition = "transform .55s cubic-bezier(.22,.9,.3,1), opacity .45s ease";
        el.style.transform = `translate(${st.cx - st.W / 2}px,-30px) scale(1.12)`;
        el.style.opacity = 0;
        el.style.pointerEvents = "none";
        setTimeout(() => { el.style.transition = "opacity .3s ease"; }, 600);
      }
      st.onPick && st.onPick(id);
    };

    const tick = () => {
      st.raf = requestAnimationFrame(tick);
      try {
        if (st.phase === "wash") {
          if (ring.style.opacity !== "0") ring.style.opacity = 0;
          st.pileAngle += st.pileVel + 0.0022; // gentle idle drift so the pile feels alive
          st.pileVel *= WASH_DECAY;
          layoutWash();
          return;
        }
        if (performance.now() < st.fanUntil) return; // fan-out transition owns the cards
        if (st.done) { if (ring.style.opacity !== "0") ring.style.opacity = 0; layout(); return; }
        if (st.holding && !st.dragging) {
          const p = Math.min((performance.now() - st.chargeStart) / HOLD_MS, 1);
          ring.style.opacity = 1;
          prog.setAttribute("stroke-dashoffset", (CIRC * (1 - p)).toFixed(0));
          if (p >= 1) { st.holding = false; ring.style.opacity = 0; drawCentered(); }
        } else if (ring.style.opacity !== "0") ring.style.opacity = 0;
        if (!st.dragging && !st.holding) {
          let steered = false;
          if (st.hoverX !== null) {
            const nn = (st.hoverX - st.cx) / st.cx;
            if (Math.abs(nn) > DEADZONE) {
              st.rot += Math.sign(nn) * Math.pow((Math.abs(nn) - DEADZONE) / (1 - DEADZONE), 2) * MAXSTEER;
              st.vel = 0; steered = true;
            }
          }
          if (!steered) {
            if (Math.abs(st.vel) > 0.0012) { st.rot += st.vel; st.vel *= DECAY; }
            else {
              const t = Math.min(Math.max(Math.round(st.rot / STEP), 0), Math.max(st.order.length - 1, 0)) * STEP;
              st.rot += (t - st.rot) * SNAP; st.vel = 0;
            }
          }
        }
        const max = Math.max(st.order.length - 1, 0) * STEP;
        if (st.rot < 0) st.rot *= 0.85;
        if (st.rot > max) st.rot = max + (st.rot - max) * 0.85;
        layout();
      } catch { /* never let one bad frame kill the wheel */ }
    };

    const pt = (e) => { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const onDown = (e) => {
      if (st.done) return;
      e.preventDefault();
      try { stage.setPointerCapture(e.pointerId); } catch {}
      const p = pt(e);
      if (st.phase === "wash") {
        st.washing = true;
        st.lastAng = Math.atan2(p.y - pileCy(), p.x - st.cx);
        st.lastX = p.x; st.lastY = p.y;
        return;
      }
      st.lastX = p.x; st.moved = 0; st.vel = 0;
      st.dragging = false; st.holding = true; st.chargeStart = performance.now();
    };
    const onMove = (e) => {
      if (st.done) return;
      const p = pt(e);
      if (st.phase === "wash") {
        if (!st.washing) return;
        const ang = Math.atan2(p.y - pileCy(), p.x - st.cx);
        let dA = ang - st.lastAng;
        if (dA > Math.PI) dA -= Math.PI * 2;
        if (dA < -Math.PI) dA += Math.PI * 2;
        st.pileVel += dA * 0.30;
        st.stirred += Math.abs(dA);
        const dx = Math.round(p.x - st.lastX), dy = Math.round(p.y - st.lastY);
        st.entropy = (st.entropy ^ (dx * 374761393 + dy * 668265263 + (performance.now() & 0xffff))) >>> 0;
        st.entropy = Math.imul(st.entropy ^ (st.entropy >>> 13), 1274126177) >>> 0;
        st.lastAng = ang; st.lastX = p.x; st.lastY = p.y;
        return;
      }
      if (e.pointerType === "mouse" && !(e.buttons & 1)) { st.hoverX = p.x; st.holding = false; st.dragging = false; return; }
      if (!st.holding && !st.dragging && (e.buttons & 1)) { st.dragging = true; st.lastX = p.x; st.moved = 10; }
      if (st.holding || st.dragging) {
        const dx = p.x - st.lastX;
        st.moved += Math.abs(dx);
        if (st.moved > 9 && st.holding) { st.dragging = true; st.holding = false; }
        if (st.dragging) { st.rot -= dx / st.R; st.vel = st.vel * 0.6 + (-dx / st.R) * 0.4; st.hoverX = null; }
        st.lastX = p.x;
      }
    };
    const onUp = (e) => {
      if (st.phase === "wash") { if (st.washing) fanOut(); return; }
      st.holding = false; st.dragging = false; if (e && e.pointerType !== "mouse") st.hoverX = null;
    };
    const onLeave = (e) => { if (e.pointerType === "mouse") st.hoverX = null; };
    const onBlur = () => { st.holding = false; st.dragging = false; st.washing = false; st.hoverX = null; };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    stage.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("blur", onBlur);
    st.raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(st.raf);
      window.removeEventListener("resize", measure);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <div className="mc-wheelwrap">
      {hint && <p className="mc-hint mc-wheelhint">{hint}</p>}
      <p ref={washRef} className="mc-wheelhow mc-washhow" aria-hidden="true"
        style={{ display: S.current.phase === "wash" ? "" : "none" }}>
        Wash the deck — swirl the pile, then release to fan the spread
      </p>
      <p ref={howRef} className="mc-wheelhow" aria-hidden="true"
        style={{ display: S.current.phase === "wash" ? "none" : "" }}>
        <span className="mc-wheelhow-touch">Slide the spread · press and hold the centered card to draw</span>
        <span className="mc-wheelhow-mouse">Move your cursor to spin · center it to settle · hold to draw</span>
      </p>
      <p ref={ctrRef} className="mc-wheelctr" aria-hidden="true" />
      <div ref={stageRef} className="mc-wheelstage" role="application" aria-label="Card spread. Swirl the pile to shuffle, slide to browse, hold the centered card to draw.">
        {S.current.rendered.map((id) => (
          <div
            key={id}
            ref={(el) => { if (el) cardEls.current[id] = el; }}
            className="mc-wheelcard"
          >
            <img src={ART("art/card-back.webp")} alt="" draggable="false" loading="lazy" />
          </div>
        ))}
        <svg ref={ringRef} className="mc-wheelring" width="152" height="152" aria-hidden="true">
          <circle cx="76" cy="76" r="60" fill="none" stroke="rgba(79,216,255,.18)" strokeWidth="3" />
          <circle ref={ringProgRef} cx="76" cy="76" r="60" fill="none" stroke="var(--gold-bright)" strokeWidth="4"
            strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC} transform="rotate(-90 76 76)" />
        </svg>
      </div>
    </div>
  );
}
