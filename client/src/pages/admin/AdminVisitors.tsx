import React, { useState, useEffect } from 'react';
import { Search, Download, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import api from '../../services/api';
import { Visitor } from '../../types';

export const AdminVisitors: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVisitors()
      .then((res) => {
        if (res.success) setVisitors(res.visitors || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = visitors.filter(
    (v) =>
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.flat?.flatNumber?.toLowerCase().includes(search.toLowerCase()) ||
      v.passCode?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Society Visitors Master Log</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Comprehensive gate logs, visitor types, vehicle registrations, and check-in times
          </p>
        </div>

        <div className="p-2.5 bg-surface rounded-xl border border-border flex items-center gap-2 max-w-sm w-full">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search visitor, flat or code..."
            className="w-full bg-transparent border-none outline-none text-xs text-text-primary placeholder:text-text-muted"
          />
        </div>
      </div>

      <div className="bg-card rounded-panel border border-border p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th className="py-2.5 px-3">Pass Code</th>
                <th className="py-2.5 px-3">Visitor Name</th>
                <th className="py-2.5 px-3">Destination Unit</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Expected Time</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-surface/50">
                  <td className="py-3 px-3 font-mono font-bold text-primary">{v.passCode}</td>
                  <td className="py-3 px-3 font-semibold text-text-primary">
                    {v.name}
                    <span className="block text-[10px] text-text-muted font-normal">{v.phone}</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-text-primary">Flat {v.flat?.flatNumber}</td>
                  <td className="py-3 px-3 text-text-secondary">{v.visitorType}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-text-muted">{v.vehicleNumber || '—'}</td>
                  <td className="py-3 px-3 text-text-muted">
                    {new Date(v.expectedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <StatusBadge status={v.status} size="sm" />
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

