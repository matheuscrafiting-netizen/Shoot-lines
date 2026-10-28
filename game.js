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
const PROMOTE_AT = 300;      // com essa quantidade o esquadrão sobe um subnível sozinho
const TIER_POWER = 3;        // cada subnível (I..V) vale 3× o anterior
const SUBLEVELS = 3;
const ROMAN = ['I', 'II', 'III'];
const MAX_FIRE_RATE = 12;    // acima disso a cadência extra vira dano
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
  { name: 'Coronel',  color: '#868e96', helmet: '#343a40' },
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

// Habilidades especiais dos inimigos (liberadas conforme o nível)
const MODS = {
  shield:   { icon: '🛡️', name: 'Escudo',      minD: 2.5 },
  dash:     { icon: '💨', name: 'Investida',   minD: 3 },
  ghost:    { icon: '👻', name: 'Fantasma',    minD: 3.5 },
  elite:    { icon: '👑', name: 'Elite',       minD: 4 },
  regen:    { icon: '💚', name: 'Regenerador', minD: 4.5 },
  splitter: { icon: '🧬', name: 'Divisor',     minD: 5 },
};

// Habilidades do esquadrão, liberadas por patente (acumulam)
const RANK_SKILLS = [
  { tier: 1, key: 'training', icon: '💪', name: 'Treinamento',  desc: '+15% de dano' },
  { tier: 2, key: 'shield',   icon: '🛡️', name: 'Escudo',       desc: 'Bloqueia 1 golpe a cada 12 s' },
  { tier: 3, key: 'grenade',  icon: '💣', name: 'Granada',      desc: 'Granada no inimigo mais forte a cada 6 s' },
  { tier: 4, key: 'vest',     icon: '🦺', name: 'Colete',       desc: '-20% de dano recebido' },
  { tier: 5, key: 'turret',   icon: '🔫', name: 'Torreta',      desc: 'Atira nas outras faixas' },
  { tier: 6, key: 'medic',    icon: '⚕️', name: 'Médico',       desc: '+5% de soldados a cada 8 s' },
  { tier: 7, key: 'air',      icon: '✈️', name: 'Ataque aéreo', desc: 'Bombardeia a tela a cada 15 s' },
  { tier: 8, key: 'command',  icon: '⭐', name: 'Comando',      desc: 'Habilidades 2× mais rápidas' },
];
const SKILL_CD = { shield: 12, grenade: 6, medic: 8, air: 15 };

// Ameaças permanentes: a partir de General, cada subida de subnível adiciona uma
const THREATS = {
  horde:   { icon: '👥', name: 'Horda',            desc: '+25% de inimigos por onda' },
  armor:   { icon: '🪨', name: 'Couraça',          desc: 'Inimigos com +40% de vida' },
  fury:    { icon: '😡', name: 'Fúria',            desc: 'Inimigos causam +40% de dano' },
  haste:   { icon: '💨', name: 'Pressa',           desc: 'Inimigos 10% mais rápidos' },
  elites:  { icon: '👑', name: 'Elites',           desc: 'Mais inimigos com habilidades' },
  warlord: { icon: '💀', name: 'Senhor da guerra', desc: 'Bosses com +50% de vida e mais agressivos' },
};
const GENERAL_RANK = 8;

// Enquanto um boss está vivo, as criaturas que surgem ficam enfurecidas. O 1º
// boss não enfurece ninguém; depois a fúria cresce a cada boss (2º: +30% vida,
// +15% dano ... até +100% vida, +50% dano)
const NO_RAGE = { hp: 1, dmg: 1, spd: 1, mods: 0 };
const bossRage = () => {
  const n = g.bossesKilled - 1;
  if (!g.boss || n < 0) return NO_RAGE;
  return { hp: Math.min(2, 1.3 + 0.1 * n), dmg: Math.min(1.5, 1.15 + 0.05 * n), spd: Math.min(1.25, 1.08 + 0.03 * n), mods: Math.min(0.3, 0.1 + 0.03 * n) };
};

const ENEMY_TYPES = {
  bug:     { hp: 3,  spd: 0.85, dmg: 1, r: 14, color: '#69db7c', minD: 1 },
  runner:  { hp: 2,  spd: 1.6,  dmg: 1, r: 11, color: '#ffd43b', minD: 1.6 },
  spitter: { hp: 5,  spd: 0.8,  dmg: 1.5, r: 16, color: '#da77f2', minD: 2.2, switcher: true },
  brute:   { hp: 10, spd: 0.6,  dmg: 2, r: 22, color: '#ff922b', minD: 2.8 },
  tank:    { hp: 20, spd: 0.45, dmg: 3, r: 28, color: '#868e96', minD: 4 },
  // meio de jogo (~3:30, ~4:40 e ~5:50 de jogo)
  shieldbearer: { hp: 8,  spd: 0.55, dmg: 2,   r: 20, color: '#4c6ef5', minD: 7 },   // escudo frontal
  healer:       { hp: 6,  spd: 0.7,  dmg: 1,   r: 16, color: '#38d9a9', minD: 9 },   // aura de cura
  glutton:      { hp: 12, spd: 0.55, dmg: 2.5, r: 22, color: '#be4bdb', minD: 11 },  // come os outros
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
const CAM_A = 655 - CAM_K / CAM_ZP;    // jogador fica em y = 655 na tela

// ---------------------------------------------------------------------------
// Canvas
// ---------------------------------------------------------------------------
const canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');   // trocado temporariamente ao gerar sprites
let scale = 1;

function resize() {
  const s = Math.min(window.innerWidth / W, window.innerHeight / H);
  const dpr = Math.min(2, window.devicePixelRatio || 1);   // telas 3× pesam demais
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

// Escala de números de jogo: 12.3K, 4.5M, 6.7B, 8.9T, depois aa, ab, ... zz
const SUFFIX = ['', 'K', 'M', 'B', 'T'];
function suffix(e) {
  if (e < SUFFIX.length) return SUFFIX[e];
  const i = e - SUFFIX.length;
  return String.fromCharCode(97 + Math.floor(i / 26) % 26) + String.fromCharCode(97 + i % 26);
}
function fmt(n) {
  if (!isFinite(n)) return '∞';
  n = Math.floor(n);
  if (n < 1e4) return String(n);
  const e = Math.floor(Math.log10(n) / 3);
  const v = n / Math.pow(10, e * 3);
  return (v >= 100 ? v.toFixed(0) : v.toFixed(1)) + suffix(e);
}
const fmtTime = t => {
  const s = Math.floor(t), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
};
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

// Versão publicada (o deploy acrescenta ?v=<commit> ao endereço do script)
const VERSION = (() => {
  try { return new URL(document.currentScript.src).searchParams.get('v') || 'local'; } catch (e) { return 'local'; }
})();


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
// Modos de dificuldade: multiplicam a força dos inimigos e o ritmo de crescimento
const MODES = [
  { name: 'Fácil',   mult: 1.6, growth: 1.2,  boss: 1,    floor: 1,    color: '#51cf66', dark: '#2b8a3e' },
  { name: 'Normal',  mult: 2.6, growth: 1.35, boss: 1.25, floor: 1.25, color: '#ffd43b', dark: '#e8a200' },
  { name: 'Difícil', mult: 4.2, growth: 1.5,  boss: 1.5,  floor: 1.5,  color: '#ff6b6b', dark: '#c92a2a' },
];
let modePref = 1;
try { modePref = clamp(+(localStorage.getItem('shootlines-mode') ?? 1) || 0, 0, 2); } catch (e) { /* sem storage */ }
const mode = () => MODES[g && g.mode != null ? g.mode : modePref];

let state = 'menu';   // menu | play | paused | choose | over
let g = null;

function newGame(campaign = null) {
  g = {
    t: 0, soldiers: 5 + 3 * upLevel('recruits'), tier: 0, mode: modePref, lane: 1, x: LANES[1],
    weapon: 0, rateMul: 1 + 0.05 * upLevel('rate'), dmgMul: 1 + 0.1 * upLevel('damage'), fireCd: 0,
    perks: {}, lastPerk: null, pendingEvo: 0, choice: null, parts: 0, threats: {}, saveT: 0,
    skills: { shield: 0, grenade: 2, turret: 0, medic: 8, air: 5 }, shieldUp: upLevel('shield') > 0,
    campaign, finalSpawned: false, peak: 0, kills: 0, waves: 0, toasts: [], readyT: 0, coinsEarned: 0, stars: 0,
    bullets: [], enemies: [], gates: [], crates: [], projectiles: [],
    particles: [], texts: [], zaps: [], rings: [], grenades: [], planes: [],
    score: 0, dist: 0, lastCritT: 0,
    spawnCd: 2, gateCd: 2.5, crateCd: 10, rows: 0, bossCd: BOSS_EVERY,
    boss: null, bossesKilled: 0, banner: null,
    shake: 0, flash: 0, flashColor: '#fff', scroll: 0, overT: 0, nextId: 1,
  };
  // kit inicial: peças já contadas (pode abrir uma escolha logo no começo)
  if (upLevel('kit')) gainParts(upLevel('kit'), LANES[1]);
  g.texts = [];
}

const diff = () => 1 + g.t / 35;
const worldSpeed = () => Math.min(90 + diff() * 7, 190);
const tierMul = () => Math.pow(TIER_POWER, g.tier);
const rankOf = step => Math.floor(step / SUBLEVELS);      // 0 = Recruta ... 8 = General
const rank = () => rankOf(g.tier);
const threat = k => g.threats[k] || 0;
const threatCount = () => Object.values(g.threats).reduce((a, b) => a + b, 0);
const power = () => g.soldiers * tierMul();
// ---------------------------------------------------------------------------
// Dificuldade: depende SÓ do tempo (e do modo), igual em toda partida.
// A referência é o crescimento medido de um esquadrão "médio" (logaritmo do
// poder de fogo e da força a cada minuto), com folga. Quem fica acima da
// referência acha mais fácil; quem fica abaixo sente mais pressão.
// ---------------------------------------------------------------------------
const DPS_REF = 12;                                  // poder de fogo inicial
const BUG_HP = 3;
const REF_LN_DPS = [2.5, 5.6, 8.5, 10.5, 11.5, 13.3, 14.9, 16.0, 17.8, 19.8, 22.1,
  24.2, 26.0, 27.9, 30.3, 32.5, 33.9, 35.4, 38.7, 42.2, 43.8];   // por minuto, 0..20
const REF_LN_POW = [1.6, 4.0, 5.3, 6.6, 7.5, 8.6, 9.8, 10.9, 11.9, 13.9, 15.7,
  17.6, 19.3, 20.8, 23.2, 25.2, 26.4, 28.2, 31.3, 33.9, 35.3];
function refCurve(table, slope) {
  const m = g.t / 60;
  const last = table.length - 1;
  const v = m >= last ? table[last] + slope * (g.t - last * 60)
    : table[Math.floor(m)] + (table[Math.floor(m) + 1] - table[Math.floor(m)]) * (m % 1);
  // folga para o jogador médio; a partir dos 12 min a curva vai acelerando aos
  // poucos, para que mesmo quem dispara na frente encontre o fim (~25-30 min)
  const over = Math.max(0, g.t - 720);
  return v - 0.7 * Math.min(1, g.t / 120) + 0.00001 * over * over;
}
const refDps = () => Math.exp(refCurve(REF_LN_DPS, 0.04));
const refPower = () => Math.exp(refCurve(REF_LN_POW, 0.037));
const gameT = () => g.t * mode().growth;             // tempo "de dificuldade"
const lateCurve = tt => 1 + (tt / 900) * (tt / 900); // aperta devagar depois de 15 min
// Carga: segundos de tiro concentrado, por segundo de jogo, que o esquadrão de
// referência precisa para dar conta de todos os bichos: 0,25 no início, ~0,37
// aos 5 min, ~0,5 aos 10 e sobe aos poucos depois
const loadTarget = () => { const tt = gameT(); return 0.25 * (1 + tt / 600) * lateCurve(tt); };
// "besouros-equivalentes" de vida que chegam por segundo com as ondas atuais
function hpPerSec() {
  const d = diff();
  const types = Object.keys(ENEMY_TYPES).filter(k => ENEMY_TYPES[k].minD <= d);
  const typeAvg = types.reduce((a, k) => a + ENEMY_TYPES[k].hp, 0) / types.length / BUG_HP;
  const lanes = 1 + Math.min(0.6, 0.15 + d * 0.08);
  const perLane = (1 + Math.min(6, 1 + Math.floor(d * 0.7))) / 2 * (1 + 0.25 * threat('horde'));
  const every = Math.max(0.55, 2.2 - d * 0.22);
  return lanes * perLane * typeAvg / every;
}
// Pressão mínima: a partir dos 3 min os bichos exigem uma parte do SEU tempo
// de tiro, mesmo com dano gigante (0,25 aos 8 min, +0,25 a cada 10 min;
// ×1,25 no Normal e ×1,5 no Difícil), para não evaporarem antes de aparecer
const floorRamp = () => clamp((g.t - 180) / 300, 0, 1) + Math.max(0, g.t - 480) / 600;
const floorLoad = () => 0.25 * floorRamp() * mode().floor;
const enemyScale = () => Math.pow(1.4, threat('armor')) * stageMult() *
  Math.max(mode().mult * loadTarget() * refDps(), floorLoad() * dps()) / (hpPerSec() * BUG_HP);
// dano de contato de um besouro: 6% da força de referência no início, ~9% aos
// 5 min, ~17% aos 10 (para quem é mais forte que a referência, pesa menos)
const contactFrac = () => { const tt = gameT(); return 0.06 * (1 + tt / 600) * lateCurve(tt); };
// para esquadrões enormes o contato também tem um piso: 2% da SUA força por
// besouro aos 8 min, +2% a cada 10 min (×modo)
const enemyDmgScale = () => Math.pow(1.4, threat('fury')) * stageMult() *
  Math.max(mode().mult * contactFrac() * refPower(), 0.02 * floorRamp() * mode().floor * power());
const perkLevels = () => Object.values(g.perks).reduce((a, b) => a + b, 0);
const perk = k => g.perks[k] || 0;
const rankSize = () => Math.min(1.9, 1 + 0.1 * rank() + 0.02 * (g.tier % SUBLEVELS));
const skillCd = k => SKILL_CD[k] / (rank() >= 8 ? 2 : 1);
const isGhost = e => e.mod === 'ghost' && e.ghostT % 2.4 > 1.4;
const shownSoldiers = () => Math.max(1, Math.min(g.soldiers, Math.floor(FORM_MAX / (rankSize() ** 2))));

function rankInfo(step) {
  const idx = Math.min(rankOf(step), RANKS.length - 1);
  const r = RANKS[idx];
  const extra = step - (RANKS.length * SUBLEVELS - 1);
  const name = extra > 0 ? r.name + ' ★' + extra : r.name + ' ' + ROMAN[step % SUBLEVELS];
  return { ...r, name, idx, sub: Math.min(step % SUBLEVELS, SUBLEVELS - 1) };
}

function fireStats() {
  const w = WEAPONS[g.weapon];
  const rate = w.rate * g.rateMul;
  const fireRate = Math.min(rate, MAX_FIRE_RATE);
  const training = rank() >= 1 ? 1.15 : 1;
  const dmg = w.dmg * g.dmgMul * training * (1 + 0.1 * perkLevels()) * (rate / fireRate);
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
  if (rank() >= 4) p *= 0.8;   // Colete
  const per = p / tierMul();
  const n = Math.floor(per) + (Math.random() < per % 1 ? 1 : 0);
  if (n > 0) loseSoldiers(n, x);
  else g.shake = Math.min(14, g.shake + 3);
}

// Escudo da patente Cabo: absorve um golpe inteiro
function blockHit(x) {
  if (!g.shieldUp) return false;
  g.shieldUp = false;
  g.skills.shield = skillCd('shield');
  addText(x, PLAYER_Y - 80, '🛡️ Bloqueado!', '#74c0fc', 20);
  burst(g.x, PLAYER_Y - 10, '#74c0fc', 24, 220);
  sfx(600, 0.15, 'triangle', 0.07, -300);
  return true;
}

// Golpe que tira uma fração do esquadrão (bosses)
function loseFraction(f, min, x) {
  if (blockHit(x)) return;
  if (rank() >= 4) f *= 0.8;
  loseSoldiers(Math.max(min, Math.ceil(g.soldiers * f)), x);
}

function promote(divisor, x) {
  g.tier++;
  g.soldiers = Math.max(1, Math.ceil(g.soldiers / divisor));
  const r = rankInfo(g.tier);
  addText(x, PLAYER_Y - 110, '⬆ ' + r.name + '!', r.color, 28);
  missionMax('rank', rank());
  showTip('rank', '🎖️', 'Subiu de patente!', 'A cada 300 soldados: ÷3 soldados, cada um vale 3×. Novas patentes liberam habilidades.');
  burst(x, PLAYER_Y - 10, '#ffd43b', 30, 240);
  g.flash = 0.25; g.flashColor = '#ffe066';
  sfx(440, 0.25, 'triangle', 0.08, 500);
  const sk = g.tier % SUBLEVELS === 0 && RANK_SKILLS.find(k => k.tier === rank());
  if (sk) g.banner = { text: 'Nova habilidade: ' + sk.icon + ' ' + sk.name, tip: sk.desc, life: 2.6, good: true };
  if (g.tier === GENERAL_RANK * SUBLEVELS) addThreat();   // chegou em General I
}

// A partir de General: uma ameaça permanente ao chegar e outra a cada boss derrotado
function addThreat() {
  const k = pick(Object.keys(THREATS));
  g.threats[k] = threat(k) + 1;
  g.banner = { text: 'Nova ameaça: ' + THREATS[k].icon + ' ' + THREATS[k].name, tip: THREATS[k].desc, life: 2.8 };
  sfx(110, 0.5, 'sawtooth', 0.08, -40);
}

function addSoldiers(n) {
  g.soldiers += n;
  while (g.soldiers >= PROMOTE_AT) promote(TIER_POWER, g.x);
}

// ---------------------------------------------------------------------------
// Progresso entre partidas: moedas, loja, visuais, campanha, missões e dicas
// ---------------------------------------------------------------------------
const META_KEY = 'shootlines-meta';
const UPGRADES = [
  { key: 'recruits', icon: '👥', name: 'Recrutas',       max: 10, cost: l => Math.round(40 * Math.pow(1.45, l)),  desc: l => `Começa com +${3 * l} soldados` },
  { key: 'damage',   icon: '💪', name: 'Treino de tiro', max: 20, cost: l => Math.round(60 * Math.pow(1.35, l)),  desc: l => `+${10 * l}% de dano base` },
  { key: 'rate',     icon: '⚡', name: 'Gatilho rápido', max: 10, cost: l => Math.round(60 * Math.pow(1.4, l)),   desc: l => `+${5 * l}% de cadência base` },
  { key: 'kit',      icon: '🔧', name: 'Kit inicial',    max: 3,  cost: l => 150 * (l + 1),                       desc: l => `Começa com ${l} peça${l > 1 ? 's' : ''}` },
  { key: 'shield',   icon: '🛡️', name: 'Escudo inicial', max: 1,  cost: () => 250,                                desc: () => 'Começa com escudo que bloqueia 1 golpe' },
  { key: 'luck',     icon: '🍀', name: 'Sorte',          max: 5,  cost: l => Math.round(80 * Math.pow(1.5, l)),   desc: l => `+${6 * l}% de chance de 2 portões bons` },
];
// visuais da munição (cor base dos tiros; evoluções ainda pintam por cima)
const SKINS = [
  { key: 'classic', name: 'Clássica', color: null,      cost: 0 },
  { key: 'gold',    name: 'Dourada',  color: '#ffd43b', cost: 300 },
  { key: 'plasma',  name: 'Plasma',   color: '#4dabf7', cost: 400 },
  { key: 'toxic',   name: 'Tóxica',   color: '#94d82d', cost: 500 },
  { key: 'rainbow', name: 'Arco-íris', color: 'rainbow', cost: 900 },
];
const MISSIONS = [
  { id: 'bosses',  goals: [2, 3, 5],       reward: 60, text: n => `Derrote ${n} bosses` },
  { id: 'kills',   goals: [300, 600, 1000], reward: 50, text: n => `Elimine ${n} bichos` },
  { id: 'rank',    goals: [2, 3, 4],       reward: 70, text: n => `Chegue a ${RANKS[n].name}` },
  { id: 'survive', goals: [3, 5, 8],       reward: 60, text: n => `Sobreviva ${n} min numa partida` },
  { id: 'stage',   goals: [1, 2],          reward: 80, text: n => `Complete ${n} fase${n > 1 ? 's' : ''} da campanha` },
  { id: 'evos',    goals: [5, 10],         reward: 50, text: n => `Escolha ${n} evoluções` },
];

function loadMeta() {
  let m = null;
  try { m = JSON.parse(localStorage.getItem(META_KEY)); } catch (e) { /* sem storage */ }
  m = Object.assign({ coins: 0, up: {}, skin: 'classic', skins: ['classic'], stage: 1, stars: {}, seen: {}, daily: null, best: 0 }, m || {});
  return m;
}
let meta = loadMeta();
function saveMeta() {
  try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (e) { /* sem storage */ }
}
const upLevel = k => meta.up[k] || 0;

function buyUpgrade(k) {
  const U = UPGRADES.find(u => u.key === k);
  const l = upLevel(k);
  if (l >= U.max || meta.coins < U.cost(l)) { sfx(150, 0.1, 'square', 0.04); return; }
  meta.coins -= U.cost(l);
  meta.up[k] = l + 1;
  saveMeta();
  sfx(880, 0.12, 'triangle', 0.06, 300);
}

function buySkin(k) {
  const S = SKINS.find(s => s.key === k);
  if (meta.skins.includes(k)) meta.skin = k;
  else if (meta.coins >= S.cost) { meta.coins -= S.cost; meta.skins.push(k); meta.skin = k; }
  else { sfx(150, 0.1, 'square', 0.04); return; }
  saveMeta();
  sfx(880, 0.12, 'triangle', 0.06, 300);
}

// --- missões diárias: 3 por dia, sorteadas pela data
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function ensureDaily() {
  const key = todayKey();
  if (meta.daily && meta.daily.date === key) return;
  let seed = 0;
  for (const ch of key) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const pool = MISSIONS.slice();
  const list = [];
  while (list.length < 3) {
    const M = pool.splice(Math.floor(rnd() * pool.length), 1)[0];
    list.push({ id: M.id, goal: M.goals[Math.floor(rnd() * M.goals.length)], prog: 0, done: false });
  }
  meta.daily = { date: key, list };
  saveMeta();
}
function missionUpdate(id, f) {
  ensureDaily();
  for (const m of meta.daily.list) {
    if (m.id !== id || m.done) continue;
    m.prog = f(m.prog);
    if (m.prog >= m.goal) {
      m.done = true;
      const M = MISSIONS.find(x => x.id === id);
      meta.coins += M.reward;
      if (g) g.toasts.push({ icon: '✅', title: 'Missão concluída!', text: `${M.text(m.goal)} — +${M.reward} 🪙`, life: 4 });
      saveMeta();
    }
  }
}
const missionAdd = (id, n) => missionUpdate(id, p => p + n);
const missionMax = (id, v) => missionUpdate(id, p => Math.max(p, v));

// --- dicas: aparecem só na primeira vez
function showTip(key, icon, title, text) {
  if (!g || meta.seen[key]) return;
  meta.seen[key] = 1;
  saveMeta();
  g.toasts.push({ icon, title, text, life: 5 });
}
const ENEMY_INFO = {
  runner:       ['🏃', 'Corredor', 'Rápido e frágil: mate antes que escape.'],
  spitter:      ['🟣', 'Cuspidor', 'Troca de faixa para te perseguir.'],
  brute:        ['🦏', 'Brutamontes', 'Vida alta e golpe forte.'],
  tank:         ['🪨', 'Tanque', 'Muito resistente: desvie se não der tempo.'],
  shieldbearer: ['🛡️', 'Escudeiro', 'O escudo para balas que atravessariam e corta 40% do dano.'],
  healer:       ['💚', 'Curandeiro', 'Cura os bichos em volta. Mate primeiro!'],
  glutton:      ['👄', 'Guloso', 'Engole outros bichos e fica com a vida deles.'],
};
const MOD_TIPS = {
  shield:   'Bloqueia os primeiros tiros. Explosões e raios atravessam.',
  dash:     'Dispara em alta velocidade quando chega perto.',
  ghost:    'Fica intangível de tempos em tempos.',
  elite:    'Mais forte; derrotar dá uma peça 🔧.',
  regen:    'Se cura se ficar sem levar dano. Fogo impede.',
  splitter: 'Ao morrer, vira dois menores.',
};

// --- campanha: fases de 2:30 a 5:30 + chefe final, cada fase mais forte
const stageLen = n => 150 + 30 * Math.min(n - 1, 6);
// fase 1 bem leve (porta de entrada); cada fase seguinte +18%
const stageMult = () => g.campaign ? 0.6 * Math.pow(1.18, g.campaign - 1) : 1;

function runCoins() {
  const base = Math.floor(g.t / 10) + 12 * g.bossesKilled + 4 * rank() + Math.floor(g.kills / 50);
  return Math.round(base * [1, 1.3, 1.6][g.mode]);
}

function computeScore() {
  return Math.round((g.dist * 2 + g.kills * 5 + g.bossesKilled * 500 + g.tier * 100) * [1, 1.5, 2][g.mode]);
}

function stageClear() {
  const keep = power() / Math.max(1, g.peak);
  const stars = 1 + (keep >= 0.4 ? 1 : 0) + (keep >= 0.75 ? 1 : 0);
  g.stars = stars;
  const n = g.campaign;
  meta.stars[n] = Math.max(meta.stars[n] || 0, stars);
  if (meta.stage === n) meta.stage = n + 1;
  g.coinsEarned = runCoins() + 25 + 15 * stars + 5 * n;
  meta.coins += g.coinsEarned;
  missionAdd('stage', 1);
  missionMax('survive', Math.floor(g.t / 60));
  saveMeta();
  clearSave();
  state = 'clear';
  g.overT = 0;
  g.flash = 0.5; g.flashColor = '#ffe066';
  sfx(523, 0.15, 'triangle', 0.08); sfx(659, 0.25, 'triangle', 0.07); sfx(784, 0.4, 'triangle', 0.07);
}

// ---------------------------------------------------------------------------
// Salvar e continuar
// ---------------------------------------------------------------------------
const SAVE_KEY = 'shootlines-save-v2';
const SAVE_FIELDS = ['mode', 't', 'soldiers', 'tier', 'weapon', 'rateMul', 'dmgMul', 'perks', 'lastPerk',
  'pendingEvo', 'parts', 'skills', 'shieldUp', 'score', 'dist', 'rows', 'bossCd', 'bossesKilled', 'threats', 'lane', 'x',
  'campaign', 'finalSpawned', 'peak', 'kills', 'waves', 'nextId', 'spawnCd', 'gateCd', 'crateCd',
  'enemies', 'boss', 'gates', 'crates', 'projectiles'];

function saveGame() {
  if (!g || state === 'over' || state === 'menu' || g.soldiers <= 0) return;
  try {
    const o = {};
    for (const k of SAVE_FIELDS) o[k] = g[k];
    saveMeta();   // progresso das missões
    localStorage.setItem(SAVE_KEY, JSON.stringify(o));
  } catch (e) { /* sem storage */ }
}

function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; }
}

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* sem storage */ }
}

