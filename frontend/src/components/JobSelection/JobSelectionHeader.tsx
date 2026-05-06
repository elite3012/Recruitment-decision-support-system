import React from "react";

const JobSelectionHeader: React.FC = () => {
  return (
    <div className="flex flex-col gap-2">
      <p className="eyebrow">Role discovery</p>
      <h2 className="text-2xl font-black tracking-tight text-neu-text sm:text-3xl">
        Job catalog
      </h2>
      <p className="max-w-2xl text-sm leading-6 text-neu-text/55 sm:text-base">
        Browse open roles, review requirements, and launch candidate screening
        from a table that stays readable on smaller screens.
      </p>
    </div>
  );
};

export default JobSelectionHeader;
