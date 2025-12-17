/**
 * Member Events Module
 * Handles all member-related event listeners and user interactions
 *
 * @author TSHILAPFENE BURIAL SOCIETY
 * @description Separated event handling from UI and business logic for better maintainability
 */

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Setup all member-related event listeners
 * Called once on page load
 *
 * @example
 * setupMemberEvents();
 */
function setupMemberEvents() {
    // Form submission
    setupMemberFormEvents();

    // Edit choice modal events
    setupEditChoiceModalEvents();

    // Delete modal events
    setupDeleteModalEvents();

    // Edit member modal events
    setupEditMemberModalEvents();

    // Add beneficiary modal events (basic - full handling in beneficiaryEvents.js)
    setupAddBeneficiaryModalBasicEvents();

    // Search functionality
    setupSearchEvents();

    // Export buttons
    setupExportEvents();

    logDebug('Member event listeners initialized');
}

// ============================================================================
// FORM EVENTS
// ============================================================================

/**
 * Setup member form submission events
 * @private
 */
function setupMemberFormEvents() {
    const memberForm = document.getElementById(FIELD_IDS.MEMBER_FORM);

    memberForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = getMemberFormData();

        // Validate required fields
        if (!validateRequiredFields({
            name: formData.name,
            id_number: formData.id_number,
            phone: formData.phone
        })) {
            showToast(ERROR_MESSAGES.REQUIRED_FIELDS, TOAST_TYPES.ERROR);
            return;
        }

        // Get authenticated user data
        const userData = getUserData();
        if (!userData || !userData.id) {
            showToast(ERROR_MESSAGES.AUTHENTICATION_REQUIRED, TOAST_TYPES.ERROR);
            window.location.href = '/login.html';
            return;
        }

        // Prepare member data for API
        const memberData = prepareMemberData(formData, userData.id, members[editIndex]);

        try {
            setMemberSubmitButtonState(true);

            if (editIndex >= 0) {
                // Update existing member
                await handleUpdateMember(memberData);
            } else {
                // Create new member
                await handleCreateMember(memberData);
            }

            // Reload members and refresh UI
            await refreshMembersData();
            clearMemberForm();

        } catch (error) {
            logError('Saving member', error);
            showToast(error.response?.data?.message || ERROR_MESSAGES.SAVING_MEMBER, TOAST_TYPES.ERROR);
        } finally {
            setMemberSubmitButtonState(false);
        }
    });
}

/**
 * Handle creating a new member
 * @private
 */
async function handleCreateMember(memberData) {
    const response = await createMember(memberData);
    logDebug('New member created', response);
    showToast(SUCCESS_MESSAGES.MEMBER_ADDED, TOAST_TYPES.SUCCESS);
}

/**
 * Handle updating an existing member
 * @private
 */
async function handleUpdateMember(memberData) {
    const memberId = members[editIndex].id;
    const response = await updateMember(memberId, memberData);
    logDebug('Member updated', response);
    showToast(SUCCESS_MESSAGES.MEMBER_UPDATED, TOAST_TYPES.SUCCESS);
    switchToAddMode();
}

/**
 * Refresh members data from API and re-render table
 * @private
 */
async function refreshMembersData() {
    members = await fetchMembers(true);
    saveMembers(members);
    const searchValue = document.getElementById(FIELD_IDS.MEMBER_SEARCH).value.trim();
    renderMembers(searchValue);
}

// ============================================================================
// EDIT CHOICE MODAL EVENTS
// ============================================================================

/**
 * Setup edit choice modal events (Edit Member or Edit Beneficiaries)
 * @private
 */
function setupEditChoiceModalEvents() {
    // Edit Member button
    document.getElementById(BUTTON_IDS.CHOICE_EDIT_MEMBER).addEventListener('click', function() {
        if (currentMemberIndex !== null) {
            openEditMemberModal(currentMemberIndex);
            closeEditChoiceModal();
        }
    });

    // Edit Beneficiaries button
    document.getElementById(BUTTON_IDS.CHOICE_EDIT_BEN).addEventListener('click', async function() {
        if (currentMemberIndex !== null) {
            await openManageBeneficiariesModal(currentMemberIndex);
            closeEditChoiceModal();
        }
    });

    // Cancel button
    document.getElementById(BUTTON_IDS.CHOICE_CANCEL).addEventListener('click', function() {
        closeEditChoiceModal();
    });
}

// ============================================================================
// DELETE MODAL EVENTS
// ============================================================================

/**
 * Setup delete confirmation modal events
 * @private
 */
function setupDeleteModalEvents() {
    // Confirm delete button
    document.getElementById(BUTTON_IDS.CONFIRM_DELETE).addEventListener('click', async function() {
        if (deleteIndex !== null) {
            await handleDeleteMember();
        }
    });

    // Cancel delete button
    document.getElementById(BUTTON_IDS.CANCEL_DELETE).addEventListener('click', function() {
        closeDeleteModal();
    });
}

/**
 * Handle deleting a member
 * @private
 */
