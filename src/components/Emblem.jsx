import { starPts, rays } from "../lib/geometry.js";

export default function Emblem({ id }) {
  const g = { stroke: "var(--gold)", fill: "none", strokeWidth: 1.3 };
  switch (id) {
    case "fool":
      return (
        <g {...g}>
          <circle cx="100" cy="72" r="30" />
          <circle cx="100" cy="72" r="22" opacity="0.5" />
          <g opacity="0.8">
            {rays(100, 72, 34, 46, 16).map((l, i) => (
              <line key={i} {...l} />
            ))}
          </g>
          <path d="M20 168 L96 138 L200 158" />
          <path d="M96 138 C 110 150, 104 166, 92 172 C 84 176, 78 168, 84 162" opacity="0.6" />
          <polygon points={starPts(160, 40, 5, 2, 4)} fill="var(--gold)" stroke="none" opacity="0.9" />
          <polygon points={starPts(42, 52, 4, 1.6, 4)} fill="var(--gold)" stroke="none" opacity="0.6" />
        </g>
      );
    case "magician":
      return (
        <g {...g}>
          <path d="M64 56 C 76 40, 92 40, 100 54 C 108 40, 124 40, 136 56 C 124 72, 108 70, 100 58 C 92 70, 76 72, 64 56 Z" />
          <line x1="100" y1="80" x2="100" y2="140" />
          <line x1="100" y1="80" x2="100" y2="140" strokeWidth="4" opacity="0.25" />
          <line x1="40" y1="150" x2="160" y2="150" />
          <path d="M56 150 v-12 l6 -8" opacity="0.85" />
          <path d="M86 138 q8 12 16 0 v10 h-16 z" opacity="0.85" />
          <line x1="128" y1="132" x2="128" y2="150" opacity="0.85" />
          <g opacity="0.85">
            <circle cx="152" cy="141" r="8" />
            <polygon points={starPts(152, 141, 6.4, 2.6)} />
          </g>
        </g>
      );
    case "star":
      return (
        <g {...g}>
          <polygon points={starPts(100, 70, 34, 13, 8)} />
          <polygon points={starPts(100, 70, 20, 8, 8)} opacity="0.5" />
          {[
            [40, 34],
            [160, 30],
            [58, 96],
            [146, 92],
            [30, 66],
            [170, 64],
            [100, 18],
          ].map(([x, y], i) => (
            <polygon key={i} points={starPts(x, y, 4.5, 1.8, 8)} opacity="0.7" />
          ))}
          <ellipse cx="100" cy="164" rx="52" ry="10" />
          <ellipse cx="100" cy="164" rx="34" ry="6" opacity="0.5" />
          <path d="M84 116 C 80 132, 84 148, 92 158" opacity="0.8" />
          <path d="M116 116 C 122 132, 120 148, 112 158" opacity="0.8" />
        </g>
      );
    case "moon":
      return (
        <g {...g}>
          <circle cx="100" cy="66" r="32" />
          <path
            d="M100 34 A 32 32 0 0 0 100 98 A 25 25 0 0 1 100 34 Z"
            fill="var(--gold)"
            opacity="0.35"
            stroke="none"
          />
          <g opacity="0.7">
            {rays(100, 66, 36, 44, 12).map((l, i) => (
              <line key={i} {...l} />
            ))}
          </g>
          <rect x="30" y="108" width="16" height="42" />
          <rect x="154" y="108" width="16" height="42" />
          <path d="M38 104 l8 -8 l8 8" opacity="0.8" />
          <path d="M154 104 l8 -8 l8 8" opacity="0.8" />
          <path d="M60 176 C 84 158, 116 170, 140 152" opacity="0.9" />
          <ellipse cx="100" cy="182" rx="30" ry="7" opacity="0.6" />
        </g>
      );
    case "fivepent":
      return (
        <g {...g}>
          <path d="M56 176 v-84 a44 52 0 0 1 88 0 v84" />
          <path d="M62 176 v-82 a38 46 0 0 1 76 0 v82" opacity="0.4" />
          {[
            [100, 66],
            [76, 100],
            [124, 100],
            [76, 140],
            [124, 140],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="14" />
              <polygon points={starPts(x, y, 11, 4.4)} />
            </g>
          ))}
          {[
            [30, 40],
            [172, 56],
            [24, 96],
            [178, 120],
            [36, 150],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.6" fill="var(--gold)" stroke="none" opacity="0.7" />
          ))}
        </g>
      );
    default:
      return null;
  }
}
