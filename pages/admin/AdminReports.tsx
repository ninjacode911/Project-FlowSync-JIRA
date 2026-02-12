import React from 'react';

const AdminReports: React.FC = () => {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Reports</h1>
      <p className="text-slate-500 mb-6">
        Analyze workspace metrics and export reports.
      </p>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <p className="text-sm text-slate-500">
          Charts and export actions will be implemented here.
        </p>
      </div>
    </div>
  );
};

export default AdminReports;

