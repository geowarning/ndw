import fs from 'node:fs';
import path from 'node:path';
import directory from '../js/directory-search.js';

export function buildSearchIndex(root) {
  const documents = [], seen = new Set();
  const route = (base, params) => base + '?' + Object.entries(params).map(([k,v])=>k+'='+encodeURIComponent(v??'')).join('&');
  function add(label, category, href, keywords = '') {
    if (!label || !/^(?:#\/|\.?\/?[\w-]+\.html)/.test(href || '')) return;
    const key = href + '\0' + label;
    if (seen.has(key)) return; seen.add(key);
    documents.push({ label: String(label), category, href, keywords: typeof keywords==='string'?keywords:JSON.stringify(keywords) });
  }
  function generic(value) {
    if (!value || typeof value!=='object') return;
    if (Array.isArray(value)) return value.forEach(generic);
    if ((value.title || value.label || value.name) && (value.href || value.route)) add(value.title || value.label || value.name, value.category || 'Page content', value.href || value.route, value);
    Object.values(value).forEach(generic);
  }
  const dir = path.join(root,'public-data');
  if(fs.existsSync(dir)) for(const filename of fs.readdirSync(dir).sort()) {
    if(!filename.endsWith('.json') || filename.startsWith('search-index')) continue;
    const data=JSON.parse(fs.readFileSync(path.join(dir,filename),'utf8'));
    if(filename==='rescue-contacts.json') for(const r of data.records||[]) {
      const base={iso:r.iso};
      const href=r.entryType==='organization'?route('#/rescue',{...base,org:r.iso+':'+(r.organization||r.region)}):route('#/rescue',base);
      add(r.organization||r.region,'Rescue contacts',href,[r, directory.names(r.iso)].flat());
      add(r.region,'Countries & regions',route('#/rescue',base),[r.aliases,directory.names(r.iso),r.iso,r.iso3]);
    }
    else if(Array.isArray(data.features)) for(const f of data.features) {
      const p=f.properties||{};if(!p.eventtype||p.eventid==null)continue;
      const mode=filename==='gdacs-events.json'?'live':'history';
      const id=[p.eventtype,p.eventid,p.episodeid].join(':');
      add(p.name==='Event in rss format'?p.htmldescription:p.name||p.description,mode==='live'?'Live disasters':'Disaster history',route('#/disasters',{mode,event:id}),p);
    }
    else if(Array.isArray(data.earthquakes)) for(const q of data.earthquakes) add('M'+q.magnitude+' · '+q.place,'Live earthquakes',route('#/disasters',{mode:'live',event:q.id}),q);
    else if(Array.isArray(data.rows)) for(const r of data.rows) add('M'+r[4]+' · '+r[5],'Earthquake history',route('#/disasters',{mode:'history',event:r[7]||r[0]+':'+r[1]+':'+r[2]}),r);
    else if(filename==='china-warning-history.json') for(const r of data.records||[]) {
      const a=r.alert||{};add(a.Description?.Localized||a.HeadlineText||a.title,'China warning history',route('#/database',{category:'china',q:a.AlertID||a.alertId||a.id||a.title}),a);
    }
    generic(data);
  }
  // Future static pages and linked content records need no search UI changes.
  for(const filename of fs.readdirSync(root)) if(filename.endsWith('.html')&&filename!=='index.html') {
    const html=fs.readFileSync(path.join(root,filename),'utf8');
    const title=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||filename;
    add(title,'Pages','./'+filename,html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]*>/g,' '));
  }
  return {version:1,documents};
}
