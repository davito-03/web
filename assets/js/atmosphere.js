/**
 * Night-sky atmosphere: twinkling starfield, shooting stars, cursor sparkles.
 * Respects prefers-reduced-motion and small screens.
 */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  function makeCanvas() {
    let canvas = document.getElementById('starfield');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'starfield';
      document.body.prepend(canvas);
    }
    return canvas;
  }

  function initStars() {
    if (window.__starsStarted) return;
    window.__starsStarted = true;
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let stars = [];
    let shooters = [];
    let sparkles = [];
    let raf = 0;
    let last = 0;
    let nextShooter = 800;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnStars() {
      const count = reduced ? 40 : (isMobile ? 70 : 140);
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.3,
          base: Math.random() * 0.45 + 0.25,
          tw: Math.random() * Math.PI * 2,
          sp: 0.008 + Math.random() * 0.02,
          layer: Math.random()
        });
      }
    }

    function spawnShooter() {
      shooters.push({
        x: -30 + Math.random() * w * 0.35,
        y: Math.random() * h * 0.4,
        vx: 9 + Math.random() * 6,
        vy: 3.2 + Math.random() * 2.8,
        life: 1,
        len: 90 + Math.random() * 70
      });
    }

    function draw(ts) {
      if (!last) last = ts;
      const dt = Math.min(40, ts - last);
      last = ts;

      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        s.tw += s.sp * dt;
        const a = s.base + Math.sin(s.tw) * 0.35;
        ctx.beginPath();
        ctx.fillStyle = `rgba(226, 232, 255, ${Math.max(0.08, a)})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.2 && a > 0.55) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(191, 219, 254, ${a * 0.25})`;
          ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!reduced) {
        nextShooter -= dt;
        if (nextShooter <= 0) {
          spawnShooter();
          nextShooter = 2500 + Math.random() * 4500;
        }
      }

      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i];
        sh.x += sh.vx * (dt / 16);
        sh.y += sh.vy * (dt / 16);
        sh.life -= dt / 1100;
        const tx = sh.x - sh.vx * 12;
        const ty = sh.y - sh.vy * 12;
        const grd = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
        const a = Math.max(0, sh.life);
        grd.addColorStop(0, `rgba(255,255,255,${a})`);
        grd.addColorStop(0.35, `rgba(191,219,254,${a * 0.7})`);
        grd.addColorStop(1, 'rgba(147,197,253,0)');
        ctx.strokeStyle = grd;
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.arc(sh.x, sh.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        if (sh.life <= 0 || sh.x > w + 50 || sh.y > h + 50) shooters.splice(i, 1);
      }

      for (let i = sparkles.length - 1; i >= 0; i--) {
        const p = sparkles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt / 500;
        p.vy += 0.02;
        ctx.beginPath();
        ctx.fillStyle = `rgba(196, 181, 253, ${Math.max(0, p.life)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.life <= 0) sparkles.splice(i, 1);
      }

      raf = requestAnimationFrame(draw);
    }

    function onMove(e) {
      if (reduced || isMobile || sparkles.length > 40) return;
      if (Math.random() > 0.45) return;
      sparkles.push({
        x: e.clientX + (Math.random() * 10 - 5),
        y: e.clientY + (Math.random() * 10 - 5),
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.4 - Math.random() * 0.5,
        r: Math.random() * 1.3 + 0.4,
        life: 1
      });
    }

    resize();
    spawnStars();
    window.addEventListener('resize', () => {
      resize();
      spawnStars();
    });
    if (!reduced && !isMobile) {
      window.addEventListener('pointermove', onMove, { passive: true });
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        last = 0;
        raf = requestAnimationFrame(draw);
      }
    });
    raf = requestAnimationFrame(draw);
  }

  window.initStars = initStars;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStars);
  } else {
    initStars();
  }
})();
