import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function validateSnapshot(snapshot) {
  if (snapshot.version !== 1 || !Number.isFinite(snapshot.generatedAt) || snapshot.generatedAt <= 0 ||
      !snapshot.entries || typeof snapshot.entries !== 'object' || Array.isArray(snapshot.entries)) {
    throw Error('Invalid public warning snapshot');
  }
  for (const [route, entry] of Object.entries(snapshot.entries)) {
    if (!entry || !/^\/alerts\/v1\/[A-Za-z0-9_-]+\.json$/.test(route) || !Number.isFinite(entry.checkedAt) || entry.checkedAt <= 0 ||
        (!Array.isArray(entry.data) && !Array.isArray(entry.data?.alerts))) {
      throw Error('Invalid city warning entry');
    }
    if ((entry.data.alerts || entry.data).some(alert => {
      if (!alert || typeof alert !== 'object' || Array.isArray(alert)) return true;
      return ![alert.AlertID, alert.alertId, alert.id, alert.HeadlineText, alert.headlineText, alert.title, alert.Description?.Localized, alert.Description].some(identity =>
        typeof identity === 'string' && identity.trim() || typeof identity === 'number' && Number.isFinite(identity));
    })) throw Error('Invalid warning record');
  }
  return snapshot;
}

export function assertSnapshotReady(snapshot, now = Date.now()) {
  validateSnapshot(snapshot);
  const entries = Object.values(snapshot.entries);
  if (!entries.length) throw Error('Refusing to publish an empty warning snapshot');
  if (snapshot.generatedAt > now + 300000 || entries.some(entry => entry.checkedAt > now + 300000)) throw Error('Snapshot timestamp is in the future');
  const fresh = entries.filter(entry => now - entry.checkedAt < 21600000).length;
  if (!fresh) throw Error('No fresh city data; collection needs attention');
  return { cities: entries.length, fresh };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const ref = process.argv[2] || 'origin/ndw-data';
  const snapshot = validateSnapshot(JSON.parse(execFileSync('git', ['show', ref + ':public-data/warnings.json'], { cwd: root, encoding: 'utf8' })));
  const health = assertSnapshotReady(snapshot);
  fs.mkdirSync(path.join(root, 'public-data'), { recursive: true });
  fs.writeFileSync(path.join(root, 'public-data/warnings.json'), JSON.stringify(snapshot));
  console.log('Prepared public snapshot:', health.fresh, 'fresh cities out of', health.cities);
}
