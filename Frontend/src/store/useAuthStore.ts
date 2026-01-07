import { create } from 'zustand';
import api from '../api/axios';

interface AuthState {
    user: any;
    isAuthenticated: boolean;
    loginAction: (e: string, p: string) => Promise<void>;
    signupAction: (u: string, e: string, p: string) => Promise<void>;
    logout: () => void;
}

// 1. Check LocalStorage BEFORE creating the store
const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

export const useAuthStore = create<AuthState>((set) => ({
    // 2. Initialize state with stored values immediately
    user: storedUser ? JSON.parse(storedUser) : null,
    isAuthenticated: !!storedToken, // True if token exists

    loginAction: async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            
            set({ user: res.data.user, isAuthenticated: true });
        } catch (error: any) {
            console.error("Login Error:", error.response?.data?.msg || error.message);
            throw error;
        }
    },

    signupAction: async (username, email, password) => {
        try {
            const res = await api.post('/auth/register', { username, email, password });
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            
            set({ user: res.data.user, isAuthenticated: true });
        } catch (error: any) {
            console.error("Signup Error:", error.response?.data?.msg || error.message);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
    }
}));