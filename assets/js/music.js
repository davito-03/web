

class MusicManager {
    constructor() {
        this.isEnabled = localStorage.getItem('music_enabled') !== 'false';
        this.volume = parseFloat(localStorage.getItem('music_volume')) || 0.3;
        this.backgroundMusic = null;
        this.currentTrack = null;
        this.playlist = [];
        this.isPlaying = false;
        this.isMuted = localStorage.getItem('music_muted') === 'true';
        
        this.init();
    }
    
    init() {
        this.createControls();
        this.setupEventListeners();

        if (this.isEnabled) {
            this.loadPlaylist();
        }
        
        console.log('🎵 Music Manager inicializado');
    }
    
    createControls() {

        const controls = document.createElement('div');
        controls.id = 'music-controls';
        controls.innerHTML = `
            <div class="music-control-panel">
                <button id="music-toggle" class="music-btn" title="Play/Pause">
                    <i class="fas fa-play"></i>
                </button>
                <button id="music-next" class="music-btn" title="Siguiente">
                    <i class="fas fa-forward"></i>
                </button>
                <button id="music-mute" class="music-btn" title="Silenciar">
                    <i class="fas ${this.isMuted ? 'fa-volume-mute' : 'fa-volume-up'}"></i>
                </button>
                <input type="range" id="volume-slider" min="0" max="1" step="0.1" value="${this.volume}">
                <div id="track-info" class="track-info">
                    <span id="track-name">Sin música</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(controls);

        const styles = document.createElement('style');
        styles.textContent = `
            #music-controls {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(26, 26, 46, 0.9);
                border: 1px solid #333;
                border-radius: 8px;
                padding: 10px;
                z-index: 1000;
                backdrop-filter: blur(10px);
                min-width: 200px;
            }
            
            .music-control-panel {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .music-controls-row {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .music-btn {
                background: #333;
                border: 1px solid #555;
                color: #fff;
                width: 30px;
                height: 30px;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s;
            }
            
            .music-btn:hover {
                background: #555;
            }
            
            .music-btn.active {
                background: #00ff88;
                color: #000;
            }
            
            #volume-slider {
                flex: 1;
                height: 4px;
                background: #333;
                outline: none;
                border-radius: 2px;
            }
            
            #volume-slider::-webkit-slider-thumb {
                appearance: none;
                width: 12px;
                height: 12px;
                background: #00ff88;
                border-radius: 50%;
                cursor: pointer;
            }
            
            .track-info {
                font-size: 11px;
                color: #ccc;
                text-align: center;
                max-width: 180px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            @media (max-width: 768px) {
                #music-controls {
                    bottom: 10px;
                    right: 10px;
                    min-width: 150px;
                    padding: 8px;
                }
                
                .music-btn {
                    width: 25px;
                    height: 25px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    setupEventListeners() {
        const toggleBtn = document.getElementById('music-toggle');
        const nextBtn = document.getElementById('music-next');
        const muteBtn = document.getElementById('music-mute');
        const volumeSlider = document.getElementById('volume-slider');
        
        toggleBtn.addEventListener('click', () => this.toggle());
        nextBtn.addEventListener('click', () => this.nextTrack());
        muteBtn.addEventListener('click', () => this.toggleMute());
        volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
    }
    
    loadPlaylist() {

        this.playlist = [
            {
                name: "Ambient Space",
                url: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3"
            },
            {
                name: "Cyber Vibes",
                url: "https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3"
            },
            {
                name: "Digital Dreams",
                url: "https://assets.mixkit.co/music/preview/mixkit-games-worldbeat-466.mp3"
            }
        ];
        
        if (this.playlist.length > 0) {
            this.loadTrack(0);
        }
    }
    
    loadTrack(index) {
        if (index >= this.playlist.length) index = 0;
        
        const track = this.playlist[index];
        if (!track) return;
        
        this.currentTrack = index;
        
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
        
        this.backgroundMusic = new Audio(track.url);
        this.backgroundMusic.volume = this.isMuted ? 0 : this.volume;
        this.backgroundMusic.loop = false;

        this.backgroundMusic.addEventListener('ended', () => {
            this.nextTrack();
        });

        this.backgroundMusic.addEventListener('error', () => {
            console.warn('Error cargando track:', track.name);
            this.nextTrack();
        });
        
        document.getElementById('track-name').textContent = track.name;
    }
    
    play() {
        if (!this.backgroundMusic) {
            this.loadPlaylist();
            return;
        }
        
        this.backgroundMusic.play().then(() => {
            this.isPlaying = true;
            this.updateControls();
        }).catch(error => {
            console.warn('Error reproduciendo música:', error);
        });
    }
    
    pause() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.isPlaying = false;
            this.updateControls();
        }
    }
    
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    nextTrack() {
        const nextIndex = (this.currentTrack + 1) % this.playlist.length;
        this.loadTrack(nextIndex);
        
        if (this.isPlaying) {
            this.play();
        }
    }
    
    setVolume(volume) {
        this.volume = parseFloat(volume);
        localStorage.setItem('music_volume', this.volume);
        
        if (this.backgroundMusic && !this.isMuted) {
            this.backgroundMusic.volume = this.volume;
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('music_muted', this.isMuted);
        
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.isMuted ? 0 : this.volume;
        }
        
        this.updateControls();
    }
    
    updateControls() {
        const toggleBtn = document.getElementById('music-toggle');
        const muteBtn = document.getElementById('music-mute');
        
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
            toggleBtn.classList.toggle('active', this.isPlaying);
        }
        
        if (muteBtn) {
            const icon = muteBtn.querySelector('i');
            icon.className = this.isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
        }
    }

    playTone(freq, duration = 0.08, type = 'sine', vol = 0.1) {
        if (this.isMuted) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            if (!this.audioCtx) this.audioCtx = new AudioCtx();
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(vol * this.volume, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(now);
            osc.stop(now + duration + 0.01);
        } catch (e) {}
    }

    playSound(soundUrl, volume = 0.5) {
        if (this.isMuted) return;
        const audio = new Audio(soundUrl);
        audio.volume = volume * this.volume;
        audio.play().catch(() => {});
    }

    playHoverSound() {
        this.playTone(800, 0.04, 'sine', 0.05);
    }
    
    playClickSound() {
        this.playTone(500, 0.06, 'triangle', 0.1);
    }
    
    playSuccessSound() {
        this.playTone(587.33, 0.1, 'sine', 0.15);
        setTimeout(() => this.playTone(880, 0.2, 'sine', 0.15), 100);
    }
    
    playErrorSound() {
        this.playTone(250, 0.15, 'sawtooth', 0.1);
    }
}

let musicManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        musicManager = new MusicManager();
    });
} else {
    musicManager = new MusicManager();
}

window.MusicManager = musicManager;

document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('button, .social-button, .game-button').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            if (musicManager) musicManager.playHoverSound();
        });
        
        btn.addEventListener('click', () => {
            if (musicManager) musicManager.playClickSound();
        });
    });
    
    console.log('🔊 Efectos de sonido configurados');
});

window.playSound = {
    hover: () => musicManager?.playHoverSound(),
    click: () => musicManager?.playClickSound(),
    success: () => musicManager?.playSuccessSound(),
    error: () => musicManager?.playErrorSound(),
    custom: (url, volume) => musicManager?.playSound(url, volume)
};




