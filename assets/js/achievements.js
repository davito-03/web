const achievements = {
    konamiMaster: { title: "Konami Master", description: "Has descubierto el código secreto.", icon: "fas fa-gamepad" },
    sysAdmin: { title: "SysAdmin", description: "Has inspeccionado el sistema con 'neofetch'.", icon: "fas fa-terminal" },
    curioso: { title: "Curioso", description: "Has pedido ayuda en la terminal.", icon: "fas fa-question-circle" },
    cotilla: { title: "Cotilla", description: "Has consultado las redes sociales.", icon: "fas fa-user-secret" },
    arqueologo: { title: "Arqueólogo", description: "Has leído la biografía oculta.", icon: "fas fa-scroll" },
    recruiter: { title: "Recruiter", description: "Has echado un vistazo a las skills.", icon: "fas fa-user-tie" },
    comandante: { title: "Comandante", description: "Has usado 5 comandos diferentes.", icon: "fas fa-star" },
    cientifico: { title: "Científico", description: "Has entrado al laboratorio de juegos.", icon: "fas fa-flask" },
    lector: { title: "Lector", description: "Has visitado el blog.", icon: "fas fa-book-open" },
    
    // Terminal Achievements
    hackerWannabe: { title: "Hacker Wannabe", description: "Intentaste usar 'sudo'. Buen intento.", icon: "fas fa-user-shield" },
    destructor: { title: "Destructor", description: "Intentaste borrar el sistema. HAL 9000 te vigila.", icon: "fas fa-bomb" },
    existential: { title: "Crisis Existencial", description: "Preguntaste 'whoami'. Eres el Elegido.", icon: "fas fa-fingerprint" },
    catLover: { title: "Cat Lover", description: "Miau. 🐾", icon: "fas fa-cat" },
    snoop: { title: "Snoop", description: "Intentaste listar archivos secretos.", icon: "fas fa-search" },
    partyTime: { title: "Party Time", description: "¡Fiesta de confeti!", icon: "fas fa-glass-cheers" },
    newton: { title: "Ley de Newton", description: "La gravedad es implacable.", icon: "fas fa-apple-alt" },
    philosopher: { title: "Filósofo", description: "El tiempo es una ilusión.", icon: "fas fa-hourglass-half" },
    hitchhiker: { title: "Autoestopista", description: "42. La respuesta a todo.", icon: "fas fa-rocket" },

    // Cheat Codes
    doomSlayer: { title: "Doom Slayer", description: "IDDQD. Modo Dios activado.", icon: "fas fa-skull" },
    sanAndreas: { title: "San Andreas", description: "HESOYAM. Salud y dinero (falso).", icon: "fas fa-money-bill-wave" },
    typist: { title: "Mecanógrafo", description: "Escribiste 'secret' en el aire.", icon: "fas fa-keyboard" },

    // Interactions
    dizzy: { title: "Mareado", description: "Hiciste girar tu foto de perfil.", icon: "fas fa-sync-alt" },
    copycat: { title: "Copycat", description: "Intentaste copiar la bio. ¡Sé original!", icon: "fas fa-copy" },
    inspector: { title: "Inspector Gadget", description: "Abriste las herramientas de desarrollo.", icon: "fas fa-code" },
    yoyo: { title: "Yo-Yo", description: "Scroll arriba y abajo muy rápido.", icon: "fas fa-arrows-alt-v" },
    lostInSpace: { title: "Perdido en el Espacio", description: "Visitaste una página que no existe.", icon: "fas fa-map-signs" },
    rebel: { title: "Rebelde", description: "Click derecho donde no debías.", icon: "fas fa-mouse-pointer" },
    copyrightPolice: { title: "Policía del Copyright", description: "Doble click en el footer.", icon: "fas fa-copyright" },
    neo: { title: "El Elegido", description: "Has despertado en Matrix.", icon: "fas fa-user-secret" },
    partyAnimal: { title: "Party Animal", description: "Has activado el modo Dios/Rave.", icon: "fas fa-compact-disc" },
    ninja: { title: "Modo Ninja", description: "Escondiendo la pantalla del jefe...", icon: "fas fa-user-ninja" },
    pesado: { title: "El Pesado", description: "Has cabreado al bot de tanto click.", icon: "fas fa-robot" }
};

export function unlockAchievement(id) {
    if (!achievements[id]) return;

    let unlocked = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];
    if (unlocked.includes(id)) return;

    unlocked.push(id);
    localStorage.setItem('unlockedAchievements', JSON.stringify(unlocked));
    showAchievementNotification(achievements[id]);

    // Play subtle achievement chime via Web Audio API (no external file needed)
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            const ctx = new AudioCtx();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.setValueAtTime(880, now + 0.1); // A5
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.36);
        }
    } catch (e) { }
}

export function unlockAchievementCounter(id, counterKey, targetCount, itemToAdd) {
    if (!achievements[id] || isAchievementUnlocked(id)) return;
    let currentItems = JSON.parse(sessionStorage.getItem(counterKey)) || [];
    if (itemToAdd && !currentItems.includes(itemToAdd)) {
        currentItems.push(itemToAdd);
    } else if (!itemToAdd) {
        currentItems.push(Date.now());
    }

    sessionStorage.setItem(counterKey, JSON.stringify(currentItems));
    if (currentItems.length >= targetCount) {
        unlockAchievement(id);
    }
}

