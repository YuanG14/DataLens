import {
  AlertCircle,
  Frown,
  GraduationCap,
  Moon,
  ShieldAlert,
  Smartphone,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { DashboardStats } from '@/features/dashboard/types';

interface KpiItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
}

interface KpiGridProps {
  stats: DashboardStats;
}

export function KpiGrid({ stats }: KpiGridProps) {
  const items: KpiItem[] = [
    { label: 'Depression Rate', value: `${stats.depressionRate}%`, icon: Frown, colorClass: 'text-purple-600' },
    { label: 'Avg Social Media', value: `${stats.avgSocial}h`, icon: Smartphone, colorClass: 'text-blue-600' },
    { label: 'Avg Sleep', value: `${stats.avgSleep}h`, icon: Moon, colorClass: 'text-teal-600' },
    { label: 'Stress (1-10)', value: stats.avgStress, icon: Zap, colorClass: 'text-orange-600' },
    { label: 'Anxiety (1-10)', value: stats.avgAnxiety, icon: AlertCircle, colorClass: 'text-red-600' },
    { label: 'Addiction (1-10)', value: stats.avgAddiction, icon: ShieldAlert, colorClass: 'text-indigo-600' },
    { label: 'Academic Performance', value: stats.avgGPA, icon: GraduationCap, colorClass: 'text-emerald-600' },
    { label: 'Total Sample', value: stats.total, icon: Users, colorClass: 'text-slate-600' },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {items.map((item) => (
        <div key={item.label} className="kpi-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.label}</span>
            <item.icon className={`w-4 h-4 ${item.colorClass}`} aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-slate-800">{item.value}</div>
        </div>
      ))}
    </section>
  );
}
