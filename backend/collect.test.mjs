import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reserve, collect, cities } from './collect.mjs';

const empty = () => ({ calls: [], entries: {}, cursor: 0, lastAttempt: 0 });
test('rolling budget, manual reruns, interrupted reservations, rotation', () => {
  const t = Date.now(), state = empty();
  reserve(state, t);
  assert.equal(state.pending.length, 4);
  const persisted = JSON.parse(JSON.stringify(state));
  reserve(persisted, t + 1000);
  assert.equal(persisted.pending.length, 0);
  assert.equal(persisted.calls.length, 4);
  reserve(persisted, t + 900000);
  assert.equal(persisted.pending[0].adcode, cities[4].adcode);
  persisted.calls = Array(449).fill(t);
  reserve(persisted, t + 1800000);
  assert.equal(persisted.pending.length, 1);
  reserve(persisted, t + 2700000);
  assert.equal(persisted.pending.length, 0);
  reserve(persisted, t + 86400001);
  assert.equal(persisted.pending.length, 4);
});
test('collection preserves failed cities, counts failures and redacts credentials', async () => {
  const state = empty(), t = Date.now(); reserve(state, t);
  const route = '/alerts/v1/' + state.pending[1].key + '.json';
  state.entries[route] = { checkedAt: t - 1000, data: [] };
  let calls = 0;
  await collect(state, 'fake-secret', async () => {
    calls++;
    if (calls === 2) throw Error('offline');
    return { ok: true, status: 200, json: async () => [{ Description: 'fake-secret' }] };
  }, () => t);
  assert.equal(calls, 4);
  assert.equal(state.calls.length, 4);
  assert.equal(state.entries[route].checkedAt, t - 1000);
  assert(!JSON.stringify(state).includes('fake-secret'));
  assert.equal(state.pending.length, 0);
});
