"""Campo de vento: escoamento potencial (Laplace, função de corrente) em volta da silhueta da mariposa, simétrico no eixo.
Domínio = quadrado de lado LADO alturas da caixa da mariposa, centrado nela. Saída: assets/dados/vento.bin + vento.json."""
import numpy as np,cv2,json,os
from scipy.sparse import coo_matrix
from scipy.sparse.linalg import spsolve
AQUI=os.path.dirname(os.path.abspath(__file__));REF=os.path.join(AQUI,'..','..','_ref','hero')
N=560;LADO=7.0
m=cv2.imread(os.path.join(REF,'mar-mask.png'),0);A=json.load(open(os.path.join(REF,'mar.json')))['a']
H=int(N/LADO);W=int(H*A)
mp=cv2.resize(m,(W,H),interpolation=cv2.INTER_AREA)
M=np.zeros((N,N),np.uint8);x0=(N-W)//2;y0=(N-H)//2;M[y0:y0+H,x0:x0+W]=(mp>110)*255
M=M|M[:,::-1]
M=cv2.morphologyEx(M,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(11,11)))
M=cv2.dilate(M,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5)))>127
ys,xs=np.mgrid[0:N,0:N];u=(xs-(N-1)/2)/N*LADO
inf=-u;c=0.0                                     # vento vertical, a mariposa voa contra ele
idx=-np.ones((N,N),np.int64);livre=(~M);livre[0,:]=livre[-1,:]=livre[:,0]=livre[:,-1]=False
idx[livre]=np.arange(livre.sum());n=int(livre.sum())
I=[];J=[];V=[];b=np.zeros(n)
yy,xx=np.nonzero(livre)
for y,x in zip(yy,xx):
    k=idx[y,x];I.append(k);J.append(k);V.append(4.)
    for a,e in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
        if idx[a,e]>=0:I.append(k);J.append(idx[a,e]);V.append(-1.)
        else:b[k]+= c if M[a,e] else inf[a,e]
s=spsolve(coo_matrix((V,(I,J)),shape=(n,n)).tocsr(),b)
psi=inf.copy();psi[M]=c;psi[livre]=s
psi=(psi-psi[:,::-1])/2
psi=cv2.GaussianBlur(psi.astype(np.float32),(0,0),2.2).astype(np.float64)
psi=(psi-psi[:,::-1])/2
mn,mx=float(psi.min()),float(psi.max());print(mn,mx)
np.round((psi-mn)/(mx-mn)*65535).astype(np.uint16).tofile(os.path.join(AQUI,'..','assets','dados','vento.bin'))
json.dump({'n':N,'lado':LADO,'min':mn,'max':mx,'a':A,'b':.19},open(os.path.join(AQUI,'..','assets','dados','vento.json'),'w'))
