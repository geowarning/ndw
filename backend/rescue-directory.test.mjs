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
test('service scope is separate from a team base and evidence supports coverage claims',()=>{
 const organizations=rows.filter(r=>r.entryType==='organization');
 for(const r of organizations){
  const scope=r.serviceScope;
  assert.ok(scope?.description.en&&scope.description.zh,r.organization);
  assert.ok(['not-verified','network-policy','published-scope','documented-deployment'].includes(scope.status));
  if(scope.status!=='not-verified'){
   assert.ok(scope.sources.length,r.organization);
   for(const s of scope.sources){assert.match(s.url,/^https?:\/\//);assert.ok(s.excerpt&&s.checkedAt);}
  }
 }
 const shuguang=organizations.find(r=>r.organization.includes('Xiamen Shuguang'));
 assert.ok(shuguang.serviceScope.locations.includes('Guangxi'));
 assert.ok(shuguang.serviceScope.locations.includes('Myanmar'));
 assert.equal(shuguang.city,'Xiamen');
});
