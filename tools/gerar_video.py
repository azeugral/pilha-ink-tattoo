"""Grava assets/js/vento.js quadro a quadro num Edge headless e gera os MP4 do celular e os pôsteres.
Laço sem emenda (12 s). A mariposa é baked no vídeo do topo; o nome fica em HTML por cima.
Uso: python tools/gerar_video.py [pe] [orc]"""
import base64, json, os, subprocess, sys
from playwright.sync_api import sync_playwright
import imageio_ffmpeg

AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
FPS, SEG = 30, 12
V = {'pe': dict(arq='vento-pe', W=1080, H=2040, mar=True, op="{linhas:17,forca:1,baixo:.8}", crf=25),
     'orc': dict(arq='vento-orc', W=720, H=1360, mar=False, op="{linhas:13,forca:1.7,baixo:0}", crf=26)}

def render(b, j, b64, marB64, nome, c):
    W, H = c['W'], c['H']
    mp4 = os.path.join(SITE, 'assets/video', c['arq'] + '.mp4')
    enc = subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'png', '-i', '-',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', str(c['crf']), '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', '-an', mp4], stdin=subprocess.PIPE)
    pg = b.new_page(viewport={'width': 400, 'height': 400})
    pg.set_content('<body style="margin:0;background:#000"><canvas id="c"></canvas></body>')
    pg.add_script_tag(content=open(os.path.join(SITE, 'assets/js/vento.js'), encoding='utf-8').read())
    pg.evaluate("""async ([j,b,W,H,m,o]) => { const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);
        j.dados=new Uint16Array(u.buffer);const c=document.getElementById('c');c.width=W;c.height=H;
        const op=eval('('+o+')');op.preserveDrawingBuffer=true;
        if(m){const im=new Image();im.src='data:image/webp;base64,'+m;await im.decode();op.mariposa=im;}
        window.T=ventoGL(c,j,op); }""", [j, b64, W, H, marB64 if c['mar'] else None, c['op']])
    caixa = [.5 * W, .5 * H, (.9 * W / j['a']) if c['mar'] else .3 * H]
    d = W / 400
    q = FPS * SEG
    for i in range(q):
        png = base64.b64decode(pg.evaluate(f"(T.desenhar({i / q},{json.dumps(caixa)},{d}), document.getElementById('c').toDataURL('image/png'))").split(',', 1)[1])
        if i == 0:
            t = os.path.join(SITE, '..', '_ref', 'hero', c['arq'] + '.png'); open(t, 'wb').write(png)
            from PIL import Image
            Image.open(t).convert('RGB').resize((720, 1360), Image.LANCZOS).save(os.path.join(SITE, 'assets/img', c['arq'] + '.jpg'), quality=80)
        enc.stdin.write(png)
    enc.stdin.close(); enc.wait(); pg.close()
    print(mp4, round(os.path.getsize(mp4) / 1e6, 2), 'MB', flush=True)

if __name__ == '__main__':
    j = json.load(open(os.path.join(SITE, 'assets/dados/vento.json')))
    b64 = base64.b64encode(open(os.path.join(SITE, 'assets/dados/vento.bin'), 'rb').read()).decode()
    mar = base64.b64encode(open(os.path.join(SITE, 'assets/img/mariposa.webp'), 'rb').read()).decode()
    so = set(sys.argv[1:]) or set(V)
    with sync_playwright() as p:
        b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        for k in V:
            if k in so: render(b, j, b64, mar, k, V[k])
        b.close()
