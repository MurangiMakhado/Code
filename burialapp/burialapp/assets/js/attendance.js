// Configuration
const API_BASE_URL = "http://127.0.0.1:8000/api/";
let allMembers = [];
let attendanceData = [];
let currentAttendanceDate = new Date().toISOString().split('T')[0];
let selectedMonth = '';
let selectedYear = '';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing attendance');

    // Set current date to today
    currentAttendanceDate = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = currentAttendanceDate;

    console.log('Initializing attendance with date:', currentAttendanceDate);

    // Load existing attendance data from localStorage
    loadAttendanceDataFromStorage();

    // Load members after DOM is ready
    setTimeout(() => {
        console.log('Calling loadMembers()');
        loadMembers();
        loadTodayAttendance();
        updateAttendanceStats();
    }, 100);

    // Set up date change listener
    document.getElementById('attendanceDate').addEventListener('change', function(e) {
        currentAttendanceDate = e.target.value;
        console.log('Date changed to:', currentAttendanceDate);
        loadAttendanceForDate(currentAttendanceDate);
    });
}); // FIXED: Added missing closing parenthesis and bracket

function createSampleMembers() {
    return [
        {
            id: 1,
            memberId: "M001",
            firstName: "John",
            lastName: "Doe",
            name: "John Doe",
            phone: "+27 71 123 4567",
            cellphone: "+27 71 123 4567",
            status: "Active",
            active: true
        },
        {
            id: 2,
            memberId: "M002",
            firstName: "Jane",
            lastName: "Smith",
            name: "Jane Smith",
            phone: "+27 72 234 5678",
            cellphone: "+27 72 234 5678",
            status: "Active",
            active: true
        },
        {
            id: 3,
            memberId: "M003",
            firstName: "David",
            lastName: "Johnson",
            name: "David Johnson",
            phone: "+27 73 345 6789",
            cellphone: "+27 73 345 6789",
            status: "Active",
            active: true
        },
        {
            id: 4,
            memberId: "M004",
            firstName: "Mary",
            lastName: "Williams",
            name: "Mary Williams",
            phone: "+27 74 456 7890",
            cellphone: "+27 74 456 7890",
            status: "Active",
            active: true
        },
        {
            id: 5,
            memberId: "M005",
            firstName: "Robert",
            lastName: "Brown",
            name: "Robert Brown",
            phone: "+27 75 567 8901",
            cellphone: "+27 75 567 8901",
            status: "Active",
            active: true
        }
    ];
}

// Load attendance data from localStorage
function loadAttendanceDataFromStorage() {
    try {
        // Load all attendance records from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('attendance_')) {
                const date = key.replace('attendance_', '');
                const records = JSON.parse(localStorage.getItem(key) || '[]');
                // Merge with existing attendanceData
                records.forEach(record => {
                    const existingIndex = attendanceData.findIndex(r =>
                        r.memberId === record.memberId && r.date === record.date
                    );
                    if (existingIndex === -1) {
                        attendanceData.push(record);
                    }
                });
            }
        }
        console.log('Loaded attendance data from storage:', attendanceData);
    } catch (error) {
        console.error('Error loading attendance data from storage:', error);
    }
}

