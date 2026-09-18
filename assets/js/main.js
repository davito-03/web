import { showTrophyRoom, unlockAchievement } from './achievements.js';
import { initVisitCounter } from './script.js?v=3';
import { initKonami } from './konami.js';
import { initUI } from './ui.js';
// import { initModeration } from './moderation.js';

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;
}

function optimizeForMobile() {
    if (isMobileDevice()) {
        const particlesContainer = document.getElementById('particles-container');
        if (particlesContainer && window.innerWidth <= 568) {
            particlesContainer.style.display = 'none';
            console.debug('Partículas deshabilitadas en móvil pequeño');
        }

        document.documentElement.style.setProperty('--animation-duration', '0.3s');
        console.info('Optimizaciones móviles de JS aplicadas');
    }
}

function enhanceSecurity() {
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
        if (!script.src.startsWith(window.location.origin) &&
            !script.src.startsWith('https://fonts.googleapis.com') &&
            !script.src.startsWith('https://cdnjs.cloudflare.com') &&
            !script.src.startsWith('https://assets.mixkit.co') &&
            !script.src.startsWith('https://www.gstatic.com')) {
            console.warn('🚨 Script externo detectado:', script.src);
        }
    });


    if (window.top !== window.self) {
        console.warn('🚨 Posible intento de clickjacking detectado');
        window.top.location = window.self.location;
    }

    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.info('🛡️ Modo de seguridad activado');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    enhanceSecurity();
    optimizeForMobile();

    // PWA Update Handling
    let newWorker;

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(reg => {
            reg.addEventListener('updatefound', () => {
                newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        if (newWorker) newWorker.postMessage({ action: 'skipWaiting' });
                    }
                });
            });
        });
        // Do not reload the tab on controllerchange. That interrupt was why
        // the first visit often stopped halfway; Ctrl+Shift+R bypassed the worker.
    }

    console.info('✅ Sistemas de seguridad y optimización inicializados');

    try {
        await initVisitCounter();
        console.info('📊 Contador de visitas inicializado');
    } catch (error) {
        console.warn('Error inicializando contador de visitas:', error);
    }

    if (typeof window.initStars === 'function') {
        console.debug('⭐ Sistema de estrellas disponible');
    }

    try {
        await initKonami();
        console.debug('Konami code inicializado');
    } catch (error) {
        console.warn('Error inicializando Konami:', error);
    }

    try {
        await initUI();
        console.debug('UI inicializada');
    } catch (error) {
        console.warn('Error inicializando UI:', error);
    }

    // Moderation system is utility-based, no init required
    /*
    try {
        await initModeration();
        console.debug('Sistema de moderación inicializado');
    } catch (error) {
        console.warn('Error inicializando moderación:', error);
    }
    */

    // Mostrar estadísticas de logging en desarrollo
    if (console.isDevelopment) {
        console.debug('Estadísticas de logging:', console.getStats());
    }
    // Easter Egg: Logo Glitch
    const logo = document.querySelector('.logo') || document.querySelector('h1');
    if (logo) {
        let clickCount = 0;
        logo.addEventListener('click', () => {
            clickCount++;
            if (clickCount === 5) {
                document.body.classList.toggle('glitch-mode');
                console.log('👾 GLITCH MODE TOGGLED');
                clickCount = 0;
            }
        });
    }

    // Easter Egg: Footer Secret
    const footerYear = document.querySelector('.footer-bottom p') || document.querySelector('footer p');
    if (footerYear) {
        footerYear.addEventListener('click', () => {
            alert('🥚 Has encontrado un huevo de pascua! "La curiosidad es la mecha de la creatividad."');
        });
    }
});


