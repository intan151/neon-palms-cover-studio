// Neon Palms Cover Studio — cover render engine.
//
// renderCover draws the whole poster onto any 2D canvas at any size: the
// panel layout, the Vice City grade, the bold condensed title block, the
// poster frame, grain, vignette and halftone. The editor preview and the PNG
// export call the same function, so what you see is what you download.

export const CONDENSED_FONT =
  `'Arial Narrow', 'Helvetica Neue Condensed Bold', 'Franklin Gothic Medium', Impact, sans-serif`;

export const LAYOUTS = [
  { id: 'hero-trio', name: 'Hero Trio', slots: 4 },
  { id: 'four-grid', name: 'Four Grid', slots: 4 },
  { id: 'nine-panel', name: 'Nine Panel', slots: 9 },
  { id: 'full-strip', name: 'Full Strip', slots: 4 },
  { id: 'tilted-snaps', name: 'Tilted Snaps', slots: 4 },
  { id: 'comic-five', name: 'Comic Five', slots: 5 },
];

export const GRADES = [
  {
    id: 'vice-sunset',
    name: 'Vice Sunset',
    filter: 'saturate(1.28) contrast(1.06) brightness(1.02)',
    tint: ['rgba(255, 94, 60, 0.20)', 'rgba(255, 46, 136, 0.16)'],
    mode: 'overlay',
  },
  {
    id: 'neon-night',
    name: 'Neon Night',
    filter: 'saturate(1.45) contrast(1.12) brightness(0.94)',
    tint: ['rgba(64, 20, 160, 0.30)', 'rgba(255, 46, 136, 0.22)'],
    mode: 'overlay',
  },
  {
    id: 'teal-dawn',
    name: 'Teal Dawn',
    filter: 'saturate(1.2) contrast(1.05) brightness(1.04)',
    tint: ['rgba(46, 230, 200, 0.18)', 'rgba(255, 154, 61, 0.14)'],
    mode: 'soft-light',
  },
  {
    id: 'hot-pink',
    name: 'Hot Pink',
    filter: 'saturate(1.6) contrast(1.08) brightness(1.0)',
    tint: ['rgba(255, 46, 136, 0.30)', 'rgba(160, 20, 120, 0.18)'],
    mode: 'overlay',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    filter: 'saturate(1.15) contrast(1.03) brightness(1.07)',
    tint: ['rgba(255, 190, 80, 0.24)', 'rgba(255, 120, 40, 0.12)'],
    mode: 'soft-light',
  },
];

export const TITLE_COLORS = [
  { id: 'white', name: 'White', fill: '#ffffff', gradient: false },
  { id: 'sunset', name: 'Sunset', fill: null, gradient: true },
  { id: 'pink', name: 'Neon Pink', fill: '#ff2e88', gradient: false },
  { id: 'gold', name: 'Gold', fill: '#ffd166', gradient: false },
  { id: 'black', name: 'Black', fill: '#160a26', gradient: false },
];

