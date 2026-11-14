/* Shared GDACS date/status rules. Search results also contain ended events. */
(function (root) {
  function time(value) {
    if (!value) return NaN;
    var s = String(value);
    return Date.parse(/(?:[zZ]|[+-]\d\d:?\d\d)$/.test(s) ? s : s + (s.length === 10 ? 'T00:00:00Z' : 'Z'));
  }
  function active(p, now) {
    var start = time(p.fromdate), end = time(p.todate);
    var current = p.iscurrent === true || String(p.iscurrent).toLowerCase() === 'true';
    return p._active !== false && current && isFinite(start) && isFinite(end) &&
      start <= now && now < end;
  }
  var api = { time: time, active: active };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GdacsStatus = api;
})(typeof window === 'object' ? window : globalThis);
