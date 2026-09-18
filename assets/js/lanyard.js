const DISCORD_ID = "600041740124160011";
const LANYARD_WS = "wss://api.lanyard.rest/socket";

const elements = {
    profile: document.getElementById('lanyard-profile'),
    toggle: document.getElementById('lanyard-toggle'),
    icon: document.getElementById('lanyard-toggle-icon'),
    content: document.getElementById('lanyard-content'),
    avatar: document.getElementById('lanyard-avatar'),
    statusDot: document.getElementById('lanyard-status-dot'),
    name: document.getElementById('lanyard-name'),
    activity: document.getElementById('lanyard-activity'),
    historyContainer: document.getElementById('games-history-container')
};

let isExpanded = false;
let currentLanyardData = null;
let activityTimerInterval = null;

function setupLanyardToggle() {
    if (!elements.toggle || !elements.content) return;

    elements.toggle.addEventListener('click', () => {
        isExpanded = !isExpanded;

        if (isExpanded) {
            elements.content.style.maxHeight = '150px';
            elements.content.style.marginTop = '10px';
            elements.content.style.opacity = '1';
            elements.icon.style.transform = 'rotate(180deg)';
            elements.toggle.style.background = 'rgba(255, 255, 255, 0.1)';
        } else {
            elements.content.style.maxHeight = '0';
            elements.content.style.marginTop = '0';
            elements.content.style.opacity = '0';
            elements.icon.style.transform = 'rotate(0deg)';
            elements.toggle.style.background = 'rgba(0, 0, 0, 0.4)';
        }
    });
}

function connectLanyard() {
    // Only connect if the lanyard element exists on the page
    if (!elements.profile) return;

    setupLanyardToggle();

    const ws = new WebSocket(LANYARD_WS);

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.op === 1) { // Hello
            ws.send(JSON.stringify({
                op: 2,
                d: { subscribe_to_id: DISCORD_ID }
            }));

            setInterval(() => {
                ws.send(JSON.stringify({ op: 3 })); // Heartbeat
            }, message.d.heartbeat_interval);
        }

        if (message.op === 0 && (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE")) {
            updateLanyardProfile(message.d);
        }
    };

    ws.onclose = () => {
        setTimeout(connectLanyard, 5000); // Auto-reconnect
    };
}

function updateLanyardProfile(data) {
    currentLanyardData = data;
    if (!elements.profile) return;

    // Show the profile container (which now just shows the toggle button at first)
    elements.profile.style.display = 'flex';

    // Avatar
    if (data.discord_user.avatar) {
        const avatarExt = data.discord_user.avatar.startsWith('a_') ? 'gif' : 'webp';
        elements.avatar.src = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${data.discord_user.avatar}.${avatarExt}?size=128`;
    } else {
        elements.avatar.src = `https://cdn.discordapp.com/embed/avatars/${parseInt(data.discord_user.discriminator) % 5}.png`;
    }

    elements.name.textContent = data.discord_user.global_name || data.discord_user.username;

    // Status Dot Colors
    const statusColors = {
        online: '#23a559',
        idle: '#f0b232',
        dnd: '#f23f43',
        offline: '#80848e'
    };
    elements.statusDot.style.backgroundColor = statusColors[data.discord_status] || statusColors.offline;

    // Custom Status / Activity
    let activityText = 'Offline';

    if (data.listening_to_spotify) {
        activityText = `🎵 Escuchando ${data.spotify.song} por ${data.spotify.artist}`;
    } else if (data.activities && data.activities.length > 0) {
        // Priority: Playing (type 0) > Custom Status (type 4)
        const playing = data.activities.find(a => a.type === 0);
        const custom = data.activities.find(a => a.type === 4);

        if (playing) {
            activityText = `🎮 Jugando a ${playing.name}`;
            if (playing.state) activityText += ` - ${playing.state}`;
        } else if (custom && custom.state) {
            activityText = `${custom.emoji && custom.emoji.name ? custom.emoji.name + ' ' : ''}${custom.state}`;
        } else {
            activityText = data.discord_status === 'dnd' ? 'Ocupado' : data.discord_status === 'idle' ? 'Ausente' : 'Conectado a Discord';
        }
    } else {
        activityText = data.discord_status === 'dnd' ? 'Ocupado' : data.discord_status === 'idle' ? 'Ausente' : data.discord_status === 'online' ? 'Conectado a Discord' : 'Desconectado';
    }

    elements.activity.textContent = activityText;

    // Update the Discord Activity Card
    updateActivitiesList(data);
}

