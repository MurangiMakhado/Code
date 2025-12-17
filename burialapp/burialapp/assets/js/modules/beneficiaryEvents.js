/**
 * Beneficiary Events Module
 * Handles all beneficiary-related event listeners and user interactions
 *
 * @author TSHILAPFENE BURIAL SOCIETY
 * @description Separated beneficiary event handling from UI and business logic for better maintainability
 */

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Setup all beneficiary-related event listeners
 * Called once on page load
 *
 * @example
 * setupBeneficiaryEvents();
 */
function setupBeneficiaryEvents() {
    // Add beneficiary modal events
    setupAddBeneficiaryModalEvents();

    // Manage beneficiaries modal events
    setupManageBeneficiariesModalEvents();

    // Edit beneficiary modal events
    setupEditBeneficiaryModalEvents();

    // Delete beneficiary modal events
    setupDeleteBeneficiaryModalEvents();

    logDebug('Beneficiary event listeners initialized');
}

// ============================================================================
// ADD BENEFICIARY MODAL EVENTS
// ============================================================================

/**
 * Setup add beneficiary modal events
 * @private
 */
function setupAddBeneficiaryModalEvents() {
    // Save beneficiary button
    document.getElementById(BUTTON_IDS.SAVE_BENEFICIARY).addEventListener('click', async function() {
        await handleSaveBeneficiary();
    });

    // Cancel button (already handled in memberEvents, but we can add redundancy)
    document.getElementById(BUTTON_IDS.CANCEL_BENEFICIARY).addEventListener('click', function() {
        clearBeneficiaryForm();
        hideModal(MODALS.ADD_BENEFICIARY);
        currentMemberIndex = null;
    });
}

/**
 * Handle saving a new beneficiary
 * @private
 */
async function handleSaveBeneficiary() {
    if (currentMemberIndex === null) {
        showToast(ERROR_MESSAGES.INVALID_MEMBER_ID, TOAST_TYPES.ERROR);
        return;
    }

    const formData = getBeneficiaryFormData();

    // Validate required fields
    const validation = validateBeneficiaryData({
        member_id: members[currentMemberIndex].id,
        name: formData.name,
        id_number: formData.id_number,
        relationship: formData.relationship
    });

    if (!validation.valid) {
        showToast(validation.errors.join(', '), TOAST_TYPES.ERROR);
        return;
    }

    const member = members[currentMemberIndex];
    const memberId = member.id;

    if (!memberId) {
        showToast(ERROR_MESSAGES.INVALID_MEMBER_ID, TOAST_TYPES.ERROR);
        return;
    }

    // Prepare beneficiary data
    const beneficiaryData = prepareBeneficiaryData(formData, memberId);

    try {
        logDebug('Creating beneficiary', beneficiaryData);
        const newBeneficiary = await createBeneficiary(beneficiaryData);

        showToast(SUCCESS_MESSAGES.BENEFICIARY_ADDED, TOAST_TYPES.SUCCESS);

        // Clear form
        clearBeneficiaryForm();
        hideModal(MODALS.ADD_BENEFICIARY);

        // Reload beneficiaries if manage modal is open
        const manageModal = document.getElementById(MODALS.MANAGE_BENEFICIARIES);
        if (manageModal.style.display === 'flex') {
            await refreshBeneficiariesList();
        } else {
            // Reload members to update beneficiaries list in main table
            await refreshMembersData();
        }
    } catch (error) {
        logError('Creating beneficiary', error);
        showToast(error.response?.data?.message || ERROR_MESSAGES.ADDING_BENEFICIARY, TOAST_TYPES.ERROR);
    }
}

// ============================================================================
// MANAGE BENEFICIARIES MODAL EVENTS
// ============================================================================

/**
 * Setup manage beneficiaries modal events
 * @private
 */
function setupManageBeneficiariesModalEvents() {
    // Add new beneficiary button (opens add beneficiary modal)
    document.getElementById(BUTTON_IDS.ADD_NEW_BENEFICIARY).addEventListener('click', function() {
        showModal(MODALS.ADD_BENEFICIARY);
    });

    // Close beneficiaries button
    document.getElementById(BUTTON_IDS.CLOSE_BENEFICIARIES).addEventListener('click', async function() {
        await closeManageBeneficiariesModal();
    });
}

// ============================================================================
// EDIT BENEFICIARY MODAL EVENTS
// ============================================================================

/**
 * Setup edit beneficiary modal events
 * @private
 */
