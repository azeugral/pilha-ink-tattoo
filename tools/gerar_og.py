"""Gera assets/img/og.jpg, favicon.png e apple-touch-icon.png a partir da própria página (servidor em 8881)."""
import os
from playwright.sync_api import sync_playwright
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICONE = """<link rel="stylesheet" href="http://localhost:8881/assets/css/fontes.css"><link rel="stylesheet" href="http://localhost:8881/assets/css/site.css"><style>html,body{margin:0;width:512px;height:512px;background:#0b110e;display:grid;place-items:center;overflow:hidden}
b{font:400 430px/1 var(--serif);color:#c8e635;transform:translateY(-6px)}</style><b>P</b>"""
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    # capa própria: nome e mariposa empilhados no centro, para sobreviver ao recorte quadrado do Instagram
    pg = b.new_page(viewport={'width': 1200, 'height': 630}, device_scale_factor=2)
    pg.goto('http://localhost:8881/404.html')
    pg.set_content('<!doctype html><link rel="stylesheet" href="http://localhost:8881/assets/css/fontes.css"><link rel="stylesheet" href="http://localhost:8881/assets/css/site.css"><style>html,body{margin:0;background:#0b110e}canvas{display:block;width:1200px;height:630px}</style><canvas id="c" width="2400" height="1260"></canvas>')
    pg.add_script_tag(url='http://localhost:8881/assets/js/vento.js')
    pg.evaluate("""async () => {
      const L = 2, W = 1200, H = 630, LARG = 590, c = document.getElementById('c');
      await document.fonts.load('400 200px Gloock', 'PILHA');
      const j = await (await fetch('/assets/dados/vento.json')).json();
      j.dados = new Uint16Array(await (await fetch('/assets/dados/vento.bin')).arrayBuffer());
      const im = new Image(); im.src = '/assets/img/mariposa.webp'; await im.decode();
      const T = ventoGL(c, j, { mariposa: im, linhas: 17, forca: 1.15, baixo: 0, preserveDrawingBuffer: true });
      const t = document.createElement('canvas'); t.width = W * L; t.height = H * L;
      const x = t.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, t.width, t.height);
      x.font = '400 200px Gloock'; const m = x.measureText('PILHA'), f = 200 * LARG / m.width, cap = m.actualBoundingBoxAscent / 200 * f;
      const mh = LARG / j.a, topo = (H - cap - mh + 26) / 2;
      x.font = (f * L) + 'px Gloock'; x.textAlign = 'center'; x.fillStyle = '#fff'; x.fillText('PILHA', W, (topo + cap) * L);
      T.nome(t);
      T.desenhar(.25, [W, (topo + cap - 26 + mh / 2) * L, mh * L], L, 1);
    }""")
    pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(SITE, '..', '_ref', 'hero', 'og-2x.png'))
    pg.close()
    from PIL import Image
    Image.open(os.path.join(SITE, '..', '_ref', 'hero', 'og-2x.png')).convert('RGB').resize((1200, 630), Image.LANCZOS).save(os.path.join(SITE, 'assets/img/og.jpg'), quality=90)
    for tam, nome in ((180, 'apple-touch-icon.png'), (64, 'favicon.png')):
        pi = b.new_page(viewport={'width': 512, 'height': 512}, device_scale_factor=tam / 512)
        pi.goto('http://localhost:8881/404.html'); pi.set_content(ICONE); pi.evaluate("document.fonts.load('400 200px Gloock', 'P')"); pi.wait_for_timeout(900)
        pi.screenshot(path=os.path.join(SITE, 'assets/img', nome)); pi.close()
    b.close()