function updateActivitiesList(data) {
    const container = document.getElementById('discord-activities-container');
    if (!container) return;

    const activities = data.activities || [];
    // Filter out Custom Status (type 4)
    const visibleActivities = activities.filter(a => a.type !== 4);

    if (visibleActivities.length === 0) {
        container.innerHTML = `
            <div class="activity-empty">
                <i class="fas fa-moon" style="font-size: 2rem; color: rgba(255,255,255,0.2); margin-bottom: 10px;"></i>
                <p>No estoy jugando a nada ahora mismo.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = visibleActivities.map(activity => {
        let iconUrl = '';
        if (activity.id === 'spotify:1') {
            iconUrl = data.spotify ? data.spotify.album_art_url : 'https://cdn.discordapp.com/embed/avatars/0.png';
        } else if (activity.assets && activity.assets.large_image) {
            if (activity.assets.large_image.startsWith('mp:external/')) {
                iconUrl = `https://media.discordapp.net/external/${activity.assets.large_image.replace('mp:external/', '')}`;
            } else {
                iconUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
            }
        } else {
            // Fallback icon
            iconUrl = `https://cdn.discordapp.com/embed/avatars/${parseInt(data.discord_user.discriminator || '0') % 5}.png`;
        }

        let timeString = '';
        if (activity.timestamps && activity.timestamps.start) {
            const start = new Date(activity.timestamps.start);
            const now = new Date();
            const diff = now - start;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            timeString = `Lleva ${hours > 0 ? hours + 'h ' : ''}${minutes}m`;
        } else if (activity.id === 'spotify:1') {
            timeString = 'Escuchando en Spotify';
        }

        return `
            <div class="activity-item">
                <img src="${iconUrl}" alt="${activity.name}" class="activity-icon" onerror="this.src='/media/favicon-32x32.webp'">
                <div class="activity-details">
                    <div class="activity-name">${activity.name}</div>
                    ${activity.details ? `<div class="activity-state">${activity.details}</div>` : ''}
                    ${activity.state ? `<div class="activity-state">${activity.state}</div>` : ''}
                    ${timeString ? `<div class="activity-time"><i class="far fa-clock"></i> ${timeString}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');

    // Setup timer to update the elapsed time without needing a websocket update
    if (!activityTimerInterval) {
        activityTimerInterval = setInterval(() => {
            if (currentLanyardData) updateActivitiesList(currentLanyardData);
        }, 60000); // Update every minute
    }
}

async function loadGamesHistory() {
    if (!elements.historyContainer) return;

    try {
        const response = await fetch('/data/games_history.json?t=' + new Date().getTime());
        if (!response.ok) throw new Error('Failed to load history');
        
        const historyObj = await response.json();
        const games = Object.values(historyObj);
        
        if (games.length === 0) {
            elements.historyContainer.innerHTML = `
                <div class="activity-empty">
                    <i class="fas fa-history" style="font-size: 2rem; color: rgba(255,255,255,0.2); margin-bottom: 10px;"></i>
                    <p>Aún no hay historial de juegos registrado.</p>
                </div>
            `;
            return;
        }

        // Sort by last played DESC
        games.sort((a, b) => b.last_played - a.last_played);

        elements.historyContainer.innerHTML = games.map(game => {
            const hours = Math.floor(game.total_minutes / 60);
            const minutes = game.total_minutes % 60;
            const timeString = `${hours > 0 ? hours + 'h ' : ''}${minutes}m totales`;
            
            // Format last played date
            const lastPlayed = new Date(game.last_played * 1000);
            const now = new Date();
            const isToday = lastPlayed.getDate() === now.getDate() && lastPlayed.getMonth() === now.getMonth() && lastPlayed.getFullYear() === now.getFullYear();
            const dateString = isToday ? 'Hoy' : lastPlayed.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

            return `
                <div class="activity-item">
                    <img src="${game.icon}" alt="${game.name}" class="activity-icon" onerror="this.src='/media/favicon-32x32.webp'">
                    <div class="activity-details">
                        <div class="activity-name">${game.name}</div>
                        <div class="activity-state">Última vez: ${dateString}</div>
                        <div class="activity-time"><i class="far fa-clock"></i> ${timeString}</div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error("Error loading games history", e);
        elements.historyContainer.innerHTML = `
            <div class="activity-empty">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: rgba(255,255,255,0.2); margin-bottom: 10px;"></i>
                <p>No se pudo cargar el historial.</p>
            </div>
        `;
    }
}

function setupActivityTabs() {
    const tabs = document.querySelectorAll('.activity-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.activity-pane').forEach(p => p.style.display = 'none');
            
            // Add active to clicked
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).style.display = 'block';
            
            // Load history if clicked
            if (targetId === 'recent-games') {
                loadGamesHistory();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    connectLanyard();
    setupActivityTabs();
});
