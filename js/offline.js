(function () {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.ready
      .then(function () { return Promise.all(['index.html', 'js/guide-locales.js'].map(function (file) { return caches.match(new URL(file, document.baseURI).href); })); })
      .then(function (saved) {
        if (saved.some(function (response) { return !response; })) return;
        window.NDWOfflineReady = true;
        window.dispatchEvent(new Event('ndw-offline-ready'));
      }).catch(function () { /* Never claim that an unsuccessful cache is ready. */ });
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(function () {});
  });
})();
