/* ================================================================
 * shim.js —— 浏览器环境适配层
 * 把小程序 wx.* API 映射为浏览器能力，使移植过来的 utils 逻辑层
 * （config/data/cities/i18n/risk/api）无需改动即可运行：
 *   wx.request          → fetch（华风接口已开放 CORS，可直连）
 *   wx.*StorageSync     → localStorage（JSON 序列化，语义对齐小程序）
 *   wx.getStorageInfoSync → 遍历 localStorage
 *   wx.makePhoneCall    → tel: 链接
 *   wx.showModal/showToast → 由 app.js 注册的 DOM 实现
 * ================================================================ */
(function () {
  var modules = {};
  window.__modules = modules;

  // 简易 CommonJS：require('./config') / require('../../utils/i18n') 都按文件名解析
  window.__require = function (name) {
    var key = String(name).split('/').pop().replace(/\.js$/, '');
    return modules[key];
  };

  /* ---------- 存储 ---------- */

  function getStorageSync(key) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) {
        return ''; // 与小程序一致：取不到返回空字符串
      }
      return JSON.parse(raw);
    } catch (e) {
      return '';
    }
  }

  function setStorageSync(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // 存储失败不影响主流程
    }
  }

  function removeStorageSync(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // 忽略
    }
  }

  function getStorageInfoSync() {
    var keys = [];
    try {
      keys = Object.keys(localStorage);
    } catch (e) {
      keys = [];
    }
    return { keys: keys, currentSize: 0, limitSize: 0 };
  }

  /* ---------- 网络 ---------- */

  function bumpRequestCount() {
    try {
      var n = parseInt(localStorage.getItem('request_count'), 10);
      localStorage.setItem('request_count', String(isNaN(n) ? 1 : n + 1));
    } catch (e) { /* 忽略 */ }
  }

  function request(opt) {
    bumpRequestCount();
    fetch(opt.url, {
      method: opt.method || 'GET',
      headers: opt.header || { Accept: 'application/json' }
    })
      .then(function (res) {
        // 只要服务器有响应就走 success（含 4xx/5xx），与小程序 wx.request 语义一致；
        // 网络层错误（断网、CORS、超时）才走 fail
        return res.text().then(function (txt) {
          var data = null;
          try {
            data = txt ? JSON.parse(txt) : null;
          } catch (e) {
            data = txt;
          }
          return { statusCode: res.status, data: data };
        });
      })
      .then(function (r) {
        if (opt.success) { opt.success(r); }
        if (opt.complete) { opt.complete(r); }
      })
      .catch(function () {
        var err = { errMsg: 'request:fail' };
        if (opt.fail) { opt.fail(err); }
        if (opt.complete) { opt.complete(err); }
      });
  }

  /* ---------- UI（具体 DOM 实现由 app.js 注册到 window.__ui） ---------- */

  window.wx = {
    getStorageSync: getStorageSync,
    setStorageSync: setStorageSync,
    removeStorageSync: removeStorageSync,
    getStorageInfoSync: getStorageInfoSync,
    request: request,
    showModal: function (o) { if (window.__ui) { window.__ui.showModal(o); } },
    showToast: function (o) { if (window.__ui) { window.__ui.showToast(o); } },
    setNavigationBarTitle: function () { /* 网页无导航栏，忽略 */ },
    stopPullDownRefresh: function () { /* 网页无下拉刷新，忽略 */ },
    makePhoneCall: function (o) {
      if (o && o.phoneNumber) {
        window.location.href = 'tel:' + o.phoneNumber;
      }
    }
  };
})();
