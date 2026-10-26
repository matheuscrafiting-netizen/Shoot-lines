'use strict';

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------
const W = 450, H = 800;
const LANES = [75, 225, 375];
const LANE_HALF = 70;
const PLAYER_Y = 690;
const MAX_SOLDIERS = 300;
const FORM_MAX = 60;         // soldados desenhados no máximo
const BOSS_EVERY = 60;       // segundos entre bosses

const WEAPONS = [
  { name: 'Pistola',         dmg: 1,   rate: 2.5, speed: 650,  color: '#ffe066', size: 3 },
  { name: 'Submetralhadora', dmg: 1,   rate: 6,   speed: 750,  color: '#ffd43b', size: 2.5 },
  { name: 'Fuzil',           dmg: 2.2, rate: 5,   speed: 850,  color: '#ffa94d', size: 3 },
  { name: 'Escopeta',        dmg: 1.6, rate: 3,   speed: 700,  color: '#ff8787', size: 3, pellets: 3 },
  { name: 'Laser',           dmg: 3,   rate: 8,   speed: 1100, color: '#66d9e8', size: 2, pierce: true },
  { name: 'Lança-foguetes',  dmg: 14,  rate: 1.4, speed: 520,  color: '#ff6b6b', size: 6, splash: 70 },
  { name: 'Minigun',         dmg: 2.5, rate: 16,  speed: 1000, color: '#b197fc', size: 2.5 },
];

const ENEMY_TYPES = {
  bug:     { hp: 3,  spd: 0.85, dmg: 1, r: 14, color: '#69db7c', minD: 1 },
  runner:  { hp: 2,  spd: 1.6,  dmg: 1, r: 11, color: '#ffd43b', minD: 1.6 },
  spitter: { hp: 6,  spd: 0.8,  dmg: 2, r: 16, color: '#da77f2', minD: 2.2, switcher: true },
  brute:   { hp: 18, spd: 0.6,  dmg: 4, r: 22, color: '#ff922b', minD: 2.8 },
  tank:    { hp: 45, spd: 0.45, dmg: 8, r: 28, color: '#868e96', minD: 4 },
};

const BOSSES = [
  { name: 'Rei Besouro',   color: '#2f9e44' },
  { name: 'Aranha Rainha', color: '#862e9c' },
  { name: 'Golem de Lava', color: '#e8590c' },
  { name: 'Hidra Sombria', color: '#364fc7' },
];

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
const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'k' : String(Math.floor(n));

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
let state = 'menu';   // menu | play | paused | over
let g = null;

function newGame() {
  g = {
    t: 0, soldiers: 3, lane: 1, x: LANES[1],
    weapon: 0, rateMul: 1, dmgMul: 1, fireCd: 0,
    bullets: [], enemies: [], gates: [], crates: [], projectiles: [],
    particles: [], texts: [],
    score: 0, dist: 0,
    spawnCd: 2, gateCd: 2.5, crateCd: 10, rows: 0, bossCd: BOSS_EVERY,
    boss: null, bossesKilled: 0, banner: null,
    shake: 0, flash: 0, flashColor: '#fff', scroll: 0, overT: 0, nextId: 1,
  };
}

const diff = () => 1 + g.t / 35 + g.bossesKilled * 0.6;
const worldSpeed = () => Math.min(90 + diff() * 7, 190);

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
  addText(x, PLAYER_Y - 60, '-' + n, '#ff6b6b', 26);
  burst(x, PLAYER_Y, '#4dabf7', Math.min(30, 6 + n * 2), 200);
  g.shake = Math.min(14, g.shake + 4 + n);
  g.flash = 0.25; g.flashColor = '#ff0000';
  sfx(120, 0.2, 'sawtooth', 0.08, -60);
  if (g.soldiers <= 0) gameOver();
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
  const hp = Math.ceil(T.hp * (1 + (d - 1) * 0.45) * Math.pow(1.08, g.t / 10));
  g.enemies.push({
    id: g.nextId++, type: typeKey, lane, x: LANES[lane], tx: LANES[lane], y,
    hp, maxHp: hp, r: T.r, color: T.color, dmg: Math.round(T.dmg * (1 + (d - 1) * 0.35)),
    spd: T.spd * worldSpeed() * rand(0.92, 1.08),
    switchCd: T.switcher ? rand(1.5, 3) : Infinity,
    wob: Math.random() * 6, hitT: 0,
  });
}

