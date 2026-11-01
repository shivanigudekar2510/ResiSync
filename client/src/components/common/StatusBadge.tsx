import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || '').toUpperCase().replace(/[\s-]/g, '_');

  let colorClasses = 'bg-surface text-text-secondary border-border';

  switch (norm) {
    case 'APPROVED':
    case 'CONFIRMED':
    case 'PAID':
    case 'RESOLVED':
    case 'SUCCESS':
    case 'NORMAL':
    case 'ONLINE':
    case 'COLLECTED':
    case 'ACTIVE':
    case 'OCCUPIED':
      colorClasses = 'bg-status-success/15 text-status-success border-status-success/30';
      break;

    case 'PENDING':
    case 'EXPECTED':
    case 'ASSIGNED':
    case 'IN_PROGRESS':
    case 'WARNING':
    case 'AT_GATE':
      colorClasses = 'bg-status-warning/15 text-status-warning border-status-warning/30';
      break;

    case 'REJECTED':
    case 'FAILED':
    case 'OVERDUE':
    case 'EMERGENCY':
    case 'CRITICAL':
    case 'OFFLINE':
      colorClasses = 'bg-status-danger/15 text-status-danger border-status-danger/30';
      break;

    case 'CHECKED_IN':
      colorClasses = 'bg-primary/20 text-primary border-primary/40 font-semibold';
      break;

    case 'CHECKED_OUT':
    case 'CANCELLED':
    case 'VACANT':
      colorClasses = 'bg-surface text-text-muted border-border';
      break;

    default:
      colorClasses = 'bg-surface text-text-secondary border-border';
      break;
  }

  const pxClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  const label = status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${pxClass} ${colorClasses} capitalize`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label.toLowerCase()}
    </span>
  );
};

