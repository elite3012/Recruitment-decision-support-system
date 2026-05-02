import React from 'react';

interface CandidateMatchSummaryProps {
  data: any;
}

const CandidateMatchSummary: React.FC<CandidateMatchSummaryProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="bg-neu-surface rounded-xl overflow-hidden shadow-neu p-4">
         <div className="grid grid-cols-2 gap-4">
             {/* Job Column */}
             <div className="p-6 bg-neu-surface shadow-neu-inner rounded-xl">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 pb-2 border-b-2 border-transparent shadow-[0_4px_6px_-6px_#c4c3c2]">The Requirement (Job)</h3>
                 
                 <div className="space-y-5">
                     <div>
                         <p className="text-xs text-slate-500 font-medium uppercase mb-1 font-mono">Target Title</p>
                         <p className="text-sm font-semibold text-neu-text">{data?.job?.title || 'N/A'}</p>
                     </div>
                     <div>
                         <p className="text-xs text-slate-500 font-medium uppercase mb-1 font-mono">Target Location</p>
                         <p className="text-sm font-semibold text-neu-text">{data?.job?.location || 'N/A'}</p>
                     </div>
                     <div>
                         <p className="text-xs text-slate-500 font-medium uppercase mb-1 font-mono">Required Experience</p>
                         <p className="text-sm font-semibold text-neu-text">{data?.job?.experience || 'N/A'}</p>
                     </div>
                     <div>
                         <p className="text-xs text-slate-500 font-medium uppercase mb-1 font-mono">Required Skills</p>
                         <p className="text-sm text-neu-text whitespace-pre-wrap leading-relaxed">{data?.job?.skills || 'N/A'}</p>
                     </div>
                 </div>
             </div>
             
             {/* Candidate Column */}
             <div className="p-6 bg-neu-surface shadow-neu-inner rounded-xl">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-neu-primary mb-6 pb-2 border-b-2 border-transparent shadow-[0_4px_6px_-6px_#c4c3c2]">The Reality (Candidate)</h3>
                 
                 <div className="space-y-5">
                     <div>
                         <p className="text-xs text-neu-primary/80 font-medium uppercase mb-1 font-mono">Current/Desired Title</p>
                         <p className="text-sm font-semibold text-neu-text">{data?.candidate?.title || 'N/A'}</p>
                     </div>
                     <div>
                         <p className="text-xs text-neu-primary/80 font-medium uppercase mb-1 font-mono">Current Location</p>
                         <p className="text-sm font-semibold text-neu-text">{data?.candidate?.location || 'N/A'}</p>
                     </div>
                     <div>
                         <p className="text-xs text-neu-primary/80 font-medium uppercase mb-1 font-mono">Actual Experience</p>
                         <p className="text-sm font-semibold text-neu-text">{data?.candidate?.experience || 'N/A'}</p>
                     </div>
                     <div>
                         <p className="text-xs text-neu-primary/80 font-medium uppercase mb-1 font-mono">Possessed Skills</p>
                         <div className="flex flex-wrap gap-2 mt-2">
                            {(data?.candidate?.skills ? String(data.candidate.skills).split(/[,|\n-]/) : ['N/A']).map((skill: string, i: number) => {
                                const s = skill.trim();
                                if (!s) return null;
                                return (
                                    <span key={i} className="px-3 py-1 bg-neu-surface text-neu-text shadow-neu-sm rounded-md text-xs font-medium tracking-tight">
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
      
      <div className="bg-neu-surface rounded-xl p-6 shadow-neu">
         <h3 className="text-lg font-bold text-neu-text mb-4 border-b-2 border-transparent shadow-[0_4px_6px_-6px_#c4c3c2] pb-2">Machine Learning Breakdown</h3>
         
         <div className="space-y-4">
            <div className="flex justify-between items-center group">
               <span className="text-sm font-medium text-slate-600 group-hover:text-neu-text transition">Location Relevance</span>
               <div className="flex items-center gap-3">
                   {data?.scores?.location_penalty && (
                       <span className="text-[10px] px-2 py-1 bg-neu-surface shadow-neu-inner text-neu-danger rounded-md font-bold uppercase tracking-wider">-15% Penalty</span>
                   )}
                   <span className="text-sm font-bold font-mono text-neu-text">{Math.round((data?.scores?.location_match || 0) * 100)}%</span>
               </div>
            </div>
            <div className="flex justify-between items-center group">
               <span className="text-sm font-medium text-slate-600 group-hover:text-neu-text transition">Semantic Text Similarity</span>
               <span className="text-sm font-bold font-mono text-neu-text">{Math.round((data?.scores?.text_similarity || 0) * 100)}%</span>
            </div>
            <div className="flex justify-between items-center group">
               <span className="text-sm font-medium text-slate-600 group-hover:text-neu-text transition">Extracted Skill Overlap</span>
               <span className="text-sm font-bold font-mono text-neu-text">{Math.round((data?.scores?.skill_match || 0) * 100)}%</span>
            </div>
            <div className="flex justify-between items-center group">
               <span className="text-sm font-medium text-slate-600 group-hover:text-neu-text transition">Experience Match</span>
               <span className="text-sm font-bold font-mono text-neu-text">{Math.round((data?.scores?.experience_match || 0) * 100)}%</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CandidateMatchSummary;
