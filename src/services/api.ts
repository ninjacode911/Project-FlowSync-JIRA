// ============================================
// ⚠️ TEMPORARY API SERVICE - Replace in Phase 4
// ============================================

import axios from 'axios';

// TEMPORARY: Basic axios instance
// TODO: Add proper error handling, token management, refresh logic in Phase 4
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// TEMPORARY: Basic request interceptor
// TODO: Add JWT token in Phase 2
api.interceptors.request.use(
    (config) => {
        // TEMPORARY: No auth token yet
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// TEMPORARY: Basic response interceptor
// TODO: Add token refresh, better error handling in Phase 4
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // TEMPORARY: Basic error handling
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default api;
