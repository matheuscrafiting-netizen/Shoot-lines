# Shoot Lines

Jogo de navegador no estilo dos "anúncios do YouTube": um esquadrão corre por **3 faixas**, atira automaticamente nos bichos que vêm em sua direção e escolhe por quais portões passar.

## Como jogar

**Online:** https://matheuscrafiting-netizen.github.io/Shoot-lines/

Ou abra o `index.html` em qualquer navegador (PC ou celular). Não precisa instalar nada.

| Ação | Teclado | Toque / mouse |
|---|---|---|
| Trocar de faixa | `←` `→` ou `A` `D` | Toque ou arraste na faixa desejada |
| Começar / continuar | `Enter` / `Espaço` | Botões **JOGAR**, **CONTINUAR** ou **NOVO JOGO** |
| Dificuldade (Fácil / Normal / Difícil) | — | Botões no menu inicial (vale para o próximo jogo) |
| Menu de pausa (status, evoluções, habilidades, ameaças) | `P` / `Esc` | Botão **☰** no canto superior esquerdo |
| Travar / destravar a arma | `L` | Botão **🔓 Travar** no canto inferior direito |
| Escolher evolução | `1` `2` `3` | Toque na carta |
| Som on/off | `M` | — |

## Mecânicas

- **Portões verdes** (bônus): `+N` soldados, `×2` / `×3` soldados, arma melhor (ou ⭐ Evolução), ⬆ Promover, `+% Dano`, `+% Cadência`.
- **Portões vermelhos** (penalidade): `-N` soldados, `÷2` soldados, `-% Dano`, `-% Cadência`.
- **Atire nos portões `+N` / `-N`** para aumentar o valor — dá até para transformar um vermelho em verde. As balas **atravessam** o portão (cada uma conta uma vez) e seguem até os bichos atrás dele.
- **Baús**: destrua atirando para ganhar peças, soldados ou cadência (as balas também atravessam).
- **Bichos**: se encostarem no esquadrão, matam soldados. Os que **escapam** por qualquer faixa também tiram soldados (pouco no começo, mais com o tempo) — troque de faixa para limpar todas.
- **Peças 🔧**: portões de arma, caixas, bosses e inimigos Elite dão peças. A próxima arma custa 2, 3, 4… peças; com a arma travada, cada evolução custa 3 ou mais.
- **Armas** (em ordem): Pistola → Submetralhadora → Fuzil → Escopeta → Laser (perfura) → Lança-foguetes (dano em área) → Minigun.
- **Dano e cadência sem limite**: os bônus (+20% dano, +15% cadência) somam para sempre. Acima de 20 tiros/s, a cadência extra vira dano.

### Interface

- Topo: **☰ menu**, pontos, nível e **⏱ tempo de jogo**.
- O menu ☰ pausa o jogo e mostra patente (com progresso até a próxima), arma, multiplicadores, evoluções, habilidades da patente e ameaças — toque num ícone para ler o que ele faz. Dali dá para continuar, começar um novo jogo, ligar/desligar o som ou voltar ao menu inicial.
- **A partida é salva sozinha** (a cada 5 s, ao pausar e ao sair do app). No menu inicial, **CONTINUAR** retoma de onde parou.
- Números grandes usam a escala de jogo: 12.3K, 4.5M, 6.7B, 8.9T, depois **aa, ab, ac… zz**. A vida de baús e bosses aparece em **%**.

### Patentes

Recruta → Soldado → Cabo → Sargento → Tenente → Capitão → Major → Coronel → General, cada uma com os subníveis **I, II, III, IV e V** (depois de General V: General ★1, ★2…).

- Ao chegar a **300 soldados**, o esquadrão sobe um subnível sozinho: a quantidade é **dividida por 3**, mas cada soldado vale **3×** (mesma força). Assim os portões `+N` e `×2` continuam fazendo diferença a partida inteira. Os soldados crescem e mudam de cor a cada patente.
- O portão **⬆ Promover** sobe um subnível na hora: divide por 2,5 e cada soldado vale 3× (**+20% de força**).
- O dano dos bichos é medido em "força", então a patente em si não deixa o esquadrão mais resistente — quem protege são as habilidades abaixo.

