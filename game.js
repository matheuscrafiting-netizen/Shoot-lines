'use strict';

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------
const W = 450, H = 800;
const LANES = [75, 225, 375];
const LANE_HALF = 70;
const PLAYER_Y = 690;
const FORM_MAX = 60;         // soldados desenhados no máximo
const BOSS_EVERY = 60;       // segundos entre bosses
const PROMOTE_AT = 100;      // com essa quantidade o esquadrão é promovido sozinho
const TIER_POWER = 5;        // cada patente vale 5× a anterior
const MAX_FIRE_RATE = 20;    // acima disso a cadência extra vira dano
const PERK_MAX = 5;

const WEAPONS = [
  { name: 'Pistola',         dmg: 1,   rate: 2.5, speed: 650,  color: '#ffe066', size: 3 },
  { name: 'Submetralhadora', dmg: 1,   rate: 6,   speed: 750,  color: '#ffd43b', size: 2.5 },
  { name: 'Fuzil',           dmg: 2.2, rate: 5,   speed: 850,  color: '#ffa94d', size: 3 },
  { name: 'Escopeta',        dmg: 1.6, rate: 3,   speed: 700,  color: '#ff8787', size: 3, pellets: 3 },
  { name: 'Laser',           dmg: 3,   rate: 8,   speed: 1100, color: '#66d9e8', size: 2, pierce: 99 },
  { name: 'Lança-foguetes',  dmg: 14,  rate: 1.4, speed: 520,  color: '#ff6b6b', size: 6, splash: 70 },
  { name: 'Minigun',         dmg: 2.5, rate: 16,  speed: 1000, color: '#b197fc', size: 2.5 },
];

const RANKS = [
  { name: 'Recruta',  color: '#228be6', helmet: '#1864ab' },
  { name: 'Soldado',  color: '#40c057', helmet: '#2b8a3e' },
  { name: 'Cabo',     color: '#15aabf', helmet: '#0b7285' },
  { name: 'Sargento', color: '#fd7e14', helmet: '#d9480f' },
  { name: 'Tenente',  color: '#fa5252', helmet: '#c92a2a' },
  { name: 'Capitão',  color: '#be4bdb', helmet: '#862e9c' },
  { name: 'Major',    color: '#20c997', helmet: '#087f5b' },
  { name: 'Coronel',  color: '#495057', helmet: '#212529' },
  { name: 'General',  color: '#f1f3f5', helmet: '#fab005' },
];

// Evoluções da arma travada. desc recebe o nível que será alcançado.
const PERKS = {
  explosive: { icon: '💥', name: 'Munição explosiva', color: '#ff922b', desc: l => `Explode em área (raio ${30 + 12 * l})` },
  pierce:    { icon: '🏹', name: 'Transposição',      color: '#66d9e8', desc: l => `Atravessa ${l} inimigo${l > 1 ? 's' : ''}` },
  chaos:     { icon: '🌀', name: 'Direção aleatória', color: '#f783ac', desc: l => `+${2 * l} balas em direções aleatórias` },
  ricochet:  { icon: '🔁', name: 'Ricochete',         color: '#b197fc', desc: l => `Quica em ${l} inimigo${l > 1 ? 's' : ''} próximo${l > 1 ? 's' : ''}` },
  fire:      { icon: '🔥', name: 'Incendiária',       color: '#ff6b6b', desc: l => `Queima ${60 * l}% do dano por segundo` },
  frost:     { icon: '❄️', name: 'Congelante',        color: '#a5d8ff', desc: l => `Inimigos ${12 * l}% mais lentos` },
  crit:      { icon: '🎯', name: 'Crítico',           color: '#ffe066', desc: l => `${8 * l}% de chance de dano ×3` },
  chain:     { icon: '⚡', name: 'Raio em cadeia',    color: '#74c0fc', desc: l => `Raio salta para ${l + 1} inimigos` },
  homing:    { icon: '🧭', name: 'Teleguiada',        color: '#8ce99a', desc: l => `Balas perseguem inimigos (força ${l})` },
  recruit:   { icon: '🎖️', name: 'Recrutamento',      color: '#fcc419', desc: l => `${4 * l}% de chance de +1 soldado por abate` },
};

const ENEMY_TYPES = {
  bug:     { hp: 3,  spd: 0.85, dmg: 1, r: 14, color: '#69db7c', minD: 1 },
  runner:  { hp: 2,  spd: 1.6,  dmg: 1, r: 11, color: '#ffd43b', minD: 1.6 },
  spitter: { hp: 6,  spd: 0.8,  dmg: 2, r: 16, color: '#da77f2', minD: 2.2, switcher: true },
  brute:   { hp: 18, spd: 0.6,  dmg: 4, r: 22, color: '#ff922b', minD: 2.8 },
  tank:    { hp: 45, spd: 0.45, dmg: 8, r: 28, color: '#868e96', minD: 4 },
};

const BOSSES = [
  { kind: 'beetle', name: 'Rei Besouro',    color: '#2f9e44', hp: 1,   tip: 'Saia da faixa vermelha!' },
  { kind: 'spider', name: 'Aranha Rainha',  color: '#862e9c', hp: 1.1, tip: 'Ela chama filhotes!' },
  { kind: 'worm',   name: 'Verme Colossal', color: '#d6336c', hp: 1.2, tip: 'Ele avança na sua faixa!' },
  { kind: 'golem',  name: 'Golem de Lava',  color: '#e8590c', hp: 1.4, tip: 'Atire nas pedras!' },
  { kind: 'hydra',  name: 'Hidra Sombria',  color: '#364fc7', hp: 1.3, tip: 'Ache a faixa segura!' },
];

// Câmera em perspectiva: o mundo é lógico (x 0..450, y 0..800) e é
// projetado na tela como uma estrada vista de trás e de cima.
const CAM_C = 1298;                    // distância da câmera até y = 0
const CAM_ZP = CAM_C - PLAYER_Y;       // profundidade do jogador (escala 1)
const CAM_K = 618000;
const CAM_A = 680 - CAM_K / CAM_ZP;    // jogador fica em y = 680 na tela

// ---------------------------------------------------------------------------
// Canvas
// ---------------------------------------------------------------------------
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let scale = 1;

function resize() {
  const s = Math.min(window.innerWidth / W, window.innerHeight / H);
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = Math.floor(W * s) + 'px';
  canvas.style.height = Math.floor(H * s) + 'px';
  canvas.width = Math.floor(W * s * dpr);
  canvas.height = Math.floor(H * s * dpr);
  scale = s * dpr;
}
window.addEventListener('resize', resize);
resize();

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const rand = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rand(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const shuffle = arr => arr.sort(() => Math.random() - 0.5);

const SUFFIX = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
function fmt(n) {
  n = Math.floor(n);
  if (n < 1e4) return String(n);
  const e = Math.floor(Math.log10(n) / 3);
  if (e >= SUFFIX.length) return n.toExponential(1);
  return (n / Math.pow(1000, e)).toFixed(1) + SUFFIX[e];
}
const fmtMul = x => x < 100 ? x.toFixed(1) : fmt(x);

function nearestLane(x) {
  let best = 0;
  for (let i = 1; i < 3; i++) if (Math.abs(LANES[i] - x) < Math.abs(LANES[best] - x)) best = i;
  return best;
}

// Formação do esquadrão (girassol / filotaxia)
const FORMATION = [];
for (let i = 0; i < FORM_MAX; i++) {
  const r = 7.5 * Math.sqrt(i);
  const a = i * 2.39996;
  FORMATION.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.7 });
}

let best = 0;
try { best = +localStorage.getItem('shootlines-best') || 0; } catch (e) { /* sem storage */ }

// ---------------------------------------------------------------------------
// Áudio (bipes simples com WebAudio)
// ---------------------------------------------------------------------------
let actx = null, muted = false, lastShotSfx = 0;
function sfx(freq, dur = 0.08, type = 'square', vol = 0.05, slide = 0) {
  if (muted) return;
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime;
    const o = actx.createOscillator(), gn = actx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    gn.gain.setValueAtTime(vol, t);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn).connect(actx.destination);
    o.start(t);
    o.stop(t + dur);
  } catch (e) { /* áudio indisponível */ }
}

// ---------------------------------------------------------------------------
// Estado do jogo
// ---------------------------------------------------------------------------
let state = 'menu';   // menu | play | paused | choose | over
let g = null;

function newGame() {
  g = {
    t: 0, soldiers: 3, tier: 0, lane: 1, x: LANES[1],
    weapon: 0, rateMul: 1, dmgMul: 1, fireCd: 0,
    locked: false, perks: {}, lastPerk: null, pendingEvo: 0, choice: null,
    bullets: [], enemies: [], gates: [], crates: [], projectiles: [],
    particles: [], texts: [], zaps: [], rings: [],
    score: 0, dist: 0, lastCritT: 0,
    spawnCd: 2, gateCd: 2.5, crateCd: 10, rows: 0, bossCd: BOSS_EVERY,
    boss: null, bossesKilled: 0, banner: null,
    shake: 0, flash: 0, flashColor: '#fff', scroll: 0, overT: 0, nextId: 1,
  };
}

const diff = () => 1 + g.t / 35 + g.bossesKilled * 0.6;
const worldSpeed = () => Math.min(90 + diff() * 7, 190);
// Crescimento infinito dos inimigos: começa lento e acelera com o tempo,
// então cedo ou tarde alcança qualquer esquadrão.
const growth = () => Math.exp(0.0077 * g.t + 0.00004 * g.t * g.t);
const tierMul = () => Math.pow(TIER_POWER, g.tier);
const power = () => g.soldiers * tierMul();
// Os inimigos acompanham em parte a força do esquadrão: cada melhoria
// ainda vale ~65% do ganho, e o tempo (growth) decide o fim.
const enemyScale = () => growth() * Math.max(1, Math.pow(power() / 20, 0.35));
const perkLevels = () => Object.values(g.perks).reduce((a, b) => a + b, 0);
const perk = k => g.perks[k] || 0;
const rankSize = () => Math.min(1.9, 1 + 0.12 * g.tier);
const shownSoldiers = () => Math.max(1, Math.min(g.soldiers, Math.floor(FORM_MAX / (rankSize() ** 2))));

