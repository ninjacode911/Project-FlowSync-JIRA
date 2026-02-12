import React, { useEffect, useState } from 'react';
import { BarChart3, Download, Users, FolderKanban, AlertCircle } from 'lucide-react';
import {
  fetchUserActivityReport, fetchProjectHealthReport,
  fetchIssueDistributionReport, fetchTeamPerformanceReport,
} from '../../src/services/adminService';

type Tab = 'users' | 'projects' | 'issues' | 'teams';

interface UserActivity {
  id: string; name: string; email: string; role: string; avatarUrl: string;
  assignedIssues: number; completedIssues: number; reportedIssues: number;
  commentsCount: number; actionsThisWeek: number;
}

interface ProjectHealth {
  id: string; key: string; name: string;
  totalIssues: number; todoCount: number; inProgressCount: number;
  inReviewCount: number; doneCount: number; overdueCount: number;
}

interface IssueDistribution {
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  byType: { type: string; count: number }[];
  createdPerDay: { date: string; count: number }[];
}

interface TeamPerf {
  id: string; name: string; memberCount: number;
  totalIssues: number; completedIssues: number;
}

const BarBlock: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => (
  <div className="flex items-center space-x-3">
    <span className="text-sm text-slate-600 w-24 truncate">{label}</span>
    <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
    </div>
    <span className="text-sm font-medium text-slate-700 w-8 text-right">{value}</span>
  </div>
);

