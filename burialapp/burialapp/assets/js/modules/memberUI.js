/**
 * Member UI Module
 * Handles all member-related rendering and DOM manipulation
 *
 * @author TSHILAPFENE BURIAL SOCIETY
 * @description Separated UI concerns from business logic for better maintainability
 */

// ============================================================================
// MODAL MANAGEMENT
// ============================================================================

/**
 * Show the edit choice modal (Edit Member or Edit Beneficiaries)
 *
 * @param {number} memberIndex - Index of the member in the members array
 *
 * @example
 * openEditChoiceModal(5);
 */
function openEditChoiceModal(memberIndex) {
    currentMemberIndex = memberIndex;
    showModal(MODALS.EDIT_CHOICE);
}

/**
 * Show the delete confirmation modal
 *
 * @param {number} memberIndex - Index of the member to delete
 *
 * @example
 * openDeleteModal(5);
 */
function openDeleteModal(memberIndex) {
    deleteIndex = memberIndex;
    showModal(MODALS.DELETE_MEMBER);
}

/**
 * Show the add beneficiary modal
 *
 * @param {number} memberIndex - Index of the member to add beneficiary to
 *
 * @example
 * openAddBeneficiaryModal(5);
 */
function openAddBeneficiaryModal(memberIndex) {
    currentMemberIndex = memberIndex;
    showModal(MODALS.ADD_BENEFICIARY);
}

/**
 * Show the edit member modal and populate with member data
 *
 * @param {number} memberIndex - Index of the member to edit
 *
 * @example
 * openEditMemberModal(5);
 */
function openEditMemberModal(memberIndex) {
    const member = members[memberIndex];

    // Populate form fields
    document.getElementById(FIELD_IDS.EDIT_MEMBER_ID).textContent = member.id || 'N/A';
    document.getElementById(FIELD_IDS.EDIT_MEMBER_NUMBER).value = member.member_number || member.memberNumber || '';
    document.getElementById(FIELD_IDS.EDIT_NAME).value = member.name || '';
    document.getElementById(FIELD_IDS.EDIT_ID_NUMBER).value = member.id_number || member.idNumber || '';
    document.getElementById(FIELD_IDS.EDIT_PHONE).value = member.phone || '';

    editIndex = memberIndex;
    showModal(MODALS.EDIT_MEMBER);
}

/**
 * Close the edit member modal and reset state
 *
 * @example
 * closeEditMemberModal();
 */
function closeEditMemberModal() {
    hideModal(MODALS.EDIT_MEMBER);
    editIndex = -1;
}

/**
 * Close the edit choice modal and reset state
 *
 * @example
 * closeEditChoiceModal();
 */
function closeEditChoiceModal() {
    hideModal(MODALS.EDIT_CHOICE);
    currentMemberIndex = null;
}

/**
 * Close the delete modal and reset state
 *
 * @example
 * closeDeleteModal();
 */
function closeDeleteModal() {
    hideModal(MODALS.DELETE_MEMBER);
    deleteIndex = null;
}

/**
 * Close the add beneficiary modal and reset state
 *
 * @example
 * closeAddBeneficiaryModal();
 */
function closeAddBeneficiaryModal() {
    hideModal(MODALS.ADD_BENEFICIARY);
    currentMemberIndex = null;
}

// ============================================================================
// MEMBER RENDERING
// ============================================================================

/**
 * Render the members list table with optional search filter
 *
 * @param {string} [filter=''] - Search query to filter members
 *
 * @example
 * renderMembers(); // Render all members
 * renderMembers('John'); // Filter by name containing 'John'
 */
function renderMembers(filter = '') {
    const memberList = document.getElementById(FIELD_IDS.MEMBER_LIST);
    memberList.innerHTML = '';

    const qRaw = (filter || '').trim();
    const q = qRaw.toLowerCase();

    // Sort members by member number
    const sortedMembers = sortMembersByNumber(members);

    sortedMembers.forEach((member, index) => {
        const name = (member.name || '').toLowerCase();
        const memNum = (member.member_number || member.memberNumber || '').toString();
        const show = qRaw === '' || name.includes(q) || memNum.includes(qRaw);

        if (!show) return;

        const row = createMemberRow(member, index);
        memberList.appendChild(row);
    });

    // Attach event listeners to action buttons
    attachMemberActionListeners();
}

/**
 * Create a table row element for a member
 *
 * @param {Object} member - Member object
 * @param {number} index - Index of member in array
 * @returns {HTMLTableRowElement} Table row element
 * @private
 *
 * @example
 * const row = createMemberRow(memberObject, 5);
 */
