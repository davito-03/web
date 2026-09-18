// --- 3D Tilt Effect ---
// Respects prefers-reduced-motion for accessibility
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // No 3D tilt on the glass card — it felt too strong over a tall list.
  // Keep a very light lift on individual hub links only.
  document.querySelectorAll('.hub-link, .social-button').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(0);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(0);
      btn.style.setProperty('--x', `${x}%`);
      btn.style.setProperty('--y', `${y}%`);
    });
  });
});
