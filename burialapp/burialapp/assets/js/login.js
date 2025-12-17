// Check if already logged in
if (localStorage.getItem('authToken')) {
    window.location.href = 'index.html';
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    
    // Clear previous errors
    errorMessage.classList.remove('show');
    
    // Basic validation
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Show loading state
    loginBtn.innerHTML = '<i class="fas fa-spinner"></i> Signing In...';
    loginBtn.classList.add('loading');
    
    try {

        
        
        const response = await post('login',{"email":email,"password":password});

        console.log(response.data);

        var data = response.data;
        
        
        // Save token and user data
        if (data.success) {
            localStorage.setItem('authToken', data.success.token);
            localStorage.setItem('userData', JSON.stringify(data.success.user));
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } else {
            showError('Invalid response from server : ' + data.error);
        }
        
        
    } catch (error) {
        console.error('Error during login:', error);
    } finally {
      // Reset button state
      loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
      loginBtn.classList.remove('loading');
    }
});

function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.innerHTML = message;
  errorMessage.classList.add('show');
}