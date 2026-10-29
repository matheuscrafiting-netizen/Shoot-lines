# Como publicar e monetizar o Shoot Lines

Guia para quem nunca publicou um jogo. Os passos do portal podem mudar; confira sempre a documentação oficial do CrazyGames (docs.crazygames.com).

## 1. Testar com pessoas antes (grátis)

- Mande o link https://matheuscrafiting-netizen.github.io/Shoot-lines/ para amigos e conhecidos.
- Observe: eles terminam a 1ª fase? Voltam a jogar no dia seguinte? Onde desistem?
- Para ver os botões de anúncio funcionando (simulados), abra com `?ads=test` no fim do endereço:
  https://matheuscrafiting-netizen.github.io/Shoot-lines/?ads=test

## 2. Gerar o pacote para o portal

O pacote é montado automaticamente a cada envio ao GitHub:

1. Abra o repositório no GitHub → aba **Actions** → execução mais recente de **"Testes do jogo"**.
2. No fim da página, em **Artifacts**, baixe **shoot-lines-crazygames** (é um .zip com `index.html`, `game.js`, `platform.js` e a pasta `fonts`).

Também dá para gerar no computador: `bash tools/build-crazygames.sh` → `dist/shoot-lines-crazygames.zip`.

## 3. Enviar ao CrazyGames

1. Crie uma conta de desenvolvedor no CrazyGames (developer portal).
2. Envie o .zip como jogo **HTML5**, com nome, descrição, capa e categoria (ação/casual).
3. O jogo passa por revisão e entra primeiro num **lançamento básico** (sem anúncios), para medir se os jogadores gostam.
4. Se os números forem bons, ele vai para o **lançamento completo** com o SDK — o jogo já está pronto para isso: no domínio do CrazyGames o `platform.js` carrega o SDK sozinho e liga os anúncios.

O que o jogo já faz com o SDK:

| Recurso | Quando |
|---|---|
| Carregando / jogando | Avisa o portal quando está carregando e quando o jogador está de fato jogando (base das métricas de tempo de jogo) |
| 📺 Reviver | Uma vez por partida, na tela de fim de jogo |
| 📺 Dobrar moedas | Uma vez por partida, no fim de jogo ou de fase |
| 📺 Trocar cartas | Uma vez por escolha de melhoria |
| Anúncio entre partidas | No máximo 1 a cada 3 partidas e 3 minutos, só ao sair da tela de fim |
| Momento feliz | Ao derrotar boss e completar fase |

Durante os anúncios o jogo pausa e fica mudo. Fora do portal (no GitHub Pages), os botões de anúncio não aparecem.

## 4. Antes de ganhar dinheiro

- **Pagamentos**: o portal paga mensalmente acima de um valor mínimo; você precisará cadastrar dados bancários/fiscais no portal.
- **Impostos**: a renda é tributável no Brasil. Converse com um contador (abrir um MEI costuma ser o caminho mais simples).
- **Nome**: confirme que "Shoot Lines" não é marca registrada de outra empresa.
- **Privacidade**: a política está em `privacidade.html` (link no menu da versão do GitHub Pages). No portal, o próprio CrazyGames pede o consentimento de anúncios.

## 5. Depois (se o jogo for bem)

- Versão Android com Capacitor + AdMob (conta Google Play: US$ 25, uma vez; contas pessoais novas precisam de um teste fechado com 12 testadores por 14 dias).
- Versão iPhone (Apple: US$ 99 por ano e um Mac para gerar o app).
- Compras dentro do app: "remover anúncios" e pacotes de moedas.
