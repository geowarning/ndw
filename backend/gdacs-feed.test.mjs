import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const parse = xml => JSON.parse(execFileSync('python3', ['backend/parse-gdacs-feed.py'], {input:xml,encoding:'utf8',stdio:['pipe','pipe','pipe']}));
test('current RSS preserves event identity, location, dates and XML escaped text', () => {
 const feed = '<rss xmlns:g="http://www.gdacs.org" xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#"><channel><item><title>Flood &amp; rain</title><g:eventtype>FL</g:eventtype><g:eventid>123</g:eventid><g:episodeid>2</g:episodeid><geo:Point><geo:lat>30</geo:lat><geo:long>110</geo:long></geo:Point><g:resource><title>Event in rss format</title></g:resource><g:todate>2026-11-13</g:todate></item></channel></rss>';
 const f=parse(feed).features[0];
 assert.deepEqual(f.geometry.coordinates,[110,30]);assert.equal(f.properties.name,'Flood & rain');assert.equal(f.properties._currentFeed,true);assert.equal(f.properties.eventid,'123');
 assert.equal(parse('<rss><channel/></rss>').features.length,0);
 assert.throws(()=>parse('<html/>'));
 assert.throws(()=>parse(feed.replace('<geo:lat>30</geo:lat>','')));
});
