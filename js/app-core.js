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
