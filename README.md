# Shoot Lines

Jogo de navegador no estilo dos "anúncios do YouTube": um esquadrão corre por **3 faixas**, atira automaticamente nos bichos que vêm em sua direção e escolhe por quais portões passar.

## Como jogar

**Online:** https://matheuscrafiting-netizen.github.io/Shoot-lines/

Ou abra o `index.html` em qualquer navegador (PC ou celular). Não precisa instalar nada.

| Ação | Teclado | Toque / mouse |
|---|---|---|
| Trocar de faixa | `←` `→` ou `A` `D` | Toque ou arraste na faixa desejada |
| Começar / reiniciar | `Enter` / `Espaço` | Toque na tela |
| Travar / destravar a arma | `L` | Botão **🔓 Travar** no canto inferior direito |
| Escolher evolução | `1` `2` `3` | Toque na carta |
| Pausar | `P` / `Esc` | — |
| Som on/off | `M` | — |

## Mecânicas

- **Portões verdes** (bônus): `+N` soldados, `×2` / `×3` soldados, arma melhor (ou ⭐ Evolução), ⬆ Promover, `+% Dano`, `+% Cadência`.
- **Portões vermelhos** (penalidade): `-N` soldados, `÷2` soldados, `-% Dano`, `-% Cadência`.
- **Atire nos portões `+N` / `-N`** para aumentar o valor — dá até para transformar um vermelho em verde.
- **Caixas**: destrua atirando para ganhar arma nova, soldados ou cadência.
- **Bichos**: se encostarem no esquadrão, matam soldados. Os que **escapam** por qualquer faixa também tiram soldados (pouco no começo, mais com o tempo) — troque de faixa para limpar todas.
- **Peças 🔧**: portões de arma, caixas, bosses e inimigos Elite dão peças. A próxima arma custa 2, 3, 4… peças; com a arma travada, cada evolução custa 3 ou mais.
- **Armas** (em ordem): Pistola → Submetralhadora → Fuzil → Escopeta → Laser (perfura) → Lança-foguetes (dano em área) → Minigun.
- **Dano e cadência sem limite**: os bônus (+20% dano, +15% cadência) somam para sempre. Acima de 20 tiros/s, a cadência extra vira dano.

### Patentes

Recruta → Soldado → Cabo → Sargento → Tenente → Capitão → Major → Coronel → General → General ★2, ★3…

- Ao chegar a **100 soldados**, o esquadrão sobe de patente sozinho: a quantidade é **dividida por 5**, mas cada soldado vale **5×** (mesma força, soldados maiores e com divisas). Assim os portões `+N` e `×2` continuam fazendo diferença a partida inteira.
- O portão **⬆ Promover** sobe a patente na hora: divide por 4 e cada soldado vale 5× (**+25% de força**).
- O dano dos bichos é medido em "força", então a patente em si não deixa o esquadrão mais resistente — quem protege são as habilidades abaixo.

Cada patente libera uma habilidade (elas acumulam):

| Patente | Habilidade |
|---|---|
| Soldado | 💪 Treinamento: +15% de dano |
| Cabo | 🛡️ Escudo: bloqueia 1 golpe (bicho ou boss) a cada 12 s |
| Sargento | 💣 Granada: a cada 6 s no inimigo mais forte da sua faixa (atravessa escudos) |
| Tenente | 🦺 Colete: -20% de dano recebido |
| Capitão | 🔫 Torreta: atira nos bichos das outras faixas |
| Major | ⚕️ Médico: +5% de soldados a cada 8 s |
| Coronel | ✈️ Ataque aéreo: bombardeia a tela toda a cada 15 s |
| General | ⭐ Comando: habilidades 2× mais rápidas |

### Arma travada e evoluções

Toque em **🔓 Travar** (ou `L`) para ficar com a arma atual. Com a arma travada — ou na Minigun, a última — as peças 🔧 viram **⭐ Evolução**: o jogo pausa e você escolhe 1 de 3 melhorias. Cada evolução tem até 5 níveis, muda a cor/efeito dos tiros e cada nível dá +10% de dano. Se você destravar e pegar outra arma, as evoluções são perdidas.

| Evolução | Efeito |
|---|---|
| 💥 Munição explosiva | Tiros explodem em área (onda laranja) |
| 🏹 Transposição | Tiro atravessa inimigos |
| 🌀 Direção aleatória | Balas extras em ângulos aleatórios, acertam outras faixas |
| 🔁 Ricochete | Tiro quica para o inimigo mais próximo |
| 🔥 Incendiária | Inimigos pegam fogo e levam dano contínuo |
| ❄️ Congelante | Inimigos ficam azulados e mais lentos |
| 🎯 Crítico | Chance de dano ×3 |
| ⚡ Raio em cadeia | Raio salta entre inimigos próximos |
| 🧭 Teleguiada | Balas fazem curva até os inimigos |
| 🎖️ Recrutamento | Abates podem recrutar soldados |

- **Dificuldade infinita**: os bichos ficam mais fortes, mais rápidos e mais numerosos (besouros, corredores, cuspidores que trocam de faixa, brutamontes e tanques). A força deles acelera com o tempo e acompanha em parte o tamanho do seu esquadrão, então toda partida termina um dia — o desafio é ir o mais longe possível.

### Habilidades dos inimigos

Aparecem a partir do nível 2–5 e ficam mais comuns com o tempo:

| Habilidade | Efeito | Como lidar |
|---|---|---|
| 🛡️ Escudo | Bloqueia os primeiros tiros (contador na bolha) | Explosões, raio em cadeia e granadas atravessam |
| 💨 Investida | Dispara em alta velocidade quando chega perto | Mate antes ou saia da faixa |
| 👻 Fantasma | Fica transparente e intangível de tempos em tempos | Atire quando estiver sólido |
| 👑 Elite | Maior, 4× vida e 2× dano | Derrotar dá uma peça 🔧 |
| 💚 Regenerador | Recupera vida se ficar 1 s sem levar dano | Fogo 🔥 impede a cura |
| 🧬 Divisor | Ao morrer, vira dois menores | Dano em área |
- **Boss** a cada 60 segundos. Ele marca em vermelho a faixa que vai atacar: siga-o para acertar e desvie dos ataques. A vida dele acompanha o seu poder de fogo (não morre na hora); com 66% e 33% de vida ele liga um **escudo** por 3 s e chama reforços, e no fim fica furioso (ataca mais rápido). Derrotar dá soldados e 2 peças 🔧. Cada boss tem um ataque diferente:

| Boss | Ataque |
|---|---|
| Rei Besouro | Dispara espinhos em uma faixa (duas, nos níveis altos) |
| Aranha Rainha | Lança teias e chama filhotes que correm até você |
| Verme Colossal | Vai até a sua faixa e investe para frente |
| Golem de Lava | Arremessa pedras em duas faixas — dá para destruí-las atirando |
| Hidra Sombria | Cospe fogo em duas faixas; só uma fica segura |

  Depois do 5º boss o ciclo recomeça, com bosses mais fortes.

## Publicação

O workflow `.github/workflows/pages.yml` publica o jogo no GitHub Pages a cada push na branch padrão.

## Estrutura

- `index.html` — página e canvas
- `game.js` — todo o jogo (Canvas 2D com câmera em perspectiva + WebAudio, sem dependências)
- `.github/workflows/pages.yml` — publicação automática no GitHub Pages
