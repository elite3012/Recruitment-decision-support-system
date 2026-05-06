import React from "react";

interface CandidateFullProfileProps {
  data: any;
}

const CandidateFullProfile: React.FC<CandidateFullProfileProps> = ({
  data,
}) => {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-neu-surface p-6 shadow-neu sm:p-7">
        <h3 className="mb-6 border-b-2 border-transparent pb-2 text-xl font-black tracking-tight text-neu-text shadow-[0_4px_6px_-6px_#c4c3c2]">
          Complete candidate record
        </h3>

        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-1">Full name</p>
            <p className="text-sm font-semibold text-neu-text">
              {data?.candidate?.name || "N/A"}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-1">Desired job or title</p>
            <p className="text-sm font-semibold text-neu-text">
              {data?.candidate?.title || "N/A"}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-1">Location and desired workplace</p>
            <p className="text-sm font-semibold text-neu-text">
              {data?.candidate?.location || "N/A"}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-1">Industry</p>
            <p className="text-sm font-semibold text-neu-text">
              {data?.candidate?.industry || "N/A"}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-1">Total work experience</p>
            <p className="text-sm font-semibold text-neu-text">
              {data?.candidate?.experience || "N/A"}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-1">Desired salary</p>
            <p className="text-sm font-semibold text-neu-success">
              {data?.candidate?.desired_salary || "Negotiable / N/A"}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-1">Age</p>
            <p className="text-sm font-medium text-neu-text">
              {data?.candidate?.age ? `${data.candidate.age} years old` : "N/A"}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-1">Gender and marriage</p>
            <p className="text-sm font-medium text-neu-text">
              {data?.candidate?.gender || "N/A"}
              {data?.candidate?.marriage ? ` - ${data.candidate.marriage}` : ""}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6 border-t border-transparent pt-6">
          <div>
            <p className="eyebrow mb-2">Education and degree</p>
            <p className="whitespace-pre-wrap rounded-2xl bg-neu-surface p-4 text-sm leading-7 text-neu-text shadow-neu-inner">
              {data?.candidate?.degree || "N/A"}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-2">Career target and summary</p>
            <p className="whitespace-pre-wrap rounded-2xl bg-neu-surface p-4 text-sm leading-7 text-neu-text shadow-neu-inner">
              {data?.candidate?.target || "N/A"}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-2">Raw skills extraction</p>
            <p className="whitespace-pre-wrap rounded-2xl bg-neu-surface p-4 text-sm leading-7 text-neu-text shadow-neu-inner">
              {data?.candidate?.skills || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateFullProfile;
