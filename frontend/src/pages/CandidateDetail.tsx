import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getCandidateDetail, saveCandidateDecision } from '../api/client';
import { useRecruiterStore } from '../store/useStore';

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedJobId } = useRecruiterStore();
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'summary' | 'profile'>('summary');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['candidateDetail', selectedJobId, id],
    queryFn: () => getCandidateDetail(selectedJobId as number, parseInt(id as string)),
    enabled: !!selectedJobId && !!id,
  });

  useEffect(() => {
    if (data?.decision_info) {
      setDecision(data.decision_info.action);
      setNotes(data.decision_info.notes || '');
    }
  }, [data]);

  const handleDecision = async (action: string) => {
    setDecision(action);
    if (selectedJobId && id) {
      const candidateIdNum = parseInt(id);

      // Optimistically update candidate detail
      queryClient.setQueryData(['candidateDetail', selectedJobId, id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          decision_info: {
            ...(old.decision_info || {}),
            action: action,
            notes: notes
          }
        };
      });

      // Optimistically update ranking list
      queryClient.setQueryData(['jobRanking', selectedJobId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          ranking: old.ranking?.map((c: any) =>
            c.candidate_id === candidateIdNum ? { ...c, decision: action } : c
          )
        };
      });

      try {
        await saveCandidateDecision(selectedJobId, candidateIdNum, action, notes);
        // Clear history cache instead of invalidate to force a hard reload and prevent stale UI flash
        queryClient.removeQueries({ queryKey: ['jobDecisions', selectedJobId] });
        
        setSuccessMessage(`Candidate marked as ${action}`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        alert("Failed to save action");
      }
    }
  };

  const handleSaveNotes = async () => {
    if (selectedJobId && id && decision) {
      const candidateIdNum = parseInt(id);
      
      // Optimistically update candidate detail
      queryClient.setQueryData(['candidateDetail', selectedJobId, id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          decision_info: {
            ...(old.decision_info || {}),
            action: decision,
            notes: notes
          }
        };
      });

      try {
        await saveCandidateDecision(selectedJobId, candidateIdNum, decision, notes);
        queryClient.removeQueries({ queryKey: ['jobDecisions', selectedJobId] });
        alert('Notes saved successfully');
      } catch (err) {
        alert('Failed to save notes.');
      }
    } else {
      alert('Please select an action (Shortlist/Hold/Reject) before saving notes.');
    }
  };

  if (!selectedJobId) {
    return <div className="p-8 text-slate-500">No Job Context Found. Retrun to Jobs Page.</div>;
  }
  
  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse">Loading Candidate Profile & ML Explanation...</div>;
  if (isError) return <div className="p-8 text-red-500 font-medium">Failed to load candidate detail. </div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/ranking')} className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 mb-4 transition">Back to Ranking</button>
      
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{data?.candidate?.name || `Candidate #${id}`}</h2>
          <p className="text-sm text-slate-500">Evaluation against Job Request #{selectedJobId} - {data?.job?.title || 'Unknown Title'}</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => handleDecision('Hold')}
            className={`px-6 py-2 rounded-lg font-semibold tracking-wide border transition ${decision === 'Hold' ? 'bg-amber-100 border-amber-300 text-amber-800 shadow-inner' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}>
            Hold
          </button>
          <button 
            onClick={() => handleDecision('Reject')}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 font-semibold tracking-wide border transition ${decision === 'Reject' ? 'bg-red-100 border-red-300 text-red-800 shadow-inner' : 'bg-white border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-700 shadow-sm'}`}>
            Reject
          </button>
          <button 
            onClick={() => handleDecision('Shortlist')}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 font-semibold tracking-wide shadow-sm transition ${decision === 'Shortlist' ? 'bg-emerald-700 text-white shadow-inner' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
            Shortlist
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 text-emerald-700 font-medium px-4 py-2 rounded-lg border border-emerald-200">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-12 gap-8 mt-6">
        {/* Left Column: Side-by-side JD vs Candidate */}
        <div className="col-span-8 space-y-6">
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

          {activeTab === 'summary' ? (
          <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
             <div className="grid grid-cols-2">
                 {/* Job Column */}
                 <div className="p-6 border-r border-slate-200 bg-slate-50/50">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 pb-2 border-b border-slate-200">The Requirement (Job)</h3>
                     
                     <div className="space-y-5">
                         <div>
                             <p className="text-xs text-slate-500 font-medium uppercase mb-1">Target Title</p>
                             <p className="text-sm font-semibold text-slate-900">{data?.job?.title || 'N/A'}</p>
                         </div>
                         <div>
                             <p className="text-xs text-slate-500 font-medium uppercase mb-1">Target Location</p>
                             <p className="text-sm font-semibold text-slate-900">{data?.job?.location || 'N/A'}</p>
                         </div>
                         <div>
                             <p className="text-xs text-slate-500 font-medium uppercase mb-1">Required Experience</p>
                             <p className="text-sm font-semibold text-slate-900">{data?.job?.experience || 'N/A'}</p>
                         </div>
                         <div>
                             <p className="text-xs text-slate-500 font-medium uppercase mb-1">Required Skills</p>
                             <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{data?.job?.skills || 'N/A'}</p>
                         </div>
                     </div>
                 </div>
                 
                 {/* Candidate Column */}
                 <div className="p-6">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-6 pb-2 border-b border-indigo-100">The Reality (Candidate)</h3>
                     
                     <div className="space-y-5">
                         <div>
                             <p className="text-xs text-indigo-400/80 font-medium uppercase mb-1">Current/Desired Title</p>
                             <p className="text-sm font-semibold text-slate-900">{data?.candidate?.title || 'N/A'}</p>
                         </div>
                         <div>
                             <p className="text-xs text-indigo-400/80 font-medium uppercase mb-1">Current Location</p>
                             <p className="text-sm font-semibold text-slate-900">{data?.candidate?.location || 'N/A'}</p>
                         </div>
                         <div>
                             <p className="text-xs text-indigo-400/80 font-medium uppercase mb-1">Actual Experience</p>
                             <p className="text-sm font-semibold text-slate-900">{data?.candidate?.experience || 'N/A'}</p>
                         </div>
                         <div>
                             <p className="text-xs text-indigo-400/80 font-medium uppercase mb-1">Possessed Skills</p>
                             <div className="flex flex-wrap gap-1.5 mt-1">
                                {(data?.candidate?.skills ? String(data.candidate.skills).split(/[,|\n-]/) : ['N/A']).map((skill: string, i: number) => {
                                    const s = skill.trim();
                                    if (!s) return null;
                                    return (
                                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-medium tracking-tight shadow-sm">
                                            {s}
                                        </span>
                                    );
                                })}
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
             <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Machine Learning Breakdown</h3>
             
             <div className="space-y-4">
                <div className="flex justify-between items-center group">
                   <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition">Location Relevance</span>
                   <div className="flex items-center gap-2">
                       {data?.scores?.location_penalty && (
                           <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-semibold shadow-sm">-15% Match Penalty</span>
                       )}
                       <span className="text-sm font-bold text-slate-800">{Math.round((data?.scores?.location_match || 0) * 100)}%</span>
                   </div>
                </div>
                <div className="flex justify-between items-center group">
                   <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition">Semantic Text Similarity (Transformer)</span>
                   <span className="text-sm font-bold text-slate-800">{Math.round((data?.scores?.text_similarity || 0) * 100)}%</span>
                </div>
                <div className="flex justify-between items-center group">
                   <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition">Extracted Skill Overlap</span>
                   <span className="text-sm font-bold text-slate-800">{Math.round((data?.scores?.skill_match || 0) * 100)}%</span>
                </div>
                <div className="flex justify-between items-center group">
                   <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition">Experience Requirement Match</span>
                   <span className="text-sm font-bold text-slate-800">{Math.round((data?.scores?.experience_match || 0) * 100)}%</span>
                </div>
             </div>
          </div>
          </div>
          ) : (
          <div className="space-y-6">
             <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-bold tracking-widest uppercase text-slate-500 mb-6 border-b border-slate-100 pb-2">Complete Candidate Record</h3>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase mb-1">Full Name</p>
                        <p className="text-sm font-semibold text-slate-900">{data?.candidate?.name || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase mb-1">Desired Job / Title</p>
                        <p className="text-sm font-semibold text-slate-900">{data?.candidate?.title || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase mb-1">Location / Desired Workplace</p>
                        <p className="text-sm font-semibold text-slate-900">{data?.candidate?.location || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase mb-1">Industry</p>
                        <p className="text-sm font-semibold text-slate-900">{data?.candidate?.industry || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase mb-1">Total Work Experience</p>
                        <p className="text-sm font-semibold text-slate-900">{data?.candidate?.experience || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase mb-1">Desired Salary</p>
                        <p className="text-sm font-semibold text-emerald-600">{data?.candidate?.desired_salary || 'Negotiable/N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase mb-1">Age</p>
                        <p className="text-sm font-medium text-slate-800">{data?.candidate?.age ? `${data.candidate.age} Years Old` : 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase mb-1">Gender & Marriage</p>
                        <p className="text-sm font-medium text-slate-800">
                           {data?.candidate?.gender || 'N/A'} {data?.candidate?.marriage ? `• ${data.candidate.marriage}` : ''}
                        </p>
                    </div>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-6 space-y-6">
                    <div>
                         <p className="text-xs text-slate-500 font-medium uppercase mb-2">Education / Degree</p>
                         <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">{data?.candidate?.degree || 'N/A'}</p>
                    </div>
                    <div>
                         <p className="text-xs text-slate-500 font-medium uppercase mb-2">Career Target / Summary</p>
                         <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">{data?.candidate?.target || 'N/A'}</p>
                    </div>
                    <div>
                         <p className="text-xs text-slate-500 font-medium uppercase mb-2">Raw Skills Extraction</p>
                         <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">{data?.candidate?.skills || 'N/A'}</p>
                    </div>
                </div>
             </div>
          </div>
          )}
        </div>

        {/* Right Column: Score Summary */}
        <div className="col-span-4 space-y-6">
           <div className="bg-indigo-900 rounded-xl p-6 shadow-md text-white sticky top-8">
              <h3 className="text-indigo-200 text-sm font-semibold tracking-widest uppercase mb-1">Final Fit Score</h3>
              <p className="text-5xl font-black mb-6 tracking-tight">{Math.round((data?.scores?.overall_score || 0) * 100)}%</p>
              
              <div className="pt-6 border-t border-indigo-800 text-sm space-y-4">
                 <div>
                    <h4 className="font-semibold text-indigo-300">Recruiter Notes</h4>
                    <textarea 
                       value={notes}
                       onChange={(e) => setNotes(e.target.value)}
                       className="w-full mt-2 bg-indigo-950/50 border border-indigo-700 rounded-lg p-3 text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                       rows={4} 
                       placeholder="Add decision context..." 
                    />
                 </div>
                 <button 
                    onClick={handleSaveNotes}
                    className="w-full bg-white/10 hover:bg-white/20 transition text-white font-semibold py-2 rounded-lg border border-white/10">
                    Save Note
                 </button>
              </div>
           </div>
           
           {data?.job?.description && (
             <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm text-sm max-h-[800px] overflow-y-auto">
                <h4 className="font-bold uppercase tracking-wider text-xs text-slate-500 mb-3 border-b border-slate-200 pb-2">Full Job Description</h4>
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-[13px]">
                   {data.job.description}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;