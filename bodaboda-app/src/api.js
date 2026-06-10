// BodaBoda API Integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class BodaBodaAPI {
    constructor() {
        this.token = localStorage.getItem('bodaboda_token');
        this.user = JSON.parse(localStorage.getItem('bodaboda_user') || 'null');
    }

    setToken(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('bodaboda_token', token);
        localStorage.setItem('bodaboda_user', JSON.stringify(user));
    }

    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('bodaboda_token');
        localStorage.removeItem('bodaboda_user');
    }

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
                // Handle Django validation errors which often come as a dictionary
                if (typeof data === 'object') {
                    const errorMessages = Object.entries(data)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                    throw new Error(errorMessages || 'API request failed');
                }
                throw new Error(data.error || data.detail || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async register(userData) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
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

    // Ride Methods
    async requestRide(rideData) {
        return await this.request('/rides/request', {
            method: 'POST',
            body: JSON.stringify(rideData)
        });
    }

    async getAvailableRides() {
        return await this.request('/rides/available');
    }

    async acceptRide(rideId) {
        return await this.request(`/rides/${rideId}/accept`, {
            method: 'POST'
        });
    }

    async rejectRide(rideId) {
        return await this.request(`/rides/${rideId}/reject`, {
            method: 'POST'
        });
    }

    async getRideDetail(rideId) {
        return await this.request(`/rides/${rideId}`);
    }

    async updateStatus(rideId, status) {
        return await this.request(`/rides/${rideId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    async getDriverHistory() {
        return await this.request('/rides/history');
    }

    // User Methods
    async updateProfile(profileData) {
        return await this.request('/auth/profile', {
            method: 'PATCH',
            body: JSON.stringify(profileData)
        });
    }

    // User Management (Admin Only)
    async manageUsers() {
        return await this.request('/auth/manage');
    }

    async deleteUser(userId) {
        return await this.request(`/auth/manage/${userId}`, {
            method: 'DELETE'
        });
    }

    async getOnlineDrivers() {
        return await this.request('/auth/online-drivers');
    }
}

const api = new BodaBodaAPI();
export default api;
