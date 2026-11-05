"""Campo de vento do hero: resolve o escoamento potencial (Laplace, função de corrente) em volta da silhueta do falcão.
Domínio = quadrado de lado 3x a altura da caixa do falcão (caixa 4:5), centrado nela. Saída: Uint16 (assets/dados/vento.bin)."""
import numpy as np,cv2,json,os
from scipy.sparse import lil_matrix,csr_matrix
from scipy.sparse.linalg import spsolve
AQUI=os.path.dirname(os.path.abspath(__file__));REF=os.path.join(AQUI,'..','..','_ref','hero')
N=420                      # resolução
LADO=3.0                   # lado do domínio em alturas da caixa
m=cv2.imread(os.path.join(REF,'fill-mask.png'),0)
H=int(N/LADO);W=int(H*.8)
mp=cv2.resize(m,(W,H),interpolation=cv2.INTER_AREA)
M=np.zeros((N,N),np.uint8);x0=(N-W)//2;y0=(N-H)//2;M[y0:y0+H,x0:x0+W]=(mp>110)*255
M=cv2.morphologyEx(M,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
M=cv2.dilate(M,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7)))
M=cv2.GaussianBlur(M,(0,0),1.2)>127
# vento sopra do bico para a ponta da asa (o falcão mergulha para baixo-esquerda)
ang=np.radians(-64);dx,dy=np.cos(ang),np.sin(ang);nx,ny=-dy,dx
ys,xs=np.mgrid[0:N,0:N];u=(xs-N/2)/N*LADO;v=(ys-N/2)/N*LADO   # em alturas da caixa
inf=u*nx+v*ny
c=float(np.mean(inf[M]))
idx=-np.ones((N,N),np.int64);livre=(~M);livre[0,:]=livre[-1,:]=livre[:,0]=livre[:,-1]=False
idx[livre]=np.arange(livre.sum());n=int(livre.sum())
from scipy.sparse import coo_matrix
I=[];J=[];V=[];b=np.zeros(n)
yy,xx=np.nonzero(livre)
for y,x in zip(yy,xx):
    k=idx[y,x];I.append(k);J.append(k);V.append(4.)
    for a,e in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
        if idx[a,e]>=0:I.append(k);J.append(idx[a,e]);V.append(-1.)
        else:b[k]+= c if M[a,e] else inf[a,e]
A=csr_matrix(coo_matrix((V,(I,J)),shape=(n,n)))
s=spsolve(A,b)
psi=inf.copy();psi[M]=c;psi[livre]=s
print(psi.min(),psi.max(),c)
mn,mx=float(psi.min()),float(psi.max())
q=np.round((psi-mn)/(mx-mn)*65535).astype(np.uint16)
q.tofile(os.path.join(AQUI,'..','assets','dados','vento.bin'))
json.dump({'n':N,'lado':LADO,'min':mn,'max':mx,'ang':-64,'c':c},open(os.path.join(AQUI,'..','assets','dados','vento.json'),'w'))
cv2.imwrite(os.path.join(REF,'psi.png'),((np.sin(psi*90)*.5+.5)*255).astype(np.uint8))
