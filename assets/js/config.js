/**
 * Global Configuration
 */
const CONFIG = {
    // Automatically select API URL based on current hostname
    API_BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8080/api'  // Local development
        : 'https://api.davito.es/api' // VPS Production Domain (SSL)
};

window.CONFIG = CONFIG;
