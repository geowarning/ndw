import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function translations() {
  const context = vm.createContext({ window: { __modules: {} }, wx: { getStorageSync: () => 'zh' } });
  for (const name of ['data', 'i18n', 'guide-en', 'guide-locales']) {
    vm.runInContext(fs.readFileSync(new URL('../js/' + name + '.js', import.meta.url), 'utf8'), context);
  }
  return context.window.__modules;
}

test('every non-Chinese Guide is complete, with matching thresholds and no Chinese fallback', () => {
  const modules = translations();
  const numeric = text => JSON.stringify([...new Set(text.match(/\d+/g))].sort((a, b) => Number(a) - Number(b)));
  for (const language of ['en', 'es', 'fr', 'it']) {
    for (const source of modules.data.getGuides()) {
      const guide = modules['guide-locales'].getGuide(source, language);
      const label = language + '/' + source.id;
      assert(guide.name && guide.desc, label);
      assert(!/[\u3400-\u9fff]/u.test(JSON.stringify(guide)), label);
      assert.equal(guide.actions.length, source.actions.length, label);
      assert.equal(guide.signals.length, source.signals.length, label);
      for (const signal of guide.signals) assert(signal.level && signal.desc, label);
      if (['typhoon', 'rainstorm', 'heat', 'coldwave', 'thunder', 'gale', 'hail', 'fog'].includes(source.id)) {
        source.signals.forEach((signal, index) => assert.equal(numeric(signal.desc), numeric(guide.signals[index].desc), label));
      }
      assert.equal(modules['guide-locales'].getGuide(source, 'zh').desc, source.desc);
    }
  }
  assert.equal(modules.i18n.LANGUAGES.find(item => item.code === 'zh').name, '中文');
});

test('provider headline formats translate while preserving severity, status and Chinese originals', () => {
  const { i18n } = translations();
  for (const language of ['en', 'es', 'fr', 'it']) {
    for (const title of ['暴雨橙色预警', '暴雨橙色预警信号', '广州市气象台发布暴雨橙色预警信号', '【广州】暴雨橙色预警（更新）']) {
      const localized = i18n.alertTitle(title, '暴雨', 'orange', language);
      assert(!/[\u3400-\u9fff]/u.test(localized), language + '/' + title);
      assert(localized.includes(i18n.disasterName('暴雨', language)));
      assert(localized.includes(i18n.levelName('orange', language)));
      assert.equal(i18n.alertTitle(title, '暴雨', 'orange', 'zh'), title);
    }
    const cancelled = i18n.alertTitle('解除暴雨红色预警信号', '暴雨', 'red', language);
    assert(cancelled.endsWith(')'));
    assert(!/[\u3400-\u9fff]/u.test(cancelled));
    const upgraded = i18n.alertTitle('暴雨黄色预警升级为橙色预警', '暴雨', 'yellow', language);
    assert(upgraded.includes(i18n.levelName('orange', language)));
    assert(!upgraded.includes(i18n.levelName('yellow', language)));
    assert(!/[\u3400-\u9fff]/u.test(i18n.alertTitle('发布未知灾害预警', '未知', 'blue', language)));
    assert.equal(i18n.alertTitle('Official warning', '暴雨', 'orange', language), 'Official warning');
  }
});
