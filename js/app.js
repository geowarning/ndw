/* ================================================================
 * app.js —— 网页主控（全息预警系统 · NVIDIA 风深色科技主题）
 * hash 路由：#/home | #/map | #/detail?id= | #/guide | #/tools | #/products | #/settings
 * ================================================================ */
(function () {
  var api = __require('api');
  var i18n = __require('i18n');
  var cities = __require('cities');
  var config = __require('config');
  var risk = __require('risk');
  var data = __require('data');
  var districts = __require('districts');
  var reliability = __require('reliability');
  function safetyText(key) { return reliability.text(key, lang()); }
  function manualUpdateControl() {
    return '<div class="manual-update"><a class="btn manual-update-btn" href="https://github.com/geowarning/ndw/issues/new?template=data-update.yml" target="_blank" rel="noopener noreferrer" aria-label="' + esc(safetyText('manualUpdate') + ' (GitHub)') + '">' +
      esc(safetyText('manualUpdate')) + ' ↗</a></div>';
  }
  var explanations = __require('explanations');
  var openExplanations = new Set();

  function explainView() {
    var path = (location.hash || '#/home').split('?')[0];
    var rules = {
      '#/home': [
        ['.hero-location', 'location'], ['.home-freshness', 'refresh'], ['.stat-row', 'levels'],
        ['.local-panel .section-head', 'alerts'], ['.national-panel .section-head', 'map'],
        ['.map-meta', 'freshness'], ['.activity-panel .section-head', 'timeline'],
        ['.home-analytics > :nth-child(1) .panel-card-title', 'distribution'],
        ['.home-analytics > :nth-child(2) .panel-card-title', 'hazards'], ['.trend-panel .section-head', 'trend']
      ],
      '#/map': [['.expanded-map-heading', 'map'], ['.expanded-map-meta', 'freshness'], ['.expanded-map-heading', 'refresh']],
      '#/detail': [
        ['.detail-overview', 'detail'], ['.priority-actions .dcard-title', 'actions'],
        ['.official-notice', 'original'], ['.dcard:has(.alert-body) .dcard-title', 'impact'], ['.dcard:has(.potential-hazard) .dcard-title', 'hazards'],
        ['.dcard:has(.rec-list) .dcard-title', 'materials'], ['.dcard:has(.quiz-block, .guide-note) .dcard-title', 'quiz'],
        ['.dcard:has(#countdownBox) .dcard-title', 'expiry'], ['.detail-actions', 'sharing']
      ],
      '#/guide': [
        ['.read-progress', 'guides'], ['.signal-list', 'signals', 'before'],
        ['.guide-action-list', 'actions', 'before'], ['.rec-list', 'materials', 'before'],
        ['.quiz-block, .guide-content .guide-note', 'quiz', 'before']
      ],
      '#/tools': [
        ['.aid-tabs', 'firstAid', 'before'], ['.phone-grid', 'phones', 'before'],
        ['.wizard-card', 'packing', 'before'], ['.material-list', 'materials', 'before'],
        ['.plan-card', 'plan', 'before'], ['.tip-list', 'tips', 'before']
      ],
      '#/products': [['.page-head, .game-title', 'products']],
      '#/settings': [
        ['.set-card:has([data-action="select-lang"]) .set-card-body', 'language', 'prepend'],
        ['.set-card:has([data-action="select-scale"]) .set-card-body', 'access', 'prepend'],
        ['.set-card:has([data-action="notif-interval"]) .set-card-body', 'notifications', 'prepend'],
        ['.set-card:has([data-action="select-source"]) .set-card-body', 'source', 'prepend'],
        ['.set-card:has([data-action="clear-cache"]) .set-card-body', 'cache', 'prepend'],
        ['.set-card:has([data-action="reset-all"]) .set-card-body', 'reset', 'prepend'],
        ['.set-card:has([data-action="show-disclaimer"]) .set-card-body', 'about', 'prepend']
      ]
    };
    (rules[path] || rules['#/home']).forEach(function (rule) {
      var target = viewEl.querySelector(rule[0]);
      if (!target || viewEl.querySelector('details[data-help="' + rule[1] + '"]')) return;
      var help = document.createElement('details');
      help.className = 'context-help';
      help.dataset.help = rule[1];
      help.open = openExplanations.has(rule[1]);
      var section = target.closest('section, .set-card');
      var heading = section && section.querySelector('h1, h2, h3, .set-card-title');
      var label = explanations.label(lang());
      help.innerHTML = '<summary aria-label="' + esc(label + (heading ? ': ' + heading.textContent.trim() : '')) + '">' + esc(label) + '</summary><p>' + esc(explanations.get(rule[1], lang())) + '</p>';
      if (rule[2] === 'before') target.before(help);
      else if (rule[2] === 'prepend') target.prepend(help);
      else target.after(help);
    });
  }
  var charts = __require('charts');
  var holo = __require('holo-globe');
  __require('china-geo');

  var REGION_KEY = 'selected_region';
  var SOURCE_KEY = 'data_source_override';
  var APP_VERSION = '1.1.0';

  /* ---------- 共享工具（js/app-core.js） ---------- */
  var esc = window.NDCore.esc;
  var pad = window.NDCore.pad;
  var lang = window.NDCore.lang;
  var T = window.NDCore.T;
  var formatNow = window.NDCore.formatNow;

  /* ---------- 辅助功能 ---------- */
  var access = { textScale: '1', contrast: '0', reduceMotion: '0' };
  function loadAccess() {
    access.textScale = wx.getStorageSync('access_text_scale') || '1';
    access.contrast = wx.getStorageSync('access_contrast') || '0';
    access.reduceMotion = wx.getStorageSync('access_reduce_motion') || '0';
    applyAccess();
  }
  function applyAccess() {
    var r = document.documentElement;
    r.style.setProperty('--font-scale', access.textScale);
    r.classList.toggle('high-contrast', access.contrast === '1');
    r.classList.toggle('reduce-motion', access.reduceMotion === '1');
  }
  function setAccess(key, value) {
    var storageKey = key === 'textScale' ? 'access_text_scale'
      : key === 'contrast' ? 'access_contrast' : 'access_reduce_motion';
    wx.setStorageSync(storageKey, value);
    access[key] = value;
    applyAccess();
  }

  /* ---------- 网页版特有文案（5 语言，见 js/app-core.js） ---------- */
  var WEB = window.NDCore.WEB;
  var web = window.NDCore.web;

  /* 免责声明：把“小程序/mini program/mini-app”改为“应用/app” */
  function disclaimerText(l) {
    return i18n.t('disclaimerContent', l)
      .replace('本小程序', '本应用')
      .replace('this mini program', 'this app')
      .replace('esta mini app', 'esta app')
      .replace('cette mini-app', 'cette app')
      .replace('questa mini-app', 'questa app');
  }

  /* ---------- 内联 SVG（见 js/icons.js） ---------- */
  var SVG = window.ND_ICONS;

  /* ---------- DOM 句柄 ---------- */
  var navEl = document.getElementById('navbar');
  var viewEl = document.getElementById('view');
  var footerEl = document.getElementById('siteFooter');
  var pickerEl = document.getElementById('picker');
  /* Modal / Toast 由 js/ui.js 注册到 window.__ui */

  /* ================================================================
   * 顶部导航（右上角目录）
   * ================================================================ */
  function navItems(l) {
    return [
      { path: '/home', hash: '#/home', label: i18n.t('tabIndex', l), icon: SVG.iHome },
      { path: '/guide', hash: '#/guide', label: i18n.t('tabGuide', l), icon: SVG.iGuide },
      { path: '/tools', hash: '#/tools', label: i18n.t('tabTools', l), icon: SVG.iTools },
      { path: '/products', hash: '#/products', label: i18n.t('navProducts', l), icon: SVG.iProducts },
      { path: '/settings', hash: '#/settings', label: i18n.t('tabSettings', l), icon: SVG.iSettings }
    ];
  }

  function renderNav(activePath) {
    var l = lang();
    var items = navItems(l);
    var links = items.map(function (it) {
      return '<a class="nav-link ' + (it.path === activePath ? 'active' : '') + '" href="' + it.hash + '"' + (it.path === activePath ? ' aria-current="page"' : '') + '>' +
        it.icon + '<span>' + esc(it.label) + '</span></a>';
    }).join('');
    var brand = '<a class="brand" href="#/home">' + SVG.brand +
      '<span class="brand-name">' + esc(i18n.t('appName', l)) + '</span></a>';

    navEl.innerHTML =
      '<nav class="navbar"><div class="nav-inner">' + brand +
      '<div class="nav-links">' + links + '</div>' +
      '<button class="nav-toggle" data-action="toggle-drawer" aria-controls="navDrawer" aria-expanded="false" aria-label="' + esc(i18n.t('menu', l)) + '">' + SVG.menu + '</button>' +
      '</div></nav>' +
      '<div class="nav-drawer" id="navDrawer">' + links + '</div>';
  }

  function toggleDrawer() {
    var d = document.getElementById('navDrawer');
    if (d) {
      var expanded = d.classList.toggle('open');
      document.querySelector('.nav-toggle').setAttribute('aria-expanded', String(expanded));
    }
  }
  function closeDrawer() {
    var d = document.getElementById('navDrawer');
    if (d) {
      d.classList.remove('open');
      document.querySelector('.nav-toggle').setAttribute('aria-expanded', 'false');
    }
  }

  /* ================================================================
   * 页脚
   * ================================================================ */
  function renderFooter() {
    var l = lang();
    var t = T(l);
    var items = navItems(l);
    footerEl.innerHTML =
      '<div class="footer-grid">' +
        '<div class="footer-col">' +
          '<a class="brand" href="#/home">' + SVG.brand + '<span class="brand-name">' + esc(t.appName) + '</span></a>' +
          '<p class="footer-brand-desc">' + esc(web('overviewSubtitle')) + '</p>' +
        '</div>' +
        '<div class="footer-col"><h4>' + esc(t.tabIndex) + '</h4><ul>' +
          items.map(function (it) { return '<li><a href="' + it.hash + '">' + esc(it.label) + '</a></li>'; }).join('') +
        '</ul></div>' +
        '<div class="footer-col"><h4>' + esc(t.dataSource) + '</h4>' +
          '<p>' + esc(i18n.dataSourceName('华风爱科天气API', l)) + '</p>' +
          '<p>' + esc(i18n.dataSourceName('高德天气API', l)) + '</p>' +
        '</div>' +
        '<div class="footer-col"><h4>' + esc(t.disclaimer) + '</h4>' +
          '<ul><li><a data-action="show-disclaimer">' + esc(t.disclaimerTitle) + '</a></li></ul>' +
          '<p>' + esc(safetyText('hazardNote')) + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom"><span>' + esc(t.footerRights) + '</span><span>' + esc(t.version) + ' ' + APP_VERSION + '</span></div>';
  }

  /* ================================================================
   * 地区与区县逻辑
   * ================================================================ */
  var sessionStatus = {};   /* {adcode:{high:bool,count:n}} 本会话已查询城市 */
  var globe = null, chinaMap = null;

  var homeState = {
    province: '', city: '', adcode: '', district: '',
    weather: null, rawWeather: null, rawSource: '',
    rawAlerts: [],
    shownAlerts: [],
    levelStats: { red: 0, orange: 0, yellow: 0, blue: 0 },
    loading: true, error: '', dataSource: '', fromCache: false, lastUpdate: '', hasData: false,
    pickerVisible: false, pickerView: 'province', pickerProvince: '',
    pickerCity: null, cities: [], pickerCitiesLoading: false,
    districtList: [], districtLoading: false
  };

  function findCityAdcode(provinceName, cityName) {
    var p = cities.getProvinceByName(provinceName);
    if (!p) { return ''; }
    if (p.city === cityName) { return p.cityAdcode; }
    var ec = (p.extraCities || []).find(function (c) { return c.name === cityName; });
    return ec ? ec.adcode : '';
  }

  function currentRegion() {
    return {
      province: homeState.province,
      city: homeState.city || config.defaultCity.name,
      adcode: homeState.adcode || findCityAdcode(homeState.province, homeState.city),
      district: homeState.district || ''
    };
  }

  function calcStats(alerts) {
    var stats = { red: 0, orange: 0, yellow: 0, blue: 0 };
    alerts.forEach(function (a) {
      if (stats[a.level] !== undefined) { stats[a.level] += 1; }
    });
    return stats;
  }

  /* 从文本提取区县名 */
  function extractChips(s) {
    if (!s) { return []; }
    var out = [], m;
    var re = /([一-龥]{1,4}(?:区|县))/g;
    while ((m = re.exec(String(s)))) {
      var n = m[1];
      var si = n.lastIndexOf('市');
      if (si > -1) { n = n.slice(si + 1); }
      var lead = n.match(/^(重点关注|其中|包括|预计|位于|主要在|重点|关注|全市|及|和|点)/);
      if (lead) { n = n.slice(lead[0].length); }
      if (!n || n.length < 2 || /市区$|辖区$/.test(n)) { continue; }
      if (out.indexOf(n) < 0) { out.push(n); }
    }
    return out;
  }

  /* 预警是否影响某区县（官方未细分到区时按全市覆盖） */
  function alertAffectsDistrict(a, dname) {
    var areaHasChips = extractChips(a.area).length > 0;
    if (!areaHasChips) { return true; }
    return (a.area && a.area.indexOf(dname) >= 0) ||
           (a.focusArea && a.focusArea.indexOf(dname) >= 0);
  }

  /* 城市下各区县的状态点 */
  function districtStatuses(cityAdcode, rawAlerts) {
    return districts.getDistricts(cityAdcode).map(function (d) {
      if (!rawAlerts) { return { name: d.name, status: 'unknown', count: null }; }
      var hits = rawAlerts.filter(function (a) { return alertAffectsDistrict(a, d.name); });
      var high = hits.some(function (a) { return a.level === 'red'; });
      return { name: d.name, status: hits.length ? (high ? 'high' : 'normal') : 'none', count: hits.length };
    });
  }

  /* ---------- 趋势记录 ---------- */
  function recordTrend(adcode, count) {
    var all = wx.getStorageSync('daily_trend') || {};
    var ob = all[adcode] || {};
    var d = new Date();
    ob[pad(d.getMonth() + 1) + '-' + pad(d.getDate())] = count;
    all[adcode] = ob;
    wx.setStorageSync('daily_trend', all);
  }

  /* ---------- 全息地图/地球状态 ---------- */
  function globeCities() {
    return districts.allCityGeo().map(function (c) {
      var st = sessionStatus[c.adcode];
      var color = '#2f8a80', level = '';
      if (st && !st.unavailable && reliability.freshness(st.checkedAt) === 'available') {
        if (st.high) { color = '#ff5252'; level = 'red'; }
        else if (st.count) { color = '#f7c948'; level = 'normal'; }
        else { color = '#46c263'; level = 'safe'; }
      }
      return { lng: c.lng, lat: c.lat, color: color, level: level, label: c.name, adcode: c.adcode };
    });
  }
  function refreshMaps() {
    if (globe) { globe.setCities(globeCities()); }
    if (chinaMap) { chinaMap.setStatus(sessionStatus); }
    if (selectedMapCity && document.getElementById('cityInspection')) { inspectMapCity(selectedMapCity); }
  }

  /* ---------- 全国态势扫描（打开网站即给所有城市上色） ---------- */
  var NATIONAL_STATUS_KEY = 'national_status';
  var NATIONAL_SWEEP_TTL = 60 * 60 * 1000;   /* 全国扫描节流 60 分钟，节省每日配额 */
  var nationalSweeping = false;

  /* 先读取上次扫描快照，让所有城市立即显示颜色 */
  function hydrateNationalStatus() {
    var snap = wx.getStorageSync(NATIONAL_STATUS_KEY);
    if (snap && snap.value && typeof snap.value === 'object') {
      Object.keys(snap.value).forEach(function (ad) {
        var entry = snap.value[ad];
        if (entry.checkedAt && (!sessionStatus[ad] || entry.checkedAt > sessionStatus[ad].checkedAt)) {
          sessionStatus[ad] = entry;
        }
      });
      refreshMaps();
    }
  }

  function saveNationalStatus() {
    try {
      wx.setStorageSync(NATIONAL_STATUS_KEY, { time: Date.now(), value: sessionStatus });
    } catch (e) { /* 存储失败不影响主流程 */ }
  }

  function retainCityStatus(region) {
    var saved = api.getLastKnownCityStatus(region);
    var previous = sessionStatus[region.adcode];
    if (previous && Number.isInteger(previous.count) && previous.count >= 0 &&
        reliability.freshness(previous.checkedAt) !== 'unavailable' && (!saved || previous.checkedAt > saved.checkedAt)) saved = previous;
    sessionStatus[region.adcode] = Object.assign({}, saved || { count: null, checkedAt: null }, { unavailable: true });
  }

  /* 后台串行扫描全国城市预警（只取预警，不取天气），边扫边更新地图 */
  function sweepNationalStatus(force, notify) {
    if (nationalSweeping) { return; }
    var all = districts.allCityGeo();
    var snap = wx.getStorageSync(NATIONAL_STATUS_KEY);
    if (!force && snap && snap.time && (Date.now() - snap.time) < NATIONAL_SWEEP_TTL &&
        snap.value && all.every(function (city) { var s = snap.value[city.adcode]; return s && !s.unavailable && reliability.freshness(s.checkedAt) === 'available'; })) {
      return; /* 60 分钟内已完整扫描过 */
    }
    setScanButtonState(true);
    nationalSweeping = true;
    var previousChecks = {};
    all.forEach(function (city) { previousChecks[city.adcode] = (sessionStatus[city.adcode] || {}).checkedAt || 0; });
    var i = 0;
    function next() {
      if (i >= all.length) {
        nationalSweeping = false;
        saveNationalStatus();
        refreshMaps();
        setScanButtonState(false);
        if (notify) {
          var updated = all.filter(function (city) { return (sessionStatus[city.adcode] || {}).checkedAt > previousChecks[city.adcode]; }).length;
          wx.showToast({ title: updated ? safetyText('updatedCities').replace('{n}', updated) : safetyText('noNewChecks'), icon: 'none' });
          if (homeState.city) { loadHomeData(); }
        }
        return;
      }
      var c = all[i++];
      api.fetchAlertsOnly({ province: c.province, city: c.name, adcode: c.adcode })
        .then(function (list) {
          if (list) {
            sessionStatus[c.adcode] = {
              high: list.some(function (a) { return a.level === 'red'; }),
              count: list.length,
              checkedAt: list.fetchedAt || Date.now()
            };
            recordTrend(c.adcode, list.length);
          } else {
            retainCityStatus({ city: c.name, adcode: c.adcode });
          }
          if (i % 6 === 0 || i === all.length) {
            saveNationalStatus();
            refreshMaps();
          }
          setTimeout(next, 0);   /* 只读取共享快照，不触发上游请求 */
        });
    }
    next();
  }

  /* 地图旁扫描按钮的加载状态 */
  function setScanButtonState(loading) {
    var coverage = document.getElementById('mapCoverage');
    var info = api.getSnapshotInfo();
    if (coverage) { coverage.textContent = web('coverage') + ': ' + info.checked + ' / ' + info.total; }
    var btn = document.querySelector('[data-action="refresh-map"]');
    if (!btn) { return; }
    if (loading) {
      btn.classList.add('is-loading');
      btn.setAttribute('disabled', 'disabled');
      btn.innerHTML = '<span class="map-scan-spin"></span>' + esc(i18n.t('scanning', lang()));
    } else {
      btn.classList.remove('is-loading');
      btn.removeAttribute('disabled');
      btn.innerHTML = SVG.refresh + esc(safetyText('refreshPublished'));
    }
  }

  // Read shared snapshots periodically; these reads never call the provider.
  setInterval(function () {
    if (!document.hidden && ['#/home', '#/map'].indexOf(location.hash || '#/home') >= 0) {
      sweepNationalStatus(true);
    }
  }, 60000);

  /* ---------- 数据加载 ---------- */
  function localizeList(raw, l) {
    return raw.map(function (a) {
      return Object.assign({}, a, {
        levelName: i18n.levelName(a.level, l),
        status: i18n.t('statusActive', l),
        title: i18n.alertTitle(a.title, a.type, a.level, l),
        area: i18n.areaName(a.area, a.cityName, l),
        focusArea: i18n.areaName(a.focusArea, a.cityName, l),
        source: a.source === '气象部门' ? i18n.t('defaultSource', l) : i18n.orgName(a.source, l)
      });
    });
  }

  /* 按当前语言从原始数据派生首页展示数据（切语言时零请求重算） */
  function localizeWeather(rawW, l) {
    return rawW
      ? Object.assign({}, rawW, {
        weather: i18n.weatherName(rawW.weather, l),
        wind: i18n.windName(rawW.wind, l)
      })
      : null;
  }
  function deriveHome(l) {
    var s = homeState;
    var localized = localizeList(s.rawAlerts, l);
    var shownRaw = s.district
      ? s.rawAlerts.filter(function (a) { return alertAffectsDistrict(a, s.district); })
      : s.rawAlerts;
    var idMap = {};
    shownRaw.forEach(function (a) { idMap[a.id] = 1; });
    s.shownAlerts = localized.filter(function (a) { return idMap[a.id]; });
    s.levelStats = calcStats(shownRaw);
    s.weather = localizeWeather(s.rawWeather, l);
    s.dataSource = i18n.dataSourceName(s.rawSource, l);
  }

  var homeRequest = 0;
  function loadHomeData() {
    var requestId = ++homeRequest;
    var region = currentRegion();
    var l = lang();
    homeState.rawAlerts = [];
    homeState.rawWeather = null;
    homeState.hasData = false;
    deriveHome(l);
    homeState.adcode = region.adcode;
    api.fetchAll(region).then(function (res) {
      if (requestId !== homeRequest) { return; }
      var raw = res.alerts || [];

      homeState.rawWeather = res.weather || null;
      homeState.rawSource = res.source || '';
      homeState.rawAlerts = raw;
      deriveHome(l);

      homeState.loading = false;
      homeState.hasData = !!res.ok;
      homeState.error = res.ok ? '' : (res.error || web('dataUnavailable'));
      homeState.errorCode = res.errorCode || '';
      homeState.fromCache = !!res.fromCache;
      if (res.ok && (!res.fromCache || res.fetchedAt)) {
        homeState.lastUpdate = formatNow(res.fetchedAt);
      }

      if (res.ok) {
        sessionStatus[region.adcode] = {
          high: raw.some(function (a) { return a.level === 'red'; }),
          count: raw.length,
          checkedAt: res.fetchedAt || api.getCityFreshness(region).checkedAt
        };
      } else {
        retainCityStatus(region);
      }
      if (res.ok && region.adcode) { recordTrend(region.adcode, raw.length); }
      refreshMaps();

      if ((location.hash || '#/home').indexOf('#/home') === 0) {
        renderHome();
      }
    });
  }

  function initRegion() {
    var saved = wx.getStorageSync(REGION_KEY) || null;
    if (saved && saved.city) {
      homeState.province = saved.province || '';
      homeState.city = saved.city;
      homeState.adcode = saved.adcode || findCityAdcode(saved.province, saved.city);
      homeState.district = saved.district || '';
    } else {
      var defaultCity = config.defaultCity.name;
      var matched = cities.PROVINCES.find(function (p) {
        return p.city === defaultCity || p.name === defaultCity;
      });
      homeState.province = matched ? matched.name : '';
      homeState.city = defaultCity;
      homeState.adcode = matched ? matched.cityAdcode : '';
      homeState.district = '';
    }
    loadHomeData();
  }

  function applyRegion(r) {
    if (r.city !== homeState.city || r.province !== homeState.province) {
      homeState.lastUpdate = '';
    }
    wx.setStorageSync(REGION_KEY, r);
    homeState.province = r.province;
    homeState.city = r.city;
    homeState.adcode = r.adcode || findCityAdcode(r.province, r.city);
    homeState.district = r.district || '';
    homeState.loading = true;
    homeState.error = '';
    loadHomeData();
  }

  /* ================================================================
   * 首页（预警中心）
   * ================================================================ */
  var PALETTE = ['#e3e7df', '#a4aea0', '#8fa8b5', '#f7c948', '#ff9433', '#ff5252',
    '#b388ff', '#46c263', '#ff7eb0', '#80deea', '#dce775', '#ffab91'];

  function renderHome() {
    var l = lang();
    var t = T(l);
    var s = homeState;
    var dataReady = s.hasData && !s.loading && !s.error;
    var dataState = s.loading ? t.loading : web('dataUnavailable');
    if (!s.loading && (s.rawAlerts.length || s.rawWeather)) { deriveHome(l); }
    var displayCity = i18n.placeName(s.city, l);
    var displayProvince = s.province ? i18n.placeName(s.province, l) : '';
    var districtLabel = s.district ? i18n.districtName(s.district, l) : t.allDistricts;

    /* ---- Hero ---- */
    var tempNum = s.weather && s.weather.temp ? parseFloat(s.weather.temp) : '';
    var tempUnit = s.weather && s.weather.temp ? String(s.weather.temp).replace(/^-?[0-9.]*/, '') : '';

    var weatherCard = s.weather
      ? '<div class="weather-card">' +
          '<div class="wc-label">' + esc(t.realtimeWeather) + '</div>' +
          '<div class="weather-main">' +
            '<div class="weather-temp"><span class="h2-ic wc-ic">' + SVG.iTemp + '</span>' + esc(tempNum) + '<small>' + esc(tempUnit || '°') + '</small></div>' +
            '<div class="weather-text">' + esc(s.weather.weather) + '</div>' +
          '</div>' +
          '<div class="weather-rows">' +
            '<div class="wr-item"><span class="h2-ic wc-ic">' + SVG.iWind + '</span><b>' + esc(t.wind) + '</b>' + esc(s.weather.wind) + '</div>' +
          '</div>' +
          '<div class="wc-source">' + esc(t.cityWeatherNote) + '</div>' +
          '<div class="wc-source">' + esc(i18n.tpl('providedBy', { source: s.dataSource }, l)) + '</div>' +
        '</div>'
      : '';

    var loadingClass = s.loading ? ' is-loading' : '';
    var html =
      '<div class="home-dashboard' + loadingClass + '"><section class="hero"><div class="container">' +
        '<div class="hero-inner">' +
          '<div class="hero-left">' +
            '<div class="home-intro">' +
            '<div class="eyebrow"><span class="pulse-dot"></span>' + esc(s.dataSource || t.loading) + '</div>' +
            '<h1 class="hero-title">' + esc(web('overviewTitle')) + '</h1>' +
            '<p class="hero-sub">' + esc(web('overviewSubtitle')) + '</p></div>' +
            '<div class="home-lang">' +
              i18n.LANGUAGES.map(function (lg) {
                var shortName = lg.code === 'zh' ? '中文' : lg.code.toUpperCase();
                return '<button class="home-lang-btn' + (lg.code === l ? ' active' : '') +
                  '" data-action="select-lang" data-code="' + lg.code + '" aria-pressed="' + (lg.code === l) + '">' + esc(shortName) + '</button>';
              }).join('') +
            '</div>' +
            '<div class="hero-location">' +
              '<div class="hero-city">' + esc(displayCity) +
                '<small>' + esc(displayProvince) + '</small></div>' +
              '<button class="district-pill" data-action="open-district"><span class="status-dot status-' +
                (!dataReady ? 'unknown' : s.levelStats.red ? 'high' : s.shownAlerts.length ? 'normal' : 'none') + '" title="' + esc(dataReady ? (s.shownAlerts.length ? t.legendAlert : t.noAlerts) : dataState) + '"></span>' +
                esc(districtLabel) + ' <b>›</b></button>' +
              '<button class="btn btn-green btn-lg" data-action="open-picker"><span class="h2-ic btn-ic">' + SVG.iPin + '</span>' + esc(t.ctaChooseCity) + '</button>' +
              '<button class="btn btn-outline btn-lg icon-btn" data-action="refresh" aria-label="' + esc(t.refresh) + '">' + SVG.refresh + '</button>' +
            '</div>' +
          '</div>' +
          weatherCard +
        '</div>' +

        '<div class="stat-row">' +
          statBox('lv-red', dataReady ? s.levelStats.red : null, t.redAlert) +
          statBox('lv-orange', dataReady ? s.levelStats.orange : null, t.orangeAlert) +
          statBox('lv-yellow', dataReady ? s.levelStats.yellow : null, t.yellowAlert) +
          statBox('lv-blue', dataReady ? s.levelStats.blue : null, t.blueAlert) +
        '</div>' +
        '<p class="home-freshness" role="status">' + (!dataReady ? esc(dataState) + (s.lastUpdate ? ' · ' : '') : '') +
          (s.lastUpdate ? esc(web('lastSuccess') + s.lastUpdate) : '') + '</p>' + manualUpdateControl() +
      '</div></section>';

    /* ---- 全国全息态势图 ---- */
    var nationalPanel = '<section class="overview-panel national-panel" aria-labelledby="nationalHeading">' +
      '<div class="section-head"><h2 id="nationalHeading"><span class="h2-ic">' + SVG.iGlobe + '</span>' + esc(t.nationalSituation) + '</h2>' +
        '<button class="map-scan-btn' + (nationalSweeping ? ' is-loading' : '') + '" data-action="refresh-map"' +
        (nationalSweeping ? ' disabled' : '') + '>' +
        (nationalSweeping ? '<span class="map-scan-spin"></span>' + esc(t.scanning)
                          : SVG.refresh + esc(safetyText('refreshPublished'))) +
        '</button></div>' +
      '<div class="map-meta"><p class="map-hint">' + esc(web('expandMap')) + ' ↗</p>' +
      '<p class="map-hint" id="mapCoverage" role="status">' + esc(web('coverage')) + ': ' + api.getSnapshotInfo().checked + ' / ' + api.getSnapshotInfo().total + '</p>' +
      '</div>' +
      '<a class="map-preview-link" href="#/map" aria-label="' + esc(web('expandMap')) + '">' +
        '<div class="china-map-wrap" id="chinaMapWrap"></div>' +
      '</a>' +
      '<div class="map-legend">' +
        '<span><i class="status-dot status-none"></i>' + esc(safetyText('lastNoAlerts')) + '</span>' +
        '<span><i class="status-dot status-normal"></i>' + esc(safetyText('lastAlerts')) + '</span>' +
        '<span><i class="status-dot status-high"></i>' + esc(safetyText('lastRedAlert')) + '</span>' +
        '<span><i class="status-dot status-history"></i>' + esc(safetyText('historical')) + '</span>' +
        '<span><i class="status-dot status-unknown"></i>' + esc(web('unknown')) + '</span>' +
      '</div>' +
    '</section>';

    /* ---- 预警列表 ---- */
    html += '<div class="container"><div class="home-overview">' +
      '<section class="overview-panel local-panel" aria-labelledby="localHeading">' +
      '<div class="section-head"><h2 id="localHeading"><span class="h2-ic">' + SVG.iBell + '</span>' + esc(t.activeAlerts) + '</h2>' +
      '<span class="head-hint">' + esc(dataReady ? i18n.tpl('total', { n: s.shownAlerts.length }, l) : dataState) +
      (s.fromCache ? ' · ' + esc(t.cached) : '') +
      '</span></div>';

    if (s.error) {
      var expectedGap = s.errorCode === 'pending' || s.errorCode === 'outdated';
      html += '<div class="state-box' + (expectedGap ? '' : ' error') + '"><span class="state-icon">' + (expectedGap ? '…' : '!') + '</span>' +
        '<div>' + esc(expectedGap ? web(s.errorCode === 'pending' ? 'pendingData' : 'outdatedData') : t.fetchFailed) + '</div>' +
        '<button class="btn btn-green" data-action="refresh">' + esc(web('retryFetch')) + '</button>' +
        '<div class="source-line" style="justify-content:center">' + esc(web('snapshotHint')) + '</div></div>';
    } else if (s.loading) {
      html += '<div class="state-box"><div class="spinner"></div>' + esc(t.loading) + '</div>';
    } else if (s.shownAlerts.length === 0) {
      html += '<div class="state-box"><span class="state-icon ok-icon">✓</span>' + esc(t.noAlerts) + '</div>';
    } else {
      html += '<div class="alert-grid">' + s.shownAlerts.map(function (a) {
        return '<a class="alert-card lv-' + a.level + '" href="#/detail?id=' + encodeURIComponent(a.id) + '">' +
          '<div class="alert-card-top">' +
            '<span class="level-badge">' + esc(a.levelName) + '</span>' +
            '<span class="alert-card-type">' + esc(i18n.disasterName(a.type, l)) + '</span>' +
          '</div>' +
          '<h3>' + esc(a.title) + '</h3>' +
          '<div class="alert-card-area">' + esc(a.area) + '</div>' +
          '<span class="alert-card-cta">' + esc(t.statusActive) + ' →</span>' +
        '</a>';
      }).join('') + '</div>';
    }
    html += '</section>';

    /* ---- 预警动态时间线 ---- */
    var tlAlerts = (dataReady ? s.shownAlerts : []).slice().sort(function (a, b) {
      return String(b.time) < String(a.time) ? 1 : String(b.time) > String(a.time) ? -1 : 0;
    });
    html += '<section class="overview-panel activity-panel">' +
      '<div class="section-head"><h2><span class="h2-ic">' + SVG.iClock + '</span>' + esc(t.timeline) + '</h2></div>';
    if (tlAlerts.length) {
      html += '<ul class="timeline">' + tlAlerts.map(function (a) {
        return '<li>' +
          '<span class="tl-dot lv-' + a.level + '"></span>' +
          '<span class="tl-time">' + esc(a.time) + '</span>' +
          '<a class="tl-body" href="#/detail?id=' + encodeURIComponent(a.id) + '">' +
            '<b>' + esc(i18n.disasterName(a.type, l)) + '</b> ' + esc(a.title) +
          '</a></li>';
      }).join('') + '</ul>';
    } else {
      html += '<div class="state-box">' + esc(dataReady ? t.noTimeline : dataState) + '</div>';
    }
    html += '</section>' + nationalPanel + '</div></div>';

    /* ---- 类型分布 + TOP 风险 ---- */
    var typeCount = {}, typeOrder = [];
    var shownRaw = !dataReady ? [] : s.district
      ? s.rawAlerts.filter(function (a) { return alertAffectsDistrict(a, s.district); })
      : s.rawAlerts;
    shownRaw.forEach(function (a) {
      if (!typeCount[a.type]) { typeCount[a.type] = 0; typeOrder.push(a.type); }
      typeCount[a.type] += 1;
    });
    var donutData = typeOrder.map(function (ty, i) {
      return {
        label: i18n.disasterName(ty, l),
        value: typeCount[ty],
        color: PALETTE[i % PALETTE.length]
      };
    });

    /* TOP 次生风险 */
    var riskMap = {};
    shownRaw.forEach(function (a) {
      risk.getRisks(a).forEach(function (r) {
        if (!riskMap[r.key] || r.prob > riskMap[r.key].prob) { riskMap[r.key] = r; }
      });
    });
    var topRisks = Object.keys(riskMap).map(function (k) { return riskMap[k]; })
      .sort(function (a, b) { return b.prob - a.prob; }).slice(0, 5);

    html += '<div class="container"><div class="home-analytics">' +
      '<section class="panel-card"><h2 class="panel-card-title"><span class="h2-ic">' + SVG.iChart + '</span>' + esc(t.typeDist) + '</h2>' +
        (dataReady ? '<canvas id="typeDonut" data-h="180"></canvas>' : '<div class="state-box">' + esc(dataState) + '</div>') + '</section>' +
      '<section class="panel-card"><h2 class="panel-card-title"><span class="h2-ic">' + SVG.iWarn + '</span>' + esc(safetyText('hazards')) + '</h2>' +
        (topRisks.length ? topRisks.map(function (r) {
          var nm = i18n.riskItem(r.key, l);
          return '<div class="potential-hazard"><b>' + esc(nm.name) + '</b><p>' + esc(nm.note) + '</p></div>';
        }).join('') : '<div class="state-box">' + esc(dataReady ? t.noAlerts : dataState) + '</div>') +
      '<p class="hazard-explanation">' + esc(safetyText('hazardNote')) + '</p></section>';

    /* ---- 趋势（全国城市汇总） ---- */
    var trendAll = wx.getStorageSync('daily_trend') || {};
    var trendAds = Object.keys(trendAll);
    var days = [], vals = [];
    var recorded = 0;
    for (var i = 13; i >= 0; i--) {
      var dt = new Date(Date.now() - i * 86400000);
      var key = pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
      days.push(key);
      var total = 0, hasData = false;
      trendAds.forEach(function (ad) {
        var v = trendAll[ad] && trendAll[ad][key];
        if (typeof v === 'number') { total += v; hasData = true; }
      });
      vals.push(total);
      if (hasData) { recorded++; }
    }

    html += '<section class="panel-card trend-panel">' +
      '<div class="section-head"><h2><span class="h2-ic">' + SVG.iChart + '</span>' + esc(t.trend) + '</h2>' +
        '<span class="head-hint">' + esc(t.trendNationwide) + ' · 14 ' + esc(t.dayShort) + '</span></div>';
    if (recorded < 1) {
      html += '<div class="state-box">' + esc(t.trendBuilding) + '</div>';
    } else {
      html += '<canvas id="trendLine" data-h="180"></canvas>';
    }
    html += '</section></div></div>';

    html += '</div>';
    viewEl.innerHTML = html;
    document.title = t.tabIndex;
    var hero = viewEl.querySelector('.home-dashboard .hero');
    if (hero && bgCanvas && globe) {
      hero.prepend(bgCanvas);
      globe.resize();
    }
    explainView();

    /* 中国态势图 */
    var wrap = document.getElementById('chinaMapWrap');
    if (wrap) {
      chinaMap = __require('china-holo').create(wrap);
      chinaMap.setStatus(sessionStatus);
      hydrateNationalStatus();   /* 立即显示上次扫描结果 */
      sweepNationalStatus();     /* 后台刷新全国城市状态 */
    }
    /* 图表 */
    var dc = document.getElementById('typeDonut');
    if (dc) { charts.donut(dc, donutData); }
    var tl = document.getElementById('trendLine');
    if (tl) { charts.line(tl, days, vals); }
  }

  function onMapClickCity(adcode, name) {
    var geo = districts.getCityGeo(adcode);
    if (!geo) { return; }
    applyRegion({ province: geo.province, city: geo.name, adcode: adcode, district: '' });
    if ((location.hash || '') !== '#/home') { location.hash = '#/home'; }
    pickerEl.innerHTML = '';
  }

  function renderExpandedMap() {
    var t = T();
    var info = api.getSnapshotInfo();
    viewEl.innerHTML = '<section class="expanded-map-page"><div class="container">' +
      '<a class="back-link" href="#/home">← ' + esc(web('backToWarnings')) + '</a>' +
      '<div class="expanded-map-heading"><div><h1 id="expandedMapHeading">' + esc(t.nationalSituation) + '</h1>' +
        '<p id="expandedMapHint">' + esc(web('expandedMapHint')) + '</p></div>' +
        '<div class="expanded-map-actions">' +
          '<button class="map-scan-btn" data-action="toggle-map-fit" aria-pressed="false">' + esc(web('fitMap')) + '</button>' +
          '<button class="map-scan-btn" data-action="refresh-map"' + (nationalSweeping ? ' disabled' : '') + '>' + SVG.refresh + esc(safetyText('refreshPublished')) + '</button>' +
        '</div>' +
      '</div>' +
      manualUpdateControl() +
      '<div class="expanded-map-meta"><span id="mapCoverage" role="status">' + esc(web('coverage')) + ': ' + info.checked + ' / ' + info.total + '</span>' +
        '<div class="map-legend">' +
          '<span><i class="status-dot status-none"></i>' + esc(safetyText('lastNoAlerts')) + '</span>' +
          '<span><i class="status-dot status-normal"></i>' + esc(safetyText('lastAlerts')) + '</span>' +
          '<span><i class="status-dot status-high"></i>' + esc(safetyText('lastRedAlert')) + '</span>' +
          '<span><i class="status-dot status-history"></i>' + esc(safetyText('historical')) + '</span>' +
          '<span><i class="status-dot status-unknown"></i>' + esc(web('unknown')) + '</span>' +
        '</div>' +
      '</div>' +
      '<div id="cityInspection" class="city-inspection" role="status">' + esc(safetyText('selectCity')) + '</div>' +
      '<div class="expanded-map-viewport" id="expandedMapViewport" role="region" tabindex="0" aria-labelledby="expandedMapHeading" aria-describedby="expandedMapHint">' +
        '<div id="expandedMap"></div>' +
      '</div>' +
    '</div></section>';
    document.title = t.nationalSituation;
    explainView();
    chinaMap = __require('china-holo').create(document.getElementById('expandedMap'), function (adcode) {
      inspectMapCity(adcode);
      document.querySelector('#cityInspection button').focus({ preventScroll: true });
    }, function (adcode) {
      // Keep an explicitly chosen city stable while its action button has focus.
      if (!document.activeElement.closest('#cityInspection')) inspectMapCity(adcode);
    });
    chinaMap.setStatus(sessionStatus);
    hydrateNationalStatus();
    sweepNationalStatus();
    setScanButtonState(nationalSweeping);
    var viewport = document.getElementById('expandedMapViewport');
    viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
    viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
  }

  var selectedMapCity = '';
  function inspectMapCity(adcode) {
    var city = districts.getCityGeo(adcode);
    var box = document.getElementById('cityInspection');
    if (!city || !box) return;
    selectedMapCity = adcode;
    var state = sessionStatus[adcode] || {};
    var freshness = reliability.freshness(state.checkedAt);
    if (freshness === 'available' && (state.unavailable || navigator.onLine === false)) freshness = 'unavailable';
    var historical = freshness !== 'available' && Number.isInteger(state.count) && state.count >= 0;
    var signature = [adcode, state.checkedAt, state.count, freshness, lang()].join('|');
    if (box.dataset.signature !== signature) box.innerHTML = '<div><b>' + esc(i18n.placeName(city.name, lang())) + '</b><span class="freshness-tag freshness-' + freshness + '">' + esc(safetyText(freshness)) + '</span>' +
      '<p>' + esc(reliability.checkedAt(state.checkedAt, lang())) + '</p>' +
      (Number.isInteger(state.count) ? '<p>' + esc(safetyText('scanCount').replace('{n}', state.count)) + '</p>' : '') +
      (historical ? '<p class="history-notice">' + esc(safetyText('historyNotice')) + '</p>' : '') + '</div>' +
      '<button class="btn btn-outline" data-action="view-map-city" data-adcode="' + esc(adcode) + '">' + esc(safetyText('viewWarnings')) + '</button>';
    box.dataset.signature = signature;
    document.querySelectorAll('#expandedMap .ch-city').forEach(function (node) { node.classList.toggle('is-selected', node.getAttribute('data-city') === adcode); });
  }

  function statBox(cls, num, label) {
    return '<div class="stat-box ' + cls + '">' +
      '<span class="stat-num">' + (num === null ? '—' : num) + '</span>' +
      '<span class="stat-label">' + esc(label) + '</span></div>';
  }

  /* ================================================================
   * 省份/城市/区县 三级选择弹层
   * ================================================================ */
  function isNarrow() {
    return window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
  }

  function renderPicker() {
    if (!homeState.pickerVisible) { pickerEl.innerHTML = ''; return; }
    var l = lang();
    var t = T(l);
    var sheetCls = isNarrow() ? 'overlay bottom-sheet' : 'overlay';

    var head, body, back = '';

    if (homeState.pickerView === 'province') {
      head = t.selectProvince;
      body = cities.getProvinceNames().map(function (name) {
        var label = i18n.placeName(name, l);
        return '<button class="picker-province" data-action="select-province" data-name="' + esc(name) + '">' +
          '<span class="pc-left">' + (name === homeState.province ? '<b>' + esc(label) + '</b>' : esc(label)) + '</span>' +
          '<span class="pp-arrow">›</span></button>';
      }).join('');
    } else if (homeState.pickerView === 'city') {
      head = i18n.placeName(homeState.pickerProvince, l);
      back = '<button class="picker-back" data-action="back-province">‹ ' + esc(t.selectProvince) + '</button>';
      var rows = homeState.pickerCitiesLoading
        ? '<div class="state-box" style="padding:30px"><div class="spinner"></div>' + esc(t.loading) + '</div>'
        : homeState.cities.map(function (c) {
          return '<button class="picker-city" data-action="select-city" data-name="' + esc(c.name) + '">' +
            '<span class="pc-left"><span class="status-dot status-' + esc(c.status) + '"></span>' +
            esc(c.label) + '</span>' +
            '<span class="pc-count">' + (c.countText ? esc(c.countText) : '') + ' ›</span></button>';
        }).join('');
      body = back + rows + '<div class="source-line" style="padding:0 10px">' + esc(t.provinceHint) + '</div>';
    } else {
      /* 区县视图 */
      var pc = homeState.pickerCity || { name: '', adcode: '' };
      head = i18n.placeName(pc.name, l);
      back = '<button class="picker-back" data-action="back-city">‹ ' + esc(i18n.placeName(pc.name, l)) + '</button>';
      var allStatus = sessionStatus[pc.adcode];
      var allCls = allStatus && !allStatus.unavailable && reliability.freshness(allStatus.checkedAt) === 'available' ? (allStatus.high ? 'high' : allStatus.count ? 'normal' : 'none') : 'unknown';
      var allRow = '<button class="picker-city" data-action="select-district" data-name="__ALL__">' +
        '<span class="pc-left"><span class="status-dot status-' + allCls + '"></span><b>' + esc(t.allDistricts) + '</b></span>' +
        '<span class="pp-arrow">›</span></button>';

      var dRows = homeState.districtLoading
        ? '<div class="state-box" style="padding:30px"><div class="spinner"></div>' + esc(t.loading) + '</div>'
        : homeState.districtList.map(function (d) {
          return '<button class="picker-city" data-action="select-district" data-name="' + esc(d.name) + '">' +
            '<span class="pc-left"><span class="status-dot status-' + esc(d.status) + '"></span>' + esc(i18n.districtName(d.name, l)) +
            (homeState.district === d.name ? ' <b>✓</b>' : '') + '</span>' +
            '<span class="pc-count">' + (d.count ? d.count + '' : '') + ' ›</span></button>';
        }).join('');

      body = back + allRow + dRows +
        '<div class="source-line" style="padding:0 10px">' + esc(t.districtCoverNote) + '</div>';
    }

    pickerEl.innerHTML =
      '<div class="' + sheetCls + '" data-action="close-picker">' +
        '<div class="sheet" data-action="noop">' +
          '<div class="sheet-head"><h3>' + esc(head) + '</h3>' +
            '<button class="sheet-close" data-action="close-picker">' + SVG.close + '</button></div>' +
          '<div class="sheet-body">' + body + '</div>' +
        '</div>' +
      '</div>';
  }

  function openPicker() {
    homeState.pickerVisible = true;
    homeState.pickerView = 'province';
    renderPicker();
  }
  function closePicker() {
    homeState.pickerVisible = false;
    renderPicker();
  }

  function openDistrictPicker() {
    if (!homeState.adcode) { openPicker(); return; }
    homeState.pickerVisible = true;
    homeState.pickerView = 'district';
    homeState.pickerProvince = homeState.province;
    homeState.pickerCity = { name: homeState.city, adcode: homeState.adcode };
    homeState.districtLoading = true;
    homeState.districtList = [];
    renderPicker();
    api.fetchAll(currentRegion()).then(function (res) {
      if (!res.ok) { retainCityStatus(currentRegion()); }
      homeState.districtList = districtStatuses(homeState.adcode, res.ok ? (res.alerts || []) : null);
      homeState.districtLoading = false;
      renderPicker();
    });
  }

  function selectProvince(name) {
    var p = cities.getProvinceByName(name);
    if (!p) { return; }
    var l = lang();
    homeState.pickerView = 'city';
    homeState.pickerProvince = p.name;
    homeState.cities = cities.getCitiesOfProvince(name).map(function (c) {
      return { name: c.name, adcode: c.adcode, label: i18n.placeName(c.name, l), status: 'loading', count: 0, countText: '' };
    });
    homeState.pickerCitiesLoading = true;
    renderPicker();
    var cityList = homeState.cities.map(function (c) { return { name: c.name, adcode: c.adcode }; });
    api.fetchCitiesStatus(cityList).then(function (statuses) {
      var map = {};
      statuses.forEach(function (st) { map[st.name] = st; });
      homeState.cities = cityList.map(function (c) {
        var st = map[c.name];
        if (!st) { return c; }
        if (st.adcode && st.status !== 'unknown') {
          sessionStatus[st.adcode] = { high: st.status === 'high', count: st.count, checkedAt: api.getCityFreshness({ city: c.name, adcode: st.adcode }).checkedAt };
        } else if (st.adcode) {
          retainCityStatus({ city: c.name, adcode: st.adcode });
        }
        return {
          name: c.name, adcode: c.adcode, label: i18n.placeName(c.name, l),
          status: st.status, count: st.count,
          countText: st.count > 0 ? i18n.tpl('alertCount', { n: st.count }, l) : ''
        };
      });
      homeState.pickerCitiesLoading = false;
      renderPicker();
      refreshMaps();
    });
  }

  function selectCity(name) {
    var item = homeState.cities.find(function (c) { return c.name === name; });
    if (!item) { return; }
    homeState.pickerView = 'district';
    homeState.pickerCity = { name: name, adcode: item.adcode };
    homeState.districtLoading = true;
    homeState.districtList = [];
    renderPicker();
    api.fetchAll({
      province: homeState.pickerProvince,
      city: name,
      adcode: item.adcode
    }).then(function (res) {
      var raw = res.alerts || [];
      homeState.districtList = districtStatuses(item.adcode, res.ok ? raw : null);
      if (item.adcode && res.ok) {
        sessionStatus[item.adcode] = {
          high: raw.some(function (a) { return a.level === 'red'; }),
          count: raw.length,
          checkedAt: res.fetchedAt
        };
      } else if (item.adcode) {
        retainCityStatus({ city: name, adcode: item.adcode });
      }
      homeState.districtLoading = false;
      renderPicker();
      refreshMaps();
    });
  }

  function selectDistrict(name) {
    var pc = homeState.pickerCity;
    var region = {
      province: homeState.pickerProvince,
      city: pc.name,
      adcode: pc.adcode || '',
      district: name === '__ALL__' ? '' : name
    };
    closePicker();
    applyRegion(region);
  }

  /* ================================================================
   * 预警详情
   * ================================================================ */
  var countdownTimer = null;

  function parseEndTime(duration) {
    var m = String(duration || '').match(/\d{4}-\d{2}-\d{2}\s\d{2}(?::\d{2})?/g);
    if (m && m.length >= 2) { return new Date(m[1].replace(/-/g, '/')); }
    return null;
  }

  function startCountdown(end) {
    clearInterval(countdownTimer);
    if (!end) { return; }
    function tick() {
      var el = document.getElementById('countdownBox');
      if (!el) { clearInterval(countdownTimer); return; }
      var ms = end.getTime() - Date.now();
      if (ms <= 0) {
        el.innerHTML = '<b>' + esc(T().countdownEnded) + '</b>';
        clearInterval(countdownTimer);
        return;
      }
      var d = Math.floor(ms / 86400000);
      var h = Math.floor(ms % 86400000 / 3600000);
      var mi = Math.floor(ms % 3600000 / 60000);
      var ss = Math.floor(ms % 60000 / 1000);
      el.innerHTML = (d ? d + ' ' + T().dayShort + ' ' : '') +
        pad(h) + ':' + pad(mi) + ':' + pad(ss);
    }
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  /* 影响范围雷达图 */
  function radarSvg(chips, focusChips) {
    var cx = 210, cy = 158;
    var s = '<svg viewBox="0 0 420 316" class="radar-svg">';
    [42, 88, 132].forEach(function (r) {
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" class="radar-ring"/>';
    });
    s += '<line x1="' + (cx - 132) + '" y1="' + cy + '" x2="' + (cx + 132) + '" y2="' + cy + '" class="radar-cross"/>' +
         '<line x1="' + cx + '" y1="' + (cy - 132) + '" x2="' + cx + '" y2="' + (cy + 132) + '" class="radar-cross"/>' +
         '<circle cx="' + cx + '" cy="' + cy + '" r="4.5" class="radar-center-dot"/>' +
         '<text x="' + cx + '" y="' + (cy - 12) + '" class="radar-center-label">' + T().diagramCenter + '</text>';

    function place(name, i, n, r, cls) {
      var a = -Math.PI / 2 + i * (Math.PI * 2 / Math.max(n, 1));
      var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4.2" class="radar-p ' + cls + '"/>' +
           '<text x="' + (x + 8).toFixed(1) + '" y="' + (y + 4).toFixed(1) + '" class="radar-pl">' + esc(name) + '</text>';
    }
    var f = focusChips;
    var o = chips.filter(function (c) { return f.indexOf(c) < 0; });
    f.forEach(function (n, i) { place(n, i, f.length, 64, 'rp-focus'); });
    o.forEach(function (n, i) { place(n, i, o.length, 114, 'rp-other'); });
    s += '</svg>';
    return s;
  }

  function localizeAlert(alert) {
    var l = lang();
    var risks = risk.getRisks(alert).map(function (r) {
      var item = i18n.riskItem(r.key, l);
      return Object.assign({}, r, { name: item.name || r.name, note: item.note || r.note });
    });
    var localized = Object.assign({}, alert, {
      risks: risks,
      title: i18n.alertTitle(alert.title, alert.type, alert.level, l),
      area: i18n.areaName(alert.area, alert.cityName, l),
      focusArea: i18n.areaName(alert.focusArea || '', alert.cityName, l),
      levelName: i18n.levelName(alert.level, l),
      status: i18n.t('statusActive', l),
      duration: String(alert.duration || '').replace(' 至 ', ' ' + i18t('durationTo', l) + ' '),
      source: alert.source === '气象部门' ? i18n.t('defaultSource', l) : i18n.orgName(alert.source, l)
    });
    if (l !== 'zh') {
      localized.content = i18n.alertSummary(Object.assign({}, alert, { risks: risks }), l);
      localized.defense = i18n.defenseByType(alert.type, l);
    }
    if (!localized.defense || !localized.defense.length) localized.defense = i18n.defenseByType(alert.type, l);
    return localized;
  }
  function i18t(k, l) { return i18n.t(k, l); }

  /* 灾害类型 → 推荐物资 index */
  var RECOMMEND_MAT = {
    typhoon: [0, 1, 2, 3, 4, 6, 7, 10],
    rainstorm: [0, 2, 3, 4, 6, 7, 10],
    flood: [0, 2, 4, 6, 7, 8],
    earthquake: [0, 1, 2, 4, 6, 7, 8],
    heat: [0, 4],
    coldwave: [0, 1, 4, 7],
    thunder: [2, 3, 6],
    gale: [2, 3, 6, 7],
    hail: [2, 4, 6],
    fog: [9],
    forestfire: [0, 4, 9],
    drought: [0, 4]
  };

  function renderDetail(id) {
    pickerEl.innerHTML = '';
    var alert = api.getAlertById(id);
    var l = lang();
    var t = T(l);
    if (!alert) {
      wx.showToast({ title: i18n.t('notFound', l), icon: 'none' });
      location.hash = '#/home';
      return;
    }
    var a = localizeAlert(alert);

    var allChips = extractChips(alert.area);
    var focusChips = extractChips(alert.focusArea);
    var chipsHtml = allChips.length
      ? '<div class="district-chips">' + allChips.map(function (d) {
        return '<span class="district-chip ' + (focusChips.indexOf(d) > -1 ? 'focus' : '') + '">' + esc(i18n.districtName(d, l)) +
          (focusChips.indexOf(d) > -1 ? ' ●' : '') + '</span>';
      }).join('') + '</div>'
      : '';

    var html =
      '<section class="detail-hero lv-' + a.level + '"><div class="container">' +
        '<a class="back-link" href="#/home">‹ ' + esc(t.tabIndex) + '</a>' +
        '<div><span class="level-badge">' + esc(a.levelName) + '</span></div>' +
        '<h1>' + esc(a.title) + '</h1>' +
        '<div class="detail-meta"><span>' + esc(i18n.disasterName(a.type, l)) + '</span>' +
        '<span class="dot-sep">•</span><span>' + esc(a.source) + '</span></div>' +
        '<div class="detail-overview info-rows">' + infoRow(t.affectedArea, a.area) + infoRow(t.issueTime, a.time) +
          infoRow(safetyText('checked'), alert.checkedAt ? new Date(alert.checkedAt).toLocaleString(l) : '—') + '</div>' +
      '</div></section>';

    html += '<section class="section"><div class="container detail-grid">' +
      '<div class="detail-main">' +
        (a.defense && a.defense.length ? '<div class="dcard priority-actions"><h2 class="dcard-title">' + esc(t.defensePoints) + '</h2><ul class="defense-list">' + a.defense.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></div>' : '') +

        /* 正文 */
        '<div class="dcard"><div class="dcard-title"><span class="title-bar"></span>' + esc(safetyText('noticeSummary')) + '</div>' +
          chipsHtml +
          '<div class="alert-body">' + esc(a.content) + '</div>' +
          '<div class="source-line"><span>' + esc(t.affectedArea) + '：</span><span class="source-tag">' + esc(a.area) + '</span></div>' +
          (a.focusArea ? '<div class="source-line"><span>' + esc(t.focusArea) + '：</span><span class="source-tag">' + esc(a.focusArea) + '</span></div>' : '') +
          '<details class="official-notice"><summary>' + esc(safetyText('original')) + '</summary><div lang="zh-CN"><h3>' + esc(alert.title) + '</h3><p class="alert-body">' + esc(alert.content) + '</p></div></details>' +
          (alert.sourceUrl ? '<a class="btn btn-outline official-link" href="' + esc(alert.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(safetyText('originalLink')) + ' ↗</a>' : '') +
        '</div>';

    /* 影响范围图 */
    if (allChips.length) {
      html += '<div class="dcard"><div class="dcard-title"><span class="title-bar"></span>' + esc(t.impactDiagram) + '</div>' +
        radarSvg(allChips, focusChips) + '</div>';
    }

    /* 次生风险 */
    if (a.risks && a.risks.length) {
      html += '<div class="dcard"><div class="dcard-title"><span class="title-bar"></span>' + esc(safetyText('hazards')) + '</div>' +
        a.risks.map(function (r) {
          return '<div class="potential-hazard"><b>' + esc(r.name) + '</b><p>' + esc(r.note) + '</p></div>';
        }).join('') +
        '<div class="risk-tip">' + esc(safetyText('hazardNote')) + '</div></div>';
    }

    /* 推荐物资 */
    var recIdx = RECOMMEND_MAT[alert.type] || [0, 2, 4, 6];
    var matIdx = getMaterialIndexes();
    var matNames = i18n.materials(l);
    html += '<div class="dcard"><div class="dcard-title"><span class="title-bar"></span>' + esc(t.recommended) + '</div>' +
      '<div class="rec-list">' + recIdx.map(function (ix) {
        var checked = matIdx.indexOf(ix) >= 0;
        return '<button class="rec-item ' + (checked ? 'checked' : '') + '" data-action="rec-toggle" data-index="' + ix + '">' +
          '<span class="material-check">' + SVG.checkBox + '</span>' + esc(matNames[ix]) + '</button>';
      }).join('') + '</div></div>';

    /* 测验 */
    html += '<div class="dcard"><div class="dcard-title"><span class="title-bar"></span>' + esc(t.quizEntry) + '</div>' +
      renderQuizBlock(alert.type) + '</div>';

    html += '</div><aside class="detail-side">';

    /* 倒计时 */
    var end = parseEndTime(alert.duration);
    html += '<div class="dcard"><div class="dcard-title"><span class="title-bar"></span>' + esc(t.countdown) + '</div>' +
      '<div class="countdown-box" id="countdownBox">' + (end ? '' : '—') + '</div></div>';

    /* 发布信息 */
    html += '<div class="dcard"><div class="dcard-title"><span class="title-bar"></span>' + esc(t.publishInfo) + '</div>' +
      '<div class="info-rows">' +
        infoRow(t.issueBy, a.source) +
        infoRow(t.issueTime, a.time) +
        infoRow(t.validPeriod, a.duration) +
      '</div></div>';

    html += '<div class="detail-actions">' +
      '<a class="btn btn-green" href="tel:12121">' + esc(t.callHotline) + '</a>' +
      '<button class="btn btn-outline" data-action="share">' + esc(t.share) + '</button>' +
    '</div></aside></div></section>';

    viewEl.innerHTML = html;
    document.title = l === 'zh' ? (a.type + '预警') : i18n.disasterName(a.type, l);
    explainView();
    startCountdown(end);
  }

  function infoRow(label, value) {
    return '<div class="info-row"><span class="info-label">' + esc(label) + '</span>' +
      '<span class="info-value">' + esc(value || '—') + '</span></div>';
  }

  function shareAlert() {
    var l = lang();
    var shareUrl = location.origin + location.pathname;
    if (navigator.share) {
      navigator.share({ title: i18n.t('appName', l), url: shareUrl }).catch(function () { });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(function () {
        wx.showToast({ title: web('linkCopied'), icon: 'none' });
      }).catch(function () { });
    } else {
      wx.showToast({ title: shareUrl, icon: 'none' });
    }
  }

  /* ================================================================
   * 知识测验（共享）
   * ================================================================ */
  var quizState = {};

  function renderQuizBlock(type) {
    var qs = i18n.quizByType(type, lang());
    var t = T();
    if (!qs.length) { return '<p class="guide-note">' + esc(t.moreQuizSoon) + '</p>'; }
    return '<div class="quiz-block">' + qs.map(function (q) {
      var st = quizState[q.id] || { picked: -1 };
      var h = '<div class="quiz-q"><span class="quiz-q-key">Q</span> ' + esc(q.q) + '</div><div class="quiz-opts">';
      q.o.forEach(function (op, i) {
        var cls = 'quiz-opt';
        if (st.picked >= 0) {
          if (i === q.a) { cls += ' correct'; }
          else if (i === st.picked) { cls += ' wrong'; }
        }
        h += '<button class="' + cls + '" data-action="quiz-answer" data-qid="' + q.id + '" data-pick="' + i + '">' +
          '<span class="opt-key">' + String.fromCharCode(65 + i) + '</span>' + esc(op) + '</button>';
      });
      h += '</div>';
      if (st.picked >= 0) {
        var ok = st.picked === q.a;
        h += '<div class="quiz-feedback ' + (ok ? 'ok' : 'bad') + '"><b>' +
          (ok ? t.quizCorrect : t.quizWrong) + '</b> ' + esc(q.why) + '</div>';
      }
      return '<div class="quiz-item">' + h + '</div>';
    }).join('') + '</div>';
  }

  /* ================================================================
   * 物资清单（共享，index 维度）
   * ================================================================ */
  function getMaterialIndexes() {
    var v = wx.getStorageSync('emergency_materials');
    if (Array.isArray(v)) {
      if (v.length && typeof v[0] === 'string') {
        var zh = i18n.materials('zh');
        var idx = v.map(function (s) { return zh.indexOf(s); }).filter(function (x) { return x >= 0; });
        wx.setStorageSync('emergency_materials', idx);
        return idx;
      }
      return v.slice();
    }
    return [];
  }
  function toggleMaterialIndex(idx) {
    var saved = getMaterialIndexes();
    var i = saved.indexOf(idx);
    if (i >= 0) { saved.splice(i, 1); } else { saved.push(idx); }
    wx.setStorageSync('emergency_materials', saved);
    softRerender();
  }

  /* ================================================================
   * 防御指南
   * ================================================================ */
  var guideIndex = 0;
  function getReadGuides() {
    var v = wx.getStorageSync('guide_read');
    return Array.isArray(v) ? v : [];
  }

  var GUIDE_MAT = {
    typhoon: [0, 1, 2, 3, 4, 6, 7, 10],
    rainstorm: [0, 2, 3, 4, 6, 7, 10],
    flood: [0, 2, 4, 6, 7, 8],
    earthquake: [0, 1, 2, 4, 6, 7, 8],
    heat: [0, 4],
    coldwave: [0, 1, 4, 7],
    thunder: [2, 3, 6],
    gale: [2, 3, 6, 7],
    hail: [2, 4, 6],
    fog: [9],
    forestfire: [0, 4, 9],
    drought: [0, 4]
  };

  function renderGuide() {
    var l = lang();
    var t = T(l);
    var categories = data.getGuides().map(function (c) {
      c = __require('guide-locales').getGuide(c, l);
      return Object.assign({}, c, {
        name: i18n.disasterName(c.name, l),
        signals: (c.signals || []).map(function (s) {
          return Object.assign({}, s, { level: i18n.levelWord(s.level, l) });
        })
      });
    });
    var idx = guideIndex < categories.length ? guideIndex : 0;
    guideIndex = idx;
    var active = categories[idx];
    var read = getReadGuides();
    var isRead = read.indexOf(active.id) >= 0;
    var matIdx = getMaterialIndexes();
    var matNames = i18n.materials(l);
    var prepIdx = GUIDE_MAT[active.id] || [0, 2, 4];

    var html =
      '<section class="page-top"><div class="container"><h1>' + esc(t.tabGuide) + '</h1>' +
      '<p>' + esc(t.guideNote) + '</p>' +
      '<p class="offline-guide-status" id="offlineGuideStatus">' + esc(offlineGuideText()) + '</p>' +
      '<div class="read-progress"><span>' + esc(t.readProgress) + ' ' + read.length + '/12</span>' +
        '<span class="read-progress-bar"><i style="width:' + Math.round(read.length / 12 * 100) + '%"></i></span>' +
      '</div></div></section>' +

      '<section class="section"><div class="container guide-layout">' +
        '<aside class="guide-side">' +
          categories.map(function (c, i) {
            var rd = read.indexOf(c.id) >= 0;
            return '<button class="guide-side-item ' + (i === idx ? 'active' : '') + '" data-action="guide-cat" data-index="' + i + '">' +
              esc(c.name) + (rd ? ' <span class="side-read">✓</span>' : '') + '</button>';
          }).join('') +
        '</aside>' +

        '<div class="guide-content">' +
          '<h2>' + esc(active.name) + '</h2>' +
          '<p class="guide-desc">' + esc(active.desc) + '</p>' +

          '<h3>' + esc(t.causes) + '</h3>' +
          '<p class="guide-cause">' + esc(i18n.causes(active.id, l)) + '</p>' +

          '<h3>' + esc(t.signals) + '</h3>' +
          '<ul class="signal-list">' +
            active.signals.map(function (s) {
              return '<li><span class="lv-' + levelCls(s.level) + '"><span class="level-badge">' + esc(s.level) + '</span></span> ' + esc(s.desc) + '</li>';
            }).join('') +
          '</ul>' +

          '<h3>' + esc(t.defensePoints) + '</h3>' +
          '<ol class="guide-action-list">' +
            active.actions.map(function (act) { return '<li>' + esc(act) + '</li>'; }).join('') +
          '</ol>' +

          '<h3>' + esc(t.preparation) + '</h3>' +
          '<div class="rec-list">' + prepIdx.map(function (ix) {
            var checked = matIdx.indexOf(ix) >= 0;
            return '<button class="rec-item ' + (checked ? 'checked' : '') + '" data-action="rec-toggle" data-index="' + ix + '">' +
              '<span class="material-check">' + SVG.checkBox + '</span>' + esc(matNames[ix]) + '</button>';
          }).join('') + '</div>' +

          '<h3>' + esc(t.quiz) + '</h3>' +
          renderQuizBlock(active.id) +

          '<div class="guide-mark">' +
            '<button class="btn ' + (isRead ? 'btn-outline' : 'btn-green') + '" data-action="mark-read">' +
              (isRead ? '✓ ' + esc(t.markRead) : esc(t.markRead)) + '</button>' +
          '</div>' +
        '</div>' +
      '</div></section>';

    viewEl.innerHTML = html;
    document.title = t.tabGuide;
    explainView();
  }

  function levelCls(w) {
    w = String(w);
    if (/红|Red|Rouge|Rojo|Rosso/i.test(w)) { return 'red'; }
    if (/橙|Orange|Naranja|Arancio/i.test(w)) { return 'orange'; }
    if (/黄|Yellow|Jaune|Amarillo|Giallo/i.test(w)) { return 'yellow'; }
    return 'blue';
  }

  /* ================================================================
   * 应急工具
   * ================================================================ */
  function buildMaterials() {
    var l = lang();
    var saved = getMaterialIndexes();
    var names = i18n.materials(l);
    return names.map(function (name, idx) {
      return { name: name, index: idx, checked: saved.indexOf(idx) >= 0 };
    });
  }

  var aidState = { tab: 0, step: 0 };
  var wizard = { stage: 0, scene: 'home' };
  var SCENE_MAT = {
    home: [0, 1, 2, 3, 4, 6, 7, 10],
    car: [0, 1, 2, 4, 6, 7, 8],
    outdoor: [0, 1, 2, 6, 8]
  };

  function renderTools() {
    var l = lang();
    var t = T(l);
    var phones = i18n.phones(l);
    var tips = i18n.tips(l);
    var materialsList = buildMaterials();
    var done = materialsList.filter(function (m) { return m.checked; }).length;
    var progress = materialsList.length ? Math.round(done / materialsList.length * 100) : 0;
    var matIdx = getMaterialIndexes();
    var matNames = i18n.materials(l);

    var html =
      '<section class="page-top"><div class="container"><h1>' + esc(t.tabTools) + '</h1>' +
      '<p>' + esc(t.footerTools) + '</p></div></section>';

    /* ---- 急救步骤 ---- */
    var aidList = i18n.firstaid(l);
    var aidCur = aidList[aidState.tab];
    html += '<section class="section"><div class="container">' +
      '<div class="section-head"><h2>' + esc(t.firstAid) + '</h2></div>' +
      '<div class="aid-tabs">' + aidList.map(function (a, i) {
        return '<button class="aid-tab ' + (i === aidState.tab ? 'active' : '') + '" data-action="aid-tab" data-index="' + i + '">' + esc(a.name) + '</button>';
      }).join('') + '</div>' +
      '<div class="aid-card">' +
        '<div class="aid-step-head"><span class="aid-step-num">' + (aidState.step + 1) + '/' + aidCur.steps.length + '</span>' +
        '<span class="aid-dots">' + aidCur.steps.map(function (s, i) {
          return '<i class="' + (i <= aidState.step ? 'on' : '') + '"></i>';
        }).join('') + '</span></div>' +
        '<p class="aid-step-text">' + esc(aidCur.steps[aidState.step]) + '</p>' +
        '<div class="aid-nav">' +
          '<button class="btn btn-outline" data-action="aid-prev" ' + (aidState.step === 0 ? 'disabled' : '') + '>' + esc(t.prevStep) + '</button>' +
          (aidState.step < aidCur.steps.length - 1
            ? '<button class="btn btn-green" data-action="aid-next">' + esc(t.nextStep) + '</button>'
            : '<button class="btn btn-green" disabled>' + esc(t.finish) + '</button>') +
        '</div>' +
      '</div></div></section>';

    /* ---- 紧急电话 ---- */
    html += '<section class="section section-alt"><div class="container">' +
      '<div class="section-head"><h2>' + esc(t.emergencyPhone) + '</h2></div>' +
      '<div class="phone-grid">' +
        phones.map(function (p) {
          return '<a class="phone-card" href="tel:' + esc(p.number) + '">' +
            '<span class="phone-number">' + esc(p.number) + '</span>' +
            '<span class="phone-name">' + esc(p.name) + '</span>' +
            '<span class="phone-desc">' + esc(p.desc) + '</span></a>';
        }).join('') +
      '</div></div></section>';

    /* ---- 应急包向导 ---- */
    html += '<section class="section"><div class="container">' +
      '<div class="section-head"><h2>' + esc(t.packWizard) + '</h2></div>' +
      '<div class="wizard-card">';

    if (wizard.stage === 0) {
      html += '<p class="wizard-prompt">' + esc(t.wizardScene) + '</p>' +
        '<div class="wizard-scenes">' +
          [['home', t.sceneHome], ['car', t.sceneCar], ['outdoor', t.sceneOutdoor]].map(function (s) {
            return '<button class="wizard-scene ' + (wizard.scene === s[0] ? 'active' : '') + '" data-action="wizard-scene" data-scene="' + s[0] + '">' + esc(s[1]) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="aid-nav"><span></span><button class="btn btn-green" data-action="wizard-next">' + esc(t.nextStep) + '</button></div>';
    } else if (wizard.stage === 1) {
      var wItems = SCENE_MAT[wizard.scene];
      html += '<p class="wizard-prompt">' + esc(t.wizardItems) + '</p>' +
        '<div class="rec-list">' + wItems.map(function (ix) {
          var checked = matIdx.indexOf(ix) >= 0;
          return '<button class="rec-item ' + (checked ? 'checked' : '') + '" data-action="rec-toggle" data-index="' + ix + '">' +
            '<span class="material-check">' + SVG.checkBox + '</span>' + esc(matNames[ix]) + '</button>';
        }).join('') + '</div>' +
        '<div class="aid-nav"><button class="btn btn-outline" data-action="wizard-back">' + esc(t.prevStep) + '</button>' +
          '<button class="btn btn-green" data-action="wizard-next">' + esc(t.finish) + '</button></div>';
    } else {
      html += '<div class="wizard-done">✓</div><p class="wizard-prompt">' + esc(t.wizardDone) + '</p>' +
        '<div class="aid-nav"><span></span><button class="btn btn-green" data-action="wizard-restart">' + esc(t.quizRetry) + '</button></div>';
    }
    html += '</div></div></section>';

    /* ---- 物资清单 ---- */
    html += '<section class="section section-alt"><div class="container">' +
      '<div class="section-head"><h2>' + esc(t.materialList) + '</h2>' +
      '<span class="head-hint">' + esc(i18n.tpl('prepared', { progress: progress }, l)) + '</span></div>' +
      '<div class="progress-card">' +
        '<div class="progress-bar"><div class="progress-inner" style="width:' + progress + '%"></div></div>' +
        '<div class="progress-label">' + esc(i18n.tpl('total', { n: materialsList.length }, l)) + '</div>' +
        '<div class="material-list">' +
          materialsList.map(function (m) {
            return '<button class="material-item ' + (m.checked ? 'checked' : '') + '" data-action="toggle-material" data-index="' + m.index + '">' +
              '<span class="material-check">' + SVG.checkBox + '</span><span>' + esc(m.name) + '</span></button>';
          }).join('') +
        '</div>' +
      '</div></div></section>';

    /* ---- 家庭应急计划 ---- */
    var plan = wx.getStorageSync('family_plan') || { members: '', meeting: '', contact: '', needs: '' };
    html += '<section class="section"><div class="container">' +
      '<div class="section-head"><h2>' + esc(t.familyPlan) + '</h2></div>' +
      '<div class="plan-card">' +
        planField(t.planMembers, 'members', plan.members) +
        planField(t.planMeeting, 'meeting', plan.meeting) +
        planField(t.planContact, 'contact', plan.contact) +
        planField(t.planNeeds, 'needs', plan.needs) +
        '<div class="aid-nav"><button class="btn btn-outline" data-action="plan-export">' + esc(t.planExport) + '</button>' +
          '<button class="btn btn-green" data-action="plan-save">' + esc(t.planSave) + '</button></div>' +
      '</div></div></section>';

    /* ---- 避险要点 ---- */
    html += '<section class="section section-alt"><div class="container">' +
      '<div class="section-head"><h2>' + esc(t.evacuationTips) + '</h2></div>' +
      '<div class="tip-list">' +
        tips.map(function (tip, i) {
          var num = String(i + 1);
          return '<div class="tip-card"><b>TIP ' + (num.length < 2 ? '0' + num : num) + '</b>' + esc(tip) + '</div>';
        }).join('') +
      '</div>' +
      '<div class="disclaimer-row"><button class="btn btn-outline" data-action="show-disclaimer">' + esc(t.disclaimer) + '</button></div>' +
      '</div></section>';

    viewEl.innerHTML = html;
    document.title = t.tabTools;
    explainView();
  }

  function planField(label, field, value) {
    return '<label class="plan-field"><span>' + esc(label) + '</span>' +
      '<textarea rows="2" data-input="plan-field" data-field="' + field + '" placeholder="' + esc(label) + '">' + esc(value) + '</textarea></label>';
  }

  function toggleMaterial(index) {
    var materialsList = buildMaterials();
    materialsList[index].checked = !materialsList[index].checked;
    var checkedIndexes = materialsList.filter(function (m) { return m.checked; }).map(function (m) { return m.index; });
    wx.setStorageSync('emergency_materials', checkedIndexes);
    softRerender();
  }

  function savePlan() {
    wx.showToast({ title: T().planSaved, icon: 'none' });
  }
  function exportPlan() {
    var p = wx.getStorageSync('family_plan') || {};
    var t = T();
    var text = t.familyPlan + '\n' +
      t.planMembers + ': ' + (p.members || '') + '\n' +
      t.planMeeting + ': ' + (p.meeting || '') + '\n' +
      t.planContact + ': ' + (p.contact || '') + '\n' +
      t.planNeeds + ': ' + (p.needs || '');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        wx.showToast({ title: T().planCopied, icon: 'none' });
      }).catch(function () { wx.showToast({ title: text, icon: 'none' }); });
    } else {
      wx.showToast({ title: text, icon: 'none' });
    }
  }

  /* ================================================================
   * 产品目录（占位页）
   * ================================================================ */
  /* ================================================================
   * 产品目录（互动游戏原型）
   * ================================================================ */
  var productsState = { game: null };

  function renderProducts() {
    var t = T();
    if (productsState.game) {
      renderGameView();
      return;
    }
    var cards = [
      {
        type: 'aqua',
        name: t.gameAquaName,
        desc: t.gameAquaDesc,
        icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6"/><circle cx="12" cy="14" r="2.2"/><path d="M3 20c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/></svg>'
      },
      {
        type: 'pyro',
        name: t.gamePyroName,
        desc: t.gamePyroDesc,
        icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3-2 4-2 7 0 1.5 1 2.5 2 3 0-2 1.5-3 2-5 .5 2 .5 4-1 6 1.5 0 3-1 3-3 0-2-2-3-2-5 0-1.5.5-2.5 1-3z"/><path d="M8 21h8"/></svg>'
      }
    ];
    var html =
      '<section class="section"><div class="container">' +
        '<div class="page-head">' +
          '<h1>' + esc(t.productsTitle) + '</h1>' +
          '<p>' + esc(t.productsSubtitle) + '</p>' +
        '</div>' +
        '<div class="product-grid">';
    cards.forEach(function (c) {
      html +=
        '<div class="product-card">' +
          '<div class="product-icon">' + c.icon + '</div>' +
          '<h3>' + esc(c.name) + '</h3>' +
          '<p>' + esc(c.desc) + '</p>' +
          '<button class="btn btn-green" data-action="open-game" data-type="' + c.type + '">' + esc(t.startDemo) + '</button>' +
        '</div>';
    });
    html += '</div></div></section>';
    viewEl.innerHTML = html;
    document.title = t.productsTitle;
    explainView();
  }

  function renderGameView() {
    var t = T();
    var g = productsState.game;
    var name = g === 'aqua' ? t.gameAquaName : t.gamePyroName;
    var how = g === 'aqua' ? t.gameAquaHow : t.gamePyroHow;
    viewEl.innerHTML =
      '<section class="section"><div class="container">' +
        '<button class="btn btn-outline" data-action="back-products">' + esc(t.backToProducts) + '</button>' +
        '<div class="game-frame">' +
          '<div class="game-title"><h2>' + esc(name) + '</h2><p>' + esc(how) + '</p></div>' +
          '<div class="game-hud" id="gameHUD"></div>' +
          '<canvas id="gameCanvas" class="game-canvas"></canvas>' +
        '</div>' +
      '</div></section>';
    document.title = name;
    explainView();
    var cv = document.getElementById('gameCanvas');
    if (window.NDGames && cv) {
      window.NDGames.start(cv, g, T());
    }
  }

  /* ================================================================
   * 设置
   * ================================================================ */
  var settingsUI = {
    langExpanded: false, accessExpanded: false,
    notifExpanded: false
  };

  function renderSettings() {
    var l = lang();
    var t = T(l);
    var sources = [
      { value: 'weathercn', label: i18n.dataSourceName('华风爱科天气API', l), hint: web('srcWeathercn') },
      { value: 'amap', label: i18n.dataSourceName('高德天气API', l), hint: i18n.t('srcAmap', l) }
    ];
    var currentSource = api.getEffectiveDataSource();
    var cacheInfo = i18n.tpl('cacheInfo', { n: api.getCacheInfo().count }, l);
    var textScales = [
      { value: '1', label: t.textStandard },
      { value: '1.15', label: t.textLarge },
      { value: '1.3', label: t.textExtraLarge }
    ];
    var notifEnabled = wx.getStorageSync('notif_enabled') === '1';
    var notifInterval = wx.getStorageSync('notif_interval') || '30';
    var reqCount = parseInt(localStorage.getItem('shared_snapshot_reads'), 10);
    reqCount = isNaN(reqCount) ? 0 : reqCount;

    var html =
      '<section class="page-top"><div class="container"><h1>' + esc(t.settingsTitle) + '</h1></div></section>' +
      '<section class="section"><div class="container settings-wrap">';

    /* 语言 */
    var langCardTitle = l === 'zh' ? '语言 / Language' : t.language;
    html += foldCard('lang', settingsUI.langExpanded,
      langCardTitle,
      '<div class="option-list">' +
        i18n.LANGUAGES.map(function (lg) {
          return '<button class="option-item ' + (lg.code === l ? 'selected' : '') + '" data-action="select-lang" data-code="' + lg.code + '"><span>' + esc(lg.name) + '</span>' +
            (lg.code === l ? '<span class="option-check">' + SVG.check + '</span>' : '') + '</button>';
        }).join('') +
      '</div>');

    /* 辅助功能 */
    html += foldCard('access', settingsUI.accessExpanded, t.accessibility,
      '<div class="option-list">' +
        textScales.map(function (sc) {
          return '<button class="option-item ' + (sc.value === access.textScale ? 'selected' : '') + '" data-action="select-scale" data-value="' + sc.value + '"><span>' + esc(sc.label) + '</span>' +
            (sc.value === access.textScale ? '<span class="option-check">' + SVG.check + '</span>' : '') + '</button>';
        }).join('') +
      '</div>' +
      switchRow(t.highContrast, access.contrast === '1', 'toggle-contrast') +
      switchRow(t.reduceMotion, access.reduceMotion === '1', 'toggle-motion'));

    /* 通知 */
    html += foldCard('notif', settingsUI.notifExpanded, t.notifications,
      switchRow(t.notifEnable, notifEnabled, 'toggle-notif-switch') +
      '<div class="option-list">' +
        [['15', t.every15], ['30', t.every30], ['60', t.every60]].map(function (op) {
          return '<button class="option-item ' + (notifInterval === op[0] ? 'selected' : '') + '" data-action="notif-interval" data-value="' + op[0] + '"><span>' + esc(op[1]) + '</span>' +
            (notifInterval === op[0] ? '<span class="option-check">' + SVG.check + '</span>' : '') + '</button>';
        }).join('') +
      '</div>' +
      '<div class="set-row"><span class="set-row-label">' + esc(t.notifLimit) + '</span>' +
        '<button class="btn btn-outline" data-action="notif-test">' + esc(t.notifTest) + '</button></div>');

    /* 数据源 */
    html += '<p class="notification-limit">' + esc(safetyText('notificationLimit')) + '</p>';
    html += staticCard(t.dataSource,
      '<div class="option-list">' +
        sources.map(function (sc) {
          return '<button class="option-item ' + (sc.value === currentSource ? 'selected' : '') + '" data-action="select-source" data-value="' + sc.value + '"><span>' + esc(sc.label) +
            '<span class="set-row-hint">' + esc(sc.hint) + '</span></span>' +
            (sc.value === currentSource ? '<span class="option-check">' + SVG.check + '</span>' : '') + '</button>';
        }).join('') +
      '</div>');

    /* 缓存 + 请求统计 */
    html += staticCard(t.cache,
      '<div class="set-row"><span class="set-row-label">' + esc(cacheInfo) + '</span>' +
        '<button class="btn btn-outline" data-action="clear-cache">' + esc(t.clearCache) + '</button></div>' +
      '<div class="set-row"><span class="set-row-label">' + esc(explanations.reads(l)) + '</span>' +
        '<span class="set-value"><b>' + reqCount + '</b></span></div>');

    /* 数据管理 */
    html += staticCard(t.resetAll,
      '<div class="set-row"><span class="set-row-label">' + esc(t.resetAll) + '</span>' +
        '<button class="btn btn-outline btn-danger" data-action="reset-all">' + esc(t.resetAll) + '</button></div>');

    /* 关于 */
    html += staticCard(t.about,
      '<div class="set-row"><span class="set-row-label">' + esc(t.disclaimer) + '</span>' +
        '<button class="btn btn-outline" data-action="show-disclaimer">' + esc(t.disclaimerTitle) + '</button></div>' +
      '<div class="set-row"><span class="set-row-label">' + esc(t.version) + '</span>' +
        '<span class="set-value">' + APP_VERSION + '</span></div>');

    html += '</div></section>';
    viewEl.innerHTML = html;
    document.title = t.settingsTitle;
    explainView();
  }

  function foldCard(key, expanded, title, bodyHtml) {
    return '<div class="set-card ' + (expanded ? 'expanded' : '') + '">' +
      '<button class="set-card-title" data-action="toggle-' + key + '"><span>' + esc(title) + '</span><span class="set-arrow">›</span></button>' +
      (expanded ? '<div class="set-card-body">' + bodyHtml + '</div>' : '') +
    '</div>';
  }
  function staticCard(title, bodyHtml) {
    return '<div class="set-card expanded"><div class="set-card-title static-title"><span>' + esc(title) + '</span></div>' +
      '<div class="set-card-body">' + bodyHtml + '</div></div>';
  }

  function switchRow(label, checked, action) {
    return '<div class="set-row"><span class="set-row-label">' + esc(label) + '</span>' +
      '<label class="switch"><input type="checkbox" data-action="' + action + '" ' + (checked ? 'checked' : '') + '>' +
      '<span class="switch-track"></span></label></div>';
  }

  /* ---------- 通知逻辑 ---------- */
  var notifierTimer = null;
  function startNotifier() {
    clearInterval(notifierTimer);
    if (wx.getStorageSync('notif_enabled') !== '1') { return; }
    var mins = parseInt(wx.getStorageSync('notif_interval') || '30', 10);
    notifierTimer = setInterval(checkNotif, mins * 60000);
  }
  function checkNotif() {
    api.fetchAll(currentRegion()).then(function (res) {
      if (!res.ok) { return; }
      var notified = wx.getStorageSync('notif_notified') || [];
      var fresh = (res.alerts || []).filter(function (a) { return notified.indexOf(a.id) < 0; });
      if (fresh.length) {
        fresh.forEach(function (a) {
          try {
            new Notification(i18n.alertTitle(a.title, a.type, a.level, lang()), { body: i18n.areaName(a.area, a.cityName, lang()) || '' });
          } catch (e) { }
        });
        wx.setStorageSync('notif_notified', notified.concat(fresh.map(function (a) { return a.id; })));
      }
    });
  }
  function toggleNotif() {
    if (wx.getStorageSync('notif_enabled') === '1') {
      wx.setStorageSync('notif_enabled', '0');
      startNotifier();
      renderSettings();
      return;
    }
    if (!('Notification' in window)) {
      wx.showToast({ title: T().notifBlocked, icon: 'none' });
      return;
    }
    Notification.requestPermission().then(function (p) {
      if (p === 'granted') {
        wx.setStorageSync('notif_enabled', '1');
        startNotifier();
      } else {
        wx.showToast({ title: T().notifBlocked, icon: 'none' });
      }
      renderSettings();
    });
  }
  function testNotification() {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      wx.showToast({ title: T().notifBlocked, icon: 'none' });
      return;
    }
    try { new Notification(T().notifTest, { body: T().appName }); } catch (e) { }
    wx.showToast({ title: T().notifSent, icon: 'none' });
  }

  function showDisclaimer() {
    var l = lang();
    wx.showModal({
      title: i18n.t('disclaimerTitle', l),
      content: disclaimerText(l),
      showCancel: false,
      confirmText: i18n.t('iKnow', l)
    });
  }

  function clearCacheConfirm() {
    var l = lang();
    wx.showModal({
      title: i18n.t('cache', l),
      content: i18n.t('clearCache', l) + '?',
      confirmText: i18n.t('clearCache', l),
      success: function (res) {
        if (res.confirm) {
          var n = api.clearCaches();
          try { wx.removeStorageSync(NATIONAL_STATUS_KEY); } catch (e) {}
          Object.keys(sessionStatus).forEach(function (k) { delete sessionStatus[k]; });
          nationalSweeping = false;
          refreshMaps();
          sweepNationalStatus();
          wx.showToast({ title: i18n.t('cacheCleared', l) + ' (' + n + ')', icon: 'none' });
          renderSettings();
        }
      }
    });
  }

  function resetAllConfirm() {
    var l = lang();
    wx.showModal({
      title: i18n.t('resetAll', l),
      content: i18n.t('resetAll', l) + '?',
      confirmText: i18n.t('iKnow', l),
      success: function (res) {
        if (res.confirm) {
          try { Object.keys(localStorage).forEach(function (k) { localStorage.removeItem(k); }); } catch (e) { }
          location.reload();
        }
      }
    });
  }

  function markGuideRead() {
    var active = data.getGuides()[guideIndex];
    var read = getReadGuides();
    if (read.indexOf(active.id) < 0) {
      read.push(active.id);
      wx.setStorageSync('guide_read', read);
    }
    softRerender();
  }

  /* ================================================================
   * 路由
   * ================================================================ */
  function parseQuery(qs) {
    var out = {};
    (qs || '').split('&').forEach(function (pair) {
      if (!pair) { return; }
      var kv = pair.split('=');
      out[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return out;
  }

  function route() {
    var raw = location.hash || '#/home';
    var parts = raw.replace(/^#/, '').split('?');
    var path = parts[0] || '/home';
    var query = parseQuery(parts[1]);
    window.scrollTo(0, 0);
    renderNav(path === '/map' ? '/home' : path);
    closeDrawer();
    clearInterval(countdownTimer);
    if (path !== '/products') {
      if (window.NDGames) { window.NDGames.stop(); }
      productsState.game = null;
    }
    switch (path) {
      case '/map': renderExpandedMap(); break;
      case '/detail': renderDetail(query.id); break;
      case '/guide': renderGuide(); break;
      case '/tools': renderTools(); break;
      case '/products': renderProducts(); break;
      case '/settings': renderSettings(); break;
      default:
        if (!homeState.city) { initRegion(); }
        renderHome();
        break;
    }
    renderFooter();
    updateConnectionNotice();
  }

  /* 保持滚动位置的重绘（答题/勾选时） */
  function softRerender() {
    var y = window.scrollY;
    route();
    window.scrollTo(0, y);
  }

  /* ================================================================
   * 全局事件委托
   * ================================================================ */
  document.getElementById('app').addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) { return; }
    var action = el.dataset.action;
    var d = el.dataset;
    switch (action) {
      case 'toggle-drawer': toggleDrawer(); break;
      case 'view-map-city': onMapClickCity(d.adcode); break;
      case 'open-picker': openPicker(); break;
      case 'open-district': openDistrictPicker(); break;
      case 'close-picker': closePicker(); break;
      case 'noop': break;
      case 'refresh':
        api.refreshSnapshot();
        homeState.loading = true;
        homeState.error = '';
        renderHome();
        loadHomeData();
        break;
      case 'refresh-map':
        api.refreshSnapshot();
        sweepNationalStatus(true, true);
        break;
      case 'toggle-map-fit': {
        var fitViewport = document.getElementById('expandedMapViewport');
        if (fitViewport) {
          var fitted = fitViewport.classList.toggle('map-fit');
          el.setAttribute('aria-pressed', String(fitted));
          el.classList.toggle('is-active', fitted);
        }
        break;
      }
      case 'select-province': selectProvince(d.name); break;
      case 'select-city': selectCity(d.name); break;
      case 'select-district': selectDistrict(d.name); break;
      case 'back-province':
        homeState.pickerView = 'province';
        homeState.pickerProvince = '';
        homeState.cities = [];
        renderPicker();
        break;
      case 'back-city':
        homeState.pickerView = 'city';
        renderPicker();
        break;
      case 'share': shareAlert(); break;
      case 'open-game':
        if (window.NDGames) { window.NDGames.stop(); }
        productsState.game = d.type || 'aqua';
        renderProducts();
        break;
      case 'back-products':
        if (window.NDGames) { window.NDGames.stop(); }
        productsState.game = null;
        renderProducts();
        break;
      case 'quiz-answer':
        if (quizState[d.qid] && quizState[d.qid].picked >= 0) { break; }
        quizState[d.qid] = { picked: parseInt(d.pick, 10) };
        softRerender();
        break;
      case 'rec-toggle': toggleMaterialIndex(parseInt(d.index, 10)); break;
      case 'guide-cat':
        guideIndex = parseInt(d.index, 10) || 0;
        renderGuide();
        break;
      case 'mark-read': markGuideRead(); break;
      case 'aid-tab':
        aidState.tab = parseInt(d.index, 10) || 0;
        aidState.step = 0;
        renderTools();
        break;
      case 'aid-prev':
        aidState.step = Math.max(0, aidState.step - 1);
        renderTools();
        break;
      case 'aid-next':
        aidState.step += 1;
        renderTools();
        break;
      case 'wizard-scene':
        wizard.scene = d.scene || 'home';
        renderTools();
        break;
      case 'wizard-next':
        wizard.stage = Math.min(2, wizard.stage + 1);
        renderTools();
        break;
      case 'wizard-back':
        wizard.stage = 0;
        renderTools();
        break;
      case 'wizard-restart':
        wizard.stage = 0;
        renderTools();
        break;
      case 'plan-save': savePlan(); break;
      case 'plan-export': exportPlan(); break;
      case 'toggle-material': toggleMaterial(parseInt(d.index, 10)); break;
      case 'toggle-lang': settingsUI.langExpanded = !settingsUI.langExpanded; renderSettings(); break;
      case 'select-lang':
        if (d.code && d.code !== lang()) {
          i18n.setLang(d.code);
          settingsUI.langExpanded = false;
          route();
        }
        break;
      case 'toggle-access': settingsUI.accessExpanded = !settingsUI.accessExpanded; renderSettings(); break;
      case 'select-scale':
        if (d.value && d.value !== access.textScale) { setAccess('textScale', d.value); renderSettings(); }
        break;
      case 'toggle-contrast':
        setAccess('contrast', access.contrast === '1' ? '0' : '1');
        renderSettings();
        break;
      case 'toggle-motion':
        setAccess('reduceMotion', access.reduceMotion === '1' ? '0' : '1');
        renderSettings();
        break;
      case 'toggle-notif': settingsUI.notifExpanded = !settingsUI.notifExpanded; renderSettings(); break;
      case 'toggle-notif-switch': toggleNotif(); break;
      case 'notif-interval':
        wx.setStorageSync('notif_interval', d.value || '30');
        startNotifier();
        renderSettings();
        break;
      case 'notif-test': testNotification(); break;
      case 'select-source':
        if (d.value && d.value !== api.getEffectiveDataSource()) {
          wx.setStorageSync(SOURCE_KEY, d.value);
          wx.showToast({ title: i18n.t('sourceSwitched', lang()), icon: 'none' });
          renderSettings();
        }
        break;
      case 'clear-cache': clearCacheConfirm(); break;
      case 'reset-all': resetAllConfirm(); break;
      case 'show-disclaimer': showDisclaimer(); break;
      default: break;
    }
  });

  /* 家庭计划输入（事件委托 input） */
  document.addEventListener('input', function (e) {
    var el = e.target.closest('[data-input]');
    if (!el) { return; }
    if (el.dataset.input === 'plan-field') {
      var p = wx.getStorageSync('family_plan') || { members: '', meeting: '', contact: '', needs: '' };
      p[el.dataset.field] = el.value;
      wx.setStorageSync('family_plan', p);
    }
  });

  /* ---------- 启动 ---------- */
  document.getElementById('app').addEventListener('toggle', function (event) {
    var topic = event.target.dataset && event.target.dataset.help;
    if (!topic) return;
    if (event.target.open) openExplanations.add(topic);
    else openExplanations.delete(topic);
  }, true);
  function offlineGuideText() {
    return safetyText(!('serviceWorker' in navigator) ? 'offlineUnsupported' : window.NDWOfflineReady ? 'offlineReady' : 'offlinePreparing');
  }
  function updateConnectionNotice() {
    var notice = document.getElementById('connectionNotice');
    if (notice) { notice.hidden = navigator.onLine !== false; notice.textContent = safetyText('offline'); }
    var guideStatus = document.getElementById('offlineGuideStatus');
    if (guideStatus) guideStatus.textContent = offlineGuideText();
  }
  window.addEventListener('ndw-offline-ready', updateConnectionNotice);
  window.addEventListener('offline', function () {
    Object.keys(sessionStatus).forEach(function (key) { sessionStatus[key].unavailable = true; });
    refreshMaps();
    if ((location.hash || '#/home') === '#/home') { homeState.hasData = false; homeState.loading = false; homeState.error = safetyText('offline'); renderHome(); }
    updateConnectionNotice();
  });
  window.addEventListener('online', function () {
    api.refreshSnapshot();
    if ((location.hash || '#/home') === '#/home') loadHomeData();
    else if (location.hash === '#/map') sweepNationalStatus(true);
    updateConnectionNotice();
  });
  loadAccess();

  /* 全息地球背景 */
  var bgCanvas = document.getElementById('bgGlobe');
  if (bgCanvas) {
    globe = holo.create(bgCanvas);
    globe.setCities(globeCities());
  }

  window.addEventListener('hashchange', route);
  if (!location.hash) { location.hash = '#/home'; }
  route();
  startNotifier();
})();
