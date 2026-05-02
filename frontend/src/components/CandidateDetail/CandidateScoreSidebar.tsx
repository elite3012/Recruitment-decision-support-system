import React from 'react';

interface CandidateScoreSidebarProps {
  data: any;
  notes: string;
  setNotes: (notes: string) => void;
  handleSaveNotes: () => void;
}

const CandidateScoreSidebar: React.FC<CandidateScoreSidebarProps> = ({
  data,
  notes,
  setNotes,
  handleSaveNotes
}) => {
  return (
    <div className="col-span-4 space-y-6">
       <div className="bg-indigo-900 rounded-xl p-6 shadow-md text-white sticky top-8">
          <h3 className="text-indigo-200 text-sm font-semibold tracking-widest uppercase mb-1">Final Fit Score</h3>
          <p className="text-5xl font-black mb-6 tracking-tight">{Math.round((data?.scores?.overall_score || 0) * 100)}%</p>
          
          <div className="pt-6 border-t border-indigo-800 text-sm space-y-4">
             <div>
                <h4 className="font-semibold text-indigo-300">Recruiter Notes</h4>
                <textarea 
                   value={notes}
                   onChange={(e) => setNotes(e.target.value)}
                   className="w-full mt-2 bg-indigo-950/50 border border-indigo-700 rounded-lg p-3 text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                   rows={4} 
                   placeholder="Add decision context..." 
                />
             </div>
             <button 
                onClick={handleSaveNotes}
                className="w-full bg-white/10 hover:bg-white/20 transition text-white font-semibold py-2 rounded-lg border border-white/10">
                Save Note
             </button>
          </div>
       </div>
       
       {data?.job?.description && (
         <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm text-sm max-h-[800px] overflow-y-auto">
            <h4 className="font-bold uppercase tracking-wider text-xs text-slate-500 mb-3 border-b border-slate-200 pb-2">Full Job Description</h4>
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-[13px]">
               {data.job.description}
            </div>
         </div>
       )}
    </div>
  );
};

export default CandidateScoreSidebar;
