"""Static site checks, using Python's standard library only."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PAGES = [ROOT / p for p in ('index.html', '404.html', 'tarjeta.html', 'casos/biblionexo.html', 'bitacora/index.html', 'bitacora/router-on-a-stick.html')]

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids, self.links, self.images, self.h1 = [], [], [], 0
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'h1':
            self.h1 += 1
        if tag == 'img':
            self.images.append(attrs)
        for key in ('href', 'src'):
            if key in attrs:
                self.links.append(attrs[key])

class SiteTests(unittest.TestCase):
    def test_structure(self):
        for page in PAGES:
            with self.subTest(page=page.name):
                doc = Document(page.read_text())
                self.assertEqual(doc.h1, 1)
                self.assertEqual(len(doc.ids), len(set(doc.ids)), 'Duplicate ID')
                for image in doc.images:
                    self.assertIn('alt', image)
                    self.assertIn('width', image)
                    self.assertIn('height', image)

    def test_local_links_and_fragments(self):
        for page in PAGES:
            for href in Document(page.read_text()).links:
                link = urlsplit(href)
                if link.scheme or link.netloc or href.startswith('/'):
                    continue
                target = (page.parent / unquote(link.path)).resolve() if link.path else page
                self.assertTrue(target.exists(), f'{page}: missing {href}')
                if target.suffix == '.html' and link.fragment:
                    self.assertIn(link.fragment, Document(target.read_text()).ids, f'{page}: missing anchor {href}')

    def test_svg_sources_are_valid(self):
        for path in (ROOT / 'assets/img').rglob('*.svg'):
            with self.subTest(path=path):
                ET.parse(path)

    def test_no_remote_font_dependency(self):
        for page in PAGES:
            self.assertNotIn('fonts.googleapis.com', page.read_text())

if __name__ == '__main__':
    unittest.main()
