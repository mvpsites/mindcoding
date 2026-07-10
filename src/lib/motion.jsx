import { useEffect, useMemo, useRef, useState } from "react";

/* Mind Coding motion system — 2D transforms + opacity only (Safari rules).
   Reveal: rises in once when scrolled into view (shared IntersectionObserver).
   MaskLines: hero lines rise out of clipping masks on mount (page-load choreography).
   ScrollIgnite: words light up one by one, linked to scroll position. */

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let io = null;
function observer() {
  if (!io) {
    io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );
  }
  return io;
}

export function Reveal({ as: Tag = "div", delay = 0, className = "", style, children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) {
      el.classList.add("is-in");
      return;
    }
    observer().observe(el);
    return () => io && io.unobserve(el);
  }, []);
  return (
    <Tag
      ref={ref}
      className={`rv ${className}`}
      style={delay ? { ...style, "--rvd": `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* Each child string becomes a masked line that rises on mount, staggered. */
export function MaskLines({ lines, base = 150, step = 170, className = "" }) {
  return lines.map((line, i) => (
    <span key={i} className="mc-maskline">
      <span
        className={`mc-masklift ${line.className || className}`}
        style={{ "--d": `${base + i * step}ms` }}
      >
        {line.text ?? line}
      </span>
    </span>
  ));
}

/* Simple scroll parallax: element translates at `rate` of scroll (2D only). */
export function useParallax(rate = 0.25) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    if (window.matchMedia("(hover: none)").matches) return; // touch: skip per-frame layer moves
    let raf = 0;
    const tick = () => {
      raf = 0;
      el.style.transform = `translateY(${window.scrollY * rate}px)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", onScroll, { passive: true });
    tick();
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [rate]);
  return ref;
}

/* Scroll-linked word ignition — the signature moment. */
export function ScrollIgnite({ text, className = "" }) {
  const ref = useRef(null);
  const words = useMemo(() => text.split(" "), [text]);
  const [lit, setLit] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) {
      setLit(words.length);
      return;
    }
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.88; // ignition begins as the block clears the fold
      const end = vh * 0.38;   // fully lit well before it leaves
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end)));
      const n = Math.round(p * words.length);
      setLit((prev) => (prev === n ? prev : n));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    tick();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [words.length]);

  return (
    <p ref={ref} className={`mc-ignite ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className={i < lit ? "on" : ""}>
          {w}
        </span>
      ))}
    </p>
  );
}

/* Magnetic hover: element leans toward the cursor, springs back on leave. */
export function useMagnetic(strength = 10) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.transform = `translate(${x * strength}px, ${y * strength * 0.7}px)`;
    };
    const leave = () => { el.style.transform = ""; };
    el.addEventListener("mousemove", move, { passive: true });
    el.addEventListener("mouseleave", leave, { passive: true });
    return () => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); };
  }, [strength]);
  return ref;
}
