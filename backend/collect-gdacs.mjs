#!/usr/bin/env node
/**
 * Collect GDACS disaster events, merge them with the existing snapshot and
 * preserve event history. Designed for GitHub Actions (Node 20).
 *
 *   node backend/collect-gdacs.mjs
 *   node backend/collect-gdacs.mjs --reconcile
 *
 * Storage is the static JSON snapshots in public-data/ (the GitHub Pages
 * "database"). Existing events are never removed; they are marked inactive
 * when GDACS stops returning them so the site can still show history.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const EVENTS_FILE = path.join(ROOT, 'public-data', 'gdacs-events.json');
const HISTORY_FILE = path.join(ROOT, 'public-data', 'gdacs-history.json');

const API = process.env.GDACS_API_URL || 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH';
const TYPES = process.env.GDACS_TYPES || 'WF;FL;TC;DR';
const DAYS = Math.max(1, Number(process.env.GDACS_DAYS || 60));
const RECONCILE = process.argv.includes('--reconcile');
const NOW = new Date();
const NOW_ISO = NOW.toISOString();
const FROM = new Date(NOW.getTime() - DAYS * 86400000).toISOString().slice(0, 10);
const TO = NOW.toISOString().slice(0, 10);

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return fallback;
  }
}

function writeJson(file, value) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, file);
}

function keyOf(props) {
  return [props.eventtype, props.eventid, props.episodeid].join(':');
}

async function fetchFresh() {
  const url = API + '?eventlist=' + encodeURIComponent(TYPES) +
    '&fromDate=' + encodeURIComponent(FROM) +
    '&toDate=' + encodeURIComponent(TO) +
    '&alertlevel=' + encodeURIComponent('Green;Orange;Red');
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'GeoWarning/1.0 (+https://geowarning.cn)',
          Accept: 'application/json'
        },
        signal: AbortSignal.timeout(30000)
      });
      if (!res.ok) {
        throw new Error('GDACS API HTTP ' + res.status);
      }
      const data = await res.json();
      if (!data || !Array.isArray(data.features)) {
        throw new Error('GDACS API returned no FeatureCollection');
      }
      return { data, url };
    } catch (err) {
      lastErr = err;
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

function bboxOf(features) {
  let minLon = 180, minLat = 90, maxLon = -180, maxLat = -90;
  features.forEach((f) => {
    const c = f && f.geometry && f.geometry.coordinates;
    if (!Array.isArray(c) || !isFinite(c[0]) || !isFinite(c[1])) { return; }
    minLon = Math.min(minLon, c[0]);
    maxLon = Math.max(maxLon, c[0]);
    minLat = Math.min(minLat, c[1]);
    maxLat = Math.max(maxLat, c[1]);
  });
  return minLon <= maxLon ? [minLon, minLat, maxLon, maxLat] : undefined;
}

function updateHistory(features) {
  const hist = readJson(HISTORY_FILE, { version: 1, events: {} });
  const events = Object.assign({}, hist.events || {});
  features.forEach((f) => {
    const p = f.properties || {};
    const key = keyOf(p);
    if (!key || key === '::') { return; }
    const prev = events[key] || {};
    events[key] = {
      firstSeen: prev.firstSeen || p._firstSeen || NOW_ISO,
      lastSeen: NOW_ISO,
      modified: p.datemodified || '',
      type: p.eventtype || '',
      eventid: p.eventid,
      episodeid: p.episodeid,
      country: p.country || '',
      name: p.name || '',
      alert: p.alertlevel || ''
    };
  });
  writeJson(HISTORY_FILE, {
    version: 1,
    updatedAt: NOW_ISO,
    source: 'GDACS',
    events
  });
  console.log('History reconciled: ' + Object.keys(events).length + ' events');
}

async function main() {
  const { data: fresh, url } = await fetchFresh();
  if (!fresh.features.length) {
    console.warn('GDACS returned no events; keeping the existing snapshot.');
    return;
  }

  const existing = readJson(EVENTS_FILE, { type: 'FeatureCollection', features: [] });
  const map = new Map();
  (existing.features || []).forEach((f) => {
    if (f && f.properties) { map.set(keyOf(f.properties), f); }
  });

  const freshKeys = new Set();
  let added = 0, updated = 0, unchanged = 0;
  fresh.features.forEach((f) => {
    const p = f.properties || {};
    if (p.eventtype == null || p.eventid == null) { return; }
    const key = keyOf(p);
    freshKeys.add(key);
    const prev = map.get(key);
    const prevP = (prev && prev.properties) || {};
    const changed = !prev ||
      String(prevP.datemodified || '') !== String(p.datemodified || '') ||
      String(prevP.alertlevel || '') !== String(p.alertlevel || '') ||
      String(prevP.iscurrent || '') !== String(p.iscurrent || '') ||
      String(prevP.todate || '') !== String(p.todate || '');
    if (!prev) { added++; }
    else if (changed) { updated++; }
    else { unchanged++; }
    f.properties = Object.assign({}, prevP, p, {
      _firstSeen: prevP._firstSeen || NOW_ISO,
      _lastSeen: (!prev || changed) ? NOW_ISO : (prevP._lastSeen || NOW_ISO),
      _active: true
    });
    map.set(key, f);
  });

  let deactivated = 0;
  map.forEach((f, key) => {
    if (freshKeys.has(key)) { return; }
    if (f.properties && f.properties._active !== false) {
      f.properties = Object.assign({}, f.properties, { _active: false });
      deactivated++;
    }
  });

  const features = Array.from(map.values()).sort((a, b) => {
    const da = (a.properties && a.properties.datemodified) || '';
    const db = (b.properties && b.properties.datemodified) || '';
    return String(db).localeCompare(String(da));
  });

  const changed = added + updated + deactivated > 0;
  const output = {
    type: 'FeatureCollection',
    generatedAt: changed ? NOW_ISO : (existing.generatedAt || NOW_ISO),
    source: 'GDACS',
    endpoint: url,
    fromDate: FROM,
    toDate: TO,
    count: features.length,
    bbox: bboxOf(features),
    features
  };

  if (changed) {
    writeJson(EVENTS_FILE, output);
    console.log('GDACS snapshot updated: +' + added + ' new, ' + updated + ' changed, ' + deactivated + ' inactive, ' + features.length + ' total');
  } else {
    console.log('GDACS snapshot unchanged (' + features.length + ' events)');
  }

  if (RECONCILE) {
    updateHistory(features);
  }
}

main().catch((err) => {
  console.error('GDACS collection failed:', err && err.message ? err.message : err);
  process.exitCode = 1;
});
