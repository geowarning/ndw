import {test} from 'node:test';
import assert from 'node:assert/strict';
import {archiveWarnings, mergeQuakeRows} from './alert-history.mjs';
import {collect} from './collect.mjs';
test('warning history retains every observed revision after all-clear and is repeatable', async () => {
  const route = '/alerts/v1/1.json';
  const original = { AlertID: 123, title: 'Flood warning' };
  const first = archiveWarnings({}, { [route]: { checkedAt: 10, data: [original] } });
  const changed = archiveWarnings(first, { [route]: { checkedAt: 20, data: [{ ...original, title: 'Updated flood warning' }] } });
  assert.equal(Object.keys(changed).length, 2);
  assert.deepEqual(archiveWarnings(changed, { [route]: { checkedAt: 30, data: [] } }), changed);
  assert.deepEqual(archiveWarnings(changed, { [route]: { checkedAt: 20, data: [{ ...original, title: 'Updated flood warning' }] } }), changed);
  const state = { pending: [{ key: '1' }], entries: { [route]: { data: [original], checkedAt: 10 } } };
  await collect(state, 'secret', async () => ({ ok: true, status: 200, json: async () => [] }), () => 40, async () => {});
  assert.equal(Object.values(state.alertHistory)[0].alert.AlertID, 123);
  assert.equal(state.entries[route].data.length, 0);
});
test('earthquake archive retains old events and merges updated IDs without time limits', () => {
  const old = [1, 10, 20, 3, 4, 'Old quake', 'earthquake'];
  const recent = [200, 30, 40, 3, 4, 'Recent quake', 'earthquake', 'us1'];
  const updated = [...recent]; updated[4] = 4.5;
  const rows = mergeQuakeRows([old, recent], [updated]);
  assert.equal(rows.length, 2);
  assert.equal(rows[0][4], 4.5);
  assert.deepEqual(rows[1], old);
  assert.deepEqual(mergeQuakeRows(rows, [updated]), rows);
});
