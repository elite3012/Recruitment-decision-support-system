import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getJobRanking } from "../api/client";
import { useRecruiterStore } from "../store/useStore";
import { useNavigate } from "react-router-dom";
import LoadingProgress from "../components/CandidateRanking/LoadingProgress";
import RankingHeader from "../components/CandidateRanking/RankingHeader";
import RankingTable from "../components/CandidateRanking/RankingTable";

const CandidateRanking = () => {
  const { selectedJobId, setSelectedCandidateId } = useRecruiterStore();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["jobRanking", selectedJobId],
    queryFn: () => getJobRanking(selectedJobId as number, 50),
    enabled: !!selectedJobId,
  });

  const handleSelectCandidate = (id: number) => {
    setSelectedCandidateId(id);
    navigate(`/candidate/${id}`);
  };

  if (!selectedJobId) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 rounded-[28px] bg-neu-surface px-6 text-center shadow-neu">
        <h3 className="text-2xl font-black text-neu-text">
          Choose a job first
        </h3>
        <p className="max-w-md text-sm leading-6 text-neu-text/55 sm:text-base">
          Head back to the job catalog and select a role before reviewing
          AI-ranked candidates.
        </p>
        <button
          onClick={() => navigate("/jobs")}
          className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-teal-700"
        >
          Go to jobs
        </button>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="space-y-6 flex flex-col h-full">
        <RankingHeader
          selectedJobId={selectedJobId as number}
          onNavigateJobs={() => navigate("/jobs")}
        />
        <LoadingProgress />
      </div>
    );

  if (isError)
    return (
      <div className="p-8 text-red-500 font-medium">
        Failed to rank candidates. Is the AI server currently warm?
      </div>
    );

  return (
    <div className="space-y-6 flex flex-col h-full">
      <RankingHeader
        selectedJobId={selectedJobId as number}
        onNavigateJobs={() => navigate("/jobs")}
      />
      <RankingTable data={data} handleSelectCandidate={handleSelectCandidate} />
    </div>
  );
};

export default CandidateRanking;
