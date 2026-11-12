/* ================================================================
 * app-core.js —— 主控共享层
 * 从 app.js 抽出：HTML 转义、日期格式化、语言包快捷方式、5 语言 UI 文案。
 * 通过 window.NDCore 暴露给 app.js / ui.js。
 * ================================================================ */
(function () {
  var i18n = __require('i18n');

  /* ---------- HTML 转义（接口文本不可信，防注入） ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function lang() { return i18n.getLang(); }
  function T(l) { return i18n.pack(l || lang()).t; }

  function formatNow(time) {
    var d = new Date(time || Date.now());
    try {
      return new Intl.DateTimeFormat(lang() === 'zh' ? 'zh-CN' : lang(), {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
      }).format(d);
    } catch (e) {
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
        ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }
  }

  /* ---------- 网页版特有文案（5 语言） ---------- */
  var WEB = {
    expandMap: {
      zh: '展开地图', en: 'Open larger map', es: 'Ampliar mapa',
      fr: 'Agrandir la carte', it: 'Apri la mappa ingrandita'
    },
    fitMap: {
      zh: '适配屏幕', en: 'Fit to screen', es: 'Ajustar a pantalla',
      fr: 'Ajuster à l’écran', it: 'Adatta allo schermo'
    },
    backToWarnings: {
      zh: '返回预警总览', en: 'Back to warnings', es: 'Volver a las alertas',
      fr: 'Retour aux alertes', it: 'Torna alle allerte'
    },
    expandedMapHint: {
      zh: '滑动或滚动查看地图，选择城市即可查看当地预警。',
      en: 'Swipe or scroll to explore. Select a city to view its warnings.',
      es: 'Deslice o desplácese para explorar. Seleccione una ciudad para ver sus alertas.',
      fr: 'Faites défiler la carte. Sélectionnez une ville pour voir ses alertes.',
      it: 'Scorri per esplorare. Seleziona una città per vedere le allerte.'
    },
    pendingData: {
      zh: '该城市的数据尚未发布，请稍后刷新。', en: 'This city has not been checked yet. Please check again shortly.',
      es: 'Esta ciudad aún no se ha consultado. Vuelva más tarde.', fr: 'Cette ville n’a pas encore été vérifiée. Réessayez bientôt.', it: 'Questa città non è ancora stata controllata. Riprova tra poco.'
    },
    outdatedData: {
      zh: '该城市的数据已过期，正在等待下一次更新。', en: 'This city’s data is outdated. Awaiting the next update.',
      es: 'Datos desactualizados. Esperando la próxima actualización.', fr: 'Données obsolètes. En attente de la prochaine mise à jour.', it: 'Dati obsoleti. In attesa del prossimo aggiornamento.'
    },
    snapshotHint: {
      zh: '预警定期更新，未查询或过期不代表没有预警。', en: 'Warnings update periodically. Unknown or outdated data does not mean no warnings.',
      es: 'Las alertas se actualizan periódicamente. Sin datos no significa sin alertas.', fr: 'Les alertes sont périodiques. L’absence de données ne signifie pas l’absence d’alertes.', it: 'Le allerte sono aggiornate periodicamente. Dati assenti non significano assenza di allerte.'
    },
    retryFetch: { zh: '刷新数据', en: 'Refresh data', es: 'Actualizar datos', fr: 'Actualiser', it: 'Aggiorna dati' },
    coverage: { zh: '数据在更新周期内的城市', en: 'Cities with current data', es: 'Ciudades con datos actuales', fr: 'Villes aux données à jour', it: 'Città con dati attuali' },
    overviewTitle: {
      zh: '自然灾害预警总览', en: 'Disaster warning overview', es: 'Resumen de alertas',
      fr: 'Vue d’ensemble des alertes', it: 'Panoramica delle allerte'
    },
    overviewSubtitle: {
      zh: '关注所在城市，了解全国预警态势。', en: 'Your local warnings, with a view across the country.',
      es: 'Alertas locales y una visión de todo el país.', fr: 'Vos alertes locales et une vue sur tout le pays.',
      it: 'Allerte locali e una panoramica nazionale.'
    },
    mapHint: {
      zh: '点击城市，查看当地预警。', en: 'Select a city to view its warnings.',
      es: 'Seleccione una ciudad para ver sus alertas.', fr: 'Sélectionnez une ville pour voir ses alertes.',
      it: 'Seleziona una città per vedere le allerte.'
    },
    unknown: {
      zh: '无历史数据', en: 'No past data', es: 'Sin datos anteriores',
      fr: 'Sans historique', it: 'Nessun dato precedente'
    },
    dataUnavailable: {
      zh: '数据暂不可用', en: 'Data unavailable', es: 'Datos no disponibles',
      fr: 'Données indisponibles', it: 'Dati non disponibili'
    },
    lastSuccess: {
      zh: '上次成功获取：', en: 'Last successful fetch: ', es: 'Última consulta correcta: ',
      fr: 'Dernière récupération réussie : ', it: 'Ultimo recupero riuscito: '
    },
    configHint: {
      zh: '请检查网络连接，或稍后重试；如持续失败，可能是当日接口免费配额已用尽',
      en: 'Check your network or try again later; persistent failures may mean the daily API quota is exhausted',
      es: 'Compruebe la conexión o inténtelo más tarde; si persiste, la cuota diaria de la API puede haberse agotado',
      fr: 'Vérifiez votre connexion ou réessayez plus tard ; en cas d’échec persistant, le quota quotidien de l’API est peut-être épuisé',
      it: 'Controlla la connessione o riprova più tardi; se il problema persiste, la quota giornaliera dell’API potrebbe essere esaurita'
    },
    srcWeathercn: {
      zh: '中国气象局授权官方数据，实时预警与实况天气',
      en: 'Official data authorized by the China Meteorological Administration',
      es: 'Datos oficiales autorizados por la Administración Meteorológica de China',
      fr: 'Données officielles autorisées par l’Administration météorologique chinoise',
      it: 'Dati ufficiali autorizzati dall’Amministrazione meteorologica cinese'
    },
    searchTitle: { zh: '搜索', en: 'Search', es: 'Buscar', fr: 'Rechercher', it: 'Cerca' },
    searchPlaceholder: { zh: '搜索功能、城市、关键词…', en: 'Search features, cities, keywords…', es: 'Buscar funciones, ciudades, palabras clave…', fr: 'Rechercher fonctions, villes, mots-clés…', it: 'Cerca funzioni, città, parole chiave…' },
    searchEmpty: { zh: '没有匹配结果', en: 'No matches', es: 'Sin resultados', fr: 'Aucun résultat', it: 'Nessun risultato' },
    globalTab: { zh: '全球灾害', en: 'Global Hazards', es: 'Amenazas globales', fr: 'Risques mondiaux', it: 'Rischi globali' },
    globalTitle: { zh: '全球灾害监测', en: 'Global Hazard Monitor', es: 'Monitor global de amenazas', fr: 'Surveillance mondiale des risques', it: 'Monitor globale dei rischi' },
    globalSub: { zh: '实时地震与历史目录，叠加卫星底图、影响范围与风险图层。', en: 'Live earthquakes and a historical catalog on a satellite map with impact and risk layers.', es: 'Sismos en vivo y catálogo histórico sobre un mapa satelital con capas de impacto y riesgo.', fr: 'Séismes en direct et catalogue historique sur une carte satellite avec couches d’impact et de risque.', it: 'Terremoti in tempo reale e catalogo storico su una mappa satellitare con livelli di impatto e rischio.' },
    live: { zh: '实时', en: 'Live', es: 'En vivo', fr: 'En direct', it: 'In tempo reale' },
    history: { zh: '历史', en: 'History', es: 'Historial', fr: 'Historique', it: 'Storico' },
    layers: { zh: '图层', en: 'Layers', es: 'Capas', fr: 'Calques', it: 'Livelli' },
    affected: { zh: '影响范围', en: 'Affected areas', es: 'Áreas afectadas', fr: 'Zones touchées', it: 'Aree colpite' },
    population: { zh: '人口暴露', en: 'Population exposure', es: 'Exposición poblacional', fr: 'Exposition de la population', it: 'Esposizione della popolazione' },
    evacuation: { zh: '疏散区', en: 'Evacuation zones', es: 'Zonas de evacuación', fr: 'Zones d’évacuation', it: 'Zone di evacuazione' },
    infrastructure: { zh: '基础设施', en: 'Infrastructure', es: 'Infraestructura', fr: 'Infrastructures', it: 'Infrastrutture' },
    nightlights: { zh: 'NASA 夜光', en: 'NASA night lights', es: 'Luces nocturnas NASA', fr: 'Lumières nocturnes NASA', it: 'Luci notturne NASA' },
    depth: { zh: '深度', en: 'Depth', es: 'Profundidad', fr: 'Profondeur', it: 'Profondità' },
    intensity: { zh: '烈度', en: 'Intensity', es: 'Intensidad', fr: 'Intensité', it: 'Intensità' },
    tsunami: { zh: '海啸', en: 'Tsunami', es: 'Tsunami', fr: 'Tsunami', it: 'Tsunami' },
    sourceLabel: { zh: '数据来源', en: 'Source', es: 'Fuente', fr: 'Source', it: 'Fonte' },
    issued: { zh: '发震时间', en: 'Origin time', es: 'Hora de origen', fr: 'Heure d’origine', it: 'Ora di origine' },
    coordinates: { zh: '坐标', en: 'Coordinates', es: 'Coordenadas', fr: 'Coordonnées', it: 'Coordinate' },
    recommended: { zh: '建议行动', en: 'Recommended actions', es: 'Acciones recomendadas', fr: 'Actions recommandées', it: 'Azioni consigliate' },
    historyRange: { zh: '历史数据范围', en: 'History range', es: 'Rango histórico', fr: 'Plage historique', it: 'Intervallo storico' },
    records: { zh: '条记录', en: 'records', es: 'registros', fr: 'enregistrements', it: 'record' },
    dataTime: { zh: '数据时间', en: 'Data time', es: 'Hora de datos', fr: 'Heure des données', it: 'Ora dei dati' },
    selectHint: { zh: '点击地震点查看详情，点击国家/地区筛选。', en: 'Select a quake for details or a country/region to filter.', es: 'Selecciona un sismo para ver detalles o un país para filtrar.', fr: 'Sélectionnez un séisme pour les détails ou un pays pour filtrer.', it: 'Seleziona un terremoto per i dettagli o un paese per filtrare.' },
    quakeDetail: { zh: '地震详情', en: 'Earthquake details', es: 'Detalles del sismo', fr: 'Détails du séisme', it: 'Dettagli del terremoto' },
    countryLabel: { zh: '国家/地区', en: 'Country / region', es: 'País / región', fr: 'Pays / région', it: 'Paese / regione' },
    nearQuakes: { zh: '附近地震', en: 'Nearby quakes', es: 'Sismos cercanos', fr: 'Séismes proches', it: 'Terremoti vicini' },
    globalNote: { zh: '实时数据来自 USGS；apizero 接口开通后自动切换。', en: 'Live data from USGS; switches to apizero when activated.', es: 'Datos en vivo de USGS; cambia a apizero al activarse.', fr: 'Données en direct de l’USGS ; bascule vers apizero une fois activé.', it: 'Dati in tempo reale da USGS; passa ad apizero quando attivato.' },
    all: { zh: '全部', en: 'All', es: 'Todos', fr: 'Tous', it: 'Tutti' },
    majorOnly: { zh: '仅 7 级以上', en: 'M7+ only', es: 'Solo M7+', fr: 'M7+ seulement', it: 'Solo M7+' },
    backHome: { zh: '返回中国预警', en: 'Back to China alerts', es: 'Volver a alertas de China', fr: 'Retour aux alertes Chine', it: 'Torna agli avvisi Cina' },
    activeQuakes: { zh: '活跃地震', en: 'Active quakes', es: 'Sismos activos', fr: 'Séismes actifs', it: 'Terremoti attivi' },
    maxMagnitude: { zh: '最大震级', en: 'Max magnitude', es: 'Magnitud máxima', fr: 'Magnitude max', it: 'Magnitudine max' },
    significantQuakes: { zh: '显著地震', en: 'Significant', es: 'Significativos', fr: 'Significatifs', it: 'Significativi' },
    tsunamiAlerts: { zh: '海啸提示', en: 'Tsunami alerts', es: 'Alertas de tsunami', fr: 'Alertes tsunami', it: 'Allerte tsunami' },
    globalStatus: { zh: '全球态势', en: 'Global status', es: 'Estado global', fr: 'Situation mondiale', it: 'Stato globale' },
    chinaStatus: { zh: '中国预警', en: 'China alerts', es: 'Alertas China', fr: 'Alertes Chine', it: 'Avvisi Cina' },
    criticalLocations: { zh: '高风险地区', en: 'Critical locations', es: 'Ubicaciones críticas', fr: 'Zones critiques', it: 'Località critiche' },
    recentWarnings: { zh: '最新预警', en: 'Recent warnings', es: 'Alertas recientes', fr: 'Alertes récentes', it: 'Avvisi recenti' },
    last24h: { zh: '最近 24 小时', en: 'Last 24h', es: 'Últimas 24 h', fr: 'Dernières 24 h', it: 'Ultime 24 h' },
    last7d: { zh: '最近 7 天', en: 'Last 7 days', es: 'Últimos 7 días', fr: '7 derniers jours', it: 'Ultimi 7 giorni' },
    noMatch: { zh: '没有匹配的预警', en: 'No matching alerts', es: 'Sin alertas coincidentes', fr: 'Aucune alerte correspondante', it: 'Nessun avviso corrispondente' },
    disasterType: { zh: '类型', en: 'Type', es: 'Tipo', fr: 'Type', it: 'Tipo' },
    severity: { zh: '级别', en: 'Severity', es: 'Severidad', fr: 'Gravité', it: 'Gravità' },
    quakeRecords: { zh: '地震记录', en: 'Earthquake records', es: 'Registros sísmicos', fr: 'Séismes enregistrés', it: 'Terremoti registrati' },
    zoomIn: { zh: '放大', en: 'Zoom in', es: 'Acercar', fr: 'Zoom avant', it: 'Zoom avanti' },
    zoomOut: { zh: '缩小', en: 'Zoom out', es: 'Alejar', fr: 'Zoom arrière', it: 'Zoom indietro' },
    resetView: { zh: '重置视图', en: 'Reset view', es: 'Restablecer vista', fr: 'Réinitialiser la vue', it: 'Reimposta vista' },
    zoomHint: { zh: '滚轮 / 双指缩放，拖动平移', en: 'Scroll or pinch to zoom, drag to pan', es: 'Rueda o pellizco para zoom, arrastra para mover', fr: 'Molette ou pincement pour zoomer, glisser pour déplacer', it: 'Rotella o pizzica per zoom, trascina per spostare' },
    linkCopied: {
      zh: '链接已复制，可粘贴分享',
      en: 'Link copied, ready to share',
      es: 'Enlace copiado, listo para compartir',
      fr: 'Lien copié, prêt à partager',
      it: 'Link copiato, pronto da condividere'
    }
  };
  function web(key) { var l = lang(); return (WEB[key] && WEB[key][l]) || WEB[key].zh; }

  window.NDCore = {
    esc: esc,
    pad: pad,
    lang: lang,
    T: T,
    formatNow: formatNow,
    WEB: WEB,
    web: web
  };
})();
