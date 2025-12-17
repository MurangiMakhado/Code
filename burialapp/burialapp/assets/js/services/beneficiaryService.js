/**
 * Beneficiary API Service
 * Handles all API calls related to beneficiaries
 *
 * @author TSHILAPFENE BURIAL SOCIETY
 * @description Centralized beneficiary API operations with consistent error handling
 */

// ============================================================================
// BENEFICIARY API OPERATIONS
// ============================================================================

/**
 * Fetch all beneficiaries for a specific member
 *
 * @param {number} memberId - ID of the member
 * @returns {Promise<Array>} Array of beneficiary objects
 * @throws {Error} If API request fails or member ID is invalid
 *
 * @example
 * try {
 *     const beneficiaries = await fetchBeneficiaries(5);
 *     console.log('Found', beneficiaries.length, 'beneficiaries');
 * } catch (error) {
 *     console.error('Failed to load beneficiaries:', error);
 * }
 */
async function fetchBeneficiaries(memberId) {
    if (!memberId) {
        throw new Error('Member ID is required');
    }

    try {
        const response = await get('beneficiaries', { member_id: memberId });
        logDebug('Beneficiaries API Response', response);

        // Handle different response structures
        if (response.data && response.data.data) {
            return response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
            return response.data;
        }

        return [];
    } catch (error) {
        logError(`Fetching beneficiaries for member ${memberId}`, error);
        throw error;
    }
}

/**
 * Create a new beneficiary via API
 *
 * @param {Object} beneficiaryData - Beneficiary data object
 * @param {number} beneficiaryData.member_id - Member ID
 * @param {string} beneficiaryData.name - Full name
 * @param {string} beneficiaryData.relationship - Relationship to member
 * @param {string} beneficiaryData.id_number - ID number
 * @param {string} [beneficiaryData.phone] - Phone number
 * @param {string} [beneficiaryData.address] - Address
 * @returns {Promise<Object>} Created beneficiary object
 * @throws {Error} If API request fails
 *
 * @example
 * const newBeneficiary = await createBeneficiary({
 *     member_id: 5,
 *     name: 'Jane Doe',
 *     relationship: 'spouse',
 *     id_number: '9001011234082',
 *     phone: '0723456789',
 *     address: '123 Main St'
 * });
 */
async function createBeneficiary(beneficiaryData) {
    if (!beneficiaryData.member_id) {
        throw new Error('Member ID is required');
    }

    try {
        logDebug('Creating beneficiary', beneficiaryData);
        const response = await post('beneficiaries', beneficiaryData);

        if (response.data && response.data.data) {
            logDebug('Beneficiary created', response.data);
            return response.data.data;
        }

        throw new Error('Invalid response from API');
    } catch (error) {
        logError('Creating beneficiary', error);
        throw error;
    }
}

/**
 * Update an existing beneficiary via API
 *
 * @param {number} beneficiaryId - ID of beneficiary to update
 * @param {Object} beneficiaryData - Updated beneficiary data
 * @returns {Promise<Object>} Updated beneficiary object
 * @throws {Error} If API request fails or beneficiary ID is invalid
 *
 * @example
 * const updated = await updateBeneficiary(10, {
 *     member_id: 5,
 *     name: 'Jane Doe Updated',
 *     relationship: 'spouse',
 *     id_number: '9001011234082',
 *     phone: '0723456789',
 *     address: '456 New St'
 * });
 */
async function updateBeneficiary(beneficiaryId, beneficiaryData) {
    if (!beneficiaryId) {
        throw new Error('Beneficiary ID is required');
    }

    if (!beneficiaryData.member_id) {
        throw new Error('Member ID is required');
    }

    try {
        logDebug(`Updating beneficiary ${beneficiaryId}`, beneficiaryData);
        const response = await put(`beneficiaries/${beneficiaryId}`, beneficiaryData);

        if (response.data && response.data.data) {
            logDebug('Beneficiary updated', response.data);
            return normalizeBeneficiaryResponse(response.data.data);
        }

        throw new Error('Invalid response from API');
    } catch (error) {
        logError(`Updating beneficiary ${beneficiaryId}`, error);
        throw error;
    }
}

