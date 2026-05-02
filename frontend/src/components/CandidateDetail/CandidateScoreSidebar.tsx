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
       <div className="bg-neu-surface rounded-xl p-6 shadow-neu sticky top-8">
          <h3 className="text-slate-500 text-sm font-semibold tracking-widest uppercase mb-1">Final Fit Score</h3>
          <p className="text-5xl font-black font-mono text-neu-primary mb-6 tracking-tight">{Math.round((data?.scores?.overall_score || 0) * 100)}%</p>
          
          <div className="pt-6 border-t-2 border-transparent shadow-[0_-4px_6px_-6px_#c4c3c2] text-sm space-y-4">
             <div>
                <h4 className="font-semibold text-neu-text">Recruiter Notes</h4>
                <textarea 
                   value={notes}
                   onChange={(e) => setNotes(e.target.value)}
                   className="w-full mt-2 bg-neu-surface shadow-neu-inner rounded-lg p-3 text-neu-text placeholder-slate-400 focus:outline-none border-none text-sm" 
                   rows={4} 
                   placeholder="Add decision context..." 
                />
             </div>
             <button 
                onClick={handleSaveNotes}
                className="w-full bg-neu-surface shadow-neu active:shadow-neu-inner transition-all text-neu-primary font-bold py-3 rounded-lg">
                Save Note
             </button>
          </div>
       </div>
       
       {data?.job?.description && (
         <div className="bg-neu-surface rounded-xl p-5 shadow-neu text-sm max-h-[800px] overflow-y-auto">
            <h4 className="font-bold uppercase tracking-wider text-xs text-slate-500 mb-3 border-b-2 border-transparent shadow-[0_4px_6px_-6px_#c4c3c2] pb-2">Full Job Description</h4>
            <div className="whitespace-pre-wrap text-neu-text leading-relaxed text-[13px]">
               {data.job.description}
            </div>
         </div>
       )}
    </div>
  );
};

export default CandidateScoreSidebar;
