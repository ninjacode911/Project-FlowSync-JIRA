import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Workspace-wide overview and controls for administrators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Placeholder stat cards to be wired to /api/admin/overview later */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-slate-800">-</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Projects</p>
          <p className="text-2xl font-bold text-slate-800">-</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Open Issues</p>
          <p className="text-2xl font-bold text-slate-800">-</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Active Users (7d)</p>
          <p className="text-2xl font-bold text-slate-800">-</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Recent Activity</h2>
          <p className="text-sm text-slate-500">
            Activity feed will be connected to the audit log soon.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Quick Actions</h2>
          <ul className="space-y-2 text-sm text-blue-600">
            <li>Invite users</li>
            <li>Create team</li>
            <li>Open workspace settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

