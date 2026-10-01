/* ==== i18n.js（自小程序 utils/i18n.js 移植，逻辑保持一致） ==== */
(function () {
  var module = { exports: {} };
  var exports = module.exports;
/**
 * 多语言支持（utils/i18n.js）
 *
 * 支持语言：zh（中文）/ en（English）/ es（Español）/ fr（Français）/ it（Italiano）
 * 用法（在各页面 js 顶部引入本模块，路径按页面所在目录层级填写，如 pages/index 下为 ../../utils/i18n）：
 *   const i18n = loadI18n();            // 引入本模块
 *   const lang = i18n.getLang();        // 当前语言 code
 *   i18n.setLang('en');                 // 切换语言（存本地）
 *   i18n.t('refresh', lang);            // 取界面文案
 *   i18n.disasterName('暴雨', lang);    // 灾害类型名称翻译
 *   i18n.pack(lang);                    // 打包该语言全部界面文案（供页面 setData）
 *   i18n.phones(lang) / i18n.materials(lang) / i18n.tips(lang)  // 工具页列表翻译
 */

var LANG_STORAGE_KEY = 'app_lang';

var LANGUAGES = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' }
];

// ---- 界面文案（5 语言） ----
var UI = {
  zh: {
    appName: '自然灾害预警',
    tabIndex: '预警中心',
    tabGuide: '防御指南',
    tabTools: '应急工具',
    language: '语言',
    selectLanguage: '选择语言',
    switchTip: '点击上方区域可切换省份（全国覆盖）',
    refresh: '刷新',
    realtimeWeather: '实时天气',
    providedBy: '由 {source} 提供',
    redAlert: '红色预警',
    orangeAlert: '橙色预警',
    yellowAlert: '黄色预警',
    blueAlert: '蓝色预警',
    mockTip: '提示：当前展示为演示数据。接入真实预警接口后（utils/config.js 配置 API Key），将显示官方实时预警',
    fetchFailed: '预警数据获取失败',
    retry: '重新加载',
    configHint: '请检查 utils/config.js 中 API Key 配置，以及小程序后台 request 合法域名（开发阶段可在开发者工具勾选「不校验合法域名」）',
    dataSource: '数据来源',
    cached: '（本地缓存）',
    updatedAt: '更新于 {time}',
    activeAlerts: '当前生效预警',
    total: '共 {n} 条',
    loading: '加载中…',
    noAlerts: '当前没有生效中的预警',
    affectedArea: '影响区域',
    selectProvince: '选择省份',
    close: '关闭',
    provinceHint: '选择省份后可选择该省城市；右侧圆点：绿=无预警，黄=有预警，红=含红色预警',
    footerTip: '预警信息以国家预警信息发布中心及当地气象、应急管理部门官方发布为准',
    alertContent: '预警内容',
    riskPrediction: '次生灾害风险预测',
    riskTip: '根据预警类型与预警级别推算的发生概率，仅供参考，以官方发布为准',
    riskLevel: '风险{level}',
    riskHigh: '高风险',
    riskMedium: '中风险',
    riskLow: '低风险',
    defenseGuide: '防御指南',
    publishInfo: '发布信息',
    issueBy: '发布单位',
    issueTime: '发布时间',
    validPeriod: '预计时段',
    callHotline: '拨打气象服务热线 12121',
    share: '分享给亲友',
    signals: '预警信号',
    defensePoints: '防御要点',
    guideNote: '内容依据《气象灾害预警信号及防御指南》等公开资料整理，供学习参考',
    emergencyPhone: '紧急电话',
    materialList: '应急物资清单',
    prepared: '已备 {progress}%',
    evacuationTips: '避险要点',
    disclaimer: '查看免责声明',
    disclaimerTitle: '免责声明',
    disclaimerContent: '本小程序预警信息来源于中国气象局授权的官方天气数据接口，仅供参考，不构成避险决策的唯一依据。因网络与数据更新延迟，信息可能存在滞后或不完整，请以国家预警信息发布中心、当地气象台及应急管理部门发布的官方信息为准。',
    iKnow: '我知道了',
    footerTools: '遇到紧急情况请保持冷静，第一时间拨打 110 / 119 / 120',
    contentZh: '详细内容为中文原文，仅供参考',
    statusActive: '生效中',
    defaultSource: '气象部门',
    notFound: '未找到该预警',
    alertCount: '{n} 条',
    focusArea: '重点影响区',
    settingsTitle: '设置',
    cache: '缓存',
    clearCache: '清除缓存',
    cacheInfo: '{n} 项缓存',
    cacheCleared: '缓存已清除',
    about: '关于',
    version: '版本',
    current: '当前',
    srcMock: '内置演示数据，无需配置，适合体验界面',
    srcWeathercn: '中国气象局授权官方数据，需在 config.js 配置 API Key',
    srcAmap: '高德开放平台天气数据，免费配额，预警不保证',
    sourceSwitched: '数据源已切换，重新加载后生效',
    tabSettings: '设置',
    summaryAffect: '影响区域',
    summaryValid: '生效时间',
    summaryRisk: '主要风险',
    durationTo: '至',
    accessibility: '辅助功能',
    textSize: '文本大小',
    textStandard: '标准',
    textLarge: '大',
    textExtraLarge: '特大',
    highContrast: '高对比度',
    reduceMotion: '减少动效',
    on: '开',
    off: '关',
    navProducts: '产品目录',
    productsHint: '内容正在建设中，敬请期待',
    heroTitle: '实时自然灾害预警',
    heroSub: '全国覆盖 · 官方气象数据 · 次生灾害风险预测 · 多语言支持',
    ctaChooseCity: '选择城市',
    footerRights: '© 2026 自然灾害预警。保留所有权利。',
    menu: '菜单',
    wind: '风',
    district: "区县",
    allDistricts: "全市",
    switchDistrict: "切换区县",
    cityWeatherNote: "天气为城市级实况",
    nationalSituation: "全国预警态势",
    nationalHint: "点击地图城市可直接切换",
    timeline: "预警动态时间线",
    typeDist: "灾害类型分布",
    trend: "预警数量趋势",
    trendBuilding: "数据积累中，浏览后将自动生成趋势",
    topRisks: "当前次生风险 TOP",
    noTimeline: "暂无预警动态",
    countdown: "距预警结束",
    countdownEnded: "预警已到期",
    impactDiagram: "影响范围示意",
    recommended: "推荐应急物资",
    quizEntry: "知识测验",
    diagramCenter: "预警中心",
    causes: "灾害成因",
    preparation: "准备清单",
    quiz: "小测验",
    markRead: "标记为已读",
    readProgress: "学习进度",
    quizCorrect: "回答正确",
    quizWrong: "再想想",
    quizScore: "得分",
    quizRetry: "重新测验",
    quizDone: "本类测验完成",
    moreQuizSoon: "更多测验即将上线",
    firstAid: "急救步骤",
    familyPlan: "家庭应急计划",
    packWizard: "应急包向导",
    prevStep: "上一步",
    nextStep: "下一步",
    finish: "完成",
    wizardScene: "选择使用场景",
    sceneHome: "居家",
    sceneCar: "车载",
    sceneOutdoor: "户外",
    wizardItems: "推荐物品",
    wizardDone: "向导完成，清单已保存",
    planMembers: "家庭成员及电话",
    planMeeting: "紧急集合点",
    planContact: "外地联络人",
    planNeeds: "特殊需求（老人/儿童/用药）",
    planSave: "保存计划",
    planSaved: "家庭计划已保存",
    planExport: "导出为文本",
    planCopied: "已复制到剪贴板",
    notifications: "预警提醒",
    notifEnable: "启用浏览器通知",
    notifInterval: "检查频率",
    notifTest: "发送测试通知",
    notifSent: "测试通知已发送",
    notifBlocked: "浏览器阻止了通知，请在站点设置中允许",
    notifLimit: "仅在本页面保持打开时有效",
    reqStats: "请求统计",
    totalRequests: "累计接口请求",
    resetAll: "重置全部本地数据",
    resetDone: "已重置",
    every15: "每 15 分钟",
    every30: "每 30 分钟",
    every60: "每 60 分钟",
    minShort: "分",
    hrShort: "小时",
    dayShort: "天",
    legendSafe: "无预警",
    legendAlert: "有预警",
    legendHigh: "高风险",
    districtCoverNote: "官方未细分到区的预警，按覆盖全市处理"
  },
  en: {
    appName: 'Natural Disaster Alert',
    tabIndex: 'Alert Center',
    tabGuide: 'Guide',
    tabTools: 'Tools',
    language: 'Language',
    selectLanguage: 'Select Language',
    switchTip: 'Tap above to switch province (nationwide)',
    refresh: 'Refresh',
    realtimeWeather: 'Live Weather',
    providedBy: 'Data by {source}',
    redAlert: 'Red Alert',
    orangeAlert: 'Orange Alert',
    yellowAlert: 'Yellow Alert',
    blueAlert: 'Blue Alert',
    mockTip: 'Demo data is shown now. Configure API Key in utils/config.js to load official real-time alerts',
    fetchFailed: 'Failed to load alerts',
    retry: 'Reload',
    configHint: 'Check the API Key in utils/config.js and the request domain whitelist (during development, you can disable domain check in DevTools)',
    dataSource: 'Data source',
    cached: '(cached)',
    updatedAt: 'Updated {time}',
    activeAlerts: 'Active Alerts',
    total: '{n} in total',
    loading: 'Loading…',
    noAlerts: 'No active alerts',
    affectedArea: 'Affected Area',
    selectProvince: 'Select Province',
    close: 'Close',
    provinceHint: 'Pick a province, then a city. Dot: green = no alerts, yellow = alerts, red = red alert included',
    footerTip: 'Alerts are subject to official releases by national and local authorities',
    alertContent: 'Alert Details',
    riskPrediction: 'Secondary Disaster Risk',
    riskTip: 'Estimated probability based on alert type and level, for reference only',
    riskLevel: 'Risk {level}',
    riskHigh: 'High Risk',
    riskMedium: 'Medium Risk',
    riskLow: 'Low Risk',
    defenseGuide: 'Defense Guide',
    publishInfo: 'Issue Info',
    issueBy: 'Issued by',
    issueTime: 'Issue Time',
    validPeriod: 'Valid Period',
    callHotline: 'Call Weather Hotline 12121',
    share: 'Share',
    signals: 'Warning Signals',
    defensePoints: 'Key Actions',
    guideNote: 'Compiled from public references for learning purposes',
    emergencyPhone: 'Emergency Phones',
    materialList: 'Emergency Kit Checklist',
    prepared: '{progress}% ready',
    evacuationTips: 'Safety Tips',
    disclaimer: 'Disclaimer',
    disclaimerTitle: 'Disclaimer',
    disclaimerContent: 'Alert information in this mini program is sourced from the official weather data service authorized by the China Meteorological Administration and is for reference only. Due to network or data-update delays, information may be delayed or incomplete. Always refer to official releases from the national alert center, local meteorological stations and emergency management authorities.',
    iKnow: 'Got it',
    footerTools: 'Stay calm and call 110 / 119 / 120 in an emergency',
    contentZh: 'Detailed content is in Chinese (original), for reference only',
    statusActive: 'Active',
    defaultSource: 'Meteorological department',
    notFound: 'Alert not found',
    alertCount: '{n} alerts',
    focusArea: 'Most affected area',
    settingsTitle: 'Settings',
    cache: 'Cache',
    clearCache: 'Clear cache',
    cacheInfo: '{n} cache entries',
    cacheCleared: 'Cache cleared',
    about: 'About',
    version: 'Version',
    current: 'Current',
    srcMock: 'Built-in demo data, no setup needed',
    srcWeathercn: 'CMA-authorized official data; set API Key in config.js',
    srcAmap: 'AMap weather data, free quota, alerts not guaranteed',
    sourceSwitched: 'Data source switched, applies after reload',
    tabSettings: 'Settings',
    summaryAffect: 'Affected area',
    summaryValid: 'Valid period',
    summaryRisk: 'Key risks',
    durationTo: 'to',
    accessibility: 'Accessibility',
    textSize: 'Text size',
    textStandard: 'Standard',
    textLarge: 'Large',
    textExtraLarge: 'Extra large',
    highContrast: 'High contrast',
    reduceMotion: 'Reduce motion',
    on: 'On',
    off: 'Off',
    navProducts: 'Products',
    productsHint: 'Content is coming soon. Stay tuned.',
    heroTitle: 'Real-Time Natural Disaster Alerts',
    heroSub: 'Nationwide coverage • Official meteorological data • Secondary-hazard risk forecasting • Multilingual support',
    ctaChooseCity: 'Choose a City',
    footerRights: '© 2026 Natural Disaster Alert. All rights reserved.',
    menu: 'Menu',
    wind: 'Wind',
    district: "District",
    allDistricts: "All districts",
    switchDistrict: "Switch district",
    cityWeatherNote: "City-level weather",
    nationalSituation: "National Alert Situation",
    nationalHint: "Click a city on the map to switch",
    timeline: "Alert Timeline",
    typeDist: "Disaster Type Distribution",
    trend: "Alert Count Trend",
    trendBuilding: "Collecting data; the trend builds as you browse",
    topRisks: "Top Secondary Risks",
    noTimeline: "No alert activity yet",
    countdown: "Ends in",
    countdownEnded: "Alert period ended",
    impactDiagram: "Impact Area Diagram",
    recommended: "Recommended Supplies",
    quizEntry: "Knowledge Quiz",
    diagramCenter: "Alert Center",
    causes: "How It Forms",
    preparation: "Preparation Checklist",
    quiz: "Quick Quiz",
    markRead: "Mark as read",
    readProgress: "Learning Progress",
    quizCorrect: "Correct!",
    quizWrong: "Try again",
    quizScore: "Score",
    quizRetry: "Retake quiz",
    quizDone: "Quiz completed!",
    moreQuizSoon: "More quizzes coming soon",
    firstAid: "First Aid Steps",
    familyPlan: "Family Emergency Plan",
    packWizard: "Kit Packing Guide",
    prevStep: "Back",
    nextStep: "Next",
    finish: "Finish",
    wizardScene: "Choose a scenario",
    sceneHome: "Home",
    sceneCar: "Vehicle",
    sceneOutdoor: "Outdoor",
    wizardItems: "Recommended items",
    wizardDone: "Done! Checklist saved",
    planMembers: "Family members & phones",
    planMeeting: "Emergency meeting point",
    planContact: "Out-of-town contact",
    planNeeds: "Special needs (elderly/children/medication)",
    planSave: "Save plan",
    planSaved: "Family plan saved",
    planExport: "Export as text",
    planCopied: "Copied to clipboard",
    notifications: "Alert Notifications",
    notifEnable: "Enable browser notifications",
    notifInterval: "Check interval",
    notifTest: "Send test notification",
    notifSent: "Test notification sent",
    notifBlocked: "Notifications blocked; allow them in site settings",
    notifLimit: "Works only while this page stays open",
    reqStats: "Request Statistics",
    totalRequests: "Total API requests",
    resetAll: "Reset all local data",
    resetDone: "Reset complete",
    every15: "Every 15 minutes",
    every30: "Every 30 minutes",
    every60: "Every 60 minutes",
    minShort: "min",
    hrShort: "hr",
    dayShort: "d",
    legendSafe: "No alert",
    legendAlert: "Alert",
    legendHigh: "High risk",
    districtCoverNote: "Alerts without district-level detail are treated as city-wide"
  },
  es: {
    appName: 'Alerta de Desastres Naturales',
    tabIndex: 'Centro de Alertas',
    tabGuide: 'Guía',
    tabTools: 'Herramientas',
    language: 'Idioma',
    selectLanguage: 'Seleccionar idioma',
    switchTip: 'Toque arriba para cambiar de provincia',
    refresh: 'Actualizar',
    realtimeWeather: 'Clima en vivo',
    providedBy: 'Datos por {source}',
    redAlert: 'Alerta Roja',
    orangeAlert: 'Alerta Naranja',
    yellowAlert: 'Alerta Amarilla',
    blueAlert: 'Alerta Azul',
    mockTip: 'Mostrando datos de demostración. Configure la API Key en utils/config.js para ver alertas oficiales',
    fetchFailed: 'Error al cargar alertas',
    retry: 'Recargar',
    configHint: 'Revise la API Key en utils/config.js y el dominio autorizado de request',
    dataSource: 'Fuente de datos',
    cached: '(en caché)',
    updatedAt: 'Actualizado {time}',
    activeAlerts: 'Alertas Vigentes',
    total: '{n} en total',
    loading: 'Cargando…',
    noAlerts: 'No hay alertas vigentes',
    affectedArea: 'Área Afectada',
    selectProvince: 'Seleccionar provincia',
    close: 'Cerrar',
    provinceHint: 'Elija provincia y luego ciudad. Punto: verde = sin alertas, amarillo = alertas, rojo = incluye alerta roja',
    footerTip: 'Las alertas oficiales prevalecen',
    alertContent: 'Detalles de Alerta',
    riskPrediction: 'Riesgo de Desastres Secundarios',
    riskTip: 'Probabilidad estimada según tipo y nivel, solo referencia',
    riskLevel: 'Riesgo {level}',
    riskHigh: 'Riesgo Alto',
    riskMedium: 'Riesgo Medio',
    riskLow: 'Riesgo Bajo',
    defenseGuide: 'Guía de Defensa',
    publishInfo: 'Información',
    issueBy: 'Emitido por',
    issueTime: 'Hora de emisión',
    validPeriod: 'Período válido',
    callHotline: 'Llamar 12121',
    share: 'Compartir',
    signals: 'Señales de Alerta',
    defensePoints: 'Acciones clave',
    guideNote: 'Compilado de referencias públicas con fines educativos',
    emergencyPhone: 'Teléfonos de Emergencia',
    materialList: 'Kit de Emergencia',
    prepared: '{progress}% listo',
    evacuationTips: 'Consejos de Seguridad',
    disclaimer: 'Aviso legal',
    disclaimerTitle: 'Aviso legal',
    disclaimerContent: 'La información de alertas de esta mini app proviene del servicio oficial de datos meteorológicos autorizado por la Administración Meteorológica de China y es solo de referencia. Debido a retrasos de red o de actualización, la información puede estar desfasada o incompleta. Consulte siempre las publicaciones oficiales del centro nacional de alertas, las estaciones meteorológicas locales y las autoridades de gestión de emergencias.',
    iKnow: 'Entendido',
    footerTools: 'Mantenga la calma y llame al 110 / 119 / 120',
    contentZh: 'El contenido detallado está en chino (original)',
    statusActive: 'Activa',
    defaultSource: 'Departamento Meteorológico',
    notFound: 'Alerta no encontrada',
    alertCount: '{n} alertas',
    focusArea: 'Zona más afectada',
    settingsTitle: 'Configuración',
    cache: 'Caché',
    clearCache: 'Limpiar caché',
    cacheInfo: '{n} entradas en caché',
    cacheCleared: 'Caché limpiada',
    about: 'Acerca de',
    version: 'Versión',
    current: 'Actual',
    srcMock: 'Datos de demostración integrados, sin configuración',
    srcWeathercn: 'Datos oficiales autorizados por la CMA; configure la clave API en config.js',
    srcAmap: 'Datos meteorológicos de AMap, cuota gratuita, alertas no garantizadas',
    sourceSwitched: 'Fuente de datos cambiada, se aplica tras recargar',
    tabSettings: 'Ajustes',
    summaryAffect: 'Zona afectada',
    summaryValid: 'Período de validez',
    summaryRisk: 'Riesgos principales',
    durationTo: 'a',
    accessibility: 'Accesibilidad',
    textSize: 'Tamaño del texto',
    textStandard: 'Estándar',
    textLarge: 'Grande',
    textExtraLarge: 'Muy grande',
    highContrast: 'Alto contraste',
    reduceMotion: 'Reducir animaciones',
    on: 'Sí',
    off: 'No',
    navProducts: 'Productos',
    productsHint: 'Próximamente. Esté atento.',
    heroTitle: 'Alertas de Desastres Naturales en Tiempo Real',
    heroSub: 'Cobertura nacional · Datos meteorológicos oficiales · Predicción de riesgos secundarios · Multilingüe',
    ctaChooseCity: 'Elegir ciudad',
    footerRights: '© 2026 Alertas de Desastres Naturales. Todos los derechos reservados.',
    menu: 'Menú',
    wind: 'Viento',
    district: "Distrito",
    allDistricts: "Toda la ciudad",
    switchDistrict: "Cambiar distrito",
    cityWeatherNote: "Clima a nivel ciudad",
    nationalSituation: "Situación Nacional",
    nationalHint: "Haz clic en una ciudad del mapa",
    timeline: "Cronología de Alertas",
    typeDist: "Distribución de Tipos",
    trend: "Tendencia de Alertas",
    trendBuilding: "Acumulando datos; la tendencia se genera al navegar",
    topRisks: "Riesgos Secundarios TOP",
    noTimeline: "Sin actividad por ahora",
    countdown: "Finaliza en",
    countdownEnded: "Periodo finalizado",
    impactDiagram: "Esquema de Impacto",
    recommended: "Suministros Recomendados",
    quizEntry: "Test de Conocimientos",
    diagramCenter: "Centro de Alerta",
    causes: "Origen",
    preparation: "Lista de Preparación",
    quiz: "Mini Test",
    markRead: "Marcar como leído",
    readProgress: "Progreso de Aprendizaje",
    quizCorrect: "¡Correcto!",
    quizWrong: "Reinténtalo",
    quizScore: "Puntuación",
    quizRetry: "Rehacer test",
    quizDone: "¡Test completado!",
    moreQuizSoon: "Más tests pronto",
    firstAid: "Primeros Auxilios",
    familyPlan: "Plan Familiar de Emergencia",
    packWizard: "Guía del Kit",
    prevStep: "Atrás",
    nextStep: "Siguiente",
    finish: "Finalizar",
    wizardScene: "Elige un escenario",
    sceneHome: "Hogar",
    sceneCar: "Vehículo",
    sceneOutdoor: "Exterior",
    wizardItems: "Artículos recomendados",
    wizardDone: "¡Listo! Lista guardada",
    planMembers: "Miembros y teléfonos",
    planMeeting: "Punto de encuentro",
    planContact: "Contacto fuera de la ciudad",
    planNeeds: "Necesidades especiales (mayores/niños/medicación)",
    planSave: "Guardar plan",
    planSaved: "Plan guardado",
    planExport: "Exportar texto",
    planCopied: "Copiado al portapapeles",
    notifications: "Notificaciones",
    notifEnable: "Activar notificaciones",
    notifInterval: "Intervalo de revisión",
    notifTest: "Notificación de prueba",
    notifSent: "Notificación enviada",
    notifBlocked: "Notificaciones bloqueadas; actívalas en ajustes del sitio",
    notifLimit: "Solo funciona con esta página abierta",
    reqStats: "Estadísticas",
    totalRequests: "Peticiones totales",
    resetAll: "Restablecer todos los datos",
    resetDone: "Restablecido",
    every15: "Cada 15 minutos",
    every30: "Cada 30 minutos",
    every60: "Cada 60 minutos",
    minShort: "min",
    hrShort: "h",
    dayShort: "d",
    legendSafe: "Sin alerta",
    legendAlert: "Alerta",
    legendHigh: "Riesgo alto",
    districtCoverNote: "Las alertas sin detalle de distrito se tratan como de toda la ciudad"
  },
  fr: {
    appName: 'Alerte Catastrophe Naturelle',
    tabIndex: 'Centre d’Alertes',
    tabGuide: 'Guide',
    tabTools: 'Outils',
    language: 'Langue',
    selectLanguage: 'Choisir la langue',
    switchTip: 'Touchez ci-dessus pour changer de province',
    refresh: 'Actualiser',
    realtimeWeather: 'Météo en direct',
    providedBy: 'Données par {source}',
    redAlert: 'Alerte Rouge',
    orangeAlert: 'Alerte Orange',
    yellowAlert: 'Alerte Jaune',
    blueAlert: 'Alerte Bleue',
    mockTip: 'Données de démonstration. Configurez la clé API dans utils/config.js pour les alertes officielles',
    fetchFailed: 'Échec du chargement des alertes',
    retry: 'Recharger',
    configHint: 'Vérifiez la clé API dans utils/config.js et le domaine autorisé',
    dataSource: 'Source des données',
    cached: '(en cache)',
    updatedAt: 'Mis à jour {time}',
    activeAlerts: 'Alertes en cours',
    total: '{n} au total',
    loading: 'Chargement…',
    noAlerts: 'Aucune alerte en cours',
    affectedArea: 'Zone touchée',
    selectProvince: 'Choisir la province',
    close: 'Fermer',
    provinceHint: 'Choisissez une province puis une ville. Point : vert = aucune alerte, jaune = alertes, rouge = alerte rouge incluse',
    footerTip: 'Seules les alertes officielles font foi',
    alertContent: 'Détails de l’Alerte',
    riskPrediction: 'Risque de Catastrophes Secondaires',
    riskTip: 'Probabilité estimée selon le type et le niveau, à titre indicatif',
    riskLevel: 'Risque {level}',
    riskHigh: 'Risque Élevé',
    riskMedium: 'Risque Modéré',
    riskLow: 'Risque Faible',
    defenseGuide: 'Guide de Défense',
    publishInfo: 'Informations',
    issueBy: 'Émise par',
    issueTime: 'Heure d’émission',
    validPeriod: 'Période de validité',
    callHotline: 'Appeler le 12121',
    share: 'Partager',
    signals: 'Signaux d’Alerte',
    defensePoints: 'Mesures clés',
    guideNote: 'Compilé à partir de références publiques',
    emergencyPhone: 'Numéros d’Urgence',
    materialList: 'Kit d’Urgence',
    prepared: '{progress}% prêt',
    evacuationTips: 'Conseils de Sécurité',
    disclaimer: 'Avertissement',
    disclaimerTitle: 'Avertissement',
    disclaimerContent: 'Les informations d’alerte de cette mini-app proviennent du service officiel de données météorologiques autorisé par l’Administration météorologique de Chine et sont fournies à titre indicatif. En raison de délais de réseau ou de mise à jour, elles peuvent être retardées ou incomplètes. Référez-vous toujours aux publications officielles du centre national d’alertes, des stations météorologiques locales et des autorités de gestion des urgences.',
    iKnow: 'Compris',
    footerTools: 'Restez calme et appelez le 110 / 119 / 120',
    contentZh: 'Contenu détaillé en chinois (original)',
    statusActive: 'En cours',
    defaultSource: 'Service météorologique',
    notFound: 'Alerte introuvable',
    alertCount: '{n} alertes',
    focusArea: 'Zone la plus touchée',
    settingsTitle: 'Réglages',
    cache: 'Cache',
    clearCache: 'Vider le cache',
    cacheInfo: '{n} entrées en cache',
    cacheCleared: 'Cache vidée',
    about: 'À propos',
    version: 'Version',
    current: 'Actuel',
    srcMock: 'Données de démonstration intégrées, aucune configuration',
    srcWeathercn: 'Données officielles autorisées par la CMA ; clé API dans config.js',
    srcAmap: 'Données météo AMap, quota gratuit, alertes non garanties',
    sourceSwitched: 'Source de données changée, appliquée après rechargement',
    tabSettings: 'Paramètres',
    summaryAffect: 'Zone touchée',
    summaryValid: 'Période de validité',
    summaryRisk: 'Risques principaux',
    durationTo: 'à',
    accessibility: 'Accessibilité',
    textSize: 'Taille du texte',
    textStandard: 'Standard',
    textLarge: 'Grand',
    textExtraLarge: 'Très grand',
    highContrast: 'Contraste élevé',
    reduceMotion: 'Réduire les animations',
    on: 'Oui',
    off: 'Non',
    navProducts: 'Produits',
    productsHint: 'Contenu bientôt disponible. Restez à l’écoute.',
    heroTitle: 'Alertes Catastrophes Naturelles en Temps Réel',
    heroSub: 'Couverture nationale · Données météorologiques officielles · Prévision des risques secondaires · Multilingue',
    ctaChooseCity: 'Choisir une ville',
    footerRights: '© 2026 Alertes Catastrophes Naturelles. Tous droits réservés.',
    menu: 'Menu',
    wind: 'Vent',
    district: "District",
    allDistricts: "Toute la ville",
    switchDistrict: "Changer de district",
    cityWeatherNote: "Météo au niveau ville",
    nationalSituation: "Situation Nationale",
    nationalHint: "Cliquez sur une ville de la carte",
    timeline: "Chronologie des Alertes",
    typeDist: "Répartition des Types",
    trend: "Tendance des Alertes",
    trendBuilding: "Données en cours de collecte ; la tendance se construit en naviguant",
    topRisks: "Principaux Risques Secondaires",
    noTimeline: "Aucune activité pour le moment",
    countdown: "Se termine dans",
    countdownEnded: "Période terminée",
    impactDiagram: "Schéma d’Impact",
    recommended: "Fournitures Recommandées",
    quizEntry: "Quiz de Connaissances",
    diagramCenter: "Centre d’Alerte",
    causes: "Causes",
    preparation: "Liste de Préparation",
    quiz: "Petit Quiz",
    markRead: "Marquer comme lu",
    readProgress: "Progression",
    quizCorrect: "Correct !",
    quizWrong: "Réessayez",
    quizScore: "Score",
    quizRetry: "Refaire le quiz",
    quizDone: "Quiz terminé !",
    moreQuizSoon: "D’autres quiz bientôt",
    firstAid: "Premiers Secours",
    familyPlan: "Plan Familial d’Urgence",
    packWizard: "Guide du Kit",
    prevStep: "Précédent",
    nextStep: "Suivant",
    finish: "Terminer",
    wizardScene: "Choisissez un scénario",
    sceneHome: "Domicile",
    sceneCar: "Véhicule",
    sceneOutdoor: "Extérieur",
    wizardItems: "Articles recommandés",
    wizardDone: "Terminé ! Liste enregistrée",
    planMembers: "Membres et téléphones",
    planMeeting: "Point de rassemblement",
    planContact: "Contact hors de la ville",
    planNeeds: "Besoins particuliers (personnes âgées/enfants/médicaments)",
    planSave: "Enregistrer",
    planSaved: "Plan enregistré",
    planExport: "Exporter le texte",
    planCopied: "Copié dans le presse-papiers",
    notifications: "Notifications",
    notifEnable: "Activer les notifications",
    notifInterval: "Intervalle de vérification",
    notifTest: "Notification de test",
    notifSent: "Notification envoyée",
    notifBlocked: "Notifications bloquées ; autorisez-les dans les réglages du site",
    notifLimit: "Fonctionne uniquement si la page reste ouverte",
    reqStats: "Statistiques",
    totalRequests: "Requêtes API totales",
    resetAll: "Réinitialiser toutes les données",
    resetDone: "Réinitialisé",
    every15: "Toutes les 15 minutes",
    every30: "Toutes les 30 minutes",
    every60: "Toutes les 60 minutes",
    minShort: "min",
    hrShort: "h",
    dayShort: "j",
    legendSafe: "Aucune alerte",
    legendAlert: "Alerte",
    legendHigh: "Risque élevé",
    districtCoverNote: "Les alertes sans détail de district sont considérées comme couvrant toute la ville"
  },
  it: {
    appName: 'Allerta Disastri Naturali',
    tabIndex: 'Centro Allerte',
    tabGuide: 'Guida',
    tabTools: 'Strumenti',
    language: 'Lingua',
    selectLanguage: 'Seleziona lingua',
    switchTip: 'Tocca sopra per cambiare provincia',
    refresh: 'Aggiorna',
    realtimeWeather: 'Meteo in tempo reale',
    providedBy: 'Dati da {source}',
    redAlert: 'Allerta Rossa',
    orangeAlert: 'Allerta Arancione',
    yellowAlert: 'Allerta Gialla',
    blueAlert: 'Allerta Blu',
    mockTip: 'Dati dimostrativi. Configura la chiave API in utils/config.js per le allerte ufficiali',
    fetchFailed: 'Errore nel caricamento delle allerte',
    retry: 'Ricarica',
    configHint: 'Controlla la chiave API in utils/config.js e il dominio autorizzato',
    dataSource: 'Fonte dati',
    cached: '(in cache)',
    updatedAt: 'Aggiornato {time}',
    activeAlerts: 'Allerte Attive',
    total: '{n} in totale',
    loading: 'Caricamento…',
    noAlerts: 'Nessuna allerta attiva',
    affectedArea: 'Area Interessata',
    selectProvince: 'Seleziona provincia',
    close: 'Chiudi',
    provinceHint: 'Scegli una provincia e poi una città. Punto: verde = nessuna allerta, giallo = allerte, rosso = include allerta rossa',
    footerTip: 'Fanno fede solo le allerte ufficiali',
    alertContent: 'Dettagli Allerta',
    riskPrediction: 'Rischio Catastrofi Secondarie',
    riskTip: 'Probabilità stimata in base a tipo e livello, solo riferimento',
    riskLevel: 'Rischio {level}',
    riskHigh: 'Rischio Alto',
    riskMedium: 'Rischio Medio',
    riskLow: 'Rischio Basso',
    defenseGuide: 'Guida di Difesa',
    publishInfo: 'Informazioni',
    issueBy: 'Emessa da',
    issueTime: 'Ora di emissione',
    validPeriod: 'Periodo di validità',
    callHotline: 'Chiama 12121',
    share: 'Condividi',
    signals: 'Segnali di Allerta',
    defensePoints: 'Azioni chiave',
    guideNote: 'Compilato da riferimenti pubblici a scopo informativo',
    emergencyPhone: 'Numeri di Emergenza',
    materialList: 'Kit di Emergenza',
    prepared: '{progress}% pronto',
    evacuationTips: 'Consigli di Sicurezza',
    disclaimer: 'Disclaimer',
    disclaimerTitle: 'Disclaimer',
    disclaimerContent: 'Le informazioni di allerta di questa mini-app provengono dal servizio ufficiale di dati meteorologici autorizzato dall’Amministrazione Meteorologica Cinese e sono solo di riferimento. A causa di ritardi di rete o di aggiornamento, le informazioni possono essere in ritardo o incomplete. Fare sempre riferimento alle pubblicazioni ufficiali del centro nazionale allerte, delle stazioni meteorologiche locali e delle autorità di protezione civile.',
    iKnow: 'Ho capito',
    footerTools: 'Mantieni la calma e chiama 110 / 119 / 120',
    contentZh: 'Contenuto dettagliato in cinese (originale)',
    statusActive: 'Attiva',
    defaultSource: 'Dipartimento meteorologico',
    notFound: 'Allerta non trovata',
    alertCount: '{n} allerte',
    focusArea: 'Area più colpita',
    settingsTitle: 'Impostazioni',
    cache: 'Cache',
    clearCache: 'Svuota cache',
    cacheInfo: '{n} voci in cache',
    cacheCleared: 'Cache svuotata',
    about: 'Informazioni',
    version: 'Versione',
    current: 'Attuale',
    srcMock: 'Dati demo integrati, nessuna configurazione',
    srcWeathercn: 'Dati ufficiali autorizzati dalla CMA; chiave API in config.js',
    srcAmap: 'Dati meteo AMap, quota gratuita, allerte non garantite',
    sourceSwitched: 'Sorgente dati cambiata, si applica dopo il ricaricamento',
    tabSettings: 'Impostazioni',
    summaryAffect: 'Area interessata',
    summaryValid: 'Periodo di validità',
    summaryRisk: 'Rischi principali',
    durationTo: 'a',
    accessibility: 'Accessibilità',
    textSize: 'Dimensione del testo',
    textStandard: 'Standard',
    textLarge: 'Grande',
    textExtraLarge: 'Extra grande',
    highContrast: 'Alto contrasto',
    reduceMotion: 'Ridurre le animazioni',
    on: 'Sì',
    off: 'No',
    navProducts: 'Prodotti',
    productsHint: 'Contenuti in arrivo. Restate sintonizzati.',
    heroTitle: 'Allerte Disastri Naturali in Tempo Reale',
    heroSub: 'Copertura nazionale · Dati meteorologici ufficiali · Previsione dei rischi secondari · Multilingue',
    ctaChooseCity: 'Scegli una città',
    footerRights: '© 2026 Allerte Disastri Naturali. Tutti i diritti riservati.',
    menu: 'Menu',
    wind: 'Vento',
    district: "Distretto",
    allDistricts: "Tutta la città",
    switchDistrict: "Cambia distretto",
    cityWeatherNote: "Meteo a livello città",
    nationalSituation: "Situazione Nazionale",
    nationalHint: "Clicca su una città della mappa",
    timeline: "Cronologia Allerte",
    typeDist: "Distribuzione dei Tipi",
    trend: "Andamento Allerte",
    trendBuilding: "Dati in raccolta; l’andamento si creerà durante la navigazione",
    topRisks: "Principali Rischi Secondari",
    noTimeline: "Nessuna attività al momento",
    countdown: "Termina tra",
    countdownEnded: "Periodo terminato",
    impactDiagram: "Schema d’Impatto",
    recommended: "Forniture Consigliate",
    quizEntry: "Quiz di Conoscenza",
    diagramCenter: "Centro Allerta",
    causes: "Cause",
    preparation: "Lista di Preparazione",
    quiz: "Quiz Veloce",
    markRead: "Segna come letto",
    readProgress: "Avanzamento",
    quizCorrect: "Corretto!",
    quizWrong: "Riprova",
    quizScore: "Punteggio",
    quizRetry: "Rifai il quiz",
    quizDone: "Quiz completato!",
    moreQuizSoon: "Altri quiz in arrivo",
    firstAid: "Primo Soccorso",
    familyPlan: "Piano Familiare di Emergenza",
    packWizard: "Guida Kit",
    prevStep: "Indietro",
    nextStep: "Avanti",
    finish: "Fine",
    wizardScene: "Scegli uno scenario",
    sceneHome: "Casa",
    sceneCar: "Veicolo",
    sceneOutdoor: "Outdoor",
    wizardItems: "Articoli consigliati",
    wizardDone: "Fatto! Lista salvata",
    planMembers: "Membri e telefoni",
    planMeeting: "Punto d’incontro",
    planContact: "Contatto fuori città",
    planNeeds: "Esigenze speciali (anziani/bambini/farmaci)",
    planSave: "Salva piano",
    planSaved: "Piano salvato",
    planExport: "Esporta testo",
    planCopied: "Copiato negli appunti",
    notifications: "Notifiche",
    notifEnable: "Abilita notifiche",
    notifInterval: "Intervallo di controllo",
    notifTest: "Notifica di test",
    notifSent: "Notifica inviata",
    notifBlocked: "Notifiche bloccate; autorizzale nelle impostazioni del sito",
    notifLimit: "Funziona solo con la pagina aperta",
    reqStats: "Statistiche",
    totalRequests: "Richieste API totali",
    resetAll: "Reimposta tutti i dati",
    resetDone: "Reimpostato",
    every15: "Ogni 15 minuti",
    every30: "Ogni 30 minuti",
    every60: "Ogni 60 minuti",
    minShort: "min",
    hrShort: "h",
    dayShort: "g",
    legendSafe: "Nessuna allerta",
    legendAlert: "Allerta",
    legendHigh: "Rischio alto",
    districtCoverNote: "Le allerte senza dettaglio di distretto sono considerate come estese a tutta la città"
  }
};

// ---- 灾害类型名称（5 语言） ----
var DISASTERS = {
  zh: { 暴雨: '暴雨', 台风: '台风', 高温: '高温', 寒潮: '寒潮', 暴雪: '暴雪', 大雾: '大雾', 雷电: '雷电', 大风: '大风', 冰雹: '冰雹', 沙尘: '沙尘', 干旱: '干旱', 洪水: '洪水', 地质灾害: '地质灾害', 森林火险: '森林火险', 霜冻: '霜冻', 海浪: '海浪', 道路结冰: '道路结冰', 气象: '气象' },
  en: { 暴雨: 'Rainstorm', 台风: 'Typhoon', 高温: 'High Temperature', 寒潮: 'Cold Wave', 暴雪: 'Blizzard', 大雾: 'Fog', 雷电: 'Thunderstorm', 大风: 'Gale', 冰雹: 'Hail', 沙尘: 'Sandstorm', 干旱: 'Drought', 洪水: 'Flood', 地质灾害: 'Geological Disaster', 森林火险: 'Forest Fire', 霜冻: 'Frost', 海浪: 'Sea Waves', 道路结冰: 'Icy Roads', 气象: 'Weather' },
  es: { 暴雨: 'Lluvia torrencial', 台风: 'Tifón', 高温: 'Temperatura alta', 寒潮: 'Ola de frío', 暴雪: 'Tormenta de nieve', 大雾: 'Niebla', 雷电: 'Tormenta eléctrica', 大风: 'Viento fuerte', 冰雹: 'Granizo', 沙尘: 'Tormenta de arena', 干旱: 'Sequía', 洪水: 'Inundación', 地质灾害: 'Desastre geológico', 森林火险: 'Incendio forestal', 霜冻: 'Helada', 海浪: 'Oleaje', 道路结冰: 'Carreteras heladas', 气象: 'Tiempo' },
  fr: { 暴雨: 'Pluie torrentielle', 台风: 'Typhon', 高温: 'Canicule', 寒潮: 'Vague de froid', 暴雪: 'Tempête de neige', 大雾: 'Brouillard', 雷电: 'Orage', 大风: 'Vent violent', 冰雹: 'Grêle', 沙尘: 'Tempête de sable', 干旱: 'Sécheresse', 洪水: 'Inondation', 地质灾害: 'Catastrophe géologique', 森林火险: 'Incendie de forêt', 霜冻: 'Gel', 海浪: 'Vagues', 道路结冰: 'Routes verglacées', 气象: 'Météo' },
  it: { 暴雨: 'Nubifragio', 台风: 'Tifone', 高温: 'Temperature elevate', 寒潮: 'Ondata di freddo', 暴雪: 'Tormenta di neve', 大雾: 'Nebbia', 雷电: 'Temporale', 大风: 'Vento forte', 冰雹: 'Grandine', 沙尘: 'Tempesta di sabbia', 干旱: 'Siccità', 洪水: 'Alluvione', 地质灾害: 'Disastro geologico', 森林火险: 'Incendio forestale', 霜冻: 'Gelo', 海浪: 'Onde marine', 道路结冰: 'Strade ghiacciate', 气象: 'Meteo' }
};

// ---- 工具页：紧急电话（name/desc，5 语言） ----
var PHONES_ZH = [
  { name: '报警电话', number: '110', desc: '治安报警、紧急求助' },
  { name: '火警电话', number: '119', desc: '火灾、应急救援' },
  { name: '急救电话', number: '120', desc: '医疗急救' },
  { name: '交通事故', number: '122', desc: '交通事故报警' },
  { name: '气象服务热线', number: '12121', desc: '天气与预警查询' },
  { name: '森林火警', number: '12119', desc: '森林火灾报警' },
  { name: '供电服务', number: '95598', desc: '停电报修、用电咨询' },
  { name: '政务服务热线', number: '12345', desc: '应急求助与综合服务' }
];
var PHONES_I18N = {
  en: [['Police', 'Public security and emergencies'], ['Fire', 'Fire and rescue'], ['Ambulance', 'Medical emergency'], ['Traffic Accident', 'Traffic accident report'], ['Weather Hotline', 'Weather & alert inquiry'], ['Forest Fire', 'Forest fire report'], ['Power Service', 'Outage repair & inquiry'], ['Government Hotline', 'Emergency & general services']],
  es: [['Policía', 'Seguridad y emergencias'], ['Bomberos', 'Incendios y rescate'], ['Ambulancia', 'Emergencia médica'], ['Accidente de tráfico', 'Reporte de accidentes'], ['Línea Meteorológica', 'Consulta de clima y alertas'], ['Incendio Forestal', 'Reporte de incendios'], ['Servicio Eléctrico', 'Averías y consultas'], ['Línea del Gobierno', 'Servicios de emergencia']],
  fr: [['Police', 'Sécurité et urgences'], ['Pompiers', 'Incendie et secours'], ['Ambulance', 'Urgence médicale'], ['Accident de la route', 'Signaler un accident'], ['Ligne Météo', 'Climat et alertes'], ['Feu de forêt', 'Signaler un feu'], ['Service Électrique', 'Pannes et renseignements'], ['Ligne du Gouvernement', 'Urgences et services']],
  it: [['Polizia', 'Sicurezza e emergenze'], ['Vigili del Fuoco', 'Incendi e soccorso'], ['Ambulanza', 'Emergenza medica'], ['Incidente stradale', 'Segnalazione incidenti'], ['Linea Meteo', 'Meteo e allerte'], ['Incendio boschivo', 'Segnalazione incendi'], ['Servizio Elettrico', 'Guasti e informazioni'], ['Linea del Governo', 'Emergenze e servizi']]
};

// ---- 工具页：应急物资清单（5 语言） ----
var MATERIALS_ZH = [
  '饮用水（每人每天约3升，至少备3天）',
  '方便食品、干粮（3天量）',
  '手电筒及备用电池',
  '充电宝、备用手机及充电线',
  '常用药品、急救包',
  '身份证件、少量现金、重要文件',
  '哨子（被困时求救）',
  '雨衣、保暖衣物、毛毯',
  '多功能刀具、绳索',
  '口罩、消毒用品、湿巾',
  '收音机（获取应急广播信息）',
  '家庭应急联系卡（写明紧急联系人及电话）'
];
var MATERIALS_I18N = {
  en: ['Drinking water (3L/person/day, 3 days)', 'Non-perishable food (3 days)', 'Flashlight & spare batteries', 'Power bank, spare phone & cable', 'Medicine & first-aid kit', 'ID, cash & important documents', 'Whistle (to signal when trapped)', 'Raincoat, warm clothes & blanket', 'Multi-tool & rope', 'Masks, sanitizer & wipes', 'Radio (for emergency broadcast)', 'Family contact card'],
  es: ['Agua potable (3L/día/persona, 3 días)', 'Alimentos no perecederos (3 días)', 'Linterna y pilas de repuesto', 'Batería externa, móvil y cable', 'Medicamentos y botiquín', 'DNI, efectivo y documentos', 'Silbato (para pedir ayuda)', 'Impermeable, ropa abrigada y manta', 'Navaja multiusos y cuerda', 'Mascarillas, desinfectante y toallitas', 'Radio (para emergencias)', 'Tarjeta de contacto familiar'],
  fr: ['Eau potable (3L/pers./jour, 3 jours)', 'Aliments non périssables (3 jours)', 'Lampe de poche & piles', 'Batterie externe, téléphone & câble', 'Médicaments & trousse de secours', 'Pièce d’identité, espèces & documents', 'Sifflet (pour appeler à l’aide)', 'Imperméable, vêtements chauds & couverture', 'Couteau multifonction & corde', 'Masques, désinfectant & lingettes', 'Radio (infos d’urgence)', 'Carte de contact familiale'],
  it: ['Acqua potabile (3L/pers./giorno, 3 giorni)', 'Cibo non deperibile (3 giorni)', 'Torcia e batterie di riserva', 'Power bank, telefono e cavo', 'Farmaci e kit di primo soccorso', 'Documenti, contanti e file importanti', 'Fischietto (per chiedere aiuto)', 'Impermeabile, vestiti caldi e coperta', 'Coltello multiuso e corda', 'Mascherine, disinfettante e salviette', 'Radio (per info di emergenza)', 'Biglietto con i contatti familiari']
};

// ---- 工具页：避险要点（5 语言） ----
var TIPS_ZH = [
  '收到预警或转移通知，第一时间撤离，不贪恋财物',
  '熟悉住所周边的应急避险场所和撤离路线',
  '提前给手机充电，保存紧急联系人和应急电话',
  '重要证件、现金和药品放在随手可取的应急包里',
  '关注官方渠道信息，不轻信、不传播谣言'
];
var TIPS_I18N = {
  en: ['Evacuate immediately on alert, never linger for belongings', 'Know nearby shelters and evacuation routes', 'Charge your phone and save emergency contacts', 'Keep IDs, cash and medicine in an easy-to-grab kit', 'Follow official channels; do not spread rumors'],
  es: ['Evacúe de inmediato ante una alerta, no se detenga por pertenencias', 'Conozca los refugios y rutas de evacuación cercanos', 'Cargue el móvil y guarde contactos de emergencia', 'Tenga documentos, efectivo y medicinas a mano', 'Siga fuentes oficiales; no difunda rumores'],
  fr: ['Évacuez immédiatement lors d’une alerte, n’hésitez pas pour vos biens', 'Repérez les abris et les itinéraires d’évacuation', 'Chargez votre téléphone et enregistrez les contacts d’urgence', 'Gardez pièces d’identité, espèces et médicaments à portée', 'Suivez les sources officielles; ne propagez pas de rumeurs'],
  it: ['Evacuare subito in caso di allerta, non fermarsi per i beni', 'Conoscere i rifugi e le vie di fuga vicine', 'Caricare il telefono e salvare i contatti di emergenza', 'Tenere documenti, contanti e farmaci a portata di mano', 'Seguire fonti ufficiali; non diffondere voci']
};

// ---- 工具函数 ----
function getLang() {
  try {
    var lang = wx.getStorageSync(LANG_STORAGE_KEY);
    return lang || 'zh';
  } catch (e) {
    return 'zh';
  }
}

function setLang(code) {
  try {
    wx.setStorageSync(LANG_STORAGE_KEY, code);
  } catch (e) {
    // 存储失败不影响本次切换
  }
}

function t(key, lang) {
  var l = lang || getLang();
  var pack = UI[l] || UI.zh;
  return pack[key] !== undefined ? pack[key] : (UI.zh[key] || key);
}

// 带占位符的翻译：tpl('providedBy', {source: 'xxx'}, lang)
function tpl(key, vars, lang) {
  var s = t(key, lang);
  Object.keys(vars || {}).forEach(function (k) {
    s = s.split('{' + k + '}').join(vars[k]);
  });
  return s;
}

function disasterName(zhName, lang) {
  var l = lang || getLang();
  var map = DISASTERS[l] || DISASTERS.zh;
  return map[zhName] || zhName;
}

// 打包当前语言的界面文案（供页面 setData，wxml 用 {{t.xxx}}）
function pack(lang) {
  var l = lang || getLang();
  return { t: UI[l] || UI.zh };
}

function phones(lang) {
  var l = lang || getLang();
  var list = PHONES_I18N[l];
  if (!list) {
    return PHONES_ZH;
  }
  return PHONES_ZH.map(function (p, i) {
    return {
      number: p.number,
      name: list[i][0],
      desc: list[i][1]
    };
  });
}

function materials(lang) {
  var l = lang || getLang();
  return MATERIALS_I18N[l] || MATERIALS_ZH;
}

function tips(lang) {
  var l = lang || getLang();
  return TIPS_I18N[l] || TIPS_ZH;
}

// ---- 地名翻译（省份 + 城市，非中文语言统一使用英文地名） ----
var PLACES = {
  // 省级行政区
  '北京市': 'Beijing', '天津市': 'Tianjin', '上海市': 'Shanghai', '重庆市': 'Chongqing',
  '河北省': 'Hebei', '山西省': 'Shanxi', '内蒙古自治区': 'Inner Mongolia', '辽宁省': 'Liaoning',
  '吉林省': 'Jilin', '黑龙江省': 'Heilongjiang', '江苏省': 'Jiangsu', '浙江省': 'Zhejiang',
  '安徽省': 'Anhui', '福建省': 'Fujian', '江西省': 'Jiangxi', '山东省': 'Shandong',
  '河南省': 'Henan', '湖北省': 'Hubei', '湖南省': 'Hunan', '广东省': 'Guangdong',
  '广西壮族自治区': 'Guangxi', '海南省': 'Hainan', '四川省': 'Sichuan', '贵州省': 'Guizhou',
  '云南省': 'Yunnan', '西藏自治区': 'Tibet', '陕西省': 'Shaanxi', '甘肃省': 'Gansu',
  '青海省': 'Qinghai', '宁夏回族自治区': 'Ningxia', '新疆维吾尔自治区': 'Xinjiang',
  '台湾省': 'Taiwan', '香港特别行政区': 'Hong Kong SAR', '澳门特别行政区': 'Macao SAR',
  // 城市（省会 + 内置重点城市）
  '石家庄市': 'Shijiazhuang', '唐山市': 'Tangshan', '保定市': 'Baoding', '太原市': 'Taiyuan',
  '大同市': 'Datong', '运城市': 'Yuncheng', '呼和浩特市': 'Hohhot', '包头市': 'Baotou',
  '鄂尔多斯市': 'Ordos', '沈阳市': 'Shenyang', '大连市': 'Dalian', '长春市': 'Changchun',
  '吉林市': 'Jilin City', '哈尔滨市': 'Harbin', '齐齐哈尔市': 'Qiqihar', '大庆市': 'Daqing',
  '南京市': 'Nanjing', '苏州市': 'Suzhou', '无锡市': 'Wuxi', '徐州市': 'Xuzhou',
  '杭州市': 'Hangzhou', '宁波市': 'Ningbo', '温州市': 'Wenzhou', '合肥市': 'Hefei',
  '芜湖市': 'Wuhu', '蚌埠市': 'Bengbu', '福州市': 'Fuzhou', '厦门市': 'Xiamen',
  '泉州市': 'Quanzhou', '南昌市': 'Nanchang', '赣州市': 'Ganzhou', '九江市': 'Jiujiang',
  '济南市': 'Jinan', '青岛市': 'Qingdao', '烟台市': 'Yantai', '郑州市': 'Zhengzhou',
  '洛阳市': 'Luoyang', '南阳市': 'Nanyang', '武汉市': 'Wuhan', '宜昌市': 'Yichang',
  '襄阳市': 'Xiangyang', '长沙市': 'Changsha', '株洲市': 'Zhuzhou', '衡阳市': 'Hengyang',
  '广州市': 'Guangzhou', '深圳市': 'Shenzhen', '珠海市': 'Zhuhai', '佛山市': 'Foshan',
  '南宁市': 'Nanning', '桂林市': 'Guilin', '柳州市': 'Liuzhou', '海口市': 'Haikou',
  '三亚市': 'Sanya', '成都市': 'Chengdu', '绵阳市': 'Mianyang', '宜宾市': 'Yibin',
  '贵阳市': 'Guiyang', '遵义市': 'Zunyi', '昆明市': 'Kunming', '大理白族自治州': 'Dali',
  '拉萨市': 'Lhasa', '西安市': "Xi'an", '宝鸡市': 'Baoji', '咸阳市': 'Xianyang',
  '兰州市': 'Lanzhou', '天水市': 'Tianshui', '西宁市': 'Xining', '银川市': 'Yinchuan',
  '乌鲁木齐市': 'Urumqi', '喀什地区': 'Kashgar', '台北市': 'Taipei', '香港': 'Hong Kong', '澳门': 'Macao'
};

/** 地名翻译：中文名 → 当前语言名称（非中文统一用英文地名） */
function placeName(zhName, lang) {
  var l = lang || getLang();
  if (l === 'zh') {
    return zhName;
  }
  return PLACES[zhName] || zhName;
}

/** 预警级别名称（red→“红色预警” / Red Alert / Alerta Roja ...） */
function levelName(level, lang) {
  var l = lang || getLang();
  var key = {
    red: 'redAlert',
    orange: 'orangeAlert',
    yellow: 'yellowAlert',
    blue: 'blueAlert'
  }[level] || 'yellowAlert';
  return t(key, l);
}

// 单字级别词（防御指南“预警信号”里的红/橙/黄/蓝）
var LEVEL_WORDS = {
  zh: { 红: '红', 橙: '橙', 黄: '黄', 蓝: '蓝', 红色: '红色', 橙色: '橙色', 黄色: '黄色', 蓝色: '蓝色' },
  en: { 红: 'Red', 橙: 'Orange', 黄: 'Yellow', 蓝: 'Blue', 红色: 'Red', 橙色: 'Orange', 黄色: 'Yellow', 蓝色: 'Blue' },
  es: { 红: 'Rojo', 橙: 'Naranja', 黄: 'Amarillo', 蓝: 'Azul', 红色: 'Rojo', 橙色: 'Naranja', 黄色: 'Amarillo', 蓝色: 'Azul' },
  fr: { 红: 'Rouge', 橙: 'Orange', 黄: 'Jaune', 蓝: 'Bleu', 红色: 'Rouge', 橙色: 'Orange', 黄色: 'Jaune', 蓝色: 'Bleu' },
  it: { 红: 'Rosso', 橙: 'Arancio', 黄: 'Giallo', 蓝: 'Blu', 红色: 'Rosso', 橙色: 'Arancio', 黄色: 'Giallo', 蓝色: 'Blu' }
};

/** 级别单字翻译（防御指南预警信号） */
function levelWord(zhWord, lang) {
  var l = lang || getLang();
  var map = LEVEL_WORDS[l] || LEVEL_WORDS.zh;
  return map[zhWord] || zhWord;
}

// 数据源名称翻译
var SOURCE_NAMES = {
  '华风爱科天气API': {
    en: 'WeatherCN API', es: 'API WeatherCN', fr: 'API WeatherCN', it: 'API WeatherCN'
  },
  '华风爱科天气API（中国气象局授权）': {
    en: 'WeatherCN API (CMA-authorized)',
    es: 'API WeatherCN (autorizada por la AMC)',
    fr: 'API WeatherCN (autorisée par l’AMC)',
    it: 'API WeatherCN (autorizzata dall’AMC)'
  },
  '高德天气API': {
    en: 'AMap Weather API', es: 'API meteorológica AMap',
    fr: 'API météo AMap', it: 'API meteo AMap'
  }
};

/** 数据源名称翻译 */
function dataSourceName(zhName, lang) {
  var l = lang || getLang();
  if (l === 'zh') {
    return zhName;
  }
  var e = SOURCE_NAMES[zhName];
  if (!e) { return zhName; }
  return typeof e === 'string' ? e : (e[l] || e.en || zhName);
}

// 天气现象翻译表（华风实况接口返回中文 WeatherText，按当前语言翻译）
var WEATHER_WORDS = {
  '晴': { en: 'Clear', es: 'Despejado', fr: 'Dégagé', it: 'Sereno' },
  '晴朗': { en: 'Clear', es: 'Despejado', fr: 'Dégagé', it: 'Sereno' },
  '碧空': { en: 'Clear Sky', es: 'Cielo despejado', fr: 'Ciel dégagé', it: 'Cielo sereno' },
  '大部晴朗': { en: 'Mostly Clear', es: 'Mayormente despejado', fr: 'Plutôt dégagé', it: 'Prevalentemente sereno' },
  '少云': { en: 'Few Clouds', es: 'Pocas nubes', fr: 'Quelques nuages', it: 'Poche nuvole' },
  '晴间多云': { en: 'Partly Cloudy', es: 'Parcialmente nublado', fr: 'Partiellement nuageux', it: 'Parzialmente nuvoloso' },
  '局部多云': { en: 'Partly Cloudy', es: 'Parcialmente nublado', fr: 'Partiellement nuageux', it: 'Parzialmente nuvoloso' },
  '多云': { en: 'Cloudy', es: 'Nublado', fr: 'Nuageux', it: 'Nuvoloso' },
  '大部多云': { en: 'Mostly Cloudy', es: 'Mayormente nublado', fr: 'Plutôt nuageux', it: 'Prevalentemente nuvoloso' },
  '阴': { en: 'Overcast', es: 'Cubierto', fr: 'Couvert', it: 'Coperto' },
  '阴天': { en: 'Overcast', es: 'Cubierto', fr: 'Couvert', it: 'Coperto' },
  '雨': { en: 'Rain', es: 'Lluvia', fr: 'Pluie', it: 'Pioggia' },
  '小雨': { en: 'Light Rain', es: 'Lluvia ligera', fr: 'Pluie légère', it: 'Pioggia leggera' },
  '小到中雨': { en: 'Light to Moderate Rain', es: 'Lluvia ligera a moderada', fr: 'Pluie légère à modérée', it: 'Pioggia da leggera a moderata' },
  '中雨': { en: 'Moderate Rain', es: 'Lluvia moderada', fr: 'Pluie modérée', it: 'Pioggia moderata' },
  '中到大雨': { en: 'Moderate to Heavy Rain', es: 'Lluvia moderada a fuerte', fr: 'Pluie modérée à forte', it: 'Pioggia da moderata a forte' },
  '大雨': { en: 'Heavy Rain', es: 'Lluvia fuerte', fr: 'Pluie forte', it: 'Pioggia forte' },
  '大到暴雨': { en: 'Heavy to Torrential Rain', es: 'Lluvia fuerte a torrencial', fr: 'Pluie forte à torrentielle', it: 'Pioggia da forte a torrenziale' },
  '暴雨': { en: 'Torrential Rain', es: 'Lluvia torrencial', fr: 'Pluie torrentielle', it: 'Pioggia torrenziale' },
  '大暴雨': { en: 'Extreme Rain', es: 'Lluvia extrema', fr: 'Pluie extrême', it: 'Pioggia estrema' },
  '特大暴雨': { en: 'Extreme Rain', es: 'Lluvia extrema', fr: 'Pluie extrême', it: 'Pioggia estrema' },
  '阵雨': { en: 'Showers', es: 'Chubascos', fr: 'Averses', it: 'Rovesci' },
  '零星阵雨': { en: 'Isolated Showers', es: 'Chubascos aislados', fr: 'Averses éparses', it: 'Rovesci isolati' },
  '雷阵雨': { en: 'Thunderstorms', es: 'Tormentas', fr: 'Orages', it: 'Temporali' },
  '雷雨': { en: 'Thunderstorms', es: 'Tormentas', fr: 'Orages', it: 'Temporali' },
  '强雷阵雨': { en: 'Strong Thunderstorms', es: 'Tormentas fuertes', fr: 'Forts orages', it: 'Temporali forti' },
  '雷暴': { en: 'Thunderstorm', es: 'Tormenta', fr: 'Orage', it: 'Temporale' },
  '雷雨大风': { en: 'Thundery Wind', es: 'Viento tormentoso', fr: 'Vent orageux', it: 'Vento temporalesco' },
  '冻雨': { en: 'Freezing Rain', es: 'Lluvia helada', fr: 'Pluie verglaçante', it: 'Pioggia gelata' },
  '毛毛雨': { en: 'Drizzle', es: 'Llovizna', fr: 'Bruine', it: 'Pioggerella' },
  '冰雹': { en: 'Hail', es: 'Granizo', fr: 'Grêle', it: 'Grandine' },
  '雨夹雪': { en: 'Sleet', es: 'Aguanieve', fr: 'Neige fondue', it: 'Nevischio' },
  '冰粒': { en: 'Ice Pellets', es: 'Graupel', fr: 'Grésil', it: 'Granelli di ghiaccio' },
  '米雪': { en: 'Snow Grains', es: 'Granos de nieve', fr: 'Grains de neige', it: 'Granelli di neve' },
  '雪': { en: 'Snow', es: 'Nieve', fr: 'Neige', it: 'Neve' },
  '小雪': { en: 'Light Snow', es: 'Nieve ligera', fr: 'Neige légère', it: 'Neve leggera' },
  '小到中雪': { en: 'Light to Moderate Snow', es: 'Nieve ligera a moderada', fr: 'Neige légère à modérée', it: 'Neve da leggera a moderata' },
  '中雪': { en: 'Moderate Snow', es: 'Nieve moderada', fr: 'Neige modérée', it: 'Neve moderata' },
  '中到大雪': { en: 'Moderate to Heavy Snow', es: 'Nieve moderada a fuerte', fr: 'Neige modérée à forte', it: 'Neve da moderata a forte' },
  '大雪': { en: 'Heavy Snow', es: 'Nieve fuerte', fr: 'Neige forte', it: 'Neve forte' },
  '暴雪': { en: 'Blizzard', es: 'Ventisca', fr: 'Blizzard', it: 'Bufera di neve' },
  '阵雪': { en: 'Snow Showers', es: 'Chubascos de nieve', fr: 'Averses de neige', it: 'Rovesci di neve' },
  '雾': { en: 'Fog', es: 'Niebla', fr: 'Brouillard', it: 'Nebbia' },
  '轻雾': { en: 'Mist', es: 'Neblina', fr: 'Brume', it: 'Foschia' },
  '浓雾': { en: 'Dense Fog', es: 'Niebla densa', fr: 'Brouillard dense', it: 'Nebbia fitta' },
  '霾': { en: 'Haze', es: 'Calima', fr: 'Brume sèche', it: 'Foschia secca' },
  '浮尘': { en: 'Floating Dust', es: 'Polvo flotante', fr: 'Poussière en suspension', it: 'Polvere sospesa' },
  '扬沙': { en: 'Blowing Dust', es: 'Polvo levantado', fr: 'Poussière soufflée', it: 'Polvere sollevata' },
  '沙尘暴': { en: 'Dust Storm', es: 'Tormenta de polvo', fr: 'Tempête de sable', it: 'Tempesta di sabbia' },
  '强沙尘暴': { en: 'Severe Dust Storm', es: 'Tormenta de polvo severa', fr: 'Tempête de sable sévère', it: 'Tempesta di sabbia severa' },
  '烟霾': { en: 'Smoke', es: 'Humo', fr: 'Fumée', it: 'Fumo' },
  '风': { en: 'Windy', es: 'Ventoso', fr: 'Venteux', it: 'Ventoso' },
  '微风': { en: 'Light Wind', es: 'Viento ligero', fr: 'Vent léger', it: 'Vento leggero' },
  '强风': { en: 'Strong Wind', es: 'Viento fuerte', fr: 'Vent fort', it: 'Vento forte' },
  '大风': { en: 'Strong Wind', es: 'Viento fuerte', fr: 'Vent fort', it: 'Vento forte' },
  '狂风': { en: 'Gale', es: 'Vendaval', fr: 'Coup de vent', it: 'Burrasca' },
  '暴风': { en: 'Storm', es: 'Tormenta', fr: 'Tempête', it: 'Tempesta' },
  '龙卷风': { en: 'Tornado', es: 'Tornado', fr: 'Tornade', it: 'Tornado' },
  '炎热': { en: 'Hot', es: 'Caluroso', fr: 'Chaud', it: 'Caldo' },
  '酷热': { en: 'Extremely Hot', es: 'Muy caluroso', fr: 'Très chaud', it: 'Molto caldo' },
  '热': { en: 'Hot', es: 'Caluroso', fr: 'Chaud', it: 'Caldo' },
  '温暖': { en: 'Mild', es: 'Templado', fr: 'Doux', it: 'Mite' },
  '冷': { en: 'Cold', es: 'Frío', fr: 'Froid', it: 'Freddo' },
  '寒冷': { en: 'Cold', es: 'Frío', fr: 'Froid', it: 'Freddo' },
  '严寒': { en: 'Freezing', es: 'Helado', fr: 'Glacial', it: 'Gelido' }
};

// “转/到”组合词的连词（多云转晴 → Cloudy to Clear；小到中雨 → Light to Moderate Rain）
var WEATHER_JUNCTIONS = {
  en: { to: ' to ', between: ' to ' },
  es: { to: ' a ', between: ' a ' },
  fr: { to: ' puis ', between: ' à ' },
  it: { to: ' poi ', between: ' a ' }
};

/** 天气现象翻译（华风返回中文，按当前语言显示） */
function weatherName(text, lang) {
  var l = lang || getLang();
  if (!text) {
    return '';
  }
  if (l === 'zh') {
    return text;
  }
  var hit = WEATHER_WORDS[text];
  if (hit) {
    return hit[l] || hit.en || text;
  }
  // 含“转”的组合（如 多云转晴）
  if (text.indexOf('转') > -1) {
    var junct = (WEATHER_JUNCTIONS[l] || WEATHER_JUNCTIONS.en).to;
    return text.split('转').map(function (p) {
      var h = WEATHER_WORDS[p];
      return h ? (h[l] || h.en || p) : p;
    }).join(junct);
  }
  // 含“到”的组合（如 小到中雨，若未命中全词表）
  if (text.indexOf('到') > -1) {
    var junct2 = (WEATHER_JUNCTIONS[l] || WEATHER_JUNCTIONS.en).between;
    return text.split('到').map(function (p) {
      var h = WEATHER_WORDS[p];
      return h ? (h[l] || h.en || p) : p;
    }).join(junct2);
  }
  // 子串兜底（长键优先，如“强降雨”“分散性小雨”）
  var allKeys = Object.keys(WEATHER_WORDS).sort(function (a, b) { return b.length - a.length; });
  for (var ki = 0; ki < allKeys.length; ki++) {
    if (text.indexOf(allKeys[ki]) > -1) {
      var fh = WEATHER_WORDS[allKeys[ki]];
      return fh[l] || fh.en || text;
    }
  }
  return text;
}
var WIND_DIRECTIONS = {
  '北': { en: 'N', es: 'N', fr: 'N', it: 'N' },
  '北北东': { en: 'NNE', es: 'NNE', fr: 'NNE', it: 'NNE' },
  '东北': { en: 'NE', es: 'NE', fr: 'NE', it: 'NE' },
  '东北东': { en: 'ENE', es: 'ENE', fr: 'ENE', it: 'ENE' },
  '东': { en: 'E', es: 'E', fr: 'E', it: 'E' },
  '东南东': { en: 'ESE', es: 'ESE', fr: 'ESE', it: 'ESE' },
  '东南': { en: 'SE', es: 'SE', fr: 'SE', it: 'SE' },
  '南南东': { en: 'SSE', es: 'SSE', fr: 'SSE', it: 'SSE' },
  '南': { en: 'S', es: 'S', fr: 'S', it: 'S' },
  '南南西': { en: 'SSW', es: 'SSW', fr: 'SSW', it: 'SSW' },
  '西南': { en: 'SW', es: 'SW', fr: 'SO', it: 'SW' },
  '西南西': { en: 'WSW', es: 'WSW', fr: 'OSO', it: 'WSW' },
  '西': { en: 'W', es: 'W', fr: 'O', it: 'W' },
  '西北西': { en: 'WNW', es: 'WNW', fr: 'ONO', it: 'WNW' },
  '西北': { en: 'NW', es: 'NO', fr: 'NO', it: 'NW' },
  '北北西': { en: 'NNW', es: 'NNW', fr: 'NNO', it: 'NNW' }
};
var WIND_DIRECTION_KEYS = [
  '北北东', '东北东', '东南东', '南南东', '南南西', '西南西', '西北西', '北北西',
  '东北', '东南', '西南', '西北', '北', '东', '南', '西'
];

/** 风向翻译（如“东南14km/h”→ “SE14km/h”），未识别返回原文 */
function windName(windText, lang) {
  var l = lang || getLang();
  if (!windText || l === 'zh') {
    return windText;
  }
  for (var i = 0; i < WIND_DIRECTION_KEYS.length; i++) {
    var dir = WIND_DIRECTION_KEYS[i];
    if (windText.indexOf(dir) === 0) {
      var hit = WIND_DIRECTIONS[dir];
      return (hit[l] || hit.en || dir) + windText.slice(dir.length);
    }
  }
  return windText;
}

// 次生灾害风险项翻译（key 与 utils/risk.js 一致；非中文语言显示对应翻译）
var RISK_ITEMS = {
  urban_flooding: {
    zh: { name: '城市内涝', note: '低洼路段积水、下穿隧道进水' },
    en: { name: 'Urban Flooding', note: 'Waterlogging on low-lying roads and underpasses' },
    es: { name: 'Inundaciones urbanas', note: 'Acumulación de agua en vías bajas y pasos subterráneos' },
    fr: { name: 'Inondations urbaines', note: 'Eaux stagnantes sur les routes basses et sous-passages' },
    it: { name: 'Allagamenti urbani', note: 'Ristagni su strade basse e sottopassi' }
  },
  flash_flood_geo: {
    zh: { name: '山洪/地质灾害', note: '山区中小河流洪水、滑坡、泥石流' },
    en: { name: 'Flash Flood / Geo-hazard', note: 'Floods on mountain rivers, landslides, mudflows' },
    es: { name: 'Inundación repentina / riesgo geológico', note: 'Crecidas de ríos de montaña, deslizamientos' },
    fr: { name: 'Crue soudaine / risque géologique', note: 'Crues des rivières de montagne, glissements' },
    it: { name: 'Piena improvvisa / rischio geologico', note: 'Piene di fiumi montani, frane' }
  },
  farmland_waterlogging: {
    zh: { name: '农田渍涝', note: '农田积水、作物受淹' },
    en: { name: 'Farmland Waterlogging', note: 'Standing water in fields, crops submerged' },
    es: { name: 'Anegamiento de campos', note: 'Agua estancada en campos, cultivos anegados' },
    fr: { name: 'Engorgement des terres', note: 'Eaux stagnantes, cultures submergées' },
    it: { name: 'Ristagno nei campi', note: 'Acqua stagnante, colture sommerse' }
  },
  gale: {
    zh: { name: '大风灾害', note: '广告牌、临时构筑物、树木倒伏' },
    en: { name: 'Gale Damage', note: 'Billboards, temporary structures, fallen trees' },
    es: { name: 'Daños por vendaval', note: 'Carteles, estructuras temporales, árboles caídos' },
    fr: { name: 'Dégâts de vent violent', note: 'Panneaux, structures provisoires, arbres tombés' },
    it: { name: 'Danni da vento forte', note: 'Insegne, strutture provvisorie, alberi caduti' }
  },
  storm_surge: {
    zh: { name: '风暴潮/巨浪', note: '沿海增水、海浪翻越堤坝' },
    en: { name: 'Storm Surge / Huge Waves', note: 'Coastal water rise, waves overtopping dykes' },
    es: { name: 'Marejada / olas gigantes', note: 'Subida del agua costera, olas sobre diques' },
    fr: { name: 'Onde de tempête / grosses vagues', note: 'Montée des eaux côtières, vagues sur les digues' },
    it: { name: 'Mareggiata / onde alte', note: 'Innalzamento costiero, onde oltre le dighe' }
  },
  typhoon_rain_flood: {
    zh: { name: '暴雨次生洪水', note: '台风外围环流带来的强降雨' },
    en: { name: 'Typhoon Rain Flooding', note: 'Heavy rain from the typhoon outer bands' },
    es: { name: 'Inundaciones por lluvias de tifón', note: 'Fuertes lluvias de las bandas exteriores' },
    fr: { name: 'Crues dues aux pluies du typhon', note: 'Fortes pluies des bandes périphériques' },
    it: { name: 'Alluvioni da piogge del tifone', note: 'Forti piogge delle bande esterne' }
  },
  heatstroke: {
    zh: { name: '中暑等健康风险', note: '户外作业、老人儿童更需注意' },
    en: { name: 'Heatstroke & Health Risk', note: 'Outdoor workers, elderly and children at higher risk' },
    es: { name: 'Golpe de calor y riesgo para la salud', note: 'Trabajadores al aire libre, mayores y niños' },
    fr: { name: 'Coup de chaleur et risque sanitaire', note: 'Travailleurs en extérieur, personnes âgées et enfants' },
    it: { name: 'Colpo di calore e rischio salute', note: 'Lavoratori all’aperto, anziani e bambini' }
  },
  forest_fire_heat: {
    zh: { name: '森林火险', note: '天干物燥，火源管理风险上升' },
    en: { name: 'Forest Fire Risk', note: 'Dry weather raises ignition risk; manage fire sources' },
    es: { name: 'Riesgo de incendio forestal', note: 'Tiempo seco aumenta el riesgo de ignición' },
    fr: { name: 'Risque d’incendie de forêt', note: 'Temps sec, risque d’ignition accru' },
    it: { name: 'Rischio incendi boschivi', note: 'Tempo secco aumenta il rischio di innesco' }
  },
  drought_trend: {
    zh: { name: '干旱趋势', note: '持续高温加剧土壤失墒' },
    en: { name: 'Drought Trend', note: 'Prolonged heat accelerates soil moisture loss' },
    es: { name: 'Tendencia a la sequía', note: 'El calor prolongado agrava la pérdida de humedad' },
    fr: { name: 'Tendance à la sécheresse', note: 'La chaleur prolongée accélère la perte d’humidité' },
    it: { name: 'Tendenza alla siccità', note: 'Il caldo prolungato aggrava la perdita di umidità' }
  },
  freezing_damage: {
    zh: { name: '冻害', note: '农作物、果树、养殖业受冻' },
    en: { name: 'Frost Damage', note: 'Crops, orchards and livestock affected' },
    es: { name: 'Daños por heladas', note: 'Cultivos, frutales y ganadería afectados' },
    fr: { name: 'Dégâts de gel', note: 'Cultures, vergers et élevage touchés' },
    it: { name: 'Danni da gelo', note: 'Colture, frutteti e allevamenti colpiti' }
  },
  road_ice_cold: {
    zh: { name: '道路结冰', note: '路面湿滑，早晚高峰事故风险' },
    en: { name: 'Icy Roads', note: 'Slippery roads, higher accident risk at rush hours' },
    es: { name: 'Carreteras con hielo', note: 'Calzadas resbaladizas, riesgo en horas punta' },
    fr: { name: 'Verglas', note: 'Chaussées glissantes, risque aux heures de pointe' },
    it: { name: 'Ghiaccio sulle strade', note: 'Asfalto scivoloso, rischio nelle ore di punta' }
  },
  health_cold: {
    zh: { name: '健康风险', note: '心脑血管疾病、呼吸道疾病高发' },
    en: { name: 'Health Risk', note: 'Cardiovascular and respiratory illness peaks' },
    es: { name: 'Riesgo para la salud', note: 'Picos de enfermedades cardiovasculares y respiratorias' },
    fr: { name: 'Risque sanitaire', note: 'Pics de maladies cardiovasculaires et respiratoires' },
    it: { name: 'Rischio salute', note: 'Picchi di malattie cardiovascolari e respiratorie' }
  },
  snow_road_ice: {
    zh: { name: '道路积雪结冰', note: '高速公路封闭、车辆打滑' },
    en: { name: 'Snow & Ice on Roads', note: 'Highways closed, vehicles skidding' },
    es: { name: 'Nieve y hielo en carreteras', note: 'Autopistas cerradas, vehículos derrapando' },
    fr: { name: 'Neige et verglas routiers', note: 'Autoroutes fermées, véhicules dérapant' },
    it: { name: 'Neve e ghiaccio sulle strade', note: 'Autostrade chiuse, veicoli che slittano' }
  },
  structure_collapse: {
    zh: { name: '设施压垮', note: '简易棚、大棚、老旧房屋承压' },
    en: { name: 'Structure Collapse', note: 'Sheds, greenhouses and old houses under pressure' },
    es: { name: 'Colapso de estructuras', note: 'Cobertizos, invernaderos y casas viejas bajo presión' },
    fr: { name: 'Effondrement de structures', note: 'Abris, serres et vieux bâtiments sous pression' },
    it: { name: 'Crollo di strutture', note: 'Tettoie, serre e vecchie case sotto pressione' }
  },
  traffic_block: {
    zh: { name: '交通受阻', note: '航班延误、公交停运' },
    en: { name: 'Traffic Disruption', note: 'Flight delays, bus services suspended' },
    es: { name: 'Interrupción del tráfico', note: 'Retrasos de vuelos, autobuses suspendidos' },
    fr: { name: 'Perturbation du trafic', note: 'Retards de vols, bus suspendus' },
    it: { name: 'Interruzione del traffico', note: 'Ritardi voli, bus sospesi' }
  },
  traffic_accident: {
    zh: { name: '交通事故', note: '能见度低，高速追尾风险' },
    en: { name: 'Traffic Accidents', note: 'Low visibility, rear-end collision risk' },
    es: { name: 'Accidentes de tráfico', note: 'Baja visibilidad, riesgo de alcance' },
    fr: { name: 'Accidents de la route', note: 'Visibilité réduite, risque de carambolage' },
    it: { name: 'Incidenti stradali', note: 'Bassa visibilità, rischio tamponamenti' }
  },
  flight_delay: {
    zh: { name: '航班延误', note: '机场能见度不达标' },
    en: { name: 'Flight Delays', note: 'Visibility below airport minima' },
    es: { name: 'Retrasos de vuelos', note: 'Visibilidad inferior al mínimo aeroportuario' },
    fr: { name: 'Retards de vols', note: 'Visibilité sous le minimum aéroportuaire' },
    it: { name: 'Ritardi dei voli', note: 'Visibilità sotto il minimo aeroportuale' }
  },
  respiratory_fog: {
    zh: { name: '呼吸道影响', note: '雾中污染物不易扩散' },
    en: { name: 'Respiratory Effects', note: 'Pollutants linger in fog' },
    es: { name: 'Efectos respiratorios', note: 'Los contaminantes persisten en la niebla' },
    fr: { name: 'Effets respiratoires', note: 'Les polluants stagnent dans le brouillard' },
    it: { name: 'Effetti respiratori', note: 'Gli inquinanti ristagnano nella nebbia' }
  },
  lightning_fire: {
    zh: { name: '雷击火灾', note: '森林、易燃场所雷击起火' },
    en: { name: 'Lightning Fire', note: 'Forests and flammable sites struck' },
    es: { name: 'Incendios por rayos', note: 'Bosques y zonas inflamables alcanzados' },
    fr: { name: 'Incendie par foudre', note: 'Forêts et sites inflammables touchés' },
    it: { name: 'Incendi da fulmine', note: 'Foreste e luoghi infiammabili colpiti' }
  },
  power_damage: {
    zh: { name: '电力设施损坏', note: '雷击导致跳闸、设备受损' },
    en: { name: 'Power Facility Damage', note: 'Lightning trips breakers, damages equipment' },
    es: { name: 'Daños en instalaciones eléctricas', note: 'Rayos provocan cortes y daños' },
    fr: { name: 'Dommages aux installations électriques', note: 'La foudre provoque coupures et dommages' },
    it: { name: 'Danni a impianti elettrici', note: 'I fulmini causano sbalzi e danni' }
  },
  outdoor_work: {
    zh: { name: '户外作业风险', note: '高处、空旷地带作业危险' },
    en: { name: 'Outdoor Work Risk', note: 'Work at height or open areas is dangerous' },
    es: { name: 'Riesgo en trabajos al aire libre', note: 'Peligro en alturas y zonas abiertas' },
    fr: { name: 'Risque du travail en extérieur', note: 'Danger en hauteur et zones découvertes' },
    it: { name: 'Rischio lavoro all’aperto', note: 'Pericolo in quota e aree aperte' }
  },
  falling_objects: {
    zh: { name: '高空坠物', note: '塔吊、广告牌、外墙脱落' },
    en: { name: 'Falling Objects', note: 'Tower cranes, billboards, facade panels' },
    es: { name: 'Caída de objetos', note: 'Grúas, carteles, fachadas' },
    fr: { name: 'Chutes d’objets', note: 'Grues, panneaux, façades' },
    it: { name: 'Caduta di oggetti', note: 'Gru, insegne, facciate' }
  },
  structure_fall: {
    zh: { name: '设施倒塌', note: '临时建筑、围挡、简易棚' },
    en: { name: 'Structure Toppling', note: 'Temporary buildings, fences, sheds' },
    es: { name: 'Derrumbe de estructuras', note: 'Construcciones temporales, vallas, cobertizos' },
    fr: { name: 'Renversement de structures', note: 'Bâtiments provisoires, clôtures, abris' },
    it: { name: 'Crollo di strutture temporanee', note: 'Costruzioni provvisorie, recinzioni, tettoie' }
  },
  fire_spread: {
    zh: { name: '森林火险助燃', note: '大风加快火势蔓延' },
    en: { name: 'Fire Spread Fuel', note: 'Strong wind accelerates fire spread' },
    es: { name: 'Propagación de incendios', note: 'El viento acelera la propagación' },
    fr: { name: 'Accélération des feux', note: 'Le vent fort accélère la propagation' },
    it: { name: 'Propagazione incendi', note: 'Il vento forte accelera la diffusione' }
  },
  crop_damage: {
    zh: { name: '农作物受损', note: '砸伤作物、果树、蔬菜大棚' },
    en: { name: 'Crop Damage', note: 'Crops, orchards and greenhouses hit' },
    es: { name: 'Daños en cultivos', note: 'Cultivos, frutales e invernaderos afectados' },
    fr: { name: 'Dégâts aux cultures', note: 'Cultures, vergers et serres touchés' },
    it: { name: 'Danni alle colture', note: 'Colture, frutteti e serre colpiti' }
  },
  vehicle_home_damage: {
    zh: { name: '车辆/房屋损坏', note: '车窗、屋面被砸破损' },
    en: { name: 'Vehicle / Property Damage', note: 'Windows and roofs broken' },
    es: { name: 'Daños en vehículos/viviendas', note: 'Ventanales y tejados dañados' },
    fr: { name: 'Dommages véhicules/habitations', note: 'Vitres et toitures endommagées' },
    it: { name: 'Danni a veicoli/abitazioni', note: 'Vetri e tetti danneggiati' }
  },
  injury_risk: {
    zh: { name: '人员受伤风险', note: '户外人员暴露风险' },
    en: { name: 'Injury Risk', note: 'People outdoors are exposed' },
    es: { name: 'Riesgo de lesiones', note: 'Personas al aire libre expuestas' },
    fr: { name: 'Risque de blessure', note: 'Personnes exposées à l’extérieur' },
    it: { name: 'Rischio ferimenti', note: 'Persone esposte all’aperto' }
  },
  air_quality: {
    zh: { name: '空气质量恶化', note: 'PM10 浓度显著升高' },
    en: { name: 'Air Quality Deterioration', note: 'PM10 concentration rises sharply' },
    es: { name: 'Deterioro de la calidad del aire', note: 'La concentración de PM10 aumenta' },
    fr: { name: 'Dégradation de la qualité de l’air', note: 'La concentration de PM10 augmente fortement' },
    it: { name: 'Peggioramento dell’aria', note: 'La concentrazione di PM10 aumenta nettamente' }
  },
  traffic_dust: {
    zh: { name: '交通影响', note: '能见度下降，风沙遮挡视线' },
    en: { name: 'Traffic Impact', note: 'Visibility drops, sand obstructs view' },
    es: { name: 'Impacto en el tráfico', note: 'Visibilidad reducida, arena en la vista' },
    fr: { name: 'Impact sur le trafic', note: 'Visibilité réduite, sable dans le champ de vision' },
    it: { name: 'Impatto sul traffico', note: 'Visibilità ridotta, sabbia che ostacola la vista' }
  },
  respiratory_dust: {
    zh: { name: '呼吸道健康风险', note: '敏感人群减少外出' },
    en: { name: 'Respiratory Health Risk', note: 'Sensitive groups should limit time outside' },
    es: { name: 'Riesgo respiratorio', note: 'Grupos sensibles deben reducir salidas' },
    fr: { name: 'Risque respiratoire', note: 'Les personnes sensibles doivent limiter les sorties' },
    it: { name: 'Rischio respiratorio', note: 'I soggetti sensibili limitino le uscite' }
  },
  crop_loss: {
    zh: { name: '农作物减产', note: '土壤墒情持续恶化' },
    en: { name: 'Crop Yield Loss', note: 'Soil moisture keeps worsening' },
    es: { name: 'Pérdida de cosechas', note: 'La humedad del suelo empeora' },
    fr: { name: 'Perte de rendement', note: 'L’humidité du sol se dégrade' },
    it: { name: 'Perdita di raccolti', note: 'L’umidità del suolo peggiora' }
  },
  water_shortage: {
    zh: { name: '饮水困难', note: '水库蓄水不足地区突出' },
    en: { name: 'Water Shortage', note: 'Most acute where reservoirs are low' },
    es: { name: 'Escasez de agua', note: 'Más aguda donde los embalses están bajos' },
    fr: { name: 'Pénurie d’eau', note: 'Plus aiguë où les réservoirs sont bas' },
    it: { name: 'Carenza d’acqua', note: 'Più acuta dove i serbatoi sono bassi' }
  },
  forest_fire_drought: {
    zh: { name: '森林火险', note: '植被干燥，易燃物增多' },
    en: { name: 'Forest Fire Risk', note: 'Dry vegetation, more flammable material' },
    es: { name: 'Riesgo de incendio forestal', note: 'Vegetación seca, más material inflamable' },
    fr: { name: 'Risque d’incendie de forêt', note: 'Végétation sèche, plus de combustible' },
    it: { name: 'Rischio incendi boschivi', note: 'Vegetazione secca, più materiale infiammabile' }
  },
  landslide_mudflow: {
    zh: { name: '滑坡/泥石流', note: '持续浸泡易诱发次生灾害' },
    en: { name: 'Landslide / Mudflow', note: 'Prolonged soaking can trigger secondary hazards' },
    es: { name: 'Deslizamiento / alud de barro', note: 'La saturación prolongada puede desencadenarlos' },
    fr: { name: 'Glissement / coulée de boue', note: 'La saturation prolongée peut les déclencher' },
    it: { name: 'Frana / colata di fango', note: 'La saturazione prolungata può innescarle' }
  },
  dyke_risk: {
    zh: { name: '堤防风险', note: '中小河流、水库超警' },
    en: { name: 'Dyke Risk', note: 'Small rivers and reservoirs above alert level' },
    es: { name: 'Riesgo de diques', note: 'Ríos y embalses por encima del nivel de alerta' },
    fr: { name: 'Risque de digues', note: 'Rivières et réservoirs au-dessus du seuil' },
    it: { name: 'Rischio argini', note: 'Fiumi e bacini sopra la soglia di allerta' }
  },
  landslide: {
    zh: { name: '滑坡', note: '边坡失稳，依山住户注意' },
    en: { name: 'Landslide', note: 'Unstable slopes; hillside residents beware' },
    es: { name: 'Deslizamiento', note: 'Laderas inestables; residentes de laderas' },
    fr: { name: 'Glissement de terrain', note: 'Pentes instables; habitants à proximité' },
    it: { name: 'Frana', note: 'Pendii instabili; residenti sui versanti' }
  },
  mudflow: {
    zh: { name: '泥石流', note: '沟谷地带暴雨后高发' },
    en: { name: 'Mudflow', note: 'Frequent after heavy rain in gullies' },
    es: { name: 'Alud de barro', note: 'Frecuente tras lluvias en barrancos' },
    fr: { name: 'Coulée de boue', note: 'Fréquente après les pluies dans les ravins' },
    it: { name: 'Colata di fango', note: 'Frequente dopo piogge nei canaloni' }
  },
  collapse_rockfall: {
    zh: { name: '塌方/落石', note: '山区道路通行风险' },
    en: { name: 'Collapse / Rockfall', note: 'Mountain road travel risk' },
    es: { name: 'Derrumbe / caída de rocas', note: 'Riesgo en carreteras de montaña' },
    fr: { name: 'Éboulement / chute de pierres', note: 'Risque sur routes de montagne' },
    it: { name: 'Smottamento / caduta massi', note: 'Rischio su strade di montagna' }
  },
  fire_spread_forest: {
    zh: { name: '火势蔓延', note: '风干物燥，火情扩散快' },
    en: { name: 'Fire Spread', note: 'Dry and windy; flames spread fast' },
    es: { name: 'Propagación del fuego', note: 'Seco y ventoso; propagación rápida' },
    fr: { name: 'Propagation du feu', note: 'Sec et venteux; propagation rapide' },
    it: { name: 'Propagazione del fuoco', note: 'Secco e ventoso; diffusione rapida' }
  },
  smoke_pollution: {
    zh: { name: '烟霾污染', note: '下风向能见度与空气质量' },
    en: { name: 'Smoke Pollution', note: 'Downwind visibility and air quality' },
    es: { name: 'Contaminación por humo', note: 'Visibilidad y calidad del aire a sotavento' },
    fr: { name: 'Pollution par la fumée', note: 'Visibilité et qualité de l’air sous le vent' },
    it: { name: 'Inquinamento da fumo', note: 'Visibilità e qualità dell’aria sottovento' }
  },
  crop_frost: {
    zh: { name: '农作物冻害', note: '花期/幼果期作物敏感' },
    en: { name: 'Crop Frost Damage', note: 'Blooming / young fruit crops are sensitive' },
    es: { name: 'Helada en cultivos', note: 'Cultivos en floración/fruto joven sensibles' },
    fr: { name: 'Gel des cultures', note: 'Cultures en fleur / jeunes fruits sensibles' },
    it: { name: 'Gelate alle colture', note: 'Colture in fiore / frutti giovani sensibili' }
  },
  fruit_tree_damage: {
    zh: { name: '果树受损', note: '幼芽、新梢受冻' },
    en: { name: 'Fruit Tree Damage', note: 'Buds and new shoots frozen' },
    es: { name: 'Daños en frutales', note: 'Yemas y brotes nuevos helados' },
    fr: { name: 'Dégâts aux arbres fruitiers', note: 'Bourgeons et pousses gelés' },
    it: { name: 'Danni agli alberi da frutto', note: 'Gemme e nuovi germogli gelati' }
  },
  sea_work: {
    zh: { name: '海上作业风险', note: '渔船、养殖平台注意回港避浪' },
    en: { name: 'Offshore Work Risk', note: 'Fishing boats and farms should return to port' },
    es: { name: 'Riesgo en trabajos marítimos', note: 'Barcos y plataformas deben volver a puerto' },
    fr: { name: 'Risque du travail en mer', note: 'Bateaux et fermes marines doivent rentrer' },
    it: { name: 'Rischio lavoro in mare', note: 'Pescherecci e allevamenti rientrino in porto' }
  },
  coastal_flooding: {
    zh: { name: '沿岸淹没', note: '巨浪翻越防波堤、海堤' },
    en: { name: 'Coastal Flooding', note: 'Huge waves overtop breakwaters and seawalls' },
    es: { name: 'Inundación costera', note: 'Olas sobre rompeolas y malecones' },
    fr: { name: 'Inondation côtière', note: 'Vagues par-dessus digues et brise-lames' },
    it: { name: 'Allagamento costiero', note: 'Onde oltre frangiflutti e moli' }
  },
  traffic_accident_ice: {
    zh: { name: '交通事故', note: '桥面、背阴路段冰面湿滑' },
    en: { name: 'Traffic Accidents', note: 'Bridges and shaded stretches are icy and slick' },
    es: { name: 'Accidentes de tráfico', note: 'Puentes y tramos en sombra helados' },
    fr: { name: 'Accidents de la route', note: 'Ponts et sections à l’ombre verglacés' },
    it: { name: 'Incidenti stradali', note: 'Ponti e tratti in ombra ghiacciati' }
  },
  travel_block: {
    zh: { name: '出行受阻', note: '公交延误、高速管制' },
    en: { name: 'Travel Disruption', note: 'Bus delays, highway restrictions' },
    es: { name: 'Dificultad para viajar', note: 'Retrasos de autobuses, restricciones' },
    fr: { name: 'Difficultés de déplacement', note: 'Retards de bus, restrictions autoroutières' },
    it: { name: 'Difficoltà di spostamento', note: 'Ritardi bus, limitazioni autostradali' }
  },
  traffic_impact: {
    zh: { name: '交通出行影响', note: '恶劣天气导致道路通行受阻' },
    en: { name: 'Traffic Impact', note: 'Bad weather blocks road travel' },
    es: { name: 'Impacto en desplazamientos', note: 'El mal tiempo bloquea las vías' },
    fr: { name: 'Impact sur les déplacements', note: 'Le mauvais temps bloque les routes' },
    it: { name: 'Impatto sugli spostamenti', note: 'Il maltempo blocca le strade' }
  },
  facility_damage: {
    zh: { name: '设施受损', note: '户外设施、管线受天气影响' },
    en: { name: 'Facility Damage', note: 'Outdoor facilities and lines affected by weather' },
    es: { name: 'Daños en instalaciones', note: 'Instalaciones y líneas afectadas por el clima' },
    fr: { name: 'Dommages aux installations', note: 'Installations et lignes affectées' },
    it: { name: 'Danni alle strutture', note: 'Impianti e linee colpiti dal maltempo' }
  },
  health_safety: {
    zh: { name: '健康安全风险', note: '户外活动人员注意防护' },
    en: { name: 'Health & Safety Risk', note: 'People outdoors should take precautions' },
    es: { name: 'Riesgo para la salud y seguridad', note: 'Precaución para quienes estén al aire libre' },
    fr: { name: 'Risque santé et sécurité', note: 'Prudence pour les personnes à l’extérieur' },
    it: { name: 'Rischio salute e sicurezza', note: 'Prudenza per chi è all’aperto' }
  }
};

/** 按风险 key 取当前语言的名称与提示 */
function riskItem(key, lang) {
  var l = lang || getLang();
  var item = key && RISK_ITEMS[key];
  if (!item) {
    return { name: '', note: '' };
  }
  var v = item[l] || item.en || {};
  return { name: v.name || '', note: v.note || '' };
}

// 机构名精确翻译（发布单位等）
var ORG_NAMES = {
  '国家预警信息发布中心': {
    en: 'National Early Warning Center',
    es: 'Centro Nacional de Alerta Temprana',
    fr: "Centre national d'alerte précoce",
    it: 'Centro Nazionale di Allerta Precoce'
  },
  '中国气象局': {
    en: 'China Meteorological Administration',
    es: 'Administración Meteorológica de China',
    fr: 'Administration météorologique de Chine',
    it: 'Amministrazione Meteorologica della Cina'
  }
};

// 机构名后缀翻译（“XX气象台/气象局”等）
var ORG_SUFFIXES = {
  '气象台': {
    en: 'Meteorological Observatory',
    es: 'Observatorio Meteorológico',
    fr: 'Observatoire météorologique',
    it: 'Osservatorio Meteorologico'
  },
  '气象局': {
    en: 'Meteorological Bureau',
    es: 'Oficina Meteorológica',
    fr: 'Bureau météorologique',
    it: 'Ufficio Meteorologico'
  },
  '应急管理厅': {
    en: 'Department of Emergency Management',
    es: 'Departamento de Gestión de Emergencias',
    fr: 'Département de gestion des urgences',
    it: 'Dipartimento di Gestione delle Emergenze'
  },
  '应急管理局': {
    en: 'Bureau of Emergency Management',
    es: 'Oficina de Gestión de Emergencias',
    fr: 'Bureau de gestion des urgences',
    it: 'Ufficio di Gestione delle Emergenze'
  },
  '人民政府': {
    en: "People's Government",
    es: 'Gobierno Popular',
    fr: 'Gouvernement populaire',
    it: 'Governo Popolare'
  }
};

/** 机构名翻译（精确表 → 地名+后缀规则 → 原样） */
function orgName(zhName, lang) {
  var l = lang || getLang();
  if (!zhName || l === 'zh') {
    return zhName;
  }
  var hit = ORG_NAMES[zhName];
  if (hit) {
    return hit[l] || hit.en || zhName;
  }
  var suffixList = ['气象台', '气象局', '应急管理厅', '应急管理局', '人民政府'];
  for (var i = 0; i < suffixList.length; i++) {
    var suffix = suffixList[i];
    if (zhName.indexOf(suffix) > 0) {
      var prefix = zhName.slice(0, zhName.indexOf(suffix));
      var sfx = ORG_SUFFIXES[suffix];
      var p = placeName(prefix, l);
      return (p ? p + ' ' : '') + (sfx[l] || sfx.en);
    }
  }
  return zhName;
}

/** 预警标题本地化：形如“高温黄色预警/暴雨红色预警”→ 类型+级别翻译组合；其他保留原文 */
function alertTitle(title, type, level, lang) {
  var l = lang || getLang();
  if (l === 'zh' || !title) {
    return title;
  }
  var m = String(title).match(/^(.+?)(红色|橙色|黄色|蓝色)?预警$/);
  if (m) {
    var t = disasterName(m[1] || type, l);
    var lv = m[2] ? levelName(level, l) : '';
    return (t + (lv ? ' ' + lv : '')).trim();
  }
  return title;
}

/** 影响区域本地化：翻译城市前缀（“广州市”→“Guangzhou”），其余区县名保留 */
function areaName(area, cityName, lang) {
  var l = lang || getLang();
  if (l === 'zh' || !area) {
    return area;
  }
  if (cityName && area.indexOf(cityName) === 0) {
    return placeName(cityName, l) + area.slice(cityName.length);
  }
  var p = placeName(area, l);
  return p === area ? area : p;
}

// ---- 防御要点（非中文界面：按预警类型给出本地化标准防御要点） ----
var DEFENSE_SENTENCES = {
  stayIndoors: {
    zh: '减少不必要的户外活动',
    en: 'Limit unnecessary outdoor activities',
    es: 'Reduzca las actividades innecesarias al aire libre',
    fr: 'Limitez les activités en extérieur inutiles',
    it: 'Riduci le attività non necessarie all’aperto'
  },
  elderKids: {
    zh: '老人、儿童等敏感人群减少外出',
    en: 'Elderly people and children should stay indoors',
    es: 'Mayores y niños deben quedarse en casa',
    fr: 'Les personnes âgées et les enfants doivent rester à l’intérieur',
    it: 'Anziani e bambini restino in casa'
  },
  hydrate: {
    zh: '注意及时补水',
    en: 'Stay hydrated',
    es: 'Manténgase hidratado',
    fr: 'Restez hydraté',
    it: 'Mantieniti idratato'
  },
  electricFire: {
    zh: '注意用电用火安全',
    en: 'Be careful with electricity and fire',
    es: 'Tenga cuidado con la electricidad y el fuego',
    fr: 'Attention à l’électricité et au feu',
    it: 'Attenzione a elettricità e fuoco'
  },
  avoidLowland: {
    zh: '避开低洼积水路段',
    en: 'Avoid low-lying flooded areas',
    es: 'Evite zonas bajas inundadas',
    fr: 'Évitez les zones basses inondées',
    it: 'Evita le zone basse allagate'
  },
  stayAwayRivers: {
    zh: '远离河道、山体等危险区域',
    en: 'Stay away from rivers, slopes and other danger zones',
    es: 'Aléjese de ríos, laderas y otras zonas de peligro',
    fr: 'Tenez-vous éloigné des rivières, pentes et autres zones dangereuses',
    it: 'Stai lontano da fiumi, pendii e altre zone pericolose'
  },
  secureItems: {
    zh: '加固门窗及易被吹动的设施',
    en: 'Secure doors, windows and loose items',
    es: 'Asegure puertas, ventanas y objetos sueltos',
    fr: 'Fixez portes, fenêtres et objets susceptibles de bouger',
    it: 'Fissa porte, finestre e oggetti che possono essere spostati'
  },
  coastalCare: {
    zh: '沿海地区注意防范风浪',
    en: 'Coastal areas should beware of strong waves',
    es: 'Las zonas costeras deben tener cuidado con las olas',
    fr: 'Les zones côtières doivent se méfier des vagues',
    it: 'Le zone costiere devono fare attenzione alle onde'
  },
  driveSafe: {
    zh: '减速慢行，注意交通安全',
    en: 'Drive slowly and stay safe on the road',
    es: 'Conduzca despacio y con precaución',
    fr: 'Conduisez prudemment et soyez vigilant',
    it: 'Guida piano e fai attenzione'
  },
  avoidBillboards: {
    zh: '远离广告牌、临时构筑物',
    en: 'Stay away from billboards and temporary structures',
    es: 'Aléjese de carteles y estructuras temporales',
    fr: 'Éloignez-vous des panneaux et structures provisoires',
    it: 'Stai lontano da insegne e strutture temporanee'
  },
  stopOutdoorWork: {
    zh: '停止户外作业和高空作业',
    en: 'Stop outdoor and high-altitude work',
    es: 'Detenga los trabajos al aire libre y en altura',
    fr: 'Arrêtez les travaux en extérieur et en hauteur',
    it: 'Ferma i lavori all’aperto e in quota'
  },
  takeShelter: {
    zh: '尽快进入室内或坚固建筑躲避',
    en: 'Take shelter indoors or in a sturdy building quickly',
    es: 'Refúgiese rápidamente en un lugar cerrado o sólido',
    fr: 'Mettez-vous rapidement à l’abri dans un bâtiment solide',
    it: 'Riparati subito al chiuso o in un edificio robusto'
  },
  protectVehicles: {
    zh: '妥善保护车辆等易损财产',
    en: 'Protect vehicles and other vulnerable property',
    es: 'Proteja vehículos y otros bienes vulnerables',
    fr: 'Protégez les véhicules et autres biens vulnérables',
    it: 'Proteggi veicoli e altri beni vulnerabili'
  },
  wearMask: {
    zh: '外出佩戴口罩，做好呼吸防护',
    en: 'Wear a mask outdoors and protect your breathing',
    es: 'Use mascarilla al aire libre y proteja su respiración',
    fr: 'Portez un masque à l’extérieur et protégez votre respiration',
    it: 'Indossa la mascherina all’aperto e proteggi le vie respiratorie'
  },
  keepWarm: {
    zh: '注意防寒保暖',
    en: 'Keep warm and dress appropriately',
    es: 'Abríguese bien',
    fr: 'Couvrez-vous bien',
    it: 'Tieniti al caldo'
  },
  cropFrost: {
    zh: '做好农作物防冻措施',
    en: 'Take measures to protect crops from frost',
    es: 'Proteja los cultivos de las heladas',
    fr: 'Protégez les cultures du gel',
    it: 'Proteggi le colture dal gelo'
  },
  iceRoads: {
    zh: '注意道路结冰，谨防滑倒',
    en: 'Beware of icy roads and slippery surfaces',
    es: 'Cuidado con el hielo en las carreteras',
    fr: 'Attention au verglas et aux surfaces glissantes',
    it: 'Attenzione al ghiaccio stradale e alle superfici scivolose'
  },
  saveWater: {
    zh: '节约用水，合理调配水资源',
    en: 'Save water and use it wisely',
    es: 'Ahorre agua y úsela con prudencia',
    fr: 'Économisez l’eau et utilisez-la avec prudence',
    it: 'Risparmia acqua e usala con prudenza'
  },
  noFire: {
    zh: '严禁野外用火',
    en: 'No open fires outdoors',
    es: 'Prohibido hacer fuego al aire libre',
    fr: 'Interdiction de feu à l’extérieur',
    it: 'Vietato accendere fuochi all’aperto'
  },
  evacuate: {
    zh: '服从安排，及时转移避险',
    en: 'Follow instructions and evacuate to safety in time',
    es: 'Siga las instrucciones y evacúe a tiempo',
    fr: 'Suivez les consignes et évacuez à temps',
    it: 'Segui le istruzioni ed evacua in tempo'
  },
  geoHazard: {
    zh: '山区注意防范滑坡、泥石流',
    en: 'Beware of landslides and mudflows in mountain areas',
    es: 'Cuidado con deslizamientos y aludes en zonas de montaña',
    fr: 'Méfiez-vous des glissements et coulées de boue en montagne',
    it: 'Attenzione a frane e colate di fango in montagna'
  },
  followOfficial: {
    zh: '关注官方发布的预警最新信息',
    en: 'Follow the latest official warning updates',
    es: 'Siga las últimas alertas oficiales',
    fr: 'Suivez les dernières informations officielles',
    it: 'Segui gli ultimi aggiornamenti ufficiali'
  }
};

// 预警类型 → 防御要点句子 key 列表
var DEFENSE_MAP = {
  '高温': ['stayIndoors', 'elderKids', 'hydrate', 'followOfficial'],
  '暴雨': ['avoidLowland', 'stayAwayRivers', 'stayIndoors', 'followOfficial'],
  '台风': ['secureItems', 'stayIndoors', 'coastalCare', 'followOfficial'],
  '寒潮': ['keepWarm', 'elderKids', 'iceRoads', 'followOfficial'],
  '暴雪': ['stayIndoors', 'iceRoads', 'driveSafe', 'followOfficial'],
  '大雾': ['driveSafe', 'wearMask', 'followOfficial'],
  '雷电': ['stopOutdoorWork', 'takeShelter', 'avoidBillboards', 'followOfficial'],
  '大风': ['avoidBillboards', 'secureItems', 'stopOutdoorWork', 'followOfficial'],
  '冰雹': ['takeShelter', 'protectVehicles', 'stayIndoors', 'followOfficial'],
  '沙尘': ['wearMask', 'stayIndoors', 'followOfficial'],
  '干旱': ['saveWater', 'noFire', 'followOfficial'],
  '洪水': ['stayAwayRivers', 'avoidLowland', 'evacuate', 'followOfficial'],
  '地质灾害': ['geoHazard', 'evacuate', 'followOfficial'],
  '森林火险': ['noFire', 'followOfficial'],
  '霜冻': ['cropFrost', 'keepWarm', 'followOfficial'],
  '海浪': ['coastalCare', 'stopOutdoorWork', 'followOfficial'],
  '道路结冰': ['iceRoads', 'driveSafe', 'followOfficial']
};
var DEFENSE_FALLBACK = ['stayIndoors', 'followOfficial'];

/** 按预警类型取本地化防御要点（非中文界面用；中文界面仍展示官方原文） */
function defenseByType(type, lang) {
  var l = lang || getLang();
  var keys = DEFENSE_MAP[type] || DEFENSE_FALLBACK;
  return keys.map(function (key) {
    var s = DEFENSE_SENTENCES[key];
    if (!s) {
      return '';
    }
    return s[l] || s.en || s.zh;
  }).filter(Boolean);
}

/**
 * 正文本地化摘要（非中文界面替代官方中文正文）。
 * 由已翻译字段组装：标题 + 影响区域 + 生效时间 + 主要风险。
 */
function alertSummary(alert, lang) {
  var l = lang || getLang();
  if (!alert) {
    return '';
  }
  var title = alertTitle(alert.title, alert.type, alert.level, l);
  var area = areaName(alert.area, alert.cityName, l);
  var dur = String(alert.duration || '')
    .replace(/ 至 /, ' ' + t('durationTo', l) + ' ');
  var risks = (alert.risks || []).map(function (r) {
    var item = riskItem(r.key, l);
    return (item.name || r.name) + ' ' + r.prob + '%';
  });
  var parts = [title];
  if (area) {
    parts.push(t('summaryAffect', l) + ': ' + area);
  }
  if (dur) {
    parts.push(t('summaryValid', l) + ': ' + dur);
  }
  if (risks.length) {
    parts.push(t('summaryRisk', l) + ': ' + risks.join(', '));
  }
  return parts.join('. ');
}

/* ---- 扩展：测验 / 急救 / 成因（五语言） ---- */
var QUIZ_DATA = {"zh":{"rain1":{"q":"暴雨预警期间，以下哪种做法最安全？","o":["涉水通过积水的下穿隧道","留在室内高处，远离低洼地带","去河边观察水情"],"a":1,"why":"积水深度难以判断，下穿隧道与河道风险最高，应留在室内并关注官方信息。"},"rain2":{"q":"户外积水已没过脚踝且还在上涨，应该？","o":["快速蹚水回家","就近向高处转移并求救","原地等待水退"],"a":1,"why":"仅15厘米深的流水就可能把人冲倒，应立即向高处转移。"},"typhoon1":{"q":"台风来临前，窗户应如何处理？","o":["大开保持通风","关紧并用胶带贴“米”字，必要时加挡板","只拉上窗帘"],"a":1,"why":"胶带可减少玻璃破碎飞溅，关紧门窗能防止强风灌入。"},"typhoon2":{"q":"台风天在户外，最应远离什么？","o":["高楼、广告牌与大树","空旷的草地","便利店"],"a":0,"why":"高空坠物、倒伏的广告牌和树木是台风主要伤害来源。"},"quake1":{"q":"室内突发地震，第一反应是？","o":["立刻跑出门外","蹲下、掩护、抓牢，躲在坚固桌下","乘电梯下楼"],"a":1,"why":"晃动时奔跑极易摔倒，电梯可能断电，应先就近掩护。"},"quake2":{"q":"地震后撤离大楼，正确做法是？","o":["走楼梯，避开外墙与电线杆","乘电梯最快","回屋拿贵重物品"],"a":0,"why":"余震可能持续，电梯会断电，外墙与高处物品可能坠落。"},"heat1":{"q":"出现头晕、大量出汗、恶心等中暑征兆，应？","o":["继续活动多出汗","转移到阴凉处，补水并降温","喝冰啤酒解暑"],"a":1,"why":"中暑须立即降温并补充水分，酒精反而加重脱水。"},"heat2":{"q":"高温红色预警期间，最不建议做的是？","o":["上午10点到下午4点户外锻炼","留在空调房","少量多次喝水"],"a":0,"why":"正午前后气温与地表温度最高，户外剧烈活动极易中暑。"},"thunder1":{"q":"户外打雷闪电，正确做法是？","o":["到大树下避雨","双脚并拢蹲在低洼处，远离金属与高处","撑金属伞快跑"],"a":1,"why":"树木与金属易引雷，蹲下可降低高度，双脚并拢减少跨步电压。"},"thunder2":{"q":"室内打雷时应避免什么？","o":["使用接水管或外接天线的设备，关窗远离阳台","坐在木椅上","安静看书"],"a":0,"why":"雷电可沿水管、天线侵入室内，金属窗栏同样危险。"}},"en":{"rain1":{"q":"During a rainstorm alert, which action is safest?","o":["Wading through a flooded underpass","Staying indoors on a high level, away from low ground","Going to watch the river"],"a":1,"why":"Flood depth is hard to judge; underpasses and rivers are the deadliest spots—stay indoors."},"rain2":{"q":"Floodwater outdoors is already over your ankles and rising. You should:","o":["Wade home quickly","Move immediately to high ground and call for help","Wait where you are"],"a":1,"why":"Just 15 cm of flowing water can knock you down; move to high ground at once."},"typhoon1":{"q":"Before a typhoon arrives, windows should be:","o":["Left wide open","Closed tightly and taped in an X pattern, with boards if needed","Curtains only"],"a":1,"why":"Tape reduces flying shards; tightly closed windows stop wind forcing its way in."},"typhoon2":{"q":"Outdoors during a typhoon, stay farthest from:","o":["Tall buildings, billboards and large trees","Open grassland","Convenience stores"],"a":0,"why":"Falling debris, toppling billboards and trees cause most typhoon injuries."},"quake1":{"q":"An earthquake strikes while you are indoors. First move:","o":["Run outside immediately","Drop, cover and hold on under a sturdy table","Take the elevator down"],"a":1,"why":"Running while shaking is dangerous and elevators may fail; take cover first."},"quake2":{"q":"Evacuating the building after an earthquake, you should:","o":["Use the stairs, away from outer walls and utility poles","Take the elevator for speed","Go back for valuables"],"a":0,"why":"Aftershocks continue, elevators may fail, and outer walls can shed debris."},"heat1":{"q":"Dizziness, heavy sweating and nausea suggest heat illness. You should:","o":["Keep exercising to sweat it out","Move to shade, drink water and cool down","Drink iced beer"],"a":1,"why":"Heat illness demands immediate cooling and fluids; alcohol worsens dehydration."},"heat2":{"q":"During a red high-temperature alert, the least advisable action is:","o":["Exercising outdoors between 10 a.m. and 4 p.m.","Staying in an air-conditioned room","Drinking water often"],"a":0,"why":"Midday brings peak air and surface temperatures; outdoor exertion risks heatstroke."},"thunder1":{"q":"Lightning while outdoors. The correct action is to:","o":["Shelter under a large tree","Crouch with feet together in a low spot, away from metal and heights","Run with a metal umbrella"],"a":1,"why":"Trees and metal attract lightning; crouching lowers your height and closed feet reduce step voltage."},"thunder2":{"q":"Indoors during a thunderstorm, avoid:","o":["Devices connected to pipes or external antennas; close windows and stay off balconies","Sitting on a wooden chair","Reading quietly"],"a":0,"why":"Lightning can travel indoors through pipes and antennas; metal window frames are also risky."}},"es":{"rain1":{"q":"Durante una alerta por lluvia intensa, ¿qué acción es más segura?","o":["Atravesar un paso inferior inundado","Permanecer en interiores, en zonas altas y lejos de zonas bajas","Ir a ver el río"],"a":1,"why":"La profundidad del agua es difícil de calcular; pasos inferiores y ríos son los puntos más peligrosos."},"rain2":{"q":"El agua en la calle ya supera los tobillos y sigue subiendo. ¿Qué hacer?","o":["Cruzar rápido a casa","Subir de inmediato a un lugar alto y pedir ayuda","Esperar quieto"],"a":1,"why":"Solo 15 cm de agua en movimiento pueden derribarte; sube a un lugar alto."},"typhoon1":{"q":"Antes de que llegue un tifón, las ventanas deben:","o":["Quedar abiertas de par en par","Cerrarse bien y ponerse cinta en X, con tablas si hace falta","Solo correr las cortinas"],"a":1,"why":"La cinta reduce los cristales rotos; ventanas bien cerradas impiden la entrada del viento."},"typhoon2":{"q":"En la calle durante un tifón, aléjese sobre todo de:","o":["Edificios altos, vallas publicitarias y árboles grandes","Praderas abiertas","Tiendas"],"a":0,"why":"Los objetos que caen, las vallas y los árboles causan la mayoría de las lesiones."},"quake1":{"q":"Un terremoto sorprende en interiores. La primera reacción es:","o":["Salir corriendo","Agacharse, cubrirse y sujetarse bajo una mesa firme","Bajar en ascensor"],"a":1,"why":"Correr durante el temblor es peligroso y el ascensor puede fallar; cúbrase primero."},"quake2":{"q":"Al evacuar el edificio tras un terremoto, debe:","o":["Usar las escaleras, lejos de muros exteriores y postes","Usar el ascensor, más rápido","Volver por objetos de valor"],"a":0,"why":"Las réplicas continúan, el ascensor puede fallar y los muros pueden desprender material."},"heat1":{"q":"Mareos, sudor abundante y náuseas sugieren golpe de calor. ¿Qué hacer?","o":["Seguir moviéndose para sudar","Ir a la sombra, beber agua y refrescarse","Beber cerveza fría"],"a":1,"why":"El golpe de calor exige enfriarse y beber agua; el alcohol empeora la deshidratación."},"heat2":{"q":"Durante una alerta roja por calor, lo menos aconsejable es:","o":["Hacer ejercicio al aire libre entre las 10 y las 16","Quedarse con aire acondicionado","Beber agua con frecuencia"],"a":0,"why":"A mediodía el aire y el suelo están más calientes; el esfuerzo al aire libre puede causar golpe de calor."},"thunder1":{"q":"Hay rayos al aire libre. La acción correcta es:","o":["Refugiarse bajo un árbol grande","Agacharse con los pies juntos en un punto bajo, lejos de metal y alturas","Correr con paraguas metálico"],"a":1,"why":"Los árboles y el metal atraen rayos; agacharse reduce la altura y los pies juntos reducen la tensión de paso."},"thunder2":{"q":"En casa durante una tormenta, evite:","o":["Aparatos conectados a tuberías o antenas exteriores; cierre ventanas y aléjese de balcones","Sentarse en una silla de madera","Leer en silencio"],"a":0,"why":"Los rayos pueden entrar por tuberías y antenas; los marcos metálicos también son peligrosos."}},"fr":{"rain1":{"q":"Pendant une alerte pluie torrentielle, quelle conduite est la plus sûre ?","o":["Traverser un passage souterrain inondé","Rester à l’intérieur en hauteur, loin des points bas","Aller observer la rivière"],"a":1,"why":"La profondeur de l’eau est difficile à estimer ; passages souterrains et rivières sont les zones les plus meurtrières."},"rain2":{"q":"L’eau dehors dépasse déjà les chevilles et monte encore. Il faut :","o":["Rentrer vite à gué","Gagner immédiatement un point haut et appeler à l’aide","Attendre sur place"],"a":1,"why":"À peine 15 cm d’eau courante peuvent faire tomber ; gagnez un point haut."},"typhoon1":{"q":"Avant l’arrivée d’un typhon, les fenêtres doivent être :","o":["Grand ouvertes","Bien fermées et renforcées de ruban en X, avec des planches si besoin","Rideaux seulement"],"a":1,"why":"Le ruban limite les éclats ; des fenêtres bien fermées empêchent le vent de s’engouffrer."},"typhoon2":{"q":"Dehors pendant un typhon, il faut surtout s’éloigner :","o":["Immeubles hauts, panneaux publicitaires et grands arbres","Prairies ouvertes","Commerces"],"a":0,"why":"Chutes d’objets, panneaux et arbres renversés causent la plupart des blessures."},"quake1":{"q":"Un séisme survient alors que vous êtes à l’intérieur. Premier réflexe :","o":["Sortir en courant","Se baisser, s’abriter et s’agripper sous une table solide","Prendre l’ascenseur"],"a":1,"why":"Courir pendant les secousses est dangereux et l’ascenseur peut se bloquer ; abritez-vous d’abord."},"quake2":{"q":"Pour évacuer l’immeuble après un séisme, il faut :","o":["Prendre les escaliers, loin des murs extérieurs et des poteaux","Prendre l’ascenseur, plus rapide","Récupérer ses objets de valeur"],"a":0,"why":"Les répliques continuent, l’ascenseur peut se bloquer et les murs peuvent lâcher des débris."},"heat1":{"q":"Vertiges, transpiration forte et nausées signalent un coup de chaleur. Il faut :","o":["Continuer à bouger pour transpirer","Aller à l’ombre, boire et se refroidir","Boire une bière fraîche"],"a":1,"why":"Le coup de chaleur impose de se refroidir et de boire ; l’alcool aggrave la déshydratation."},"heat2":{"q":"Pendant une alerte rouge canicule, l’action la plus déconseillée est :","o":["Faire du sport dehors entre 10 h et 16 h","Rester dans une pièce climatisée","Boire de l’eau régulièrement"],"a":0,"why":"En milieu de journée l’air et le sol sont brûlants ; l’effort dehors expose à l’insolation."},"thunder1":{"q":"Éclairs en extérieur. La bonne conduite est :","o":["S’abriter sous un grand arbre","S’accroupir pieds joints dans un creux, loin du métal et des hauteurs","Courir avec un parapluie métallique"],"a":1,"why":"Arbres et métal attirent la foudre ; s’accroupir réduit sa taille et les pieds joints limitent la tension de pas."},"thunder2":{"q":"À l’intérieur pendant un orage, évitez :","o":["Les appareils reliés à des tuyaux ou antennes extérieures ; fermez fenêtres et éloignez-vous des balcons","Vous asseoir sur une chaise en bois","Lire tranquillement"],"a":0,"why":"La foudre peut entrer par les tuyaux et antennes ; les cadres métalliques sont aussi dangereux."}},"it":{"rain1":{"q":"Durante un’allerta per pioggia intensa, quale comportamento è più sicuro?","o":["Attraversare un sottopassaggio allagato","Restare in casa in alto, lontano dalle zone basse","Andare a osservare il fiume"],"a":1,"why":"La profondità dell’acqua è difficile da giudicare; sottopassaggi e fiumi sono i punti più pericolosi."},"rain2":{"q":"L’acqua fuori supera già le caviglie e continua a salire. Cosa fare?","o":["Tornare a casa a guado","Spostarsi subito in alto e chiedere aiuto","Aspettare sul posto"],"a":1,"why":"Bastano 15 cm di acqua corrente per cadere; spostatevi subito in alto."},"typhoon1":{"q":"Prima dell’arrivo di un tifone, le finestre vanno:","o":["Lasciate spalancate","Chiuse bene e rinforzate con nastro a X, con assi se serve","Solo tende chiuse"],"a":1,"why":"Il nastro riduce i frammenti; finestre chiuse impediscono al vento di entrare."},"typhoon2":{"q":"All’aperto durante un tifone, state soprattutto lontano da:","o":["Palazzi alti, cartelloni e alberi grandi","Prati aperti","Negozi"],"a":0,"why":"Oggetti in caduta, cartelloni e alberi causano la maggior parte delle lesioni."},"quake1":{"q":"Un terremoto arriva mentre siete in casa. Prima reazione:","o":["Correre fuori","Abbassarsi, ripararsi e aggrapparsi sotto un tavolo robusto","Prendere l’ascensore"],"a":1,"why":"Correre durante la scossa è pericoloso e l’ascensore può bloccarsi; riparatevi prima."},"quake2":{"q":"Per evacuare il palazzo dopo un terremoto, bisogna:","o":["Usare le scale, lontano da muri esterni e pali","Prendere l’ascensore, più veloce","Tornare per gli oggetti di valore"],"a":0,"why":"Le scosse continuano, l’ascensore può bloccarsi e i muri possono cedere detriti."},"heat1":{"q":"Vertigini, sudorazione forte e nausea suggeriscono colpo di calore. Cosa fare?","o":["Continuare a muoversi per sudare","Andare all’ombra, bere e rinfrescarsi","Bere birra ghiacciata"],"a":1,"why":"Il colpo di calore richiede subito raffreddamento e liquidi; l’alcol peggiora la disidratazione."},"heat2":{"q":"Durante un’allerta rossa per caldo, l’azione più sconsigliata è:","o":["Fare sport all’aperto tra le 10 e le 16","Restare con aria condizionata","Bere spesso acqua"],"a":0,"why":"A metà giornata aria e suolo sono roventi; lo sforzo all’aperto rischia il colpo di calore."},"thunder1":{"q":"Fulmini all’aperto. Il comportamento corretto è:","o":["Ripararsi sotto un grande albero","Accovacciarsi a piedi uniti in un punto basso, lontano da metalli e altezze","Correre con ombrello metallico"],"a":1,"why":"Alberi e metalli attirano i fulmini; accovacciarsi abbassa la figura e i piedi uniti riducono la tensione di passo."},"thunder2":{"q":"In casa durante un temporale, evitate:","o":["Apparecchi collegati a tubi o antenne esterne; chiudete finestre e state lontani dai balconi","Sedervi su una sedia di legno","Leggere in silenzio"],"a":0,"why":"I fulmini possono entrare da tubi e antenne; anche i telai metallici delle finestre sono pericolosi."}}};
var FIRSTAID_DATA = {"zh":[{"id":"cpr","name":"心肺复苏（CPR）","steps":["确认环境安全，轻拍呼喊判断意识；无反应立即让人拨打120","双手叠放于乳头连线中点，胸外按压深5–6厘米，每分钟100–120次","每30次按压配合2次人工呼吸（受过培训时），尽量不中断","AED到达后按语音提示使用，坚持到急救人员接手"]},{"id":"bleeding","name":"严重出血","steps":["让伤者坐下或躺下，无骨折时抬高出血部位","用干净纱布或布料直接按压伤口至少10分钟","出血不止时在伤口近心端加压包扎，不要频繁松开查看","若肢体离断，使用止血带并记录时间，立即送医"]},{"id":"burns","name":"烧烫伤","steps":["立即用流动凉水冲洗15–20分钟降温","剪开周围衣物，粘连处不要强行撕脱，不挑破水泡","用干净保鲜膜或纱布轻轻覆盖，不涂牙膏、酱油","大面积、面部或关节处烧烫伤立即送医"]},{"id":"heimlich","name":"气道异物梗阻","steps":["询问是否噎住；无法咳嗽、说话即为梗阻","站到身后，拳眼对准肚脐上方约两指处","快速向内上方冲击，直到异物排出","若伤者昏迷，立即呼救并开始心肺复苏"]}],"en":[{"id":"cpr","name":"Cardiopulmonary Resuscitation (CPR)","steps":["Check the scene is safe; tap and shout to check responsiveness. If none, send someone to call 120","Hands centered between the nipples; compress 5–6 cm deep at 100–120 per minute","Give 2 rescue breaths per 30 compressions (if trained); minimize interruptions","When an AED arrives, follow voice prompts; continue until responders take over"]},{"id":"bleeding","name":"Severe Bleeding","steps":["Seat or lay the victim down; elevate the limb if there is no fracture","Press directly on the wound with clean cloth for at least 10 minutes","If bleeding continues, apply a pressure bandage toward the heart; do not keep removing it","For an amputated limb, use a tourniquet, note the time, and get to hospital immediately"]},{"id":"burns","name":"Burns & Scalds","steps":["Cool immediately under running cool water for 15–20 minutes","Cut away clothing; do not force off stuck fabric and do not pop blisters","Cover loosely with clean cling film or gauze; never apply toothpaste or soy sauce","Large, facial or joint burns require immediate hospital care"]},{"id":"heimlich","name":"Choking (Heimlich Manoeuvre)","steps":["Ask “Are you choking?”; inability to cough or speak means obstruction","Stand behind them; place your fist about two fingers above the navel","Give quick inward-upward thrusts until the object comes out","If the person becomes unconscious, call for help and start CPR"]}],"es":[{"id":"cpr","name":"Reanimación Cardiopulmonar (RCP)","steps":["Compruebe que el entorno es seguro; golpee suave y grite para ver si responde. Si no, pida que llamen al 120","Manos en el centro del pecho, entre los pezones; comprima 5–6 cm, 100–120 veces por minuto","2 ventilaciones cada 30 compresiones (si tiene formación); no interrumpa","Al llegar un DEA, siga las instrucciones de voz; continúe hasta que llegue el personal sanitario"]},{"id":"bleeding","name":"Hemorragia Grave","steps":["Siente o acueste a la persona; eleve la zona si no hay fractura","Presione directamente la herida con tela limpia al menos 10 minutos","Si no cede, ponga un vendaje compresivo hacia el corazón; no lo quite para mirar","Si hay una amputación, use torniquete, anote la hora y vaya al hospital de inmediato"]},{"id":"burns","name":"Quemaduras","steps":["Enfríe de inmediato con agua corriente fresca durante 15–20 minutos","Corte la ropa; no arranque la que esté pegada ni rompa las ampollas","Cubra sin apretar con film limpio o gasas; no ponga pasta de dientes ni salsa de soja","Las quemaduras grandes, faciales o en articulaciones requieren hospital inmediato"]},{"id":"heimlich","name":"Atragantamiento (Heimlich)","steps":["Pregunte “¿se atraganta?”; si no puede toser ni hablar, hay obstrucción","Colóquese detrás; puño a dos dedos por encima del ombligo","Empuje rápido hacia adentro y arriba hasta que salga el objeto","Si la persona pierde el conocimiento, pida ayuda y comience la RCP"]}],"fr":[{"id":"cpr","name":"Réanimation Cardiopulmonaire (RCP)","steps":["Vérifiez la sécurité des lieux ; tapez et parlez pour vérifier la conscience. Sans réponse, faites appeler le 120","Mains au milieu de la poitrine, entre les mamelons ; compression de 5–6 cm, 100–120 par minute","2 bouffées pour 30 compressions (si formé) ; limitez les interruptions","À l’arrivée d’un DAE, suivez les instructions vocales ; continuez jusqu’au relais des secours"]},{"id":"bleeding","name":"Hémorragie Grave","steps":["Asseyez ou allongez la personne ; surélevez la zone sans fracture","Appuyez directement sur la plaie avec un linge propre au moins 10 minutes","Si le saignement continue, bandage compressif côté cœur ; ne le retirez pas pour regarder","En cas d’amputation, garrot et notez l’heure ; hôpital immédiat"]},{"id":"burns","name":"Brûlures","steps":["Refroidissez aussitôt sous l’eau courante fraîche 15–20 minutes","Coupez les vêtements ; n’arrachez pas ce qui colle et ne percez pas les cloques","Couvrez sans serrer avec un film propre ou une compresse ; ni dentifrice ni sauce soja","Brûlures étendues, au visage ou aux articulations : hôpital immédiat"]},{"id":"heimlich","name":"Fausse Route (Heimlich)","steps":["Demandez « vous vous étouffez ? » ; impossible de parler ou tousser = obstruction","Placez-vous derrière ; poing à deux doigts au-dessus du nombril","Poussées rapides vers l’intérieur et le haut jusqu’à expulsion","Si la personne perd connaissance, appelez et commencez la RCP"]}],"it":[{"id":"cpr","name":"Rianimazione Cardiopolmonare (RCP)","steps":["Verificate la sicurezza dell’ambiente; toccate e parlate per controllare la coscienza. Se non risponde, fate chiamare il 120","Mani al centro del petto, tra i capezzoli; compressioni di 5–6 cm, 100–120 al minuto","2 ventilazioni ogni 30 compressioni (se addestrati); poche interruzioni","Quando arriva un DAE, seguite le istruzioni vocali; continuate fino all’arrivo dei soccorsi"]},{"id":"bleeding","name":"Emorragia Grave","steps":["Sedete o sdraiate la persona; sollevate la zona se non c’è frattura","Premete direttamente sulla ferita con stoffa pulita per almeno 10 minuti","Se continua, bendaggio compressivo verso il cuore; non toglietelo per guardare","In caso di amputazione, laccio emostatico, annotate l’ora e ospedale subito"]},{"id":"burns","name":"Ustioni","steps":["Raffreddate subito sotto acqua corrente fresca per 15–20 minuti","Tagliate i vestiti; non strappate ciò che è attaccato e non rompete le vesciche","Coprite senza stringere con pellicola pulita o garze; niente dentifricio o salsa di soia","Ustioni estese, al viso o alle articolazioni: ospedale subito"]},{"id":"heimlich","name":"Soffocamento (Heimlich)","steps":["Chiedete “sta soffocando?”; non poter tossire o parlare significa ostruzione","Mettetevi dietro; pugno a due dita sopra l’ombelico","Spinte rapide verso dentro e sopra finché esce l’oggetto","Se la persona perde conoscenza, chiamate e iniziate la RCP"]}]};
var CAUSES_DATA = {"zh":{"typhoon":"热带洋面水汽蒸发形成低压，在科里奥利力作用下旋转增强，登陆时带来狂风、暴雨与风暴潮。","rainstorm":"暖湿气流受锋面、地形或对流作用抬升，水汽快速凝结形成强降水；城市不透水地面加剧内涝。","flood":"短时强降水或上游来水超过河道与排水系统能力，漫过河槽或在低洼区汇集。","earthquake":"板块边界应力积累后突然释放，断层错动产生地震波；需警惕余震、滑坡与海啸。","heat":"副热带高压控制下空气下沉增温，城市热岛与夜间高湿使热量难以散出。","coldwave":"高纬强冷空气大规模南下，气温骤降并伴大风、雨雪与冰冻。","thunder":"强对流云内电荷分离，云地间放电产生雷击，伴短时强风、暴雨、冰雹。","gale":"冷锋、台风外围或强对流造成气压梯度增大，空气高速流动，易吹坠物、倒伏。","hail":"强对流云内水滴反复冻结、碰撞增大，超过上升气流承载后坠落。","fog":"近地面水汽遇冷凝结成悬浮小水滴，能见度骤降，影响交通。","forestfire":"干燥高温条件叠加火源（雷击或人为）引燃植被，大风加速蔓延并产生飞火。","drought":"长期降水偏少、蒸发旺盛，土壤失墒、水源枯竭。"},"en":{"typhoon":"Warm, moist air rises over tropical oceans to form a low-pressure system; the Coriolis effect spins it into a storm bringing violent wind, rain and storm surge.","rainstorm":"Moist air is forced upward by fronts, terrain or convection and condenses rapidly into heavy rain; impermeable city surfaces worsen flooding.","flood":"Heavy rainfall or upstream inflow exceeds the capacity of rivers and drains, overflowing channels or pooling in low-lying areas.","earthquake":"Accumulated stress at plate boundaries releases suddenly as faults slip, sending out seismic waves; aftershocks, landslides and tsunamis may follow.","heat":"Under a subtropical high, sinking air warms the ground; urban heat islands and humid nights trap the heat.","coldwave":"Frigid air masses surge southward, causing a sudden temperature drop with strong winds, snow and freezing rain.","thunder":"Charge separates inside strong convective clouds; cloud-to-ground discharge produces lightning, with brief strong wind, rain and hail.","gale":"Strong pressure gradients from cold fronts, typhoon outflow or convection drive high-speed air that topples objects and structures.","hail":"Droplets inside convective clouds repeatedly freeze and grow until too heavy for updrafts, then fall as hail.","fog":"Near-surface moisture condenses into suspended droplets, sharply reducing visibility and disrupting traffic.","forestfire":"Dry, hot conditions plus an ignition source (lightning or humans) set vegetation alight; wind spreads the fire and carries embers.","drought":"Long periods of below-average rainfall with high evaporation dry the soil and deplete water supplies."},"es":{"typhoon":"El aire cálido y húmedo sube sobre océanos tropicales formando una baja presión; el efecto de Coriolis lo hace girar hasta convertirse en tormenta con viento, lluvia y marea ciclónica.","rainstorm":"El aire húmedo asciende por frentes, relieve o convección y se condensa con rapidez; las superficies impermeables de la ciudad agravan las inundaciones.","flood":"La lluvia intensa o el caudal aguas arriba superan la capacidad de ríos y desagües, que se desbordan o anegan zonas bajas.","earthquake":"La tensión acumulada en los bordes de placas se libera bruscamente al moverse fallas, generando ondas sísmicas; pueden seguir réplicas, deslizamientos y tsunamis.","heat":"Bajo un alta subtropical el aire desciende y se calienta; las islas de calor urbanas y las noches húmedas atrapan el calor.","coldwave":"Masas de aire gélido avanzan hacia el sur con descenso brusco de temperatura, vientos fuertes, nieve y lluvia helada.","thunder":"Las cargas se separan dentro de nubes convectivas; la descarga nube-tierra produce rayos, con viento, lluvia y granizo breves e intensos.","gale":"Los fuertes gradientes de presión de frentes, bordes de tifones o convección generan aire a gran velocidad que derriba objetos.","hail":"Las gotas dentro de nubes convectivas se congelan y crecen repetidamente hasta superar la corriente ascendente y caer como granizo.","fog":"La humedad cerca del suelo se condensa en gotas en suspensión, reduciendo la visibilidad y afectando al tráfico.","forestfire":"El tiempo seco y caluroso, junto con un foco de ignición (rayo o acción humana), prende la vegetación; el viento propaga el fuego y transporta brasas.","drought":"Largos periodos con lluvia escasa y evaporación alta secan el suelo y agotan las reservas de agua."},"fr":{"typhoon":"L’air chaud et humide s’élève au-dessus des océans tropicaux et forme une dépression ; l’effet de Coriolis le fait tourner en tempête, avec vent violent, pluies et onde de tempête.","rainstorm":"L’air humide est soulevé par des fronts, le relief ou la convection et se condense vite en pluies fortes ; les surfaces imperméables urbaines aggravent les inondations.","flood":"Des pluies fortes ou un afflux en amont dépassent la capacité des rivières et égouts, qui débordent ou inondent les creux.","earthquake":"La contrainte accumulée aux limites de plaques se libère brutalement par le glissement de failles, émettant des ondes sismiques ; répliques, glissements de terrain et tsunamis peuvent suivre.","heat":"Sous une dorsale subtropicale l’air descend et se réchauffe ; îlots de chaleur urbains et nuits humides emprisonnent la chaleur.","coldwave":"Des masses d’air glacial dévalent vers le sud avec une chute brutale de température, vents forts, neige et pluie verglaçante.","thunder":"Les charges se séparent dans les nuages convectifs ; la décharge nuage-sol donne la foudre, accompagnée de brefs coups de vent, pluie et grêle.","gale":"De forts gradients de pression (fronts froids, bord de typhon, convection) créent un vent rapide qui renverse objets et structures.","hail":"Les gouttes dans les nuages convectifs gèlent et grossissent à répétition, puis tombent quand elles dépassent les courants ascendants.","fog":"L’humidité près du sol se condense en gouttelettes en suspension, réduisant fortement la visibilité et perturbant la circulation.","forestfire":"Sécheresse et chaleur, ajoutées à une source de feu (foudre ou homme), enflamment la végétation ; le vent propage le feu et porte les braises.","drought":"De longues périodes sans pluie avec forte évaporation dessèchent les sols et épuisent les réserves d’eau."},"it":{"typhoon":"L’aria calda e umida sale sugli oceani tropicali formando una bassa pressione; l’effetto di Coriolis la fa ruotare in tempesta con vento fortissimo, pioggia e marea ciclonica.","rainstorm":"L’aria umida è sollevata da fronti, rilievi o convezione e condensa rapidamente in forti piogge; le superfici impermeabili urbane peggiorano le inondazioni.","flood":"Piogge intense o afflusso a monte superano la capacità di fiumi e scarichi, che esondano o allagano le zone basse.","earthquake":"Lo stress accumulato ai confini delle placche si libera bruscamente con lo scorrimento di faglie, emettendo onde sismiche; possono seguire scosse, frane e tsunami.","heat":"Sotto un’alta subtropicale l’aria scende e si riscalda; isole di calore urbane e notti umide intrappolano il calore.","coldwave":"Masse d’aria gelida scendono a sud con calo brusco di temperatura, venti forti, neve e pioggia gelata.","thunder":"Le cariche si separano nei nuvoloni convettivi; la scarica nuvola-suolo dà il fulmine, con brevi raffiche, pioggia e grandine.","gale":"Forti gradienti di pressione (fronti freddi, bordo di tifoni, convezione) creano vento veloce che rovescia oggetti e strutture.","hail":"Le gocce nei nuvoloni convettivi gelano e crescono a ripetizione, poi cadono quando superano le correnti ascensionali.","fog":"L’umidità vicino al suolo condensa in goccioline sospese, riducendo la visibilità e bloccando il traffico.","forestfire":"Secchezza e caldo, più un innesco (fulmine o uomo), incendiano la vegetazione; il vento propaga il fuoco e porta braci.","drought":"Lunghi periodi di poca pioggia con forte evaporazione disseccano il suolo ed esauriscono le riserve d’acqua."}};
var QUIZ_TYPE = { rain1:"rainstorm", rain2:"rainstorm", typhoon1:"typhoon", typhoon2:"typhoon", quake1:"earthquake", quake2:"earthquake", heat1:"heat", heat2:"heat", thunder1:"thunder", thunder2:"thunder" };
var TYPE_ALIAS = {
  '暴雨':'rainstorm','台风':'typhoon','地震':'earthquake','高温':'heat','热浪':'heat',
  '雷电':'thunder','雷暴':'thunder','雷雨':'thunder',
  '洪水':'flood','洪涝':'flood','寒潮':'coldwave','大风':'gale','强风':'gale',
  '冰雹':'hail','大雾':'fog','雾':'fog','霾':'fog',
  '森林火险':'forestfire','森林火灾':'forestfire','干旱':'drought'
};
function normType(ty){ return TYPE_ALIAS[ty] || ty; }
function quizByType(type, lang){
  var l = lang || getLang();
  var data = QUIZ_DATA[l] || QUIZ_DATA.zh;
  var key = normType(type);
  return Object.keys(data).filter(function(id){ return QUIZ_TYPE[id] === key; }).map(function(id){ return Object.assign({id:id}, data[id]); });
}
function firstaid(lang){
  var l = lang || getLang();
  return FIRSTAID_DATA[l] || FIRSTAID_DATA.zh;
}
function causes(type, lang){
  var l = lang || getLang();
  var d = CAUSES_DATA[l] || CAUSES_DATA.zh;
  return d[normType(type)] || "";
}

module.exports = {
  LANGUAGES: LANGUAGES,
  LANG_STORAGE_KEY: LANG_STORAGE_KEY,
  getLang: getLang,
  setLang: setLang,
  t: t,
  tpl: tpl,
  pack: pack,
  disasterName: disasterName,
  placeName: placeName,
  levelName: levelName,
  levelWord: levelWord,
  dataSourceName: dataSourceName,
  weatherName: weatherName,
  windName: windName,
  riskItem: riskItem,
  orgName: orgName,
  alertTitle: alertTitle,
  areaName: areaName,
  defenseByType: defenseByType,
  alertSummary: alertSummary,
  phones: phones,
  materials: materials,
  tips: tips,
  quizByType: quizByType,
  firstaid: firstaid,
  causes: causes
};
  window.__modules['i18n'] = module.exports;
})();
