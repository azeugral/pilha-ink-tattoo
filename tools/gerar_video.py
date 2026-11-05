"""Grava assets/js/vento.js quadro a quadro num Edge headless e gera o MP4 do celular e o pôster.
O laço fecha sem emenda (t de 0 a 1 em 12 s). A caixa do falcão bate com .palco .falcao do CSS do celular.
Uso: python tools/gerar_video.py"""
import base64, json, os, struct, subprocess
from playwright.sync_api import sync_playwright
import imageio_ffmpeg

AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
W, H, FPS, SEG = 1080, 2040, 30, 12
CX, TOPO, ALT = .51, .19, .58  # .palco .falcao no celular

def main():
    os.makedirs(os.path.join(SITE, 'assets/video'), exist_ok=True)
    mp4 = os.path.join(SITE, 'assets/video/vento-pe.mp4')
    j = json.load(open(os.path.join(SITE, 'assets/dados/vento.json')))
    b64 = base64.b64encode(open(os.path.join(SITE, 'assets/dados/vento.bin'), 'rb').read()).decode()
    enc = subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'png', '-i', '-',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', '-an', mp4], stdin=subprocess.PIPE)
    with sync_playwright() as p:
        b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = b.new_page(viewport={'width': 400, 'height': 400})
        pg.set_content('<body style="margin:0;background:#000"><canvas id="c"></canvas></body>')
        pg.add_script_tag(content=open(os.path.join(SITE, 'assets/js/vento.js'), encoding='utf-8').read())
        pg.evaluate("""([j,b,W,H]) => { const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);
            j.dados=new Uint16Array(u.buffer);const c=document.getElementById('c');c.width=W;c.height=H;
            window.T=ventoGL(c,j,{preserveDrawingBuffer:true}); }""", [j, b64, W, H])
        caixa = [CX * W, (TOPO + ALT / 2) * H, ALT * H]
        q = FPS * SEG
        for i in range(q):
            png = base64.b64decode(pg.evaluate(f"(T.desenhar({i / q},{json.dumps(caixa)},{W / 400}), document.getElementById('c').toDataURL('image/png'))").split(',', 1)[1])
            if i == 36: open(os.path.join(SITE, '..', '_ref', 'hero', 'vento-pe.png'), 'wb').write(png)
            enc.stdin.write(png)
            if i % 60 == 0: print(i, flush=True)
        b.close()
    enc.stdin.close(); enc.wait()
    from PIL import Image
    im = Image.open(os.path.join(SITE, '..', '_ref', 'hero', 'vento-pe.png')).convert('RGB').resize((720, 1360), Image.LANCZOS)
    im.save(os.path.join(SITE, 'assets/img/vento-pe.jpg'), quality=82)
    print(mp4, round(os.path.getsize(mp4) / 1e6, 2), 'MB')

main()
