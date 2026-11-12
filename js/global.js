/* 全球灾害监测：卫星底图 + 实时/历史地震 + 影响圈 + 国家筛选 + 图层 */
(function () {
  var W = 1000, H = 500;
  var state = {
    mode: 'live', hmin: 4.5, selected: null, country: null,
    layers: { affected: true, population: false, evacuation: false, infrastructure: false, nightlights: false },
    loading: true, error: '', live: null, history: null, el: null, ctx: null
  };
  var cache = { live: null, history: null, countries: null, cities: null, paths: null };
  var bound = false;

  function web(k) { return state.ctx.web(k); }
  function esc(v) { return state.ctx.esc(v); }
  function lang() { return state.ctx.lang(); }

  function fetchJson(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) { throw new Error(url + ' HTTP ' + r.status); }
      return r.json();
    });
  }
  function fmt(ms, dateOnly) {
    if (!ms) { return '—'; }
    try {
      var opt = dateOnly
        ? { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }
        : { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return new Intl.DateTimeFormat(lang() === 'zh' ? 'zh-CN' : lang(), opt).format(new Date(ms));
    } catch (e) { return new Date(ms).toLocaleString(); }
  }
  function magColor(m) {
    if (m >= 7) { return '#ff3b6b'; }
    if (m >= 6) { return '#ff6a3d'; }
    if (m >= 5) { return '#ffb020'; }
    if (m >= 4) { return '#ffe14d'; }
    return '#5fe0c0';
  }
  function proj(lon, lat) { return { x: (lon + 180) / 360 * W, y: (90 - lat) / 180 * H }; }
  function radiusKm(m) { return Math.max(60, (m - 2) * 180); }
  function kmToUnits(km) { return km / 111.32 * (H / 180); }
  function distKm(lon1, lat1, lon2, lat2) {
    var R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  function ringPath(ring) {
    var out = '';
    for (var i = 0; i < ring.length; i++) {
      var p = proj(ring[i][0], ring[i][1]);
      out += (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
    }
    return out + 'Z';
  }
  function geoPath(geo) {
    if (!geo) { return ''; }
    if (geo.type === 'Polygon') { return geo.coordinates.map(ringPath).join(' '); }
    if (geo.type === 'MultiPolygon') {
      return geo.coordinates.map(function (poly) { return poly.map(ringPath).join(' '); }).join(' ');
    }
    return '';
  }
  function ensureGeo() {
    if (cache.paths) { return Promise.resolve(); }
    return Promise.all([
      cache.countries ? Promise.resolve(cache.countries) : fetchJson('assets/world-countries.geojson'),
      cache.cities ? Promise.resolve(cache.cities) : fetchJson('assets/world-cities.json')
    ]).then(function (res) {
      cache.countries = res[0];
      cache.cities = res[1];
      var paths = [];
      (cache.countries.features || []).forEach(function (f) {
        var d = geoPath(f.geometry);
        if (!d) { return; }
        var ring = f.geometry.type === 'Polygon' ? f.geometry.coordinates[0] : f.geometry.coordinates[0][0];
        var sx = 0, sy = 0, n = 0;
        (ring || []).forEach(function (c) { sx += c[0]; sy += c[1]; n++; });
        paths.push({
          name: f.properties.name,
          iso: f.properties.iso2 || '',
          d: d,
          lon: n ? sx / n : 0,
          lat: n ? sy / n : 0
        });
      });
      cache.paths = paths;
    });
  }
  function currentQuakes() {
    if (state.mode === 'live') {
      var live = state.live;
      if (!live || !live.earthquakes) { return []; }
      return live.earthquakes.map(function (q) {
        return {
          id: q.id, mag: Number(q.magnitude), place: q.place, time: q.timestamp,
          lon: Number(q.longitude), lat: Number(q.latitude), depth: Number(q.depth_km),
          tsunami: !!q.tsunami, alert: q.alert, significance: q.significance,
          mmi: q.intensity_mmi, url: q.url || '', source: live.sourceName || live.source || 'USGS',
          eventType: q.event_type || 'earthquake'
        };
      }).filter(function (q) { return isFinite(q.mag) && isFinite(q.lon) && isFinite(q.lat); });
    }
    var hist = state.history;
    if (!hist || !hist.rows) { return []; }
    var rows = hist.rows.filter(function (r) { return Number(r[4]) >= state.hmin; });
    rows.sort(function (a, b) { return b[4] - a[4] || b[0] - a[0]; });
    rows = rows.slice(0, 1200);
    return rows.map(function (r, i) {
      return {
        id: 'h' + i, mag: Number(r[4]), place: r[5], time: r[0], lon: Number(r[1]), lat: Number(r[2]),
        depth: Number(r[3]), tsunami: false, alert: null, significance: null, mmi: null, url: '',
        source: hist.source || 'CnOpenData', eventType: 'earthquake'
      };
    });
  }
  function quakesInCountry(quakes) {
    if (!state.country) { return quakes; }
    var c = (cache.paths || []).filter(function (p) { return p.name === state.country; })[0];
    if (!c) { return quakes; }
    return quakes.filter(function (q) { return distKm(c.lon, c.lat, q.lon, q.lat) <= 1500; });
  }
  function countryHit(name, quakes) {
    var c = (cache.paths || []).filter(function (p) { return p.name === name; })[0];
    if (!c) { return false; }
    return quakes.some(function (q) { return distKm(c.lon, c.lat, q.lon, q.lat) <= radiusKm(q.mag); });
  }

  function header(data, quakes) {
    var isLive = state.mode === 'live';
    var all = quakes;
    var total = quakes.length;
    var max = quakes.reduce(function (m, q) { return Math.max(m, q.mag); }, 0);
    var sig = quakes.filter(function (q) { return q.mag >= 4.5; }).length;
    if (!isLive && state.history && state.history.rows) {
      all = state.history.rows.filter(function (r) { return Number(r[4]) >= state.hmin; });
      total = all.length;
      max = all.reduce(function (m, r) { return Math.max(m, Number(r[4])); }, 0);
      sig = all.filter(function (r) { return Number(r[4]) >= 4.5; }).length;
    }
    var capped = total > quakes.length;
    var tsu = quakes.filter(function (q) { return q.tsunami; }).length;
    var source = isLive ? (data.sourceName || data.source || 'USGS') : (data.source || 'CnOpenData');
    var dataTime = isLive ? (data.generatedAt || data.fetchedAt) : (data.range ? data.range[1] : '');
    var kpi = function (label, value, sub) {
      return '<div class="gkpi"><span>' + esc(label) + '</span><b>' + esc(value) + '</b><small>' + esc(sub || '') + '</small></div>';
    };
    var layers = [
      ['affected', web('affected')], ['population', web('population')], ['evacuation', web('evacuation')],
      ['infrastructure', web('infrastructure')], ['nightlights', web('nightlights')]
    ].map(function (l) {
      return '<button type="button" class="glayer' + (state.layers[l[0]] ? ' active' : '') + '" data-g="layer" data-v="' + l[0] + '">' + esc(l[1]) + '</button>';
    }).join('');
    var countryOpts = '<option value="">' + esc(web('countryLabel')) + '</option>' + (cache.paths || []).slice().sort(function (a, b) { return a.name < b.name ? -1 : 1; }).map(function (p) {
      return '<option value="' + esc(p.name) + '"' + (state.country === p.name ? ' selected' : '') + '>' + esc(p.name) + '</option>';
    }).join('');
    return '<div class="global-head">' +
        '<div class="global-head-main"><div class="eyebrow">GLOBAL DISASTER MONITOR</div>' +
          '<h1>' + esc(web('globalTitle')) + '</h1><p>' + esc(web('globalSub')) + '</p></div>' +
        '<div class="global-mode">' +
          '<button type="button" class="' + (isLive ? 'active' : '') + '" data-g="mode" data-v="live">' + esc(web('live')) + '</button>' +
          '<button type="button" class="' + (!isLive ? 'active' : '') + '" data-g="mode" data-v="history">' + esc(web('history')) + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="global-kpis">' +
        kpi(isLive ? web('activeQuakes') : web('quakeRecords'), total, capped ? 'Top ' + quakes.length : (isLive ? web('live') : web('records'))) +
        kpi(web('maxMagnitude'), 'M' + max.toFixed(1), '') +
        kpi(web('significantQuakes'), sig, 'M4.5+') +
        kpi(web('tsunamiAlerts'), tsu, '') +
      '</div>' +
      '<div class="global-toolbar">' +
        '<div class="global-filters"><span class="gfl">' + esc(web('countryLabel')) + '</span><select data-g="country-select" aria-label="' + esc(web('countryLabel')) + '">' + countryOpts + '</select>' +
        (isLive ? '' : '<span class="gfl">' + esc(web('history')) + '</span>' +
          ['7', '4.5', '2.5'].map(function (v) {
            return '<button type="button" class="gchip' + (String(state.hmin) === v ? ' active' : '') + '" data-g="hmin" data-v="' + v + '">M' + v + '+</button>';
          }).join('')) +
        '</div>' +
        '<div class="global-layers"><span class="gfl">' + esc(web('layers')) + '</span>' + layers + '</div>' +
      '</div>' +
      '<div class="global-meta"><span>' + esc(web('sourceLabel')) + ': ' + esc(source) + '</span><span>' + esc(web('dataTime')) + ': ' + esc(fmt(dataTime)) + '</span>' +
        (isLive ? '' : '<span>' + esc(web('historyRange')) + ': ' + esc(fmt(data.range && data.range[0], true)) + ' → ' + esc(fmt(data.range && data.range[1], true)) + '</span>') +
        '<span>' + esc(data.note || '') + '</span></div>';
  }

  function mapSvg(quakes) {
    var parts = [];
    parts.push('<image href="assets/world-satellite.jpg" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none"></image>');
    if (state.layers.nightlights) {
      var x1 = proj(70, 60).x, x2 = proj(80, 10).x, y1 = proj(70, 60).y, y2 = proj(80, 10).y;
      parts.push('<image href="assets/nasa-nightlights-eastasia.jpg" x="' + x1.toFixed(1) + '" y="' + y1.toFixed(1) + '" width="' + (x2 - x1).toFixed(1) + '" height="' + (y2 - y1).toFixed(1) + '" preserveAspectRatio="none" opacity=".9"></image>');
    }
    parts.push('<g class="gcountries">');
    (cache.paths || []).forEach(function (p) {
      var hit = state.layers.affected && countryHit(p.name, quakes);
      var cls = 'gcountry' + (hit ? ' hit' : '') + (state.country === p.name ? ' sel' : '');
      parts.push('<path class="' + cls + '" d="' + p.d + '" data-country="' + esc(p.name) + '"><title>' + esc(p.name) + '</title></path>');
    });
    parts.push('</g>');
    if (state.layers.affected) {
      parts.push('<g class="gaffected">');
      quakes.forEach(function (q) {
        var p = proj(q.lon, q.lat);
        parts.push('<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + kmToUnits(radiusKm(q.mag)).toFixed(1) + '" fill="' + magColor(q.mag) + '" opacity=".16" stroke="' + magColor(q.mag) + '" stroke-opacity=".55" stroke-width=".6" stroke-dasharray="2 3"></circle>');
      });
      parts.push('</g>');
    }
    if (state.layers.population) {
      parts.push('<g class="gcities">');
      (cache.cities || []).forEach(function (c) {
        var p = proj(c.lon, c.lat);
        var r = Math.max(0.8, Math.min(2.6, Math.log10(c.pop + 1) - 3.2));
        parts.push('<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="#8ef0ff" opacity=".55"></circle>');
      });
      parts.push('</g>');
    }
    if (state.layers.infrastructure) {
      parts.push('<g class="ginfra">');
      (cache.cities || []).slice(0, 80).forEach(function (c) {
        var p = proj(c.lon, c.lat);
        parts.push('<rect x="' + (p.x - 1.2).toFixed(1) + '" y="' + (p.y - 1.2).toFixed(1) + '" width="2.4" height="2.4" fill="#ffd166" opacity=".8"></rect>');
        if (c.pop > 7000000) {
          parts.push('<text x="' + (p.x + 3).toFixed(1) + '" y="' + (p.y + 2).toFixed(1) + '" class="gcity-label">' + esc(c.name) + '</text>');
        }
      });
      parts.push('</g>');
    }
    parts.push('<g class="gquakes">');
    quakes.forEach(function (q) {
      var p = proj(q.lon, q.lat);
      var r = Math.max(2, Math.min(8, 2 + (q.mag - 1) * 1.05));
      var sel = state.selected && state.selected.id === q.id;
      parts.push('<g class="gmarker' + (sel ? ' sel' : '') + '" data-quake="' + esc(q.id) + '" transform="translate(' + p.x.toFixed(1) + ',' + p.y.toFixed(1) + ')" style="color:' + magColor(q.mag) + '">' +
        (sel ? '<circle class="gsmile" r="' + (r + 8).toFixed(1) + '" fill="none" stroke="' + magColor(q.mag) + '" stroke-width="1.5"></circle>' : '') +
        '<circle class="core" r="' + r.toFixed(1) + '" fill="' + magColor(q.mag) + '"></circle>' +
        '<title>M' + q.mag.toFixed(1) + ' · ' + esc(q.place) + '</title></g>');
    });
    parts.push('</g>');
    if (state.layers.evacuation && state.selected) {
      var s = state.selected;
      var sp = proj(s.lon, s.lat);
      [100, 200].forEach(function (km) {
        parts.push('<circle cx="' + sp.x.toFixed(1) + '" cy="' + sp.y.toFixed(1) + '" r="' + kmToUnits(km).toFixed(1) + '" fill="none" stroke="#7ef0ff" stroke-width="1" stroke-dasharray="4 4" opacity=".8"></circle>');
      });
    }
    return '<svg class="gmap" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(web('globalTitle')) + '">' + parts.join('') + '</svg>';
  }

  function detailHtml(q) {
    var tsu = q.tsunami ? 'YES' : 'NO';
    var mmi = q.mmi == null ? '—' : String(q.mmi);
    var alertBadge = q.alert ? '<span class="galert ' + esc(q.alert) + '">' + esc(String(q.alert).toUpperCase()) + '</span>' : '';
    var actions = [
      lang() === 'zh' ? '趴下、掩护、抓牢；远离窗户与外墙。' : 'Drop, Cover and Hold On; stay away from windows and outer walls.',
      lang() === 'zh' ? '强震后如身处海岸，立即向高处转移。' : 'If near the coast after strong shaking, move to high ground immediately.',
      lang() === 'zh' ? '关注当地应急部门与海啸预警。' : 'Follow local emergency authorities and tsunami warnings.',
      lang() === 'zh' ? '检查燃气、电力与建筑结构，谨防余震。' : 'Check gas, power and structural damage; expect aftershocks.'
    ];
    return '<div class="gdetail">' +
      '<div class="gdetail-top"><div><div class="gkicker">' + esc(web('quakeDetail')) + '</div>' +
        '<h3>' + esc(q.place || '—') + '</h3><div class="gcoords">' + esc(q.lon.toFixed(2)) + '°, ' + esc(q.lat.toFixed(2)) + '°</div></div>' +
        '<div class="gmag" style="color:' + magColor(q.mag) + '">M' + esc(q.mag.toFixed(1)) + '</div></div>' +
      '<div class="gcards">' +
        '<div><span>' + esc(web('depth')) + '</span><b>' + esc(isFinite(q.depth) ? q.depth.toFixed(1) + ' km' : '—') + '</b></div>' +
        '<div><span>' + esc(web('intensity')) + '</span><b>' + esc(mmi) + '</b></div>' +
        '<div><span>' + esc(web('tsunami')) + '</span><b>' + esc(tsu) + '</b></div>' +
      '</div>' +
      '<div class="grows">' +
        '<div><span>' + esc(web('issued')) + '</span><b>' + esc(fmt(q.time)) + '</b></div>' +
        '<div><span>' + esc(web('sourceLabel')) + '</span><b>' + esc(q.source) + '</b></div>' +
        '<div><span>Significance</span><b>' + esc(q.significance == null ? '—' : q.significance) + '</b></div>' +
        '<div><span>Alert</span><b>' + (alertBadge || '—') + '</b></div>' +
      '</div>' +
      '<div class="gactions"><b>' + esc(web('recommended')) + '</b><ul>' + actions.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul></div>' +
      (q.url ? '<a class="btn btn-outline" href="' + esc(q.url) + '" target="_blank" rel="noopener noreferrer">USGS event ↗</a>' : '') +
      '</div>';
  }

  function sideHtml(quakes) {
    if (state.selected) {
      return detailHtml(state.selected);
    }
    if (state.country) {
      var list = quakesInCountry(quakes).slice().sort(function (a, b) { return b.mag - a.mag; }).slice(0, 8);
      return '<div class="gside-head"><h3>' + esc(state.country) + '</h3><span>' + esc(web('nearQuakes')) + ' · ' + list.length + '</span></div>' +
        '<div class="glist">' + list.map(function (q) {
          return '<button type="button" class="gitem" data-quake="' + esc(q.id) + '"><b style="color:' + magColor(q.mag) + '">M' + q.mag.toFixed(1) + '</b><span>' + esc(q.place) + '</span><small>' + esc(fmt(q.time)) + '</small></button>';
        }).join('') + '</div>';
    }
    var latest = quakes.slice().sort(function (a, b) { return b.time - a.time; }).slice(0, 10);
    return '<div class="gside-head"><h3>' + esc(web('nearQuakes')) + '</h3><span>' + esc(web('selectHint')) + '</span></div>' +
      '<div class="glist">' + latest.map(function (q) {
        return '<button type="button" class="gitem" data-quake="' + esc(q.id) + '"><b style="color:' + magColor(q.mag) + '">M' + q.mag.toFixed(1) + '</b><span>' + esc(q.place) + '</span><small>' + esc(fmt(q.time)) + '</small></button>';
      }).join('') + '</div>';
  }

  function paint() {
    var el = state.el;
    if (!el) { return; }
    if (state.loading && !state.live) {
      el.innerHTML = '<section class="global-page"><div class="container"><div class="global-head"><div><div class="eyebrow">GLOBAL DISASTER MONITOR</div><h1>' + esc(web('globalTitle')) + '</h1><p>' + esc(web('globalSub')) + '</p></div></div><div class="state-box"><div class="spinner"></div>' + esc(web('live')) + '…</div></div></section>';
      return;
    }
    if (state.error && !state.live) {
      el.innerHTML = '<section class="global-page"><div class="container"><div class="state-box error">' + esc(state.error) + '</div></div></section>';
      return;
    }
    var data = state.mode === 'live' ? state.live : state.history;
    if (!data) { return; }
    var quakes = currentQuakes();
    el.innerHTML = '<section class="global-page"><div class="container">' +
      header(data, quakes) +
      '<div class="global-layout"><div class="global-map-wrap">' + mapSvg(quakes) +
        '<div class="glegend"><span>M&lt;4</span><span>M4</span><span>M5</span><span>M6</span><span>M7+</span></div>' +
      '</div><aside class="global-side">' + sideHtml(quakes) + '</aside></div>' +
      '<p class="global-foot">' + esc(web('globalNote')) + ' · CnOpenData · NASA VNP46A2</p>' +
      '</div></section>';
    state.ctx.explainView && state.ctx.explainView();
  }

  function onClick(e) {
    var g = e.target.closest('[data-g]');
    if (g) {
      var k = g.getAttribute('data-g'), v = g.getAttribute('data-v');
      if (k === 'mode' && v && v !== state.mode) {
        state.mode = v; state.selected = null; state.country = null;
        if (v === 'history' && !state.history) {
          state.loading = true; paint();
          fetchJson('public-data/global-quakes-history.json').then(function (d) {
            cache.history = d; state.history = d; state.loading = false; paint();
          }).catch(function (err) { state.loading = false; state.error = String(err); paint(); });
        } else { paint(); }
        return;
      }
      if (k === 'hmin') { state.hmin = parseFloat(v); state.selected = null; paint(); return; }
      if (k === 'layer') { state.layers[v] = !state.layers[v]; paint(); return; }
      return;
    }
    var q = e.target.closest('[data-quake]');
    if (q) {
      var id = q.getAttribute('data-quake');
      var list = currentQuakes();
      state.selected = list.filter(function (x) { return x.id === id; })[0] || null;
      paint();
      return;
    }
    var c = e.target.closest('[data-country]');
    if (c) {
      var name = c.getAttribute('data-country');
      state.country = state.country === name ? null : name;
      state.selected = null;
      paint();
    }
  }

  function onChange(e) {
    var s = e.target.closest('[data-g="country-select"]');
    if (s) { state.country = s.value || null; state.selected = null; paint(); }
  }

  function render(viewEl, ctx) {
    state.el = viewEl;
    state.ctx = ctx;
    state.loading = !state.live;
    state.error = '';
    if (!bound) {
      viewEl.addEventListener('click', onClick);
      viewEl.addEventListener('change', onChange);
      bound = true;
    }
    document.title = ctx.web('globalTitle');
    paint();
    if (!state.live) {
      Promise.all([fetchJson('public-data/global-earthquakes.json'), ensureGeo()]).then(function (res) {
        state.live = res[0];
        cache.live = res[0];
        state.loading = false;
        paint();
      }).catch(function (err) {
        state.loading = false;
        state.error = String(err && err.message ? err.message : err);
        paint();
      });
    } else if (!cache.paths) {
      ensureGeo().then(paint).catch(function () { paint(); });
    }
  }

  window.NDGlobal = {
    render: render,
    loadLive: function () { return cache.live ? Promise.resolve(cache.live) : fetchJson('public-data/global-earthquakes.json').then(function (d) { cache.live = d; return d; }); },
    cached: function () { return cache.live; },
    history: function () { return cache.history; }
  };
})();
