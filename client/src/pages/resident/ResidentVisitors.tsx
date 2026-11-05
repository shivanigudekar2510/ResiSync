import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  UserCheck,
  Plus,
  Search,
  QrCode,
  Clock,
  Car,
  XCircle,
  Copy,
  Check,
  Calendar,
  Share2,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { QRPassModal } from '../../components/common/QRPassModal';
import { EmptyState } from '../../components/common/EmptyState';
import api from '../../services/api';
import { Visitor, VisitorType } from '../../types';

export const ResidentVisitors: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'history'>('today');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState<Visitor | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    visitorType: 'GUEST' as VisitorType,
    vehicleNumber: '',
    expectedAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
    purpose: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await api.getVisitors({ tab: activeTab, search });
      if (res.success) {
        setVisitors(res.visitors || []);
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [activeTab, search]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.inviteVisitor(formData);
      if (res.success) {
        showToast({
          type: 'success',
          title: 'Pass Created',
          message: `Gate pass generated for ${res.visitor.name}`,
        });
        setShowInviteModal(false);
        setSelectedPass(res.visitor);
        fetchVisitors();
        // Reset form
        setFormData({
          name: '',
          phone: '',
          visitorType: 'GUEST',
          vehicleNumber: '',
          expectedAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
          purpose: '',
          notes: '',
        });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Invite Failed', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvite = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this visitor pass?')) return;
    try {
      await api.updateVisitorStatus(id, 'CANCELLED');
      showToast({ type: 'info', title: 'Pass Cancelled', message: 'Visitor pass has been revoked.' });
      fetchVisitors();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Visitor Management</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Issue expiring QR passes, manage guest access, and view gate security check-ins
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Pre-Approve Guest</span>
        </button>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-2 rounded-2xl border border-border">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border">
          {(['today', 'upcoming', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                activeTab === tab
                  ? 'bg-primary text-background shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search visitor, phone, code..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Visitors List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-card/60 rounded-2xl border border-border animate-pulse" />
          ))}
        </div>
      ) : visitors.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} visitor passes`}
          description="Create a digital visitor pass with an expiring QR code to grant effortless gate access to your guests or service personnel."
          actionText="Generate Gate Pass"
          onAction={() => setShowInviteModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visitors.map((vis) => {
            const expDate = new Date(vis.expectedAt);
            const timeStr = expDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            const dateStr = expDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

            return (
              <div
                key={vis.id}
                className="bg-card hover:bg-card-hover border border-border hover:border-primary/40 rounded-2xl p-5 transition-all duration-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-text-primary">{vis.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-text-secondary border border-border font-medium">
                          {vis.visitorType}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">{vis.phone}</p>
                    </div>

                    <StatusBadge status={vis.status} size="sm" />
                  </div>

                  {/* Passcode & Details row */}
                  <div className="mt-4 p-3 rounded-xl bg-surface border border-border flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-text-muted uppercase font-mono">Gate Pass Code</p>
                      <p className="text-lg font-black text-primary font-mono tracking-widest mt-0.5">
                        {vis.passCode}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-text-muted flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3 text-primary" /> {dateStr}, {timeStr}
                      </p>
                      {vis.vehicleNumber && (
                        <p className="text-text-secondary flex items-center justify-end gap-1 mt-0.5">
                          <Car className="w-3 h-3" /> {vis.vehicleNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {vis.purpose && (
                    <p className="text-xs text-text-secondary mt-3">
                      <span className="text-text-muted">Purpose:</span> {vis.purpose}
                    </p>
                  )}
                  {vis.checkInTime && (
                    <p className="text-[11px] text-status-success mt-1">
                      ✓ Checked in at {new Date(vis.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedPass(vis)}
                    className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View QR Pass</span>
                  </button>

                  {vis.status === 'EXPECTED' || vis.status === 'APPROVED' ? (
                    <button
                      onClick={() => handleCancelInvite(vis.id)}
                      className="text-xs text-text-muted hover:text-status-danger font-medium flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Revoke Pass</span>
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Visitor Pass Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Create Digital Visitor Pass"
        subtitle="Generate an instant 6-digit code & secure QR pass for gate clearance"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Visitor Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ramesh Kulkarni"
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Mobile Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Visitor Category</label>
              <select
                value={formData.visitorType}
                onChange={(e) => setFormData({ ...formData, visitorType: e.target.value as VisitorType })}
                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="GUEST">Guest / Family</option>
                <option value="DELIVERY">Delivery Courier</option>
                <option value="CAB">Cab / Taxi Driver</option>
                <option value="SERVICE">Service Technician</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Expected Arrival Time</label>
              <input
                type="datetime-local"
                required
                value={formData.expectedAt}
                onChange={(e) => setFormData({ ...formData, expectedAt: e.target.value })}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Vehicle No. (Optional)</label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                placeholder="KA 01 MJ 1234"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary uppercase focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Visit Purpose / Notes</label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g. Birthday Dinner, AC repair inspection..."
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
            >
              {isSubmitting ? 'Generating...' : 'Issue Gate Pass'}
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Pass Display Modal */}
      <QRPassModal
        isOpen={!!selectedPass}
        onClose={() => setSelectedPass(null)}
        visitor={selectedPass}
      />
    </div>
  );
};

