// Neon Palms Cover Studio — procedural sample scene.
//
// paintSampleScene draws an original Vice City-style sunset boulevard
// (striped sun, skyline, palm silhouettes, a leaning figure) straight onto a
// canvas with plain 2D shapes. No photo file ships with the app: this is the
// built-in sample a user starts from, and the engine treats the finished
// canvas as a photo like any upload. The drawing is deterministic: the same
// seed always paints the same scene, so screenshots reproduce.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function palmTree(ctx, x, baseY, height, lean, rand) {
  const dark = '#160a26';
  ctx.save();
  ctx.strokeStyle = dark;
  ctx.fillStyle = dark;
  ctx.lineCap = 'round';
  // Curved trunk.
  ctx.lineWidth = Math.max(5, height * 0.045);
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + lean * 0.4, baseY - height * 0.6, x + lean, baseY - height);
  ctx.stroke();
  const topX = x + lean;
  const topY = baseY - height;
  // Fronds: long drooping arcs fanning out from the crown.
  ctx.lineWidth = Math.max(4, height * 0.028);
  for (let i = 0; i < 7; i += 1) {
    const angle = Math.PI * (0.08 + (i / 6) * 0.84);
    const len = height * (0.42 + rand() * 0.14);
    const tipX = topX + Math.cos(angle) * len;
    const tipY = topY + Math.sin(angle) * len * 0.55 + height * 0.10;
    const midX = topX + Math.cos(angle) * len * 0.5;
    const midY = topY + Math.sin(angle) * len * 0.22 - height * 0.06;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    ctx.stroke();
  }
  // Coconuts.
  ctx.beginPath();
  ctx.arc(topX - 6, topY + 8, 6, 0, Math.PI * 2);
  ctx.arc(topX + 7, topY + 10, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function skyline(ctx, w, horizonY, rand) {
  ctx.fillStyle = '#241040';
  let x = -10;
  while (x < w + 10) {
    const bw = 46 + rand() * 90;
    const bh = 60 + rand() * 150;
    ctx.fillRect(x, horizonY - bh, bw, bh);
    // Antenna on some towers.
    if (rand() > 0.6) {
      ctx.fillRect(x + bw / 2 - 2, horizonY - bh - 26, 4, 26);
      ctx.fillStyle = '#ff2e88';
      ctx.beginPath();
      ctx.arc(x + bw / 2, horizonY - bh - 28, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#241040';
    }
    x += bw + 6 + rand() * 26;
  }
  // Lit windows: warm dots scattered over the towers.
  ctx.fillStyle = 'rgba(255, 209, 102, 0.85)';
  for (let i = 0; i < 90; i += 1) {
    const wx = rand() * w;
    const wy = horizonY - 14 - rand() * 180;
    ctx.fillRect(wx, wy, 4, 6);
  }
}

function leaningFigure(ctx, x, baseY, s) {
  // A stylised figure leaning on a low wall: head, sunglasses glint,
  // shoulders, torso, one bent leg. Flat silhouette, poster style.
  const dark = '#160a26';
  ctx.save();
  ctx.fillStyle = dark;
  ctx.strokeStyle = dark;
  ctx.lineCap = 'round';
  // Low wall the figure leans on.
  ctx.fillRect(x - s * 1.7, baseY - s * 0.42, s * 3.4, s * 0.42);
  // Back leg, planted.
  ctx.lineWidth = s * 0.26;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.28, baseY - s * 1.15);
  ctx.lineTo(x + s * 0.55, baseY);
  ctx.stroke();
  // Front leg, bent at the knee.
  ctx.beginPath();
  ctx.moveTo(x - s * 0.05, baseY - s * 1.15);
  ctx.lineTo(x - s * 0.42, baseY - s * 0.55);
  ctx.lineTo(x - s * 0.30, baseY);
  ctx.stroke();
  // Torso leaning back.
  ctx.lineWidth = s * 0.52;
  ctx.beginPath();
  ctx.moveTo(x, baseY - s * 1.15);
  ctx.quadraticCurveTo(x + s * 0.12, baseY - s * 1.85, x + s * 0.34, baseY - s * 2.05);
  ctx.stroke();
  // Arm resting on the wall.
  ctx.lineWidth = s * 0.2;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.28, baseY - s * 1.9);
  ctx.quadraticCurveTo(x + s * 0.8, baseY - s * 1.5, x + s * 1.05, baseY - s * 0.5);
  ctx.stroke();
  // Head with a sweep of hair.
  ctx.beginPath();
  ctx.arc(x + s * 0.42, baseY - s * 2.32, s * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.14, baseY - s * 2.42);
  ctx.quadraticCurveTo(x + s * 0.5, baseY - s * 2.78, x + s * 0.78, baseY - s * 2.5);
  ctx.quadraticCurveTo(x + s * 0.6, baseY - s * 2.28, x + s * 0.42, baseY - s * 2.34);
  ctx.closePath();
  ctx.fill();
  // Sunglasses glint.
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(x + s * 0.48, baseY - s * 2.36, s * 0.2, s * 0.07);
  ctx.restore();
}

