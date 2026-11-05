# Pilha Ink Tattoo

Prévia do site do Pilha (@pilhainktattoo), tatuador do Recreio dos Bandeirantes, Rio de Janeiro. Feito por L R G Z.

## Conceito

Gabinete de história natural à noite. A tinta das tatuagens foi extraída das fotos e virou prancha de museu, com nome científico, filtro por grupo e a foto real na pele a um toque. O topo é um túnel de vento com linhas de corrente calculadas em volta do falcão-peregrino dele (`tools/campo.py`).

## Como editar

- Textos e estrutura: `tools/modelo.html`
- Listas (projetos, covers, avaliações, links, WhatsApp): `tools/montar.py`
- Coleção: `tools/catalogo.py` e `tools/gerar_pranchas.py`
- Depois de editar: `python tools/montar.py`. Nunca editar o `index.html` direto.
- Vídeo do topo no celular: `python tools/gerar_video.py`. A caixa do falcão no script tem que bater com `.palco .falcao` no CSS.

## CONFIRMAR antes de publicar de verdade

1. Endereço atual do estúdio. O Linktree aponta para a Onblack Tattoo Rio (Av. das Américas 13685), que o Google mostra como permanentemente fechada. O site diz só "Recreio dos Bandeirantes, Rio de Janeiro".
2. WhatsApp 21 99742-6185, o do Linktree. Legendas antigas trazem outro número.
3. "O primeiro artista biólogo" vem do Linktree. Em 2021 ele escreveu que pensava em se formar em Biologia: confirmar a formação.
4. "5,0 no Google, 49 avaliações" pode ser da ficha do estúdio fechado. Confirmar ou trocar pelo perfil novo.
5. Autorização dos clientes para aparecer nas avaliações (Erick D., João, Andressa A., Ericky R., Juliana R.).
6. Curso: se segue ativo, nome oficial, formato e se as alunas citadas podem aparecer.
7. Nome completo "Leandro Lima Faria" no site: ele quer?
8. Nomes científicos e nomes das peças da coleção, inclusive "A viúva e a íbis" e os retratos.
9. "13 anos de tatuagem": o feed sugere início por volta de 2014, a bio diz mais de 13 anos.
10. "139 mil no Instagram" é o número de novembro de 2026.
11. História: conferir com ele a passagem da carteira de trabalho e a do primo Luiz Fonseca.
12. Agenda e cidades de guest. O site não cita nenhuma.
13. Título "Asas", "Atena e Zeus", "Crisântemo", "Do santo ao Coliseu": nomes dados por nós.
14. Domínio definitivo. Ao publicar, tirar o `noindex` e trocar a URL do `og:image`.
