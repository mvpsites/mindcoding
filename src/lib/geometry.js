export function starPts(cx, cy, ro, ri, n = 5, rot = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? ro : ri;
    const a = rot + (Math.PI * i) / n;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

export function rays(cx, cy, r1, r2, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n;
    out.push({
      x1: cx + r1 * Math.cos(a),
      y1: cy + r1 * Math.sin(a),
      x2: cx + r2 * Math.cos(a),
      y2: cy + r2 * Math.sin(a),
    });
  }
  return out;
}
