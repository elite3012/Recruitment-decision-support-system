import React from 'react';

const DashboardHeader = () => {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold tracking-tight text-neu-text">Executive Overview</h2>
      <p className="text-sm text-slate-500">Key metrics for candidate matching and system load.</p>
    </div>
  );
};

export default DashboardHeader;
