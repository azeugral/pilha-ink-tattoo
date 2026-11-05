/* Túnel de vento: linhas de corrente reais (escoamento potencial em tools/campo.py) contornando a mariposa do peito, que fica parada.
   Tudo simétrico no eixo: a textura guarda só a metade direita e o campo é espelhado. Sem dependências.
   Laço perfeito de 12 s, ao vivo no computador e gravado em MP4 no celular.
   op: { mariposa: Image|null, linhas: nº de linhas por altura da caixa, forca: brilho das linhas, preserveDrawingBuffer } */
window.ventoGL = function (cv, campo, op) {
  op = op || {};
  var gl = cv.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: !!op.preserveDrawingBuffer });
  if (!gl) return null;
  var vs = '#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var fs = `#version 300 es
  precision highp float; out vec4 cor;
  uniform sampler2D uPsi, uMar, uNome;
  uniform vec2 uRes; uniform vec3 uBox;
  uniform float uT, uLado, uMin, uMax, uDpr, uA, uB, uAbre, uTemMar, uTemNome, uLinhas, uForca, uBaixo;
  float h1(float n){ return fract(sin(n*12.9898)*43758.5453); }
  float h2(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(h2(i),h2(i+vec2(1.,0.)),f.x),mix(h2(i+vec2(0.,1.)),h2(i+vec2(1.,1.)),f.x),f.y); }
  void main(){
    vec2 px = vec2(gl_FragCoord.x, uRes.y-gl_FragCoord.y);
    vec2 q = (px-uBox.xy)/uBox.z;
    q.x = abs(q.x);                                  /* simetria perfeita */
    vec2 uv = vec2(q.x,q.y)/uLado+.5;
    float psi = -q.x;
    if (uv.x>0.&&uv.x<1.&&uv.y>0.&&uv.y<1.) psi = mix(uMin,uMax,texture(uPsi,uv).r);
    float v = psi*uLinhas, id = floor(v+.5);
    float fw = max(length(vec2(dFdx(v),dFdy(v))),1e-4);
    float dist = abs(fract(v+.5)-.5)/fw;
    float w = .55*uDpr;
    float linha = 1.-smoothstep(w-.5,w+.8,dist);
    linha *= (1.-smoothstep(.22,.55,fw))*step(.5,abs(id));
    float a = h1(abs(id)*1.37), b = h1(abs(id)*3.11+2.), c = h1(abs(id)*7.77+5.);
    float K = .16+.14*floor(a*3.);
    float vel = 1.+floor(b*3.);
    float ph = fract(q.y*K*-1.+uT*vel*-1.+c+ 40.);
    float risco = smoothstep(0.,.012,ph)*pow(1.-ph,9.);
    float base = .06+.09*a*a;
    vec2 e = q/vec2(uA*.72,1.);
    float perto = exp(-dot(e,e)*.5);
    float luz = linha*(base*(.6+.9*perto) + risco*(.36+.7*perto))*uForca;
    float baixo = (1.-uBaixo*smoothstep(.55,.92,px.y/uRes.y))*mix(1.,smoothstep(50.*uDpr,110.*uDpr,px.y),step(.01,uBaixo));
    luz *= baixo;
    vec3 osso = vec3(.914,.894,.839), verde = vec3(.784,.902,.208), fundo = vec3(.043,.067,.055), tinta = vec3(.051,.059,.047);
    vec3 fim = fundo+osso*luz*.95+verde*linha*risco*pow(1.-ph,14.)*1.2*(.3+perto)*uForca*baixo;
    float nome = 0.;
    if (uTemNome>.5) { nome = texture(uNome, px/uRes).r; fim = mix(fim, verde, nome); }
    if (uTemMar>.5) {
      /* a arte se forma uma vez: primeiro o traço claro sai do corpo para as pontas,
         depois o preenchimento vem por trás e o traço vira tinta. Com uAbre = 1 a imagem é a original, parada. */
      float hw = uA*.5;
      vec2 m = vec2(q.x/hw, q.y+.5);
      if (m.x>=0.&&m.x<=1.&&m.y>=0.&&m.y<=1.) {
        vec4 t = texture(uMar, m);
        float d = clamp(length(vec2(q.x, q.y+.04))/length(vec2(hw,.5)), 0., 1.);
        float n = vn(q*9.)*.6+vn(q*23.)*.4;
        float tr = smoothstep(0., .05, uAbre*1.08-(d*.55+n*.08));
        float pr = smoothstep(0., .07, uAbre*1.08-(.42+d*.5+n*.08));
        vec3 mem = mix(osso, verde, nome*smoothstep(uB*.85,uB*1.05,q.x/hw));
        fim = mix(fim, mem, t.a*pr);
        fim = mix(fim, mix(osso, tinta, pr), (1.-t.r)*t.a*tr);
      }
    }
    float g = fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));
    cor = vec4(fim+(g-.5)/255.,1.);
  }`;
  function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; }
  var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  var bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
  var u = {}; ['uRes', 'uBox', 'uT', 'uLado', 'uMin', 'uMax', 'uDpr', 'uA', 'uB', 'uAbre', 'uTemMar', 'uTemNome', 'uLinhas', 'uForca', 'uBaixo', 'uPsi', 'uMar', 'uNome'].forEach(function (k) { u[k] = gl.getUniformLocation(pr, k); });
  function tx(un, f) {
    var t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + un); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    f(); return t;
  }
  var N = campo.n, f32 = new Float32Array(N * N); for (var i = 0; i < f32.length; i++) f32[i] = campo.dados[i] / 65535;
  var lin = gl.getExtension('OES_texture_float_linear');
  tx(0, function () {
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, N, N, 0, gl.RED, gl.FLOAT, f32);
    var fl = lin ? gl.LINEAR : gl.NEAREST; gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, fl); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, fl);
  });
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
  if (op.mariposa) {
    tx(1, function () {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, op.mariposa);
      gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    });
  }
  var txNome = tx(2, function () { gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 1, 1, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array([0])); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); });
  gl.uniform1i(u.uPsi, 0); gl.uniform1i(u.uMar, 1); gl.uniform1i(u.uNome, 2);
  gl.uniform1f(u.uLado, campo.lado); gl.uniform1f(u.uMin, campo.min); gl.uniform1f(u.uMax, campo.max);
  gl.uniform1f(u.uA, campo.a); gl.uniform1f(u.uB, campo.b); gl.uniform1f(u.uTemMar, op.mariposa ? 1 : 0); gl.uniform1f(u.uTemNome, 0);
  gl.uniform1f(u.uLinhas, op.linhas || 20); gl.uniform1f(u.uForca, op.forca || 1); gl.uniform1f(u.uBaixo, op.baixo === undefined ? .85 : op.baixo);
  return {
    /* tela de 2D com o nome em branco, do mesmo tamanho do canvas */
    nome: function (tela) {
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, txNome);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tela);
      gl.uniform1f(u.uTemNome, 1);
    },
    /* t em ciclos (0 a 1 = 12 s), caixa = [cx, cy, altura] em px do canvas, abre = 0 a 1 (arte formada) */
    desenhar: function (t, caixa, dpr, abre) {
      gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(u.uRes, cv.width, cv.height);
      gl.uniform3f(u.uBox, caixa[0], caixa[1], caixa[2]); gl.uniform1f(u.uT, t); gl.uniform1f(u.uDpr, dpr || 1);
      gl.uniform1f(u.uAbre, abre === undefined ? 1 : abre);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  };
};
