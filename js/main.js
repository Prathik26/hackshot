/**
 * HackShot — Main Entry Point
 * Wires up all UI events and game listeners.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Initialize Systems ────────────────────────────────────────────
  Particles.init();
  Particles.start();

  const settings = Game.loadSettings();
  Audio.setEnabled(settings.sfx);
  Particles.setEnabled(settings.particles);

  // ── Crosshair ─────────────────────────────────────────────────────
  document.addEventListener('mousemove', UI.trackCrosshair);
  if (settings.crosshair) UI.updateCrosshair(true);

  // ── Initial Home Screen ────────────────────────────────────────────
  UI.showScreen('screen-home');
  UI.updateHomeStats();

  // ── Mode Selection ────────────────────────────────────────────────
  let selectedMode = 'classic';

  document.querySelectorAll('.mode-card').forEach(card => {
    if (card.dataset.mode === 'precision') card.classList.add('selected');
    card.addEventListener('click', () => {
      selectedMode = card.dataset.mode;
      document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      if (settings.sfx) Audio.buttonClick();
    });
  });
  // Default selected
  selectedMode = 'precision';

  // ── Home Buttons ──────────────────────────────────────────────────
  document.getElementById('btn-start')?.addEventListener('click', () => {
    if (settings.sfx) Audio.buttonClick();
    UI.runCountdown(Game.getMode(selectedMode).name, () => {
      UI.showScreen('screen-game');
      Game.startGame(selectedMode);
      UI.updateCrosshair(Game.loadSettings().crosshair);
    });
  });

  document.getElementById('btn-leaderboard-home')?.addEventListener('click', () => {
    if (settings.sfx) Audio.buttonClick();
    UI.renderLeaderboard('classic');
    UI.showScreen('screen-leaderboard');
  });

  document.getElementById('btn-settings')?.addEventListener('click', () => {
    if (settings.sfx) Audio.buttonClick();
    UI.loadSettingsUI();
    UI.showScreen('screen-settings');
  });

  // ── Settings Buttons ──────────────────────────────────────────────
  document.getElementById('btn-back-settings')?.addEventListener('click', () => {
    if (settings.sfx) Audio.buttonClick();
    UI.showScreen('screen-home');
    UI.updateHomeStats();
  });

  document.getElementById('btn-save-settings')?.addEventListener('click', () => {
    UI.saveSettingsUI();
    setTimeout(() => { UI.showScreen('screen-home'); UI.updateHomeStats(); }, 800);
  });

  // ── Leaderboard Tabs ──────────────────────────────────────────────
  ['classic', 'precision', 'frenzy'].forEach(mode => {
    document.getElementById(`tab-${mode}`)?.addEventListener('click', () => {
      UI.renderLeaderboard(mode);
      if (settings.sfx) Audio.buttonClick();
    });
  });

  document.getElementById('btn-back-leaderboard')?.addEventListener('click', () => {
    if (settings.sfx) Audio.buttonClick();
    UI.showScreen('screen-home');
  });

  document.getElementById('btn-clear-scores')?.addEventListener('click', () => {
    if (!confirm('Clear all scores? This cannot be undone.')) return;
    ['classic', 'precision', 'frenzy'].forEach(m => localStorage.removeItem(`hackshot_lb_${m}`));
    UI.renderLeaderboard(UI.currentLbMode);
    UI.toast('Scores cleared.', '');
    UI.updateHomeStats();
  });

  // ── Pause / Resume ────────────────────────────────────────────────
  document.getElementById('btn-pause')?.addEventListener('click', () => {
    Game.pauseGame();
  });

  document.getElementById('btn-resume')?.addEventListener('click', () => {
    if (settings.sfx) Audio.buttonClick();
    UI.showScreen('screen-game');
    Game.resumeGame();
  });

  document.getElementById('btn-restart-pause')?.addEventListener('click', () => {
    if (settings.sfx) Audio.buttonClick();
    Game.endGame();
    UI.runCountdown(Game.getMode(selectedMode).name, () => {
      UI.showScreen('screen-game');
      Game.startGame(selectedMode);
    });
  });

  document.getElementById('btn-quit-pause')?.addEventListener('click', () => {
    if (settings.sfx) Audio.buttonClick();
    Game.endGame();
    UI.showScreen('screen-home');
    UI.updateHomeStats();
  });

  // ── Results Buttons ───────────────────────────────────────────────
  document.getElementById('btn-play-again')?.addEventListener('click', () => {
    if (settings.sfx) Audio.buttonClick();
    UI.runCountdown(Game.getMode(selectedMode).name, () => {
      UI.showScreen('screen-game');
      Game.startGame(selectedMode);
    });
  });

  document.getElementById('btn-leaderboard-results')?.addEventListener('click', () => {
    if (settings.sfx) Audio.buttonClick();
    UI.renderLeaderboard(selectedMode);
    UI.showScreen('screen-leaderboard');
  });

  document.getElementById('btn-home-results')?.addEventListener('click', () => {
    if (settings.sfx) Audio.buttonClick();
    UI.showScreen('screen-home');
    UI.updateHomeStats();
  });

  // ── Keyboard Shortcuts ────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    const state = Game.getState();

    // P or Escape — pause / resume
    if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && state.running) {
      if (state.paused) {
        UI.showScreen('screen-game');
        Game.resumeGame();
      } else {
        Game.pauseGame();
      }
    }

    // R — restart (when paused or on results)
    if (e.key === 'r' || e.key === 'R') {
      const resultsActive = document.getElementById('screen-results')?.classList.contains('active');
      const pauseActive   = document.getElementById('screen-pause')?.classList.contains('active');
      if (resultsActive || pauseActive) {
        Game.endGame();
        UI.runCountdown(Game.getMode(selectedMode).name, () => {
          UI.showScreen('screen-game');
          Game.startGame(selectedMode);
        });
      }
    }
  });

  // ── Game Events ────────────────────────────────────────────────────
  window.addEventListener('hackshot:hit', (e) => {
    const { score, accuracy, streak } = e.detail;
    UI.updateHUD({ score, accuracy, streak });
  });

  window.addEventListener('hackshot:miss', (e) => {
    const { accuracy } = e.detail;
    UI.updateHUD({ accuracy, streak: 0 });
  });

  window.addEventListener('hackshot:tick', (e) => {
    const { timeLeft, maxTime } = e.detail;
    UI.updateHUD({ timeLeft, maxTime });
  });

  window.addEventListener('hackshot:gameStart', (e) => {
    const mode = Game.getMode(e.detail.mode);
    UI.updateHUD({ score: 0, accuracy: 100, timeLeft: mode.duration, maxTime: mode.duration, streak: 0 });
  });

  window.addEventListener('hackshot:paused', (e) => {
    const { score, accuracy, streak } = e.detail;
    document.getElementById('pause-score').textContent    = score;
    document.getElementById('pause-accuracy').textContent = accuracy + '%';
    document.getElementById('pause-streak').textContent   = streak;
    UI.showScreen('screen-pause');
  });

  window.addEventListener('hackshot:resumed', () => {
    UI.showScreen('screen-game');
  });

  window.addEventListener('hackshot:gameEnd', (e) => {
    setTimeout(() => UI.showResults(e.detail), 400);
    UI.updateHomeStats();
  });

  // ── Install PWA hint (optional) ───────────────────────────────────
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    UI.toast('📱 Install HackShot as an app!', '');
  });

});
