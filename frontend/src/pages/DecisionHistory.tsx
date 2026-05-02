import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobDecisions } from '../api/client';
import { useRecruiterStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import DecisionHistoryHeader from '../components/DecisionHistory/DecisionHistoryHeader';
import DecisionHistoryTable from '../components/DecisionHistory/DecisionHistoryTable';

const DecisionHistory = () => {
  const { selectedJobId } = useRecruiterStore();
  const navigate = useNavigate();
  const [filterAction, setFilterAction] = useState<string>('All');

  const { data: decisions, isLoading, isError } = useQuery({
    queryKey: ['jobDecisions', selectedJobId],
    queryFn: () => getJobDecisions(selectedJobId as number),
    enabled: !!selectedJobId,
  });

  const filteredDecisions = filterAction === 'All' 
    ? decisions?.decisions 
    : decisions?.decisions?.filter((d: any) => d.decision === filterAction);

  if (!selectedJobId) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-800">No Job Selected</h3>
        <p className="text-slate-500 max-w-sm">Please return to the Job Selection page and select a req to view the decision history.</p>
        <button onClick={() => navigate('/jobs')} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 transition">Go to Jobs</button>
      </div>
    );
  }

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse">Loading decision history...</div>;
  if (isError) return <div className="p-8 text-red-500 font-medium">Failed to load decision history.</div>;

  return (
    <div className="space-y-6 flex flex-col h-full">
      <DecisionHistoryHeader 
        selectedJobId={selectedJobId as number}
        filterAction={filterAction}
        setFilterAction={setFilterAction}
        onNavigateRanking={() => navigate('/ranking')}
      />
      <DecisionHistoryTable decisions={filteredDecisions || []} />
    </div>
  );
};

export default DecisionHistory;