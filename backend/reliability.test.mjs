import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { assertSnapshotReady } from './publish-snapshot.mjs';
import { checkSite } from './prepare-site.mjs';

function module(name) {
  const context = vm.createContext({ window: { __modules: {} }, wx: { getStorageSync: () => 'en' } });
  vm.runInContext(fs.readFileSync(new URL('../js/' + name + '.js', import.meta.url), 'utf8'), context);
  return context.window.__modules[name];
}

test('freshness separates known, outdated, missing and future checks', () => {
  const policy = module('reliability'), now = Date.now();
  assert.equal(policy.freshness(now - 60000, now), 'available');
  assert.equal(policy.freshness(now - 21600000, now), 'outdated');
  for (const value of [null, undefined, NaN, 0, now + 600000]) assert.equal(policy.freshness(value, now), 'unavailable');
  for (const lang of ['zh', 'en', 'es', 'fr', 'it']) {
    assert.deepEqual(Object.keys(policy.copy[lang]).sort(), Object.keys(policy.copy.en).sort());
    if (lang !== 'zh') assert(!/[\u3400-\u9fff]/u.test(JSON.stringify(policy.copy[lang])));
  }
});

test('colliding labels thin out without removing marker data', () => {
  const result = module('reliability').visibleLabels([
    { x: 0, y: 0, width: 30, height: 10 },
    { x: 10, y: 0, width: 30, height: 10 },
    { x: 60, y: 0, width: 30, height: 10 }
  ]);
  assert.equal(JSON.stringify(result), '[true,false,true]');
});

test('empty, malformed and fully outdated data cannot be published as healthy', () => {
  const now = Date.now();
  const snapshot = { version: 1, generatedAt: now, entries: {} };
  assert.throws(() => assertSnapshotReady(snapshot, now), /empty/);
  snapshot.entries['/alerts/v1/1.json'] = { checkedAt: now - 21600000, data: [] };
  assert.throws(() => assertSnapshotReady(snapshot, now), /fresh/);
  snapshot.entries['/alerts/v1/1.json'].checkedAt = now + 600000;
  assert.throws(() => assertSnapshotReady(snapshot, now), /future/);
  snapshot.entries['/alerts/v1/1.json'] = { checkedAt: now, data: [{ AlertID: 'valid' }] };
  assert.equal(assertSnapshotReady(snapshot, now).fresh, 1);
  snapshot.entries['/alerts/v1/1.json'].data = [null];
  assert.throws(() => assertSnapshotReady(snapshot, now), /record/);
});

test('localized summaries do not expose heuristic risk percentages', () => {
  const i18n = module('i18n');
  for (const lang of ['en', 'es', 'fr', 'it']) {
    const text = i18n.alertSummary({ title: '暴雨橙色预警', type: '暴雨', level: 'orange', risks: [{ key: 'urban_flooding', prob: 82 }] }, lang);
    assert(!text.includes('82') && !text.includes('%'));
  }
});

test('offline manifest covers every script and stylesheet in the site', () => {
  // Pre-collection tests must not prevent the collector from refreshing old data.
  const result = checkSite(new URL('../', import.meta.url).pathname, { requireFresh: false });
  assert(result.assets > 20 && result.version.length === 16);
});

test('service worker only intercepts shell assets, never warning snapshots', () => {
  const events = {};
  const context = vm.createContext({
    self: { location: new URL('https://geowarning.cn/sw.js'), addEventListener: (event, handler) => events[event] = handler },
    URL, Set
  });
  vm.runInContext(fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8'), context);
  let intercepted = false;
  events.fetch({ request: { method: 'GET', url: 'https://geowarning.cn/public-data/warnings.json?updated=1' }, respondWith: () => intercepted = true });
  assert.equal(intercepted, false);
  events.fetch({ request: { method: 'GET', url: 'https://example.com/other' }, respondWith: () => intercepted = true });
  assert.equal(intercepted, false);
});
