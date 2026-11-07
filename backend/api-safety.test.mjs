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