function setupEditBeneficiaryModalEvents() {
    // Save edit button
    document.getElementById(BUTTON_IDS.SAVE_EDIT_BENEFICIARY).addEventListener('click', async function() {
        await handleSaveEditBeneficiary();
    });

    // Cancel edit button
    document.getElementById(BUTTON_IDS.CANCEL_EDIT_BENEFICIARY).addEventListener('click', function() {
        closeEditBeneficiaryModal();
    });
}

/**
 * Handle saving edited beneficiary
 * @private
 */
async function handleSaveEditBeneficiary() {
    if (currentBeneficiaryIndex === null) {
        showToast(ERROR_MESSAGES.INVALID_BENEFICIARY_ID, TOAST_TYPES.ERROR);
        return;
    }

    const formData = getEditBeneficiaryFormData();

    // Validate required fields
    const validation = validateBeneficiaryData({
        member_id: members[currentMemberIndex].id,
        name: formData.name,
        id_number: formData.id_number,
        relationship: formData.relationship
    });

    if (!validation.valid) {
        showToast(validation.errors.join(', '), TOAST_TYPES.ERROR);
        return;
    }

    const beneficiary = currentBeneficiaries[currentBeneficiaryIndex];
    const beneficiaryId = beneficiary.id;

    if (!beneficiaryId) {
        showToast(ERROR_MESSAGES.INVALID_BENEFICIARY_ID, TOAST_TYPES.ERROR);
        return;
    }

    const member = members[currentMemberIndex];
    const memberId = member.id;

    // Prepare beneficiary data
    const beneficiaryData = prepareBeneficiaryData(formData, memberId);

    try {
        logDebug('Updating beneficiary', beneficiaryId, beneficiaryData);
        const updatedBeneficiary = await updateBeneficiary(beneficiaryId, beneficiaryData);

        if (updatedBeneficiary) {
            // Update the beneficiary in the local array
            const normalizedBeneficiary = normalizeBeneficiaryResponse(updatedBeneficiary);
            currentBeneficiaries[currentBeneficiaryIndex] = normalizedBeneficiary;

            // Update member's beneficiaries in local storage
            members[currentMemberIndex].beneficiaries = currentBeneficiaries;
            saveMembers(members);

            showToast(SUCCESS_MESSAGES.BENEFICIARY_UPDATED, TOAST_TYPES.SUCCESS);
            renderBeneficiariesList();
            closeEditBeneficiaryModal();
        } else {
            // Fallback: reload beneficiaries if response format is different
            await refreshBeneficiariesList();
            closeEditBeneficiaryModal();
        }
    } catch (error) {
        logError('Updating beneficiary', error);
        showToast(error.response?.data?.message || ERROR_MESSAGES.UPDATING_BENEFICIARY, TOAST_TYPES.ERROR);
    }
}

// ============================================================================
// DELETE BENEFICIARY MODAL EVENTS
// ============================================================================

/**
 * Setup delete beneficiary modal events
 * @private
 */
function setupDeleteBeneficiaryModalEvents() {
    // Confirm delete button
    document.getElementById(BUTTON_IDS.CONFIRM_DELETE_BENEFICIARY).addEventListener('click', async function() {
        await handleDeleteBeneficiary();
    });

    // Cancel delete button
    document.getElementById(BUTTON_IDS.CANCEL_DELETE_BENEFICIARY).addEventListener('click', function() {
        closeDeleteBeneficiaryModal();
    });
}

/**
 * Handle deleting a beneficiary
 * @private
 */
async function handleDeleteBeneficiary() {
    if (deleteBeneficiaryId === null) {
        showToast(ERROR_MESSAGES.INVALID_BENEFICIARY_ID, TOAST_TYPES.ERROR);
        closeDeleteBeneficiaryModal();
        return;
    }

    try {
        logDebug('Deleting beneficiary', deleteBeneficiaryId);

        // Delete from API
        await deleteBeneficiary(deleteBeneficiaryId);

        // If API delete is successful, remove from local array
        currentBeneficiaries.splice(currentBeneficiaryIndex, 1);

        // Update member's beneficiaries in local storage
        members[currentMemberIndex].beneficiaries = currentBeneficiaries;
        saveMembers(members);

        showToast(SUCCESS_MESSAGES.BENEFICIARY_DELETED, TOAST_TYPES.SUCCESS);

        // Re-render the beneficiaries list
        renderBeneficiariesList();

        closeDeleteBeneficiaryModal();
    } catch (error) {
        logError('Deleting beneficiary', error);
        showToast(error.response?.data?.message || ERROR_MESSAGES.DELETING_BENEFICIARY, TOAST_TYPES.ERROR);
        closeDeleteBeneficiaryModal();
    }
}

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        setupBeneficiaryEvents,
        handleSaveBeneficiary,
        handleSaveEditBeneficiary,
        handleDeleteBeneficiary
    };
}