// Load all members from the API
async function loadMembers() {
    try {
        showToast('Loading members...', 'info');

        // 1) Try in-memory/module/localStorage sources first to avoid network failures
        let members = [];

        // Prefer module/local getter if available
        if (typeof getMembers === 'function') {
            members = getMembers() || [];
        }

        // If still empty, try memberService.fetchMembers() if available (will call API but uses service conventions)
        if ((!members || members.length === 0) && typeof fetchMembers === 'function') {
            try {
                members = await fetchMembers(true);
            } catch (e) {
                console.warn('fetchMembers failed, will try other fallbacks', e);
            }
        }

        // If still empty, try reading common localStorage keys
        if ((!members || members.length === 0)) {
            const raw = localStorage.getItem('members') || localStorage.getItem('burial_members');
            if (raw) {
                try {
                    members = JSON.parse(raw);
                } catch (e) {
                    members = [];
                }
            }
        }

        // If still no members, create sample data for testing
        if ((!members || members.length === 0)) {
            members = createSampleMembers();
            // Save to localStorage for future use
            localStorage.setItem('members', JSON.stringify(members));
        }

        // If we have members from any of the above, use them and skip direct fetch
        if (members && members.length > 0) {
            allMembers = members;

            populateAttendanceList();
            showToast('Loaded ' + allMembers.length + ' active members', 'success');
            return;
        }

        // 2) Last resort: try network fetch using stored auth token name used across the app
        const token = localStorage.getItem('authToken') || localStorage.getItem('jwt_token');
        if (!token) {
            showToast('Please login first', 'error');
            window.location.href = 'login.html';
            return;
        }

        // If apiService.get is available, use it (it wraps axios)
        let data = null;
        if (typeof get === 'function') {
            const resp = await get('members', { with_beneficiaries: true });
            data = resp && resp.data ? (resp.data.data || resp.data) : null;
        } else {
            const response = await fetch(`${API_BASE_URL}members`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load members from API');
            }

            data = await response.json();
        }

        allMembers = Array.isArray(data) ? data : (data && data.members) || (data && data.data) || [];

    } catch (error) {
        console.error('Error loading members:', error);
        showToast('Failed to load members', 'error');

        // Fallback: Try to load from localStorage if API fails
        const storedMembers = localStorage.getItem('burial_members');
        if (storedMembers) {
            allMembers = JSON.parse(storedMembers);
            populateAttendanceList();
            showToast('Loaded members from backup', 'warning');
        }
    }
}

