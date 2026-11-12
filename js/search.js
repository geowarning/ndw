/* 顶部全局搜索：页面 / 防御指南 / 工具 / 设置 / 产品 / 城市 */
(function () {
  window.NDSearch = {
    create: function (ctx) {
      var esc = ctx.esc;
      var overlay = null;
      var input = null;
      var listEl = null;
      var entries = [];
      var filtered = [];
      var active = 0;

      function buildIndex() {
        var l = ctx.lang();
        var t = ctx.T(l);
        var i18n = ctx.i18n;
        var out = [];
        function add(label, sub, run, kw) {
          out.push({
            label: label || '',
            sub: sub || '',
            run: run,
            kw: ((label || '') + ' ' + (sub || '') + ' ' + (kw || '')).toLowerCase()
          });
        }

        add(t.tabIndex, ctx.web('overviewTitle'), function () { ctx.navigate('#/home'); }, 'home index overview 首页 总览 预警');
        add(t.nationalSituation, ctx.web('expandMap'), function () { ctx.navigate('#/map'); }, 'map national 地图 全国 态势');
        add(t.tabGuide, t.tabGuide, function () { ctx.navigate('#/guide'); }, 'guide disaster 指南 防御 灾害');
        add(t.tabTools, t.footerTools || t.tabTools, function () { ctx.navigate('#/tools'); }, 'tools emergency 工具 应急 急救');
        add(t.productsTitle, t.productsTitle, function () { ctx.navigate('#/products'); }, 'products games 产品 游戏');
        add(t.tabSettings, t.tabSettings, function () { ctx.navigate('#/settings'); }, 'settings config 设置 配置');

        ctx.data.getGuides().forEach(function (c, i) {
          var name = i18n.disasterName(c.name, l);
          add(name, t.tabGuide, function () { ctx.openGuide(i); }, c.name + ' warning 预警 ' + name);
        });

        [
          [t.firstAid, 'first aid cpr 急救 心肺复苏'],
          [t.emergencyPhone, 'phone call 电话 12121'],
          [t.materialList, 'materials checklist 物资 清单'],
          [t.evacuationTips, 'evacuation tips 避险 要点']
        ].forEach(function (row) {
          if (!row[0]) { return; }
          add(row[0], t.tabTools, function () { ctx.navigate('#/tools'); }, row[1]);
        });

        [
          [t.language, 'language 语言'],
          [t.accessibility, 'accessibility 辅助 功能'],
          [t.notifications, 'notifications alerts 提醒 通知'],
          [t.dataSource, 'source api 数据 来源'],
          [t.cache, 'cache 缓存'],
          [t.about, 'about 关于']
        ].forEach(function (row) {
          if (!row[0]) { return; }
          add(row[0], t.tabSettings, function () { ctx.navigate('#/settings'); }, row[1]);
        });

        add(t.gameAquaName, t.productsTitle, function () { ctx.openProduct('aqua'); }, 'aqua water rescue 水上 救援 游戏');
        add(t.gamePyroName, t.productsTitle, function () { ctx.openProduct('pyro'); }, 'pyro forest patrol 森林 巡逻 游戏');

        ctx.districts.allCityGeo().forEach(function (c) {
          var name = i18n.placeName(c.name, l);
          var prov = i18n.placeName(c.province, l);
          add(name, prov, function () { ctx.selectCity(c); }, c.name + ' ' + c.province + ' city 城市');
        });

        return out;
      }

      function renderList() {
        var q = input.value.trim().toLowerCase();
        var tokens = q ? q.split(/\s+/) : [];
        filtered = q
          ? entries.filter(function (e) {
              return tokens.every(function (tk) { return e.kw.indexOf(tk) >= 0; });
            })
          : entries.slice(0, 8);
        if (q && !filtered.length) {
          listEl.innerHTML = '<div class="search-empty">' + esc(ctx.web('searchEmpty')) + '</div>';
          return;
        }
        filtered = filtered.slice(0, 16);
        active = Math.max(0, Math.min(active, filtered.length - 1));
        listEl.innerHTML = filtered.map(function (e, i) {
          return '<button type="button" class="search-item' + (i === active ? ' active' : '') + '" data-i="' + i + '">' +
            '<span class="search-item-label">' + esc(e.label) + '</span>' +
            '<span class="search-item-sub">' + esc(e.sub) + '</span>' +
            '</button>';
        }).join('');
        Array.prototype.forEach.call(listEl.querySelectorAll('.search-item'), function (btn) {
          btn.addEventListener('click', function () {
            choose(parseInt(btn.getAttribute('data-i'), 10));
          });
        });
      }

      function choose(i) {
        var entry = filtered[i];
        if (!entry) { return; }
        close();
        entry.run();
      }

      function onKey(e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          close();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          active = Math.min(active + 1, filtered.length - 1);
          renderList();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          active = Math.max(active - 1, 0);
          renderList();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          choose(active);
        }
      }

      function open() {
        if (overlay) {
          input.focus();
          return;
        }
        entries = buildIndex();
        active = 0;
        overlay = document.createElement('div');
        overlay.className = 'search-overlay';
        overlay.innerHTML =
          '<div class="search-dialog" role="dialog" aria-modal="true" aria-label="' + esc(ctx.web('searchTitle')) + '">' +
            '<div class="search-bar">' + ctx.SVG.iSearch +
              '<input class="search-input" id="ndSearchInput" type="search" autocomplete="off" spellcheck="false" placeholder="' + esc(ctx.web('searchPlaceholder')) + '">' +
              '<span class="search-hint">Esc</span>' +
            '</div>' +
            '<div class="search-list" id="ndSearchList"></div>' +
          '</div>';
        document.body.appendChild(overlay);
        input = overlay.querySelector('#ndSearchInput');
        listEl = overlay.querySelector('#ndSearchList');
        overlay.addEventListener('click', function (e) {
          if (e.target === overlay) { close(); }
        });
        input.addEventListener('input', function () {
          active = 0;
          renderList();
        });
        input.addEventListener('keydown', onKey);
        renderList();
        setTimeout(function () { if (input) { input.focus(); } }, 0);
      }

      function close() {
        if (overlay && overlay.parentNode) { overlay.parentNode.removeChild(overlay); }
        overlay = null;
        input = null;
        listEl = null;
        entries = [];
        filtered = [];
        active = 0;
      }

      window.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
          e.preventDefault();
          open();
        }
      });

      return { open: open, close: close, isOpen: function () { return !!overlay; } };
    }
  };
})();
