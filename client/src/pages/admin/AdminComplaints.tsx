import React, { useState, useEffect } from 'react';
import { LifeBuoy, User, CheckCircle2, MessageSquare, Clock, Wrench, ShieldAlert, KeyRound, Check, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { Complaint } from '../../types';

export const AdminComplaints: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const isTechUser = user?.email === 'tech@emeraldgreens.in';
  const [activeTab, setActiveTab] = useState<'tech' | 'all'>(isTechUser ? 'tech' : 'all');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
  const [assignedStaff, setAssignedStaff] = useState('Suresh Babu (Shift A)');
  const [status, setStatus] = useState('IN_PROGRESS');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(true);

  // Technician OTP closure inputs per ticket
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({
    'comp-tkt-801': '',
    'comp-tkt-802': '',
  });
  const [closingTicketId, setClosingTicketId] = useState<string | null>(null);

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

  const handleVerifyClosureOtp = async (ticket: Complaint) => {
    const enteredOtp = (otpInputs[ticket.id] || '').trim();
    if (!enteredOtp) {
      showToast({
        type: 'error',
        title: 'Closure OTP Required',
        message: "Security Policy: Technicians cannot close tickets without the resident's secret confirmation code.",
      });
      return;
    }

    setClosingTicketId(ticket.id);
    try {
      const res = await api.verifyComplaintClosureOtp(
        ticket.id,
        enteredOtp,
        'Repair completed and verified on-site via 4-digit resident OTP.'
      );
      if (res.success) {
        showToast({
          type: 'success',
          title: 'Ticket Closed Successfully',
          message: `Ticket #${ticket.ticketNumber} verified with Resident OTP ${enteredOtp} and closed!`,
        });
        setOtpInputs((prev) => ({ ...prev, [ticket.id]: '' }));
        fetchComplaints();
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Closure Denied',
        message: err.message || "Invalid OTP. Technicians cannot close tickets without the resident's secret confirmation code.",
      });
    } finally {
      setClosingTicketId(null);
    }
  };

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

  const activeWorkOrders = complaints.filter(
    (c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Helpdesk Operations & SLA Dispatch
            </h2>
            {isTechUser && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                Shift A Technician Kiosk
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            SLA dispatch, assigned work orders, and strict 4-digit resident confirmation closure verification
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('tech')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'tech'
                ? 'bg-primary text-background shadow-sm'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Technician Work Orders (Shift A)</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'all'
                ? 'bg-primary text-background shadow-sm'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <span>All Society Complaints</span>
          </button>
        </div>
      </div>

      {/* Technician Work Orders Kiosk View */}
      {activeTab === 'tech' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block">
                Strict Zero-Leakage Policy: Resident Closure OTP Required
              </span>
              <p className="mt-0.5 text-amber-200/90 leading-relaxed">
                Technicians cannot close tickets without the resident's secret confirmation code. Once physical inspection is finished, ask the resident for their 4-digit key (e.g. <span className="font-mono font-bold text-white underline">5529</span> for TKT-801 or <span className="font-mono font-bold text-white underline">8812</span> for TKT-802) to verify and complete the job.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {complaints.map((ticket) => {
              const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
              const inputVal = otpInputs[ticket.id] || '';
              const expectedOtp = (ticket as any).closureOtp || '5529';

              return (
                <div
                  key={ticket.id}
                  className={`bg-card rounded-2xl border p-5 transition flex flex-col justify-between ${
                    isResolved ? 'border-border opacity-70' : 'border-primary/40 shadow-card'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-primary">
                          #{ticket.ticketNumber}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-surface text-text-muted border border-border">
                          {ticket.category}
                        </span>
                      </div>
                      <StatusBadge status={ticket.status} size="sm" />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-text-primary">{ticket.subject}</h3>
                      <p className="text-xs text-text-secondary mt-1">{ticket.description}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-surface border border-border grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-text-muted block text-[10px] uppercase">Destination Unit:</span>
                        <span className="font-bold text-text-primary text-sm">
                          Flat {ticket.flat?.flatNumber || 'A-402'}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[10px] uppercase">Assigned Technician:</span>
                        <span className="font-bold text-primary text-sm">
                          {ticket.assignedStaffName || 'Suresh Babu (Shift A)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Closure OTP Verification Kiosk Box */}
                  <div className="mt-5 pt-4 border-t border-border">
                    {isResolved ? (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ticket closed and verified on site with resident confirmation OTP.</span>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-primary" />
                            <span>Resident 4-Digit Closure OTP</span>
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setOtpInputs((prev) => ({ ...prev, [ticket.id]: expectedOtp }))
                            }
                            className="text-[10px] font-mono text-primary hover:underline font-bold"
                          >
                            ⚡ Fill OTP ({expectedOtp})
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={inputVal}
                            onChange={(e) =>
                              setOtpInputs({ ...otpInputs, [ticket.id]: e.target.value })
                            }
                            placeholder="Enter 4-digit code (e.g. 5529)"
                            className="flex-1 bg-surface border border-border rounded-xl px-3.5 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleVerifyClosureOtp(ticket)}
                            disabled={closingTicketId === ticket.id}
                            className="px-5 py-2 rounded-xl bg-primary text-background font-black text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Verify OTP & Close</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overview Table View */}
      {activeTab === 'all' && (
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
                          setAssignedStaff(c.assignedStaffName || 'Suresh Babu (Shift A)');
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
      )}

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
                <option value="Suresh Babu (Shift A)">Suresh Babu (Shift A)</option>
                <option value="Ramesh Carpenter & Plumber (ID: S-12)">Ramesh Carpenter & Plumber (ID: S-12)</option>
                <option value="Manoj Electrician (ID: S-04)">Manoj Electrician (ID: S-04)</option>
                <option value="Suresh Housekeeping Lead (ID: S-09)">Suresh Housekeeping Lead (ID: S-09)</option>
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
export default AdminComplaints;

