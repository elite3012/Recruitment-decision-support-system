import React from 'react';

interface CandidateTabsProps {
  activeTab: 'summary' | 'profile';
  setActiveTab: (tab: 'summary' | 'profile') => void;
}

const CandidateTabs: React.FC<CandidateTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        <button
          onClick={() => setActiveTab('summary')}
          className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition ${
            activeTab === 'summary'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Recruiter Match Summary
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition ${
            activeTab === 'profile'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Full Candidate Profile
        </button>
      </nav>
    </div>
  );
};

export default CandidateTabs;
