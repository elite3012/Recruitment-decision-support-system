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
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${iconBgClass} ${iconColorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default DashboardKPICard;
