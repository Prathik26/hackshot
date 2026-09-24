/**
 * HackShot — Core Game Engine
 * Handles game state, target spawning, scoring, and modes.
 */

const Game = (() => {

  // ── Game Modes ─────────────────────────────────────────────────
  const MODES = {
    classic: {
      name: 'Classic',
      duration: 30,
      targetLifespan: 2200,
      spawnInterval: 900,
      targetTypes: ['normal', 'normal', 'normal', 'bonus'],
      sizeMult: 1,
      pointsPerHit: 10,
      description: '30 seconds. Hit as many targets as you can.',
    },
    precision: {
      name: 'Precision',
      duration: 45,
      targetLifespan: 3000,
      spawnInterval: 1400,
      targetTypes: ['normal', 'normal', 'bonus'],
      sizeMult: 0.8,
      pointsPerHit: 15,
      shrinkRing: true,
      description: 'Targets shrink over time. Accuracy is everything.',
    },
    frenzy: {
      name: 'Frenzy',
      duration: 60,
      targetLifespan: 1400,
      spawnInterval: 600,
      targetTypes: ['normal', 'normal', 'speed', 'bonus'],
      sizeMult: 1.1,
      pointsPerHit: 8,
      description: 'Rapid fire chaos. 60 seconds of pure speed.',
    },
  };

  // ── State ───────────────────────────────────────────────────────
  let state = {
    mode: 'classic',
    running: false,
    paused: false,
    score: 0,
    hits: 0,
    misses: 0,
    streak: 0,
    bestStreak: 0,
    timeLeft: 30,
    targets: [],
    reactionTimes: [],
    spawnTimer: null,
    gameTimer: null,
    startTime: null,
    settings: loadSettings(),
  };

  // ── Settings Persistence ────────────────────────────────────────
  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem('hackshot_settings')) || defaultSettings();
    } catch { return defaultSettings(); }
  }
  function defaultSettings() {
    return { sfx: true, particles: true, shake: true, crosshair: true, speed: 'normal', size: 'normal', name: 'Anonymous' };
  }
  function saveSettings(s) {
    state.settings = { ...state.settings, ...s };
    localStorage.setItem('hackshot_settings', JSON.stringify(state.settings));
  }

  // ── Leaderboard Persistence ─────────────────────────────────────
  function getLeaderboard(mode) {
    try {
      return JSON.parse(localStorage.getItem(`hackshot_lb_${mode}`)) || [];
    } catch { return []; }
  }
  function addScore(mode, entry) {
    const lb = getLeaderboard(mode);
    lb.push(entry);
    lb.sort((a, b) => b.score - a.score);
    const trimmed = lb.slice(0, 20);
    localStorage.setItem(`hackshot_lb_${mode}`, JSON.stringify(trimmed));
    return trimmed;
  }

  // ── Arena Dimensions ────────────────────────────────────────────
  function arenaRect() {
    const arena = document.getElementById('game-arena');
    return arena ? arena.getBoundingClientRect() : { width: 800, height: 600, top: 0, left: 0 };
  }

  // ── Target Size ─────────────────────────────────────────────────
  function getTargetSize(type) {
    const baseMap = { normal: 56, bonus: 48, speed: 40 };
    const sizeMod = { small: 0.7, normal: 1, large: 1.35 };
    const modeMult = MODES[state.mode].sizeMult ?? 1;
    const settingMult = sizeMod[state.settings.size] ?? 1;
    return (baseMap[type] || 56) * modeMult * settingMult;
  }

  // ── Spawn Target ────────────────────────────────────────────────
  function spawnTarget() {
    if (!state.running || state.paused) return;
    const arena = arenaRect();
    const mode = MODES[state.mode];
    const types = mode.targetTypes;
    const type = types[Math.floor(Math.random() * types.length)];
    const size = getTargetSize(type);
    const padding = size / 2 + 10;
    const x = Math.random() * (arena.width - padding * 2) + padding;
    const y = Math.random() * (arena.height - padding * 2) + padding;
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const lifespan = mode.targetLifespan * (state.settings.speed === 'fast' ? 0.7 : state.settings.speed === 'slow' ? 1.4 : 1);

    const el = document.createElement('div');
    el.className = `target target-${type}`;
    el.id = id;
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.left = x + 'px';
    el.style.top = y + 'px';

    // Shrink ring for precision mode
    if (mode.shrinkRing) {
      const ring = document.createElement('div');
      ring.className = 'target-shrink-ring';
      ring.style.animationDuration = lifespan + 'ms';
      el.appendChild(ring);
    }

    // Expiry timeout
    const expiryTimer = setTimeout(() => removeTarget(id, false), lifespan);
    const target = { id, type, x, y, size, el, expiryTimer, spawnTime: performance.now() };
    state.targets.push(target);

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      onTargetHit(id, e);
    });

    document.getElementById('game-arena').appendChild(el);
  }

  // ── Remove Target ────────────────────────────────────────────────
  function removeTarget(id, hit = false) {
    const idx = state.targets.findIndex(t => t.id === id);
    if (idx === -1) return;
    const target = state.targets[idx];
    clearTimeout(target.expiryTimer);
    state.targets.splice(idx, 1);
    const el = document.getElementById(id);
    if (el) {
      if (!hit) {
        el.style.animation = 'none';
        el.style.transform = 'translate(-50%, -50%) scale(0)';
        el.style.transition = 'transform 0.15s ease-in';
        setTimeout(() => el.remove(), 160);
      } else {
        el.remove();
      }
    }
    return target;
  }

  // ── Target Hit ───────────────────────────────────────────────────
  function onTargetHit(id, event) {
    if (!state.running || state.paused) return;
    const target = state.targets.find(t => t.id === id);
    if (!target) return;

    const reactionTime = Math.round(performance.now() - target.spawnTime);
    state.reactionTimes.push(reactionTime);
    removeTarget(id, true);

    // Scoring
    const isBonus = target.type === 'bonus';
    const basePoints = MODES[state.mode].pointsPerHit;
    const points = isBonus ? basePoints * 2 : basePoints;
    state.score += points;
    state.hits++;
    state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;

    // Audio
    if (state.settings.sfx) {
      isBonus ? Audio.hitBonus() : Audio.hit();
      if (state.streak >= 3) Audio.streak(state.streak);
    }

    // Visual feedback
    spawnHitParticles(event.clientX, event.clientY, target.type);
    showScoreFloat(event.clientX, event.clientY, `+${points}`);
    if (typeof Particles !== 'undefined') {
      const colorMap = { normal: 'rgba(255,107,53,', bonus: 'rgba(155,89,182,', speed: 'rgba(253,203,110,' };
      Particles.burst(event.clientX, event.clientY, colorMap[target.type] || 'rgba(255,107,53,', 10);
    }

    // Dispatch event for UI to react
    window.dispatchEvent(new CustomEvent('hackshot:hit', { detail: { points, streak: state.streak, score: state.score, accuracy: getAccuracy() } }));
  }

  // ── Arena Miss ───────────────────────────────────────────────────
  function onArenaMiss() {
    if (!state.running || state.paused) return;
    state.misses++;
    state.streak = 0;
    if (state.settings.sfx) Audio.miss();
    if (state.settings.shake) {
      document.getElementById('app').classList.add('shake');
      setTimeout(() => document.getElementById('app').classList.remove('shake'), 300);
    }
    window.dispatchEvent(new CustomEvent('hackshot:miss', { detail: { accuracy: getAccuracy() } }));
  }

  // ── Spawn Hit Particles ──────────────────────────────────────────
  function spawnHitParticles(cx, cy, type) {
    const arena = document.getElementById('game-arena');
    const rect  = arena.getBoundingClientRect();
    const colors = { normal: '#ff6b35', bonus: '#9b59b6', speed: '#ffd93d' };
    const color = colors[type] || '#ff6b35';
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'hit-particle';
      p.style.left = (cx - rect.left) + 'px';
      p.style.top  = (cy - rect.top) + 'px';
      p.style.background = color;
      const angle = (Math.PI * 2 * i) / 8;
      const dist = Math.random() * 40 + 20;
      p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
      arena.appendChild(p);
      setTimeout(() => p.remove(), 500);
    }
  }

  // ── Score Float ──────────────────────────────────────────────────
  function showScoreFloat(cx, cy, text) {
    const arena = document.getElementById('game-arena');
    const rect  = arena.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'score-float';
    el.textContent = text;
    el.style.left = (cx - rect.left - 20) + 'px';
    el.style.top  = (cy - rect.top - 20) + 'px';
    arena.appendChild(el);
    setTimeout(() => el.remove(), 700);
  }

  // ── Accuracy ─────────────────────────────────────────────────────
  function getAccuracy() {
    const total = state.hits + state.misses;
    if (total === 0) return 100;
    return Math.round((state.hits / total) * 100);
  }

  function getAvgReaction() {
    if (!state.reactionTimes.length) return 0;
    return Math.round(state.reactionTimes.reduce((a, b) => a + b, 0) / state.reactionTimes.length);
  }

  // ── Game Lifecycle ────────────────────────────────────────────────
  function startGame(mode = 'classic') {
    state.mode   = mode;
    state.score  = 0;
    state.hits   = 0;
    state.misses = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.running = false;
    state.paused  = false;
    state.targets = [];
    state.reactionTimes = [];
    state.timeLeft = MODES[mode].duration;

    // Clear arena
    const arena = document.getElementById('game-arena');
    if (arena) arena.innerHTML = '<div class="miss-indicator" id="miss-indicator">MISS!</div>';

    // Bind arena miss click
    if (arena) {
      arena.onclick = (e) => {
        if (e.target === arena || e.target.id === 'miss-indicator' || e.target.id === 'miss-flash') {
          onArenaMiss();
          showMissIndicator(e.clientX, e.clientY);
        }
      };
    }

    state.running = true;
    window.dispatchEvent(new CustomEvent('hackshot:gameStart', { detail: { mode, duration: MODES[mode].duration } }));

    // Start spawn loop
    const spawnNow = () => {
      spawnTarget();
      const interval = MODES[mode].spawnInterval * (state.settings.speed === 'fast' ? 0.7 : state.settings.speed === 'slow' ? 1.4 : 1);
      if (state.running && !state.paused) {
        state.spawnTimer = setTimeout(spawnNow, interval);
      }
    };
    state.spawnTimer = setTimeout(spawnNow, 200);

    // Countdown timer
    state.startTime = Date.now();
    state.gameTimer = setInterval(() => {
      if (state.paused) return;
      state.timeLeft = Math.max(0, MODES[mode].duration - Math.floor((Date.now() - state.startTime) / 1000));
      window.dispatchEvent(new CustomEvent('hackshot:tick', { detail: { timeLeft: state.timeLeft, maxTime: MODES[mode].duration } }));
      if (state.timeLeft <= 0) endGame();
    }, 250);
  }

  function showMissIndicator(cx, cy) {
    const arena = document.getElementById('game-arena');
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    const el = document.createElement('div');
    el.textContent = 'MISS!';
    el.style.cssText = `
      position: absolute;
      left: ${cx - rect.left}px;
      top: ${cy - rect.top}px;
      transform: translate(-50%, -50%);
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 1rem;
      color: #ff4757;
      pointer-events: none;
      z-index: 5;
      animation: miss-flash 0.4s ease-out forwards;
    `;
    arena.appendChild(el);
    setTimeout(() => el.remove(), 400);
  }

  function pauseGame() {
    if (!state.running || state.paused) return;
    state.paused = true;
    clearTimeout(state.spawnTimer);
    window.dispatchEvent(new CustomEvent('hackshot:paused', { detail: getSnapshot() }));
  }

  function resumeGame() {
    if (!state.running || !state.paused) return;
    state.paused = false;
    // Resume timer accounting for paused duration
    const elapsed = MODES[state.mode].duration - state.timeLeft;
    state.startTime = Date.now() - elapsed * 1000;

    // Restart spawn loop
    const mode = state.mode;
    const spawnNow = () => {
      spawnTarget();
      const interval = MODES[mode].spawnInterval * (state.settings.speed === 'fast' ? 0.7 : state.settings.speed === 'slow' ? 1.4 : 1);
      if (state.running && !state.paused) {
        state.spawnTimer = setTimeout(spawnNow, interval);
      }
    };
    spawnNow();
    window.dispatchEvent(new CustomEvent('hackshot:resumed'));
  }

  function endGame() {
    state.running = false;
    state.paused  = false;
    clearTimeout(state.spawnTimer);
    clearInterval(state.gameTimer);

    // Remove remaining targets
    state.targets.forEach(t => {
      clearTimeout(t.expiryTimer);
      const el = document.getElementById(t.id);
      if (el) el.remove();
    });
    state.targets = [];

    if (state.settings.sfx) Audio.gameEnd();

    const result = {
      mode: state.mode,
      score: state.score,
      hits: state.hits,
      misses: state.misses,
      accuracy: getAccuracy(),
      bestStreak: state.bestStreak,
      avgReaction: getAvgReaction(),
    };

    // Save to leaderboard
    const isPersonalBest = saveToLeaderboard(result);
    result.isPersonalBest = isPersonalBest;

    window.dispatchEvent(new CustomEvent('hackshot:gameEnd', { detail: result }));
  }

  function saveToLeaderboard(result) {
    const existing = getLeaderboard(result.mode);
    const personalBest = existing.find(e => e.name === state.settings.name);
    const isNew = !personalBest || result.score > personalBest.score;
    addScore(result.mode, {
      name: state.settings.name || 'Anonymous',
      score: result.score,
      accuracy: result.accuracy,
      hits: result.hits,
      date: new Date().toLocaleDateString(),
    });
    return isNew && result.score > 0;
  }

  function getSnapshot() {
    return {
      score: state.score,
      accuracy: getAccuracy(),
      streak: state.streak,
      timeLeft: state.timeLeft,
      mode: state.mode,
    };
  }

  function getState() { return state; }
  function getMode(m) { return MODES[m]; }
  function getModes() { return MODES; }

  return {
    startGame, pauseGame, resumeGame, endGame,
    getState, getSnapshot, getMode, getModes,
    getLeaderboard, getAccuracy, getAvgReaction,
    saveSettings, loadSettings, defaultSettings,
  };
})();

window.Game = Game;
