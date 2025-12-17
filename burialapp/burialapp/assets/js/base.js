/**
 * Base configuration and library loader
 * Include this file first in all HTML pages to ensure common libraries are available
 */

// Check if axios is loaded
if (typeof axios === 'undefined') {
    console.error('Axios is not loaded! Make sure to include axios CDN in your HTML.');
}

// Global API configuration
const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:8000/api/',
    TIMEOUT: 30000,
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
}

console.log('Base libraries loaded successfully');
