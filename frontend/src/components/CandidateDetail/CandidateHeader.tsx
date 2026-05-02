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
      <button onClick={() => navigate('/ranking')} className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 mb-4 transition">Back to Ranking</button>
      
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{candidateName || `Candidate #${id}`}</h2>
          <p className="text-sm text-slate-500">Evaluation against Job Request #{selectedJobId} - {jobTitle || 'Unknown Title'}</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => handleDecision('Hold')}
            className={`px-6 py-2 rounded-lg font-semibold tracking-wide border transition ${decision === 'Hold' ? 'bg-amber-100 border-amber-300 text-amber-800 shadow-inner' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}>
            Hold
          </button>
          <button 
            onClick={() => handleDecision('Reject')}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 font-semibold tracking-wide border transition ${decision === 'Reject' ? 'bg-red-100 border-red-300 text-red-800 shadow-inner' : 'bg-white border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-700 shadow-sm'}`}>
            Reject
          </button>
          <button 
            onClick={() => handleDecision('Shortlist')}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 font-semibold tracking-wide shadow-sm transition ${decision === 'Shortlist' ? 'bg-emerald-700 text-white shadow-inner' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
            Shortlist
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 text-emerald-700 font-medium px-4 py-2 rounded-lg border border-emerald-200">
          {successMessage}
        </div>
      )}
    </>
  );
};

export default CandidateHeader;
