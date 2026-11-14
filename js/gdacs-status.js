/* Shared GDACS date/status rules. Search results also contain ended events. */
(function (root) {
  function time(value) {
    if (!value) return NaN;
    var s = String(value);
    return Date.parse(/(?:Z|GMT|UTC|[+-]\d\d:?\d\d)$/i.test(s) ? s : s + (s.length === 10 ? 'T00:00:00Z' : 'Z'));
  }
  function active(p, now) {
    var current = p.iscurrent === true || String(p.iscurrent).toLowerCase() === 'true';
    var verified = time(p._verifiedAt);
    // todate describes a reporting period; it is not proof of incident closure.
    return p._active !== false && current && p._currentFeed === true &&
      isFinite(verified) && verified <= now + 300000;
  }
  function fresh(p, now) { var verified = time(p._verifiedAt); return isFinite(verified) && verified <= now + 300000 && now - verified < 1800000; }
  var api = { time: time, active: active, fresh: fresh };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GdacsStatus = api;
})(typeof window === 'object' ? window : globalThis);
