(function () {
  'use strict';
  var d = document, raiz = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var WA = '5521997426185';
  var calmo = matchMedia('(prefers-reduced-motion: reduce)');
  var celular = matchMedia('(max-width: 767px)');
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) raiz.classList.add('ponteiro');

  /* entrada do topo */
  var img = $('#falcao img');
  var pronto = function () { raiz.classList.add('pronto'); };
  var fontes = d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve();
  var quadro = img.decode ? img.decode().catch(function () {}) : Promise.resolve();
  Promise.race([Promise.all([fontes, quadro]), new Promise(function (r) { setTimeout(r, 1400); })]).then(pronto);

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

  /* topo sólido e botão flutuante */
  var flut = $('#zap-flut'), orc = $('#orcamento'), noOrc = false;
  function aoRolar() {
    var y = scrollY, h = innerHeight;
    topo.classList.toggle('rolou', y > 24);
    flut.classList.toggle('on', y > h * .9 && !noOrc);
  }
  addEventListener('scroll', aoRolar, { passive: true }); aoRolar();
  new IntersectionObserver(function (e) { noOrc = e[0].isIntersecting; aoRolar(); }, { rootMargin: '0px 0px -20% 0px' }).observe(orc);

  /* entradas */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });
  $$('.entra').forEach(function (el) { io.observe(el); });

  /* vento do topo */
  var cv = $('#vento'), vid = $('#vento-v'), hero = $('.hero'), caixa = $('#falcao'), gl = null, rodando = false, visivel = true, fp = null;
  var dpr = 1, somaT = 0, nT = 0, ultimo = 0;
  function medir() {
    var r = hero.getBoundingClientRect(), f = caixa.getBoundingClientRect();
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    return [(f.left - r.left + f.width / 2) * dpr, (f.top - r.top + f.height / 2) * dpr, f.height * dpr];
  }
  var bx = null;
  function pintar(ms) {
    fp = null;
    if (!rodando || !visivel) return;
    if (ultimo) {
      somaT += ms - ultimo; nT++;
      if (nT === 50) {
        if (somaT / nT > 24 && dpr > 1) { dpr = Math.max(1, dpr * .75); bx = medir(); }
        somaT = 0; nT = 0;
      }
    }
    ultimo = ms;
    gl.desenhar((ms / 12000) % 1, bx, dpr);
    fp = requestAnimationFrame(pintar);
  }
  function ligar() { if (rodando && visivel && !fp) { ultimo = 0; fp = requestAnimationFrame(pintar); } }
  new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; ligar(); }).observe(hero);
  d.addEventListener('visibilitychange', function () { visivel = !d.hidden; ligar(); });

  function usarVideo() {
    rodando = false; cv.classList.remove('on');
    vid.hidden = false;
    if (!vid.getAttribute('src')) vid.src = 'assets/video/vento-pe.mp4';
    vid.classList.add('on');
    if (!calmo.matches) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
  }
  function usarShader() {
    vid.hidden = true; vid.pause();
    fetch('assets/dados/vento.json').then(function (r) { return r.json(); }).then(function (j) {
      return fetch('assets/dados/vento.bin').then(function (r) { return r.arrayBuffer(); }).then(function (b) { j.dados = new Uint16Array(b); return j; });
    }).then(function (campo) {
      if (!gl) gl = window.ventoGL(cv, campo);
      if (!gl) return;
      var toque = matchMedia('(pointer: coarse)').matches;
      dpr = Math.min(devicePixelRatio || 1, toque ? 1.5 : 2);
      bx = medir(); gl.desenhar(.2, bx, dpr); cv.classList.add('on');
      if (calmo.matches || (toque && innerHeight < 500)) return;
      rodando = true; ligar();
    }).catch(function () {});
  }
  function escolher() { if (celular.matches) usarVideo(); else usarShader(); }
  escolher();
  celular.addEventListener('change', escolher);
  var rz;
  addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      if (!gl || celular.matches) return;
      bx = medir(); gl.desenhar(.2, bx, dpr);
    }, 120);
  });

  /* manifesto: as palavras escurecem com a rolagem */
  var man = $('#manifesto'), pals = $$('.pl', man);
  function manifesto() {
    var r = man.getBoundingClientRect(), h = innerHeight;
    var p = (h * .86 - r.top) / (r.height + h * .34);
    var n = Math.round(p * pals.length);
    pals.forEach(function (w, i) { w.classList.toggle('on', i < n); });
  }

  /* história: o falcão, a gaiola e a saída */
  var merg = $('#historia'), mf = $('#merg-f'), mg = $('#merg-g'), km = $('#kmh'), passos = $$('#merg-p > div');
  var aoMerg = false, kAtual = -1;
  var cl = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  var ez = function (p) { return 1 - Math.pow(1 - p, 3); };
  function historia() {
    var r = merg.getBoundingClientRect(), tot = r.height - innerHeight, p = cl(-r.top / tot, 0, 1);
    var i = p < .2 ? 0 : p < .4 ? 1 : p < .58 ? 2 : p < .78 ? 3 : 4;
    passos.forEach(function (el, j) { el.classList.toggle('on', j === i); });
    var k = Math.round(ez(cl(p / .17, 0, 1)) * 320);
    if (k !== kAtual) { km.textContent = k; kAtual = k; }
    /* a gaiola desce em .2-.34, fica, e sobe em .6-.74 */
    var g = p < .2 ? -104 : p < .34 ? -104 + 104 * ez((p - .2) / .14) : p < .6 ? 0 : p < .74 ? -104 * ((p - .6) / .14) * ((p - .6) / .14) : -104;
    mg.style.setProperty('--g', g.toFixed(2) + '%');
    var w = innerWidth, h = innerHeight;
    var vai = cl((p - .62) / .38, 0, 1);
    mf.style.setProperty('--dx', (vai * vai * w * .7).toFixed(1) + 'px');
    mf.style.setProperty('--dy', (-vai * vai * h * .9 - (1 - ez(cl(p / .2, 0, 1))) * h * -.04).toFixed(1) + 'px');
    mf.style.setProperty('--s', (1.08 - .14 * cl(p / .4, 0, 1) + .2 * vai).toFixed(4));
  }
  new IntersectionObserver(function (e) { aoMerg = e[0].isIntersecting; if (aoMerg) historia(); }).observe(merg);
  var tk = false;
  addEventListener('scroll', function () {
    if (tk) return; tk = true;
    requestAnimationFrame(function () { tk = false; manifesto(); if (aoMerg) historia(); });
  }, { passive: true });
  manifesto(); historia();

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
  /* a foto da pele só carrega quando alguém passa o mouse */
  if (raiz.classList.contains('ponteiro')) {
    $('#grade').addEventListener('pointerover', function (e) {
      var b = e.target.closest('.esp'); if (!b) return;
      var im = $('.pele', b); if (!im.getAttribute('src')) im.src = im.dataset.pele;
    });
  }

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
  d.addEventListener('click', function (e) {
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
  quero.addEventListener('click', function () {
    var b = lista[pos];
    F.ref.value = b.dataset.nome + ' (' + b.dataset.lat + ')'; refFoto = b.dataset.src;
    marcaTipo('Autoral'); fecha(true);
    orc.scrollIntoView({ behavior: calmo.matches ? 'auto' : 'smooth' });
    F.ideia.focus({ preventScroll: true });
  });
  etiqueta();
})();
