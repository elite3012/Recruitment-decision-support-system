import React, { useState, useEffect } from 'react';

const LoadingProgress = () => {
  const [stage, setStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const stages = [
    "Preparing job requirements...",
    "Loading candidate data...",
    "Extracting candidate features...",
    "Normalizing skills and metadata...",
    "Generating semantic embeddings...",
    "Computing similarity scores...",
    "Aggregating ranking features...",
    "Sorting candidates..."
  ];

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Progress naturally through stages 
    const stageTimer = setInterval(() => {
      setStage(s => Math.min(s + 1, stages.length - 1));
    }, 2800);
    return () => clearInterval(stageTimer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-16 space-y-6 h-[40vh] rounded-xl bg-neu-surface shadow-neu mt-4">
      <div className="w-full max-w-md bg-neu-surface shadow-neu-inner rounded-full h-3 overflow-hidden relative">
        <div 
          className="bg-neu-primary h-3 transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(((stage + 1) / stages.length) * 100, 95)}%` }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-neu-text animate-pulse">{stages[stage]}</p>
        <p className="text-xs text-slate-400 mt-2 font-mono">Elapsed parsing time: {elapsed}s</p>
      </div>
    </div>
  );
};

export default LoadingProgress;