// Populate the attendance list with checkboxes
function populateAttendanceList() {
    const attendanceList = document.getElementById('attendanceList');

    if (!attendanceList) {
        console.error('attendanceList element not found!');
        return;
    }

    attendanceList.innerHTML = '';

    if (allMembers.length === 0) {
        attendanceList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-light);">
                <i class="fas fa-users-slash" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>No members found</h3>
                <p>Add members first in the Members section</p>
                <button class="btn btn-primary" onclick="window.location.href='members.html'">
                    <i class="fas fa-plus"></i> Add Members
                </button>
            </div>
        `;
        return;
    }

    allMembers.forEach(member => {
        const isPresent = attendanceData.some(record =>
            record.memberId === member.id &&
            record.date === currentAttendanceDate
        );

        const memberDiv = document.createElement('div');
        memberDiv.className = 'attendance-member ' + (isPresent ? 'attendance-member-present' : 'attendance-member-absent');
        memberDiv.innerHTML = `
            <input type="checkbox"
                   id="member_${member.id}"
                   ${isPresent ? 'checked' : ''}
                   onchange="toggleAttendance(${member.id}, this.checked)">
            <label for="member_${member.id}">
                <strong>${member.firstName || member.name || ''} ${member.lastName || ''}</strong>
                <span style="display: block; font-size: 0.9em; color: var(--text-light); margin-top: 4px;">
                    ID: ${member.memberId || member.id} |
                    Phone: ${member.phone || member.cellphone || 'N/A'} |
                    Status: <span class="status-badge ${member.status === 'Active' ? 'status-paid' : 'status-pending'}">
                        ${member.status || 'Unknown'}
                    </span>
                </span>
            </label>
        `;

        attendanceList.appendChild(memberDiv);
    });
}

// Toggle attendance status for a member
function toggleAttendance(memberId, isPresent) {
    // Convert memberId to number if it's a string
    const memberIdNum = parseInt(memberId);

    const memberIndex = attendanceData.findIndex(record =>
        record.memberId === memberIdNum &&
        record.date === currentAttendanceDate
    );

    if (isPresent) {
        if (memberIndex === -1) {
            // Add new attendance record
            const member = allMembers.find(m => m.id === memberIdNum);
            if (member) {
                attendanceData.push({
                    memberId: memberIdNum,
                    memberName: ((member.firstName || member.name || '') + ' ' + (member.lastName || '')).trim(),
                    date: currentAttendanceDate,
                    status: 'Present',
                    timestamp: new Date().toISOString()
                });
            } else {
                console.error('Member not found:', memberIdNum);
                showToast('Member not found', 'error');
                return;
            }
        }
    } else {
        if (memberIndex !== -1) {
            // Remove attendance record
            attendanceData.splice(memberIndex, 1);
        }
    }

    // Update UI
    const checkbox = document.querySelector(`input[id="member_${memberId}"]`);
    if (checkbox) {
        const memberDiv = checkbox.closest('.attendance-member');
        if (memberDiv) {
            if (isPresent) {
                memberDiv.classList.remove('attendance-member-absent');
                memberDiv.classList.add('attendance-member-present');
            } else {
                memberDiv.classList.remove('attendance-member-present');
                memberDiv.classList.add('attendance-member-absent');
            }
        }
    }

    updateAttendanceStats();
}

// Mark all members as present
function markAllPresent() {
    allMembers.forEach(member => {
        const existingIndex = attendanceData.findIndex(record => 
            record.memberId === member.id && 
            record.date === currentAttendanceDate
        );
        
        if (existingIndex === -1) {
            attendanceData.push({
                memberId: member.id,
                memberName: ((member.firstName || member.name || '') + ' ' + (member.lastName || '')).trim(),
                date: currentAttendanceDate,
                status: 'Present',
                timestamp: new Date().toISOString()
            });
        }
        
        // Update checkbox
        const checkbox = document.getElementById(`member_${member.id}`);
        if (checkbox) checkbox.checked = true;
    });
    
    // Refresh UI
    populateAttendanceList();
    updateAttendanceStats();
    showToast('All members marked as present', 'success');
}

// Clear all attendance
function clearAllAttendance() {
    if (confirm('Are you sure you want to clear all attendance for today?')) {
        // Remove only today's attendance records
        attendanceData = attendanceData.filter(record => record.date !== currentAttendanceDate);
        
        // Uncheck all checkboxes
        allMembers.forEach(member => {
            const checkbox = document.getElementById(`member_${member.id}`);
            if (checkbox) checkbox.checked = false;
        });
        
        // Refresh UI
        populateAttendanceList();
        updateAttendanceStats();
        showToast('Attendance cleared for today', 'warning');
    }
}

// Save attendance to API
async function saveAttendance() {
    try {
        showToast('Saving attendance...', 'info');

        const token = localStorage.getItem('authToken') || localStorage.getItem('jwt_token');

        // Get today's attendance records
        const todaysAttendance = attendanceData.filter(record => record.date === currentAttendanceDate);

        console.log('Current attendance date:', currentAttendanceDate);
        console.log('All attendance data:', attendanceData);
        console.log('Today\'s attendance:', todaysAttendance);

        if (todaysAttendance.length === 0) {
            showToast('No attendance to save', 'warning');
            return;
        }

        // Try to save to API first
        let apiSuccess = false;
        if (token) {
            try {
                const response = await fetch(`${API_BASE_URL}attendance`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        date: currentAttendanceDate,
                        attendance: todaysAttendance,
                        totalPresent: todaysAttendance.length,
                        totalMembers: allMembers.length
                    })
                });

                if (response.ok) {
                    apiSuccess = true;
                    showToast('Attendance saved for ' + todaysAttendance.length + ' members', 'success');
                }
            } catch (apiError) {
                console.log('API not available, saving locally:', apiError);
            }
        }

        // Always save to localStorage as backup
        localStorage.setItem(`attendance_${currentAttendanceDate}`, JSON.stringify(todaysAttendance));

        // Update attendance history
        updateAttendanceHistory();

        if (!apiSuccess) {
            showToast('Attendance saved locally for ' + todaysAttendance.length + ' members', 'success');
        }

    } catch (error) {
        console.error('Error saving attendance:', error);

        // Fallback: Save to localStorage
        const todaysAttendance = attendanceData.filter(record => record.date === currentAttendanceDate);
        localStorage.setItem(`attendance_${currentAttendanceDate}`, JSON.stringify(todaysAttendance));

        showToast('Attendance saved locally for ' + todaysAttendance.length + ' members', 'success');
    } // FIXED: Added missing closing brace
}

// Load today's attendance
async function loadTodayAttendance() {
    try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('jwt_token');
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}attendance?date=${currentAttendanceDate}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.attendance && Array.isArray(data.attendance)) {
                // Merge with existing attendanceData
                data.attendance.forEach(record => {
                    const existingIndex = attendanceData.findIndex(r => 
                        r.memberId === record.memberId && 
                        r.date === record.date
                    );
                    
                    if (existingIndex === -1) {
                        attendanceData.push(record);
                    }
                });
            }
        }
        
        // Also check localStorage
        const localAttendance = localStorage.getItem(`attendance_${currentAttendanceDate}`);
        if (localAttendance) {
            const parsedAttendance = JSON.parse(localAttendance);
            parsedAttendance.forEach(record => {
                const existingIndex = attendanceData.findIndex(r => 
                    r.memberId === record.memberId && 
                    r.date === record.date
                );
                
                if (existingIndex === -1) {
                    attendanceData.push(record);
                }
            });
        }
        
        populateAttendanceList();
        
    } catch (error) {
        console.error('Error loading today\'s attendance:', error);
    }
}

// Load attendance for specific date
async function loadAttendanceForDate(date) {
    currentAttendanceDate = date;
    
    try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('jwt_token');
        if (!token) return;
        
        // Clear existing checkboxes for the new date
        allMembers.forEach(member => {
            const checkbox = document.getElementById(`member_${member.id}`);
            if (checkbox) checkbox.checked = false;
        });
        
        // Load from API
        const response = await fetch(`${API_BASE_URL}attendance?date=${date}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.attendance && Array.isArray(data.attendance)) {
                // Update attendanceData for this date
                // First remove existing records for this date
                attendanceData = attendanceData.filter(record => record.date !== date);
                
                // Add new records
                data.attendance.forEach(record => {
                    attendanceData.push(record);
                });
            }
        }
        
        // Check localStorage
        const localAttendance = localStorage.getItem(`attendance_${date}`);
        if (localAttendance) {
            const parsedAttendance = JSON.parse(localAttendance);
            // Remove existing for this date
            attendanceData = attendanceData.filter(record => record.date !== date);
            
            // Add from localStorage
            parsedAttendance.forEach(record => {
                attendanceData.push(record);
            });
        }
        
        populateAttendanceList();
        showToast('Loaded attendance for ' + formatDate(date), 'info');
        
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

