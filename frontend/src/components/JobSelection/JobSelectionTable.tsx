import React from 'react';
import { Search } from 'lucide-react';

interface JobSelectionTableProps {
  data: any[] | undefined;
  handleSelectJob: (id: number) => void;
}

const JobSelectionTable: React.FC<JobSelectionTableProps> = ({ data, handleSelectJob }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
      {/* Simple search bar header */}
      <div className="p-4 border-b border-slate-200 flex items-center bg-slate-50 gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by job title or keyword..." 
          className="w-full bg-transparent border-none text-sm outline-none focus:ring-0" 
        />
      </div>

      {/* Scrollable table body */}
      <div className="overflow-y-auto p-0 m-0">
        <table className="w-full text-left text-sm text-slate-500">
          <thead className="sticky top-0 px-4 bg-slate-100 text-xs uppercase text-slate-700 shadow-sm z-10 font-bold tracking-wide">
            <tr>
              <th className="px-6 py-3 border-b border-slate-200">Job ID</th>
              <th className="px-6 py-3 border-b border-slate-200">Title</th>
              <th className="px-6 py-3 border-b border-slate-200">Required Skills</th>
              <th className="px-6 py-3 border-b border-slate-200">Location</th>
              <th className="px-6 py-3 border-b border-slate-200 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Dummy data fallback for mapping */}
            {(data || [
              { id: 101, title: 'Senior Software Engineer', skills: 'Python, React, AWS', location: 'New York' },
              { id: 102, title: 'Data Analyst', skills: 'SQL, Python, Tableau', location: 'Remote' }
            ]).map((job: any) => (
              <tr key={job.id} className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{job.id}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">{job.title}</td>
                <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">{job.skills}</td>
                <td className="px-6 py-4">{job.location}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleSelectJob(job.id)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 shadow-sm hover:bg-slate-50 rounded-lg text-xs font-semibold tracking-wide transition-all"
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
