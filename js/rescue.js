/* A dedicated route for sourced rescue, relief and training resources. */
(function () {
  var records, page, language = 'en', filter = 'all', previous = '#/global';
  function text(zh, en) { return language === 'zh' ? zh : en; }
  function esc(v) { return String(v || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function safeUrl(url) { return /^https?:\/\//i.test(url || '') ? esc(url) : 'https://www.ifrc.org/national-societies-directory'; }
  function button(region, local, lang) {
    return '<a class="btn btn-outline rescue-button" href="#/rescue?region=' + encodeURIComponent(local || region || '') + '&country=' + encodeURIComponent(region || '') + '">' + (lang === 'zh' ? '救援联系' : 'Rescue contacts') + '</a>';
  }
  function matches(r, query) {
    var q = query.toLowerCase().trim();
    var terms = [r.region, r.iso, r.iso3, r.organization, r.city, r.state, r.kind, r.services, r.coverage].concat(r.aliases || []);
    // National directories are fallbacks, not invented local branches.
    if (r.iso === 'CN' && r.entryType === 'national-directory') {
      terms.push('中国');
      var districts = window.__modules && window.__modules.districts;
      if (districts) districts.allCityGeo().forEach(function (c) { terms.push(c.name, c.province); });
    }
    return !q || q.split(/\s+/).every(function (word) { return terms.some(function (t) { return t && (word.length <= 3 ? t.toLowerCase().split(/[^a-z0-9]+/).includes(word) : t.toLowerCase().includes(word)); }); });
  }
  function search(query) {
    var matched = (records || []).filter(function (r) { return matches(r, query) && (filter === 'all' || (filter === 'local' ? r.entryType === 'organization' : r.entryType === 'national-directory')); });
    var country = page.dataset.country || '';
    if (!matched.length) {
      var inferred = records.filter(function (r) { return r.entryType === 'national-directory' && r.region.length > 3 && query.toLowerCase().includes(r.region.toLowerCase()); }).sort(function (a,b) { return b.region.length-a.region.length; })[0];
      if (inferred) country = inferred.region;
    }
    // Full quake place descriptions can include distance/direction. Fall back
    // explicitly to the selected country rather than claiming city coverage.
    var fallback = !matched.length && country && country.toLowerCase() !== query.toLowerCase();
    if (fallback) matched = records.filter(function (r) { return matches(r, country) && r.entryType === 'national-directory'; });
    page.querySelector('[data-rescue-count]').textContent = matched.length + text(' 条资源', ' resources') + (fallback ? text(' · 以下为国家级目录，没有已收录的当地团队', ' · National directories below; no matching local team is listed') : '');
    page.querySelector('[data-rescue-results]').innerHTML = matched.length ? matched.map(function (r) {
      var local = r.entryType === 'organization';
      return '<article class="rescue-card"><p class="rescue-kind">' + esc(local ? r.kind : text('国家级机构目录', 'National society directory')) + '</p><h2>' + esc(r.organization || r.region) + '</h2><p>' + esc([r.city,r.state,r.region].filter(Boolean).join(' · ')) + '</p>' +
        (local ? '<p>' + esc(r.services) + '</p><p><b>' + text('服务范围：', 'Coverage: ') + '</b>' + esc(r.coverage) + '</p>' : '<p>' + text('在官方目录查找当地分支；此条目不代表已确认的市级救援队。', 'Find local branches in the official directory. This entry does not establish a city-level rescue team.') + '</p>') +
        '<a href="' + safeUrl(r.directory) + '" target="_blank" rel="noopener noreferrer">' + text('前往官方联系与服务网站', 'Official contacts & services') + ' ↗</a>' +
        (local ? '<p class="rescue-source">' + text('请在官网确认当前联系方式及出勤范围。', 'Confirm current contact details and availability on the official site.') + '</p>' : '') + '</article>';
    }).join('') : '<p>' + text('没有已收录的当地团队。请尝试国家名称，或使用下方全球目录。', 'No listed local team matches. Try a country name or the worldwide directory below.') + '</p>';
  }
  function render(el, query) {
    page = el;
    language = window.__modules.i18n.getLang();
    page.dataset.country = query.country || '';
    filter = 'all';
    document.title = text('救援联系', 'Rescue contacts');
    page.innerHTML = '<section class="rescue-page"><div class="container"><a class="back-link" href="' + esc(previous) + '">← ' + text('返回', 'Back') + '</a><h1>' + text('救援与援助联系', 'Rescue & assistance contacts') + '</h1><p>' + text('按城市、地区或机构搜索救援、志愿者团队、灾害援助与急救培训资源。', 'Search by city, region or organization for rescue teams, volunteers, disaster relief and first-aid training.') + '</p><p>' + text('紧急情况请联系当地应急服务。机构所在地与服务范围分别列出；培训和援助机构不一定接受紧急救援调度。', 'For emergencies, contact local emergency services. Organization location and service coverage are listed separately; training and relief organizations may not accept emergency dispatch calls.') + '</p>' +
      '<div class="rescue-search-bar"><label>' + text('城市、地区或团队名称', 'City, region or team name') + '<input type="search" data-rescue-search value="' + esc(query.region || '') + '" placeholder="Seattle, Hong Kong, AHA…"></label><label>' + text('资源类型', 'Resource type') + '<select data-rescue-filter><option value="all">' + text('全部', 'All resources') + '</option><option value="local">' + text('已收录机构', 'Listed organizations') + '</option><option value="directory">' + text('国家级目录', 'National directories') + '</option></select></label></div>' +
      '<p data-rescue-count role="status"></p><div data-rescue-results class="rescue-results">' + text('正在加载…', 'Loading…') + '</div><p><a href="https://www.ifrc.org/national-societies-directory" target="_blank" rel="noopener noreferrer">IFRC · ' + text('全球官方目录', 'Worldwide official directory') + ' ↗</a></p><p class="rescue-source">' + text('国家级目录来源：IFRC GO。其他条目链接到各机构官网；未列出未经核实的电话号码。目录仍在扩充，未覆盖所有城市。', 'National directories: IFRC GO. Additional entries link to each organization’s official site. Unverified phone numbers are omitted. Coverage is growing and does not include every city.') + '</p></div></section>';
    function ready() { if (location.hash.startsWith('#/rescue')) search(page.querySelector('input').value); }
    if (records) ready();
    else fetch('public-data/rescue-contacts.json', {cache:'no-cache'}).then(function (r) { if (!r.ok) throw Error(r.status); return r.json(); }).then(function (data) { records=data.records; ready(); }).catch(function () { if (location.hash.startsWith('#/rescue')) page.querySelector('[data-rescue-results]').textContent = text('目录暂不可用，请使用官方目录链接。', 'Directory unavailable. Use the official directory link.'); });
  }
  function open(region) { location.hash = '#/rescue?region=' + encodeURIComponent(region || ''); }
  window.addEventListener('hashchange', function (e) {
    var old = e.oldURL.split('#')[1];
    if (old && !old.startsWith('/rescue')) previous = '#' + old;
  });
  document.addEventListener('input', function (e) { if (e.target.matches('[data-rescue-search]')) { page.dataset.country = ''; search(e.target.value); } });
  document.addEventListener('change', function (e) { if (e.target.matches('[data-rescue-filter]')) { filter=e.target.value; search(page.querySelector('input').value); } });
  document.addEventListener('submit', function (e) { if (e.target.matches('[data-rescue-form]')) { e.preventDefault(); open(e.target.elements.region.value); } });
  window.NDRescue = { button:button, open:open, render:render };
})();
