import { useEffect, useMemo, useRef } from "react";

export default function Ambient() {
  const starsRef = useRef(null);
  const nebulaRef = useRef(null);
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: `${(i * 37 + 13) % 100}%`,
        top: `${(i * 53 + 7) % 100}%`,
        d: `${(i % 7) * 0.9}s`,
        s: 0.8 + ((i * 31) % 5) * 0.45,
      })),
    []
  );

  // depth: nebula and stars drift at different rates as the page scrolls
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const y = window.scrollY;
      if (nebulaRef.current) nebulaRef.current.style.transform = `translateY(${y * -0.1}px)`;
      if (starsRef.current) starsRef.current.style.transform = `translateY(${y * -0.045}px)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="mc-ambient" aria-hidden="true">
      <div ref={nebulaRef} className="mc-nebula">
        <span className="mc-neb1" />
        <span className="mc-neb2" />
      </div>
      <div ref={starsRef} className="mc-starslayer">
        {stars.map((s, i) => (
          <span key={i} style={{ left: s.left, top: s.top, animationDelay: s.d, width: s.s, height: s.s }} />
        ))}
      </div>
    </div>
  );
}
