/* ================================================================
 * ui.js —— Modal / Toast 的 DOM 实现
 * 由 shim.js 的 wx.showModal / wx.showToast 转发调用（window.__ui）。
 * ================================================================ */
(function () {
  var esc = window.NDCore.esc;
  var modalEl = document.getElementById('ui-modal');
  var toastEl = document.getElementById('ui-toast');
  if (!modalEl || !toastEl) { return; }

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
      toastEl.textContent = '';
      toastEl.appendChild(el);
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { if (el.parentNode) { el.parentNode.removeChild(el); } }, 2000);
    }
  };
})();
