/* ==== api.js（自小程序 utils/api.js 移植，逻辑保持一致） ==== */
(function () {
  var module = { exports: {} };
  var exports = module.exports;
/**
 * 数据获取适配层
 * ================================================================
 * 根据 utils/config.js 中 dataSource 的配置，从真实接口或演示数据
 * 获取预警与天气信息。支持按区域（省份 → 城市）查询，覆盖全国。
 * 所有入口统一返回：
 *   { ok, mock, source, alerts, weather, error }
 *
 * 设计约定：
 * 1. 真实接口失败时不会回退演示数据（避免误导用户），而是返回 error 供页面展示错误态；
 * 2. 查询目标城市：页面传入 region（用户选择的省份对应城市）→ 兜底 config.defaultCity；
 * 3. 预警数据按城市分别缓存（config.cacheMinutes 分钟），减少接口配额消耗；
 * 4. 坐标顺序注意：华风 q 为「纬度,经度」，高德 location 为「经度,纬度」。
 * ================================================================
 */
const config = __require('config');
const mock = __require('data');
const cities = __require('cities');
const i18n = __require('i18n');

const LEVELS = mock.LEVELS;
const ALERT_CACHE_PREFIX = 'alerts_cache_';
const WEATHER_CACHE_PREFIX = 'weather_cache_';
const REGION_STORAGE_KEY = 'selected_region';
const DATA_SOURCE_STORAGE_KEY = 'data_source_override';

/**
 * 生效数据源：优先设置页（utils 缓存覆盖），否则用 utils/config.js 配置。
 * 设置页切换后无需改代码，重新加载即生效。
 */
function effectiveDataSource() {
  let ds = config.dataSource;
  try {
    const ov = wx.getStorageSync(DATA_SOURCE_STORAGE_KEY);
    // 演示数据仅可通过 utils/config.js 手动切换，设置页不提供该选项；
    // 忽略历史残留的 mock 覆盖，避免界面被锁在演示模式
    if (ov === 'weathercn' || ov === 'amap') {
      ds = ov;
    }
  } catch (e) {
    // 读取失败沿用配置值
  }
  return ds;
}

/* ---------- 基础工具 ---------- */

function request(url) {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      method: 'GET',
      timeout: 8000,
      header: { 'Accept': 'application/json' },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error('请求失败（HTTP ' + res.statusCode + '）'));
        }
      },
      fail: function () {
        reject(new Error('网络请求失败，请检查网络连接'));
      }
    });
  });
}

function readCache(key, minutes) {
  try {
    const data = wx.getStorageSync(key);
    if (!data || !data.time) {
      return null;
    }
    const expires =
      (minutes !== undefined ? minutes : config.cacheMinutes) * 60 * 1000;
    if (Date.now() - data.time > expires) {
      return null;
    }
    return data.value;
  } catch (e) {
    return null;
  }
}

function writeCache(key, value) {
  try {
    wx.setStorageSync(key, { time: Date.now(), value: value });
  } catch (e) {
    // 缓存失败不影响主流程
  }
}

/* 内存预警注册表：缓存 TTL 过期或跨缓存读取时，详情页仍可凭 id 取到本次会话已加载的预警 */
var ALERT_REGISTRY = {};
function rememberAlerts(alerts) {
  (alerts || []).forEach(function (a) {
    if (a && a.id) { ALERT_REGISTRY[a.id] = a; }
  });
}
function writeAlertCache(key, alerts) {
  rememberAlerts(alerts);
  writeCache(key, alerts);
}

function pickFirst(data) {
  if (Array.isArray(data)) {
    return data[0] || null;
  }
  if (data && Array.isArray(data.items)) {
    return data.items[0] || null;
  }
  return data || null;
}

function normalizeLevelKey(raw) {
  const map = {
    '1': 'red', '2': 'orange', '3': 'yellow', '4': 'blue',
    red: 'red', orange: 'orange', yellow: 'yellow', blue: 'blue',
    红: 'red', 橙: 'orange', 黄: 'yellow', 蓝: 'blue',
    红色: 'red', 橙色: 'orange', 黄色: 'yellow', 蓝色: 'blue',
    extreme: 'red', severe: 'orange', moderate: 'yellow', minor: 'blue'
  };
  const key = map[String(raw || '').toLowerCase()];
  return key || 'yellow';
}

