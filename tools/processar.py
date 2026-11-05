"""Fotos do site: recorta 4:5 (x0,x1,y0,y1 em fração), amplia com Real-ESRGAN as de story em baixa e salva WebP."""
import os,subprocess,sys
from PIL import Image,ImageOps
AQUI=os.path.dirname(os.path.abspath(__file__));SITE=os.path.dirname(AQUI);REF=os.path.join(SITE,'..','_ref')
ESR=os.path.join(SITE,'..','..','_ferramentas','realesrgan','realesrgan-ncnn-vulkan.exe')
TMP=os.path.join(REF,'tmp_esr');os.makedirs(TMP,exist_ok=True)
OUT=os.path.join(SITE,'assets','img','foto');os.makedirs(OUT,exist_ok=True)
# nome, origem, recorte(x0,x1,y0,y1) ou None, proporção (w/h), largura final
L=[
('asas','ig/000_0.jpg',None,4/5,1200),('deuses','ig/010_1.jpg',None,4/5,1200),('crisantemo','ig/012_0.jpg',None,4/5,1200),('braco','ig/122_0.jpg',None,4/5,1200),
('atena','ig/010_0.jpg',None,4/5,1200),('viuva','ig/014_0.jpg',None,4/5,1200),
('c1-antes','hl/coverup/060.jpg',(0,1,.26,.96),4/5,900),('c1-depois','hl/coverup/067.jpg',(0,1,.12,.82),4/5,900),
('c2-antes','hl/coverup/034.jpg',(.26,1,.0,.47),4/5,900),('c2-depois','hl/coverup/034.jpg',(.02,.74,.50,.97),4/5,900),
('c3-antes','hl/coverup/050.jpg',(0,.62,.04,.48),4/5,900),('c3-depois','hl/coverup/051.jpg',(.30,1,.02,.52),4/5,900),
('f1-a','hl/freehand/008.jpg',(.1,.95,.05,.65),4/5,800),('f1-b','hl/freehand/010.jpg',(.05,.9,.15,.75),4/5,800),
('f2-a','hl/freehand/012.jpg',(.1,.95,.08,.68),4/5,800),('f2-b','hl/freehand/014.jpg',(.1,.95,.15,.75),4/5,800),
('f3-a','hl/freehand/023.jpg',(.2,.95,.05,.58),4/5,800),('f3-b','hl/freehand/026.jpg',(.05,.9,.12,.72),4/5,800),
('h1','hl/cicatrizadas/012.jpg',(0,1,.27,.97),4/5,800),('h2','hl/cicatrizadas/041.jpg',(0,1,.28,.98),4/5,800),('h3','hl/cicatrizadas/042.jpg',(0,1,.1,.8),4/5,800),('h4','hl/cicatrizadas/008.jpg',(0,1,.22,.92),4/5,800),
('retrato','ig/164_0.jpg',None,4/5,1200),('caes','ig/006_0.jpg',None,4/5,1100),('estudio','ig/293_0.jpg',None,4/5,1200),
('agua','ig/224_0.jpg',None,4/5,1000),('terra','ig/405_0.jpg',None,4/5,1000),('asfalto','ig/028_0.jpg',None,4/5,1000),('pista','ig/009_0.jpg',None,4/5,1000),
('aula1','hl/meucurso/047.jpg',None,4/5,900),('aula2','hl/meucurso/095.jpg',None,4/5,900),('aula3','hl/meucurso/096.jpg',None,4/5,900),('aula4','hl/meucurso/062.jpg',None,4/5,900),('aula5','hl/meucurso/079.jpg',None,4/5,900),
]
so=set(sys.argv[1:])
fontes={o for n,o,*_ in L}
aux={}
for o in fontes:
    im=Image.open(os.path.join(REF,o))
    if im.width<1000:
        dest=os.path.join(TMP,o.replace('/','_')[:-4]+'.png')
        if not os.path.exists(dest): subprocess.run([ESR,'-i',os.path.join(REF,o),'-o',dest,'-n','realesrgan-x4plus','-s','4'],capture_output=True)
        aux[o]=dest
for n,o,c,ar,lw in L:
    if so and n not in so: continue
    im=Image.open(aux.get(o,os.path.join(REF,o))).convert('RGB');W,H=im.size
    if c:
        x0,x1,y0,y1=c;im=im.crop((int(x0*W),int(y0*H),int(x1*W),int(y1*H)))
    im=ImageOps.fit(im,(lw,int(lw/ar)),Image.LANCZOS,centering=(.5,.5))
    im.save(os.path.join(OUT,n+'.webp'),'WEBP',quality=82,method=5);print(n,os.path.getsize(os.path.join(OUT,n+'.webp'))//1024,flush=True)
