// assets/js/audio-player.js - Reproductor de audio (YouTube)
console.log('🎧 Cargando módulo de audio player...');

let audioPlayer = new Audio();
let currentPlayingTrack = null;
let isPlaying = false;
let audioEndedCallback = null; // Callback para cuando la canción termina

// Función para buscar la URL de audio de Invidious
async function fetchAudioUrl(trackName, artistName) {
    const searchQuery = `${trackName} ${artistName} official audio`;
    console.log(`🔍 Buscando URL de audio para: "${searchQuery}"`);
    try {
        const response = await fetch(`./api/youtube-search.php?q=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.audioUrl) {
            console.log('✅ URL de audio encontrada:', data.audioUrl);
            return data.audioUrl;
        } else {
            console.warn('⚠️ No se encontró URL de audio:', data.message || 'Error desconocido');
            return null;
        }
    } catch (error) {
        console.error('❌ Error al buscar URL de audio:', error);
        return null;
    }
}

// Función para reproducir una canción
async function playTrack(trackName, artistName, onEndedCallback) {
    if (isPlaying) {
        audioPlayer.pause();
        audioPlayer.src = ''; // Limpiar la fuente para evitar errores
        isPlaying = false;
    }

    audioEndedCallback = onEndedCallback;

    const audioUrl = await fetchAudioUrl(trackName, artistName);

    if (audioUrl) {
        audioPlayer.src = audioUrl;
        audioPlayer.load(); // Cargar el audio
        try {
            await audioPlayer.play();
            isPlaying = true;
            currentPlayingTrack = { trackName, artistName };
            console.log(`▶️ Reproduciendo: ${trackName} - ${artistName}`);
        } catch (error) {
            console.error('❌ Error al intentar reproducir el audio:', error);
            // Esto suele ocurrir por políticas de autoplay del navegador si no hay interacción
            alert('El navegador bloqueó la reproducción automática. Por favor, interactúa con la página para iniciar la música.');
            isPlaying = false;
        }
    } else {
        console.warn('Skipping playback: No audio URL available.');
        if (audioEndedCallback) {
            audioEndedCallback(); // Llamar al callback para intentar la siguiente canción
        }
    }
}

// Evento cuando la canción termina
audioPlayer.addEventListener('ended', () => {
    console.log('🎧 Canción terminada.');
    isPlaying = false;
    currentPlayingTrack = null;
    if (audioEndedCallback) {
        audioEndedCallback(); // Llamar al callback para buscar la siguiente canción
    }
});

// Evento de error del audio
audioPlayer.addEventListener('error', (e) => {
    console.error('❌ Error en el reproductor de audio:', e);
    isPlaying = false;
    currentPlayingTrack = null;
    if (audioEndedCallback) {
        audioEndedCallback(); // Intentar la siguiente canción si hay un error
    }
});

// Función para pausar la reproducción
function pauseAudio() {
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        console.log('⏸️ Audio pausado.');
    }
}

// Función para reanudar la reproducción
function resumeAudio() {
    if (!isPlaying && audioPlayer.src) {
        audioPlayer.play()
            .then(() => {
                isPlaying = true;
                console.log('▶️ Audio reanudado.');
            })
            .catch(error => {
                console.error('❌ Error al reanudar el audio:', error);
            });
    }
}

// Función para obtener el estado actual del reproductor
function getAudioPlayerState() {
    return {
        isPlaying: isPlaying,
        currentTrack: currentPlayingTrack,
        currentTime: audioPlayer.currentTime,
        duration: audioPlayer.duration
    };
}

// Exponer funciones globalmente
window.AudioPlayer = {
    playTrack,
    pauseAudio,
    resumeAudio,
    getAudioPlayerState
};

console.log('✅ Módulo de audio player cargado.');
