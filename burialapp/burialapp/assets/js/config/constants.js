/**
 * Application Constants
 * Centralized configuration for the Members Management module
 *
 * @author TSHILAPFENE BURIAL SOCIETY
 * @description Contains all magic strings, DOM IDs, API endpoints, and configuration values
 */

// ============================================================================
// DOM ELEMENT IDS
// ============================================================================

/**
 * Modal element IDs
 * @constant {Object}
 */
const MODALS = {
    EDIT_CHOICE: 'editChoiceModal',
    DELETE_MEMBER: 'deleteModal',
    ADD_BENEFICIARY: 'beneficiaryModal',
    EDIT_MEMBER: 'editMemberModal',
    MANAGE_BENEFICIARIES: 'manageBeneficiariesModal',
    EDIT_BENEFICIARY: 'editBeneficiaryModal',
    DELETE_BENEFICIARY: 'deleteBeneficiaryModal'
};

/**
 * Unified form field element IDs (members + beneficiaries)
 * @constant {Object}
 */
const FIELD_IDS = {
    // Member form fields
    MEMBER_FORM: 'memberForm',
    MEMBER_SUBMIT: 'memberSubmit',
    MEMBER_LIST: 'memberList',
    MEMBER_SEARCH: 'memberSearch',
    MEMBER_NUMBER: 'memberNumber',
    NAME: 'name',
    ID_NUMBER: 'idNumber',
    PHONE: 'phone',
    // Member edit form fields
    EDIT_MEMBER_ID: 'editMemberId',
    EDIT_MEMBER_NUMBER: 'editMemberNumber',
    EDIT_NAME: 'editName',
    EDIT_ID_NUMBER: 'editIdNumber',
    EDIT_PHONE: 'editPhone',
    // Beneficiary form fields
    BENEFICIARIES_LIST: 'beneficiariesList',
    BENEFICIARY_NAME: 'beneficiaryName',
    BENEFICIARY_ID_NUMBER: 'beneficiaryIdNumber',
    BENEFICIARY_RELATIONSHIP: 'beneficiaryRelationship',
    BENEFICIARY_PHONE: 'beneficiaryPhone',
    BENEFICIARY_ADDRESS: 'beneficiaryAddress',
    // Beneficiary edit form fields
    EDIT_BENEFICIARY_ID: 'editBeneficiaryId',
    EDIT_BENEFICIARY_NAME: 'editBeneficiaryName',
    EDIT_BENEFICIARY_ID_NUMBER: 'editBeneficiaryIdNumber',
    EDIT_BENEFICIARY_RELATIONSHIP: 'editBeneficiaryRelationship',
    EDIT_BENEFICIARY_PHONE: 'editBeneficiaryPhone',
    EDIT_BENEFICIARY_ADDRESS: 'editBeneficiaryAddress'
};

/**
 * Unified button element IDs (for backwards compatibility)
 * @constant {Object}
 */
const BUTTON_IDS = {
    // Member buttons
    MEMBER_SUBMIT: 'memberSubmit',
    CHOICE_EDIT_MEMBER: 'choiceEditMember',
    CHOICE_EDIT_BEN: 'choiceEditBen',
    CHOICE_CANCEL: 'choiceCancel',
    CONFIRM_DELETE: 'confirmDeleteBtn',
    CANCEL_DELETE: 'cancelDeleteBtn',
    SAVE_MEMBER_EDIT: 'saveMemberEdit',
    CANCEL_MEMBER_EDIT: 'cancelMemberEdit',
    // Beneficiary buttons
    SAVE_BENEFICIARY: 'saveBeneficiaryBtn',
    CANCEL_BENEFICIARY: 'cancelBeneficiaryBtn',
    ADD_NEW_BENEFICIARY: 'addNewBeneficiaryBtn',
    CLOSE_BENEFICIARIES: 'closeBeneficiariesBtn',
    SAVE_EDIT_BENEFICIARY: 'saveEditBeneficiaryBtn',
    CANCEL_EDIT_BENEFICIARY: 'cancelEditBeneficiaryBtn',
    CONFIRM_DELETE_BENEFICIARY: 'confirmDeleteBeneficiaryBtn',
    CANCEL_DELETE_BENEFICIARY: 'cancelDeleteBeneficiaryBtn',
    // Export buttons
    EXPORT_PDF: 'exportPDF',
    EXPORT_EXCEL: 'exportExcel'
};

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

/**
 * LocalStorage keys
 * @constant {Object}
 */
const STORAGE_KEYS = {
    MEMBERS: 'members',
    USER_DATA: 'userData',
    AUTH_TOKEN: 'authToken'
};

// ============================================================================
// API CONFIGURATION
// ============================================================================

/**
 * API endpoints (relative to base URL)
 * @constant {Object}
 */
const API_ENDPOINTS = {
    MEMBERS: 'members',
    BENEFICIARIES: 'beneficiaries'
};

