/* ==== risk.js（自小程序 utils/risk.js 移植，逻辑保持一致） ==== */
(function () {
  var module = { exports: {} };
  var exports = module.exports;
/**
 * 次生灾害风险推算（utils/risk.js）
 *
 * 根据预警类型与预警级别，推算该预警可能引发的次生灾害及其发生概率。
 * 说明：概率为基于历史统计与预警级别的经验估算，供避险参考，
 * 不是气象部门的官方概率预报，实际以官方发布为准。
 *
 * 每项带 key（英文标识），界面渲染时用 i18n.riskItem(key, lang) 取
 * 当前语言下的名称与提示（utils/i18n.js 的 RISK_ITEMS 表）。
 */

// 各级别对应的发生概率权重（用于在灾害的基准区间内插值）
var LEVEL_STEP = {
  red: 1,
  orange: 0.75,
  yellow: 0.5,
  blue: 0.25
};

// 风险等级文字与颜色（按推算概率）
function riskTone(prob) {
  if (prob >= 70) {
    return { risk: '高', color: '#E53935' };
  }
  if (prob >= 40) {
    return { risk: '中', color: '#F57C00' };
  }
  return { risk: '低', color: '#1E88E5' };
}

// 预警类型 → 可能引发的次生灾害（[low, high] 为该灾害在此类预警下的概率区间）
var RULES = [
  {
    key: '暴雨',
    name: '暴雨',
    items: [
      { key: 'urban_flooding', name: '城市内涝', low: 50, high: 92, note: '低洼路段积水、下穿隧道进水' },
      { key: 'flash_flood_geo', name: '山洪/地质灾害', low: 35, high: 80, note: '山区中小河流洪水、滑坡、泥石流' },
      { key: 'farmland_waterlogging', name: '农田渍涝', low: 40, high: 78, note: '农田积水、作物受淹' }
    ]
  },
  {
    key: '台风',
    name: '台风',
    items: [
      { key: 'gale', name: '大风灾害', low: 55, high: 92, note: '广告牌、临时构筑物、树木倒伏' },
      { key: 'storm_surge', name: '风暴潮/巨浪', low: 30, high: 75, note: '沿海增水、海浪翻越堤坝' },
      { key: 'typhoon_rain_flood', name: '暴雨次生洪水', low: 45, high: 85, note: '台风外围环流带来的强降雨' }
    ]
  },
  {
    key: '高温',
    name: '高温',
    items: [
      { key: 'heatstroke', name: '中暑等健康风险', low: 45, high: 88, note: '户外作业、老人儿童更需注意' },
      { key: 'forest_fire_heat', name: '森林火险', low: 30, high: 72, note: '天干物燥，火源管理风险上升' },
      { key: 'drought_trend', name: '干旱趋势', low: 25, high: 60, note: '持续高温加剧土壤失墒' }
    ]
  },
  {
    key: '寒潮',
    name: '寒潮',
    items: [
      { key: 'freezing_damage', name: '冻害', low: 40, high: 82, note: '农作物、果树、养殖业受冻' },
      { key: 'road_ice_cold', name: '道路结冰', low: 35, high: 75, note: '路面湿滑，早晚高峰事故风险' },
      { key: 'health_cold', name: '健康风险', low: 30, high: 65, note: '心脑血管疾病、呼吸道疾病高发' }
    ]
  },
  {
    key: '暴雪',
    name: '暴雪',
    items: [
      { key: 'snow_road_ice', name: '道路积雪结冰', low: 55, high: 90, note: '高速公路封闭、车辆打滑' },
      { key: 'structure_collapse', name: '设施压垮', low: 25, high: 60, note: '简易棚、大棚、老旧房屋承压' },
      { key: 'traffic_block', name: '交通受阻', low: 45, high: 80, note: '航班延误、公交停运' }
    ]
  },
  {
    key: '大雾',
    name: '大雾',
    items: [
      { key: 'traffic_accident', name: '交通事故', low: 40, high: 82, note: '能见度低，高速追尾风险' },
      { key: 'flight_delay', name: '航班延误', low: 30, high: 70, note: '机场能见度不达标' },
      { key: 'respiratory_fog', name: '呼吸道影响', low: 20, high: 55, note: '雾中污染物不易扩散' }
    ]
  },
  {
    key: '雷电',
    name: '雷电',
    items: [
      { key: 'lightning_fire', name: '雷击火灾', low: 25, high: 65, note: '森林、易燃场所雷击起火' },
      { key: 'power_damage', name: '电力设施损坏', low: 30, high: 70, note: '雷击导致跳闸、设备受损' },
      { key: 'outdoor_work', name: '户外作业风险', low: 45, high: 85, note: '高处、空旷地带作业危险' }
    ]
  },
  {
    key: '大风',
    name: '大风',
    items: [
      { key: 'falling_objects', name: '高空坠物', low: 45, high: 85, note: '塔吊、广告牌、外墙脱落' },
      { key: 'structure_fall', name: '设施倒塌', low: 30, high: 72, note: '临时建筑、围挡、简易棚' },
      { key: 'fire_spread', name: '森林火险助燃', low: 20, high: 58, note: '大风加快火势蔓延' }
    ]
  },
  {
    key: '冰雹',
    name: '冰雹',
    items: [
      { key: 'crop_damage', name: '农作物受损', low: 45, high: 85, note: '砸伤作物、果树、蔬菜大棚' },
      { key: 'vehicle_home_damage', name: '车辆/房屋损坏', low: 35, high: 75, note: '车窗、屋面被砸破损' },
      { key: 'injury_risk', name: '人员受伤风险', low: 20, high: 55, note: '户外人员暴露风险' }
    ]
  },
  {
    key: '沙尘',
    name: '沙尘',
    items: [
      { key: 'air_quality', name: '空气质量恶化', low: 45, high: 85, note: 'PM10 浓度显著升高' },
      { key: 'traffic_dust', name: '交通影响', low: 30, high: 68, note: '能见度下降，风沙遮挡视线' },
      { key: 'respiratory_dust', name: '呼吸道健康风险', low: 35, high: 78, note: '敏感人群减少外出' }
    ]
  },
  {
    key: '干旱',
    name: '干旱',
    items: [
      { key: 'crop_loss', name: '农作物减产', low: 45, high: 85, note: '土壤墒情持续恶化' },
      { key: 'water_shortage', name: '饮水困难', low: 25, high: 62, note: '水库蓄水不足地区突出' },
      { key: 'forest_fire_drought', name: '森林火险', low: 30, high: 70, note: '植被干燥，易燃物增多' }
    ]
  },
  {
    key: '洪水',
    name: '洪水',
    items: [
      { key: 'urban_flooding', name: '城市内涝', low: 50, high: 88, note: '低洼地区排水压力大' },
      { key: 'landslide_mudflow', name: '滑坡/泥石流', low: 35, high: 78, note: '持续浸泡易诱发次生灾害' },
      { key: 'dyke_risk', name: '堤防风险', low: 25, high: 68, note: '中小河流、水库超警' }
    ]
  },
  {
    key: '地质灾害',
    name: '地质灾害',
    items: [
      { key: 'landslide', name: '滑坡', low: 45, high: 85, note: '边坡失稳，依山住户注意' },
      { key: 'mudflow', name: '泥石流', low: 30, high: 75, note: '沟谷地带暴雨后高发' },
      { key: 'collapse_rockfall', name: '塌方/落石', low: 35, high: 72, note: '山区道路通行风险' }
    ]
  },
  {
    key: '森林火险',
    name: '森林火险',
    items: [
      { key: 'fire_spread_forest', name: '火势蔓延', low: 45, high: 88, note: '风干物燥，火情扩散快' },
      { key: 'smoke_pollution', name: '烟霾污染', low: 25, high: 60, note: '下风向能见度与空气质量' }
    ]
  },
  {
    key: '霜冻',
    name: '霜冻',
    items: [
      { key: 'crop_frost', name: '农作物冻害', low: 45, high: 85, note: '花期/幼果期作物敏感' },
      { key: 'fruit_tree_damage', name: '果树受损', low: 35, high: 75, note: '幼芽、新梢受冻' }
    ]
  },
  {
    key: '海浪',
    name: '海浪',
    items: [
      { key: 'sea_work', name: '海上作业风险', low: 45, high: 88, note: '渔船、养殖平台注意回港避浪' },
      { key: 'coastal_flooding', name: '沿岸淹没', low: 25, high: 62, note: '巨浪翻越防波堤、海堤' }
    ]
  },
  {
    key: '道路结冰',
    name: '道路结冰',
    items: [
      { key: 'traffic_accident_ice', name: '交通事故', low: 50, high: 88, note: '桥面、背阴路段冰面湿滑' },
      { key: 'travel_block', name: '出行受阻', low: 35, high: 72, note: '公交延误、高速管制' }
    ]
  }
];

// 未命中任何类型时的兜底条目（任何预警都存在的一般次生影响）
var FALLBACK = [
  { key: 'traffic_impact', name: '交通出行影响', low: 25, high: 65, note: '恶劣天气导致道路通行受阻' },
  { key: 'facility_damage', name: '设施受损', low: 20, high: 58, note: '户外设施、管线受天气影响' },
  { key: 'health_safety', name: '健康安全风险', low: 20, high: 60, note: '户外活动人员注意防护' }
];

/**
 * 计算某预警的次生灾害风险列表
 * @param {object} alert 标准化后的预警对象（含 type、level）
 * @returns {Array<{key, name, prob, risk, color, note}>}
 */
function getRisks(alert) {
  var type = String((alert && alert.type) || '');
  var level = (alert && alert.level) || 'yellow';
  var step = LEVEL_STEP[level] !== undefined ? LEVEL_STEP[level] : LEVEL_STEP.yellow;

  var merged = {};
  var matched = false;
  RULES.forEach(function (rule) {
    if (type.indexOf(rule.key) > -1) {
      matched = true;
      rule.items.forEach(function (it) {
        // 多个类型命中同一灾害时取较高概率（按 key 合并）
        if (!merged[it.key] || it.high > merged[it.key].high) {
          merged[it.key] = it;
        }
      });
    }
  });
  if (!matched) {
    FALLBACK.forEach(function (it) {
      merged[it.key] = it;
    });
  }

  var risks = [];
  Object.keys(merged).forEach(function (key) {
    var it = merged[key];
    var prob = Math.round(it.low + (it.high - it.low) * step);
    var tone = riskTone(prob);
    risks.push({
      key: key,
      name: it.name,
      prob: prob,
      risk: tone.risk,
      color: tone.color,
      note: it.note || ''
    });
  });
  // 概率从高到低排列
  risks.sort(function (a, b) {
    return b.prob - a.prob;
  });
  return risks;
}

module.exports = {
  getRisks: getRisks,
  RULES: RULES
};
  window.__modules['risk'] = module.exports;
})();