function rankInfo(tier) {
  const r = RANKS[Math.min(tier, RANKS.length - 1)];
  const extra = tier - (RANKS.length - 1);
  return { ...r, name: extra > 0 ? r.name + ' ★' + (extra + 1) : r.name };
}

function fireStats() {
  const w = WEAPONS[g.weapon];
  const rate = w.rate * g.rateMul;
  const fireRate = Math.min(rate, MAX_FIRE_RATE);
  const dmg = w.dmg * g.dmgMul * (1 + 0.1 * perkLevels()) * (rate / fireRate);
  return { w, fireRate, dmg };
}

function dps() {
  const { w, fireRate, dmg } = fireStats();
  return dmg * fireRate * power() * (w.pellets || 1);
}

function addText(x, y, text, color = '#fff', size = 22) {
  g.texts.push({ x, y, text, color, size, life: 1.1, max: 1.1 });
}

function burst(x, y, color, n = 10, spd = 160) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = rand(spd * 0.3, spd);
    g.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.3, 0.7), color, r: rand(2, 4.5) });
  }
}

function loseSoldiers(n, x) {
  n = Math.max(0, Math.floor(n));
  if (n <= 0) return;
  g.soldiers -= n;
  addText(x, PLAYER_Y - 60, '-' + fmt(n), '#ff6b6b', 26);
  burst(x, PLAYER_Y, rankInfo(g.tier).color, Math.min(30, 6 + n * 2), 200);
  g.shake = Math.min(14, g.shake + 4 + n);
  g.flash = 0.25; g.flashColor = '#ff0000';
  sfx(120, 0.2, 'sawtooth', 0.08, -60);
  if (g.soldiers <= 0) gameOver();
}

// Dano em "força": soldados de patente alta aguentam mais.
function losePower(p, x) {
  const per = p / tierMul();
  const n = Math.floor(per) + (Math.random() < per % 1 ? 1 : 0);
  if (n > 0) loseSoldiers(n, x);
  else g.shake = Math.min(14, g.shake + 3);
}

function promote(divisor, x) {
  g.tier++;
  g.soldiers = Math.max(1, Math.ceil(g.soldiers / divisor));
  const r = rankInfo(g.tier);
  addText(x, PLAYER_Y - 110, '⬆ ' + r.name + '!', r.color, 28);
  burst(x, PLAYER_Y - 10, '#ffd43b', 30, 240);
  g.flash = 0.25; g.flashColor = '#ffe066';
  sfx(440, 0.25, 'triangle', 0.08, 500);
}

function addSoldiers(n) {
  g.soldiers += n;
  while (g.soldiers >= PROMOTE_AT) promote(TIER_POWER, g.x);
}

function gameOver() {
  g.soldiers = 0;
  state = 'over';
  g.overT = 0;
  burst(g.x, PLAYER_Y, '#4dabf7', 40, 260);
  if (g.score > best) {
    best = Math.floor(g.score);
    try { localStorage.setItem('shootlines-best', best); } catch (e) { /* sem storage */ }
  }
  sfx(200, 0.6, 'sawtooth', 0.1, -170);
}

// ---------------------------------------------------------------------------
// Geração de inimigos, portões, caixas e bosses
// ---------------------------------------------------------------------------
function spawnEnemy(typeKey, lane, y) {
  const T = ENEMY_TYPES[typeKey];
  const d = diff();
  const hp = Math.ceil(T.hp * (1 + (d - 1) * 0.45) * enemyScale());
  g.enemies.push({
    id: g.nextId++, type: typeKey, lane, x: LANES[lane], tx: LANES[lane], y,
    hp, maxHp: hp, r: T.r, color: T.color,
    dmg: T.dmg * (1 + (d - 1) * 0.35) * enemyScale(),
    spd: T.spd * worldSpeed() * rand(0.92, 1.08),
    switchCd: T.switcher ? rand(1.5, 3) : Infinity,
    wob: Math.random() * 6, hitT: 0, burn: 0, burnDps: 0, slow: 0, slowF: 1,
  });
}

function spawnWave() {
  const d = diff();
  const types = Object.keys(ENEMY_TYPES).filter(k => ENEMY_TYPES[k].minD <= d);
  const lanesCount = Math.random() < Math.min(0.6, 0.15 + d * 0.08) ? 2 : 1;
  const lanes = shuffle([0, 1, 2]).slice(0, lanesCount);
  for (const lane of lanes) {
    const n = rint(1, Math.min(6, 1 + Math.floor(d)));
    const type = pick(types);
    for (let i = 0; i < n; i++) spawnEnemy(type, lane, -30 - i * (ENEMY_TYPES[type].r * 2 + 8));
  }
}

function goodCell(d) {
  const r = Math.random();
  if (r < 0.35) return { kind: 'add', v: rint(2, Math.min(40, 3 + Math.floor(d * 2))) };
  if (r < 0.48) return { kind: 'mul', v: Math.random() < 0.75 ? 2 : 3 };
  if (r < 0.63) return { kind: 'weapon' };
  if (r < 0.73 && g.soldiers >= 8) return { kind: 'rank' };
  if (r < 0.87) return { kind: 'rate', v: 25 };
  return { kind: 'dmg', v: 30 };
}

function badCell(d) {
  const r = Math.random();
  if (r < 0.5) return { kind: 'add', v: -rint(1, Math.min(30, 2 + Math.floor(d * 1.5))) };
  if (r < 0.65) return { kind: 'div', v: 2 };
  if (r < 0.83) return { kind: 'rate', v: -20 };
  return { kind: 'dmg', v: -20 };
}

function spawnGateRow() {
  const d = diff();
  const goods = g.rows++ < 2 || Math.random() < 0.5 ? 2 : 1;
  const cells = [];
  for (let i = 0; i < 3; i++) cells.push(i < goods ? goodCell(d) : badCell(d));
  shuffle(cells);
  cells.forEach((c, i) => {
    c.lane = i;
    c.prog = 0;
    c.need = 4;      // tiros para +1 (cresce a cada aumento)
    c.pulse = 0;
  });
  g.gates.push({ y: -40, h: 52, cells, used: -1 });
  g.spawnCd = Math.max(g.spawnCd, 1.6);
}

function spawnCrate() {
  const d = diff();
  // a vida da caixa acompanha o poder de fogo: ~1,5 s de tiro concentrado
  const hp = Math.ceil(Math.max(25 * Math.pow(d, 1.6), dps() * rand(1.2, 1.9)));
  const r = Math.random();
  let reward;
  if (r < 0.45) reward = { kind: 'weapon' };
  else if (r < 0.75) reward = { kind: 'add', v: rint(4, Math.min(40, 6 + Math.floor(d * 3))) };
  else reward = { kind: 'rate', v: 35 };
  g.crates.push({ lane: rint(0, 2), y: -40, hp, maxHp: hp, reward, hitT: 0 });
}

function spawnBoss() {
  const n = g.bossesKilled;
  const B = BOSSES[n % BOSSES.length];
  const hp = Math.ceil(700 * B.hp * Math.pow(1.6, n) * enemyScale());
  const lane = 1;
  g.boss = {
    kind: B.kind, name: B.name, color: B.color, lane, x: LANES[lane], tx: LANES[lane],
    y: -160, baseY: 150, mode: 'enter', hp, maxHp: hp, moveCd: 3, atkCd: 2.5, summonCd: 4,
    tele: null, hitT: 0, t: 0, level: n + 1, burn: 0, burnDps: 0,
  };
  g.banner = { text: 'BOSS: ' + B.name, tip: B.tip, life: 2.8 };
  sfx(80, 0.8, 'sawtooth', 0.1, 120);
}

// ---------------------------------------------------------------------------
// Arma: troca, trava e evoluções
// ---------------------------------------------------------------------------
const evolves = () => g.locked || g.weapon >= WEAPONS.length - 1;

function upgradeWeapon(x) {
  if (evolves()) { grantEvo(x); return; }
  g.weapon++;
  const lost = perkLevels() > 0;
  g.perks = {};
  g.lastPerk = null;
  addText(x, PLAYER_Y - 70, WEAPONS[g.weapon].name + '!', '#ffe066', 26);
  if (lost) addText(x, PLAYER_Y - 100, 'Evoluções perdidas', '#ff8787', 16);
}

function grantEvo(x) {
  g.pendingEvo++;
  addText(x, PLAYER_Y - 70, '⭐ Evolução!', '#ffe066', 26);
}

function toggleLock() {
  if (!g || state !== 'play') return;
  g.locked = !g.locked;
  addText(g.x, PLAYER_Y - 100, g.locked ? '🔒 Arma travada' : '🔓 Arma destravada', '#ffe066', 20);
  sfx(g.locked ? 660 : 330, 0.1, 'triangle', 0.06);
}

function openChoice() {
  const avail = Object.keys(PERKS).filter(k => perk(k) < PERK_MAX);
  if (!avail.length) {
    g.pendingEvo--;
    g.dmgMul += 0.3;
    addText(g.x, PLAYER_Y - 70, '+30% dano', '#ffe066', 24);
    return;
  }
  g.choice = { options: shuffle(avail).slice(0, 3), t: 0 };
  state = 'choose';
  sfx(700, 0.2, 'triangle', 0.06, 300);
}

