"""Monta index.html a partir de tools/modelo.html, do catálogo (tools/catalogo.py) e das listas abaixo.
Uso: python tools/montar.py   (editar o modelo e este arquivo, nunca o index.html da raiz)"""
import html, os, sys, urllib.parse
AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)
from catalogo import C

WA = '5521997426185'
GRUPOS = [('todos', 'Todos'), ('insetos', 'Insetos'), ('aves', 'Aves'), ('repteis', 'Répteis'), ('marinhos', 'Marinhos'),
          ('mamiferos', 'Mamíferos'), ('flora', 'Flora'), ('figuras', 'Figuras')]
PROJETOS = [('asas', 'Asas', 'Fechamento em andamento, pena por pena até o punho.'),
            ('deuses', 'Atena e Zeus', 'Um dos projetos mais desafiadores que ele já realizou.'),
            ('crisantemo', 'Crisântemo', 'Já passou de 18 horas de sessão.'),
            ('braco', 'Braço fechado', 'Mais de 7 sessões até a última folha.')]
COVERS = [('c1', 'Do santo ao Coliseu', 'Uma peça colorida nas costelas deu lugar a uma arquitetura inteira em preto.'),
          ('c2', 'Rosa no pescoço', 'Uma mancha antiga atrás da orelha virou uma rosa de pétalas fechadas.'),
          ('c3', 'Retrato indígena', 'O cocar antigo sumiu dentro de um retrato novo.')]
FREEHAND = [('f1', 'Folhas na mão', 'Do marcador azul e vermelho até a sombra final.'),
            ('f2', 'Lagarta no ramo', 'O desenho verde segue a linha do antebraço.'),
            ('f3', 'Flor em movimento', 'Caneta vermelha primeiro, preto depois.')]
CICATRIZADAS = [('h1', 'Náutilo', 'Na panturrilha, com o preto assentado.'), ('h2', 'Retrato com flores', 'Linhas finas seguem abertas.'),
                ('h3', 'Ave na mão', 'Mesmo em área difícil, o preto segurou.'), ('h4', 'Caracol', 'No antebraço, sombra suave e contorno firme.')]
AULAS = [('aula1', 'Turma aos domingos'), ('aula2', 'Botânica no quadro'), ('aula3', 'Movimento das folhas'), ('aula5', 'Prática acompanhada')]
TURMA = ['graf_inky', 'poly_tattooink', 'andressar.ink', 'loh_tattoo', 'rd_tattoorj']
RELATOS = [('Você acertou em cheio. Meu filho viu por chamada de vídeo e chorou de alegria dizendo que o dinossauro dele estava perfeito.', 'Erick D.', 'cliente'),
           ('Foi meses procurando alguém que eu batesse os olhos. Você entregou o trabalho perfeitamente como queria e ainda acho que superou minhas expectativas.', 'João', 'cliente'),
           ('Reformou uma tatuagem minha antiga pra uma mil vezes melhor, minha autoestima melhorou muito.', 'Andressa A.', 'no Google'),
           ('Super atencioso, simpático, tem um traço incrível, fizemos as tattoos todas autorais e superaram minhas expectativas.', 'Ericky R.', 'no Google'),
           ('Pouca gente sabe, mas a minha enorme tatuagem no braço esquerdo é em homenagem à minha avó Rosária. Grandes folhas de maracujá com seus raminhos torcidos.', 'Juliana R.', 'cliente'),
           ('Pilha tatuou meu braço maravilhosamente. Eu só vou até ele quando estou no Rio. Saudações da Suíça!', 'Avaliação no Google', 'da Suíça')]
TIPOS = ['Autoral', 'Cover up', 'Fechamento', 'Free hand']
SETA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 18L18 6M8 6h10v10"/></svg>'
ZAP = ('<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.2-1.4A9.9 9.9 0 1 0 12.04 2zm5.8 14.1c-.25.7-1.44 1.33-2 1.4-.5.07-1.15.1-1.85-.12-.43-.14-.97-.32-1.67-.62-2.94-1.27-4.85-4.22-5-4.42-.14-.2-1.2-1.59-1.2-3.03s.76-2.15 1.03-2.45c.27-.3.59-.37.78-.37h.56c.18 0 .42-.07.66.5.25.6.84 2.05.91 2.2.07.14.12.32.02.51-.1.2-.15.32-.3.5-.14.17-.3.38-.43.51-.15.15-.3.3-.13.6.18.3.77 1.27 1.65 2.05 1.13 1.01 2.09 1.32 2.39 1.47.3.14.47.12.64-.08.18-.2.74-.86.94-1.16.2-.3.4-.25.66-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.07.12.07.72-.18 1.4z"/></svg>')
LINKS = [(f'https://wa.me/{WA}', 'WhatsApp', '(21) 99742-6185'),
         ('https://www.instagram.com/pilhainktattoo/', 'Instagram', '@pilhainktattoo'),
         ('https://www.tiktok.com/@acelerandosonhosoficial', 'TikTok', 'Acelerando Sonhos'),
         ('https://www.instagram.com/reel/CFp5ipmD91I/', 'Minha história', 'O vídeo do falcão'),
         ('https://www.google.com/maps/search/?api=1&query=Recreio+dos+Bandeirantes+Rio+de+Janeiro', 'Localização', 'Recreio, Rio de Janeiro'),
         ('https://www.threads.net/@pilhainktattoo', 'Threads', '@pilhainktattoo')]
