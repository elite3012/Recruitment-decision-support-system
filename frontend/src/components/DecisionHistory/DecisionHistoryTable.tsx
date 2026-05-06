import React from "react";
import { useNavigate } from "react-router-dom";

interface DecisionHistoryTableProps {
  decisions: any[];
}

const DecisionHistoryTable: React.FC<DecisionHistoryTableProps> = ({
  decisions,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-hidden rounded-[28px] bg-neu-surface text-sm shadow-neu">
      <div className="table-shell h-full">
        <table className="w-full text-left">
          <thead className="border-b border-transparent bg-neu-surface text-[11px] font-semibold uppercase tracking-[0.14em] text-neu-text/40">
            <tr>
              <th className="border-b-2 border-neu-surface px-4 py-4 sm:px-6">
                Updated
              </th>
              <th className="border-b-2 border-neu-surface px-4 py-4 sm:px-6">
                Candidate
              </th>
              <th className="border-b-2 border-neu-surface px-4 py-4 sm:px-6">
                Recruiter
              </th>
              <th className="border-b-2 border-neu-surface px-4 py-4 sm:px-6">
                Decision
              </th>
              <th className="border-b-2 border-neu-surface px-4 py-4 sm:px-6">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {decisions?.map((decision: any, idx: number) => {
              const action = decision.decision;
              const isRejected = action === "Reject";
              const isShortlisted = action === "Shortlist";

              return (
                <tr
                  key={idx}
                  className="border-b border-white/35 bg-neu-surface transition-shadow hover:shadow-neu-inner"
                >
                  <td className="whitespace-nowrap px-4 py-5 text-sm text-neu-text/45 sm:px-6">
                    {decision.timestamp
                      ? new Date(decision.timestamp).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-4 py-5 sm:px-6">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        className="w-fit text-left text-sm font-bold text-neu-text transition-colors hover:text-neu-primary sm:text-base"
                        onClick={() =>
                          navigate(`/candidate/${decision.candidate_id}`)
                        }
                      >
                        {decision.name || `Candidate ${decision.candidate_id}`}
                      </button>
                      <span className="text-xs text-neu-text/45">
                        {decision.title || "No role specified"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-sm text-neu-text/55 sm:px-6">
                    {decision.recruiter_name || "Admin"}
                  </td>
                  <td className="px-4 py-5 sm:px-6">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        isRejected
                          ? "bg-neu-surface text-neu-text/55 shadow-neu-inner"
                          : isShortlisted
                            ? "bg-neu-surface text-neu-success shadow-neu-inner"
                            : "bg-neu-surface text-neu-warning shadow-neu-inner"
                      }`}
                    >
                      {action}
                    </span>
                  </td>
                  <td
                    className="max-w-sm px-4 py-5 text-sm text-neu-text/55 sm:px-6"
                    title={decision.notes}
                  >
                    <span className="block truncate">
                      {decision.notes || "-"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {(!decisions || decisions.length === 0) && (
          <div className="p-12 text-center">
            <p className="text-lg font-bold text-neu-text">
              No decisions match this filter.
            </p>
            <p className="mt-2 text-sm text-neu-text/45">
              Try another status or review a different job request.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionHistoryTable;
