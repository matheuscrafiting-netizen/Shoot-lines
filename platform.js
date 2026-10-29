'use strict';

// ---------------------------------------------------------------------------
// Plataforma: anúncios e sinais para o portal CrazyGames (SDK HTML5 v3).
// Fora do portal (ex.: GitHub Pages) tudo vira "sem efeito" e os botões de
// anúncio somem. Para testar o fluxo dos anúncios em qualquer lugar, abra o
// jogo com ?ads=test (os anúncios são simulados por 2 segundos).
// ---------------------------------------------------------------------------
const Platform = (() => {
  const params = new URLSearchParams(location.search);
  const onCrazyGames = /(^|\.)crazygames\./.test(location.hostname) || params.has('cg');
  const testAds = params.get('ads') === 'test';
  const MIDGAME_EVERY_RUNS = 3;            // anúncio entre partidas: no máximo 1 a cada 3 partidas
  const MIDGAME_MIN_GAP = 3 * 60 * 1000;   // ... e a cada 3 minutos
  let sdk = null;
  let gameplayOn = false;
  let runsSinceMidgame = 0;
  let lastMidgame = Date.now();

  const api = {
    name: onCrazyGames ? 'CrazyGames' : testAds ? 'teste' : 'nenhuma',
    adsAvailable: testAds,     // vira true quando o SDK do portal responde
    adPlaying: false,          // o jogo pausa e silencia enquanto for true
    externalLinks: !onCrazyGames,   // portais não aceitam links para fora
  };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  api.init = async () => {
    if (!onCrazyGames) return;
    try {
      await loadScript('https://sdk.crazygames.com/crazygames-sdk-v3.js');
      const s = window.CrazyGames && window.CrazyGames.SDK;
      await s.init();
      if (s.environment === 'disabled') return;
      sdk = s;
      api.adsAvailable = true;
      try { if (await sdk.ad.hasAdblock()) api.adsAvailable = false; } catch (e) { /* sem detecção */ }
    } catch (e) {
      console.warn('SDK do CrazyGames indisponível:', e);
    }
  };

  const call = f => { try { if (sdk) f(sdk); } catch (e) { console.warn(e); } };

  api.loading = on => call(s => (on ? s.game.loadingStart() : s.game.loadingStop()));

  // avisa o portal quando o jogador está de fato jogando (base das métricas dele)
  api.gameplay = on => {
    if (on === gameplayOn) return;
    gameplayOn = on;
    call(s => (on ? s.game.gameplayStart() : s.game.gameplayStop()));
  };

  // "momento feliz" (boss derrotado, fase completa)
  api.happy = () => call(s => s.game.happytime());

  function showAd(type, done) {
    if (api.adPlaying) return;
    api.adPlaying = true;
    api.gameplay(false);
    const finish = ok => { api.adPlaying = false; done(ok); };
    if (sdk) {
      sdk.ad.requestAd(type, {
        adStarted: () => {},
        adFinished: () => finish(true),
        adError: () => finish(false),
      });
    } else if (testAds) {
      setTimeout(() => finish(true), 2000);
    } else {
      finish(false);
    }
  }

  // anúncio com recompensa: só dá o prêmio se o anúncio terminar
  api.rewarded = (onReward, onFail) => showAd('rewarded', ok => (ok ? onReward() : onFail && onFail()));

  // anúncio entre partidas, com limite de frequência; sempre segue para `next`
  api.betweenRuns = next => {
    runsSinceMidgame++;
    if (!api.adsAvailable || runsSinceMidgame < MIDGAME_EVERY_RUNS || Date.now() - lastMidgame < MIDGAME_MIN_GAP) {
      next();
      return;
    }
    runsSinceMidgame = 0;
    lastMidgame = Date.now();
    showAd('midgame', () => next());
  };

  return api;
})();
