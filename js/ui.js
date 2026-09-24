/**
 * HackShot — UI Layer
 * Manages screen transitions, HUD updates, leaderboard rendering, and settings.
 */

const UI = (() => {

  // ── Screen Management ────────────────────────────────────────────
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  // ── Toast Notifications ──────────────────────────────────────────
  function toast(msg, type = '') {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  // ── HUD Updates ───────────────────────────────────────────────────
  function updateHUD({ score, accuracy, timeLeft, maxTime, streak }) {
    const scoreEl  = document.getElementById('hud-score');
    const accEl    = document.getElementById('hud-accuracy');
    const timerEl  = document.getElementById('hud-timer');
    const barEl    = document.getElementById('hud-timer-bar');

    if (score !== undefined && scoreEl) {
      scoreEl.textContent = score;
      scoreEl.style.color = '#fff';
      clearTimeout(scoreEl._t);
      scoreEl.style.transform = 'scale(1.15)';
      scoreEl._t = setTimeout(() => {
        scoreEl.style.transform = 'scale(1)';
        scoreEl.style.color = '';
      }, 150);
    }
    if (accuracy !== undefined && accEl) accEl.textContent = accuracy + '%';
    if (timeLeft !== undefined && timerEl) {
      timerEl.textContent = timeLeft;
      const low = timeLeft <= 5;
      timerEl.classList.toggle('low', low);
      if (barEl) {
        barEl.style.width = `${(timeLeft / maxTime) * 100}%`;
        barEl.classList.toggle('low', timeLeft <= Math.ceil(maxTime * 0.2));
      }
    }
    if (streak !== undefined) updateStreak(streak);
  }

  function updateStreak(streak) {
    const badge = document.getElementById('streak-badge');
    const count = document.getElementById('streak-count');
    if (!badge || !count) return;
    count.textContent = streak;
    const show = streak >= 3;
    badge.classList.toggle('visible', show);
    if (show && streak % 1 === 0) {
      badge.style.transform = 'translateX(-50%) scale(1.15)';
      setTimeout(() => { badge.style.transform = 'translateX(-50%) scale(1)'; }, 200);
    }
  }

  // ── Countdown ─────────────────────────────────────────────────────
  function runCountdown(modeName, callback) {
    showScreen('screen-countdown');
    const numEl  = document.getElementById('countdown-number');
    const modeEl = document.getElementById('countdown-mode-name');
    if (modeEl) modeEl.textContent = modeName + ' Mode';
    let count = 3;

    const tick = () => {
      if (numEl) {
        numEl.textContent = count > 0 ? count : 'GO!';
        // Re-trigger animation
        numEl.style.animation = 'none';
        void numEl.offsetWidth;
        numEl.style.animation = '';
      }
      if (count > 0) Audio.countdown();
      else Audio.go();
      if (count <= 0) {
        setTimeout(callback, 700);
        return;
      }
      count--;
      setTimeout(tick, 900);
    };
    tick();
  }

  // ── Results Screen ────────────────────────────────────────────────
  function showResults(result) {
    const { score, hits, misses, accuracy, bestStreak, avgReaction, mode, isPersonalBest } = result;
    const modeData = Game.getMode(mode);

    document.getElementById('result-score').textContent    = score;
    document.getElementById('result-hits').textContent     = hits;
    document.getElementById('result-misses').textContent   = misses;
    document.getElementById('result-accuracy').textContent = accuracy + '%';
    document.getElementById('result-streak').textContent   = bestStreak;
    document.getElementById('result-reaction').textContent = avgReaction > 0 ? avgReaction + 'ms' : '—';
    document.getElementById('results-mode-display').textContent = modeData.name + ' Mode';

    // Title and medal based on performance
    const titleEl = document.getElementById('results-title');
    const medalEl = document.getElementById('results-medal');
    if (accuracy >= 90 && score > 0) {
      titleEl.textContent = 'Legendary!';
      medalEl.textContent = '🏆';
    } else if (accuracy >= 75) {
      titleEl.textContent = 'Great Shot!';
      medalEl.textContent = '🥇';
    } else if (accuracy >= 50) {
      titleEl.textContent = 'Good Game!';
      medalEl.textContent = '🥈';
    } else {
      titleEl.textContent = 'Keep Practicing!';
      medalEl.textContent = '🎯';
    }

    const banner = document.getElementById('new-best-banner');
    if (banner) banner.classList.toggle('visible', !!isPersonalBest);

    showScreen('screen-results');
  }

  // ── Leaderboard ───────────────────────────────────────────────────
  let currentLbMode = 'classic';

  function renderLeaderboard(mode) {
    currentLbMode = mode;
    const table = document.getElementById('leaderboard-table');
    const empty = document.getElementById('leaderboard-empty');
    const rows  = Game.getLeaderboard(mode);

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeTab = document.getElementById(`tab-${mode}`);
    if (activeTab) activeTab.classList.add('active');

    table.innerHTML = '';
    if (!rows.length) {
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    const medals = ['🥇', '🥈', '🥉'];
    const classes = ['gold', 'silver', 'bronze'];

    rows.forEach((entry, i) => {
      const row = document.createElement('div');
      row.className = `lb-row ${classes[i] || ''}`;
      row.style.animationDelay = `${i * 0.04}s`;
      row.innerHTML = `
        <span class="lb-rank">${medals[i] || i + 1}</span>
        <span class="lb-name">${escapeHTML(entry.name)}</span>
        <span class="lb-score">${entry.score}</span>
        <span class="lb-accuracy">${entry.accuracy}%</span>
      `;
      table.appendChild(row);
    });
  }

  // ── Home Stats ────────────────────────────────────────────────────
  function updateHomeStats() {
    const settings = Game.loadSettings();
    const modes = Object.keys(Game.getModes());
    let bestScore = 0, totalGames = 0, totalAcc = 0, accCount = 0;

    modes.forEach(m => {
      const lb = Game.getLeaderboard(m);
      totalGames += lb.length;
      lb.forEach(e => {
        if (e.score > bestScore) bestScore = e.score;
        if (e.accuracy) { totalAcc += e.accuracy; accCount++; }
      });
    });

    const bestEl    = document.getElementById('home-best');
    const accEl     = document.getElementById('home-accuracy');
    const gamesEl   = document.getElementById('home-games');
    if (bestEl)  bestEl.textContent  = bestScore > 0 ? bestScore : '—';
    if (accEl)   accEl.textContent   = accCount > 0 ? Math.round(totalAcc / accCount) + '%' : '—';
    if (gamesEl) gamesEl.textContent = totalGames;
  }

  // ── Settings UI ───────────────────────────────────────────────────
  function loadSettingsUI() {
    const s = Game.loadSettings();
    const getEl = id => document.getElementById(id);
    const sfx  = getEl('setting-sfx');
    const part = getEl('setting-particles');
    const shk  = getEl('setting-shake');
    const ch   = getEl('setting-crosshair');
    const spd  = getEl('setting-speed');
    const sz   = getEl('setting-size');
    const nm   = getEl('setting-name');

    if (sfx)  sfx.checked  = s.sfx  !== false;
    if (part) part.checked = s.particles !== false;
    if (shk)  shk.checked  = s.shake !== false;
    if (ch)   ch.checked   = s.crosshair !== false;
    if (spd)  spd.value    = s.speed || 'normal';
    if (sz)   sz.value     = s.size || 'normal';
    if (nm)   nm.value     = s.name || '';
  }

  function saveSettingsUI() {
    const getEl = id => document.getElementById(id);
    const settings = {
      sfx:       getEl('setting-sfx')?.checked ?? true,
      particles: getEl('setting-particles')?.checked ?? true,
      shake:     getEl('setting-shake')?.checked ?? true,
      crosshair: getEl('setting-crosshair')?.checked ?? true,
      speed:     getEl('setting-speed')?.value || 'normal',
      size:      getEl('setting-size')?.value || 'normal',
      name:      getEl('setting-name')?.value.trim() || 'Anonymous',
    };
    Game.saveSettings(settings);
    Audio.setEnabled(settings.sfx);
    Particles.setEnabled(settings.particles);
    updateCrosshair(settings.crosshair);
    toast('Settings saved! 💾', 'success');
  }

  // ── Crosshair ─────────────────────────────────────────────────────
  function updateCrosshair(show) {
    const ch = document.getElementById('crosshair');
    if (ch) ch.classList.toggle('visible', show);
  }

  function trackCrosshair(e) {
    const ch = document.getElementById('crosshair');
    if (ch) { ch.style.left = e.clientX + 'px'; ch.style.top = e.clientY + 'px'; }
  }

  // ── Helpers ───────────────────────────────────────────────────────
  function escapeHTML(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  return {
    showScreen, toast, updateHUD, runCountdown, showResults,
    renderLeaderboard, updateHomeStats, loadSettingsUI, saveSettingsUI,
    updateCrosshair, trackCrosshair,
    get currentLbMode() { return currentLbMode; },
  };
})();

window.UI = UI;
