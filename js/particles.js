/**
 * HackShot — Particle System
 * Ambient floating particles on the background canvas.
 */

const Particles = (() => {
  let canvas, ctx, particles = [], enabled = true, animFrame;
  const COLORS = ['rgba(255,107,53,', 'rgba(155,89,182,', 'rgba(233,30,140,', 'rgba(0,212,170,', 'rgba(253,203,110,'];

  function init() {
    canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    spawnAll();
    loop();
  }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function spawnAll() {
    particles = [];
    const count = Math.min(60, Math.floor(window.innerWidth / 24));
    for (let i = 0; i < count; i++) spawn(true);
  }

  function spawn(init = false) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    particles.push({
      x: Math.random() * canvas.width,
      y: init ? Math.random() * canvas.height : canvas.height + 10,
      r: Math.random() * 2.5 + 0.5,
      speed: Math.random() * 0.5 + 0.2,
      drift: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.6 + 0.1,
      color,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    });
  }

  function loop() {
    animFrame = requestAnimationFrame(loop);
    if (!enabled) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.y -= p.speed;
      p.x += p.drift;
      p.pulse += p.pulseSpeed;
      const op = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + op + ')';
      ctx.fill();
      if (p.y < -10) { particles.splice(i, 1); spawn(); }
    });
  }

  /** Burst effect at (x, y) for hit celebrations */
  function burst(x, y, color = 'rgba(255,107,53,', count = 12) {
    if (!enabled) return;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = Math.random() * 4 + 2;
      const p = {
        x, y,
        r: Math.random() * 3 + 1,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: Math.random() * 0.04 + 0.03,
        color,
        isBurst: true,
      };
      particles.push(p);
    }
  }

  // Override loop to handle burst particles
  const originalLoop = loop;
  // Patch particles array to handle burst separately
  function loopPatched() {
    animFrame = requestAnimationFrame(loopPatched);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!enabled && particles.filter(p => p.isBurst).length === 0) return;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.isBurst) {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.15; // gravity
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.life + ')';
        ctx.fill();
      } else if (enabled) {
        p.y -= p.speed;
        p.x += p.drift;
        p.pulse += p.pulseSpeed;
        const op = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + op + ')';
        ctx.fill();
        if (p.y < -10) { particles.splice(i, 1); spawn(); }
      }
    }
  }

  function setEnabled(val) {
    enabled = val;
    if (val) spawnAll();
    else particles = particles.filter(p => p.isBurst);
  }

  // Restart with patched loop
  function start() {
    cancelAnimationFrame(animFrame);
    loopPatched();
  }

  return { init, burst, setEnabled, start };
})();

window.Particles = Particles;
