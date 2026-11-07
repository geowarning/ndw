import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { assertSnapshotReady, validateSnapshot } from './publish-snapshot.mjs';

export function checkSite(root, options = {}) {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const assets = [...new Set([...html.matchAll(/(?:src|href)="([^"?#]+\.(?:js|css|svg))"/g)].map(match => match[1]))].sort();
  const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const digest = crypto.createHash('sha256');
  for (const asset of ['index.html', ...assets]) {
    if (path.isAbsolute(asset) || asset.includes('..') || asset.includes('://')) throw Error('Unexpected public asset');
    const content = fs.readFileSync(path.join(root, asset));
    if (asset !== 'index.html' && !worker.includes("'./" + asset + "'")) throw Error('Offline cache is missing ' + asset);
    digest.update(asset + '\0').update(content).update('\0');
  }
  const snapshot = validateSnapshot(JSON.parse(fs.readFileSync(path.join(root, 'public-data/warnings.json'), 'utf8')));
  const health = options.requireFresh === false ? { cities: Object.keys(snapshot.entries).length } : assertSnapshotReady(snapshot);
  return { version: digest.digest('hex').slice(0, 16), assets: assets.length, ...health };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const health = checkSite(root);
  const workerPath = path.join(root, 'sw.js');
  fs.writeFileSync(workerPath, fs.readFileSync(workerPath, 'utf8').replace(/const CACHE = 'ndw-shell-[^']+';/, "const CACHE = 'ndw-shell-" + health.version + "';"));
  console.log('Site ready:', JSON.stringify(health));
}
