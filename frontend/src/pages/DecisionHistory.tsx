import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobDecisions } from '../api/client';
import { useRecruiterStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

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
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Decision History</h2>
          <p className="text-sm text-slate-500">Review all candidate decisions for Job Request #{selectedJobId}</p>
        </div>
        <div className="flex gap-4 items-center">
          <select 
            value={filterAction} 
            onChange={(e) => setFilterAction(e.target.value)} 
            className="border border-slate-200 text-sm rounded py-1.5 px-3 bg-white text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Shortlist">Shortlisted</option>
            <option value="Hold">On Hold</option>
            <option value="Reject">Rejected</option>
          </select>
          <button onClick={() => navigate('/ranking')} className="text-sm text-blue-600 font-medium hover:underline">Back to Ranking</button>
        </div>
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold tracking-wider text-slate-500 uppercase">
            <tr>
              <th className="p-4 px-6">Timestamp</th>
              <th className="p-4 px-6">Candidate</th>
              <th className="p-4 px-6">Recruiter</th>
              <th className="p-4 px-6">Decision</th>
              <th className="p-4 px-6">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredDecisions?.map((decision: any, idx: number) => {
              const action = decision.decision;
              const isRejected = action === 'Reject';
              const isShortlisted = action === 'Shortlist';
              const isHold = action === 'Hold';

              return (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="p-4 px-6 text-slate-500 whitespace-nowrap">{decision.timestamp ? new Date(decision.timestamp).toLocaleString() : '-'}</td>
                <td className="p-4 px-6 font-medium text-slate-900 border-l border-slate-50">
                  <div className="flex flex-col">
                    <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/candidate/${decision.candidate_id}`)}>
                      {decision.name}
                    </span>
                    <span className="text-xs text-slate-400 font-normal mt-0.5">{decision.title || 'N/A'}</span>
                  </div>
                </td>
                <td className="p-4 px-6 text-slate-600">Admin</td>
                <td className="p-4 px-6">
                  <span className={`px-2 py-0.5 text-[10px] leading-none uppercase font-bold tracking-wider rounded-md ${isRejected ? 'bg-slate-200 text-slate-600' : isShortlisted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                    {action}
                  </span>
                </td>
                <td className="p-4 px-6 text-slate-600 max-w-sm truncate" title={decision.notes}>{decision.notes || '-'}</td>
              </tr>
            )})}
          </tbody>
        </table>
        
        {(!filteredDecisions || filteredDecisions.length === 0) && (
           <div className="text-center p-12 text-slate-500">No decisions matched the current filter.</div>
        )}
      </div>
    </div>
  );
};

export default DecisionHistory;