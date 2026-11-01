import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import api from '../../services/api';
import { Visitor } from '../../types';

export const SecurityVisitors: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filter, setFilter] = useState<'all' | 'inside' | 'expected'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const tabParam = filter === 'inside' ? 'inside' : filter === 'expected' ? 'today' : undefined;
      const res = await api.getVisitors({ tab: tabParam, search });
      if (res.success) {
        setVisitors(res.visitors || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [filter, search]);

  const handleCheckIn = async (id: string) => {
    try {
      await api.checkInVisitor(id);
      fetchVisitors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await api.checkOutVisitor(id);
      fetchVisitors();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Gate Visitors Registry</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time tracking of permitted visitors, arrivals, and vehicles currently on premise
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
          {(['all', 'expected', 'inside'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filter === tab ? 'bg-primary text-background shadow-sm' : 'text-text-muted hover:text-white'
              }`}
            >
              {tab === 'inside' ? 'Currently Inside' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 bg-surface rounded-xl border border-border flex items-center gap-2 max-w-md">
        <Search className="w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by visitor name, phone, flat or passcode..."
          className="w-full bg-transparent border-none outline-none text-xs text-text-primary placeholder:text-text-muted"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-panel border border-border p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th className="py-2.5 px-3">Pass Code</th>
                <th className="py-2.5 px-3">Visitor Name</th>
                <th className="py-2.5 px-3">Flat</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Expected Time</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {visitors.map((v) => (
                <tr key={v.id} className="hover:bg-surface/50">
                  <td className="py-3 px-3 font-mono font-bold text-primary">{v.passCode}</td>
                  <td className="py-3 px-3 font-semibold text-text-primary">
                    {v.name}
                    <span className="block text-[10px] text-text-muted font-normal">{v.phone}</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-text-primary">Flat {v.flat?.flatNumber}</td>
                  <td className="py-3 px-3 text-text-secondary">{v.visitorType}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-text-muted">
                    {v.vehicleNumber || '—'}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={v.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-text-muted">
                    {new Date(v.expectedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {v.status === 'EXPECTED' || v.status === 'APPROVED' ? (
                      <button
                        onClick={() => handleCheckIn(v.id)}
                        className="px-3 py-1 rounded-lg bg-primary text-background font-bold text-[11px] hover:bg-primary-hover shadow-sm"
                      >
                        Check In
                      </button>
                    ) : v.status === 'CHECKED_IN' ? (
                      <button
                        onClick={() => handleCheckOut(v.id)}
                        className="px-3 py-1 rounded-lg bg-surface border border-border text-text-secondary hover:text-white font-medium text-[11px]"
                      >
                        Check Out
                      </button>
                    ) : (
                      <span className="text-text-muted text-[11px]">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

