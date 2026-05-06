import React from "react";

interface DecisionHistoryHeaderProps {
  selectedJobId: number;
  filterAction: string;
  setFilterAction: (action: string) => void;
  onNavigateRanking: () => void;
}

const DecisionHistoryHeader: React.FC<DecisionHistoryHeaderProps> = ({
  selectedJobId,
  filterAction,
  setFilterAction,
  onNavigateRanking,
}) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-2">
        <p className="eyebrow">Review trail</p>
        <h2 className="text-2xl font-black tracking-tight text-neu-text sm:text-3xl">
          Decision history
        </h2>
        <p className="text-sm leading-6 text-neu-text/55 sm:text-base">
          Review recruiter outcomes for job request{" "}
          <span className="font-mono">#{selectedJobId}</span>.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="w-full rounded-2xl bg-neu-surface px-4 py-3 text-sm font-semibold text-neu-text shadow-neu-inner outline-none transition-shadow sm:w-auto"
        >
          <option value="All">All Statuses</option>
          <option value="Shortlist">Shortlisted</option>
          <option value="Hold">On Hold</option>
          <option value="Reject">Rejected</option>
        </select>
        <button
          onClick={onNavigateRanking}
          className="inline-flex items-center justify-center rounded-2xl bg-neu-surface px-4 py-3 text-sm font-semibold text-neu-primary shadow-neu-sm transition hover:shadow-neu"
        >
          Back to ranking
        </button>
      </div>
    </div>
  );
};

export default DecisionHistoryHeader;
