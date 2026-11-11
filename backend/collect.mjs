import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { validateSnapshot } from './publish-snapshot.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modules = {};
const context = vm.createContext({ window: { __modules: modules } });
for (const file of ['cities', 'districts']) vm.runInContext(fs.readFileSync(path.join(root, 'js', file + '.js'), 'utf8'), context);
export const cities = modules.districts.allCityGeo().map(c => ({ ...c, key: modules.cities.getLocationKey(c.name) })).filter(c => c.key);

export function reserve(state, now, limit = 450, batch = 4, bootstrap = false, priority = '') {
  if (!Array.isArray(state.calls) || !state.entries || !Number.isInteger(state.cursor)) throw Error('Invalid quota ledger');
  state.calls = state.calls.filter(t => now - t < 86400000);
  state.pending = [];
  // Manual reruns cannot accelerate collection. Delayed schedules may consume
  // missed 15-minute slots, capped at one rotation and the rolling quota.
  if (now - (state.lastAttempt || 0) < 15 * 60000) return state;
  const initial = bootstrap && !state.initialCoverageReserved;
  const slots = state.lastAttempt ? Math.max(1, Math.floor((now - state.lastAttempt) / 900000)) : 1;
  const requested = initial ? cities.length - state.cursor : Math.min(cities.length, batch * slots);
  let count = Math.max(0, Math.min(requested, limit - state.calls.length));
  let reserved = 0;
  // A city named in the manual update form is collected first; the normal
  // rotation then continues within the same quota and cooldown.
  const wanted = priority
    ? cities.find(c => c.name === priority || c.name.includes(priority) || priority.includes(c.name))
    : null;
  if (wanted && count > 0) {
    state.pending.push(wanted);
    state.calls.push(now);
    reserved += 1;
    count -= 1;
  }
  for (let i = 0; i < count; i++) {
    const city = cities[state.cursor % cities.length];
    state.cursor = (state.cursor + 1) % cities.length;
    if (state.pending.some(p => p.key === city.key)) continue;
    state.pending.push(city);
    state.calls.push(now);
    reserved += 1;
  }
  if (reserved) state.lastAttempt = now;
  if (initial && count === requested) state.initialCoverageReserved = true;
  return state;
}

export async function collect(state, key, fetcher = fetch, now = Date.now, pause = () => new Promise(resolve => setTimeout(resolve, 300))) {
  for (const city of state.pending || []) {
    const route = '/alerts/v1/' + city.key + '.json';
    try {
      const res = await fetcher('https://openapi.weathercn.com' + route + '?apikey=' + encodeURIComponent(key) + '&details=true&language=zh-cn', { signal: AbortSignal.timeout(10000), redirect: 'error' });
      const data = res.status === 404 ? [] : await res.json();
      if (res.status !== 404 && (!res.ok || (!Array.isArray(data) && !Array.isArray(data?.alerts)))) throw Error('Invalid response');
      // Do not publish credential strings echoed by an upstream service.
      const safe = JSON.parse(JSON.stringify(data).split(key).join('[redacted]'));
      validateSnapshot({ version: 1, generatedAt: now(), entries: { [route]: { data: safe, checkedAt: now() } } });
      state.entries[route] = { data: safe, checkedAt: now() };
    } catch { console.error('City update failed; last good result retained.'); }
    await pause();
  }
  state.pending = [];
  return state;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  const phase = process.argv[2];
  const statePath = path.join(root, 'backend/data/state.json');
  const snapshotPath = path.join(root, 'public-data/warnings.json');
  let parent = '';
  const remote = git('ls-remote', '--heads', 'origin', 'ndw-data');
  if (remote) {
    git('fetch', 'origin', 'ndw-data'); parent = git('rev-parse', 'FETCH_HEAD');
  }
  let state;
  if (phase === 'reserve') {
    if (!process.env.WEATHERCN_API_KEY) throw Error('Set the WEATHERCN_API_KEY Actions secret');
    state = parent ? JSON.parse(git('show', parent + ':backend/data/state.json')) : { calls: [], entries: {}, cursor: 0, lastAttempt: 0 };
    reserve(state, Date.now(), 450, 4, true, process.env.PRIORITY_CITY || '');
  } else if (phase === 'collect') {
    if (!parent || !process.env.WEATHERCN_API_KEY) throw Error('Missing reservation or key');
    state = JSON.parse(git('show', parent + ':backend/data/state.json'));
    await collect(state, process.env.WEATHERCN_API_KEY);
  } else throw Error('Expected reserve or collect');
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(state));
  fs.writeFileSync(snapshotPath, JSON.stringify({ version: 1, generatedAt: Date.now(), entries: state.entries }));
  // A separate index creates a data-only branch without modifying the source checkout.
  process.env.GIT_INDEX_FILE = path.join(root, '.git/ndw-data-index');
  git('read-tree', '--empty');
  git('add', '-f', 'backend/data/state.json', 'public-data/warnings.json');
  const tree = git('write-tree');
  const commit = git('commit-tree', tree, ...(parent ? ['-p', parent] : []), '-m', 'Update shared warning ' + phase);
  // Reservation push MUST succeed before the collect phase can spend quota.
  git('push', 'origin', commit + ':refs/heads/ndw-data');
}
