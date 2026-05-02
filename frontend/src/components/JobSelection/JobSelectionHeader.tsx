import React from 'react';

const JobSelectionHeader: React.FC = () => {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold tracking-tight text-neu-text">Job Selection</h2>
      <p className="text-sm text-slate-500">Select a Job Request to begin screening candidates.</p>
    </div>
  );
};

export default JobSelectionHeader;
