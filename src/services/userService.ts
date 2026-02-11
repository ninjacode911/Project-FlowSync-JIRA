// ============================================
// ⚠️ TEMPORARY USER SERVICE - Replace in Phase 4
// ============================================

import api from './api';
import { User } from '../types';

// TEMPORARY: Basic user API calls
// TODO: Add proper error handling in Phase 4

export const userService = {
    // Get all users
    async fetchUsers(): Promise<User[]> {
        // TEMPORARY: Replace with proper error handling
        const response = await api.get('/users');
        return response.data;
    },

    // Get single user
    async fetchUser(id: string): Promise<User> {
        // TEMPORARY: Replace with proper error handling
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
};
