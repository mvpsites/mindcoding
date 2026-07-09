import { starPts } from "../lib/geometry.js";
import Emblem from "./Emblem.jsx";

export default function CardFace({ card, small }) {
  const gid = `bg-${card.id}${small ? "-s" : ""}`;
  return (
    <svg viewBox="0 0 220 330" className="mc-facesvg" role="img" aria-label={card.name}>
      <defs>
        <radialGradient id={gid} cx="50%" cy="38%" r="80%">
          <stop offset="0%" stopColor="#121D42" />
          <stop offset="100%" stopColor="#090F28" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="220" height="330" rx="12" fill="var(--ivory)" />
      <rect x="4.5" y="4.5" width="211" height="321" rx="9" fill={`url(#${gid})`} />
      <rect x="10" y="10" width="200" height="310" rx="8" fill="none" stroke="var(--gold)" strokeWidth="1.6" />
      <rect x="14" y="14" width="192" height="302" rx="6" fill="none" stroke="var(--gold)" strokeWidth="0.7" opacity="0.55" />
      <rect x="18" y="18" width="184" height="294" rx="5" fill="none" stroke="var(--gold)" strokeWidth="0.6" opacity="0.3" strokeDasharray="2 4" />
      {[
        [20, 20],
        [200, 20],
        [20, 310],
        [200, 310],
      ].map(([x, y], i) => (
        <polygon key={i} points={starPts(x, y, 5, 2, 4)} fill="var(--gold)" opacity="0.9" />
      ))}
      <text x="110" y="46" textAnchor="middle" fill="var(--gold)" fontFamily="Cinzel, serif" fontSize="15" letterSpacing="5">
        {card.numeral}
      </text>
      <g stroke="var(--gold)" strokeWidth="0.8" opacity="0.8">
        <line x1="52" y1="60" x2="98" y2="60" />
        <line x1="122" y1="60" x2="168" y2="60" />
        <polygon points={starPts(110, 60, 4, 1.6, 4)} fill="var(--gold)" stroke="none" />
        <line x1="52" y1="276" x2="98" y2="276" />
        <line x1="122" y1="276" x2="168" y2="276" />
        <polygon points={starPts(110, 276, 4, 1.6, 4)} fill="var(--gold)" stroke="none" />
      </g>
      {card.art ? (
        <image
          href={import.meta.env.BASE_URL + card.art}
          x="20"
          y="66"
          width="180"
          height="206"
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <g transform="translate(10, 70)">
          <Emblem id={card.id} />
        </g>
      )}
      <text x="110" y="296" textAnchor="middle" fill="var(--ivory)" fontFamily="Cinzel, serif" fontSize="12.5" letterSpacing="3">
        {card.name.toUpperCase()}
      </text>
      {card.suit !== "Major Arcana" && (
        <text x="110" y="311" textAnchor="middle" fill="var(--gold)" fontFamily="Cinzel, serif" fontSize="7.5" letterSpacing="3" opacity="0.8">
          {card.suit.toUpperCase()}
        </text>
      )}
      <g transform="translate(110, 319)" opacity="0.85">
        <polygon points={starPts(0, 0, 3.4, 1.4, 4)} fill="none" stroke="var(--gold)" strokeWidth="0.7" />
        <circle cx="0" cy="0" r="0.9" fill="var(--gold)" />
      </g>
    </svg>
  );
}
