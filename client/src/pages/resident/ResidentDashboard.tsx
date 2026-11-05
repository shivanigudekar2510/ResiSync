import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  UserCheck,
  CreditCard,
  Sparkles,
  LifeBuoy,
  AlertTriangle,
  Package,
  ShieldCheck,
  Zap,
  Droplets,
  Wifi,
  ChevronRight,
  Plus,
  Clock,
  ArrowUpRight,
  Building,
  QrCode,
  Receipt,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { QRPassModal } from '../../components/common/QRPassModal';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';
import { Visitor, MaintenanceBill, Complaint, Announcement } from '../../types';

export const ResidentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [upcomingVisitors, setUpcomingVisitors] = useState<Visitor[]>([]);
  const [maintenanceDue, setMaintenanceDue] = useState<{ amount: number; dueDate: string; billId?: string; billNumber?: string } | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activePass, setActivePass] = useState<Visitor | null>(null);
  const [deliveriesAtGate, setDeliveriesAtGate] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // Pay Modal & Receipt
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paidReceipt, setPaidReceipt] = useState<any | null>(null);

  const handlePayBill = async () => {
    if (!maintenanceDue?.billId) return;
    setIsProcessing(true);
    try {
      const res = await api.payBill(maintenanceDue.billId, {
        paymentMethod,
        mockSuccess: true,
      });

      if (res.success) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF8A00', '#10B981', '#3B82F6'],
        });

        showToast({
          type: 'success',
          title: 'Payment Successful',
          message: `₹${maintenanceDue.amount} settled successfully for Flat ${user?.flat?.flatNumber || 'A-402'}.`,
        });

        setPaidReceipt({
          billNumber: maintenanceDue.billNumber || 'BILL-2026-A402',
          totalAmount: maintenanceDue.amount,
          paidAt: new Date().toISOString(),
          paymentMethod,
          transactionId: res.bill?.transactionId || `TXN-${Date.now().toString().slice(-8).toUpperCase()}`,
        });

        setShowPayModal(false);
        setMaintenanceDue(null);
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Payment Failed', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [visRes, billsRes, annRes, compRes, delRes] = await Promise.all([
          api.getVisitors({ tab: 'today' }).catch(() => ({ visitors: [] })),
          api.getBills('PENDING').catch(() => ({ bills: [] })),
          api.getAnnouncements().catch(() => ({ announcements: [] })),
          api.getComplaints().catch(() => ({ complaints: [] })),
          api.getDeliveries('AT_GATE').catch(() => ({ deliveries: [] })),
        ]);

        setUpcomingVisitors((visRes.visitors || []).slice(0, 3));
        const pending = (billsRes.bills || [])[0];
        if (pending) {
          const rawAmount = Number(pending.totalAmount ?? pending.amount ?? 0);
          const rawDueDate = pending.dueDate ? new Date(pending.dueDate) : null;
          setMaintenanceDue({
            amount: rawAmount,
            dueDate: rawDueDate && !isNaN(rawDueDate.getTime())
              ? rawDueDate.toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Due this month',
            billId: pending.id,
            billNumber: pending.billNumber || `BILL-${pending.id?.slice(-4) || '2026'}`,
          });
        }
        setAnnouncements((annRes.announcements || []).slice(0, 2));
        setComplaints((compRes.complaints || []).slice(0, 3));
        setDeliveriesAtGate((delRes.deliveries || []).length);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const healthItems = [
    { label: 'Gate Security', status: 'Optimal', icon: ShieldCheck, color: 'text-status-success' },
    { label: 'Grid Power', status: 'Online (238V)', icon: Zap, color: 'text-primary' },
    { label: 'Water Supply', status: 'Tanks 78%', icon: Droplets, color: 'text-status-info' },
    { label: 'Fiber Net', status: 'Gigabit Active', icon: Wifi, color: 'text-status-success' },
  ];

  const quickActions = [
    { label: 'Invite Visitor', desc: 'Create 6-digit QR pass', path: '/resident/visitors', icon: UserCheck, color: 'bg-primary/10 text-primary border-primary/20' },
    { label: 'Pay Maintenance', desc: 'Dues & itemized bills', path: '/resident/maintenance', icon: CreditCard, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { label: 'Book Amenity', desc: 'Pool, gym, clubhouse', path: '/resident/amenities', icon: Sparkles, color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    { label: 'Helpdesk Ticket', desc: 'Plumbing, electrical', path: '/resident/helpdesk', icon: LifeBuoy, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { label: 'Gate Deliveries', desc: `${deliveriesAtGate} parcel waiting`, path: '/resident/visitors', icon: Package, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { label: 'Emergency SOS', desc: '24x7 gate security', path: '/resident/alerts', icon: AlertTriangle, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Resident Hero Card */}
      <div className="bg-gradient-to-r from-card via-[#121A22] to-card border border-border rounded-panel p-6 shadow-card relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {user?.society?.name || 'ResiSync Estate'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
              <span className="text-xs text-text-muted">
                {user?.society?.societyCode ? `Code: ${user.society.societyCode}` : 'Residential Community'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary mt-1 font-sans">
              Welcome home, {user?.name?.split(' ')[0] || 'Resident'} 👋
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Unit <span className="text-primary font-bold">{user?.flat?.flatNumber || 'Assigned Flat'}</span> • Verified Resident
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/resident/visitors')}
              className="px-4 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Invite Visitor</span>
            </button>
            <button
              onClick={() => navigate('/resident/society-status')}
              className="px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary hover:text-white text-xs font-medium transition flex items-center gap-1.5"
            >
              <span>IoT Grid</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Society Health Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/60">
          {healthItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-surface/80 rounded-xl p-3 border border-border/80 flex items-center gap-3"
              >
                <div className={`p-2 rounded-lg bg-card ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-text-muted">{item.label}</p>
                  <p className="text-xs font-semibold text-text-primary mt-0.5">{item.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Quick Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Quick Actions
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(action.path)}
                className="bg-card hover:bg-card-hover border border-border hover:border-primary/40 rounded-card p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group shadow-sm flex flex-col justify-between"
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${action.color} group-hover:scale-110 transition`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-text-primary group-hover:text-primary transition truncate">
                    {action.label}
                  </h4>
                  <p className="text-[10px] text-text-muted mt-0.5 truncate">{action.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Main Dashboard 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visitors & Maintenance (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Visitor Passes */}
          <div className="bg-card rounded-panel border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Today's Visitor Passes
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">Active gate entries for Flat {user?.flat?.flatNumber || 'A-402'}</p>
              </div>
              <button
                onClick={() => navigate('/resident/visitors')}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <span>View All Passes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingVisitors.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl">
                <UserCheck className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-xs text-text-secondary">No visitors scheduled for today.</p>
                <button
                  onClick={() => navigate('/resident/visitors')}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20"
                >
                  Generate Visitor Pass
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingVisitors.map((vis) => (
                  <div
                    key={vis.id}
                    className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between gap-3 hover:border-border-light transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center font-bold text-xs text-primary font-mono">
                        {(vis.passCode || 'VP').slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-xs text-text-primary">{vis.name}</h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-card text-text-muted border border-border">
                            {vis.visitorType}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expected: {vis.expectedAt || (vis as any).expectedArrival ? new Date(vis.expectedAt || (vis as any).expectedArrival).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                          {vis.purpose && ` • ${vis.purpose}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={vis.status} size="sm" />
                      <button
                        onClick={() => setActivePass(vis)}
                        className="px-2.5 py-1.5 rounded-lg bg-card border border-border text-xs text-primary font-medium hover:bg-card-hover transition"
                      >
                        QR Pass
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Maintenance Balance Overview Card */}
          <div className="bg-card rounded-panel border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Maintenance & Society Invoices
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">Itemized society assessment & utility dues</p>
              </div>
              <button
                onClick={() => navigate('/resident/maintenance')}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <span>Ledger History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {maintenanceDue ? (
              <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    Current Statement Dues
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-text-primary font-sans">
                      ₹{Number(maintenanceDue.amount || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-status-warning font-medium">
                      Due: {maintenanceDue.dueDate}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">
                    Includes Base Maintenance, Common Utilities, Water Charges & Sinking Fund.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={() => setShowPayModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Invoice Now</span>
                  </button>
                  <button
                    onClick={() => navigate('/resident/maintenance')}
                    className="px-3 py-2.5 rounded-xl bg-surface border border-border text-xs text-text-secondary hover:text-white font-medium"
                    title="View itemized ledger"
                  >
                    Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface border border-status-success/30 flex items-center gap-3 text-xs text-status-success">
                <ShieldCheck className="w-5 h-5" />
                <span>All maintenance accounts are currently cleared! No outstanding balances.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Society Announcements & Helpdesk (1 Col wide) */}
        <div className="space-y-6">
          {/* Recent Announcements */}
          <div className="bg-card rounded-panel border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Announcements
              </h3>
              <button
                onClick={() => navigate('/resident/alerts')}
                className="text-xs text-primary hover:underline font-semibold"
              >
                All Notices
              </button>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-xl bg-surface border border-border hover:border-primary/30 transition cursor-pointer"
                  onClick={() => navigate('/resident/alerts')}
                >
                  <div className="flex items-center justify-between text-[10px] text-text-muted mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-card text-primary font-bold">
                      {ann.category}
                    </span>
                    {ann.isPinned && <span className="text-primary font-medium">📌 Pinned</span>}
                  </div>
                  <h4 className="text-xs font-semibold text-text-primary leading-snug">
                    {ann.title}
                  </h4>
                  <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Helpdesk Requests */}
          <div className="bg-card rounded-panel border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Recent Helpdesk
              </h3>
              <button
                onClick={() => navigate('/resident/helpdesk')}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Track Tickets
              </button>
            </div>

            <div className="space-y-3">
              {complaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate('/resident/helpdesk')}
                  className="p-3 rounded-xl bg-surface border border-border cursor-pointer hover:border-border-light transition"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-primary font-semibold">{c.ticketNumber}</span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                  <h4 className="text-xs font-medium text-text-primary truncate">{c.subject}</h4>
                  <p className="text-[10px] text-text-muted mt-1 capitalize">
                    Category: {c.category.toLowerCase()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QR Pass Preview Modal */}
      <QRPassModal
        isOpen={!!activePass}
        onClose={() => setActivePass(null)}
        visitor={activePass}
      />

      {/* Pay Maintenance Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title="Settle Society Maintenance"
        subtitle={`Invoice for Unit ${user?.flat?.flatNumber || 'A-402'} • Greenview Residency`}
      >
        <div className="space-y-5">
          {/* Amount Due Banner */}
          <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase text-text-muted">Total Payable Amount</p>
              <h3 className="text-2xl font-black text-white font-sans mt-0.5">
                ₹{maintenanceDue?.amount.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-status-warning mt-0.5">Due: {maintenanceDue?.dueDate}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">
                ESCROW DIRECT
              </span>
              <p className="text-[11px] text-text-muted mt-1 font-mono">
                {maintenanceDue?.billNumber || 'BILL-2026-A402'}
              </p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
              Select Payment Gateway / Method
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['UPI', 'CARD', 'NETBANKING'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    paymentMethod === method
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border bg-card text-text-secondary hover:border-border-light'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs font-bold">{method}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Payment Details */}
          {paymentMethod === 'UPI' && (
            <div className="p-3.5 rounded-xl bg-card border border-border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Virtual Payment Address (VPA):</span>
                <span className="font-mono text-primary font-bold">society.greenview@icici</span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Supports Google Pay, PhonePe, Paytm, CRED & BHIM instant verification.
              </p>
            </div>
          )}

          {paymentMethod === 'CARD' && (
            <div className="p-3.5 rounded-xl bg-card border border-border text-xs space-y-2">
              <p className="text-text-secondary">
                Direct RuPay, Visa & MasterCard society payment gateway active (Zero transaction surcharge).
              </p>
            </div>
          )}

          {paymentMethod === 'NETBANKING' && (
            <div className="p-3.5 rounded-xl bg-card border border-border text-xs space-y-2">
              <p className="text-text-secondary">
                Direct NEFT/RTGS settlement via HDFC, ICICI, SBI & Axis Bank.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setShowPayModal(false)}
              className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePayBill}
              className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  <span>Processing Gateway...</span>
                </>
              ) : (
                `Authorize Payment (₹${maintenanceDue?.amount})`
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Official Receipt Modal */}
      <Modal
        isOpen={!!paidReceipt}
        onClose={() => setPaidReceipt(null)}
        title="Official Maintenance Receipt"
        subtitle="RESISYNC Certified Society Payment Acknowledgment"
        maxWidth="lg"
      >
        {paidReceipt && (
          <div className="p-6 bg-card rounded-2xl border border-border space-y-5">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <h4 className="text-base font-extrabold text-white tracking-tight">
                  GREENVIEW RESIDENCY APARTMENT OWNERS ASSOC.
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  Reg No: BLR-EST/4912/2022 • Bellandur, Bengaluru 560103
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-full bg-status-success/15 text-status-success border border-status-success/30 font-bold text-xs">
                  PAID IN FULL
                </span>
                <p className="text-[11px] text-text-muted mt-1 font-mono">{paidReceipt.billNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-text-muted">Billed To:</p>
                <p className="font-bold text-text-primary text-sm mt-0.5">{user?.name || 'Rahul Sharma'}</p>
                <p className="text-text-secondary">Flat Unit {user?.flat?.flatNumber || 'A-402'}</p>
              </div>
              <div className="text-right">
                <p className="text-text-muted">Payment Date & Txn:</p>
                <p className="font-semibold text-text-primary mt-0.5">
                  {new Date(paidReceipt.paidAt).toLocaleDateString('en-IN')}
                </p>
                <p className="font-mono text-primary text-[11px]">{paidReceipt.transactionId}</p>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-xl border border-border flex items-center justify-between text-xs">
              <span className="font-semibold text-text-primary">Total Amount Settled</span>
              <span className="font-mono font-bold text-base text-primary">₹{paidReceipt.totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-text-muted">
                System-generated digitally signed receipt. Valid without physical stamp.
              </span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-surface border border-border text-text-primary hover:text-primary text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Print / Save
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