function gameOver() {
  clearSave();
  g.soldiers = 0;
  state = 'over';
  g.overT = 0;
  burst(g.x, PLAYER_Y, '#4dabf7', 40, 260);
  g.coinsEarned = runCoins();
  meta.coins += g.coinsEarned;
  missionMax('survive', Math.floor(g.t / 60));
  if (!g.campaign && g.score > meta.best) meta.best = g.score;
  saveMeta();
  sfx(200, 0.6, 'sawtooth', 0.1, -170);
}

// ---------------------------------------------------------------------------
// Geração de inimigos, portões, caixas e bosses
// ---------------------------------------------------------------------------
function pickMod(d) {
  const avail = Object.keys(MODS).filter(k => MODS[k].minD <= d);
  const chance = clamp((d - 2) * 0.06 + 0.1 * threat('elites') + (g.boss ? bossRage().mods : 0), 0, 0.9);
  return avail.length && Math.random() < chance ? pick(avail) : null;
}

function spawnEnemy(typeKey, lane, y, mod = null, hpMul = 1) {
  const T = ENEMY_TYPES[typeKey];
  const d = diff();
  const elite = mod === 'elite';
  const R = bossRage();
  const rage = R !== NO_RAGE;
  const hp = Math.ceil(T.hp * enemyScale() * hpMul * (elite ? 4 : 1) * (rage ? R.hp : 1));
  const e = {
    id: g.nextId++, type: typeKey, lane, x: LANES[lane], tx: LANES[lane], y,
    hp, maxHp: hp, r: T.r * (elite ? 1.3 : 1), color: T.color,
    dmg: T.dmg * enemyDmgScale() * (elite ? 2 : 1) * (rage ? R.dmg : 1),
    spd: T.spd * worldSpeed() * Math.min(2, Math.pow(1.1, threat('haste'))) * (rage ? R.spd : 1) * rand(0.92, 1.08),
    switchCd: T.switcher ? rand(1.5, 3) : Infinity,
    wob: Math.random() * 6, hitT: 0, burn: 0, burnDps: 0, slow: 0, slowF: 1,
    mod, rage, shield: mod === 'shield' ? 3 + Math.floor(d / 2) : 0,
    ghostT: rand(0, 2.4), lastHit: 0, dashing: false, child: false,
  };
  g.enemies.push(e);
  if (ENEMY_INFO[typeKey]) showTip('enemy-' + typeKey, ...ENEMY_INFO[typeKey]);
  if (mod) showTip('mod-' + mod, MODS[mod].icon, MODS[mod].name, MOD_TIPS[mod]);
  return e;
}

function spawnWave() {
  // espera o portão que acabou de aparecer se afastar
  if (g.gates.some(r => r.y < 80)) { g.spawnCd = 0.4; return; }
  const d = diff();
  const types = Object.keys(ENEMY_TYPES).filter(k => ENEMY_TYPES[k].minD <= d);
  const lanesCount = Math.random() < Math.min(0.6, 0.15 + d * 0.08) ? 2 : 1;
  const lanes = shuffle([0, 1, 2]).slice(0, lanesCount);
  g.waves++;
  for (const lane of lanes) {
    const n = Math.round(rint(1, Math.min(6, 1 + Math.floor(d * 0.7))) * (1 + 0.25 * threat('horde')));
    const type = pick(types);
    for (let i = 0; i < n; i++) spawnEnemy(type, lane, -30 - i * (ENEMY_TYPES[type].r * 2 + 8), pickMod(d));
  }
}

function goodCell(d) {
  const r = Math.random();
  if (r < 0.38) return { kind: 'add', v: rint(2, Math.min(30, 3 + Math.floor(d * 1.5))) };
  if (r < 0.48) return { kind: 'mul', v: Math.random() < 0.85 ? 2 : 3 };
  if (r < 0.63) return { kind: 'weapon' };
  if (r < 0.71 && g.soldiers >= 8) return { kind: 'rank' };
  if (r < 0.86) return { kind: 'rate', v: 15 };
  return { kind: 'dmg', v: 20 };
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
  const goods = g.rows++ < 2 || Math.random() < 0.5 + 0.06 * upLevel('luck') ? 2 : 1;
  const cells = [];
  for (let i = 0; i < 3; i++) cells.push(i < goods ? goodCell(d) : badCell(d));
  shuffle(cells);
  cells.forEach((c, i) => {
    c.lane = i;
    c.prog = 0;
    c.need = 5;      // tiros para +1 (cresce a cada aumento)
    c.pulse = 0;
  });
  g.gates.push({ y: -40, h: 52, cells, used: -1 });
  g.spawnCd = Math.max(g.spawnCd, 1.8);
}

