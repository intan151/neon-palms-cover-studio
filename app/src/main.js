// Neon Palms Cover Studio — editor wiring.
//
// Owns the page state (photos, layout, grade, caption, per-panel crop) and
// re-renders the preview through cover.js on every change. Photos are read
// with FileReader on this machine and never uploaded anywhere.

import { LAYOUTS, GRADES, TITLE_COLORS, EXPORT_SIZES, layoutSlots, renderCover } from './cover.js';
import { paintSampleScene } from './sample.js';

const $ = (id) => document.getElementById(id);
const preview = $('preview');
const previewFrame = $('previewFrame');

const state = {
  photos: [], // { image, name, kind: 'upload' | 'sample' }
  layout: 'hero-trio',
  grade: 'vice-sunset',
  title: 'NEON PALMS',
  subtitle: 'a vice city story',
  tagline: 'WELCOME TO PARADISE',
  titleColor: 'sunset',
  titlePosition: 'bottom',
  frame: true,
  grain: true,
  vignette: true,
  halftone: false,
  exportSize: '1080x1080',
  selectedSlot: 0,
  highlightSlot: 0,
  // Per-slot crop: which photo, zoom, pan offsets (fractions of panel size).
  slots: [],
  forExport: false,
};

function slotCount() {
  return (LAYOUTS.find((l) => l.id === state.layout) || LAYOUTS[0]).slots;
}

function ensureSlots() {
  const n = slotCount();
  while (state.slots.length < n) {
    state.slots.push({ photo: state.slots.length % Math.max(1, state.photos.length), zoom: 1.15, dx: 0, dy: 0 });
  }
  state.slots.length = n;
  if (state.selectedSlot >= n) state.selectedSlot = 0;
  if (state.highlightSlot >= n) state.highlightSlot = 0;
}

function previewSize() {
  const size = EXPORT_SIZES.find((s) => s.id === state.exportSize) || EXPORT_SIZES[0];
  const cap = 900;
  const scale = Math.min(1, cap / Math.max(size.w, size.h));
  return { w: Math.round(size.w * scale), h: Math.round(size.h * scale) };
}

function render() {
  ensureSlots();
  const { w, h } = previewSize();
  if (preview.width !== w || preview.height !== h) {
    preview.width = w;
    preview.height = h;
  }
  renderCover(preview, state);
  $('panelLabel').textContent = `Panel ${state.selectedSlot + 1} of ${slotCount()}`;
  const adj = state.slots[state.selectedSlot];
  if (adj) $('zoomSlider').value = String(adj.zoom);
}

function loadSampleScene() {
  const scene = document.createElement('canvas');
  scene.width = 1200;
  scene.height = 900;
  paintSampleScene(scene);
  state.photos = [{ image: scene, name: 'Sample scene — sunset boulevard', kind: 'sample' }];
  state.slots.forEach((slot) => { slot.photo = 0; });
  renderThumbs();
  render();
}

function renderThumbs() {
  const box = $('thumbs');
  box.innerHTML = '';
  state.photos.forEach((photo, i) => {
    const img = document.createElement('img');
    img.className = 'thumb';
    img.alt = photo.name;
    img.title = photo.name;
    img.src = photo.image.toDataURL ? photo.image.toDataURL('image/png') : photo.image.src;
    img.addEventListener('click', () => {
      ensureSlots();
      state.slots[state.selectedSlot].photo = i;
      renderThumbs();
      render();
    });
    box.appendChild(img);
  });
  for (let i = state.photos.length; i < 4; i += 1) {
    const empty = document.createElement('div');
    empty.className = 'thumb-empty';
    empty.textContent = 'Empty slot';
    box.appendChild(empty);
  }
  // Mark the photo used by the selected panel.
  const active = state.slots[state.selectedSlot];
  const thumbs = box.querySelectorAll('.thumb');
  thumbs.forEach((t, i) => t.classList.toggle('is-active', !!active && active.photo === i));
}

