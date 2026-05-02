import React from 'react';

interface CandidateTabsProps {
  activeTab: 'summary' | 'profile';
  setActiveTab: (tab: 'summary' | 'profile') => void;
}

const CandidateTabs: React.FC<CandidateTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex mb-6">
      <nav className="flex space-x-2 p-1 bg-neu-surface shadow-neu-inner rounded-lg" aria-label="Tabs">
        <button
          onClick={() => setActiveTab('summary')}
          className={`whitespace-nowrap py-2 px-4 rounded-md font-bold text-sm transition-all ${
            activeTab === 'summary'
              ? 'bg-neu-surface shadow-neu text-neu-primary'
              : 'text-slate-500 hover:text-neu-text'
          }`}
        >
          Recruiter Match Summary
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`whitespace-nowrap py-2 px-4 rounded-md font-bold text-sm transition-all ${
            activeTab === 'profile'
              ? 'bg-neu-surface shadow-neu text-neu-primary'
              : 'text-slate-500 hover:text-neu-text'
          }`}
        >
          Full Candidate Profile
        </button>
      </nav>
    </div>
  );
};

export default CandidateTabs;
