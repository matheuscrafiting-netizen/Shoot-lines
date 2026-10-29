# Shoot Lines

Jogo de navegador no estilo dos "anúncios do YouTube": um esquadrão corre por **3 faixas**, atira automaticamente nos bichos que vêm em sua direção e escolhe por quais portões passar.

## Como jogar

**Online:** https://matheuscrafiting-netizen.github.io/Shoot-lines/

Ou abra o `index.html` em qualquer navegador (PC ou celular). Não precisa instalar nada.

| Ação | Teclado | Toque / mouse |
|---|---|---|
| Trocar de faixa | `←` `→` ou `A` `D` | Toque ou arraste na faixa desejada |
| Jogar / continuar | `Enter` / `Espaço` | Botões **CAMPANHA**, **INFINITO** ou **CONTINUAR** |
| Escolher melhoria | `1` `2` `3` | Toque na carta |
| Menu de pausa | `P` / `Esc` | Botão **☰** no canto superior esquerdo |
| Som on/off | `M` | Botão no menu de pausa |

Na primeira vez que cada coisa aparece (portões, bichos novos, fuga, patente…), uma **dica** surge no alto da tela.

## Modos

- **Campanha**: fases curtas (2:30 na fase 1, +30 s por fase até 5:30). Quando o tempo acaba, surge o **chefe da fase**; derrotá-lo completa a fase e libera a próxima. A fase 1 é leve e cada fase seguinte é 18% mais forte. **Estrelas**: 1 por completar, mais 1 se terminar com 40% da sua força máxima e mais 1 com 75%.
- **Infinito**: a partida segue até o esquadrão cair; vale o recorde.
- **Dificuldade** (Fácil ×1,6 / Normal ×2,6 / Difícil ×4,2 na força dos bichos) vale para os dois modos.
- **Continuar**: a partida é salva sozinha (a cada 5 s, ao pausar e ao sair). Ao continuar, tudo volta como estava — bichos, boss, portões — com 2 s de "Prepare-se".

## Progresso entre partidas

- **Moedas** a cada partida (tempo, bosses, patente, abates; mais no Normal e no Difícil) e bônus ao completar fases.
- **Loja** de melhorias permanentes:

| Melhoria | Efeito por nível | Máx. |
|---|---|---|
| 👥 Recrutas | +3 soldados no começo | 10 |
| 💪 Treino de tiro | +10% de dano base | 20 |
| ⚡ Gatilho rápido | +5% de cadência base | 10 |
| 🔧 Kit inicial | +1 peça no começo | 3 |
| 🛡️ Escudo inicial | começa com escudo que bloqueia 1 golpe | 1 |
| 🍀 Sorte | +6% de chance de 2 portões bons | 5 |

- **Visual da munição** (Clássica, Dourada, Plasma, Tóxica, Arco-íris) comprado com moedas.
- **Missões de hoje**: 3 missões sorteadas por dia (derrotar bosses, eliminar bichos, chegar a uma patente, sobreviver, completar fases, escolher evoluções); cada uma paga moedas ao ser concluída.

## Mecânicas

- **Portões verdes** (bônus): `+N` soldados, `×2` / `×3`, 🔧 peça, ⬆ Promover, `+% Dano`, `+% Cadência`. **Vermelhos**: `-N`, `÷2`, `-% Dano`, `-% Cadência`.
- **Atire nos portões `+N` / `-N`** para aumentar o valor. As balas atravessam o portão e seguem até os bichos.
- **Baús**: destrua atirando para ganhar peças, soldados ou cadência.
- **Bichos** que encostam tiram soldados; os que **escapam** pelas outras faixas também. Uma **marca vermelha ❗** aparece na faixa onde um bicho está prestes a escapar.
- **Pontuação**: distância, abates, bosses e patente, com multiplicador por dificuldade. O topo mostra a **onda** (infinito) ou a **fase** com o tempo até o chefe (campanha).

