// BodaBoda Authentication System
// Real user authentication with database integration

import api from './api.js';

class AuthManager {
    constructor() {
        this.initAuth();
    }

    // Initialize authentication state
    initAuth() {
        const token = localStorage.getItem('bodaboda_token');
        const user = localStorage.getItem('bodaboda_user');
        
        if (token && user) {
            api.setToken(token, JSON.parse(user));
        }
        
        this.updateUI();
    }

    // Update UI based on auth state
    updateUI() {
        const isAuthenticated = api.isAuthenticated();
        const userType = api.getUserType();
        
        // Show/hide auth elements
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const dashboardBtn = document.getElementById('dashboard-btn');
        const profileSection = document.getElementById('profile-section');
        
        if (isAuthenticated) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (dashboardBtn) dashboardBtn.style.display = 'block';
            
            // Show user info
            if (profileSection) {
                profileSection.innerHTML = `
                    <div class="user-profile">
                        <h3>Welcome, ${api.user.username}!</h3>
                        <p><strong>Type:</strong> ${userType}</p>
                        <p><strong>Email:</strong> ${api.user.email}</p>
                    </div>
                `;
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (registerBtn) registerBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (dashboardBtn) dashboardBtn.style.display = 'none';
            
            if (profileSection) {
                profileSection.innerHTML = '<p>Please login to continue</p>';
            }
        }
    }

    // Handle user registration
    async handleRegister(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            full_name: formData.get('full_name'),
            phone_number: formData.get('phone_number'),
            user_type: formData.get('user_type')
        };

        // Additional driver fields
        if (userData.user_type === 'driver') {
            userData.vehicle_make = formData.get('vehicle_make');
            userData.vehicle_model = formData.get('vehicle_model');
            userData.license_plate = formData.get('license_plate');
        }

        try {
            const response = await api.register(userData);
            this.showSuccess('Registration successful! You are now logged in.');
            this.initAuth();
            
            // Redirect based on user type
            if (userData.user_type === 'driver') {
                window.location.href = '/driver-dashboard.html';
            } else {
                window.location.href = '/rider-dashboard.html';
            }
        } catch (error) {
            this.showError(error.message || 'Registration failed');
        }
    }

    // Handle user login
    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const response = await api.login(email, password);
            this.showSuccess('Login successful!');
            this.initAuth();
            
            // Redirect based on user type
            if (api.isDriver()) {
                window.location.href = '/driver-dashboard.html';
            } else {
                window.location.href = '/rider-dashboard.html';
            }
        } catch (error) {
            this.showError(error.message || 'Login failed');
        }
    }

    // Handle logout
    handleLogout() {
        api.clearAuth();
        this.showSuccess('Logged out successfully');
        this.initAuth();
        window.location.href = '/';
    }

    // Show success message
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    // Show error message
    showError(message) {
        this.showMessage(message, 'error');
    }

    // Show message
    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // Style the message
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            transition: opacity 0.3s;
        `;
        
        if (type === 'success') {
            messageDiv.style.backgroundColor = '#28a745';
        } else if (type === 'error') {
            messageDiv.style.backgroundColor = '#dc3545';
        }
        
        document.body.appendChild(messageDiv);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 3000);
    }

    // Validate form
    validateForm(form) {
        const formData = new FormData(form);
        const requiredFields = ['username', 'email', 'password', 'full_name', 'phone_number'];
        
        for (const field of requiredFields) {
            if (!formData.get(field)) {
                this.showError(`${field.replace('_', ' ')} is required`);
                return false;
            }
        }
        
        // Email validation
        const email = formData.get('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('Please enter a valid email address');
            return false;
        }
        
        // Password validation
        const password = formData.get('password');
        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return false;
        }
        
        return true;
    }
}

// Create global auth manager instance
const authManager = new AuthManager();

// Export for use in other modules
export default authManager;