/**
 * 影响区域字段在官方接口中可能是字符串、数组或对象，
 * 统一转换为可读文本；传入城市名时对未带城市前缀的区县名补全（如“天河区”→“广州市天河区”）。
 */
function stringifyArea(area, cityName) {
  if (!area) {
    return '';
  }
  let text;
  if (typeof area === 'string') {
    text = area;
  } else if (Array.isArray(area)) {
    text = area
      .map(function (a) {
        if (!a) {
          return '';
        }
        if (typeof a === 'string') {
          return a;
        }
        return a.LocalizedName || a.EnglishName || a.Name || a.name || '';
      })
      .filter(Boolean)
      .join('、');
  } else {
    text =
      area.LocalizedName || area.EnglishName || area.Name || area.name || String(area);
  }
  // 区县名补全城市前缀：接口常只返回“天河区”，展示为“广州市天河区”
  if (cityName && text) {
    const shortName = cityName.replace(/市$/, '');
    if (text.indexOf(cityName) < 0 && text.indexOf(shortName) < 0) {
      const first = text.split('、')[0];
      text = cityName + first + text.slice(first.length);
    }
  }
  return text;
}

/**
 * 发布单位字段名在不同数据源中不一致，取多个候选。
 */
function pickSource(item) {
  const v =
    item.SenderName || item.senderName ||
    item.Source || item.source ||
    item.SourceName || item.sourceName ||
    item.Sender || item.sender ||
    '';
  return v || '气象部门';
}

function formatTime(t) {
  if (!t) {
    return '';
  }
  if (typeof t === 'number') {
    const d = new Date(t);
    const pad = function (n) {
      return n < 10 ? '0' + n : '' + n;
    };
    return (
      d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
    );
  }
  return String(t).replace('T', ' ').slice(0, 16);
}

/**
 * 从预警正文中尽力提取防御指南分条（按“防御指南/防范指南”之后分句）
 */
function splitDefense(content) {
  if (!content) {
    return [];
  }
  let text = String(content);
  const mark1 = text.indexOf('防御指南');
  const mark2 = text.indexOf('防范指南');
  if (mark1 > -1) {
    text = text.slice(mark1 + 4);
  } else if (mark2 > -1) {
    text = text.slice(mark2 + 4);
  }
  const parts = text
    .split(/(?:[；;]\s*|\n+|(?:\d+[\.、]))/)
    .map(function (s) {
      return s.trim();
    })
    .filter(function (s) {
      return s.length > 3;
    });
  return parts
    .slice(0, 8)
    .map(function (s) {
      return s.replace(/^[（(]?\d+[）).、]\s*/, '');
    });
}

/**
 * 把任意来源的预警字段统一为页面使用的结构
 */
/**
 * 从预警正文中提取受影响区县（华风 Area[].Text 含区县级信息，如“广州市越秀区、天河区”）。
 * @returns {{list: string[], focus: string[]}} list=全部受影响区县（去重保序）；
 *   focus=正文中“其中/尤其/特别是/最”等词后出现的区县（判断受影响最重的区）
 */
function extractDistricts(text) {
  const list = [];
  const focus = [];
  if (!text) {
    return { list: list, focus: focus };
  }
  const exclude = /(风景区|开发区|高新区|工业园区|保税区|度假区|示范区|科技园)/;
  const re = /([\u4e00-\u9fff]{1,4}(?:区|县))/g;
  const seen = {};
  const matches = [];
  let m;
  while ((m = re.exec(text))) {
    // 清洗：去掉城市前缀与引导词（“北京市朝阳区”→“朝阳区”，“其中朝阳区”→“朝阳区”），并记录清洗后区名的真实位置
    let d = m[1];
    let pos = m.index;
    const si = d.lastIndexOf('市');
    if (si > -1) {
      d = d.slice(si + 1);
      pos += si + 1;
    }
    const lead = d.match(/^(重点关注|其中|包括|预计|位于|主要在|重点|关注|全市|及|和|点)/);
    if (lead) {
      d = d.slice(lead[0].length);
      pos += lead[0].length;
    }
    if (!d || d.length < 2 || exclude.test(d)) {
      continue;
    }
    // 位置记录保留全部出现（供重点区判断），展示列表去重
    matches.push({ name: d, index: pos });
    if (!seen[d]) {
      seen[d] = true;
      list.push(d);
    }
  }
  // 重点影响区：正文中“其中/尤其/特别是/尤为/最”之后 20 字内出现的区县
  // （用位置索引判断，避免字符串切片截断产生半个区名）
  const kwRe = /重点关注|其中|尤其|特别是|尤为|最/g;
  let kwm;
  while ((kwm = kwRe.exec(text))) {
    const kp = kwm.index;
    matches.forEach(function (mt) {
      if (mt.index >= kp && mt.index <= kp + 20 && focus.indexOf(mt.name) < 0) {
        focus.push(mt.name);
      }
    });
  }
  return { list: list, focus: focus };
}

