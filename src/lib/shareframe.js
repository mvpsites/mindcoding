/* Shareable result frame — renders a reading to a 1080×1920 story-format PNG.
   SIGNAL palette (styles.css tokens), Outfit + IBM Plex Mono (awaited via
   document.fonts so the canvas uses the real faces). No network, no tracking:
   drawn locally, shared via the Web Share API or downloaded. */

const W = 1080;
const H = 1920;

const C = {
  bgTop: "#05070D",
  bgBot: "#0A1430",
  cyan: "#4FD8FF",
  cyanDim: "rgba(79,216,255,.35)",
  cyanDeep: "#1E6E8C",
  ivory: "#E8F1F8",
  ivoryDim: "rgba(232,241,248,.55)",
};

function wrap(ctx, text, maxWidth) {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function drawLines(ctx, lines, x, y, lh, align = "left") {
  ctx.textAlign = align;
  for (const l of lines) {
    ctx.fillText(l, x, y);
    y += lh;
  }
  return y;
}

/** reading = { spreadTitle, slots: [{position, cardName, reversed}], recode, affirmation, action } */
export async function renderShareFrame(reading) {
  try { await document.fonts.ready; } catch { /* draw with fallbacks */ }

  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");

  // ground
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.bgTop);
  g.addColorStop(1, C.bgBot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // center glow
  const r = ctx.createRadialGradient(W / 2, H * 0.42, 60, W / 2, H * 0.42, 760);
  r.addColorStop(0, "rgba(79,216,255,.10)");
  r.addColorStop(1, "rgba(79,216,255,0)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, W, H);

  // frame edge
  ctx.strokeStyle = "rgba(80,200,255,.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(46, 46, W - 92, H - 92);

  const cx = W / 2;
  let y = 190;

  // wordmark
  ctx.fillStyle = C.cyan;
  ctx.font = "700 52px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("M I N D   C O D I N G", cx, y);
  y += 54;
  ctx.fillStyle = C.ivoryDim;
  ctx.font = "500 26px 'IBM Plex Mono', monospace";
  ctx.fillText("M I N D O S   R E A D I N G", cx, y);
  y += 96;

  // spread title
  ctx.fillStyle = C.ivory;
  ctx.font = "800 58px Outfit, sans-serif";
  ctx.fillText(reading.spreadTitle.toUpperCase(), cx, y);
  y += 84;

  // divider
  ctx.strokeStyle = C.cyanDim;
  ctx.beginPath(); ctx.moveTo(160, y); ctx.lineTo(W - 160, y); ctx.stroke();
  y += 86;

  // slots — position label + card name (fits up to 5)
  const slotGap = reading.slots.length > 3 ? 128 : 158;
  for (const s of reading.slots) {
    ctx.fillStyle = C.cyan;
    ctx.font = "600 27px 'IBM Plex Mono', monospace";
    ctx.fillText(s.position.toUpperCase(), cx, y);
    ctx.fillStyle = C.ivory;
    ctx.font = "700 47px Outfit, sans-serif";
    ctx.fillText(s.cardName + (s.reversed ? "  ·  Reversed" : ""), cx, y + 52);
    y += slotGap;
  }
  y += 30;

  ctx.strokeStyle = C.cyanDim;
  ctx.beginPath(); ctx.moveTo(160, y); ctx.lineTo(W - 160, y); ctx.stroke();
  y += 88;

  // the recode
  ctx.fillStyle = C.cyan;
  ctx.font = "600 28px 'IBM Plex Mono', monospace";
  ctx.fillText("THE RECODE", cx, y);
  y += 62;
  ctx.fillStyle = C.ivory;
  ctx.font = "700 44px Outfit, sans-serif";
  y = drawLines(ctx, wrap(ctx, "\u201C" + reading.recode + "\u201D", W - 300), cx, y, 60, "center");
  y += 56;

  // affirmation
  ctx.fillStyle = C.cyan;
  ctx.font = "600 28px 'IBM Plex Mono', monospace";
  ctx.fillText("AFFIRMATION", cx, y);
  y += 58;
  ctx.fillStyle = C.cyan;
  ctx.font = "500 40px Outfit, sans-serif";
  y = drawLines(ctx, wrap(ctx, reading.affirmation, W - 320), cx, y, 56, "center");

  // footer
  ctx.fillStyle = C.ivoryDim;
  ctx.font = "500 30px Outfit, sans-serif";
  ctx.fillText("Your mind is being programmed every day.", cx, H - 216);
  ctx.fillText("Choose what gets installed.", cx, H - 172);
  ctx.fillStyle = C.cyan;
  ctx.font = "600 34px 'IBM Plex Mono', monospace";
  ctx.fillText("mindcod.ing", cx, H - 104);

  return new Promise((resolve, reject) =>
    cv.toBlob((b) => (b ? resolve(b) : reject(new Error("frame render failed"))), "image/png")
  );
}

/** Share via Web Share API when the platform supports file sharing; download otherwise. */
export async function shareReading(reading) {
  const blob = await renderShareFrame(reading);
  const file = new File([blob], "mindcoding-reading.png", { type: "image/png" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Mind Coding — " + reading.spreadTitle });
      return "shared";
    } catch (e) {
      if (e && e.name === "AbortError") return "cancelled";
      // fall through to download
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mindcoding-reading.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return "downloaded";
}
