import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

interface JobSelectionTableProps {
  data: any[] | undefined;
  handleSelectJob: (id: number) => void;
}

const JobSelectionTable: React.FC<JobSelectionTableProps> = ({
  data,
  handleSelectJob,
}) => {
  const [query, setQuery] = useState("");

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return data || [];

    return (data || []).filter((job: any) =>
      [job.title, job.location, job.skills]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [data, query]);

  return (
    <div className="flex min-h-[420px] flex-col overflow-hidden rounded-[28px] bg-neu-surface shadow-neu lg:min-h-[620px]">
      <div className="flex flex-col gap-4 border-b border-white/35 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-black tracking-tight text-neu-text">
            Open roles
          </h3>
          <p className="mt-1 text-sm text-neu-text/55">
            Search by title, required skills, or location to jump into the right
            hiring pipeline.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 lg:max-w-xl lg:flex-row lg:items-center">
          <div className="flex w-full items-center gap-3 rounded-2xl bg-neu-surface px-4 py-3 shadow-neu-inner">
            <Search className="h-4 w-4 text-neu-primary" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles, skills, or locations"
              className="w-full bg-transparent text-sm font-medium text-neu-text outline-none placeholder:text-neu-text/35"
            />
          </div>
          <div className="rounded-2xl bg-neu-surface px-4 py-3 text-sm font-semibold text-neu-text/55 shadow-neu-sm">
            {filteredJobs.length} role{filteredJobs.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="table-shell flex-1 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-neu-surface">
            <tr>
              <th className="border-b-2 border-neu-surface px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-neu-text/40 sm:px-6">
                ID
              </th>
              <th className="border-b-2 border-neu-surface px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-neu-text/40 sm:px-6">
                Title
              </th>
              <th className="border-b-2 border-neu-surface px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-neu-text/40 sm:px-6">
                Skills
              </th>
              <th className="border-b-2 border-neu-surface px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-neu-text/40 sm:px-6">
                Location
              </th>
              <th className="border-b-2 border-neu-surface px-4 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-neu-text/40 sm:px-6">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="align-top">
            {filteredJobs.map((job: any) => (
              <tr
                key={job.id}
                className="border-b border-white/35 bg-neu-surface transition-all hover:shadow-neu-inner"
              >
                <td className="px-4 py-5 text-xs font-black text-neu-primary sm:px-6">
                  {job.id}
                </td>
                <td className="px-4 py-5 sm:px-6">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-neu-text sm:text-base">
                      {job.title}
                    </p>
                    <p className="text-xs text-neu-text/45">
                      {job.company_name || "Unspecified company"}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-5 sm:px-6">
                  <div className="flex max-w-md flex-wrap gap-2">
                    {job.skills?.split(",").map((s: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-full bg-neu-surface px-3 py-1 text-xs font-medium text-neu-text/65 shadow-neu-sm"
                      >
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-5 text-sm font-medium text-neu-text/55 sm:px-6">
                  {job.location || "Remote / flexible"}
                </td>
                <td className="px-4 py-5 text-right sm:px-6">
                  <button
                    onClick={() => handleSelectJob(job.id)}
                    className="rounded-2xl bg-neu-secondary px-4 py-2.5 text-sm font-semibold text-neu-primary shadow-neu-sm transition-all duration-300 hover:bg-[#0D9488] hover:text-white active:scale-95 active:bg-[#0F766E] sm:px-5"
                  >
                    View matches
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!filteredJobs.length && (
          <div className="px-4 py-14 text-center sm:px-6">
            <p className="text-lg font-bold text-neu-text">
              No roles match that search.
            </p>
            <p className="mt-2 text-sm text-neu-text/45">
              Try a different title, skill, or location keyword.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSelectionTable;
