import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-border bg-card/40 my-4">
      <div className="p-4 rounded-2xl bg-surface border border-border text-text-muted mb-4 shadow-sm">
        <Icon className="w-8 h-8 text-primary/70" />
      </div>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="text-xs text-text-secondary max-w-sm mt-1 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 rounded-xl bg-primary text-background font-medium text-xs hover:bg-primary-hover shadow-orange-glow transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

