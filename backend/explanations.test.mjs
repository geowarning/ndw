import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('contextual explanations are complete in every language without Chinese fallback', () => {
  const context = vm.createContext({ window: { __modules: {} } });
  vm.runInContext(fs.readFileSync(new URL('../js/explanations.js', import.meta.url), 'utf8'), context);
  const help = context.window.__modules.explanations;
  const topics = Object.keys(help.copy.en.topics).sort();
  assert(topics.length >= 32);
  for (const language of ['zh', 'en', 'es', 'fr', 'it']) {
    assert.deepEqual(Object.keys(help.copy[language].topics).sort(), topics);
    assert(help.label(language));
    assert(help.reads(language));
    for (const topic of topics) {
      const text = help.get(topic, language);
      assert(text.length > 30, language + '/' + topic);
      if (language !== 'zh') assert(!/[\u3400-\u9fff]/u.test(text), language + '/' + topic);
    }
  }
  assert.equal(help.get('freshness', 'unknown'), help.get('freshness', 'en'));
});