const AdminReports: React.FC = () => {
  const [tab, setTab] = useState<Tab>('users');
  const [loading, setLoading] = useState(true);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [projectHealth, setProjectHealth] = useState<ProjectHealth[]>([]);
  const [issueDistribution, setIssueDistribution] = useState<IssueDistribution | null>(null);
  const [teamPerf, setTeamPerf] = useState<TeamPerf[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (tab === 'users') setUserActivity(await fetchUserActivityReport());
        else if (tab === 'projects') setProjectHealth(await fetchProjectHealthReport());
        else if (tab === 'issues') setIssueDistribution(await fetchIssueDistributionReport());
        else if (tab === 'teams') setTeamPerf(await fetchTeamPerformanceReport());
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [tab]);

  const exportCSV = (headers: string[], rows: string[][], filename: string) => {
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCurrentTab = () => {
    if (tab === 'users') {
      exportCSV(
        ['Name', 'Email', 'Role', 'Assigned', 'Completed', 'Reported', 'Comments', 'Actions (7d)'],
        userActivity.map(u => [u.name, u.email, u.role, String(u.assignedIssues), String(u.completedIssues), String(u.reportedIssues), String(u.commentsCount), String(u.actionsThisWeek)]),
        'user_activity_report'
      );
    } else if (tab === 'projects') {
      exportCSV(
        ['Name', 'Key', 'Total', 'To Do', 'In Progress', 'In Review', 'Done', 'Overdue'],
        projectHealth.map(p => [p.name, p.key, String(p.totalIssues), String(p.todoCount), String(p.inProgressCount), String(p.inReviewCount), String(p.doneCount), String(p.overdueCount)]),
        'project_health_report'
      );
    } else if (tab === 'issues' && issueDistribution) {
      exportCSV(
        ['Category', 'Label', 'Count'],
        [
          ...issueDistribution.byStatus.map(s => ['Status', s.status, String(s.count)]),
          ...issueDistribution.byPriority.map(p => ['Priority', p.priority, String(p.count)]),
          ...issueDistribution.byType.map(t => ['Type', t.type, String(t.count)]),
        ],
        'issue_distribution_report'
      );
    } else if (tab === 'teams') {
      exportCSV(
        ['Team', 'Members', 'Total Issues', 'Completed', 'Rate'],
        teamPerf.map(t => [t.name, String(t.memberCount), String(t.totalIssues), String(t.completedIssues),
        t.totalIssues > 0 ? `${Math.round((t.completedIssues / t.totalIssues) * 100)}%` : '0%']),
        'team_performance_report'
      );
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'users', label: 'User Activity', icon: <Users size={16} /> },
    { key: 'projects', label: 'Project Health', icon: <FolderKanban size={16} /> },
    { key: 'issues', label: 'Issue Distribution', icon: <AlertCircle size={16} /> },
    { key: 'teams', label: 'Team Performance', icon: <Users size={16} /> },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 mt-1">Analytics and insights across your workspace.</p>
        </div>
        <button onClick={exportCurrentTab} className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
          <Download size={16} /><span>Export CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-4">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center space-x-2 pb-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : (
        <>
          {/* User Activity Tab */}
          {tab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
              {userActivity.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-500">No user data available.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">User</th>
                      <th className="text-center text-xs font-medium text-slate-500 px-3 py-3">Assigned</th>
                      <th className="text-center text-xs font-medium text-slate-500 px-3 py-3">Completed</th>
                      <th className="text-center text-xs font-medium text-slate-500 px-3 py-3">Reported</th>
                      <th className="text-center text-xs font-medium text-slate-500 px-3 py-3">Comments</th>
                      <th className="text-center text-xs font-medium text-slate-500 px-3 py-3">Actions (7d)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userActivity.map(u => (
                      <tr key={u.id} className="border-b border-slate-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center space-x-2">
                            <img src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt={u.name} className="w-7 h-7 rounded-full" />
                            <div>
                              <p className="text-sm font-medium text-slate-700">{u.name}</p>
                              <p className="text-xs text-slate-400">{u.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center text-sm text-slate-700 px-3 py-3">{u.assignedIssues}</td>
                        <td className="text-center text-sm text-slate-700 px-3 py-3">{u.completedIssues}</td>
                        <td className="text-center text-sm text-slate-700 px-3 py-3">{u.reportedIssues}</td>
                        <td className="text-center text-sm text-slate-700 px-3 py-3">{u.commentsCount}</td>
                        <td className="text-center px-3 py-3">
                          <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${u.actionsThisWeek > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {u.actionsThisWeek}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Project Health Tab */}
          {tab === 'projects' && (
            <div className="space-y-4">
              {projectHealth.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-500 bg-white rounded-xl shadow-sm border border-slate-100">No projects.</div>
              ) : (
                projectHealth.map(p => {
                  const max = p.totalIssues || 1;
                  return (
                    <div key={p.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-slate-800">{p.name}</h3>
                          <p className="text-xs text-slate-400">{p.key} · {p.totalIssues} issues</p>
                        </div>
                        {p.overdueCount > 0 && (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700">{p.overdueCount} overdue</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <BarBlock label="To Do" value={p.todoCount} max={max} color="bg-slate-400" />
                        <BarBlock label="In Progress" value={p.inProgressCount} max={max} color="bg-blue-500" />
                        <BarBlock label="In Review" value={p.inReviewCount} max={max} color="bg-amber-500" />
                        <BarBlock label="Done" value={p.doneCount} max={max} color="bg-emerald-500" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Issue Distribution Tab */}
          {tab === 'issues' && issueDistribution && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-800 mb-4">By Status</h3>
                <div className="space-y-2">
                  {issueDistribution.byStatus.map(s => (
                    <BarBlock key={s.status} label={s.status} value={s.count} max={Math.max(...issueDistribution.byStatus.map(x => x.count), 1)} color="bg-blue-500" />
                  ))}
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-800 mb-4">By Priority</h3>
                <div className="space-y-2">
                  {issueDistribution.byPriority.map(p => {
                    const colors: Record<string, string> = { Highest: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-amber-500', Low: 'bg-blue-400', Lowest: 'bg-slate-400' };
                    return <BarBlock key={p.priority} label={p.priority} value={p.count} max={Math.max(...issueDistribution.byPriority.map(x => x.count), 1)} color={colors[p.priority] || 'bg-slate-400'} />;
                  })}
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-800 mb-4">By Type</h3>
                <div className="space-y-2">
                  {issueDistribution.byType.map(t => {
                    const colors: Record<string, string> = { Story: 'bg-green-500', Task: 'bg-blue-500', Bug: 'bg-red-500', Epic: 'bg-purple-500' };
                    return <BarBlock key={t.type} label={t.type} value={t.count} max={Math.max(...issueDistribution.byType.map(x => x.count), 1)} color={colors[t.type] || 'bg-slate-400'} />;
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Team Performance Tab */}
          {tab === 'teams' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
              {teamPerf.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-500">No teams yet.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Team</th>
                      <th className="text-center text-xs font-medium text-slate-500 px-3 py-3">Members</th>
                      <th className="text-center text-xs font-medium text-slate-500 px-3 py-3">Issues</th>
                      <th className="text-center text-xs font-medium text-slate-500 px-3 py-3">Completed</th>
                      <th className="text-center text-xs font-medium text-slate-500 px-3 py-3">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamPerf.map(t => {
                      const rate = t.totalIssues > 0 ? Math.round((t.completedIssues / t.totalIssues) * 100) : 0;
                      return (
                        <tr key={t.id} className="border-b border-slate-50">
                          <td className="px-5 py-3 text-sm font-medium text-slate-800">{t.name}</td>
                          <td className="text-center text-sm text-slate-700 px-3 py-3">{t.memberCount}</td>
                          <td className="text-center text-sm text-slate-700 px-3 py-3">{t.totalIssues}</td>
                          <td className="text-center text-sm text-slate-700 px-3 py-3">{t.completedIssues}</td>
                          <td className="text-center px-3 py-3">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rate}%` }} />
                              </div>
                              <span className="text-xs text-slate-500">{rate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminReports;