/**
 * Delete a beneficiary via API
 *
 * @param {number} beneficiaryId - ID of beneficiary to delete
 * @returns {Promise<Object>} API response
 * @throws {Error} If API request fails or beneficiary ID is invalid
 *
 * @example
 * try {
 *     await deleteBeneficiary(10);
 *     console.log('Beneficiary deleted successfully');
 * } catch (error) {
 *     console.error('Failed to delete beneficiary:', error);
 * }
 */
async function deleteBeneficiary(beneficiaryId) {
    if (!beneficiaryId) {
        throw new Error('Beneficiary ID is required');
    }

    try {
        logDebug(`Deleting beneficiary ${beneficiaryId}`);
        const response = await del(`beneficiaries/${beneficiaryId}`);

        logDebug('Beneficiary deleted', response.data);
        return response.data;
    } catch (error) {
        logError(`Deleting beneficiary ${beneficiaryId}`, error);
        throw error;
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize beneficiary API response to consistent format
 * Handles both camelCase and snake_case field names
 *
 * @param {Object} beneficiaryData - Raw beneficiary data from API
 * @returns {Object} Normalized beneficiary object
 * @private
 *
 * @example
 * const normalized = normalizeBeneficiaryResponse(apiResponse);
 */
function normalizeBeneficiaryResponse(beneficiaryData) {
    return {
        id: beneficiaryData.id,
        memberId: beneficiaryData.memberId || beneficiaryData.member_id,
        member_id: beneficiaryData.memberId || beneficiaryData.member_id,
        name: beneficiaryData.name,
        relationship: beneficiaryData.relationship,
        phone: beneficiaryData.phone,
        idNumber: beneficiaryData.idNumber || beneficiaryData.id_number,
        id_number: beneficiaryData.idNumber || beneficiaryData.id_number,
        address: beneficiaryData.address,
        createdAt: beneficiaryData.createdAt || beneficiaryData.created_at,
        created_at: beneficiaryData.createdAt || beneficiaryData.created_at,
        updatedAt: beneficiaryData.updatedAt || beneficiaryData.updated_at,
        updated_at: beneficiaryData.updatedAt || beneficiaryData.updated_at
    };
}

/**
 * Prepare beneficiary data for API submission
 * Ensures all required fields are present
 *
 * @param {Object} formData - Form data from UI
 * @param {number} memberId - Member ID
 * @returns {Object} Prepared beneficiary data
 *
 * @example
 * const apiData = prepareBeneficiaryData(
 *     { name: 'Jane', relationship: 'spouse', id_number: '123' },
 *     5
 * );
 */
function prepareBeneficiaryData(formData, memberId) {
    return {
        member_id: memberId,
        name: formData.name,
        relationship: formData.relationship,
        phone: formData.phone || '',
        id_number: formData.id_number,
        address: formData.address || ''
    };
}

/**
 * Validate beneficiary data before submission
 *
 * @param {Object} beneficiaryData - Beneficiary data to validate
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 *
 * @example
 * const validation = validateBeneficiaryData(formData);
 * if (!validation.valid) {
 *     console.error('Validation errors:', validation.errors);
 * }
 */
function validateBeneficiaryData(beneficiaryData) {
    const errors = [];

    if (!beneficiaryData.member_id) {
        errors.push('Member ID is required');
    }

    if (!beneficiaryData.name || beneficiaryData.name.trim() === '') {
        errors.push('Name is required');
    }

    if (!beneficiaryData.id_number || beneficiaryData.id_number.trim() === '') {
        errors.push('ID Number is required');
    }

    if (!beneficiaryData.relationship || beneficiaryData.relationship.trim() === '') {
        errors.push('Relationship is required');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        fetchBeneficiaries,
        createBeneficiary,
        updateBeneficiary,
        deleteBeneficiary,
        normalizeBeneficiaryResponse,
        prepareBeneficiaryData,
        validateBeneficiaryData
    };
}