function choosePerk(i) {
  if (state !== 'choose' || !g.choice || g.choice.t < 0.35) return;
  const k = g.choice.options[i];
  if (!k) return;
  g.perks[k] = perk(k) + 1;
  g.lastPerk = k;
  g.pendingEvo--;
  g.choice = null;
  state = 'play';
  addText(g.x, PLAYER_Y - 90, PERKS[k].icon + ' ' + PERKS[k].name + ' ' + perk(k), PERKS[k].color, 20);
  burst(g.x, PLAYER_Y - 10, PERKS[k].color, 24, 220);
  sfx(880, 0.15, 'triangle', 0.07, 400);
}

// ---------------------------------------------------------------------------
// Efeitos de portões / recompensas
// ---------------------------------------------------------------------------
function cellLabel(c) {
  switch (c.kind) {
    case 'add': return (c.v >= 0 ? '+' : '') + c.v;
    case 'mul': return '×' + c.v;
    case 'div': return '÷' + c.v;
    case 'weapon': return evolves() ? '⭐ Evolução' : WEAPONS[g.weapon + 1].name;
    case 'rank': return '⬆ Promover';
    case 'rate': return (c.v > 0 ? '+' : '') + c.v + '% Cadência';
    case 'dmg': return (c.v > 0 ? '+' : '') + c.v + '% Dano';
  }
  return '?';
}

function isGood(c) {
  if (c.kind === 'add' || c.kind === 'rate' || c.kind === 'dmg') return c.v > 0;
  return c.kind !== 'div';
}

function applyEffect(c, x) {
  const good = isGood(c);
  const color = good ? '#8ce99a' : '#ff8787';
  switch (c.kind) {
    case 'add':
      if (c.v >= 0) {
        addText(x, PLAYER_Y - 70, '+' + c.v + ' soldados', color);
        addSoldiers(c.v);
      } else {
        loseSoldiers(-c.v, x);
      }
      break;
    case 'mul':
      addText(x, PLAYER_Y - 70, '×' + c.v + ' soldados!', color, 26);
      addSoldiers(g.soldiers * (c.v - 1));
      break;
    case 'div':
      loseSoldiers(g.soldiers - Math.ceil(g.soldiers / c.v), x);
      break;
    case 'weapon':
      upgradeWeapon(x);
      break;
    case 'rank':
      // promoção pelo portão: ÷4 soldados, mas cada um vale 5× (ganho de 25%)
      promote(4, x);
      break;
    case 'rate':
      // bônus somam (sem limite); penalidades reduzem proporcionalmente
      g.rateMul = c.v > 0 ? g.rateMul + c.v / 100 : Math.max(0.4, g.rateMul * (1 + c.v / 100));
      addText(x, PLAYER_Y - 70, (c.v > 0 ? '+' : '') + c.v + '% cadência', color);
      break;
    case 'dmg':
      g.dmgMul = c.v > 0 ? g.dmgMul + c.v / 100 : Math.max(0.4, g.dmgMul * (1 + c.v / 100));
      addText(x, PLAYER_Y - 70, (c.v > 0 ? '+' : '') + c.v + '% dano', color);
      break;
  }
  if (good) {
    burst(x, PLAYER_Y - 20, '#8ce99a', 16, 180);
    sfx(520, 0.12, 'triangle', 0.07, 400);
  }
}

// ---------------------------------------------------------------------------
// Tiro
// ---------------------------------------------------------------------------
function bulletColor(w) {
  return g.lastPerk ? PERKS[g.lastPerk].color : w.color;
}

function fire() {
  const { w, dmg } = fireStats();
  const n = g.soldiers;
  const shots = Math.min(n, 8);
  const per = dmg * power() / shots;
  const pellets = w.pellets || 1;
  const size = rankSize();
  const shown = shownSoldiers();
  const explosive = perk('explosive');
  const base = {
    color: bulletColor(w), size: w.size * (1 + 0.1 * Math.min(g.tier, 6)),
    pierce: (w.pierce || 0) + perk('pierce'),
    splash: Math.max(w.splash || 0, explosive ? 30 + 12 * explosive : 0),
    splashMul: w.splash ? 0.6 + 0.1 * explosive : 0.3 + 0.1 * explosive,
    bounce: perk('ricochet'), homing: perk('homing'), speed: w.speed,
    trail: perkLevels() > 0,
  };
  const spawn = (vx, vy, dmgB) => {
    const p = FORMATION[Math.floor(Math.random() * shown)];
    g.bullets.push({ ...base, x: g.x + p.x * size, y: PLAYER_Y + p.y * size - 12, vx, vy, dmg: dmgB, hit: null });
  };
  for (let i = 0; i < shots; i++) {
    for (let k = 0; k < pellets; k++) {
      spawn(pellets > 1 ? (k - (pellets - 1) / 2) * 55 : 0, -w.speed, per);
    }
  }
  // Direção aleatória: balas extras espalhadas, podem acertar outras faixas
  for (let i = 0; i < 2 * perk('chaos'); i++) {
    const a = rand(-0.65, 0.65);
    spawn(Math.sin(a) * w.speed, -Math.cos(a) * w.speed, per * 0.6);
  }
  if (g.t - lastShotSfx > 0.09) {
    lastShotSfx = g.t;
    sfx(w.splash || explosive ? 160 : 900, 0.04, 'square', 0.015, -300);
  }
}

function damageEnemy(e, dmg, silent) {
  e.hp -= dmg;
  if (!silent) e.hitT = 0.08;
  if (e.hp <= 0 && !e.dead) {
    e.dead = true;
    g.score += e.maxHp * 10;
    burst(e.x, e.y, e.color, 12, 180);
    if (!silent) sfx(220, 0.07, 'square', 0.03, -120);
    if (perk('recruit') && Math.random() < 0.04 * perk('recruit')) {
      addText(e.x, e.y - 20, '+1 🎖️', '#fcc419', 16);
      addSoldiers(1);
    }
  }
}

function splashAt(x, y, radius, dmg) {
  burst(x, y, '#ffa94d', 10, 200);
  g.rings.push({ x, y, r: radius, life: 0.3, max: 0.3 });
  g.shake = Math.min(6, g.shake + 0.6);
  for (const e of g.enemies) {
    if (!e.dead && Math.hypot(e.x - x, e.y - y) < radius + e.r) damageEnemy(e, dmg, true);
  }
}

function chainFrom(src, dmg, count) {
  const near = g.enemies
    .filter(e => !e.dead && e !== src && Math.hypot(e.x - src.x, e.y - src.y) < 190)
    .sort((a, b) => Math.hypot(a.x - src.x, a.y - src.y) - Math.hypot(b.x - src.x, b.y - src.y))
    .slice(0, count);
  let from = src;
  for (const e of near) {
    g.zaps.push({ x1: from.x, y1: from.y, x2: e.x, y2: e.y, life: 0.15 });
    damageEnemy(e, dmg, true);
    from = e;
  }
}

function rollCrit(dmg, x, y) {
  const c = perk('crit');
  if (!c || Math.random() >= 0.08 * c) return dmg;
  if (g.t - g.lastCritT > 0.3) {
    g.lastCritT = g.t;
    addText(x, y - 30, 'CRÍTICO!', '#ffe066', 15);
  }
  return dmg * 3;
}

function hitEnemy(b, e) {
  const dmg = rollCrit(b.dmg, e.x, e.y);
  damageEnemy(e, dmg);
  if (perk('fire')) { e.burn = 2; e.burnDps = Math.max(e.burnDps, dmg * 0.6 * perk('fire')); }
  if (perk('frost')) { e.slow = 1.5; e.slowF = Math.max(0.4, 1 - 0.12 * perk('frost')); }
  if (b.splash) splashAt(b.x, b.y, b.splash, dmg * b.splashMul);
  if (perk('chain') && Math.random() < 0.2 + 0.06 * perk('chain')) chainFrom(e, dmg * 0.5, perk('chain') + 1);
}

// Ricochete: aponta a bala para o inimigo vivo mais próximo
function retarget(b, from) {
  let bestE = null, bestD = 260;
  for (const e of g.enemies) {
    if (e.dead || e === from || (b.hit && b.hit.has(e.id))) continue;
    const dd = Math.hypot(e.x - from.x, e.y - from.y);
    if (dd < bestD) { bestD = dd; bestE = e; }
  }
  if (!bestE) return false;
  const dx = bestE.x - b.x, dy = bestE.y - b.y, len = Math.hypot(dx, dy) || 1;
  b.vx = dx / len * b.speed;
  b.vy = dy / len * b.speed;
  g.zaps.push({ x1: from.x, y1: from.y, x2: from.x + dx * 0.3, y2: from.y + dy * 0.3, life: 0.1, color: '#b197fc' });
  return true;
}

function steer(b, dt) {
  let tgt = null, bestD = 320;
  for (const e of g.enemies) {
    if (e.dead || e.y > b.y + 10) continue;
    const dd = Math.hypot(e.x - b.x, e.y - b.y);
    if (dd < bestD) { bestD = dd; tgt = e; }
  }
  if (!tgt) return;
  const cur = Math.atan2(b.vy, b.vx);
  const want = Math.atan2(tgt.y - b.y, tgt.x - b.x);
  let da = want - cur;
  while (da > Math.PI) da -= Math.PI * 2;
  while (da < -Math.PI) da += Math.PI * 2;
  const turn = (2 + b.homing * 1.5) * dt;
  const a = cur + clamp(da, -turn, turn);
  b.vx = Math.cos(a) * b.speed;
  b.vy = Math.sin(a) * b.speed;
}

