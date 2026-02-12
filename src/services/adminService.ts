import api from './api';

// ---- Overview & Health ----

export const fetchAdminOverview = () => api.get('/admin/overview').then(r => r.data);
export const fetchAdminActivity = (limit = 50, offset = 0) =>
    api.get('/admin/activity', { params: { limit, offset } }).then(r => r.data);
export const fetchAdminHealth = () => api.get('/admin/health').then(r => r.data);

// ---- Users ----

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: string;
    avatarUrl: string;
    isActive: number;
    createdAt: string;
    updatedAt: string;
}

export const fetchAdminUsers = (params?: { role?: string; status?: string; search?: string }) =>
    api.get<AdminUser[]>('/admin/users', { params }).then(r => r.data);

export const updateAdminUser = (id: string, data: { name?: string; email?: string; role?: string }) =>
    api.put(`/admin/users/${id}`, data).then(r => r.data);

export const activateUser = (id: string) =>
    api.patch(`/admin/users/${id}/activate`).then(r => r.data);

export const deactivateUser = (id: string) =>
    api.patch(`/admin/users/${id}/deactivate`).then(r => r.data);

export const deleteAdminUser = (id: string) =>
    api.delete(`/admin/users/${id}`).then(r => r.data);

export const resetUserPassword = (id: string, newPassword?: string) =>
    api.post(`/admin/users/${id}/reset-password`, { newPassword }).then(r => r.data);

// ---- Projects ----

export interface AdminProject {
    id: string;
    key: string;
    name: string;
    description: string;
    leadId: string;
    leadName: string;
    avatarUrl: string;
    createdAt: string;
    updatedAt: string;
    issueCount: number;
    closedIssueCount: number;
}

export const fetchAdminProjects = () =>
    api.get<AdminProject[]>('/admin/projects').then(r => r.data);

export const transferProjectOwner = (id: string, newLeadId: string) =>
    api.patch(`/admin/projects/${id}/owner`, { newLeadId }).then(r => r.data);

export const deleteAdminProject = (id: string) =>
    api.delete(`/admin/projects/${id}`).then(r => r.data);

// ---- Teams ----

export interface AdminTeam {
    id: string;
    name: string;
    description: string;
    avatarUrl: string;
    leadId: string;
    leadName: string;
    createdAt: string;
    updatedAt: string;
    memberCount: number;
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    userRole: string;
    teamRole: string;
}

export const fetchAdminTeams = () =>
    api.get<AdminTeam[]>('/admin/teams').then(r => r.data);

export const fetchTeamById = (id: string) =>
    api.get(`/admin/teams/${id}`).then(r => r.data);

export const createTeam = (data: { name: string; description?: string; leadId?: string; memberIds?: string[] }) =>
    api.post('/admin/teams', data).then(r => r.data);

export const updateTeam = (id: string, data: { name?: string; description?: string; leadId?: string }) =>
    api.put(`/admin/teams/${id}`, data).then(r => r.data);

export const updateTeamMembers = (id: string, data: { add?: string[]; remove?: string[] }) =>
    api.patch(`/admin/teams/${id}/members`, data).then(r => r.data);

export const deleteAdminTeam = (id: string) =>
    api.delete(`/admin/teams/${id}`).then(r => r.data);

// ---- Settings ----

export interface WorkspaceSettings {
    id: number;
    name: string;
    logoUrl: string | null;
    timezone: string;
    language: string;
    defaultRole: string;
    passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireNumber: boolean;
    };
    sessionTimeoutMinutes: number;
    twoFactorRequired: boolean;
    email: {
        smtpHost: string | null;
        smtpPort: number | null;
        smtpUser: string | null;
        fromEmail: string | null;
        fromName: string | null;
    };
    issueKeyFormat: string;
    createdAt: string;
    updatedAt: string;
}

export const fetchAdminSettings = () =>
    api.get<WorkspaceSettings>('/admin/settings').then(r => r.data);

export const updateAdminSettings = (data: Partial<WorkspaceSettings>) =>
    api.put('/admin/settings', data).then(r => r.data);

// ---- Audit Log ----

export interface AuditEntry {
    id: string;
    issueId: string | null;
    userId: string;
    userName: string;
    userAvatar: string;
    action: string;
    fieldName: string | null;
    oldValue: string | null;
    newValue: string | null;
    createdAt: string;
}

export const fetchAuditLog = (params?: {
    userId?: string; action?: string; startDate?: string; endDate?: string; limit?: number; offset?: number;
}) => api.get<{ entries: AuditEntry[]; total: number; limit: number; offset: number }>('/admin/audit-log', { params }).then(r => r.data);

// ---- Reports ----

export const fetchUserActivityReport = () =>
    api.get('/admin/reports/user-activity').then(r => r.data);

export const fetchProjectHealthReport = () =>
    api.get('/admin/reports/project-health').then(r => r.data);

export const fetchIssueDistributionReport = () =>
    api.get('/admin/reports/issues').then(r => r.data);

export const fetchTeamPerformanceReport = () =>
    api.get('/admin/reports/teams').then(r => r.data);