Cada patente (no subnível I) libera uma habilidade (elas acumulam):

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

### General: ameaças permanentes

Ao chegar em **General I** surge a primeira **ameaça permanente**, e a partir daí cada boss derrotado traz mais uma (os bosses passam a vir a cada 45 s). Elas acumulam até o fim da partida:

| Ameaça | Efeito |
|---|---|
| 👥 Horda | +25% de inimigos por onda |
| 🪨 Couraça | Inimigos com +40% de vida |
| 😡 Fúria | Inimigos causam +40% de dano |
| 💨 Pressa | Inimigos 10% mais rápidos |
| 👑 Elites | Mais inimigos com habilidades |
| 💀 Senhor da guerra | Bosses com +50% de vida e mais agressivos |

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

- **Dificuldade igual em toda partida**: a força dos bichos depende só do tempo de jogo (e do modo escolhido), seguindo uma curva fixa calibrada no crescimento de um esquadrão médio — com folga, para quem joga na média conseguir avançar. Quem fica mais forte que a média acha o jogo mais fácil; quem fica para trás sente mais pressão. A partir dos 12 minutos a curva vai acelerando aos poucos, então toda partida termina um dia (nas simulações, no Normal metade das partidas passa dos ~19 min e as melhores chegam perto dos 30). Os modos multiplicam a força dos bichos e aceleram o ritmo: **Fácil** ×1,6, **Normal** ×2,6 e **Difícil** ×4,2 (bosses também aguentam mais no Normal e no Difícil).

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
- **Boss épico** a cada 60 segundos. Ele marca em vermelho a faixa que vai atacar: siga-o para acertar e desvie dos ataques.
  - A vida dele é calculada pelo **seu** poder de fogo quando ele aparece: pelo menos 18 s de tiro direto no 1º boss, +3 s a cada boss (até 50 s), mais no Normal e no Difícil — com movimento, fases e ataques, as lutas duram de ~25 s a quase 1 min.
  - Com 75%, 50% e 25% de vida ele liga um **escudo** por 3 s e chama reforços (as fases aparecem marcadas na barra de vida); no fim fica furioso e ataca mais rápido.
  - **Enquanto ele está vivo, as criaturas ficam enfurecidas** (aura vermelha): mais vida, mais dano, mais velocidade e mais habilidades especiais — e a fúria cresce a cada boss. As ondas não diminuem durante a luta.
  - Derrotar dá soldados e 2 peças 🔧. Cada boss tem um ataque diferente:

| Boss | Ataque |
|---|---|
| Rei Besouro | Dispara espinhos em uma faixa (duas, nos níveis altos) |
| Aranha Rainha | Lança teias e chama filhotes que correm até você |
| Verme Colossal | Vai até a sua faixa e investe para frente |
| Golem de Lava | Arremessa pedras em duas faixas — dá para destruí-las atirando |
| Hidra Sombria | Cospe fogo em duas faixas; só uma fica segura |

  Depois do 5º boss o ciclo recomeça, com bosses mais fortes.

## Visual

Estilo cartoon inspirado em jogos mobile como Clash Royale: contorno escuro grosso em tudo, cores vivas, soldados "cabeçudos", arena de grama quadriculada com caminho de pedra, baús de recompensa, botões 3D, barra de peças no estilo "elixir" e cartas de evolução com moldura por raridade. Fonte [Lilita One](https://fonts.google.com/specimen/Lilita+One) (Google Fonts, licença OFL). Nenhuma arte ou marca da Supercell é usada.

## Publicação

O workflow `.github/workflows/pages.yml` publica o jogo no GitHub Pages a cada push na branch padrão.

## Estrutura

- `index.html` — página e canvas
- `game.js` — todo o jogo (Canvas 2D com câmera em perspectiva + WebAudio, sem dependências; soldados são pré-desenhados em sprites para ficar leve no celular)
- `.github/workflows/pages.yml` — publicação automática no GitHub Pages
