import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; height?: string }> = ({
  rows = 3,
  height = 'h-16',
}) => {
  return (
    <div className="space-y-3 w-full animate-pulse my-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`bg-card/70 border border-border/50 rounded-xl ${height} w-full`} />
      ))}
    </div>
  );
};