// ---------------------------------------------------------------------------
// Atualização
// ---------------------------------------------------------------------------
function update(dt) {
  g.t += dt;
  const d = diff();
  const ws = worldSpeed();
  g.scroll = (g.scroll + ws * dt) % 160;
  g.dist += ws * dt / 20;
  g.score += ws * dt * 0.1;
  g.shake = Math.max(0, g.shake - dt * 30);
  g.flash = Math.max(0, g.flash - dt);

  // Movimento do esquadrão
  g.x += (LANES[g.lane] - g.x) * Math.min(1, dt * 14);
  const myLane = nearestLane(g.x);

  // Tiro automático
  g.fireCd -= dt;
  if (g.fireCd <= 0) {
    fire();
    g.fireCd = 1 / fireStats().fireRate;
  }

  // Spawns
  if (!g.boss) {
    g.bossCd -= dt;
    if (g.bossCd <= 0) spawnBoss();
  }
  g.spawnCd -= dt;
  if (g.spawnCd <= 0) {
    spawnWave();
    const base = Math.max(0.55, 2.2 - d * 0.22);
    g.spawnCd = g.boss ? base * 2.2 : base;
  }
  if (!g.boss) {
    g.gateCd -= dt;
    if (g.gateCd <= 0) { spawnGateRow(); g.gateCd = rand(5.5, 8); }
    g.crateCd -= dt;
    if (g.crateCd <= 0) { spawnCrate(); g.crateCd = rand(9, 14); }
  }

  // Projéteis do jogador
  for (const b of g.bullets) {
    if (b.homing) steer(b, dt);
    b.px = b.x; b.py = b.y;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }

  // Colisões de projéteis
  for (const b of g.bullets) {
    if (b.dead) continue;

    // Portões de soma absorvem tiros e aumentam de valor
    for (const row of g.gates) {
      if (row.used >= 0 || Math.abs(b.y - row.y) > row.h / 2) continue;
      const c = row.cells[nearestLane(b.x)];
      if (c.kind !== 'add' || Math.abs(b.x - LANES[c.lane]) > LANE_HALF) continue;
      c.prog++;
      if (c.prog >= c.need) {
        c.prog = 0;
        c.v++;
        c.need *= 1.12;
        c.pulse = 0.15;
      }
      b.dead = true;
      break;
    }
    if (b.dead) continue;

    // Caixas
    for (const cr of g.crates) {
      if (cr.dead || Math.abs(b.x - LANES[cr.lane]) > 30 || Math.abs(b.y - cr.y) > 28) continue;
      cr.hp -= b.dmg;
      cr.hitT = 0.08;
      b.dead = true;
      if (cr.hp <= 0) {
        cr.dead = true;
        burst(LANES[cr.lane], cr.y, '#c49a6c', 20, 220);
        applyEffect(cr.reward, g.x);
      }
      break;
    }
    if (b.dead) continue;

    // Pedras do Golem podem ser destruídas
    for (const p of g.projectiles) {
      if (p.dead || !p.hp || Math.abs(b.x - p.x) > p.r + 6 || Math.abs(b.y - p.y) > p.r + 6) continue;
      p.hp -= b.dmg;
      b.dead = true;
      if (p.hp <= 0) {
        p.dead = true;
        burst(p.x, p.y, '#a0522d', 14, 200);
        g.score += 50;
      }
      break;
    }
    if (b.dead) continue;

    // Inimigos
    for (const e of g.enemies) {
      if (e.dead || Math.abs(b.x - e.x) > e.r + b.size || Math.abs(b.y - e.y) > e.r + b.size) continue;
      b.hit = b.hit || new Set();
      if (b.hit.has(e.id)) continue;
      b.hit.add(e.id);
      hitEnemy(b, e);
      if (b.pierce > 0) { b.pierce--; continue; }
      if (b.bounce > 0 && retarget(b, e)) { b.bounce--; break; }
      b.dead = true;
      break;
    }
    if (b.dead) continue;

    // Boss
    const bo = g.boss;
    if (bo && bo.y > 0 && Math.abs(b.x - bo.x) < 70 && Math.abs(b.y - bo.y) < 70) {
      const dmg = rollCrit(b.dmg, bo.x, bo.y);
      bo.hp -= dmg;
      bo.hitT = 0.06;
      if (perk('fire')) { bo.burn = 2; bo.burnDps = Math.max(bo.burnDps, dmg * 0.6 * perk('fire')); }
      if (b.splash) {
        bo.hp -= dmg * b.splashMul;
        g.rings.push({ x: b.x, y: b.y, r: b.splash, life: 0.3, max: 0.3 });
      }
      b.dead = true;
    }
  }
  g.bullets = g.bullets.filter(b => !b.dead && b.y > -40 && b.y < H + 20 && b.x > -80 && b.x < W + 80);

  // Inimigos
  for (const e of g.enemies) {
    if (e.dead) continue;
    if (e.burn > 0) {
      e.burn -= dt;
      damageEnemy(e, e.burnDps * dt, true);
      if (Math.random() < dt * 12) g.particles.push({ x: e.x + rand(-e.r, e.r) * 0.6, y: e.y, vx: 0, vy: -60, life: 0.4, color: pick(['#ff922b', '#ffd43b', '#ff6b6b']), r: rand(2, 4), up: true });
      if (e.dead) continue;
    }
    if (e.slow > 0) e.slow -= dt;
    const slowF = e.slow > 0 ? e.slowF : 1;
    e.y += e.spd * slowF * dt;
    e.wob += dt * 8 * slowF;
    e.hitT = Math.max(0, e.hitT - dt);
    e.switchCd -= dt;
    if (e.switchCd <= 0 && e.y < PLAYER_Y - 200) {
      e.switchCd = rand(1.5, 3);
      const target = myLane === e.lane ? clamp(e.lane + pick([-1, 1]), 0, 2) : myLane;
      e.lane = clamp(e.lane + Math.sign(target - e.lane), 0, 2);
      e.tx = LANES[e.lane];
    }
    e.x += (e.tx - e.x) * Math.min(1, dt * 5);
    if (e.y + e.r >= PLAYER_Y - 25 && Math.abs(e.x - g.x) < 60) {
      e.dead = true;
      burst(e.x, e.y, e.color, 14, 200);
      losePower(e.dmg, g.x);
      if (state !== 'play') return;
    }
  }
  g.enemies = g.enemies.filter(e => !e.dead && e.y < H + 50);

  // Portões
  for (const row of g.gates) {
    row.y += ws * dt;
    for (const c of row.cells) c.pulse = Math.max(0, c.pulse - dt);
    if (row.used < 0 && row.y >= PLAYER_Y - 10) {
      row.used = myLane;
      applyEffect(row.cells[myLane], g.x);
      if (state !== 'play') return;
    }
  }
  g.gates = g.gates.filter(r => r.y < H + 60);

  // Caixas
  for (const cr of g.crates) {
    cr.y += ws * dt;
    cr.hitT = Math.max(0, cr.hitT - dt);
  }
  g.crates = g.crates.filter(c => !c.dead && c.y < H + 40);

  // Boss
  if (g.boss && g.boss.burn > 0) {
    g.boss.burn -= dt;
    g.boss.hp -= g.boss.burnDps * dt;
  }
  updateBoss(dt, myLane);
  if (state !== 'play') return;

  // Projéteis do boss
  for (const p of g.projectiles) {
    p.y += p.vy * dt;
    p.rot += dt * 10;
    if (!p.dead && p.y >= PLAYER_Y - 20 && p.y <= PLAYER_Y + 20 && Math.abs(p.x - g.x) < 60) {
      p.dead = true;
      burst(p.x, p.y, p.color, 20, 220);
      loseSoldiers(Math.max(2, Math.ceil(g.soldiers * p.power)), g.x);
      if (state !== 'play') return;
    }
  }
  g.projectiles = g.projectiles.filter(p => !p.dead && p.y < H + 40);

  // Partículas, textos e efeitos
  for (const p of g.particles) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= 0.92; p.vy *= 0.92;
    p.life -= dt;
  }
  g.particles = g.particles.filter(p => p.life > 0);
  if (g.particles.length > 600) g.particles.splice(0, g.particles.length - 600);
  for (const t of g.texts) { t.y -= 40 * dt; t.life -= dt; }
  g.texts = g.texts.filter(t => t.life > 0);
  for (const z of g.zaps) z.life -= dt;
  g.zaps = g.zaps.filter(z => z.life > 0);
  for (const r of g.rings) r.life -= dt;
  g.rings = g.rings.filter(r => r.life > 0);
  if (g.banner) { g.banner.life -= dt; if (g.banner.life <= 0) g.banner = null; }

  if (g.pendingEvo > 0) openChoice();
}

const SHOTS = {
  spike: { r: 16, color: '#ff6b6b', power: 0.25, spd: 430 },
  web:   { r: 18, color: '#e9ecef', power: 0.2,  spd: 380 },
  rock:  { r: 22, color: '#a0522d', power: 0.3,  spd: 300, hp: true },
  fire:  { r: 17, color: '#ff922b', power: 0.25, spd: 460 },
};

function bossAttack(bo, myLane) {
  const target = Math.random() < 0.75 ? myLane : rint(0, 2);
  const others = [0, 1, 2].filter(l => l !== target);
  switch (bo.kind) {
    case 'beetle': {
      const lanes = [target];
      if (bo.level >= 2 && Math.random() < 0.4) lanes.push(pick(others));
      bo.tele = { lanes, t: 0.9, shot: 'spike' };
      bo.atkCd = Math.max(1.1, 2.6 - bo.level * 0.2);
      break;
    }
    case 'spider':
      bo.tele = { lanes: [target], t: 0.8, shot: 'web' };
      bo.atkCd = Math.max(1.2, 2.8 - bo.level * 0.2);
      break;
    case 'worm':
      // vai até a faixa do jogador e investe
      bo.lane = myLane;
      bo.tx = LANES[myLane];
      bo.tele = { lanes: [myLane], t: 1.1, charge: true };
      bo.atkCd = Math.max(1.8, 3.4 - bo.level * 0.2);
      break;
    case 'golem':
      bo.tele = { lanes: [target, pick(others)], t: 1.0, shot: 'rock' };
      bo.atkCd = Math.max(1.6, 3.2 - bo.level * 0.2);
      break;
    case 'hydra': {
      // ataca duas faixas, sobra uma segura
      const safe = rint(0, 2);
      bo.tele = { lanes: [0, 1, 2].filter(l => l !== safe), t: 1.1, shot: 'fire' };
      bo.atkCd = Math.max(1.4, 2.6 - bo.level * 0.15);
      break;
    }
  }
}

