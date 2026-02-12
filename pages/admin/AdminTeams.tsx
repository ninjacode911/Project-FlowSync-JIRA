import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Users, X, UserPlus, UserMinus } from 'lucide-react';
import {
  fetchAdminTeams, fetchTeamById, createTeam, updateTeam,
  updateTeamMembers, deleteAdminTeam, AdminTeam, TeamMember
} from '../../src/services/adminService';
import { fetchAdminUsers, AdminUser } from '../../src/services/adminService';

const AdminTeams: React.FC = () => {
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editTeam, setEditTeam] = useState<AdminTeam | null>(null);
  const [manageMembersTeam, setManageMembersTeam] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<AdminTeam | null>(null);
  const [form, setForm] = useState({ name: '', description: '', leadId: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setTeams(await fetchAdminTeams()); } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const showMsg = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await createTeam({ name: form.name, description: form.description, leadId: form.leadId || undefined });
      showMsg(`Team "${form.name}" created`);
      setShowCreate(false);
      setForm({ name: '', description: '', leadId: '' });
      load();
    } catch (e: any) { showMsg(e.response?.data?.error || 'Error creating team'); }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editTeam) return;
    setSaving(true);
    try {
      await updateTeam(editTeam.id, { name: form.name, description: form.description, leadId: form.leadId || undefined });
      showMsg(`Team updated`);
      setEditTeam(null);
      load();
    } catch (e: any) { showMsg(e.response?.data?.error || 'Error updating team'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteAdminTeam(confirmDelete.id);
      showMsg(`Team "${confirmDelete.name}" deleted`);
      setConfirmDelete(null);
      load();
    } catch (e: any) { showMsg(e.response?.data?.error || 'Error deleting team'); }
  };

  const openManageMembers = async (teamId: string) => {
    setManageMembersTeam(teamId);
    try {
      const data = await fetchTeamById(teamId);
      setTeamMembers(data.members || []);
      const users = await fetchAdminUsers({ status: 'active' });
      setAllUsers(users);
    } catch (e) { console.error(e); }
  };

  const addMember = async (userId: string) => {
    if (!manageMembersTeam) return;
    try {
      const result = await updateTeamMembers(manageMembersTeam, { add: [userId] });
      setTeamMembers(result.members);
      showMsg('Member added');
      load();
    } catch (e: any) { showMsg(e.response?.data?.error || 'Error'); }
  };

  const removeMember = async (userId: string) => {
    if (!manageMembersTeam) return;
    try {
      const result = await updateTeamMembers(manageMembersTeam, { remove: [userId] });
      setTeamMembers(result.members);
      showMsg('Member removed');
      load();
    } catch (e: any) { showMsg(e.response?.data?.error || 'Error'); }
  };

  const openEdit = (t: AdminTeam) => {
    setEditTeam(t);
    setForm({ name: t.name, description: t.description || '', leadId: t.leadId || '' });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
          <p className="text-slate-500 mt-1">Organize users into teams.</p>
        </div>
        <button onClick={() => { setShowCreate(true); setForm({ name: '', description: '', leadId: '' }); }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={16} /><span>New Team</span>
        </button>
      </div>

      {actionMsg && <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">{actionMsg}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : teams.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-100">
          <Users size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No teams yet. Create your first team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(t => (
            <div key={t.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <img src={t.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${t.name}`} alt={t.name} className="w-10 h-10 rounded-lg" />
                  <div>
                    <h3 className="font-semibold text-slate-800">{t.name}</h3>
                    {t.leadName && <p className="text-xs text-slate-500">Lead: {t.leadName}</p>}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => openEdit(t)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={14} /></button>
                  <button onClick={() => setConfirmDelete(t)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
              {t.description && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{t.description}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center space-x-1"><Users size={13} /><span>{t.memberCount} members</span></span>
                <button onClick={() => openManageMembers(t.id)} className="text-xs text-blue-600 hover:text-blue-700">Manage members</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreate || editTeam) && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setShowCreate(false); setEditTeam(null); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900">{editTeam ? 'Edit Team' : 'Create Team'}</h3>
              <button onClick={() => { setShowCreate(false); setEditTeam(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Engineering" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={3} placeholder="Optional team description..." />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => { setShowCreate(false); setEditTeam(null); }} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
              <button onClick={editTeam ? handleUpdate : handleCreate} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : editTeam ? 'Save Changes' : 'Create Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {manageMembersTeam && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setManageMembersTeam(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900">Manage Members</h3>
              <button onClick={() => setManageMembersTeam(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <h4 className="text-sm font-medium text-slate-700 mb-2">Current Members ({teamMembers.length})</h4>
            {teamMembers.length === 0 ? (
              <p className="text-sm text-slate-500 mb-4">No members yet.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {teamMembers.map(m => (
                  <div key={m.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center space-x-2">
                      <img src={m.avatarUrl} alt={m.name} className="w-7 h-7 rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.teamRole}</p>
                      </div>
                    </div>
                    <button onClick={() => removeMember(m.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><UserMinus size={14} /></button>
                  </div>
                ))}
              </div>
            )}

            <h4 className="text-sm font-medium text-slate-700 mb-2">Add Members</h4>
            <div className="space-y-2">
              {allUsers
                .filter(u => !teamMembers.some(m => m.id === u.id))
                .map(u => (
                  <div key={u.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center space-x-2">
                      <img src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt={u.name} className="w-7 h-7 rounded-full" />
                      <p className="text-sm text-slate-700">{u.name}</p>
                    </div>
                    <button onClick={() => addMember(u.id)} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg"><UserPlus size={14} /></button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Team?</h3>
            <p className="text-sm text-slate-500 mb-5">
              Delete <span className="font-medium text-slate-700">{confirmDelete.name}</span>? Members will be unassigned. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete Team</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeams;
