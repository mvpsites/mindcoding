import { useMemo } from "react";

export default function Ambient() {
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
  return (
    <div className="mc-ambient" aria-hidden="true">
      {stars.map((s, i) => (
        <span key={i} style={{ left: s.left, top: s.top, animationDelay: s.d, width: s.s, height: s.s }} />
      ))}
    </div>
  );
}
