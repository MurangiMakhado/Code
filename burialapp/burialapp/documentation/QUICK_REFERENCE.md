# Members Module - Quick Reference Guide

**Quick access to common code patterns and solutions**

---

## 📋 Table of Contents

1. [File Locations](#file-locations)
2. [Common Code Patterns](#common-code-patterns)
3. [API Calls Cheat Sheet](#api-calls-cheat-sheet)
4. [UI Operations](#ui-operations)
5. [Debugging Commands](#debugging-commands)
6. [Common Fixes](#common-fixes)

---

## 📁 File Locations

### Where to make changes:

| What to Change | File to Edit |
|---------------|--------------|
| Add new HTML input field | `members.html` |
| Add member functionality | `assets/js/modules/memberEvents.js` |
| Change member display | `assets/js/modules/memberUI.js` |
| Add beneficiary functionality | `assets/js/modules/beneficiaryEvents.js` |
| Change beneficiary display | `assets/js/modules/beneficiaryUI.js` |
| Add validation function | `assets/js/utils/helpers.js` |
| Add API endpoint | `assets/js/config/constants.js` |
| Add error message | `assets/js/config/constants.js` |
| Fix member API call | `assets/js/services/memberService.js` |
| Fix beneficiary API call | `assets/js/services/beneficiaryService.js` |
| Change localStorage logic | `assets/js/utils/storage.js` |

---

## 🔧 Common Code Patterns

### 1. Show Toast Notification

```javascript
// Success message
showToast('Member added successfully!', 'success');

// Error message
showToast('Failed to save member', 'error');

// Warning message
showToast('Please fill all required fields', 'warning');

// Info message
showToast('Loading data...', 'info');
```

### 2. API Call Pattern

```javascript
// Standard API call with error handling
async function myApiCall() {
    try {
        showLoading(); // Optional: show loading spinner

        const result = await apiFunction(data);

        // Update global state
        members.push(result);
        saveMembers(members);

        // Update UI
        renderMembers();
        hideLoading();

        showToast('Success!', 'success');
    } catch (error) {
        logError('Description of action', error);
        hideLoading();
        showToast('Failed. Please try again.', 'error');
    }
}
```

### 3. Form Data Collection

```javascript
// Get form data from inputs
const memberData = {
    member_number: document.getElementById('memberNumber').value,
    name: document.getElementById('name').value,
    id_number: document.getElementById('idNumber').value,
    phone: document.getElementById('phone').value
};
```

### 4. Modal Operations

```javascript
// Open modal
showModal('editMemberModal');

// Close modal
hideModal('editMemberModal');

// Pre-fill modal with data
document.getElementById('editName').value = member.name;
document.getElementById('editIdNumber').value = member.id_number;
showModal('editMemberModal');
```

### 5. Validation Pattern

```javascript
// Validate before processing
function validateMemberData(data) {
    if (!data.name || data.name.trim() === '') {
        showToast('Name is required', 'error');
        return false;
    }

    if (!isValidIdNumber(data.id_number)) {
        showToast('Invalid ID number. Must be 13 digits.', 'error');
        return false;
    }

    if (!isValidPhoneNumber(data.phone)) {
        showToast('Invalid phone number format', 'error');
        return false;
    }

    return true;
}

// Use in event handler
if (!validateMemberData(memberData)) {
    return; // Stop processing
}
```

### 6. Event Listener Setup

```javascript
// Add event listener
document.getElementById('myButton').addEventListener('click', function(e) {
    e.preventDefault(); // Prevent default behavior
    myHandlerFunction();
});

// Form submission
document.getElementById('myForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    await handleFormSubmit();
});
```

### 7. Array Operations

```javascript
// Add item to array
members.push(newMember);

// Update item in array (by index)
members[index] = updatedMember;

// Remove item from array (by index)
members.splice(index, 1);

// Find item in array
const member = members.find(m => m.id === memberId);

// Find index in array
const index = members.findIndex(m => m.id === memberId);

// Filter array
const activemembers = members.filter(m => m.status === 'active');

// Map array to new format
const names = members.map(m => m.name);
```

---

## 🌐 API Calls Cheat Sheet

### Members API

```javascript
// GET all members
const members = await fetchMembers(false);

// GET all members with beneficiaries
const members = await fetchMembers(true);

// GET single member
const member = await fetchMemberById(5);

// POST new member
const newMember = await createMember({
    member_number: '12345',
    name: 'John Doe',
    id_number: '9001010000000',
    phone: '0812345678'
});

// PUT update member
const updated = await updateMember(5, {
    name: 'Jane Doe',
    phone: '0819876543'
});

// DELETE member
await deleteMember(5);
```

### Beneficiaries API

```javascript
// GET beneficiaries for member
const beneficiaries = await fetchBeneficiaries(memberId);

// POST new beneficiary
const newBen = await createBeneficiary(memberId, {
    name: 'Jane Doe',
    id_number: '0001010000000',
    relationship: 'Spouse',
    phone: '0812345679',
    address: '123 Main St'
});

// PUT update beneficiary
const updated = await updateBeneficiary(memberId, beneficiaryId, {
    phone: '0819876543'
});

// DELETE beneficiary
await deleteBeneficiary(memberId, beneficiaryId);
```

---

## 🎨 UI Operations

### Rendering

```javascript
// Render all members
renderMembers();

// Render beneficiaries list
renderBeneficiariesList(beneficiaries, memberId);

// Clear form
document.getElementById('memberForm').reset();

// Update table cell
document.getElementById('cellId').textContent = 'New Value';
```

### Show/Hide Elements

```javascript
// Hide element
document.getElementById('myElement').style.display = 'none';

// Show element (block)
document.getElementById('myElement').style.display = 'block';

// Show element (flex)
document.getElementById('myElement').style.display = 'flex';

// Toggle visibility
const element = document.getElementById('myElement');
element.style.display = element.style.display === 'none' ? 'block' : 'none';
```

### Add/Remove CSS Classes

```javascript
// Add class
element.classList.add('active');

// Remove class
element.classList.remove('active');

// Toggle class
element.classList.toggle('active');

// Check if has class
if (element.classList.contains('active')) {
    // Do something
}
```

---

## 🐛 Debugging Commands

### Browser Console Commands

```javascript
// Show module information
logModuleInfo()

// Check global state
console.log('Members:', members);
console.log('Current Index:', currentMemberIndex);
console.log('Beneficiaries:', currentBeneficiaries);

// Check localStorage
console.log('Cached Members:', localStorage.getItem('members'));
console.log('Auth Token:', localStorage.getItem('authToken'));

// Check authentication
console.log('Is Authenticated:', isAuthenticated());

// Test toast
showToast('Test message', 'success');

// Test API call
fetchMembers(true).then(m => console.log('Members:', m));
```

### Enable Debug Mode

In [constants.js](../assets/js/config/constants.js):

```javascript
const DEBUG_MODE = true; // Set to true for detailed logging
```

### Check API Response

```javascript
// In browser Network tab:
// 1. Press F12
// 2. Click "Network" tab
// 3. Filter by "XHR" or "Fetch"
// 4. Click on request to see details
// 5. Check "Response" tab for data
```

---

## 🔨 Common Fixes

### Fix 1: Members Not Loading

```javascript
// Check authentication
const token = localStorage.getItem('authToken');
if (!token) {
    window.location.href = '/login.html';
}

// Fallback to localStorage
members = getMembers();
renderMembers();
```

### Fix 2: Form Not Submitting

```javascript
// Check form ID
const form = document.getElementById('memberForm');
console.log('Form found:', form !== null);

// Re-attach event listener
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('Form submitted!');
    await handleMemberFormSubmit(e);
});
```

### Fix 3: Modal Not Showing

```javascript
// Force show modal
const modal = document.getElementById('editMemberModal');
modal.style.display = 'flex';

// Check if modal exists
console.log('Modal exists:', modal !== null);
```

### Fix 4: Data Not Saving to localStorage

```javascript
// Check localStorage support
if (typeof(Storage) !== "undefined") {
    console.log('LocalStorage supported');
    saveMembers(members);
} else {
    console.error('LocalStorage NOT supported');
}

// Clear and retry
localStorage.removeItem('members');
saveMembers(members);

// Check if saved
console.log('Saved members:', getMembers());
```

### Fix 5: API Call Failing

```javascript
// Check API base URL
console.log('API Base URL:', API_BASE_URL);

// Check request headers
console.log('Auth Token:', localStorage.getItem('authToken'));

// Manually test API call
fetch('https://burial.stapps.co.za/api/members', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
    }
})
.then(r => r.json())
.then(d => console.log('API Response:', d))
.catch(e => console.error('API Error:', e));
```

### Fix 6: Wrong Member Being Edited/Deleted

```javascript
// Always use the index parameter
function editMember(index) {
    // ✅ CORRECT
    const member = members[index];

    // ❌ WRONG - uses wrong index
    const member = members[currentMemberIndex];
}

// When calling from HTML
<button onclick="editMember(${index})">Edit</button>
```

### Fix 7: Beneficiaries Not Showing

```javascript
// Check member has beneficiaries
const member = members[index];
console.log('Member:', member);
console.log('Beneficiaries:', member.beneficiaries);

// Re-fetch with beneficiaries
const members = await fetchMembers(true); // true = include beneficiaries
```

---

## 📝 Code Snippets

### Add New Validation Function

```javascript
// In assets/js/utils/helpers.js

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
```

### Add New API Endpoint

```javascript
// In assets/js/config/constants.js
const API_ENDPOINTS = {
    MEMBERS: 'members',
    BENEFICIARIES: 'beneficiaries',
    NEW_ENDPOINT: 'new-endpoint' // Add here
};
```

### Add New Service Function

```javascript
// In assets/js/services/memberService.js

/**
 * Search members by name
 * @param {string} searchTerm - Search query
 * @returns {Promise<Array>} - Filtered members
 */
async function searchMembers(searchTerm) {
    try {
        const response = await api.get(API_ENDPOINTS.MEMBERS, {
            search: searchTerm
        });
        return response;
    } catch (error) {
        logError('Searching members', error);
        throw error;
    }
}
```

### Add New Event Handler

```javascript
// In assets/js/modules/memberEvents.js

/**
 * Handle member search
 * @param {Event} e - Input event
 */
function handleMemberSearch(e) {
    const searchTerm = e.target.value.toLowerCase();

    if (searchTerm === '') {
        renderMembers(); // Show all
        return;
    }

    const filtered = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm) ||
        m.member_number.includes(searchTerm)
    );

    renderFilteredMembers(filtered);
}

// Attach in setupMemberEvents()
document.getElementById('memberSearch')
    .addEventListener('input', handleMemberSearch);
```

---

## 🎯 Testing Checklist

When making changes, test these scenarios:

### Member Operations
- [ ] Add new member
- [ ] Edit member details
- [ ] Delete member
- [ ] Search members
- [ ] View member beneficiaries

### Beneficiary Operations
- [ ] Add beneficiary to member
- [ ] Edit beneficiary details
- [ ] Delete beneficiary
- [ ] View all beneficiaries for member

### UI Operations
- [ ] All modals open correctly
- [ ] All modals close correctly (ESC, click outside, cancel button)
- [ ] Forms clear after submission
- [ ] Toast notifications appear
- [ ] Loading spinner shows during API calls

### Data Persistence
- [ ] Data saves to localStorage
- [ ] Data loads from localStorage on refresh
- [ ] Data syncs with API correctly

### Error Handling
- [ ] Invalid input shows error message
- [ ] API failures show error toast
- [ ] Network errors handled gracefully
- [ ] Authentication errors redirect to login

---

## 📚 Related Documents

- [Full Documentation](./MEMBERS_MODULE.md) - Comprehensive guide
- [CLAUDE.md](../CLAUDE.md) - Project instructions
- [members.html](../members.html) - Main HTML file

---

**Last Updated:** December 16, 2025
**Quick Reference Version:** 1.0
