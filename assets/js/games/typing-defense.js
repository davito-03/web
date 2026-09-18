import sfx from '/assets/js/sfx.js';

const WORDS = [
    // Malware types
    'virus', 'malware', 'trojan', 'worm', 'spyware', 'ransomware', 'botnet', 'phishing',
    'exploit', 'backdoor', 'rootkit', 'keylogger', 'adware', 'scareware', 'cryptojacker',
    // Attack vectors
    'breach', 'payload', 'injection', 'overflow', 'shell', 'ddos', 'mitm', 'spoofing',
    // Tech terms
    'firewall', 'encryption', 'protocol', 'daemon', 'zombie', 'buffer', 'kernel', 'socket',
    'packet', 'hash', 'cipher', 'token', 'session', 'cookie', 'cache', 'cron',
    // Hacker slang
    'pwned', 'cracked', 'root', 'sudo', 'bash', 'terminal', 'command', 'execute',
    'script', 'binary', 'compile', 'debug', 'patch', 'localhost', 'server', 'client',
    // Programming
    'function', 'variable', 'array', 'object', 'string', 'integer', 'boolean', 'class',
    'import', 'export', 'return', 'console', 'error', 'warning', 'exception', 'stack'
];

let viruses = [];
let score = 0;
let health = 100;
let level = 1;
let combo = 1;
let isRunning = false;
let spawnInterval;
let typingTarget = null;

const virusArea = document.getElementById('virus-area');
const input = document.getElementById('typing-input');
const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const levelEl = document.getElementById('level');
const healthFill = document.getElementById('health-fill');
const startScreen = document.getElementById('start-screen');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreEl = document.getElementById('final-score');
const finalLevelEl = document.getElementById('final-level');

function init() {
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);

    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') checkWord();
    });
}

function startGame() {
    startScreen.classList.remove('active');
    gameOverModal.classList.remove('active');

    score = 0;
    health = 100;
    level = 1;
    combo = 1;
    viruses = [];
    typingTarget = null;

    virusArea.innerHTML = '';
    input.value = '';
    input.disabled = false;
    input.focus();

    updateUI();

    isRunning = true;
    spawnVirus();

    clearInterval(spawnInterval);
    spawnInterval = setInterval(() => {
        if (isRunning) spawnVirus();
    }, Math.max(2000 - level * 100, 800));

    requestAnimationFrame(update);
}

function spawnVirus() {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const x = Math.random() * (virusArea.offsetWidth - 100);

    const virusEl = document.createElement('div');
    virusEl.className = 'virus';
    virusEl.textContent = word;
    virusEl.style.left = x + 'px';
    virusEl.style.top = '0px';
    virusArea.appendChild(virusEl);

    viruses.push({
        el: virusEl,
        word: word,
        y: 0,
        speed: 0.5 + level * 0.1,
        typed: ''
    });
}

function handleInput(e) {
    const typed = e.target.value.toLowerCase();

    // Find matching virus
    let match = null;
    for (let v of viruses) {
        if (v.word.startsWith(typed)) {
            match = v;
            break;
        }
    }

    if (match && typed.length > 0) {
        match.typed = typed;
        match.el.classList.add('typing');
        match.el.innerHTML = `<span style="color:#ff0">${typed}</span>${match.word.substring(typed.length)}`;
        typingTarget = match;
    } else if (typingTarget) {
        typingTarget.el.classList.remove('typing');
        typingTarget.el.textContent = typingTarget.word;
        typingTarget = null;
    }
}

function checkWord() {
    const typed = input.value.toLowerCase().trim();

    const matchIndex = viruses.findIndex(v => v.word === typed);

    if (matchIndex !== -1) {
        const virus = viruses[matchIndex];
        destroyVirus(virus, matchIndex);
        input.value = '';
        typingTarget = null;
    } else {
        // Wrong word
        combo = 1;
        comboEl.textContent = combo;
        input.value = '';
    }
}

function destroyVirus(virus, index) {
    score += 10 * combo;
    combo = Math.min(combo + 1, 10);

    // Particle effect
    const rect = virus.el.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
        createParticle(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    virus.el.remove();
    viruses.splice(index, 1);

    sfx.play('coin');
    updateUI();
}

function createParticle(x, y) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    document.body.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 100;
    const tx = x + Math.cos(angle) * speed;
    const ty = y + Math.sin(angle) * speed;

    p.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${tx - x}px, ${ty - y}px) scale(0)`, opacity: 0 }
    ], {
        duration: 600,
        easing: 'ease-out'
    }).onfinish = () => p.remove();
}

function update() {
    if (!isRunning) return;

    // Move viruses
    for (let i = viruses.length - 1; i >= 0; i--) {
        const v = viruses[i];
        v.y += v.speed;
        v.el.style.top = v.y + 'px';

        // Reached bottom?
        if (v.y > virusArea.offsetHeight - 50) {
            health -= 10;
            healthFill.style.width = health + '%';
            v.el.remove();
            viruses.splice(i, 1);
            combo = 1;
            comboEl.textContent = combo;
            sfx.play('hit');

            if (health <= 0) {
                gameOver();
                return;
            }
        }
    }

    // Level up
    if (score > level * 200) {
        level++;
        levelEl.textContent = level;
        clearInterval(spawnInterval);
        spawnInterval = setInterval(() => {
            if (isRunning) spawnVirus();
        }, Math.max(2000 - level * 100, 800));
    }

    requestAnimationFrame(update);
}

function gameOver() {
    isRunning = false;
    clearInterval(spawnInterval);
    input.disabled = true;
    finalScoreEl.textContent = score;
    finalLevelEl.textContent = level;

    if (window.LeaderboardSystem && window.LeaderboardSystem.isTopScore('Typing Defense', score) && score > 0) {
        setTimeout(() => {
            const playerName = prompt("¡Nuevo récord local! Ingresa tu nombre:") || "Anónimo";
            window.LeaderboardSystem.addScore({ game: 'Typing Defense', score: score, player: playerName, date: Date.now() });
        }, 500);
    }

    gameOverModal.classList.add('active');
}

function updateUI() {
    scoreEl.textContent = score;
    comboEl.textContent = combo;
    levelEl.textContent = level;
}

init();
