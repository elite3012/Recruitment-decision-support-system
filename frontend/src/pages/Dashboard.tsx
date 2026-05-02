import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api/client';
import { Users, Briefcase, CheckCircle } from 'lucide-react';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import DashboardKPICard from '../components/Dashboard/DashboardKPICard';

const Dashboard = () => {
  const { data: summary, isLoading: loadingSummary, isError: errorSummary } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary,
  });

  if (loadingSummary) return <div className="p-8 text-slate-500 animate-pulse">Loading dashboard metrics...</div>;
  if (errorSummary) return <div className="p-8 text-red-500 font-medium">Failed to load dashboard. Ensure backend is running.</div>;
  
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-5xl font-black font-primary uppercase tracking-tighter text-neu-text italic">Executive Overview</h2>
        <p className="text-xs font-bold font-mono text-neu-text/40 uppercase tracking-widest">REAL-TIME_RECRUITMENT_METRICS_V2</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardKPICard
          title="Total Jobs"
          value={summary?.total_jobs?.toLocaleString() || 0}
          icon={Briefcase}
          iconColorClass="text-neu-primary"
          iconBgClass="bg-neu-surface shadow-neu-inner"
        />
        <DashboardKPICard
          title="Candidates"
          value={summary?.total_candidates?.toLocaleString() || 0}
          icon={Users}
          iconColorClass="text-neu-success"
          iconBgClass="bg-neu-surface shadow-neu-inner"
        />
        <DashboardKPICard
          title="System Status"
          value={summary?.system_status || 'Unknown'}
          icon={CheckCircle}
          iconColorClass="text-neu-text"
          iconBgClass="bg-neu-surface shadow-neu-inner"
        />
      </div>
    </div>
  );
};

export default Dashboard;