function spawnWave() {
  const d = diff();
  const types = Object.keys(ENEMY_TYPES).filter(k => ENEMY_TYPES[k].minD <= d);
  const lanesCount = Math.random() < Math.min(0.6, 0.15 + d * 0.08) ? 2 : 1;
  const lanes = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, lanesCount);
  for (const lane of lanes) {
    const n = rint(1, Math.min(6, 1 + Math.floor(d)));
    const type = pick(types);
    for (let i = 0; i < n; i++) spawnEnemy(type, lane, -30 - i * (ENEMY_TYPES[type].r * 2 + 8));
  }
}

function goodCell(d) {
  const r = Math.random();
  if (r < 0.4) return { kind: 'add', v: rint(2, 3 + Math.floor(d * 2)) };
  if (r < 0.55) return { kind: 'mul', v: Math.random() < 0.75 ? 2 : 3 };
  if (r < 0.7 && g.weapon < WEAPONS.length - 1) return { kind: 'weapon' };
  if (r < 0.85) return { kind: 'rate', v: 25 };
  return { kind: 'dmg', v: 30 };
}

function badCell(d) {
  const r = Math.random();
  if (r < 0.5) return { kind: 'add', v: -rint(1, 2 + Math.floor(d * 1.5)) };
  if (r < 0.65) return { kind: 'div', v: 2 };
  if (r < 0.83) return { kind: 'rate', v: -20 };
  return { kind: 'dmg', v: -20 };
}

function spawnGateRow() {
  const d = diff();
  const goods = g.rows++ < 2 || Math.random() < 0.5 ? 2 : 1;
  const cells = [];
  for (let i = 0; i < 3; i++) cells.push(i < goods ? goodCell(d) : badCell(d));
  cells.sort(() => Math.random() - 0.5);
  cells.forEach((c, i) => {
    c.lane = i;
    c.prog = 0;
    c.need = 8 * d;
    c.pulse = 0;
  });
  g.gates.push({ y: -40, h: 52, cells, used: -1 });
  g.spawnCd = Math.max(g.spawnCd, 1.6);
}

function spawnCrate() {
  const d = diff();
  const hp = Math.ceil(25 * Math.pow(d, 1.6));
  const r = Math.random();
  let reward;
  if (r < 0.45 && g.weapon < WEAPONS.length - 1) reward = { kind: 'weapon' };
  else if (r < 0.75) reward = { kind: 'add', v: rint(4, 6 + Math.floor(d * 3)) };
  else reward = { kind: 'rate', v: 35 };
  g.crates.push({ lane: rint(0, 2), y: -40, hp, maxHp: hp, reward, hitT: 0 });
}

function spawnBoss() {
  const n = g.bossesKilled;
  const B = BOSSES[n % BOSSES.length];
  const hp = Math.ceil(700 * Math.pow(2.6, n));
  const lane = 1;
  g.boss = {
    name: B.name, color: B.color, lane, x: LANES[lane], tx: LANES[lane],
    y: -120, hp, maxHp: hp, moveCd: 3, atkCd: 2.5, tele: null, hitT: 0, t: 0, level: n + 1,
  };
  g.banner = { text: 'BOSS: ' + B.name, life: 2.5 };
  sfx(80, 0.8, 'sawtooth', 0.1, 120);
}

