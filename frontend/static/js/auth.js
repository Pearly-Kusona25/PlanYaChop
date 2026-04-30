// Authentication JavaScript

const RECAPTCHA_SITE_KEY = '6Ld5X5ksAAAAAKueb18nSuVMtokfPOZ6z7LRMTf2';

class AuthService {
    constructor() {
        this.baseURL = '/api/auth';
        this.token = localStorage.getItem('token');
        this.refreshToken = localStorage.getItem('refreshToken');
        this.user = this.getStoredUser();
    }

    async readResponsePayload(response) {
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json') || contentType.includes('application/problem+json');
        let data = null;
        let text = '';

        if (isJson) {
            try {
                data = await response.json();
            } catch (error) {
                data = null;
            }
            return { data, text };
        }

        try {
            text = await response.text();
            if (text && text.trim().startsWith('{')) {
                data = JSON.parse(text);
            }
        } catch (error) {
            text = '';
        }

        return { data, text };
    }

    resolveErrorMessage(response, data, text, fallback) {
        if (data?.message) return data.message;
        if (data?.error_description) return data.error_description;
        if (data?.error) return data.error;
        if (data?.detail) return data.detail;
        if (text && text.trim().length > 0) return text.trim();

        if (response.status === 401) {
            return 'Invalid username/email or password.';
        }
        if (response.status === 400) {
            return 'Invalid request. Please check your input and try again.';
        }
        if (response.status === 429) {
            return 'Too many attempts. Please wait and try again.';
        }
        if (response.status >= 500) {
            return 'Server error. Please try again shortly.';
        }

        return fallback;
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

            const { data, text } = await this.readResponsePayload(response);

            if (response.ok && data) {
                this.setSession(data);
                this.showAlert('Login successful! Redirecting...', 'success');
                const target = data.role === 'ADMIN' ? '/admin' : '/home';
                setTimeout(() => {
                    window.location.href = target;
                }, 1500);
            } else {
                const message = this.resolveErrorMessage(response, data, text, 'Login failed');
                this.showAlert(message, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            const message = error instanceof TypeError
                ? 'Unable to reach server. Please check your connection and try again.'
                : 'An error occurred during login';
            this.showAlert(message, 'error');
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

            const { data, text } = await this.readResponsePayload(response);

            if (response.ok && data) {
                this.setSession(data);
                this.showAlert('Registration successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/home';
                }, 1500);
            } else {
                const message = this.resolveErrorMessage(response, data, text, 'Registration failed');
                this.showAlert(message, 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            const message = error instanceof TypeError
                ? 'Unable to reach server. Please check your connection and try again.'
                : 'An error occurred during registration';
            this.showAlert(message, 'error');
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
                const { data } = await this.readResponsePayload(response);
                if (data?.token) {
                    this.setSession(data);
                    return data.token;
                }
                throw new Error('Token refresh response was empty');
            } else {
                const { data, text } = await this.readResponsePayload(response);
                const message = this.resolveErrorMessage(response, data, text, 'Token refresh failed');
                throw new Error(message);
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

    getTokenMaxAgeSeconds(token) {
        if (!token || typeof token !== 'string') {
            return 86400;
        }

        try {
            const payloadPart = token.split('.')[1];
            if (!payloadPart) {
                return 86400;
            }

            const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64 + '==='.slice((base64.length + 3) % 4);
            const payloadJson = atob(padded);
            const payload = JSON.parse(payloadJson);
            if (!payload.exp) {
                return 86400;
            }

            const now = Math.floor(Date.now() / 1000);
            const maxAge = Number(payload.exp) - now;
            if (!Number.isFinite(maxAge) || maxAge <= 0) {
                return 86400;
            }
            return Math.max(60, maxAge);
        } catch (error) {
            return 86400;
        }
    }

    setAuthCookie(token) {
        if (!token) return;
        const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
        const maxAge = this.getTokenMaxAgeSeconds(token);
        document.cookie = `AUTH_TOKEN=${token}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secureFlag}`;
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

async function getRecaptchaToken(action) {
    if (!window.grecaptcha) {
        throw new Error('reCAPTCHA not loaded');
    }
    return new Promise((resolve, reject) => {
        grecaptcha.ready(() => {
            grecaptcha.execute(RECAPTCHA_SITE_KEY, { action })
                .then(resolve)
                .catch(reject);
        });
    });
}

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

            try {
                const recaptchaToken = await getRecaptchaToken('login');
                await authService.login({ ...formData, recaptchaToken });
            } catch (err) {
                console.error('reCAPTCHA error:', err);
                authService.showAlert('Human verification failed. Please retry.', 'error');
            }
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
            try {
                const recaptchaToken = await getRecaptchaToken('register');
                await authService.register({ ...registerData, recaptchaToken });
            } catch (err) {
                console.error('reCAPTCHA error:', err);
                authService.showAlert('Human verification failed. Please retry.', 'error');
            }
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