async function handleDeleteMember() {
    const member = members[deleteIndex];
    const memberId = member.id;

    if (!memberId) {
        showToast(ERROR_MESSAGES.INVALID_MEMBER_ID, TOAST_TYPES.ERROR);
        closeDeleteModal();
        return;
    }

    try {
        logDebug('Deleting member', memberId);

        // Delete from API
        await deleteMember(memberId);

        // Remove from local storage only if API delete succeeds
        members.splice(deleteIndex, 1);
        saveMembers(members);

        showToast(SUCCESS_MESSAGES.MEMBER_DELETED, TOAST_TYPES.SUCCESS);

        // Re-render the table
        const searchValue = document.getElementById(FIELD_IDS.MEMBER_SEARCH).value.trim();
        renderMembers(searchValue);

        closeDeleteModal();
    } catch (error) {
        logError('Deleting member', error);
        showToast(error.response?.data?.message || ERROR_MESSAGES.DELETING_MEMBER, TOAST_TYPES.ERROR);
        closeDeleteModal();
    }
}

// ============================================================================
// EDIT MEMBER MODAL EVENTS
// ============================================================================

/**
 * Setup edit member modal events
 * @private
 */
function setupEditMemberModalEvents() {
    // Save button
    document.getElementById(BUTTON_IDS.SAVE_MEMBER_EDIT).addEventListener('click', async function() {
        await handleSaveMemberEdit();
    });

    // Cancel button
    document.getElementById(BUTTON_IDS.CANCEL_MEMBER_EDIT).addEventListener('click', function() {
        closeEditMemberModal();
    });
}

/**
 * Handle saving member edits from modal
 * @private
 */
async function handleSaveMemberEdit() {
    if (editIndex < 0) return;

    const formData = getEditMemberFormData();

    // Validate required fields
    if (!validateRequiredFields({
        name: formData.name,
        id_number: formData.id_number,
        phone: formData.phone
    })) {
        showToast(ERROR_MESSAGES.REQUIRED_FIELDS, TOAST_TYPES.ERROR);
        return;
    }

    // Get authenticated user data
    const userData = getUserData();
    if (!userData || !userData.id) {
        showToast(ERROR_MESSAGES.AUTHENTICATION_REQUIRED, TOAST_TYPES.ERROR);
        window.location.href = '/login.html';
        return;
    }

    // Prepare member data for API
    const memberData = prepareMemberData(formData, userData.id, members[editIndex]);

    try {
        const memberId = members[editIndex].id;
        logDebug('Updating member from modal', memberId, memberData);

        const response = await updateMember(memberId, memberData);

        if (response) {
            // Update the member in local array
            const updatedMember = normalizeMemberResponse(response);
            members[editIndex] = {
                ...updatedMember,
                beneficiaries: members[editIndex].beneficiaries || []
            };

            // Save to localStorage
            saveMembers(members);

            showToast(SUCCESS_MESSAGES.MEMBER_UPDATED, TOAST_TYPES.SUCCESS);
            const searchValue = document.getElementById(FIELD_IDS.MEMBER_SEARCH).value.trim();
            renderMembers(searchValue);
            closeEditMemberModal();
        } else {
            // Fallback: reload all members
            await refreshMembersData();
            closeEditMemberModal();
        }
    } catch (error) {
        logError('Updating member from modal', error);
        showToast(error.response?.data?.message || ERROR_MESSAGES.UPDATING_MEMBER, TOAST_TYPES.ERROR);
    }
}

// ============================================================================
// ADD BENEFICIARY MODAL EVENTS (BASIC)
// ============================================================================

/**
 * Setup basic add beneficiary modal events
 * Full beneficiary events are handled in beneficiaryEvents.js
 * @private
 */
function setupAddBeneficiaryModalBasicEvents() {
    // Cancel button
    document.getElementById(BUTTON_IDS.CANCEL_BENEFICIARY).addEventListener('click', function() {
        closeAddBeneficiaryModal();
    });
}

// ============================================================================
// SEARCH EVENTS
// ============================================================================

/**
 * Setup search input events
 * @private
 */
function setupSearchEvents() {
    const searchInput = document.getElementById(FIELD_IDS.MEMBER_SEARCH);

    // Use debounce to avoid excessive re-renders
    const debouncedSearch = debounce((value) => {
        renderMembers(value);
    }, 300);

    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value.trim());
    });
}

// ============================================================================
// EXPORT EVENTS
// ============================================================================

/**
 * Setup export button events
 * @private
 */
function setupExportEvents() {
    // PDF Export
    document.getElementById(BUTTON_IDS.EXPORT_PDF).addEventListener('click', function() {
        showToast('PDF export feature coming soon!', TOAST_TYPES.WARNING);
        // TODO: Implement PDF export using jsPDF
    });

    // Excel Export
    document.getElementById(BUTTON_IDS.EXPORT_EXCEL).addEventListener('click', function() {
        showToast('Excel export feature coming soon!', TOAST_TYPES.WARNING);
        // TODO: Implement Excel export using XLSX library
    });
}

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        setupMemberEvents,
        handleCreateMember,
        handleUpdateMember,
        handleDeleteMember,
        handleSaveMemberEdit,
        refreshMembersData
    };
}
