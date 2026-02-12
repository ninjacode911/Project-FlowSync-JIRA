import React, { useEffect, useState, useCallback } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchAuditLog, fetchAdminUsers, AuditEntry, AdminUser } from '../../src/services/adminService';

const PAGE_SIZE = 20;

const actionLabels: Record<string, string> = {
  user_created: 'User Created', user_updated: 'User Updated', user_activated: 'User Activated',
  user_deactivated: 'User Deactivated', user_deleted: 'User Deleted', role_changed: 'Role Changed',
  password_reset: 'Password Reset', project_created: 'Project Created', project_deleted: 'Project Deleted',
  project_owner_transferred: 'Ownership Transferred', team_created: 'Team Created',
  team_updated: 'Team Updated', team_deleted: 'Team Deleted', team_members_updated: 'Members Updated',
  settings_updated: 'Settings Updated', status_changed: 'Status Changed', issue_created: 'Issue Created',
};

const actionColor = (action: string) => {
  if (action.includes('deleted')) return 'bg-red-100 text-red-700';
  if (action.includes('created')) return 'bg-green-100 text-green-700';
  if (action.includes('activated')) return 'bg-emerald-100 text-emerald-700';
  if (action.includes('deactivated')) return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-600';
};

const AdminAuditLog: React.FC = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { limit: PAGE_SIZE, offset: page * PAGE_SIZE };
      if (filterUser) params.userId = filterUser;
      if (filterAction) params.action = filterAction;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const data = await fetchAuditLog(params);
      setEntries(data.entries);
      setTotal(data.total);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, filterUser, filterAction, startDate, endDate]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const loadUsers = async () => {
      try { setUsers(await fetchAdminUsers()); } catch (e) { console.error(e); }
    };
    loadUsers();
  }, []);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const uniqueActions = [...new Set(entries.map(e => e.action))].sort();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
        <p className="text-slate-500 mt-1">Track all administrative actions in the workspace.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <select value={filterUser} onChange={e => { setFilterUser(e.target.value); setPage(0); }} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All Users</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(0); }} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All Actions</option>
            {Object.entries(actionLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(0); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Start date" />
        <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(0); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="End date" />
        {(filterUser || filterAction || startDate || endDate) && (
          <button onClick={() => { setFilterUser(''); setFilterAction(''); setStartDate(''); setEndDate(''); setPage(0); }}
            className="text-sm text-blue-600 hover:text-blue-700">Clear filters</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-500">No audit log entries found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">User</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Action</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Details</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-25 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center space-x-2">
                      <img src={e.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.userName}`} alt={e.userName} className="w-7 h-7 rounded-full" />
                      <span className="text-sm font-medium text-slate-700">{e.userName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${actionColor(e.action)}`}>
                      {actionLabels[e.action] || e.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600 max-w-xs truncate">
                    {e.fieldName && <span className="text-slate-400">{e.fieldName}: </span>}
                    {e.oldValue && <span className="line-through text-red-400 mr-1">{e.oldValue}</span>}
                    {e.newValue && <span className="text-green-600">{e.newValue}</span>}
                    {!e.fieldName && !e.newValue && '—'}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500">
                    {e.createdAt ? new Date(e.createdAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center space-x-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-slate-600">Page {page + 1} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLog;
