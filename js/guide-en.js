/* English counterparts of the twelve learning guides in data.js. */
(function () {
  function signals(rows) {
    return rows.map(function (row) { return { level: row[0], desc: row[1] }; });
  }
  window.__modules['guide-en'] = {
    typhoon: {
      name: 'Typhoon',
      desc: 'A typhoon is an intense tropical cyclone that forms over warm oceans. Strong winds, heavy rain and storm surges make it a major hazard for coastal areas.',
      signals: signals([
        ['Blue', 'A tropical cyclone may affect the area within 24 hours, with sustained winds of Beaufort force 6 or above, or gusts of force 8 or above.'],
        ['Yellow', 'A tropical cyclone may affect the area within 24 hours, with sustained winds of force 8 or above, or gusts of force 10 or above.'],
        ['Orange', 'A tropical cyclone may affect the area within 12 hours, with sustained winds of force 10 or above, or gusts of force 12 or above.'],
        ['Red', 'A tropical cyclone may affect the area within 6 hours, with sustained winds of force 12 or above, or gusts of force 14 or above.']
      ]),
      actions: [
        'Before arrival: follow warnings, prepare drinking water, food and a flashlight, secure doors and windows, and bring loose balcony items indoors.',
        'During the storm: stay indoors away from doors and windows. If your building is unsafe, move to a designated safe shelter when instructed.',
        'Outdoors: stay away from trees, billboards, temporary structures and utility poles. Avoid waterfronts and exposed high ground.',
        'After the storm: avoid mountains, rivers and damaged buildings. Check that drinking water and food are safe.'
      ]
    },
    rainstorm: {
      name: 'Rainstorm',
      desc: 'Intense rainfall over a short period can cause urban flooding, flash floods, landslides and other secondary hazards.',
      signals: signals([
        ['Blue', 'Rainfall may reach 50 mm or more within 12 hours, or has already reached that amount and may continue.'],
        ['Yellow', 'Rainfall may reach 50 mm or more within 6 hours, or has already reached that amount and may continue.'],
        ['Orange', 'Rainfall may reach 50 mm or more within 3 hours, or has already reached that amount and may continue.'],
        ['Red', 'Rainfall may reach 100 mm or more within 3 hours, or has already reached that amount and may continue.']
      ]),
      actions: [
        'At home: check windows and balcony drainage. If you live in a low-lying area, prepare flood barriers and disconnect electrical equipment only if it is safe to do so.',
        'On foot: avoid flooded streets and underpasses. Do not wade through floodwater; keep away from manholes and electrical facilities.',
        'Driving: do not enter flooded roads. If your vehicle stalls in rising water, leave it for higher ground when safe.',
        'In mountain areas: watch for flash floods, landslides and mudflows. Evacuate immediately when instructed.'
      ]
    },
    flood: {
      name: 'Flooding and Waterlogging',
      desc: 'Flooding occurs when rising rivers or lakes overflow. Waterlogging occurs when drainage cannot cope with rainfall. Both often follow prolonged heavy rain.',
      signals: signals([
        ['Blue', 'Water levels are approaching the warning level, or flooding above that level is forecast.'],
        ['Yellow', 'Water levels exceed the warning level, or a substantial flood is forecast.'],
        ['Orange', 'Water levels are approaching the designated flood-control safety level, or a major flood is forecast.'],
        ['Red', 'Water levels exceed the designated flood-control safety level, or an exceptionally severe flood is forecast.']
      ]),
      actions: [
        'Follow warnings and evacuation notices. Learn evacuation routes and shelter locations in advance.',
        'Act immediately when told to evacuate. Take essential items only; do not delay to protect belongings.',
        'If surrounded by floodwater, move to higher ground or a safe upper level and signal for rescue. Avoid entering moving water.',
        'Stay away from rivers, embankments, bridges, culverts and flooded areas. Do not gather to watch flooding or attempt to wade across it.'
      ]
    },
    earthquake: {
      name: 'Earthquake',
      desc: 'An earthquake is sudden ground shaking caused by energy released within the Earth’s crust. Knowing how to take cover can reduce injury.',
      signals: signals([
        ['Warning', 'Earthquake early warning is not a prediction. Signals can travel faster than seismic waves, providing seconds to tens of seconds to take immediate cover.'],
        ['Note', 'Take cover nearby during shaking. After shaking stops, evacuate promptly if the building is unsafe or authorities instruct you to leave.']
      ]),
      actions: [
        'Indoors: drop, take cover under a sturdy table and hold on. Protect your head and neck, away from windows, hanging lights and tall furniture.',
        'Do not jump from a building or use elevators. If you are in an elevator, leave at the nearest available floor when safe.',
        'Outdoors: move to an open area away from buildings, streetlights and utility poles, and protect your head.',
        'If trapped: stay calm, conserve energy and tap a pipe or wall to signal rescuers. Avoid prolonged shouting.',
        'After shaking: check for gas and electrical hazards when safe. Do not re-enter damaged buildings; follow rescue instructions.'
      ]
    },
    heat: {
      name: 'Extreme Heat',
      desc: 'High-temperature weather means daily maximum temperatures of 35°C or above. Prolonged heat increases the risk of heat illness, heatstroke and electrical accidents.',
      signals: signals([
        ['Yellow', 'Daily maximum temperatures are expected to reach 35°C or above for three consecutive days.'],
        ['Orange', 'The maximum temperature is expected to reach 37°C or above within 24 hours.'],
        ['Red', 'The maximum temperature is expected to reach 40°C or above within 24 hours.']
      ]),
      actions: [
        'Limit trips during the hottest hours. Use sun protection and drink water regularly; electrolyte drinks may help replace salts lost through heavy sweating.',
        'Older adults, children, pregnant people and people with chronic conditions should reduce exertion and keep indoor spaces cool and ventilated.',
        'Outdoor workers should avoid midday heat and rotate tasks with rest breaks.',
        'If dizziness, weakness or unusual thirst develops, move to a cool shaded place and begin cooling. For severe symptoms, call 120.'
      ]
    },
    coldwave: {
      name: 'Cold Wave',
      desc: 'A cold wave brings a sharp temperature drop as strong cold air moves in. Wind, rain, snow and freezing conditions can cause frostbite and respiratory illness.',
      signals: signals([
        ['Blue', 'The minimum temperature is expected to fall by at least 8°C within 48 hours, reaching 4°C or below.'],
        ['Yellow', 'The minimum temperature is expected to fall by at least 10°C within 24 hours, reaching 4°C or below.'],
        ['Orange', 'The minimum temperature is expected to fall by at least 12°C within 24 hours, reaching 0°C or below.'],
        ['Red', 'The minimum temperature is expected to fall by at least 16°C within 24 hours, reaching 0°C or below.']
      ]),
      actions: [
        'Dress warmly. Older adults and children should limit time outdoors; people with cardiovascular conditions should take extra care.',
        'Insulate exposed water pipes and meters to prevent freezing and bursting.',
        'When using fuel-burning heaters, ensure proper ventilation and guard against carbon monoxide poisoning.',
        'Protect crops and livestock from cold and frost.'
      ]
    },
    thunder: {
      name: 'Lightning',
      desc: 'Lightning is an electrical discharge accompanied by thunder. It is common during summer thunderstorms and is especially dangerous outdoors.',
      signals: signals([
        ['Blue', 'Lightning may occur within 6 hours and may cause damage or injury.'],
        ['Yellow', 'Lightning may occur within 6 hours, with a risk of lightning-related damage or injury.'],
        ['Orange', 'Lightning is very likely within 2 hours, or is already occurring and may continue.'],
        ['Red', 'Lightning is extremely likely within 2 hours, or severe lightning is already occurring and may continue.']
      ]),
      actions: [
        'Stay indoors with doors and windows closed. Keep away from windows, balconies and exterior walls.',
        'Avoid electrical appliances without lightning protection and do not use corded telephones.',
        'Outdoors: avoid trees, utility poles, billboards, water and open ground. Seek shelter in a substantial building or an enclosed vehicle.',
        'During thunderstorms, avoid walking outdoors with metal objects, and do not ride bicycles or electric bikes.'
      ]
    },
    gale: {
      name: 'Strong Wind',
      desc: 'Strong winds can bring down trees, damage signs and cause objects to fall from buildings, endangering people and property.',
      signals: signals([
        ['Blue', 'Strong winds may affect the area within 24 hours, with sustained winds of Beaufort force 6 or above, or gusts of force 7 or above.'],
        ['Yellow', 'Strong winds may affect the area within 12 hours, with sustained winds of force 8 or above, or gusts of force 9 or above.'],
        ['Orange', 'Strong winds may affect the area within 6 hours, with sustained winds of force 10 or above, or gusts of force 11 or above.'],
        ['Red', 'Strong winds may affect the area within 6 hours, with sustained winds of force 12 or above, or gusts of force 13 or above.']
      ]),
      actions: [
        'Close doors and windows. Secure fences, scaffolding, signs and other structures that could be moved by wind.',
        'Stop exposed outdoor activities and dangerous work at height.',
        'Do not shelter beneath billboards or temporary structures. Keep away from tall trees and utility poles.',
        'Boats and people working on water should seek safe harbor. Secure port facilities.'
      ]
    },
    hail: {
      name: 'Hail',
      desc: 'Hail is solid precipitation from strong convective clouds, often accompanied by lightning and strong winds. It can injure people and damage crops and vehicles.',
      signals: signals([
        ['Orange', 'Hail may occur within 6 hours and may cause damage.'],
        ['Red', 'Hail is extremely likely within 2 hours and may cause severe damage.']
      ]),
      actions: [
        'Close doors and windows, and protect outdoor items vulnerable to hail.',
        'Seek safe shelter immediately if outdoors. Do not shelter on exposed balconies or beneath trees.',
        'Drive slowly. If necessary, pull over at a safe location and wait for the hail to pass.',
        'Protect your head, using a bag or clothing as a temporary shield while reaching shelter.'
      ]
    },
    fog: {
      name: 'Dense Fog',
      desc: 'Dense fog reduces visibility and can seriously affect transport safety. Highways and airports may impose restrictions.',
      signals: signals([
        ['Yellow', 'Fog with visibility below 500 metres may occur within 12 hours.'],
        ['Orange', 'Fog with visibility below 200 metres may occur within 6 hours.'],
        ['Red', 'Fog with visibility below 50 metres may occur within 2 hours.']
      ]),
      actions: [
        'Reduce driving speed, use appropriate fog lights and low-beam headlights, and leave a safe following distance. Follow local rules for hazard lights.',
        'Airports, highways and ferry terminals should take measures to maintain transport safety.',
        'Limit outdoor activities and use a suitable mask when needed.',
        'Delay travel until visibility improves when possible. Never drive at high speed in fog.'
      ]
    },
    forestfire: {
      name: 'Forest Fire Risk',
      desc: 'Forest fire warnings describe how readily forest vegetation may burn. Dry, hot and windy conditions significantly increase the danger.',
      signals: signals([
        ['Yellow', 'Forest fire weather danger is level 3: moderate danger, with vegetation relatively easy to ignite.'],
        ['Orange', 'Forest fire weather danger is level 4: high danger, with vegetation easy to ignite.'],
        ['Red', 'Forest fire weather danger is level 5: extreme danger, with vegetation very easy to ignite.']
      ]),
      actions: [
        'Do not light outdoor fires or bring ignition sources into forests and mountain areas.',
        'Report a forest fire immediately by calling 12119.',
        'Do not burn land or crop residue. Use fire-free practices for memorial activities.',
        'If threatened by a forest fire, follow official evacuation instructions. Avoid smoke, gullies and routes that could leave you trapped.'
      ]
    },
    drought: {
      name: 'Drought',
      desc: 'Prolonged lack of rainfall can cause water shortages affecting drinking water, farming and ecosystems. Persistent drought also increases forest fire risk.',
      signals: signals([
        ['Yellow', 'The composite meteorological drought index is forecast to reach the heavy-drought category within the coming week.'],
        ['Orange', 'The composite meteorological drought index is forecast to reach the severe-drought category within the coming week.'],
        ['Red', 'The composite meteorological drought index is forecast to reach the extreme-drought category within the coming week.']
      ]),
      actions: [
        'Conserve and reuse water where appropriate, prioritizing essential household needs.',
        'Follow official water-allocation and supply information, and prepare a drinking-water reserve.',
        'Farming communities should adapt crop choices and use water-saving irrigation.',
        'Take extra care to prevent fires: forest fire danger is higher during drought.'
      ]
    }
  };
})();
