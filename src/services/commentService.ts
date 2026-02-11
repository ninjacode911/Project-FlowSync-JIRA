// ============================================
// ⚠️ TEMPORARY COMMENT SERVICE - Replace in Phase 4
// ============================================

import api from './api';
import { Comment } from '../types';

// TEMPORARY: Basic comment API calls
// TODO: Add proper error handling in Phase 4

export const commentService = {
    // Get comments for an issue
    async fetchComments(issueId: string): Promise<Comment[]> {
        // TEMPORARY: Replace with proper error handling
        const response = await api.get(`/issues/${issueId}/comments`);
        return response.data;
    },

    // Add comment to issue
    async createComment(issueId: string, userId: string, content: string): Promise<Comment> {
        // TEMPORARY: Replace with proper validation
        const response = await api.post(`/issues/${issueId}/comments`, {
            userId,
            content,
        });
        return response.data;
    },

    // Delete comment
    async deleteComment(commentId: string): Promise<void> {
        // TEMPORARY: Replace with proper confirmation
        await api.delete(`/comments/${commentId}`);
    },
};