// Update attendance statistics
function updateAttendanceStats() {
    const todaysAttendance = attendanceData.filter(record => record.date === currentAttendanceDate);
    const presentCount = todaysAttendance.length;
    const absentCount = allMembers.length - presentCount;
    const attendanceRate = allMembers.length > 0 ? Math.round((presentCount / allMembers.length) * 100) : 0;
    
    const statsContainer = document.getElementById('attendanceStats');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="attendance-stat present">
            <h4><i class="fas fa-user-check"></i> Present</h4>
            <div class="value">${presentCount}</div>
            <div class="small-muted">Members attended today</div>
        </div>
        <div class="attendance-stat absent">
            <h4><i class="fas fa-user-times"></i> Absent</h4>
            <div class="value">${absentCount}</div>
            <div class="small-muted">Members not attended</div>
        </div>
        <div class="attendance-stat rate">
            <h4><i class="fas fa-percentage"></i> Attendance Rate</h4>
            <div class="attendance-rate-value">${attendanceRate}%</div>
            <div class="small-muted">Percentage of members present</div>
        </div>
        <div class="attendance-stat">
            <h4><i class="fas fa-users"></i> Total Members</h4>
            <div class="value">${allMembers.length}</div>
            <div class="small-muted">Active members in system</div>
        </div>
    `;
}

// Search attendance members
function searchAttendanceMembers() {
    const searchTerm = document.getElementById('attendanceSearch').value.toLowerCase();
    const members = document.querySelectorAll('.attendance-member');
    
    members.forEach(member => {
        const label = member.querySelector('label');
        const text = label.textContent.toLowerCase();
        
        if (text.includes(searchTerm)) {
            member.style.display = 'flex';
        } else {
            member.style.display = 'none';
        }
    });
}

// Show attendance statistics modal
async function showAttendanceStats() {
    const todaysAttendance = attendanceData.filter(record => record.date === currentAttendanceDate);
    const presentCount = todaysAttendance.length;
    const absentCount = allMembers.length - presentCount;
    const attendanceRate = allMembers.length > 0 ? Math.round((presentCount / allMembers.length) * 100) : 0;
    
    // Get monthly stats
    const monthlyStats = await getMonthlyAttendanceStats();
    
    const modalContent = document.getElementById('statsModalContent');
    modalContent.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h3 style="color: var(--secondary); margin-bottom: 1rem;">
                <i class="fas fa-calendar-day"></i> Today's Statistics (${formatDate(currentAttendanceDate)})
            </h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: rgba(39, 174, 96, 0.1); padding: 1rem; border-radius: 8px;">
                    <div style="font-size: 0.9rem; color: var(--text-light);">Present</div>
                    <div style="font-size: 2rem; font-weight: bold; color: var(--success);">${presentCount}</div>
                </div>
                <div style="background: rgba(231, 76, 60, 0.1); padding: 1rem; border-radius: 8px;">
                    <div style="font-size: 0.9rem; color: var(--text-light);">Absent</div>
                    <div style="font-size: 2rem; font-weight: bold; color: var(--accent);">${absentCount}</div>
                </div>
            </div>
            
            <div style="background: rgba(52, 152, 219, 0.1); padding: 1rem; border-radius: 8px;">
                <div style="font-size: 0.9rem; color: var(--text-light);">Attendance Rate</div>
                <div style="font-size: 2rem; font-weight: bold; color: var(--secondary);">${attendanceRate}%</div>
                <div class="progress-bar" style="margin-top: 0.5rem;">
                    <div class="progress-fill" style="width: ${attendanceRate}%"></div>
                </div>
            </div>
        </div>
        
        ${monthlyStats ? `
        <div>
            <h3 style="color: var(--secondary); margin-bottom: 1rem;">
                <i class="fas fa-chart-line"></i> Monthly Overview
            </h3>
            <div style="background: var(--card-bg); padding: 1rem; border-radius: 8px;">
                ${monthlyStats}
            </div>
        </div>
        ` : ''}
    `;
    
    document.getElementById('statsModal').style.display = 'flex';
}

