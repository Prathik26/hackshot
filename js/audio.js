/**
 * HackShot — Audio Engine
 * Generates all sounds procedurally using the Web Audio API.
 * No external audio files needed — perfect for open-source contributors!
 */

const Audio = (() => {
  let ctx = null;
  let enabled = true;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function playTone({ freq = 440, type = 'sine', duration = 0.1, volume = 0.3, detune = 0, attack = 0.005, release = null } = {}) {
    if (!enabled) return;
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime);
      osc.detune.setValueAtTime(detune, c.currentTime);
      gain.gain.setValueAtTime(0, c.currentTime);
      gain.gain.linearRampToValueAtTime(volume, c.currentTime + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration + (release ?? duration * 2));
      osc.start(c.currentTime);
      osc.stop(c.currentTime + duration + (release ?? duration * 2) + 0.05);
    } catch (e) { /* silently fail */ }
  }

  function hit() {
    // Satisfying pop sound
    playTone({ freq: 680, type: 'sine', duration: 0.06, volume: 0.25, attack: 0.002, release: 0.08 });
    playTone({ freq: 340, type: 'triangle', duration: 0.04, volume: 0.15, attack: 0.001, release: 0.05 });
  }

  function hitBonus() {
    // Higher, brighter pop for bonus targets
    playTone({ freq: 900, type: 'sine', duration: 0.07, volume: 0.3, attack: 0.002, release: 0.1 });
    playTone({ freq: 1200, type: 'sine', duration: 0.05, volume: 0.15, attack: 0.001, release: 0.08 });
  }

  function miss() {
    playTone({ freq: 120, type: 'sawtooth', duration: 0.08, volume: 0.1, attack: 0.002, release: 0.1 });
  }

  function streak(count) {
    const freqs = [523, 659, 784, 1047, 1319];
    const f = freqs[Math.min(count - 3, freqs.length - 1)] || 1319;
    playTone({ freq: f, type: 'sine', duration: 0.12, volume: 0.22, attack: 0.003, release: 0.15 });
  }

  function countdown() {
    playTone({ freq: 440, type: 'square', duration: 0.1, volume: 0.15, attack: 0.005, release: 0.1 });
  }

  function go() {
    playTone({ freq: 880, type: 'square', duration: 0.18, volume: 0.2, attack: 0.005, release: 0.15 });
    setTimeout(() => playTone({ freq: 1100, type: 'sine', duration: 0.15, volume: 0.2, attack: 0.003, release: 0.15 }), 120);
  }

  function gameEnd() {
    [0, 100, 200, 350].forEach((delay, i) => {
      const freqs = [392, 440, 523, 659];
      setTimeout(() => playTone({ freq: freqs[i], type: 'sine', duration: 0.18, volume: 0.18, attack: 0.005, release: 0.2 }), delay);
    });
  }

  function buttonClick() {
    playTone({ freq: 520, type: 'sine', duration: 0.04, volume: 0.12, attack: 0.001, release: 0.05 });
  }

  function setEnabled(val) { enabled = val; }

  return { hit, hitBonus, miss, streak, countdown, go, gameEnd, buttonClick, setEnabled };
})();

window.Audio = Audio;
