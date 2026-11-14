import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const rows=JSON.parse(fs.readFileSync(new URL('../public-data/rescue-contacts.json',import.meta.url))).records;
test('expanded rescue entries preserve organization identity, location and source/contact distinction',()=>{
 const researched=rows.filter(r=>r.identityVerifiedAt);
 assert.equal(researched.length,83);
 const ids=rows.map(r=>r.iso+':'+(r.organization||r.region));assert.equal(new Set(ids).size,ids.length);
 for(const r of researched){
  assert.ok(r.city&&r.state&&r.organization);
  assert.match(r.sourceUrl,/^https?:\/\//);
  if(r.contactStatus==='not-verified'){
   assert.equal(r.contactVerifiedAt,null);assert.equal(r.directory,'');assert.equal(r.website,'');
  }else{
   assert.equal(r.contactStatus,'official-directory');assert.ok(r.contactVerifiedAt);assert.match(r.directory,/^https:\/\//);
  }
 }
 const teams=researched.filter(r=>r.organization.includes('Shuguang'));
 assert.deepEqual(teams.map(r=>r.city).sort(),['Changsha','Xiamen']);
 assert.ok(teams.every(r=>r.contactStatus==='not-verified'));
 assert.equal(researched.filter(r=>r.iso==='NZ').length,41);
 assert.equal(researched.filter(r=>r.iso==='GB').length,17);
});
