/**
 * Retos Diarios (Daily Quests) - davito.es
 */
class DailyChallengesSystem {
  constructor() {
    this.todayKey = new Date().toISOString().split('T')[0];
    this.questsPool = [
      { id: 'snake_200', game: 'Snake', desc: 'Consigue 200 puntos en Snake 🐍', target: 200, icon: 'fa-staff-snake', link: '/games/snake.html' },
      { id: '2048_256', game: '2048', desc: 'Combina fichas hasta llegar a 256 en 2048 🔢', target: 256, icon: 'fa-cubes', link: '/games/2048.html' },
      { id: 'mines_10', game: 'Buscaminas', desc: 'Descubre al menos 10 casillas en Buscaminas 💣', target: 10, icon: 'fa-land-mine-on', link: '/games/buscaminas.html' },
      { id: 'flappy_10', game: 'Flappy', desc: 'Esquiva 10 tuberías en Flappy Bird 🐤', target: 10, icon: 'fa-dove', link: '/games/flappy.html' },
      { id: 'memory_win', game: 'Memory', desc: 'Encuentra todas las parejas en Memory 🃏', target: 1, icon: 'fa-brain', link: '/games/memory.html' },
      { id: 'breakout_100', game: 'Breakout', desc: 'Rompe bloques y suma 100 puntos 🧱', target: 100, icon: 'fa-square', link: '/games/breakout.html' },
      { id: 'typing_50', game: 'Typing Defense', desc: 'Escribe rápido y acumula 50 palabras ⌨️', target: 50, icon: 'fa-keyboard', link: '/games/typing-defense.html' }
    ];

    this.currentQuest = this.getDailyQuest();
    this.init();
  }

  getDailyQuest() {
    // Hash determinista basado en la fecha actual
    let hash = 0;
    for (let i = 0; i < this.todayKey.length; i++) {
      hash = (hash << 5) - hash + this.todayKey.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % this.questsPool.length;
    return this.questsPool[index];
  }

  isCompleted() {
    return localStorage.getItem(`quest_completed_${this.todayKey}`) === 'true';
  }

  completeQuest() {
    if (this.isCompleted()) return;
    localStorage.setItem(`quest_completed_${this.todayKey}`, 'true');

    if (window.AchievementsSystem) {
      window.AchievementsSystem.unlock('daily_quest_hero', 'Héroe Diario', 'Completaste el reto diario del laboratorio');
    }

    this.render();
    alert(`🎉 ¡Felicidades! Has completado el Reto Diario: ${this.currentQuest.desc}`);
  }

  render() {
    const container = document.getElementById('daily-quest-banner');
    if (!container) return;

    const completed = this.isCompleted();
    container.innerHTML = `
      <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9)); border: 1px solid ${completed ? 'rgba(34, 197, 94, 0.5)' : 'rgba(245, 158, 11, 0.5)'}; border-radius: 16px; padding: 20px; margin-bottom: 30px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.3);">
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="width: 50px; height: 50px; border-radius: 12px; background: ${completed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}; color: ${completed ? '#4ade80' : '#f59e0b'}; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
            <i class="fas ${completed ? 'fa-circle-check' : 'fa-trophy'}"></i>
          </div>
          <div>
            <span style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; color: ${completed ? '#4ade80' : '#f59e0b'};">
              ${completed ? 'Reto Completado ✓' : 'Reto del Día'}
            </span>
            <h3 style="margin: 2px 0; font-size: 1.1rem; color: #f8fafc;">${this.currentQuest.desc}</h3>
            <p style="margin: 0; font-size: 0.85rem; color: #94a3b8;">Juego: ${this.currentQuest.game}</p>
          </div>
        </div>
        <div>
          ${completed ? `
            <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 0.9rem;">
              <i class="fas fa-medal"></i> Recompensa Reclamada
            </span>
          ` : `
            <a href="${this.currentQuest.link}" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; text-decoration: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; font-size: 0.9rem;">
              <i class="fas fa-gamepad"></i> Jugar Ahora
            </a>
          `}
        </div>
      </div>
    `;
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.render());
    } else {
      this.render();
    }
  }
}

window.DailyChallenges = new DailyChallengesSystem();
