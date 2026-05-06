import React from "react";

interface RankingHeaderProps {
  selectedJobId: number;
  onNavigateJobs: () => void;
}

const RankingHeader: React.FC<RankingHeaderProps> = ({
  selectedJobId,
  onNavigateJobs,
}) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-2">
        <p className="eyebrow">Candidate review</p>
        <h2 className="text-2xl font-black tracking-tight text-neu-text sm:text-3xl">
          Ranked candidates
        </h2>
        <p className="text-sm leading-6 text-neu-text/55 sm:text-base">
          AI-matched shortlist for job request{" "}
          <span className="font-mono">#{selectedJobId}</span>.
        </p>
      </div>
      <button
        onClick={onNavigateJobs}
        className="inline-flex items-center justify-center rounded-2xl bg-neu-surface px-4 py-3 text-sm font-semibold text-neu-primary shadow-neu-sm transition hover:shadow-neu"
      >
        Change job
      </button>
    </div>
  );
};

export default RankingHeader;
