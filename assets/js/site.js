(function () {
  'use strict';
  var d = document, raiz = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var WA = '5521997426185';
  var calmo = matchMedia('(prefers-reduced-motion: reduce)');
  var celular = matchMedia('(max-width: 767px) and (orientation: portrait)');
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) raiz.classList.add('ponteiro');

  /* entrada do topo */
  var pronto = function () { raiz.classList.add('pronto'); };
  var fontes = d.fonts && d.fonts.load ? d.fonts.load('400 100px Gloock', 'PILHA') : Promise.resolve();
  Promise.race([fontes, new Promise(function (r) { setTimeout(r, 1400); })]).then(pronto);

  /* menu */
  var topo = $('#topo'), nav = $('#nav'), mb = $('#menu-btn');
  function menu(abrir) {
    nav.classList.toggle('aberto', abrir); topo.classList.toggle('menu-aberto', abrir);
    mb.setAttribute('aria-expanded', abrir); mb.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    d.body.style.overflow = abrir ? 'hidden' : '';
  }
  mb.addEventListener('click', function () { menu(!nav.classList.contains('aberto')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) menu(false); });
  addEventListener('resize', function () { if (innerWidth > 1020) menu(false); });

  /* topo sólido */
  var orc = $('#orcamento');
  function aoRolar() { topo.classList.toggle('rolou', scrollY > 24); }
  addEventListener('scroll', aoRolar, { passive: true }); aoRolar();

  /* entradas */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });
  $$('.entra').forEach(function (el) { io.observe(el); });

  /* laço que só roda com o elemento na tela */
  function laco(el, passo) {
    var vis = false, id = null, ligado = false;
    function q(ms) { id = null; if (!ligado || !vis || d.hidden) return; passo(ms); id = requestAnimationFrame(q); }
    function tenta() { if (ligado && vis && !d.hidden && !id) id = requestAnimationFrame(q); }
    new IntersectionObserver(function (e) { vis = e[0].isIntersecting; tenta(); }).observe(el);
    d.addEventListener('visibilitychange', tenta);
    return { liga: function () { ligado = true; tenta(); }, desliga: function () { ligado = false; } };
  }
  function videoNaTela(v) {
    new IntersectionObserver(function (e) {
      if (v.hidden || calmo.matches) return;
      if (e[0].isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
    }).observe(v);
  }

  /* a pilha do menu carrega conforme a página desce e fecha cheia no fim */
  var bat = $('#bateria'), rc = $('#carga'), MIN = .14, alvo = MIN, nivel = 0, gira = 0;
  function poeCarga(n) {
    var h = 47.5 * n;
    rc.setAttribute('y', (54 - h).toFixed(2)); rc.setAttribute('height', (h + 2).toFixed(2));
    bat.classList.toggle('cheia', n > .995);
  }
  function passoCarga() {
    nivel += (alvo - nivel) * .14;
    if (Math.abs(alvo - nivel) < .002) { nivel = alvo; gira = 0; poeCarga(nivel); return; }
    poeCarga(nivel); gira = requestAnimationFrame(passoCarga);
  }
  function medeCarga() {
    var f = Math.max(1, d.documentElement.scrollHeight - innerHeight);
    alvo = MIN + (1 - MIN) * Math.min(1, Math.max(0, scrollY / f));
    if (calmo.matches) { nivel = alvo; poeCarga(nivel); }
    else if (!gira) gira = requestAnimationFrame(passoCarga);
  }
  addEventListener('scroll', medeCarga, { passive: true });
  addEventListener('resize', medeCarga);
  medeCarga();

  /* vento: o campo é um só para o topo e para o orçamento */
  var cv = $('#vento'), vid = $('#vento-v'), vf = $('#vento-f'), formou = false, hero = $('.hero'), reserva = $('#mar-reserva');
  var cvO = $('#vento-o'), vidO = $('#vento-ov');
  var campoP = null;
  function campo() {
    if (!campoP) campoP = fetch('assets/dados/vento.json').then(function (r) { return r.json(); }).then(function (j) {
      return fetch('assets/dados/vento.bin').then(function (r) { return r.arrayBuffer(); }).then(function (b) { j.dados = new Uint16Array(b); return j; });
    });
    return campoP;
  }
  function semGl() {
    raiz.classList.remove('gl');
    if (!reserva.getAttribute('src')) reserva.src = 'assets/img/mariposa-inteira.webp';
    reserva.hidden = false;
  }
  var mar = null, glH = null, cmp = null, dpr = 1, bx = null, t0 = 0, somaT = 0, nT = 0, ultT = 0;
  function medeHero() {
    var r = hero.getBoundingClientRect(), w = r.width, h = r.height;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    var bh = Math.min(h * .64, w * .76 / cmp.a);
    var cy = Math.max(82, h * .105) + h * .29;
    /* a mariposa nunca encosta no texto: em tela baixa ela cede */
    bh = Math.min(bh, 2 * (hero.querySelector('.hero-txt').getBoundingClientRect().top - r.top - 10 - cy));
    bx = [w / 2 * dpr, cy * dpr, bh * dpr];
    /* o nome entra no shader para aparecer através da asa */
    var c = d.createElement('canvas'); c.width = cv.width; c.height = cv.height;
    var x = c.getContext('2d');
    x.font = '400 200px Gloock, Georgia, serif';
    var m = x.measureText('PILHA'), f = 200 * (w * .965) / m.width;
    var cap = m.actualBoundingBoxAscent / 200 * f, lim = h * .46;
    if (cap > lim) { f *= lim / cap; cap = lim; }
    x.font = '400 ' + (f * dpr) + 'px Gloock, Georgia, serif';
    /* fundo preto opaco: sem ele a suavização das bordas se perde ao virar textura */
    x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height);
    x.textAlign = 'center'; x.fillStyle = '#fff';
    x.fillText('PILHA', c.width / 2, (Math.max(82, h * .105) + cap) * dpr);
    glH.nome(c);
  }
  var forma = 0, FORMA_MS = 2400, suave = function (p) { return 1 - (1 - p) * (1 - p); };
  var lacoH = laco(hero, function (ms) {
    if (ultT) {
      somaT += ms - ultT; nT++;
      if (nT === 50) { if (somaT / nT > 24 && dpr > 1) { dpr = Math.max(1, dpr * .75); medeHero(); } somaT = 0; nT = 0; }
    }
    ultT = ms;
    if (!t0) t0 = ms;
    forma = suave(Math.max(0, Math.min(1, (ms - t0 - 150) / FORMA_MS)));
    glH.desenhar((ms / 12000) % 1, bx, dpr, forma);
  });
  function usarVideo() {
    lacoH.desliga(); cv.classList.remove('on'); raiz.classList.remove('gl'); reserva.hidden = true;
    if (!vid.getAttribute('src')) vid.src = 'assets/video/vento-pe.mp4';
    /* a arte se forma uma vez num vídeo curto; depois segue o laço, que começa no mesmo instante do vento */
    if (formou || calmo.matches) return mostraLaco();
    vid.hidden = true; vid.load();
    vf.hidden = false; vf.classList.add('on');
    if (!vf.getAttribute('src')) vf.src = 'assets/video/vento-forma.mp4';
    var p = vf.play();
    if (p && p.catch) p.catch(mostraLaco);
  }
  function mostraLaco() {
    formou = true;
    vid.hidden = false; vid.classList.add('on');
    if (calmo.matches) { vf.hidden = true; return; }
    var p = vid.play();
    if (p && p.catch) p.catch(function () { vf.hidden = true; });
  }
  vf.addEventListener('ended', mostraLaco);
  vf.addEventListener('error', mostraLaco);
  vid.addEventListener('playing', function () { vf.pause(); vf.hidden = true; vf.classList.remove('on'); });
  function usarShader() {
    vid.hidden = true; vid.pause(); vf.hidden = true; vf.pause();
    var im = new Image(); im.src = 'assets/img/mariposa.webp';
    Promise.all([campo(), im.decode(), fontes]).then(function (r) {
      if (celular.matches) return;
      cmp = r[0];
      if (!glH) { mar = im; glH = window.ventoGL(cv, cmp, { mariposa: mar, linhas: 20, forca: 1 }); }
      if (!glH) return semGl();
      var toque = matchMedia('(pointer: coarse)').matches;
      dpr = Math.min(devicePixelRatio || 1, toque ? 1.5 : 2);
      medeHero(); raiz.classList.add('gl'); cv.classList.add('on');
      var parado = calmo.matches || (toque && innerHeight < 500);
      forma = parado ? 1 : 0;
      glH.desenhar(.25, bx, dpr, forma);
      if (parado) return;
      t0 = 0; lacoH.liga();
    }).catch(semGl);
  }
  /* mesmo vento atrás do orçamento */
  var glO = null, bxO = null, dprO = 1;
  function medeOrc() {
    var r = orc.getBoundingClientRect();
    cvO.width = Math.round(r.width * dprO); cvO.height = Math.round(r.height * dprO);
    bxO = [r.width / 2 * dprO, r.height / 2 * dprO, Math.min(r.height * .62, r.width * .8 / cmpO.a) * dprO];
    if (glO) glO.desenhar((performance.now() / 12000) % 1, bxO, dprO, 1);
  }
  var cmpO = null;
  var lacoO = laco(orc, function (ms) { glO.desenhar((ms / 12000) % 1, bxO, dprO, 1); });
  function orcFundo() {
    if (celular.matches) {
      lacoO.desliga(); cvO.hidden = true; vidO.hidden = false;
      if (!vidO.getAttribute('src')) vidO.src = 'assets/video/vento-orc.mp4';
      return;
    }
    vidO.hidden = true; vidO.pause(); cvO.hidden = false;
    campo().then(function (c) {
      cmpO = c;
      if (!glO) glO = window.ventoGL(cvO, c, { linhas: 11, forca: 1.5, baixo: 0 });
      if (!glO) return;
      dprO = Math.min(devicePixelRatio || 1, 1.5);
      medeOrc();
      if (!calmo.matches) lacoO.liga();
    }).catch(function () {});
  }
  videoNaTela(vidO); videoNaTela(vid);
  function escolher() { if (celular.matches) usarVideo(); else usarShader(); orcFundo(); }
  escolher();
  celular.addEventListener('change', escolher);
  var rz;
  addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      if (celular.matches) return;
      if (glH && cmp) { medeHero(); glH.desenhar(.25, bx, dpr, forma); }
      if (glO) medeOrc();
    }, 120);
  });
  if (window.ResizeObserver) new ResizeObserver(function () { if (glO && !celular.matches) medeOrc(); }).observe(orc);

  /* vídeo da história: mudo com legenda, som por escolha */
  var hv = $('#hist-v'), som = $('#som'), lv = $('#leg-video'), segs = null, sI = -1;
  /* toca mudo, com legenda, só quando chega na seção */
  var comSom = false;
  function tocaHist() { var p = hv.play(); if (p && p.catch) p.catch(function () {}); }
  new IntersectionObserver(function (e) {
    if (e[0].isIntersecting) { if (hv.preload === 'none') hv.preload = 'auto'; if (!calmo.matches || comSom) tocaHist(); }
    else hv.pause();
  }, { threshold: .35 }).observe(hv);
  fetch('assets/dados/historia.json').then(function (r) { return r.json(); }).then(function (j) { segs = j; }).catch(function () {});
  hv.addEventListener('timeupdate', function () {
    if (!segs) return;
    var t = hv.currentTime, k = -1;
    for (var i = 0; i < segs.length; i++) if (t >= segs[i][0] && t < segs[i + 1 < segs.length ? i + 1 : i][0] + (i + 1 < segs.length ? 0 : 3)) { k = i; break; }
    if (k === sI) return; sI = k;
    lv.textContent = '';
    if (k >= 0) { var sp = d.createElement('span'); sp.textContent = segs[k][2]; lv.appendChild(sp); }
  });
  function semSom() {
    comSom = false; hv.muted = true; hv.loop = true;
    som.setAttribute('aria-pressed', 'false'); $('span', som).textContent = 'Ouvir com som';
  }
  /* ligar o som sempre recomeça do início; ao terminar, volta a tocar mudo */
  function alternaSom() {
    if (comSom) return semSom();
    comSom = true; hv.muted = false; hv.currentTime = 0; hv.loop = false; tocaHist();
    som.setAttribute('aria-pressed', 'true'); $('span', som).textContent = 'Tirar o som';
  }
  hv.addEventListener('ended', function () { semSom(); tocaHist(); });
  som.addEventListener('click', alternaSom);

  /* manifesto: as palavras escurecem com a rolagem */
  var man = $('#manifesto'), pals = $$('.pl', man);
  function manifesto() {
    var r = man.getBoundingClientRect(), h = innerHeight;
    var p = (h * .86 - r.top) / (r.height + h * .34);
    var n = Math.round(p * pals.length);
    pals.forEach(function (w, i) { w.classList.toggle('on', i < n); });
  }

  addEventListener('scroll', function () { requestAnimationFrame(manifesto); }, { passive: true });
  manifesto();

  /* coleção */
  var todos = $$('.esp'), filtros = $$('.filtros button'), maisB = $('#ver-mais'), filtro = 'todos', tudo = false;
  function limite() { return innerWidth <= 767 ? 12 : innerWidth <= 1180 ? 16 : 18; }
  function aplicar() {
    var n = 0, lim = limite();
    todos.forEach(function (el) {
      var cabe = filtro === 'todos' || el.dataset.g === filtro;
      if (cabe) n++;
      el.hidden = !cabe || (filtro === 'todos' && !tudo && n > lim);
    });
    maisB.parentNode.hidden = !(filtro === 'todos' && !tudo && n > lim);
  }
  filtros.forEach(function (b) {
    b.addEventListener('click', function () {
      filtro = b.dataset.f;
      filtros.forEach(function (o) { o.setAttribute('aria-pressed', o === b); });
      aplicar();
    });
  });
  maisB.addEventListener('click', function () {
    var prox = todos.filter(function (el) { return el.hidden; })[0];
    tudo = true; aplicar();
    if (prox) prox.focus({ preventScroll: true });
  });
  aplicar();
  var uw = innerWidth;
  addEventListener('resize', function () { if (innerWidth !== uw) { uw = innerWidth; aplicar(); } });
  /* a miniatura da pele carrega perto da tela, para a troca ser imediata */
  var ioP = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var im = $('.pele', e.target); if (!im.getAttribute('src')) im.src = im.dataset.pele;
      ioP.unobserve(e.target);
    });
  }, { rootMargin: '300px 0px' });
  todos.forEach(function (el) { ioP.observe(el); });

  /* ampliação */
  var lb = $('#lb'), palco = $('#lb-palco'), lbi = $('#lb-img'), troca = $('#lb-troca'), vPele = $('#lb-v-pele'), vPl = $('#lb-v-pl');
  var lNome = $('#lb-nome'), lLat = $('#lb-lat'), quero = $('#lb-quero'), ant = $('#lb-ant'), prox = $('#lb-prox');
  var lista = [], pos = 0, modo = 'pele', volta = null, z = 1, zx = 0, zy = 0;
  function grupo(b) {
    if (b.classList.contains('esp')) return todos.filter(function (e) { return !e.hidden; });
    var sec = b.closest('section');
    return $$('button[data-src]', sec);
  }
  function aplicaZ() {
    lbi.style.transform = z > 1 ? 'translate(' + zx + 'px,' + zy + 'px) scale(' + z + ')' : '';
    lb.classList.toggle('zoom', z > 1);
  }
  function zera() { z = 1; zx = 0; zy = 0; aplicaZ(); }
  function mostra() {
    var b = lista[pos], temPl = !!b.dataset.pl;
    var src = (modo === 'pl' && temPl) ? b.dataset.pl : b.dataset.src;
    zera();
    lb.classList.toggle('prancha', modo === 'pl' && temPl);
    lbi.src = src; lbi.alt = b.dataset.nome + ' ' + (b.dataset.lat || '');
    lNome.textContent = b.dataset.nome; lLat.textContent = b.dataset.lat || '';
    troca.hidden = !temPl; quero.hidden = !temPl;
    vPele.setAttribute('aria-pressed', modo !== 'pl'); vPl.setAttribute('aria-pressed', modo === 'pl');
    var um = lista.length < 2; ant.hidden = um; prox.hidden = um;
    [pos - 1, pos + 1].forEach(function (i) { var o = lista[i]; if (o) { new Image().src = o.dataset.src; } });
  }
  function abre(b) {
    lista = grupo(b); pos = Math.max(0, lista.indexOf(b)); modo = 'pele'; volta = b;
    lb.hidden = false; d.body.style.overflow = 'hidden'; mostra(); $('#lb-x').focus();
  }
  function fecha(semFoco) {
    lb.hidden = true; d.body.style.overflow = ''; lbi.removeAttribute('src');
    if (volta && !semFoco) volta.focus({ preventScroll: true });
  }
  function anda(n) { pos = (pos + n + lista.length) % lista.length; mostra(); }
  var ePonteiro = raiz.classList.contains('ponteiro'), aberta = null;
  d.addEventListener('click', function (e) {
    var q = e.target.closest('.esp-quero');
    if (q) { pedir(q.closest('.esp')); return; }
    var eb = e.target.closest('.esp-bt');
    if (eb) {
      var esp = eb.closest('.esp');
      if (ePonteiro) { abre(esp); return; }
      /* no toque a prancha vira a tatuagem ali mesmo */
      if (aberta && aberta !== esp) aberta.classList.remove('ver');
      esp.classList.toggle('ver'); aberta = esp.classList.contains('ver') ? esp : null;
      return;
    }
    var b = e.target.closest('button[data-src]'); if (b) abre(b);
  });
  $('#lb-x').addEventListener('click', function () { fecha(); });
  ant.addEventListener('click', function () { anda(-1); }); prox.addEventListener('click', function () { anda(1); });
  vPele.addEventListener('click', function () { modo = 'pele'; mostra(); });
  vPl.addEventListener('click', function () { modo = 'pl'; mostra(); });
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (!lb.hidden) fecha(); else if (nav.classList.contains('aberto')) menu(false); }
    if (lb.hidden) return;
    if (e.key === 'ArrowLeft') anda(-1); if (e.key === 'ArrowRight') anda(1);
    if (e.key === 'Tab') {
      var fc = $$('button', lb).filter(function (x) { return x.offsetParent !== null; });
      var pri = fc[0], ult = fc[fc.length - 1];
      if (e.shiftKey && d.activeElement === pri) { e.preventDefault(); ult.focus(); }
      else if (!e.shiftKey && d.activeElement === ult) { e.preventDefault(); pri.focus(); }
    }
  });
  /* gestos: arrastar troca de foto, pinça e toque duplo aproximam */
  var pts = new Map(), iniD = 0, iniZ = 1, ix = 0, iy = 0, ox = 0, oy = 0, moveu = false, uToque = 0;
  function dist() { var v = Array.from(pts.values()); return Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y); }
  palco.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.lb-seta')) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { palco.setPointerCapture(e.pointerId); } catch (x) {}
    if (pts.size === 2) { iniD = dist(); iniZ = z; }
    ix = e.clientX; iy = e.clientY; ox = zx; oy = zy; moveu = false;
  });
  palco.addEventListener('pointermove', function (e) {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) { z = cl(iniZ * dist() / iniD, 1, 5); if (z === 1) { zx = 0; zy = 0; } aplicaZ(); moveu = true; return; }
    var dx = e.clientX - ix, dy = e.clientY - iy;
    if (Math.abs(dx) + Math.abs(dy) > 8) moveu = true;
    if (z > 1) { zx = ox + dx; zy = oy + dy; aplicaZ(); }
  });
  function solta(e) {
    if (!pts.has(e.pointerId)) return;
    var eraUm = pts.size === 1; pts.delete(e.pointerId);
    if (!eraUm) { ix = 0; moveu = true; return; }
    var dx = e.clientX - ix, dy = e.clientY - iy;
    if (z === 1 && moveu && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4 && lista.length > 1) { anda(dx < 0 ? 1 : -1); return; }
    if (!moveu) {
      var ag = e.timeStamp;
      if (ag - uToque < 320 || e.pointerType === 'mouse') { if (e.target === lbi) { if (z > 1) zera(); else { z = 2.4; aplicaZ(); } } uToque = 0; }
      else uToque = ag;
    }
  }
  palco.addEventListener('pointerup', solta);
  palco.addEventListener('pointercancel', function (e) { pts.delete(e.pointerId); });

  /* orçamento */
  var form = $('#form'), aviso = $('#form-aviso'), avisoBase = aviso.textContent, F = form.elements;
  var E = { tipo: $('#e-tipo'), ideia: $('#e-ideia'), local: $('#e-local'), tam: $('#e-tam'), ref: $('#e-ref'), lat: $('#e-lat') };
  var refFoto = '';
  function curto(s, n) { return s.length > n ? s.slice(0, n - 1).trim() + '…' : s; }
  function etiqueta() {
    var v = function (k) { return F[k].value.trim(); };
    E.tipo.textContent = F.tipo.value;
    E.ideia.textContent = curto(v('ideia'), 90) || 'Conte ao lado';
    E.local.textContent = v('local') || 'A definir';
    E.tam.textContent = v('tam') || 'A definir';
    E.ref.textContent = v('ref') || 'Nenhuma';
    E.lat.textContent = v('nome') ? 'Para ' + v('nome') : 'Ainda sem nome';
    aviso.textContent = avisoBase;
  }
  form.addEventListener('input', function (e) { if (e.target.name === 'ref') refFoto = ''; etiqueta(); });
  form.addEventListener('change', etiqueta);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = function (k) { return F[k].value.trim(); };
    var falta = !v('ideia') ? F.ideia : !v('nome') ? F.nome : null;
    if (falta) {
      aviso.textContent = falta === F.ideia ? 'Conte sua ideia para enviar o pedido.' : 'Coloque seu nome para enviar o pedido.';
      falta.focus(); return;
    }
    var l = ['Oi, Pilha! Vim pelo site e quero um orçamento.', '', '*Tipo:* ' + F.tipo.value, '*Ideia:* ' + v('ideia')];
    if (v('local')) l.push('*Lugar do corpo:* ' + v('local'));
    if (v('tam')) l.push('*Tamanho:* ' + v('tam'));
    if (v('ref')) l.push('*Referência:* ' + v('ref'));
    if (refFoto) l.push(new URL(refFoto, location.href).href);
    l.push('*Nome:* ' + v('nome'));
    if (v('cid')) l.push('*Cidade:* ' + v('cid'));
    open('https://wa.me/' + WA + '?text=' + encodeURIComponent(l.join('\n')), '_blank', 'noopener');
  });
  function marcaTipo(t) { $$('input[name=tipo]', form).forEach(function (r) { r.checked = r.value === t; }); etiqueta(); }
  $$('[data-tipo]').forEach(function (a) { a.addEventListener('click', function () { marcaTipo(a.dataset.tipo); }); });
  function pedir(b) {
    F.ref.value = b.dataset.nome + ' (' + b.dataset.lat + ')'; refFoto = b.dataset.src;
    marcaTipo('Autoral'); if (!lb.hidden) fecha(true);
    orc.scrollIntoView({ behavior: calmo.matches ? 'auto' : 'smooth' });
    F.ideia.focus({ preventScroll: true });
  }
  quero.addEventListener('click', function () { pedir(lista[pos]); });
  etiqueta();
})();
