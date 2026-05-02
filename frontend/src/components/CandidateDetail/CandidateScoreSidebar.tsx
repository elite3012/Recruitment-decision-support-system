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
        <div className="bg-neu-surface rounded-3xl p-8 shadow-neu border-t-8 border-teal-600">
           <h3 className="text-neu-text/30 text-[10px] font-black tracking-[0.2em] uppercase mb-2 font-mono">MATCH_PROBABILITY</h3>
           <p className={`text-7xl font-black font-primary tracking-tighter mb-8 ${
             (data?.scores?.overall_score || 0) >= 0.7 ? 'text-[#00A63D]' : 
             (data?.scores?.overall_score || 0) >= 0.4 ? 'text-[#FE9900]' : 
             'text-[#FF2157]'
           }`}>{Math.round((data?.scores?.overall_score || 0) * 100)}%</p>
           
           <div className="pt-8 border-t-4 border-neu-surface shadow-sm text-sm space-y-6">
              <div>
                 <h4 className="font-black text-neu-text text-[10px] tracking-widest uppercase mb-3 font-mono">RECRUITER_INSIGHTS</h4>
                 <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-neu-surface shadow-neu-inner rounded-2xl p-4 text-neu-text placeholder:text-neu-text/20 focus:outline-none border-none text-[11px] font-bold leading-relaxed font-mono" 
                    rows={6} 
                    placeholder="Enter evaluation notes..." 
                 />
              </div>
              <button 
                 onClick={handleSaveNotes}
                 className="w-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 active:scale-95 transition-all font-black text-[10px] uppercase tracking-[0.3em] py-5 rounded-2xl font-mono">
                 LOG_DECISION
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
