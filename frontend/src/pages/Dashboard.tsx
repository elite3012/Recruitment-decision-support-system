import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api/client';
import { Users, Briefcase, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { data: summary, isLoading: loadingSummary, isError: errorSummary } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary,
  });

  if (loadingSummary) return <div className="p-8 text-slate-500 animate-pulse">Loading dashboard metrics...</div>;
  if (errorSummary) return <div className="p-8 text-red-500 font-medium">Failed to load dashboard. Ensure backend is running.</div>;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Executive Overview</h2>
        <p className="text-sm text-slate-500">Key metrics and distribution analytics.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Jobs</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{summary?.total_jobs?.toLocaleString() || 0}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Candidates</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{summary?.total_candidates?.toLocaleString() || 0}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">System Status</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{summary?.system_status || 'Unknown'}</p>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;