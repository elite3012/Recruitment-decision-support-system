import React from 'react';

interface CandidateFullProfileProps {
  data: any;
}

const CandidateFullProfile: React.FC<CandidateFullProfileProps> = ({ data }) => {
  return (
    <div className="space-y-6">
       <div className="bg-neu-surface rounded-xl p-6 shadow-neu">
          <h3 className="text-sm font-bold tracking-widest uppercase text-slate-500 mb-6 border-b-2 border-transparent shadow-[0_4px_6px_-6px_#c4c3c2] pb-2">Complete Candidate Record</h3>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1 font-mono">Full Name</p>
                  <p className="text-sm font-semibold text-neu-text">{data?.candidate?.name || 'N/A'}</p>
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1 font-mono">Desired Job / Title</p>
                  <p className="text-sm font-semibold text-neu-text">{data?.candidate?.title || 'N/A'}</p>
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1 font-mono">Location / Desired Workplace</p>
                  <p className="text-sm font-semibold text-neu-text">{data?.candidate?.location || 'N/A'}</p>
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1 font-mono">Industry</p>
                  <p className="text-sm font-semibold text-neu-text">{data?.candidate?.industry || 'N/A'}</p>
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1 font-mono">Total Work Experience</p>
                  <p className="text-sm font-semibold text-neu-text">{data?.candidate?.experience || 'N/A'}</p>
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1 font-mono">Desired Salary</p>
                  <p className="text-sm font-semibold text-neu-success">{data?.candidate?.desired_salary || 'Negotiable/N/A'}</p>
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1 font-mono">Age</p>
                  <p className="text-sm font-medium text-neu-text font-mono">{data?.candidate?.age ? `${data.candidate.age} Years Old` : 'N/A'}</p>
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1 font-mono">Gender & Marriage</p>
                  <p className="text-sm font-medium text-neu-text">
                     {data?.candidate?.gender || 'N/A'} {data?.candidate?.marriage ? `• ${data.candidate.marriage}` : ''}
                  </p>
              </div>
          </div>

          <div className="mt-8 border-t border-transparent pt-6 space-y-6">
              <div>
                   <p className="text-xs text-slate-500 font-medium uppercase mb-2 font-mono">Education / Degree</p>
                   <p className="text-sm text-neu-text leading-relaxed whitespace-pre-wrap bg-neu-surface p-4 rounded-lg shadow-neu-inner">{data?.candidate?.degree || 'N/A'}</p>
              </div>
              <div>
                   <p className="text-xs text-slate-500 font-medium uppercase mb-2 font-mono">Career Target / Summary</p>
                   <p className="text-sm text-neu-text leading-relaxed whitespace-pre-wrap bg-neu-surface p-4 rounded-lg shadow-neu-inner">{data?.candidate?.target || 'N/A'}</p>
              </div>
              <div>
                   <p className="text-xs text-slate-500 font-medium uppercase mb-2 font-mono">Raw Skills Extraction</p>
                   <p className="text-sm text-neu-text leading-relaxed whitespace-pre-wrap bg-neu-surface p-4 rounded-lg shadow-neu-inner">{data?.candidate?.skills || 'N/A'}</p>
              </div>
          </div>
       </div>
    </div>
  );
};

export default CandidateFullProfile;
