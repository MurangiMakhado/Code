/**
 * Members Module Main Orchestrator
 * Coordinates all member and beneficiary management functionality
 *
 * @author TSHILAPFENE BURIAL SOCIETY
 * @description Lightweight orchestrator that coordinates UI, Events, and API services
 *
 * Architecture:
 * - config/constants.js: All configuration and magic strings
 * - utils/helpers.js: Reusable utility functions
 * - utils/storage.js: LocalStorage operations
 * - services/memberService.js: Member API calls
 * - services/beneficiaryService.js: Beneficiary API calls
 * - modules/memberUI.js: Member rendering and DOM manipulation
 * - modules/memberEvents.js: Member event handlers
 * - modules/beneficiaryUI.js: Beneficiary rendering and DOM manipulation
 * - modules/beneficiaryEvents.js: Beneficiary event handlers
 * - members.js (this file): Main orchestrator
 */

// ============================================================================
// GLOBAL STATE
// ============================================================================

// Member data
let members = [];

// Member UI state
let currentMemberIndex = null;
let editIndex = -1;
let deleteIndex = null;

// Beneficiary UI state
let currentBeneficiaries = [];
let currentBeneficiaryIndex = null;
let deleteBeneficiaryId = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the members module
 * Called when DOM is ready
 */
async function initializeMembersModule() {
    try {
        logDebug('Initializing members module...');

        // Check authentication
        if (!isAuthenticated()) {
            logDebug('User not authenticated, redirecting to login');
            window.location.href = '/login.html';
            return;
        }

        // Load members from API
        logDebug('Loading members from API...');
        members = await fetchMembers(true);
        saveMembers(members);
        logDebug(`Loaded ${members.length} members`);

        // Render initial UI
        renderMembers();

        // Setup event listeners
        setupMemberEvents();
        setupBeneficiaryEvents();
        setupGlobalModalHandlers();

        logDebug('Members module initialized successfully');
    } catch (error) {
        logError('Initializing members module', error);
        showToast(ERROR_MESSAGES.LOADING_MEMBERS, TOAST_TYPES.ERROR);

        // Load from localStorage as fallback
        members = getMembers();
        renderMembers();
    }
}

// ============================================================================
// GLOBAL MODAL HANDLERS
// ============================================================================

/**
 * Setup global modal event handlers
 * Handles closing modals on escape key and click outside
 * @private
 */
function setupGlobalModalHandlers() {
    // Close modals when clicking outside
    window.onclick = function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                hideModal(modal.id);
            }
        });
    };

    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                hideModal(modal.id);
            });
        }
    });
}

// ============================================================================
// DOM READY HANDLER
// ============================================================================

/**
 * Main entry point - Initialize when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async function() {
    await initializeMembersModule();
});

// ============================================================================
// MODULE METADATA
// ============================================================================

/**
 * Get module information
 * Useful for debugging and version tracking
 *
 * @returns {Object} Module metadata
 */
function getModuleInfo() {
    return {
        name: 'Members Management Module',
        version: '2.0.0',
        author: 'TSHILAPFENE BURIAL SOCIETY',
        description: 'Refactored modular architecture for member and beneficiary management',
        architecture: {
            config: 'config/constants.js',
            utils: ['utils/helpers.js', 'utils/storage.js'],
            services: ['services/memberService.js', 'services/beneficiaryService.js'],
            ui: ['modules/memberUI.js', 'modules/beneficiaryUI.js'],
            events: ['modules/memberEvents.js', 'modules/beneficiaryEvents.js'],
            orchestrator: 'members.js'
        },
        state: {
            membersCount: members.length,
            currentMemberIndex,
            editIndex,
            deleteIndex,
            beneficiariesCount: currentBeneficiaries.length
        }
    };
}

// ============================================================================
// DEBUGGING UTILITIES
// ============================================================================

/**
 * Log module info to console (for debugging)
 * Can be called from browser console: logModuleInfo()
 */
window.logModuleInfo = function() {
    const info = getModuleInfo();
    console.log('%c=== Members Module Info ===', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
    console.log('Name:', info.name);
    console.log('Version:', info.version);
    console.log('Author:', info.author);
    console.log('%cArchitecture:', 'color: #2196F3; font-weight: bold;');
    console.log('  Config:', info.architecture.config);
    console.log('  Utils:', info.architecture.utils);
    console.log('  Services:', info.architecture.services);
    console.log('  UI Modules:', info.architecture.ui);
    console.log('  Event Modules:', info.architecture.events);
    console.log('  Orchestrator:', info.architecture.orchestrator);
    console.log('%cCurrent State:', 'color: #FF9800; font-weight: bold;');
    console.log('  Total Members:', info.state.membersCount);
    console.log('  Current Member Index:', info.state.currentMemberIndex);
    console.log('  Edit Index:', info.state.editIndex);
    console.log('  Current Beneficiaries:', info.state.beneficiariesCount);
};

// Export for Node.js environment (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeMembersModule,
        getModuleInfo
    };
}
