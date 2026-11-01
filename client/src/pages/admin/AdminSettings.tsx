import React, { useState, useEffect } from 'react';
import { Settings, Shield, Clock, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export const AdminSettings: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs()
      .then((res) => {
        if (res.success) setLogs(res.logs || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Society Settings & Security Audit Trail</h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Society configuration, role authorization policies, and immutable administrative audit logs
        </p>
      </div>

      {/* Society Overview Card */}
      <div className="bg-card rounded-panel border border-border p-6 shadow-card">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          Society Association Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-surface border border-border">
            <p className="text-text-muted">Registered Name</p>
            <p className="font-bold text-text-primary text-sm mt-0.5">Greenview Residency</p>
            <p className="text-[11px] text-text-secondary">Bellandur, Outer Ring Rd, Bengaluru</p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface border border-border">
            <p className="text-text-muted">Society Registration Code</p>
            <p className="font-mono font-black text-primary text-base mt-0.5">GRNVW-2026</p>
            <p className="text-[11px] text-text-secondary">Used for resident self-onboarding</p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface border border-border">
            <p className="text-text-muted">Inventory Units</p>
            <p className="font-bold text-text-primary text-sm mt-0.5">140 Units • 2 Towers</p>
            <p className="text-[11px] text-status-success font-medium">91% Occupancy Rate</p>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-card rounded-panel border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Immutable Action Audit Logs
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">Administrative and security operations event history</p>
          </div>
          <span className="text-xs text-primary font-mono font-semibold">{logs.length} logged events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-surface/50">
                  <td className="py-3 px-3 text-text-muted font-mono text-[11px]">
                    {new Date(l.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-primary">{l.action}</td>
                  <td className="py-3 px-3 text-text-secondary">{l.entityType}</td>
                  <td className="py-3 px-3 text-text-primary">{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

