import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('English Guide covers every category without Chinese text or missing sections', () => {
  const context = vm.createContext({ window: { __modules: {} } });
  for (const name of ['data', 'guide-en']) {
    vm.runInContext(fs.readFileSync(new URL('../js/' + name + '.js', import.meta.url), 'utf8'), context);
  }
  const modules = context.window.__modules;
  const originals = modules.data.getGuides();
  const translations = modules['guide-en'];
  assert.equal(Object.keys(translations).length, originals.length);
  for (const source of originals) {
    const english = translations[source.id];
    assert(english, source.id);
    assert(english.name && english.desc, source.id);
    assert.equal(english.signals.length, source.signals.length, source.id);
    assert.equal(english.actions.length, source.actions.length, source.id);
    assert(!/[\u3400-\u9fff]/u.test(JSON.stringify(english)), source.id);
    for (const signal of english.signals) assert(signal.level && signal.desc, source.id);
    if (['typhoon', 'rainstorm', 'heat', 'coldwave', 'thunder', 'gale', 'hail', 'fog'].includes(source.id)) {
      source.signals.forEach((signal, index) => {
        const numbers = text => JSON.stringify([...new Set(text.match(/\d+/g))].sort((a, b) => Number(a) - Number(b)));
        assert.equal(numbers(signal.desc), numbers(english.signals[index].desc), source.id + ' warning thresholds');
      });
    }
    assert(/[\u3400-\u9fff]/u.test(source.desc), 'Chinese original remains available');
  }
});
