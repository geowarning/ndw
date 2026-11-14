import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {buildSearchIndex} from './search-index.mjs';
test('publication automatically indexes new content, country aliases, records and safe destinations',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'ndw-search-test-'));
 try {
  const dir=path.join(root,'public-data');fs.mkdirSync(dir);
  const write=(name,data)=>fs.writeFileSync(path.join(dir,name),JSON.stringify(data));
  write('rescue-contacts.json',{records:[{iso:'SE',region:'Sweden',organization:'Swedish Red Cross',aliases:['Suède'],entryType:'national-directory'}]});
  write('gdacs-events.json',{features:[{properties:{eventtype:'FL',eventid:7,episodeid:1,name:'Flood in Sweden',description:'River overflow'}}]});
  write('future-feature.json',{records:[{title:'Future shelter directory',href:'#/shelters',body:'Overnight shelter availability'}]});
  write('search-index-history.json',{documents:[{title:'Old generated entry',href:'#/old'}]});
  write('unsafe.json',{title:'Bad link',href:'javascript:alert(1)'});
  fs.writeFileSync(path.join(root,'faq.html'),'<title>New FAQ</title><h1>Preparedness planning</h1>');
  fs.mkdirSync(path.join(root,'backend'));fs.writeFileSync(path.join(root,'backend','private.json'),'DO_NOT_INDEX');
  const first=buildSearchIndex(root),docs=first.documents;
  assert.ok(docs.some(d=>d.label==='Sweden'&&d.href==='#/rescue?iso=SE'&&d.keywords.includes('瑞典')));
  assert.ok(docs.some(d=>d.label==='Flood in Sweden'&&d.href.includes('event=FL%3A7%3A1')));
  assert.ok(docs.some(d=>d.label==='Future shelter directory'&&d.keywords.includes('Overnight shelter')));
  assert.ok(docs.some(d=>d.label==='New FAQ'&&d.href==='./faq.html'));
  assert.ok(!JSON.stringify(first).includes('DO_NOT_INDEX'));
  assert.ok(!docs.some(d=>d.label==='Old generated entry'||d.label==='Bad link'));
  assert.deepEqual(buildSearchIndex(root),first);
  write('future-feature.json',{title:'Another future resource',route:'#/new-resource'});
  assert.ok(buildSearchIndex(root).documents.some(d=>d.label==='Another future resource'));
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
