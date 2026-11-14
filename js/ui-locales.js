/* Shared labels for the five supported interface languages.
 * Proper organization names and quoted source material remain in their original language. */
(function(root){
  var messages = {
  "All resources": {
    "es": "Todos los recursos",
    "fr": "Toutes les ressources",
    "it": "Tutte le risorse"
  },
  "National directories": {
    "es": "Directorios nacionales",
    "fr": "Annuaires nationaux",
    "it": "Elenchi nazionali"
  },
  "First-aid training": {
    "es": "Formación en primeros auxilios",
    "fr": "Formation aux premiers secours",
    "it": "Formazione di primo soccorso"
  },
  "Medical & ambulance": {
    "es": "Atención médica y ambulancias",
    "fr": "Soins médicaux et ambulances",
    "it": "Assistenza medica e ambulanze"
  },
  "Food relief": {
    "es": "Ayuda alimentaria",
    "fr": "Aide alimentaire",
    "it": "Aiuti alimentari"
  },
  "Rescue & disaster response": {
    "es": "Rescate y respuesta a desastres",
    "fr": "Secours et réponse aux catastrophes",
    "it": "Soccorso e risposta alle catastrofi"
  },
  "Countries & regions": {
    "zh": "国家与地区",
    "es": "Países y regiones",
    "fr": "Pays et régions",
    "it": "Paesi e regioni"
  },
  "Location navigation": {
    "es": "Navegación por ubicación",
    "fr": "Navigation par lieu",
    "it": "Navigazione per luogo"
  },
  "Base: ": {
    "es": "Sede: ",
    "fr": "Base : ",
    "it": "Sede: "
  },
  "National organization & branch directory": {
    "es": "Directorio de organizaciones nacionales y delegaciones",
    "fr": "Annuaire des organisations nationales et antennes locales",
    "it": "Elenco delle organizzazioni nazionali e delle sedi locali"
  },
  "Contact not yet verified": {
    "es": "Contacto aún sin verificar",
    "fr": "Coordonnées non encore vérifiées",
    "it": "Contatti non ancora verificati"
  },
  "Choose a country or territory": {
    "es": "Elige un país o territorio",
    "fr": "Choisissez un pays ou territoire",
    "it": "Scegli un paese o territorio"
  },
  "resources": {
    "es": "recursos",
    "fr": "ressources",
    "it": "risorse"
  },
  "Organizations": {
    "es": "Organizaciones",
    "fr": "Organisations",
    "it": "Organizzazioni"
  },
  "No matching organizations. Adjust the search or consult the national directory.": {
    "es": "No hay organizaciones coincidentes. Modifica la búsqueda o consulta el directorio nacional.",
    "fr": "Aucune organisation correspondante. Modifiez la recherche ou consultez l’annuaire national.",
    "it": "Nessuna organizzazione corrispondente. Modifica la ricerca o consulta l’elenco nazionale."
  },
  "Published service scope": {
    "es": "Ámbito de servicio publicado",
    "fr": "Zone d’intervention publiée",
    "it": "Ambito di servizio pubblicato"
  },
  "Documented deployment": {
    "es": "Despliegue documentado",
    "fr": "Déploiement documenté",
    "it": "Intervento documentato"
  },
  "Network-coordinated response": {
    "es": "Respuesta coordinada por la red",
    "fr": "Intervention coordonnée par le réseau",
    "it": "Intervento coordinato dalla rete"
  },
  "Service scope unverified": {
    "es": "Ámbito de servicio sin verificar",
    "fr": "Zone d’intervention non vérifiée",
    "it": "Ambito di servizio non verificato"
  },
  "Scope evidence": {
    "es": "Fuentes sobre el ámbito de servicio",
    "fr": "Sources sur la zone d’intervention",
    "it": "Fonti sull’ambito di servizio"
  },
  "Public sources establish this organization, but an available public contact has not been verified. The source report is not a rescue dispatch channel.": {
    "es": "Las fuentes públicas confirman la existencia de esta organización, pero no se ha verificado un contacto público disponible. El artículo citado no es un canal de activación de rescates.",
    "fr": "Des sources publiques attestent l’existence de cette organisation, mais aucune coordonnée publique disponible n’a été vérifiée. L’article cité n’est pas un canal de déclenchement des secours.",
    "it": "Fonti pubbliche attestano l’esistenza di questa organizzazione, ma non è stato verificato un contatto pubblico disponibile. L’articolo citato non è un canale di attivazione dei soccorsi."
  },
  "View published source": {
    "es": "Ver fuente publicada",
    "fr": "Voir la source publiée",
    "it": "Vedi la fonte pubblicata"
  },
  "Official contacts & services": {
    "es": "Contactos y servicios oficiales",
    "fr": "Coordonnées et services officiels",
    "it": "Contatti e servizi ufficiali"
  },
  "Services": {
    "es": "Servicios",
    "fr": "Services",
    "it": "Servizi"
  },
  "Official national society and local branch directory.": {
    "es": "Directorio oficial de la sociedad nacional y sus delegaciones locales.",
    "fr": "Annuaire officiel de la société nationale et de ses antennes locales.",
    "it": "Elenco ufficiale della società nazionale e delle sedi locali."
  },
  "Confirm current contacts, coverage and availability on the official site. For immediate rescue, contact local emergency services.": {
    "es": "Confirma los contactos, la cobertura y la disponibilidad actuales en el sitio oficial. Para un rescate inmediato, contacta con los servicios de emergencia locales.",
    "fr": "Vérifiez les coordonnées, la couverture et la disponibilité actuelles sur le site officiel. Pour un secours immédiat, contactez les services d’urgence locaux.",
    "it": "Verifica contatti, copertura e disponibilità attuali sul sito ufficiale. Per soccorso immediato, contatta i servizi di emergenza locali."
  },
  "Source & listing information": {
    "es": "Fuente e información del registro",
    "fr": "Source et informations sur la fiche",
    "it": "Fonte e informazioni sulla scheda"
  },
  "Organization location does not establish service coverage. Training and humanitarian groups may not accept emergency dispatch calls.": {
    "es": "La sede de una organización no determina su cobertura. Los grupos de formación y ayuda humanitaria pueden no aceptar solicitudes de intervención urgente.",
    "fr": "Le lieu d’implantation ne détermine pas la zone d’intervention. Les organismes de formation et d’aide humanitaire peuvent ne pas accepter de demandes d’intervention urgente.",
    "it": "La sede non determina la copertura del servizio. Gli enti di formazione e aiuto umanitario potrebbero non accettare richieste di intervento urgente."
  },
  "Source date: ": {
    "es": "Fecha de la fuente: ",
    "fr": "Date de la source : ",
    "it": "Data della fonte: "
  },
  "Organization source checked: ": {
    "es": "Fuente de la organización verificada: ",
    "fr": "Source de l’organisation vérifiée le : ",
    "it": "Fonte dell’organizzazione verificata il: "
  },
  "View source": {
    "es": "Ver fuente",
    "fr": "Voir la source",
    "it": "Vedi la fonte"
  },
  "No exact location match; showing listed resources for the selected country.": {
    "es": "No hay coincidencia exacta; se muestran los recursos del país seleccionado.",
    "fr": "Aucun lieu exact trouvé ; voici les ressources du pays sélectionné.",
    "it": "Nessuna corrispondenza esatta; sono mostrate le risorse del paese selezionato."
  },
  "ASSISTANCE DIRECTORY": {
    "es": "DIRECTORIO DE ASISTENCIA",
    "fr": "ANNUAIRE D’ASSISTANCE",
    "it": "ELENCO DI ASSISTENZA"
  },
  "Find rescue organizations by country": {
    "es": "Encuentra organizaciones de rescate por país",
    "fr": "Trouvez des organisations de secours par pays",
    "it": "Trova organizzazioni di soccorso per paese"
  },
  "Choose a country to see its listed organizations. A team’s base is not its service boundary.": {
    "es": "Elige un país para ver sus organizaciones. La sede de un equipo no delimita su zona de servicio.",
    "fr": "Choisissez un pays pour voir les organisations répertoriées. La base d’une équipe ne délimite pas sa zone d’intervention.",
    "it": "Scegli un paese per vedere le organizzazioni presenti. La sede di una squadra non delimita il suo ambito di servizio."
  },
  "Search locations or teams": {
    "es": "Buscar lugares o equipos",
    "fr": "Rechercher des lieux ou équipes",
    "it": "Cerca luoghi o squadre"
  },
  "Resource type": {
    "es": "Tipo de recurso",
    "fr": "Type de ressource",
    "it": "Tipo di risorsa"
  },
  "Directory coverage & use": {
    "es": "Cobertura y uso del directorio",
    "fr": "Couverture et utilisation de l’annuaire",
    "it": "Copertura e uso dell’elenco"
  },
  "Choose a country to browse all its listed organizations. Listings are incomplete. Base locations and service areas are shown separately; deployment examples do not guarantee availability. Verify contacts on official sites; call local emergency services for emergencies.": {
    "es": "Elige un país para ver todas sus organizaciones registradas. El directorio es incompleto. Las sedes y las zonas de servicio se muestran por separado; los despliegues anteriores no garantizan disponibilidad. Verifica los contactos en los sitios oficiales; en caso de emergencia, llama a los servicios locales.",
    "fr": "Choisissez un pays pour parcourir les organisations répertoriées. L’annuaire est incomplet. Les bases et zones d’intervention sont présentées séparément ; les déploiements passés ne garantissent pas la disponibilité. Vérifiez les coordonnées sur les sites officiels ; en cas d’urgence, appelez les services locaux.",
    "it": "Scegli un paese per vedere tutte le organizzazioni presenti. L’elenco è incompleto. Sedi e aree di servizio sono mostrate separatamente; gli interventi passati non garantiscono disponibilità. Verifica i contatti sui siti ufficiali; in emergenza, chiama i servizi locali."
  },
  "Worldwide society directory": {
    "es": "Directorio mundial de sociedades",
    "fr": "Annuaire mondial des sociétés",
    "it": "Elenco mondiale delle società"
  },
  "Rescue contacts": {
    "zh": "救援联系",
    "es": "Contactos de rescate",
    "fr": "Contacts de secours",
    "it": "Contatti di soccorso"
  },
  "Loading…": {
    "es": "Cargando…",
    "fr": "Chargement…",
    "it": "Caricamento…"
  },
  "Directory unavailable. Please try again.": {
    "es": "Directorio no disponible. Inténtalo de nuevo.",
    "fr": "Annuaire indisponible. Veuillez réessayer.",
    "it": "Elenco non disponibile. Riprova."
  },
  "Earthquake": {
    "es": "Terremoto",
    "fr": "Séisme",
    "it": "Terremoto"
  },
  "Wildfire": {
    "es": "Incendio forestal",
    "fr": "Feu de forêt",
    "it": "Incendio boschivo"
  },
  "Flood": {
    "es": "Inundación",
    "fr": "Inondation",
    "it": "Inondazione"
  },
  "Tropical cyclone": {
    "es": "Ciclón tropical",
    "fr": "Cyclone tropical",
    "it": "Ciclone tropicale"
  },
  "Drought": {
    "es": "Sequía",
    "fr": "Sécheresse",
    "it": "Siccità"
  },
  "Volcano": {
    "es": "Volcán",
    "fr": "Volcan",
    "it": "Vulcano"
  },
  "Tsunami": {
    "es": "Tsunami",
    "fr": "Tsunami",
    "it": "Tsunami"
  },
  "Official report": {
    "es": "Informe oficial",
    "fr": "Rapport officiel",
    "it": "Rapporto ufficiale"
  },
  "records": {
    "es": "registros",
    "fr": "enregistrements",
    "it": "registrazioni"
  },
  "View details": {
    "es": "Ver detalles",
    "fr": "Voir les détails",
    "it": "Vedi dettagli"
  },
  "Last reported; current status awaits a fresh update.": {
    "es": "Último informe; el estado actual está pendiente de actualización.",
    "fr": "Dernier signalement ; l’état actuel attend une mise à jour.",
    "it": "Ultima segnalazione; lo stato attuale è in attesa di aggiornamento."
  },
  "Source": {
    "es": "Fuente",
    "fr": "Source",
    "it": "Fonte"
  },
  "Coordinates": {
    "es": "Coordenadas",
    "fr": "Coordonnées",
    "it": "Coordinate"
  },
  "Depth": {
    "es": "Profundidad",
    "fr": "Profondeur",
    "it": "Profondità"
  },
  "Reported period": {
    "es": "Período indicado",
    "fr": "Période signalée",
    "it": "Periodo segnalato"
  },
  "Last checked": {
    "es": "Última consulta",
    "fr": "Dernière vérification",
    "it": "Ultima verifica"
  },
  "No matching records.": {
    "es": "No hay registros coincidentes.",
    "fr": "Aucun enregistrement correspondant.",
    "it": "Nessuna registrazione corrispondente."
  },
  "Live disasters": {
    "es": "Desastres actuales",
    "fr": "Catastrophes en cours",
    "it": "Catastrofi in corso"
  },
  "Disaster history": {
    "zh": "灾害历史",
    "es": "Historial de desastres",
    "fr": "Historique des catastrophes",
    "it": "Storico delle catastrofi"
  },
  "World map": {
    "es": "Mapa mundial",
    "fr": "Carte du monde",
    "it": "Mappa del mondo"
  },
  "GLOBAL DISASTER RECORDS": {
    "es": "REGISTROS MUNDIALES DE DESASTRES",
    "fr": "REGISTRES MONDIAUX DES CATASTROPHES",
    "it": "REGISTRI MONDIALI DELLE CATASTROFI"
  },
  "GDACS last-listed current events and recent earthquakes. Collection delays do not establish that an event ended.": {
    "es": "Eventos actuales de la última lista de GDACS y terremotos recientes. Un retraso en la recopilación no significa que un evento haya terminado.",
    "fr": "Événements en cours de la dernière liste GDACS et séismes récents. Un retard de collecte ne signifie pas qu’un événement est terminé.",
    "it": "Eventi in corso dell’ultimo elenco GDACS e terremoti recenti. Un ritardo nella raccolta non significa che un evento sia terminato."
  },
  "All retained GDACS and earthquake records, including past events and reports.": {
    "es": "Todos los registros guardados de GDACS y terremotos, incluidos eventos e informes anteriores.",
    "fr": "Tous les enregistrements GDACS et sismiques conservés, y compris les événements et rapports passés.",
    "it": "Tutte le registrazioni GDACS e sismiche conservate, inclusi eventi e rapporti passati."
  },
  "History": {
    "es": "Historial",
    "fr": "Historique",
    "it": "Storico"
  },
  "Search place or event": {
    "es": "Buscar lugar o evento",
    "fr": "Rechercher un lieu ou événement",
    "it": "Cerca luogo o evento"
  },
  "Disaster type": {
    "es": "Tipo de desastre",
    "fr": "Type de catastrophe",
    "it": "Tipo di catastrofe"
  },
  "All types": {
    "es": "Todos los tipos",
    "fr": "Tous les types",
    "it": "Tutti i tipi"
  },
  "Previous": {
    "es": "Anterior",
    "fr": "Précédent",
    "it": "Precedente"
  },
  "Next": {
    "es": "Siguiente",
    "fr": "Suivant",
    "it": "Successivo"
  },
  "Some data sources could not be loaded; showing available records.": {
    "es": "No se pudieron cargar algunas fuentes; se muestran los registros disponibles.",
    "fr": "Certaines sources n’ont pas pu être chargées ; les enregistrements disponibles sont affichés.",
    "it": "Impossibile caricare alcune fonti; sono mostrate le registrazioni disponibili."
  },
  "Pages": {
    "zh": "页面",
    "es": "Páginas",
    "fr": "Pages",
    "it": "Pagine"
  },
  "Site content": {
    "zh": "网站内容",
    "es": "Contenido del sitio",
    "fr": "Contenu du site",
    "it": "Contenuti del sito"
  },
  "Matches: ": {
    "es": "Coincidencias: ",
    "fr": "Résultats : ",
    "it": "Risultati: "
  },
  " · Loading site content…": {
    "es": " · Cargando el contenido del sitio…",
    "fr": " · Chargement du contenu du site…",
    "it": " · Caricamento dei contenuti del sito…"
  },
  "Searching site content…": {
    "es": "Buscando en el sitio…",
    "fr": "Recherche dans le site…",
    "it": "Ricerca nel sito…"
  },
  "Regional rescue contacts": {
    "es": "Contactos de rescate por país",
    "fr": "Contacts de secours par pays",
    "it": "Contatti di soccorso per paese"
  },
  "Country or region": {
    "es": "País o región",
    "fr": "Pays ou région",
    "it": "Paese o regione"
  },
  "Search rescue contacts": {
    "es": "Buscar contactos de rescate",
    "fr": "Rechercher des contacts de secours",
    "it": "Cerca contatti di soccorso"
  },
  "Search listed rescue organizations and official directories by country.": {
    "es": "Busca organizaciones de rescate y directorios oficiales por país.",
    "fr": "Recherchez les organisations de secours et annuaires officiels par pays.",
    "it": "Cerca organizzazioni di soccorso ed elenchi ufficiali per paese."
  },
  "China, Peru…": {
    "es": "China, Perú…",
    "fr": "Chine, Pérou…",
    "it": "Cina, Perù…",
    "zh": "中国、秘鲁…"
  },
  "Disaster lists": {
    "es": "Listas de desastres",
    "fr": "Listes de catastrophes",
    "it": "Elenchi delle catastrofi"
  },
  "View all live disasters": {
    "es": "Ver todos los desastres actuales",
    "fr": "Voir toutes les catastrophes en cours",
    "it": "Vedi tutte le catastrofi in corso"
  },
  "Browse disaster history": {
    "es": "Explorar el historial de desastres",
    "fr": "Parcourir l’historique des catastrophes",
    "it": "Consulta lo storico delle catastrofi"
  },
  "GDACS current-event feed; not on-site confirmation": {
    "es": "Flujo de eventos actuales de GDACS; sin confirmación sobre el terreno",
    "fr": "Flux des événements en cours de GDACS ; sans confirmation sur place",
    "it": "Feed degli eventi in corso di GDACS; senza conferma sul posto"
  },
  "GDACS updates are overdue. Dashed markers show last-reported locations; current status is unconfirmed. A delayed update does not mean the disasters have ended.": {
    "es": "Las actualizaciones de GDACS están retrasadas. Las marcas discontinuas indican las últimas ubicaciones notificadas; el estado actual no está confirmado. Un retraso no significa que los desastres hayan terminado.",
    "fr": "Les mises à jour GDACS sont en retard. Les repères en pointillés indiquent les dernières positions signalées ; l’état actuel n’est pas confirmé. Ce retard ne signifie pas que les catastrophes sont terminées.",
    "it": "Gli aggiornamenti GDACS sono in ritardo. I segni tratteggiati mostrano le ultime posizioni segnalate; lo stato attuale non è confermato. Il ritardo non significa che le catastrofi siano terminate."
  },
  "Last reported · awaiting GDACS refresh": {
    "es": "Último informe · esperando actualización de GDACS",
    "fr": "Dernier signalement · en attente d’une mise à jour GDACS",
    "it": "Ultima segnalazione · in attesa di aggiornamento GDACS"
  },
  "Severity": {
    "es": "Gravedad",
    "fr": "Gravité",
    "it": "Gravità",
    "zh": "严重程度"
  },
  "USGS event": {
    "es": "Evento de USGS",
    "fr": "Événement USGS",
    "it": "Evento USGS",
    "zh": "USGS 事件"
  },
  "Original source text": {
    "es": "Texto original de la fuente",
    "fr": "Texte original de la source",
    "it": "Testo originale della fonte",
    "zh": "来源原文"
  },
  "Unit explanation": {
    "es": "Explicación de la unidad",
    "fr": "Explication de l’unité",
    "it": "Spiegazione dell’unità",
    "zh": "单位说明"
  },
  "Volunteer land search and rescue": {
    "zh": "志愿陆地搜救",
    "es": "Búsqueda y rescate terrestre voluntario",
    "fr": "Recherche et secours terrestres bénévoles",
    "it": "Ricerca e soccorso terrestre volontario"
  },
  "Emergency standby, first aid and flood-season safety support": {
    "zh": "应急备勤、急救与汛期保障",
    "es": "Guardia de emergencia, primeros auxilios y apoyo durante inundaciones",
    "fr": "Permanence d’urgence, premiers secours et soutien en période de crue",
    "it": "Presidio di emergenza, primo soccorso e supporto durante le piene"
  },
  "Advanced trauma care with NHS partners": {
    "zh": "与英国国民医疗服务体系合作提供高级创伤救治",
    "es": "Atención avanzada de traumatismos con socios del NHS",
    "fr": "Soins avancés de traumatologie avec les partenaires du NHS",
    "it": "Cure traumatologiche avanzate con i partner del NHS"
  },
  "Social emergency rescue; individual capabilities need confirmation": {
    "zh": "社会应急救援，具体能力待确认",
    "es": "Rescate social de emergencia; hay que confirmar las capacidades de cada equipo",
    "fr": "Secours d’urgence associatifs ; capacités de chaque équipe à confirmer",
    "it": "Soccorso di emergenza associativo; capacità delle singole squadre da confermare"
  },
  "Medical supplies and support for health facilities": {
    "zh": "为医疗机构提供物资与支持",
    "es": "Suministros médicos y apoyo a centros sanitarios",
    "fr": "Fournitures médicales et soutien aux établissements de santé",
    "it": "Forniture mediche e supporto alle strutture sanitarie"
  },
  "First-aid training and ambulance services": {
    "zh": "急救培训与救护车服务",
    "es": "Formación en primeros auxilios y servicios de ambulancia",
    "fr": "Formation aux premiers secours et services d’ambulance",
    "it": "Formazione di primo soccorso e servizi di ambulanza"
  },
  "Wilderness search and technical rescue": {
    "zh": "野外搜索与技术救援",
    "es": "Búsqueda en zonas naturales y rescate técnico",
    "fr": "Recherche en milieu naturel et secours techniques",
    "it": "Ricerca in ambiente naturale e soccorso tecnico"
  },
  "CPR, AED and first-aid education; find a local training centre": {
    "zh": "心肺复苏、自动体外除颤器与急救培训；请查询当地培训中心",
    "es": "Formación en RCP, DEA y primeros auxilios; consulta un centro local",
    "fr": "Formation à la RCP, au DAE et aux premiers secours ; recherchez un centre local",
    "it": "Formazione su RCP, DAE e primo soccorso; cerca un centro locale"
  },
  "Flood evacuation, boat rescue, drainage and drone reconnaissance": {
    "zh": "水域转移、排涝、无人机侦察",
    "es": "Evacuación por inundaciones, rescate en embarcaciones, drenaje y reconocimiento con drones",
    "fr": "Évacuation en cas de crue, sauvetage nautique, pompage et reconnaissance par drone",
    "it": "Evacuazione durante le piene, soccorso nautico, drenaggio e ricognizione con droni"
  },
  "Emergency ambulance and community care": {
    "zh": "急救救护车与社区医疗服务",
    "es": "Ambulancias de emergencia y atención comunitaria",
    "fr": "Ambulances d’urgence et soins communautaires",
    "it": "Ambulanze di emergenza e assistenza alla comunità"
  },
  "Mountain and wilderness rescue": {
    "zh": "山地与野外救援",
    "es": "Rescate en montaña y zonas naturales",
    "fr": "Secours en montagne et en milieu naturel",
    "it": "Soccorso in montagna e in ambiente naturale"
  },
  "Mountain search and rescue": {
    "zh": "山地搜索与救援",
    "es": "Búsqueda y rescate en montaña",
    "fr": "Recherche et secours en montagne",
    "it": "Ricerca e soccorso in montagna"
  },
  "Volunteer mountain search and rescue": {
    "zh": "志愿山地搜救",
    "es": "Búsqueda y rescate voluntario en montaña",
    "fr": "Recherche et secours bénévoles en montagne",
    "it": "Ricerca e soccorso volontario in montagna"
  },
  "Volunteer disaster response and recovery": {
    "zh": "志愿灾害应对与恢复援助",
    "es": "Respuesta y recuperación voluntaria ante desastres",
    "fr": "Intervention et rétablissement bénévoles après catastrophe",
    "it": "Risposta e recupero volontario dopo le catastrofi"
  },
  "Public-event first aid, safety patrols and missing-person assistance": {
    "zh": "现场急救、巡防、寻人协助",
    "es": "Primeros auxilios en eventos, patrullas de seguridad y búsqueda de desaparecidos",
    "fr": "Premiers secours lors d’événements, patrouilles de sécurité et aide à la recherche de disparus",
    "it": "Primo soccorso durante eventi, pattuglie di sicurezza e assistenza nella ricerca di scomparsi"
  },
  "Medical humanitarian assistance": {
    "zh": "医疗人道援助",
    "es": "Asistencia médica humanitaria",
    "fr": "Aide médicale humanitaire",
    "it": "Assistenza medica umanitaria"
  },
  "Food relief during disasters": {
    "zh": "灾害食物援助",
    "es": "Ayuda alimentaria durante desastres",
    "fr": "Aide alimentaire lors de catastrophes",
    "it": "Aiuti alimentari durante le catastrofi"
  },
  "First-aid training and event medical support": {
    "zh": "急救培训与活动医疗保障",
    "es": "Formación en primeros auxilios y apoyo médico en eventos",
    "fr": "Formation aux premiers secours et assistance médicale lors d’événements",
    "it": "Formazione di primo soccorso e supporto medico durante eventi"
  },
  "Earthquake magnitude: a logarithmic measure of event size, not local shaking intensity.": {
    "zh": "地震震级：表示地震大小的对数尺度，并非当地震动烈度。",
    "es": "Magnitud sísmica: medida logarítmica del tamaño del terremoto, no de la intensidad local de las sacudidas.",
    "fr": "Magnitude sismique : mesure logarithmique de la taille du séisme, et non de l’intensité locale des secousses.",
    "it": "Magnitudo sismica: misura logaritmica delle dimensioni del terremoto, non dell’intensità locale dello scuotimento."
  },
  "Modified Mercalli Intensity: shaking intensity experienced at a particular location.": {
    "zh": "修订麦加利烈度：表示特定地点感受到的震动强度。",
    "es": "Intensidad de Mercalli modificada: intensidad de las sacudidas percibidas en un lugar concreto.",
    "fr": "Intensité de Mercalli modifiée : intensité des secousses ressenties en un lieu donné.",
    "it": "Intensità Mercalli modificata: intensità dello scuotimento percepita in un luogo specifico."
  },
  "Kilometres: distance or depth; 1 km = 1,000 metres.": {
    "zh": "千米：距离或深度单位，1 km = 1,000 m。",
    "es": "Kilómetros: distancia o profundidad; 1 km = 1.000 metros.",
    "fr": "Kilomètres : distance ou profondeur ; 1 km = 1 000 mètres.",
    "it": "Chilometri: distanza o profondità; 1 km = 1.000 metri."
  },
  "Square kilometres: area; 1 km² = 1,000,000 square metres.": {
    "zh": "平方千米：面积单位，1 km² = 1,000,000 m²。",
    "es": "Kilómetros cuadrados: superficie; 1 km² = 1.000.000 de metros cuadrados.",
    "fr": "Kilomètres carrés : superficie ; 1 km² = 1 000 000 de mètres carrés.",
    "it": "Chilometri quadrati: superficie; 1 km² = 1.000.000 di metri quadrati."
  },
  "Hectares: area; 1 ha = 10,000 square metres = 0.01 km².": {
    "zh": "公顷：面积单位，1 ha = 10,000 m² = 0.01 km²。",
    "es": "Hectáreas: superficie; 1 ha = 10.000 metros cuadrados = 0,01 km².",
    "fr": "Hectares : superficie ; 1 ha = 10 000 mètres carrés = 0,01 km².",
    "it": "Ettari: superficie; 1 ha = 10.000 metri quadrati = 0,01 km²."
  },
  "Kilometres per hour: a measure of speed.": {
    "zh": "千米每小时：速度单位。",
    "es": "Kilómetros por hora: unidad de velocidad.",
    "fr": "Kilomètres par heure : unité de vitesse.",
    "it": "Chilometri orari: unità di velocità."
  },
  "Miles per hour: speed; 1 mph ≈ 1.609 km/h.": {
    "zh": "英里每小时：速度单位，1 mph ≈ 1.609 km/h。",
    "es": "Millas por hora: velocidad; 1 mph ≈ 1,609 km/h.",
    "fr": "Miles par heure : vitesse ; 1 mph ≈ 1,609 km/h.",
    "it": "Miglia orarie: velocità; 1 mph ≈ 1,609 km/h."
  },
  "Metres per second: speed; 1 m/s = 3.6 km/h.": {
    "zh": "米每秒：速度单位，1 m/s = 3.6 km/h。",
    "es": "Metros por segundo: velocidad; 1 m/s = 3,6 km/h.",
    "fr": "Mètres par seconde : vitesse ; 1 m/s = 3,6 km/h.",
    "it": "Metri al secondo: velocità; 1 m/s = 3,6 km/h."
  },
  "Degrees: latitude/longitude angles locating a point on Earth.": {
    "zh": "度：经纬度的角度单位，用于标记地球上的位置。",
    "es": "Grados: ángulos de latitud y longitud que sitúan un punto en la Tierra.",
    "fr": "Degrés : angles de latitude et longitude situant un point sur Terre.",
    "it": "Gradi: angoli di latitudine e longitudine che individuano un punto sulla Terra."
  },
  "Current disasters": {
    "zh": "当前灾害",
    "es": "Desastres actuales",
    "fr": "Catastrophes en cours",
    "it": "Catastrofi in corso"
  },
  "Earthquake history": {
    "zh": "地震历史",
    "es": "Historial sísmico",
    "fr": "Historique sismique",
    "it": "Storico sismico"
  },
  "Drop, Cover and Hold On; stay away from windows and outer walls.": {
    "zh": "趴下、掩护、抓牢；远离窗户与外墙。",
    "es": "Agáchate, cúbrete y sujétate; aléjate de ventanas y paredes exteriores.",
    "fr": "Baissez-vous, abritez-vous et agrippez-vous ; éloignez-vous des fenêtres et murs extérieurs.",
    "it": "Abbassati, riparati e tieniti saldo; allontanati da finestre e muri esterni."
  },
  "If near the coast after strong shaking, move to high ground immediately.": {
    "zh": "强震后如身处海岸，立即向高处转移。",
    "es": "Si estás cerca de la costa tras fuertes sacudidas, sube de inmediato a un lugar elevado.",
    "fr": "Près de la côte après de fortes secousses, gagnez immédiatement les hauteurs.",
    "it": "Se sei vicino alla costa dopo forti scosse, raggiungi subito un luogo elevato."
  },
  "Follow local emergency authorities and tsunami warnings.": {
    "zh": "关注当地应急部门与海啸预警。",
    "es": "Sigue las indicaciones de las autoridades locales y las alertas de tsunami.",
    "fr": "Suivez les consignes des autorités locales et les alertes au tsunami.",
    "it": "Segui le autorità locali di emergenza e le allerte tsunami."
  },
  "Check gas, power and structural damage; expect aftershocks.": {
    "zh": "检查燃气、电力与建筑结构，谨防余震。",
    "es": "Comprueba daños en el gas, la electricidad y las estructuras; prepárate para réplicas.",
    "fr": "Vérifiez les dégâts aux réseaux de gaz, d’électricité et aux structures ; attendez-vous à des répliques.",
    "it": "Verifica danni a gas, elettricità e strutture; preparati alle repliche."
  },
  "Stay away from the fire and smoke; keep windows closed.": {
    "zh": "远离火场与浓烟，关闭门窗。",
    "es": "Aléjate del fuego y el humo; mantén cerradas las ventanas.",
    "fr": "Éloignez-vous du feu et de la fumée ; gardez les fenêtres fermées.",
    "it": "Allontanati da fuoco e fumo; tieni chiuse le finestre."
  },
  "Follow local evacuation orders and be ready to leave.": {
    "zh": "听从当地疏散指令，准备随时撤离。",
    "es": "Sigue las órdenes de evacuación y prepárate para salir.",
    "fr": "Suivez les ordres d’évacuation et soyez prêt à partir.",
    "it": "Segui gli ordini di evacuazione e preparati a partire."
  },
  "Monitor air quality and official fire updates.": {
    "zh": "关注空气质量与官方火情通报。",
    "es": "Consulta la calidad del aire y los avisos oficiales sobre incendios.",
    "fr": "Surveillez la qualité de l’air et les bulletins officiels sur les incendies.",
    "it": "Controlla la qualità dell’aria e gli aggiornamenti ufficiali sugli incendi."
  },
  "Move to high ground immediately; never cross flood water.": {
    "zh": "立即转移到高处，不要穿越积水。",
    "es": "Sube de inmediato a un lugar elevado; nunca cruces aguas de inundación.",
    "fr": "Gagnez immédiatement les hauteurs ; ne traversez jamais les eaux de crue.",
    "it": "Raggiungi subito un luogo elevato; non attraversare mai acque alluvionali."
  },
  "Stay away from rivers, valleys and underground spaces.": {
    "zh": "远离河道、山谷与地下空间。",
    "es": "Aléjate de ríos, valles y espacios subterráneos.",
    "fr": "Éloignez-vous des rivières, vallées et espaces souterrains.",
    "it": "Allontanati da fiumi, valli e spazi sotterranei."
  },
  "Monitor local flood and rainfall warnings.": {
    "zh": "关注当地洪水与降雨预警。",
    "es": "Consulta las alertas locales de inundaciones y lluvia.",
    "fr": "Suivez les alertes locales de crue et de pluie.",
    "it": "Segui le allerte locali per alluvioni e piogge."
  },
  "Shelter in a sturdy building, away from windows.": {
    "zh": "留在坚固建筑内，远离窗户。",
    "es": "Refúgiate en un edificio sólido, lejos de las ventanas.",
    "fr": "Abritez-vous dans un bâtiment solide, loin des fenêtres.",
    "it": "Riparati in un edificio solido, lontano dalle finestre."
  },
  "Secure outdoor items and prepare for power/water outages.": {
    "zh": "固定室外物品，准备停电与断水。",
    "es": "Asegura los objetos exteriores y prepárate para cortes de luz y agua.",
    "fr": "Fixez les objets extérieurs et préparez-vous aux coupures d’eau et d’électricité.",
    "it": "Fissa gli oggetti esterni e preparati a interruzioni di acqua e corrente."
  },
  "Follow local evacuation and shelter instructions.": {
    "zh": "听从当地疏散与避难指令。",
    "es": "Sigue las instrucciones locales de evacuación y refugio.",
    "fr": "Suivez les consignes locales d’évacuation et de mise à l’abri.",
    "it": "Segui le istruzioni locali di evacuazione e riparo."
  },
  "Conserve water for drinking and sanitation.": {
    "zh": "节约用水，优先保障饮用与卫生。",
    "es": "Reserva el agua para beber y para la higiene.",
    "fr": "Économisez l’eau pour la boisson et l’hygiène.",
    "it": "Risparmia acqua per bere e per l’igiene."
  },
  "Follow local water restrictions and agricultural aid programs.": {
    "zh": "关注当地限水与农业援助政策。",
    "es": "Sigue las restricciones locales de agua y los programas de ayuda agrícola.",
    "fr": "Suivez les restrictions d’eau et les programmes locaux d’aide agricole.",
    "it": "Segui le restrizioni idriche e i programmi locali di aiuto agricolo."
  },
  "Watch for heat and food-security impacts.": {
    "zh": "防范高温与粮食短缺的次生影响。",
    "es": "Vigila los efectos del calor y los riesgos para el suministro de alimentos.",
    "fr": "Surveillez les effets de la chaleur et les risques pour la sécurité alimentaire.",
    "it": "Presta attenzione agli effetti del caldo e ai rischi per la sicurezza alimentare."
  },
  "Yes": {
    "zh": "是",
    "es": "Sí",
    "fr": "Oui",
    "it": "Sì"
  },
  "No": {
    "zh": "否",
    "es": "No",
    "fr": "Non",
    "it": "No"
  },
  "Last reported": {
    "zh": "上次报告",
    "es": "Último informe",
    "fr": "Dernier signalement",
    "it": "Ultima segnalazione"
  },
  "Search": {
    "zh": "搜索",
    "es": "Buscar",
    "fr": "Rechercher",
    "it": "Cerca"
  },
  "Retains observed alerts and revisions. Alerts before collection began or between queries may be missing.": {
    "zh": "保留实际采集到的预警及更新版本；不能保证包含采集开始前或两次查询之间的全部预警。",
    "es": "Se conservan las alertas observadas y sus revisiones. Pueden faltar alertas anteriores al inicio de la recopilación o entre consultas.",
    "fr": "Les alertes observées et leurs révisions sont conservées. Des alertes antérieures à la collecte ou entre les requêtes peuvent manquer.",
    "it": "Sono conservate le allerte rilevate e le revisioni. Potrebbero mancare allerte precedenti alla raccolta o tra le interrogazioni."
  },
  "Live earthquakes": {
    "zh": "当前地震",
    "es": "Terremotos recientes",
    "fr": "Séismes récents",
    "it": "Terremoti recenti"
  },
  "China warning history": {
    "zh": "中国预警历史",
    "es": "Historial de alertas de China",
    "fr": "Historique des alertes en Chine",
    "it": "Storico delle allerte in Cina"
  },
  "Page content": {
    "zh": "页面内容",
    "es": "Contenido de la página",
    "fr": "Contenu de la page",
    "it": "Contenuti della pagina"
  },
  "Xiamen, Hong Kong, AHA…": {
    "zh": "厦门、香港、AHA…",
    "es": "Xiamen, Hong Kong, AHA…",
    "fr": "Xiamen, Hong Kong, AHA…",
    "it": "Xiamen, Hong Kong, AHA…"
  },
  "History is unavailable; showing other matches.": {
    "zh": "历史记录暂不可用，显示其他匹配结果。",
    "es": "El historial no está disponible; se muestran otras coincidencias.",
    "fr": "L’historique est indisponible ; les autres résultats sont affichés.",
    "it": "Lo storico non è disponibile; sono mostrate altre corrispondenze."
  },
  "Some searchable content is unavailable. Please retry shortly.": {
    "zh": "部分搜索内容暂不可用，请稍后重试。",
    "es": "Parte del contenido no está disponible. Inténtalo de nuevo en breve.",
    "fr": "Certains contenus sont indisponibles. Veuillez réessayer bientôt.",
    "it": "Alcuni contenuti non sono disponibili. Riprova tra poco."
  },
  " · Last reported": {
    "zh": " · 上次报告",
    "es": " · Último informe",
    "fr": " · Dernier signalement",
    "it": " · Ultima segnalazione"
  },
  "Benelux": {
    "zh": "比荷卢地区",
    "es": "Benelux",
    "fr": "Benelux",
    "it": "Benelux"
  },
  "Red": {
    "zh": "红色",
    "es": "Rojo",
    "fr": "Rouge",
    "it": "Rosso"
  },
  "Orange": {
    "zh": "橙色",
    "es": "Naranja",
    "fr": "Orange",
    "it": "Arancione"
  },
  "Green": {
    "zh": "绿色",
    "es": "Verde",
    "fr": "Vert",
    "it": "Verde"
  },
  "Local assistance & first-aid resources": {
    "zh": "当地援助与急救资源",
    "es": "Asistencia local y recursos de primeros auxilios",
    "fr": "Aide locale et ressources de premiers secours",
    "it": "Assistenza locale e risorse di primo soccorso"
  },
  "Find to buy": {
    "zh": "查找购买",
    "es": "Buscar dónde comprar",
    "fr": "Trouver où acheter",
    "it": "Trova dove acquistare"
  }
};
  function text(en,language){return language==='en'?en:(messages[en]&&messages[en][language])||en;}
  function phrase(zh,en,language){return language==='zh'?zh:text(en,language);}
  function country(iso,fallback,language){
    if(iso==='BX')return phrase('比荷卢地区', 'Benelux',language);
    try{return new Intl.DisplayNames([language==='zh'?'zh-Hans':language],{type:'region'}).of(iso)||fallback;}catch(e){return fallback;}
  }
  function service(value,language){
    var parts=String(value||'').split(' / '),en=parts[0];
    return language==='zh'&&parts[1]?parts[1]:text(en,language);
  }
  function count(value,noun,language){
    var singular= new Intl.PluralRules(language).select(value)==='one';
    var forms=noun==='resources'?{zh:['条资源','条资源'],en:['resource','resources'],es:['recurso','recursos'],fr:['ressource','ressources'],it:['risorsa','risorse']}:{zh:['条记录','条记录'],en:['record','records'],es:['registro','registros'],fr:['enregistrement','enregistrements'],it:['registrazione','registrazioni']};
    return new Intl.NumberFormat(language).format(value)+' '+(forms[language]||forms.en)[singular?0:1];
  }
  var api={count:count,text:text,phrase:phrase,country:country,service:service,messages:messages};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.NDLocale=api;
})(typeof window==='object'?window:globalThis);
