import sfx from '/assets/js/sfx.js';

// --- Assets ---
const ALL_ICONS = [
    'fa-ghost', 'fa-dragon', 'fa-gamepad', 'fa-rocket',
    'fa-robot', 'fa-meteor', 'fa-brain', 'fa-dice-d20',
    'fa-spider', 'fa-skull', 'fa-bolt', 'fa-star',
    'fa-bomb', 'fa-gem', 'fa-crow', 'fa-frog'
];

const PRESETS = {
    easy: { pairs: 6, cols: 3 },   // 12 cards (3x4)
    medium: { pairs: 8, cols: 4 }, // 16 cards (4x4)
    hard: { pairs: 15, cols: 5 }   // 30 cards (5x6) - wait, 15 pairs need 30 cards. 5x6 grid.
    // Hard: 12 pairs = 24 cards (4x6 or 6x4). Mobile fits 4 cols better.
};

// Adjusted Hard: 12 pairs (24 cards) -> 4 cols x 6 rows
PRESETS.hard = { pairs: 12, cols: 4 };

// --- State ---
let currentConfig = PRESETS.medium;
let cards = [];
let flippedCards = [];
let moves = 0;
let timer = 0;
let timerInterval = null;
let isLocked = false;

// Elements
const gridEl = document.getElementById('game-grid');
const movesEl = document.getElementById('moves');
const timeEl = document.getElementById('time');
const startScreen = document.getElementById('start-screen');
const modal = document.getElementById('game-over-modal');
const finalMovesEl = document.getElementById('final-moves');
const finalTimeEl = document.getElementById('final-time');
const restartBtn = document.getElementById('restart-btn');
const particlesContainer = document.getElementById('particles');

function init() {
    // Difficulty Buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const diff = e.target.dataset.diff;
            currentConfig = PRESETS[diff];
            startGame();
        });
    });

    restartBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        startScreen.classList.add('active'); // Back to selection
    });
}

function startGame() {
    startScreen.classList.remove('active');
    modal.classList.remove('active');
    resetGame();
}

function resetGame() {
    clearInterval(timerInterval);
    moves = 0;
    timer = 0;
    flippedCards = [];
    isLocked = false;
    movesEl.innerText = '0';
    timeEl.innerText = '00:00';

    generateCards();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timer++;
    const mins = Math.floor(timer / 60);
    const secs = timer % 60;
    timeEl.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function generateCards() {
    const numPairs = currentConfig.pairs;
    // Select random icons
    let selectedIcons = [...ALL_ICONS].sort(() => 0.5 - Math.random()).slice(0, numPairs);
    let pairPool = [...selectedIcons, ...selectedIcons];

    // Shuffle
    for (let i = pairPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairPool[i], pairPool[j]] = [pairPool[j], pairPool[i]];
    }

    // Grid Setup
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${currentConfig.cols}, 1fr)`;

    cards = pairPool.map((icon, index) => {
        const card = document.createElement('div');
        card.classList.add('card');

        card.innerHTML = `
            <div class="card-face card-front"></div>
            <div class="card-face card-back"><i class="fas ${icon}"></i></div>
        `;

        card.addEventListener('click', () => handleCardClick(index));
        gridEl.appendChild(card);

        return { el: card, icon: icon, matched: false, index: index };
    });
}

function handleCardClick(index) {
    if (isLocked) return;
    const card = cards[index];

    if (card.matched || flippedCards.includes(card)) return;

    // Flip
    card.el.classList.add('flipped');
    flippedCards.push(card);
    sfx.play('click');

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    moves++;
    movesEl.innerText = moves;
    isLocked = true;

    const [c1, c2] = flippedCards;

    if (c1.icon === c2.icon) {
        // Match!
        c1.matched = true;
        c2.matched = true;

        setTimeout(() => {
            c1.el.classList.add('matched');
            c2.el.classList.add('matched');
            createParticles(c1.el);
            createParticles(c2.el);
            sfx.play('score');
            flippedCards = [];
            isLocked = false;

            // Check Win
            if (cards.every(c => c.matched)) {
                gameOver();
            }
        }, 500);
    } else {
        // No Match
        setTimeout(() => {
            c1.el.classList.remove('flipped');
            c2.el.classList.remove('flipped');
            sfx.play('hit'); // Error sound
            flippedCards = [];
            isLocked = false;
        }, 1000);
    }
}

function createParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.style.position = 'absolute';
        p.style.left = centerX + 'px';
        p.style.top = centerY + 'px';
        p.style.width = '4px';
        p.style.height = '4px';
        p.style.background = '#0f0';
        p.style.borderRadius = '50%';
        p.style.pointerEvents = 'none';
        p.style.zIndex = '999';

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 100 + 50;

        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        p.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        }).onfinish = () => p.remove();

        particlesContainer.appendChild(p);
    }
}

function gameOver() {
    clearInterval(timerInterval);
    finalMovesEl.innerText = moves;
    finalTimeEl.innerText = timeEl.innerText;

    let calculatedScore = Math.max(0, 5000 - (moves * 50) - (timer * 10));
    if (window.LeaderboardSystem && window.LeaderboardSystem.isTopScore('Memory', calculatedScore) && calculatedScore > 0) {
        setTimeout(() => {
            const playerName = prompt("¡Nuevo récord local! Ingresa tu nombre:") || "Anónimo";
            window.LeaderboardSystem.addScore({ game: 'Memory', score: calculatedScore, player: playerName, date: Date.now() });
        }, 800);
    }

    setTimeout(() => {
        modal.classList.add('active');
        sfx.play('score');
    }, 1000);
}

init();
