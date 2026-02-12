import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FolderKanban, AlertCircle, Activity, TrendingUp, UserCheck } from 'lucide-react';
import { fetchAdminOverview, fetchAdminHealth, fetchAdminActivity } from '../../src/services/adminService';

interface OverviewData {
  totals: { users: number; activeUsers: number; projects: number; issues: number; openIssues: number; closedIssues: number; teams: number };
  activity: { issuesThisWeek: number; issuesThisMonth: number };
}

interface HealthData {
  activeUsersLast7Days: number; staleProjects: number; openIssues: number; closedIssues: number; overdueIssues: number;
}

interface ActivityEntry {
  id: string; userName: string; userAvatar: string; action: string; fieldName: string | null;
  oldValue: string | null; newValue: string | null; createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, hl, act] = await Promise.all([
          fetchAdminOverview(),
          fetchAdminHealth(),
          fetchAdminActivity(10, 0),
        ]);
        setOverview(ov);
        setHealth(hl);
        setActivity(act);
      } catch (e) { console.error('Error loading admin dashboard:', e); }
      setLoading(false);
    };
    load();
  }, []);

  const formatAction = (action: string) => {
    const map: Record<string, string> = {
      user_created: 'Created user', user_updated: 'Updated user', user_activated: 'Activated user',
      user_deactivated: 'Deactivated user', user_deleted: 'Deleted user', role_changed: 'Changed role',
      project_created: 'Created project', project_deleted: 'Deleted project',
      project_owner_transferred: 'Transferred project',
      team_created: 'Created team', team_deleted: 'Deleted team', team_updated: 'Updated team',
      team_members_updated: 'Updated team members', settings_updated: 'Updated settings',
      password_reset: 'Reset password', status_changed: 'Changed status', issue_created: 'Created issue',
    };
    return map[action] || action.replace(/_/g, ' ');
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: overview?.totals.users || 0, icon: Users, color: 'bg-blue-50 text-blue-600', onClick: () => navigate('/admin/users') },
    { label: 'Projects', value: overview?.totals.projects || 0, icon: FolderKanban, color: 'bg-emerald-50 text-emerald-600', onClick: () => navigate('/admin/projects') },
    { label: 'Open Issues', value: overview?.totals.openIssues || 0, icon: AlertCircle, color: 'bg-amber-50 text-amber-600' },
    { label: 'Active Users (7d)', value: health?.activeUsersLast7Days || 0, icon: UserCheck, color: 'bg-purple-50 text-purple-600' },
    { label: 'Teams', value: overview?.totals.teams || 0, icon: Users, color: 'bg-indigo-50 text-indigo-600', onClick: () => navigate('/admin/teams') },
    { label: 'Issues This Week', value: overview?.activity.issuesThisWeek || 0, icon: TrendingUp, color: 'bg-cyan-50 text-cyan-600' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Workspace overview and controls.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            onClick={s.onClick}
            className={`bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4 ${s.onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>
            <button onClick={() => navigate('/admin/audit-log')} className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </button>
          </div>
          {activity.length === 0 ? (
            <p className="text-sm text-slate-500">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {activity.map(a => (
                <div key={a.id} className="flex items-start space-x-3 py-2 border-b border-slate-50 last:border-0">
                  <img
                    src={a.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.userName}`}
                    alt={a.userName}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">{a.userName}</span>{' '}
                      <span className="text-slate-500">{formatAction(a.action)}</span>
                      {a.newValue && <span className="font-medium text-slate-600"> — {a.newValue}</span>}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{timeAgo(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Health */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <button onClick={() => navigate('/admin/users')} className="w-full text-left text-sm text-blue-600 hover:text-blue-700 py-1.5">
                → Manage users
              </button>
              <button onClick={() => navigate('/admin/teams')} className="w-full text-left text-sm text-blue-600 hover:text-blue-700 py-1.5">
                → Create a team
              </button>
              <button onClick={() => navigate('/admin/settings')} className="w-full text-left text-sm text-blue-600 hover:text-blue-700 py-1.5">
                → Workspace settings
              </button>
              <button onClick={() => navigate('/admin/reports')} className="w-full text-left text-sm text-blue-600 hover:text-blue-700 py-1.5">
                → View reports
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Health</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Overdue issues</span>
                <span className={`font-medium ${(health?.overdueIssues || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {health?.overdueIssues || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Stale projects</span>
                <span className={`font-medium ${(health?.staleProjects || 0) > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  {health?.staleProjects || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Completion rate</span>
                <span className="font-medium text-slate-700">
                  {overview && overview.totals.issues > 0
                    ? `${Math.round((overview.totals.closedIssues / overview.totals.issues) * 100)}%`
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
