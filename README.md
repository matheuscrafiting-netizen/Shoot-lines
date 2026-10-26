# Shoot Lines

Jogo de navegador no estilo dos "anúncios do YouTube": um esquadrão corre por **3 faixas**, atira automaticamente nos bichos que vêm em sua direção e escolhe por quais portões passar.

## Como jogar

**Online:** https://matheuscrafiting-netizen.github.io/Shoot-lines/ (depois de ativar o GitHub Pages, veja abaixo)

Ou abra o `index.html` em qualquer navegador (PC ou celular). Não precisa instalar nada.

| Ação | Teclado | Toque / mouse |
|---|---|---|
| Trocar de faixa | `←` `→` ou `A` `D` | Toque ou arraste na faixa desejada |
| Começar / reiniciar | `Enter` / `Espaço` | Toque na tela |
| Pausar | `P` / `Esc` | — |
| Som on/off | `M` | — |

## Mecânicas

- **Portões verdes** (bônus): `+N` soldados, `×2` / `×3` soldados, arma melhor, `+% Dano`, `+% Cadência`.
- **Portões vermelhos** (penalidade): `-N` soldados, `÷2` soldados, `-% Dano`, `-% Cadência`.
- **Atire nos portões `+N` / `-N`** para aumentar o valor — dá até para transformar um vermelho em verde.
- **Caixas**: destrua atirando para ganhar arma nova, soldados ou cadência.
- **Bichos**: se encostarem no esquadrão, matam soldados. Desvie trocando de faixa ou destrua antes.
- **Armas** (em ordem): Pistola → Submetralhadora → Fuzil → Escopeta → Laser (perfura) → Lança-foguetes (dano em área) → Minigun.
- **Dificuldade** sobe com o tempo: bichos mais fortes, mais rápidos e em maior número (besouros, corredores, cuspidores que trocam de faixa, brutamontes e tanques).
- **Boss** a cada 60 segundos. Ele marca em vermelho a faixa que vai atacar: siga-o para acertar e desvie dos ataques. Derrotar dá soldados extras e arma melhor. Cada boss tem um ataque diferente:

| Boss | Ataque |
|---|---|
| Rei Besouro | Dispara espinhos em uma faixa (duas, nos níveis altos) |
| Aranha Rainha | Lança teias e chama filhotes que correm até você |
| Verme Colossal | Vai até a sua faixa e investe para frente |
| Golem de Lava | Arremessa pedras em duas faixas — dá para destruí-las atirando |
| Hidra Sombria | Cospe fogo em duas faixas; só uma fica segura |

  Depois do 5º boss o ciclo recomeça, com bosses mais fortes.

## Publicar no GitHub Pages

O workflow `.github/workflows/pages.yml` publica o jogo a cada push na branch padrão. Para ativar (só uma vez):

1. No GitHub, abra **Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **GitHub Actions**.
3. Em **Actions**, rode de novo o workflow "Publicar no GitHub Pages" (ou faça um novo push).

## Estrutura

- `index.html` — página e canvas
- `game.js` — todo o jogo (Canvas 2D com câmera em perspectiva + WebAudio, sem dependências)
- `.github/workflows/pages.yml` — publicação automática no GitHub Pages
