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
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Decision History</h2>
        <p className="text-sm text-slate-500">Review all candidate decisions for Job Request #{selectedJobId}</p>
      </div>
      <div className="flex gap-4 items-center">
        <select 
          value={filterAction} 
          onChange={(e) => setFilterAction(e.target.value)} 
          className="border border-slate-200 text-sm rounded py-1.5 px-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
        >
          <option value="All">All Statuses</option>
          <option value="Shortlist">Shortlisted</option>
          <option value="Hold">On Hold</option>
          <option value="Reject">Rejected</option>
        </select>
        <button 
          onClick={onNavigateRanking} 
          className="text-sm text-blue-600 font-medium hover:underline transition"
        >
          Back to Ranking
        </button>
      </div>
    </div>
  );
};

export default DecisionHistoryHeader;
