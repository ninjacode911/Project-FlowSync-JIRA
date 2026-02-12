import React, { useEffect, useState, useCallback } from 'react';
import { Trash2, ArrowRightLeft, FolderKanban, ChevronDown } from 'lucide-react';
import { fetchAdminProjects, fetchAdminUsers, transferProjectOwner, deleteAdminProject, AdminProject, AdminUser } from '../../src/services/adminService';

const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [transferProject, setTransferProject] = useState<AdminProject | null>(null);
  const [newLeadId, setNewLeadId] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<AdminProject | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, u] = await Promise.all([fetchAdminProjects(), fetchAdminUsers({ status: 'active' })]);
      setProjects(p);
      setUsers(u);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  const showMsg = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const handleTransfer = async () => {
    if (!transferProject || !newLeadId) return;
    try {
      await transferProjectOwner(transferProject.id, newLeadId);
      showMsg(`Ownership of "${transferProject.name}" transferred`);
      setTransferProject(null);
      setNewLeadId('');
      load();
    } catch (e: any) { showMsg(e.response?.data?.error || 'Error transferring ownership'); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteAdminProject(confirmDelete.id);
      showMsg(`Project "${confirmDelete.name}" deleted`);
      setConfirmDelete(null);
      load();
    } catch (e: any) { showMsg(e.response?.data?.error || 'Error deleting project'); }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Project Management</h1>
        <p className="text-slate-500 mt-1">Oversee all projects and transfer ownership.</p>
      </div>

      {actionMsg && <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">{actionMsg}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No projects yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Project</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Lead</th>
                <th className="text-center text-xs font-medium text-slate-500 px-5 py-3">Issues</th>
                <th className="text-center text-xs font-medium text-slate-500 px-5 py-3">Progress</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Created</th>
                <th className="text-right text-xs font-medium text-slate-500 px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => {
                const progress = p.issueCount > 0 ? Math.round((p.closedIssueCount / p.issueCount) * 100) : 0;
                return (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-25 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center space-x-3">
                        <img src={p.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${p.name}`} alt={p.name} className="w-8 h-8 rounded-lg" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.key}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{p.leadName || '—'}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm font-medium text-slate-700">{p.closedIssueCount}/{p.issueCount}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 w-8">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => { setTransferProject(p); setNewLeadId(''); }} title="Transfer ownership" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <ArrowRightLeft size={15} />
                        </button>
                        <button onClick={() => setConfirmDelete(p)} title="Delete" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Transfer Ownership Modal */}
      {transferProject && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setTransferProject(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Transfer Ownership</h3>
            <p className="text-sm text-slate-500 mb-4">
              Transfer <span className="font-medium text-slate-700">{transferProject.name}</span> to a new lead.
            </p>
            <div className="relative">
              <select value={newLeadId} onChange={e => setNewLeadId(e.target.value)} className="w-full appearance-none px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select new lead...</option>
                {users.filter(u => u.id !== transferProject.leadId).map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setTransferProject(null)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
              <button onClick={handleTransfer} disabled={!newLeadId} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Transfer</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Project?</h3>
            <p className="text-sm text-slate-500 mb-5">
              This will permanently delete <span className="font-medium text-slate-700">{confirmDelete.name}</span> and all its issues, sprints, and comments.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
