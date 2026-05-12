// BodaBoda API Integration
// Real backend API connection with authentication

const API_BASE_URL = 'http://localhost:8000/api';

class BodaBodaAPI {
    constructor() {
        this.token = localStorage.getItem('bodaboda_token');
        this.user = JSON.parse(localStorage.getItem('bodaboda_user') || 'null');
    }

    // Set authentication token
    setToken(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('bodaboda_token', token);
        localStorage.setItem('bodaboda_user', JSON.stringify(user));
    }

    // Clear authentication
    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('bodaboda_token');
        localStorage.removeItem('bodaboda_user');
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication endpoints
    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.token) {
            this.setToken(response.token, {
                id: response.user_id,
                username: userData.username,
                email: userData.email,
                user_type: userData.user_type
            });
        }
        
        return response;
    }

    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.token) {
            this.setToken(response.token, response.user);
        }
        
        return response;
    }

    // Driver endpoints
    async getNearbyDrivers(lat, lng, radius = 5) {
        return await this.request(`/drivers/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    }

    // Ride endpoints
    async requestRide(rideData) {
        return await this.request('/rides/request', {
            method: 'POST',
            body: JSON.stringify(rideData)
        });
    }

    async getRide(rideId) {
        return await this.request(`/rides/${rideId}`);
    }

    // Health check
    async healthCheck() {
        return await this.request('/health');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    }

    // Get user type
    getUserType() {
        return this.user ? this.user.user_type : null;
    }

    // Check if user is driver
    isDriver() {
        return this.getUserType() === 'driver';
    }

    // Check if user is rider
    isRider() {
        return this.getUserType() === 'rider';
    }
}

// Export singleton instance
const api = new BodaBodaAPI();
export default api;
