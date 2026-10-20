/* ================================================================
 * app.js —— 网页主控（全息预警系统 · NVIDIA 风深色科技主题）
 * hash 路由：#/home | #/detail?id= | #/guide | #/tools | #/products | #/settings
 * ================================================================ */
(function () {
  var api = __require('api');
  var i18n = __require('i18n');
  var cities = __require('cities');
  var config = __require('config');
  var risk = __require('risk');
  var data = __require('data');
  var districts = __require('districts');
  var charts = __require('charts');
  var holo = __require('holo-globe');
  __require('china-geo');

  var REGION_KEY = 'selected_region';
  var SOURCE_KEY = 'data_source_override';
  var APP_VERSION = '1.1.0';

  /* ---------- HTML 转义（接口文本不可信，防注入） ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function lang() { return i18n.getLang(); }
  function T(l) { return i18n.pack(l || lang()).t; }

  function formatNow() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

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

  /* ---------- 网页版特有文案（5 语言） ---------- */
  var WEB = {
    configHint: {
      zh: '请检查网络连接，或稍后重试；如持续失败，可能是当日接口免费配额已用尽',
      en: 'Check your network or try again later; persistent failures may mean the daily API quota is exhausted',
      es: 'Compruebe la conexión o inténtelo más tarde; si persiste, la cuota diaria de la API puede haberse agotado',
      fr: 'Vérifiez votre connexion ou réessayez plus tard ; en cas d’échec persistant, le quota quotidien de l’API est peut-être épuisé',
      it: 'Controlla la connessione o riprova più tardi; se il problema persiste, la quota giornaliera dell’API potrebbe essere esaurita'
    },
    srcWeathercn: {
      zh: '中国气象局授权官方数据，实时预警与实况天气',
      en: 'Official data authorized by the China Meteorological Administration',
      es: 'Datos oficiales autorizados por la Administración Meteorológica de China',
      fr: 'Données officielles autorisées par l’Administration météorologique chinoise',
      it: 'Dati ufficiali autorizzati dall’Amministrazione meteorologica cinese'
    },
    linkCopied: {
      zh: '链接已复制，可粘贴分享',
      en: 'Link copied, ready to share',
      es: 'Enlace copiado, listo para compartir',
      fr: 'Lien copié, prêt à partager',
      it: 'Link copiato, pronto da condividere'
    }
  };
  function web(key) { var l = lang(); return (WEB[key] && WEB[key][l]) || WEB[key].zh; }

  /* 免责声明：把“小程序/mini program/mini-app”改为“应用/app” */
  function disclaimerText(l) {
    return i18n.t('disclaimerContent', l)
      .replace('本小程序', '本应用')
      .replace('this mini program', 'this app')
      .replace('esta mini app', 'esta app')
      .replace('cette mini-app', 'cette app')
      .replace('questa mini-app', 'questa app');
  }

  /* ---------- 内联 SVG ---------- */
  var SVG = {
    brand: '<svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M16 2 3 7v9c0 8.2 5.6 12.4 13 14V2Z" fill="#1565c0"/><path d="M16 2v28c7.4-1.6 13-5.8 13-14V7L16 2Z" fill="#2e7d32"/><path d="M16.4 23.2C14.8 16.8 18.2 10.6 25.6 8.4c1.2 8-2.8 13.8-9.2 14.8Z" fill="#81c784"/><path d="M16.8 22.4c1.8-4 4.4-7.4 8-11.2" stroke="#2e7d32" stroke-width="0.8" fill="none"/><path d="M10.4 10.2C10.4 10.2 7.3 13.9 7.3 16.3C7.3 18.2 8.7 19.5 10.4 19.5C12.1 19.5 13.5 18.2 13.5 16.3C13.5 13.9 10.4 10.2 10.4 10.2Z" fill="#fff"/><path d="M9 16.6c-.2.8.2 1.4.8 1.6" stroke="#1565c0" stroke-width="0.7" fill="none" stroke-linecap="round"/><path d="M21.6 10.6c1.6 2 2.8 3.3 2.8 5.4a3.2 3.2 0 0 1-6.4 0c0-1.3.7-2.2 1.3-2.9.1 1.1.6 1.6 1.2 1.9-.4-1.7-.1-3 1.1-4.4Z" fill="#ff8a00"/><path d="M21.6 12.3c.8 1.2 1.3 2.1 1.3 3.4a1.7 1.7 0 0 1-3.4 0c0-.8.4-1.3.8-1.8.2.7.5 1 .9 1.2-.2-1.1 0-1.9.4-2.8Z" fill="#ffd54f"/><path d="M16 2 3 7v9c0 8.2 5.6 12.4 13 14 7.4-1.6 13-5.8 13-14V7L16 2Z" stroke="#0d1321" stroke-width="1" stroke-linejoin="round"/><line x1="16" y1="3" x2="16" y2="29" stroke="#0d1321" stroke-width="0.8"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    check: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    checkBox: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0c0f06" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    products: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#76b900" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/></svg>',
    refresh: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"/></svg>'
  };

  /* ---------- DOM 句柄 ---------- */
  var navEl = document.getElementById('navbar');
  var viewEl = document.getElementById('view');
  var footerEl = document.getElementById('siteFooter');
  var pickerEl = document.getElementById('picker');
  var modalEl = document.getElementById('ui-modal');
  var toastEl = document.getElementById('ui-toast');

  /* ---------- Modal / Toast ---------- */
  var toastTimer = null;
  window.__ui = {
    showModal: function (o) {
      var foot = o.showCancel === false
        ? '<button class="btn btn-green" data-ui="confirm">' + esc(o.confirmText || 'OK') + '</button>'
        : '<button class="btn btn-outline" data-ui="cancel">' + esc(o.cancelText || 'Cancel') + '</button>' +
          '<button class="btn btn-green" data-ui="confirm">' + esc(o.confirmText || 'OK') + '</button>';
      modalEl.innerHTML =
        '<div class="overlay"><div class="dialog">' +
        '<div class="dialog-head">' + esc(o.title || '') + '</div>' +
        '<div class="dialog-body">' + esc(o.content || '') + '</div>' +
        '<div class="dialog-foot">' + foot + '</div>' +
        '</div></div>';
      modalEl.onclick = function (e) {
        var btn = e.target.closest('[data-ui]');
        if (!btn) { return; }
        var act = btn.dataset.ui;
        modalEl.innerHTML = '';
        modalEl.onclick = null;
        if (o.success) { o.success({ confirm: act === 'confirm', cancel: act === 'cancel' }); }
      };
    },
    showToast: function (o) {
      var msg = typeof o === 'string' ? o : o.title;
      var el = document.createElement('div');
      el.className = 'toast';
      el.textContent = msg;
      toastEl.appendChild(el);
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { if (el.parentNode) { el.parentNode.removeChild(el); } }, 2000);
    }
  };

  /* ================================================================
   * 顶部导航（右上角目录）
   * ================================================================ */
  function navItems(l) {
    return [
      { path: '/home', hash: '#/home', label: i18n.t('tabIndex', l) },
      { path: '/guide', hash: '#/guide', label: i18n.t('tabGuide', l) },
      { path: '/tools', hash: '#/tools', label: i18n.t('tabTools', l) },
      { path: '/products', hash: '#/products', label: i18n.t('navProducts', l) },
      { path: '/settings', hash: '#/settings', label: i18n.t('tabSettings', l) }
    ];
  }

  function renderNav(activePath) {
    var l = lang();
    var items = navItems(l);
    var links = items.map(function (it) {
      return '<a class="nav-link ' + (it.path === activePath ? 'active' : '') + '" href="' + it.hash + '">' + esc(it.label) + '</a>';
    }).join('');
    var brand = '<a class="brand" href="#/home">' + SVG.brand +
      '<span class="brand-name">' + esc(i18n.t('appName', l)) + '</span></a>';

    navEl.innerHTML =
      '<nav class="navbar"><div class="nav-inner">' + brand +
      '<div class="nav-links">' + links + '</div>' +
      '<button class="nav-toggle" data-action="toggle-drawer" aria-label="' + esc(i18n.t('menu', l)) + '">' + SVG.menu + '</button>' +
      '</div></nav>' +
      '<div class="nav-drawer" id="navDrawer">' + links + '</div>';
  }

  function toggleDrawer() {
    var d = document.getElementById('navDrawer');
    if (d) { d.classList.toggle('open'); }
  }
  function closeDrawer() {
    var d = document.getElementById('navDrawer');
    if (d) { d.classList.remove('open'); }
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
          '<p class="footer-brand-desc">' + esc(t.heroSub) + '</p>' +
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
          '<p>' + esc(t.riskTip) + '</p>' +
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
    loading: true, error: '', dataSource: '', fromCache: false, lastUpdate: '',
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
      if (st) {
        if (st.high) { color = '#ff5252'; level = 'red'; }
        else if (st.count) { color = '#f7c948'; level = 'normal'; }
        else { color = '#46c263'; level = ''; }
      }
      return { lng: c.lng, lat: c.lat, color: color, level: level, label: c.name, adcode: c.adcode };
    });
  }
  function refreshMaps() {
    if (globe) { globe.setCities(globeCities()); }
    if (chinaMap) { chinaMap.setStatus(sessionStatus); }
  }

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

  function loadHomeData() {
    var region = currentRegion();
    var l = lang();
    homeState.adcode = region.adcode;
    api.fetchAll(region).then(function (res) {
      var raw = res.alerts || [];

      homeState.rawWeather = res.weather || null;
      homeState.rawSource = res.source || '';
      homeState.rawAlerts = raw;
      deriveHome(l);

      homeState.loading = false;
      homeState.error = res.ok ? '' : (res.error || '');
      homeState.fromCache = !!res.fromCache;
      homeState.lastUpdate = formatNow();

      sessionStatus[region.adcode] = {
        high: raw.some(function (a) { return a.level === 'red'; }),
        count: raw.length
      };
      if (region.adcode) { recordTrend(region.adcode, raw.length); }
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
  var PALETTE = ['#43e8cf', '#76b900', '#4aa8ff', '#f7c948', '#ff9433', '#ff5252',
    '#b388ff', '#46c263', '#ff7eb0', '#80deea', '#dce775', '#ffab91'];

  function renderHome() {
    var l = lang();
    var t = T(l);
    var s = homeState;
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
            '<div class="weather-temp">' + esc(tempNum) + '<small>' + esc(tempUnit || '°') + '</small></div>' +
            '<div class="weather-text">' + esc(s.weather.weather) + '</div>' +
          '</div>' +
          '<div class="weather-rows">' +
            '<div class="wr-item"><b>' + esc(t.wind) + '</b>' + esc(s.weather.wind) + '</div>' +
          '</div>' +
          '<div class="wc-source">' + esc(t.cityWeatherNote) + '</div>' +
          '<div class="wc-source">' + esc(i18n.tpl('providedBy', { source: s.dataSource }, l)) + '</div>' +
        '</div>'
      : '<div class="weather-card"><div class="spinner"></div><div style="text-align:center;color:var(--text-dim);font-size:.86rem">' + esc(t.loading) + '</div></div>';

    var html =
      '<section class="hero"><div class="container">' +
        '<div class="hero-inner">' +
          '<div class="hero-left">' +
            '<div class="eyebrow"><span class="pulse-dot"></span>' + esc(s.dataSource || t.loading) + '</div>' +
            '<h1 class="hero-title">' + esc(t.heroTitle) + '</h1>' +
            '<p class="hero-sub">' + esc(t.heroSub) + '</p>' +
            '<div class="hero-location">' +
              '<div class="hero-city">' + esc(displayCity) +
                '<small>' + esc(displayProvince) + '</small></div>' +
              '<button class="district-pill" data-action="open-district"><span class="status-dot status-' +
                (s.levelStats.red ? 'high' : s.shownAlerts.length ? 'normal' : 'none') + '"></span>' +
                esc(districtLabel) + ' <b>›</b></button>' +
              '<button class="btn btn-green btn-lg" data-action="open-picker">' + esc(t.ctaChooseCity) + '</button>' +
              '<button class="btn btn-outline btn-lg icon-btn" data-action="refresh" aria-label="' + esc(t.refresh) + '">' + SVG.refresh + '</button>' +
            '</div>' +
          '</div>' +
          weatherCard +
        '</div>' +

        '<div class="stat-row">' +
          statBox('lv-red', s.levelStats.red, t.redAlert) +
          statBox('lv-orange', s.levelStats.orange, t.orangeAlert) +
          statBox('lv-yellow', s.levelStats.yellow, t.yellowAlert) +
          statBox('lv-blue', s.levelStats.blue, t.blueAlert) +
        '</div>' +
      '</div></section>';

    /* ---- 全国全息态势图 ---- */
    html += '<section class="section section-alt"><div class="container">' +
      '<div class="section-head"><h2>' + esc(t.nationalSituation) + '</h2></div>' +
      '<div class="china-map-wrap" id="chinaMapWrap"></div>' +
      '<div class="map-legend">' +
        '<span><i class="status-dot status-none"></i>' + esc(t.legendSafe) + '</span>' +
        '<span><i class="status-dot status-normal"></i>' + esc(t.legendAlert) + '</span>' +
        '<span><i class="status-dot status-high"></i>' + esc(t.legendHigh) + '</span>' +
      '</div>' +
    '</div></section>';

    /* ---- 预警列表 ---- */
    html += '<section class="section"><div class="container">' +
      '<div class="section-head"><h2>' + esc(t.activeAlerts) + '</h2>' +
      '<span class="head-hint">' + esc(i18n.tpl('total', { n: s.shownAlerts.length }, l)) +
      (s.fromCache ? ' · ' + esc(t.cached) : '') +
      (s.lastUpdate ? ' · ' + esc(i18n.tpl('updatedAt', { time: s.lastUpdate }, l)) : '') +
      '</span></div>';

    if (s.error) {
      html += '<div class="state-box error"><span class="state-icon">!</span>' +
        '<div>' + esc(t.fetchFailed) + '</div><div style="margin-top:6px;font-size:.85rem">' + esc(s.error) + '</div>' +
        '<button class="btn btn-green" data-action="refresh">' + esc(t.retry) + '</button>' +
        '<div class="source-line" style="justify-content:center">' + esc(web('configHint')) + '</div></div>';
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
    html += '</div></section>';

    /* ---- 预警动态时间线 ---- */
    var tlAlerts = s.shownAlerts.slice().sort(function (a, b) {
      return String(b.time) < String(a.time) ? 1 : String(b.time) > String(a.time) ? -1 : 0;
    });
    html += '<section class="section section-alt"><div class="container">' +
      '<div class="section-head"><h2>' + esc(t.timeline) + '</h2></div>';
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
      html += '<div class="state-box">' + esc(t.noTimeline) + '</div>';
    }
    html += '</div></section>';

    /* ---- 类型分布 + TOP 风险 ---- */
    var typeCount = {}, typeOrder = [];
    var shownRaw = s.district
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

    html += '<section class="section"><div class="container two-col-grid">' +
      '<div class="panel-card"><div class="panel-card-title">' + esc(t.typeDist) + '</div>' +
        '<canvas id="typeDonut" data-h="240"></canvas></div>' +
      '<div class="panel-card"><div class="panel-card-title">' + esc(t.topRisks) + '</div>' +
        (topRisks.length ? topRisks.map(function (r) {
          var nm = i18n.riskItem(r.key, l);
          return '<div class="mini-risk"><span class="mini-risk-name">' + esc(nm.name) + '</span>' +
            '<span class="mini-risk-bar"><i style="width:' + r.prob + '%;background:' + r.color + '"></i></span>' +
            '<b>' + r.prob + '%</b></div>';
        }).join('') : '<div class="state-box">' + esc(t.noAlerts) + '</div>') +
      '</div>' +
    '</div></section>';

    /* ---- 趋势 ---- */
    var trendOb = (wx.getStorageSync('daily_trend') || {})[s.adcode] || {};
    var days = [], vals = [];
    for (var i = 13; i >= 0; i--) {
      var dt = new Date(Date.now() - i * 86400000);
      var key = pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
      days.push(key);
      vals.push(trendOb[key] || 0);
    }
    var recorded = Object.keys(trendOb).length;

    html += '<section class="section section-alt"><div class="container">' +
      '<div class="section-head"><h2>' + esc(t.trend) + '</h2>' +
        '<span class="head-hint">' + esc(displayCity) + ' · 14 ' + esc(t.dayShort) + '</span></div>';
    if (recorded < 2) {
      html += '<div class="state-box">' + esc(t.trendBuilding) + '</div>';
    } else {
      html += '<canvas id="trendLine" data-h="220"></canvas>';
    }
    html += '</div></section>';

    viewEl.innerHTML = html;
    document.title = t.tabIndex;

    /* 中国态势图 */
    var wrap = document.getElementById('chinaMapWrap');
    if (wrap) {
      chinaMap = __require('china-holo').create(wrap, onMapClickCity);
      chinaMap.setStatus(sessionStatus);
    }
    /* 图表 */
    var dc = document.getElementById('typeDonut');
    if (dc) { charts.donut(dc, donutData); }
    var tl = document.getElementById('trendLine');
    if (tl) { charts.line(tl, days, vals, '#43e8cf'); }
  }

  function onMapClickCity(adcode, name) {
    var geo = districts.getCityGeo(adcode);
    if (!geo) { return; }
    applyRegion({ province: geo.province, city: geo.name, adcode: adcode, district: '' });
    if ((location.hash || '') !== '#/home') { location.hash = '#/home'; }
    pickerEl.innerHTML = '';
  }

  function statBox(cls, num, label) {
    return '<div class="stat-box ' + cls + '">' +
      '<span class="stat-num" data-count="' + num + '">' + num + '</span>' +
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
      var allCls = allStatus ? (allStatus.high ? 'high' : allStatus.count ? 'normal' : 'none') : 'none';
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
      homeState.districtList = districtStatuses(homeState.adcode, res.alerts || []);
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
        if (st.adcode) {
          sessionStatus[st.adcode] = { high: st.status === 'high', count: st.count };
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
      homeState.districtList = districtStatuses(item.adcode, raw);
      if (item.adcode) {
        sessionStatus[item.adcode] = {
          high: raw.some(function (a) { return a.level === 'red'; }),
          count: raw.length
        };
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
      var riskText = r.risk === '高' ? i18n.t('riskHigh', l)
        : r.risk === '中' ? i18n.t('riskMedium', l) : i18n.t('riskLow', l);
      return Object.assign({}, r, { name: item.name || r.name, note: item.note || r.note, riskText: riskText });
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
      '</div></section>';

    html += '<section class="section"><div class="container detail-grid">' +
      '<div class="detail-main">' +

        /* 正文 */
        '<div class="dcard"><div class="dcard-title"><span class="title-bar"></span>' + esc(t.alertContent) + '</div>' +
          chipsHtml +
          '<div class="alert-body">' + esc(a.content) + '</div>' +
          '<div class="source-line"><span>' + esc(t.affectedArea) + '：</span><span class="source-tag">' + esc(a.area) + '</span></div>' +
          (a.focusArea ? '<div class="source-line"><span>' + esc(t.focusArea) + '：</span><span class="source-tag">' + esc(a.focusArea) + '</span></div>' : '') +
        '</div>';

    /* 影响范围图 */
    if (allChips.length) {
      html += '<div class="dcard"><div class="dcard-title"><span class="title-bar"></span>' + esc(t.impactDiagram) + '</div>' +
        radarSvg(allChips, focusChips) + '</div>';
    }

    /* 次生风险 */
    if (a.risks && a.risks.length) {
      html += '<div class="dcard"><div class="dcard-title"><span class="title-bar"></span>' + esc(t.riskPrediction) + '</div>' +
        a.risks.map(function (r) {
          var lvlClass = r.risk === '高' ? 'risk-level-high' : r.risk === '中' ? 'risk-level-mid' : 'risk-level-low';
          return '<div class="risk-item"><div class="risk-item-head">' +
            '<span class="risk-name">' + esc(r.name) + '</span>' +
            '<span class="risk-prob ' + lvlClass + '">' + r.prob + '% · ' + esc(r.riskText) + '</span></div>' +
            '<div class="risk-bar"><div class="risk-bar-inner" style="width:' + r.prob + '%;background:' + r.color + '"></div></div>' +
            '<div class="risk-note">' + esc(r.note) + '</div></div>';
        }).join('') +
        '<div class="risk-tip">' + esc(t.riskTip) + '</div></div>';
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
      '<div class="countdown-box" id="countdownBox">' + (end ? '' : esc(t.countdownEnded)) + '</div></div>';

    /* 发布信息 */
    html += '<div class="dcard"><div class="dcard-title"><span class="title-bar"></span>' + esc(t.publishInfo) + '</div>' +
      '<div class="info-rows">' +
        infoRow(t.issueBy, a.source) +
        infoRow(t.issueTime, a.time) +
        infoRow(t.validPeriod, a.duration) +
      '</div></div>';

    /* 防御 */
    if (a.defense && a.defense.length) {
      html += '<div class="dcard"><div class="dcard-title"><span class="title-bar"></span>' + esc(t.defenseGuide) + '</div>' +
        '<ul class="defense-list">' + a.defense.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></div>';
    }

    html += '<div class="detail-actions">' +
      '<a class="btn btn-green" href="tel:12121">' + esc(t.callHotline) + '</a>' +
      '<button class="btn btn-outline" data-action="share">' + esc(t.share) + '</button>' +
    '</div></aside></div></section>';

    viewEl.innerHTML = html;
    document.title = l === 'zh' ? (a.type + '预警') : i18n.disasterName(a.type, l);
    startCountdown(end);
  }

  function infoRow(label, value) {
    return '<div class="info-row"><span class="info-label">' + esc(label) + '</span>' +
      '<span class="info-value">' + esc(value) + '</span></div>';
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
  }

  function levelCls(w) {
    w = String(w);
    if (/红|Red|Rouge|Rojo|Rosso/i.test(w)) { return 'red'; }
    if (/橙|Orange|Naranja/i.test(w)) { return 'orange'; }
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
        icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#43e8cf" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6"/><circle cx="12" cy="14" r="2.2"/><path d="M3 20c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/></svg>'
      },
      {
        type: 'pyro',
        name: t.gamePyroName,
        desc: t.gamePyroDesc,
        icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#76b900" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3-2 4-2 7 0 1.5 1 2.5 2 3 0-2 1.5-3 2-5 .5 2 .5 4-1 6 1.5 0 3-1 3-3 0-2-2-3-2-5 0-1.5.5-2.5 1-3z"/><path d="M8 21h8"/></svg>'
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
    var reqCount = parseInt(localStorage.getItem('request_count'), 10);
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
      '<div class="set-row"><span class="set-row-label">' + esc(t.totalRequests) + '</span>' +
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
            new Notification(i18n.alertTitle(a.title, a.type, a.level, lang()), { body: a.area || '' });
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
    renderNav(path);
    closeDrawer();
    clearInterval(countdownTimer);
    if (path !== '/products') {
      if (window.NDGames) { window.NDGames.stop(); }
      productsState.game = null;
    }
    switch (path) {
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
      case 'open-picker': openPicker(); break;
      case 'open-district': openDistrictPicker(); break;
      case 'close-picker': closePicker(); break;
      case 'noop': break;
      case 'refresh':
        homeState.loading = true;
        homeState.error = '';
        renderHome();
        loadHomeData();
        break;
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
