/* Túnel de vento: linhas de corrente reais (escoamento potencial pré-calculado em tools/campo.py) contornando o falcão.
   Sem dependências. Laço perfeito de 12 s, usado ao vivo no desktop e gravado em MP4 para o celular. */
window.ventoGL = function (cv, campo, op) {
  op = op || {};
  var gl = cv.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: !!op.preserveDrawingBuffer });
  if (!gl) return null;
  var vs = '#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var fs = `#version 300 es
  precision highp float; out vec4 cor;
  uniform sampler2D uPsi; uniform vec2 uRes; uniform vec3 uBox; uniform float uT, uLado, uMin, uMax, uAng, uDpr;
  float h1(float n){ return fract(sin(n*12.9898)*43758.5453); }
  void main(){
    vec2 px = vec2(gl_FragCoord.x, uRes.y-gl_FragCoord.y);
    vec2 q = (px-uBox.xy)/uBox.z;
    vec2 d = vec2(cos(uAng), sin(uAng)), n = vec2(-d.y, d.x);
    vec2 uv = q/uLado+.5;
    float psi = dot(q,n);
    if (uv.x>0.&&uv.x<1.&&uv.y>0.&&uv.y<1.) psi = mix(uMin,uMax,texture(uPsi,uv).r);
    float N = 34., v = psi*N, id = floor(v+.5);
    float fw = max(length(vec2(dFdx(v),dFdy(v))),1e-4);
    float dist = abs(fract(v+.5)-.5)/fw;
    float w = .55*uDpr;
    float linha = 1.-smoothstep(w-.5,w+.8,dist);
    linha *= 1.-smoothstep(.22,.55,fw);
    float a = h1(id*1.37), b = h1(id*3.11+2.), c = h1(id*7.77+5.);
    float along = dot(q,d);
    float K = .32+.26*floor(a*3.);
    float vel = 1.+floor(b*3.);
    float ph = fract(along*K-uT*vel+c);
    float risco = smoothstep(0.,.012,ph)*pow(1.-ph,9.);
    float base = .055+.075*a*a;
    float perto = exp(-dot(q,q)*.62);
    float mata = smoothstep(2.6,.5,length(q*vec2(.62,1.)));
    float luz = linha*(base*(.55+.9*perto)*mata + risco*(.34+.8*perto));
    vec3 osso = vec3(.91,.89,.84), verde = vec3(.78,.90,.21), fundo = vec3(.043,.067,.055);
    vec3 fim = fundo+osso*luz*.95+verde*linha*risco*pow(1.-ph,14.)*1.25*(.3+perto);
    float g = fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));
    cor = vec4(fim+(g-.5)/255.,1.);
  }`;
  function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; }
  var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  var bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
  var N = campo.n, f32 = new Float32Array(N * N); for (var i = 0; i < f32.length; i++) f32[i] = campo.dados[i] / 65535;
  var tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  var lin = gl.getExtension('OES_texture_float_linear');
  gl.texImage2D(gl.TEXTURE_2D, 0, lin ? gl.R32F : gl.R16F, N, N, 0, gl.RED, gl.FLOAT, f32);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  var u = {}; ['uRes', 'uBox', 'uT', 'uLado', 'uMin', 'uMax', 'uAng', 'uDpr'].forEach(function (k) { u[k] = gl.getUniformLocation(pr, k); });
  gl.uniform1f(u.uLado, campo.lado); gl.uniform1f(u.uMin, campo.min); gl.uniform1f(u.uMax, campo.max); gl.uniform1f(u.uAng, campo.ang * Math.PI / 180);
  return {
    desenhar: function (t, caixa, dpr) {
      gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(u.uRes, cv.width, cv.height);
      gl.uniform3f(u.uBox, caixa[0], caixa[1], caixa[2]); gl.uniform1f(u.uT, t); gl.uniform1f(u.uDpr, dpr || 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  };
};
