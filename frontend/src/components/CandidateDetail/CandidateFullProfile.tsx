import React from 'react';

interface CandidateFullProfileProps {
  data: any;
}

const CandidateFullProfile: React.FC<CandidateFullProfileProps> = ({ data }) => {
  return (
    <div className="space-y-6">
       <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold tracking-widest uppercase text-slate-500 mb-6 border-b border-slate-100 pb-2">Complete Candidate Record</h3>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">Full Name</p>
                  <p className="text-sm font-semibold text-slate-900">{data?.candidate?.name || 'N/A'}</p>
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">Desired Job / Title</p>
                  <p className="text-sm font-semibold text-slate-900">{data?.candidate?.title || 'N/A'}</p>
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">Location / Desired Workplace</p>
                  <p className="text-sm font-semibold text-slate-900">{data?.candidate?.location || 'N/A'}</p>
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">Industry</p>
                  <p className="text-sm font-semibold text-slate-900">{data?.candidate?.industry || 'N/A'}</p>
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">Total Work Experience</p>
                  <p className="text-sm font-semibold text-slate-900">{data?.candidate?.experience || 'N/A'}</p>
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">Desired Salary</p>
                  <p className="text-sm font-semibold text-emerald-600">{data?.candidate?.desired_salary || 'Negotiable/N/A'}</p>
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">Age</p>
                  <p className="text-sm font-medium text-slate-800">{data?.candidate?.age ? `${data.candidate.age} Years Old` : 'N/A'}</p>
              </div>
              <div>
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">Gender & Marriage</p>
                  <p className="text-sm font-medium text-slate-800">
                     {data?.candidate?.gender || 'N/A'} {data?.candidate?.marriage ? `• ${data.candidate.marriage}` : ''}
                  </p>
              </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 space-y-6">
              <div>
                   <p className="text-xs text-slate-500 font-medium uppercase mb-2">Education / Degree</p>
                   <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">{data?.candidate?.degree || 'N/A'}</p>
              </div>
              <div>
                   <p className="text-xs text-slate-500 font-medium uppercase mb-2">Career Target / Summary</p>
                   <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">{data?.candidate?.target || 'N/A'}</p>
              </div>
              <div>
                   <p className="text-xs text-slate-500 font-medium uppercase mb-2">Raw Skills Extraction</p>
                   <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">{data?.candidate?.skills || 'N/A'}</p>
              </div>
          </div>
       </div>
    </div>
  );
};

export default CandidateFullProfile;
