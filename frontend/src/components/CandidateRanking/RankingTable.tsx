import React from 'react';

interface RankingTableProps {
  data: any;
  handleSelectCandidate: (id: number) => void;
}

const RankingTable: React.FC<RankingTableProps> = ({ data, handleSelectCandidate }) => {
  return (
    <div className="bg-neu-surface border-none text-sm rounded-2xl overflow-hidden shadow-neu flex-1">
      <table className="w-full text-left">
        <thead className="bg-neu-surface border-b-2 border-neu-surface shadow-sm text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase font-mono">
          <tr>
            <th className="p-4 px-6">RANK</th>
            <th className="p-4 px-6">CANDIDATE</th>
            <th className="p-4 px-6">ROLE</th>
            <th className="p-4 px-6">LOCATION</th>
            <th className="p-4 px-6">MATCH</th>
            <th className="p-4 px-6 text-right">ACTION</th>
          </tr>
        </thead>
        <tbody className="space-y-2">
          {data?.ranking?.map((candidate: any, idx: number) => {
            const decision = candidate.decision;
            const isRejected = decision === 'Reject';
            const isShortlisted = decision === 'Shortlist';
            const isHold = decision === 'Hold';
            
            return (
              <tr key={candidate.candidate_id} className={`border-b-2 border-transparent transition-all hover:shadow-neu-inner bg-neu-surface ${isRejected ? 'opacity-40' : ''}`}>
                <td className="p-4 px-6 font-black text-neu-primary font-mono text-xl italic">
                   {idx + 1}
                </td>
                <td className={`p-4 px-6 font-black ${isRejected ? 'text-slate-400' : 'text-neu-text'}`}>
                  <div className="flex flex-col items-start gap-0.5">
                    <div className="flex items-center gap-3">
                       <span className={`text-base uppercase tracking-tight font-primary ${isRejected ? 'line-through' : ''}`}>{candidate.name || `Candidate ${candidate.candidate_id}`}</span>
                       {decision && (
                         <span className={`px-3 py-1 text-[8px] leading-none uppercase font-black tracking-[0.2em] rounded shadow-lg font-mono text-white ${
                           isShortlisted ? 'bg-[#00A63D]' : 
                           isRejected ? 'bg-[#FF2157]' : 
                           'bg-[#FE9900]'
                         }`}>
                           {decision}
                         </span>
                       )}
                    </div>
                    <span className="text-[9px] text-neu-text/30 font-bold uppercase tracking-widest font-mono">CANDIDATE_ID: {candidate.candidate_id}</span>
                  </div>
                </td>
                <td className="p-4 px-6 text-neu-text/60 font-bold text-xs uppercase tracking-tight font-mono">{candidate.title || 'N/A'}</td>
                <td className="p-4 px-6 text-neu-text/40 font-bold text-xs uppercase font-mono">{candidate.location || 'N/A'}</td>
                <td className="p-4 px-6">
                  <div className="w-12 h-12 bg-neu-surface shadow-neu-inner rounded-full flex items-center justify-center">
                    <span className={`font-black font-mono text-xs ${
                      candidate.scores.overall_score >= 0.7 ? 'text-neu-success' : 
                      candidate.scores.overall_score >= 0.4 ? 'text-neu-warning' : 
                      'text-neu-danger'
                    }`}>
                      {Math.round(candidate.scores.overall_score * 100)}%
                    </span>
                  </div>
                </td>
                <td className="p-4 px-6 text-right">
                  <button onClick={() => handleSelectCandidate(candidate.candidate_id)} className="px-6 py-2 text-[10px] font-black bg-neu-secondary text-neu-primary shadow-neu hover:bg-[#0D9488] hover:text-white active:scale-95 active:bg-[#0F766E] rounded-2xl transition-all duration-300 uppercase tracking-widest font-mono">ANALYZE</button>
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
