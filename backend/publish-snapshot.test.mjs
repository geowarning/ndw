import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSnapshot } from './publish-snapshot.mjs';

test('publishing preserves warning payloads and original timestamps', () => {
  const data = { version: 1, generatedAt: 1000, entries: {
    '/alerts/v1/101924.json': { checkedAt: 900, data: [{ AlertID: 'test', Level: 'red' }] }
  } };
  assert.deepEqual(validateSnapshot(JSON.parse(JSON.stringify(data))), data);
  assert.throws(() => validateSnapshot({ version: 1, generatedAt: 1000, entries: { '/bad': {} } }));
  assert.throws(() => validateSnapshot({ version: 1, entries: {} }));
});
