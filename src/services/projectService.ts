// ============================================
// ⚠️ TEMPORARY PROJECT SERVICE - Replace in Phase 4
// ============================================

import api from './api';
import { Project } from '../types';

// TEMPORARY: Basic project API calls
// TODO: Add proper error handling, caching, optimistic updates in Phase 4

export const projectService = {
    // Get all projects
    async fetchProjects(): Promise<Project[]> {
        // TEMPORARY: Replace with proper error handling
        const response = await api.get('/projects');
        return response.data;
    },

    // Get single project
    async fetchProject(id: string): Promise<Project> {
        // TEMPORARY: Replace with proper error handling
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },

    // Create project
    async createProject(data: Partial<Project>): Promise<Project> {
        // TEMPORARY: Replace with proper validation
        const response = await api.post('/projects', data);
        return response.data;
    },

    // Update project
    async updateProject(id: string, data: Partial<Project>): Promise<Project> {
        // TEMPORARY: Replace with proper validation
        const response = await api.put(`/projects/${id}`, data);
        return response.data;
    },

    // Delete project
    async deleteProject(id: string): Promise<void> {
        // TEMPORARY: Replace with proper confirmation
        await api.delete(`/projects/${id}`);
    },
};
