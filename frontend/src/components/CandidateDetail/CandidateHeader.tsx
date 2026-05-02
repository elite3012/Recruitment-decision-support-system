import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CandidateHeaderProps {
  id?: string;
  selectedJobId?: number | null;
  candidateName?: string;
  jobTitle?: string;
  decision: string | null;
  handleDecision: (action: string) => void;
  successMessage: string | null;
}

const CandidateHeader: React.FC<CandidateHeaderProps> = ({
  id,
  selectedJobId,
  candidateName,
  jobTitle,
  decision,
  handleDecision,
  successMessage,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <button onClick={() => navigate('/ranking')} className="text-sm font-medium text-neu-text hover:text-neu-primary flex items-center gap-2 mb-4 transition">Back to Ranking</button>
      
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-neu-text">{candidateName || `Candidate #${id}`}</h2>
          <p className="text-sm text-slate-500">Evaluation against Job Request <span className="font-mono">#{selectedJobId}</span> - {jobTitle || 'Unknown Title'}</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => handleDecision('Hold')}
            className={`px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 shadow-neu ${
              decision === 'Hold' 
                ? 'bg-[#FE9900] text-white' 
                : 'bg-neu-surface text-neu-text hover:bg-[#FE9900] hover:text-white'
            }`}>
            Hold
          </button>
          <button 
            onClick={() => handleDecision('Reject')}
            className={`px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 shadow-neu ${
              decision === 'Reject' 
                ? 'bg-[#FF2157] text-white' 
                : 'bg-neu-surface text-neu-text hover:bg-[#FF2157] hover:text-white'
            }`}>
            Reject
          </button>
          <button 
            onClick={() => handleDecision('Shortlist')}
            className={`px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 shadow-neu ${
              decision === 'Shortlist' 
                ? 'bg-[#00A63D] text-white' 
                : 'bg-neu-surface text-neu-text hover:bg-[#00A63D] hover:text-white'
            }`}>
            Shortlist
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-neu-surface shadow-neu-inner text-neu-success font-bold px-4 py-3 rounded-lg flex items-center">
          {successMessage}
        </div>
      )}
    </>
  );
};

export default CandidateHeader;
