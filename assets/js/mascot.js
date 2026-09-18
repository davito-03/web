/**
 * Langostina Mascot - Mascot Component for davito.es
 */
class LobsterMascot {
  constructor() {
    this.clickCount = 0;
    this.quotesEs = [
      "¡Hola! Soy Langostina 🦞 ¿Sabías que en el laboratorio hay 14 juegos gratis?",
      "¡Bienvenido al hub de @davito_03! Pásalo genial explorando ✨",
      "¡Psst! Si me haces 10 clics te daré un logro secreto 👀",
      "¿Has probado el bot Dabot para Discord? ¡Tiene IA integrada!",
      "¡No olvides consultar el estado de las gasolineras si vas a conducir! ⛽",
      "¡Haz clic en los minijuegos para romper récords en la Leaderboard!",
      "¡Langostas Gang en la casa! 🦞🔥",
      "¡Gracias por visitar esta web! Hecha con mucho ❤️ y código."
    ];

    this.quotesEn = [
      "Hi! I'm Langostina 🦞 Did you know there are 14 free games in the lab?",
      "Welcome to @davito_03's hub! Have a great time exploring ✨",
      "Psst! Click me 10 times for a secret achievement 👀",
      "Have you tried Dabot for Discord? It has AI built right in!",
      "Don't forget to check gas station prices before you drive! ⛽",
      "Play minigames to climb the global Leaderboard!",
      "Langostas Gang in the house! 🦞🔥",
      "Thanks for visiting! Crafted with lots of ❤️ and code."
    ];

    this.init();
  }

  init() {
    if (document.getElementById('lobster-mascot-container')) return;

    // Inyectar CSS si no está cargado
    if (!document.querySelector('link[href*="mascot.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/assets/css/mascot.css?v=3';
      document.head.appendChild(link);
    }

    const container = document.createElement('div');
    container.id = 'lobster-mascot-container';
    container.innerHTML = `
      <div class="lobster-dialogue-bubble" id="lobster-dialogue">
        <button class="lobster-close-btn" id="lobster-close" aria-label="Cerrar">&times;</button>
        <span class="lobster-badge">Langostina 🦞</span>
        <div class="lobster-text-content" id="lobster-text" data-i18n="mascot_hello">¡Hola! Hazme clic para hablar conmigo 🥰</div>
      </div>
      <div class="lobster-avatar-wrapper" id="lobster-avatar" role="button" aria-label="Mascota Langostina">
        <img src="/media/langostina.png" alt="Mascota Langostina" class="lobster-img">
      </div>
    `;

    document.body.appendChild(container);

    this.dialogueEl = document.getElementById('lobster-dialogue');
    this.textEl = document.getElementById('lobster-text');
    this.avatarEl = document.getElementById('lobster-avatar');
    this.closeBtn = document.getElementById('lobster-close');

    this.setupEvents();

    const hello = (window.davitoT && window.davitoT('mascot_hello', '¡Hola! Hazme clic para hablar conmigo 🥰')) || '¡Hola! Hazme clic para hablar conmigo 🥰';
    this.textEl.textContent = hello;
    window.addEventListener('languageChanged', () => {
      if (!this.dialogueEl.classList.contains('visible')) {
        this.textEl.textContent = window.davitoT('mascot_hello', hello);
      }
    });

    // Diálogo inicial aleatorio tras 3s
    setTimeout(() => {
      this.speakRandom();
    }, 3000);
  }

  setupEvents() {
    this.avatarEl.addEventListener('click', (e) => {
      this.clickCount++;
      this.playChirpSound();
      this.spawnHeart(e);
      this.speakRandom();

      // Logro secreto de clicks
      if (this.clickCount === 10) {
        if (window.AchievementsSystem) {
          window.AchievementsSystem.unlock('mascot_friend', 'Amigo de Langostina', 'Interactuaste 10 veces con la mascota');
        }
        this.speak("¡Yay! 🎉 ¡Has desbloqueado el logro 'Amigo de Langostina'!");
      }
    });

    this.closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dialogueEl.classList.remove('visible');
    });
  }

  speakRandom() {
    const lang = localStorage.getItem('site_lang') || 'es';
    const quotes = lang === 'en' ? this.quotesEn : this.quotesEs;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    this.speak(quotes[randomIndex]);
  }

  speak(text) {
    this.textEl.textContent = text;
    this.dialogueEl.classList.add('visible');

    // Auto ocultar tras 7s
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      this.dialogueEl.classList.remove('visible');
    }, 7000);
  }

  playChirpSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (err) {
      // AudioContext no interactuado aún
    }
  }

  spawnHeart(event) {
    const heart = document.createElement('div');
    heart.className = 'lobster-heart';
    heart.innerHTML = '❤️';
    const rect = this.avatarEl.getBoundingClientRect();
    heart.style.left = `${rect.left + rect.width / 2 - 10}px`;
    heart.style.top = `${rect.top}px`;
    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 800);
  }
}

// Auto inicializar al cargar la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new LobsterMascot());
} else {
  new LobsterMascot();
}