// --- UX & Animations ---
document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for Scroll Reveal
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // Back to Top Button Logic
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Achievements Button Logic
    const achievementsBtn = document.getElementById('achievements-btn');
    if (achievementsBtn) {
        achievementsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showTrophyRoom();
        });
    }

    // New Easter Egg: Gravedad Cero y Matrix
    const profileImg = document.querySelector('.profile-image');
    if (profileImg) {
        let profileClicks = 0;
        let cTimer = null;
        profileImg.addEventListener('click', () => {
            profileClicks++;
            clearTimeout(cTimer);
            cTimer = setTimeout(() => { profileClicks = 0; }, 2000);
            
            if (profileClicks === 7) {
                profileClicks = 0;
                console.info('🚀 EASTER EGG INICIADO: Gravedad Cero');
                
                // Activar modo Gravedad Cero
                const oldTransition = document.body.style.transition;
                document.body.style.transition = 'transform 2s cubic-bezier(0.68, -0.55, 0.265, 1.55), filter 2s ease';
                document.body.style.transform = 'rotateX(180deg) rotateY(180deg)';
                document.body.style.filter = 'hue-rotate(180deg) invert(0.8)';
                
                unlockAchievement('newton');
                
                setTimeout(() => {
                    document.body.style.transform = '';
                    document.body.style.filter = '';
                    setTimeout(() => {
                        document.body.style.transition = oldTransition;
                    }, 2000);
                }, 10000);
            }
        });
    }

    // Easter Egg: Modo Rave / DJ (Doble click en Wifi)
    const wifiIndicator = document.getElementById('connection-indicator');
    if (wifiIndicator) {
        wifiIndicator.addEventListener('dblclick', (e) => {
            document.body.classList.add('rave-mode');
            unlockAchievement('partyAnimal');
            setTimeout(() => document.body.classList.remove('rave-mode'), 5000);
        });
    }

    // Easter Egg: El Pesado (Spam a Dabot)
    const dabotAvatar = document.querySelector('.dabot-avatar');
    if (dabotAvatar) {
        let dabotClicks = 0;
        let dTimer = null;
        dabotAvatar.addEventListener('click', (e) => {
            dabotClicks++;
            clearTimeout(dTimer);
            dTimer = setTimeout(() => { dabotClicks = 0; }, 2000);
            
            if (dabotClicks === 10) {
                dabotClicks = 0;
                dabotAvatar.classList.add('shake-angry');
                
                const desc = document.querySelector('.dabot-description');
                const oldText = desc ? desc.innerText : '';
                if (desc) desc.innerText = '¡DEJA DE TOCARME ALGORITMO PESADO!';
                
                unlockAchievement('pesado');
                
                setTimeout(() => {
                    dabotAvatar.classList.remove('shake-angry');
                    if (desc && oldText) desc.innerText = oldText;
                }, 4000);
            }
        });
    }

    // Easter Eggs Teclado: Matrix y Ninja
    let typedChars = "";
    let escClicks = 0;
    let escTimer = null;

    document.addEventListener('keydown', (e) => {
        // Ninja Mode
        if (e.key === 'Escape') {
            escClicks++;
            clearTimeout(escTimer);
            escTimer = setTimeout(() => { escClicks = 0; }, 1500);
            
            if (escClicks === 5) {
                escClicks = 0;
                document.body.classList.toggle('ninja-hide');
                unlockAchievement('ninja');
            }
            return;
        }

        // Matrix Mode
        const char = e.key.toLowerCase();
        if ("matrix".includes(char)) {
            typedChars += char;
            if (typedChars.endsWith("matrix")) {
                typedChars = "";
                startMatrixEffect();
                unlockAchievement('neo');
            }
        } else {
            typedChars = "";
        }
    });

    function startMatrixEffect() {
        const canvas = document.getElementById('matrix-canvas');
        if (!canvas) return;
        canvas.style.opacity = '1';
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+'.split('');
        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops = [];
        for (let x = 0; x < columns; x++) drops[x] = 1;
        
        const interval = setInterval(() => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#0F0'; 
            ctx.font = fontSize + 'px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }, 33);
        
        setTimeout(() => {
            canvas.style.opacity = '0';
            setTimeout(() => clearInterval(interval), 1000);
        }, 7000);
    }
});