// Get monthly attendance statistics
async function getMonthlyAttendanceStats() {
    try {
        const token = localStorage.getItem('jwt_token');
        if (!token) return null;
        
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
        
        const response = await fetch(`${API_BASE_URL}attendance/monthly?year=${currentYear}&month=${currentMonth}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            return `
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-top: 1rem;">
                    <div>
                        <div style="font-size: 0.8rem; color: var(--text-light);">Avg. Daily</div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: var(--success);">${data.averageDaily || 0}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.8rem; color: var(--text-light);">Total Month</div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: var(--secondary);">${data.totalMonth || 0}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.8rem; color: var(--text-light);">Best Day</div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: var(--warning);">${data.bestDay || 0}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.8rem; color: var(--text-light);">Avg. Rate</div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: var(--accent);">${data.averageRate || 0}%</div>
                    </div>
                </div>
            `;
        }
        
        return null;
    } catch (error) {
        console.error('Error loading monthly stats:', error);
        return null;
    }
}

// Close stats modal
function closeStatsModal() {
    document.getElementById('statsModal').style.display = 'none';
}

// Print stats
function printStats() {
    const printContent = document.getElementById('statsModalContent').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
        <div style="padding: 2rem; font-family: Arial, sans-serif;">
            <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 1rem;">
                Attendance Statistics Report
            </h1>
            <div style="margin-top: 2rem;">
                ${printContent}
            </div>
            <div style="margin-top: 2rem; font-size: 0.9rem; color: #666; border-top: 1px solid #ddd; padding-top: 1rem;">
                Generated on: ${new Date().toLocaleString()}
            </div>
        </div>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
}

// Export attendance data
function exportAttendance() {
    const todaysAttendance = attendanceData.filter(record => record.date === currentAttendanceDate);
    const absentMembers = allMembers.filter(member => 
        !todaysAttendance.some(record => record.memberId === member.id)
    );
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header
    csvContent += "Attendance Report - " + formatDate(currentAttendanceDate) + "\n\n";
    
    // Present members
    csvContent += "PRESENT MEMBERS\n";
    csvContent += "Member ID,Name,Phone,Status\n";
    todaysAttendance.forEach(record => {
        const member = allMembers.find(m => m.id === record.memberId);
        if (member) {
            csvContent += `${member.memberId || member.id},"${member.firstName} ${member.lastName}",${member.phone || ''},${member.status || ''}\n`;
        }
    });
    
    csvContent += "\nABSENT MEMBERS\n";
    csvContent += "Member ID,Name,Phone,Status\n";
    absentMembers.forEach(member => {
        csvContent += `${member.memberId || member.id},"${member.firstName} ${member.lastName}",${member.phone || ''},${member.status || ''}\n`;
    });
    
    csvContent += "\nSUMMARY\n";
    csvContent += "Total Members," + allMembers.length + "\n";
    csvContent += "Present," + todaysAttendance.length + "\n";
    csvContent += "Absent," + absentMembers.length + "\n";
    csvContent += "Attendance Rate," + (allMembers.length > 0 ? Math.round((todaysAttendance.length / allMembers.length) * 100) : 0) + "%\n";
    csvContent += "Date Generated," + new Date().toLocaleString() + "\n";
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${currentAttendanceDate}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    showToast('Attendance exported successfully', 'success');
}

// Load previous attendance
function loadPreviousAttendance() {
    // Get all attendance dates from localStorage
    const attendanceDates = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('attendance_')) {
            const date = key.replace('attendance_', '');
            attendanceDates.push(date);
        }
    }
    
    if (attendanceDates.length === 0) {
        showToast('No previous attendance found', 'warning');
        return;
    }
    
    // Sort dates in descending order
    attendanceDates.sort((a, b) => new Date(b) - new Date(a));
    
    const modalContent = document.getElementById('previousAttendanceList');
    modalContent.innerHTML = '<h3 style="margin-bottom: 1rem; color: var(--text-light);">Select date to load:</h3>';
    
    attendanceDates.forEach(date => {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'quick-action-btn';
        dateDiv.style.marginBottom = '0.5rem';
        dateDiv.style.cursor = 'pointer';
        dateDiv.innerHTML = `
            <i class="fas fa-calendar-day"></i> ${formatDate(date)}
            <span style="margin-left: auto; font-size: 0.9em; color: var(--text-light);">
                <i class="fas fa-users"></i> ${JSON.parse(localStorage.getItem(`attendance_${date}`)).length}
            </span>
        `;
        
        dateDiv.onclick = () => {
            document.getElementById('attendanceDate').value = date;
            currentAttendanceDate = date;
            loadAttendanceForDate(date);
            closePreviousAttendanceModal();
        };
        
        modalContent.appendChild(dateDiv);
    });
    
    document.getElementById('previousAttendanceModal').style.display = 'flex';
}

// Close previous attendance modal
function closePreviousAttendanceModal() {
    document.getElementById('previousAttendanceModal').style.display = 'none';
}

// Quick filter for active members
function quickFilterActive() {
    // Filter members to show only active ones
    const activeMembers = allMembers.filter(member => 
        member.status === 'Active' || 
        member.active === true || 
        member.status === 'active'
    );
    
    // Update the display to show only active members
    const attendanceList = document.getElementById('attendanceList');
    if (!attendanceList) return;
    
    attendanceList.innerHTML = '';
    
    if (activeMembers.length === 0) {
        attendanceList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-light);">
                <i class="fas fa-users-slash" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>No active members found</h3>
                <p>All members are inactive or no members loaded</p>
            </div>
        `;
        showToast('No active members found', 'warning');
        return;
    }
    
    activeMembers.forEach(member => {
        const isPresent = attendanceData.some(record => 
            record.memberId === member.id && 
            record.date === currentAttendanceDate
        );
        
        const memberDiv = document.createElement('div');
        memberDiv.className = `attendance-member ${isPresent ? 'attendance-member-present' : 'attendance-member-absent'}`;
        memberDiv.innerHTML = `
            <input type="checkbox" 
                   id="member_${member.id}" 
                   ${isPresent ? 'checked' : ''}
                   onchange="toggleAttendance(${member.id}, this.checked)">
            <label for="member_${member.id}">
                <strong>${member.firstName || member.name || ''} ${member.lastName || ''}</strong>
                <span style="display: block; font-size: 0.9em; color: var(--text-light); margin-top: 4px;">
                    ID: ${member.memberId || member.id} | 
                    Phone: ${member.phone || member.cellphone || 'N/A'} | 
                    Status: <span class="status-badge ${member.status === 'Active' ? 'status-paid' : 'status-pending'}">
                        ${member.status || 'Unknown'}
                    </span>
                </span>
            </label>
        `;
        
        attendanceList.appendChild(memberDiv);
    });
    
    updateAttendanceStats();
    showToast('Showing ' + activeMembers.length + ' active members', 'info');
}

// Filter attendance by month
function filterAttendanceByMonth() {
    selectedMonth = document.getElementById('attendanceMonth').value;
    updateAttendanceHistory();
}

// Filter attendance by year
function filterAttendanceByYear() {
    selectedYear = document.getElementById('attendanceYear').value;
    updateAttendanceHistory();
}

// Update attendance history
function updateAttendanceHistory() {
    const historyContent = document.getElementById('attendanceHistoryContent');
    
    // Get attendance data for the selected period
    let filteredAttendance = attendanceData;
    
    if (selectedMonth) {
        filteredAttendance = filteredAttendance.filter(record => 
            record.date.split('-')[1] === selectedMonth
        );
    }
    
    if (selectedYear) {
        filteredAttendance = filteredAttendance.filter(record => 
            record.date.split('-')[0] === selectedYear
        );
    }
    
    // Group by date
    const groupedByDate = {};
    filteredAttendance.forEach(record => {
        if (!groupedByDate[record.date]) {
            groupedByDate[record.date] = [];
        }
        groupedByDate[record.date].push(record);
    });
    
    // Sort dates in descending order
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));
    
    if (sortedDates.length === 0) {
        historyContent.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-light);">
                <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>No attendance records found for the selected period</p>
            </div>
        `;
        return;
    }
    
    let html = '<div style="display: grid; gap: 1rem;">';
    
    sortedDates.slice(0, 10).forEach(date => {
        const records = groupedByDate[date];
        const presentCount = records.length;
        const attendanceRate = allMembers.length > 0 ? Math.round((presentCount / allMembers.length) * 100) : 0;
        
        html += `
            <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--secondary);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong style="color: var(--secondary);">
                        <i class="fas fa-calendar-day"></i> ${formatDate(date)}
                    </strong>
                    <span class="attendance-rate-value">${attendanceRate}%</span>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-light);">
                    <span style="color: var(--success);"><i class="fas fa-user-check"></i> ${presentCount} present</span> | 
                    <span style="color: var(--accent);"><i class="fas fa-user-times"></i> ${allMembers.length - presentCount} absent</span>
                </div>
                <button class="btn btn-ghost" style="margin-top: 0.5rem; padding: 0.3rem 0.8rem; font-size: 0.85rem;" 
                        onclick="loadAttendanceForDate('${date}')">
                    <i class="fas fa-redo"></i> Load this date
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    
    if (sortedDates.length > 10) {
        html += `
            <div style="text-align: center; margin-top: 1rem;">
                <button class="btn btn-ghost" onclick="showAllAttendanceHistory()">
                    <i class="fas fa-eye"></i> Show all ${sortedDates.length} records
                </button>
            </div>
        `;
    }
    
    historyContent.innerHTML = html;
}

