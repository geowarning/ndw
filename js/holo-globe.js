/* ================================================================
 * holo-globe.js —— 全息点阵地球（科幻全息投影风格）
 * Canvas 全屏背景：线框经纬网 + 大陆点阵 + Fibonacci 点阵
 *  + 虚拟网络节点/连线/流光 + 自然灾害小动画 + 城市脉冲标记
 * 交互：拖拽旋转 / 滚轮缩放 / 自动旋转
 * ================================================================ */
(function () {
  var DEG = Math.PI / 180;

  function HoloGlobe(canvas, opts) {
    opts = opts || {};
    var cv = canvas;
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, cx = 0, cy = 0, R = 0;

    /* 状态 */
    var rotY = -110 * DEG;         /* 初始朝向东亚 */
    var tilt = 20 * DEG;           /* 地轴倾角 */
    var autoSpin = 0.00035;
    var zoom = 1;
    var dragging = false;
    var lastX = 0, lastY = 0;
    var paused = false;
    var dirty = true;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var resizeObserver = window.ResizeObserver ? new ResizeObserver(resize) : null;
    var observedHero = null;

    /* 颜色 */
    var COL = {
      grid: 'rgba(157, 175, 163, 0.55)',
      gridBack: 'rgba(157, 175, 163, 0.14)',
      dot: 'rgba(150, 178, 164, 0.34)',
      dotDim: 'rgba(118, 138, 128, 0.12)',
      ring: 'rgba(142, 158, 147, 0.3)',
      cityBase: '#7e929d',
      land: 'rgba(190, 246, 224, 1)',
      link: 'rgba(160, 236, 210, 0.92)',
      node: 'rgba(214, 252, 238, 1)',
      nodePulse: 'rgba(226, 255, 244, 1)',
      quake: 'rgba(255, 128, 128, 0.95)',
      typhoon: 'rgba(206, 232, 255, 0.9)',
      storm: 'rgba(198, 228, 255, 0.95)',
      fire: 'rgba(255, 178, 118, 0.95)',
      flood: 'rgba(140, 200, 255, 0.9)'
    };

    /* Fibonacci 点阵 */
    var N = 460;
    var points = [];
    (function buildDots() {
      var ga = Math.PI * (3 - Math.sqrt(5));
      for (var i = 0; i < N; i++) {
        var y = 1 - (i / (N - 1)) * 2;
        var r = Math.sqrt(Math.max(0, 1 - y * y));
        var theta = ga * i;
        points.push({ x: Math.cos(theta) * r, y: y, z: Math.sin(theta) * r });
      }
    })();

    /* 大陆点阵：由 js/globe-land.js 预生成的 [lng,lat] 列表 */
    var landPoints = [];
    (function buildLand() {
      var src = window.GLOBE_LAND;
      if (!src) { return; }
      for (var i = 0; i < src.length; i++) {
        var phi = src[i][1] * DEG;
        var lam = src[i][0] * DEG;
        landPoints.push({
          x: Math.cos(phi) * Math.sin(lam),
          y: -Math.sin(phi),
          z: Math.cos(phi) * Math.cos(lam)
        });
      }
    })();

    /* 城市标记（外部注入） */
    var cities = [];
    function setCities(list) {
      dirty = true;
      cities = (list || []).map(function (c) {
        var phi = c.lat * DEG;
        var lam = c.lng * DEG;
        return {
          x: Math.cos(phi) * Math.sin(lam),
          y: -Math.sin(phi),
          z: Math.cos(phi) * Math.cos(lam),
          color: c.color || COL.cityBase,
          level: c.level || '',
          label: c.label || '',
          adcode: c.adcode || ''
        };
      });
    }

    /* 虚拟网络节点（全球主要城市） */
    var nodeData = [
      { lng: 116.4, lat: 39.9 }, { lng: 121.5, lat: 31.2 }, { lng: 139.7, lat: 35.7 },
      { lng: 100.5, lat: 13.8 }, { lng: 77.2, lat: 28.6 }, { lng: 55.3, lat: 25.2 },
      { lng: 37.6, lat: 55.8 }, { lng: 28.0, lat: 41.0 }, { lng: 12.5, lat: 41.9 },
      { lng: 2.35, lat: 48.85 }, { lng: -0.13, lat: 51.5 }, { lng: -74.0, lat: 40.7 },
      { lng: -122.4, lat: 37.8 }, { lng: -87.6, lat: 41.9 }, { lng: -43.2, lat: -22.9 },
      { lng: 151.2, lat: -33.9 }, { lng: 28.0, lat: -26.2 }, { lng: 31.2, lat: 30.0 }
    ];
    var nodeVec = nodeData.map(function (n) { return ll(n.lng, n.lat); });
    var LINKS = (function () {
      var seen = {}, out = [];
      function add(a, b) {
        if (a === b) { return; }
        var k = a < b ? a + ':' + b : b + ':' + a;
        if (seen[k]) { return; }
        seen[k] = 1; out.push([a, b]);
      }
      nodeVec.forEach(function (v, i) {
        var cand = [];
        nodeVec.forEach(function (w, j) {
          if (i === j) { return; }
          var dx = v.x - w.x, dy = v.y - w.y, dz = v.z - w.z;
          cand.push([dx * dx + dy * dy + dz * dz, j]);
        });
        cand.sort(function (p, q) { return p[0] - q[0]; });
        add(i, cand[0][1]);
        add(i, cand[1][1]);
      });
      return out;
    })();

    /* 小型自然灾害动画点（地震/台风/暴雨/山火/洪水） */
    var disasterData = [
      { lng: 141.5, lat: 38.3, type: 'quake' },
      { lng: 124.0, lat: 13.0, type: 'typhoon' },
      { lng: -90.0, lat: 35.0, type: 'storm' },
      { lng: 140.0, lat: -25.0, type: 'fire' },
      { lng: -71.0, lat: -30.0, type: 'quake' },
      { lng: 106.0, lat: -7.0, type: 'flood' }
    ];
    var disasterVec = disasterData.map(function (d) {
      return { type: d.type, p: ll(d.lng, d.lat) };
    });

    function resize() {
      var hero = cv.closest('.hero');
      if (hero && resizeObserver && hero !== observedHero) {
        resizeObserver.disconnect();
        resizeObserver.observe(hero);
        observedHero = hero;
      }
      W = hero ? hero.clientWidth : window.innerWidth;
      H = hero ? hero.clientHeight : window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W * 0.72;
      cy = H * 0.48;
      R = Math.min(H * 0.46, W * 0.32) * zoom;
      if (W < 900) { cx = W * 0.85; cy = H * 0.4; R = Math.min(H * 0.4, W * 0.64) * zoom; }
      dirty = true;
    }

    /* 球面点 → 屏幕（先绕 Y 旋转，再绕 X 倾斜） */
    function project(x, y, z) {
      var cosR = Math.cos(rotY), sinR = Math.sin(rotY);
      var x1 = x * cosR + z * sinR;
      var z1 = -x * sinR + z * cosR;
      var y1 = y;
      var cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      var y2 = y1 * cosT - z1 * sinT;
      var z2 = y1 * sinT + z1 * cosT;
      return {
        sx: cx + x1 * R,
        sy: cy + y2 * R,
        depth: z2
      };
    }

    /* 经纬度（度）→ 球面单位坐标 */
    function ll(lngDeg, latDeg) {
      var phi = latDeg * DEG, lam = lngDeg * DEG;
      return { x: Math.cos(phi) * Math.sin(lam), y: -Math.sin(phi), z: Math.cos(phi) * Math.cos(lam) };
    }

    /* 单位向量球面大圆插值 */
    function slerp(a, b, t) {
      var dot = a.x * b.x + a.y * b.y + a.z * b.z;
      dot = Math.max(-1, Math.min(1, dot));
      var omega = Math.acos(dot);
      if (omega < 1e-4) { return { x: a.x, y: a.y, z: a.z }; }
      var so = Math.sin(omega);
      var w1 = Math.sin((1 - t) * omega) / so;
      var w2 = Math.sin(t * omega) / so;
      return { x: a.x * w1 + b.x * w2, y: a.y * w1 + b.y * w2, z: a.z * w1 + b.z * w2 };
    }

    /* 大陆点阵 */
    function drawLand() {
      if (!landPoints.length) { return; }
      for (var i = 0; i < landPoints.length; i++) {
        var p = landPoints[i];
        var pr = project(p.x, p.y, p.z);
        if (pr.depth < -0.25) { continue; }
        var t = (pr.depth + 1) / 2;
        var sz = 1.6 + t * 1.8;
        ctx.globalAlpha = 0.3 + t * 0.62;
        ctx.fillStyle = COL.land;
        ctx.fillRect(pr.sx - sz / 2, pr.sy - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
    }

    /* 虚拟网络：连线 + 节点 + 流光 */
    function drawNetwork(time) {
      var k, s, a, b, u, pr, prev, t;

      /* 连线光晕（宽柔边） */
      ctx.strokeStyle = COL.link;
      ctx.lineWidth = 3;
      for (k = 0; k < LINKS.length; k++) {
        a = nodeVec[LINKS[k][0]];
        b = nodeVec[LINKS[k][1]];
        prev = null;
        for (s = 0; s <= 22; s++) {
          u = slerp(a, b, s / 22);
          pr = project(u.x, u.y, u.z);
          if (prev && pr.depth > 0.02 && prev.depth > 0.02) {
            t = (pr.depth + 0.04) / 1.04;
            ctx.globalAlpha = 0.04 + t * 0.1;
            ctx.beginPath();
            ctx.moveTo(prev.sx, prev.sy);
            ctx.lineTo(pr.sx, pr.sy);
            ctx.stroke();
          }
          prev = pr;
        }
      }

      /* 连线主线 */
      ctx.lineWidth = 1.05;
      for (k = 0; k < LINKS.length; k++) {
        a = nodeVec[LINKS[k][0]];
        b = nodeVec[LINKS[k][1]];
        prev = null;
        for (s = 0; s <= 22; s++) {
          u = slerp(a, b, s / 22);
          pr = project(u.x, u.y, u.z);
          if (prev && pr.depth > -0.04 && prev.depth > -0.04) {
            t = (pr.depth + 0.04) / 1.04;
            ctx.globalAlpha = 0.2 + t * 0.5;
            ctx.beginPath();
            ctx.moveTo(prev.sx, prev.sy);
            ctx.lineTo(pr.sx, pr.sy);
            ctx.stroke();
          }
          prev = pr;
        }
      }

      /* 沿线的流光 */
      ctx.fillStyle = COL.nodePulse;
      for (k = 0; k < LINKS.length; k++) {
        a = nodeVec[LINKS[k][0]];
        b = nodeVec[LINKS[k][1]];
        u = slerp(a, b, ((time / 6 + k * 0.37) % 1));
        pr = project(u.x, u.y, u.z);
        if (pr.depth < 0.02) { continue; }
        ctx.globalAlpha = 0.62 + pr.depth * 0.4;
        ctx.beginPath();
        ctx.arc(pr.sx, pr.sy, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }

      /* 节点：柔光 + 环 + 芯点 */
      for (k = 0; k < nodeVec.length; k++) {
        var v = nodeVec[k];
        pr = project(v.x, v.y, v.z);
        if (pr.depth < -0.04) { continue; }
        t = (pr.depth + 0.04) / 1.04;
        ctx.fillStyle = COL.node;
        ctx.globalAlpha = 0.05 + t * 0.08;
        ctx.beginPath();
        ctx.arc(pr.sx, pr.sy, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.3 + t * 0.45;
        ctx.strokeStyle = COL.node;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pr.sx, pr.sy, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.55 + t * 0.45;
        ctx.beginPath();
        ctx.arc(pr.sx, pr.sy, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    /* 小型自然灾害动画 */
    function drawDisasters(time) {
      for (var i = 0; i < disasterVec.length; i++) {
        var d = disasterVec[i];
        var pr = project(d.p.x, d.p.y, d.p.z);
        if (pr.depth < 0.03) { continue; }
        var front = (pr.depth + 1) / 2;
        var alpha = 0.2 + front * 0.8;
        ctx.save();
        ctx.globalAlpha = alpha;
        if (d.type === 'quake') {
          var phase = (time * 0.65 + i * 0.35) % 1;
          for (var r = 0; r < 3; r++) {
            var p2 = (phase + r / 3) % 1;
            ctx.globalAlpha = alpha * (1 - p2) * 0.9;
            ctx.strokeStyle = COL.quake;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.arc(pr.sx, pr.sy, 2.5 + p2 * 18, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else if (d.type === 'typhoon') {
          var rot = time * 1.5;
          ctx.strokeStyle = COL.typhoon;
          ctx.lineWidth = 1.1;
          for (var arm = 0; arm < 3; arm++) {
            ctx.beginPath();
            for (var q = 0; q <= 18; q++) {
              var tt = q / 18;
              var ang = rot + arm * 2.0944 + tt * 3.4;
              var rad = 1.8 + tt * 13;
              var x = pr.sx + Math.cos(ang) * rad;
              var y = pr.sy + Math.sin(ang) * rad * 0.9;
              if (q === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
            }
            ctx.stroke();
          }
        } else if (d.type === 'storm') {
          var flick = Math.sin(time * 9 + i) + Math.sin(time * 13.7 + i * 2);
          ctx.globalAlpha = alpha * (flick > 0.4 ? 1 : 0.4);
          ctx.strokeStyle = COL.storm;
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.moveTo(pr.sx, pr.sy - 11);
          ctx.lineTo(pr.sx - 3.5, pr.sy - 2.5);
          ctx.lineTo(pr.sx + 1.2, pr.sy - 2.5);
          ctx.lineTo(pr.sx - 4.8, pr.sy + 10);
          ctx.stroke();
        } else if (d.type === 'fire') {
          var fb = (Math.sin(time * 5 + i) + 1) / 2;
          ctx.globalAlpha = alpha * (0.45 + fb * 0.55);
          ctx.fillStyle = COL.fire;
          ctx.beginPath();
          ctx.arc(pr.sx, pr.sy, 2.2 + fb * 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = alpha * (0.2 + fb * 0.35);
          ctx.strokeStyle = COL.fire;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.arc(pr.sx, pr.sy, 6 + fb * 5, 0, Math.PI * 2);
          ctx.stroke();
        } else if (d.type === 'flood') {
          var fp = (time * 0.55 + i * 0.5) % 1;
          ctx.globalAlpha = alpha * (1 - fp) * 0.9;
          ctx.strokeStyle = COL.flood;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pr.sx, pr.sy, 2.5 + fp * 16, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    function drawGlobe() {
      ctx.clearRect(0, 0, W, H);
      var time = reducedMotion.matches || paused || document.documentElement.classList.contains('reduce-motion') ? 0 : Date.now() / 1000;

      /* 地面光晕环（全息投影底座） */
      ctx.save();
      ctx.strokeStyle = COL.ring;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy + R * 1.05, R * 1.05, R * 0.16, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = COL.gridBack;
      ctx.beginPath();
      ctx.ellipse(cx, cy + R * 1.05, R * 1.28, R * 0.2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      /* 外球轮廓 */
      ctx.save();
      ctx.strokeStyle = COL.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      /* 经纬网（采样折线，按深度分前后） */
      drawGrid();

      /* 大陆点阵 */
      drawLand();

      /* 点阵 */
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var pr = project(p.x, p.y, p.z);
        var t = (pr.depth + 1) / 2; /* 0 后 → 1 前 */
        if (pr.depth < -0.15) {
          ctx.fillStyle = COL.dotDim;
          ctx.globalAlpha = 0.22;
        } else {
          ctx.fillStyle = COL.dot;
          ctx.globalAlpha = 0.12 + t * 0.3;
        }
        var sz = 0.6 + t * 0.9;
        ctx.fillRect(pr.sx - sz / 2, pr.sy - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;

      /* 虚拟网络与灾害动画 */
      drawNetwork(time);
      drawDisasters(time);

      /* 城市脉冲 */
      cities.forEach(function (c) {
        var pp = project(c.x, c.y, c.z);
        if (pp.depth < 0.05) { return; }
        var front = (pp.depth + 1) / 2;
        var pulse = (Math.sin(time * 2.6 + c.x * 4) + 1) / 2;
        var rr2 = 3.5 + pulse * 3.5;
        ctx.save();
        ctx.globalAlpha = 0.55 + front * 0.45;
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(pp.sx, pp.sy, rr2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.arc(pp.sx, pp.sy, 2.6 + front * 1.6, 0, Math.PI * 2);
        ctx.fill();
        /* The decorative background leaves labels to the interactive map. */
        ctx.restore();
      });

      /* 扫描光（旋转扇形高光） */
      var scanA = (time * 0.5) % (Math.PI * 2);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(scanA);
      var grad = ctx.createLinearGradient(0, 0, R, 0);
      grad.addColorStop(0, 'rgba(134,149,138,0.05)');
      grad.addColorStop(1, 'rgba(134,149,138,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, -0.25, 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawGrid() {
      ctx.lineWidth = 0.8;
      /* 纬线 */
      for (var lat = -60; lat <= 60; lat += 30) {
        drawTrack(function (lng) { return ll(lng, lat); }, 0, 360, 48);
      }
      /* 经线 */
      for (var lng = 0; lng < 180; lng += 30) {
        drawTrack(function (la) { return ll(lng, la); }, -90, 90, 40);
        drawTrack(function (la) { return ll(lng + 180, la); }, -90, 90, 40);
      }
    }

    /* 沿参数轨迹分段画线：前半球亮、后半球暗 */
    function drawTrack(fn, from, to, steps) {
      var prev = null;
      for (var i = 0; i <= steps; i++) {
        var v = from + (to - from) * (i / steps);
        var u = fn(v);
        var pr = project(u.x, u.y, u.z);
        if (prev) {
          var front = (pr.depth + prev.depth) / 2 > 0;
          ctx.strokeStyle = front ? COL.grid : COL.gridBack;
          ctx.beginPath();
          ctx.moveTo(prev.sx, prev.sy);
          ctx.lineTo(pr.sx, pr.sy);
          ctx.stroke();
        }
        prev = pr;
      }
    }

    var raf = null;
    function loop() {
      var still = paused || reducedMotion.matches || document.documentElement.classList.contains('reduce-motion');
      if (cv.isConnected && cv.clientWidth && !document.hidden) {
        if (!dragging && !still) rotY += autoSpin;
        if (dirty || !still) drawGlobe();
        dirty = false;
      }
      raf = requestAnimationFrame(loop);
    }

    /* ---- 交互：拖拽 ---- */
    function onDown(x, y) { dragging = true; lastX = x; lastY = y; }
    function onMove(x, y) {
      if (!dragging) { return; }
      rotY += (x - lastX) * 0.006;
      tilt += (y - lastY) * 0.004;
      tilt = Math.max(-1.2, Math.min(1.2, tilt));
      lastX = x; lastY = y;
    }
    function onUp() { dragging = false; }

    cv.addEventListener('mousedown', function (e) { onDown(e.clientX, e.clientY); });
    window.addEventListener('mousemove', function (e) { onMove(e.clientX, e.clientY); });
    window.addEventListener('mouseup', onUp);
    cv.addEventListener('touchstart', function (e) {
      if (e.touches[0]) { onDown(e.touches[0].clientX, e.touches[0].clientY); }
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (e.touches[0]) { onMove(e.touches[0].clientX, e.touches[0].clientY); }
    }, { passive: true });
    window.addEventListener('touchend', onUp);
    cv.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoom *= e.deltaY > 0 ? 0.95 : 1.05;
      zoom = Math.max(0.7, Math.min(1.6, zoom));
      resize();
    }, { passive: false });

    window.addEventListener('resize', resize);
    reducedMotion.addEventListener('change', function () { dirty = true; });

    resize();
    loop();

    return {
      setCities: setCities,
      resize: resize,
      setPaused: function (b) { paused = b; dirty = true; }
    };
  }

  window.__modules['holo-globe'] = { create: HoloGlobe };
})();
