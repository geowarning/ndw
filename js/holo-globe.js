/* ================================================================
 * holo-globe.js —— 全息点阵地球（科幻全息投影风格）
 * Canvas 全屏背景：线框经纬网 + Fibonacci 点阵 + 城市脉冲标记
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
    var rotY = 0;                 /* 经度旋转 */
    var tilt = 20 * DEG;           /* 地轴倾角 */
    var autoSpin = 0.0011;
    var zoom = 1;
    var dragging = false;
    var lastX = 0, lastY = 0;
    var paused = false;

    /* 颜色 */
    var COL = {
      grid: 'rgba(63, 224, 196, 0.16)',
      gridBack: 'rgba(63, 224, 196, 0.05)',
      dot: 'rgba(120, 255, 226, 0.75)',
      dotDim: 'rgba(90, 200, 180, 0.28)',
      ring: 'rgba(63, 224, 196, 0.35)',
      cityBase: '#7dffe4'
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

    /* 城市标记（外部注入） */
    var cities = [];
    function setCities(list) {
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

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W * 0.72;
      cy = H * 0.42;
      R = Math.min(H * 0.34, W * 0.26) * zoom;
      if (W < 900) { cx = W * 0.5; cy = H * 0.3; R = Math.min(H * 0.24, W * 0.34) * zoom; }
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

    function drawGlobe() {
      ctx.clearRect(0, 0, W, H);

      /* 地面光晕环（全息投影底座） */
      ctx.save();
      ctx.strokeStyle = COL.ring;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy + R * 1.05, R * 1.05, R * 0.16, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(63,224,196,0.12)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + R * 1.05, R * 1.28, R * 0.2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      /* 外球轮廓 */
      ctx.save();
      ctx.strokeStyle = 'rgba(90, 240, 210, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      /* 经纬网（采样折线，按深度分前后） */
      drawGrid();

      /* 点阵 */
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var pr = project(p.x, p.y, p.z);
        var t = (pr.depth + 1) / 2; /* 0 后 → 1 前 */
        if (pr.depth < -0.15) {
          ctx.fillStyle = COL.dotDim;
          ctx.globalAlpha = 0.5;
        } else {
          ctx.fillStyle = COL.dot;
          ctx.globalAlpha = 0.35 + t * 0.65;
        }
        var sz = 0.8 + t * 1.3;
        ctx.fillRect(pr.sx - sz / 2, pr.sy - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;

      /* 城市脉冲 */
      var time = Date.now() / 1000;
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
        /* 标签 */
        if (c.level === 'red' || c.level === 'orange') {
          ctx.font = '600 10px sans-serif';
          ctx.fillStyle = c.color;
          ctx.fillText(c.label, pp.sx + 7, pp.sy - 6);
        }
        ctx.restore();
      });

      /* 扫描光（旋转扇形高光） */
      var scanA = (time * 0.5) % (Math.PI * 2);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(scanA);
      var grad = ctx.createLinearGradient(0, 0, R, 0);
      grad.addColorStop(0, 'rgba(110,255,224,0.10)');
      grad.addColorStop(1, 'rgba(110,255,224,0)');
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
      if (!dragging && !paused) { rotY += autoSpin; }
      drawGlobe();
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

    resize();
    loop();

    return {
      setCities: setCities,
      setPaused: function (b) { paused = b; }
    };
  }

  window.__modules['holo-globe'] = { create: HoloGlobe };
})();
