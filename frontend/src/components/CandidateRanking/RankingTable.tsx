import React from 'react';

interface RankingTableProps {
  data: any;
  handleSelectCandidate: (id: number) => void;
}

const RankingTable: React.FC<RankingTableProps> = ({ data, handleSelectCandidate }) => {
  return (
    <div className="bg-white border text-sm border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold tracking-wider text-slate-500 uppercase">
          <tr>
            <th className="p-4 px-6">Rank</th>
            <th className="p-4 px-6">Name</th>
            <th className="p-4 px-6">Current Title</th>
            <th className="p-4 px-6">Location</th>
            <th className="p-4 px-6">Match Score</th>
            <th className="p-4 px-6 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {data?.ranking?.map((candidate: any, idx: number) => {
            const decision = candidate.decision;
            const isRejected = decision === 'Reject';
            const isShortlisted = decision === 'Shortlist';
            const isHold = decision === 'Hold';
            
            return (
            <tr key={candidate.candidate_id} className={`border-b transition hover:opacity-100 ${isRejected ? 'bg-slate-50 opacity-60 border-slate-200' : isShortlisted ? 'bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50/50' : isHold ? 'bg-amber-50/30 border-amber-100 hover:bg-amber-50/50' : 'bg-white border-slate-100 hover:bg-slate-50'}`}>
              <td className="p-4 px-6 font-bold text-slate-700">#{idx + 1}</td>
              <td className={`p-4 px-6 font-medium border-l border-slate-50 ${isRejected ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900'}`}>
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                     <span className={isRejected ? 'line-through' : ''}>{candidate.name || `Candidate ${candidate.candidate_id}`}</span>
                     {decision && (
                       <span className={`px-2 py-0.5 text-[10px] leading-none uppercase font-bold tracking-wider rounded-md no-underline ${isRejected ? 'bg-slate-200 text-slate-600' : isShortlisted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                         {decision}
                       </span>
                     )}
                  </div>
                  <span className="text-xs text-slate-400 font-normal no-underline">ID: {candidate.candidate_id}</span>
                </div>
              </td>
              <td className="p-4 px-6 text-slate-600 truncate max-w-xs">{candidate.title || 'N/A'}</td>
              <td className="p-4 px-6 text-slate-600">{candidate.location || 'N/A'}</td>
              <td className="p-4 px-6">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${candidate.scores.overall_score >= 0.7 ? 'text-emerald-600' : candidate.scores.overall_score >= 0.5 ? 'text-amber-600' : 'text-slate-500'}`}>
                    {Math.round(candidate.scores.overall_score * 100)}%
                  </span>
                </div>
              </td>
              <td className="p-4 px-6 text-right">
                <button onClick={() => handleSelectCandidate(candidate.candidate_id)} className="px-4 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition text-slate-700">Review</button>
              </td>
            </tr>
          )})}
        </tbody>
      </table>
      
      {!data?.ranking?.length && (
         <div className="text-center p-12 text-slate-500">No candidates matched the criteria.</div>
      )}
    </div>
  );
};

export default RankingTable;
