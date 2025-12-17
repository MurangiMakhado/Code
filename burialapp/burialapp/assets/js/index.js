
    // Auth and Main Application Script
    const API_BASE_URL = 'http://127.0.0.1:8000/api';
    
    // Check authentication on page load
    document.addEventListener('DOMContentLoaded', function() {
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        
        // Update user info
        updateUserInfo();
        
        // Initialize navigation
        initNavigation();
        
        // Initialize sections
        initHomeCards();
        initPaymentsSection();
        initAttendanceSection();
        initReportsSection();
        
        // Show welcome toast
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.name || userData.email) {
            showToast(`Welcome back, ${userData.name || userData.email}!`, 'success');
        }
    });
    
    function updateUserInfo() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userNameElement = document.getElementById('userName');
        const userGreetingElement = document.getElementById('userGreeting');
        
        if (userData) {
            if (userNameElement) {
                userNameElement.textContent = userData.name || userData.email || 'User';
            }
            if (userGreetingElement) {
                userGreetingElement.textContent = userData.name || userData.email || 'User';
            }
        }
    }
    
    function logout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            
            // Show logout message
            showToast('Logged out successfully', 'success');
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    }
    
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = 'toast';
        toast.classList.add(type);
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    function getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }
    
    async function apiRequest(endpoint, method = 'GET', data = null) {
        const headers = getAuthHeaders();
        
        const options = {
            method: method,
            headers: headers,
        };
        
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
            
            // Handle 401 Unauthorized
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                window.location.href = 'login.html';
                return null;
            }
            
            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.message || `API Error: ${response.status}`);
            }
            
            return responseData;
        } catch (error) {
            console.error('API Request Error:', error);
            showToast(error.message || 'Network error', 'error');
            throw error;
        }
    }
    
    // Navigation functions
    function initNavigation() {
        // Home navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                showSection(section);
            });
        });
        
        // Back buttons
        document.querySelectorAll('.back-button').forEach(button => {
            button.addEventListener('click', function() {
                const target = this.id.replace('backToHomeFrom', '').toLowerCase();
                if (target === 'payments' || target === 'attendance' || target === 'reports') {
                    showSection('home');
                } else if (target.includes('reports')) {
                    showSection('reports');
                } else if (target.includes('statements')) {
                    showSection('statements');
                }
            });
        });
    }
    
    function showSection(sectionId) {
        // Hide all content sections
        document.querySelectorAll('.content, .report-content').forEach(section => {
            section.classList.remove('active');
        });
        
        // Hide home cards if not home
        if (sectionId !== 'home') {
            document.getElementById('homeCards').style.display = 'none';
            document.getElementById('homeSection').style.display = 'none';
        } else {
            document.getElementById('homeCards').style.display = 'grid';
            document.getElementById('homeSection').style.display = 'block';
        }
        
        // Show selected section
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
        }
    }
    
    function initHomeCards() {
        document.querySelectorAll('#homeCards .card').forEach(card => {
            card.addEventListener('click', function() {
                const section = this.getAttribute('data-section');
                showSection(section);
            });
        });
    }
    
    function initPaymentsSection() {
        // Payment form submission
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const paymentData = {
                    member_id: document.getElementById('paymentMember').value,
                    date: document.getElementById('paymentDate').value,
                    monthly_collection: document.getElementById('monthlyCollection').value || 0,
                    dress_code: document.getElementById('dressCode').value,
                    fine_type: document.getElementById('fineType').value,
                    fine_amount: document.getElementById('fineAmount').value || 0,
                    transport: document.getElementById('transport').value || 0,
                    funeral_for: document.getElementById('funeralFor').value || ''
                };
                
                try {
                    const result = await apiRequest('payments', 'POST', paymentData);
                    showToast('Payment added successfully', 'success');
                    paymentForm.reset();
                    loadPayments();
                } catch (error) {
                    showToast('Error adding payment: ' + error.message, 'error');
                }
            });
        }
        
        // Expandable section
        const expandableHeader = document.querySelector('.expandable-header');
        if (expandableHeader) {
            expandableHeader.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const icon = this.querySelector('.expand-icon');
                
                if (content.classList.contains('expanded')) {
                    content.classList.remove('expanded');
                    icon.style.transform = 'rotate(0deg)';
                } else {
                    content.classList.add('expanded');
                    icon.style.transform = 'rotate(180deg)';
                }
            });
        }
        
        // Initial load
        loadPayments();
        loadPaymentMembers();
    }
    
    async function loadPaymentMembers() {
        try {
            const members = await apiRequest('members');
            const paymentMemberSelect = document.getElementById('paymentMember');
            
            if (members && members.length > 0) {
                paymentMemberSelect.innerHTML = '<option value="">Select Member</option>' + 
                    members.map(member => 
                        `<option value="${member.id}">${member.name} (${member.member_number || 'No ID'})</option>`
                    ).join('');
            }
        } catch (error) {
            console.error('Error loading members for payments:', error);
        }
    }
    
    async function loadPayments() {
        try {
            const payments = await apiRequest('payments');
            const paymentList = document.getElementById('paymentList');
            
            if (payments && payments.length > 0) {
                // Calculate totals
                let monthlyCollections = 0;
                let finesCollected = 0;
                let transportMoney = 0;
                let totalCollected = 0;
                
                payments.forEach(payment => {
                    monthlyCollections += parseFloat(payment.monthly_collection) || 0;
                    finesCollected += parseFloat(payment.fine_amount) || 0;
                    transportMoney += parseFloat(payment.transport) || 0;
                    totalCollected += (parseFloat(payment.monthly_collection) || 0) + 
                                     (parseFloat(payment.fine_amount) || 0) + 
                                     (parseFloat(payment.transport) || 0);
                });
                
                // Update summary cards
                document.getElementById('monthlyCollections').textContent = 'R' + monthlyCollections.toFixed(2);
                document.getElementById('finesCollected').textContent = 'R' + finesCollected.toFixed(2);
                document.getElementById('transportMoney').textContent = 'R' + transportMoney.toFixed(2);
                document.getElementById('totalCollected').textContent = 'R' + totalCollected.toFixed(2);
                
                // Display payments
                paymentList.innerHTML = payments.map(payment => `
                    <tr>
                        <td>${payment.book_number || 'N/A'}</td>
                        <td>${payment.member?.name || 'N/A'}</td>
                        <td>${payment.member?.surname || ''}</td>
                        <td>${new Date(payment.date).toLocaleDateString()}</td>
                        <td>R${(parseFloat(payment.monthly_collection) || 0).toFixed(2)}</td>
                        <td>${payment.dress_code || 'N/A'}</td>
                        <td>${payment.fine_type ? payment.fine_type + ' R' + (parseFloat(payment.fine_amount) || 0).toFixed(2) : 'N/A'}</td>
                        <td>R${(parseFloat(payment.transport) || 0).toFixed(2)}</td>
                        <td>R${((parseFloat(payment.monthly_collection) || 0) + 
                               (parseFloat(payment.fine_amount) || 0) + 
                               (parseFloat(payment.transport) || 0)).toFixed(2)}</td>
                        <td>
                            <button class="edit-btn" onclick="editPayment(${payment.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="delete-btn" onclick="deletePayment(${payment.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                paymentList.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem;">No payments found</td></tr>';
            }
        } catch (error) {
            console.error('Error loading payments:', error);
            showToast('Error loading payments', 'error');
        }
    }
    
    function initAttendanceSection() {
        const saveAttendanceBtn = document.getElementById('saveAttendance');
        if (saveAttendanceBtn) {
            saveAttendanceBtn.addEventListener('click', async function() {
                const attendanceDate = document.getElementById('attendanceDate').value;
                const checkedMembers = document.querySelectorAll('#attendanceList input[type="checkbox"]:checked');
                
                if (checkedMembers.length === 0) {
                    showToast('Please select at least one member', 'warning');
                    return;
                }
                
                const attendanceData = {
                    date: attendanceDate || new Date().toISOString().split('T')[0],
                    present_members: Array.from(checkedMembers).map(cb => parseInt(cb.value))
                };
                
                try {
                    const result = await apiRequest('attendance', 'POST', attendanceData);
                    showToast('Attendance saved successfully', 'success');
                    loadAttendanceStats();
                } catch (error) {
                    showToast('Error saving attendance: ' + error.message, 'error');
                }
            });
        }
        
        // Initial load
        loadAttendance();
        loadAttendanceStats();
    }
    
    async function loadAttendance() {
        try {
            const members = await apiRequest('members');
            const attendanceList = document.getElementById('attendanceList');
            
            if (members && members.length > 0) {
                attendanceList.innerHTML = members.map(member => `
                    <div class="attendance-member">
                        <input type="checkbox" id="member-${member.id}" value="${member.id}">
                        <label for="member-${member.id}">${member.name} (${member.member_number || 'No ID'})</label>
                    </div>
                `).join('');
                
                // Update total members count
                document.getElementById('totalMembersCount').textContent = members.length;
            } else {
                attendanceList.innerHTML = '<div style="text-align: center; padding: 2rem;">No members found</div>';
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
        }
    }
    
    async function loadAttendanceStats() {
        try {
            const stats = await apiRequest('attendance/stats');
            if (stats) {
                document.getElementById('presentCount').textContent = stats.present || 0;
                document.getElementById('absentCount').textContent = stats.absent || 0;
                document.getElementById('attendanceRate').textContent = stats.rate ? stats.rate + '%' : '0%';
            }
        } catch (error) {
            console.error('Error loading attendance stats:', error);
        }
    }
    
    function initReportsSection() {
        // Report card clicks
        document.querySelectorAll('.report-card').forEach(card => {
            card.addEventListener('click', function() {
                const report = this.getAttribute('data-report');
                showReport(report);
            });
        });
        
        // Transport tabs
        document.querySelectorAll('.transport-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                showTransportTab(tabId);
            });
        });
    }
    
    function showReport(reportId) {
        // Hide all report contents
        document.querySelectorAll('.report-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show selected report
        const report = document.getElementById(reportId + 'Report');
        if (report) {
            report.classList.add('active');
        }
    }
    
    function showTransportTab(tabId) {
        // Update active tab
        document.querySelectorAll('.transport-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.transport-tab[data-tab="${tabId}"]`).classList.add('active');
        
        // Show corresponding content
        document.querySelectorAll('.transport-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById('transport' + tabId.charAt(0).toUpperCase() + tabId.slice(1) + 'Tab').classList.add('active');
    }

    // Payment functions
    async function editPayment(paymentId) {
        try {
            const payment = await apiRequest(`payments/${paymentId}`); 
            if (payment) {
                document.getElementById('editPaymentDate').value = payment.date;
                document.getElementById('editMonthlyCollection').value = payment.monthly_collection || '';
                document.getElementById('editDressCode').value = payment.dress_code || '';
                document.getElementById('editFineType').value = payment.fine_type || '';
                document.getElementById('editFineAmount').value = payment.fine_amount || '';
                document.getElementById('editTransport').value = payment.transport || '';
                
                // Show modal
                document.getElementById('paymentEditModal').style.display = 'flex';
                
                // Save handler
                document.getElementById('savePaymentEdit').onclick = async function() {
                    const updatedData = {
                        date: document.getElementById('editPaymentDate').value,
                        monthly_collection: document.getElementById('editMonthlyCollection').value || 0,
                        dress_code: document.getElementById('editDressCode').value,
                        fine_type: document.getElementById('editFineType').value,
                        fine_amount: document.getElementById('editFineAmount').value || 0,
                        transport: document.getElementById('editTransport').value || 0
                    };
                    
                    try {
                        const result = await apiRequest(`payments/${paymentId}`, 'PUT', updatedData);
                        showToast('Payment updated successfully', 'success');
                        document.getElementById('paymentEditModal').style.display = 'none';
                        loadPayments();
                    } catch (error) {
                        showToast('Error updating payment: ' + error.message, 'error');
                    }
                };
                
                // Cancel handler
                document.getElementById('cancelPaymentEdit').onclick = function() {
                    document.getElementById('paymentEditModal').style.display = 'none';
                };
            }
        } catch (error) {
            showToast('Error loading payment: ' + error.message, 'error');
        }
    }
    
    async function deletePayment(paymentId) {
        if (!confirm('Are you sure you want to delete this payment?')) return;
        
        try {
            const result = await apiRequest(`payments/${paymentId}`, 'DELETE');
            showToast('Payment deleted successfully', 'success');
            loadPayments();
        } catch (error) {
            showToast('Error deleting payment: ' + error.message, 'error');
        }
    }
