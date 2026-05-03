import React from 'react';

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
    <div className="flex justify-between items-end">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-neu-text">Decision History</h2>
        <p className="text-sm text-slate-500">Review all candidate decisions for Job Request <span className="font-mono">#{selectedJobId}</span></p>
      </div>
      <div className="flex gap-4 items-center">
        <select 
          value={filterAction} 
          onChange={(e) => setFilterAction(e.target.value)} 
          className="border-none text-sm rounded-lg py-2 px-4 bg-neu-surface shadow-neu-inner text-neu-text focus:outline-none transition-shadow font-bold"
        >
          <option value="All">All Statuses</option>
          <option value="Shortlist">Shortlisted</option>
          <option value="Hold">On Hold</option>
          <option value="Reject">Rejected</option>
        </select>
        <button 
          onClick={onNavigateRanking} 
          className="text-sm text-neu-primary font-bold hover:underline transition"
        >
          Back to Ranking
        </button>
      </div>
    </div>
  );
};

export default DecisionHistoryHeader;
