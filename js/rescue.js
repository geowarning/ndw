/* Country -> province/state -> city -> organization directory. */
(function () {
  var records, page, query = {}, language, filter = 'all';
  function t(zh,en) { return language === 'zh' ? zh : en; }
  function esc(v) { return String(v || '').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function href(values) { return '#/rescue' + (Object.keys(values).length ? '?' + Object.keys(values).filter(function(k){return values[k];}).map(function(k){return k+'='+encodeURIComponent(values[k]);}).join('&') : ''); }
  function button(region,local,lang) { return '<a class="btn btn-outline rescue-button" href="'+esc(href({region:local || region,country:region}))+'">'+(lang==='zh'?'救援联系':'Rescue contacts')+'</a>'; }
  function kind(r) {
    if(r.entryType==='national-directory')return 'directory';
    if(/training/i.test(r.kind))return 'training';
    if(/medical|ambulance/i.test(r.kind))return 'medical';
    if(/food/i.test(r.kind))return 'food';
    return 'rescue';
  }
  function label(k) { return {all:t('全部资源','All resources'),directory:t('国家级目录','National directories'),training:t('急救培训','First-aid training'),medical:t('医疗与救护','Medical & ambulance'),food:t('食物援助','Food relief'),rescue:t('救援与灾害响应','Rescue & disaster response')}[k]; }
  function hit(r,q) {
    return window.NDDirectorySearch.matches(r,q);
  }
  function selected() { return records.filter(function(r){return (!query.iso || r.iso===query.iso) && (!query.state || r.state===query.state) && (!query.city || r.city===query.city);}); }
  function countryName(iso) { var r=records.find(function(r){return r.iso===iso && r.entryType==='national-directory';}) || records.find(function(r){return r.iso===iso;});return r ? r.region : iso; }
  function crumb() {
    var items=['<a href="#/rescue">'+t('国家与地区','Countries & regions')+'</a>'];
    if(query.iso)items.push('<a href="'+esc(href({iso:query.iso}))+'">'+esc(countryName(query.iso))+'</a>');
    if(query.state)items.push('<a href="'+esc(href({iso:query.iso,state:query.state}))+'">'+esc(query.state)+'</a>');
    if(query.city)items.push('<a href="'+esc(href({iso:query.iso,state:query.state,city:query.city}))+'">'+esc(query.city)+'</a>');
    return '<nav class="rescue-breadcrumb" aria-label="'+t('位置导航','Location navigation')+'">'+items.join('<span aria-hidden="true">/</span>')+'</nav>';
  }
  function symbol(k) { return {directory:'◎',rescue:'⌖',training:'♥',medical:'✚',food:'◒'}[k] || '◎'; }
  function flag(iso) { return /^[A-Z]{2}$/.test(iso || '') ? iso.replace(/./g,function(c){return String.fromCodePoint(127397+c.charCodeAt(0));}) : '🌐'; }
  function orgId(r) { return r.iso + ':' + (r.organization || r.region); }
  function organization(r) {
    var local=r.entryType==='organization';
    return '<a class="rescue-org resource-'+kind(r)+'" href="'+esc(href({iso:r.iso,state:r.state,city:r.city,org:orgId(r)}))+'"><span class="resource-symbol" aria-hidden="true">'+symbol(kind(r))+'</span><span class="rescue-type">'+esc(label(kind(r)))+'</span><h3>'+esc(r.organization||r.region)+'</h3><span>'+esc(local?[r.city,r.state].filter(Boolean).join(' · '):t('国家级机构与分支目录','National organization & branch directory'))+'</span><b aria-hidden="true">↗</b></a>';
  }
  function results() {
    var input=page.querySelector('[data-rescue-search]'), q=input.value;
    var pool=selected(), filtered=pool.filter(function(r){return hit(r,q) && (filter==='all'||kind(r)===filter);});
    var groups={}, stage=!query.iso?'country':!query.state?'state':!query.city?'city':'org';
    if(stage!=='org')filtered.forEach(function(r){
      var key=stage==='country'?r.iso:stage==='state'?r.state:r.city;
      if(!key)return;
      if(!groups[key])groups[key]=[];groups[key].push(r);
    });
    var locations=Object.keys(groups).sort(function(a,b){return (stage==='country'?countryName(a):a).localeCompare(stage==='country'?countryName(b):b);});
    var section=page.querySelector('[data-rescue-locations]');
    section.innerHTML=locations.length?'<h2>'+({country:t('选择国家或地区','Choose a country or region'),state:t('选择州或省','Choose a state or province'),city:t('选择城市或城镇','Choose a city or town')}[stage])+'</h2><div class="rescue-place-grid">'+locations.map(function(key){
      var values=stage==='country'?{iso:key}:stage==='state'?{iso:query.iso,state:key}:{iso:query.iso,state:query.state,city:key};
      return '<a class="rescue-place" href="'+esc(href(values))+'"><span class="place-symbol" aria-hidden="true">'+(stage==='country'?flag(key):stage==='state'?'▧':'⌖')+'</span><strong>'+esc(stage==='country'?countryName(key):key)+'</strong><span>'+groups[key].length+' '+t('条资源','resources')+' →</span></a>';
    }).join('')+'</div>':'';
    // Compact organization cards appear after choosing a city, while searching,
    // or for country-wide directories which have no asserted city location.
    var orgs=filtered.filter(function(r){return stage==='org' || q.trim() || (query.iso && !r.state);});
    page.querySelector('[data-rescue-count]').textContent=filtered.length+' '+t('条资源','resources');
    page.querySelector('[data-rescue-results]').innerHTML=orgs.length?'<h2>'+t('机构','Organizations')+'</h2><div class="rescue-org-grid">'+orgs.map(organization).join('')+'</div>':locations.length?'':'<div class="rescue-empty">'+t('暂无匹配的当地机构。可返回上一级或查看国家级目录。','No matching local organizations. Go back a level or consult the national directory.')+'</div>';
  }
  function detail(r) {
    var local=r.entryType==='organization', url=/^https?:\/\//.test(r.directory||'')?r.directory:'https://www.ifrc.org/national-societies-directory';
    return '<article class="rescue-detail resource-'+kind(r)+'"><span class="resource-symbol" aria-hidden="true">'+symbol(kind(r))+'</span><span class="rescue-type">'+esc(label(kind(r)))+'</span><h1>'+esc(r.organization||r.region)+'</h1><p class="rescue-location">'+esc([r.city,r.state,r.region].filter(Boolean).join(' · '))+'</p><dl>'+ (local?'<dt>'+t('服务','Services')+'</dt><dd>'+esc(r.services)+'</dd><dt>'+t('服务范围','Coverage')+'</dt><dd>'+esc(r.coverage)+'</dd>':'<dt>'+t('服务','Services')+'</dt><dd>'+t('国家协会与当地分支的官方目录。','Official national society and local branch directory.')+'</dd>')+'</dl><a class="btn btn-green" target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">'+t('官方联系与服务网站','Official contacts & services')+' ↗</a><p class="rescue-source">'+t('请在官网确认当前联系方式、服务范围及可用性。紧急救援请联系当地应急服务。','Confirm current contacts, coverage and availability on the official site. For immediate rescue, contact local emergency services.')+'</p><details><summary>'+t('来源与收录说明','Source & listing information')+'</summary><p>'+t('机构所在地不代表全域覆盖。培训及人道援助机构不一定接受紧急调度。','Organization location does not establish service coverage. Training and humanitarian groups may not accept emergency dispatch calls.')+'</p><a href="'+esc(local?r.sourceUrl:'https://github.com/IFRCGo/go-api/blob/df5c57512bed7d55aa4042790e0b070f50b579f9/api/fixtures/Countries.json')+'" target="_blank" rel="noopener noreferrer">'+t('查看来源','View source')+' ↗</a></details></article>';
  }
  function draw() {
    if(!location.hash.startsWith('#/rescue'))return;
    if(!query.iso && query.country) {var r=records.find(function(r){return r.region.toLowerCase()===query.country.toLowerCase()||r.iso.toLowerCase()===query.country.toLowerCase();});if(r)query.iso=r.iso;}
    var notice = '';
    if(query.iso && query.country && query.region && !selected().some(function(r){return hit(r,query.region);})) {
      notice = '<p role="status">' + t('暂无该地点的条目，以下显示所选国家的已收录资源。','No exact location match; showing listed resources for the selected country.') + '</p>'; query.region = '';
    }
    var r=query.org ? records.find(function(r){return orgId(r)===query.org;}) : null;
    page.innerHTML='<section class="rescue-page"><div class="container">'+crumb()+(r?detail(r):notice + '<header class="rescue-page-head"><div><div class="eyebrow">'+t('救援资源目录','ASSISTANCE DIRECTORY')+'</div><h1>'+t('寻找附近的援助','Find help by location')+'</h1><p>'+t('逐级选择地点，或搜索团队名称。','Choose a location or search for a team.')+'</p></div></header><div class="rescue-search-bar"><label>'+t('搜索地点或团队','Search locations or teams')+'<input type="search" data-rescue-search placeholder="Seattle, Hong Kong, AHA…" value="'+esc(query.region||'')+'"></label><label>'+t('资源类型','Resource type')+'<select data-rescue-filter>'+['all','rescue','medical','training','food','directory'].map(function(k){return '<option value="'+k+'">'+esc(label(k))+'</option>';}).join('')+'</select></label></div><p data-rescue-count role="status"></p><section data-rescue-locations></section><section data-rescue-results></section><details class="rescue-notes"><summary>'+t('目录覆盖与使用说明','Directory coverage & use')+'</summary><p>'+t('仅显示已收录资源的地点，尚未覆盖所有城市。国家级目录不代表已有市级团队。请在官网确认联系方式；紧急情况请联系当地应急服务。','Only locations with listed resources are shown. Coverage is incomplete. National directories do not establish city-level teams. Verify contacts on official sites; call local emergency services for emergencies.')+'</p><a href="https://www.ifrc.org/national-societies-directory" target="_blank" rel="noopener noreferrer">IFRC · '+t('全球机构目录','Worldwide society directory')+' ↗</a></details>')+'</div></section>';
    if(!r)results();
  }
  function render(el,values) {
    page=el;query=Object.assign({},values);filter='all';language=window.__modules.i18n.getLang();document.title=t('救援联系','Rescue contacts');
    page.innerHTML='<section class="rescue-page"><div class="container" role="status">'+t('正在加载…','Loading…')+'</div></section>';
    if(records)draw();else fetch('public-data/rescue-contacts.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw Error(r.status);return r.json();}).then(function(data){records=data.records;draw();}).catch(function(){if(location.hash.startsWith('#/rescue'))page.innerHTML='<p>'+t('目录暂不可用，请稍后再试。','Directory unavailable. Please try again.')+'</p>';});
  }
  document.addEventListener('input',function(e){if(e.target.matches('[data-rescue-search]'))results();});
  document.addEventListener('change',function(e){if(e.target.matches('[data-rescue-filter]')){filter=e.target.value;results();}});
  document.addEventListener('submit',function(e){if(e.target.matches('[data-rescue-form]')){e.preventDefault();location.hash=href({region:e.target.elements.region.value});}});
  window.NDRescue={button:button,render:render,open:function(region){location.hash=href({region:region});}};
})();
