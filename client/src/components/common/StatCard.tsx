import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'warning' | 'danger' | 'success';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  onClick,
}) => {
  let accentClass = 'text-primary bg-primary/10 border-primary/20';
  if (variant === 'danger') accentClass = 'text-status-danger bg-status-danger/10 border-status-danger/20';
  if (variant === 'warning') accentClass = 'text-status-warning bg-status-warning/10 border-status-warning/20';
  if (variant === 'success') accentClass = 'text-status-success bg-status-success/10 border-status-success/20';

  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-card border border-border p-5 relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-primary/50 hover:bg-card-hover hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-text-primary mt-1.5 tracking-tight font-sans">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-text-muted mt-1 flex items-center gap-1.5">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span
                className={`font-semibold ${
                  trend.isPositive ? 'text-status-success' : 'text-status-danger'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-text-muted">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${accentClass} shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

