import React from "react";

interface CandidateMatchSummaryProps {
  data: any;
}

const CandidateMatchSummary: React.FC<CandidateMatchSummaryProps> = ({
  data,
}) => {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[28px] bg-neu-surface p-4 shadow-neu sm:p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] bg-neu-surface p-5 shadow-neu-inner sm:p-6">
            <h3 className="mb-5 border-b-2 border-transparent pb-2 text-sm font-black tracking-tight text-neu-text shadow-[0_4px_6px_-6px_#c4c3c2]">
              Role requirements
            </h3>

            <div className="space-y-5">
              <div>
                <p className="eyebrow mb-1">Target title</p>
                <p className="text-sm font-semibold text-neu-text sm:text-base">
                  {data?.job?.title || "N/A"}
                </p>
              </div>
              <div>
                <p className="eyebrow mb-1">Location</p>
                <p className="text-sm font-semibold text-neu-text sm:text-base">
                  {data?.job?.location || "N/A"}
                </p>
              </div>
              <div>
                <p className="eyebrow mb-1">Required experience</p>
                <p className="text-sm font-semibold text-neu-text sm:text-base">
                  {data?.job?.experience || "N/A"}
                </p>
              </div>
              <div>
                <p className="eyebrow mb-1">Required skills</p>
                <p className="whitespace-pre-wrap text-sm leading-7 text-neu-text">
                  {data?.job?.skills || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] bg-neu-surface p-5 shadow-neu-inner sm:p-6">
            <h3 className="mb-5 border-b-2 border-transparent pb-2 text-sm font-black tracking-tight text-neu-primary shadow-[0_4px_6px_-6px_#c4c3c2]">
              Candidate snapshot
            </h3>

            <div className="space-y-5">
              <div>
                <p className="eyebrow mb-1">Current or desired title</p>
                <p className="text-sm font-semibold text-neu-text sm:text-base">
                  {data?.candidate?.title || "N/A"}
                </p>
              </div>
              <div>
                <p className="eyebrow mb-1">Location</p>
                <p className="text-sm font-semibold text-neu-text sm:text-base">
                  {data?.candidate?.location || "N/A"}
                </p>
              </div>
              <div>
                <p className="eyebrow mb-1">Experience</p>
                <p className="text-sm font-semibold text-neu-text sm:text-base">
                  {data?.candidate?.experience || "N/A"}
                </p>
              </div>
              <div>
                <p className="eyebrow mb-2">Skills detected</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(data?.candidate?.skills
                    ? String(data.candidate.skills).split(/[,|\n-]/)
                    : ["N/A"]
                  ).map((skill: string, i: number) => {
                    const normalizedSkill = skill.trim();
                    if (!normalizedSkill) return null;
                    return (
                      <span
                        key={i}
                        className="rounded-full bg-neu-surface px-3 py-1 text-xs font-medium text-neu-text/70 shadow-neu-sm"
                      >
                        {normalizedSkill}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] bg-neu-surface p-6 shadow-neu sm:p-7">
        <h3 className="mb-4 border-b-2 border-transparent pb-2 text-xl font-black text-neu-text shadow-[0_4px_6px_-6px_#c4c3c2]">
          Machine learning breakdown
        </h3>

        <div className="space-y-4">
          <div className="group flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 transition group-hover:text-neu-text">
              Location relevance
            </span>
            <div className="flex items-center gap-3">
              {data?.scores?.location_penalty && (
                <span className="rounded-full bg-neu-surface px-3 py-1 text-[11px] font-semibold text-neu-danger shadow-neu-inner">
                  -15% penalty
                </span>
              )}
              <span className="text-sm font-bold text-neu-text">
                {Math.round((data?.scores?.location_match || 0) * 100)}%
              </span>
            </div>
          </div>
          <div className="group flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 transition group-hover:text-neu-text">
              Semantic text similarity
            </span>
            <span className="text-sm font-bold text-neu-text">
              {Math.round((data?.scores?.text_similarity || 0) * 100)}%
            </span>
          </div>
          <div className="group flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 transition group-hover:text-neu-text">
              Extracted skill overlap
            </span>
            <span className="text-sm font-bold text-neu-text">
              {Math.round((data?.scores?.skill_match || 0) * 100)}%
            </span>
          </div>
          <div className="group flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 transition group-hover:text-neu-text">
              Experience match
            </span>
            <span className="text-sm font-bold text-neu-text">
              {Math.round((data?.scores?.experience_match || 0) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateMatchSummary;