/**
 * API query parameters
 * @constant {Object}
 */
const API_PARAMS = {
    WITH_BENEFICIARIES: { with_beneficiaries: true },
    MEMBER_ID: 'member_id'
};

// ============================================================================
// UI CONFIGURATION
// ============================================================================

/**
 * Toast notification types
 * @constant {Object}
 */
const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

/**
 * Toast notification duration in milliseconds
 * @constant {number}
 */
const TOAST_DURATION = 3000;

/**
 * Member status values
 * @constant {Object}
 */
const MEMBER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
};

/**
 * CSS class names
 * @constant {Object}
 */
const CSS_CLASSES = {
    // Button classes
    BTN_ADD: 'add-btn-green',
    BTN_UPDATE: 'update-btn-blue',
    BTN_DELETE: 'btn btn-red',
    BTN_EDIT: 'edit-btn',
    BTN_BENEFICIARY: 'beneficiary-btn',
    // Toast classes
    TOAST: 'toast',
    TOAST_SHOW: 'show',
    // Member display
    MEMBER_NAME: 'member-name',
    INDEX_COL: 'index-col',
    SMALL_MUTED: 'small-muted'
};

/**
 * Success messages
 * @constant {Object}
 */
const SUCCESS_MESSAGES = {
    MEMBER_ADDED: 'Member added successfully!',
    MEMBER_UPDATED: 'Member updated successfully!',
    MEMBER_DELETED: 'Member deleted successfully!',
    BENEFICIARY_ADDED: 'Beneficiary added successfully!',
    BENEFICIARY_UPDATED: 'Beneficiary updated successfully!',
    BENEFICIARY_DELETED: 'Beneficiary deleted successfully!'
};

/**
 * Error messages
 * @constant {Object}
 */
const ERROR_MESSAGES = {
    REQUIRED_FIELDS: 'Please fill all required fields',
    INVALID_MEMBER_ID: 'Cannot load beneficiaries: Invalid member ID',
    INVALID_BENEFICIARY_ID: 'Cannot update beneficiary: Invalid beneficiary ID',
    CANNOT_DELETE: 'Cannot delete member: Invalid member ID',
    CANNOT_ADD_BENEFICIARY: 'Cannot add beneficiary: Invalid member ID',
    CANNOT_UPDATE_BENEFICIARY: 'Cannot update beneficiary: Invalid beneficiary ID',
    LOADING_MEMBERS: 'Error loading members',
    LOADING_BENEFICIARIES: 'Error loading beneficiaries',
    SAVING_MEMBER: 'Error saving member. Please try again.',
    UPDATING_MEMBER: 'Error updating member. Please try again.',
    DELETING_MEMBER: 'Error deleting member. Please try again.',
    ADDING_BENEFICIARY: 'Error adding beneficiary. Please try again.',
    CREATING_BENEFICIARY: 'Error adding beneficiary. Please try again.',
    UPDATING_BENEFICIARY: 'Error updating beneficiary. Please try again.',
    DELETING_BENEFICIARY: 'Error deleting beneficiary. Please try again.',
    AUTHENTICATION_REQUIRED: 'User not authenticated. Please login again.',
    NOT_AUTHENTICATED: 'User not authenticated. Please login again.'
};

/**
 * Info messages
 * @constant {Object}
 */
const INFO_MESSAGES = {
    EXPORT_PDF_COMING: 'PDF export feature coming soon!',
    EXPORT_EXCEL_COMING: 'Excel export feature coming soon!',
    NO_BENEFICIARIES: 'No beneficiaries added yet.'
};

/**
 * Redirect URLs
 * @constant {Object}
 */
const REDIRECT_URLS = {
    LOGIN: '/login.html'
};

// ============================================================================
// DATA FIELD MAPPINGS
// ============================================================================

/**
 * Maps API response fields (camelCase) to local format (snake_case)
 * Helps normalize data between frontend and backend
 * @constant {Object}
 */
const FIELD_MAPPINGS = {
    MEMBER: {
        id: 'id',
        userId: 'user_id',
        memberNumber: 'member_number',
        name: 'name',
        idNumber: 'id_number',
        phone: 'phone',
        address: 'address',
        joinDate: 'join_date',
        status: 'status',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    BENEFICIARY: {
        id: 'id',
        memberId: 'member_id',
        name: 'name',
        relationship: 'relationship',
        phone: 'phone',
        idNumber: 'id_number',
        address: 'address',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
};

// Export all constants
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        MODALS,
        FIELD_IDS,
        BUTTON_IDS,
        STORAGE_KEYS,
        API_ENDPOINTS,
        API_PARAMS,
        TOAST_TYPES,
        TOAST_DURATION,
        MEMBER_STATUS,
        CSS_CLASSES,
        SUCCESS_MESSAGES,
        ERROR_MESSAGES,
        INFO_MESSAGES,
        REDIRECT_URLS,
        FIELD_MAPPINGS
    };
}
