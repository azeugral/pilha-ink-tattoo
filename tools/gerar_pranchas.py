import sys,os,re,json
from PIL import Image
AQUI=os.path.dirname(os.path.abspath(__file__));SITE=os.path.dirname(AQUI);REF=os.path.join(SITE,'..','_ref')
sys.path.insert(0,AQUI);sys.path.insert(0,os.path.join(REF,'hero'))
os.chdir(REF)
import pranchas as P
from catalogo import C
ang={m[0]:float(m[1]) for m in re.findall(r'^(\d{3})_0 \((-?[\d.]+),',open('pranchas.log',encoding='utf-8').read(),re.M)}
so=set(sys.argv[1:])
os.makedirs(os.path.join(SITE,'assets/img/prancha'),exist_ok=True);os.makedirs(os.path.join(SITE,'assets/img/pele'),exist_ok=True)
for c in C:
    i,_,_,_,d=c
    if so and i not in so: continue
    a=ang.get(i,0)+d
    if i=='382': a=0
    r=P.prancha(f'ig/{i}_0.jpg',os.path.join(SITE,f'assets/img/prancha/{i}.webp'),ang=a,W=800,H=1000)
    im=Image.open(f'ig/{i}_0.jpg').convert('RGB');im.thumbnail((1500,1500),Image.LANCZOS)
    im.save(os.path.join(SITE,f'assets/img/pele/{i}.webp'),'WEBP',quality=84,method=5)
    print(i,r,flush=True)
