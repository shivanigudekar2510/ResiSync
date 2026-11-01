import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, CheckCircle2, Phone, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import api from '../../services/api';
import { EmergencyRequest } from '../../types';

export const SecurityEmergency: React.FC = () => {
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmergencies = async () => {
    setLoading(true);
    try {
      const res = await api.getEmergencies();
      if (res.success) {
        setEmergencies(res.emergencies || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await api.resolveEmergency(id);
      fetchEmergencies();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-status-emergency" />
            <span>Gate 1 Emergency Dispatch Console</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Active resident panic alerts, medical assistance calls, and security interventions
          </p>
        </div>
      </div>

      <div className="bg-card rounded-panel border border-border p-5">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          Emergency Incident Log
        </h3>

        {emergencies.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-status-success mx-auto mb-2" />
            <p className="text-xs text-text-secondary">No active emergency signals. All sectors all-clear.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emergencies.map((em) => (
              <div
                key={em.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  em.status === 'ACTIVE'
                    ? 'bg-status-emergency/15 border-status-emergency ring-1 ring-red-500 animate-pulse'
                    : 'bg-surface border-border'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-red-400">
                      🚨 {em.emergencyType} ALARM — Flat {em.flatNumber}
                    </span>
                    <StatusBadge status={em.status} size="sm" />
                  </div>
                  <p className="text-xs text-text-primary font-medium mt-1">
                    Resident: {em.residentName} ({em.residentPhone})
                  </p>
                  {em.note && (
                    <p className="text-xs text-text-secondary mt-0.5">{em.note}</p>
                  )}
                  <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Triggered: {new Date(em.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {em.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleResolve(em.id)}
                    className="px-4 py-2 rounded-xl bg-status-success text-white font-bold text-xs hover:bg-emerald-600 transition self-start sm:self-center"
                  >
                    Mark Handled / Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