### Peças, armas e evoluções

Portões de peça, baús, bosses e inimigos Elite dão **peças 🔧**. Ao completar as peças, o jogo pausa e você escolhe 1 de 3 cartas: a **próxima arma** ou uma **evolução**. As evoluções são do esquadrão: **continuam ao trocar de arma**. Cada evolução vai até o nível 5 e cada nível dá +10% de dano.

**Armas** (dano/s por soldado): Pistola 2,5 → Submetralhadora 6 → Fuzil 11 → Escopeta 14 → Laser 24 (atravessa) → Lança-foguetes 20 (explosão) → Minigun 40.

| Evolução | Efeito |
|---|---|
| 💥 Munição explosiva | Tiros explodem em área |
| 🏹 Transposição | Tiro atravessa inimigos |
| 🌀 Direção aleatória | Balas extras em ângulos aleatórios |
| 🔁 Ricochete | Tiro quica para o inimigo mais próximo |
| 🔥 Incendiária | Inimigos pegam fogo |
| ❄️ Congelante | Inimigos mais lentos |
| 🎯 Crítico | Chance de dano ×3 |
| ⚡ Raio em cadeia | Raio salta entre inimigos |
| 🧭 Teleguiada | Balas fazem curva até os inimigos |
| 🎖️ Recrutamento | Abates podem recrutar soldados |

**Combos**: duas evoluções no nível 3 ou mais destravam um efeito extra.

| Combo | Precisa de | Efeito |
|---|---|---|
| 🌋 Napalm | Incendiária + Munição explosiva | As explosões também incendeiam |
| 🌨️ Nevasca elétrica | Congelante + Raio em cadeia | O raio também congela |
| 🦅 Caçadora | Transposição + Teleguiada | Balas teleguiadas atravessam +2 bichos |
| 🥈 Bala de prata | Crítico + Ricochete | Todo ricochete acerta crítico |

Dano e cadência não têm limite: os bônus dos portões somam para sempre; acima de 12 rajadas/s a cadência extra vira dano.

### Patentes

Recruta → Soldado → Cabo → Sargento → Tenente → Capitão → Major → Coronel → General, cada uma com os subníveis **I, II e III** (depois de General III: General ★1, ★2…). A cada **300 soldados** o esquadrão sobe um subnível: a quantidade é dividida por 3 e cada soldado vale 3×. O portão **⬆ Promover** sobe na hora com +20% de força.

Cada patente (no subnível I) libera uma habilidade (elas acumulam):

| Patente | Habilidade |
|---|---|
| Soldado | 💪 Treinamento: +15% de dano |
| Cabo | 🛡️ Escudo: bloqueia 1 golpe a cada 12 s |
| Sargento | 💣 Granada a cada 6 s no inimigo mais forte da faixa |
| Tenente | 🦺 Colete: -20% de dano recebido |
| Capitão | 🔫 Torreta: atira nas outras faixas |
| Major | ⚕️ Médico: +5% de soldados a cada 8 s |
| Coronel | ✈️ Ataque aéreo a cada 15 s |
| General | ⭐ Comando: habilidades 2× mais rápidas |

**A partir de General**: uma **ameaça permanente** ao chegar e outra a cada boss derrotado (👥 Horda, 🪨 Couraça, 😡 Fúria, 💨 Pressa, 👑 Elites, 💀 Senhor da guerra), e bosses a cada 45 s.

### Dificuldade

- A força dos bichos depende só do tempo de jogo, do modo e da fase, seguindo uma curva fixa calibrada no crescimento de um esquadrão médio.
- **Pressão mínima**: a partir dos 3 minutos os bichos sempre exigem uma parte do seu tempo de tiro e encostar sempre custa parte da força, por mais forte que você esteja.

### Inimigos

