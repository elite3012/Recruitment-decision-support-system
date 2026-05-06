import React from "react";

interface RankingTableProps {
  data: any;
  handleSelectCandidate: (id: number) => void;
}

const RankingTable: React.FC<RankingTableProps> = ({
  data,
  handleSelectCandidate,
}) => {
  return (
    <div className="flex-1 overflow-hidden rounded-[28px] bg-neu-surface text-sm shadow-neu">
      <div className="table-shell h-full">
        <table className="w-full text-left">
          <thead className="border-b-2 border-neu-surface bg-neu-surface text-[11px] font-semibold uppercase tracking-[0.14em] text-neu-text/40">
            <tr>
              <th className="px-4 py-4 sm:px-6">Rank</th>
              <th className="px-4 py-4 sm:px-6">Candidate</th>
              <th className="hidden px-4 py-4 sm:table-cell sm:px-6">Role</th>
              <th className="hidden px-4 py-4 xl:table-cell xl:px-6">
                Location
              </th>
              <th className="px-4 py-4 sm:px-6">Match</th>
              <th className="px-4 py-4 text-right sm:px-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.ranking?.map((candidate: any, idx: number) => {
              const decision = candidate.decision;
              const isRejected = decision === "Reject";
              const isShortlisted = decision === "Shortlist";
              const isHold = decision === "Hold";

              return (
                <tr
                  key={candidate.candidate_id}
                  className={`border-b border-white/35 bg-neu-surface transition-all hover:shadow-neu-inner ${isRejected ? "opacity-55" : ""}`}
                >
                  <td className="px-4 py-5 sm:px-6">
                    <span className="text-2xl font-black italic text-neu-primary">
                      {idx + 1}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-5 sm:px-6 ${isRejected ? "text-neu-text/55" : "text-neu-text"}`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-bold sm:text-base ${isRejected ? "line-through" : ""}`}
                        >
                          {candidate.name ||
                            `Candidate ${candidate.candidate_id}`}
                        </span>
                        {decision && (
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold text-white ${
                              isShortlisted
                                ? "bg-[#00A63D]"
                                : isRejected
                                  ? "bg-[#FF2157]"
                                  : isHold
                                    ? "bg-[#FE9900]"
                                    : "bg-neu-primary"
                            }`}
                          >
                            {decision}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neu-text/45">
                        ID #{candidate.candidate_id}
                      </span>
                      <span className="text-sm text-neu-text/55 sm:hidden">
                        {candidate.title || "No role specified"}
                      </span>
                      <span className="text-sm text-neu-text/45 xl:hidden">
                        {candidate.location || "Location not set"}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-5 text-sm font-medium text-neu-text/60 sm:table-cell sm:px-6">
                    {candidate.title || "N/A"}
                  </td>
                  <td className="hidden px-4 py-5 text-sm font-medium text-neu-text/50 xl:table-cell xl:px-6">
                    {candidate.location || "N/A"}
                  </td>
                  <td className="px-4 py-5 sm:px-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neu-surface shadow-neu-inner sm:h-14 sm:w-14">
                      <span
                        className={`text-sm font-black ${
                          candidate.scores.overall_score >= 0.7
                            ? "text-neu-success"
                            : candidate.scores.overall_score >= 0.4
                              ? "text-neu-warning"
                              : "text-neu-danger"
                        }`}
                      >
                        {Math.round(candidate.scores.overall_score * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-right sm:px-6">
                    <button
                      onClick={() =>
                        handleSelectCandidate(candidate.candidate_id)
                      }
                      className="rounded-2xl bg-neu-secondary px-4 py-2.5 text-sm font-semibold text-neu-primary shadow-neu-sm transition-all duration-300 hover:bg-[#0D9488] hover:text-white active:scale-95 active:bg-[#0F766E] sm:px-5"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!data?.ranking?.length && (
          <div className="p-12 text-center">
            <p className="text-lg font-bold text-neu-text">
              No candidates matched the criteria.
            </p>
            <p className="mt-2 text-sm text-neu-text/45">
              Adjust the role requirements or pick a different job to continue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingTable;
