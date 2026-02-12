import api from './api';
import { Sprint } from '../types';

export const sprintService = {
    // Get all sprints
    async fetchSprints(): Promise<Sprint[]> {
        const response = await api.get('/sprints');
        // Map backend response to frontend format
        return response.data.map((s: any) => ({
            ...s,
            isActive: s.isActive || s.status === 'active',
            isCompleted: s.isCompleted || s.status === 'completed',
        }));
    },

    // Get single sprint
    async fetchSprint(id: string): Promise<Sprint> {
        const response = await api.get(`/sprints/${id}`);
        const sprint = response.data;
        return {
            ...sprint,
            isActive: sprint.isActive || sprint.status === 'active',
            isCompleted: sprint.isCompleted || sprint.status === 'completed',
        };
    },

    // Create sprint
    async createSprint(data: Partial<Sprint>): Promise<Sprint> {
        const response = await api.post('/sprints', data);
        const sprint = response.data;
        return {
            ...sprint,
            isActive: sprint.isActive || false,
            isCompleted: sprint.isCompleted || false,
        };
    },

    // Update sprint
    async updateSprint(id: string, data: Partial<Sprint>): Promise<Sprint> {
        const response = await api.put(`/sprints/${id}`, data);
        const sprint = response.data;
        return {
            ...sprint,
            isActive: sprint.isActive || sprint.status === 'active',
            isCompleted: sprint.isCompleted || sprint.status === 'completed',
        };
    },

    // Delete sprint
    async deleteSprint(id: string): Promise<void> {
        await api.delete(`/sprints/${id}`);
    },
};
