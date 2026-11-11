#!/usr/bin/env node
/**
 * Lightweight visual-regression helper for the static site.
 *
 *   node tools/visual-check.mjs            capture screenshots -> tools/_screens/
 *   node tools/visual-check.mjs --update   capture and refresh the baselines
 *   node tools/visual-check.mjs --check    compare against baselines (exit 1 on drift)
 *
 * Environment:
 *   CHROME_BIN  path to Chrome/Edge (auto-detected on Windows/Linux otherwise)
 *
 * Pixel comparison uses tools/visual-diff.py (Python + Pillow). Without Python
 * the check falls back to a byte comparison, which is stricter.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outDir = path.join(here, '_screens');
const baselineDir = path.join(outDir, 'baseline');
const profile = path.join(os.tmpdir(), 'ndw-visual-profile');

const routes = [
  ['home', '#/home'],
  ['map', '#/map'],
  ['settings', '#/settings'],
  ['guide', '#/guide'],
];
const widths = [1440, 390];
const threshold = process.env.VISUAL_THRESHOLD || '0.005';

function findChrome() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];
  for (const candidate of candidates) if (existsSync(candidate)) return candidate;
  throw new Error('Chrome/Edge not found. Set CHROME_BIN to its executable path.');
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(cmd + ' exited ' + code))));
  });
}

async function screenshot(chrome, route, width, out) {
  const url = pathToFileURL(path.join(root, 'index.html')).href + route;
  await run(chrome, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-extensions',
    '--hide-scrollbars', '--window-size=' + width + ',1100',
    '--virtual-time-budget=3000', '--user-data-dir=' + profile,
    '--screenshot=' + out, url,
  ]);
}

async function diff(a, b) {
  try {
    await run('python', [path.join(here, 'visual-diff.py'), a, b, threshold]);
    return true;
  } catch (error) {
    if (error.message.includes('ENOENT')) {
      // No Python: fall back to a strict byte comparison.
      const { readFileSync } = await import('node:fs');
      return readFileSync(a).equals(readFileSync(b));
    }
    return false;
  }
}

(async () => {
  const check = process.argv.includes('--check');
  const update = process.argv.includes('--update');
  const chrome = findChrome();
  mkdirSync(baselineDir, { recursive: true });
  let failures = 0;
  for (const [name, route] of routes) {
    for (const width of widths) {
      const file = name + '-' + width + '.png';
      const out = path.join(outDir, file);
      const baseline = path.join(baselineDir, file);
      await screenshot(chrome, route, width, out);
      if (update) {
        copyFileSync(out, baseline);
        console.log('baseline updated:', file);
      } else if (check) {
        if (!existsSync(baseline)) { console.log('no baseline for', file); continue; }
        const same = await diff(baseline, out);
        console.log((same ? 'ok      ' : 'CHANGED ') + file);
        if (!same) failures += 1;
      }
    }
  }
  if (check && failures) {
    console.error(failures + ' screenshot(s) changed; review and run --update if intended.');
    process.exit(1);
  }
  console.log('screenshots written to', outDir);
})().catch((error) => { console.error(error); process.exit(1); });
