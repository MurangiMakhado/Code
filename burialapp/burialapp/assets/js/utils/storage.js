/**
 * LocalStorage Management Utility
 * Handles all localStorage operations for the application
 *
 * @author TSHILAPFENE BURIAL SOCIETY
 * @description Provides a clean interface for localStorage operations with error handling
 */

// ============================================================================
// STORAGE OPERATIONS
// ============================================================================

/**
 * Get item from localStorage and parse as JSON
 *
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {*} Parsed value or default value
 *
 * @example
 * const members = getFromStorage('members', []);
 * const userData = getFromStorage('userData', null);
 */
function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage (key: ${key}):`, error);
        return defaultValue;
    }
}

/**
 * Save item to localStorage as JSON string
 *
 * @param {string} key - The localStorage key
 * @param {*} value - Value to store (will be JSON.stringify'd)
 * @returns {boolean} True if successful, false if failed
 *
 * @example
 * saveToStorage('members', membersArray);
 * saveToStorage('userData', userObject);
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error saving to localStorage (key: ${key}):`, error);
        return false;
    }
}

/**
 * Remove item from localStorage
 *
 * @param {string} key - The localStorage key to remove
 * @returns {boolean} True if successful, false if failed
 *
 * @example
 * removeFromStorage('tempData');
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from localStorage (key: ${key}):`, error);
        return false;
    }
}

/**
 * Clear all items from localStorage
 * Use with caution!
 *
 * @returns {boolean} True if successful, false if failed
 *
 * @example
 * clearAllStorage(); // Clears everything
 */
function clearAllStorage() {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
}

/**
 * Check if a key exists in localStorage
 *
 * @param {string} key - The localStorage key to check
 * @returns {boolean} True if key exists, false otherwise
 *
 * @example
 * if (storageHasKey('authToken')) {
 *     // User is logged in
 * }
 */
function storageHasKey(key) {
    return localStorage.getItem(key) !== null;
}

// ============================================================================
// SPECIFIC DATA OPERATIONS
// ============================================================================

/**
 * Get members array from localStorage
 *
 * @returns {Array} Array of member objects
 *
 * @example
 * const members = getMembers();
 */
function getMembers() {
    return getFromStorage('members', []);
}

/**
 * Save members array to localStorage
 * Automatically sorts members by member number before saving
 *
 * @param {Array} members - Array of member objects
 * @returns {boolean} True if successful, false if failed
 *
 * @example
 * saveMembers(updatedMembersArray);
 */
function saveMembers(members) {
    if (!Array.isArray(members)) {
        console.error('saveMembers: Expected array, got', typeof members);
        return false;
    }

    // Sort members by member number before saving
    const sortedMembers = [...members].sort((a, b) => {
        const numA = parseInt(a.member_number || a.memberNumber) || 0;
        const numB = parseInt(b.member_number || b.memberNumber) || 0;
        return numA - numB;
    });

    return saveToStorage('members', sortedMembers);
}

/**
 * Get authentication token from localStorage
 *
 * @returns {string|null} Auth token or null if not found
 *
 * @example
 * const token = getAuthToken();
 */
function getAuthToken() {
    return localStorage.getItem('authToken');
}

/**
 * Save authentication token to localStorage
 *
 * @param {string} token - Authentication token
 * @returns {boolean} True if successful, false if failed
 *
 * @example
 * saveAuthToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 */
function saveAuthToken(token) {
    try {
        localStorage.setItem('authToken', token);
        return true;
    } catch (error) {
        console.error('Error saving auth token:', error);
        return false;
    }
}

/**
 * Get user data from localStorage
 *
 * @returns {Object|null} User data object or null if not found
 *
 * @example
 * const user = getUserData();
 * if (user) {
 *     console.log(user.id, user.name);
 * }
 */
function getUserData() {
    return getFromStorage('userData', null);
}

/**
 * Save user data to localStorage
 *
 * @param {Object} userData - User data object
 * @returns {boolean} True if successful, false if failed
 *
 * @example
 * saveUserData({ id: 1, name: 'John Doe', email: 'john@example.com' });
 */
function saveUserData(userData) {
    return saveToStorage('userData', userData);
}

/**
 * Clear authentication data (token and user data)
 * Used during logout
 *
 * @returns {boolean} True if successful, false if failed
 *
 * @example
 * clearAuthData();
 * window.location.href = '/login.html';
 */
function clearAuthData() {
    try {
        removeFromStorage('authToken');
        removeFromStorage('userData');
        return true;
    } catch (error) {
        console.error('Error clearing auth data:', error);
        return false;
    }
}

/**
 * Update a specific member in localStorage
 *
 * @param {number} index - Index of member in array
 * @param {Object} updatedMember - Updated member object
 * @returns {boolean} True if successful, false if failed
 *
 * @example
 * updateMemberAtIndex(5, updatedMemberData);
 */
function updateMemberAtIndex(index, updatedMember) {
    const members = getMembers();

    if (index < 0 || index >= members.length) {
        console.error(`Invalid member index: ${index}`);
        return false;
    }

    members[index] = updatedMember;
    return saveMembers(members);
}

/**
 * Delete a member from localStorage by index
 *
 * @param {number} index - Index of member to delete
 * @returns {boolean} True if successful, false if failed
 *
 * @example
 * deleteMemberAtIndex(5);
 */
function deleteMemberAtIndex(index) {
    const members = getMembers();

    if (index < 0 || index >= members.length) {
        console.error(`Invalid member index: ${index}`);
        return false;
    }

    members.splice(index, 1);
    return saveMembers(members);
}

/**
 * Add a new member to localStorage
 *
 * @param {Object} newMember - New member object to add
 * @returns {boolean} True if successful, false if failed
 *
 * @example
 * addMember({ id: 10, name: 'Jane Doe', ... });
 */
function addMember(newMember) {
    const members = getMembers();
    members.push(newMember);
    return saveMembers(members);
}

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        // Generic storage operations
        getFromStorage,
        saveToStorage,
        removeFromStorage,
        clearAllStorage,
        storageHasKey,
        // Specific data operations
        getMembers,
        saveMembers,
        getAuthToken,
        saveAuthToken,
        getUserData,
        saveUserData,
        clearAuthData,
        updateMemberAtIndex,
        deleteMemberAtIndex,
        addMember
    };
}
