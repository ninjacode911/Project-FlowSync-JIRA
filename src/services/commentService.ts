import api from './api';
import { Comment } from '../types';

export const commentService = {
    // Get comments for an issue
    async fetchComments(issueId: string): Promise<Comment[]> {
        const response = await api.get(`/comments/issues/${issueId}/comments`);
        return response.data;
    },

    // Add comment to issue
    async createComment(issueId: string, userId: string, content: string): Promise<Comment> {
        const response = await api.post(`/comments/issues/${issueId}/comments`, {
            content,
        });
        return response.data;
    },

    // Update comment
    async updateComment(commentId: string, content: string): Promise<Comment> {
        const response = await api.put(`/comments/${commentId}`, {
            content,
        });
        return response.data;
    },

    // Delete comment
    async deleteComment(commentId: string): Promise<void> {
        await api.delete(`/comments/${commentId}`);
    },
};
