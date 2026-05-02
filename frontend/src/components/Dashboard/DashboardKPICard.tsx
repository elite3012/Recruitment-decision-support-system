import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardKPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColorClass: string;
  iconBgClass: string;
}

const DashboardKPICard: React.FC<DashboardKPICardProps> = ({ title, value, icon: Icon, iconColorClass, iconBgClass }) => {
  return (
    <div className="bg-neu-surface rounded-xl p-6 shadow-neu flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold font-mono text-neu-text mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-lg shadow-neu-inner ${iconColorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default DashboardKPICard;
