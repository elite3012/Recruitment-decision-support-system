import React from "react";
import { useNavigate } from "react-router-dom";

interface CandidateHeaderProps {
  id?: string;
  selectedJobId?: number | null;
  candidateName?: string;
  jobTitle?: string;
  decision: string | null;
  handleDecision: (action: string) => void;
  successMessage: string | null;
}

const CandidateHeader: React.FC<CandidateHeaderProps> = ({
  id,
  selectedJobId,
  candidateName,
  jobTitle,
  decision,
  handleDecision,
  successMessage,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate("/ranking")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-neu-text/65 transition hover:text-neu-primary"
      >
        Back to ranking
      </button>

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Candidate review</p>
          <h2 className="text-2xl font-black tracking-tight text-neu-text sm:text-3xl">
            {candidateName || `Candidate #${id}`}
          </h2>
          <p className="text-sm leading-6 text-neu-text/55 sm:text-base">
            Evaluation against job request{" "}
            <span className="font-mono">#{selectedJobId}</span> for{" "}
            {jobTitle || "Unknown title"}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleDecision("Hold")}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 shadow-neu-sm ${
              decision === "Hold"
                ? "bg-[#FE9900] text-white"
                : "bg-neu-surface text-neu-text hover:bg-[#FE9900] hover:text-white"
            }`}
          >
            Hold
          </button>
          <button
            onClick={() => handleDecision("Reject")}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 shadow-neu-sm ${
              decision === "Reject"
                ? "bg-[#FF2157] text-white"
                : "bg-neu-surface text-neu-text hover:bg-[#FF2157] hover:text-white"
            }`}
          >
            Reject
          </button>
          <button
            onClick={() => handleDecision("Shortlist")}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 shadow-neu-sm ${
              decision === "Shortlist"
                ? "bg-[#00A63D] text-white"
                : "bg-neu-surface text-neu-text hover:bg-[#00A63D] hover:text-white"
            }`}
          >
            Shortlist
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center rounded-2xl bg-neu-surface px-4 py-3 font-semibold text-neu-success shadow-neu-inner">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default CandidateHeader;
