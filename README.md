# Neon Palms Cover Studio

[![Make GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01/)
[![Rank](https://make.fun/badge/gta6-cover-art-01/intan151/neon-palms-cover-studio/rank.svg)](https://make.fun/c/gta6-cover-art-01/)
[![Reward](https://make.fun/badge/gta6-cover-art-01/intan151/neon-palms-cover-studio/reward.svg)](https://make.fun/c/gta6-cover-art-01/)

An offline, in-browser cover art maker in the style of GTA 6's multi-panel
posters. Built for the [Make GTA 6 Cover Art](https://make.fun/c/gta6-cover-art-01/)
competition on make.fun.

Drop in your own photos, pick a panel layout, grade it with a Vice City
neon sunset, letter a bold condensed caption over it, and export a share-ready
PNG — all on your machine, nothing uploaded, no network needed.

## How to use

1. Serve the `app/` folder with any static server (for example
   `python3 -m http.server` inside `app/`), then open `index.html`.
2. Add photos with **Add photos** (or drag them onto the preview), or press
   **Load sample scene** to try the built-in procedurally drawn sunset.
3. Pick a layout (Hero Trio, Four Grid, Nine Panel, Full Strip, Tilted Snaps,
   Comic Five), a grade (Vice Sunset, Neon Night, Teal Dawn, Hot Pink,
   Golden Hour), and type your title, subtitle and tagline.
4. Click a panel to select it, then drag it to reposition the photo inside
   the panel and use the zoom slider to crop it.
5. Press **Export** for 1080×1080, 1080×1350 or 1920×1080 — or **Export all
   three sizes** — and the PNG downloads straight from your browser.

## What it is

- Pure static files under `app/` — `index.html`, one stylesheet and three ES
  modules. No build step, no libraries, no network requests.
- The sample scene is drawn procedurally on a canvas (sunset, skyline, palm
  silhouettes, a leaning figure) — no photo files ship with the app.
- Lettering uses only the system condensed font stack
  (`Arial Narrow`, `Helvetica Neue Condensed Bold`, `Franklin Gothic Medium`,
  Impact, sans-serif) — no font files, no Rockstar logo, artwork or fonts.
- Export renders the same cover engine to an offscreen canvas at full size
  and downloads it as a PNG.

## Entry program

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `/output/dossier.json`
with `buildDossier` from `vendor/makefun-app.ts`.

## License

MIT — see [LICENSE](LICENSE).