function bossFire(bo) {
  const S = SHOTS[bo.tele.shot];
  for (const l of bo.tele.lanes) {
    g.projectiles.push({
      kind: bo.tele.shot, x: LANES[l], y: bo.y + 50, vy: S.spd + bo.level * 25, r: S.r, rot: 0,
      color: S.color, power: S.power, hp: S.hp ? Math.ceil(30 * diff() * enemyScale()) : 0,
    });
  }
  sfx(300, 0.15, 'sawtooth', 0.06, -200);
}

function updateBoss(dt, myLane) {
  const bo = g.boss;
  if (!bo) return;
  bo.t += dt;
  bo.hitT = Math.max(0, bo.hitT - dt);
  bo.x += (bo.tx - bo.x) * Math.min(1, dt * 3);
  if (bo.mode !== 'enter') bo.baseY += 4 * dt;   // avança lentamente

  if (bo.mode === 'enter') {
    bo.y += 110 * dt;
    if (bo.y >= bo.baseY) bo.mode = 'idle';
  } else if (bo.mode === 'charge') {
    bo.y += (520 + bo.level * 40) * dt;
    if (bo.y >= PLAYER_Y - 140) {
      bo.mode = 'return';
      g.shake = 16;
      burst(bo.x, bo.y + 60, bo.color, 24, 260);
      sfx(90, 0.3, 'sawtooth', 0.1, -40);
      if (myLane === bo.lane) {
        loseSoldiers(Math.max(3, Math.ceil(g.soldiers * 0.4)), g.x);
        if (state !== 'play') return;
      }
    }
  } else if (bo.mode === 'return') {
    bo.y -= 280 * dt;
    if (bo.y <= bo.baseY) { bo.y = bo.baseY; bo.mode = 'idle'; }
  } else {
    bo.y = bo.baseY;
  }

  if (bo.mode === 'idle' && !bo.tele) {
    bo.moveCd -= dt;
    if (bo.moveCd <= 0) {
      bo.moveCd = rand(2.2, 3.8) / (1 + bo.level * 0.1);
      bo.lane = pick([0, 1, 2].filter(l => l !== bo.lane));
      bo.tx = LANES[bo.lane];
    }
    bo.atkCd -= dt;
    if (bo.atkCd <= 0) bossAttack(bo, myLane);
  }

  if (bo.tele) {
    bo.tele.t -= dt;
    if (bo.tele.t <= 0) {
      if (bo.tele.charge) {
        bo.mode = 'charge';
        sfx(120, 0.4, 'sawtooth', 0.08, 200);
      } else {
        bossFire(bo);
      }
      bo.tele = null;
    }
  }

  if (bo.kind === 'spider' && bo.mode !== 'enter') {
    bo.summonCd -= dt;
    if (bo.summonCd <= 0) {
      bo.summonCd = Math.max(3, 6 - bo.level * 0.3);
      const lanes = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, 2);
      for (const l of lanes) for (let i = 0; i < 2; i++) spawnEnemy('runner', l, bo.y + 40 - i * 26);
      addText(bo.x, bo.y + 80, 'Filhotes!', '#e599f7', 18);
    }
  }

  if (bo.baseY + 60 >= PLAYER_Y - 30) {
    loseSoldiers(g.soldiers, g.x);
    return;
  }

  if (bo.hp <= 0) {
    for (let i = 0; i < 6; i++) burst(bo.x + rand(-50, 50), bo.y + rand(-40, 40), i % 2 ? bo.color : '#ffd43b', 20, 300);
    g.shake = 18;
    g.flash = 0.4; g.flashColor = '#ffffff';
    g.score += 5000 * bo.level;
    const bonus = 10 + 5 * bo.level;
    addText(W / 2, 300, 'BOSS DERROTADO!', '#ffe066', 34);
    addText(W / 2, 340, '+' + bonus + ' soldados', '#8ce99a', 20);
    addSoldiers(bonus);
    upgradeWeapon(g.x);
    g.bossesKilled++;
    g.boss = null;
    g.projectiles = [];
    g.bossCd = BOSS_EVERY;
    g.gateCd = 1.5;
    sfx(150, 0.9, 'sawtooth', 0.1, -120);
  }
}

// ---------------------------------------------------------------------------
// Desenho (perspectiva 3D)
// ---------------------------------------------------------------------------
const FAR = -560, NEAR = 900;

function proj(x, y) {
  const z = CAM_C - y;
  const s = CAM_ZP / z;
  return { x: W / 2 + (x - W / 2) * s, y: CAM_A + CAM_K / z, s };
}

// Posiciona o contexto no ponto (x, y) do chão, já com a escala da distância.
function at(x, y, extra = 1) {
  const p = proj(x, y);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s * extra, p.s * extra);
  return p;
}

// Retângulo do chão projetado (vira um trapézio)
function quad(x0, y0, x1, y1) {
  const a = proj(x0, y0), b = proj(x1, y0), c = proj(x1, y1), d = proj(x0, y1);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y);
  ctx.closePath();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(x, y, r) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

function ellipse(x, y, rx, ry) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}

