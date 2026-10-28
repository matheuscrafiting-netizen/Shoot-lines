// Teste de fumaça: um robô joga partidas rápidas (simulação acelerada) e o teste
// falha se houver erro de JavaScript ou se a progressão básica quebrar.
// Uso: node tests/smoke.cjs   (precisa do pacote "playwright" com o Chromium)
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));

  const result = await page.evaluate(() => {
    try { localStorage.clear(); } catch (e) { /* sem storage */ }
    meta = loadMeta();
    const bot = steps => {
      if (steps % 12) return;
      const s = [0, 0, 0];
      for (const e of g.enemies) { if (e.y > 420) s[e.lane] -= 12; else if (e.y > 60) s[e.lane] += 3; }
      for (const row of g.gates) if (row.used < 0 && row.y > 250) row.cells.forEach((c, i) => { s[i] += isGood(c) ? 6 : -6; });
      if (g.boss) { s[g.boss.lane] += 10; if (g.boss.tele) for (const l of g.boss.tele.lanes) s[l] -= 20; }
      let best = g.lane;
      for (let i = 0; i < 3; i++) if (s[i] > s[best]) best = i;
      g.lane = best;
    };
    const play = (maxT) => {
      let steps = 0;
      while ((state === 'play' || state === 'choose') && g.t < maxT) {
        if (state === 'choose') { g.choice.t = 1; choosePerk(Math.max(0, g.choice.options.indexOf('weapon'))); continue; }
        bot(steps); update(1 / 60); steps++;
      }
    };
    const runs = [];
    // partidas normais (podem morrer)
    for (let i = 0; i < 3; i++) { modePref = 0; startCampaign(1); play(400); runs.push({ mode: 'campanha', t: g.t, kills: g.kills, state }); }
    for (let i = 0; i < 2; i++) { modePref = 0; start(); play(300); runs.push({ mode: 'infinito', t: g.t, kills: g.kills, state }); }
    // progressão com robô imortal: deve subir de patente e trocar de arma
    const oLP = losePower, oLF = loseFraction;
    window.losePower = () => {}; window.loseFraction = () => {};
    modePref = 0; start(); play(360);
    const prog = { tier: g.tier, weapon: g.weapon, perks: perkLevels(), bosses: g.bossesKilled };
    window.losePower = oLP; window.loseFraction = oLF;
    return { runs, prog };
  });

  await browser.close();
  console.log(JSON.stringify(result, null, 1));
  const fail = [];
  if (errors.length) fail.push('erros de JavaScript: ' + errors.slice(0, 3).join(' | '));
  for (const r of result.runs) if (r.t < 20 || r.kills < 5) fail.push(`partida curta demais: ${JSON.stringify(r)}`);
  if (result.prog.tier < 1) fail.push('robô imortal não subiu de patente em 6 min');
  if (result.prog.weapon + result.prog.perks < 3) fail.push('quase nenhuma melhoria em 6 min');
  if (result.prog.bosses < 1) fail.push('nenhum boss derrotado em 6 min');
  if (fail.length) { console.error('FALHOU:\n- ' + fail.join('\n- ')); process.exit(1); }
  console.log('OK');
})();