function buildLayoutButtons() {
  const grid = $('layoutGrid');
  // Tiny inline diagrams: one svg per layout drawn from its slot rects.
  const diagrams = {
    'hero-trio': [[0, 0, 62, 100], [66, 0, 34, 31], [66, 34.5, 34, 31], [66, 69, 34, 31]],
    'four-grid': [[0, 0, 48, 48], [52, 0, 48, 48], [0, 52, 48, 48], [52, 52, 48, 48]],
    'nine-panel': [[0, 0, 31, 31], [34.5, 0, 31, 31], [69, 0, 31, 31], [0, 34.5, 31, 31], [34.5, 34.5, 31, 31], [69, 34.5, 31, 31], [0, 69, 31, 31], [34.5, 69, 31, 31], [69, 69, 31, 31]],
    'full-strip': [[0, 0, 100, 100], [4, 70, 29, 26], [35.5, 70, 29, 26], [67, 70, 29, 26]],
    'tilted-snaps': [[0, 0, 100, 100], [6, 10, 42, 30], [52, 16, 42, 30], [30, 52, 42, 30]],
    'comic-five': [[0, 0, 48, 34], [52, 0, 48, 34], [0, 38, 100, 28], [0, 70, 48, 30], [52, 70, 48, 30]],
  };
  LAYOUTS.forEach((layout) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'layout-btn';
    btn.dataset.layout = layout.id;
    const rects = (diagrams[layout.id] || []).map(
      ([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#ff9a3d" opacity="0.85"/>`,
    ).join('');
    btn.innerHTML = `<svg class="diagram" viewBox="0 0 100 100" aria-hidden="true">${rects}</svg><span>${layout.name}</span>`;
    btn.addEventListener('click', () => {
      state.layout = layout.id;
      document.querySelectorAll('.layout-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
      render();
    });
    grid.appendChild(btn);
  });
  grid.querySelector('[data-layout="hero-trio"]').classList.add('is-active');
}

function buildGradeSwatches() {
  const row = $('gradeRow');
  const paints = {
    'vice-sunset': 'linear-gradient(135deg,#2b1055,#ff2e88 55%,#ff9a3d)',
    'neon-night': 'linear-gradient(135deg,#12082e,#4014a0 55%,#ff2e88)',
    'teal-dawn': 'linear-gradient(135deg,#0b2e2a,#2ee6c8 55%,#ff9a3d)',
    'hot-pink': 'linear-gradient(135deg,#4d0a33,#ff2e88 60%,#ff7ad9)',
    'golden-hour': 'linear-gradient(135deg,#3d2405,#ff9a3d 55%,#ffd166)',
  };
  GRADES.forEach((grade) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'grade-swatch';
    btn.title = grade.name;
    btn.setAttribute('aria-label', grade.name);
    btn.style.background = paints[grade.id] || '#333';
    btn.addEventListener('click', () => {
      state.grade = grade.id;
      document.querySelectorAll('.grade-swatch').forEach((b) => b.classList.toggle('is-active', b === btn));
      render();
    });
    row.appendChild(btn);
  });
  row.querySelector('.grade-swatch').classList.add('is-active');
}

function buildTitleColors() {
  const row = $('titleColors');
  const paints = {
    white: '#ffffff',
    sunset: 'linear-gradient(135deg,#ffd166,#ff9a3d 50%,#ff2e88)',
    pink: '#ff2e88',
    gold: '#ffd166',
    black: '#160a26',
  };
  TITLE_COLORS.forEach((color) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'color-swatch';
    btn.title = color.name;
    btn.setAttribute('aria-label', `Title colour: ${color.name}`);
    btn.style.background = paints[color.id];
    btn.addEventListener('click', () => {
      state.titleColor = color.id;
      document.querySelectorAll('.color-swatch').forEach((b) => b.classList.toggle('is-active', b === btn));
      render();
    });
    row.appendChild(btn);
  });
  row.querySelector('[title="Sunset"]').classList.add('is-active');
}

function addPhotos(files) {
  const list = [...files].filter((f) => f.type.startsWith('image/'));
  if (list.length === 0) return;
  list.slice(0, 4 - state.photos.length).forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        state.photos.push({ image: img, name: file.name, kind: 'upload' });
        renderThumbs();
        render();
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function exportCover(sizeId) {
  const size = EXPORT_SIZES.find((s) => s.id === sizeId) || EXPORT_SIZES[0];
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  const savedHighlight = state.highlightSlot;
  state.forExport = true;
  state.highlightSlot = -1;
  renderCover(canvas, state);
  state.forExport = false;
  state.highlightSlot = savedHighlight;
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neon-palms-cover-${size.w}x${size.h}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    $('exportNote').textContent = `Exported ${size.w} × ${size.h} PNG — check your downloads.`;
  }, 'image/png');
}

function exportAll() {
  EXPORT_SIZES.forEach((size, i) => {
    setTimeout(() => exportCover(size.id), i * 450);
  });
}

// ---- Panel picking + dragging on the preview -----------------------------

function previewPoint(event) {
  const rect = preview.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * preview.width;
  const y = ((event.clientY - rect.top) / rect.height) * preview.height;
  return { x, y };
}

function slotAt(x, y) {
  const slots = layoutSlots(state.layout, preview.width, preview.height);
  // Check topmost first (later slots draw over earlier ones).
  for (let i = slots.length - 1; i >= 0; i -= 1) {
    const s = slots[i];
    if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return i;
  }
  return -1;
}

