/* 全球灾害监测：卫星底图 + 实时/历史地震 + 影响圈 + 国家筛选 + 图层 */
(function () {
  var W = 1000, H = 500;
  var state = {
    mode: 'live', hmin: 4.5, selected: null, country: null,
    layers: { affected: true, population: false, evacuation: false, infrastructure: false, nightlights: false },
    loading: true, error: '', live: null, history: null, el: null, ctx: null,
    zoom: 1, panX: 0, panY: 0, nasaDay: '001'
  };
  var cache = { live: null, history: null, countries: null, cities: null, paths: null, tiles: null };
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
      cache.tiles ? Promise.resolve(cache.tiles) : fetchJson('assets/nasa-tiles/index.json')
    ]).then(function (res) {
      cache.countries = res[0];
      cache.cities = res[1];
      cache.tiles = res[2];
      if (cache.paths) { return; }
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
        (state.layers.nightlights && cache.tiles ? '<span class="gfl">NASA</span><select data-g="nasaday" aria-label="NASA VNP46A2">' + cache.tiles.days.map(function (d) {
          return '<option value="' + d.id + '"' + (state.nasaDay === d.id ? ' selected' : '') + '>' + esc(d.date) + '</option>';
        }).join('') + '</select>' : '') +
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
    parts.push('<g id="gmapViewport" transform="translate(' + state.panX + ' ' + state.panY + ') scale(' + state.zoom + ')">');
    parts.push('<image id="gmapBase" href="assets/world-satellite.jpg" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none"></image>');
    parts.push('<image id="gmapHi" href="" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none" style="display:none"></image>');
    parts.push('<image id="gmapWms" href="" x="0" y="0" width="0" height="0" preserveAspectRatio="none" style="display:none"></image>');
    parts.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="transparent"></rect>');
    if (state.layers.nightlights) {
      var day = null;
      if (cache.tiles && cache.tiles.days && cache.tiles.days.length) {
        day = cache.tiles.days.filter(function (d) { return d.id === state.nasaDay; })[0] || cache.tiles.days[0];
      }
      if (day) {
        day.tiles.forEach(function (t) {
          var p1 = proj(t.west, t.north), p2 = proj(t.east, t.south);
          parts.push('<image href="assets/nasa-tiles/' + t.file + '" x="' + p1.x.toFixed(2) + '" y="' + p1.y.toFixed(2) + '" width="' + (p2.x - p1.x).toFixed(2) + '" height="' + (p2.y - p1.y).toFixed(2) + '" preserveAspectRatio="none" opacity=".92"></image>');
        });
      } else {
        var x1 = proj(70, 60).x, x2 = proj(80, 10).x, y1 = proj(70, 60).y, y2 = proj(80, 10).y;
        parts.push('<image href="assets/nasa-nightlights-eastasia.jpg" x="' + x1.toFixed(1) + '" y="' + y1.toFixed(1) + '" width="' + (x2 - x1).toFixed(1) + '" height="' + (y2 - y1).toFixed(1) + '" preserveAspectRatio="none" opacity=".9"></image>');
      }
    }
    parts.push('<g class="gcountries">');
    (cache.paths || []).forEach(function (p) {
      var hit = state.layers.affected && countryHit(p.name, quakes);
      var cls = 'gcountry' + (hit ? ' hit' : '') + (state.country === p.name ? ' sel' : '');
      parts.push('<path class="' + cls + '" d="' + p.d + '" data-country="' + esc(p.name) + '"><title>' + esc(p.name) + '</title></path>');
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
    if (state.layers.evacuation && state.selected) {
      var s = state.selected;
      var sp = proj(s.lon, s.lat);
      [100, 200].forEach(function (km) {
        parts.push('<circle cx="' + sp.x.toFixed(1) + '" cy="' + sp.y.toFixed(1) + '" r="' + kmToUnits(km).toFixed(1) + '" fill="none" stroke="#7ef0ff" stroke-width="1" stroke-dasharray="4 4" opacity=".8"></circle>');
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
  function zoomAt(px, py, factor) {
    var z = Math.max(1, Math.min(96, state.zoom * factor));
    if (Math.abs(z - state.zoom) < 0.001) { return; }
    var k = z / state.zoom;
    state.panX = px - (px - state.panX) * k;
    state.panY = py - (py - state.panY) * k;
    state.zoom = z;
    clampPan();
    applyView();
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
    if (e.button != null && e.button !== 0) { return; }
    if (e.target.closest('.gzoom,[data-quake]')) { return; }
    var map = e.target.closest('.gmap');
    if (!map) { return; }
    var r = map.getBoundingClientRect();
    drag = { x: e.clientX, y: e.clientY, px: state.panX, py: state.panY, w: r.width, h: r.height, moved: false };
    try { map.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  }
  function onPointerMove(e) {
    if (!drag) { return; }
    if (!drag.w || !drag.h) { return; }
    var dx = (e.clientX - drag.x) / drag.w * W;
    var dy = (e.clientY - drag.y) / drag.h * H;
    if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 4) { drag.moved = true; }
    if (state.zoom <= 1) { return; }
    state.panX = drag.px + dx;
    state.panY = drag.py + dy;
    clampPan();
    applyView();
  }
  function onPointerUp() {
    if (drag && drag.moved) { suppressClickUntil = Date.now() + 350; }
    drag = null;
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
        '<div class="gzoom">' +
          '<button type="button" data-g="zoom" data-v="in" aria-label="' + esc(web('zoomIn')) + '" title="' + esc(web('zoomIn')) + '">+</button>' +
          '<button type="button" data-g="zoom" data-v="out" aria-label="' + esc(web('zoomOut')) + '" title="' + esc(web('zoomOut')) + '">−</button>' +
          '<button type="button" data-g="zoom" data-v="reset" aria-label="' + esc(web('resetView')) + '" title="' + esc(web('resetView')) + '">⟲</button>' +
        '</div>' +
        '<div class="gzoom-hint">' + esc(web('zoomHint')) + '</div>' +
        '<div class="glegend"><span>M&lt;4</span><span>M4</span><span>M5</span><span>M6</span><span>M7+</span></div>' +
      '</div><aside class="global-side">' + sideHtml(quakes) + '</aside></div>' +
      '<p class="global-foot">' + esc(web('globalNote')) + ' · CnOpenData · NASA VNP46A2 原始瓦片 2400×2400</p>' +
      '</div></section>';
    state.ctx.explainView && state.ctx.explainView();
    wms.key = '';
    applyView();
  }

  function onClick(e) {
    if (Date.now() < suppressClickUntil) { return; }
    var g = e.target.closest('[data-g]');
    if (g) {
      var k = g.getAttribute('data-g'), v = g.getAttribute('data-v');
      if (k === 'zoom') {
        if (v === 'in') { zoomAt(W / 2, H / 2, 1.6); }
        else if (v === 'out') { zoomAt(W / 2, H / 2, 1 / 1.6); }
        else { state.zoom = 1; state.panX = 0; state.panY = 0; applyView(); }
        return;
      }
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
    var d = e.target.closest('[data-g="nasaday"]');
    if (d) { state.nasaDay = d.value; paint(); }
  }

  function render(viewEl, ctx) {
    state.el = viewEl;
    state.ctx = ctx;
    state.loading = !state.live;
    state.error = '';
    if (!bound) {
      viewEl.addEventListener('click', onClick);
      viewEl.addEventListener('change', onChange);
      viewEl.addEventListener('wheel', onWheel, { passive: false });
      viewEl.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
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
