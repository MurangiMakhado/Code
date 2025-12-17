/**
 * Beneficiary UI Module
 * Handles all beneficiary-related rendering and DOM manipulation
 *
 * @author TSHILAPFENE BURIAL SOCIETY
 * @description Separated beneficiary UI concerns from business logic for better maintainability
 */

// ============================================================================
// MODAL MANAGEMENT
// ============================================================================

/**
 * Open the manage beneficiaries modal and load beneficiaries for a member
 *
 * @param {number} memberIndex - Index of the member in the members array
 *
 * @example
 * await openManageBeneficiariesModal(5);
 */
async function openManageBeneficiariesModal(memberIndex) {
    currentMemberIndex = memberIndex;
    const member = members[memberIndex];
    const memberId = member.id;

    if (!memberId) {
        showToast(ERROR_MESSAGES.INVALID_MEMBER_ID, TOAST_TYPES.ERROR);
        return;
    }

    try {
        // Load beneficiaries from API
        currentBeneficiaries = await fetchBeneficiaries(memberId);

        // Update member's beneficiaries in local storage
        members[memberIndex].beneficiaries = currentBeneficiaries;
        saveMembers(members);

        renderBeneficiariesList();
        showModal(MODALS.MANAGE_BENEFICIARIES);
    } catch (error) {
        logError('Loading beneficiaries', error);
        showToast(ERROR_MESSAGES.LOADING_BENEFICIARIES, TOAST_TYPES.ERROR);
    }
}

/**
 * Close the manage beneficiaries modal and refresh members list
 *
 * @example
 * await closeManageBeneficiariesModal();
 */
async function closeManageBeneficiariesModal() {
    hideModal(MODALS.MANAGE_BENEFICIARIES);

    // Reload members to update the beneficiaries display in the main table
    try {
        members = await fetchMembers(true);
        saveMembers(members);
        const searchValue = document.getElementById(FIELD_IDS.MEMBER_SEARCH).value.trim();
        renderMembers(searchValue);
    } catch (error) {
        logError('Refreshing members after closing beneficiaries modal', error);
    }

    currentMemberIndex = null;
    currentBeneficiaries = [];
}

/**
 * Open the edit beneficiary modal with beneficiary data
 *
 * @param {number} beneficiaryIndex - Index of beneficiary in currentBeneficiaries array
 *
 * @example
 * openEditBeneficiaryModal(3);
 */
function openEditBeneficiaryModal(beneficiaryIndex) {
    currentBeneficiaryIndex = beneficiaryIndex;
    const beneficiary = currentBeneficiaries[beneficiaryIndex];

    // Populate form fields
    document.getElementById(FIELD_IDS.EDIT_BENEFICIARY_ID).textContent = beneficiary.id || 'N/A';
    document.getElementById(FIELD_IDS.EDIT_BENEFICIARY_NAME).value = beneficiary.name || '';
    document.getElementById(FIELD_IDS.EDIT_BENEFICIARY_ID_NUMBER).value = beneficiary.idNumber || beneficiary.id_number || '';
    document.getElementById(FIELD_IDS.EDIT_BENEFICIARY_RELATIONSHIP).value = beneficiary.relationship || '';
    document.getElementById(FIELD_IDS.EDIT_BENEFICIARY_PHONE).value = beneficiary.phone || '';
    document.getElementById(FIELD_IDS.EDIT_BENEFICIARY_ADDRESS).value = beneficiary.address || '';

    showModal(MODALS.EDIT_BENEFICIARY);
}

/**
 * Close the edit beneficiary modal
 *
 * @example
 * closeEditBeneficiaryModal();
 */
function closeEditBeneficiaryModal() {
    hideModal(MODALS.EDIT_BENEFICIARY);
    currentBeneficiaryIndex = null;
}

/**
 * Open the delete beneficiary confirmation modal
 *
 * @param {number} beneficiaryIndex - Index of beneficiary to delete
 *
 * @example
 * openDeleteBeneficiaryModal(3);
 */
function openDeleteBeneficiaryModal(beneficiaryIndex) {
    currentBeneficiaryIndex = beneficiaryIndex;
    deleteBeneficiaryId = currentBeneficiaries[beneficiaryIndex].id;
    showModal(MODALS.DELETE_BENEFICIARY);
}

/**
 * Close the delete beneficiary modal
 *
 * @example
 * closeDeleteBeneficiaryModal();
 */
function closeDeleteBeneficiaryModal() {
    hideModal(MODALS.DELETE_BENEFICIARY);
    currentBeneficiaryIndex = null;
    deleteBeneficiaryId = null;
}

// Make beneficiary modal functions globally accessible for inline onclick handlers
window.openEditBeneficiaryModal = openEditBeneficiaryModal;
window.openDeleteBeneficiaryModal = openDeleteBeneficiaryModal;

// ============================================================================
// BENEFICIARY RENDERING
// ============================================================================

/**
 * Render the list of beneficiaries in the manage beneficiaries modal
 *
 * @example
 * renderBeneficiariesList();
 */