/**
 * 组装影响区域：优先从正文提取区县级信息（带城市前缀）；
 * 正文无区县时回退 Area 字段（可能是城市级），再回退城市名。
 * 非中文语言（en-us 请求）：区县名仅官方以中文提供，直接使用接口的英文城市名，
 * 避免在非中文界面出现中文区县。
 */
function buildArea(item, cityName, lang) {
  const areaRaw = item.Area || item.area;
  const firstArea = Array.isArray(areaRaw) ? areaRaw[0] : areaRaw;
  const textRaw =
    item.Text || item.AlertText || item.alertText ||
    (firstArea && (firstArea.Text || firstArea.text)) ||
    (firstArea && (firstArea.Summary || firstArea.summary)) || '';
  if (lang && lang !== 'zh') {
    const fallback = stringifyArea(areaRaw, '');
    return { area: fallback || '', focus: [] };
  }
  const d = extractDistricts(textRaw);
  if (d.list.length) {
    return { area: (cityName || '') + d.list.join('、'), focus: d.focus };
  }
  const fallback = stringifyArea(areaRaw, cityName);
  return { area: fallback || (cityName || ''), focus: d.focus };
}

/**
 * 从正文中提取具体发布单位（如“广州市气象台”），提取不到时回退 Source 字段。
 */
function extractPublisher(text) {
  if (!text) {
    return '';
  }
  const m = String(text).match(/([\u4e00-\u9fff]{2,12}?(?:气象台|气象局|应急管理厅|应急管理局|人民政府))/);
  return m ? m[1] : '';
}

function normalizeAlert(item, opts) {
  if (!item) {
    return null;
  }
  const type = item.Type || item.Category || item.type || '气象';
  const level = normalizeLevelKey(item.Level || item.AlarmLevel || item.Severity || item.level);
  const lv = LEVELS[level] || LEVELS.yellow;
  const areaRaw = item.Area || item.area;
  const firstArea = Array.isArray(areaRaw) ? areaRaw[0] : areaRaw;
  const startTime =
    item.StartTime || item.startTime || item.IssueTime || item.issueTime ||
    (firstArea && (firstArea.StartTime || firstArea.startTime)) ||
    Date.now();
  const endTime =
    item.ExpirationTime || item.expirationTime || item.EndTime || item.endTime ||
    (firstArea && (firstArea.EndTime || firstArea.endTime)) || '';
  const title =
    item.HeadlineText || item.headlineText ||
    (item.Description && item.Description.Localized) ||
    item.title || (type + '预警');
  const content =
    item.Text || item.text || item.AlertText || item.alertText ||
    (firstArea && (firstArea.Text || firstArea.text)) ||
    (firstArea && (firstArea.Summary || firstArea.summary)) ||
    item.Summary || item.summary || '';
  const areaInfo = buildArea(item, opts && opts.city, opts && opts.lang);
  const rawId = item.AlertID || item.alertId || item.id || (type + '_' + String(startTime));
  const publisher = extractPublisher(content) || pickSource(item);
  return {
    id: 'wc_' + String(rawId),
    cityName: (opts && opts.city) || '',
    type: type,
    level: level,
    levelName: lv.name,
    color: lv.color,
    bg: lv.bg,
    title: title,
    area: areaInfo.area || '待补充',
    focusArea: areaInfo.focus.length ? areaInfo.focus.join('、') : '',
    time: formatTime(startTime),
    source: publisher,
    status: '生效中',
    duration: formatTime(startTime) + (endTime ? ' 至 ' + formatTime(endTime) : ''),
    summary: (firstArea && (firstArea.Summary || firstArea.summary)) || item.Summary || item.summary || '',
    content: content || title,
    defense: splitDefense(content)
  };
}

