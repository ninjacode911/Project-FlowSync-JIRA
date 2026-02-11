import React from 'react';
import { useProject } from '../context/ProjectContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { PriorityIcon } from '../components/ui/Icons';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Dashboard: React.FC = () => {
  const { issues, currentUser, projects, currentProjectId, isLoading, error, refreshData } = useProject();

  // TEMPORARY: Show loading and error states
  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refreshData} />;
  }

  const myIssues = issues.filter(i => i.assigneeId === currentUser.id && i.status !== 'Done');
  const recentProject = projects.find(p => p.id === currentProjectId);

  // Stats
  const totalIssues = issues.length;
  const doneIssues = issues.filter(i => i.status === 'Done').length;
  const inProgressIssues = issues.filter(i => i.status === 'In Progress').length;

  // Data for Charts
  const statusData = [
    { name: 'To Do', value: issues.filter(i => i.status === 'To Do').length, color: '#94a3b8' },
    { name: 'In Progress', value: inProgressIssues, color: '#3b82f6' },
    { name: 'In Review', value: issues.filter(i => i.status === 'In Review').length, color: '#8b5cf6' },
    { name: 'Done', value: doneIssues, color: '#22c55e' },
  ].filter(d => d.value > 0);

  const priorityData = [
    { name: 'High/Highest', count: issues.filter(i => i.priority === 'High' || i.priority === 'Highest').length },
    { name: 'Medium', count: issues.filter(i => i.priority === 'Medium').length },
    { name: 'Low/Lowest', count: issues.filter(i => i.priority === 'Low' || i.priority === 'Lowest').length },
  ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-full bg-opacity-10 ${color.bg}`}>
        <Icon className={`w-6 h-6 ${color.text}`} />
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {currentUser.name.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 mt-1">Here's what's happening in <span className="font-semibold text-slate-700">{recentProject?.name}</span> today.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Issues" value={totalIssues} icon={FileText} color={{ bg: 'bg-blue-100', text: 'text-blue-600' }} />
        <StatCard title="In Progress" value={inProgressIssues} icon={Clock} color={{ bg: 'bg-indigo-100', text: 'text-indigo-600' }} />
        <StatCard title="Completed" value={doneIssues} icon={CheckCircle2} color={{ bg: 'bg-green-100', text: 'text-green-600' }} />
        <StatCard title="Assigned to Me" value={myIssues.length} icon={AlertCircle} color={{ bg: 'bg-orange-100', text: 'text-orange-600' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Col: Charts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Status Overview</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Priority Bar Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Issues by Priority</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: Assigned to me */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-full max-h-[660px]">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Assigned to Me</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {myIssues.length > 0 ? (
                <div className="space-y-3">
                  {myIssues.map(issue => (
                    <div key={issue.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs text-slate-500 font-medium">{issue.key}</span>
                        <PriorityIcon priority={issue.priority} className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-medium text-slate-800 mb-2 line-clamp-2">{issue.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {issue.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4">
                  <CheckCircle2 size={48} className="mb-4 text-green-100" />
                  <p>All caught up!</p>
                  <p className="text-xs mt-1">No pending issues assigned to you.</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
              <button className="text-sm text-blue-600 font-medium hover:underline w-full text-center">View all my issues</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;