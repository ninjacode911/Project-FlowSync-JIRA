// ============================================
// ⚠️ TEMPORARY ISSUE SERVICE - Replace in Phase 4
// ============================================

import api from './api';
import { Issue, Status } from '../types';

// TEMPORARY: Basic issue API calls
// TODO: Add proper error handling, caching, optimistic updates in Phase 4

export const issueService = {
    // Get all issues with optional filters
    async fetchIssues(filters?: {
        projectId?: string;
        sprintId?: string;
        assigneeId?: string;
        status?: Status;
        type?: string;
        priority?: string;
        search?: string;
    }): Promise<Issue[]> {
        // TEMPORARY: Replace with proper query building
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
        }

        const response = await api.get(`/issues?${params.toString()}`);
        return response.data;
    },

    // Get single issue
    async fetchIssue(id: string): Promise<Issue> {
        // TEMPORARY: Replace with proper error handling
        const response = await api.get(`/issues/${id}`);
        return response.data;
    },

    // Create issue
    async createIssue(data: Partial<Issue>): Promise<Issue> {
        // TEMPORARY: Replace with proper validation
        const response = await api.post('/issues', data);
        return response.data;
    },

    // Update issue
    async updateIssue(id: string, data: Partial<Issue>): Promise<Issue> {
        // TEMPORARY: Replace with proper validation
        const response = await api.put(`/issues/${id}`, data);
        return response.data;
    },

    // Update issue status (for drag-drop)
    async updateIssueStatus(id: string, status: Status): Promise<Issue> {
        // TEMPORARY: Replace with optimistic update
        const response = await api.patch(`/issues/${id}/status`, { status });
        return response.data;
    },

    // Delete issue
    async deleteIssue(id: string): Promise<void> {
        // TEMPORARY: Replace with proper confirmation
        await api.delete(`/issues/${id}`);
    },

    // Search issues
    async searchIssues(query: string): Promise<Issue[]> {
        // TEMPORARY: Replace with proper search
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
        return response.data;
    },
};