/* ---------- 区域处理 ---------- */

/**
 * 规范化查询区域：region 缺省时回退 config.defaultCity
 * @param {{province?: string, city?: string, adcode?: string}} [region]
 */
function normalizeRegion(region) {
  if (region && region.city) {
    return {
      province: region.province || '',
      city: region.city,
      adcode: region.adcode || '',
      cacheKey: region.adcode || region.city
    };
  }
  return {
    province: '',
    city: config.defaultCity.name,
    adcode: config.defaultCity.adcode || '',
    cacheKey: config.defaultCity.adcode || config.defaultCity.name
  };
}

/** 读取用户选择的区域（供详情页读取对应缓存） */
function getCurrentRegion() {
  let region = null;
  try {
    region = wx.getStorageSync(REGION_STORAGE_KEY) || null;
  } catch (e) {
    region = null;
  }
  return normalizeRegion(region);
}

/* ---------- 华风爱科（中国气象局授权官方数据） ---------- */

function weathercnResolveKey(apiKey, host, region) {
  // 1) 配置了默认城市 Location Key 且查询的就是该城市时直接使用
  if (config.defaultCity.locationKey && region.city === config.defaultCity.name) {
    return Promise.resolve(config.defaultCity.locationKey);
  }
  // 2) 命中 cities.js 预填的常用城市 Key → 直接使用，省 1 次定位解析请求
  const preKey = cities.getLocationKey(region.city);
  if (preKey) {
    return Promise.resolve(preKey);
  }
  // 3) 兜底：按城市名搜索（支持任意城市）
  const url =
    host + '/locations/v1/cities/translate?apikey=' + apiKey +
    '&q=' + encodeURIComponent(region.city) +
    '&language=zh-cn&details=false';
  return request(url).then(function (data) {
    const item = pickFirst(data);
    if (item && item.Key) {
      return item.Key;
    }
    throw new Error('城市「' + region.city + '」解析失败，请检查城市名称或网络');
  });
}

/**
 * 华风接口统一请求 zh-cn（中文原文），所有语言的界面文案
 * 由 utils/i18n.js 在页面层翻译——保证西/法/意等语言完整对应。
 */
function weathercnFetchAlerts(apiKey, host, locationKey, region) {
  const url =
    host + '/alerts/v1/' + locationKey + '.json?apikey=' + apiKey +
    '&details=true&language=zh-cn';
  return request(url).then(function (data) {
    const list = Array.isArray(data) ? data : (data && data.alerts) || [];
    return list
      .map(function (item) {
        return normalizeAlert(item, { city: region && region.city, lang: i18n.getLang() });
      })
      .filter(Boolean);
  });
}

function weathercnFetchWeather(apiKey, host, locationKey) {
  const url =
    host + '/currentconditions/v1/' + locationKey + '.json?apikey=' + apiKey +
    '&language=zh-cn';
  return request(url).then(function (data) {
    const item = pickFirst(data);
    if (!item) {
      return null;
    }
    const temp = item.Temperature && item.Temperature.Metric
      ? Math.round(item.Temperature.Metric.Value) + '℃'
      : '';
    const wind =
      item.Wind && item.Wind.Direction && item.Wind.Speed && item.Wind.Speed.Metric
        ? item.Wind.Direction.Localized + item.Wind.Speed.Metric.Value + 'km/h'
        : '';
    return {
      weather: item.WeatherText || '',
      temp: temp,
      wind: wind,
      aqi: ''
    };
  });
}

/* ---------- 高德开放平台（免费备选） ---------- */

function amapResolveAdcode(key, host, region) {
  if (region.adcode) {
    return Promise.resolve(region.adcode);
  }
  // 兜底：按城市名查询行政区划编码
  const url =
    host + '/v3/config/district?keywords=' + encodeURIComponent(region.city) +
    '&subdistrict=0&extensions=base&key=' + key;
  return request(url).then(function (data) {
    if (
      data && data.status === '1' &&
      data.districts && data.districts[0] && data.districts[0].adcode
    ) {
      return data.districts[0].adcode;
    }
    throw new Error('城市「' + region.city + '」adcode 解析失败');
  });
}

