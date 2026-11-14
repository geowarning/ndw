/* 全球灾害监测：卫星底图 + 实时/历史地震 + 影响圈 + 国家筛选 + 图层 */
(function () {
  var W = 1000, H = 500;
  var state = {
    mode: 'live', hmin: 4.5, selected: null, country: null,
    layers: { affected: true, population: false, evacuation: false, infrastructure: false, gdacs: true },
    loading: true, error: '', live: null, history: null, el: null, ctx: null,
    zoom: 1, panX: 0, panY: 0, fullscreen: false, gdacsType: 'all', gdacsAlert: 'all', historyRange: '30d'
  };
  var cache = { live: null, history: null, countries: null, cities: null, paths: null, gdacs: null, gdacsRaw: null, gdacsHistory: null };
  var wms = { key: '', timer: null };
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
    return Promise.all([
      cache.countries ? Promise.resolve(cache.countries) : fetchJson('assets/world-countries.geojson'),
      cache.cities ? Promise.resolve(cache.cities) : fetchJson('assets/world-cities.json'),
      cache.gdacsRaw ? Promise.resolve(cache.gdacsRaw) : fetchJson('public-data/gdacs-events.json').catch(function () { return { features: [] }; })
    ]).then(function (res) {
      cache.countries = res[0];
      cache.cities = res[1];
      cache.gdacsRaw = res[2];
      if (!cache.gdacs) { cache.gdacs = normalizeGdacs(cache.gdacsRaw); }
      if (cache.paths) { return; }
        var paths = [];
      (cache.countries.features || []).forEach(function (f) {
        var d = geoPath(f.geometry);
        if (!d) { return; }
        var minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
        var sx = 0, sy = 0, n = 0;
        function scanRing(ring) {
          (ring || []).forEach(function (c) {
            if (typeof c[0] !== 'number') { return; }
            minLon = Math.min(minLon, c[0]);
            maxLon = Math.max(maxLon, c[0]);
            minLat = Math.min(minLat, c[1]);
            maxLat = Math.max(maxLat, c[1]);
            sx += c[0];
            sy += c[1];
            n++;
          });
        }
        var geo = f.geometry;
        if (geo.type === 'Polygon') {
          geo.coordinates.forEach(scanRing);
        } else if (geo.type === 'MultiPolygon') {
          geo.coordinates.forEach(function (poly) { poly.forEach(scanRing); });
        }
        paths.push({
          name: f.properties.name,
          iso: f.properties.iso2 || '',
          d: d,
          lon: n ? sx / n : 0,
          lat: n ? sy / n : 0,
          bbox: { minLon: minLon, maxLon: maxLon, minLat: minLat, maxLat: maxLat }
        });
      });
      cache.paths = paths;
    });
  }
  function historyDays() {
    if (state.historyRange === '3d') { return 3; }
    if (state.historyRange === '7d') { return 7; }
    return 30;
  }
  function historyRows() {
    var hist = state.history;
    if (!hist || !hist.rows) { return []; }
    var minTime = Date.now() - historyDays() * 86400000;
    var rows = hist.rows.filter(function (r) {
      return Number(r[4]) >= state.hmin && Number(r[0]) >= minTime;
    });
    rows.sort(function (a, b) { return b[4] - a[4] || b[0] - a[0]; });
    return rows.slice(0, 1200);
  }
  function currentQuakes() {
    if (state.mode === 'live') {
      var live = state.live;
      if (!live || !live.earthquakes) { return []; }
      return live.earthquakes.map(function (q) {
        return {
          kind: 'quake',
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
    return historyRows().map(function (r, i) {
      return {
        kind: 'quake',
        id: 'h' + i, mag: Number(r[4]), place: r[5], time: r[0], lon: Number(r[1]), lat: Number(r[2]),
        depth: Number(r[3]), tsunami: false, alert: null, significance: null, mmi: null, url: '',
        source: hist.source || 'USGS', eventType: 'earthquake'
      };
    });
  }
  function gdacsParse(s) {
    var time = GdacsStatus.time(s);
    return isFinite(time) ? time : 0;
  }
  function gdacsMs(g) { return gdacsParse(g && (g.from || g.modified)); }
  function gdacsColor(type) {
    if (type === 'WF') { return '#ff7a1a'; }
    if (type === 'FL') { return '#4aa8ff'; }
    if (type === 'TC') { return '#b388ff'; }
    return '#c9a227';
  }
  function gdacsAlertColor(alert) {
    if (alert === 'red') { return '#ff5252'; }
    if (alert === 'orange') { return '#ff9a3c'; }
    return '#43e8a0';
  }
  function gdacsTypeLabel(type) {
    if (type === 'WF') { return web('gdacsWildfire'); }
    if (type === 'FL') { return web('gdacsFlood'); }
    if (type === 'TC') { return web('gdacsCyclone'); }
    if (type === 'VO') return window.NDLocale.phrase('火山','Volcano',lang());
    if (type === 'TS') return window.NDLocale.phrase('海啸','Tsunami',lang());
    return web('gdacsDrought');
  }
  function gdacsAlertLabel(alert) {
    if (alert === 'red') { return web('gdacsRed'); }
    if (alert === 'orange') { return web('gdacsOrange'); }
    return web('gdacsGreen');
  }
  function normalizeGdacs(data) {
    var seen = {};
    var out = [];
    ((data && data.features) || []).forEach(function (f) {
      var p = f.properties || {};
      var c = (f.geometry && f.geometry.coordinates) || [];
      var id = p.eventtype + '-' + p.eventid + '-' + p.episodeid;
      if (seen[id] || !isFinite(c[0]) || !isFinite(c[1])) { return; }
      seen[id] = 1;
      out.push({
        kind: 'gdacs', id: id, type: p.eventtype, name: /^event in rss format$/i.test(p.name || '') ? (p.htmldescription || p.eventtype + ' · ' + p.country) : (p.name || p.description || ''),
        country: p.country || '', alert: String(p.alertlevel || '').toLowerCase(),
        active: p._active !== false, status: p,
        from: p.fromdate || '', to: p.todate || '', modified: p.datemodified || '',
        source: p.source || 'GDACS', url: (p.url && p.url.report) || '',
        description: p.htmldescription || p.description || '',
        severity: (p.severitydata && p.severitydata.severitytext) || '',
        lon: Number(c[0]), lat: Number(c[1])
      });
    });
    out.sort(function (a, b) { return gdacsParse(b.modified) - gdacsParse(a.modified); });
    return out;
  }
  function currentGdacs() {
    if (!state.layers.gdacs) { return []; }
    if (state.mode === 'history') {
      var historical = normalizeGdacs({ features: ((cache.gdacsRaw && cache.gdacsRaw.features) || []) });
      var combined = {};
      (cache.gdacsHistory || []).concat(historical).forEach(function (g) { combined[g.id] = g; });
      var minTime = Date.now() - historyDays() * 86400000;
      return Object.keys(combined).map(function (id) { return combined[id]; }).filter(function (g) {
        if (Math.max(gdacsMs(g), gdacsParse(g.to)) < minTime) { return false; }
        if (state.gdacsType === 'EQ') { return false; }
        if (state.gdacsType !== 'all' && g.type !== state.gdacsType) { return false; }
        if (state.gdacsAlert !== 'all' && g.alert !== state.gdacsAlert) { return false; }
        return true;
      });
    }
    if (!cache.gdacs) { return []; }
    if (state.gdacsType === 'EQ') { return []; }
    return cache.gdacs.filter(function (g) {
      if (!GdacsStatus.active(g.status, Date.now())) { return false; }
      if (state.gdacsType !== 'all' && g.type !== state.gdacsType) { return false; }
      if (state.gdacsAlert !== 'all' && g.alert !== state.gdacsAlert) { return false; }
      return true;
    });
  }
  function hazardTypeLabel(type) {
    if (type === 'EQ') { return web('earthquakeType'); }
    if (type === 'all') { return web('all'); }
    return gdacsTypeLabel(type);
  }
  function filteredQuakes(quakes) {
    if (state.gdacsType !== 'all' && state.gdacsType !== 'EQ') { return []; }
    if (state.gdacsAlert === 'all') { return quakes; }
    return quakes.filter(function (q) {
      return String(q.alert || '').toLowerCase() === state.gdacsAlert;
    });
  }
  function gdacsInCountry() {
    if (!state.country) { return currentGdacs(); }
    var c = (cache.paths || []).filter(function (p) { return p.name === state.country; })[0];
    if (!c) { return currentGdacs(); }
    return currentGdacs().filter(function (g) { return distKm(c.lon, c.lat, g.lon, g.lat) <= 1500; });
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
    var total = quakes.length;
    var max = quakes.reduce(function (m, q) { return Math.max(m, q.mag); }, 0);
    var sig = quakes.filter(function (q) { return q.mag >= 4.5; }).length;
    var capped = total > quakes.length;
    var tsu = quakes.filter(function (q) { return q.tsunami; }).length;
    var source = isLive ? (data.sourceName || data.source || 'USGS') : (data.source || 'CnOpenData');
    var dataTime = isLive ? (data.generatedAt || data.fetchedAt) : (data.range ? data.range[1] : '');
    var kpi = function (label, value, sub) {
      return '<div class="gkpi"><span>' + esc(label) + '</span><b>' + esc(value) + '</b><small>' + esc(sub || '') + '</small></div>';
    };
    var layerDefs = [
      ['gdacs', web('gdacsLayer')], ['affected', web('affected')], ['population', web('population')],
      ['evacuation', web('evacuation')], ['infrastructure', web('infrastructure')]
    ];
    var layers = layerDefs.map(function (l) {
      return '<button type="button" class="glayer' + (state.layers[l[0]] ? ' active' : '') + '" data-g="layer" data-v="' + l[0] + '">' + esc(l[1]) + '</button>';
    }).join('');
    var countryOpts = '<option value="">' + esc(web('countryLabel')) + '</option>' + (cache.paths || []).slice().sort(function (a, b) { return a.name < b.name ? -1 : 1; }).map(function (p) {
      return '<option value="' + esc(p.name) + '"' + (state.country === p.name ? ' selected' : '') + '>' + esc(p.name) + '</option>';
    }).join('');
    var gdacsTypeOpts = '<option value="all">' + esc(web('gdacsAllTypes')) + '</option>' + [['EQ', web('earthquakeType')], ['WF', web('gdacsWildfire')], ['FL', web('gdacsFlood')], ['TC', web('gdacsCyclone')], ['DR', web('gdacsDrought')], ['VO', gdacsTypeLabel('VO')], ['TS', gdacsTypeLabel('TS')]].map(function (x) {
      return '<option value="' + x[0] + '"' + (state.gdacsType === x[0] ? ' selected' : '') + '>' + esc(x[1]) + '</option>';
    }).join('');
    var gdacsAlertOpts = '<option value="all">' + esc(web('gdacsAllAlerts')) + '</option>' + [['green', web('gdacsGreen')], ['orange', web('gdacsOrange')], ['red', web('gdacsRed')]].map(function (x) {
      return '<option value="' + x[0] + '"' + (state.gdacsAlert === x[0] ? ' selected' : '') + '>' + esc(x[1]) + '</option>';
    }).join('');
    var showQuakes = state.gdacsType === 'all' || state.gdacsType === 'EQ';
    var gdacs = currentGdacs();
    var kpiHtml;
    if (showQuakes) {
      kpiHtml = kpi(isLive ? web('activeQuakes') : web('quakeRecords'), total, capped ? 'Top ' + quakes.length : (isLive ? web('live') : web('records'))) +
        kpi(web('maxMagnitude'), 'M' + max.toFixed(1), '') +
        kpi(web('significantQuakes'), sig, 'M4.5+') +
        kpi(web('tsunamiAlerts'), tsu, '');
    } else {
      var active = gdacs.filter(function (g) { return g.active !== false; }).length;
      var alertRank = { green: 1, orange: 2, red: 3 };
      var maxAlert = '', countries = {};
      gdacs.forEach(function (g) {
        if ((alertRank[g.alert] || 0) > (alertRank[maxAlert] || 0)) { maxAlert = g.alert; }
        if (g.country) { countries[g.country] = 1; }
      });
      kpiHtml = kpi(web('gdacsEvents'), String(gdacs.length), web('gdacsLayer')) +
        kpi(web('live'), String(active), '') +
        kpi(web('gdacsAlert'), maxAlert ? gdacsAlertLabel(maxAlert) : '—', '') +
        kpi(web('countryLabel'), String(Object.keys(countries).length), '');
    }
    return '<div class="global-head">' +
        '<div class="global-head-main"><div class="eyebrow">GLOBAL DISASTER MONITOR</div>' +
          '<h1>' + esc(web('globalTitle')) + '</h1><p>' + esc(web('globalSub')) + '</p></div>' +
        '<div class="global-mode">' +
          '<button type="button" class="' + (isLive ? 'active' : '') + '" data-g="mode" data-v="live">' + esc(web('live')) + '</button>' +
          '<button type="button" class="' + (!isLive ? 'active' : '') + '" data-g="mode" data-v="history">' + esc(web('history')) + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="global-kpis">' + kpiHtml + '</div>' +
      '<div class="global-toolbar">' +
        '<div class="global-filters"><span class="gfl">' + esc(web('countryLabel')) + '</span><select data-g="country-select" aria-label="' + esc(web('countryLabel')) + '">' + countryOpts + '</select>' +
        (state.layers.gdacs ? '<span class="gfl">' + esc(web('hazardType')) + '</span><select data-g="gdacstype" aria-label="' + esc(web('hazardType')) + '">' + gdacsTypeOpts + '</select>' +
          '<select data-g="gdacsalert" aria-label="' + esc(web('gdacsAlert')) + '">' + gdacsAlertOpts + '</select>' : '') +
        (isLive ? '' : '<span class="gfl">' + esc(web('historyRange')) + '</span>' +
          [['3d', web('last3d')], ['7d', web('last7d')], ['30d', web('last30d')]].map(function (x) {
            return '<button type="button" class="gchip' + (state.historyRange === x[0] ? ' active' : '') + '" data-g="historyrange" data-v="' + x[0] + '">' + esc(x[1]) + '</button>';
          }).join('') +
          '<span class="gfl">M</span>' +
          ['7', '4.5', '2.5'].map(function (v) {
            return '<button type="button" class="gchip' + (String(state.hmin) === v ? ' active' : '') + '" data-g="hmin" data-v="' + v + '">M' + v + '+</button>';
          }).join('')) +
        '</div>' +
        '<div class="global-layers"><span class="gfl">' + esc(web('layers')) + '</span>' + layers + '</div>' +
      '</div>' +
      '<div class="global-meta"><span>' + esc(web('sourceLabel')) + ': ' + esc(source) + '</span><span>' + esc(web('dataTime')) + ': ' + esc(fmt(dataTime)) + '</span>' +
        '<span>GDACS · ' + esc(window.NDLocale.phrase('上次采集','Last checked',lang())) + ': ' + esc(fmt(gdacsParse(cache.gdacsRaw && (cache.gdacsRaw.checkedAt || cache.gdacsRaw.generatedAt)))) + ' · ' + esc(window.NDLocale.phrase('GDACS 当前事件列表；非现场确认','GDACS current-event feed; not on-site confirmation',lang())) + '</span>' +
        (state.layers.gdacs && state.gdacsType !== 'EQ' ? '<span>' + esc(hazardTypeLabel(state.gdacsType)) + ' · GDACS ' + gdacs.length + '</span>' : '') +
        (isLive ? '' : '<span>' + esc(web('historyRange')) + ': ' + esc(fmt(data.range && data.range[0], true)) + ' → ' + esc(fmt(data.range && data.range[1], true)) + '</span>') +
        '<span>' + esc(data.note || '') + '</span></div>';
  }

  function mapSvg(quakes) {
    var parts = [];
    parts.push('<g id="gmapViewport" transform="translate(' + state.panX + ' ' + state.panY + ') scale(' + state.zoom + ')">');
    parts.push('<image id="gmapBase" href="assets/world-satellite.jpg" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none"></image>');
    parts.push('<image id="gmapHi" href="" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none" style="display:none"></image>');
    parts.push('<image id="gmapWms" href="" x="0" y="0" width="0" height="0" preserveAspectRatio="none" style="display:none"></image>');
    parts.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="transparent"></rect>');
    parts.push('<g class="gcountries">');
    (cache.paths || []).forEach(function (p) {
      var hit = state.layers.affected && countryHit(p.name, quakes);
      var cls = 'gcountry' + (hit ? ' hit' : '') + (state.country === p.name ? ' sel' : '');
      parts.push('<path class="' + cls + '" d="' + p.d + '" data-country="' + esc(p.name) + '" vector-effect="non-scaling-stroke"><title>' + esc(p.name) + '</title></path>');
    });
    parts.push('</g>');
    parts.push('<g id="gmapCountryLabels" class="glables" style="display:none">');
    (cache.paths || []).forEach(function (p) {
      var c = proj(p.lon, p.lat);
      parts.push('<text x="' + c.x.toFixed(1) + '" y="' + c.y.toFixed(1) + '" text-anchor="middle">' + esc(p.name) + '</text>');
    });
    parts.push('</g>');
    if (state.layers.affected) {
      parts.push('<g class="gaffected">');
      quakes.forEach(function (q) {
        var p = proj(q.lon, q.lat);
        parts.push('<circle class="impact-pulse" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + kmToUnits(radiusKm(q.mag)).toFixed(1) + '" fill="' + magColor(q.mag) + '" opacity=".16" stroke="' + magColor(q.mag) + '" stroke-opacity=".55" stroke-width=".6" stroke-dasharray="2 3" vector-effect="non-scaling-stroke"></circle>');
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
    parts.push('<g id="gmapCityLabels" class="glables glables-city" style="display:none">');
    (cache.cities || []).slice(0, 45).forEach(function (c) {
      var q = proj(c.lon, c.lat);
      parts.push('<text x="' + q.x.toFixed(1) + '" y="' + (q.y - 2).toFixed(1) + '" text-anchor="middle">' + esc(c.name) + '</text>');
    });
    parts.push('</g>');
    parts.push('<g class="gquakes">');
    quakes.forEach(function (q) {
      var p = proj(q.lon, q.lat);
      var r = Math.max(2, Math.min(8, 2 + (q.mag - 1) * 1.05));
      var sel = state.selected && state.selected.id === q.id;
      parts.push('<g class="gmarker' + (sel ? ' sel' : '') + '" data-quake="' + esc(q.id) + '" transform="translate(' + p.x.toFixed(1) + ',' + p.y.toFixed(1) + ')" style="color:' + magColor(q.mag) + '"><g class="gmarker-inner">' +
        (sel ? '<circle class="gsmile" r="' + (r + 8).toFixed(1) + '" fill="none" stroke="' + magColor(q.mag) + '" stroke-width="1.5"></circle>' : '') +
        '<circle class="core" r="' + r.toFixed(1) + '" fill="' + magColor(q.mag) + '"></circle>' +
        '<title>M' + q.mag.toFixed(1) + ' · ' + esc(q.place) + '</title></g></g>');
    });
    parts.push('</g>');
    var gdacs = currentGdacs();
    if (gdacs.length) {
      parts.push('<g class="ggdacs">');
      gdacs.forEach(function (g) {
        var p = proj(g.lon, g.lat);
        var color = gdacsColor(g.type);
        var alertColor = gdacsAlertColor(g.alert);
        var sel = state.selected && state.selected.kind === 'gdacs' && state.selected.id === g.id;
        var shape;
        if (g.type === 'WF') {
          shape = '<path d="M0 -5 L5 4 L-5 4 Z" fill="' + color + '" stroke="#061018" stroke-width=".6"></path>';
        } else if (g.type === 'FL') {
          shape = '<path d="M0 -5 L5 0 L0 5 L-5 0 Z" fill="' + color + '" stroke="#061018" stroke-width=".6"></path>';
        } else if (g.type === 'TC') {
          shape = '<circle r="4" fill="' + color + '" stroke="#061018" stroke-width=".6"></circle>';
        } else {
          shape = '<rect x="-4" y="-4" width="8" height="8" rx="1" fill="' + color + '" stroke="#061018" stroke-width=".6"></rect>';
        }
        parts.push('<g class="gdacs-marker' + (!GdacsStatus.fresh(g.status, Date.now()) ? ' gdacs-overdue' : '') + (sel ? ' sel' : '') + '" data-gdacs="' + esc(g.id) + '" transform="translate(' + p.x.toFixed(1) + ',' + p.y.toFixed(1) + ')" style="color:' + color + '"><g class="gmarker-inner">' +
          (sel ? '<circle r="11" fill="none" stroke="' + color + '" stroke-width="1.4"></circle>' : '') +
          shape +
          '<circle r="8" fill="none" stroke="' + alertColor + '" stroke-width="1"></circle>' +
          '<title>' + esc(gdacsTypeLabel(g.type) + ' · ' + g.name + ' · ' + gdacsAlertLabel(g.alert)) + '</title></g></g>');
      });
      parts.push('</g>');
    }
    if (state.layers.evacuation && state.selected) {
      var s = state.selected;
      var sp = proj(s.lon, s.lat);
      [100, 200].forEach(function (km) {
        parts.push('<circle cx="' + sp.x.toFixed(1) + '" cy="' + sp.y.toFixed(1) + '" r="' + kmToUnits(km).toFixed(1) + '" fill="none" stroke="#7ef0ff" stroke-width="1" stroke-dasharray="4 4" opacity=".8" vector-effect="non-scaling-stroke"></circle>');
      });
    }
    parts.push('</g>');
    return '<svg class="gmap" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(web('globalTitle')) + '">' + parts.join('') + '</svg>';
  }

  function applyView() {
    if (!state.el) { return; }
    var vp = state.el.querySelector('#gmapViewport');
    if (!vp) { return; }
    vp.setAttribute('transform', 'translate(' + state.panX + ' ' + state.panY + ') scale(' + state.zoom + ')');
    var svgEl = state.el.querySelector('.gmap');
    var mapWrap = state.el.querySelector('.global-map-wrap');
    if (svgEl) {
      svgEl.setAttribute('preserveAspectRatio', mapWrap && mapWrap.classList.contains('gfull') ? 'xMidYMid slice' : 'xMidYMid meet');
    }
    var inv = 1 / state.zoom;
    var inner = state.el.querySelectorAll('.gmarker-inner');
    for (var i = 0; i < inner.length; i++) {
      inner[i].setAttribute('transform', 'scale(' + inv + ')');
    }
    var hi = state.el.querySelector('#gmapHi');
    if (hi) {
      if (state.zoom >= 2) {
        if (!hi.getAttribute('href')) { hi.setAttribute('href', 'assets/world-satellite-hi.jpg'); }
        hi.style.display = '';
      } else {
        hi.style.display = 'none';
      }
    }
    var cl = state.el.querySelector('#gmapCountryLabels');
    if (cl) {
      cl.style.display = state.zoom >= 1.7 ? '' : 'none';
      cl.style.fontSize = (7 / state.zoom) + 'px';
    }
    var cil = state.el.querySelector('#gmapCityLabels');
    if (cil) {
      cil.style.display = state.zoom >= 3 ? '' : 'none';
      cil.style.fontSize = (5 / state.zoom) + 'px';
    }
    updateWms();
  }
  function exitFullscreen() {
    state.fullscreen = false;
    document.body.classList.remove('gmap-lock');
    var el = document.querySelector('.global-map-wrap.gfull');
    if (el) { el.classList.remove('gfull'); }
  }
  function syncSideHeight() {
    if (!state.el) { return; }
    var side = state.el.querySelector('.global-side');
    var wrap = state.el.querySelector('.global-map-wrap');
    if (!side || !wrap) { return; }
    if (window.matchMedia('(max-width: 980px)').matches) {
      side.style.maxHeight = '';
      return;
    }
    side.style.maxHeight = Math.max(320, Math.round(wrap.getBoundingClientRect().height)) + 'px';
  }
  function updateWms() {
    if (!state.el) { return; }
    var img = state.el.querySelector('#gmapWms');
    if (!img) { return; }
    if (state.zoom < 8) {
      img.style.display = 'none';
      wms.key = '';
      return;
    }
    var x0 = -state.panX / state.zoom;
    var y0 = -state.panY / state.zoom;
    var x1 = x0 + W / state.zoom;
    var y1 = y0 + H / state.zoom;
    var lon0 = Math.max(-180, x0 / W * 360 - 180);
    var lon1 = Math.min(180, x1 / W * 360 - 180);
    var lat0 = Math.max(-90, 90 - y1 / H * 180);
    var lat1 = Math.min(90, 90 - y0 / H * 180);
    var key = state.zoom.toFixed(2) + '|' + lon0.toFixed(2) + ',' + lat0.toFixed(2) + ',' + lon1.toFixed(2) + ',' + lat1.toFixed(2);
    if (key === wms.key) { return; }
    wms.key = key;
    if (wms.timer) { clearTimeout(wms.timer); }
    wms.timer = setTimeout(function () {
      var url = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=BlueMarble_ShadedRelief_Bathymetry&STYLES=&FORMAT=image/jpeg&WIDTH=2048&HEIGHT=1024&SRS=EPSG:4326&BBOX=' +
        [lon0, lat0, lon1, lat1].map(function (v) { return v.toFixed(3); }).join(',');
      var probe = new Image();
      probe.onload = function () {
        if (wms.key !== key) { return; }
        var el = state.el && state.el.querySelector('#gmapWms');
        if (!el) { return; }
        el.setAttribute('href', url);
        el.setAttribute('x', x0.toFixed(2));
        el.setAttribute('y', y0.toFixed(2));
        el.setAttribute('width', (x1 - x0).toFixed(2));
        el.setAttribute('height', (y1 - y0).toFixed(2));
        el.style.display = '';
      };
      probe.onerror = function () { /* keep the baked basemap */ };
      probe.src = url;
    }, 350);
  }
  function clampPan() {
    var minX = W * (1 - state.zoom), minY = H * (1 - state.zoom);
    state.panX = Math.min(0, Math.max(minX, state.panX));
    state.panY = Math.min(0, Math.max(minY, state.panY));
  }
  var zoomAnimation = null;
  function animateView(z, x, y) {
    if (zoomAnimation) cancelAnimationFrame(zoomAnimation);
    var from = { z: state.zoom, x: state.panX, y: state.panY }, started = null;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function frame(time) {
      if (started === null) started = time;
      var t = reduced ? 1 : Math.min(1, (time - started) / 700);
      var ease = t * t * (3 - 2 * t);
      state.zoom = from.z + (z - from.z) * ease;
      state.panX = from.x + (x - from.x) * ease;
      state.panY = from.y + (y - from.y) * ease;
      clampPan(); applyView();
      zoomAnimation = t < 1 ? requestAnimationFrame(frame) : null;
    }
    zoomAnimation = requestAnimationFrame(frame);
  }
  function zoomAt(px, py, factor) {
    if (zoomAnimation) { cancelAnimationFrame(zoomAnimation); zoomAnimation = null; }
    var z = Math.max(1, Math.min(96, state.zoom * factor));
    if (Math.abs(z - state.zoom) < 0.001) { return; }
    var k = z / state.zoom;
    state.panX = px - (px - state.panX) * k;
    state.panY = py - (py - state.panY) * k;
    state.zoom = z;
    clampPan();
    applyView();
  }
  function zoomToCountry(c) {
    if (!c || !c.bbox) { return; }
    var b = c.bbox;
    var w = Math.max(0.5, (b.maxLon - b.minLon) / 360 * W);
    var h = Math.max(0.5, (b.maxLat - b.minLat) / 180 * H);
    var z = Math.max(1, Math.min(96, Math.min(W / w, H / h) * 0.78));
    var cx = ((b.minLon + b.maxLon) / 2 + 180) / 360 * W;
    var cy = (90 - (b.minLat + b.maxLat) / 2) / 180 * H;
    animateView(z, W / 2 - z * cx, H / 2 - z * cy);
  }
  function selectCountry(name) {
    if (state.country === name) {
      state.country = null;
      state.selected = null;
      animateView(1, 0, 0);
      paint();
      return;
    }
    state.country = name;
    state.selected = null;
    var chosen = (cache.paths || []).filter(function (p) { return p.name === name; })[0];
    zoomToCountry(chosen);
    paint();
  }
  function selectQuake(id) {
    var list = currentQuakes();
    state.selected = list.filter(function (x) { return x.id === id; })[0] || null;
    paint();
  }
  function selectGdacs(id) {
    var list = currentGdacs();
    state.selected = list.filter(function (x) { return x.id === id; })[0] || null;
    paint();
  }
  var drag = null;
  var suppressClickUntil = 0;
  function onWheel(e) {
    var map = e.target.closest && e.target.closest('.gmap');
    if (!map) { return; }
    e.preventDefault();
    var r = map.getBoundingClientRect();
    if (!r.width || !r.height) { return; }
    var px = (e.clientX - r.left) / r.width * W;
    var py = (e.clientY - r.top) / r.height * H;
    zoomAt(px, py, Math.exp(-e.deltaY * 0.0015));
  }
  function onPointerDown(e) {
    if (zoomAnimation) { cancelAnimationFrame(zoomAnimation); zoomAnimation = null; }
    if (e.button != null && e.button !== 0) { return; }
    if (e.target.closest('.gzoom,[data-quake],[data-gdacs]')) { return; }
    var map = e.target.closest('.gmap');
    if (!map) { return; }
    var r = map.getBoundingClientRect();
    drag = { x: e.clientX, y: e.clientY, px: state.panX, py: state.panY, w: r.width, h: r.height, moved: false, captured: false, target: e.target, pointerId: e.pointerId, map: map };
  }
  function onPointerMove(e) {
    if (!drag) { return; }
    if (!drag.w || !drag.h) { return; }
    var dx = (e.clientX - drag.x) / drag.w * W;
    var dy = (e.clientY - drag.y) / drag.h * H;
    if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 8) {
      drag.moved = true;
      if (!drag.captured) {
        try { drag.map.setPointerCapture(drag.pointerId); drag.captured = true; } catch (err) { /* ignore */ }
      }
    }
    if (state.zoom <= 1) { return; }
    state.panX = drag.px + dx;
    state.panY = drag.py + dy;
    clampPan();
    applyView();
  }
  function onPointerUp() {
    if (drag) {
      if (!drag.moved) {
        var t = drag.target;
        var cEl = t && t.closest ? t.closest('[data-country]') : null;
        var qEl = t && t.closest ? t.closest('[data-quake]') : null;
        var dEl = t && t.closest ? t.closest('[data-gdacs]') : null;
        suppressClickUntil = Date.now() + 350;
        if (dEl) { selectGdacs(dEl.getAttribute('data-gdacs')); }
        else if (cEl) { selectCountry(cEl.getAttribute('data-country')); }
        else if (qEl) { selectQuake(qEl.getAttribute('data-quake')); }
      } else {
        suppressClickUntil = Date.now() + 350;
      }
    }
    drag = null;
  }

  function detailHtml(q) {
    var tsu = window.NDLocale.text(q.tsunami ? 'Yes' : 'No',lang());
    var mmi = q.mmi == null ? '—' : String(q.mmi);
    var alertBadge = q.alert ? '<span class="galert ' + esc(q.alert) + '">' + esc(String(q.alert).toUpperCase()) + '</span>' : '';
    var actions = [
      window.NDLocale.phrase('趴下、掩护、抓牢；远离窗户与外墙。','Drop, Cover and Hold On; stay away from windows and outer walls.',lang()),
      window.NDLocale.phrase('强震后如身处海岸，立即向高处转移。','If near the coast after strong shaking, move to high ground immediately.',lang()),
      window.NDLocale.phrase('关注当地应急部门与海啸预警。','Follow local emergency authorities and tsunami warnings.',lang()),
      window.NDLocale.phrase('检查燃气、电力与建筑结构，谨防余震。','Check gas, power and structural damage; expect aftershocks.',lang())
    ];
    return '<div class="gdetail">' + window.NDRescue.button(state.country || q.place, q.place, lang()) +
      '<div class="gdetail-top"><div><div class="gkicker">' + esc(web('quakeDetail')) + '</div>' +
        '<h3>' + esc(q.place || '—') + '</h3><div class="gcoords">' + esc(q.lon.toFixed(2)) + '°, ' + esc(q.lat.toFixed(2)) + '°</div></div>' +
        '<div class="gmag" style="color:' + magColor(q.mag) + '">M' + esc(q.mag.toFixed(1)) + '</div></div>' +
      '<div class="gcards">' +
        '<div><span>' + esc(web('depth')) + '</span><b>' + esc(isFinite(q.depth) ? q.depth.toFixed(1) + ' km' : '—') + '</b></div>' +
        '<div><span>' + esc(web('intensity')) + ' (MMI)' + '</span><b>' + esc(mmi) + '</b></div>' +
        '<div><span>' + esc(web('tsunami')) + '</span><b>' + esc(tsu) + '</b></div>' +
      '</div>' +
      '<div class="grows">' +
        '<div><span>' + esc(web('issued')) + '</span><b>' + esc(fmt(q.time)) + '</b></div>' +
        '<div><span>' + esc(web('sourceLabel')) + '</span><b>' + esc(q.source) + '</b></div>' +
        '<div><span>Significance</span><b>' + esc(q.significance == null ? '—' : q.significance) + '</b></div>' +
        '<div><span>Alert</span><b>' + (alertBadge || '—') + '</b></div>' +
      '</div>' +
      '<div class="gactions"><b>' + esc(web('recommended')) + '</b><ul>' + actions.map(function (a) { return '<li>' + esc(window.NDLocale.text(a,lang())) + '</li>'; }).join('') + '</ul></div>' +
      (q.url ? '<a class="btn btn-outline" href="' + esc(q.url) + '" target="_blank" rel="noopener noreferrer">' + esc(window.NDLocale.text('USGS event',lang())) + ' ↗</a>' : '') +
      '</div>';
  }

  function gdacsDetailHtml(g) {
    var typeLabel = gdacsTypeLabel(g.type);
    var alertLabel = gdacsAlertLabel(g.alert);
    var zh = lang() === 'zh';
    var actions = {
      WF: zh ? ['远离火场与浓烟，关闭门窗。', '听从当地疏散指令，准备随时撤离。', '关注空气质量与官方火情通报。'] : ['Stay away from the fire and smoke; keep windows closed.', 'Follow local evacuation orders and be ready to leave.', 'Monitor air quality and official fire updates.'],
      FL: zh ? ['立即转移到高处，不要穿越积水。', '远离河道、山谷与地下空间。', '关注当地洪水与降雨预警。'] : ['Move to high ground immediately; never cross flood water.', 'Stay away from rivers, valleys and underground spaces.', 'Monitor local flood and rainfall warnings.'],
      TC: zh ? ['留在坚固建筑内，远离窗户。', '固定室外物品，准备停电与断水。', '听从当地疏散与避难指令。'] : ['Shelter in a sturdy building, away from windows.', 'Secure outdoor items and prepare for power/water outages.', 'Follow local evacuation and shelter instructions.'],
      DR: zh ? ['节约用水，优先保障饮用与卫生。', '关注当地限水与农业援助政策。', '防范高温与粮食短缺的次生影响。'] : ['Conserve water for drinking and sanitation.', 'Follow local water restrictions and agricultural aid programs.', 'Watch for heat and food-security impacts.']
    }[g.type] || [];
    return '<div class="gdetail gdacs-detail">' + (!GdacsStatus.fresh(g.status, Date.now()) ? '<p class="history-notice">' + window.NDLocale.phrase('上次报告 · 等待 GDACS 更新','Last reported · awaiting GDACS refresh',lang()) + '</p>' : '') + window.NDRescue.button(g.country, g.name, lang()) +
      '<div class="gdetail-top"><div><div class="gkicker">GDACS · ' + esc(typeLabel) + '</div>' +
        '<h3>' + esc(g.name || '—') + '</h3><div class="gcoords">' + esc(g.country || '') + ' · ' + esc(g.lon.toFixed(2)) + '°, ' + esc(g.lat.toFixed(2)) + '°</div></div>' +
        '<div class="gdacs-badge" style="color:' + gdacsAlertColor(g.alert) + '">' + esc(alertLabel) + '</div></div>' +
      '<div class="gcards">' +
        '<div><span>' + esc(web('disasterType')) + '</span><b>' + esc(typeLabel) + '</b></div>' +
        '<div><span>' + esc(web('gdacsAlert')) + '</span><b>' + esc(alertLabel) + '</b></div>' +
        '<div><span>' + esc(web('countryLabel')) + '</span><b>' + esc(g.country || '—') + '</b></div>' +
      '</div>' +
      '<div class="grows">' +
        '<div><span>' + esc(web('gdacsFrom')) + '</span><b>' + esc(fmt(gdacsMs(g))) + '</b></div>' +
        '<div><span>' + esc(web('gdacsTo')) + '</span><b>' + esc(fmt(gdacsParse(g.to))) + '</b></div>' +
        '<div><span>' + esc(web('gdacsUpdated')) + '</span><b>' + esc(fmt(gdacsParse(g.modified))) + '</b></div>' +
        '<div><span>' + esc(web('sourceLabel')) + '</span><b>' + esc(g.source) + '</b></div>' +
        (g.severity ? '<div><span>' + esc(window.NDLocale.text('Severity',lang())) + '</span><b>' + esc(g.severity) + '</b></div>' : '') +
      '</div>' +
      (g.description ? '<p class="rescue-type">' + esc(window.NDLocale.text('Original source text',lang())) + '</p><p class="gdacs-desc">' + esc(g.description) + '</p>' : '') +
      (actions.length ? '<div class="gactions"><b>' + esc(web('recommended')) + '</b><ul>' + actions.map(function (a) { return '<li>' + esc(window.NDLocale.text(a,lang())) + '</li>'; }).join('') + '</ul></div>' : '') +
      (g.url ? '<a class="btn btn-outline" href="' + esc(g.url) + '" target="_blank" rel="noopener noreferrer">' + esc(web('gdacsReport')) + ' ↗</a>' : '') +
      '</div>';
  }

  function eventTime(e) { return e.kind === 'gdacs' ? gdacsMs(e) : (Number(e.time) || 0); }
  function quakeItem(q) {
    return '<button type="button" class="gitem" data-quake="' + esc(q.id) + '"><b style="color:' + magColor(q.mag) + '">M' + q.mag.toFixed(1) + '</b><span>' + esc(q.place) + '</span><small>' + esc(fmt(q.time)) + '</small></button>';
  }
  function gdacsItem(g) {
    return '<button type="button" class="gitem gitem-gdacs" data-gdacs="' + esc(g.id) + '"><b style="color:' + gdacsColor(g.type) + '">' + esc(g.type) + '</b><span>' + esc(g.name) + '</span><small>' + esc(gdacsAlertLabel(g.alert)) + ' · ' + esc(fmt(gdacsMs(g))) + '</small></button>';
  }

  function sideHtml(quakes) {
    if (state.selected) {
      return state.selected.kind === 'gdacs' ? gdacsDetailHtml(state.selected) : detailHtml(state.selected);
    }
    var qs = (state.country ? quakesInCountry(quakes) : quakes).slice().sort(function (a, b) { return (b.time || 0) - (a.time || 0); }).slice(0, 8);
    var gs = (state.country ? gdacsInCountry() : currentGdacs()).slice().sort(function (a, b) { return gdacsMs(b) - gdacsMs(a); });
    var showQuakes = state.gdacsType === 'all' || state.gdacsType === 'EQ';
    var showGdacs = state.layers.gdacs && state.gdacsType !== 'EQ';
    var title = state.country || web('gdacsEvents');
    var sub = state.country ? hazardTypeLabel(state.gdacsType) + ' · ' + (qs.length + gs.length) :
      (state.gdacsType === 'EQ' ? web('earthquakeType') :
        (state.gdacsType === 'all' ? (showGdacs ? 'GDACS + ' + web(state.mode === 'history' ? 'quakeRecords' : 'activeQuakes') : web(state.mode === 'history' ? 'quakeRecords' : 'activeQuakes')) : hazardTypeLabel(state.gdacsType)));
    var html = window.NDRescue.button(state.country || '', '', lang()) + '<div class="gside-head"><h3>' + esc(title) + '</h3><span>' + esc(sub) + '</span></div><div class="glist">';
    if (showGdacs) {
      html += '<div class="glist-label">' + esc(web('gdacsEvents')) + ' · ' + gs.length + '</div>' +
        (gs.length ? gs.map(gdacsItem).join('') : '<div class="ops-empty">' + esc(web('noMatch')) + '</div>');
    }
    if (showQuakes) {
      html += '<div class="glist-label">' + esc(web(state.mode === 'history' ? 'quakeRecords' : 'activeQuakes')) + ' · ' + qs.length + '</div>' +
        (qs.length ? qs.map(quakeItem).join('') : '<div class="ops-empty">' + esc(web('noMatch')) + '</div>');
    }
    return html + '</div>';
  }

  function rescueSection() {
    var region = state.country || (state.selected && (state.selected.country || state.selected.place)) || '';
    return '<section class="rescue-section"><h2>' + (window.NDLocale.phrase('地区救援联系','Regional rescue contacts',lang())) + '</h2><p>' +
      (window.NDLocale.phrase('按国家查询已收录的救援机构及官方联系目录。','Search listed rescue organizations and official directories by country.',lang())) + '</p>' +
      '<form data-rescue-form><label>' + (window.NDLocale.phrase('国家或地区','Country or region',lang())) +
      '<input type="search" name="region" value="' + esc(region) + '" placeholder="' + esc(window.NDLocale.phrase('中国、秘鲁…','China, Peru…',lang())) + '"></label>' +
      '<button class="btn btn-outline" type="submit">' + (window.NDLocale.phrase('搜索救援联系','Search rescue contacts',lang())) + '</button></form></section>';
  }
  function paint() {
    if (state.ctx && !state.ctx.embedded && (location.hash || '#/home').split('?')[0] !== '#/global') return;
    if (state.mode === 'live' && state.selected && state.selected.kind === 'gdacs' &&
        !GdacsStatus.active(state.selected.status, Date.now())) { state.selected = null; }
    var el = state.el;
    if (!el) { return; }
    if (state.fullscreen) { exitFullscreen(); }
    if (state.loading) {
      el.innerHTML = '<section class="global-page"><div class="container"><div class="global-head"><div><div class="eyebrow">GLOBAL DISASTER MONITOR</div><h1>' + esc(web('globalTitle')) + '</h1><p>' + esc(web('globalSub')) + '</p></div></div><div class="state-box"><div class="spinner"></div>' + esc(web('live')) + '…</div></div></section>';
      return;
    }
    if (state.error && (!state.live || (state.mode === 'history' && !state.history))) {
      el.innerHTML = '<section class="global-page"><div class="container"><div class="state-box error">' + esc(state.error) + '</div></div></section>';
      return;
    }
    var data = state.mode === 'live' ? state.live : state.history;
    if (!data) { return; }
    var quakes = filteredQuakes(currentQuakes());
    el.innerHTML = '<section class="global-page"><div class="container">' +
      header(data, quakes) +
      (Date.now() - gdacsParse(cache.gdacsRaw && (cache.gdacsRaw.checkedAt || cache.gdacsRaw.generatedAt)) >= 1800000 ? '<p class="history-notice" role="status">' + (window.NDLocale.phrase('GDACS 更新已延迟。虚线标记为上次报告的位置，当前状态尚未确认；这不代表灾害已结束。','GDACS updates are overdue. Dashed markers show last-reported locations; current status is unconfirmed. A delayed update does not mean the disasters have ended.',lang())) + '</p>' : '') +
      '<div class="global-layout"><div class="global-map-wrap">' + mapSvg(quakes) +
        '<div class="gzoom">' +
          '<button type="button" data-g="zoom" data-v="in" aria-label="' + esc(web('zoomIn')) + '" title="' + esc(web('zoomIn')) + '">+</button>' +
          '<button type="button" data-g="zoom" data-v="out" aria-label="' + esc(web('zoomOut')) + '" title="' + esc(web('zoomOut')) + '">−</button>' +
          '<button type="button" data-g="zoom" data-v="reset" aria-label="' + esc(web('resetView')) + '" title="' + esc(web('resetView')) + '">⟲</button>' +
          '<button type="button" data-g="zoom" data-v="fullscreen" aria-label="' + esc(web('fullscreen')) + '" title="' + esc(web('fullscreen')) + '">⛶</button>' +
        '</div>' +
        '<div class="gzoom-hint">' + esc(web('zoomHint')) + '</div>' +
        ((state.gdacsType === 'all' || state.gdacsType === 'EQ') ? '<div class="glegend"><span>M&lt;4</span><span>M4</span><span>M5</span><span>M6</span><span>M7+</span></div>' : '') +
        ((state.layers.gdacs && state.gdacsType !== 'EQ') ? '<div class="gdacs-legend"><span class="wf">WF</span><span class="fl">FL</span><span class="tc">TC</span><span class="dr">DR</span></div>' : '') +
      '</div><aside class="global-side"><nav class="disaster-list-actions" aria-label="' + (window.NDLocale.phrase('灾害列表','Disaster lists',lang())) + '"><a class="btn btn-green" href="#/disasters?mode=' + state.mode + '">' + (state.mode === 'live' ? (window.NDLocale.phrase('查看全部当前灾害','View all live disasters',lang())) : (window.NDLocale.phrase('查看灾害历史','Browse disaster history',lang()))) + ' →</a></nav>' + sideHtml(quakes) + '</aside></div>' +
      rescueSection() +
      '<p class="global-foot">' + esc(web('globalNote')) + '</p>' +
      '<p class="global-foot global-credits">' + esc(web('credits')) + ': ' +
        '<a href="https://www.gdacs.org" target="_blank" rel="noopener noreferrer">GDACS</a> (EU JRC / UN OCHA) · ' +
        '<a href="https://apizero.cn" target="_blank" rel="noopener noreferrer">极数本源 apizero.cn</a> · ' +
        '<a href="https://earthquake.usgs.gov" target="_blank" rel="noopener noreferrer">USGS</a> · ' +
        '<a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noopener noreferrer">NASA GIBS</a> · ' +
        '<a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">Open-Meteo</a>' +
      '</p>' +
      '</div></section>';
    if (window.NDUnits) window.NDUnits.enhance(el);
    state.ctx.explainView && state.ctx.explainView();
    wms.key = '';
    applyView();
    syncSideHeight();
  }

  function onClick(e) {
    if (Date.now() < suppressClickUntil) { return; }
    var g = e.target.closest('[data-g]');
    if (g) {
      var k = g.getAttribute('data-g'), v = g.getAttribute('data-v');
      if (k === 'zoom') {
        if (v === 'in') { zoomAt(W / 2, H / 2, 1.6); }
        else if (v === 'out') { zoomAt(W / 2, H / 2, 1 / 1.6); }
        else if (v === 'fullscreen') {
          var wrap = state.el.querySelector('.global-map-wrap');
          if (wrap) {
            var on = wrap.classList.toggle('gfull');
            state.fullscreen = on;
            document.body.classList.toggle('gmap-lock', on);
            setTimeout(applyView, 60);
          }
        } else { state.zoom = 1; state.panX = 0; state.panY = 0; applyView(); }
        return;
      }
      if (k === 'mode' && v && v !== state.mode) {
        state.mode = v; state.selected = null; state.country = null;
        if (v === 'history') { state.gdacsType = 'all'; state.gdacsAlert = 'all'; }
        if (v === 'history' && !state.history) {
          state.loading = true; paint();
          Promise.all([
            fetchJson('public-data/global-quakes-recent.json'),
            fetchJson('public-data/gdacs-disaster-history.json').catch(function () { return null; })
          ]).then(function (res) {
            cache.history = res[0];
            state.history = res[0];
            if (res[1]) { cache.gdacsHistory = normalizeGdacs(res[1]); }
            state.loading = false;
            paint();
          }).catch(function (err) { state.loading = false; state.error = String(err); paint(); });
        } else { paint(); }
        return;
      }
      if (k === 'hmin') { state.hmin = parseFloat(v); state.selected = null; paint(); return; }
      if (k === 'historyrange') { state.historyRange = v; state.selected = null; paint(); return; }
      if (k === 'layer') {
        state.layers[v] = !state.layers[v];
        if (v === 'gdacs' && !state.layers[v]) {
          state.gdacsType = 'all';
          state.gdacsAlert = 'all';
          state.selected = null;
        }
        paint();
        return;
      }
      return;
    }
    var d = e.target.closest('[data-gdacs]');
    if (d) {
      selectGdacs(d.getAttribute('data-gdacs'));
      return;
    }
    var q = e.target.closest('[data-quake]');
    if (q) {
      selectQuake(q.getAttribute('data-quake'));
      return;
    }
    var c = e.target.closest('[data-country]');
    if (c) {
      selectCountry(c.getAttribute('data-country'));
    }
  }

  function onChange(e) {
    var s = e.target.closest('[data-g="country-select"]');
    if (s) {
      state.country = s.value || null;
      state.selected = null;
      if (s.value) {
        var entry = (cache.paths || []).filter(function (p) { return p.name === s.value; })[0];
        zoomToCountry(entry);
      } else {
        state.zoom = 1;
        state.panX = 0;
        state.panY = 0;
      }
      paint();
    }
    var gt = e.target.closest('[data-g="gdacstype"]');
    if (gt) { state.gdacsType = gt.value || 'all'; state.selected = null; paint(); }
    var ga = e.target.closest('[data-g="gdacsalert"]');
    if (ga) { state.gdacsAlert = ga.value || 'all'; state.selected = null; paint(); }
  }

  function refreshData() {
    var path = (location.hash || '#/home').split('?')[0];
    if (path !== '#/global' && path !== '#/home') { return; }
    if (!state.el || !state.el.isConnected || !state.el.querySelector('.global-section')) { return; }
    Promise.all([
      fetchJson('public-data/global-earthquakes.json').catch(function () { return null; }),
      fetchJson('public-data/gdacs-events.json').catch(function () { return null; })
    ]).then(function (res) {
      if (res[0]) { state.live = res[0]; cache.live = res[0]; }
      if (res[1]) { cache.gdacsRaw = res[1]; cache.gdacs = normalizeGdacs(res[1]); }
      paint();
    }).catch(function () {});
  }

  function render(viewEl, ctx) {
    if (state.el && state.el !== viewEl && state.el.__ndGlobalBound) {
      state.el.removeEventListener('click', onClick);
      state.el.removeEventListener('change', onChange);
      state.el.removeEventListener('wheel', onWheel);
      state.el.removeEventListener('pointerdown', onPointerDown);
      state.el.__ndGlobalBound = false;
    }
    state.el = viewEl;
    state.ctx = ctx;
    var requestedMode = new URLSearchParams((location.hash || '').split('?')[1] || '').get('mode');
    if ((requestedMode === 'live' || requestedMode === 'history') && requestedMode !== state.mode) {
      state.mode = requestedMode; state.selected = null; state.country = null; state.gdacsType = 'all'; state.gdacsAlert = 'all';
    }
    state.loading = !state.live || !cache.paths || (state.mode === 'history' && !state.history);
    state.error = '';
    if (!viewEl.__ndGlobalBound) {
      viewEl.addEventListener('click', onClick);
      viewEl.addEventListener('change', onChange);
      viewEl.addEventListener('wheel', onWheel, { passive: false });
      viewEl.addEventListener('pointerdown', onPointerDown);
      viewEl.__ndGlobalBound = true;
    }
    if (!bound) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') { return; }
        var full = state.el && state.el.querySelector('.global-map-wrap.gfull');
        if (full) {
          exitFullscreen();
          applyView();
        }
      });
      window.addEventListener('hashchange', function () {
        if ((location.hash || '').split('?')[0] !== '#/global') { exitFullscreen(); }
      });
      window.addEventListener('resize', syncSideHeight);
      window.setInterval(function () {
        if (!state.el || !state.el.isConnected || document.hidden) { return; }
        refreshData();
      }, 60 * 1000);
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) { refreshData(); }
      });
      bound = true;
    }
    if (!ctx.embedded) { document.title = ctx.web('globalTitle'); }
    paint();
    Promise.all([
      state.live ? Promise.resolve(state.live) : fetchJson('public-data/global-earthquakes.json'),
      ensureGeo(),
      state.mode === 'history' && !state.history ? Promise.all([
        fetchJson('public-data/global-quakes-recent.json'), fetchJson('public-data/gdacs-disaster-history.json')
      ]) : Promise.resolve(null)
    ]).then(function(res) {
      state.live = res[0]; cache.live = res[0];
      if(res[2]) { state.history = res[2][0]; cache.history = res[2][0]; cache.gdacsHistory = normalizeGdacs(res[2][1]); }
      state.loading = false; paint();
    }).catch(function(err) { state.loading = false; state.error = String(err.message || err); paint(); });
  }

  window.NDGlobal = {
    render: render,
    loadLive: function () { return cache.live ? Promise.resolve(cache.live) : fetchJson('public-data/global-earthquakes.json').then(function (d) { cache.live = d; return d; }); },
    cached: function () { return cache.live; },
    history: function () { return cache.history; }
  };
})();