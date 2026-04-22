import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobRanking, saveCandidateDecision, saveBulkDecision } from '../api/client';
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
  const queryClient = useQueryClient();

  const [locationFilter, setLocationFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobRanking', selectedJobId],
    queryFn: () => getJobRanking(selectedJobId as number, 50),
    enabled: !!selectedJobId,
  });

  const decisionMutation = useMutation({
    mutationFn: ({ candidateId, action }: { candidateId: number; action: string }) => 
      saveCandidateDecision(selectedJobId as number, candidateId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobRanking', selectedJobId] });
    },
  });

  const bulkDecisionMutation = useMutation({
    mutationFn: ({ candidateIds, action }: { candidateIds: number[]; action: string }) => 
      saveBulkDecision(selectedJobId as number, candidateIds, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobRanking', selectedJobId] });
      setSelectedIds(new Set());
    },
  });

  const handleSelectCandidate = (id: number) => {
    setSelectedCandidateId(id);
    navigate(`/candidate/${id}`);
  };

  const handleQuickAction = (id: number, action: string) => {
    decisionMutation.mutate({ candidateId: id, action });
  };

  const handleToggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkAction = (action: string) => {
    if (selectedIds.size === 0) return;
    bulkDecisionMutation.mutate({ candidateIds: Array.from(selectedIds), action });
  };

  const filteredCandidates = useMemo(() => {
    if (!data?.ranking) return [];
    return data.ranking.filter((c: any) => {
      const matchLoc = !locationFilter || (c.location && c.location.toLowerCase().includes(locationFilter.toLowerCase()));
      const salaryStr = String(c.expected_salary || c.desired_salary || '');
      const matchSal = !salaryFilter || salaryStr.toLowerCase().includes(salaryFilter.toLowerCase());
      const expStr = String(c.experience || '');
      const matchExp = !experienceFilter || expStr.toLowerCase().includes(experienceFilter.toLowerCase());
      return matchLoc && matchSal && matchExp;
    });
  }, [data?.ranking, locationFilter, salaryFilter, experienceFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredCandidates.map((c: any) => c.candidate_id)));
    } else {
      setSelectedIds(new Set());
    }
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

  const allSelected = filteredCandidates.length > 0 && selectedIds.size === filteredCandidates.length;

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Ranked Candidates</h2>
          <p className="text-sm text-slate-500">AI-matched ranking for Job Request #{selectedJobId}</p>
        </div>
        <div className="flex items-center gap-4">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mr-4 border-r pr-4 border-slate-200">
              <span className="text-sm text-slate-500">{selectedIds.size} selected</span>
              <button 
                onClick={() => handleBulkAction('Shortlist')}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 transition"
              >
                Shortlist All
              </button>
              <button 
                onClick={() => handleBulkAction('Reject')}
                className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition"
              >
                Reject All
              </button>
            </div>
          )}
          <button onClick={() => navigate('/jobs')} className="text-sm text-blue-600 font-medium hover:underline">Change Job</button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex flex-wrap gap-4 items-center">
        <h3 className="text-sm font-semibold text-slate-700 w-full md:w-auto mr-2">Filters</h3>
        <input 
          type="text" 
          placeholder="Location..." 
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input 
          type="text" 
          placeholder="Expected Salary..." 
          value={salaryFilter}
          onChange={(e) => setSalaryFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input 
          type="text" 
          placeholder="Experience..." 
          value={experienceFilter}
          onChange={(e) => setExperienceFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {(locationFilter || salaryFilter || experienceFilter) && (
          <button 
            onClick={() => { setLocationFilter(''); setSalaryFilter(''); setExperienceFilter(''); }}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold tracking-wider text-slate-500 uppercase">
            <tr>
              <th className="p-4 px-6 w-12 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="p-4 px-2">Rank</th>
              <th className="p-4 px-6">Name</th>
              <th className="p-4 px-6">Current Title</th>
              <th className="p-4 px-6">Location</th>
              <th className="p-4 px-6">Match Score</th>
              <th className="p-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map((candidate: any, idx: number) => {
              const decision = candidate.decision;
              const isRejected = decision === 'Reject';
              const isShortlisted = decision === 'Shortlist';
              const isHold = decision === 'Hold';
              const isSelected = selectedIds.has(candidate.candidate_id);
              
              // Color-code logic
              let scoreColor = 'text-slate-500';
              let scoreBg = 'bg-slate-100';
              if (candidate.scores.overall_score >= 0.7) {
                scoreColor = 'text-emerald-700';
                scoreBg = 'bg-emerald-100';
              } else if (candidate.scores.overall_score >= 0.5) {
                scoreColor = 'text-amber-700';
                scoreBg = 'bg-amber-100';
              }
              
              return (
              <tr key={candidate.candidate_id} className={`border-b transition hover:opacity-100 ${isRejected ? 'bg-slate-50 opacity-60 border-slate-200' : isShortlisted ? 'bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50/50' : isHold ? 'bg-amber-50/30 border-amber-100 hover:bg-amber-50/50' : 'bg-white border-slate-100 hover:bg-slate-50'} ${isSelected ? 'bg-blue-50/50' : ''}`}>
                <td className="p-4 px-6">
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => handleToggleSelect(candidate.candidate_id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="p-4 px-2 font-bold text-slate-700">#{idx + 1}</td>
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
                    <span className={`font-semibold px-2 py-1 rounded-md ${scoreBg} ${scoreColor}`}>
                      {Math.round(candidate.scores.overall_score * 100)}%
                    </span>
                  </div>
                </td>
                <td className="p-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleQuickAction(candidate.candidate_id, 'Shortlist')} 
                      className="w-7 h-7 flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 rounded-full transition shadow-sm"
                      title="Shortlist"
                    >
                      ✓
                    </button>
                    <button 
                      onClick={() => handleQuickAction(candidate.candidate_id, 'Reject')} 
                      className="w-7 h-7 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-full transition shadow-sm font-bold"
                      title="Reject"
                    >
                      ✕
                    </button>
                    <button onClick={() => handleSelectCandidate(candidate.candidate_id)} className="ml-2 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition text-slate-700">
                      Review
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        
        {!filteredCandidates.length && (
           <div className="text-center p-12 text-slate-500">No candidates matched the criteria.</div>
        )}
      </div>
    </div>
  );
};

export default CandidateRanking;