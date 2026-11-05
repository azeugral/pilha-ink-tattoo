# Pilha Ink Tattoo

Prévia do site do Pilha (@pilhainktattoo), tatuador do Recreio dos Bandeirantes, Rio de Janeiro. Feito por L R G Z.

## Conceito

Gabinete de história natural à noite. A tinta das tatuagens foi extraída das fotos e virou prancha de museu, com nome científico, filtro por grupo e a foto real na pele a um toque. O topo é a mariposa tatuada no peito de um cliente, com a metade direita espelhada para simetria total, parada no meio de um túnel de vento calculado de verdade (`tools/campo.py`). Ao abrir, a arte se forma uma vez, do traço ao preenchimento, com o nome visto através das asas. A logo é provisória: o nome em fonte ao lado da pilha que ele usa no Instagram, redesenhada em vetor, que carrega com a rolagem da página. O desenho com TATTOO na vertical não cabe legível no menu, então lá ficam só o + e o −.

## Como editar

- Textos e estrutura: `tools/modelo.html`
- Listas (projetos, covers, avaliações, links, WhatsApp): `tools/montar.py`
- Coleção: `tools/catalogo.py` e `tools/gerar_pranchas.py`
- Depois de editar: `python tools/montar.py`. Nunca editar o `index.html` direto.
- Vídeos do topo no celular (`vento-forma.mp4` e o laço `vento-pe.mp4`): `python tools/gerar_video.py pe`. A caixa da mariposa no script (`gerar_video.py`) define o tamanho dela no vídeo; o texto do celular em pé fica por cima, no HTML.

## CONFIRMAR antes de publicar de verdade

1. Endereço atual do estúdio. O Linktree aponta para a Onblack Tattoo Rio (Av. das Américas 13685), que o Google mostra como permanentemente fechada. O site diz só "Recreio dos Bandeirantes, Rio de Janeiro".
2. WhatsApp 21 99742-6185, o do Linktree. Legendas antigas trazem outro número.
3. "O primeiro artista biólogo" vem do Linktree. Em 2021 ele escreveu que pensava em se formar em Biologia: confirmar a formação.
4. "5,0 no Google, 49 avaliações" pode ser da ficha do estúdio fechado. Confirmar ou trocar pelo perfil novo.
5. Autorização dos clientes para aparecer nas avaliações (Erick D., João, Andressa A., Ericky R., Juliana R.).
6. Curso: se segue ativo, nome oficial, formato e se as alunas citadas podem aparecer.
7. Nome completo "Leandro Lima Faria" no site: ele quer?
8. Nomes científicos e nomes das peças da coleção, inclusive "A viúva e a íbis" e os retratos.
9. Tempo de tatuagem: tirado do site até confirmar. A bio diz mais de 13 anos, mas no vídeo de 2020 ele diz ter 4 anos de tatuagem.
10. História: conferir com ele a passagem da carteira de trabalho e a do primo Luiz Fonseca.
11. Agenda e cidades de guest. O site não cita nenhuma.
12. O vídeo da história é de 2020 (ele diz ter 28 anos). Se tiver um mais recente, trocar.
13. Mariposa do topo: confirmar se o cliente autoriza o uso da tatuagem como peça principal.
14. Título "Asas", "Atena e Zeus", "Crisântemo", "Do santo ao Coliseu": nomes dados por nós.
15. Domínio definitivo. Ao publicar, tirar o `noindex` e trocar a URL do `og:image`.
