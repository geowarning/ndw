/* Shared freshness policy and safety copy; no network requests. */
(function () {
  var copy = {
    zh: {
      historical: '历史查询结果', scanCount: '上次查询时的预警数：{n}', historyNotice: '仅为历史记录，当前状态未知。请勿将旧预警视为仍在生效，也勿将过去的零预警视为当前安全。',
      available: '在更新周期内', outdated: '数据已过期', unavailable: '数据不可用', lastChecked: '上次查询', neverChecked: '尚未查询',
      selectCity: '选择城市以查看数据时间', viewWarnings: '查看该城市预警',
      hazards: '潜在次生灾害', hazardNote: '根据预警类型和级别提示可能的危害，不是发生概率预报。请以官方指引为准。',
      original: '官方原文（中文）', originalLink: '查看官方来源', checked: '数据查询时间', noticeSummary: '预警正文',
      offline: '当前离线，预警更新不可用。', offlineReady: '安全指南已保存，可在此浏览器中离线查看。',
      offlinePreparing: '联网访问后可保存安全指南供离线使用。', offlineUnsupported: '此浏览器不支持离线保存。',
      notificationLimit: '提醒仅在页面保持打开时检查；后台标签页可能延迟，关闭页面即停止。不能替代官方应急通知。'
    },
    en: {
      historical: 'Past scan', scanCount: 'Warnings at last scan: {n}', historyNotice: 'Historical record only; current status is unknown. Old warnings may have expired, and a past zero does not mean it is safe now.',
      available: 'Within update window', outdated: 'Outdated data', unavailable: 'Data unavailable', lastChecked: 'Last checked', neverChecked: 'Not checked yet',
      selectCity: 'Select a city to see when it was checked', viewWarnings: 'View city warnings',
      hazards: 'Potential secondary hazards', hazardNote: 'Possible hazards inferred from warning type and severity, not a probability forecast. Follow official guidance.',
      original: 'Original official notice (Chinese)', originalLink: 'Open official source', checked: 'Data checked', noticeSummary: 'Warning summary',
      offline: 'You are offline. Warning updates are unavailable.', offlineReady: 'Safety guides are saved for offline use in this browser.',
      offlinePreparing: 'Visit online to save safety guides for offline use.', offlineUnsupported: 'Offline saving is not supported in this browser.',
      notificationLimit: 'Checks only while this page stays open. Background tabs may be delayed; closing the page stops checks. This does not replace official emergency alerts.'
    },
    es: {
      historical: 'Consulta anterior', scanCount: 'Alertas en la última consulta: {n}', historyNotice: 'Solo registro histórico; se desconoce el estado actual. Las alertas antiguas pueden haber caducado y un cero anterior no indica seguridad actual.',
      available: 'Dentro del plazo de actualización', outdated: 'Datos desactualizados', unavailable: 'Datos no disponibles', lastChecked: 'Última consulta', neverChecked: 'Aún sin consultar',
      selectCity: 'Seleccione una ciudad para ver cuándo se consultó', viewWarnings: 'Ver alertas de la ciudad',
      hazards: 'Posibles peligros secundarios', hazardNote: 'Peligros posibles según el tipo y nivel de alerta; no es un pronóstico de probabilidad. Siga las indicaciones oficiales.',
      original: 'Aviso oficial original (chino)', originalLink: 'Abrir fuente oficial', checked: 'Datos consultados', noticeSummary: 'Resumen del aviso',
      offline: 'Sin conexión. No se pueden actualizar las alertas.', offlineReady: 'Las guías de seguridad están guardadas para usarlas sin conexión en este navegador.',
      offlinePreparing: 'Visite la página con conexión para guardar las guías.', offlineUnsupported: 'Este navegador no permite guardar sin conexión.',
      notificationLimit: 'Solo se comprueba mientras la página permanece abierta. Las pestañas en segundo plano pueden retrasarse; al cerrar se detienen las comprobaciones. No sustituye las alertas oficiales de emergencia.'
    },
    fr: {
      historical: 'Vérification passée', scanCount: 'Alertes lors de la dernière vérification : {n}', historyNotice: 'Historique uniquement ; état actuel inconnu. Les anciennes alertes peuvent avoir expiré et un ancien zéro ne garantit pas la sécurité actuelle.',
      available: 'Dans le délai de mise à jour', outdated: 'Données obsolètes', unavailable: 'Données indisponibles', lastChecked: 'Dernière vérification', neverChecked: 'Pas encore vérifiée',
      selectCity: 'Sélectionnez une ville pour voir sa dernière vérification', viewWarnings: 'Voir les alertes de la ville',
      hazards: 'Dangers secondaires possibles', hazardNote: 'Dangers possibles selon le type et le niveau d’alerte, sans prévision de probabilité. Suivez les consignes officielles.',
      original: 'Avis officiel original (chinois)', originalLink: 'Ouvrir la source officielle', checked: 'Données vérifiées', noticeSummary: 'Résumé de l’alerte',
      offline: 'Vous êtes hors connexion. Les alertes ne peuvent pas être actualisées.', offlineReady: 'Les guides de sécurité sont enregistrés pour une consultation hors connexion dans ce navigateur.',
      offlinePreparing: 'Consultez la page en ligne pour enregistrer les guides.', offlineUnsupported: 'Ce navigateur ne permet pas l’enregistrement hors connexion.',
      notificationLimit: 'Vérification uniquement lorsque cette page reste ouverte. Les onglets en arrière-plan peuvent être retardés ; fermer la page arrête les vérifications. Cela ne remplace pas les alertes officielles d’urgence.'
    },
    it: {
      historical: 'Controllo precedente', scanCount: 'Allerte all’ultimo controllo: {n}', historyNotice: 'Solo dati storici; stato attuale sconosciuto. Le vecchie allerte potrebbero essere scadute e un precedente zero non indica sicurezza attuale.',
      available: 'Entro il periodo di aggiornamento', outdated: 'Dati obsoleti', unavailable: 'Dati non disponibili', lastChecked: 'Ultimo controllo', neverChecked: 'Non ancora controllata',
      selectCity: 'Seleziona una città per vedere quando è stata controllata', viewWarnings: 'Vedi le allerte della città',
      hazards: 'Possibili pericoli secondari', hazardNote: 'Possibili pericoli in base al tipo e al livello di allerta, non una previsione di probabilità. Segui le indicazioni ufficiali.',
      original: 'Avviso ufficiale originale (cinese)', originalLink: 'Apri la fonte ufficiale', checked: 'Dati controllati', noticeSummary: 'Riepilogo dell’allerta',
      offline: 'Sei offline. Non è possibile aggiornare le allerte.', offlineReady: 'Le guide di sicurezza sono salvate per l’uso offline in questo browser.',
      offlinePreparing: 'Visita la pagina online per salvare le guide.', offlineUnsupported: 'Questo browser non supporta il salvataggio offline.',
      notificationLimit: 'I controlli avvengono solo mentre la pagina resta aperta. Le schede in background possono subire ritardi; chiudendo la pagina i controlli si fermano. Non sostituisce le allerte ufficiali di emergenza.'
    }
  };
  var maxAge = 6 * 60 * 60 * 1000;
  function freshness(time, now) {
    now = now === undefined ? Date.now() : now;
    if (!Number.isFinite(time) || time <= 0 || time > now + 300000) return 'unavailable';
    return now - time < maxAge ? 'available' : 'outdated';
  }
  function text(key, language) { return (copy[language] || copy.en)[key] || copy.en[key] || key; }
  function checkedAt(time, language) {
    return time && Number.isFinite(time) ? text('lastChecked', language) + ': ' + new Date(time).toLocaleString(language || 'en') : text('neverChecked', language);
  }
  // Greedy collision detection leaves all city markers accessible; only labels thin out.
  function visibleLabels(rects) {
    var accepted = [];
    return rects.map(function (rect) {
      var visible = !accepted.some(function (other) {
        return rect.x < other.x + other.width + 5 && rect.x + rect.width + 5 > other.x &&
          rect.y < other.y + other.height + 5 && rect.y + rect.height + 5 > other.y;
      });
      if (visible) accepted.push(rect);
      return visible;
    });
  }
  window.__modules.reliability = { text: text, freshness: freshness, checkedAt: checkedAt, visibleLabels: visibleLabels, copy: copy };
})();