export function paintSampleScene(canvas, seed = 20261120) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const rand = mulberry32(seed);
  const horizonY = h * 0.68;

  // Sunset sky.
  const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
  sky.addColorStop(0, '#2b1055');
  sky.addColorStop(0.42, '#8b1e6e');
  sky.addColorStop(0.72, '#ff2e88');
  sky.addColorStop(1, '#ff9a3d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizonY + 2);

  // Striped retro sun sinking to the horizon.
  const sunX = w * 0.62;
  const sunY = horizonY - h * 0.10;
  const sunR = h * 0.17;
  const sun = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
  sun.addColorStop(0, '#fff3b0');
  sun.addColorStop(0.55, '#ffd166');
  sun.addColorStop(1, '#ff7a3d');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  // Cut horizontal slits across the sun's lower half.
  ctx.fillStyle = '#ff2e88';
  let slitY = sunY + sunR * 0.08;
  let slitH = 4;
  while (slitY < sunY + sunR) {
    ctx.fillRect(sunX - sunR - 2, slitY, sunR * 2 + 4, slitH);
    slitY += slitH + 14;
    slitH += 3;
  }
  // Re-cover the sky-coloured band trick: paint the slits with the sky tone
  // gradient so they read as gaps, not bars.
  const slitGrad = ctx.createLinearGradient(0, sunY, 0, sunY + sunR);
  slitGrad.addColorStop(0, 'rgba(255,46,136,0)');
  slitGrad.addColorStop(1, 'rgba(255,46,136,0.55)');

  // Birds.
  ctx.strokeStyle = 'rgba(22,10,38,0.85)';
  ctx.lineWidth = Math.max(2, h * 0.004);
  for (let i = 0; i < 6; i += 1) {
    const bx = w * (0.08 + rand() * 0.5);
    const by = h * (0.10 + rand() * 0.22);
    const bs = 8 + rand() * 10;
    ctx.beginPath();
    ctx.moveTo(bx - bs, by);
    ctx.quadraticCurveTo(bx - bs * 0.4, by - bs * 0.7, bx, by);
    ctx.quadraticCurveTo(bx + bs * 0.4, by - bs * 0.7, bx + bs, by);
    ctx.stroke();
  }

  skyline(ctx, w, horizonY, rand);

  // Sea shimmer below the horizon.
  const sea = ctx.createLinearGradient(0, horizonY, 0, h);
  sea.addColorStop(0, '#ff7a3d');
  sea.addColorStop(0.25, '#b83280');
  sea.addColorStop(1, '#1c0b33');
  ctx.fillStyle = sea;
  ctx.fillRect(0, horizonY, w, h - horizonY);
  // Sun path on the water.
  ctx.fillStyle = 'rgba(255, 209, 102, 0.5)';
  for (let i = 0; i < 26; i += 1) {
    const lw = (20 + rand() * 90) * (1 + i * 0.12);
    const ly = horizonY + 8 + i * ((h - horizonY) / 28);
    ctx.fillRect(sunX - lw / 2 + (rand() - 0.5) * 30, ly, lw, 3);
  }

  // Foreground boulevard strip.
  ctx.fillStyle = '#160a26';
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.88);
  ctx.lineTo(w, h * 0.82);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  // Kerb light.
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.88);
  ctx.lineTo(w, h * 0.82);
  ctx.stroke();

  // Palms framing the scene.
  palmTree(ctx, w * 0.06, h * 0.94, h * 0.42, w * 0.05, rand);
  palmTree(ctx, w * 0.93, h * 0.92, h * 0.36, -w * 0.04, rand);
  palmTree(ctx, w * 0.30, h * 0.90, h * 0.20, w * 0.02, rand);

  // The leaning figure, right of centre on the boulevard. Drawn large
  // enough to survive a panel's centre crop: the hero panel only shows the
  // middle slice of the scene, so the figure must read at that crop.
  leaningFigure(ctx, w * 0.56, h * 0.985, h * 0.115);

  return canvas;
}
