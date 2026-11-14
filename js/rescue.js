/* Official public humanitarian directory; no inferred telephone numbers. */
(function () {
  var records, dialog, language = 'en';
  function text(zh, en) { return language === 'zh' ? zh : en; }
  function esc(v) { return String(v || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function safeUrl(url) { return /^https?:\/\//i.test(url || '') ? esc(url) : 'https://www.ifrc.org/national-societies-directory'; }
  function button(region, local, lang) {
    return '<button type="button" class="btn btn-outline rescue-button" data-rescue-region="' + esc(region) + '" data-rescue-local="' + esc(local) + '">' + (lang === 'zh' ? '救援联系' : 'Rescue contacts') + '</button>';
  }
  function search(query) {
    var q = query.toLowerCase().trim();
    var matches = (records || []).filter(function (r) {
      var terms = [r.region, r.iso, r.iso3, r.organization].concat(r.aliases || []);
      if (r.iso === 'CN') {
        terms.push('中国', 'China');
        var districts = window.__modules && window.__modules.districts;
        if (districts) districts.allCityGeo().forEach(function (c) { terms.push(c.name, c.province); });
      }
      if (r.iso === 'US') terms.push('USA', 'United States', 'Alabama Alaska Arizona Arkansas California Colorado Connecticut Delaware Florida Georgia Hawaii Idaho Illinois Indiana Iowa Kansas Kentucky Louisiana Maine Maryland Massachusetts Michigan Minnesota Mississippi Missouri Montana Nebraska Nevada New Hampshire New Jersey New Mexico New York North Carolina North Dakota Ohio Oklahoma Oregon Pennsylvania Rhode Island South Carolina South Dakota Tennessee Texas Utah Vermont Virginia Washington West Virginia Wisconsin Wyoming');
      return !q || terms.some(function (t) { return t && (t.toLowerCase().includes(q) || (t.length > 3 && q.includes(t.toLowerCase()))); });
    });
    var list = dialog.querySelector('[data-rescue-results]');
    dialog.querySelector('[data-rescue-count]').textContent = matches.length + text(' 个地区', ' regions');
    list.innerHTML = matches.length ? matches.map(function (r) {
      return '<article class="rescue-card"><h3>' + esc(r.region) + '</h3><p>' + esc(r.organization || text('在官方目录查找当地机构', 'Find local organizations in the official directory')) + '</p>' +
        (r.iso === 'CN' ? '<p>119 · ' + text('消防救援', 'Fire & rescue') + ' / 120 · ' + text('急救', 'Ambulance') + '</p>' : '') +
        '<a href="' + safeUrl(r.directory) + '" target="_blank" rel="noopener noreferrer">' + text('官方联系方式与当地分支', 'Official contacts & local branches') + ' ↗</a>' +
        (r.website ? ' · <a href="' + safeUrl(r.website) + '" target="_blank" rel="noopener noreferrer">' + text('机构网站', 'Organization website') + ' ↗</a>' : '') + '</article>';
    }).join('') : '<p>' + text('没有匹配的地区。请搜索国家名称，或使用下方全球目录。', 'No matching region. Search by country, or use the worldwide directory below.') + '</p>';
  }
  function open(region, local) {
    language = (window.__modules && window.__modules.i18n.getLang()) || 'en';
    if (!dialog) {
      dialog = document.createElement('dialog'); dialog.className = 'rescue-dialog';
      document.body.appendChild(dialog);
      dialog.addEventListener('click', function (e) { if (e.target.closest('[data-rescue-close]')) dialog.close(); });
      dialog.addEventListener('input', function (e) { if (e.target.matches('[data-rescue-search]')) search(e.target.value); });
    }
    dialog.innerHTML = '<div class="rescue-heading"><h2>' + text('救援与人道援助联系', 'Rescue & humanitarian contacts') + '</h2><button type="button" class="btn btn-outline" data-rescue-close>' + text('关闭', 'Close') + '</button></div>' +
      '<p>' + esc(local || region || '') + '</p><p>' + text('红十字与红新月国家协会及官方联系方式。紧急救援请联系当地应急服务；协会目录不是紧急调度热线。', 'National Red Cross / Red Crescent societies and their official contacts. For immediate rescue, call local emergency services; society directories are not dispatch hotlines.') + '</p>' +
      '<label>' + text('搜索国家、地区或机构', 'Search country, region or organization') + '<input type="search" data-rescue-search></label><p data-rescue-count role="status"></p><div data-rescue-results class="rescue-results">' + text('正在加载…', 'Loading…') + '</div>' +
      '<p><a href="https://www.ifrc.org/national-societies-directory" target="_blank" rel="noopener noreferrer">IFRC · ' + text('全球官方目录', 'Worldwide official directory') + ' ↗</a></p>' +
      '<p class="rescue-source"><a href="https://github.com/IFRCGo/go-api/blob/df5c57512bed7d55aa4042790e0b070f50b579f9/api/fixtures/Countries.json" target="_blank" rel="noopener noreferrer">' + text('来源：IFRC GO 公共目录（2026-11-14 获取）', 'Source: IFRC GO public directory (retrieved 2026-11-14)') + '</a></p>';
    dialog.querySelector('input').value = region || '';
    if (!dialog.open) dialog.showModal();
    if (records) search(region || '');
    else fetch('public-data/rescue-contacts.json').then(function (r) { if (!r.ok) throw Error(r.status); return r.json(); }).then(function (data) {
      records = data.records; search(dialog.querySelector('input').value);
    }).catch(function () { dialog.querySelector('[data-rescue-results]').textContent = text('目录暂不可用，请使用全球官方目录链接。', 'Directory unavailable. Use the official worldwide directory link.'); });
  }
  document.addEventListener('click', function (e) {
    var button = e.target.closest('[data-rescue-region]');
    if (button) open(button.dataset.rescueRegion, button.dataset.rescueLocal);
  });
  document.addEventListener('submit', function (e) {
    if (e.target.matches('[data-rescue-form]')) { e.preventDefault(); open(e.target.elements.region.value, ''); }
  });
  window.NDRescue = { button: button, open: open };
})();