// Toggle expandable section
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const header = section.parentElement.querySelector('.expandable-header');
    
    section.classList.toggle('expanded');
    header.classList.toggle('expanded');
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast';
    
    // Add type class
    if (type === 'error') {
        toast.classList.add('error');
    } else if (type === 'warning') {
        toast.classList.add('warning');
    } else if (type === 'success') {
        toast.classList.add('success');
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Logout function
function logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
}

// Show all attendance history (not just the first 10)
function showAllAttendanceHistory() {
    const historyContent = document.getElementById('attendanceHistoryContent');
    
    // Get attendance data for the selected period
    let filteredAttendance = attendanceData;
    
    if (selectedMonth) {
        filteredAttendance = filteredAttendance.filter(record => 
            record.date.split('-')[1] === selectedMonth
        );
    }
    
    if (selectedYear) {
        filteredAttendance = filteredAttendance.filter(record => 
            record.date.split('-')[0] === selectedYear
        );
    }
    
    // Group by date
    const groupedByDate = {};
    filteredAttendance.forEach(record => {
        if (!groupedByDate[record.date]) {
            groupedByDate[record.date] = [];
        }
        groupedByDate[record.date].push(record);
    });
    
    // Sort dates in descending order
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));
    
    if (sortedDates.length === 0) {
        historyContent.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-light);">
                <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>No attendance records found for the selected period</p>
            </div>
        `;
        return;
    }
    
    let html = '<div style="display: grid; gap: 1rem;">';
    
    sortedDates.forEach(date => {
        const records = groupedByDate[date];
        const presentCount = records.length;
        const attendanceRate = allMembers.length > 0 ? Math.round((presentCount / allMembers.length) * 100) : 0;
        
        html += `
            <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--secondary);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong style="color: var(--secondary);">
                        <i class="fas fa-calendar-day"></i> ${formatDate(date)}
                    </strong>
                    <span class="attendance-rate-value">${attendanceRate}%</span>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-light);">
                    <span style="color: var(--success);"><i class="fas fa-user-check"></i> ${presentCount} present</span> | 
                    <span style="color: var(--accent);"><i class="fas fa-user-times"></i> ${allMembers.length - presentCount} absent</span>
                </div>
                <button class="btn btn-ghost" style="margin-top: 0.5rem; padding: 0.3rem 0.8rem; font-size: 0.85rem;" 
                        onclick="loadAttendanceForDate('${date}')">
                    <i class="fas fa-redo"></i> Load this date
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    
    historyContent.innerHTML = html;
    showToast('Showing all ' + sortedDates.length + ' attendance records', 'info');
}