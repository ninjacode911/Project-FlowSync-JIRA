import React, { useEffect, useState, useCallback } from 'react';
import { Search, Edit2, UserCheck, UserX, Trash2, RotateCcw, X, ChevronDown } from 'lucide-react';
import {
  fetchAdminUsers, updateAdminUser, activateUser, deactivateUser,
  deleteAdminUser, resetUserPassword, AdminUser
} from '../../src/services/adminService';

const ROLES = ['ADMIN', 'PROJECT_MANAGER', 'MEMBER', 'VIEWER'] as const;

const roleBadge = (role: string) => {
  const colors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    PROJECT_MANAGER: 'bg-blue-100 text-blue-700',
    MEMBER: 'bg-green-100 text-green-700',
    VIEWER: 'bg-slate-100 text-slate-600',
  };
  return colors[role] || 'bg-slate-100 text-slate-600';
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const data = await fetchAdminUsers(params);
      setUsers(data);
    } catch (e) { console.error('Error loading users:', e); }
    setLoading(false);
  }, [search, roleFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const showMsg = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleEdit = (u: AdminUser) => {
    setEditUser(u);
    setEditForm({ name: u.name, email: u.email, role: u.role });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await updateAdminUser(editUser.id, editForm);
      showMsg(`User ${editForm.name} updated`);
      setEditUser(null);
      load();
    } catch (e: any) {
      showMsg(e.response?.data?.error || 'Error updating user');
    }
    setSaving(false);
  };

  const handleToggleActive = async (u: AdminUser) => {
    try {
      if (u.isActive) {
        await deactivateUser(u.id);
        showMsg(`${u.name} deactivated`);
      } else {
        await activateUser(u.id);
        showMsg(`${u.name} activated`);
      }
      load();
    } catch (e: any) {
      showMsg(e.response?.data?.error || 'Error toggling user status');
    }
  };

  const handleResetPassword = async (u: AdminUser) => {
    try {
      const result = await resetUserPassword(u.id);
      showMsg(`Password reset for ${u.name}. Temp: ${result.temporaryPassword}`);
    } catch (e: any) {
      showMsg(e.response?.data?.error || 'Error resetting password');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteAdminUser(confirmDelete.id);
      showMsg(`User ${confirmDelete.name} deleted`);
      setConfirmDelete(null);
      load();
    } catch (e: any) {
      showMsg(e.response?.data?.error || 'Error deleting user');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-500 mt-1">Manage users, roles, and account status.</p>
      </div>

      {/* Action message */}
      {actionMsg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
          {actionMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-500">No users found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">User</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Role</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Joined</th>
                <th className="text-right text-xs font-medium text-slate-500 px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-25 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center space-x-3">
                      <img src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt={u.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleBadge(u.role)}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end space-x-1">
                      <button onClick={() => handleEdit(u)} title="Edit" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(u)}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`}
                      >
                        {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                      <button onClick={() => handleResetPassword(u)} title="Reset password" className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <RotateCcw size={15} />
                      </button>
                      <button onClick={() => setConfirmDelete(u)} title="Delete" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditUser(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900">Edit User</h3>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setEditUser(null)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete User?</h3>
            <p className="text-sm text-slate-500 mb-5">
              This will permanently delete <span className="font-medium text-slate-700">{confirmDelete.name}</span> and unassign them from all issues. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
