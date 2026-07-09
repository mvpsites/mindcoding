import { useMemo } from "react";

export default function Ambient() {
  const stars = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: `${(i * 37 + 13) % 100}%`,
        top: `${(i * 53 + 7) % 100}%`,
        d: `${(i % 5) * 1.3}s`,
        s: 1 + (i % 3),
      })),
    []
  );
  return (
    <div className="mc-ambient" aria-hidden="true">
      {stars.map((s, i) => (
        <span key={i} style={{ left: s.left, top: s.top, animationDelay: s.d, width: s.s, height: s.s }} />
      ))}
    </div>
  );
}
