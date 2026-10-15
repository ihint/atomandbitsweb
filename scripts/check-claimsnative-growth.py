"""Check built HTML, assets, links, anchors, canonicals, sitemap and JSON-LD."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import hashlib, json, sys, xml.etree.ElementTree as ET
root = Path(sys.argv[1]); pages = list(root.rglob('*.html')); docs = {}; checks = 0
class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True); self.tags=[]; self.ids=set(); self.json=[]; self.in_json=False; self.current=''; self.feed(text)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs); self.tags.append((tag,a))
        if 'id' in a: assert a['id'] not in self.ids, ('duplicate ID',a['id']); self.ids.add(a['id'])
        if tag=='script' and a.get('type')=='application/ld+json': self.in_json=True; self.current=''
    def handle_data(self,data):
        if self.in_json:self.current+=data
    def handle_endtag(self,tag):
        if tag=='script' and self.in_json:self.json.append(json.loads(self.current)); self.in_json=False
for p in pages: docs[p]=Page(p.read_text())
for p,d in docs.items():
    canonical=[a['href'] for t,a in d.tags if t=='link' and a.get('rel')=='canonical']; assert len(canonical)==1
    route='/' if p==root/'index.html' else '/'+str(p.relative_to(root)).replace('index.html','')
    assert canonical==['https://claimsnative.com'+route], (p,canonical,route)
    assert sum(t=='h1' for t,a in d.tags)==1,p
    assert len([a for t,a in d.tags if t=='title'])==1
    assert len([a for t,a in d.tags if t=='meta' and a.get('name')=='description' and a.get('content')])==1
    scripts=[a.get('src') for t,a in d.tags if t=='script' and a.get('src')]; assert scripts.count('/growth.js')==1 and scripts.count('/growth-config.js')==1
    assert all('gtag' not in s and 'posthog' not in s for s in scripts)
    assert d.json, p
    for graph in d.json:
        for node in graph.get('@graph',[graph]):
            assert node.get('@type') not in ['MedicalClinic','Physician','Review','AggregateRating'],p
            if node.get('@type')=='WebPage':assert node['url']==canonical[0]
    for tag,a in d.tags:
        if 'data-growth-event' in a:
            assert a['data-growth-event'] in ['primary_cta_clicked','inquiry_email_opened','scheduling_link_clicked']
            assert a['data-growth-cta'] in ['get-started','how-it-works','talk-to-us','open-email','schedule']
            assert a['data-growth-location'] in ['header','hero','body','invitation','footer','form']
        if tag=='img':assert a.get('alt') is not None and a.get('width') and a.get('height'),(p,a)
        target=a.get('href') if tag in ('a','link') else a.get('src') if tag in ('img','script') else None
        if not target:continue
        u=urlsplit(target)
        if u.scheme or u.netloc:continue
        file=(root/unquote(u.path.lstrip('/'))) if u.path.startswith('/') else p.parent/unquote(u.path) if u.path else p
        if file.is_dir():file=file/'index.html'
        assert file.exists(),(p,target)
        if u.fragment and file in docs: assert unquote(u.fragment) in docs[file].ids,(p,target,'anchor')
        checks+=1
urls=[e.text for e in ET.parse(root/'sitemap.xml').iter() if e.tag.endswith('loc')]
assert len(urls)==len(set(urls))==len(pages)-1,(urls,pages)
for p in pages:
    if p.name!='404.html': assert next(a['href'] for t,a in docs[p].tags if t=='link' and a.get('rel')=='canonical') in urls
assert not any(root.rglob('.claude'))
print(f'{len(pages)} HTML pages: canonical, heading, description, schema and script checks pass; {checks} local links/assets/anchors pass; {len(urls)} sitemap URLs pass.')

manifest=json.loads((root/'build-manifest.json').read_text())
actual={p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(root.rglob('*')) if p.is_file() and p.name!='build-manifest.json'}
assert manifest['artifact_sha256']==actual, 'Built assets do not match their manifest'
assert manifest['artifact_id']==hashlib.sha256(json.dumps(actual,sort_keys=True,separators=(',',':')).encode()).hexdigest()
assert len(manifest['source_revision'])==40 and manifest['source_sha256']
print('Build manifest asset hashes and source identity pass.')