export function isAchievementUnlocked(id) {
    const unlocked = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];
    return unlocked.includes(id);
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon"><i class="${achievement.icon}"></i></div>
        <div class="achievement-text">
            <h4>¡Logro Desbloqueado!</h4>
            <p>${achievement.title}</p>
        </div>
    `;
    document.body.appendChild(notification);

    // Force reflow
    notification.offsetHeight;

    setTimeout(() => notification.classList.add('show'), 100);

    // Dynamic pure CSS Confetti!
    triggerConfettiBurst();

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

function triggerConfettiBurst() {
    const colors = ['#00ff88', '#00e1ff', '#ff007f', '#ffea00', '#ff6600'];
    const count = 40;
    
    // Inject style if not already present
    if (!document.getElementById('confetti-styles')) {
        const style = document.createElement('style');
        style.id = 'confetti-styles';
        style.textContent = `
            .confetti-piece {
                position: fixed;
                width: 8px;
                height: 12px;
                opacity: 0.85;
                z-index: 10001;
                pointer-events: none;
                animation: confetti-fall linear forwards;
            }
            @keyframes confetti-fall {
                0% {
                    transform: translateY(-20px) rotate(0deg) translateX(0);
                    opacity: 1;
                }
                100% {
                    transform: translateY(105vh) rotate(720deg) translateX(var(--drift));
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 2 + Math.random() * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const drift = (Math.random() * 200 - 100) + 'px';
        const scale = 0.5 + Math.random() * 0.8;
        const rotate = Math.random() * 360;

        piece.style.left = left + '%';
        piece.style.top = '-20px';
        piece.style.backgroundColor = color;
        piece.style.transform = `rotate(${rotate}deg) scale(${scale})`;
        piece.style.setProperty('--drift', drift);
        piece.style.animationDelay = delay + 's';
        piece.style.animationDuration = duration + 's';

        document.body.appendChild(piece);

        setTimeout(() => {
            piece.remove();
        }, (delay + duration) * 1000);
    }
}

// Trophy Room UI
export function showTrophyRoom() {
    const unlocked = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];
    const total = Object.keys(achievements).length;

    const modal = document.createElement('div');
    modal.className = 'trophy-modal';
    modal.innerHTML = `
        <div class="trophy-content">
            <div class="trophy-header">
                <h2>🏆 Sala de Trofeos</h2>
                <button class="close-trophy"><i class="fas fa-times"></i></button>
            </div>
            <div class="trophy-stats">
                <p>Progreso: ${unlocked.length} / ${total}</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(unlocked.length / total) * 100}%"></div>
                </div>
            </div>
            <div class="trophy-grid">
                ${Object.entries(achievements).map(([id, data]) => {
                    const isUnlocked = unlocked.includes(id);
                    return `
                        <div class="trophy-card ${isUnlocked ? 'unlocked' : 'locked'}">
                            <div class="trophy-icon">
                                <i class="${isUnlocked ? data.icon : 'fas fa-lock'}"></i>
                            </div>
                            <div class="trophy-info">
                                <h3>${data.title}</h3>
                                <p>${isUnlocked ? data.description : '???'}</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Styles for modal (injected here for simplicity)
    const style = document.createElement('style');
    style.id = 'trophy-room-styles';
    style.textContent = `
        .trophy-modal {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: fadeIn 0.3s ease;
        }
        .trophy-content {
            background: #1a1a2e;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            border-radius: 15px;
            border: 2px solid #00ff88;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.2);
        }
        .trophy-header {
            padding: 20px;
            background: #16213e;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #00ff88;
        }
        .trophy-header h2 { margin: 0; color: #00ff88; font-family: 'Inter', sans-serif; font-size: 1.2em; }
        .close-trophy { background: none; border: none; color: #fff; font-size: 1.5em; cursor: pointer; }
        .trophy-stats { padding: 20px; text-align: center; color: #fff; }
        .progress-bar { height: 10px; background: #333; border-radius: 5px; margin-top: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #00ff88, #00cc6f); transition: width 0.5s ease; }
        .trophy-grid {
            padding: 20px;
            overflow-y: auto;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
        }
        .trophy-card {
            background: #0f0f1a;
            padding: 15px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 15px;
            border: 1px solid #333;
            transition: all 0.3s ease;
        }
        .trophy-card.unlocked { border-color: #00ff88; background: rgba(0, 255, 136, 0.05); }
        .trophy-card.locked { opacity: 0.6; filter: grayscale(1); }
        .trophy-icon { font-size: 2em; color: #00ff88; min-width: 50px; text-align: center; }
        .trophy-info h3 { margin: 0 0 5px 0; color: #fff; font-size: 0.9em; }
        .trophy-info p { margin: 0; color: #aaa; font-size: 0.8em; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `;
    
    // Add stylesheet if not already added
    if (!document.getElementById('trophy-room-styles')) {
        document.head.appendChild(style);
    }

    modal.querySelector('.close-trophy').addEventListener('click', () => {
        modal.remove();
        const existingStyle = document.getElementById('trophy-room-styles');
        if (existingStyle) existingStyle.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            const existingStyle = document.getElementById('trophy-room-styles');
            if (existingStyle) existingStyle.remove();
        }
    });
}
