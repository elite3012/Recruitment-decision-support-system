import React from 'react';

interface CandidateMatchSummaryProps {
  data: any;
}

const CandidateMatchSummary: React.FC<CandidateMatchSummaryProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
         <div className="grid grid-cols-2">
             {/* Job Column */}
             <div className="p-6 border-r border-slate-200 bg-slate-50/50">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 pb-2 border-b border-slate-200">The Requirement (Job)</h3>
                 
                 <div className="space-y-5">
                     <div>
                         <p className="text-xs text-slate-500 font-medium uppercase mb-1">Target Title</p>
                         <p className="text-sm font-semibold text-slate-900">{data?.job?.title || 'N/A'}</p>
                     </div>
                     <div>
                         <p className="text-xs text-slate-500 font-medium uppercase mb-1">Target Location</p>
                         <p className="text-sm font-semibold text-slate-900">{data?.job?.location || 'N/A'}</p>
                     </div>
                     <div>
                         <p className="text-xs text-slate-500 font-medium uppercase mb-1">Required Experience</p>
                         <p className="text-sm font-semibold text-slate-900">{data?.job?.experience || 'N/A'}</p>
                     </div>
                     <div>
                         <p className="text-xs text-slate-500 font-medium uppercase mb-1">Required Skills</p>
                         <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{data?.job?.skills || 'N/A'}</p>
                     </div>
                 </div>
             </div>
             
             {/* Candidate Column */}
             <div className="p-6">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-6 pb-2 border-b border-indigo-100">The Reality (Candidate)</h3>
                 
                 <div className="space-y-5">
                     <div>
                         <p className="text-xs text-indigo-400/80 font-medium uppercase mb-1">Current/Desired Title</p>
                         <p className="text-sm font-semibold text-slate-900">{data?.candidate?.title || 'N/A'}</p>
                     </div>
                     <div>
                         <p className="text-xs text-indigo-400/80 font-medium uppercase mb-1">Current Location</p>
                         <p className="text-sm font-semibold text-slate-900">{data?.candidate?.location || 'N/A'}</p>
                     </div>
                     <div>
                         <p className="text-xs text-indigo-400/80 font-medium uppercase mb-1">Actual Experience</p>
                         <p className="text-sm font-semibold text-slate-900">{data?.candidate?.experience || 'N/A'}</p>
                     </div>
                     <div>
                         <p className="text-xs text-indigo-400/80 font-medium uppercase mb-1">Possessed Skills</p>
                         <div className="flex flex-wrap gap-1.5 mt-1">
                            {(data?.candidate?.skills ? String(data.candidate.skills).split(/[,|\n-]/) : ['N/A']).map((skill: string, i: number) => {
                                const s = skill.trim();
                                if (!s) return null;
                                return (
                                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-medium tracking-tight shadow-sm">
                                        {s}
                                    </span>
                                );
                            })}
                         </div>
                     </div>
                 </div>
             </div>
         </div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
         <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Machine Learning Breakdown</h3>
         
         <div className="space-y-4">
            <div className="flex justify-between items-center group">
               <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition">Location Relevance</span>
               <div className="flex items-center gap-2">
                   {data?.scores?.location_penalty && (
                       <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-semibold shadow-sm">-15% Match Penalty</span>
                   )}
                   <span className="text-sm font-bold text-slate-800">{Math.round((data?.scores?.location_match || 0) * 100)}%</span>
               </div>
            </div>
            <div className="flex justify-between items-center group">
               <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition">Semantic Text Similarity (Transformer)</span>
               <span className="text-sm font-bold text-slate-800">{Math.round((data?.scores?.text_similarity || 0) * 100)}%</span>
            </div>
            <div className="flex justify-between items-center group">
               <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition">Extracted Skill Overlap</span>
               <span className="text-sm font-bold text-slate-800">{Math.round((data?.scores?.skill_match || 0) * 100)}%</span>
            </div>
            <div className="flex justify-between items-center group">
               <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition">Experience Requirement Match</span>
               <span className="text-sm font-bold text-slate-800">{Math.round((data?.scores?.experience_match || 0) * 100)}%</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CandidateMatchSummary;
