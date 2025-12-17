// auth.js - User Authentication Module

const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

// 1. Check if AuthToken Exists
function isLoggedIn() {
    const token = getAuthToken();
    return token !== null && token !== undefined && token !== '';
}

// 2. Get authentication token from localStorage
function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

// 3. Get user data from localStorage
function getUserData() {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
}

// 4. Login function - Store user info and token
function loginUser(token, userData) {
    if (!token) {
        console.error('No token provided for login');
        return false;
    }
    
    // Store token
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    
    // Store user data
    if (userData) {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    }
    
    console.log('User logged in successfully');
    return true;
}

// 5. Logout function - Clear session
function logoutUser() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    console.log('User logged out successfully');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// 6. Clear all auth data (for cleanup)
function clearAuthData() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
}

// 7. Get authorization headers for API requests
function getAuthHeaders() {
    const token = getAuthToken();
    if (!token) {
        return {};
    }
    
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Export functions if using modules
// For now, they're globally available