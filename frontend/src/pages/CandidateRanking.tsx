import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobRanking } from '../api/client';
import { useRecruiterStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

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
    <div className="flex flex-col items-center justify-center p-16 space-y-6 h-[40vh] border border-slate-200 rounded-xl bg-white shadow-sm mt-4">
      <div className="w-full max-w-md bg-slate-100 rounded-full h-2 overflow-hidden relative">
        <div 
          className="bg-blue-600 h-2 transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(((stage + 1) / stages.length) * 100, 95)}%` }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-800 animate-pulse">{stages[stage]}</p>
        <p className="text-xs text-slate-400 mt-2 font-mono">Elapsed parsing time: {elapsed}s</p>
      </div>
    </div>
  );
};

const CandidateRanking = () => {
  const { selectedJobId, setSelectedCandidateId } = useRecruiterStore();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobRanking', selectedJobId],
    queryFn: () => getJobRanking(selectedJobId as number, 50),
    enabled: !!selectedJobId,
  });

  const handleSelectCandidate = (id: number) => {
    setSelectedCandidateId(id);
    navigate(`/candidate/${id}`);
  };

  if (!selectedJobId) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-800">No Job Selected</h3>
        <p className="text-slate-500 max-w-sm">Please return to the Job Selection page and select a req to view matched candidates.</p>
        <button onClick={() => navigate('/jobs')} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 transition">Go to Jobs</button>
      </div>
    );
  }

  if (isLoading) return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Ranked Candidates</h2>
          <p className="text-sm text-slate-500">AI-matched ranking for Job Request #{selectedJobId}</p>
        </div>
        <button onClick={() => navigate('/jobs')} className="text-sm text-blue-600 font-medium hover:underline">Change Job</button>
      </div>
      <LoadingProgress />
    </div>
  );

  if (isError) return <div className="p-8 text-red-500 font-medium">Failed to rank candidates. Is the AI server currently warm?</div>;

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Ranked Candidates</h2>
          <p className="text-sm text-slate-500">AI-matched ranking for Job Request #{selectedJobId}</p>
        </div>
        <button onClick={() => navigate('/jobs')} className="text-sm text-blue-600 font-medium hover:underline">Change Job</button>
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold tracking-wider text-slate-500 uppercase">
            <tr>
              <th className="p-4 px-6">Rank</th>
              <th className="p-4 px-6">Name</th>
              <th className="p-4 px-6">Current Title</th>
              <th className="p-4 px-6">Location</th>
              <th className="p-4 px-6">Match Score</th>
              <th className="p-4 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.ranking?.map((candidate: any, idx: number) => {
              const decision = candidate.decision;
              const isRejected = decision === 'Reject';
              const isShortlisted = decision === 'Shortlist';
              const isHold = decision === 'Hold';
              
              return (
              <tr key={candidate.candidate_id} className={`border-b transition hover:opacity-100 ${isRejected ? 'bg-slate-50 opacity-60 border-slate-200' : isShortlisted ? 'bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50/50' : isHold ? 'bg-amber-50/30 border-amber-100 hover:bg-amber-50/50' : 'bg-white border-slate-100 hover:bg-slate-50'}`}>
                <td className="p-4 px-6 font-bold text-slate-700">#{idx + 1}</td>
                <td className={`p-4 px-6 font-medium border-l border-slate-50 ${isRejected ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900'}`}>
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                       <span className={isRejected ? 'line-through' : ''}>{candidate.name || `Candidate ${candidate.candidate_id}`}</span>
                       {decision && (
                         <span className={`px-2 py-0.5 text-[10px] leading-none uppercase font-bold tracking-wider rounded-md no-underline ${isRejected ? 'bg-slate-200 text-slate-600' : isShortlisted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                           {decision}
                         </span>
                       )}
                    </div>
                    <span className="text-xs text-slate-400 font-normal no-underline">ID: {candidate.candidate_id}</span>
                  </div>
                </td>
                <td className="p-4 px-6 text-slate-600 truncate max-w-xs">{candidate.title || 'N/A'}</td>
                <td className="p-4 px-6 text-slate-600">{candidate.location || 'N/A'}</td>
                <td className="p-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${candidate.scores.overall_score >= 0.7 ? 'text-emerald-600' : candidate.scores.overall_score >= 0.5 ? 'text-amber-600' : 'text-slate-500'}`}>
                      {Math.round(candidate.scores.overall_score * 100)}%
                    </span>
                  </div>
                </td>
                <td className="p-4 px-6 text-right">
                  <button onClick={() => handleSelectCandidate(candidate.candidate_id)} className="px-4 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition text-slate-700">Review</button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        
        {!data?.ranking?.length && (
           <div className="text-center p-12 text-slate-500">No candidates matched the criteria.</div>
        )}
      </div>
    </div>
  );
};

export default CandidateRanking;