export const EXPORT_SIZES = [
  { id: '1080x1080', label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  { id: '1080x1350', label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  { id: '1920x1080', label: 'Wide · 1920 × 1080', w: 1920, h: 1080 },
];

// Each layout is a function of the cover size returning its panel rects in
// draw order: {x, y, w, h, tilt} in pixels, plus whether it is the backdrop.
export function layoutSlots(layoutId, w, h) {
  const gap = Math.round(Math.min(w, h) * 0.016);
  const g2 = gap * 2;
  switch (layoutId) {
    case 'hero-trio': {
      const heroW = Math.round(w * 0.62);
      const sideW = w - heroW - gap;
      const sideH = Math.round((h - gap * 2) / 3);
      return [
        { x: 0, y: 0, w: heroW, h, tilt: 0 },
        { x: heroW + gap, y: 0, w: sideW, h: sideH, tilt: 0 },
        { x: heroW + gap, y: sideH + gap, w: sideW, h: sideH, tilt: 0 },
        { x: heroW + gap, y: sideH * 2 + gap * 2, w: sideW, h: sideH, tilt: 0 },
      ];
    }
    case 'four-grid': {
      const cw = Math.round((w - gap) / 2);
      const ch = Math.round((h - gap) / 2);
      return [
        { x: 0, y: 0, w: cw, h: ch, tilt: 0 },
        { x: cw + gap, y: 0, w: w - cw - gap, h: ch, tilt: 0 },
        { x: 0, y: ch + gap, w: cw, h: h - ch - gap, tilt: 0 },
        { x: cw + gap, y: ch + gap, w: w - cw - gap, h: h - ch - gap, tilt: 0 },
      ];
    }
    case 'nine-panel': {
      const cw = Math.round((w - gap * 2) / 3);
      const ch = Math.round((h - gap * 2) / 3);
      const slots = [];
      for (let r = 0; r < 3; r += 1) {
        for (let c = 0; c < 3; c += 1) {
          slots.push({
            x: c * (cw + gap),
            y: r * (ch + gap),
            w: c === 2 ? w - c * (cw + gap) : cw,
            h: r === 2 ? h - r * (ch + gap) : ch,
            tilt: 0,
          });
        }
      }
      return slots;
    }
    case 'full-strip': {
      const stripH = Math.round(h * 0.26);
      const stripW = Math.round((w - gap * 2) / 3);
      return [
        { x: 0, y: 0, w, h, tilt: 0, backdrop: true },
        { x: gap, y: h - stripH - gap, w: stripW, h: stripH, tilt: 0 },
        { x: gap * 2 + stripW, y: h - stripH - gap, w: stripW, h: stripH, tilt: 0 },
        { x: gap * 3 + stripW * 2, y: h - stripH - gap, w: w - gap * 4 - stripW * 2, h: stripH, tilt: 0 },
      ];
    }
    case 'tilted-snaps': {
      const snapW = Math.round(w * 0.42);
      const snapH = Math.round(h * 0.30);
      return [
        { x: 0, y: 0, w, h, tilt: 0, backdrop: true },
        { x: Math.round(w * 0.06), y: Math.round(h * 0.10), w: snapW, h: snapH, tilt: -0.07 },
        { x: Math.round(w * 0.52), y: Math.round(h * 0.16), w: snapW, h: snapH, tilt: 0.06 },
        { x: Math.round(w * 0.30), y: Math.round(h * 0.52), w: snapW, h: snapH, tilt: -0.03 },
      ];
    }
    case 'comic-five':
    default: {
      const topH = Math.round(h * 0.34);
      const midH = Math.round(h * 0.30);
      const botH = h - topH - midH - gap * 2;
      const halfW = Math.round((w - gap) / 2);
      return [
        { x: 0, y: 0, w: halfW, h: topH, tilt: 0 },
        { x: halfW + gap, y: 0, w: w - halfW - gap, h: topH, tilt: 0 },
        { x: 0, y: topH + gap, w, h: midH, tilt: 0 },
        { x: 0, y: topH + midH + gap * 2, w: halfW, h: botH, tilt: 0 },
        { x: halfW + gap, y: topH + midH + gap * 2, w: w - halfW - gap, h: botH, tilt: 0 },
      ];
    }
  }
}

function drawPhotoInto(ctx, image, rect, zoom, dx, dy, grade) {
  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  if (!iw || !ih) return;
  // Cover-fit the photo into the rect, then zoom around the pan point.
  const scale = Math.max(rect.w / iw, rect.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const px = rect.x + (rect.w - dw) / 2 + dx * rect.w;
  const py = rect.y + (rect.h - dh) / 2 + dy * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.filter = grade.filter;
  ctx.drawImage(image, px, py, dw, dh);
  ctx.filter = 'none';
  ctx.restore();
}

function grainPattern() {
  if (grainPattern.cache) return grainPattern.cache;
  const c = document.createElement('canvas');
  c.width = 140;
  c.height = 140;
  const g = c.getContext('2d');
  const data = g.createImageData(140, 140);
  let seed = 987654321;
  for (let i = 0; i < data.data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const v = seed % 256;
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  g.putImageData(data, 0, 0);
  grainPattern.cache = c;
  return c;
}

function halftonePattern(spacing, radius) {
  const key = `${spacing}:${radius}`;
  halftonePattern.cache = halftonePattern.cache || {};
  if (halftonePattern.cache[key]) return halftonePattern.cache[key];
  const c = document.createElement('canvas');
  c.width = spacing;
  c.height = spacing;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(10, 5, 18, 0.55)';
  g.beginPath();
  g.arc(spacing / 2, spacing / 2, radius, 0, Math.PI * 2);
  g.fill();
  halftonePattern.cache[key] = c;
  return c;
}

function fitTitleLines(ctx, text, maxWidth, startSize, fontFor) {
  // Split the title into at most two balanced lines that fit maxWidth.
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { lines: [], size: startSize };
  let size = startSize;
  let lines = [words.join(' ')];
  while (size > 28) {
    ctx.font = fontFor(size);
    if (ctx.measureText(lines[0]).width <= maxWidth || lines.length > 1) break;
    if (words.length > 1 && lines.length === 1) {
      // Balance the words across two lines.
      let best = null;
      for (let cut = 1; cut < words.length; cut += 1) {
        const a = words.slice(0, cut).join(' ');
        const b = words.slice(cut).join(' ');
        const w = Math.max(ctx.measureText(a).width, ctx.measureText(b).width);
        if (!best || w < best.w) best = { w, lines: [a, b] };
      }
      if (best && best.w <= maxWidth) {
        lines = best.lines;
        break;
      }
      lines = best.lines;
    }
    size = Math.round(size * 0.94);
  }
  // Final shrink pass so both lines fit.
  while (size > 24) {
    ctx.font = fontFor(size);
    if (lines.every((line) => ctx.measureText(line).width <= maxWidth)) break;
    size = Math.round(size * 0.94);
  }
  return { lines, size };
}

function drawTitleBlock(ctx, state, w, h, frame) {
  const title = (state.title || '').trim();
  const subtitle = (state.subtitle || '').trim();
  const tagline = (state.tagline || '').trim();
  if (!title && !subtitle && !tagline) return;
  const pad = Math.round(w * 0.045);
  const maxWidth = w - pad * 2;
  const atTop = state.titlePosition === 'top';
  const color = TITLE_COLORS.find((c) => c.id === state.titleColor) || TITLE_COLORS[0];

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  try { ctx.letterSpacing = '-1px'; } catch (e) { /* older canvas: ignore */ }

  const startSize = Math.round(Math.min(w, h) * 0.115);
  const fontFor = (size) => `900 ${size}px ${CONDENSED_FONT}`;
  const { lines, size } = fitTitleLines(ctx, title.toUpperCase(), maxWidth, startSize, fontFor);
  const lineHeight = size * 0.94;
  const subSize = Math.round(Math.min(w, h) * 0.032);
  const tagSize = Math.round(Math.min(w, h) * 0.026);
  // Baseline geometry, measured from the first title baseline: how far down
  // the last drawn baseline sits, plus its descent, so the whole block ends
  // exactly pad*0.55 above the frame instead of running past the edge.
  const belowFirst =
    lines.length * lineHeight +
    (subtitle ? subSize * 1.5 : 0) +
    (tagline ? tagSize * 0.7 : 0);
  const descent = tagline ? tagSize * 0.3 : subtitle ? subSize * 0.3 : size * 0.22;
  const capTop = size * 0.72;
  const blockH = capTop + belowFirst + descent;
  const shadeH = blockH + pad * 1.15;

  // Readability shade behind the title block.
  const shadeY = atTop ? frame.top : h - frame.bottom - shadeH;
  const shade = ctx.createLinearGradient(0, shadeY, 0, shadeY + shadeH);
  if (atTop) {
    shade.addColorStop(0, 'rgba(10, 5, 18, 0.78)');
    shade.addColorStop(1, 'rgba(10, 5, 18, 0)');
  } else {
    shade.addColorStop(0, 'rgba(10, 5, 18, 0)');
    shade.addColorStop(1, 'rgba(10, 5, 18, 0.78)');
  }
  ctx.fillStyle = shade;
  ctx.fillRect(frame.left, shadeY, w - frame.left - frame.right, shadeH);

  // First title baseline: top-anchored, the cap sits pad*0.55 below the
  // shade top; bottom-anchored, the last line's descent ends pad*0.55 above
  // the frame.
  let y = atTop
    ? shadeY + pad * 0.55 + capTop
    : h - frame.bottom - pad * 0.55 - belowFirst - descent;

  // Title fill: flat colour or a sunset gradient spanning the title lines.
  let fill = color.fill;
  if (color.gradient) {
    const gradTop = y - capTop;
    const gradBottom = y + (lines.length - 1) * lineHeight + size * 0.22;
    const grad = ctx.createLinearGradient(0, gradTop, 0, gradBottom);
    grad.addColorStop(0, '#ffd166');
    grad.addColorStop(0.45, '#ff9a3d');
    grad.addColorStop(0.75, '#ff2e88');
    grad.addColorStop(1, '#c724b1');
    fill = grad;
  }
  ctx.font = fontFor(size);
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  for (const line of lines) {
    ctx.strokeStyle = color.id === 'black' ? '#ffffff' : 'rgba(10, 5, 18, 0.92)';
    ctx.lineWidth = Math.max(3, size * 0.09);
    ctx.strokeText(line, pad + frame.left, y);
    ctx.fillStyle = fill;
    ctx.fillText(line, pad + frame.left, y);
    y += lineHeight;
  }

  // Subtitle in italic serif, tagline letterspaced in caps.
  if (subtitle) {
    ctx.font = `italic 700 ${subSize}px Georgia, 'Times New Roman', serif`;
    try { ctx.letterSpacing = '0px'; } catch (e) { /* ignore */ }
    ctx.fillStyle = '#ffe9f4';
    ctx.shadowColor = 'rgba(10,5,18,0.9)';
    ctx.shadowBlur = Math.max(2, subSize * 0.25);
    ctx.fillText(subtitle, pad + frame.left, y + subSize * 0.4);
    ctx.shadowBlur = 0;
    y += subSize * 1.5;
  }
  if (tagline) {
    ctx.font = `700 ${tagSize}px ${CONDENSED_FONT}`;
    try { ctx.letterSpacing = `${Math.max(2, tagSize * 0.22)}px`; } catch (e) { /* ignore */ }
    ctx.fillStyle = '#ffd166';
    ctx.fillText(tagline.toUpperCase(), pad + frame.left, y + tagSize * 0.7);
    try { ctx.letterSpacing = '0px'; } catch (e) { /* ignore */ }
  }
  ctx.restore();
}

function drawBadge(ctx, w, h, frame) {
  // A small starburst corner badge: "SUNSET EDITION".
  const cx = w - frame.right - Math.round(w * 0.055);
  const cy = frame.top + Math.round(h * 0.055);
  const r = Math.round(Math.min(w, h) * 0.052);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.18);
  ctx.beginPath();
  const points = 12;
  for (let i = 0; i < points * 2; i += 1) {
    const ang = (i / (points * 2)) * Math.PI * 2;
    const rad = i % 2 === 0 ? r : r * 0.72;
    const px = Math.cos(ang) * rad;
    const py = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd166';
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.strokeStyle = '#160a26';
  ctx.stroke();
  ctx.fillStyle = '#160a26';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round(r * 0.34)}px ${CONDENSED_FONT}`;
  ctx.fillText('SUNSET', 0, -r * 0.16);
  ctx.fillText('EDITION', 0, r * 0.22);
  ctx.restore();
}

export function renderCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES.find((g) => g.id === state.grade) || GRADES[0];
  const slots = layoutSlots(state.layout, w, h);
  const frameOn = state.frame !== false;
  const frame = frameOn
    ? { top: Math.round(h * 0.018), bottom: Math.round(h * 0.018), left: Math.round(w * 0.018), right: Math.round(w * 0.018) }
    : { top: 0, bottom: 0, left: 0, right: 0 };

  // Base: deep plum so any gap reads as poster board, not white.
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#1c0b33';
  ctx.fillRect(0, 0, w, h);

  // Panels. A backdrop slot paints edge to edge; the rest get a white keyline.
  slots.forEach((slot, i) => {
    const photo = state.photos[state.slots[i] ? state.slots[i].photo : 0];
    const adj = state.slots[i] || { zoom: 1, dx: 0, dy: 0 };
    ctx.save();
    if (slot.tilt) {
      ctx.translate(slot.x + slot.w / 2, slot.y + slot.h / 2);
      ctx.rotate(slot.tilt);
      ctx.translate(-slot.w / 2, -slot.h / 2);
    }
    // Under a tilt the transform already moved the origin to the slot's
    // top-left corner, so the photo is drawn at (0, 0) there; otherwise at
    // the slot's own coordinates.
    const rect = slot.tilt
      ? { x: 0, y: 0, w: slot.w, h: slot.h }
      : { x: slot.x, y: slot.y, w: slot.w, h: slot.h };
    if (photo && photo.image) {
      drawPhotoInto(ctx, photo.image, rect, adj.zoom, adj.dx, adj.dy, grade);
    } else {
      // Empty slot: a flat neon placeholder so the grid still reads.
      const ph = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
      ph.addColorStop(0, '#3b1a5e');
      ph.addColorStop(1, '#7a1e63');
      ctx.fillStyle = ph;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.restore();

    if (!slot.backdrop) {
      ctx.save();
      if (slot.tilt) {
        ctx.translate(slot.x + slot.w / 2, slot.y + slot.h / 2);
        ctx.rotate(slot.tilt);
        ctx.translate(-slot.w / 2, -slot.h / 2);
      }
      // White poster keyline + a thin dark inner line, GTA poster style.
      // Same local coordinates as the photo above (0, 0 when tilted).
      const kx = slot.tilt ? 0 : slot.x;
      const ky = slot.tilt ? 0 : slot.y;
      ctx.lineWidth = Math.max(3, Math.min(w, h) * 0.006);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(kx, ky, slot.w, slot.h);
      ctx.lineWidth = Math.max(1, Math.min(w, h) * 0.002);
      ctx.strokeStyle = 'rgba(10, 5, 18, 0.55)';
      ctx.strokeRect(kx + 4, ky + 4, slot.w - 8, slot.h - 8);
      // Selected-panel marker (editor only, skipped on export).
      if (state.highlightSlot === i && !state.forExport) {
        ctx.lineWidth = Math.max(4, Math.min(w, h) * 0.009);
        ctx.strokeStyle = '#ffd166';
        ctx.setLineDash([14, 8]);
        ctx.strokeRect(kx - 3, ky - 3, slot.w + 6, slot.h + 6);
        ctx.setLineDash([]);
      }
      ctx.restore();
    }
  });

  // Grade tint over the whole cover.
  ctx.save();
  ctx.globalCompositeOperation = grade.mode;
  const tint = ctx.createLinearGradient(0, 0, w, h);
  tint.addColorStop(0, grade.tint[0]);
  tint.addColorStop(1, grade.tint[1]);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Warm horizon glow across the lower third.
  const glow = ctx.createLinearGradient(0, h * 0.55, 0, h);
  glow.addColorStop(0, 'rgba(255, 154, 61, 0)');
  glow.addColorStop(1, 'rgba(255, 94, 60, 0.14)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);

  if (state.halftone) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = ctx.createPattern(halftonePattern(Math.max(10, Math.round(w / 160)), Math.max(1.5, w / 900)), 'repeat');
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  drawTitleBlock(ctx, state, w, h, frame);
  drawBadge(ctx, w, h, frame);

  if (state.vignette !== false) {
    const vg = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.42,
      w / 2, h / 2, Math.max(w, h) * 0.75,
    );
    vg.addColorStop(0, 'rgba(10, 5, 18, 0)');
    vg.addColorStop(1, 'rgba(10, 5, 18, 0.42)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }

  if (state.grain !== false) {
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(grainPattern(), 'repeat');
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Outer poster frame.
  if (frameOn) {
    ctx.lineWidth = Math.max(4, Math.min(w, h) * 0.012);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(frame.left / 2, frame.top / 2, w - frame.left, h - frame.top);
  }
  return canvas;
}