// ---------------------------------------------------------------------------
// Efeitos de portões / recompensas
// ---------------------------------------------------------------------------
function cellLabel(c) {
  switch (c.kind) {
    case 'add': return (c.v >= 0 ? '+' : '') + c.v;
    case 'mul': return '×' + c.v;
    case 'div': return '÷' + c.v;
    case 'weapon': return WEAPONS[Math.min(g.weapon + 1, WEAPONS.length - 1)].name;
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
        g.soldiers = Math.min(MAX_SOLDIERS, g.soldiers + c.v);
        addText(x, PLAYER_Y - 70, '+' + c.v + ' soldados', color);
      } else {
        loseSoldiers(-c.v, x);
      }
      break;
    case 'mul':
      g.soldiers = Math.min(MAX_SOLDIERS, g.soldiers * c.v);
      addText(x, PLAYER_Y - 70, '×' + c.v + ' soldados!', color, 26);
      break;
    case 'div':
      loseSoldiers(g.soldiers - Math.ceil(g.soldiers / c.v), x);
      break;
    case 'weapon':
      if (g.weapon < WEAPONS.length - 1) g.weapon++;
      else g.dmgMul = Math.min(4, g.dmgMul * 1.3);
      addText(x, PLAYER_Y - 70, WEAPONS[g.weapon].name + '!', '#ffe066', 26);
      break;
    case 'rate':
      g.rateMul = clamp(g.rateMul * (1 + c.v / 100), 0.4, 3);
      addText(x, PLAYER_Y - 70, (c.v > 0 ? '+' : '') + c.v + '% cadência', color);
      break;
    case 'dmg':
      g.dmgMul = clamp(g.dmgMul * (1 + c.v / 100), 0.4, 4);
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
function fire() {
  const w = WEAPONS[g.weapon];
  const n = g.soldiers;
  const shots = Math.min(n, 8);
  const per = w.dmg * g.dmgMul * n / shots;
  const pellets = w.pellets || 1;
  const shown = Math.min(n, FORM_MAX);
  for (let i = 0; i < shots; i++) {
    const p = FORMATION[Math.floor(Math.random() * shown)];
    for (let k = 0; k < pellets; k++) {
      const vx = pellets > 1 ? (k - (pellets - 1) / 2) * 55 : 0;
      g.bullets.push({
        x: g.x + p.x, y: PLAYER_Y + p.y - 12, vx, vy: -w.speed, dmg: per,
        color: w.color, size: w.size, pierce: !!w.pierce, splash: w.splash || 0, hit: null,
      });
    }
  }
  if (g.t - lastShotSfx > 0.09) {
    lastShotSfx = g.t;
    sfx(w.splash ? 160 : 900, 0.04, 'square', 0.015, -300);
  }
}

function damageEnemy(e, dmg) {
  e.hp -= dmg;
  e.hitT = 0.08;
  if (e.hp <= 0 && !e.dead) {
    e.dead = true;
    g.score += e.maxHp * 10;
    burst(e.x, e.y, e.color, 12, 180);
    sfx(220, 0.07, 'square', 0.03, -120);
  }
}

function splashAt(x, y, radius, dmg) {
  burst(x, y, '#ffa94d', 18, 240);
  g.shake = Math.min(10, g.shake + 2);
  for (const e of g.enemies) {
    if (!e.dead && Math.hypot(e.x - x, e.y - y) < radius + e.r) damageEnemy(e, dmg * 0.6);
  }
}

// ---------------------------------------------------------------------------
// Atualização
// ---------------------------------------------------------------------------
function update(dt) {
  g.t += dt;
  const d = diff();
  const ws = worldSpeed();
  g.scroll = (g.scroll + ws * dt) % 80;
  g.dist += ws * dt / 20;
  g.score += ws * dt * 0.1;
  g.shake = Math.max(0, g.shake - dt * 30);
  g.flash = Math.max(0, g.flash - dt);

  // Movimento do esquadrão
  g.x += (LANES[g.lane] - g.x) * Math.min(1, dt * 14);
  const myLane = nearestLane(g.x);

  // Tiro automático
  const w = WEAPONS[g.weapon];
  g.fireCd -= dt;
  if (g.fireCd <= 0) {
    fire();
    g.fireCd = 1 / (w.rate * g.rateMul);
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
      c.prog += b.dmg;
      while (c.prog >= c.need) {
        c.prog -= c.need;
        c.v++;
        c.need *= 1.15;
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

    // Inimigos
    for (const e of g.enemies) {
      if (e.dead || Math.abs(b.x - e.x) > e.r + b.size || Math.abs(b.y - e.y) > e.r + b.size) continue;
      if (b.pierce) {
        b.hit = b.hit || new Set();
        if (b.hit.has(e.id)) continue;
        b.hit.add(e.id);
        damageEnemy(e, b.dmg);
      } else {
        damageEnemy(e, b.dmg);
        if (b.splash) splashAt(b.x, b.y, b.splash, b.dmg);
        b.dead = true;
        break;
      }
    }
    if (b.dead) continue;

    // Boss
    const bo = g.boss;
    if (bo && bo.y > 0 && Math.abs(b.x - bo.x) < 62 && Math.abs(b.y - bo.y) < 55) {
      bo.hp -= b.dmg;
      bo.hitT = 0.06;
      b.dead = true;
      if (b.splash) burst(b.x, b.y, '#ffa94d', 10, 200);
    }
  }
  g.bullets = g.bullets.filter(b => !b.dead && b.y > -20);

  // Inimigos
  for (const e of g.enemies) {
    if (e.dead) continue;
    e.y += e.spd * dt;
    e.wob += dt * 8;
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
      loseSoldiers(e.dmg, g.x);
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
  updateBoss(dt, myLane);
  if (state !== 'play') return;

  // Projéteis do boss
  for (const p of g.projectiles) {
    p.y += p.vy * dt;
    p.rot += dt * 10;
    if (!p.dead && p.y >= PLAYER_Y - 20 && p.y <= PLAYER_Y + 20 && Math.abs(p.x - g.x) < 60) {
      p.dead = true;
      burst(p.x, p.y, '#ff6b6b', 20, 220);
      loseSoldiers(Math.max(2, Math.ceil(g.soldiers * 0.25)), g.x);
      if (state !== 'play') return;
    }
  }
  g.projectiles = g.projectiles.filter(p => !p.dead && p.y < H + 40);

  // Partículas e textos
  for (const p of g.particles) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= 0.92; p.vy *= 0.92;
    p.life -= dt;
  }
  g.particles = g.particles.filter(p => p.life > 0);
  for (const t of g.texts) { t.y -= 40 * dt; t.life -= dt; }
  g.texts = g.texts.filter(t => t.life > 0);
  if (g.banner) { g.banner.life -= dt; if (g.banner.life <= 0) g.banner = null; }
}

function updateBoss(dt, myLane) {
  const bo = g.boss;
  if (!bo) return;
  bo.t += dt;
  bo.hitT = Math.max(0, bo.hitT - dt);
  if (bo.y < 150) bo.y += 90 * dt;
  else bo.y += 4 * dt;   // avança lentamente
  bo.x += (bo.tx - bo.x) * Math.min(1, dt * 3);

  bo.moveCd -= dt;
  if (bo.moveCd <= 0) {
    bo.moveCd = rand(2.2, 3.8) / (1 + bo.level * 0.1);
    const options = [0, 1, 2].filter(l => l !== bo.lane);
    bo.lane = pick(options);
    bo.tx = LANES[bo.lane];
  }

  if (bo.tele) {
    bo.tele.t -= dt;
    if (bo.tele.t <= 0) {
      const lanes = bo.tele.lanes;
      for (const l of lanes) {
        g.projectiles.push({ x: LANES[l], y: bo.y + 50, vy: 430 + bo.level * 30, r: 16, rot: 0 });
      }
      sfx(300, 0.15, 'sawtooth', 0.06, -200);
      bo.tele = null;
    }
  } else if (bo.y >= 140) {
    bo.atkCd -= dt;
    if (bo.atkCd <= 0) {
      bo.atkCd = Math.max(1.1, 2.6 - bo.level * 0.25);
      const lanes = [Math.random() < 0.7 ? myLane : rint(0, 2)];
      if (bo.level >= 2 && Math.random() < 0.4) {
        const other = pick([0, 1, 2].filter(l => l !== lanes[0]));
        lanes.push(other);
      }
      bo.tele = { lanes, t: 0.9 };
    }
  }

  if (bo.y + 60 >= PLAYER_Y - 30) {
    loseSoldiers(g.soldiers, g.x);
    return;
  }

  if (bo.hp <= 0) {
    for (let i = 0; i < 6; i++) burst(bo.x + rand(-50, 50), bo.y + rand(-40, 40), i % 2 ? bo.color : '#ffd43b', 20, 300);
    g.shake = 18;
    g.flash = 0.4; g.flashColor = '#ffffff';
    g.score += 5000 * bo.level;
    const bonus = 10 + 5 * bo.level;
    g.soldiers = Math.min(MAX_SOLDIERS, g.soldiers + bonus);
    if (g.weapon < WEAPONS.length - 1) g.weapon++;
    else g.dmgMul = Math.min(4, g.dmgMul * 1.3);
    addText(W / 2, 300, 'BOSS DERROTADO!', '#ffe066', 34);
    addText(W / 2, 340, '+' + bonus + ' soldados  •  ' + WEAPONS[g.weapon].name, '#8ce99a', 20);
    g.bossesKilled++;
    g.boss = null;
    g.projectiles = [];
    g.bossCd = BOSS_EVERY;
    g.gateCd = 1.5;
    sfx(150, 0.9, 'sawtooth', 0.1, -120);
  }
}

// ---------------------------------------------------------------------------
// Desenho
// ---------------------------------------------------------------------------
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
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

function drawRoad(scroll) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#1c2333');
  grad.addColorStop(1, '#2b3550');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.025)' : 'rgba(0,0,0,.06)';
    ctx.fillRect(i * 150, 0, 150, H);
  }
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  for (const lx of [150, 300]) {
    for (let y = -80 + scroll; y < H; y += 80) ctx.fillRect(lx - 2, y, 4, 40);
  }
  ctx.fillStyle = '#ffd43b55';
  ctx.fillRect(0, 0, 4, H);
  ctx.fillRect(W - 4, 0, 4, H);
}

