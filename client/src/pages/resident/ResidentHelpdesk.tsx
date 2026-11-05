import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  LifeBuoy,
  Plus,
  Search,
  MessageSquare,
  Clock,
  User,
  Send,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import api from '../../services/api';
import { Complaint, ComplaintCategory, ComplaintPriority } from '../../types';

export const ResidentHelpdesk: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Complaint | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    category: 'PLUMBING' as ComplaintCategory,
    subject: '',
    description: '',
    priority: 'MEDIUM' as ComplaintPriority,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints({ status: filterStatus });
      if (res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filterStatus]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.createComplaint(formData);
      if (res.success) {
        showToast({
          type: 'success',
          title: 'Ticket Lodged',
          message: `Ticket ${res.complaint.ticketNumber} created successfully`,
        });
        setShowCreateModal(false);
        setFormData({
          category: 'PLUMBING',
          subject: '',
          description: '',
          priority: 'MEDIUM',
        });
        fetchComplaints();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Submission Error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !newComment.trim()) return;
    setIsSendingComment(true);
    try {
      const res = await api.addComplaintComment(activeTicket.id, newComment);
      if (res.success) {
        setActiveTicket({
          ...activeTicket,
          comments: [...(activeTicket.comments || []), res.comment],
        });
        setNewComment('');
        fetchComplaints();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsSendingComment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Helpdesk & OTP Service</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Lodge maintenance tickets, track assigned technicians, and release 4-digit closure OTP upon verification
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Service Request</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border w-fit overflow-x-auto max-w-full">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
              filterStatus === st
                ? 'bg-primary text-background shadow-sm'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-card/60 rounded-2xl border border-border animate-pulse" />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No service requests found"
          description="Have an electrical issue, plumbing repair, or society maintenance request? Lodge a ticket to dispatch authorized staff."
          actionText="Create Ticket"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveTicket(c)}
              className="bg-card hover:bg-card-hover border border-border hover:border-primary/40 rounded-2xl p-5 cursor-pointer transition-all duration-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">{c.ticketNumber}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-text-secondary border border-border font-medium uppercase">
                    {c.category}
                  </span>
                  <StatusBadge status={c.status} size="sm" />
                </div>
                <h4 className="text-sm font-semibold text-text-primary group-hover:text-primary transition">
                  {c.subject}
                </h4>
                <p className="text-xs text-text-secondary line-clamp-1">{c.description}</p>
                <div className="flex items-center gap-4 text-[11px] text-text-muted pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" /> {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {c.assignedStaffName && (
                    <span className="text-text-secondary font-medium">
                      Assigned: <span className="text-text-primary">{c.assignedStaffName}</span>
                    </span>
                  )}
                  {c.comments && c.comments.length > 0 && (
                    <span className="flex items-center gap-1 text-primary">
                      <MessageSquare className="w-3 h-3" /> {c.comments.length}
                    </span>
                  )}
                </div>

                {c.closureOtp && c.status !== 'RESOLVED' && (
                  <div className="mt-2 p-2 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-between gap-2 max-w-md">
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                        4-Digit Closure OTP (TKT-{c.ticketNumber.replace(/[^0-9]/g, '') || '801'})
                      </span>
                      <span className="text-sm font-mono font-black text-text-primary">{c.closureOtp}</span>
                    </div>
                    <span className="text-[10px] text-text-muted text-right">
                      Share with technician Suresh Babu ONLY after work verification
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-xs text-primary font-medium group-hover:underline">
                  View Timeline & Discussion
                </span>
                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Lodge Maintenance Ticket"
        subtitle="Our facility manager will review and dispatch maintenance personnel"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Service Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ComplaintCategory })}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="PLUMBING">Plumbing & Water</option>
                <option value="ELECTRICAL">Electrical & Lighting</option>
                <option value="CLEANING">Housekeeping & Sanitization</option>
                <option value="SECURITY">Security & Access</option>
                <option value="MAINTENANCE">General Society Maintenance</option>
                <option value="OTHER">Other Query</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Urgency Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as ComplaintPriority })}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="LOW">Low (Routine maintenance)</option>
                <option value="MEDIUM">Medium (Normal priority)</option>
                <option value="HIGH">High (Impacts daily routine)</option>
                <option value="EMERGENCY">Emergency (Leakage / Fire hazard)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Subject / Summary</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Master bathroom tap water pressure low"
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Detailed Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide exact details, timing, and room location..."
              className="w-full bg-card border border-border rounded-xl p-3 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Ticket Details & Timeline Discussion Modal */}
      <Modal
        isOpen={!!activeTicket}
        onClose={() => setActiveTicket(null)}
        title={`Ticket ${activeTicket?.ticketNumber}`}
        subtitle={`Category: ${activeTicket?.category} • Lodged: ${activeTicket ? new Date(activeTicket.createdAt).toLocaleDateString('en-IN') : ''}`}
        maxWidth="lg"
      >
        {activeTicket && (
          <div className="space-y-5">
            {/* Ticket Header & Status */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">{activeTicket.subject}</h4>
                <StatusBadge status={activeTicket.status} size="sm" />
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{activeTicket.description}</p>
              {activeTicket.assignedStaffName && (
                <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-xs text-text-muted">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Assigned Staff: <strong className="text-text-primary">{activeTicket.assignedStaffName}</strong></span>
                </div>
              )}
              {activeTicket.resolutionNotes && (
                <div className="p-3 rounded-lg bg-status-success/10 border border-status-success/30 text-xs text-status-success">
                  <strong>Resolution Notes:</strong> {activeTicket.resolutionNotes}
                </div>
              )}
            </div>

            {/* Comments Timeline */}
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                Discussion & Updates Timeline
              </p>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {(activeTicket.comments || []).length === 0 ? (
                  <p className="text-xs text-text-muted italic">No comments yet. Add an update below.</p>
                ) : (
                  activeTicket.comments?.map((cm) => (
                    <div
                      key={cm.id}
                      className={`p-3 rounded-xl border text-xs ${
                        cm.authorRole === 'ADMIN'
                          ? 'bg-primary/10 border-primary/30 text-text-primary ml-4'
                          : 'bg-surface border-border text-text-secondary mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-text-primary text-[11px]">
                          {cm.authorName} ({cm.authorRole})
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {new Date(cm.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">{cm.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleSendComment} className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type an update or question for management..."
                  className="flex-1 bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSendingComment}
                  className="px-4 py-2 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

