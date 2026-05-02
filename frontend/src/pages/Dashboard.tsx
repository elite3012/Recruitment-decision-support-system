import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api/client';
import { Users, Briefcase, CheckCircle } from 'lucide-react';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import DashboardKPICard from '../components/Dashboard/DashboardKPICard';

const Dashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary,
  });

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse">Loading dashboard metrics...</div>;
  if (isError) return <div className="p-8 text-red-500 font-medium">Failed to load dashboard. Ensure backend is running.</div>;
  
  return (
    <div className="space-y-6">
      <DashboardHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardKPICard
          title="Total Jobs"
          value={data?.total_jobs?.toLocaleString() || 0}
          icon={Briefcase}
          iconColorClass="text-blue-600"
          iconBgClass="bg-blue-50"
        />
        <DashboardKPICard
          title="Candidates"
          value={data?.total_candidates?.toLocaleString() || 0}
          icon={Users}
          iconColorClass="text-green-600"
          iconBgClass="bg-green-50"
        />
        <DashboardKPICard
          title="System Status"
          value={data?.system_status || 'Unknown'}
          icon={CheckCircle}
          iconColorClass="text-slate-600"
          iconBgClass="bg-slate-50"
        />
      </div>
    </div>
  );
};

export default Dashboard;