function spawnCrate() {
  const d = diff();
  // a vida da caixa acompanha o poder de fogo: ~1,5 s de tiro concentrado
  const hp = Math.ceil(refDps() * rand(1.2, 1.9));
  const r = Math.random();
  let reward;
  if (r < 0.45) reward = { kind: 'weapon' };
  else if (r < 0.75) reward = { kind: 'add', v: rint(4, Math.min(40, 6 + Math.floor(d * 3))) };
  else reward = { kind: 'rate', v: 20 };
  g.crates.push({ lane: rint(0, 2), y: -40, hp, maxHp: hp, reward, hitT: 0 });
}

function spawnBoss(final = false) {
  const n = g.bossesKilled;
  const B = BOSSES[(final ? g.campaign - 1 : n) % BOSSES.length];
  // Boss épico: o 1º aguenta 15 s do SEU tiro direto; do 2º em diante 30 s,
  // +5 s por boss (até 80 s); o chefe de fase 20 s +5 s por fase (até 70 s);
  // mais no Normal/Difícil; nunca menos que o esperado para o esquadrão de referência
  const warlord = Math.pow(1.5, threat('warlord'));
  const secs = final ? Math.min(70, 20 + 5 * (g.campaign - 1)) : n === 0 ? 15 : Math.min(80, 30 + 5 * (n - 1));
  const epic = dps() * secs * mode().boss;
  const base = refDps() * Math.min(30, 10 + 1.5 * n) * mode().mult * stageMult();
  const hp = Math.ceil(Math.max(epic, base) * B.hp * warlord);
  const lane = 1;
  g.boss = {
    final, kind: B.kind, name: (final ? 'Chefe: ' : '') + B.name, color: B.color, lane, x: LANES[lane], tx: LANES[lane],
    y: -160, baseY: 150, mode: 'enter', hp, maxHp: hp, moveCd: 3, atkCd: 2.5, summonCd: 4,
    tele: null, hitT: 0, t: 0, level: n + 1, burn: 0, burnDps: 0, phases: [0.75, 0.5, 0.25], shieldT: 0,
  };
  g.banner = final
    ? { text: 'CHEFE DA FASE: ' + B.name, tip: 'Derrote-o para completar a fase!', life: 3.4 }
    : { text: 'BOSS: ' + B.name, tip: B.tip + (n > 0 ? ' As criaturas ficam enfurecidas!' : ''), life: 3.2 };
  g.spawnCd = Math.max(g.spawnCd, 4);   // pausa nas ondas para a entrada do boss
  g.shake = 14;
  g.flash = 0.3; g.flashColor = '#ff2222';
  sfx(80, 0.8, 'sawtooth', 0.1, 120);
  sfx(55, 1.2, 'square', 0.06, -20);
}

// ---------------------------------------------------------------------------
// Peças: cada conjunto de peças vira uma escolha entre a próxima arma e
// evoluções. As evoluções são do esquadrão e continuam ao trocar de arma.
// ---------------------------------------------------------------------------
const partsNeed = () => 2 + Math.floor((g.weapon + perkLevels()) * 0.6);
const weaponDps = w => w.dmg * w.rate * (w.pellets || 1);

function gainParts(n, x) {
  g.parts += n;
  addText(x, PLAYER_Y - 70, `🔧 +${n} peça${n > 1 ? 's' : ''}`, '#ffe066', 20);
  while (g.parts >= partsNeed()) {
    g.parts -= partsNeed();
    g.pendingEvo++;
  }
}

// Combos: duas evoluções no nível 3 ou mais destravam um efeito extra
const COMBOS = [
  { key: 'napalm',   a: 'fire',  b: 'explosive', icon: '🌋', name: 'Napalm',           desc: 'As explosões também incendeiam' },
  { key: 'blizzard', a: 'frost', b: 'chain',     icon: '🌨️', name: 'Nevasca elétrica', desc: 'O raio em cadeia também congela' },
  { key: 'hunter',   a: 'pierce', b: 'homing',   icon: '🦅', name: 'Caçadora',         desc: 'Balas teleguiadas atravessam +2 bichos' },
  { key: 'silver',   a: 'crit',  b: 'ricochet',  icon: '🥈', name: 'Bala de prata',    desc: 'Todo ricochete acerta crítico' },
];
const combo = k => COMBOS.some(c => c.key === k && perk(c.a) >= 3 && perk(c.b) >= 3);

function openChoice() {
  const avail = shuffle(Object.keys(PERKS).filter(k => perk(k) < PERK_MAX));
  const canWeapon = g.weapon < WEAPONS.length - 1;
  if (!avail.length && !canWeapon) {
    g.pendingEvo--;
    g.dmgMul += 0.3;
    addText(g.x, PLAYER_Y - 70, '+30% dano', '#ffe066', 24);
    return;
  }
  const options = canWeapon ? ['weapon', ...avail.slice(0, 2)] : avail.slice(0, 3);
  g.choice = { options: shuffle(options), t: 0 };
  state = 'choose';
  showTip('choice', '🔧', 'Peças completas!', 'Escolha uma arma nova ou uma evolução. As evoluções continuam ao trocar de arma.');
  sfx(700, 0.2, 'triangle', 0.06, 300);
}

function choosePerk(i) {
  if (state !== 'choose' || !g.choice || g.choice.t < 0.35) return;
  const k = g.choice.options[i];
  if (!k) return;
  g.pendingEvo--;
  g.choice = null;
  state = 'play';
  sfx(880, 0.15, 'triangle', 0.07, 400);
  if (k === 'weapon') {
    g.weapon++;
    addText(g.x, PLAYER_Y - 90, '🔫 ' + WEAPONS[g.weapon].name + '!', '#ffe066', 24);
    burst(g.x, PLAYER_Y - 10, WEAPONS[g.weapon].color, 24, 220);
    return;
  }
  const before = COMBOS.filter(c => combo(c.key)).length;
  g.perks[k] = perk(k) + 1;
  g.lastPerk = k;
  missionAdd('evos', 1);
  addText(g.x, PLAYER_Y - 90, PERKS[k].icon + ' ' + PERKS[k].name + ' ' + perk(k), PERKS[k].color, 20);
  burst(g.x, PLAYER_Y - 10, PERKS[k].color, 24, 220);
  const now = COMBOS.filter(c => combo(c.key));
  if (now.length > before) {
    const c = now[now.length - 1];
    g.banner = { text: 'Combo: ' + c.icon + ' ' + c.name, tip: c.desc, life: 2.8, good: true };
  }
}