function text(str, x, y, size, color, align = 'center', weight = 800) {
  ctx.font = `${weight} ${size}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(2, size / 6);
  ctx.strokeStyle = 'rgba(0,0,0,.65)';
  ctx.strokeText(str, x, y);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

function drawTree(x, y) {
  at(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ellipse(0, 0, 30, 9);
  ctx.fillStyle = '#5c3d2e';
  ctx.fillRect(-6, -40, 12, 40);
  ctx.fillStyle = '#2b8a3e';
  circle(0, -62, 30);
  ctx.fillStyle = '#37b24d';
  circle(-10, -72, 18);
  ctx.restore();
}

function drawGround(scroll) {
  const gg = ctx.createLinearGradient(0, 0, 0, H);
  gg.addColorStop(0, '#1d3a2a');
  gg.addColorStop(1, '#2f6b3f');
  ctx.fillStyle = gg;
  ctx.fillRect(0, 0, W, H);

  // faixas de grama
  ctx.fillStyle = 'rgba(0,0,0,.09)';
  for (let y = FAR - 160 + scroll; y < NEAR; y += 160) { quad(-900, y, W + 900, y + 80); ctx.fill(); }

  // estrada
  for (let i = 0; i < 3; i++) {
    quad(i * 150, FAR, i * 150 + 150, NEAR);
    ctx.fillStyle = i % 2 ? '#3a425c' : '#353c54';
    ctx.fill();
  }
  // meio-fio listrado
  for (let y = FAR - 80 + (scroll % 80); y < NEAR; y += 40) {
    const red = Math.floor((y - scroll) / 40) % 2 === 0;
    ctx.fillStyle = red ? '#e03131' : '#f1f3f5';
    quad(-16, y, 0, y + 40); ctx.fill();
    quad(W, y, W + 16, y + 40); ctx.fill();
  }
  // linhas das faixas
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  for (const lx of [150, 300]) {
    for (let y = FAR - 80 + (scroll % 80); y < NEAR; y += 80) { quad(lx - 3, y, lx + 3, y + 40); ctx.fill(); }
  }
  // árvores nas laterais (de longe para perto)
  for (let y = FAR - 240 + (scroll * 1.5 % 240); y < NEAR; y += 240) {
    drawTree(-70, y);
    drawTree(W + 70, y + 120);
  }
}

function drawFog() {
  const fg = ctx.createLinearGradient(0, 0, 0, 230);
  fg.addColorStop(0, 'rgba(18, 24, 38, 1)');
  fg.addColorStop(0.35, 'rgba(18, 24, 38, .75)');
  fg.addColorStop(1, 'rgba(18, 24, 38, 0)');
  ctx.fillStyle = fg;
  ctx.fillRect(0, 0, W, 230);
}

function drawSoldier(rank, leader, bob, tier) {
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ellipse(0, 0, 7, 3);
  ctx.fillStyle = '#343a40';
  ctx.fillRect(-4.5, -8, 3.5, 8);
  ctx.fillRect(1, -8, 3.5, 8);
  ctx.fillStyle = rank.color;
  roundRect(-6.5, -18 + bob, 13, 12, 4);
  ctx.fill();
  // divisas da patente nas costas
  if (tier > 0) {
    ctx.strokeStyle = tier >= RANKS.length - 1 ? '#fab005' : '#fff';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < Math.min(tier, 3); i++) {
      ctx.beginPath();
      ctx.moveTo(-4, -15.5 + i * 3 + bob);
      ctx.lineTo(0, -12.5 + i * 3 + bob);
      ctx.lineTo(4, -15.5 + i * 3 + bob);
      ctx.stroke();
    }
  }
  ctx.fillStyle = '#212529';
  ctx.fillRect(3.5, -28 + bob, 3, 13);
  ctx.fillStyle = '#ffd8a8';
  circle(0, -21 + bob, 4.2);
  ctx.fillStyle = leader ? '#fab005' : rank.helmet;
  circle(0, -22.5 + bob, 4.6);
}

function drawSquad() {
  const rank = rankInfo(g.tier);
  const size = rankSize();
  const n = shownSoldiers();
  const idx = [];
  for (let i = 0; i < n; i++) idx.push(i);
  idx.sort((a, b) => FORMATION[a].y - FORMATION[b].y);
  for (const i of idx) {
    const p = FORMATION[i];
    at(g.x + p.x * size, PLAYER_Y + p.y * size, size);
    drawSoldier(rank, i === 0, Math.sin(g.t * 14 + i) * 1.3, g.tier);
    ctx.restore();
  }
  const lp = proj(g.x, PLAYER_Y - 45 * size);
  const label = fmt(g.soldiers);
  const bw = 22 + label.length * 11;
  roundRect(lp.x - bw / 2, lp.y - 40, bw, 26, 13);
  ctx.fillStyle = rank.helmet;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = rank.color;
  ctx.stroke();
  text(label, lp.x, lp.y - 27, 18, '#fff');
  if (g.tier > 0) text(rank.name, lp.x, lp.y - 52, 13, rank.color);
}

function drawEnemy(e) {
  at(e.x, e.y);
  const r = e.r;
  const wob = Math.sin(e.wob);
  const cy = -r - 4 - Math.abs(wob) * 3;
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ellipse(0, 0, r, r * 0.35);
  // patas
  ctx.strokeStyle = e.color;
  ctx.lineWidth = Math.max(2, r / 6);
  ctx.lineCap = 'round';
  for (let s = -1; s <= 1; s += 2) {
    for (let k = 0; k < 2; k++) {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.5, cy + r * 0.3 + k * 5);
      ctx.lineTo(s * (r + 5), -k * 4 + wob * s * 3);
      ctx.stroke();
    }
  }
  ctx.fillStyle = e.hitT > 0 ? '#ffffff' : e.color;
  circle(0, cy, r);
  ctx.fillStyle = 'rgba(0,0,0,.2)';
  ctx.beginPath(); ctx.arc(0, cy + r * 0.25, r * 0.75, 0, Math.PI); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.25)';
  circle(-r * 0.35, cy - r * 0.45, r * 0.25);
  if (e.type === 'brute' || e.type === 'tank') {
    ctx.fillStyle = '#f8f9fa';
    for (let s = -1; s <= 1; s += 2) {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.5, cy - r * 0.7);
      ctx.lineTo(s * r * 0.85, cy - r * 1.25);
      ctx.lineTo(s * r * 0.2, cy - r * 0.85);
      ctx.fill();
    }
  }
  const er = Math.max(3, r * 0.28);
  for (let s = -1; s <= 1; s += 2) {
    ctx.fillStyle = '#fff';
    circle(s * r * 0.38, cy - r * 0.1, er);
    ctx.fillStyle = '#c92a2a';
    circle(s * r * 0.38, cy - r * 0.1 + er * 0.35, er * 0.55);
  }
  if (e.slow > 0) {
    ctx.fillStyle = 'rgba(165, 216, 255, .45)';
    circle(0, cy, r);
    ctx.strokeStyle = '#e7f5ff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  if (e.burn > 0) {
    for (let i = 0; i < 3; i++) {
      const fx = (i - 1) * r * 0.5;
      ctx.fillStyle = i % 2 ? '#ffd43b' : '#ff922b';
      ctx.beginPath();
      ctx.moveTo(fx - r * 0.25, cy - r * 0.55);
      ctx.lineTo(fx + r * 0.25, cy - r * 0.55);
      ctx.lineTo(fx, cy - r - 6 - Math.random() * 8);
      ctx.closePath();
      ctx.fill();
    }
  }
  if (e.hp < e.maxHp) {
    const bw = r * 2;
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.fillRect(-bw / 2, cy - r - 10, bw, 4);
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(-bw / 2, cy - r - 10, bw * Math.max(0, e.hp / e.maxHp), 4);
  }
  ctx.restore();
}

function drawGateRow(row) {
  for (const c of row.cells) {
    at(LANES[c.lane], row.y);
    const used = row.used >= 0;
    const good = isGood(c);
    const grow = c.pulse > 0 ? 4 : 0;
    ctx.globalAlpha = used ? (row.used === c.lane ? 0.25 : 0.12) : 1;
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.fillRect(-70, -4, 140, 8);
    // campo de força até o chão
    ctx.fillStyle = good ? 'rgba(140, 233, 154, .16)' : 'rgba(255, 135, 135, .16)';
    ctx.fillRect(-64, -30, 128, 30);
    // postes
    ctx.fillStyle = good ? '#2b8a3e' : '#a61e4d';
    ctx.fillRect(-72, -90, 8, 90);
    ctx.fillRect(64, -90, 8, 90);
    // painel
    roundRect(-68 - grow, -88 - grow, 136 + grow * 2, 58 + grow * 2, 8);
    ctx.fillStyle = good ? 'rgba(55, 178, 77, .75)' : 'rgba(224, 49, 49, .75)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = good ? '#8ce99a' : '#ffa8a8';
    ctx.stroke();
    const label = cellLabel(c);
    let size = 26;
    ctx.font = `800 ${size}px system-ui, sans-serif`;
    while (size > 11 && ctx.measureText(label).width > 122) {
      size--;
      ctx.font = `800 ${size}px system-ui, sans-serif`;
    }
    text(label, 0, c.kind === 'add' ? -63 : -59, size, '#fff');
    if (c.kind === 'add' && !used) {
      ctx.fillStyle = 'rgba(0,0,0,.4)';
      ctx.fillRect(-40, -44, 80, 5);
      ctx.fillStyle = '#fff';
      ctx.fillRect(-40, -44, 80 * (c.prog / c.need), 5);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

function drawCrate(cr) {
  at(LANES[cr.lane], cr.y);
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ellipse(0, 0, 32, 9);
  // tampa
  ctx.fillStyle = cr.hitT > 0 ? '#fff4e6' : '#c8956a';
  ctx.beginPath();
  ctx.moveTo(-26, -50); ctx.lineTo(26, -50); ctx.lineTo(19, -61); ctx.lineTo(-19, -61);
  ctx.closePath(); ctx.fill();
  // frente
  ctx.fillStyle = cr.hitT > 0 ? '#fff4e6' : '#a47148';
  ctx.fillRect(-26, -50, 52, 50);
  ctx.strokeStyle = '#6b4226';
  ctx.lineWidth = 3;
  ctx.strokeRect(-26, -50, 52, 50);
  ctx.beginPath();
  ctx.moveTo(-26, -50); ctx.lineTo(26, 0);
  ctx.moveTo(26, -50); ctx.lineTo(-26, 0);
  ctx.stroke();
  const icon = cr.reward.kind === 'weapon' ? (evolves() ? '⭐' : '🔫') : cr.reward.kind === 'add' ? '👥' : '⚡';
  ctx.font = '24px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, 0, -25);
  text(fmt(Math.ceil(cr.hp)), 0, 14, 15, '#ffe8cc');
  ctx.restore();
}

function drawTelegraph() {
  const bo = g.boss;
  if (!bo || !bo.tele) return;
  const a = 0.18 + 0.14 * Math.sin(g.t * 30);
  for (const l of bo.tele.lanes) {
    ctx.fillStyle = bo.tele.charge ? `rgba(255, 120, 0, ${a})` : `rgba(255, 40, 40, ${a})`;
    quad(LANES[l] - 73, bo.y, LANES[l] + 73, PLAYER_Y + 70);
    ctx.fill();
    const p = proj(LANES[l], PLAYER_Y - 170);
    text('⚠', p.x, p.y, 40 * p.s, '#ff6b6b');
  }
}

function drawBeetle(bo, col, pul) {
  ctx.strokeStyle = col;
  ctx.lineWidth = 7;
  for (let s = -1; s <= 1; s += 2) {
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(s * 35, -15 + k * 18);
      ctx.quadraticCurveTo(s * 80, -30 + k * 22 + pul * s, s * 75, 10 + k * 22);
      ctx.stroke();
    }
  }
  ctx.fillStyle = col;
  ellipse(0, 0, 58, 50 + pul);
  ctx.fillStyle = 'rgba(0,0,0,.2)';
  ctx.beginPath(); ctx.ellipse(0, 12, 44, 30, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#ffd43b';
  ctx.beginPath();
  ctx.moveTo(-30, -42); ctx.lineTo(-22, -68); ctx.lineTo(-8, -50); ctx.lineTo(0, -74);
  ctx.lineTo(8, -50); ctx.lineTo(22, -68); ctx.lineTo(30, -42);
  ctx.closePath(); ctx.fill();
  for (let s = -1; s <= 1; s += 2) {
    ctx.fillStyle = '#fff'; circle(s * 20, -10, 11);
    ctx.fillStyle = '#e03131'; circle(s * 20, -6, 6);
  }
  ctx.fillStyle = '#212529';
  ellipse(0, 20, 22, 8 + Math.abs(pul));
}

function drawSpider(bo, col, pul) {
  ctx.strokeStyle = '#3b1446';
  ctx.lineWidth = 6;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (let s = -1; s <= 1; s += 2) {
    for (let k = 0; k < 4; k++) {
      const ky = -20 + k * 16;
      ctx.beginPath();
      ctx.moveTo(s * 20, ky);
      ctx.lineTo(s * (70 + k * 4), ky - 40 + Math.sin(bo.t * 6 + k + s) * 6);
      ctx.lineTo(s * (92 + k * 6), ky + 42 + k * 6);
      ctx.stroke();
    }
  }
  ctx.fillStyle = col;
  ellipse(0, -28, 52, 46 + pul);
  ctx.fillStyle = '#e03131';
  ctx.beginPath();
  ctx.moveTo(-12, -48); ctx.lineTo(12, -48); ctx.lineTo(0, -30);
  ctx.lineTo(12, -12); ctx.lineTo(-12, -12); ctx.lineTo(0, -30);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = col;
  circle(0, 28, 30);
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  circle(0, 28, 30);
  ctx.fillStyle = '#ff4d4d';
  for (const [ex, ey] of [[-14, 22], [14, 22], [-6, 15], [6, 15], [-21, 30], [21, 30]]) circle(ex, ey, 4.5);
  ctx.fillStyle = '#f8f9fa';
  for (let s = -1; s <= 1; s += 2) {
    ctx.beginPath();
    ctx.moveTo(s * 4, 46); ctx.lineTo(s * 13, 46); ctx.lineTo(s * 8, 62 + pul);
    ctx.closePath(); ctx.fill();
  }
}

function drawWorm(bo, col, pul) {
  for (let i = 5; i >= 1; i--) {
    const sx = Math.sin(bo.t * 3 - i * 0.8) * 10;
    ctx.fillStyle = col;
    circle(sx, -i * 26, 46 - i * 4);
    ctx.fillStyle = i % 2 ? 'rgba(0,0,0,.22)' : 'rgba(255,255,255,.08)';
    circle(sx, -i * 26, 46 - i * 4);
  }
  ctx.fillStyle = col;
  circle(0, 10, 52);
  ctx.fillStyle = '#2b0a12';
  circle(0, 20, 30 + pul);
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    const r = 30 + pul;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a - 0.2) * r, 20 + Math.sin(a - 0.2) * r);
    ctx.lineTo(Math.cos(a + 0.2) * r, 20 + Math.sin(a + 0.2) * r);
    ctx.lineTo(Math.cos(a) * r * 0.62, 20 + Math.sin(a) * r * 0.62);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#ffe066';
  circle(-34, -16, 7);
  circle(34, -16, 7);
}

const GOLEM_SHAPE = [1, 0.88, 1.06, 0.92, 1, 0.95, 1.08, 0.9, 1.02];
function drawGolem(bo, col, pul, flick) {
  const rock = flick ? '#fff' : '#6b5a48';
  ctx.fillStyle = flick ? '#fff' : '#584838';
  for (let s = -1; s <= 1; s += 2) circle(s * 76, 18 + pul * s, 25);
  ctx.fillStyle = rock;
  ctx.beginPath();
  GOLEM_SHAPE.forEach((m, i) => {
    const a = i / GOLEM_SHAPE.length * Math.PI * 2 - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * 60 * m, Math.sin(a) * 56 * m);
  });
  ctx.closePath(); ctx.fill();
  ctx.shadowColor = '#ff922b';
  ctx.shadowBlur = 12;
  ctx.strokeStyle = '#ff922b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-40, -20); ctx.lineTo(-18, 2); ctx.lineTo(-30, 30);
  ctx.moveTo(42, -26); ctx.lineTo(22, 0); ctx.lineTo(34, 28);
  ctx.moveTo(-6, 30); ctx.lineTo(8, 46);
  ctx.moveTo(-82, 10); ctx.lineTo(-70, 26);
  ctx.moveTo(82, 10); ctx.lineTo(70, 26);
  ctx.stroke();
  ctx.fillStyle = '#ffd43b';
  ctx.fillRect(-26, -22, 16, 8);
  ctx.fillRect(10, -22, 16, 8);
  ctx.fillStyle = col;
  ctx.fillRect(-16, 10, 32, 6 + Math.abs(pul));
  ctx.shadowBlur = 0;
}

function drawHydra(bo, col, pul) {
  const heads = [[-58, -52], [0, -78], [58, -52]];
  ctx.strokeStyle = col;
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  heads.forEach(([hx, hy], i) => {
    const sx = hx + Math.sin(bo.t * 3 + i * 2) * 8;
    ctx.beginPath();
    ctx.moveTo(hx * 0.3, 20);
    ctx.quadraticCurveTo(hx * 0.95, 0, sx, hy);
    ctx.stroke();
  });
  ctx.fillStyle = col;
  ellipse(0, 36, 62, 34 + pul * 0.5);
  ctx.fillStyle = 'rgba(0,0,0,.2)';
  ellipse(0, 46, 46, 18);
  heads.forEach(([hx, hy], i) => {
    const sx = hx + Math.sin(bo.t * 3 + i * 2) * 8;
    ctx.fillStyle = col;
    ellipse(sx, hy, 22, 18);
    ctx.fillStyle = bo.tele ? '#ff922b' : '#1b1b3a';
    ellipse(sx, hy + 10, 11, 5 + (bo.tele ? 3 : 0));
    ctx.fillStyle = '#ffe066';
    circle(sx - 8, hy - 5, 4);
    circle(sx + 8, hy - 5, 4);
  });
}

const BOSS_DRAW = { beetle: drawBeetle, spider: drawSpider, worm: drawWorm, golem: drawGolem, hydra: drawHydra };

function drawBoss() {
  const bo = g.boss;
  at(bo.x, bo.y, 1.5);
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ellipse(0, 0, 70, 18);
  ctx.translate(0, -60);
  const flick = bo.hitT > 0 && Math.floor(bo.t * 30) % 4 === 0;
  const col = flick ? '#ffffff' : bo.color;
  BOSS_DRAW[bo.kind](bo, col, Math.sin(bo.t * 4) * 3, flick);
  ctx.restore();
}

function drawProjectiles() {
  for (const p of g.projectiles) {
    at(p.x, p.y);
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ellipse(0, 0, p.r, p.r * 0.3);
    ctx.translate(0, -24);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.kind === 'web') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-p.r, 0); ctx.lineTo(p.r, 0);
        ctx.stroke();
        ctx.rotate(Math.PI / 4);
      }
      ctx.beginPath(); ctx.arc(0, 0, p.r * 0.6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.stroke();
    } else if (p.kind === 'rock') {
      ctx.beginPath();
      GOLEM_SHAPE.forEach((m, i) => {
        const a = i / GOLEM_SHAPE.length * Math.PI * 2;
        ctx.lineTo(Math.cos(a) * p.r * m, Math.sin(a) * p.r * m);
      });
      ctx.closePath(); ctx.fill();
      ctx.rotate(-p.rot);
      text(fmt(Math.ceil(p.hp)), 0, 0, 13, '#ffe8cc');
    } else if (p.kind === 'fire') {
      ctx.fillStyle = 'rgba(255, 146, 43, .5)';
      circle(0, 0, p.r * 1.3);
      ctx.fillStyle = p.color;
      circle(0, 0, p.r);
      ctx.fillStyle = '#ffe066';
      circle(0, 0, p.r * 0.5);
    } else {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? p.r * 0.5 : p.r;
        const a = i * Math.PI / 5;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
}

function drawBullets() {
  ctx.lineCap = 'round';
  for (const b of g.bullets) {
    const p = proj(b.x, b.y);
    const s = b.size * p.s;
    const y = p.y - 16 * p.s;
    if (b.trail) {
      const q = proj(b.x - b.vx * 0.035, b.y - b.vy * 0.035);
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = b.color;
      ctx.lineWidth = s * 1.3;
      ctx.beginPath();
      ctx.moveTo(q.x, q.y - 16 * q.s);
      ctx.lineTo(p.x, y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = b.color;
    if (b.splash) {
      ctx.globalAlpha = 0.3;
      circle(p.x, y, s * 2.2);
      ctx.globalAlpha = 1;
      circle(p.x, y, s);
    } else if (b.vx) {
      circle(p.x, y, s * 0.9);
    } else {
      ctx.fillRect(p.x - s / 2, y - s * 2.5, s, s * 5);
    }
  }
}

function drawEffects() {
  for (const r of g.rings) {
    const p = proj(r.x, r.y);
    const k = 1 - r.life / r.max;
    const rx = r.r * p.s * (0.3 + 0.7 * k);
    ctx.globalAlpha = r.life / r.max;
    ctx.fillStyle = 'rgba(255, 170, 80, .25)';
    ctx.strokeStyle = '#ffa94d';
    ctx.lineWidth = 3 * p.s;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y - 10 * p.s, rx, rx * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  for (const z of g.zaps) {
    const a = proj(z.x1, z.y1), b = proj(z.x2, z.y2);
    const ay = a.y - 20 * a.s, by = b.y - 20 * b.s;
    ctx.globalAlpha = Math.min(1, z.life * 8);
    ctx.strokeStyle = z.color || '#a5d8ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(a.x, ay);
    for (let i = 1; i < 6; i++) {
      const t = i / 6;
      ctx.lineTo(a.x + (b.x - a.x) * t + rand(-8, 8), ay + (by - ay) * t + rand(-8, 8));
    }
    ctx.lineTo(b.x, by);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// Texto que encolhe até caber na largura
function fitText(str, x, y, maxW, size, color, align = 'center', weight = 800) {
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  while (size > 9 && ctx.measureText(str).width > maxW) {
    size--;
    ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  }
  text(str, x, y, size, color, align, weight);
}

const LOCK_BTN = { x: W - 128, y: H - 43, w: 118, h: 36 };
const inRect = (r, x, y) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

function drawHUD() {
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.fillRect(0, 0, W, 48);
  text('⭐ ' + fmt(g.score), 14, 24, 20, '#ffe066', 'left');
  text('Nível ' + Math.floor(diff()), W / 2, 24, 18, '#fff');
  text(fmt(g.dist) + ' m', W - 14, 24, 18, '#a5d8ff', 'right');

  // barra inferior: arma, multiplicadores e botão de travar
  const w = WEAPONS[g.weapon];
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.fillRect(0, H - 50, W, 50);
  fitText('🔫 ' + w.name + (g.locked ? ' 🔒' : ''), 12, H - 34, LOCK_BTN.x - 20, 15, bulletColor(w), 'left', 800);
  fitText(`Dano ×${fmtMul(g.dmgMul)}  •  Cadência ×${fmtMul(g.rateMul)}`, 12, H - 13, LOCK_BTN.x - 20, 13, '#dee2e6', 'left', 600);
  roundRect(LOCK_BTN.x, LOCK_BTN.y, LOCK_BTN.w, LOCK_BTN.h, 10);
  ctx.fillStyle = g.locked ? '#f59f00' : '#343a40';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = g.locked ? '#ffe066' : '#868e96';
  ctx.stroke();
  text(g.locked ? '🔒 Travada' : '🔓 Travar', LOCK_BTN.x + LOCK_BTN.w / 2, LOCK_BTN.y + LOCK_BTN.h / 2, 15, '#fff');

  // evoluções ativas
  let px = 12;
  for (const k of Object.keys(g.perks)) {
    const P = PERKS[k];
    roundRect(px, 84, 40, 26, 8);
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.fill();
    ctx.strokeStyle = P.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.font = '15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(P.icon, px + 13, 97);
    text(String(g.perks[k]), px + 31, 97, 13, P.color);
    px += 45;
  }

  const bo = g.boss;
  if (bo) {
    roundRect(40, 58, W - 80, 20, 6);
    ctx.fillStyle = 'rgba(0,0,0,.6)';
    ctx.fill();
    roundRect(42, 60, (W - 84) * Math.max(0, bo.hp / bo.maxHp), 16, 5);
    ctx.fillStyle = '#e03131';
    ctx.fill();
    text(bo.name + '  ' + fmt(Math.max(0, bo.hp)), W / 2, 68, 12, '#fff', 'center', 700);
  } else if (g.bossCd < 8) {
    text('Boss chegando em ' + Math.ceil(g.bossCd) + 's', W / 2, 68, 15, '#ff8787');
  }

  if (g.banner) {
    ctx.globalAlpha = Math.min(1, g.banner.life * 2);
    ctx.fillStyle = 'rgba(120, 0, 0, .75)';
    ctx.fillRect(0, H / 2 - 60, W, 120);
    text('⚠ ' + g.banner.text + ' ⚠', W / 2, H / 2 - 14, 28, '#ffe3e3');
    if (g.banner.tip) text(g.banner.tip, W / 2, H / 2 + 26, 18, '#ffd8a8', 'center', 700);
    ctx.globalAlpha = 1;
  }
}

const CARD = i => ({ x: 26, y: 235 + i * 132, w: W - 52, h: 116 });

function drawChoice() {
  ctx.fillStyle = 'rgba(5, 8, 15, .85)';
  ctx.fillRect(0, 0, W, H);
  text('⭐ EVOLUÇÃO', W / 2, 140, 38, '#ffe066');
  text(WEAPONS[g.weapon].name + (g.locked ? ' 🔒' : ''), W / 2, 185, 18, '#e9ecef', 'center', 600);
  g.choice.options.forEach((k, i) => {
    const P = PERKS[k], c = CARD(i), lvl = perk(k);
    roundRect(c.x, c.y, c.w, c.h, 14);
    ctx.fillStyle = '#1c2333';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = P.color;
    ctx.stroke();
    ctx.font = '44px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(P.icon, c.x + 48, c.y + c.h / 2);
    fitText(P.name, c.x + 92, c.y + 32, c.w - 130, 21, P.color, 'left');
    text(`Nível ${lvl} → ${lvl + 1}`, c.x + 92, c.y + 60, 14, '#adb5bd', 'left', 600);
    fitText(P.desc(lvl + 1), c.x + 92, c.y + 87, c.w - 105, 15, '#e9ecef', 'left', 600);
    text(String(i + 1), c.x + c.w - 18, c.y + 20, 14, '#868e96');
  });
  text('Toque em uma carta (ou 1, 2, 3)', W / 2, 660, 16, '#adb5bd', 'center', 600);
}

function drawOverlay(title, lines, sub) {
  ctx.fillStyle = 'rgba(5, 8, 15, .78)';
  ctx.fillRect(0, 0, W, H);
  text(title, W / 2, 200, 46, '#ffe066');
  lines.forEach((l, i) => text(l, W / 2, 275 + i * 31, 17, '#e9ecef', 'center', 600));
  if (sub) {
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(performance.now() / 250);
    text(sub, W / 2, 660, 22, '#8ce99a');
    ctx.globalAlpha = 1;
  }
}

function draw() {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.save();
  if (g && g.shake > 0) ctx.translate(rand(-g.shake, g.shake) * 0.5, rand(-g.shake, g.shake) * 0.5);
  drawGround(g ? g.scroll : (performance.now() / 8) % 160);

  if (g) {
    drawTelegraph();
    // desenha de longe para perto
    const items = [];
    for (const row of g.gates) items.push([row.y, () => drawGateRow(row)]);
    for (const cr of g.crates) items.push([cr.y, () => drawCrate(cr)]);
    for (const e of g.enemies) items.push([e.y, () => drawEnemy(e)]);
    if (g.boss) items.push([g.boss.y, drawBoss]);
    if (state !== 'over') items.push([PLAYER_Y, drawSquad]);
    items.sort((a, b) => a[0] - b[0]);
    for (const it of items) it[1]();
    drawProjectiles();
    drawBullets();
    drawEffects();
    for (const p of g.particles) {
      const q = proj(p.x, p.y);
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.fillStyle = p.color;
      circle(q.x, q.y - (p.up ? 30 : 14) * q.s, p.r * q.s);
    }
    ctx.globalAlpha = 1;
  }
  drawFog();
  if (g) {
    for (const t of g.texts) {
      const q = proj(t.x, t.y);
      ctx.globalAlpha = Math.min(1, t.life / t.max * 2);
      text(t.text, q.x, q.y, t.size * clamp(q.s, 0.8, 1.1), t.color);
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  if (g && g.flash > 0) {
    ctx.globalAlpha = g.flash * 0.6;
    ctx.fillStyle = g.flashColor;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  if (g) drawHUD();

  if (state === 'menu') {
    drawOverlay('SHOOT LINES', [
      'Seu esquadrão avança por 3 faixas.',
      'Portões VERDES: soldados, armas, dano.',
      'Evite os VERMELHOS e os bichos!',
      'Atire nos portões "+" para aumentá-los.',
      'Com 100 soldados eles sobem de patente:',
      'ficam menos, maiores e bem mais fortes.',
      '🔒 Trave a arma para ganhar evoluções.',
      '',
      '← → / A D  ou  toque na faixa  •  L trava',
    ], 'Toque ou ENTER para começar');
    if (best) text('Recorde: ' + fmt(best), W / 2, 720, 18, '#ffe066');
  } else if (state === 'paused') {
    drawOverlay('PAUSADO', ['P / ESC para continuar', 'M para som on/off', 'L para travar a arma'], 'Toque para continuar');
  } else if (state === 'choose') {
    drawChoice();
  } else if (state === 'over') {
    drawOverlay('FIM DE JOGO', [
      'Pontuação: ' + fmt(g.score),
      'Distância: ' + fmt(g.dist) + ' m',
      'Patente: ' + rankInfo(g.tier).name,
      'Bosses derrotados: ' + g.bossesKilled,
      'Recorde: ' + fmt(best),
    ], g.overT > 0.8 ? 'Toque ou ENTER para jogar de novo' : '');
  }
}

// ---------------------------------------------------------------------------
// Loop principal
// ---------------------------------------------------------------------------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  if (state === 'play') update(dt);
  else if (state === 'choose') g.choice.t += dt;
  else if (state === 'over' && g) {
    g.overT += dt;
    for (const p of g.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
    g.particles = g.particles.filter(p => p.life > 0);
  }
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------------------------------------------------------------------------
// Controles
// ---------------------------------------------------------------------------
function start() {
  newGame();
  state = 'play';
  sfx(440, 0.1, 'triangle', 0.06, 300);
}

function primaryAction() {
  if (state === 'menu') start();
  else if (state === 'paused') state = 'play';
  else if (state === 'over' && g.overT > 0.8) start();
}

function togglePause() {
  if (state === 'play') state = 'paused';
  else if (state === 'paused') state = 'play';
}

window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (state === 'play') {
    if (k === 'arrowleft' || k === 'a') g.lane = Math.max(0, g.lane - 1);
    if (k === 'arrowright' || k === 'd') g.lane = Math.min(2, g.lane + 1);
    if (k === 'l') toggleLock();
  }
  if (state === 'choose' && ['1', '2', '3'].includes(k)) choosePerk(+k - 1);
  if (k === 'p' || k === 'escape') togglePause();
  if (k === 'm') muted = !muted;
  if (k === 'enter' || k === ' ') { primaryAction(); e.preventDefault(); }
});

let dragging = false;
function pointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) / rect.width * W,
    y: (e.clientY - rect.top) / rect.height * H,
  };
}
canvas.addEventListener('pointerdown', e => {
  e.preventDefault();
  const p = pointerPos(e);
  if (state === 'choose') {
    for (let i = 0; i < 3; i++) if (inRect(CARD(i), p.x, p.y)) choosePerk(i);
    return;
  }
  if (state !== 'play') { primaryAction(); return; }
  if (inRect(LOCK_BTN, p.x, p.y)) { toggleLock(); return; }
  dragging = true;
  g.lane = clamp(Math.floor(p.x / 150), 0, 2);
});
canvas.addEventListener('pointermove', e => {
  if (dragging && state === 'play') g.lane = clamp(Math.floor(pointerPos(e).x / 150), 0, 2);
});
window.addEventListener('pointerup', () => { dragging = false; });
window.addEventListener('pointercancel', () => { dragging = false; });

document.addEventListener('visibilitychange', () => {
  if (document.hidden && state === 'play') state = 'paused';
});
