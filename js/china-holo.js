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

  function ChinaHolo(container, onClickCity) {
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
        '<g class="ch-city" data-city="' + c.adcode + '" data-name="' + c.name + '">' +
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

    function setStatus(map) {
      map = map || {};
      cities.forEach(function (c) {
        var node = svg.querySelector('.ch-city[data-city="' + c.adcode + '"]');
        if (!node) { return; }
        node.classList.remove('st-none', 'st-normal', 'st-high');
        var s = map[c.adcode];
        if (!s) { node.classList.add('st-none'); }
        else if (s.high) { node.classList.add('st-high'); }
        else { node.classList.add('st-normal'); }
      });
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
