// Neon Palms Cover Studio — entry program for make.fun gta6-cover-art-01.
//
// Node 22, standard library only. It hands the entry in: copies this
// repository's app/ (the offline static cover maker) and screenshots/ (real
// renders of the app at work) into /output — or $MAKEFUN_OUTPUT_DIR outside
// the grader — and writes /output/dossier.json with buildDossier from the
// kit's vendored library, vendor/makefun-app.ts.
//
// Run it locally to check the hand-in before submitting:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// The repository root: the folder this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));

// The grader hands the program a writable /output; locally the env var
// stands in for it.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handIn() {
  mkdirSync(outputDir, { recursive: true });

  // The app itself: plain static files, no build step.
  cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

  // The screenshots: 3 or 4 real renders of the app, first by name the cover.
  const shotsDir = join(outputDir, 'screenshots');
  mkdirSync(shotsDir, { recursive: true });
  if (existsSync(join(repoRoot, 'screenshots'))) {
    cpSync(join(repoRoot, 'screenshots'), shotsDir, { recursive: true });
  }

  // The dossier the judge reads: what buildDossier writes from the two
  // folders above, with the gate's own caps, so a local run refuses exactly
  // where the scorer would.
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

handIn();
