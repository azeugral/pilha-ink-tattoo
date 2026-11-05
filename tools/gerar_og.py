"""Gera assets/img/og.jpg, favicon.png e apple-touch-icon.png a partir da própria página (servidor em 8881)."""
import os
from playwright.sync_api import sync_playwright
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICONE = """<style>body{margin:0;width:512px;height:512px;background:#0b110e;display:grid;place-items:center}
img{width:440px}</style><img src="http://localhost:8881/assets/img/marca.webp">"""
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': 1200, 'height': 630})
    pg.goto('http://localhost:8881/'); pg.wait_for_timeout(2500)
    pg.add_style_tag(content='#topo,.hero-bts,.hero-dados{display:none!important}.hero{min-height:0!important}')
    pg.wait_for_timeout(400)
    pg.screenshot(path=os.path.join(SITE, 'assets/img/og.jpg'), type='jpeg', quality=86)
    for tam, nome in ((180, 'apple-touch-icon.png'), (64, 'favicon.png')):
        pi = b.new_page(viewport={'width': 512, 'height': 512}, device_scale_factor=tam / 512)
        pi.goto('http://localhost:8881/404.html'); pi.set_content(ICONE); pi.wait_for_timeout(900)
        pi.screenshot(path=os.path.join(SITE, 'assets/img', nome)); pi.close()
    b.close()
