import React from "react";

interface CandidateTabsProps {
  activeTab: "summary" | "profile";
  setActiveTab: (tab: "summary" | "profile") => void;
}

const CandidateTabs: React.FC<CandidateTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="mb-6 overflow-x-auto pb-1">
      <nav
        className="flex min-w-max gap-2 rounded-2xl bg-neu-surface p-1.5 shadow-neu-inner"
        aria-label="Tabs"
      >
        <button
          onClick={() => setActiveTab("summary")}
          className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "summary"
              ? "bg-neu-surface text-neu-primary shadow-neu"
              : "text-neu-text/50 hover:text-neu-text"
          }`}
        >
          Match summary
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "profile"
              ? "bg-neu-surface text-neu-primary shadow-neu"
              : "text-neu-text/50 hover:text-neu-text"
          }`}
        >
          Full profile
        </button>
      </nav>
    </div>
  );
};

export default CandidateTabs;
