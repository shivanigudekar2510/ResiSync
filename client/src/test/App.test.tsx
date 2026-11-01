import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StatusBadge } from '../components/common/StatusBadge';
import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Users, AlertTriangle } from 'lucide-react';

describe('RESISYNC UI Component Suite', () => {
  it('renders StatusBadge correctly with semantic colors', () => {
    const { getByText } = render(<StatusBadge status="APPROVED" />);
    expect(getByText('approved')).toBeInTheDocument();
  });

  it('renders StatusBadge for PENDING status', () => {
    const { getByText } = render(<StatusBadge status="PENDING" />);
    expect(getByText('pending')).toBeInTheDocument();
  });

  it('renders StatusBadge for EMERGENCY and RESOLVED status', () => {
    const { getByText, rerender } = render(<StatusBadge status="EMERGENCY" />);
    expect(getByText('emergency')).toBeInTheDocument();

    rerender(<StatusBadge status="RESOLVED" />);
    expect(getByText('resolved')).toBeInTheDocument();
  });

  it('renders StatCard with title, value, icon, and trend', () => {
    const { getByText } = render(
      <StatCard
        title="Total Residents"
        value={142}
        subtitle="Occupancy 91%"
        icon={Users}
        trend={{ value: '+8%', isPositive: true }}
      />
    );
    expect(getByText('Total Residents')).toBeInTheDocument();
    expect(getByText('142')).toBeInTheDocument();
    expect(getByText('Occupancy 91%')).toBeInTheDocument();
    expect(getByText(/\+8%/)).toBeInTheDocument();
  });

  it('renders EmptyState with custom icon and triggers action callback', () => {
    const handleAction = vi.fn();
    const { getByText } = render(
      <EmptyState
        title="No Active Visitors"
        description="Invite guests to generate gate QR passes"
        icon={AlertTriangle}
        actionText="Generate Pass"
        onAction={handleAction}
      />
    );

    expect(getByText('No Active Visitors')).toBeInTheDocument();
    expect(getByText('Invite guests to generate gate QR passes')).toBeInTheDocument();

    const actionBtn = getByText('Generate Pass');
    expect(actionBtn).toBeInTheDocument();
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders LoadingSkeleton with pulse animation', () => {
    const { container } = render(<LoadingSkeleton rows={4} className="my-custom-class" />);
    const skeletonDivs = container.querySelectorAll('.animate-pulse');
    expect(skeletonDivs.length).toBeGreaterThan(0);
  });
});
