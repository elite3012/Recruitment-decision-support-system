import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api/client';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  Clock3,
  ClipboardCheck,
  Database,
  Target,
  Users,
} from 'lucide-react';
import DashboardKPICard from '../components/Dashboard/DashboardKPICard';

const Dashboard = () => {
  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary,
  });

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse">Loading dashboard metrics...</div>;
  if (isError) return <div className="p-8 text-red-500 font-medium">Failed to load dashboard. Ensure backend is running.</div>;

  const decisionCounts = summary?.decision_counts || {};
  const dataQuality = summary?.data_quality || {};
  const totalDecisions = summary?.total_decisions || 0;
  const recentDecisions = summary?.recent_decisions || [];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black font-primary uppercase tracking-tight text-neu-text">Recruitment Command Center</h2>
          <p className="text-xs font-bold font-mono text-neu-text/40 uppercase tracking-widest">
            PIPELINE_HEALTH_AND_DECISION_INTELLIGENCE
          </p>
        </div>
        <div className="bg-neu-surface shadow-neu-inner rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest text-neu-success">
          {summary?.system_status || 'Unknown'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardKPICard
          title="Active Jobs"
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
          title="Reviewed"
          value={summary?.reviewed_candidates?.toLocaleString() || 0}
          icon={ClipboardCheck}
          iconColorClass="text-neu-text"
          iconBgClass="bg-neu-surface shadow-neu-inner"
        />
        <DashboardKPICard
          title="Pending Review"
          value={summary?.pending_candidates?.toLocaleString() || 0}
          icon={Clock3}
          iconColorClass="text-neu-warning"
          iconBgClass="bg-neu-surface shadow-neu-inner"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 bg-neu-surface shadow-neu rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-neu-text">Decision Funnel</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-neu-text/40 font-mono">
                {summary?.decision_rate || 0}% candidate coverage / {summary?.shortlist_rate || 0}% shortlist ratio
              </p>
            </div>
            <Target className="w-6 h-6 text-neu-primary" />
          </div>

          <div className="space-y-5">
            <DecisionBar label="Shortlist" value={decisionCounts.Shortlist || 0} total={totalDecisions} color="bg-neu-success" />
            <DecisionBar label="Hold" value={decisionCounts.Hold || 0} total={totalDecisions} color="bg-neu-warning" />
            <DecisionBar label="Reject" value={decisionCounts.Reject || 0} total={totalDecisions} color="bg-neu-danger" />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <MiniMetric label="Total Decisions" value={totalDecisions} />
            <MiniMetric label="Jobs With Decisions" value={summary?.jobs_with_decisions || 0} />
            <MiniMetric label="Generated Matches" value={summary?.total_matches || 0} />
          </div>
        </section>

        <section className="bg-neu-surface shadow-neu rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-neu-text">Data Quality</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-neu-text/40 font-mono">
                INPUT_GAPS_THAT_AFFECT_RANKING
              </p>
            </div>
            <Database className="w-6 h-6 text-neu-primary" />
          </div>

          <div className="space-y-4">
            <QualityRow
              label="Jobs missing requirements"
              value={dataQuality.jobs_missing_requirements || 0}
              danger={(dataQuality.jobs_missing_requirements || 0) > 0}
            />
            <QualityRow
              label="Candidates missing skills"
              value={dataQuality.candidates_missing_skills || 0}
              danger={(dataQuality.candidates_missing_skills || 0) > 0}
            />
          </div>
        </section>
      </div>

      <section className="bg-neu-surface shadow-neu rounded-2xl overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-neu-text">Recent Decisions</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-neu-text/40 font-mono">
              LAST_RECRUITER_ACTIONS
            </p>
          </div>
          <CheckCircle className="w-6 h-6 text-neu-success" />
        </div>

        <table className="w-full text-left text-sm">
          <thead className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase font-mono shadow-sm">
            <tr>
              <th className="px-6 py-4">Candidate</th>
              <th className="px-6 py-4">Job</th>
              <th className="px-6 py-4">Decision</th>
              <th className="px-6 py-4">Notes</th>
              <th className="px-6 py-4 text-right">Updated</th>
            </tr>
          </thead>
          <tbody>
            {recentDecisions.map((decision: any) => (
              <tr key={decision.action_id} className="hover:shadow-neu-inner transition-all">
                <td className="px-6 py-4 font-black uppercase">{decision.name || `Candidate ${decision.candidate_id}`}</td>
                <td className="px-6 py-4 text-neu-text/60 font-mono">#{decision.job_id}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-lg shadow-neu-inner text-[10px] font-black uppercase tracking-widest">
                    {decision.decision}
                  </span>
                </td>
                <td className="px-6 py-4 text-neu-text/50 max-w-md truncate" title={decision.notes}>{decision.notes || '-'}</td>
                <td className="px-6 py-4 text-right text-neu-text/40 font-mono">
                  {decision.timestamp ? new Date(decision.timestamp).toLocaleString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!recentDecisions.length && (
          <div className="px-6 py-10 text-center text-neu-text/40 font-bold">No decisions recorded yet.</div>
        )}
      </section>
    </div>
  );
};

const DecisionBar = ({ label, value, total, color }: { label: string; value: number; total: number; color: string }) => {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-black uppercase tracking-widest text-neu-text/60 mb-2">
        <span>{label}</span>
        <span>{value} / {pct}%</span>
      </div>
      <div className="h-4 bg-neu-surface shadow-neu-inner rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const MiniMetric = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-neu-surface shadow-neu-inner rounded-2xl p-4">
    <p className="text-2xl font-black text-neu-text">{value.toLocaleString()}</p>
    <p className="text-[9px] font-black uppercase tracking-widest text-neu-text/40 font-mono mt-1">{label}</p>
  </div>
);

const QualityRow = ({ label, value, danger }: { label: string; value: number; danger: boolean }) => (
  <div className="flex items-center justify-between bg-neu-surface shadow-neu-inner rounded-2xl p-4">
    <div className="flex items-center gap-3">
      {danger ? <AlertTriangle className="w-5 h-5 text-neu-warning" /> : <CheckCircle className="w-5 h-5 text-neu-success" />}
      <span className="text-xs font-black uppercase tracking-widest text-neu-text/60">{label}</span>
    </div>
    <span className={`text-xl font-black ${danger ? 'text-neu-warning' : 'text-neu-success'}`}>{value}</span>
  </div>
);

export default Dashboard;
