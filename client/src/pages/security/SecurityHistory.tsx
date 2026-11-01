import React, { useState, useEffect } from 'react';
import { History, Search, Download, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import api from '../../services/api';
import { Visitor } from '../../types';

export const SecurityHistory: React.FC = () => {
  const [history, setHistory] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVisitors({ tab: 'history' })
      .then((res) => {
        if (res.success) setHistory(res.visitors || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Gate Entry & Exit Log History</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Complete audit trail of all historical visitor arrivals and departures
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-semibold hover:border-primary text-text-secondary hover:text-white flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Gate Log</span>
        </button>
      </div>

      <div className="bg-card rounded-panel border border-border p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Visitor Name</th>
                <th className="py-2.5 px-3">Pass Code</th>
                <th className="py-2.5 px-3">Flat</th>
                <th className="py-2.5 px-3">Check-In</th>
                <th className="py-2.5 px-3">Check-Out</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {history.map((v) => (
                <tr key={v.id} className="hover:bg-surface/50">
                  <td className="py-3 px-3 text-text-muted">
                    {new Date(v.expectedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 px-3 font-semibold text-text-primary">{v.name}</td>
                  <td className="py-3 px-3 font-mono text-primary font-bold">{v.passCode}</td>
                  <td className="py-3 px-3 text-text-secondary">Flat {v.flat?.flatNumber}</td>
                  <td className="py-3 px-3 text-text-muted">
                    {v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="py-3 px-3 text-text-muted">
                    {v.checkOutTime ? new Date(v.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
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

