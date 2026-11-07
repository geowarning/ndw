/* ================================================================
 * china-holo.js —— 全息中国轮廓态势图（SVG）
 * 国界实线 + 省界虚线 + 城市脉冲点；点击城市切换；状态外部注入
 * ================================================================ */
(function () {
  var W = 1000, H = 780;
  var LNG0 = 72, LNG1 = 136, LAT0 = 17, LAT1 = 55;

  function X(lng) { return (lng - LNG0) / (LNG1 - LNG0) * W; }
  function Y(lat) { return (LAT1 - lat) / (LAT1 - LAT0) * H; }

  function ringPath(ring) {
    var d = '';
    for (var i = 0; i < ring.length; i++) {
      var x = X(ring[i][0]).toFixed(1), y = Y(ring[i][1]).toFixed(1);
      d += (i === 0 ? 'M' : 'L') + x + ' ' + y + ' ';
    }
    return d + 'Z';
  }

  function geomPaths(geom) {
    var d = '';
    if (geom.type === 'Polygon') {
      geom.coordinates.forEach(function (r) { d += ringPath(r); });
    } else if (geom.type === 'MultiPolygon') {
      geom.coordinates.forEach(function (poly) {
        poly.forEach(function (r) { d += ringPath(r); });
      });
    }
    return d;
  }

  function ChinaHolo(container, onClickCity, onInspectCity) {
    var geo = window.__modules['china-geo'];
    var distMod = window.__modules['districts'];
    var cities = distMod.allCityGeo();

    var nationalD = '';
    geo.national.features.forEach(function (f) { nationalD += geomPaths(f.geometry); });
    var provinceD = '';
    geo.provinces.features.forEach(function (f) { provinceD += geomPaths(f.geometry); });

    var cityNodes = '';
    cities.forEach(function (c) {
      var x = X(c.lng).toFixed(1), y = Y(c.lat).toFixed(1);
      var label = window.__modules['i18n'].placeName(c.name, window.__modules['i18n'].getLang()).replace(/市$/, '');
      cityNodes +=
        '<g class="ch-city"' + (onClickCity ? ' role="button" tabindex="0" aria-label="' + label + '"' : '') + ' data-city="' + c.adcode + '" data-name="' + c.name + '">' +
        '<circle class="ch-hit" cx="' + x + '" cy="' + y + '" r="12" fill="transparent"/>' +
        '<circle class="ch-halo" cx="' + x + '" cy="' + y + '" r="9"/>' +
        '<circle class="ch-dot" cx="' + x + '" cy="' + y + '" r="3.2"/>' +
        '<text class="ch-label" x="' + (parseFloat(x) + 7) + '" y="' + (parseFloat(y) - 6) + '">' + label + '</text>' +
        '</g>';
    });

    container.innerHTML =
      '<svg class="china-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">' +
      '<defs>' +
      '<filter id="holoGlow" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feGaussianBlur stdDeviation="2.4" result="b"/>' +
      '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      '<linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#43ffd8" stop-opacity="0.14"/>' +
      '<stop offset="1" stop-color="#43ffd8" stop-opacity="0"/>' +
      '</linearGradient>' +
      '<clipPath id="chinaClip"><path d="' + nationalD + '"/></clipPath>' +
      '</defs>'

      + '<path class="ch-national" d="' + nationalD + '"/>'
      + '<path class="ch-provinces" d="' + provinceD + '"/>'

      /* 扫描线（裁剪到国界内） */
      + '<g clip-path="url(#chinaClip)">' +
        '<rect class="ch-scan" x="0" y="-120" width="' + W + '" height="120" fill="url(#scanGrad)"/>' +
        '<g class="ch-gridlines"></g>' +
      '</g>'

      + cityNodes +
      '</svg>';

    var svg = container.querySelector('.china-svg');

    /* 经纬网格线（裁剪区内可见） */
    var gl = container.querySelector('.ch-gridlines');
    var gld = '';
    for (var lng = 80; lng <= 130; lng += 10) {
      gld += '<line x1="' + X(lng).toFixed(1) + '" y1="0" x2="' + X(lng).toFixed(1) + '" y2="' + H + '"/>';
    }
    for (var lat = 20; lat <= 50; lat += 10) {
      gld += '<line x1="0" y1="' + Y(lat).toFixed(1) + '" x2="' + W + '" y2="' + Y(lat).toFixed(1) + '"/>';
    }
    gl.innerHTML = gld;

    svg.addEventListener('click', function (e) {
      var g = e.target.closest('.ch-city');
      if (g && onClickCity) { onClickCity(g.getAttribute('data-city'), g.getAttribute('data-name')); }
    });
    svg.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') { return; }
      var city = e.target.closest('.ch-city');
      if (city && onClickCity) {
        e.preventDefault();
        onClickCity(city.getAttribute('data-city'), city.getAttribute('data-name'));
      }
    });
    ['pointerover', 'focusin'].forEach(function (event) {
      svg.addEventListener(event, function (e) {
        var city = e.target.closest('.ch-city');
        if (city && onInspectCity) onInspectCity(city.getAttribute('data-city'));
      });
    });

    function layoutLabels(map) {
      var nodes = Array.from(svg.querySelectorAll('.ch-city'));
      nodes.sort(function (a, b) {
        function priority(node) {
          var status = map[node.getAttribute('data-city')] || {};
          if (node.classList.contains('is-selected')) return 3;
          if (status.unavailable || window.__modules.reliability.freshness(status.checkedAt) !== 'available') return 0;
          return status.high ? 2 : status.count > 0 ? 1 : 0;
        }
        return priority(b) - priority(a);
      });
      var visible = window.__modules.reliability.visibleLabels(nodes.map(function (node) { return node.querySelector('.ch-label').getBBox(); }));
      nodes.forEach(function (node, index) { node.classList.toggle('label-hidden', !visible[index]); });
    }

    function setStatus(map) {
      map = map || {};
      cities.forEach(function (c) {
        var node = svg.querySelector('.ch-city[data-city="' + c.adcode + '"]');
        if (!node) { return; }
        node.classList.remove('st-none', 'st-safe', 'st-normal', 'st-high');
        var s = map[c.adcode];
        var reliability = window.__modules.reliability;
        var state = reliability.freshness(s && s.checkedAt);
        if (state === 'available' && (s.unavailable || navigator.onLine === false)) state = 'unavailable';
        var description = reliability.text(state, window.__modules.i18n.getLang()) + '. ' + reliability.checkedAt(s && s.checkedAt, window.__modules.i18n.getLang());
        var tooltip = node.querySelector('title');
        if (!tooltip) { tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'title'); node.prepend(tooltip); }
        tooltip.textContent = window.__modules.i18n.placeName(c.name, window.__modules.i18n.getLang()) + ' — ' + description;
        if (onClickCity) node.setAttribute('aria-label', tooltip.textContent);
        if (!s || state !== 'available') { node.classList.add('st-none'); }
        else if (s.high) { node.classList.add('st-high'); }
        else if (s.count > 0) { node.classList.add('st-normal'); }
        else { node.classList.add('st-safe'); }
      });
      layoutLabels(map);
    }

    function setAlertLabels(names) {
      /* names: {adcode: shortText} —— 预警城市显示标签 */
      svg.querySelectorAll('.ch-city').forEach(function (g) {
        var lab = g.querySelector('.ch-label');
        var ad = g.getAttribute('data-city');
        if (names && names[ad]) {
          lab.textContent = names[ad];
          lab.classList.add('is-alert');
        } else {
          var nm = window.__modules['i18n'].placeName(g.getAttribute('data-name'), window.__modules['i18n'].getLang()).replace(/市$/, '');
          lab.textContent = nm;
          lab.classList.remove('is-alert');
        }
      });
    }

    return { setStatus: setStatus, setAlertLabels: setAlertLabels };
  }

  window.__modules['china-holo'] = { create: ChinaHolo };
})();
