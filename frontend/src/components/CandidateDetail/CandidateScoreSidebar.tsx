import React from "react";

interface CandidateScoreSidebarProps {
  data: any;
  notes: string;
  setNotes: (notes: string) => void;
  handleSaveNotes: () => void;
}

const CandidateScoreSidebar: React.FC<CandidateScoreSidebarProps> = ({
  data,
  notes,
  setNotes,
  handleSaveNotes,
}) => {
  return (
    <div className="space-y-6 xl:sticky xl:top-5">
      <div className="rounded-[30px] border-t-8 border-teal-600 bg-neu-surface p-6 shadow-neu sm:p-8">
        <p className="eyebrow mb-2">Match probability</p>
        <p
          className={`mb-8 text-5xl font-black tracking-tight sm:text-6xl ${
            (data?.scores?.overall_score || 0) >= 0.7
              ? "text-[#00A63D]"
              : (data?.scores?.overall_score || 0) >= 0.4
                ? "text-[#FE9900]"
                : "text-[#FF2157]"
          }`}
        >
          {Math.round((data?.scores?.overall_score || 0) * 100)}%
        </p>

        <div className="space-y-6 border-t-4 border-neu-surface pt-8 text-sm shadow-sm">
          <div>
            <h4 className="mb-3 text-lg font-black tracking-tight text-neu-text">
              Recruiter notes
            </h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-2xl border-none bg-neu-surface p-4 text-sm leading-7 text-neu-text shadow-neu-inner placeholder:text-neu-text/25 focus:outline-none"
              rows={6}
              placeholder="Capture the reasoning, concerns, and next steps for this candidate."
            />
          </div>
          <button
            onClick={handleSaveNotes}
            className="w-full rounded-2xl bg-teal-600 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-teal-700 active:scale-95"
          >
            Save notes
          </button>
        </div>
      </div>

      {data?.job?.description && (
        <div className="max-h-[420px] overflow-y-auto rounded-[28px] bg-neu-surface p-5 text-sm shadow-neu xl:max-h-[680px]">
          <h4 className="mb-3 border-b-2 border-transparent pb-2 text-lg font-black tracking-tight text-neu-text shadow-[0_4px_6px_-6px_#c4c3c2]">
            Full job description
          </h4>
          <div className="whitespace-pre-wrap text-[14px] leading-7 text-neu-text">
            {data.job.description}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateScoreSidebar;