function createMemberRow(member, index) {
    const beneficiariesHtml = renderBeneficiariesSummary(member.beneficiaries);

    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="index-col">${escHtml(member.id || 'N/A')}</td>
        <td class="index-col">${escHtml(member.member_number || member.memberNumber || 'N/A')}</td>
        <td><span class="member-name">${escHtml(member.name || '')}</span></td>
        <td>${escHtml(member.id_number || member.idNumber || '')}</td>
        <td>${escHtml(member.phone || '')}</td>
        <td>${beneficiariesHtml}</td>
        <td>
            <button class="beneficiary-btn" data-index="${index}">
                <i class="fas fa-user-plus"></i> Add Beneficiary
            </button>
            <button class="edit-btn" data-index="${index}">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="delete-btn" data-index="${index}">
                <i class="fas fa-trash"></i> Delete
            </button>
        </td>
    `;
    return row;
}

/**
 * Render beneficiaries summary for display in member row
 *
 * @param {Array} beneficiaries - Array of beneficiary objects
 * @returns {string} HTML string for beneficiaries display
 * @private
 *
 * @example
 * const html = renderBeneficiariesSummary(member.beneficiaries);
 */
function renderBeneficiariesSummary(beneficiaries) {
    if (!beneficiaries || beneficiaries.length === 0) {
        return '<span class="small-muted">No beneficiaries added</span>';
    }

    return beneficiaries.map(ben => `
        <div class="beneficiaries-list">
            <div><strong>${escHtml(ben.name)}</strong></div>
            <div class="beneficiary-id">ID: ${escHtml(ben.id_number || ben.id)} | ${escHtml(ben.relationship)}</div>
        </div>
    `).join('');
}

/**
 * Attach event listeners to member action buttons
 * Called after rendering members table
 * @private
 *
 * @example
 * attachMemberActionListeners();
 */
function attachMemberActionListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            openEditChoiceModal(index);
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            openDeleteModal(index);
        });
    });

    // Add beneficiary buttons
    document.querySelectorAll('.beneficiary-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            openAddBeneficiaryModal(index);
        });
    });
}

// ============================================================================
// FORM MANAGEMENT
// ============================================================================

/**
 * Populate the member form with member data (for editing)
 *
 * @param {Object} member - Member object
 *
 * @example
 * populateMemberForm(memberData);
 */
function populateMemberForm(member) {
    document.getElementById(FIELD_IDS.MEMBER_NUMBER).value = member.member_number || member.memberNumber || '';
    document.getElementById(FIELD_IDS.NAME).value = member.name || '';
    document.getElementById(FIELD_IDS.ID_NUMBER).value = member.id_number || member.idNumber || '';
    document.getElementById(FIELD_IDS.PHONE).value = member.phone || '';
}

/**
 * Clear all member form fields
 *
 * @example
 * clearMemberForm();
 */
function clearMemberForm() {
    document.getElementById(FIELD_IDS.MEMBER_FORM).reset();
}

/**
 * Get member form data as an object
 *
 * @returns {Object} Member data from form
 *
 * @example
 * const data = getMemberFormData();
 */
function getMemberFormData() {
    return {
        member_number: document.getElementById(FIELD_IDS.MEMBER_NUMBER).value.trim(),
        name: document.getElementById(FIELD_IDS.NAME).value.trim(),
        id_number: document.getElementById(FIELD_IDS.ID_NUMBER).value.trim(),
        phone: document.getElementById(FIELD_IDS.PHONE).value.trim()
    };
}

/**
 * Get edit member form data as an object
 *
 * @returns {Object} Member data from edit form
 *
 * @example
 * const data = getEditMemberFormData();
 */
function getEditMemberFormData() {
    return {
        member_number: document.getElementById(FIELD_IDS.EDIT_MEMBER_NUMBER).value.trim(),
        name: document.getElementById(FIELD_IDS.EDIT_NAME).value.trim(),
        id_number: document.getElementById(FIELD_IDS.EDIT_ID_NUMBER).value.trim(),
        phone: document.getElementById(FIELD_IDS.EDIT_PHONE).value.trim()
    };
}

/**
 * Set submit button state (loading/disabled or normal)
 *
 * @param {boolean} loading - Whether to show loading state
 *
 * @example
 * setMemberSubmitButtonState(true); // Show loading
 * setMemberSubmitButtonState(false); // Show normal
 */
function setMemberSubmitButtonState(loading) {
    const submitBtn = document.getElementById(FIELD_IDS.MEMBER_SUBMIT);

    if (loading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Member';
    }
}

/**
 * Switch submit button to "Add Member" mode
 *
 * @example
 * switchToAddMode();
 */
function switchToAddMode() {
    const submitBtn = document.getElementById(FIELD_IDS.MEMBER_SUBMIT);
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Member';
    submitBtn.classList.remove('update-btn-blue');
    submitBtn.classList.add('add-btn-green');
    editIndex = -1;
}

/**
 * Switch submit button to "Update Member" mode
 *
 * @example
 * switchToUpdateMode();
 */
function switchToUpdateMode() {
    const submitBtn = document.getElementById(FIELD_IDS.MEMBER_SUBMIT);
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Member';
    submitBtn.classList.remove('add-btn-green');
    submitBtn.classList.add('update-btn-blue');
}

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        // Modal management
        openEditChoiceModal,
        openDeleteModal,
        openAddBeneficiaryModal,
        openEditMemberModal,
        closeEditMemberModal,
        closeEditChoiceModal,
        closeDeleteModal,
        closeAddBeneficiaryModal,
        // Rendering
        renderMembers,
        createMemberRow,
        renderBeneficiariesSummary,
        attachMemberActionListeners,
        // Form management
        populateMemberForm,
        clearMemberForm,
        getMemberFormData,
        getEditMemberFormData,
        setMemberSubmitButtonState,
        switchToAddMode,
        switchToUpdateMode
    };
}
