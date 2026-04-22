import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getCandidateDetail, saveCandidateDecision } from '../api/client';
import { useRecruiterStore } from '../store/useStore';

const HighlightedText = ({ text, words }: { text: string, words: string[] }) => {
  if (!text) return <span>N/A</span>;
  if (!words || words.length === 0) return <span>{text}</span>;

  const validWords = words.filter(w => w?.trim().length > 0);
  if (validWords.length === 0) return <span>{text}</span>;

  const pattern = new RegExp(`(${validWords.map(w => w.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <span>
      {parts.map((part, i) => {
        if (validWords.some(w => w.toLowerCase() === part.toLowerCase())) {
          return <span key={i} className="bg-yellow-200 font-semibold">{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedJobId } = useRecruiterStore();
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeDocument, setActiveDocument] = useState<'cv' | 'jd'>('cv');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['candidateDetail', selectedJobId, id],
    queryFn: () => getCandidateDetail(selectedJobId as number, parseInt(id as string)),
    enabled: !!selectedJobId && !!id,
  });

  useEffect(() => {
    const savedDecision = data?.decision_info || data?.decision;
    if (savedDecision) {
      setDecision(savedDecision.action);
      setNotes(savedDecision.notes || '');
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
          decision: {
            ...(old.decision || old.decision_info || {}),
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
      
      queryClient.setQueryData(['candidateDetail', selectedJobId, id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          decision: {
            ...(old.decision || old.decision_info || {}),
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
    return <div className="p-8 text-slate-500">No Job Context Found. Return to Jobs Page.</div>;
  }
  
  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse">Loading Candidate Profile & ML Explanation...</div>;
  if (isError) return <div className="p-8 text-red-500 font-medium">Failed to load candidate detail.</div>;

  const candidate = data?.candidate || {};
  const job = data?.job || {};
  const scores = data?.scores || {};
  
  // Provide defaults
  const matchedSkills: string[] = scores.matched_skills || data?.match_details?.matched_skills || [];
  const missingSkills: string[] = scores.missing_skills || data?.match_details?.missing_skills || [];

  const renderProgressBar = (label: string, value: number, colorClass: string) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-800">{Math.round(value * 100)}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${Math.round(value * 100)}%` }}></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-h-screen flex flex-col h-screen overflow-hidden pb-4">
      <div className="flex justify-between items-center shrink-0">
        <button onClick={() => navigate('/ranking')} className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 transition">
          &larr; Back to Ranking
        </button>
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
        <div className="bg-emerald-50 text-emerald-700 font-medium px-4 py-2 rounded-lg border border-emerald-200 shrink-0">
          {successMessage}
        </div>
      )}

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-6 pb-4 overflow-hidden">
        {/* Left View: AI Analysis */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 shrink-0">
            <h2 className="text-xl font-bold text-slate-800 mb-2">AI Match Analysis</h2>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-1">Overall Fit Score</p>
                <p className={`text-5xl font-black ${
                  (scores.overall_score || 0) >= 0.8 ? 'text-emerald-600' :
                  (scores.overall_score || 0) >= 0.5 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {Math.round((scores.overall_score || 0) * 100)}%
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Detailed Scores</h3>
              {renderProgressBar("Experience Match", scores.experience_match || 0, "bg-blue-500")}
              {renderProgressBar("Skill Match", scores.skill_match || 0, "bg-indigo-500")}
              {renderProgressBar("Location Match", scores.location_match || 0, "bg-teal-500")}
              {renderProgressBar("Text Similarity", scores.text_similarity || 0, "bg-purple-500")}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-3">Skill Breakdown</h3>
              <div className="mb-4">
                <p className="text-xs font-semibold text-emerald-700 mb-2 uppercase">Matched Skills ({matchedSkills.length})</p>
                <div className="flex flex-wrap gap-2">
                  {matchedSkills.length > 0 ? matchedSkills.map((skill: string, i: number) => (
                    <span key={`matched-${i}`} className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md text-xs font-semibold shadow-sm">
                      {skill}
                    </span>
                  )) : <span className="text-sm text-slate-400">No matching skills found</span>}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-700 mb-2 uppercase">Missing Skills ({missingSkills.length})</p>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.length > 0 ? missingSkills.map((skill: string, i: number) => (
                    <span key={`missing-${i}`} className="px-2.5 py-1 bg-red-100 text-red-800 border border-red-200 rounded-md text-xs font-semibold shadow-sm">
                      {skill}
                    </span>
                  )) : <span className="text-sm text-slate-400">All required skills matched!</span>}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-3">Recruiter Notes</h3>
              <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                  rows={4} 
                  placeholder="Review candidate and add decision context..." 
              />
              <button 
                  onClick={handleSaveNotes}
                  className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold py-2 rounded-lg shadow-sm">
                  Save Note
              </button>
            </div>
          </div>
        </div>

        {/* Right View: CV / JD Viewer (White Paper Style) */}
        <div className="bg-slate-200 rounded-xl flex flex-col overflow-hidden shadow-inner">
          <div className="bg-white/90 border-b border-slate-300 px-6 py-3 flex items-center justify-between shrink-0">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Review Document</p>
              <p className="text-sm font-semibold text-slate-800">
                {activeDocument === 'cv' ? candidate.name || 'Candidate CV' : job.title || `Job Request #${selectedJobId}`}
              </p>
            </div>
            <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-1">
              <button
                onClick={() => setActiveDocument('cv')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${activeDocument === 'cv' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Candidate CV
              </button>
              <button
                onClick={() => setActiveDocument('jd')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${activeDocument === 'jd' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Job Description
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex justify-center overflow-y-auto p-8">
            {activeDocument === 'cv' ? (
              <div className="bg-white w-full max-w-[800px] h-max shadow-xl p-12 text-slate-800 relative">
                {/* Header / Basic Info */}
                <div className="border-b-2 border-slate-900 pb-6 mb-6">
                  <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{candidate.name || 'Candidate Name'}</h1>
                  <p className="text-xl text-slate-600 font-medium mb-4">{candidate.title || 'Desired Title N/A'}</p>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">Experience:</span> {candidate.experience || 'N/A'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">Location:</span> {candidate.location || 'N/A'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">Expected Salary:</span> {candidate.desired_salary || candidate.expected_salary || 'Negotiable'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">Gender:</span> {candidate.gender || 'N/A'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">Age:</span> {candidate.age ? `${candidate.age} Years` : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Resume Content */}
                <div className="space-y-8">
                  <section>
                    <h2 className="text-lg font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-3">Professional Summary</h2>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {candidate.target || 'No summary provided.'}
                    </p>
                  </section>

                  <section>
                    <h2 className="text-lg font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-3">Skills</h2>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      <HighlightedText text={candidate.skills || 'No skills extracted.'} words={matchedSkills} />
                    </p>
                  </section>

                  <section>
                    <h2 className="text-lg font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-3">Education & Qualifications</h2>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {candidate.degree || 'No education data provided.'}
                    </p>
                  </section>

                  <section>
                    <h2 className="text-lg font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-3">Additional Information</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold block text-slate-500 uppercase text-xs mb-1">Industry</span>
                        {candidate.industry || 'N/A'}
                      </div>
                      <div>
                        <span className="font-semibold block text-slate-500 uppercase text-xs mb-1">Marriage Status</span>
                        {candidate.marriage || 'N/A'}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div className="bg-white w-full max-w-[800px] h-max shadow-xl p-12 text-slate-800 relative">
                <div className="border-b-2 border-slate-900 pb-6 mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Job Description</p>
                  <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{job.title || `Job Request #${selectedJobId}`}</h1>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-slate-700">
                    <div>
                      <span className="font-semibold block text-slate-500 uppercase text-xs mb-1">Location</span>
                      {job.location || 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold block text-slate-500 uppercase text-xs mb-1">Experience Required</span>
                      {job.experience || 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold block text-slate-500 uppercase text-xs mb-1">Degree Required</span>
                      {job.degree || 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold block text-slate-500 uppercase text-xs mb-1">Job ID</span>
                      #{selectedJobId}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <section>
                    <h2 className="text-lg font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-3">Required Skills</h2>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      <HighlightedText text={job.skills || 'No job requirements provided.'} words={matchedSkills} />
                    </p>
                  </section>

                  <section>
                    <h2 className="text-lg font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-3">Job Summary</h2>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {job.description || 'No job description provided.'}
                    </p>
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
