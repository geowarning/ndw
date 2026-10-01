/* ==== config.js（自小程序 utils/config.js 移植，逻辑保持一致） ==== */
(function () {
  var module = { exports: {} };
  var exports = module.exports;
/**
 * 数据源配置
 * ================================================================
 * dataSource 可选值：
 *   'mock'      - 演示数据（默认，无需任何配置，适合体验界面）
 *   'weathercn' - 华风爱科天气 API（中国气象局授权官方数据，推荐）
 *   'amap'      - 高德开放平台天气 API（免费备选，预警字段不保证）
 *
 * 切换真实数据源：填好对应平台的 Key 后，把 dataSource 改为对应值即可。
 * 重要：真实接口失败时页面会显示错误提示，不会用演示数据冒充真实数据。
 * ================================================================
 */
module.exports = {
  dataSource: 'weathercn',

  // 华风爱科天气 API（中国气象局官方授权，推荐）
  // 注册：https://platform.weathercn.com
  // 步骤：注册开发者账号 → 实名认证 → 控制台创建应用 → 获取 OpenAPI Key
  // 说明：标准测试 Key 开通 30 天试用，每日 500 次免费调用（5 QPS），超额后需与企业商务洽谈配额
  weathercn: {
    apiKey: 'eVfsbObyqjCduc0dTT2AnnQfmDc2xzHt',
    host: 'https://openapi.weathercn.com'
  },

  // 高德开放平台（免费备选）
  // 注册：https://lbs.amap.com
  // 步骤：控制台 → 创建应用 → 添加 Key，服务平台选【Web服务】
  // 说明：天气查询有免费配额；预警信息不保证返回，建议预警仍以华风为准
  amap: {
    key: '',
    host: 'https://restapi.amap.com'
  },

  // 默认城市（首次打开或未选择省份时使用；用户在首页选择省份后会覆盖此处）
  defaultCity: {
    name: '广州市',
    // 华风 Location Key：留空时会优先使用 utils/cities.js 中预填的常用城市 Key，
    // 未预填的城市再按城市名自动解析（已预填 77 城，基本覆盖首页全部可选城市）
    locationKey: '',
    // 高德城市编码（adcode）
    adcode: '440100'
  },

  // 本地缓存时长（分钟）——用于减少接口配额消耗，多人使用时显著降低调用量
  cacheMinutes: 15,         // 预警数据缓存（原 5 分钟调大；预警变化不频繁，15 分钟足够及时）
  cacheWeatherMinutes: 30   // 实况天气缓存（天气更新更慢，缓存 30 分钟）
};
  window.__modules['config'] = module.exports;
})();
