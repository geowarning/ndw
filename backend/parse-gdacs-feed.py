"""Read GDACS's official current-event RSS feed using the standard XML parser."""
import json, sys, xml.etree.ElementTree as ET
xml = sys.stdin.read()
if '<!DOCTYPE' in xml or '<!ENTITY' in xml:
    raise ValueError('Unexpected XML declarations')
root = ET.fromstring(xml)
if root.tag != 'rss' or root.find('channel') is None:
    raise ValueError('Expected GDACS RSS channel')
features = []
for item in root.findall('./channel/item'):
    fields = {node.tag.split('}')[-1]: (node.text or '').strip() for node in item}
    for node in item.iter():
        tag = node.tag.split('}')[-1]
        if tag in ('lat', 'long', 'point'):
            fields[tag] = (node.text or '').strip()
    kind, eventid = fields.get('eventtype'), fields.get('eventid')
    if kind not in ('WF','FL','TC','DR','VO','TS'):
        continue
    if not eventid:
        raise ValueError('Missing GDACS event ID')
    if fields.get('iscurrent', 'true').lower() == 'false':
        continue
    if fields.get('point'):
        lat, lon = map(float, fields['point'].split())
    else:
        lat, lon = float(fields['lat']), float(fields['long'])
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise ValueError('Invalid event location')
    features.append({'type':'Feature', 'geometry':{'type':'Point','coordinates':[lon,lat]}, 'properties':{
        'eventtype':kind,'eventid':eventid,'episodeid':fields.get('episodeid',''),
        'name':fields.get('title',''), 'description':fields.get('description',''),
        'country':fields.get('country',''), 'alertlevel':fields.get('alertlevel',''),
        'fromdate':fields.get('fromdate',''), 'todate':fields.get('todate',''),
        'datemodified':fields.get('pubDate',''), 'iscurrent':True,
        'url':{'report':fields.get('link','')}, '_currentFeed':True
    }})
print(json.dumps({'type':'FeatureCollection','features':features}))
