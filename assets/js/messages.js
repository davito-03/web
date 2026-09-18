// messages.js - Funcionalidad para la página de mensajes

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('review-form');
    const thankYouMessage = document.getElementById('form-thank-you');
    const reviewsList = document.getElementById('reviews-list');
    
    // Cargar mensajes existentes
    loadMessages();
    
    // Configurar envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const message = document.getElementById('message').value.trim();
        const rating = document.querySelector('input[name="rating"]:checked')?.value || null;
        
        if (username && message) {
            saveMessage(username, message, rating);
            showThankYou();
            form.reset();
            loadMessages();
        }
    });
    
    function saveMessage(username, message, rating) {
        const messages = getStoredMessages();
        const newMessage = {
            id: Date.now(),
            username: sanitizeInput(username),
            message: sanitizeInput(message),
            rating: rating ? parseInt(rating) : null,
            timestamp: new Date().toISOString(),
            approved: true // Auto-aprobar por ahora
        };
        
        messages.unshift(newMessage); // Añadir al principio
        
        // Mantener solo los últimos 50 mensajes
        if (messages.length > 50) {
            messages.splice(50);
        }
        
        localStorage.setItem('user_messages', JSON.stringify(messages));
    }
    
    function getStoredMessages() {
        try {
            return JSON.parse(localStorage.getItem('user_messages')) || [];
        } catch (error) {
            console.error('Error cargando mensajes:', error);
            return [];
        }
    }
    
    function loadMessages() {
        const messages = getStoredMessages();
        
        if (messages.length === 0) {
            reviewsList.innerHTML = `
                <div class="no-messages">
                    <p>¡Sé el primero en dejar un mensaje!</p>
                </div>
            `;
            return;
        }
        
        reviewsList.innerHTML = messages
            .filter(msg => msg.approved)
            .map(msg => createMessageHTML(msg))
            .join('');
    }
    
    function createMessageHTML(message) {
        const timeAgo = getTimeAgo(new Date(message.timestamp));
        const stars = message.rating ? generateStars(message.rating) : '';
        
        return `
            <div class="message-item">
                <div class="message-header">
                    <span class="message-author">${message.username}</span>
                    <span class="message-time">${timeAgo}</span>
                </div>
                ${stars ? `<div class="message-rating">${stars}</div>` : ''}
                <div class="message-content">${message.message}</div>
            </div>
        `;
    }
    
    function generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }
    
    function getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'ahora';
        if (minutes < 60) return `hace ${minutes}m`;
        if (hours < 24) return `hace ${hours}h`;
        if (days < 7) return `hace ${days}d`;
        
        return date.toLocaleDateString('es-ES');
    }
    
    function sanitizeInput(input) {
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .substring(0, 500); // Limitar longitud
    }
    
    function showThankYou() {
        thankYouMessage.style.display = 'block';
        setTimeout(() => {
            thankYouMessage.style.display = 'none';
        }, 3000);
    }
    
    // Agregar algunos mensajes de ejemplo si no hay ninguno
    function addSampleMessages() {
        const messages = getStoredMessages();
        if (messages.length === 0) {
            const sampleMessages = [
                {
                    id: 1,
                    username: "Visitante",
                    message: "¡Increíble página! Me encantan los juegos retro.",
                    rating: 5,
                    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
                    approved: true
                },
                {
                    id: 2,
                    username: "Gamer",
                    message: "El Tetris está genial, me recuerda a mi infancia.",
                    rating: 4,
                    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
                    approved: true
                },
                {
                    id: 3,
                    username: "Desarrollador",
                    message: "Buen trabajo con el diseño retro. ¡Sigue así!",
                    rating: null,
                    timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 días atrás
                    approved: true
                }
            ];
            
            localStorage.setItem('user_messages', JSON.stringify(sampleMessages));
        }
    }
    
    // Inicializar con mensajes de ejemplo si es necesario
    addSampleMessages();
    
    console.log('✅ Sistema de mensajes inicializado');
});

// Funciones de administración (para uso en consola)
window.MessageAdmin = {
    clearMessages: function() {
        localStorage.removeItem('user_messages');
        document.getElementById('reviews-list').innerHTML = '<div class="no-messages"><p>¡Sé el primero en dejar un mensaje!</p></div>';
        console.log('Mensajes eliminados');
    },
    
    exportMessages: function() {
        const messages = JSON.parse(localStorage.getItem('user_messages') || '[]');
        const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `messages_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('Mensajes exportados');
    },
    
    getStats: function() {
        const messages = JSON.parse(localStorage.getItem('user_messages') || '[]');
        const stats = {
            total: messages.length,
            withRating: messages.filter(m => m.rating).length,
            averageRating: messages.filter(m => m.rating).reduce((sum, m) => sum + m.rating, 0) / messages.filter(m => m.rating).length || 0
        };
        console.log('Estadísticas de mensajes:', stats);
        return stats;
    }
};
