import React from 'react';

const AdminSettings: React.FC = () => {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Workspace Settings</h1>
      <p className="text-slate-500 mb-6">
        Configure workspace-wide settings such as name, timezone, security, and email.
      </p>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <p className="text-sm text-slate-500">Settings forms will be implemented here.</p>
      </div>
    </div>
  );
};

export default AdminSettings;

