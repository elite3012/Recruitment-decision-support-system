import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DecisionHistoryTableProps {
  decisions: any[];
}

const DecisionHistoryTable: React.FC<DecisionHistoryTableProps> = ({ decisions }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-neu-surface border-none text-sm rounded-xl overflow-hidden shadow-neu flex-1">
      <table className="w-full text-left">
        <thead className="bg-neu-surface border-b border-transparent shadow-sm text-xs font-bold tracking-wider text-slate-500 uppercase">
          <tr>
            <th className="p-4 px-6 border-b-2 border-neu-surface shadow-sm">Timestamp</th>
            <th className="p-4 px-6 border-b-2 border-neu-surface shadow-sm">Candidate</th>
            <th className="p-4 px-6 border-b-2 border-neu-surface shadow-sm">Recruiter</th>
            <th className="p-4 px-6 border-b-2 border-neu-surface shadow-sm">Decision</th>
            <th className="p-4 px-6 border-b-2 border-neu-surface shadow-sm">Notes</th>
          </tr>
        </thead>
        <tbody>
          {decisions?.map((decision: any, idx: number) => {
            const action = decision.decision;
            const isRejected = action === 'Reject';
            const isShortlisted = action === 'Shortlist';

            return (
              <tr key={idx} className="border-b border-transparent hover:shadow-neu-inner transition-shadow bg-neu-surface">
                <td className="p-4 px-6 text-slate-500 whitespace-nowrap font-mono">
                  {decision.timestamp ? new Date(decision.timestamp).toLocaleString() : '-'}
                </td>
                <td className="p-4 px-6 font-medium text-neu-text">
                  <div className="flex flex-col">
                    <span 
                      className="hover:text-neu-primary cursor-pointer transition-colors" 
                      onClick={() => navigate(`/candidate/${decision.candidate_id}`)}
                    >
                      {decision.name}
                    </span>
                    <span className="text-xs text-slate-400 font-normal mt-0.5 font-mono">
                      {decision.title || 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="p-4 px-6 text-slate-500">Admin</td>
                <td className="p-4 px-6">
                  <span className={`px-3 py-1 text-[10px] leading-none uppercase font-bold tracking-wider rounded-md shadow-neu-inner ${isRejected ? 'bg-neu-surface text-slate-500' : isShortlisted ? 'bg-neu-surface text-neu-success' : 'bg-neu-surface text-neu-warning'}`}>
                    {action}
                  </span>
                </td>
                <td className="p-4 px-6 text-slate-500 max-w-sm truncate" title={decision.notes}>
                  {decision.notes || '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {(!decisions || decisions.length === 0) && (
        <div className="text-center p-12 text-slate-500">No decisions matched the current filter.</div>
      )}
    </div>
  );
};

export default DecisionHistoryTable;
