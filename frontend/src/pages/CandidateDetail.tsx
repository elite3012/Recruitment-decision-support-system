import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getCandidateDetail, saveCandidateDecision } from "../api/client";
import { useRecruiterStore } from "../store/useStore";
import CandidateHeader from "../components/CandidateDetail/CandidateHeader";
import CandidateTabs from "../components/CandidateDetail/CandidateTabs";
import CandidateMatchSummary from "../components/CandidateDetail/CandidateMatchSummary";
import CandidateFullProfile from "../components/CandidateDetail/CandidateFullProfile";
import CandidateScoreSidebar from "../components/CandidateDetail/CandidateScoreSidebar";

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedJobId } = useRecruiterStore();
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"summary" | "profile">("summary");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["candidateDetail", selectedJobId, id],
    queryFn: () =>
      getCandidateDetail(selectedJobId as number, parseInt(id as string)),
    enabled: !!selectedJobId && !!id,
  });

  useEffect(() => {
    if (data?.decision_info) {
      setDecision(data.decision_info.action);
      setNotes(data.decision_info.notes || "");
    }
  }, [data]);

  const handleDecision = async (action: string) => {
    setDecision(action);
    if (selectedJobId && id) {
      const candidateIdNum = parseInt(id);

      // Optimistically update candidate detail
      queryClient.setQueryData(
        ["candidateDetail", selectedJobId, id],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            decision_info: {
              ...(old.decision_info || {}),
              action: action,
              notes: notes,
            },
          };
        },
      );

      // Optimistically update ranking list
      queryClient.setQueryData(["jobRanking", selectedJobId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          ranking: old.ranking?.map((c: any) =>
            c.candidate_id === candidateIdNum ? { ...c, decision: action } : c,
          ),
        };
      });

      try {
        await saveCandidateDecision(
          selectedJobId,
          candidateIdNum,
          action,
          notes,
        );
        // Clear history cache instead of invalidate to force a hard reload and prevent stale UI flash
        queryClient.removeQueries({
          queryKey: ["jobDecisions", selectedJobId],
        });

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
      queryClient.setQueryData(
        ["candidateDetail", selectedJobId, id],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            decision_info: {
              ...(old.decision_info || {}),
              action: decision,
              notes: notes,
            },
          };
        },
      );

      try {
        await saveCandidateDecision(
          selectedJobId,
          candidateIdNum,
          decision,
          notes,
        );
        queryClient.removeQueries({
          queryKey: ["jobDecisions", selectedJobId],
        });
        alert("Notes saved successfully");
      } catch (err) {
        alert("Failed to save notes.");
      }
    } else {
      alert(
        "Please select an action (Shortlist/Hold/Reject) before saving notes.",
      );
    }
  };

  if (!selectedJobId) {
    return (
      <div className="rounded-[28px] bg-neu-surface p-8 text-center shadow-neu">
        <h3 className="text-2xl font-black text-neu-text">
          No job context found
        </h3>
        <p className="mt-3 text-sm leading-6 text-neu-text/55 sm:text-base">
          Return to the job catalog, select a role, then reopen this candidate
          review.
        </p>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="p-8 text-slate-500 animate-pulse">
        Loading Candidate Profile & ML Explanation...
      </div>
    );
  if (isError)
    return (
      <div className="p-8 text-red-500 font-medium">
        Failed to load candidate detail.{" "}
      </div>
    );

  return (
    <div className="space-y-6">
      <CandidateHeader
        id={id}
        selectedJobId={selectedJobId}
        candidateName={data?.candidate?.name}
        jobTitle={data?.job?.title}
        decision={decision}
        handleDecision={handleDecision}
        successMessage={successMessage}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
        <div className="min-w-0 space-y-6">
          <CandidateTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {activeTab === "summary" ? (
            <CandidateMatchSummary data={data} />
          ) : (
            <CandidateFullProfile data={data} />
          )}
        </div>

        <CandidateScoreSidebar
          data={data}
          notes={notes}
          setNotes={setNotes}
          handleSaveNotes={handleSaveNotes}
        />
      </div>
    </div>
  );
};

export default CandidateDetail;
