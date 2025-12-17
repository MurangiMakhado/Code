/**
 * Utility Helper Functions
 * Common helper functions used throughout the application
 *
 * @author TSHILAPFENE BURIAL SOCIETY
 * @description Provides reusable utility functions for UI, validation, and data manipulation
 */

// ============================================================================
// UI HELPERS
// ============================================================================

/**
 * Display a toast notification message
 *
 * @param {string} message - The message to display
 * @param {string} [type='success'] - Toast type: 'success', 'error', 'warning', or 'info'
 * @param {number} [duration=3000] - Duration in milliseconds before toast disappears
 *
 * @example
 * showToast('Member added successfully!', 'success');
 * showToast('Error loading data', 'error');
 */
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.error('Toast element not found');
        return;
    }

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * Escape HTML special characters to prevent XSS attacks
 *
 * @param {string} str - The string to escape
 * @returns {string} The escaped string safe for HTML insertion
 *
 * @example
 * const safe = escHtml('<script>alert("xss")</script>');
 * // Returns: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;
 */
function escHtml(str = '') {
    const htmlEscapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    return String(str).replace(/[&<>"']/g, char => htmlEscapeMap[char]);
}

/**
 * Show a modal by ID
 *
 * @param {string} modalId - The ID of the modal element
 *
 * @example
 * showModal('editMemberModal');
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    } else {
        console.error(`Modal with ID "${modalId}" not found`);
    }
}

/**
 * Hide a modal by ID
 *
 * @param {string} modalId - The ID of the modal element
 *
 * @example
 * hideModal('editMemberModal');
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    } else {
        console.error(`Modal with ID "${modalId}" not found`);
    }
}

/**
 * Clear all input fields in a form
 *
 * @param {string[]} fieldIds - Array of field IDs to clear
 *
 * @example
 * clearFormFields(['name', 'email', 'phone']);
 */
function clearFormFields(fieldIds) {
    fieldIds.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = '';
        }
    });
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate that required fields are not empty
 *
 * @param {Object} fields - Object with field names as keys and values as values
 * @returns {boolean} True if all fields have values, false otherwise
 *
 * @example
 * const isValid = validateRequiredFields({
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     phone: ''
 * });
 * // Returns: false (phone is empty)
 */
function validateRequiredFields(fields) {
    return Object.values(fields).every(value => {
        if (typeof value === 'string') {
            return value.trim() !== '';
        }
        return value != null && value !== '';
    });
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
    try {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 *
 * @returns {boolean} True if user has auth token, false otherwise
 *
 * @example
 * if (!isAuthenticated()) {
 *     window.location.href = '/login.html';
 * }
 */
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return token != null && token !== '';
}

// ============================================================================
// DATA HELPERS
// ============================================================================

/**
 * Generate a new member number based on existing members
 *
 * @param {Array} members - Array of member objects
 * @returns {string} New member number (padded with zeros)
 *
 * @example
 * const newNumber = generateMemberNumber(members);
 * // Returns: "042" if highest existing number is 41
 */
function generateMemberNumber(members) {
    if (!Array.isArray(members) || members.length === 0) {
        return '001';
    }

    const maxNum = members.reduce((max, member) => {
        const num = parseInt(member.member_number || member.memberNumber) || 0;
        return Math.max(max, num);
    }, 0);

    return String(maxNum + 1).padStart(3, '0');
}

/**
 * Normalize field name from camelCase to snake_case or vice versa
 *
 * @param {Object} obj - Object to normalize
 * @param {Object} fieldMap - Field mapping object
 * @returns {Object} Normalized object
 *
 * @example
 * const normalized = normalizeFields(
 *     { userId: 1, memberNumber: '001' },
 *     { userId: 'user_id', memberNumber: 'member_number' }
 * );
 * // Returns: { user_id: 1, member_number: '001' }
 */
function normalizeFields(obj, fieldMap) {
    const normalized = {};

    Object.keys(fieldMap).forEach(camelKey => {
        const snakeKey = fieldMap[camelKey];
        // Check both camelCase and snake_case versions
        normalized[snakeKey] = obj[camelKey] || obj[snakeKey];
    });

    return normalized;
}

/**
 * Get value from object with fallback to alternative key name
 * Handles both camelCase and snake_case field names
 *
 * @param {Object} obj - The object to get value from
 * @param {string} primaryKey - Primary key to check (snake_case)
 * @param {string} fallbackKey - Fallback key to check (camelCase)
 * @param {*} defaultValue - Default value if neither key exists
 * @returns {*} The value found or default value
 *
 * @example
 * const idNumber = getFieldValue(member, 'id_number', 'idNumber', 'N/A');
 */
function getFieldValue(obj, primaryKey, fallbackKey, defaultValue = '') {
    return obj[primaryKey] || obj[fallbackKey] || defaultValue;
}

/**
 * Sort members array by member number
 *
 * @param {Array} members - Array of member objects to sort
 * @returns {Array} Sorted array of members
 *
 * @example
 * const sorted = sortMembersByNumber(members);
 */
function sortMembersByNumber(members) {
    return [...members].sort((a, b) => {
        const numA = parseInt(a.member_number || a.memberNumber) || 0;
        const numB = parseInt(b.member_number || b.memberNumber) || 0;
        return numA - numB;
    });
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 *
 * @param {Date|string} [date] - Date to format (defaults to today)
 * @returns {string} ISO formatted date string
 *
 * @example
 * const today = formatDateISO();
 * const specific = formatDateISO(new Date('2024-01-15'));
 */
function formatDateISO(date) {
    const dateObj = date ? new Date(date) : new Date();
    return dateObj.toISOString().split('T')[0];
}

/**
 * Debounce function to limit how often a function can fire
 *
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 *
 * @example
 * const debouncedSearch = debounce((query) => {
 *     searchMembers(query);
 * }, 300);
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================================================
// LOGGING HELPERS
// ============================================================================

/**
 * Log API response for debugging
 *
 * @param {string} operation - Name of the operation (e.g., 'Creating member')
 * @param {*} data - Data to log
 *
 * @example
 * logDebug('Creating member', memberData);
 */
function logDebug(operation, data) {
    if (console && console.log) {
        console.log(`[${operation}]`, data);
    }
}

/**
 * Log error with context
 *
 * @param {string} operation - Name of the operation that failed
 * @param {Error} error - Error object
 *
 * @example
 * logError('Loading members', error);
 */
function logError(operation, error) {
    if (console && console.error) {
        console.error(`[Error: ${operation}]`, error);
    }
}

// Export all functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        showToast,
        escHtml,
        showModal,
        hideModal,
        clearFormFields,
        validateRequiredFields,
        getUserData,
        isAuthenticated,
        generateMemberNumber,
        normalizeFields,
        getFieldValue,
        sortMembersByNumber,
        formatDateISO,
        debounce,
        logDebug,
        logError
    };
}
