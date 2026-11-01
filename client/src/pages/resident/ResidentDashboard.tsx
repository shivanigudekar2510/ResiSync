import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { QRPassModal } from '../../components/common/QRPassModal';
import api from '../../services/api';
import { Visitor, MaintenanceBill, Complaint, Announcement } from '../../types';

export const ResidentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [upcomingVisitors, setUpcomingVisitors] = useState<Visitor[]>([]);
  const [maintenanceDue, setMaintenanceDue] = useState<{ amount: number; dueDate: string; billId?: string } | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activePass, setActivePass] = useState<Visitor | null>(null);
  const [deliveriesAtGate, setDeliveriesAtGate] = useState<number>(1);
  const [loading, setLoading] = useState(true);

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
          setMaintenanceDue({
            amount: pending.totalAmount,
            dueDate: new Date(pending.dueDate).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            billId: pending.id,
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
                Greenview Residency
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
              <span className="text-xs text-text-muted">Tower A • Aster</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-sans">
              Welcome home, {user?.name?.split(' ')[0] || 'Rahul'} 👋
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Unit <span className="text-primary font-bold">{user?.flat?.flatNumber || 'A-402'}</span> • Verified Resident Owner
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
                        {vis.passCode.slice(0, 3)}
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
                          Expected: {new Date(vis.expectedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
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
                    <span className="text-2xl font-black text-white font-sans">
                      ₹{maintenanceDue.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-status-warning font-medium">
                      Due: {maintenanceDue.dueDate}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">
                    Includes Base Maintenance, Treated Water, Parking P-402 & Sinking Fund.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/resident/maintenance')}
                  className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition self-start sm:self-center"
                >
                  Pay Invoice Now
                </button>
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
    </div>
  );
};

