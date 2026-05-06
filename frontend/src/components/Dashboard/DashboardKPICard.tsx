import React from "react";
import { LucideIcon } from "lucide-react";

interface DashboardKPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColorClass: string;
  iconBgClass: string;
}

const DashboardKPICard: React.FC<DashboardKPICardProps> = ({
  title,
  value,
  icon: Icon,
  iconColorClass,
  iconBgClass,
}) => {
  return (
    <div className="group flex items-center justify-between rounded-[28px] bg-neu-surface p-6 shadow-neu transition-all duration-300 hover:shadow-neu-sm sm:p-7">
      <div className="min-w-0">
        <p className="mb-2 text-sm font-semibold text-neu-text/55">{title}</p>
        <p className="truncate text-3xl font-black tracking-tight text-neu-text sm:text-4xl">
          {value}
        </p>
      </div>
      <div
        className={`rounded-2xl p-4 shadow-neu-inner transition-all duration-300 sm:p-5 ${
          title.toLowerCase().includes("job")
            ? "text-neu-primary"
            : title.toLowerCase().includes("candidate")
              ? "text-neu-success"
              : "text-neu-warning"
        }`}
      >
        <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
      </div>
    </div>
  );
};

export default DashboardKPICard;
