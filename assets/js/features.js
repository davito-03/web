
console.log('🚀 Cargando funcionalidades adicionales...');


const analytics = {
    events: [],

    track(event, data = {}) {
        const eventData = {
            timestamp: Date.now(),
            event: event,
            data: data,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.events.push(eventData);
        console.log('📊 Analytics:', event, data);

        if (this.events.length > 100) {
            this.events = this.events.slice(-100);
        }

        try {
            localStorage.setItem('davito_analytics', JSON.stringify(this.events));
        } catch (e) {
            console.warn('No se pudieron guardar las analíticas');
        }
    },

    getReport() {
        return {
            totalEvents: this.events.length,
            sessionDuration: this.events.length > 0 ? Date.now() - this.events[0].timestamp : 0,
            topEvents: this.getTopEvents(),
            lastEvents: this.events.slice(-10)
        };
    },

    getTopEvents() {
        const eventCounts = {};
        this.events.forEach(event => {
            eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
        });

        return Object.entries(eventCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([event, count]) => ({ event, count }));
    }
};

try {
    const savedAnalytics = localStorage.getItem('davito_analytics');
    if (savedAnalytics) {
        const parsed = JSON.parse(savedAnalytics);
        if (Array.isArray(parsed)) {
            analytics.events = parsed;
        }
    }
} catch (e) {
    console.warn('No se pudieron cargar las analíticas guardadas');
    analytics.events = [];
}


window.addEventListener('languageChanged', function () {
    if (typeof updateConnectionStatus === 'function') updateConnectionStatus();
});

function updateConnectionStatus() {
    const indicator = document.getElementById('connection-indicator');
    const status = document.getElementById('connection-status');

    if (navigator.onLine) {
        if (indicator) {
            indicator.style.background = 'rgba(34, 197, 94, 0.8)';
            indicator.style.opacity = '0';
        }
        if (status) {
            status.textContent = (window.davitoT && window.davitoT('connected', 'Conectado')) || 'Conectado';
        }
    } else {
        if (indicator) {
            indicator.style.background = 'rgba(239, 68, 68, 0.8)';
            indicator.style.opacity = '1';
        }
        if (status) {
            status.textContent = (window.davitoT && window.davitoT('offline', 'Sin conexión')) || 'Sin conexión';
        }
        console.log('❌ Conexión perdida');
    }
}


function createFloatingParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;

    const particleCount = Math.min(30, Math.floor(window.innerWidth / 30));

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.4 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: 100vh;
            animation: gentleFloat ${Math.random() * 15 + 20}s infinite linear;
            animation-delay: ${Math.random() * 10}s;
        `;
        container.appendChild(particle);
    }
}

const floatAnimation = document.createElement('style');
floatAnimation.textContent = `
    @keyframes gentleFloat {
        0% { transform: translateY(100vh) translateX(0px); opacity: 0; }
        10% { opacity: 0.6; }
        90% { opacity: 0.6; }
        100% { transform: translateY(-10vh) translateX(10px); opacity: 0; }
    }
`;
document.head.appendChild(floatAnimation);


function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}


function enhanceSoundEffects() {
    const socialButtons = document.querySelectorAll('.hub-link, .social-button');
    const hoverSound = document.getElementById('hover-sound');
    const clickSound = document.getElementById('click-sound');

    if (hoverSound) hoverSound.volume = 0.1;
    if (clickSound) clickSound.volume = 0.15;

    socialButtons.forEach(button => {
        const platform = button.querySelector('.label')?.textContent || 'unknown';

        button.addEventListener('mouseenter', () => {
            analytics.track('social_hover', { platform });
            if (hoverSound && hoverSound.readyState >= 2) {
                hoverSound.currentTime = 0;
                hoverSound.play().catch(() => { });
            }
        });

        button.addEventListener('click', () => {
            analytics.track('social_click', { platform, url: button.href });
            if (clickSound && clickSound.readyState >= 2) {
                clickSound.currentTime = 0;
                clickSound.play().catch(() => { });
            }
        });
    });
}


function initTitleAnimation() {
    const titleText = "@davito_03";
    let charIndex = 1;
    let typing = true;
    let typingInterval = null;
    const blurTitle = "vuelve porfis :(";
    let isBlurred = false;

    function typeTitle() {
        if (isBlurred) return;
        if (typing) {
            if (charIndex < titleText.length) {
                document.title = titleText.slice(0, charIndex + 1);
                charIndex++;
            } else {
                typing = false;
            }
        } else {
            if (charIndex > 1) {
                document.title = titleText.slice(0, charIndex - 1);
                charIndex--;
            } else {
                typing = true;
            }
        }
        typingInterval = setTimeout(typeTitle, 500);
    }

    window.addEventListener('focus', () => {
        isBlurred = false;
        charIndex = 1;
        typing = true;
        typeTitle();
    });

    window.addEventListener('blur', () => {
        isBlurred = true;
        document.title = blurTitle;
        clearTimeout(typingInterval);
    });

    typeTitle();
}


function showPerformanceInfo() {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('⚡ Tiempo de carga:', loadTime + 'ms');

        if (loadTime > 3000) {
            console.warn('⚠️ Carga lenta detectada');
        }
    }
}


const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let konamiIndex = 0;

window.konamiCode = {
    check: function (key) {
        if (key === konamiSequence[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiSequence.length) {
                this.activate();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    },

    activate: function () {
        analytics.track('easter_egg', { type: 'konami_code' });
        console.log('🎮 ¡CÓDIGO KONAMI ACTIVADO! ¡Eres un verdadero gamer!');

        document.body.style.animation = 'rainbow 2s infinite';

        const rainbowStyle = document.createElement('style');
        rainbowStyle.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(rainbowStyle);

        setTimeout(() => {
            document.body.style.animation = '';
            rainbowStyle.remove();
        }, 10000);
    }
};


function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {

        if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            showPerformanceInfo();
            console.log(window.getDavitoStats());
            analytics.track('keyboard_shortcut', { action: 'show_stats' });
        }

        window.konamiCode.check(e.code);

        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            const debugMode = !window.debugMode;
            window.debugMode = debugMode;
            if (debugMode) {
                console.log('🐛 Debug mode ON');
            } else {
                console.log('🐛 Debug mode OFF');
            }
            analytics.track('debug_mode_toggle', { enabled: debugMode });
        }
    });
}


// Service Worker registration is handled in main.js — removed duplicate here


function setupErrorTracking() {
    window.addEventListener('error', function (e) {
        analytics.track('javascript_error', {
            message: e.message,
            filename: e.filename,
            line: e.lineno
        });
        console.error('❌ Error JavaScript registrado:', e.message);
    });

    let pageStartTime = Date.now();
    window.addEventListener('beforeunload', function () {
        const timeOnPage = Date.now() - pageStartTime;
        analytics.track('page_unload', {
            timeOnPage: timeOnPage,
            totalEvents: analytics.events.length
        });
    });
}


window.getDavitoStats = () => {
    const report = analytics.getReport();
    console.group('📊 Estadísticas de davito.es');
    console.log('🚀 Eventos totales:', report.totalEvents);
    console.log('⏱️ Duración de sesión:', Math.round(report.sessionDuration / 1000), 'segundos');
    console.log('🔥 Top eventos:', report.topEvents);
    console.log('📝 Últimos eventos:', report.lastEvents);
    console.groupEnd();
    return report;
};


// --- Splash Screen ---
function dismissSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.classList.add('hidden');
        setTimeout(() => splash.remove(), 700);
    }
}

// --- Scroll Progress Bar ---
function setupScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = scrollPercent + '%';
    }, { passive: true });
}

function initializeFeatures() {
    console.log('🚀 Inicializando funcionalidades adicionales...');

    try {
        ['spotify_token', 'spotifyToken', 'spotify_refresh', 'spotify_cache',
         'sp_dc', 'sp_key', 'SPOTIFY_CONFIG', 'spotify-widget'].forEach((key) => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
        document.cookie.split(';').forEach((cookie) => {
            const name = cookie.split('=')[0].trim();
            if (/spotify|sp_dc|sp_key/i.test(name)) {
                document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax';
            }
        });
    } catch (e) { /* ignore storage errors */ }

    updateConnectionStatus();
    createFloatingParticles();
    setupLazyLoading();
    enhanceSoundEffects();
    initTitleAnimation();
    setupKeyboardShortcuts();
    setupErrorTracking();
    setupScrollProgress();

    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    // Dismiss splash screen after content is ready
    setTimeout(dismissSplashScreen, 1500);

    setTimeout(() => {
        console.log('🚀 ¡Bienvenido a davito.es!');
        analytics.track('page_load', {
            loadTime: performance.now(),
            userAgent: navigator.userAgent.substring(0, 50)
        });
    }, 1000);

    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 3000);

    console.log('💡 Tip: Escribe getDavitoStats() en la consola para ver estadísticas');
}

window.analytics = analytics;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFeatures);
} else {
    initializeFeatures();
}

console.log('✅ Funcionalidades adicionales cargadas');