function amapFetchWeather(key, host, adcode, cityName) {
  const url =
    host + '/v3/weather/weatherInfo?key=' + key +
    '&city=' + adcode + '&extensions=all';
  return request(url).then(function (data) {
    if (!data || data.status !== '1') {
      throw new Error((data && data.info) || '高德天气接口返回失败');
    }
    const lives = data.lives && data.lives[0];
    const weather = lives
      ? {
          weather: lives.weather || '',
          temp: lives.temperature ? lives.temperature + '℃' : '',
          wind: (lives.winddirection || '') + (lives.windpower || '') + '级',
          aqi: ''
        }
      : null;
    // 预警：高德当前文档未保证返回 alerts，尽力解析
    const alerts = Array.isArray(data.alerts)
      ? data.alerts.map(function (a) {
          return {
            id: 'amap_' + (a.id || (a.type + '_' + (a.pubtime || Date.now()))),
            type: a.type || '气象',
            level: normalizeLevelKey(a.level),
            title: a.title || (a.type + '预警'),
            area: stringifyArea(a.area, cityName) || '待补充',
            time: formatTime(a.pubtime),
            source: '高德天气',
            status: '生效中',
            duration: formatTime(a.pubtime) + (a.endtime ? ' 至 ' + formatTime(a.endtime) : ''),
            content: a.text || '',
            defense: splitDefense(a.text || '')
          };
        })
      : [];
    return { weather: weather, alerts: alerts };
  });
}

/* ---------- 统一入口 ---------- */

/**
 * 获取预警 + 天气摘要（按区域）
 * @param {{province?: string, city?: string, adcode?: string}} [region]
 * @returns Promise<{ ok, mock, source, alerts, weather, error }>
 */
function fetchAll(region) {
  return new Promise(function (resolve) {
    const source = effectiveDataSource();
    const r = normalizeRegion(region);
    // 数据统一为中文原文，界面语言在页面层翻译，缓存无需按语言隔离
    const alertCacheKey = ALERT_CACHE_PREFIX + r.cacheKey;
    const weatherCacheKey = WEATHER_CACHE_PREFIX + r.cacheKey;

    if (source === 'weathercn') {
      const cfg = config.weathercn;
      if (!cfg.apiKey) {
        resolve({
          ok: false,
          mock: false,
          source: '华风爱科天气API',
          alerts: [],
          weather: null,
          error: '未配置华风爱科 API Key，请在 js/config.js 中填写'
        });
        return;
      }
      const cachedAlerts = readCache(alertCacheKey);
      if (cachedAlerts) {
        rememberAlerts(cachedAlerts);
        resolve({
          ok: true,
          mock: false,
          source: '华风爱科天气API（中国气象局授权）',
          alerts: cachedAlerts,
          weather: readCache(weatherCacheKey, config.cacheWeatherMinutes),
          fromCache: true
        });
        return;
      }
      weathercnResolveKey(cfg.apiKey, cfg.host, r)
        .then(function (locationKey) {
          return Promise.all([
            weathercnFetchAlerts(cfg.apiKey, cfg.host, locationKey, r),
            weathercnFetchWeather(cfg.apiKey, cfg.host, locationKey).catch(function () {
              return null;
            })
          ]);
        })        .then(function (results) {
          writeAlertCache(alertCacheKey, results[0]);
          if (results[1]) {
            writeCache(weatherCacheKey, results[1]);
          }
          resolve({
            ok: true,
            mock: false,
            source: '华风爱科天气API（中国气象局授权）',
            alerts: results[0],
            weather: results[1]
          });
        })
        .catch(function (err) {
          resolve({
            ok: false,
            mock: false,
            source: '华风爱科天气API',
            alerts: [],
            weather: null,
            error: err && err.message ? err.message : '预警获取失败'
          });
        });
      return;
    }

    if (source === 'amap') {
      const cfg = config.amap;
      if (!cfg.key) {
        resolve({
          ok: false,
          mock: false,
          source: '高德天气API',
          alerts: [],
          weather: null,
          error: '未配置高德 Key，请在 js/config.js 中填写'
        });
        return;
      }
      const cachedAlerts = readCache(alertCacheKey);
      if (cachedAlerts) {
        rememberAlerts(cachedAlerts);
        resolve({
          ok: true,
          mock: false,
          source: '高德天气API',
          alerts: cachedAlerts,
          weather: readCache(weatherCacheKey, config.cacheWeatherMinutes),
          fromCache: true
        });
        return;
      }
      amapResolveAdcode(cfg.key, cfg.host, r)
        .then(function (adcode) {
          return amapFetchWeather(cfg.key, cfg.host, adcode, r.city);
        })
        .then(function (result) {
          writeAlertCache(alertCacheKey, result.alerts);
          if (result.weather) {
            writeCache(weatherCacheKey, result.weather);
          }
          resolve({
            ok: true,
            mock: false,
            source: '高德天气API',
            alerts: result.alerts,
            weather: result.weather
          });
        })
        .catch(function (err) {
          resolve({
            ok: false,
            mock: false,
            source: '高德天气API',
            alerts: [],
            weather: null,
            error: err && err.message ? err.message : '预警获取失败'
          });
        });
      return;
    }

    // mock 演示模式：按所选省份展示该省省会城市的演示预警
    resolve({
      ok: true,
      mock: true,
      source: '演示数据',
      alerts: mock.getAlerts(),
      weather: mock.getWeatherSummary()
    });
  });
}

