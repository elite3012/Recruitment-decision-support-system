import React from 'react';

interface RankingTableProps {
  data: any;
  handleSelectCandidate: (id: number) => void;
}

const RankingTable: React.FC<RankingTableProps> = ({ data, handleSelectCandidate }) => {
  return (
    <div className="bg-neu-surface border-none text-sm rounded-xl overflow-hidden shadow-neu flex-1">
      <table className="w-full text-left">
        <thead className="bg-neu-surface border-b border-transparent shadow-sm text-xs font-bold tracking-wider text-slate-500 uppercase">
          <tr>
            <th className="p-4 px-6 border-b-2 border-neu-surface shadow-sm">Rank</th>
            <th className="p-4 px-6 border-b-2 border-neu-surface shadow-sm">Name</th>
            <th className="p-4 px-6 border-b-2 border-neu-surface shadow-sm">Current Title</th>
            <th className="p-4 px-6 border-b-2 border-neu-surface shadow-sm">Location</th>
            <th className="p-4 px-6 border-b-2 border-neu-surface shadow-sm">Match Score</th>
            <th className="p-4 px-6 border-b-2 border-neu-surface shadow-sm text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {data?.ranking?.map((candidate: any, idx: number) => {
            const decision = candidate.decision;
            const isRejected = decision === 'Reject';
            const isShortlisted = decision === 'Shortlist';
            const isHold = decision === 'Hold';
            
            return (
            <tr key={candidate.candidate_id} className={`border-b border-transparent transition-shadow hover:shadow-neu-inner bg-neu-surface ${isRejected ? 'opacity-60' : ''}`}>
              <td className="p-4 px-6 font-bold text-neu-text font-mono">#{idx + 1}</td>
              <td className={`p-4 px-6 font-medium ${isRejected ? 'text-slate-500 line-through decoration-slate-300' : 'text-neu-text'}`}>
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                     <span className={isRejected ? 'line-through' : ''}>{candidate.name || `Candidate ${candidate.candidate_id}`}</span>
                     {decision && (
                       <span className={`px-2 py-0.5 text-[10px] leading-none uppercase font-bold tracking-wider rounded-md no-underline ${isRejected ? 'bg-neu-surface shadow-neu-inner text-slate-500' : isShortlisted ? 'bg-neu-surface shadow-neu-inner text-neu-success' : 'bg-neu-surface shadow-neu-inner text-neu-warning'}`}>
                         {decision}
                       </span>
                     )}
                  </div>
                  <span className="text-xs text-slate-400 font-normal no-underline font-mono">ID: {candidate.candidate_id}</span>
                </div>
              </td>
              <td className="p-4 px-6 text-slate-500 truncate max-w-xs">{candidate.title || 'N/A'}</td>
              <td className="p-4 px-6 text-slate-500">{candidate.location || 'N/A'}</td>
              <td className="p-4 px-6">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold font-mono ${candidate.scores.overall_score >= 0.7 ? 'text-neu-success' : candidate.scores.overall_score >= 0.5 ? 'text-neu-warning' : 'text-slate-500'}`}>
                    {Math.round(candidate.scores.overall_score * 100)}%
                  </span>
                </div>
              </td>
              <td className="p-4 px-6 text-right">
                <button onClick={() => handleSelectCandidate(candidate.candidate_id)} className="px-4 py-1.5 text-xs font-semibold bg-neu-surface text-neu-primary shadow-neu active:shadow-neu-inner rounded-lg transition-all tracking-wide">Review</button>
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
