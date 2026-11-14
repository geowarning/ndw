import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import search from '../js/directory-search.js';
const rows=JSON.parse(fs.readFileSync(new URL('../public-data/rescue-contacts.json',import.meta.url))).records;
test('every country matches sequential typing of all supplied and localized country names',()=>{
 const countries=rows.filter(r=>r.entryType==='national-directory');
 assert.ok(countries.length>200);
 for(const r of countries){
  for(const name of [r.region,...r.aliases,...search.names(r.iso)].filter(Boolean)){
   const chars=Array.from(name);
   for(let n=1;n<=chars.length;n++)assert.equal(search.matches(r,chars.slice(0,n).join('')),true,r.iso+': '+name+' prefix '+n);
   if(chars.length>3)assert.equal(search.matches(r,chars.slice(1,-1).join('')),true,r.iso+' interior '+name);
  }
 }
});
test('matching ignores case and diacritics, preserves order and works in non-Latin scripts',()=>{
 const se=rows.find(r=>r.iso==='SE'),cn=rows.find(r=>r.iso==='CN');
 for(const q of ['swe','SWED','eden'])assert.equal(search.matches(se,q),true,q);
 assert.equal(search.matches(se,'ewsd'),false);
 assert.equal(search.matches(cn,'中国'),true);
 assert.equal(search.matches({region:'Côte d’Ivoire'},'cote'),true);
 assert.equal(search.matches({region:'España'},'ESPAÑA'),true);
 assert.equal(search.matches({region:'Sweden'},'Sdw'),false);
});
test('a deployment location finds the team even when it is outside its base city',()=>{
 const team=rows.find(r=>r.organization?.includes('Xiamen Shuguang'));
 for(const query of ['Guangxi','广西','Myanmar','缅甸','Xiamen'])assert.equal(search.matches(team,query),true,query);
});
