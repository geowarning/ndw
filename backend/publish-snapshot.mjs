import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function validateSnapshot(snapshot) {
  if (snapshot.version !== 1 || !Number.isFinite(snapshot.generatedAt) ||
      !snapshot.entries || typeof snapshot.entries !== 'object' || Array.isArray(snapshot.entries)) {
    throw Error('Invalid public warning snapshot');
  }
  for (const [route, entry] of Object.entries(snapshot.entries)) {
    if (!/^\/alerts\/v1\/[A-Za-z0-9_-]+\.json$/.test(route) || !Number.isFinite(entry.checkedAt) ||
        (!Array.isArray(entry.data) && !Array.isArray(entry.data?.alerts))) {
      throw Error('Invalid city warning entry');
    }
  }
  return snapshot;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const ref = process.argv[2] || 'origin/ndw-data';
  const snapshot = validateSnapshot(JSON.parse(execFileSync('git', ['show', ref + ':public-data/warnings.json'], { cwd: root, encoding: 'utf8' })));
  fs.mkdirSync(path.join(root, 'public-data'), { recursive: true });
  fs.writeFileSync(path.join(root, 'public-data/warnings.json'), JSON.stringify(snapshot));
  console.log('Prepared public snapshot for', Object.keys(snapshot.entries).length, 'cities.');
}