let drag = null;
preview.addEventListener('pointerdown', (event) => {
  const { x, y } = previewPoint(event);
  const i = slotAt(x, y);
  if (i < 0) return;
  state.selectedSlot = i;
  state.highlightSlot = i;
  const slot = layoutSlots(state.layout, preview.width, preview.height)[i];
  drag = { slot: i, startX: x, startY: y, dx: state.slots[i].dx, dy: state.slots[i].dy, w: slot.w, h: slot.h };
  preview.setPointerCapture(event.pointerId);
  render();
});

preview.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const { x, y } = previewPoint(event);
  const adj = state.slots[drag.slot];
  adj.dx = drag.dx + (x - drag.startX) / drag.w;
  adj.dy = drag.dy + (y - drag.startY) / drag.h;
  // Keep the photo from sliding out of its panel entirely.
  adj.dx = Math.max(-0.6, Math.min(0.6, adj.dx));
  adj.dy = Math.max(-0.6, Math.min(0.6, adj.dy));
  render();
});

preview.addEventListener('pointerup', () => { drag = null; });
preview.addEventListener('pointercancel', () => { drag = null; });

// ---- Controls ------------------------------------------------------------

function bindControls() {
  $('photoInput').addEventListener('change', (event) => {
    addPhotos(event.target.files);
    event.target.value = '';
  });
  $('clearPhotosBtn').addEventListener('click', () => {
    state.photos = [];
    state.slots.forEach((slot) => { slot.photo = 0; });
    renderThumbs();
    render();
  });
  $('sampleBtn').addEventListener('click', loadSampleScene);
  $('exportBtn').addEventListener('click', () => exportCover(state.exportSize));
  $('exportAllBtn').addEventListener('click', exportAll);

  document.querySelectorAll('.size-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.exportSize = chip.dataset.size;
      document.querySelectorAll('.size-chip').forEach((c) => c.classList.toggle('is-active', c === chip));
      render();
    });
  });

  $('titleInput').addEventListener('input', (e) => { state.title = e.target.value; render(); });
  $('subtitleInput').addEventListener('input', (e) => { state.subtitle = e.target.value; render(); });
  $('taglineInput').addEventListener('input', (e) => { state.tagline = e.target.value; render(); });

  document.querySelectorAll('.seg').forEach((seg) => {
    seg.addEventListener('click', () => {
      state.titlePosition = seg.dataset.pos;
      document.querySelectorAll('.seg').forEach((s) => s.classList.toggle('is-active', s === seg));
      render();
    });
  });

  $('frameToggle').addEventListener('change', (e) => { state.frame = e.target.checked; render(); });
  $('grainToggle').addEventListener('change', (e) => { state.grain = e.target.checked; render(); });
  $('vignetteToggle').addEventListener('change', (e) => { state.vignette = e.target.checked; render(); });
  $('halftoneToggle').addEventListener('change', (e) => { state.halftone = e.target.checked; render(); });

  $('zoomSlider').addEventListener('input', (e) => {
    ensureSlots();
    state.slots[state.selectedSlot].zoom = Number(e.target.value);
    render();
  });
  $('fitBtn').addEventListener('click', () => {
    ensureSlots();
    const adj = state.slots[state.selectedSlot];
    adj.zoom = 1; adj.dx = 0; adj.dy = 0;
    render();
  });
  $('fillBtn').addEventListener('click', () => {
    ensureSlots();
    const adj = state.slots[state.selectedSlot];
    adj.zoom = 1.6; adj.dx = 0; adj.dy = 0;
    render();
  });

  // Drag-and-drop photos onto the preview.
  previewFrame.addEventListener('dragover', (e) => e.preventDefault());
  previewFrame.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files) addPhotos(e.dataTransfer.files);
  });
}

// ---- Screenshot mode -----------------------------------------------------
// ?shot=cover shows the finished cover alone, full-bleed, for screenshots:
// the page draws the same engine at the chosen export size, optionally picked
// with &size=1080x1350 (one of the three export sizes). ?shot=editor (or no
// param) is the normal studio.

function applyShotMode() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot === 'cover') {
    const wanted = params.get('size');
    if (wanted && EXPORT_SIZES.some((s) => s.id === wanted)) state.exportSize = wanted;
    document.body.classList.add('cover-only');
    const size = EXPORT_SIZES.find((s) => s.id === state.exportSize) || EXPORT_SIZES[0];
    preview.width = size.w;
    preview.height = size.h;
    state.highlightSlot = -1;
    renderCover(preview, state);
  }
}

buildLayoutButtons();
buildGradeSwatches();
buildTitleColors();
bindControls();
ensureSlots();
loadSampleScene();
applyShotMode();
