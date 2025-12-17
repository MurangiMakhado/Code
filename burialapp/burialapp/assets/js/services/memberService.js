/**
 * Member API Service
 * Handles all API calls related to members
 *
 * @author TSHILAPFENE BURIAL SOCIETY
 * @description Centralized member API operations with consistent error handling
 */

// ============================================================================
// MEMBER API OPERATIONS
// ============================================================================

/**
 * Fetch all members from the API
 *
 * @param {boolean} [withBeneficiaries=true] - Include beneficiaries in response
 * @returns {Promise<Array>} Array of member objects
 * @throws {Error} If API request fails
 *
 * @example
 * try {
 *     const members = await fetchMembers(true);
 *     console.log('Loaded', members.length, 'members');
 * } catch (error) {
 *     console.error('Failed to load members:', error);
 * }
 */
async function fetchMembers(withBeneficiaries = true) {
    try {
        const params = withBeneficiaries ? { with_beneficiaries: true } : {};
        const response = await get('members', params);

        logDebug('Members API Response', response);

        // Handle different response structures
        if (response.data && response.data.data) {
            return response.data.data.map(member => ({
                ...member,
                id: member.id // Ensure ID is included
            }));
        } else if (response.data && Array.isArray(response.data)) {
            return response.data.map(member => ({
                ...member,
                id: member.id
            }));
        }

        return [];
    } catch (error) {
        logError('Fetching members', error);
        throw error;
    }
}

/**
 * Create a new member via API
 *
 * @param {Object} memberData - Member data object
 * @param {number} memberData.user_id - User ID
 * @param {string} memberData.member_number - Member number
 * @param {string} memberData.name - Full name
 * @param {string} memberData.id_number - ID number
 * @param {string} memberData.phone - Phone number
 * @param {string} [memberData.address] - Address
 * @param {string} [memberData.join_date] - Join date (ISO format)
 * @param {string} [memberData.status] - Member status
 * @returns {Promise<Object>} Created member object
 * @throws {Error} If API request fails
 *
 * @example
 * const newMember = await createMember({
 *     user_id: 1,
 *     member_number: '042',
 *     name: 'John Doe',
 *     id_number: '8501011234081',
 *     phone: '0712345678',
 *     address: '123 Main St',
 *     join_date: '2024-01-15',
 *     status: 'active'
 * });
 */
async function createMember(memberData) {
    try {
        logDebug('Creating member', memberData);
        const response = await post('members', memberData);

        if (response.data) {
            logDebug('Member created', response.data);
            return response.data;
        }

        throw new Error('Invalid response from API');
    } catch (error) {
        logError('Creating member', error);
        throw error;
    }
}

/**
 * Update an existing member via API
 *
 * @param {number} memberId - ID of member to update
 * @param {Object} memberData - Updated member data
 * @returns {Promise<Object>} Updated member object
 * @throws {Error} If API request fails or member ID is invalid
 *
 * @example
 * const updated = await updateMember(5, {
 *     user_id: 1,
 *     member_number: '005',
 *     name: 'John Doe Updated',
 *     id_number: '8501011234081',
 *     phone: '0712345678',
 *     address: '456 New St',
 *     join_date: '2024-01-15',
 *     status: 'active'
 * });
 */
async function updateMember(memberId, memberData) {
    if (!memberId) {
        throw new Error('Member ID is required');
    }

    try {
        logDebug(`Updating member ${memberId}`, memberData);
        const response = await put(`members/${memberId}`, memberData);

        if (response.data && response.data.data) {
            logDebug('Member updated', response.data);
            return normalizeMemberResponse(response.data.data);
        }

        throw new Error('Invalid response from API');
    } catch (error) {
        logError(`Updating member ${memberId}`, error);
        throw error;
    }
}

/**
 * Delete a member via API
 *
 * @param {number} memberId - ID of member to delete
 * @returns {Promise<Object>} API response
 * @throws {Error} If API request fails or member ID is invalid
 *
 * @example
 * try {
 *     await deleteMember(5);
 *     console.log('Member deleted successfully');
 * } catch (error) {
 *     console.error('Failed to delete member:', error);
 * }
 */
async function deleteMember(memberId) {
    if (!memberId) {
        throw new Error('Member ID is required');
    }

    try {
        logDebug(`Deleting member ${memberId}`);
        const response = await del(`members/${memberId}`);

        logDebug('Member deleted', response.data);
        return response.data;
    } catch (error) {
        logError(`Deleting member ${memberId}`, error);
        throw error;
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize member API response to consistent format
 * Handles both camelCase and snake_case field names
 *
 * @param {Object} memberData - Raw member data from API
 * @returns {Object} Normalized member object
 * @private
 *
 * @example
 * const normalized = normalizeMemberResponse(apiResponse);
 */
function normalizeMemberResponse(memberData) {
    return {
        id: memberData.id,
        user_id: memberData.userId || memberData.user_id,
        member_number: memberData.memberNumber || memberData.member_number,
        name: memberData.name,
        id_number: memberData.idNumber || memberData.id_number,
        phone: memberData.phone,
        address: memberData.address,
        join_date: memberData.joinDate || memberData.join_date,
        status: memberData.status,
        created_at: memberData.createdAt || memberData.created_at,
        updated_at: memberData.updatedAt || memberData.updated_at,
        beneficiaries: memberData.beneficiaries || []
    };
}

/**
 * Prepare member data for API submission
 * Ensures all required fields are present
 *
 * @param {Object} formData - Form data from UI
 * @param {number} userId - User ID
 * @param {Object} [existingMember] - Existing member data (for updates)
 * @returns {Object} Prepared member data
 *
 * @example
 * const apiData = prepareMemberData(
 *     { name: 'John', phone: '123' },
 *     1,
 *     existingMember
 * );
 */
function prepareMemberData(formData, userId, existingMember = {}) {
    return {
        user_id: userId,
        member_number: formData.member_number || existingMember.member_number || existingMember.memberNumber,
        name: formData.name,
        id_number: formData.id_number,
        phone: formData.phone,
        address: formData.address || existingMember.address || '',
        join_date: existingMember.join_date || existingMember.joinDate || formatDateISO(),
        status: existingMember.status || 'active'
    };
}

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        fetchMembers,
        createMember,
        updateMember,
        deleteMember,
        normalizeMemberResponse,
        prepareMemberData
    };
}
