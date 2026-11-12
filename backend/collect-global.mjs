import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = path.join(root, 'public-data', 'global-earthquakes.json');

function iso(ms) {
  return Number.isFinite(ms) ? new Date(ms).toISOString() : '';
}

async function fromApizero(key) {
  const res = await fetch('https://v1.apizero.cn/api/earthquake', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ period: 'day', level: 'all', min_magnitude: 2.5, order: 'time', limit: 300 })
  });
  const body = await res.json();
  if (body.code !== 0) throw new Error(`apizero code ${body.code}: ${body.msg}`);
  const list = (body.data.earthquakes || []).map((e) => {
    const ts = Number(e.timestamp) || Date.parse(String(e.time || '').replace(' ', 'T') + 'Z');
    return {
      id: e.id,
      magnitude: Number(e.magnitude),
      magnitude_type: e.magnitude_type || '',
      place: e.place || '',
      time: iso(ts),
      timestamp: ts,
      updated: e.updated ? iso(Date.parse(String(e.updated).replace(' ', 'T') + 'Z')) : '',
      longitude: Number(e.longitude),
      latitude: Number(e.latitude),
      depth_km: Number(e.depth_km),
      alert: e.alert || null,
      tsunami: !!e.tsunami,
      felt: e.felt == null ? null : Number(e.felt),
      intensity_cdi: e.intensity_cdi == null ? null : Number(e.intensity_cdi),
      intensity_mmi: e.intensity_mmi == null ? null : Number(e.intensity_mmi),
      significance: e.significance == null ? null : Number(e.significance),
      status: e.status || '',
      event_type: e.event_type || 'earthquake',
      url: ''
    };
  }).filter((q) => Number.isFinite(q.magnitude) && Number.isFinite(q.longitude) && Number.isFinite(q.latitude));
  list.sort((a, b) => b.timestamp - a.timestamp);
  const summary = body.data.summary || {};
  return {
    source: 'APIZERO',
    sourceName: '极数本源 · 全球地震速报',
    sourceUrl: 'https://apizero.cn/',
    period: 'day',
    generatedAt: summary.generated_at || new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
    summary: {
      count: list.length,
      total: Number(summary.total) || list.length,
      max_magnitude: Number(summary.max_magnitude) || list.reduce((m, q) => Math.max(m, q.magnitude), 0),
      period: summary.period || 'day',
      level: summary.level || 'all'
    },
    earthquakes: list
  };
}

async function fromUsgs() {
  const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson', {
    headers: { 'User-Agent': 'ndw-collector/1.0' }
  });
  if (!res.ok) throw new Error(`USGS HTTP ${res.status}`);
  const body = await res.json();
  const list = (body.features || []).map((f) => {
    const p = f.properties || {};
    const c = (f.geometry && f.geometry.coordinates) || [];
    const ts = Number(p.time);
    return {
      id: f.id,
      magnitude: p.mag,
      magnitude_type: p.magType || '',
      place: p.place || '',
      time: iso(ts),
      timestamp: ts,
      updated: iso(Number(p.updated)),
      longitude: Number(c[0]),
      latitude: Number(c[1]),
      depth_km: Number(c[2]),
      alert: p.alert || null,
      tsunami: !!p.tsunami,
      felt: p.felt == null ? null : Number(p.felt),
      intensity_cdi: p.cdi == null ? null : Number(p.cdi),
      intensity_mmi: p.mmi == null ? null : Number(p.mmi),
      significance: p.sig == null ? null : Number(p.sig),
      status: p.status || '',
      event_type: p.type || 'earthquake',
      url: p.url || ''
    };
  }).filter((q) => Number.isFinite(q.magnitude) && Number.isFinite(q.longitude) && Number.isFinite(q.latitude));
  list.sort((a, b) => b.timestamp - a.timestamp);
  return {
    source: 'USGS',
    sourceName: 'USGS Earthquake Hazards Program',
    sourceUrl: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/',
    period: 'day',
    generatedAt: (body.metadata && body.metadata.generated) ? new Date(body.metadata.generated).toISOString() : new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
    summary: {
      count: list.length,
      total: list.length,
      max_magnitude: list.reduce((m, q) => Math.max(m, q.magnitude), 0),
      period: 'day',
      level: 'all'
    },
    earthquakes: list
  };
}

let data = null;
let note = '';
const key = process.env.APIZERO_KEY;
if (!key) {
  note = 'APIZERO_KEY 未配置';
} else {
  try {
    data = await fromApizero(key);
  } catch (e) {
    note = String(e.message || e);
  }
}
if (!data) {
  data = await fromUsgs();
  if (note) {
    console.error('apizero fallback:', note);
    data.note = key ? 'apizero 调用失败，当前使用 USGS 实时源' : 'APIZERO_KEY 未配置，当前使用 USGS 实时源';
  }
}
await fs.mkdir(path.dirname(outFile), { recursive: true });
await fs.writeFile(outFile, JSON.stringify(data, null, 1) + '\n');
console.log('wrote', outFile, '| source', data.source, '| events', data.earthquakes.length, note ? '| ' + note : '');
