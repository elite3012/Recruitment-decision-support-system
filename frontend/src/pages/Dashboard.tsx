import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "../api/client";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  Clock3,
  ClipboardCheck,
  Database,
  Target,
  Users,
} from "lucide-react";
import DashboardKPICard from "../components/Dashboard/DashboardKPICard";

const Dashboard = () => {
  const {
    data: summary,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: getDashboardSummary,
  });

  if (isLoading)
    return (
      <div className="p-8 text-slate-500 animate-pulse">
        Loading dashboard metrics...
      </div>
    );
  if (isError)
    return (
      <div className="p-8 text-red-500 font-medium">
        Failed to load dashboard. Ensure backend is running.
      </div>
    );

  const decisionCounts = summary?.decision_counts || {};
  const dataQuality = summary?.data_quality || {};
  const totalDecisions = summary?.total_decisions || 0;
  const recentDecisions = summary?.recent_decisions || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <p className="eyebrow">Overview</p>
          <h2 className="text-3xl font-black tracking-tight text-neu-text sm:text-4xl">
            Recruitment command center
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-neu-text/55 sm:text-base">
            Track pipeline health, ranking coverage, and recent recruiter
            actions from one responsive dashboard.
          </p>
        </div>
        <div className="inline-flex items-center rounded-2xl bg-neu-surface px-5 py-3 text-sm font-semibold text-neu-success shadow-neu-inner">
          {summary?.system_status || "Unknown"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-4">
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-[28px] bg-neu-surface p-6 shadow-neu xl:col-span-2 sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-black tracking-tight text-neu-text">
                Decision funnel
              </h3>
              <p className="mt-1 text-sm text-neu-text/45">
                {summary?.decision_rate || 0}% candidate coverage /{" "}
                {summary?.shortlist_rate || 0}% shortlist ratio
              </p>
            </div>
            <Target className="w-6 h-6 text-neu-primary" />
          </div>

          <div className="space-y-5">
            <DecisionBar
              label="Shortlist"
              value={decisionCounts.Shortlist || 0}
              total={totalDecisions}
              color="bg-neu-success"
            />
            <DecisionBar
              label="Hold"
              value={decisionCounts.Hold || 0}
              total={totalDecisions}
              color="bg-neu-warning"
            />
            <DecisionBar
              label="Reject"
              value={decisionCounts.Reject || 0}
              total={totalDecisions}
              color="bg-neu-danger"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MiniMetric label="Total Decisions" value={totalDecisions} />
            <MiniMetric
              label="Jobs With Decisions"
              value={summary?.jobs_with_decisions || 0}
            />
            <MiniMetric
              label="Generated Matches"
              value={summary?.total_matches || 0}
            />
          </div>
        </section>

        <section className="rounded-[28px] bg-neu-surface p-6 shadow-neu sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-black tracking-tight text-neu-text">
                Data quality
              </h3>
              <p className="mt-1 text-sm text-neu-text/45">
                Input gaps that can reduce ranking quality.
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

      <section className="overflow-hidden rounded-[28px] bg-neu-surface shadow-neu">
        <div className="flex items-start justify-between gap-4 p-6 sm:p-7">
          <div>
            <h3 className="text-xl font-black tracking-tight text-neu-text">
              Recent decisions
            </h3>
            <p className="mt-1 text-sm text-neu-text/45">
              Latest recruiter actions and notes.
            </p>
          </div>
          <CheckCircle className="w-6 h-6 text-neu-success" />
        </div>

        <div className="table-shell">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neu-text/40 shadow-sm">
              <tr>
                <th className="px-4 py-4 sm:px-6">Candidate</th>
                <th className="px-4 py-4 sm:px-6">Job</th>
                <th className="px-4 py-4 sm:px-6">Decision</th>
                <th className="px-4 py-4 sm:px-6">Notes</th>
                <th className="px-4 py-4 text-right sm:px-6">Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentDecisions.map((decision: any) => (
                <tr
                  key={decision.action_id}
                  className="border-b border-white/35 transition-all hover:shadow-neu-inner"
                >
                  <td className="px-4 py-4 font-bold text-neu-text sm:px-6">
                    {decision.name || `Candidate ${decision.candidate_id}`}
                  </td>
                  <td className="px-4 py-4 text-neu-text/60 sm:px-6">
                    #{decision.job_id}
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className="rounded-full px-3 py-1 text-[11px] font-semibold shadow-neu-inner">
                      {decision.decision}
                    </span>
                  </td>
                  <td
                    className="max-w-md px-4 py-4 text-neu-text/50 sm:px-6"
                    title={decision.notes}
                  >
                    <span className="block truncate">
                      {decision.notes || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-neu-text/40 sm:px-6">
                    {decision.timestamp
                      ? new Date(decision.timestamp).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!recentDecisions.length && (
          <div className="px-6 py-10 text-center text-neu-text/40 font-bold">
            No decisions recorded yet.
          </div>
        )}
      </section>
    </div>
  );
};

const DecisionBar = ({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) => {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-semibold text-neu-text/60">
        <span>{label}</span>
        <span>
          {value} / {pct}%
        </span>
      </div>
      <div className="h-4 bg-neu-surface shadow-neu-inner rounded-full overflow-hidden">
        <div
          className={`${color} h-full rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const MiniMetric = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-2xl bg-neu-surface p-4 shadow-neu-inner">
    <p className="text-2xl font-black text-neu-text">
      {value.toLocaleString()}
    </p>
    <p className="mt-1 text-sm text-neu-text/45">{label}</p>
  </div>
);

const QualityRow = ({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger: boolean;
}) => (
  <div className="flex items-center justify-between rounded-2xl bg-neu-surface p-4 shadow-neu-inner">
    <div className="flex items-center gap-3">
      {danger ? (
        <AlertTriangle className="w-5 h-5 text-neu-warning" />
      ) : (
        <CheckCircle className="w-5 h-5 text-neu-success" />
      )}
      <span className="text-sm font-semibold text-neu-text/60">{label}</span>
    </div>
    <span
      className={`text-xl font-black ${danger ? "text-neu-warning" : "text-neu-success"}`}
    >
      {value}
    </span>
  </div>
);

export default Dashboard;
