import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import locale from '../js/ui-locales.js';
import search from '../js/directory-search.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const languages=['zh','en','es','fr','it'];
test('new directory and disaster interfaces have translations for every supported language',()=>{
 for(const file of ['js/rescue.js','js/disaster-list.js','js/global.js','js/search.js','js/app.js']){
  const re=/(?:\bt|window\.NDLocale\.phrase)\('(?:[^'\\]|\\.)*',\s*'((?:[^'\\]|\\.)*)'/g;
  for(const match of read(file).matchAll(re)){
   const key=match[1].replace(/\\'/g,"'");
   for(const lang of ['es','fr','it'])assert.ok(locale.messages[key]?.[lang],file+': '+lang+': '+key);
  }
 }
});
test('team service descriptions and scope are localized without changing original identity or evidence',()=>{
 const rows=JSON.parse(read('public-data/rescue-contacts.json')).records;
 for(const r of rows.filter(r=>r.entryType==='organization')){
  const en=r.services.split(' / ')[0];
  for(const lang of languages){
   assert.ok(r.serviceScope.description[lang],r.organization+': '+lang);
   if(lang!=='en')assert.ok(locale.messages[en]?.[lang],en+': '+lang);
   assert.ok(!locale.service(r.services,lang).includes(' / '),r.organization+': '+lang);
  }
 }
 const shuguang=rows.find(r=>r.organization.includes('Xiamen Shuguang'));
 assert.ok(search.matches(shuguang,'despliegue'));
 assert.ok(search.matches(shuguang,'interprovincial'));
 assert.equal(shuguang.city,'Xiamen');
});
test('country names and resource counts follow the language, including singulars',()=>{
 assert.equal(locale.country('SE','Sweden','fr'),'Suède');
 assert.equal(locale.country('CN','China','zh'),'中国');
 assert.equal(locale.count(1,'resources','en'),'1 resource');
 assert.equal(locale.count(2,'resources','en'),'2 resources');
 assert.equal(locale.count(1,'records','it'),'1 registrazione');
 assert.equal(locale.phrase('实时灾害','Live disasters','fr'),'Catastrophes en cours');
});