/**
 * 按 ID 获取单条预警（从当前区域的缓存读取，其次演示数据）
 */
function getAlertById(id) {
  const r = getCurrentRegion();
  const cached = readCache(ALERT_CACHE_PREFIX + r.cacheKey);
  if (cached && cached.length) {
    const found = cached.find(function (a) {
      return a.id === id;
    });
    if (found) {
      return found;
    }
  }
  return ALERT_REGISTRY[id] || null;
}

/**
 * 批量获取一批城市的预警状态（用于省份城市列表的状态点）。
 * 状态：none=无预警（绿） / normal=有预警（黄） / high=含红色预警（红） / unknown=查询失败（灰）
 * 说明：逐个串行查询以控制接口频率（华风约 5 QPS）；5 分钟内命中本地缓存，不重复请求。
 * @param {Array<{name: string, adcode?: string}>} cities
 * @returns Promise<Array<{name, adcode, status, count}>>
 */
function fetchCitiesStatus(cities) {
  const results = [];
  function next(i) {
    if (i >= cities.length) {
      return Promise.resolve(results);
    }
    const c = cities[i];
    return fetchAll({ city: c.name, adcode: c.adcode || '' })
      .then(function (res) {
        const list = res.alerts || [];
        const count = list.length;
        const hasRed = list.some(function (a) {
          return a.level === 'red';
        });
        const status = hasRed ? 'high' : count > 0 ? 'normal' : 'none';
        results.push({ name: c.name, adcode: c.adcode || '', status: status, count: count });
        return next(i + 1);
      })
      .catch(function () {
        results.push({ name: c.name, adcode: c.adcode || '', status: 'unknown', count: 0 });
        return next(i + 1);
      });
  }
  return next(0);
}

/**
 * 防御指南（静态知识数据，不需要接口）
 */
function getGuides() {
  return mock.getGuides();
}

/**
 * 清除本地预警/天气缓存（设置页“清除缓存”）
 * @returns {number} 清除的缓存条目数
 */
function clearCaches() {
  let count = 0;
  try {
    const info = wx.getStorageInfoSync();
    (info.keys || []).forEach(function (k) {
      if (k.indexOf(ALERT_CACHE_PREFIX) === 0 || k.indexOf(WEATHER_CACHE_PREFIX) === 0) {
        wx.removeStorageSync(k);
        count += 1;
      }
    });
  } catch (e) {
    // 忽略存储异常
  }
  return count;
}

/**
 * 缓存统计（设置页显示）
 * @returns {{count: number, sizeKB: number}}
 */
function getCacheInfo() {
  let count = 0;
  let sizeKB = 0;
  try {
    const info = wx.getStorageInfoSync();
    (info.keys || []).forEach(function (k) {
      if (k.indexOf(ALERT_CACHE_PREFIX) === 0 || k.indexOf(WEATHER_CACHE_PREFIX) === 0) {
        count += 1;
      }
    });
    sizeKB = info.currentSize || 0;
  } catch (e) {
    // 忽略存储异常
  }
  return { count: count, sizeKB: sizeKB };
}

module.exports = {
  fetchAll: fetchAll,
  fetchCitiesStatus: fetchCitiesStatus,
  getAlertById: getAlertById,
  getGuides: getGuides,
  clearCaches: clearCaches,
  getCacheInfo: getCacheInfo,
  getEffectiveDataSource: effectiveDataSource
};
  window.__modules['api'] = module.exports;
})();
