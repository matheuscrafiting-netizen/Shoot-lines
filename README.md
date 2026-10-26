# Shoot Lines

Jogo de navegador no estilo dos "anúncios do YouTube": um esquadrão corre por **3 faixas**, atira automaticamente nos bichos que vêm em sua direção e escolhe por quais portões passar.

## Como jogar

Abra o `index.html` em qualquer navegador (PC ou celular). Não precisa instalar nada.

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
- **Boss** a cada 60 segundos: muda de faixa, marca a faixa em vermelho e dispara. Siga-o para acertar e desvie dos ataques. Derrotar dá soldados extras e arma melhor.

## Estrutura

- `index.html` — página e canvas
- `game.js` — todo o jogo (Canvas 2D + WebAudio, sem dependências)
