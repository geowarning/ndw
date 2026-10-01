/* ==== cities.js（自小程序 utils/cities.js 移植，逻辑保持一致） ==== */
(function () {
  var module = { exports: {} };
  var exports = module.exports;
/**
 * 全国省级行政区数据（含省会/直辖市代表城市）
 * ================================================================
 * 城市 adcode 采用高德行政区划编码（与国家标准行政区划代码一致）。
 * key：华风爱科 Location Key（已预填 77 个常用城市，查询时直接使用，
 *      跳过定位搜索接口，每次查询节省 1 次 API 配额；未预填的城市仍按城市名自动解析）。
 * 预警查询按“所选省份 → 城市”执行：
 *   - 华风数据源：优先用预填的 key，未预填的城市用定位搜索接口解析
 *   - 高德数据源：直接用城市 adcode 查询天气/预警
 *
 * 如需支持更多城市：在对应省份的 extraCities 中按同结构追加
 * { name, adcode, key } 即可（key 可到华风「示例中心」定位搜索接口查询）。
 * ================================================================
 */
const PROVINCES = [
  { name: '北京市', adcode: '110000', city: '北京市', cityAdcode: '110100', cityKey: '101924', extraCities: [] },
  { name: '天津市', adcode: '120000', city: '天津市', cityAdcode: '120100', cityKey: '106780', extraCities: [] },
  { name: '上海市', adcode: '310000', city: '上海市', cityAdcode: '310100', cityKey: '106577', extraCities: [] },
  { name: '重庆市', adcode: '500000', city: '重庆市', cityAdcode: '500100', cityKey: '102144', extraCities: [] },
  {
    name: '河北省', adcode: '130000', city: '石家庄市', cityAdcode: '130100', cityKey: '102323',
    extraCities: [
      { name: '唐山市', adcode: '130200', key: '102324' },
      { name: '保定市', adcode: '130600', key: '58682' }
    ]
  },
  {
    name: '山西省', adcode: '140000', city: '太原市', cityAdcode: '140100', cityKey: '106770',
    extraCities: [
      { name: '大同市', adcode: '140200', key: '106771' },
      { name: '运城市', adcode: '140800', key: '60837' }
    ]
  },
  {
    name: '内蒙古自治区', adcode: '150000', city: '呼和浩特市', cityAdcode: '150100', cityKey: '106537',
    extraCities: [
      { name: '包头市', adcode: '150200', key: '106536' },
      { name: '鄂尔多斯市', adcode: '150600', key: '2333211' }
    ]
  },
  {
    name: '辽宁省', adcode: '210000', city: '沈阳市', cityAdcode: '210100', cityKey: '102136',
    extraCities: [
      { name: '大连市', adcode: '210200', key: '102133' }
    ]
  },
  {
    name: '吉林省', adcode: '220000', city: '长春市', cityAdcode: '220100', cityKey: '105915',
    extraCities: [
      { name: '吉林市', adcode: '220200', key: '105918' }
    ]
  },
  {
    name: '黑龙江省', adcode: '230000', city: '哈尔滨市', cityAdcode: '230100', cityKey: '102669',
    extraCities: [
      { name: '齐齐哈尔市', adcode: '230200', key: '102670' },
      { name: '大庆市', adcode: '230600', key: '102671' }
    ]
  },
  {
    name: '江苏省', adcode: '320000', city: '南京市', cityAdcode: '320100', cityKey: '105570',
    extraCities: [
      { name: '苏州市', adcode: '320500', key: '105571' },
      { name: '无锡市', adcode: '320200', key: '105573' },
      { name: '徐州市', adcode: '320300', key: '105572' }
    ]
  },
  {
    name: '浙江省', adcode: '330000', city: '杭州市', cityAdcode: '330100', cityKey: '106832',
    extraCities: [
      { name: '宁波市', adcode: '330200', key: '61620' },
      { name: '温州市', adcode: '330300', key: '61623' }
    ]
  },
  {
    name: '安徽省', adcode: '340000', city: '合肥市', cityAdcode: '340100', cityKey: '101841',
    extraCities: [
      { name: '芜湖市', adcode: '340200', key: '56925' },
      { name: '蚌埠市', adcode: '340300', key: '56913' }
    ]
  },
  {
    name: '福建省', adcode: '350000', city: '福州市', cityAdcode: '350100', cityKey: '102244',
    extraCities: [
      { name: '厦门市', adcode: '350200', key: '57919' },
      { name: '泉州市', adcode: '350500', key: '57918' }
    ]
  },
  {
    name: '江西省', adcode: '360000', city: '南昌市', cityAdcode: '360100', cityKey: '105850',
    extraCities: [
      { name: '赣州市', adcode: '360700', key: '59702' },
      { name: '九江市', adcode: '360400', key: '59710' }
    ]
  },
  {
    name: '山东省', adcode: '370000', city: '济南市', cityAdcode: '370100', cityKey: '106570',
    extraCities: [
      { name: '青岛市', adcode: '370200', key: '106573' },
      { name: '烟台市', adcode: '370600', key: '60644' }
    ]
  },
  {
    name: '河南省', adcode: '410000', city: '郑州市', cityAdcode: '410100', cityKey: '102675',
    extraCities: [
      { name: '洛阳市', adcode: '410300', key: '102676' },
      { name: '南阳市', adcode: '411300', key: '221586' }
    ]
  },
  {
    name: '湖北省', adcode: '420000', city: '武汉市', cityAdcode: '420100', cityKey: '103847',
    extraCities: [
      { name: '宜昌市', adcode: '420500', key: '59279' },
      { name: '襄阳市', adcode: '420600', key: '59272' }
    ]
  },
  {
    name: '湖南省', adcode: '430000', city: '长沙市', cityAdcode: '430100', cityKey: '105567',
    extraCities: [
      { name: '株洲市', adcode: '430200', key: '59425' },
      { name: '衡阳市', adcode: '430400', key: '105568' }
    ]
  },
  {
    name: '广东省', adcode: '440000', city: '广州市', cityAdcode: '440100', cityKey: '102255',
    extraCities: [
      { name: '深圳市', adcode: '440300', key: '58194' },
      { name: '珠海市', adcode: '440400', key: '58196' },
      { name: '佛山市', adcode: '440600', key: '58186' }
    ]
  },
  {
    name: '广西壮族自治区', adcode: '450000', city: '南宁市', cityAdcode: '450100', cityKey: '102263',
    extraCities: [
      { name: '桂林市', adcode: '450300', key: '58360' },
      { name: '柳州市', adcode: '450200', key: '102264' }
    ]
  },
  {
    name: '海南省', adcode: '460000', city: '海口市', cityAdcode: '460100', cityKey: '58633',
    extraCities: [
      { name: '三亚市', adcode: '460200', key: '58646' }
    ]
  },
  {
    name: '四川省', adcode: '510000', city: '成都市', cityAdcode: '510100', cityKey: '106774',
    extraCities: [
      { name: '绵阳市', adcode: '510700', key: '60974' },
      { name: '宜宾市', adcode: '511500', key: '60981' }
    ]
  },
  {
    name: '贵州省', adcode: '520000', city: '贵阳市', cityAdcode: '520100', cityKey: '102273',
    extraCities: [
      { name: '遵义市', adcode: '520300', key: '58497' }
    ]
  },
  {
    name: '云南省', adcode: '530000', city: '昆明市', cityAdcode: '530100', cityKey: '106812',
    extraCities: [
      { name: '大理白族自治州', adcode: '532900', key: '61417' }
    ]
  },
  {
    name: '西藏自治区', adcode: '540000', city: '拉萨市', cityAdcode: '540100', cityKey: '61329',
    extraCities: []
  },
  {
    name: '陕西省', adcode: '610000', city: '西安市', cityAdcode: '610100', cityKey: '106566',
    extraCities: [
      { name: '宝鸡市', adcode: '610300', key: '60461' },
      { name: '咸阳市', adcode: '610400', key: '60455' }
    ]
  },
  {
    name: '甘肃省', adcode: '620000', city: '兰州市', cityAdcode: '620100', cityKey: '102246',
    extraCities: [
      { name: '天水市', adcode: '620500', key: '58055' }
    ]
  },
  {
    name: '青海省', adcode: '630000', city: '西宁市', cityAdcode: '630100', cityKey: '356171',
    extraCities: []
  },
  {
    name: '宁夏回族自治区', adcode: '640000', city: '银川市', cityAdcode: '640100', cityKey: '60334',
    extraCities: []
  },
  {
    name: '新疆维吾尔自治区', adcode: '650000', city: '乌鲁木齐市', cityAdcode: '650100', cityKey: '106833',
    extraCities: [
      { name: '喀什地区', adcode: '653100', key: '2580069' }
    ]
  },
  { name: '台湾省', adcode: '710000', city: '台北市', cityAdcode: '710100', cityKey: '315078', extraCities: [] },
  { name: '香港特别行政区', adcode: '810000', city: '香港', cityAdcode: '810100', cityKey: '1123655', extraCities: [] },
  { name: '澳门特别行政区', adcode: '820000', city: '澳门', cityAdcode: '820100', cityKey: '60090', extraCities: [] }
];

/** 省份名称列表（供选择器使用） */
function getProvinceNames() {
  return PROVINCES.map(function (p) {
    return p.name;
  });
}

/** 按省份名称查找 */
function getProvinceByName(name) {
  return PROVINCES.find(function (p) {
    return p.name === name;
  }) || null;
}

/**
 * 获取某省份可选城市列表（省会 + 内置重点城市）
 */
function getCitiesOfProvince(provinceName) {
  const p = getProvinceByName(provinceName);
  if (!p) {
    return [];
  }
  const list = [{ name: p.city, adcode: p.cityAdcode, key: p.cityKey || '' }];
  (p.extraCities || []).forEach(function (c) {
    list.push({ name: c.name, adcode: c.adcode, key: c.key || '' });
  });
  return list;
}

/** 按城市名获取华风 Location Key（未预填返回空字符串） */
function getLocationKey(cityName) {
  for (let i = 0; i < PROVINCES.length; i++) {
    const p = PROVINCES[i];
    if (p.city === cityName) {
      return p.cityKey || '';
    }
    for (let j = 0; j < (p.extraCities || []).length; j++) {
      if (p.extraCities[j].name === cityName) {
        return p.extraCities[j].key || '';
      }
    }
  }
  return '';
}

module.exports = {
  PROVINCES: PROVINCES,
  getProvinceNames: getProvinceNames,
  getProvinceByName: getProvinceByName,
  getCitiesOfProvince: getCitiesOfProvince,
  getLocationKey: getLocationKey
};
  window.__modules['cities'] = module.exports;
})();