function drawSoldier(x, y, leader) {
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.beginPath(); ctx.ellipse(x, y + 7, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#495057';
  ctx.fillRect(x + 3, y - 12, 3, 10);
  ctx.fillStyle = leader ? '#ffd43b' : '#339af0';
  ctx.beginPath(); ctx.arc(x, y, 6.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd8a8';
  ctx.beginPath(); ctx.arc(x, y - 2, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = leader ? '#e67700' : '#1c7ed6';
  ctx.beginPath(); ctx.arc(x, y - 3, 3.6, Math.PI, Math.PI * 2); ctx.fill();
}

function drawSquad() {
  if (state === 'over') return;
  const n = Math.min(g.soldiers, FORM_MAX);
  const idx = [];
  for (let i = 0; i < n; i++) idx.push(i);
  idx.sort((a, b) => FORMATION[a].y - FORMATION[b].y);
  for (const i of idx) {
    const p = FORMATION[i];
    const bob = Math.sin(g.t * 12 + i) * 1.2;
    drawSoldier(g.x + p.x, PLAYER_Y + p.y + bob, i === 0);
  }
  // contador
  const label = String(g.soldiers);
  const bw = 22 + label.length * 11;
  roundRect(g.x - bw / 2, PLAYER_Y + 52, bw, 26, 13);
  ctx.fillStyle = '#1971c2';
  ctx.fill();
  text(label, g.x, PLAYER_Y + 65, 18, '#fff');
}

function drawEnemy(e) {
  const wob = Math.sin(e.wob) * 2;
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.beginPath(); ctx.ellipse(e.x, e.y + e.r * 0.9, e.r, e.r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  // patas
  ctx.strokeStyle = e.color;
  ctx.lineWidth = Math.max(2, e.r / 6);
  for (let s = -1; s <= 1; s += 2) {
    for (let k = 0; k < 2; k++) {
      ctx.beginPath();
      ctx.moveTo(e.x + s * e.r * 0.6, e.y + k * 6 - 2);
      ctx.lineTo(e.x + s * (e.r + 6), e.y + k * 8 + wob * s);
      ctx.stroke();
    }
  }
  ctx.fillStyle = e.hitT > 0 ? '#ffffff' : e.color;
  ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.beginPath(); ctx.arc(e.x, e.y + e.r * 0.25, e.r * 0.75, 0, Math.PI); ctx.fill();
  if (e.type === 'brute' || e.type === 'tank') {
    ctx.fillStyle = '#f8f9fa';
    for (let s = -1; s <= 1; s += 2) {
      ctx.beginPath();
      ctx.moveTo(e.x + s * e.r * 0.5, e.y - e.r * 0.7);
      ctx.lineTo(e.x + s * e.r * 0.85, e.y - e.r * 1.25);
      ctx.lineTo(e.x + s * e.r * 0.2, e.y - e.r * 0.85);
      ctx.fill();
    }
  }
  // olhos
  const er = Math.max(3, e.r * 0.28);
  for (let s = -1; s <= 1; s += 2) {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(e.x + s * e.r * 0.38, e.y - e.r * 0.1, er, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c92a2a';
    ctx.beginPath(); ctx.arc(e.x + s * e.r * 0.38, e.y - e.r * 0.1 + er * 0.35, er * 0.55, 0, Math.PI * 2); ctx.fill();
  }
  if (e.hp < e.maxHp) {
    const bw = e.r * 2;
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.fillRect(e.x - bw / 2, e.y - e.r - 10, bw, 4);
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(e.x - bw / 2, e.y - e.r - 10, bw * Math.max(0, e.hp / e.maxHp), 4);
  }
}

function drawGates() {
  for (const row of g.gates) {
    for (const c of row.cells) {
      const x = LANES[c.lane];
      const used = row.used >= 0;
      const chosen = row.used === c.lane;
      const good = isGood(c);
      const grow = c.pulse > 0 ? 4 : 0;
      ctx.globalAlpha = used ? (chosen ? 0.25 : 0.12) : 1;
      roundRect(x - 68 - grow, row.y - row.h / 2 - grow, 136 + grow * 2, row.h + grow * 2, 8);
      ctx.fillStyle = good ? 'rgba(55, 178, 77, .55)' : 'rgba(224, 49, 49, .55)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = good ? '#8ce99a' : '#ffa8a8';
      ctx.stroke();
      // postes
      ctx.fillStyle = good ? '#2b8a3e' : '#a61e4d';
      ctx.fillRect(x - 72, row.y - row.h / 2 - 6, 8, row.h + 12);
      ctx.fillRect(x + 64, row.y - row.h / 2 - 6, 8, row.h + 12);
      const label = cellLabel(c);
      let size = 26;
      ctx.font = `800 ${size}px system-ui, sans-serif`;
      while (size > 11 && ctx.measureText(label).width > 122) {
        size--;
        ctx.font = `800 ${size}px system-ui, sans-serif`;
      }
      text(label, x, row.y - (c.kind === 'add' ? 4 : 0), size, '#fff');
      if (c.kind === 'add' && !used) {
        ctx.fillStyle = 'rgba(0,0,0,.4)';
        ctx.fillRect(x - 40, row.y + 15, 80, 4);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - 40, row.y + 15, 80 * (c.prog / c.need), 4);
      }
      ctx.globalAlpha = 1;
    }
  }
}

function drawCrates() {
  for (const cr of g.crates) {
    const x = LANES[cr.lane];
    ctx.save();
    ctx.translate(x, cr.y);
    ctx.fillStyle = cr.hitT > 0 ? '#fff4e6' : '#a47148';
    roundRect(-26, -26, 52, 52, 6);
    ctx.fill();
    ctx.strokeStyle = '#6b4226';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-26, -26); ctx.lineTo(26, 26);
    ctx.moveTo(26, -26); ctx.lineTo(-26, 26);
    ctx.stroke();
    const icon = cr.reward.kind === 'weapon' ? '🔫' : cr.reward.kind === 'add' ? '👥' : '⚡';
    ctx.font = '22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 0, -2);
    ctx.restore();
    text(fmt(Math.ceil(cr.hp)), x, cr.y + 38, 14, '#ffe8cc');
  }
}

function drawBoss() {
  const bo = g.boss;
  if (!bo) return;
  if (bo.tele) {
    const a = 0.15 + 0.15 * Math.sin(g.t * 30);
    for (const l of bo.tele.lanes) {
      ctx.fillStyle = `rgba(255, 50, 50, ${a})`;
      ctx.fillRect(LANES[l] - 75, bo.y, 150, H - bo.y);
      text('⚠', LANES[l], PLAYER_Y - 120, 40, '#ff6b6b');
    }
  }
  const { x, y } = bo;
  const pul = Math.sin(bo.t * 4) * 3;
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath(); ctx.ellipse(x, y + 55, 65, 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = bo.color;
  ctx.lineWidth = 7;
  for (let s = -1; s <= 1; s += 2) {
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(x + s * 35, y - 15 + k * 18);
      ctx.quadraticCurveTo(x + s * 80, y - 30 + k * 22 + pul * s, x + s * 75, y + 10 + k * 22);
      ctx.stroke();
    }
  }
  ctx.fillStyle = bo.hitT > 0 ? '#fff' : bo.color;
  ctx.beginPath(); ctx.ellipse(x, y, 58, 50 + pul, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.2)';
  ctx.beginPath(); ctx.ellipse(x, y + 12, 44, 30, 0, 0, Math.PI); ctx.fill();
  // coroa
  ctx.fillStyle = '#ffd43b';
  ctx.beginPath();
  ctx.moveTo(x - 30, y - 42);
  ctx.lineTo(x - 22, y - 68);
  ctx.lineTo(x - 8, y - 50);
  ctx.lineTo(x, y - 74);
  ctx.lineTo(x + 8, y - 50);
  ctx.lineTo(x + 22, y - 68);
  ctx.lineTo(x + 30, y - 42);
  ctx.closePath();
  ctx.fill();
  for (let s = -1; s <= 1; s += 2) {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x + s * 20, y - 10, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e03131';
    ctx.beginPath(); ctx.arc(x + s * 20, y - 6, 6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#212529';
  ctx.beginPath(); ctx.ellipse(x, y + 20, 22, 8 + Math.abs(pul), 0, 0, Math.PI * 2); ctx.fill();
}

function drawProjectiles() {
  for (const p of g.projectiles) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? p.r * 0.5 : p.r;
      const a = i * Math.PI / 5;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawBullets() {
  for (const b of g.bullets) {
    ctx.fillStyle = b.color;
    if (b.splash) {
      ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,200,100,.4)';
      ctx.fillRect(b.x - 2, b.y + b.size, 4, 14);
    } else {
      ctx.fillRect(b.x - b.size / 2, b.y - b.size * 2.5, b.size, b.size * 5);
    }
  }
}

function drawHUD() {
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.fillRect(0, 0, W, 48);
  text('⭐ ' + fmt(g.score), 14, 24, 20, '#ffe066', 'left');
  text('Nível ' + Math.floor(diff()), W / 2, 24, 18, '#fff');
  text(fmt(g.dist) + ' m', W - 14, 24, 18, '#a5d8ff', 'right');

  const w = WEAPONS[g.weapon];
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.fillRect(0, H - 30, W, 30);
  text('🔫 ' + w.name, 12, H - 15, 14, w.color, 'left', 700);
  text(`Dano ×${g.dmgMul.toFixed(1)}   Cadência ×${g.rateMul.toFixed(1)}`, W - 12, H - 15, 13, '#dee2e6', 'right', 600);

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
    const a = Math.min(1, g.banner.life * 2);
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(120, 0, 0, .7)';
    ctx.fillRect(0, H / 2 - 50, W, 100);
    text('⚠ ' + g.banner.text + ' ⚠', W / 2, H / 2, 28, '#ffe3e3');
    ctx.globalAlpha = 1;
  }
}

function drawOverlay(title, lines, sub) {
  ctx.fillStyle = 'rgba(5, 8, 15, .78)';
  ctx.fillRect(0, 0, W, H);
  text(title, W / 2, 230, 46, '#ffe066');
  lines.forEach((l, i) => text(l, W / 2, 310 + i * 32, 18, '#e9ecef', 'center', 600));
  if (sub) {
    const a = 0.6 + 0.4 * Math.sin(performance.now() / 250);
    ctx.globalAlpha = a;
    text(sub, W / 2, 660, 22, '#8ce99a');
    ctx.globalAlpha = 1;
  }
}

function draw() {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.save();
  if (g && g.shake > 0) ctx.translate(rand(-g.shake, g.shake) * 0.5, rand(-g.shake, g.shake) * 0.5);
  drawRoad(g ? g.scroll : (performance.now() / 10) % 80);

  if (g) {
    drawGates();
    drawCrates();
    for (const e of g.enemies) drawEnemy(e);
    drawBoss();
    drawProjectiles();
    drawBullets();
    drawSquad();
    for (const p of g.particles) {
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const t of g.texts) {
      ctx.globalAlpha = Math.min(1, t.life / t.max * 2);
      text(t.text, t.x, t.y, t.size, t.color);
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
      'Passe pelos portões VERDES para ganhar',
      'soldados, armas, dano e cadência.',
      'Evite os VERMELHOS e os bichos!',
      'Atire nos portões "+" para aumentá-los.',
      'Quebre as caixas para pegar prêmios.',
      '',
      '← → / A D  ou  toque/arraste na faixa',
    ], 'Toque ou ENTER para começar');
    if (best) text('Recorde: ' + fmt(best), W / 2, 720, 18, '#ffe066');
  } else if (state === 'paused') {
    drawOverlay('PAUSADO', ['P / ESC para continuar', 'M para som on/off'], 'Toque para continuar');
  } else if (state === 'over') {
    drawOverlay('FIM DE JOGO', [
      'Pontuação: ' + fmt(g.score),
      'Distância: ' + fmt(g.dist) + ' m',
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
  }
  if (k === 'p' || k === 'escape') togglePause();
  if (k === 'm') muted = !muted;
  if (k === 'enter' || k === ' ') { primaryAction(); e.preventDefault(); }
});

let dragging = false;
function laneFromPointer(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width * W;
  return clamp(Math.floor(x / 150), 0, 2);
}
canvas.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (state !== 'play') { primaryAction(); return; }
  dragging = true;
  g.lane = laneFromPointer(e);
});
canvas.addEventListener('pointermove', e => {
  if (dragging && state === 'play') g.lane = laneFromPointer(e);
});
window.addEventListener('pointerup', () => { dragging = false; });
window.addEventListener('pointercancel', () => { dragging = false; });

document.addEventListener('visibilitychange', () => {
  if (document.hidden && state === 'play') state = 'paused';
});
