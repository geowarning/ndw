/* ================================================================
 * charts.js —— 极简原生 Canvas 图表（全息风格）
 * donut 环形图 / bars 柱状图 / line 折线图
 * ================================================================ */
(function () {
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function setup(canvas) {
    var parent = canvas.parentElement;
    var w = parent.clientWidth || 320;
    var h = parseInt(canvas.getAttribute('data-h') || '200', 10);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  var HOLO = '#43e8cf';
  var GRID = 'rgba(120, 200, 190, 0.14)';
  var TEXT = '#8fa6bb';

  /* ---------- 环形图 ---------- */
  function donut(canvas, data) {
    var s = setup(canvas), ctx = s.ctx, w = s.w, h = s.h;
    var total = data.reduce(function (a, d) { return a + d.value; }, 0);
    var cx = h / 2 + 10, cy = h / 2, r = h / 2 - 18, ir = r * 0.62;
    if (total === 0) {
      ctx.strokeStyle = GRID;
      ctx.lineWidth = 10;
      ctx.beginPath(); ctx.arc(cx, cy, (r + ir) / 2, 0, Math.PI * 2); ctx.stroke();
    } else {
      var a0 = -Math.PI / 2;
      data.forEach(function (d) {
        var a1 = a0 + d.value / total * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, a0, a1);
        ctx.arc(cx, cy, ir, a1, a0, true);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();
        a0 = a1;
      });
      ctx.fillStyle = '#e9edf3';
      ctx.font = '700 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(total), cx, cy + 2);
      ctx.fillStyle = TEXT;
      ctx.font = '11px sans-serif';
      ctx.fillText('TOTAL', cx, cy + 18);
    }
    /* 图例 */
    var lx = h + 24, ly = h / 2 - data.length * 11;
    ctx.textAlign = 'left';
    data.forEach(function (d) {
      ctx.fillStyle = d.color;
      ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = TEXT;
      ctx.font = '11px sans-serif';
      ctx.fillText(d.label + '  ' + d.value, lx + 10, ly + 4);
      ly += 22;
    });
  }

  /* ---------- 柱状图 ---------- */
  function bars(canvas, data) {
    var s = setup(canvas), ctx = s.ctx, w = s.w, h = s.h;
    var pad = { l: 30, r: 10, t: 16, b: 26 };
    var iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    var max = Math.max(1, Math.max.apply(null, data.map(function (d) { return d.value; })));
    /* 网格 */
    ctx.strokeStyle = GRID; ctx.fillStyle = TEXT; ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (var i = 0; i <= 4; i++) {
      var y = pad.t + ih - ih * i / 4;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.fillText(Math.round(max * i / 4), pad.l - 6, y + 3);
    }
    var bw = iw / data.length * 0.55;
    data.forEach(function (d, i) {
      var bx = pad.l + iw * (i + 0.5) / data.length - bw / 2;
      var bh = ih * d.value / max;
      var by = pad.t + ih - bh;
      ctx.fillStyle = d.color || HOLO;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, [3, 3, 0, 0]) : ctx.rect(bx, by, bw, bh);
      ctx.fill();
      ctx.fillStyle = TEXT;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, bx + bw / 2, h - 8);
    });
  }

  /* ---------- 折线图 ---------- */
  function line(canvas, labels, values, color) {
    var s = setup(canvas), ctx = s.ctx, w = s.w, h = s.h;
    var pad = { l: 30, r: 12, t: 16, b: 26 };
    var iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    var max = Math.max(1, Math.max.apply(null, values));
    ctx.strokeStyle = GRID; ctx.fillStyle = TEXT; ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (var i = 0; i <= 4; i++) {
      var y = pad.t + ih - ih * i / 4;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.fillText(Math.round(max * i / 4), pad.l - 6, y + 3);
    }
    var pts = values.map(function (v, i) {
      return {
        x: pad.l + (values.length === 1 ? iw / 2 : iw * i / (values.length - 1)),
        y: pad.t + ih - ih * v / max
      };
    });
    /* 面积 */
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pad.t + ih);
    pts.forEach(function (p) { ctx.lineTo(p.x, p.y); });
    ctx.lineTo(pts[pts.length - 1].x, pad.t + ih);
    ctx.closePath();
    var grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ih);
    grad.addColorStop(0, color || HOLO);
    grad.addColorStop(1, 'rgba(67,232,207,0.02)');
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.globalAlpha = 1;
    /* 线 */
    ctx.strokeStyle = color || HOLO;
    ctx.lineWidth = 2;
    ctx.beginPath();
    pts.forEach(function (p, i) { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
    ctx.stroke();
    pts.forEach(function (p) {
      ctx.fillStyle = '#0a0f12';
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = color || HOLO;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.stroke();
    });
    /* x 标签（稀疏） */
    ctx.fillStyle = TEXT;
    ctx.textAlign = 'center';
    var stepL = Math.ceil(labels.length / 6);
    labels.forEach(function (lb, i) {
      if (i % stepL === 0 || i === labels.length - 1) {
        ctx.fillText(lb, pts[i].x, h - 8);
      }
    });
  }

  window.__modules['charts'] = { donut: donut, bars: bars, line: line };
})();
