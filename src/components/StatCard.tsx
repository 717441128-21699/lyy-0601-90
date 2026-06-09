import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  gradient?: string;
  delay?: number;
}

const StatCard = ({ title, value, subtitle, icon, trend, gradient = 'from-primary-400 to-primary-600', delay = 0 }: StatCardProps) => {
  return (
    <div
      className="card animate-fade-in-up"
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-warmgray-500 font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold text-warmgray-800 font-mono">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-warmgray-400">{subtitle}</p>
          )}
          {trend && (
            <div className={`mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
              trend.isPositive ? 'bg-primary-50 text-primary-700' : 'bg-accent-50 text-accent-700'
            }`}>
              <span>{trend.isPositive ? '↓' : '↑'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-warmgray-500 ml-1">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
