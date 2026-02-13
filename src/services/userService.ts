// ============================================
// User Service
// ============================================

import api from './api';
import { User } from '../../types';

export const userService = {
    // Get all users
    async fetchUsers(): Promise<User[]> {
        const response = await api.get('/users');
        return response.data;
    },

    // Get single user
    async fetchUser(id: string): Promise<User> {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    // Update user profile
    async updateProfile(data: { name: string; email: string }): Promise<{ message: string; user: User }> {
        const response = await api.put('/users/profile', data);
        return response.data;
    },

    // Change password
    async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
        const response = await api.put('/users/password', data);
        return response.data;
    }
};
