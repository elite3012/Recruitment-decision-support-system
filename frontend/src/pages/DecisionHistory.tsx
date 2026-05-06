import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getJobDecisions } from "../api/client";
import { useRecruiterStore } from "../store/useStore";
import { useNavigate } from "react-router-dom";
import DecisionHistoryHeader from "../components/DecisionHistory/DecisionHistoryHeader";
import DecisionHistoryTable from "../components/DecisionHistory/DecisionHistoryTable";

const DecisionHistory = () => {
  const { selectedJobId } = useRecruiterStore();
  const navigate = useNavigate();
  const [filterAction, setFilterAction] = useState<string>("All");

  const {
    data: decisions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["jobDecisions", selectedJobId],
    queryFn: () => getJobDecisions(selectedJobId as number),
    enabled: !!selectedJobId,
  });

  const filteredDecisions =
    filterAction === "All"
      ? decisions?.decisions
      : decisions?.decisions?.filter((d: any) => d.decision === filterAction);

  if (!selectedJobId) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 rounded-[28px] bg-neu-surface px-6 text-center shadow-neu">
        <h3 className="text-2xl font-black text-neu-text">
          Choose a job first
        </h3>
        <p className="max-w-md text-sm leading-6 text-neu-text/55 sm:text-base">
          Select a role from the job catalog before reviewing recruiter
          decisions and notes.
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
      <div className="p-8 text-slate-500 animate-pulse">
        Loading decision history...
      </div>
    );
  if (isError)
    return (
      <div className="p-8 text-red-500 font-medium">
        Failed to load decision history.
      </div>
    );

  return (
    <div className="space-y-6 flex flex-col h-full">
      <DecisionHistoryHeader
        selectedJobId={selectedJobId as number}
        filterAction={filterAction}
        setFilterAction={setFilterAction}
        onNavigateRanking={() => navigate("/ranking")}
      />
      <DecisionHistoryTable decisions={filteredDecisions || []} />
    </div>
  );
};

export default DecisionHistory;
