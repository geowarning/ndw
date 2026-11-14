#!/usr/bin/env node
/**
 * Collect GDACS disaster events, merge them with the existing snapshot and
 * preserve event history. Designed for GitHub Actions (Node 20).
 *
 *   node backend/collect-gdacs.mjs
 *   node backend/collect-gdacs.mjs --reconcile
 *
 * Storage is the static JSON snapshots in public-data/ (the GitHub Pages
 * "database"). Live contains only current reports within their reported time interval.
 * Complete records are retained in gdacs-disaster-history.json on every run.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import status from '../js/gdacs-status.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const EVENTS_FILE = path.join(ROOT, 'public-data', 'gdacs-events.json');
const HISTORY_FILE = path.join(ROOT, 'public-data', 'gdacs-disaster-history.json');

const API = process.env.GDACS_API_URL || 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH';
const TYPES = process.env.GDACS_TYPES || 'WF;FL;TC;DR;VO;TS';
const DAYS = Math.max(1, Number(process.env.GDACS_DAYS || 60));
const NOW = new Date();
const NOW_ISO = NOW.toISOString();
const FROM = new Date(NOW.getTime() - DAYS * 86400000).toISOString().slice(0, 10);
const TO = NOW.toISOString().slice(0, 10);

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err; // Never replace an unreadable archive with an empty one.
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

// Keep complete GeoJSON records, including ended and superseded episodes.
export function mergeEvents(existing, fresh, archive, now = Date.now()) {
  const map = new Map();
  for (const f of [...(archive.features || []), ...(existing.features || []), ...fresh.features]) {
    const p = f && f.properties;
    if (p && p.eventtype != null && p.eventid != null) map.set(keyOf(p), f);
  }
  const present = new Set(fresh.features.map(f => keyOf(f.properties || {})));
  const features = [...map.values()].map(f => ({ ...f, properties: {
    ...f.properties,
    _active: present.has(keyOf(f.properties)) && status.active({ ...f.properties, _active: true }, now)
  }}));
  // A newer episode replaces an older location/report for the same event.
  const latest = new Map();
  for (const f of features) {
    const p = f.properties, key = p.eventtype + ':' + p.eventid;
    const prev = latest.get(key);
    if (!prev || Number(p.episodeid) > Number(prev.properties.episodeid)) latest.set(key, f);
  }
  for (const f of features) {
    if (latest.get(f.properties.eventtype + ':' + f.properties.eventid) !== f) f.properties._active = false;
  }
  return { live: features.filter(f => f.properties._active), history: features };
}

async function fetchCurrent() {
  const response = await fetch('https://www.gdacs.org/xml/rss.xml', {
    headers: { Accept: 'application/rss+xml, application/xml' }, signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw Error('GDACS current feed HTTP ' + response.status);
  return JSON.parse(execFileSync('python3', [path.join(HERE, 'parse-gdacs-feed.py')], {
    input: await response.text(), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024
  }));
}

async function main() {
  const [{ data: search, url }, current] = await Promise.all([fetchFresh(), fetchCurrent()]);
  const fresh = { features: current.features.map(f => {
    const matches = search.features.filter(s => s.properties.eventtype === f.properties.eventtype && String(s.properties.eventid) === String(f.properties.eventid) && (!f.properties.episodeid || String(s.properties.episodeid) === String(f.properties.episodeid)));
    const detail = matches.sort((a,b) => Number(b.properties.episodeid) - Number(a.properties.episodeid))[0];
    return { ...f, properties: { ...(detail?.properties || {}), ...f.properties, episodeid: f.properties.episodeid || detail?.properties.episodeid || '', _verifiedAt: NOW_ISO } };
  }) };
  const existing = readJson(EVENTS_FILE, { features: [] });
  const archive = readJson(HISTORY_FILE, { features: [] });
  const merged = mergeEvents(existing, fresh, { features: [...(archive.features || []), ...search.features] }, NOW.getTime());
  const output = {
    type: 'FeatureCollection', generatedAt: NOW_ISO, source: 'GDACS',
    endpoint: url, currentFeed: 'https://www.gdacs.org/xml/rss.xml', checkedAt: NOW_ISO, fromDate: FROM, toDate: TO,
    count: merged.live.length, bbox: bboxOf(merged.live), features: merged.live
  };
  // Persist history first so removal from Live can never discard a record.
  writeJson(HISTORY_FILE, {
    ...archive, type: 'FeatureCollection', source: 'GDACS', updatedAt: NOW_ISO,
    count: merged.history.length, features: merged.history
  });
  writeJson(EVENTS_FILE, output);
  console.log('GDACS: ' + merged.live.length + ' live, ' + merged.history.length + ' archived records');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((err) => {
  console.error('GDACS collection failed:', err && err.message ? err.message : err);
  process.exitCode = 1;
});
