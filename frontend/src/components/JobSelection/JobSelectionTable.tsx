import React from 'react';
import { Search } from 'lucide-react';

interface JobSelectionTableProps {
  data: any[] | undefined;
  handleSelectJob: (id: number) => void;
}

const JobSelectionTable: React.FC<JobSelectionTableProps> = ({ data, handleSelectJob }) => {
  return (
    <div className="bg-neu-surface rounded-xl shadow-neu flex flex-col h-[600px] overflow-hidden">
      {/* Simple search bar header */}
      <div className="p-4 flex items-center bg-neu-surface gap-3 m-4 rounded-xl shadow-neu-inner">
        <Search className="w-5 h-5 text-neu-primary" />
        <input 
          type="text" 
          placeholder="Search by job title or keyword..." 
          className="w-full bg-transparent border-none text-sm outline-none focus:ring-0 text-neu-text placeholder:text-slate-400" 
        />
      </div>

      {/* Scrollable table body */}
      <div className="overflow-y-auto p-0 m-0 flex-1">
        <table className="w-full text-left text-sm text-slate-500">
          <thead className="sticky top-0 px-4 bg-neu-surface shadow-sm z-10 text-xs uppercase text-slate-500 font-bold tracking-wide">
            <tr>
              <th className="px-6 py-3 border-b-2 border-neu-surface shadow-sm">Job ID</th>
              <th className="px-6 py-3 border-b-2 border-neu-surface shadow-sm">Title</th>
              <th className="px-6 py-3 border-b-2 border-neu-surface shadow-sm">Required Skills</th>
              <th className="px-6 py-3 border-b-2 border-neu-surface shadow-sm">Location</th>
              <th className="px-6 py-3 border-b-2 border-neu-surface shadow-sm text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Dummy data fallback for mapping */}
            {(data || [
              { id: 101, title: 'Senior Software Engineer', skills: 'Python, React, AWS', location: 'New York' },
              { id: 102, title: 'Data Analyst', skills: 'SQL, Python, Tableau', location: 'Remote' }
            ]).map((job: any) => (
              <tr key={job.id} className="border-b border-transparent hover:shadow-neu-inner transition-shadow bg-neu-surface">
                <td className="px-6 py-4 font-medium text-neu-text font-mono">{job.id}</td>
                <td className="px-6 py-4 font-semibold text-neu-text">{job.title}</td>
                <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">{job.skills}</td>
                <td className="px-6 py-4">{job.location}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleSelectJob(job.id)}
                    className="px-4 py-2 bg-neu-surface text-neu-primary shadow-neu active:shadow-neu-inner rounded-lg text-xs font-bold tracking-wide transition-all"
                  >
                    Screen Candidates
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