// ---------------------------------------------------------------------------
// Efeitos de portões / recompensas
// ---------------------------------------------------------------------------
function cellLabel(c) {
  switch (c.kind) {
    case 'add': return (c.v >= 0 ? '+' : '') + c.v;
    case 'mul': return '×' + c.v;
    case 'div': return '÷' + c.v;
    case 'weapon': return '🔧 Peça';
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
      gainParts(1, x);
      break;
    case 'rank':
      // promoção pelo portão: ÷2,5 soldados, mas cada um vale 3× (ganho de 20%)
      promote(2.5, x);
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
  if (g.lastPerk) return PERKS[g.lastPerk].color;
  const skin = SKINS.find(s => s.key === meta.skin);
  if (skin && skin.color === 'rainbow') return `hsl(${Math.floor(g.t * 240) % 360}, 90%, 60%)`;
  return (skin && skin.color) || w.color;
}

function fire() {
  const { w, dmg } = fireStats();
  const n = g.soldiers;
  // com muitas balas na tela, atira menos balas mais fortes (mesmo dano)
  const budget = g.bullets.length > 250 ? 0.5 : 1;
  const shots = Math.max(1, Math.round(Math.min(n, 6) * budget));
  const per = dmg * power() / shots;
  const pellets = w.pellets || 1;
  const size = rankSize();
  const shown = shownSoldiers();
  const explosive = perk('explosive');
  const base = {
    color: bulletColor(w), size: w.size * (1 + 0.1 * Math.min(rank(), 6)),
    pierce: (w.pierce || 0) + perk('pierce') + (combo('hunter') ? 2 : 0),
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
  for (let i = 0; i < Math.round(2 * perk('chaos') * budget); i++) {
    const a = rand(-0.65, 0.65);
    spawn(Math.sin(a) * w.speed, -Math.cos(a) * w.speed, per * 0.6);
  }
  if (g.t - lastShotSfx > 0.09) {
    lastShotSfx = g.t;
    sfx(w.splash || explosive ? 160 : 900, 0.04, 'square', 0.015, -300);
  }
}

// Curandeiro: cura os bichos em volta (fogo reduz a cura a 30%)
const HEAL_RADIUS = 110;
function healAura(h, dt) {
  for (const o of g.enemies) {
    if (o.dead || o.hp >= o.maxHp || Math.hypot(o.x - h.x, o.y - h.y) > HEAL_RADIUS) continue;
    const rate = (o === h ? 0.03 : 0.08) * (o.burn > 0 ? 0.3 : 1);
    o.hp = Math.min(o.maxHp, o.hp + o.maxHp * rate * dt);
    if (Math.random() < dt * 4) g.particles.push({ x: o.x + rand(-8, 8), y: o.y, vx: 0, vy: -50, life: 0.5, color: '#69db7c', r: 2.5, up: true });
  }
}

// Guloso: engole quem encosta nele e fica com a vida e parte do dano
function devour(e) {
  for (const o of g.enemies) {
    if (o === e || o.dead || o.type === 'glutton' || Math.abs(o.x - e.x) > e.r || Math.abs(o.y - e.y) > e.r + o.r) continue;
    o.dead = true;
    e.hp += Math.max(0, o.hp);
    e.maxHp += o.maxHp;
    e.dmg += o.dmg * 0.5;
    e.r = Math.min(ENEMY_TYPES.glutton.r * 2, e.r + 2);
    burst(o.x, o.y, o.color, 8, 120);
    addText(e.x, e.y - 30, 'Nhac!', '#e599f7', 14);
  }
}

function damageEnemy(e, dmg, silent) {
  if (isGhost(e)) return;
  e.hp -= dmg;
  e.lastHit = g.t;
  if (!silent) e.hitT = 0.08;
  if (e.hp <= 0 && !e.dead) {
    e.dead = true;
    g.kills++;
    missionAdd('kills', 1);
    if (e.mod === 'splitter') {
      for (const off of [-14, 14]) {
        const c = spawnEnemy(e.type, e.lane, e.y + off, null, 0.35);
        c.r *= 0.7;
        c.child = true;
      }
    }
    if (e.mod === 'elite') gainParts(1, g.x);
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
    if (e.dead || Math.hypot(e.x - x, e.y - y) >= radius + e.r) continue;
    damageEnemy(e, dmg, true);
    if (combo('napalm')) { e.burn = 2; e.burnDps = Math.max(e.burnDps, dmg * 0.3); }
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
    if (combo('blizzard')) { e.slow = 1.5; e.slowF = 0.5; }
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

function hitEnemy(b, e, mul = 1) {
  if (e.shield > 0) {
    // o escudo segura o tiro, mas não a explosão
    e.shield--;
    e.hitT = 0.05;
    burst(e.x, e.y, '#74c0fc', 3, 120);
    if (!e.shield) { burst(e.x, e.y, '#a5d8ff', 18, 220); sfx(900, 0.08, 'triangle', 0.04, -500); }
    if (b.splash) splashAt(b.x, b.y, b.splash, b.dmg * b.splashMul);
    return;
  }
  const dmg = b.bounced && combo('silver') ? b.dmg * mul * 3 : rollCrit(b.dmg * mul, e.x, e.y);
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
  b.bounced = true;
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
  for (const t of g.toasts) t.life -= dt;
  g.toasts = g.toasts.filter(t => t.life > 0);
  if (g.readyT > 0) { g.readyT -= dt; return; }   // "Prepare-se" ao continuar
  g.t += dt;
  g.peak = Math.max(g.peak, power());
  if (g.t > 1 && g.t < 1.1) showTip('move', '👆', 'Como jogar', 'Toque ou arraste na faixa para mudar de lado. O esquadrão atira sozinho.');
  // campanha: chefe da fase quando o tempo acaba
  if (g.campaign && !g.finalSpawned && g.t >= stageLen(g.campaign) && !g.boss) {
    g.finalSpawned = true;
    spawnBoss(true);
  }
  const d = diff();
  const ws = worldSpeed();
  g.scroll = (g.scroll + ws * dt) % 2400;   // múltiplo de todos os padrões do chão
  g.dist += ws * dt / 20;
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
  if (!g.boss && !(g.campaign && g.t >= stageLen(g.campaign) - 20)) {
    g.bossCd -= dt;
    if (g.bossCd <= 0) spawnBoss();
  }
  g.spawnCd -= dt;
  if (g.spawnCd <= 0) {
    spawnWave();
    const base = Math.max(0.55, 2.2 - d * 0.22);
    g.spawnCd = base;   // durante o boss as ondas continuam no mesmo ritmo
  }
  // durante o boss os portões continuam, só que mais espaçados
  g.gateCd -= dt;
  if (g.gateCd <= 0) { spawnGateRow(); g.gateCd = g.boss ? rand(9, 12) : rand(5.5, 8); }
  if (!g.boss) {
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

    // Portões de soma: cada bala conta uma vez para aumentar o valor e segue
    // em frente (não bloqueia os tiros nos bichos que estão atrás)
    for (const row of g.gates) {
      if (row.used >= 0 || b.lastGate === row || Math.abs(b.y - row.y) > row.h / 2) continue;
      const c = row.cells[nearestLane(b.x)];
      if (c.kind !== 'add' || Math.abs(b.x - LANES[c.lane]) > LANE_HALF) continue;
      b.lastGate = row;
      c.prog++;
      if (c.prog >= c.need) {
        c.prog = 0;
        c.v++;
        c.need *= 1.12;
        c.pulse = 0.15;
      }
    }

    // Baús: levam o dano e a bala continua
    for (const cr of g.crates) {
      if (cr.dead || b.lastCrate === cr || Math.abs(b.x - LANES[cr.lane]) > 30 || Math.abs(b.y - cr.y) > 28) continue;
      b.lastCrate = cr;
      cr.hp -= b.dmg;
      cr.hitT = 0.08;
      if (cr.hp <= 0) {
        cr.dead = true;
        burst(LANES[cr.lane], cr.y, '#c49a6c', 20, 220);
        applyEffect(cr.reward, g.x);
      }
    }

    // Pedras do Golem podem ser destruídas
    for (const p of g.projectiles) {
      if (p.dead || !p.hp || Math.abs(b.x - p.x) > p.r + 6 || Math.abs(b.y - p.y) > p.r + 6) continue;
      p.hp -= b.dmg;
      b.dead = true;
      if (p.hp <= 0) {
        p.dead = true;
        burst(p.x, p.y, '#a0522d', 14, 200);
      }
      break;
    }
    if (b.dead) continue;

    // Inimigos
    for (const e of g.enemies) {
      if (e.dead || isGhost(e) || Math.abs(b.x - e.x) > e.r + b.size || Math.abs(b.y - e.y) > e.r + b.size) continue;
      b.hit = b.hit || new Set();
      if (b.hit.has(e.id)) continue;
      b.hit.add(e.id);
      // Escudeiro: o escudo frontal segura a bala (sem atravessar nem quicar)
      // e corta 40% do dano
      const front = e.type === 'shieldbearer' && b.vy < 0;
      if (front) {
        b.pierce = 0;
        b.bounce = 0;
        if (Math.random() < 0.3) burst(b.x, b.y, '#dee2e6', 2, 100);
      }
      hitEnemy(b, e, front ? 0.6 : 1);
      if (b.pierce > 0) { b.pierce--; continue; }
      if (b.bounce > 0 && retarget(b, e)) { b.bounce--; break; }
      b.dead = true;
      break;
    }
    if (b.dead) continue;

    // Boss
    const bo = g.boss;
    if (bo && bo.y > 0 && Math.abs(b.x - bo.x) < 70 && Math.abs(b.y - bo.y) < 70) {
      b.dead = true;
      if (bo.shieldT > 0) {
        if (Math.random() < 0.3) burst(b.x, b.y, '#74c0fc', 2, 120);
        continue;
      }
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
    if (e.type === 'healer') healAura(e, dt);
    if (e.type === 'glutton') devour(e);
    e.ghostT += dt;
    if (e.mod === 'regen' && g.t - e.lastHit > 1 && e.burn <= 0) e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.12 * dt);
    if (e.mod === 'dash' && !e.dashing && e.y > 300) {
      e.dashing = true;
      e.spd *= 2.6;
    }
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
      if (!blockHit(g.x)) losePower(e.dmg, g.x);
      if (state !== 'play') return;
    } else if (!e.escaped && e.y > PLAYER_Y + 30) {
      // bicho que passa por outra faixa também custa soldados
      e.escaped = true;
      addText(e.x, PLAYER_Y + 20, 'Escapou!', '#ff8787', 15);
      // começa leve (10% do dano) e chega a 35% em 5 minutos
      losePower(e.dmg * (0.1 + 0.25 * Math.min(1, g.t / 300)), e.x);
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
  updateSkills(dt, myLane);
  if (state !== 'play') return;
  if (g.boss && g.boss.burn > 0 && g.boss.shieldT <= 0) {
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
      loseFraction(p.power, 2, g.x);
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
  if (g.particles.length > 300) g.particles.splice(0, g.particles.length - 300);
  for (const t of g.texts) { t.y -= 40 * dt; t.life -= dt; }
  g.texts = g.texts.filter(t => t.life > 0);
  for (const z of g.zaps) z.life -= dt;
  g.zaps = g.zaps.filter(z => z.life > 0);
  for (const p of g.planes) {
    p.t += dt;
    if (!p.hit && p.t > 0.55) { p.hit = true; applyAirStrike(); }
  }
  g.planes = g.planes.filter(p => p.t < 1.6);
  for (const r of g.rings) r.life -= dt;
  g.rings = g.rings.filter(r => r.life > 0);
  if (g.banner) { g.banner.life -= dt; if (g.banner.life <= 0) g.banner = null; }

  g.score = computeScore();
  if (g.rows === 1 && g.gates.length) showTip('gates', '🟩', 'Portões', 'Passe pelos verdes. Atire nos "+N" para aumentar o número antes de passar.');
  if (escapeLanes(myLane).length) showTip('escape', '⚠️', 'Bicho escapando!', 'Bichos que passam pelas outras faixas também tiram soldados. Troque de faixa para pegá-los.');
  g.saveT += dt;
  if (g.saveT > 5) { g.saveT = 0; saveGame(); }
  if (g.pendingEvo > 0) openChoice();
}

// ---------------------------------------------------------------------------
// Habilidades de patente
// ---------------------------------------------------------------------------
// faixas (fora a sua) com bicho prestes a escapar
function escapeLanes(myLane) {
  const lanes = new Set();
  for (const e of g.enemies) if (!e.dead && e.lane !== myLane && e.y > PLAYER_Y - 260 && e.y < PLAYER_Y + 20) lanes.add(e.lane);
  return [...lanes];
}

function updateSkills(dt, myLane) {
  const s = g.skills;
  if (rank() >= 2 && !g.shieldUp) {
    s.shield -= dt;
    if (s.shield <= 0) g.shieldUp = true;
  }
  if (rank() >= 3) {
    s.grenade -= dt;
    if (s.grenade <= 0) s.grenade = throwGrenade(myLane) ? skillCd('grenade') : 0.5;
  }
  if (rank() >= 5) {
    s.turret -= dt;
    if (s.turret <= 0) { s.turret = 0.4; turretShot(myLane); }
  }
  if (rank() >= 6) {
    s.medic -= dt;
    if (s.medic <= 0) {
      s.medic = skillCd('medic');
      const n = Math.max(1, Math.round(g.soldiers * 0.05));
      addText(g.x, PLAYER_Y - 80, '+' + n + ' ⚕️', '#8ce99a', 18);
      addSoldiers(n);
    }
  }
  if (rank() >= 7) {
    s.air -= dt;
    if (s.air <= 0) { s.air = skillCd('air'); airStrike(); }
  }
  for (const gr of g.grenades) {
    gr.t += dt;
    if (gr.t >= gr.dur && !gr.done) {
      gr.done = true;
      splashAt(gr.x1, gr.y1, 85, gr.dmg);
      g.rings.push({ x: gr.x1, y: gr.y1, r: 85, life: 0.4, max: 0.4 });
      const bo = g.boss;
      if (bo && bo.shieldT <= 0 && Math.hypot(bo.x - gr.x1, bo.y - gr.y1) < 110) bo.hp -= gr.dmg;
      burst(gr.x1, gr.y1, '#ffd43b', 20, 260);
      g.shake = Math.min(12, g.shake + 4);
      sfx(100, 0.25, 'sawtooth', 0.08, -60);
    }
  }
  g.grenades = g.grenades.filter(gr => !gr.done);
}

function throwGrenade(myLane) {
  let tgt = null;
  for (const e of g.enemies) {
    if (e.dead || isGhost(e) || e.lane !== myLane || e.y < 40 || e.y > PLAYER_Y - 80) continue;
    if (!tgt || e.hp > tgt.hp) tgt = e;
  }
  const bo = g.boss;
  let x1, y1;
  const dur = 0.6;
  if (tgt) { x1 = tgt.x; y1 = tgt.y + tgt.spd * dur; }
  else if (bo && bo.lane === myLane && bo.y > 0 && bo.shieldT <= 0) { x1 = bo.x; y1 = bo.y; }
  else return false;
  g.grenades.push({ x0: g.x, y0: PLAYER_Y - 20, x1, y1, t: 0, dur, dmg: dps() * 2 });
  sfx(500, 0.1, 'triangle', 0.04, -200);
  return true;
}

function turretShot(myLane) {
  let tgt = null;
  for (const e of g.enemies) {
    if (e.dead || isGhost(e) || e.lane === myLane || e.y < 60 || e.y > PLAYER_Y) continue;
    if (!tgt || e.y > tgt.y) tgt = e;
  }
  if (!tgt) return;
  const sx = g.x, sy = PLAYER_Y - 20, spd = 900;
  const dx = tgt.x - sx, dy = tgt.y + tgt.spd * 0.3 - sy, len = Math.hypot(dx, dy) || 1;
  g.bullets.push({
    x: sx, y: sy, vx: dx / len * spd, vy: dy / len * spd, speed: spd,
    dmg: dps() * 0.3 * 0.4, color: '#ced4da', size: 3, pierce: 0, splash: 0, splashMul: 0,
    bounce: 0, homing: 0, trail: true, hit: null,
  });
}

function airStrike() {
  g.planes.push({ t: 0, hit: false });
  sfx(60, 1.2, 'sawtooth', 0.06, 40);
}

function applyAirStrike() {
  const dmg = dps() * 1.5;
  for (const e of g.enemies) {
    if (e.dead || e.y < 0) continue;
    g.rings.push({ x: e.x, y: e.y, r: 50, life: 0.35, max: 0.35 });
    damageEnemy(e, dmg, true);
  }
  const bo = g.boss;
  if (bo && bo.shieldT <= 0 && bo.y > 0) {
    bo.hp -= dmg;
    g.rings.push({ x: bo.x, y: bo.y, r: 90, life: 0.4, max: 0.4 });
  }
  g.shake = 14;
  g.flash = 0.2; g.flashColor = '#ffa94d';
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
      color: S.color, power: S.power, hp: S.hp ? Math.ceil(refDps() * 0.12) : 0,
    });
  }
  sfx(300, 0.15, 'sawtooth', 0.06, -200);
}

function updateBoss(dt, myLane) {
  const bo = g.boss;
  if (!bo) return;
  bo.t += dt;
  bo.hitT = Math.max(0, bo.hitT - dt);
  if (bo.shieldT > 0) bo.shieldT -= dt;
  if (bo.phases.length && bo.hp / bo.maxHp < bo.phases[0]) {
    // nova fase: escudo temporário e reforços
    bo.phases.shift();
    bo.shieldT = 3;
    const d = diff();
    const types = Object.keys(ENEMY_TYPES).filter(k => ENEMY_TYPES[k].minD <= d);
    const per = bo.level >= 3 ? 2 : 1;
    for (const l of [0, 1, 2]) for (let i = 0; i < per; i++) spawnEnemy(pick(types), l, bo.y + 30 - i * 40, bo.level >= 2 ? pickMod(d) : null);
    g.banner = { text: '🛡️ Escudo do boss!', tip: 'Elimine os reforços', life: 1.8 };
    sfx(300, 0.4, 'triangle', 0.08, 300);
  }
  bo.x += (bo.tx - bo.x) * Math.min(1, dt * 3);
  // avança devagar até a metade da pista; lá fica furioso (ataca mais rápido)
  if (bo.mode !== 'enter') bo.baseY = Math.min(380, bo.baseY + 4 * dt);
  if (bo.baseY >= 380 && !bo.cornered) {
    bo.cornered = true;
    g.banner = { text: bo.name + ' está furioso!', tip: 'Ele ataca mais rápido. Acabe com ele!', life: 2.2 };
  }

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
        loseFraction(0.4, 3, g.x);
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
    if (bo.atkCd <= 0) {
      bossAttack(bo, myLane);
      if (bo.hp / bo.maxHp < 0.33) bo.atkCd *= 0.7;   // fúria no fim da luta
      if (bo.cornered) bo.atkCd *= 0.6;
      bo.atkCd *= Math.pow(0.85, threat('warlord'));
    }
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


  if (bo.hp <= 0) {
    for (let i = 0; i < 6; i++) burst(bo.x + rand(-50, 50), bo.y + rand(-40, 40), i % 2 ? bo.color : '#ffd43b', 20, 300);
    g.shake = 18;
    g.flash = 0.4; g.flashColor = '#ffffff';
    const bonus = 5 + 2 * bo.level;
    addText(W / 2, 300, 'BOSS DERROTADO!', '#ffe066', 34);
    addText(W / 2, 340, '+' + bonus + ' soldados', '#8ce99a', 20);
    addSoldiers(bonus);
    gainParts(2, g.x);
    g.bossesKilled++;
    missionAdd('bosses', 1);
    const wasFinal = bo.final;
    g.boss = null;
    if (wasFinal) { stageClear(); return; }
    g.projectiles = [];
    g.bossCd = rank() >= GENERAL_RANK ? 45 : BOSS_EVERY;
    if (rank() >= GENERAL_RANK) addThreat();
    g.gateCd = 1.5;
    g.spawnCd = 3;   // respiro depois do boss
    sfx(150, 0.9, 'sawtooth', 0.1, -120);
  }
}

// ---------------------------------------------------------------------------
// Desenho (perspectiva 3D, estilo cartoon com contorno grosso)
// ---------------------------------------------------------------------------
const FAR = -560, NEAR = 900;
const INK = '#1d1530';    // contorno escuro usado em tudo
const FONT = '"Lilita One", "Arial Black", system-ui, sans-serif';

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
  r = Math.min(r, w / 2, h / 2);
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

// contorna o caminho atual com a tinta escura
function ink(lw = 3) {
  ctx.lineWidth = lw;
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

function blob(x, y, r, color, lw = 3) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill(); ink(lw);
}

function oval(x, y, rx, ry, color, lw = 3) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill(); ink(lw);
}

// traço colorido com contorno (pernas, pescoços)
function inkStroke(color, lw) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = lw + 5;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.lineWidth = lw;
  ctx.strokeStyle = color;
  ctx.stroke();
}

// clareia (amt > 0) ou escurece (amt < 0) uma cor #rrggbb
const shadeCache = new Map();
function shade(hex, amt) {
  const key = hex + amt;
  let v = shadeCache.get(key);
  if (v) return v;
  const n = parseInt(hex.slice(1), 16);
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  const ch = c => Math.round((t - c) * p + c);
  v = `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
  shadeCache.set(key, v);
  return v;
}

function text(str, x, y, size, color, align = 'center') {
  ctx.font = `${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(3, size / 4);
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  const sh = Math.max(1.5, size * 0.09);
  ctx.strokeText(str, x, y + sh);
  ctx.fillText(str, x, y + sh);
  ctx.strokeText(str, x, y);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

// Texto que encolhe até caber na largura
function fitText(str, x, y, maxW, size, color, align = 'center') {
  ctx.font = `${size}px ${FONT}`;
  while (size > 9 && ctx.measureText(str).width > maxW) {
    size--;
    ctx.font = `${size}px ${FONT}`;
  }
  text(str, x, y, size, color, align);
}

function wrapLines(str, maxW, size) {
  ctx.font = `${size}px ${FONT}`;
  const words = str.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const tryLine = cur ? cur + ' ' + w : w;
    if (ctx.measureText(tryLine).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = tryLine;
  }
  if (cur) lines.push(cur);
  return lines;
}

function emoji(str, x, y, size) {
  ctx.font = `${size}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// painel arredondado com contorno e brilho no topo
function panel(x, y, w, h, r, fill, lw = 3) {
  roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ink(lw);
  roundRect(x + 3, y + 3, w - 6, Math.max(4, h * 0.42), Math.max(2, r - 3));
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.fill();
}

// botão 3D (face + base mais escura)
function button3d(x, y, w, h, top, bottom, label, size) {
  roundRect(x, y + 5, w, h, 14);
  ctx.fillStyle = bottom;
  ctx.fill();
  ink(3);
  roundRect(x, y, w, h, 14);
  ctx.fillStyle = top;
  ctx.fill();
  ink(3);
  roundRect(x + 5, y + 4, w - 10, h * 0.38, 9);
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.fill();
  fitText(label, x + w / 2, y + h / 2 + 1, w - 16, size, '#fff');
}

// ---------------------------------------------------------------------------
// Cenário
// ---------------------------------------------------------------------------
function drawTree(x, y, big) {
  at(x, y, big ? 1.25 : 1);
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ellipse(0, 0, 32, 10);
  roundRect(-7, -38, 14, 38, 4);
  ctx.fillStyle = '#8a5a2b';
  ctx.fill();
  ink(3);
  blob(-16, -52, 20, '#2f9e44', 3);
  blob(16, -54, 20, '#2f9e44', 3);
  blob(0, -70, 26, '#37b24d', 3);
  ctx.fillStyle = 'rgba(255,255,255,.25)';
  ellipse(-8, -80, 10, 6);
  ctx.restore();
}

function drawBush(x, y) {
  at(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.2)';
  ellipse(0, 0, 26, 8);
  blob(-12, -10, 13, '#40c057', 3);
  blob(12, -10, 13, '#40c057', 3);
  blob(0, -18, 15, '#51cf66', 3);
  ctx.restore();
}

function drawRock(x, y) {
  at(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.2)';
  ellipse(0, 0, 22, 7);
  ctx.beginPath();
  ctx.moveTo(-20, 0); ctx.lineTo(-16, -16); ctx.lineTo(-2, -24); ctx.lineTo(14, -18); ctx.lineTo(20, 0);
  ctx.closePath();
  ctx.fillStyle = '#adb5bd';
  ctx.fill();
  ink(3);
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ellipse(-6, -16, 6, 3);
  ctx.restore();
}

function drawGround(scroll) {
  // grama
  ctx.fillStyle = '#72c046';
  ctx.fillRect(0, 0, W, H);
  // xadrez de grama: faixas horizontais + verticais
  ctx.fillStyle = 'rgba(0, 60, 0, .08)';
  for (let y = FAR - 120 + (scroll % 120); y < NEAR; y += 120) { quad(-900, y, W + 900, y + 60); ctx.fill(); }
  for (let x = -900; x < W + 900; x += 120) { quad(x, FAR, x + 60, NEAR); ctx.fill(); }

  // caminho de pedra clara
  quad(-8, FAR, W + 8, NEAR);
  ctx.fillStyle = '#e8cf9a';
  ctx.fill();
  ctx.fillStyle = 'rgba(150, 100, 40, .10)';
  for (let y = FAR - 80 + (scroll % 80); y < NEAR; y += 80) {
    for (let i = 0; i < 3; i++) { quad(i * 150 + (Math.round((y - scroll) / 80) % 2 ? 75 : 0), y, i * 150 + 75 + (Math.round((y - scroll) / 80) % 2 ? 75 : 0), y + 40); ctx.fill(); }
  }
  // divisórias das faixas
  ctx.fillStyle = 'rgba(140, 90, 30, .35)';
  for (const lx of [150, 300]) {
    for (let y = FAR - 60 + (scroll % 60); y < NEAR; y += 60) { quad(lx - 3, y, lx + 3, y + 34); ctx.fill(); }
  }
  // bordas de pedra
  for (let y = FAR - 50 + (scroll % 50); y < NEAR; y += 50) {
    for (const ex of [-6, W + 6]) {
      const p = proj(ex, y);
      if (p.y < 120) continue;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - 3 * p.s, 13 * p.s, 8 * p.s, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#c9c4b8';
      ctx.fill();
      ink(2 * p.s);
    }
  }
  // decoração nas laterais (de longe para perto)
  let k = 0;
  for (let y = FAR - 240 + (scroll * 1.5 % 240); y < NEAR; y += 120, k++) {
    const idx = Math.round((y - scroll * 1.5) / 120) & 3;
    if (idx === 0) drawTree(-80, y, true);
    else if (idx === 1) drawBush(-60, y);
    else if (idx === 2) drawTree(-95, y, false);
    else drawRock(-55, y);
    if (idx === 2) drawTree(W + 80, y, true);
    else if (idx === 3) drawBush(W + 60, y);
    else if (idx === 0) drawTree(W + 95, y, false);
    else drawRock(W + 55, y);
  }
}

function drawFog() {
  const fg = ctx.createLinearGradient(0, 0, 0, 200);
  fg.addColorStop(0, 'rgba(214, 238, 255, 1)');
  fg.addColorStop(0.35, 'rgba(214, 238, 255, .7)');
  fg.addColorStop(1, 'rgba(214, 238, 255, 0)');
  ctx.fillStyle = fg;
  ctx.fillRect(0, 0, W, 200);
}

// ---------------------------------------------------------------------------
// Esquadrão
// ---------------------------------------------------------------------------
function drawSoldier(rank, leader, bob, tier) {
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ellipse(0, 0, 8, 3);
  oval(-3.5, -2, 3, 2.2, '#4a3426', 1.5);
  oval(3.5, -2, 3, 2.2, '#4a3426', 1.5);
  // corpo
  roundRect(-6.5, -15 + bob, 13, 12, 4);
  ctx.fillStyle = rank.color;
  ctx.fill();
  ink(2);
  // mochila com as divisas
  roundRect(-4.5, -14 + bob, 9, 7.5, 2);
  ctx.fillStyle = shade(rank.helmet, -0.15);
  ctx.fill();
  ink(1.5);
  if (tier > 0) {
    ctx.strokeStyle = '#ffd43b';
    ctx.lineWidth = 1.3;
    for (let i = 0; i < Math.min(tier, 3); i++) {
      ctx.beginPath();
      ctx.moveTo(-3, -12.5 + i * 2.2 + bob);
      ctx.lineTo(0, -10.5 + i * 2.2 + bob);
      ctx.lineTo(3, -12.5 + i * 2.2 + bob);
      ctx.stroke();
    }
  }
  // arma
  roundRect(4, -29 + bob, 3.5, 15, 1.5);
  ctx.fillStyle = '#4a4a5e';
  ctx.fill();
  ink(1.5);
  // cabeça grande com capacete (vista de costas)
  blob(0, -20 + bob, 6.5, '#ffcf9e', 2);
  blob(0, -22.5 + bob, 6.8, leader ? '#ffd43b' : rank.helmet, 2);
  ctx.fillStyle = 'rgba(255,255,255,.45)';
  ellipse(-2.5, -25.5 + bob, 2.6, 1.6);
}

// Cada soldado é desenhado uma vez numa imagem (por patente) e depois só
// carimbado na tela: bem mais leve com esquadrões grandes.
const SPRITE_RES = 4;
const spriteCache = new Map();
function soldierSprite(step, leader) {
  const t = Math.min(rankOf(step), RANKS.length - 1);
  const key = t + (leader ? 'L' : '');
  let c = spriteCache.get(key);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = 24 * SPRITE_RES;
  c.height = 36 * SPRITE_RES;
  const main = ctx;
  ctx = c.getContext('2d');
  ctx.scale(SPRITE_RES, SPRITE_RES);
  ctx.translate(12, 32);
  drawSoldier(RANKS[t], leader, 0, t);
  ctx = main;
  spriteCache.set(key, c);
  return c;
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
    ctx.drawImage(soldierSprite(g.tier, i === 0), -12, -32 + Math.sin(g.t * 14 + i) * 1.3, 24, 36);
    ctx.restore();
  }
  if (g.shieldUp) {
    const sp = proj(g.x, PLAYER_Y + 5);
    ctx.globalAlpha = 0.55 + 0.15 * Math.sin(g.t * 6);
    ctx.beginPath();
    ctx.ellipse(sp.x, sp.y - 20 * size, 62 * size, 52 * size, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(116, 192, 252, .15)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#74c0fc';
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const lp = proj(g.x, PLAYER_Y - 45 * size);
  const label = fmt(g.soldiers);
  const bw = 30 + label.length * 12;
  panel(lp.x - bw / 2, lp.y - 42, bw, 30, 15, rank.helmet, 3);
  text(label, lp.x, lp.y - 27, 20, '#fff');
  text(rank.name, lp.x, lp.y - 56, 14, shade(rank.color, 0.2));
}

// ---------------------------------------------------------------------------
// Inimigos
// ---------------------------------------------------------------------------
function hpBar(x, y, w, frac, color) {
  roundRect(x - w / 2, y, w, 6, 3);
  ctx.fillStyle = '#2b2b3b';
  ctx.fill();
  ink(1.5);
  if (frac > 0) {
    roundRect(x - w / 2 + 1, y + 1, Math.max(2, (w - 2) * frac), 4, 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function drawEnemy(e) {
  at(e.x, e.y);
  const r = e.r;
  const wob = Math.sin(e.wob);
  const cy = -r - 4 - Math.abs(wob) * 3;
  const ghost = isGhost(e);
  if (e.mod === 'ghost') ctx.globalAlpha = ghost ? 0.25 : 0.9;
  if (e.dashing) {
    ctx.strokeStyle = 'rgba(255,255,255,.7)';
    ctx.lineWidth = 2.5;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * r * 0.6, cy - r - 4);
      ctx.lineTo(i * r * 0.6, cy - r - 26 - Math.random() * 10);
      ctx.stroke();
    }
  }
  if (e.type === 'healer') {
    // aura de cura no chão
    ctx.beginPath();
    ctx.ellipse(0, 0, HEAL_RADIUS, HEAL_RADIUS * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(105, 219, 124, .12)';
    ctx.fill();
    ctx.setLineDash([10, 8]);
    ctx.lineDashOffset = -g.t * 30;
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(105, 219, 124, .7)';
    ctx.stroke();
    ctx.setLineDash([]);
  }
  if (e.rage) {
    // aura vermelha pulsante: criatura enfurecida pelo boss
    ctx.fillStyle = `rgba(255, 50, 50, ${0.25 + 0.15 * Math.sin(g.t * 10 + e.id)})`;
    circle(0, cy, r * 1.45);
  }
  if (e.mod === 'elite') {
    ctx.fillStyle = 'rgba(255, 212, 59, .35)';
    circle(0, cy, r * 1.35);
  }
  if (e.mod === 'regen' && g.t - e.lastHit > 1 && e.hp < e.maxHp) {
    ctx.fillStyle = 'rgba(105, 219, 124, .4)';
    circle(0, cy, r * 1.3);
  }
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ellipse(0, 0, r, r * 0.35);
  // pés
  const foot = shade(e.color, -0.35);
  oval(-r * 0.45, -2 + wob * 1.5, r * 0.36, r * 0.24, foot, 2);
  oval(r * 0.45, -2 - wob * 1.5, r * 0.36, r * 0.24, foot, 2);
  // corpo
  const body = e.hitT > 0 ? '#ffffff' : e.color;
  blob(0, cy, r, body, Math.max(2.5, r / 6));
  ctx.fillStyle = e.hitT > 0 ? '#fff' : shade(e.color, 0.35);
  ellipse(0, cy + r * 0.45, r * 0.6, r * 0.38);
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  ellipse(-r * 0.4, cy - r * 0.5, r * 0.28, r * 0.17);
  if (e.type === 'brute' || e.type === 'tank') {
    for (let s = -1; s <= 1; s += 2) {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.45, cy - r * 0.75);
      ctx.lineTo(s * r * 0.9, cy - r * 1.35);
      ctx.lineTo(s * r * 0.15, cy - r * 0.92);
      ctx.closePath();
      ctx.fillStyle = '#fff4e6';
      ctx.fill();
      ink(2);
    }
  }
  // olhos bravos
  const er = Math.max(3, r * 0.27);
  for (let s = -1; s <= 1; s += 2) {
    blob(s * r * 0.36, cy - r * 0.12, er, '#fff', 1.5);
    ctx.fillStyle = INK;
    circle(s * r * 0.33, cy - r * 0.05, er * 0.5);
    ctx.beginPath();
    ctx.moveTo(s * r * 0.62, cy - r * 0.48);
    ctx.lineTo(s * r * 0.12, cy - r * 0.3);
    ink(Math.max(2, r / 7));
  }
  ctx.beginPath();
  ctx.arc(0, cy + r * 0.32, r * 0.28, 0.15 * Math.PI, 0.85 * Math.PI);
  ink(Math.max(1.5, r / 9));
  if (e.type === 'healer') {
    // cruz de cura na testa
    blob(0, cy - r * 0.62, r * 0.32, '#fff', 2);
    ctx.fillStyle = '#2f9e44';
    ctx.fillRect(-r * 0.07, cy - r * 0.8, r * 0.14, r * 0.36);
    ctx.fillRect(-r * 0.18, cy - r * 0.69, r * 0.36, r * 0.14);
  }
  if (e.type === 'glutton') {
    // bocarra com dentes
    oval(0, cy + r * 0.35, r * 0.55, r * 0.32, '#3b0a3f', 2.5);
    ctx.fillStyle = '#fff';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * r * 0.18 - r * 0.07, cy + r * 0.12);
      ctx.lineTo(i * r * 0.18 + r * 0.07, cy + r * 0.12);
      ctx.lineTo(i * r * 0.18, cy + r * 0.3);
      ctx.closePath();
      ctx.fill();
    }
  }
  if (e.type === 'shieldbearer') {
    // escudo-torre na frente (voltado para o esquadrão)
    roundRect(-r * 1.05, cy - r * 0.1, r * 2.1, r * 1.35, r * 0.35);
    ctx.fillStyle = '#ced4da';
    ctx.fill();
    ink(3);
    roundRect(-r * 0.8, cy + r * 0.08, r * 1.6, r * 0.98, r * 0.25);
    ctx.fillStyle = '#4c6ef5';
    ctx.fill();
    ink(2);
    ctx.fillStyle = '#ffd43b';
    ctx.beginPath();
    ctx.moveTo(0, cy + r * 0.2); ctx.lineTo(r * 0.28, cy + r * 0.55); ctx.lineTo(0, cy + r * 0.92); ctx.lineTo(-r * 0.28, cy + r * 0.55);
    ctx.closePath();
    ctx.fill();
    ink(1.5);
  }
  if (e.slow > 0) {
    ctx.beginPath(); ctx.arc(0, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(165, 216, 255, .5)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#e7f5ff';
    ctx.stroke();
  }
  if (e.burn > 0) {
    for (let i = 0; i < 3; i++) {
      const fx = (i - 1) * r * 0.5;
      ctx.beginPath();
      ctx.moveTo(fx - r * 0.25, cy - r * 0.55);
      ctx.lineTo(fx + r * 0.25, cy - r * 0.55);
      ctx.lineTo(fx, cy - r - 6 - Math.random() * 8);
      ctx.closePath();
      ctx.fillStyle = i % 2 ? '#ffd43b' : '#ff922b';
      ctx.fill();
      ink(1.5);
    }
  }
  if (e.mod === 'elite') {
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, cy - r * 0.85); ctx.lineTo(-r * 0.42, cy - r * 1.35); ctx.lineTo(-r * 0.15, cy - r * 1.08);
    ctx.lineTo(0, cy - r * 1.45); ctx.lineTo(r * 0.15, cy - r * 1.08); ctx.lineTo(r * 0.42, cy - r * 1.35);
    ctx.lineTo(r * 0.5, cy - r * 0.85);
    ctx.closePath();
    ctx.fillStyle = '#ffd43b';
    ctx.fill();
    ink(2);
  }
  if (e.shield > 0) {
    ctx.beginPath(); ctx.arc(0, cy, r * 1.45, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(116, 192, 252, .22)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#4dabf7';
    ctx.stroke();
    text(String(e.shield), r * 1.3, cy - r * 1.15, 14, '#d0ebff');
  }
  if (e.mod && e.mod !== 'elite') emoji(MODS[e.mod].icon, -r * 1.2, cy - r * 1.1, Math.max(12, r * 0.85));
  if (e.hp < e.maxHp) hpBar(0, cy - r - 13, r * 2.2, Math.max(0, e.hp / e.maxHp), '#ff4d4d');
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Portões e baús
// ---------------------------------------------------------------------------
function drawGateRow(row) {
  for (const c of row.cells) {
    at(LANES[c.lane], row.y);
    const used = row.used >= 0;
    const good = isGood(c);
    const base = good ? '#40b83a' : '#e5383b';
    const grow = c.pulse > 0 ? 4 : 0;
    ctx.globalAlpha = used ? (row.used === c.lane ? 0.25 : 0.12) : 1;
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.fillRect(-72, -4, 144, 8);
    // campo de força até o chão
    ctx.fillStyle = good ? 'rgba(140, 233, 154, .25)' : 'rgba(255, 135, 135, .25)';
    ctx.fillRect(-64, -32, 128, 32);
    // postes de madeira com ponta dourada
    for (const px of [-70, 70]) {
      roundRect(px - 5, -92, 10, 92, 3);
      ctx.fillStyle = '#9c6230';
      ctx.fill();
      ink(2.5);
      blob(px, -95, 6.5, '#ffd43b', 2);
    }
    // placa
    roundRect(-66 - grow, -88 - grow, 132 + grow * 2, 56 + grow * 2, 11);
    const gr = ctx.createLinearGradient(0, -88, 0, -32);
    gr.addColorStop(0, shade(base, 0.3));
    gr.addColorStop(1, shade(base, -0.15));
    ctx.fillStyle = gr;
    ctx.fill();
    ink(3.5);
    roundRect(-60, -84, 120, 20, 8);
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    ctx.fill();
    const label = cellLabel(c);
    let size = 28;
    ctx.font = `${size}px ${FONT}`;
    while (size > 11 && ctx.measureText(label).width > 116) {
      size--;
      ctx.font = `${size}px ${FONT}`;
    }
    text(label, 0, c.kind === 'add' ? -64 : -60, size, '#fff');
    if (c.kind === 'add' && !used) {
      roundRect(-40, -46, 80, 8, 4);
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.fill();
      ink(1.5);
      if (c.prog > 0) {
        roundRect(-39, -45, 78 * (c.prog / c.need), 6, 3);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

function drawCrate(cr) {
  at(LANES[cr.lane], cr.y);
  const hit = cr.hitT > 0;
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ellipse(0, 0, 34, 10);
  // corpo do baú
  roundRect(-28, -40, 56, 40, 6);
  ctx.fillStyle = hit ? '#fff4e6' : '#b8652a';
  ctx.fill();
  ink(3);
  // tampa arredondada
  ctx.beginPath();
  ctx.moveTo(-30, -38);
  ctx.bezierCurveTo(-30, -70, 30, -70, 30, -38);
  ctx.closePath();
  ctx.fillStyle = hit ? '#fff4e6' : '#d07a32';
  ctx.fill();
  ink(3);
  // faixas douradas
  for (const fx of [-17, 17]) {
    roundRect(fx - 4, -60, 8, 60, 2);
    ctx.fillStyle = '#ffcc33';
    ctx.fill();
    ink(2);
  }
  ctx.beginPath();
  ctx.moveTo(-30, -39); ctx.lineTo(30, -39);
  ink(3);
  // fechadura
  roundRect(-7, -46, 14, 14, 3);
  ctx.fillStyle = '#ffcc33';
  ctx.fill();
  ink(2);
  ctx.fillStyle = INK;
  circle(0, -40, 2);
  const icon = cr.reward.kind === 'weapon' ? '🔧' : cr.reward.kind === 'add' ? '👥' : '⚡';
  emoji(icon, 0, -20, 18);
  text(pct(cr.hp, cr.maxHp), 0, 16, 16, '#fff');
  ctx.restore();
}

function drawTelegraph() {
  const bo = g.boss;
  if (!bo || !bo.tele) return;
  const a = 0.2 + 0.15 * Math.sin(g.t * 30);
  for (const l of bo.tele.lanes) {
    ctx.fillStyle = bo.tele.charge ? `rgba(255, 120, 0, ${a})` : `rgba(255, 40, 40, ${a})`;
    quad(LANES[l] - 73, bo.y, LANES[l] + 73, PLAYER_Y + 70);
    ctx.fill();
    const p = proj(LANES[l], PLAYER_Y - 170);
    const s = 26 * p.s;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - s); ctx.lineTo(p.x + s, p.y + s * 0.8); ctx.lineTo(p.x - s, p.y + s * 0.8);
    ctx.closePath();
    ctx.fillStyle = '#ffd43b';
    ctx.fill();
    ink(3);
    text('!', p.x, p.y + s * 0.2, 28 * p.s, '#fff');
  }
}

// ---------------------------------------------------------------------------
// Bosses
// ---------------------------------------------------------------------------
function drawBeetle(bo, col, pul) {
  for (let s = -1; s <= 1; s += 2) {
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(s * 35, -15 + k * 18);
      ctx.quadraticCurveTo(s * 80, -30 + k * 22 + pul * s, s * 75, 10 + k * 22);
      inkStroke(shade(bo.color, -0.25), 7);
    }
  }
  oval(0, 0, 58, 50 + pul, col, 4);
  ctx.beginPath();
  ctx.moveTo(0, -48); ctx.lineTo(0, 46);
  ink(3);
  ctx.fillStyle = 'rgba(255,255,255,.3)';
  ellipse(-24, -24, 14, 9);
  ellipse(24, -24, 14, 9);
  ctx.beginPath();
  ctx.moveTo(-30, -42); ctx.lineTo(-22, -68); ctx.lineTo(-8, -50); ctx.lineTo(0, -74);
  ctx.lineTo(8, -50); ctx.lineTo(22, -68); ctx.lineTo(30, -42);
  ctx.closePath();
  ctx.fillStyle = '#ffd43b';
  ctx.fill();
  ink(3);
  for (let s = -1; s <= 1; s += 2) {
    blob(s * 20, -10, 11, '#fff', 2.5);
    ctx.fillStyle = INK;
    circle(s * 18, -7, 5.5);
  }
  oval(0, 22, 22, 8 + Math.abs(pul), '#3b1d1d', 3);
}

function drawSpider(bo, col, pul) {
  for (let s = -1; s <= 1; s += 2) {
    for (let k = 0; k < 4; k++) {
      const ky = -20 + k * 16;
      ctx.beginPath();
      ctx.moveTo(s * 20, ky);
      ctx.lineTo(s * (70 + k * 4), ky - 40 + Math.sin(bo.t * 6 + k + s) * 6);
      ctx.lineTo(s * (92 + k * 6), ky + 42 + k * 6);
      inkStroke('#4b1d5c', 6);
    }
  }
  oval(0, -28, 52, 46 + pul, col, 4);
  ctx.beginPath();
  ctx.moveTo(-12, -48); ctx.lineTo(12, -48); ctx.lineTo(0, -30);
  ctx.lineTo(12, -12); ctx.lineTo(-12, -12); ctx.lineTo(0, -30);
  ctx.closePath();
  ctx.fillStyle = '#ff4d4d';
  ctx.fill();
  ink(2.5);
  ctx.fillStyle = 'rgba(255,255,255,.25)';
  ellipse(-22, -50, 14, 8);
  blob(0, 28, 30, shade(bo.color, -0.2), 4);
  for (const [ex, ey] of [[-14, 22], [14, 22], [-6, 14], [6, 14], [-21, 31], [21, 31]]) blob(ex, ey, 4.5, '#ff4d4d', 1.5);
  for (let s = -1; s <= 1; s += 2) {
    ctx.beginPath();
    ctx.moveTo(s * 4, 50); ctx.lineTo(s * 13, 50); ctx.lineTo(s * 8, 64 + pul);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
    ink(2);
  }
}

function drawWorm(bo, col, pul) {
  for (let i = 5; i >= 1; i--) {
    const sx = Math.sin(bo.t * 3 - i * 0.8) * 10;
    blob(sx, -i * 26, 46 - i * 4, i % 2 ? shade(bo.color, -0.15) : col, 4);
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ellipse(sx - 12, -i * 26 - 14, 12, 7);
  }
  blob(0, 10, 52, col, 4);
  blob(0, 20, 30 + pul, '#3b0a1a', 3);
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    const r = 30 + pul;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a - 0.2) * r, 20 + Math.sin(a - 0.2) * r);
    ctx.lineTo(Math.cos(a + 0.2) * r, 20 + Math.sin(a + 0.2) * r);
    ctx.lineTo(Math.cos(a) * r * 0.6, 20 + Math.sin(a) * r * 0.6);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
    ink(1.5);
  }
  for (let s = -1; s <= 1; s += 2) {
    blob(s * 34, -16, 9, '#ffe066', 2.5);
    ctx.fillStyle = INK;
    circle(s * 34, -15, 4);
  }
}

const GOLEM_SHAPE = [1, 0.88, 1.06, 0.92, 1, 0.95, 1.08, 0.9, 1.02];
function drawGolem(bo, col, pul, flick) {
  const rock = flick ? '#fff' : '#7a6a58';
  for (let s = -1; s <= 1; s += 2) blob(s * 76, 18 + pul * s, 25, flick ? '#fff' : '#665645', 4);
  ctx.beginPath();
  GOLEM_SHAPE.forEach((m, i) => {
    const a = i / GOLEM_SHAPE.length * Math.PI * 2 - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * 60 * m, Math.sin(a) * 56 * m);
  });
  ctx.closePath();
  ctx.fillStyle = rock;
  ctx.fill();
  ink(4);
  ctx.fillStyle = 'rgba(255,255,255,.2)';
  ellipse(-22, -30, 16, 9);
  // rachaduras de lava (brilho barato: traço largo escuro + traço fino claro)
  ctx.beginPath();
  ctx.moveTo(-40, -20); ctx.lineTo(-18, 2); ctx.lineTo(-30, 30);
  ctx.moveTo(42, -26); ctx.lineTo(22, 0); ctx.lineTo(34, 28);
  ctx.moveTo(-6, 30); ctx.lineTo(8, 46);
  ctx.moveTo(-82, 10); ctx.lineTo(-70, 26);
  ctx.moveTo(82, 10); ctx.lineTo(70, 26);
  ctx.lineCap = 'round';
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(255, 106, 0, .55)';
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffd43b';
  ctx.stroke();
  for (const ex of [-18, 18]) {
    roundRect(ex - 9, -24, 18, 9, 3);
    ctx.fillStyle = '#ffd43b';
    ctx.fill();
    ink(2.5);
  }
  roundRect(-16, 8, 32, 8 + Math.abs(pul), 3);
  ctx.fillStyle = col;
  ctx.fill();
  ink(2.5);
}

function drawHydra(bo, col, pul) {
  const heads = [[-58, -52], [0, -78], [58, -52]];
  heads.forEach(([hx, hy], i) => {
    const sx = hx + Math.sin(bo.t * 3 + i * 2) * 8;
    ctx.beginPath();
    ctx.moveTo(hx * 0.3, 20);
    ctx.quadraticCurveTo(hx * 0.95, 0, sx, hy);
    inkStroke(col, 18);
  });
  oval(0, 36, 62, 34 + pul * 0.5, col, 4);
  ctx.fillStyle = 'rgba(255,255,255,.2)';
  ellipse(-22, 22, 18, 8);
  heads.forEach(([hx, hy], i) => {
    const sx = hx + Math.sin(bo.t * 3 + i * 2) * 8;
    oval(sx, hy, 23, 19, col, 3.5);
    oval(sx, hy + 10, 11, 5 + (bo.tele ? 3 : 0), bo.tele ? '#ff922b' : '#1b1b3a', 2);
    for (const s of [-1, 1]) {
      blob(sx + s * 8, hy - 5, 4.5, '#ffe066', 1.5);
      ctx.fillStyle = INK;
      circle(sx + s * 8, hy - 4.5, 1.8);
    }
  });
}

const BOSS_DRAW = { beetle: drawBeetle, spider: drawSpider, worm: drawWorm, golem: drawGolem, hydra: drawHydra };

function drawBoss() {
  const bo = g.boss;
  at(bo.x, bo.y, 1.5);
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ellipse(0, 0, 70, 18);
  ctx.translate(0, -60);
  const flick = bo.hitT > 0 && Math.floor(bo.t * 30) % 4 === 0;
  const col = flick ? '#ffffff' : bo.color;
  BOSS_DRAW[bo.kind](bo, col, Math.sin(bo.t * 4) * 3, flick);
  if (bo.shieldT > 0) {
    ctx.globalAlpha = 0.6 + 0.3 * Math.sin(bo.t * 20);
    ctx.beginPath(); ctx.ellipse(0, 0, 105, 95, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(116, 192, 252, .25)';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#4dabf7';
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawProjectiles() {
  for (const p of g.projectiles) {
    at(p.x, p.y);
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ellipse(0, 0, p.r, p.r * 0.3);
    ctx.translate(0, -24);
    ctx.rotate(p.rot);
    if (p.kind === 'web') {
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 4;
        ctx.moveTo(-Math.cos(a) * p.r, -Math.sin(a) * p.r);
        ctx.lineTo(Math.cos(a) * p.r, Math.sin(a) * p.r);
      }
      ctx.moveTo(p.r * 0.6, 0); ctx.arc(0, 0, p.r * 0.6, 0, Math.PI * 2);
      ctx.moveTo(p.r, 0); ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      inkStroke('#f1f3f5', 2.5);
    } else if (p.kind === 'rock') {
      ctx.beginPath();
      GOLEM_SHAPE.forEach((m, i) => {
        const a = i / GOLEM_SHAPE.length * Math.PI * 2;
        ctx.lineTo(Math.cos(a) * p.r * m, Math.sin(a) * p.r * m);
      });
      ctx.closePath();
      ctx.fillStyle = '#8d6e4f';
      ctx.fill();
      ink(3);
    } else if (p.kind === 'fire') {
      ctx.fillStyle = 'rgba(255, 146, 43, .45)';
      circle(0, 0, p.r * 1.35);
      blob(0, 0, p.r, p.color, 3);
      ctx.fillStyle = '#ffe066';
      circle(0, 0, p.r * 0.5);
    } else {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? p.r * 0.5 : p.r;
        const a = i * Math.PI / 5;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.fill();
      ink(3);
    }
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// Tiros e efeitos
// ---------------------------------------------------------------------------
function drawBullets() {
  ctx.lineCap = 'round';
  for (const b of g.bullets) {
    const p = proj(b.x, b.y);
    const s = b.size * p.s;
    const y = p.y - 16 * p.s;
    if (b.trail) {
      const q = proj(b.x - b.vx * 0.035, b.y - b.vy * 0.035);
      ctx.globalAlpha = 0.5;
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
      ctx.globalAlpha = 0.35;
      circle(p.x, y, s * 2.2);
      ctx.globalAlpha = 1;
      blob(p.x, y, s, b.color, 1.5);
    } else if (b.vx) {
      circle(p.x, y, s * 0.9);
    } else {
      ctx.fillRect(p.x - s / 2, y - s * 2.5, s, s * 5);
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.fillRect(p.x - s / 4, y - s * 2.2, s / 2, s * 2);
    }
  }
}

function drawGrenades() {
  for (const gr of g.grenades) {
    const k = gr.t / gr.dur;
    const p = proj(gr.x0 + (gr.x1 - gr.x0) * k, gr.y0 + (gr.y1 - gr.y0) * k);
    const hgt = Math.sin(k * Math.PI) * 120 + 16;
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ellipse(p.x, p.y, 6 * p.s, 2 * p.s);
    blob(p.x, p.y - hgt * p.s, 7 * p.s, '#2f9e44', 2);
    blob(p.x + 3 * p.s, p.y - (hgt + 6) * p.s, 2.5 * p.s, '#ffd43b', 1);
  }
}

function drawPlanes() {
  for (const pl of g.planes) {
    const y = H + 80 - pl.t * (H + 260) / 1.2;
    for (const fx of [0.22, 0.5, 0.78]) {
      const x = W * fx;
      ctx.fillStyle = 'rgba(0,0,0,.2)';
      ctx.beginPath(); ctx.ellipse(x + 30, y + 60, 26, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y - 30); ctx.lineTo(x + 6, y - 6); ctx.lineTo(x + 32, y + 6); ctx.lineTo(x + 6, y + 8);
      ctx.lineTo(x + 4, y + 22); ctx.lineTo(x + 12, y + 28); ctx.lineTo(x - 12, y + 28); ctx.lineTo(x - 4, y + 22);
      ctx.lineTo(x - 6, y + 8); ctx.lineTo(x - 32, y + 6); ctx.lineTo(x - 6, y - 6);
      ctx.closePath();
      ctx.fillStyle = '#4c6ef5';
      ctx.fill();
      ink(3);
      blob(x, y - 12, 4, '#a5d8ff', 1.5);
      ctx.fillStyle = '#ffa94d';
      circle(x, y + 32, 4 + Math.random() * 3);
    }
  }
}

function drawEffects() {
  for (const r of g.rings) {
    const p = proj(r.x, r.y);
    const k = 1 - r.life / r.max;
    const rx = r.r * p.s * (0.3 + 0.7 * k);
    ctx.globalAlpha = r.life / r.max;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y - 10 * p.s, rx, rx * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 190, 90, .35)';
    ctx.fill();
    ctx.lineWidth = 4 * p.s;
    ctx.strokeStyle = '#ff922b';
    ctx.stroke();
  }
  for (const z of g.zaps) {
    const a = proj(z.x1, z.y1), b = proj(z.x2, z.y2);
    const ay = a.y - 20 * a.s, by = b.y - 20 * b.s;
    ctx.globalAlpha = Math.min(1, z.life * 8);
    ctx.beginPath();
    ctx.moveTo(a.x, ay);
    for (let i = 1; i < 6; i++) {
      const t = i / 6;
      ctx.lineTo(a.x + (b.x - a.x) * t + rand(-8, 8), ay + (by - ay) * t + rand(-8, 8));
    }
    ctx.lineTo(b.x, by);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(77, 171, 247, .5)';
    ctx.stroke();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = z.color || '#e7f5ff';
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
const inRect = (r, x, y) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

// Botões tocáveis desenhados neste quadro (recriados a cada desenho)
let uiButtons = [];
function uiButton(x, y, w, h, top, bottom, label, size, action) {
  button3d(x, y, w, h, top, bottom, label, size);
  uiButtons.push({ x, y, w, h: h + 5, action });
}

function badge(x, y, w, h, border, icon, label, labelColor) {
  panel(x, y, w, h, 9, '#2c3e78', 2.5);
  roundRect(x + 2.5, y + 2.5, w - 5, h - 5, 7);
  ctx.lineWidth = 2;
  ctx.strokeStyle = border;
  ctx.stroke();
  emoji(icon, x + (label ? 14 : w / 2), y + h / 2 + 1, 15);
  if (label) text(label, x + w - 11, y + h / 2, 14, labelColor);
}

function bar(x, y, w, h, frac, color) {
  roundRect(x, y, w, h, h / 2);
  ctx.fillStyle = '#2a1840';
  ctx.fill();
  ink(2);
  if (frac > 0) {
    roundRect(x + 2, y + 2, (w - 4) * Math.min(1, frac), h - 4, (h - 4) / 2);
    ctx.fillStyle = color;
    ctx.fill();
    roundRect(x + 3, y + 3, (w - 6) * Math.min(1, frac), (h - 6) * 0.4, 2);
    ctx.fillStyle = 'rgba(255,255,255,.3)';
    ctx.fill();
  }
}

const pct = (v, max) => Math.max(0, Math.ceil(v / max * 100)) + '%';

function coinPill(x, y) {
  panel(x, y, 120, 36, 14, '#27407a');
  blob(x + 18, y + 18, 11, '#ffcc33', 2.5);
  text('$', x + 18, y + 18, 13, '#b35c00');
  fitText(fmt(meta.coins), x + 36, y + 18, 78, 18, '#ffe066', 'left');
}

function drawHUD() {
  // topo: menu, pontos, onda/fase e tempo
  panel(8, 6, 40, 36, 12, '#7048e8');
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 3; i++) { roundRect(18, 14 + i * 8, 20, 4, 2); ctx.fill(); ink(1.5); }
  uiButtons.push({ x: 4, y: 2, w: 48, h: 44, action: openMenu });
  panel(54, 6, 140, 36, 14, '#27407a');
  blob(72, 24, 12, '#ffcc33', 2.5);
  text('★', 72, 24, 14, '#fff3bf');
  fitText(fmt(g.score), 90, 24, 98, 19, '#ffe066', 'left');
  panel(200, 4, 108, 40, 14, '#7048e8');
  fitText(g.campaign ? 'Fase ' + g.campaign : 'Onda ' + g.waves, 254, 24, 96, 19, '#fff');
  panel(314, 6, 128, 36, 14, '#27407a');
  if (g.campaign) {
    const left = stageLen(g.campaign) - g.t;
    fitText(left > 0 ? '👑 em ' + fmtTime(left) : '👑 Chefe!', 378, 24, 112, 17, left > 0 ? '#a5d8ff' : '#ffd43b');
  } else {
    fitText('⏱ ' + fmtTime(g.t), 378, 24, 112, 19, '#a5d8ff');
  }

  // barra inferior: arma, multiplicadores e peças
  roundRect(-4, H - 66, W + 8, 72, 16);
  ctx.fillStyle = '#1e2f5c';
  ctx.fill();
  ink(3);
  const w = WEAPONS[g.weapon];
  fitText('🔫 ' + w.name, 12, H - 50, W / 2 - 10, 17, shade(w.color, 0.2), 'left');
  fitText(`Dano ×${fmtMul(g.dmgMul)}  •  Cadência ×${fmtMul(g.rateMul)}`, W - 12, H - 50, W / 2 - 20, 12, '#c5d3ff', 'right');
  const need = partsNeed();
  const bx = 12, by = H - 26, bw = W - 24, bh = 16;
  bar(bx, by, bw, bh, g.parts / need, '#d63cf0');
  ctx.strokeStyle = 'rgba(0,0,0,.35)';
  ctx.lineWidth = 1.5;
  for (let i = 1; i < need && need <= 30; i++) {
    ctx.beginPath();
    ctx.moveTo(bx + bw * i / need, by + 2);
    ctx.lineTo(bx + bw * i / need, by + bh - 2);
    ctx.stroke();
  }
  text(`🔧 ${g.parts}/${need} peças para a próxima melhoria`, W / 2, by + bh / 2, 11, '#f3d9fa');

  const bo = g.boss;
  if (bo) {
    roundRect(36, 52, W - 72, 24, 10);
    ctx.fillStyle = '#2b2b3b';
    ctx.fill();
    ink(3);
    const f = Math.max(0, bo.hp / bo.maxHp);
    if (f > 0) {
      roundRect(39, 55, (W - 78) * f, 18, 8);
      ctx.fillStyle = bo.shieldT > 0 ? '#4dabf7' : '#ff4d4d';
      ctx.fill();
      roundRect(41, 56, (W - 82) * f, 7, 4);
      ctx.fillStyle = 'rgba(255,255,255,.3)';
      ctx.fill();
    }
    // marcas das fases de escudo que ainda faltam
    for (const ph of bo.phases) {
      const px = 39 + (W - 78) * ph;
      ctx.beginPath();
      ctx.moveTo(px, 54); ctx.lineTo(px, 74);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#4dabf7';
      ctx.stroke();
      emoji('🛡️', px, 49, 11);
    }
    blob(36, 64, 14, '#ffd43b', 2.5);
    emoji('👑', 36, 65, 13);
    fitText(bo.name + '  ' + pct(bo.hp, bo.maxHp), W / 2, 64, W - 120, 15, '#fff');
  } else if (g.bossCd < 8 && !(g.campaign && g.t >= stageLen(g.campaign) - 20)) {
    text('Boss chegando em ' + Math.ceil(g.bossCd) + 's', W / 2, 66, 17, '#ff8787');
  }

  drawEscapeWarnings();
  if (g.toasts.length) drawToast(g.toasts[0]);
  if (g.banner) drawBanner(g.banner);
  if (g.readyT > 0) {
    ctx.fillStyle = 'rgba(16, 22, 48, .45)';
    ctx.fillRect(0, H / 2 - 70, W, 140);
    text('Prepare-se!', W / 2, H / 2 - 20, 40, '#ffd43b');
    text(String(Math.ceil(g.readyT)), W / 2, H / 2 + 34, 44, '#fff');
  }
}

// marca vermelha nas faixas onde um bicho está prestes a escapar
function drawEscapeWarnings() {
  const pulse = 0.6 + 0.4 * Math.sin(g.t * 14);
  for (const l of escapeLanes(nearestLane(g.x))) {
    const p = proj(LANES[l], PLAYER_Y + 18);
    ctx.globalAlpha = pulse;
    blob(p.x, p.y, 16, '#ff4d4d', 3);
    text('!', p.x, p.y + 1, 22, '#fff');
    ctx.beginPath();
    ctx.moveTo(p.x - 10, p.y + 20); ctx.lineTo(p.x + 10, p.y + 20); ctx.lineTo(p.x, p.y + 32);
    ctx.closePath();
    ctx.fillStyle = '#ff4d4d';
    ctx.fill();
    ink(2);
    ctx.globalAlpha = 1;
  }
}

// dica/aviso no alto da tela
function drawToast(t) {
  ctx.globalAlpha = Math.min(1, t.life * 2, (5 - t.life) * 4 + 0.2);
  const y = g.boss ? 84 : 52;
  panel(14, y, W - 28, 62, 14, '#27407a', 3);
  blob(44, y + 31, 20, '#ffd43b', 2.5);
  emoji(t.icon, 44, y + 32, 20);
  fitText(t.title, 74, y + 19, W - 104, 17, '#ffe066', 'left');
  const lines = wrapLines(t.text, W - 104, 13);
  lines.slice(0, 2).forEach((ln, i) => text(ln, 74, y + 38 + i * 15, 13, '#fff', 'left'));
  ctx.globalAlpha = 1;
}

// faixa (fita) no meio da tela
function drawBanner(bn) {
  ctx.globalAlpha = Math.min(1, bn.life * 2);
  const main = bn.good ? '#2f9e44' : '#e03131';
  const dark = bn.good ? '#1b5e20' : '#8b1a1a';
  const y = H / 2 - 48;
  for (const s of [-1, 1]) {
    const ex = s < 0 ? 8 : W - 8;
    ctx.beginPath();
    ctx.moveTo(W / 2 + s * (W / 2 - 40), y + 14);
    ctx.lineTo(ex, y + 14);
    ctx.lineTo(ex + s * -16, y + 52);
    ctx.lineTo(ex, y + 90);
    ctx.lineTo(W / 2 + s * (W / 2 - 40), y + 90);
    ctx.closePath();
    ctx.fillStyle = dark;
    ctx.fill();
    ink(3);
  }
  roundRect(28, y, W - 56, 96, 12);
  ctx.fillStyle = main;
  ctx.fill();
  ink(3.5);
  roundRect(34, y + 5, W - 68, 34, 9);
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  ctx.fill();
  fitText(bn.good ? bn.text : '⚠ ' + bn.text, W / 2, y + 34, W - 80, 26, '#fff');
  if (bn.tip) fitText(bn.tip, W / 2, y + 70, W - 80, 17, bn.good ? '#d3f9d8' : '#ffe3e3');
  ctx.globalAlpha = 1;
}

// Cartas de melhoria lado a lado: nova arma ou evolução. A cor da moldura da
// evolução indica o nível (raridade).
const CARD = i => ({ x: 12 + i * 145, y: 226, w: 136, h: 262 });
const RARITY = ['#8ea2c4', '#ff9f1c', '#b44cf0', '#20c997', '#ffd43b'];

function cardInfo(k) {
  if (k === 'weapon') {
    const cur = WEAPONS[g.weapon], next = WEAPONS[g.weapon + 1];
    const ratio = weaponDps(next) / weaponDps(cur);
    return {
      icon: '🔫', color: next.color, frame: '#4dabf7', pill: 'Arma nova',
      name: next.name, desc: `Dano/s ${ratio.toFixed(1).replace('.', ',')}× maior. Evoluções continuam.`,
    };
  }
  const P = PERKS[k], lvl = perk(k);
  return { icon: P.icon, color: P.color, frame: RARITY[Math.min(lvl, RARITY.length - 1)], pill: `Nv ${lvl} → ${lvl + 1}`, name: P.name, desc: P.desc(lvl + 1) };
}

function drawChoice() {
  ctx.fillStyle = 'rgba(16, 22, 48, .82)';
  ctx.fillRect(0, 0, W, H);
  text('MELHORIA!', W / 2, 140, 46, '#ffd43b');
  fitText('Arma atual: ' + WEAPONS[g.weapon].name, W / 2, 186, W - 40, 18, '#e9ecef');
  g.choice.options.forEach((k, i) => {
    const c = CARD(i), I = cardInfo(k);
    roundRect(c.x, c.y + 5, c.w, c.h, 14);
    ctx.fillStyle = shade(I.frame, -0.4);
    ctx.fill();
    ink(3);
    roundRect(c.x, c.y, c.w, c.h, 14);
    ctx.fillStyle = I.frame;
    ctx.fill();
    ink(3.5);
    roundRect(c.x + 8, c.y + 8, c.w - 16, 104, 10);
    const gr = ctx.createLinearGradient(0, c.y + 8, 0, c.y + 112);
    gr.addColorStop(0, shade(I.color, 0.25));
    gr.addColorStop(1, shade(I.color, -0.35));
    ctx.fillStyle = gr;
    ctx.fill();
    ink(2.5);
    emoji(I.icon, c.x + c.w / 2, c.y + 60, 52);
    panel(c.x + c.w / 2 - 44, c.y + 100, 88, 26, 12, '#27407a', 2.5);
    fitText(I.pill, c.x + c.w / 2, c.y + 113, 80, 14, '#fff');
    const nameLines = wrapLines(I.name, c.w - 16, 18);
    nameLines.forEach((ln, j) => text(ln, c.x + c.w / 2, c.y + 146 + j * 21, 18, '#fff'));
    const descTop = c.y + 150 + nameLines.length * 21;
    wrapLines(I.desc, c.w - 18, 13).slice(0, 4).forEach((ln, j) =>
      text(ln, c.x + c.w / 2, descTop + j * 17, 13, '#fff9db'));
    text(String(i + 1), c.x + 16, c.y + 18, 13, 'rgba(255,255,255,.85)');
    uiButtons.push({ ...c, action: () => choosePerk(i) });
  });
  text('Toque em uma carta (ou 1, 2, 3)', W / 2, 540, 16, '#c5d3ff');
}

function drawTitle(y) {
  text('SHOOT', W / 2, y, 60, '#ffd43b');
  text('LINES', W / 2, y + 58, 60, '#ffffff');
}

function pulseButton(cx, cy, w, h, top, bottom, label, size, action) {
  const pulse = 1 + 0.04 * Math.sin(performance.now() / 200);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(pulse, pulse);
  button3d(-w / 2, -h / 2, w, h, top, bottom, label, size);
  ctx.restore();
  uiButtons.push({ x: cx - w / 2, y: cy - h / 2, w, h: h + 5, action });
}

function drawMenu() {
  ensureDaily();
  ctx.fillStyle = 'rgba(16, 22, 48, .55)';
  ctx.fillRect(0, 0, W, H);
  coinPill(W - 132, 10);
  drawTitle(78);
  let y = 200;
  const totalStars = Object.values(meta.stars).reduce((a, b) => a + b, 0);
  pulseButton(W / 2, y + 30, W - 70, 60, '#51cf66', '#2b8a3e', `CAMPANHA · Fase ${meta.stage}`, 22, () => startCampaign(meta.stage));
  text(`★ ${totalStars} estrelas  •  fases de ${fmtTime(stageLen(meta.stage))} + chefe`, W / 2, y + 74, 13, '#d3f9d8');
  y += 92;
  uiButton(35, y, W - 70, 50, '#ffd43b', '#e8a200', 'INFINITO', 22, start);
  if (meta.best) text('🏆 Recorde: ' + fmt(meta.best), W / 2, y + 66, 13, '#ffe066');
  y += 82;
  const save = loadSave();
  if (save) {
    uiButton(35, y, W - 70, 46, '#4dabf7', '#1c7ed6',
      `CONTINUAR · ${save.campaign ? 'Fase ' + save.campaign : 'Infinito'} · ${fmtTime(save.t)}`, 18, continueGame);
    y += 60;
  }
  uiButton(35, y, W - 70, 46, '#be4bdb', '#862e9c', '🛒 LOJA', 20, () => { state = 'shop'; });
  y += 62;

  // missões do dia
  const ml = meta.daily.list;
  panel(20, y, W - 40, 30 + ml.length * 38, 16, 'rgba(39, 64, 122, .95)', 3);
  text('Missões de hoje', 36, y + 18, 15, '#ffd43b', 'left');
  ml.forEach((m, i) => {
    const M = MISSIONS.find(x => x.id === m.id);
    const yy = y + 36 + i * 38;
    fitText((m.done ? '✅ ' : '') + M.text(m.goal), 36, yy + 6, W - 170, 13, m.done ? '#8ce99a' : '#fff', 'left');
    bar(36, yy + 16, W - 170, 10, m.prog / m.goal, m.done ? '#51cf66' : '#ffd43b');
    text(`+${M.reward} $`, W - 40, yy + 12, 14, '#ffe066', 'right');
  });
  y += 42 + ml.length * 38;

  // dificuldade
  text('Dificuldade', W / 2, y, 13, '#c5d3ff');
  MODES.forEach((m, i) => {
    const sel = i === modePref;
    const x = 30 + i * 132;
    if (sel) uiButton(x, y + 12, 126, 34, m.color, m.dark, m.name, 16, () => {});
    else uiButton(x, y + 14, 126, 30, '#3b4a7a', '#26315a', m.name, 14, () => {
      modePref = i;
      try { localStorage.setItem('shootlines-mode', String(i)); } catch (e) { /* sem storage */ }
    });
  });
  text('versão ' + VERSION, W / 2, 788, 11, '#c5d3ff');
}

function drawShop() {
  ctx.fillStyle = 'rgba(16, 22, 48, .88)';
  ctx.fillRect(0, 0, W, H);
  text('LOJA', 26, 30, 34, '#ffd43b', 'left');
  coinPill(W - 132, 12);
  UPGRADES.forEach((U, i) => {
    const y = 64 + i * 68;
    const l = upLevel(U.key), maxed = l >= U.max;
    panel(14, y, W - 28, 60, 14, '#27407a', 3);
    blob(42, y + 30, 19, '#ffd43b', 2.5);
    emoji(U.icon, 42, y + 31, 19);
    fitText(`${U.name}  ${l}/${U.max}`, 70, y + 19, W - 210, 16, '#fff', 'left');
    fitText(maxed ? U.desc(l) : 'Próximo: ' + U.desc(l + 1), 70, y + 41, W - 210, 12, '#c5d3ff', 'left');
    const cost = U.cost(l), can = !maxed && meta.coins >= cost;
    uiButton(W - 126, y + 11, 100, 36, maxed ? '#868e96' : can ? '#51cf66' : '#5c6b8a', maxed ? '#495057' : can ? '#2b8a3e' : '#3b4a6a',
      maxed ? 'MÁX' : '$ ' + fmt(cost), 16, () => buyUpgrade(U.key));
  });
  // visuais da munição
  const sy = 64 + UPGRADES.length * 68 + 6;
  text('Visual da munição', 26, sy + 10, 16, '#ffd43b', 'left');
  const bw = (W - 28 - 4 * 8) / 5;
  SKINS.forEach((S, i) => {
    const x = 14 + i * (bw + 8), y = sy + 24;
    const own = meta.skins.includes(S.key), sel = meta.skin === S.key;
    panel(x, y, bw, 92, 12, sel ? '#2f9e44' : '#27407a', sel ? 3.5 : 2.5);
    const col = S.color === 'rainbow' ? `hsl(${Math.floor(performance.now() / 8) % 360}, 90%, 60%)` : S.color || '#ffe066';
    for (let k = 0; k < 3; k++) {
      roundRect(x + bw / 2 - 14 + k * 11, y + 14, 5, 22, 2);
      ctx.fillStyle = col;
      ctx.fill();
      ink(1.5);
    }
    fitText(S.name, x + bw / 2, y + 52, bw - 8, 13, '#fff');
    fitText(sel ? 'Usando' : own ? 'Usar' : '$ ' + S.cost, x + bw / 2, y + 74, bw - 8, 13, sel ? '#d3f9d8' : own ? '#a5d8ff' : '#ffe066');
    uiButtons.push({ x, y, w: bw, h: 92, action: () => buySkin(S.key) });
  });
  uiButton(W / 2 - 100, H - 70, 200, 48, '#868e96', '#495057', 'VOLTAR', 20, () => { state = 'menu'; });
}

// Menu de pausa: situação do esquadrão, evoluções, habilidades e ameaças.
// Tocar num ícone mostra a descrição.
function drawPauseMenu() {
  ctx.fillStyle = 'rgba(16, 22, 48, .86)';
  ctx.fillRect(0, 0, W, H);
  text('PAUSADO', W / 2, 46, 38, '#ffd43b');

  // esquadrão e arma
  const r = rankInfo(g.tier);
  panel(16, 76, W - 32, 168, 16, '#27407a', 3);
  fitText('🎖️ ' + r.name, 30, 100, 250, 20, shade(r.color, 0.25), 'left');
  text('⏱ ' + fmtTime(g.t), W - 30, 100, 18, '#a5d8ff', 'right');
  bar(30, 118, W - 60, 16, g.soldiers / PROMOTE_AT, r.color);
  fitText(`${fmt(g.soldiers)} / ${PROMOTE_AT} soldados → ${rankInfo(g.tier + 1).name}`, W / 2, 146, W - 60, 13, '#fff');
  const w = WEAPONS[g.weapon];
  fitText('🔫 ' + w.name + `   🔧 ${g.parts}/${partsNeed()}`, 30, 172, W - 60, 16, shade(w.color, 0.2), 'left');
  fitText(`Dano ×${fmtMul(g.dmgMul)}  •  Cadência ×${fmtMul(g.rateMul)}  •  Poder ${fmt(dps())}/s`, 30, 196, W - 60, 13, '#c5d3ff', 'left');
  fitText(`${mode().name}  •  ${g.campaign ? 'Fase ' + g.campaign : 'Infinito'}  •  👑 ${g.bossesKilled} bosses  •  ⭐ ${fmt(g.score)}`, 30, 220, W - 60, 13, '#c5d3ff', 'left');

  // evoluções e combos
  panel(16, 254, W - 32, 128, 16, '#27407a', 3);
  text('Evoluções', 30, 274, 15, '#ffd43b', 'left');
  const items = Object.keys(g.perks).map(k => ({ icon: PERKS[k].icon, color: PERKS[k].color, label: 'Nv' + g.perks[k], info: { icon: PERKS[k].icon, name: `${PERKS[k].name} (nível ${g.perks[k]})`, desc: PERKS[k].desc(g.perks[k]) } }))
    .concat(COMBOS.filter(c => combo(c.key)).map(c => ({ icon: c.icon, color: '#ffd43b', label: 'Combo', info: { icon: c.icon, name: 'Combo: ' + c.name, desc: c.desc } })));
  if (!items.length) fitText('Junte peças 🔧 para ganhar evoluções', W / 2, 322, W - 70, 14, '#c5d3ff');
  items.slice(0, 10).forEach((it, i) => {
    const x = 28 + (i % 5) * 80, y = 290 + Math.floor(i / 5) * 44;
    badge(x, y, 72, 38, it.color, it.icon, it.label, '#fff');
    uiButtons.push({ x, y, w: 72, h: 38, action: () => { g.info = it.info; } });
  });

  // habilidades de patente
  panel(16, 392, W - 32, 96, 16, '#27407a', 3);
  text('Habilidades da patente', 30, 412, 15, '#ffd43b', 'left');
  RANK_SKILLS.forEach((sk, i) => {
    const x = 26 + i * 50, y = 428;
    const has = rank() >= sk.tier;
    ctx.globalAlpha = has ? 1 : 0.35;
    badge(x, y, 44, 44, has ? '#ffd43b' : '#868e96', sk.icon);
    ctx.globalAlpha = 1;
    uiButtons.push({ x, y, w: 44, h: 44, action: () => {
      g.info = { icon: sk.icon, name: sk.name + (has ? '' : ` (libera em ${RANKS[sk.tier].name})`), desc: sk.desc };
    } });
  });

  // ameaças permanentes
  panel(16, 498, W - 32, 66, 16, threatCount() ? '#6b1d2a' : '#27407a', 3);
  text('Ameaças permanentes', 30, 516, 15, '#ff8787', 'left');
  const tk = Object.keys(g.threats);
  if (!tk.length) fitText('Nenhuma — elas começam ao chegar em General', W / 2, 544, W - 70, 13, '#c5d3ff');
  tk.forEach((k, i) => {
    const x = 28 + i * 66, y = 530;
    const T = THREATS[k];
    badge(x, y, 60, 28, '#ff6b6b', T.icon, '×' + g.threats[k], '#fff');
    uiButtons.push({ x, y, w: 60, h: 28, action: () => { g.info = { icon: T.icon, name: `${T.name} ×${g.threats[k]}`, desc: T.desc }; } });
  });

  // descrição do item tocado
  panel(16, 574, W - 32, 52, 14, '#1e2f5c', 2.5);
  if (g.info) {
    fitText(g.info.icon + ' ' + g.info.name, W / 2, 591, W - 60, 15, '#fff');
    fitText(g.info.desc, W / 2, 611, W - 60, 13, '#ffe066');
  } else {
    fitText('Toque num ícone para ver o que ele faz', W / 2, 600, W - 60, 14, '#c5d3ff');
  }

  uiButton(20, 640, 200, 54, '#ffd43b', '#e8a200', 'CONTINUAR', 22, resume);
  uiButton(230, 640, 200, 54, '#ff6b6b', '#c92a2a', 'RECOMEÇAR', 22, restart);
  uiButton(20, 708, 200, 40, '#4dabf7', '#1c7ed6', muted ? '🔇 Som: off' : '🔊 Som: on', 17, () => { muted = !muted; });
  uiButton(230, 708, 200, 40, '#868e96', '#495057', '🏠 Menu inicial', 17, toMenu);
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(16, 22, 48, .78)';
  ctx.fillRect(0, 0, W, H);
  panel(30, 170, W - 60, 340, 18, 'rgba(39, 64, 122, .97)', 3.5);
  text(g.campaign ? `FASE ${g.campaign} FALHOU` : 'FIM DE JOGO', W / 2, 170, 38, '#ff8787');
  [
    '⭐ Pontuação: ' + fmt(g.score),
    '⏱ Tempo: ' + fmtTime(g.t) + '   📏 ' + fmt(g.dist) + ' m',
    '🎖️ ' + rankInfo(g.tier).name + '  •  ' + mode().name,
    '👑 Bosses derrotados: ' + g.bossesKilled,
    g.campaign ? '🗺️ Chefe em ' + fmtTime(Math.max(0, stageLen(g.campaign) - g.t)) : '🏆 Recorde: ' + fmt(meta.best),
  ].forEach((l, i) => fitText(l, W / 2, 228 + i * 42, W - 100, 19, '#fff'));
  panel(W / 2 - 95, 448, 190, 40, 14, '#3a3214', 2.5);
  text(`+${fmt(g.coinsEarned)} moedas`, W / 2, 468, 20, '#ffe066');
  if (g.overT > 0.8) {
    pulseButton(W / 2, 560, 250, 60, '#ffd43b', '#e8a200', 'JOGAR DE NOVO', 24, restart);
    uiButton(W / 2 - 100, 616, 200, 44, '#be4bdb', '#862e9c', '🛒 Loja', 17, () => { state = 'shop'; });
    uiButton(W / 2 - 100, 672, 200, 44, '#868e96', '#495057', '🏠 Menu inicial', 17, toMenu);
  }
}

function drawClear() {
  ctx.fillStyle = 'rgba(16, 22, 48, .78)';
  ctx.fillRect(0, 0, W, H);
  panel(30, 170, W - 60, 330, 18, 'rgba(39, 64, 122, .97)', 3.5);
  text(`FASE ${g.campaign} COMPLETA!`, W / 2, 170, 34, '#8ce99a');
  for (let i = 0; i < 3; i++) {
    const on = i < g.stars;
    const sx = W / 2 + (i - 1) * 78, sy = 250 - (i === 1 ? 10 : 0);
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const rr = k % 2 ? 14 : 32, a = -Math.PI / 2 + k * Math.PI / 5;
      ctx.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fillStyle = on ? '#ffd43b' : '#3b4a7a';
    ctx.fill();
    ink(3);
  }
  fitText('Estrelas: chegar ao fim com 40% e 75% da força máxima', W / 2, 300, W - 100, 12, '#c5d3ff');
  [
    '⏱ ' + fmtTime(g.t) + '   •   👑 ' + g.bossesKilled + ' bosses',
    '🎖️ ' + rankInfo(g.tier).name,
  ].forEach((l, i) => fitText(l, W / 2, 338 + i * 38, W - 100, 18, '#fff'));
  panel(W / 2 - 95, 420, 190, 40, 14, '#3a3214', 2.5);
  text(`+${fmt(g.coinsEarned)} moedas`, W / 2, 440, 20, '#ffe066');
  if (g.overT > 0.8) {
    pulseButton(W / 2, 560, 260, 60, '#51cf66', '#2b8a3e', 'PRÓXIMA FASE', 24, () => startCampaign(g.campaign + 1));
    uiButton(W / 2 - 100, 616, 200, 44, '#be4bdb', '#862e9c', '🛒 Loja', 17, () => { state = 'shop'; });
    uiButton(W / 2 - 100, 672, 200, 44, '#868e96', '#495057', '🏠 Menu inicial', 17, () => { state = 'menu'; });
  }
}

function draw() {
  uiButtons = [];
  const inGame = g && state !== 'menu' && state !== 'shop';
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.save();
  if (inGame && g.shake > 0) ctx.translate(rand(-g.shake, g.shake) * 0.5, rand(-g.shake, g.shake) * 0.5);
  drawGround(inGame ? g.scroll : (performance.now() / 8) % 2400);

  if (inGame) {
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
    drawGrenades();
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
  if (inGame) {
    drawPlanes();
    for (const t of g.texts) {
      const q = proj(t.x, t.y);
      ctx.globalAlpha = Math.min(1, t.life / t.max * 2);
      text(t.text, q.x, q.y, t.size * clamp(q.s, 0.8, 1.1), t.color);
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  if (inGame && g.flash > 0) {
    ctx.globalAlpha = g.flash * 0.6;
    ctx.fillStyle = g.flashColor;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  if (inGame) drawHUD();
  // nos menus só valem os botões do próprio menu
  if (state !== 'play') uiButtons = [];

  if (state === 'menu') drawMenu();
  else if (state === 'shop') drawShop();
  else if (state === 'paused') drawPauseMenu();
  else if (state === 'choose') drawChoice();
  else if (state === 'over') drawGameOver();
  else if (state === 'clear') drawClear();
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
  else if ((state === 'over' || state === 'clear') && g) {
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
// modo infinito
function start() {
  clearSave();
  newGame(null);
  state = 'play';
  sfx(440, 0.1, 'triangle', 0.06, 300);
}

function startCampaign(n) {
  clearSave();
  newGame(n);
  state = 'play';
  g.banner = { text: 'Fase ' + n, tip: `Sobreviva ${fmtTime(stageLen(n))} e derrote o chefe`, life: 2.6, good: true };
  sfx(440, 0.1, 'triangle', 0.06, 300);
}

// recomeça no mesmo modo (fase ou infinito)
function restart() {
  if (g && g.campaign) startCampaign(g.campaign);
  else start();
}

function continueGame() {
  const o = loadSave();
  if (!o) { start(); return; }
  newGame(o.campaign);
  Object.assign(g, o);
  g.toasts = [];
  g.texts = [];
  g.readyT = 2;
  state = 'play';
  sfx(440, 0.1, 'triangle', 0.06, 300);
}

function openMenu() {
  if (state !== 'play') return;
  g.info = null;
  state = 'paused';
  saveGame();
}

function resume() {
  if (state === 'paused') state = 'play';
}

function toMenu() {
  if (g && state !== 'over' && state !== 'clear') saveGame();
  state = 'menu';
}

function togglePause() {
  if (state === 'play') openMenu();
  else if (state === 'paused') resume();
}

window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (state === 'play') {
    if (k === 'arrowleft' || k === 'a') g.lane = Math.max(0, g.lane - 1);
    if (k === 'arrowright' || k === 'd') g.lane = Math.min(2, g.lane + 1);
  }
  if (state === 'choose' && ['1', '2', '3'].includes(k)) choosePerk(+k - 1);
  if (k === 'p' || k === 'escape') {
    if (state === 'shop') state = 'menu';
    else togglePause();
  }
  if (k === 'm') muted = !muted;
  if (k === 'enter' || k === ' ') {
    e.preventDefault();
    if (state === 'menu') loadSave() ? continueGame() : startCampaign(meta.stage);
    else if (state === 'paused') resume();
    else if (state === 'over' && g.overT > 0.8) restart();
    else if (state === 'clear' && g.overT > 0.8) startCampaign(g.campaign + 1);
  }
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
  for (const b of uiButtons) if (inRect(b, p.x, p.y)) { b.action(); return; }
  if (state !== 'play') return;
  dragging = true;
  g.lane = clamp(Math.floor(p.x / 150), 0, 2);
});
canvas.addEventListener('pointermove', e => {
  if (dragging && state === 'play') g.lane = clamp(Math.floor(pointerPos(e).x / 150), 0, 2);
});
window.addEventListener('pointerup', () => { dragging = false; });
window.addEventListener('pointercancel', () => { dragging = false; });

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (state === 'play') openMenu();
    else saveGame();
  }
});
window.addEventListener('pagehide', saveGame);
