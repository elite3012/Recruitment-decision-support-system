import React from 'react';

interface RankingHeaderProps {
  selectedJobId: number;
  onNavigateJobs: () => void;
}

const RankingHeader: React.FC<RankingHeaderProps> = ({ selectedJobId, onNavigateJobs }) => {
  return (
    <div className="flex justify-between items-end">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Ranked Candidates</h2>
        <p className="text-sm text-slate-500">AI-matched ranking for Job Request #{selectedJobId}</p>
      </div>
      <button onClick={onNavigateJobs} className="text-sm text-blue-600 font-medium hover:underline">Change Job</button>
    </div>
  );
};

export default RankingHeader;
