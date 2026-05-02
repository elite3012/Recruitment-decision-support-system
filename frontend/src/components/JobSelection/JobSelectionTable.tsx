import React from 'react';
import { Search } from 'lucide-react';

interface JobSelectionTableProps {
  data: any[] | undefined;
  handleSelectJob: (id: number) => void;
}

const JobSelectionTable: React.FC<JobSelectionTableProps> = ({ data, handleSelectJob }) => {
  return (
    <div className="bg-neu-surface rounded-2xl shadow-neu flex flex-col h-[650px] overflow-hidden">
      {/* Simple search bar header */}
      <div className="p-4 flex items-center bg-neu-secondary gap-4 m-6 rounded-2xl shadow-neu-inner">
        <Search className="w-5 h-5 text-neu-primary ml-2" />
        <input 
          type="text" 
          placeholder="SEARCH_JOBS_CATALOG" 
          className="w-full bg-transparent border-none text-[10px] font-black tracking-widest outline-none focus:ring-0 text-neu-text placeholder:text-slate-400 font-mono" 
        />
      </div>

      {/* Scrollable table body */}
      <div className="overflow-y-auto px-6 pb-6 flex-1">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-neu-surface z-10">
            <tr>
              <th className="px-6 py-4 text-[10px] uppercase text-slate-400 font-black tracking-[0.2em] border-b-2 border-neu-surface shadow-sm font-mono">ID</th>
              <th className="px-6 py-4 text-[10px] uppercase text-slate-400 font-black tracking-[0.2em] border-b-2 border-neu-surface shadow-sm font-mono">TITLE</th>
              <th className="px-6 py-4 text-[10px] uppercase text-slate-400 font-black tracking-[0.2em] border-b-2 border-neu-surface shadow-sm font-mono">STACK</th>
              <th className="px-6 py-4 text-[10px] uppercase text-slate-400 font-black tracking-[0.2em] border-b-2 border-neu-surface shadow-sm font-mono">LOCATION</th>
              <th className="px-6 py-4 text-[10px] uppercase text-slate-400 font-black tracking-[0.2em] border-b-2 border-neu-surface shadow-sm text-right font-mono">ACTION</th>
            </tr>
          </thead>
          <tbody className="space-y-4">
            {(data || []).map((job: any) => (
              <tr key={job.id} className="border-b-4 border-transparent hover:shadow-neu-inner transition-all bg-neu-surface">
                <td className="px-6 py-5 font-black text-neu-primary font-mono text-xs">{job.id}</td>
                <td className="px-6 py-5 font-bold text-neu-text uppercase tracking-tight text-sm font-primary">{job.title}</td>
                <td className="px-6 py-5">
                   <div className="flex flex-wrap gap-2">
                      {job.skills?.split(',').map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-neu-surface shadow-neu-sm rounded text-[9px] font-bold text-slate-500 uppercase font-mono">
                          {s.trim()}
                        </span>
                      ))}
                   </div>
                </td>
                <td className="px-6 py-5 font-medium text-slate-500 text-xs uppercase font-mono">{job.location}</td>
                <td className="px-6 py-5 text-right">
                  <button
                    onClick={() => handleSelectJob(job.id)}
                    className="px-6 py-2 bg-neu-secondary text-neu-primary shadow-neu hover:bg-[#0D9488] hover:text-white active:scale-95 active:bg-[#0F766E] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 font-mono"
                  >
                    SCREEN
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobSelectionTable;
