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
    <div className="bg-neu-surface rounded-3xl p-8 shadow-neu transition-all duration-300 hover:shadow-neu-sm cursor-default flex items-center justify-between border-b-4 border-transparent hover:border-neu-primary group">
      <div>
        <p className="text-[10px] font-black text-neu-text/40 uppercase tracking-[0.2em] font-mono mb-2">{title}</p>
        <p className="text-4xl font-black font-primary text-neu-text tracking-tighter">{value}</p>
      </div>
      <div className={`p-5 rounded-2xl shadow-neu-inner transition-all duration-300 ${
        title.toLowerCase().includes('job') ? 'text-neu-primary' : 
        title.toLowerCase().includes('candidate') ? 'text-neu-success' : 
        'text-neu-warning'
      }`}>
        <Icon className="w-10 h-10" />
      </div>
    </div>
  );
};

export default DashboardKPICard;
