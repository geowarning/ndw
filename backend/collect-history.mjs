#!/usr/bin/env node
/**
 * Collect historical data used by the Database tab and the recent-history
 * mode in Global Hazards.
 *
 *  - public-data/global-quakes-recent.json  (USGS, last 30 days, 2.5+)
 *  - public-data/gdacs-disaster-history.json (GDACS, monthly chunks, 24 months)
 *
 * Run daily by .github/workflows/collect-history.yml.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const RECENT_FILE = path.join(ROOT, 'public-data', 'global-quakes-recent.json');
const GDACS_FILE = path.join(ROOT, 'public-data', 'gdacs-disaster-history.json');
const NOW = new Date();
const DAY = 86400000;

function isoDate(d) { return d.toISOString().slice(0, 10); }
function writeJson(file, value) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, file);
}
async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'GeoWarning/1.0 (+https://geowarning.cn)', Accept: 'application/json' },
    signal: AbortSignal.timeout(60000)
  });
  if (!res.ok) { throw new Error(url + ' HTTP ' + res.status); }
  return res.json();
}

async function collectRecent() {
  const end = new Date(NOW);
  const start = new Date(NOW.getTime() - 30 * DAY);
  const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson' +
    '&starttime=' + isoDate(start) + '&endtime=' + isoDate(end) +
    '&minmagnitude=2.5&orderby=time';
  const data = await fetchJson(url);
  const rows = [];
  (data.features || []).forEach((f) => {
    const p = f.properties || {};
    const c = (f.geometry && f.geometry.coordinates) || [];
    if (!isFinite(p.time) || !isFinite(c[0]) || !isFinite(c[1]) || !isFinite(p.mag)) { return; }
    rows.push([p.time, c[0], c[1], isFinite(c[2]) ? c[2] : 0, p.mag, p.place || '', p.type || 'earthquake']);
  });
  rows.sort((a, b) => b[0] - a[0]);
  const out = {
    source: 'USGS',
    timezone: 'UTC',
    count: rows.length,
    range: [rows.length ? rows[rows.length - 1][0] : start.getTime(), rows.length ? rows[0][0] : end.getTime()],
    rows
  };
  writeJson(RECENT_FILE, out);
  console.log('USGS recent: ' + rows.length + ' rows');
}

function monthStart(d) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)); }
function nextMonth(d) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)); }
function monthEnd(d) { return new Date(nextMonth(d).getTime() - DAY); }

async function collectGdacsHistory() {
  const start = monthStart(new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth() - 23, 1)));
  const seen = new Set();
  const features = [];
  for (let d = start; d <= NOW; d = nextMonth(d)) {
    const from = isoDate(d);
    const to = isoDate(monthEnd(d) > NOW ? NOW : monthEnd(d));
    const url = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH' +
      '?eventlist=' + encodeURIComponent('WF;FL;TC;DR') +
      '&fromDate=' + from + '&toDate=' + to +
      '&alertlevel=' + encodeURIComponent('Green;Orange;Red');
    try {
      const data = await fetchJson(url);
      (data.features || []).forEach((f) => {
        const p = f.properties || {};
        const key = [p.eventtype, p.eventid, p.episodeid].join(':');
        if (!key || key === '::' || seen.has(key)) { return; }
        seen.add(key);
        features.push(f);
      });
      console.log('GDACS ' + from.slice(0, 7) + ': ' + (data.features || []).length);
    } catch (err) {
      console.warn('GDACS ' + from.slice(0, 7) + ' failed: ' + (err.message || err));
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  features.sort((a, b) => String((b.properties || {}).datemodified || '').localeCompare(String((a.properties || {}).datemodified || '')));
  const out = {
    source: 'GDACS',
    updatedAt: NOW.toISOString(),
    range: [isoDate(start), isoDate(NOW)],
    count: features.length,
    features
  };
  writeJson(GDACS_FILE, out);
  console.log('GDACS history: ' + features.length + ' events');
}

async function main() {
  await collectRecent();
  await collectGdacsHistory();
}
main().catch((err) => {
  console.error('History collection failed:', err && err.message ? err.message : err);
  process.exitCode = 1;
});