FRASE = 'Amor em cada gota de tinta.'


def a(s):
    return html.escape(s, quote=True)


def foto(nome, alt, w, h, sizes):
    return f'<img src="assets/img/foto/{nome}.webp" alt="{a(alt)}" width="{w}" height="{h}" loading="lazy" decoding="async" draggable="false">'


def colecao():
    out = []
    for i, nome, lat, g, _ in C:
        out.append(f'''      <article class="esp" data-g="{g}" data-src="assets/img/pele/{i}.webp" data-pl="assets/img/prancha/{i}.webp" data-nome="{a(nome)}" data-lat="{a(lat)}">
        <button class="esp-bt" type="button" aria-label="Ver {a(nome)} na pele">
          <span class="esp-img"><img class="pele" alt="" data-pele="assets/img/pele-p/{i}.webp" draggable="false"><img class="pl" src="assets/img/prancha/{i}.webp" alt="{a(nome)}, prancha da tatuagem" width="800" height="1000" loading="lazy" decoding="async" draggable="false"></span>
          <span class="esp-tx"><b>{nome}</b><em class="lat">{lat}</em></span>
        </button>
        <button class="esp-quero" type="button" tabindex="-1">Quero uma assim</button>
      </article>''')
    return '\n'.join(out)


def blocos(lista, pasta_alt, w, h):
    out = []
    for n, tit, txt in lista:
        out.append(f'''      <button class="bloco entra" type="button" data-src="assets/img/foto/{n}.webp" data-nome="{a(tit)}" data-lat="{a(txt)}" aria-label="Ampliar {a(tit)}">
        <span class="foto">{foto(n, f'{tit}, {pasta_alt}', w, h, '')}</span>
        <h3>{tit}</h3><p>{txt}</p>
      </button>''')
    return '\n'.join(out)


def pares(lista, r1, r2, sa, sb):
    out = []
    for n, tit, txt in lista:
        out.append(f'''      <article class="par entra">
        <div class="par-fotos">
          <button type="button" data-src="assets/img/foto/{n}{sa}.webp" data-nome="{a(tit)}" data-lat="{r1}" aria-label="Ampliar {a(tit)}, {r1.lower()}"><span class="foto">{foto(n + sa, f'{tit}, {r1.lower()}', 900, 1125, '')}</span><span class="rot">{r1}</span></button>
          <button type="button" class="depois" data-src="assets/img/foto/{n}{sb}.webp" data-nome="{a(tit)}" data-lat="{r2}" aria-label="Ampliar {a(tit)}, {r2.lower()}"><span class="foto">{foto(n + sb, f'{tit}, {r2.lower()}', 900, 1125, '')}</span><span class="rot">{r2}</span></button>
        </div>
        <h3>{tit}</h3><p>{txt}</p>
      </article>''')
    return '\n'.join(out)


def main():
    t = open(os.path.join(AQUI, 'modelo.html'), encoding='utf-8').read()
    wa_curso = f'https://wa.me/{WA}?text=' + urllib.parse.quote('Oi, Pilha! Vi seu site e queria saber sobre o curso de tatuagem.')
    subs = {
        'MANIFESTO': ' '.join(f'<span class="pl">{p}</span>' for p in FRASE.split()),
        'FILTROS': '\n      '.join(f'<button type="button" data-f="{k}" aria-pressed="{"true" if k == "todos" else "false"}">{v}</button>' for k, v in GRUPOS),
        'COLECAO': colecao(),
        'PROJETOS': blocos(PROJETOS, 'fechamento de braço', 1200, 1500),
        'COVERS': pares(COVERS, 'Antes', 'Depois', '-antes', '-depois'),
        'FREEHAND': pares(FREEHAND, 'Marcador', 'Tinta', '-a', '-b'),
        'CICATRIZADAS': blocos(CICATRIZADAS, 'tatuagem cicatrizada', 800, 1000),
        'AULAS': '\n'.join(f'      <figure class="bloco entra"><span class="foto">{foto(n, t2, 900, 1125, "")}</span><h3>{t2}</h3></figure>' for n, t2 in AULAS),
        'TURMA': ''.join(f'<a href="https://www.instagram.com/{u}/" target="_blank" rel="noopener">@{u}</a>' for u in TURMA),
        'WA_CURSO': a(wa_curso),
        'RELATOS': '\n'.join(f'      <li class="entra"><p>{a(p)}</p><footer><b>{a(n)}</b>, {d}</footer></li>' for p, n, d in RELATOS),
        'TIPOS': ''.join(f'<label><input type="radio" name="tipo" value="{x}"{" checked" if j == 0 else ""}><span>{x}</span></label>' for j, x in enumerate(TIPOS)),
        'LINKS': '\n'.join(f'      <a href="{a(u)}" target="_blank" rel="noopener"><span>{n}<small>{d}</small></span>{SETA}</a>' for u, n, d in LINKS),
    }
    for k, v in subs.items():
        t = t.replace('{{' + k + '}}', v)
    assert '{{' not in t
    open(os.path.join(SITE, 'index.html'), 'w', encoding='utf-8', newline='\n').write(t)
    print('index.html', len(t) // 1024, 'KB')


main()
