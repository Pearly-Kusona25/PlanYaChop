// Authentication JavaScript

class AuthService {
    constructor() {
        this.baseURL = '/api/auth';
        this.token = localStorage.getItem('token');
        this.refreshToken = localStorage.getItem('refreshToken');
        this.user = this.getStoredUser();
    }

    async login(credentials) {
        try {
            this.showLoading();
            const response = await fetch(`${this.baseURL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                this.setSession(data);
                this.showAlert('Login successful! Redirecting...', 'success');
                const target = data.role === 'ADMIN' ? '/admin' : '/dashboard';
                setTimeout(() => {
                    window.location.href = target;
                }, 1500);
            } else {
                this.showAlert(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('An error occurred during login', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async register(userData) {
        try {
            this.showLoading();
            const response = await fetch(`${this.baseURL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                this.setSession(data);
                this.showAlert('Registration successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                this.showAlert(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showAlert('An error occurred during registration', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async logout() {
        try {
            if (this.token) {
                await fetch(`${this.baseURL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearSession();
            window.location.href = '/login';
        }
    }

    async refreshAccessToken() {
        try {
            if (!this.refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await fetch(`${this.baseURL}/refresh`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.refreshToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.setSession(data);
                return data.token;
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            this.clearSession();
            window.location.href = '/login';
            return null;
        }
    }

    setSession(data) {
        this.setTokens(data.token, data.refreshToken);
        const userData = {
            id: data.id,
            username: data.username,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role
        };
        localStorage.setItem('user', JSON.stringify(userData));
        this.user = userData;
    }

    setTokens(token, refreshToken) {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        this.token = token;
        this.refreshToken = refreshToken;
        this.setAuthCookie(token);
    }

    clearSession() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        this.token = null;
        this.refreshToken = null;
        this.user = null;
        this.clearAuthCookie();
    }

    isAuthenticated() {
        return !!this.token;
    }

    getStoredUser() {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    getUserRole() {
        return this.user?.role || null;
    }

    getAuthHeader() {
        return this.token ? `Bearer ${this.token}` : null;
    }

    setAuthCookie(token) {
        if (!token) return;
        const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `AUTH_TOKEN=${token}; Path=/; SameSite=Lax${secureFlag}`;
    }

    clearAuthCookie() {
        const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `AUTH_TOKEN=; Max-Age=0; Path=/; SameSite=Lax${secureFlag}`;
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('d-none');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('d-none');
        }
    }

    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;

        const alertId = 'alert-' + Date.now();
        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'error' ? 'alert-danger' : 
                          'alert-info';

        const alertHtml = `
            <div id="${alertId}" class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        alertContainer.insertAdjacentHTML('beforeend', alertHtml);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                alertElement.remove();
            }
        }, 5000);
    }

    validateForm(formData) {
        const errors = [];

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            errors.push('Please enter a valid email address');
        }

        // Validate password
        if (formData.password && formData.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        // Validate password confirmation
        if (formData.password && formData.confirmPassword && 
            formData.password !== formData.confirmPassword) {
            errors.push('Passwords do not match');
        }

        // Validate username
        if (formData.username && formData.username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }

        return errors;
    }

    displayFormErrors(errors) {
        // Clear previous errors
        document.querySelectorAll('.is-invalid').forEach(element => {
            element.classList.remove('is-invalid');
        });
        document.querySelectorAll('.invalid-feedback').forEach(element => {
            element.remove();
        });

        // Display new errors
        errors.forEach(error => {
            this.showAlert(error, 'error');
        });
    }
}

// Initialize AuthService
const authService = new AuthService();

// Login Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                usernameOrEmail: document.getElementById('usernameOrEmail').value,
                password: document.getElementById('password').value
            };

            const errors = authService.validateForm(formData);
            if (errors.length > 0) {
                authService.displayFormErrors(errors);
                return;
            }

            await authService.login(formData);
        });
    }

    // Register Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value,
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value
            };

            const errors = authService.validateForm(formData);
            if (errors.length > 0) {
                authService.displayFormErrors(errors);
                return;
            }

            const { confirmPassword, ...registerData } = formData;
            await authService.register(registerData);
        });
    }

    // Logout Handler
    const logoutButtons = document.querySelectorAll('[data-action="logout"]');
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            authService.logout();
        });
    });

    // Check authentication on page load
    const path = window.location.pathname;
    const publicPaths = ['/', '/login', '/register', '/about', '/contact'];
    const isStaticAsset = path.startsWith('/css') || path.startsWith('/js') || path.startsWith('/images');

    if (!authService.isAuthenticated() &&
        !publicPaths.includes(path) &&
        !isStaticAsset) {
        return window.location.href = '/login';
    }

    if (path.startsWith('/admin')) {
        if (!authService.isAuthenticated() || authService.getUserRole() !== 'ADMIN') {
            authService.showAlert('Admin access required.', 'error');
            window.location.href = '/login';
        }
    }
});

// Export for use in other scripts
window.authService = authService;
