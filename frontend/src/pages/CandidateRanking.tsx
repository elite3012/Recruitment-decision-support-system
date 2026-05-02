import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobRanking } from '../api/client';
import { useRecruiterStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import LoadingProgress from '../components/CandidateRanking/LoadingProgress';
import RankingHeader from '../components/CandidateRanking/RankingHeader';
import RankingTable from '../components/CandidateRanking/RankingTable';

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
      <RankingHeader selectedJobId={selectedJobId as number} onNavigateJobs={() => navigate('/jobs')} />
      <LoadingProgress />
    </div>
  );

  if (isError) return <div className="p-8 text-red-500 font-medium">Failed to rank candidates. Is the AI server currently warm?</div>;

  return (
    <div className="space-y-6 flex flex-col h-full">
      <RankingHeader selectedJobId={selectedJobId as number} onNavigateJobs={() => navigate('/jobs')} />
      <RankingTable data={data} handleSelectCandidate={handleSelectCandidate} />
    </div>
  );
};

export default CandidateRanking;