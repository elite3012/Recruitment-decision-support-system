import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DecisionHistoryTableProps {
  decisions: any[];
}

const DecisionHistoryTable: React.FC<DecisionHistoryTableProps> = ({ decisions }) => {
  const navigate = useNavigate();

  return (
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
          {decisions?.map((decision: any, idx: number) => {
            const action = decision.decision;
            const isRejected = action === 'Reject';
            const isShortlisted = action === 'Shortlist';

            return (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="p-4 px-6 text-slate-500 whitespace-nowrap">
                  {decision.timestamp ? new Date(decision.timestamp).toLocaleString() : '-'}
                </td>
                <td className="p-4 px-6 font-medium text-slate-900 border-l border-slate-50">
                  <div className="flex flex-col">
                    <span 
                      className="hover:text-blue-600 cursor-pointer transition-colors" 
                      onClick={() => navigate(`/candidate/${decision.candidate_id}`)}
                    >
                      {decision.name}
                    </span>
                    <span className="text-xs text-slate-400 font-normal mt-0.5">
                      {decision.title || 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="p-4 px-6 text-slate-600">Admin</td>
                <td className="p-4 px-6">
                  <span className={`px-2 py-0.5 text-[10px] leading-none uppercase font-bold tracking-wider rounded-md ${isRejected ? 'bg-slate-200 text-slate-600' : isShortlisted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                    {action}
                  </span>
                </td>
                <td className="p-4 px-6 text-slate-600 max-w-sm truncate" title={decision.notes}>
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
