import React, { useState, useEffect } from 'react';
import { LifeBuoy, User, CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';
import { Complaint } from '../../types';

export const AdminComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
  const [assignedStaff, setAssignedStaff] = useState('Ramesh Carpenter & Plumber (ID: S-12)');
  const [status, setStatus] = useState('IN_PROGRESS');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints();
      if (res.success) setComplaints(res.complaints || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      const res = await api.updateComplaintStatus(selectedTicket.id, {
        status,
        assignedStaffName: assignedStaff,
        resolutionNotes,
      });
      if (res.success) {
        setSelectedTicket(null);
        fetchComplaints();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Helpdesk Operations & Staff Dispatch</h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Assign electricians, plumbers, housekeepers, and review resolution verification notes
        </p>
      </div>

      <div className="bg-card rounded-panel border border-border p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Flat</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Assigned Staff</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-surface/50">
                  <td className="py-3 px-3 font-mono font-bold text-primary">{c.ticketNumber}</td>
                  <td className="py-3 px-3 font-bold text-text-primary">Flat {c.flat?.flatNumber}</td>
                  <td className="py-3 px-3 text-text-muted font-medium">{c.category}</td>
                  <td className="py-3 px-3 text-text-primary max-w-xs truncate">{c.subject}</td>
                  <td className="py-3 px-3 text-text-secondary">{c.assignedStaffName || 'Unassigned'}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedTicket(c);
                        setStatus(c.status);
                        setAssignedStaff(c.assignedStaffName || 'Ramesh Carpenter & Plumber (ID: S-12)');
                        setResolutionNotes(c.resolutionNotes || '');
                      }}
                      className="px-3 py-1 rounded-lg bg-surface border border-border text-primary hover:border-primary text-[11px] font-semibold"
                    >
                      Manage Ticket
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Ticket Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Manage Ticket #${selectedTicket?.ticketNumber}`}
        subtitle={`Flat ${selectedTicket?.flat?.flatNumber} • ${selectedTicket?.subject}`}
      >
        {selectedTicket && (
          <form onSubmit={handleUpdateTicket} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-surface border border-border text-xs">
              <p className="font-semibold text-text-primary mb-1">Resident Description:</p>
              <p className="text-text-secondary leading-relaxed">{selectedTicket.description}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Assign Staff Personnel</label>
              <select
                value={assignedStaff}
                onChange={(e) => setAssignedStaff(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="Ramesh Carpenter & Plumber (ID: S-12)">Ramesh Carpenter & Plumber (ID: S-12)</option>
                <option value="Manoj Electrician (ID: S-04)">Manoj Electrician (ID: S-04)</option>
                <option value="Suresh Housekeeping Lead (ID: S-09)">Suresh Housekeeping Lead (ID: S-09)</option>
                <option value="Gate 1 Security Officer (ID: G-01)">Gate 1 Security Officer (ID: G-01)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Service Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="OPEN">OPEN</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Resolution Verification Notes</label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Details of inspection, parts replaced, or tests performed..."
                className="w-full bg-card border border-border rounded-xl p-3 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
              >
                Update Ticket
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

