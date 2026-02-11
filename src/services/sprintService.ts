// ============================================
// ⚠️ TEMPORARY SPRINT SERVICE - Replace in Phase 4
// ============================================

import api from './api';
import { Sprint } from '../types';

// TEMPORARY: Basic sprint API calls
// TODO: Add proper error handling, validation in Phase 4

export const sprintService = {
    // Get all sprints
    async fetchSprints(): Promise<Sprint[]> {
        // TEMPORARY: Replace with proper error handling
        const response = await api.get('/sprints');
        return response.data;
    },

    // Get single sprint
    async fetchSprint(id: string): Promise<Sprint> {
        // TEMPORARY: Replace with proper error handling
        const response = await api.get(`/sprints/${id}`);
        return response.data;
    },

    // Create sprint
    async createSprint(data: Partial<Sprint>): Promise<Sprint> {
        // TEMPORARY: Replace with proper validation
        const response = await api.post('/sprints', data);
        return response.data;
    },

    // Update sprint
    async updateSprint(id: string, data: Partial<Sprint>): Promise<Sprint> {
        // TEMPORARY: Replace with proper validation
        const response = await api.put(`/sprints/${id}`, data);
        return response.data;
    },

    // Delete sprint
    async deleteSprint(id: string): Promise<void> {
        // TEMPORARY: Replace with proper confirmation
        await api.delete(`/sprints/${id}`);
    },
};