| Habilidade | Efeito | Como lidar |
|---|---|---|
| 🛡️ Escudo | Bloqueia os primeiros tiros | Explosões, raio e granadas atravessam |
| 💨 Investida | Dispara quando chega perto | Mate antes ou saia da faixa |
| 👻 Fantasma | Fica intangível de tempos em tempos | Atire quando estiver sólido |
| 👑 Elite | 4× vida, 2× dano | Derrotar dá uma peça 🔧 |
| 💚 Regenerador | Se cura se ficar sem levar dano | Fogo impede a cura |
| 🧬 Divisor | Ao morrer, vira dois menores | Dano em área |

Do meio do jogo em diante: **🛡️ Escudeiro** (escudo frontal que para balas que atravessariam e corta 40% do dano), **💚 Curandeiro** (aura que cura os bichos em volta) e **👄 Guloso** (engole outros bichos e fica com a vida deles).

### Bosses

Um boss a cada 60 s; ele marca em vermelho a faixa que vai atacar.

- O **1º boss** aguenta ~15 s do seu tiro direto e não enfurece ninguém, e as ondas pausam 4 s quando ele entra.
- Do 2º em diante: 30 s, +5 s por boss (até 80 s); o **chefe da fase** na campanha aguenta 20 s +5 s por fase.
- Fases de **escudo** em 75%, 50% e 25% de vida, com reforços (marcadas na barra).
- Do 2º boss em diante, enquanto ele está vivo, as criaturas ficam **enfurecidas** (aura vermelha).
- O boss avança até a metade da pista; se chegar lá, fica **furioso** e ataca mais rápido.

| Boss | Ataque |
|---|---|
| Rei Besouro | Espinhos em uma faixa (duas, nos níveis altos) |
| Aranha Rainha | Teias e filhotes |
| Verme Colossal | Investe na sua faixa |
| Golem de Lava | Pedras em duas faixas (dá para destruí-las) |
| Hidra Sombria | Fogo em duas faixas; só uma fica segura |

## Visual

Estilo cartoon inspirado em jogos mobile como Clash Royale: contorno escuro grosso em tudo, cores vivas, soldados "cabeçudos", arena de grama quadriculada com caminho de pedra, baús de recompensa, botões 3D, barra de peças no estilo "elixir" e cartas com moldura por raridade. Fonte [Lilita One](https://fonts.google.com/specimen/Lilita+One) (licença OFL), embutida em `fonts/`. Nenhuma arte ou marca da Supercell é usada.

## Monetização

O jogo está pronto para o portal **CrazyGames** (SDK HTML5 v3, em `platform.js`): avisa o portal quando está carregando e jogando, oferece anúncios com recompensa (📺 reviver uma vez por partida, dobrar moedas, trocar cartas) e um anúncio entre partidas no máximo a cada 3 partidas e 3 minutos. Fora do portal os botões de anúncio somem; para testar o fluxo, abra o jogo com `?ads=test`. Passo a passo de publicação em [PUBLICAR.md](PUBLICAR.md); política de privacidade em `privacidade.html`.

## Testes e publicação

- `tests/smoke.cjs`: um robô joga partidas aceleradas (campanha, infinito e uma partida sem dano para checar a progressão) e falha se houver erro de JavaScript ou se a progressão quebrar. Rode com `node tests/smoke.cjs` (precisa do pacote `playwright`).
- `.github/workflows/tests.yml` roda esse teste a cada push e gera o pacote **shoot-lines-crazygames** (em Actions → Artifacts).
- `tools/build-crazygames.sh` monta o mesmo pacote localmente em `dist/`.
- `.github/workflows/pages.yml` publica o jogo no GitHub Pages a cada push na branch padrão.

## Estrutura

- `index.html` — página e canvas
- `game.js` — todo o jogo (Canvas 2D com câmera em perspectiva + WebAudio, sem dependências)
- `platform.js` — anúncios e sinais para o portal (CrazyGames)
- `privacidade.html` — política de privacidade
- `fonts/` — fonte Lilita One embutida (licença OFL)
- `tests/smoke.cjs` — teste automático com robô
