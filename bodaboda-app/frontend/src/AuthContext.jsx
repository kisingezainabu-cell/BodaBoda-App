import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedUser = localStorage.getItem('bodaboda_user');
            const token = localStorage.getItem('bodaboda_token');
            
            if (savedUser && token) {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                api.setToken(token, parsedUser);
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.login(email, password);
            setUser(response.user);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.register(userData);
            const user = {
                id: response.user_id,
                username: userData.username,
                email: userData.email,
                user_type: userData.user_type
            };
            setUser(user);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        api.clearAuth();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