function renderBeneficiariesList() {
    const beneficiariesList = document.getElementById(FIELD_IDS.BENEFICIARIES_LIST);

    if (currentBeneficiaries.length === 0) {
        beneficiariesList.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">No beneficiaries added yet.</p>';
        return;
    }

    beneficiariesList.innerHTML = currentBeneficiaries.map((ben, index) =>
        createBeneficiaryCard(ben, index)
    ).join('');
}

/**
 * Create a beneficiary card element HTML
 *
 * @param {Object} beneficiary - Beneficiary object
 * @param {number} index - Index of beneficiary in array
 * @returns {string} HTML string for beneficiary card
 * @private
 *
 * @example
 * const html = createBeneficiaryCard(beneficiaryObject, 3);
 */
function createBeneficiaryCard(beneficiary, index) {
    return `
        <div style="border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; margin-bottom: 15px; background-color: rgba(255,255,255,0.02);">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 10px 0; color: #fff;">${escHtml(beneficiary.name)}</h4>
                    <p style="margin: 5px 0; color: #888;"><strong>ID Number:</strong> ${escHtml(beneficiary.idNumber || beneficiary.id_number || 'N/A')}</p>
                    <p style="margin: 5px 0; color: #888;"><strong>Relationship:</strong> ${escHtml(beneficiary.relationship || 'N/A')}</p>
                    <p style="margin: 5px 0; color: #888;"><strong>Phone:</strong> ${escHtml(beneficiary.phone || 'N/A')}</p>
                    <p style="margin: 5px 0; color: #888;"><strong>Address:</strong> ${escHtml(beneficiary.address || 'N/A')}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-orange" onclick="openEditBeneficiaryModal(${index})" style="padding: 8px 12px; font-size: 14px;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-red" onclick="openDeleteBeneficiaryModal(${index})" style="padding: 8px 12px; font-size: 14px;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ============================================================================
// FORM MANAGEMENT
// ============================================================================

/**
 * Get beneficiary form data from add modal
 *
 * @returns {Object} Beneficiary data from form
 *
 * @example
 * const data = getBeneficiaryFormData();
 */
function getBeneficiaryFormData() {
    return {
        name: document.getElementById(FIELD_IDS.BENEFICIARY_NAME).value.trim(),
        id_number: document.getElementById(FIELD_IDS.BENEFICIARY_ID_NUMBER).value.trim(),
        relationship: document.getElementById(FIELD_IDS.BENEFICIARY_RELATIONSHIP).value.trim(),
        phone: document.getElementById(FIELD_IDS.BENEFICIARY_PHONE).value.trim(),
        address: document.getElementById(FIELD_IDS.BENEFICIARY_ADDRESS).value.trim()
    };
}

/**
 * Get beneficiary form data from edit modal
 *
 * @returns {Object} Beneficiary data from edit form
 *
 * @example
 * const data = getEditBeneficiaryFormData();
 */
function getEditBeneficiaryFormData() {
    return {
        name: document.getElementById(FIELD_IDS.EDIT_BENEFICIARY_NAME).value.trim(),
        id_number: document.getElementById(FIELD_IDS.EDIT_BENEFICIARY_ID_NUMBER).value.trim(),
        relationship: document.getElementById(FIELD_IDS.EDIT_BENEFICIARY_RELATIONSHIP).value.trim(),
        phone: document.getElementById(FIELD_IDS.EDIT_BENEFICIARY_PHONE).value.trim(),
        address: document.getElementById(FIELD_IDS.EDIT_BENEFICIARY_ADDRESS).value.trim()
    };
}

/**
 * Clear all beneficiary form fields in add modal
 *
 * @example
 * clearBeneficiaryForm();
 */
function clearBeneficiaryForm() {
    document.getElementById(FIELD_IDS.BENEFICIARY_NAME).value = '';
    document.getElementById(FIELD_IDS.BENEFICIARY_ID_NUMBER).value = '';
    document.getElementById(FIELD_IDS.BENEFICIARY_RELATIONSHIP).value = '';
    document.getElementById(FIELD_IDS.BENEFICIARY_PHONE).value = '';
    document.getElementById(FIELD_IDS.BENEFICIARY_ADDRESS).value = '';
}

/**
 * Refresh beneficiaries list from API and re-render
 * @private
 *
 * @example
 * await refreshBeneficiariesList();
 */
async function refreshBeneficiariesList() {
    if (currentMemberIndex === null) return;

    const member = members[currentMemberIndex];
    const memberId = member.id;

    try {
        currentBeneficiaries = await fetchBeneficiaries(memberId);
        members[currentMemberIndex].beneficiaries = currentBeneficiaries;
        saveMembers(members);
        renderBeneficiariesList();
    } catch (error) {
        logError('Refreshing beneficiaries list', error);
        showToast(ERROR_MESSAGES.LOADING_BENEFICIARIES, TOAST_TYPES.ERROR);
    }
}

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        // Modal management
        openManageBeneficiariesModal,
        closeManageBeneficiariesModal,
        openEditBeneficiaryModal,
        closeEditBeneficiaryModal,
        openDeleteBeneficiaryModal,
        closeDeleteBeneficiaryModal,
        // Rendering
        renderBeneficiariesList,
        createBeneficiaryCard,
        // Form management
        getBeneficiaryFormData,
        getEditBeneficiaryFormData,
        clearBeneficiaryForm,
        refreshBeneficiariesList
    };
}
