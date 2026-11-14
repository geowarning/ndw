import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import status from '../js/gdacs-status.js';
import { mergeEvents } from './collect-gdacs.mjs';
const now = Date.parse('2026-11-14T12:00:00Z');
function feature(id, changes = {}) {
  return { type: 'Feature', geometry: { type: 'Point', coordinates: [10, 20] }, properties: {
    eventtype: 'FL', eventid: id, episodeid: 1, iscurrent: 'true',
    fromdate: '2026-11-10T00:00:00', todate: '2026-11-15T00:00:00', ...changes
  }};
}
test('live requires a current, started, unexpired GDACS report with valid dates', () => {
  assert.equal(status.active(feature(1).properties, now), true);
  for (const change of [{ iscurrent: 'false' }, { iscurrent: false }, { iscurrent: undefined },
    { todate: '2026-11-14T12:00:00Z' }, { todate: 'invalid' }, { todate: '' },
    { fromdate: '2026-11-16' }, { _active: false }]) {
    assert.equal(status.active(feature(1, change).properties, now), false, JSON.stringify(change));
  }
  assert.equal(status.time('2026-11-14'), Date.parse('2026-11-14T00:00:00Z'));
});
test('collection archives ended, disappeared and superseded episodes with full geometry', () => {
  const old = feature(1), ended = feature(2, { todate: '2026-11-13' });
  const latest = feature(1, { episodeid: 2 });
  const missing = feature(3);
  const result = mergeEvents({ features: [old, missing] }, { features: [old, latest, ended] }, { features: [] }, now);
  assert.deepEqual(result.live.map(f => [f.properties.eventid, f.properties.episodeid]), [[1, 2]]);
  assert.equal(result.history.length, 4);
  assert.deepEqual(result.history[0].geometry, old.geometry);
  const empty = mergeEvents({ features: result.live }, { features: [] }, { features: result.history }, now);
  assert.equal(empty.live.length, 0);
  assert.equal(empty.history.length, 4);
  assert.equal(empty.history.every(f => !f.properties._active), true);
  assert.deepEqual(mergeEvents({ features: [] }, { features: [] }, { features: empty.history }, now).history, empty.history);
});
test('browser hides expired cached events while history keeps inactive records', () => {
  const context = { window: {}, GdacsStatus: status, Date, console };
  vm.createContext(context);
  const source = fs.readFileSync(new URL('../js/global.js', import.meta.url), 'utf8');
  vm.runInContext(source.replace('  var W =', '  window.testGdacs = { set: function (s, c) { state = s; cache = c; }, current: currentGdacs };\n  var W ='), context);
  const recent = new Date(Date.now() - 3600000).toISOString();
  const expired = feature(1, { fromdate: recent, todate: recent, _active: true });
  const state = { layers: { gdacs: true }, mode: 'live', gdacsType: 'all', gdacsAlert: 'all', historyRange: '3d' };
  const item = { id: 'FL-1-1', type: 'FL', from: recent, to: recent, status: expired.properties, active: false };
  context.window.testGdacs.set(state, { gdacs: [item], gdacsHistory: [item] });
  assert.equal(context.window.testGdacs.current().length, 0);
  state.mode = 'history';
  assert.equal(context.window.testGdacs.current().length, 1);
});
