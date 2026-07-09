import { starPts, rays } from "../lib/geometry.js";

export default function CardBack() {
  return (
    <svg viewBox="0 0 220 376" className="mc-facesvg" aria-hidden="true">
      <defs>
        <radialGradient id="backbg" cx="50%" cy="42%" r="85%">
          <stop offset="0%" stopColor="#152355" />
          <stop offset="100%" stopColor="#080D22" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="220" height="376" rx="12" fill="url(#backbg)" />
      <rect x="7" y="7" width="206" height="362" rx="9" fill="none" stroke="var(--gold)" strokeWidth="1.4" />
      <rect x="13" y="13" width="194" height="350" rx="7" fill="none" stroke="var(--gold)" strokeWidth="0.6" opacity="0.5" strokeDasharray="3 4" />
      {[
        [40, 48],
        [180, 60],
        [60, 320],
        [166, 310],
        [30, 190],
        [190, 180],
        [110, 34],
        [56, 120],
        [168, 128],
        [110, 342],
        [42, 258],
        [178, 250],
      ].map(([x, y], i) => (
        <polygon key={i} points={starPts(x, y, 3.4, 1.3, 8)} fill="var(--gold)" opacity={0.35 + (i % 3) * 0.2} />
      ))}
      <g stroke="var(--gold)" fill="none">
        <circle cx="110" cy="176" r="64" strokeWidth="1.1" />
        <circle cx="110" cy="176" r="55" strokeWidth="0.6" strokeDasharray="10 5" opacity="0.7" />
        <circle cx="110" cy="176" r="45" strokeWidth="0.6" strokeDasharray="4 7" opacity="0.7" />
        <circle cx="110" cy="176" r="35" strokeWidth="0.6" strokeDasharray="16 4" opacity="0.7" />
        <rect x="78" y="144" width="64" height="64" strokeWidth="0.7" opacity="0.6" transform="rotate(45 110 176)" />
        <rect x="88" y="154" width="44" height="44" strokeWidth="0.6" opacity="0.45" />
        <circle cx="110" cy="176" r="12" strokeWidth="1" />
        <g strokeWidth="0.8" opacity="0.9">
          {rays(110, 176, 14, 24, 6).map((l, i) => (
            <line key={i} {...l} />
          ))}
        </g>
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const a = (deg * Math.PI) / 180;
          return (
            <circle
              key={i}
              cx={110 + 24 * Math.cos(a)}
              cy={176 + 24 * Math.sin(a)}
              r="1.6"
              fill="var(--gold)"
              stroke="none"
            />
          );
        })}
        <circle cx="110" cy="176" r="3" fill="var(--gold)" stroke="none" />
      </g>
      <g stroke="var(--gold)" fill="none" strokeWidth="0.9">
        {[-2, -1, 0, 1, 2].map((k) => {
          const x = 110 + k * 26;
          return (
            <g key={k}>
              <circle cx={x} cy="300" r="7" />
              {k !== 0 && (
                <path
                  d={
                    k < 0
                      ? `M ${x} 293 A 7 7 0 0 0 ${x} 307 A ${7 - Math.abs(k) * 2.4} 7 0 0 1 ${x} 293`
                      : `M ${x} 293 A 7 7 0 0 1 ${x} 307 A ${7 - Math.abs(k) * 2.4} 7 0 0 0 ${x} 293`
                  }
                  fill="var(--gold)"
                  opacity="0.5"
                  stroke="none"
                />
              )}
              {k === 0 && <circle cx={x} cy="300" r="4.5" fill="var(--gold)" opacity="0.6" stroke="none" />}
            </g>
          );
        })}
      </g>
      <g stroke="var(--gold)" fill="none" strokeWidth="0.9" opacity="0.9">
        <line x1="70" y1="66" x2="150" y2="66" />
        <polygon points={starPts(110, 66, 5, 2, 4)} fill="var(--gold)" stroke="none" />
      </g>
    </svg>
  );
}
