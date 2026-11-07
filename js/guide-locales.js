/* Complete localized Guide content. Shared numeric criteria keep locales aligned. */
(function () {
  var locales = {
    es: {
      labels: { warning: 'Aviso', note: 'Nota' },
      wind: function (h, wind, gust, cyclone) { return (cyclone ? 'Un ciclón tropical puede afectar la zona' : 'Vientos fuertes pueden afectar la zona') + ' en las próximas ' + h + ' horas, con viento sostenido de fuerza ' + wind + ' o superior, o rachas de fuerza ' + gust + ' o superior en la escala Beaufort.'; },
      rain: function (h, mm) { return 'La precipitación puede alcanzar ' + mm + ' mm o más en ' + h + ' horas, o ya ha alcanzado esa cantidad y puede continuar.'; },
      cold: function (h, drop, temp) { return 'La temperatura mínima puede descender al menos ' + drop + ' °C en ' + h + ' horas, hasta ' + temp + ' °C o menos.'; },
      heat: ['Se prevén máximas de 35 °C o más durante tres días consecutivos.', 'La temperatura máxima puede alcanzar 37 °C o más en 24 horas.', 'La temperatura máxima puede alcanzar 40 °C o más en 24 horas.'],
      thunder: ['Puede haber rayos en las próximas 6 horas, con riesgo de daños o lesiones.', 'Puede haber actividad eléctrica en las próximas 6 horas, con riesgo de daños o lesiones.', 'Es muy probable que haya rayos en las próximas 2 horas, o ya se están produciendo y pueden continuar.', 'Es extremadamente probable que haya rayos en las próximas 2 horas, o ya hay actividad eléctrica intensa que puede continuar.'],
      hail: ['Puede haber granizo en las próximas 6 horas y causar daños.', 'Es extremadamente probable que haya granizo en las próximas 2 horas, con riesgo de daños graves.'],
      fog: function (h, metres) { return 'Puede haber niebla con visibilidad inferior a ' + metres + ' metros en las próximas ' + h + ' horas.'; },
      flood: ['El nivel del agua se aproxima al umbral de aviso, o se prevé que lo supere.', 'El nivel del agua supera el umbral de aviso, o se prevé una inundación importante.', 'El nivel del agua se aproxima al umbral de seguridad de las defensas contra inundaciones, o se prevé una gran inundación.', 'El nivel del agua supera el umbral de seguridad de las defensas, o se prevé una inundación excepcional.'],
      earthquake: ['La alerta sísmica temprana no es una predicción. Las señales viajan más rápido que las ondas sísmicas y pueden dar desde unos segundos hasta decenas de segundos para protegerse.', 'Durante la sacudida, protéjase cerca de donde está. Cuando termine, evacúe si el edificio es inseguro o lo indican las autoridades.'],
      forestfire: ['Peligro meteorológico de incendio forestal de nivel 3: peligro moderado; la vegetación puede arder con relativa facilidad.', 'Peligro de nivel 4: peligro alto; la vegetación arde fácilmente.', 'Peligro de nivel 5: peligro extremo; la vegetación arde con mucha facilidad.'],
      drought: ['Se prevé que el índice meteorológico compuesto alcance la categoría de sequía intensa durante la próxima semana.', 'Se prevé que el índice alcance la categoría de sequía severa durante la próxima semana.', 'Se prevé que el índice alcance la categoría de sequía extrema durante la próxima semana.'],
      guides: {
        typhoon: {
          name: 'Tifón', desc: 'Un tifón es un ciclón tropical intenso que se forma sobre océanos cálidos. Sus vientos, lluvias y marejadas ciclónicas representan un peligro importante para las zonas costeras.',
          actions: ['Antes de su llegada: siga los avisos, prepare agua, alimentos y una linterna, asegure puertas y ventanas y retire los objetos sueltos del balcón.', 'Durante el tifón: permanezca dentro, lejos de puertas y ventanas. Si el edificio es inseguro, trasládese a un refugio seguro cuando se indique.', 'Al aire libre: aléjese de árboles, anuncios, estructuras provisionales y postes. Evite la costa y las zonas altas expuestas.', 'Después: evite montañas, ríos y edificios dañados. Compruebe la seguridad del agua y los alimentos.']
        },
        rainstorm: {
          name: 'Lluvia torrencial', desc: 'Las lluvias intensas en poco tiempo pueden provocar inundaciones urbanas, crecidas repentinas, deslizamientos y otros peligros secundarios.',
          actions: ['En casa: revise ventanas y desagües. En zonas bajas, prepare barreras contra el agua y desconecte los aparatos solo si es seguro.', 'A pie: evite calles inundadas y pasos subterráneos. No atraviese el agua; aléjese de alcantarillas e instalaciones eléctricas.', 'Al conducir: no entre en vías inundadas. Si el vehículo se detiene en agua creciente, abandónelo hacia un lugar elevado cuando sea seguro.', 'En la montaña: vigile crecidas, deslizamientos y flujos de lodo. Evacúe inmediatamente cuando se indique.']
        },
        flood: {
          name: 'Inundaciones y anegamientos', desc: 'Las inundaciones ocurren cuando se desbordan ríos o lagos. Los anegamientos aparecen cuando el drenaje no puede absorber la lluvia. Ambos suelen seguir a lluvias persistentes.',
          actions: ['Siga los avisos y órdenes de evacuación. Conozca de antemano las rutas y los refugios.', 'Evacúe inmediatamente cuando se ordene. Lleve solo lo esencial y no se retrase por sus pertenencias.', 'Si queda rodeado de agua, suba a terreno alto o a una planta superior segura y pida ayuda. Evite entrar en corrientes.', 'Aléjese de ríos, diques, puentes, alcantarillas y zonas inundadas. No se acerque a observar ni intente cruzarlas a pie.']
        },
        earthquake: {
          name: 'Terremoto', desc: 'Un terremoto es una sacudida repentina del suelo causada por la liberación de energía en la corteza terrestre. Saber cómo protegerse puede reducir las lesiones.',
          actions: ['Dentro: agáchese, cúbrase bajo una mesa resistente y agárrese. Proteja cabeza y cuello, lejos de ventanas, lámparas y muebles altos.', 'No salte del edificio ni use ascensores. Si está en uno, salga en la planta disponible más cercana cuando sea seguro.', 'Fuera: vaya a una zona abierta, lejos de edificios, farolas y postes, y proteja la cabeza.', 'Si queda atrapado: conserve la calma y la energía. Golpee una tubería o pared para avisar; evite gritar de forma prolongada.', 'Después: compruebe los riesgos de gas y electricidad cuando sea seguro. No vuelva a edificios dañados y siga las instrucciones de rescate.']
        },
        heat: {
          name: 'Calor extremo', desc: 'Se considera calor intenso cuando la máxima diaria alcanza 35 °C o más. El calor prolongado aumenta el riesgo de agotamiento, golpe de calor y accidentes eléctricos.',
          actions: ['Limite las salidas en las horas más calurosas. Protéjase del sol y beba agua regularmente; las bebidas con electrolitos pueden ayudar tras sudoración intensa.', 'Mayores, niños, embarazadas y personas con enfermedades crónicas deben reducir esfuerzos y mantener las habitaciones frescas y ventiladas.', 'Los trabajadores al aire libre deben evitar el mediodía y alternar tareas con descansos.', 'Ante mareo, debilidad o sed inusual, vaya a un lugar fresco y sombreado y empiece a enfriarse. Si los síntomas son graves, llame al 120.']
        },
        coldwave: {
          name: 'Ola de frío', desc: 'Una ola de frío causa un descenso brusco de temperatura al entrar aire muy frío. El viento, la lluvia, la nieve y el hielo pueden provocar congelación y enfermedades respiratorias.',
          actions: ['Abríguese. Mayores y niños deben limitar las salidas; las personas con enfermedades cardiovasculares necesitan especial cuidado.', 'Aísle las tuberías y contadores expuestos para evitar que se congelen y revienten.', 'Si usa calefactores de combustión, ventile adecuadamente y prevenga la intoxicación por monóxido de carbono.', 'Proteja los cultivos y el ganado del frío y las heladas.']
        },
        thunder: {
          name: 'Rayos y tormentas eléctricas', desc: 'Los rayos son descargas eléctricas acompañadas de truenos. Son frecuentes en las tormentas de verano y especialmente peligrosos al aire libre.',
          actions: ['Permanezca dentro con puertas y ventanas cerradas. Aléjese de ventanas, balcones y paredes exteriores.', 'Evite aparatos sin protección contra rayos y no use teléfonos con cable.', 'Fuera: evite árboles, postes, anuncios, agua y espacios abiertos. Busque un edificio sólido o un vehículo cerrado.', 'Durante la tormenta, evite caminar fuera con objetos metálicos y no use bicicletas ni bicicletas eléctricas.']
        },
        gale: {
          name: 'Viento fuerte', desc: 'El viento fuerte puede derribar árboles, dañar carteles y hacer caer objetos de edificios, poniendo en peligro a personas y bienes.',
          actions: ['Cierre puertas y ventanas. Asegure vallas, andamios, carteles y estructuras que pueda mover el viento.', 'Suspenda actividades expuestas al aire libre y trabajos peligrosos en altura.', 'No se refugie bajo anuncios o estructuras provisionales. Aléjese de árboles altos y postes eléctricos.', 'Las embarcaciones y quienes trabajan en el agua deben buscar un puerto seguro. Asegure las instalaciones portuarias.']
        },
        hail: {
          name: 'Granizo', desc: 'El granizo es precipitación sólida procedente de nubes convectivas intensas, a menudo con rayos y viento. Puede lesionar a personas y dañar cultivos y vehículos.',
          actions: ['Cierre puertas y ventanas y proteja los objetos exteriores vulnerables.', 'Busque refugio seguro inmediatamente. No se proteja en balcones expuestos ni bajo árboles.', 'Conduzca despacio. Si hace falta, deténgase en un lugar seguro hasta que pase el granizo.', 'Proteja la cabeza con una mochila o ropa mientras llega a un refugio.']
        },
        fog: {
          name: 'Niebla densa', desc: 'La niebla densa reduce la visibilidad y compromete la seguridad del transporte. Puede haber restricciones en autopistas y aeropuertos.',
          actions: ['Reduzca la velocidad, use luces antiniebla y de cruce adecuadas y mantenga distancia. Respete las normas locales sobre luces de emergencia.', 'Aeropuertos, autopistas y terminales de ferris deben tomar medidas para mantener la seguridad.', 'Limite las actividades al aire libre y use una mascarilla adecuada cuando sea necesario.', 'Si es posible, retrase el viaje hasta que mejore la visibilidad. Nunca conduzca a gran velocidad con niebla.']
        },
        forestfire: {
          name: 'Riesgo de incendio forestal', desc: 'Los avisos de incendio forestal describen la facilidad con la que puede arder la vegetación. La sequedad, el calor y el viento aumentan considerablemente el peligro.',
          actions: ['No encienda fuegos al aire libre ni lleve fuentes de ignición a bosques o montañas.', 'Informe inmediatamente de un incendio forestal llamando al 12119.', 'No queme terrenos ni residuos agrícolas. Use prácticas sin fuego en actos conmemorativos.', 'Si le amenaza un incendio, siga las instrucciones oficiales de evacuación. Evite el humo, las vaguadas y las rutas que puedan dejarle atrapado.']
        },
        drought: {
          name: 'Sequía', desc: 'La falta prolongada de lluvia provoca escasez de agua que afecta al consumo, la agricultura y los ecosistemas. También aumenta el riesgo de incendios forestales.',
          actions: ['Ahorre y reutilice agua cuando sea apropiado, priorizando las necesidades domésticas esenciales.', 'Siga la información oficial sobre distribución y suministro de agua y prepare una reserva para beber.', 'Las comunidades agrícolas deben adaptar los cultivos y usar riego eficiente.', 'Extreme la prevención de incendios: el peligro forestal aumenta durante las sequías.']
        }
      }
    },
    fr: {
      labels: { warning: 'Alerte', note: 'À noter' },
      wind: function (h, wind, gust, cyclone) { return (cyclone ? 'Un cyclone tropical peut toucher la zone' : 'Des vents forts peuvent toucher la zone') + ' dans les ' + h + ' heures, avec un vent soutenu de force ' + wind + ' ou plus, ou des rafales de force ' + gust + ' ou plus sur l’échelle de Beaufort.'; },
      rain: function (h, mm) { return 'Les précipitations peuvent atteindre ' + mm + ' mm ou plus en ' + h + ' heures, ou ont déjà atteint cette quantité et peuvent continuer.'; },
      cold: function (h, drop, temp) { return 'La température minimale peut baisser d’au moins ' + drop + ' °C en ' + h + ' heures, pour atteindre ' + temp + ' °C ou moins.'; },
      heat: ['Des maximales de 35 °C ou plus sont prévues pendant trois jours consécutifs.', 'La température maximale peut atteindre 37 °C ou plus dans les 24 heures.', 'La température maximale peut atteindre 40 °C ou plus dans les 24 heures.'],
      thunder: ['Des éclairs sont possibles dans les 6 heures et peuvent causer des dégâts ou des blessures.', 'Une activité électrique est possible dans les 6 heures, avec un risque de dégâts ou de blessures.', 'Des éclairs sont très probables dans les 2 heures, ou se produisent déjà et peuvent continuer.', 'Des éclairs sont extrêmement probables dans les 2 heures, ou une forte activité électrique est en cours et peut continuer.'],
      hail: ['De la grêle est possible dans les 6 heures et peut causer des dégâts.', 'De la grêle est extrêmement probable dans les 2 heures, avec un risque de dégâts importants.'],
      fog: function (h, metres) { return 'Du brouillard réduisant la visibilité à moins de ' + metres + ' mètres est possible dans les ' + h + ' heures.'; },
      flood: ['Le niveau de l’eau approche du seuil d’alerte, ou une crue dépassant ce seuil est prévue.', 'Le niveau de l’eau dépasse le seuil d’alerte, ou une crue importante est prévue.', 'Le niveau de l’eau approche du seuil de sécurité des ouvrages de protection, ou une crue majeure est prévue.', 'Le niveau de l’eau dépasse le seuil de sécurité des ouvrages, ou une crue exceptionnelle est prévue.'],
      earthquake: ['L’alerte sismique précoce n’est pas une prévision. Les signaux se propagent plus vite que les ondes sismiques et peuvent laisser quelques secondes à quelques dizaines de secondes pour se protéger.', 'Protégez-vous à proximité pendant la secousse. Ensuite, évacuez si le bâtiment est dangereux ou si les autorités le demandent.'],
      forestfire: ['Danger météorologique d’incendie de forêt de niveau 3 : danger modéré ; la végétation s’enflamme assez facilement.', 'Danger de niveau 4 : danger élevé ; la végétation s’enflamme facilement.', 'Danger de niveau 5 : danger extrême ; la végétation s’enflamme très facilement.'],
      drought: ['L’indice météorologique composite devrait atteindre la catégorie de sécheresse forte dans la semaine à venir.', 'L’indice devrait atteindre la catégorie de sécheresse sévère dans la semaine à venir.', 'L’indice devrait atteindre la catégorie de sécheresse extrême dans la semaine à venir.'],
      guides: {
        typhoon: {
          name: 'Typhon', desc: 'Un typhon est un cyclone tropical intense formé au-dessus d’un océan chaud. Ses vents, pluies et surcotes présentent un danger majeur pour les régions côtières.',
          actions: ['Avant son arrivée : suivez les alertes, préparez de l’eau, des aliments et une lampe, sécurisez les portes et fenêtres et rentrez les objets du balcon.', 'Pendant le typhon : restez à l’intérieur, loin des portes et fenêtres. Si le bâtiment est dangereux, rejoignez un abri sûr selon les consignes.', 'Dehors : éloignez-vous des arbres, panneaux, installations provisoires et poteaux. Évitez le littoral et les hauteurs exposées.', 'Après : évitez les montagnes, rivières et bâtiments endommagés. Vérifiez la salubrité de l’eau et des aliments.']
        },
        rainstorm: {
          name: 'Pluie torrentielle', desc: 'Des pluies intenses et brèves peuvent provoquer des inondations urbaines, crues soudaines, glissements de terrain et autres dangers secondaires.',
          actions: ['Chez vous : vérifiez les fenêtres et évacuations d’eau. En zone basse, préparez des barrières et ne débranchez les appareils que sans danger.', 'À pied : évitez les rues inondées et passages souterrains. Ne traversez pas l’eau ; éloignez-vous des regards et installations électriques.', 'En voiture : n’entrez pas sur une route inondée. Si le véhicule cale dans une eau montante, gagnez un point haut lorsque c’est possible sans danger.', 'En montagne : surveillez les crues, glissements et coulées de boue. Évacuez immédiatement sur instruction.']
        },
        flood: {
          name: 'Inondations et engorgements', desc: 'Une inondation survient lorsque des rivières ou lacs débordent. L’engorgement se produit lorsque le drainage ne suffit plus. Tous deux suivent souvent de fortes pluies prolongées.',
          actions: ['Suivez les alertes et ordres d’évacuation. Repérez à l’avance les itinéraires et les abris.', 'Évacuez dès que demandé. Prenez l’essentiel et ne tardez pas pour sauver des biens.', 'Si l’eau vous entoure, gagnez un terrain élevé ou un étage sûr et signalez votre présence. Évitez d’entrer dans une eau en mouvement.', 'Éloignez-vous des rivières, digues, ponts, buses et zones inondées. Ne vous approchez pas pour observer et ne traversez pas à pied.']
        },
        earthquake: {
          name: 'Séisme', desc: 'Un séisme est une secousse soudaine due à la libération d’énergie dans la croûte terrestre. Savoir se mettre à couvert peut réduire les blessures.',
          actions: ['À l’intérieur : baissez-vous, abritez-vous sous une table solide et agrippez-vous. Protégez tête et cou, loin des fenêtres, luminaires et meubles hauts.', 'Ne sautez pas du bâtiment et n’utilisez pas les ascenseurs. Si vous êtes dans un ascenseur, sortez au palier accessible le plus proche lorsque c’est sûr.', 'Dehors : gagnez un espace ouvert, loin des bâtiments, lampadaires et poteaux, et protégez votre tête.', 'Si vous êtes coincé : restez calme, économisez vos forces et frappez un tuyau ou mur pour prévenir les secours. Évitez de crier longtemps.', 'Après : vérifiez les risques de gaz et d’électricité si cela peut se faire sans danger. Ne rentrez pas dans un bâtiment endommagé et suivez les secours.']
        },
        heat: {
          name: 'Chaleur extrême', desc: 'Une forte chaleur correspond à des maximales quotidiennes de 35 °C ou plus. Sa persistance augmente les risques de malaise, de coup de chaleur et d’accident électrique.',
          actions: ['Limitez les sorties aux heures les plus chaudes. Protégez-vous du soleil et buvez régulièrement ; des boissons avec électrolytes peuvent aider après une forte transpiration.', 'Les personnes âgées, enfants, femmes enceintes et malades chroniques doivent limiter les efforts et garder les pièces fraîches et ventilées.', 'Les travailleurs extérieurs doivent éviter le milieu de journée et alterner tâches et pauses.', 'En cas de vertiges, faiblesse ou soif inhabituelle, rejoignez un endroit frais à l’ombre et commencez à vous rafraîchir. Pour des symptômes graves, appelez le 120.']
        },
        coldwave: {
          name: 'Vague de froid', desc: 'Une vague de froid entraîne une chute brutale des températures à l’arrivée d’air très froid. Vent, pluie, neige et gel peuvent provoquer des gelures et maladies respiratoires.',
          actions: ['Habillez-vous chaudement. Les personnes âgées et enfants doivent limiter les sorties ; les personnes atteintes de maladies cardiovasculaires doivent être particulièrement prudentes.', 'Isolez les canalisations et compteurs exposés pour éviter le gel et les ruptures.', 'Avec un chauffage à combustion, ventilez correctement et prévenez les intoxications au monoxyde de carbone.', 'Protégez les cultures et le bétail du froid et du gel.']
        },
        thunder: {
          name: 'Foudre et orages', desc: 'La foudre est une décharge électrique accompagnée de tonnerre. Fréquente pendant les orages d’été, elle est particulièrement dangereuse à l’extérieur.',
          actions: ['Restez à l’intérieur, portes et fenêtres fermées. Éloignez-vous des fenêtres, balcons et murs extérieurs.', 'Évitez les appareils sans protection contre la foudre et les téléphones filaires.', 'Dehors : évitez les arbres, poteaux, panneaux, plans d’eau et terrains ouverts. Rejoignez un bâtiment solide ou un véhicule fermé.', 'Pendant l’orage, évitez de marcher dehors avec des objets métalliques et ne circulez pas à vélo, même électrique.']
        },
        gale: {
          name: 'Vent violent', desc: 'Un vent violent peut déraciner des arbres, endommager des panneaux et faire tomber des objets, menaçant les personnes et les biens.',
          actions: ['Fermez portes et fenêtres. Fixez clôtures, échafaudages, panneaux et autres structures sensibles au vent.', 'Suspendez les activités extérieures exposées et les travaux dangereux en hauteur.', 'Ne vous abritez pas sous les panneaux ou installations provisoires. Éloignez-vous des grands arbres et poteaux électriques.', 'Les bateaux et personnes travaillant sur l’eau doivent chercher un port sûr. Sécurisez les installations portuaires.']
        },
        hail: {
          name: 'Grêle', desc: 'La grêle est une précipitation solide provenant de nuages convectifs puissants, souvent avec foudre et vent. Elle peut blesser et endommager cultures et véhicules.',
          actions: ['Fermez portes et fenêtres et protégez les objets extérieurs vulnérables.', 'Rejoignez immédiatement un abri sûr. Ne vous abritez pas sur un balcon exposé ou sous un arbre.', 'Conduisez lentement. Si nécessaire, arrêtez-vous dans un lieu sûr jusqu’à la fin de la grêle.', 'Protégez votre tête avec un sac ou un vêtement le temps de rejoindre un abri.']
        },
        fog: {
          name: 'Brouillard dense', desc: 'Le brouillard dense réduit la visibilité et compromet la sécurité des transports. Des restrictions peuvent toucher les autoroutes et aéroports.',
          actions: ['Réduisez la vitesse, utilisez les feux antibrouillard et de croisement adaptés et gardez vos distances. Respectez les règles locales sur les feux de détresse.', 'Les aéroports, autoroutes et terminaux de ferry doivent prendre des mesures de sécurité.', 'Limitez les activités extérieures et portez un masque adapté si nécessaire.', 'Si possible, reportez le trajet jusqu’à une meilleure visibilité. Ne roulez jamais vite dans le brouillard.']
        },
        forestfire: {
          name: 'Risque de feu de forêt', desc: 'Les alertes indiquent la facilité avec laquelle la végétation peut brûler. Sécheresse, chaleur et vent augmentent fortement le danger.',
          actions: ['N’allumez aucun feu dehors et n’apportez pas de sources d’allumage en forêt ou en montagne.', 'Signalez immédiatement un feu de forêt au 12119.', 'Ne brûlez ni terrains ni résidus agricoles. Privilégiez des pratiques sans feu lors des commémorations.', 'Si un feu vous menace, suivez les consignes officielles d’évacuation. Évitez la fumée, les ravins et les itinéraires susceptibles de vous piéger.']
        },
        drought: {
          name: 'Sécheresse', desc: 'Le manque prolongé de pluie peut causer des pénuries touchant l’eau potable, l’agriculture et les écosystèmes. Il accroît aussi le risque de feu de forêt.',
          actions: ['Économisez l’eau et réutilisez-la lorsque c’est approprié, en privilégiant les besoins domestiques essentiels.', 'Suivez les informations officielles sur la répartition et l’approvisionnement et préparez une réserve d’eau potable.', 'Les communautés agricoles doivent adapter les cultures et employer une irrigation économe.', 'Renforcez la prévention des incendies : le danger augmente pendant une sécheresse.']
        }
      }
    },
    it: {
      labels: { warning: 'Allerta', note: 'Nota' },
      wind: function (h, wind, gust, cyclone) { return (cyclone ? 'Un ciclone tropicale può interessare la zona' : 'Venti forti possono interessare la zona') + ' nelle prossime ' + h + ' ore, con vento medio di forza ' + wind + ' o superiore, oppure raffiche di forza ' + gust + ' o superiore sulla scala Beaufort.'; },
      rain: function (h, mm) { return 'Le precipitazioni possono raggiungere almeno ' + mm + ' mm in ' + h + ' ore, oppure hanno già raggiunto tale quantità e possono continuare.'; },
      cold: function (h, drop, temp) { return 'La temperatura minima può scendere di almeno ' + drop + ' °C in ' + h + ' ore, raggiungendo ' + temp + ' °C o meno.'; },
      heat: ['Sono previste massime di almeno 35 °C per tre giorni consecutivi.', 'La temperatura massima può raggiungere almeno 37 °C entro 24 ore.', 'La temperatura massima può raggiungere almeno 40 °C entro 24 ore.'],
      thunder: ['Sono possibili fulmini nelle prossime 6 ore, con rischio di danni o lesioni.', 'È possibile attività elettrica nelle prossime 6 ore, con rischio di danni o lesioni.', 'Sono molto probabili fulmini nelle prossime 2 ore, oppure sono già in corso e possono continuare.', 'Sono estremamente probabili fulmini nelle prossime 2 ore, oppure è già in corso intensa attività elettrica che può continuare.'],
      hail: ['È possibile grandine nelle prossime 6 ore, con rischio di danni.', 'È estremamente probabile grandine nelle prossime 2 ore, con rischio di danni gravi.'],
      fog: function (h, metres) { return 'È possibile nebbia con visibilità inferiore a ' + metres + ' metri nelle prossime ' + h + ' ore.'; },
      flood: ['Il livello dell’acqua si avvicina alla soglia di allerta, oppure è prevista una piena che la superi.', 'Il livello dell’acqua supera la soglia di allerta, oppure è prevista una piena importante.', 'Il livello dell’acqua si avvicina alla soglia di sicurezza delle opere di difesa, oppure è prevista una piena grave.', 'Il livello dell’acqua supera la soglia di sicurezza delle opere, oppure è prevista una piena eccezionale.'],
      earthquake: ['L’allerta sismica precoce non è una previsione. I segnali viaggiano più velocemente delle onde sismiche e possono dare da pochi secondi a decine di secondi per ripararsi.', 'Durante la scossa riparati nelle vicinanze. Dopo, evacua se l’edificio è pericoloso o se lo richiedono le autorità.'],
      forestfire: ['Pericolo meteorologico di incendio forestale di livello 3: pericolo moderato; la vegetazione si incendia abbastanza facilmente.', 'Pericolo di livello 4: pericolo alto; la vegetazione si incendia facilmente.', 'Pericolo di livello 5: pericolo estremo; la vegetazione si incendia molto facilmente.'],
      drought: ['L’indice meteorologico composito dovrebbe raggiungere la categoria di siccità intensa nella prossima settimana.', 'L’indice dovrebbe raggiungere la categoria di siccità grave nella prossima settimana.', 'L’indice dovrebbe raggiungere la categoria di siccità estrema nella prossima settimana.'],
      guides: {
        typhoon: {
          name: 'Tifone', desc: 'Un tifone è un intenso ciclone tropicale che si forma sugli oceani caldi. Venti, piogge e mareggiate cicloniche rappresentano un grave pericolo per le zone costiere.',
          actions: ['Prima dell’arrivo: segui le allerte, prepara acqua, alimenti e una torcia, metti in sicurezza porte e finestre e porta dentro gli oggetti del balcone.', 'Durante il tifone: resta dentro, lontano da porte e finestre. Se l’edificio è pericoloso, raggiungi un rifugio sicuro quando indicato.', 'All’aperto: allontanati da alberi, cartelloni, strutture temporanee e pali. Evita il lungomare e le alture esposte.', 'Dopo: evita montagne, fiumi ed edifici danneggiati. Controlla che acqua e alimenti siano sicuri.']
        },
        rainstorm: {
          name: 'Nubifragio', desc: 'Piogge intense in poco tempo possono provocare allagamenti urbani, piene improvvise, frane e altri pericoli secondari.',
          actions: ['In casa: controlla finestre e scarichi. Nelle zone basse prepara barriere contro l’acqua e scollega gli apparecchi solo se è sicuro.', 'A piedi: evita strade allagate e sottopassi. Non attraversare l’acqua; allontanati da tombini e impianti elettrici.', 'In auto: non entrare in strade allagate. Se il veicolo si ferma mentre l’acqua sale, raggiungi un luogo alto quando è sicuro.', 'In montagna: fai attenzione a piene improvvise, frane e colate di fango. Evacua subito quando richiesto.']
        },
        flood: {
          name: 'Alluvioni e allagamenti', desc: 'Le alluvioni avvengono quando fiumi o laghi straripano. Gli allagamenti si verificano quando il drenaggio non assorbe la pioggia. Entrambi seguono spesso precipitazioni persistenti.',
          actions: ['Segui le allerte e gli ordini di evacuazione. Informati in anticipo su percorsi e rifugi.', 'Evacua subito quando richiesto. Porta solo l’essenziale e non tardare per salvare oggetti.', 'Se sei circondato dall’acqua, raggiungi terreno alto o un piano superiore sicuro e segnala la tua presenza. Evita di entrare in acqua corrente.', 'Allontanati da fiumi, argini, ponti, condotte e zone allagate. Non avvicinarti per osservare e non attraversare a piedi.']
        },
        earthquake: {
          name: 'Terremoto', desc: 'Un terremoto è un improvviso scuotimento del suolo causato dal rilascio di energia nella crosta terrestre. Sapere come ripararsi può ridurre le lesioni.',
          actions: ['Dentro: abbassati, riparati sotto un tavolo robusto e tieniti saldo. Proteggi testa e collo, lontano da finestre, lampadari e mobili alti.', 'Non saltare dall’edificio e non usare ascensori. Se sei in ascensore, esci al piano disponibile più vicino quando è sicuro.', 'Fuori: raggiungi uno spazio aperto, lontano da edifici, lampioni e pali, e proteggi la testa.', 'Se sei intrappolato: mantieni la calma, risparmia energie e batti su un tubo o una parete per segnalarti. Evita di gridare a lungo.', 'Dopo: controlla i rischi di gas ed elettricità solo se è sicuro. Non rientrare in edifici danneggiati e segui i soccorsi.']
        },
        heat: {
          name: 'Caldo estremo', desc: 'Si parla di caldo intenso con massime giornaliere di almeno 35 °C. Il caldo prolungato aumenta il rischio di malessere, colpo di calore e incidenti elettrici.',
          actions: ['Limita le uscite nelle ore più calde. Proteggiti dal sole e bevi regolarmente; bevande con elettroliti possono aiutare dopo una forte sudorazione.', 'Anziani, bambini, donne in gravidanza e persone con malattie croniche devono limitare gli sforzi e mantenere gli ambienti freschi e ventilati.', 'Chi lavora all’aperto dovrebbe evitare mezzogiorno e alternare le attività con pause.', 'Con capogiri, debolezza o sete insolita, raggiungi un luogo fresco all’ombra e inizia a raffreddarti. Per sintomi gravi chiama il 120.']
        },
        coldwave: {
          name: 'Ondata di freddo', desc: 'Un’ondata di freddo provoca un brusco calo delle temperature per l’arrivo di aria gelida. Vento, pioggia, neve e gelo possono causare congelamento e malattie respiratorie.',
          actions: ['Copriti bene. Anziani e bambini devono limitare le uscite; chi ha malattie cardiovascolari deve prestare particolare attenzione.', 'Isola tubazioni e contatori esposti per evitare congelamenti e rotture.', 'Con stufe a combustione, garantisci una ventilazione adeguata e previeni l’avvelenamento da monossido di carbonio.', 'Proteggi colture e bestiame dal freddo e dal gelo.']
        },
        thunder: {
          name: 'Fulmini e temporali', desc: 'Il fulmine è una scarica elettrica accompagnata dal tuono. È frequente nei temporali estivi ed è particolarmente pericoloso all’aperto.',
          actions: ['Resta dentro con porte e finestre chiuse. Allontanati da finestre, balconi e pareti esterne.', 'Evita apparecchi senza protezione dai fulmini e non usare telefoni con filo.', 'Fuori: evita alberi, pali, cartelloni, acqua e spazi aperti. Cerca un edificio solido o un veicolo chiuso.', 'Durante i temporali evita di camminare fuori con oggetti metallici e non usare biciclette, anche elettriche.']
        },
        gale: {
          name: 'Vento forte', desc: 'Il vento forte può abbattere alberi, danneggiare cartelloni e far cadere oggetti dagli edifici, mettendo in pericolo persone e beni.',
          actions: ['Chiudi porte e finestre. Fissa recinzioni, impalcature, cartelloni e strutture che il vento potrebbe muovere.', 'Sospendi le attività esterne esposte e i lavori pericolosi in quota.', 'Non ripararti sotto cartelloni o strutture temporanee. Allontanati da alberi alti e pali elettrici.', 'Le imbarcazioni e chi lavora sull’acqua devono cercare un porto sicuro. Metti in sicurezza le strutture portuali.']
        },
        hail: {
          name: 'Grandine', desc: 'La grandine è una precipitazione solida da nubi convettive intense, spesso con fulmini e vento. Può ferire persone e danneggiare colture e veicoli.',
          actions: ['Chiudi porte e finestre e proteggi gli oggetti esterni vulnerabili.', 'Cerca immediatamente un riparo sicuro. Non ripararti su balconi esposti o sotto gli alberi.', 'Guida lentamente. Se necessario, fermati in un luogo sicuro fino alla fine della grandine.', 'Proteggi la testa con uno zaino o indumenti mentre raggiungi un riparo.']
        },
        fog: {
          name: 'Nebbia fitta', desc: 'La nebbia fitta riduce la visibilità e compromette la sicurezza dei trasporti. Autostrade e aeroporti possono imporre restrizioni.',
          actions: ['Riduci la velocità, usa correttamente fendinebbia e anabbaglianti e mantieni le distanze. Rispetta le regole locali sulle luci di emergenza.', 'Aeroporti, autostrade e terminal dei traghetti devono adottare misure di sicurezza.', 'Limita le attività all’aperto e usa una mascherina adeguata quando necessario.', 'Se possibile, rimanda il viaggio finché migliora la visibilità. Non guidare mai velocemente nella nebbia.']
        },
        forestfire: {
          name: 'Rischio di incendio boschivo', desc: 'Le allerte indicano quanto facilmente la vegetazione può bruciare. Siccità, caldo e vento aumentano notevolmente il pericolo.',
          actions: ['Non accendere fuochi all’aperto e non portare fonti di accensione nei boschi o in montagna.', 'Segnala immediatamente un incendio boschivo chiamando il 12119.', 'Non bruciare terreni o residui agricoli. Usa pratiche senza fuoco durante le commemorazioni.', 'Se un incendio ti minaccia, segui le istruzioni ufficiali di evacuazione. Evita fumo, canaloni e percorsi che potrebbero intrappolarti.']
        },
        drought: {
          name: 'Siccità', desc: 'La mancanza prolungata di pioggia provoca carenze d’acqua per consumo, agricoltura ed ecosistemi. Aumenta anche il rischio di incendi boschivi.',
          actions: ['Risparmia e riutilizza l’acqua quando opportuno, dando priorità alle necessità domestiche essenziali.', 'Segui le informazioni ufficiali su distribuzione e approvvigionamento e prepara una riserva d’acqua potabile.', 'Le comunità agricole devono adattare le colture e usare irrigazione a risparmio idrico.', 'Presta particolare attenzione alla prevenzione degli incendi: il pericolo aumenta durante la siccità.']
        }
      }
    }
  };

  function signalDescriptions(id, locale) {
    if (id === 'typhoon' || id === 'gale') {
      var criteria = id === 'typhoon' ? [[24, 6, 8], [24, 8, 10], [12, 10, 12], [6, 12, 14]] : [[24, 6, 7], [12, 8, 9], [6, 10, 11], [6, 12, 13]];
      return criteria.map(function (row) { return locale.wind(row[0], row[1], row[2], id === 'typhoon'); });
    }
    if (id === 'rainstorm') return [[12, 50], [6, 50], [3, 50], [3, 100]].map(function (row) { return locale.rain(row[0], row[1]); });
    if (id === 'coldwave') return [[48, 8, 4], [24, 10, 4], [24, 12, 0], [24, 16, 0]].map(function (row) { return locale.cold(row[0], row[1], row[2]); });
    if (id === 'fog') return [[12, 500], [6, 200], [2, 50]].map(function (row) { return locale.fog(row[0], row[1]); });
    return locale[id];
  }
  window.__modules['guide-locales'] = {
    getGuide: function (guide, language) {
      if (language === 'zh') return guide;
      if (language === 'en') return Object.assign({}, guide, window.__modules['guide-en'][guide.id]);
      var locale = locales[language];
      if (!locale) return guide;
      var descriptions = signalDescriptions(guide.id, locale);
      return Object.assign({}, guide, locale.guides[guide.id], {
        signals: guide.signals.map(function (signal, index) {
          var level = signal.level === '预警' ? locale.labels.warning : signal.level === '提示' ? locale.labels.note : window.__modules.i18n.levelWord(signal.level, language);
          return { level: level, desc: descriptions[index] };
        })
      });
    }
  };
})();
