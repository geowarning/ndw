import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('provider records preserve check time, omit missing issue times, and reject unsafe source links', async () => {
  const modules = {}, saved = new Map();
  let snapshot;
  const context = vm.createContext({
    window: { __modules: modules }, navigator: { onLine: true }, URL, AbortSignal,
    wx: { getStorageSync: key => saved.get(key) || '', setStorageSync: (key, value) => saved.set(key, value), getStorageInfoSync: () => ({ keys: [...saved.keys()] }), removeStorageSync: key => saved.delete(key) },
    __require: name => modules[name],
    fetch: async () => ({ ok: true, json: async () => snapshot })
  });
  for (const name of ['config', 'data', 'cities', 'i18n', 'reliability', 'api']) {
    vm.runInContext(fs.readFileSync(new URL('../js/' + name + '.js', import.meta.url), 'utf8'), context);
  }
  const key = modules.cities.getLocationKey('广州市');
  const checkedAt = Date.now() - 60000;
  snapshot = { version: 1, entries: { ['/alerts/v1/' + key + '.json']: { checkedAt, data: [
    { AlertID: 'safe', Type: '暴雨', Level: 'orange', HeadlineText: '暴雨橙色预警', MobileLink: 'https://example.com/notice' },
    { AlertID: 'unsafe', Type: '大风', Level: 'blue', HeadlineText: '大风蓝色预警', MobileLink: 'javascript:alert(1)' }
  ] } } };
  const result = await modules.api.fetchAll({ city: '广州市', adcode: '440100' });
  assert.equal(result.ok, true);
  assert.equal(result.fetchedAt, checkedAt);
  assert.equal(result.alerts[0].checkedAt, checkedAt);
  assert.equal(result.alerts[0].time, '');
  assert.equal(result.alerts[0].sourceUrl, 'https://example.com/notice');
  assert.equal(result.alerts[1].sourceUrl, '');
  context.navigator.onLine = false;
  assert.equal((await modules.api.fetchAll({ city: '广州市', adcode: '440100' })).ok, false);
  assert.equal(await modules.api.fetchAlertsOnly({ city: '广州市', adcode: '440100' }), null);
});

test('past city scans retain real counts and timestamps through stale, partial and failed refreshes', async () => {
  const modules = {}, saved = new Map(), urls = [];
  let snapshot, failed = false;
  const context = vm.createContext({
    window: { __modules: modules }, navigator: { onLine: true }, URL, AbortSignal,
    wx: { getStorageSync: key => saved.get(key) || '', setStorageSync: (key, value) => saved.set(key, value), getStorageInfoSync: () => ({ keys: [...saved.keys()] }), removeStorageSync: key => saved.delete(key) },
    __require: name => modules[name],
    fetch: async url => { urls.push(url); if (failed) throw Error('offline'); return { ok: true, json: async () => snapshot }; }
  });
  for (const name of ['config', 'data', 'cities', 'i18n', 'reliability', 'api']) {
    vm.runInContext(fs.readFileSync(new URL('../js/' + name + '.js', import.meta.url), 'utf8'), context);
  }
  const region = { city: '广州市', adcode: '440100' }, api = modules.api;
  const route = '/alerts/v1/' + modules.cities.getLocationKey(region.city) + '.json';
  const checkedAt = Date.now() - 7 * 3600000;
  snapshot = { version: 1, entries: { [route]: { checkedAt, data: [{ AlertID: 'past', Type: '暴雨', Level: 'red', HeadlineText: '暴雨红色预警' }] } } };
  assert.equal(await api.fetchAlertsOnly(region), null, 'Stale warnings must not become current');
  let status = api.getLastKnownCityStatus(region);
  assert.equal(status.count, 1);
  assert.equal(status.high, true);
  assert.equal(status.checkedAt, checkedAt);
  const emptyRegion = { city: '上海市', adcode: '310100' };
  const emptyRoute = '/alerts/v1/' + modules.cities.getLocationKey(emptyRegion.city) + '.json';
  snapshot.entries[emptyRoute] = { checkedAt, data: [] };
  api.refreshSnapshot();
  assert.equal(await api.fetchAlertsOnly(emptyRegion), null);
  assert.equal(api.getLastKnownCityStatus(emptyRegion).count, 0, 'A historical zero is a known result, not missing data');
  snapshot = { version: 1, entries: {} };
  api.refreshSnapshot();
  await api.fetchAlertsOnly(region);
  assert.equal(api.getLastKnownCityStatus(region).count, 1, 'Partial snapshot must retain prior data');
  failed = true;
  api.refreshSnapshot();
  await api.fetchAlertsOnly(region);
  assert.equal(api.getLastKnownCityStatus(region).checkedAt, checkedAt, 'Failure must not renew or erase the check time');
  failed = false;
  const newTime = Date.now() - 60000;
  snapshot.entries[route] = { checkedAt: newTime, data: [] };
  api.refreshSnapshot();
  assert.equal((await api.fetchAlertsOnly(region)).length, 0);
  assert.equal(api.getLastKnownCityStatus(region).count, 0, 'A successful empty scan replaces past warnings');
  assert.equal(api.getLastKnownCityStatus(region).checkedAt, newTime);
  assert.equal(api.getLastKnownCityStatus({ city: '北京市', adcode: '110100' }), null);
  assert(urls.every(url => url.startsWith('public-data/warnings.json?')), 'Only shared snapshots may be fetched');
});
