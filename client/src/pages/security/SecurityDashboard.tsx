import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  QrCode,
  UserCheck,
  Package,
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  Plus,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';
import { Visitor, Delivery } from '../../types';

export const SecurityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [verifiedVisitor, setVerifiedVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick Action Modals
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [delCompany, setDelCompany] = useState('Amazon');
  const [delFlat, setDelFlat] = useState('');
  const [delTracking, setDelTracking] = useState('');

  const [showRegisterVisitorModal, setShowRegisterVisitorModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regFlat, setRegFlat] = useState('');
  const [regType, setRegType] = useState('GUEST');

  const fetchGuardData = async () => {
    setLoading(true);
    try {
      const [visRes, delRes] = await Promise.all([
        api.getVisitors({ tab: 'today' }).catch(() => ({ visitors: [] })),
        api.getDeliveries('AT_GATE').catch(() => ({ deliveries: [] })),
      ]);

      setVisitors(visRes.visitors || []);
      setDeliveries(delRes.deliveries || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuardData();
  }, []);

  const handleVerifyCode = async (codeToVerify?: string) => {
    const code = codeToVerify || searchCode;
    if (!code.trim()) return;
    try {
      const res = await api.verifyPass(code.trim());
      if (res.success && res.visitor) {
        setVerifiedVisitor(res.visitor);
        setSearchCode('');
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Pass Verification Failed', message: err.message });
    }
  };

  const handleCheckIn = async (visitorId: string) => {
    try {
      const res = await api.checkInVisitor(visitorId);
      if (res.success) {
        showToast({ type: 'success', title: 'Checked In', message: res.message });
        setVerifiedVisitor(null);
        fetchGuardData();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Check-In Error', message: err.message });
    }
  };

  const handleCheckOut = async (visitorId: string) => {
    try {
      const res = await api.checkOutVisitor(visitorId);
      if (res.success) {
        showToast({ type: 'info', title: 'Checked Out', message: res.message });
        fetchGuardData();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createDelivery({
        flatNumber: delFlat,
        company: delCompany,
        trackingNumber: delTracking,
      });
      if (res.success) {
        showToast({ type: 'success', title: 'Delivery Logged', message: res.message });
        setShowDeliveryModal(false);
        setDelFlat('');
        setDelTracking('');
        fetchGuardData();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed to log delivery', message: err.message });
    }
  };

  const handleRegisterVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.inviteVisitor({
        name: regName,
        phone: regPhone,
        visitorType: regType,
        expectedAt: new Date().toISOString(),
        purpose: 'Gate Walk-In Registration',
      });
      if (res.success) {
        showToast({ type: 'success', title: 'Pass Created', message: 'Walk-in visitor registered' });
        setShowRegisterVisitorModal(false);
        setRegName('');
        setRegPhone('');
        fetchGuardData();
        // Automatically open check-in
        handleCheckIn(res.visitor.id);
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Registration Failed', message: err.message });
    }
  };

  const expectedCount = visitors.filter((v) => v.status === 'EXPECTED' || v.status === 'APPROVED').length;
  const insideCount = visitors.filter((v) => v.status === 'CHECKED_IN').length;

  return (
    <div className="space-y-6">
      {/* Guard Gate Header */}
      <div className="bg-gradient-to-r from-card via-[#131E27] to-card border border-border rounded-panel p-6 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-status-success live-pulse" />
            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest font-mono">
              Gate 1 Ops Post • Vikram Singh
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 font-sans">
            Gate Security Control Hub
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Greenview Residency Main Barrier • Live Camera & Pass Validation
          </p>
        </div>

        {/* Quick Action Buttons for Fast Gate Processing */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/security/scan')}
            className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-primary text-background font-black text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center justify-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            <span>SCAN QR PASS</span>
          </button>
          <button
            onClick={() => setShowRegisterVisitorModal(true)}
            className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-surface border border-border text-text-primary hover:border-primary/50 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Walk-In Guest</span>
          </button>
        </div>
      </div>

      {/* Passcode Quick Search Input */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3 shadow-sm">
        <Search className="w-5 h-5 text-primary" />
        <input
          type="text"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
          placeholder="Enter 6-digit visitor pass code or scan QR string..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted font-mono"
        />
        <button
          onClick={() => handleVerifyCode()}
          className="px-4 py-2 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover transition"
        >
          Verify Pass
        </button>
      </div>

      {/* KPI Counters (Screen 11 Inspired) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs font-semibold text-text-muted uppercase">Expected Today</p>
          <h3 className="text-3xl font-black text-text-primary mt-1 font-mono">{expectedCount}</h3>
          <p className="text-[11px] text-text-secondary mt-0.5">Approved gate passes</p>
        </div>
        <div className="bg-card rounded-2xl border border-primary/40 p-4 shadow-orange-glow">
          <p className="text-xs font-semibold text-primary uppercase">Currently Inside</p>
          <h3 className="text-3xl font-black text-primary mt-1 font-mono">{insideCount}</h3>
          <p className="text-[11px] text-text-secondary mt-0.5">Checked in at gate</p>
        </div>
        <div
          onClick={() => setShowDeliveryModal(true)}
          className="bg-card hover:bg-card-hover rounded-2xl border border-border p-4 cursor-pointer transition"
        >
          <p className="text-xs font-semibold text-text-muted uppercase flex items-center justify-between">
            <span>Parcels at Gate</span>
            <span className="text-[10px] text-primary font-bold">+ Log</span>
          </p>
          <h3 className="text-3xl font-black text-text-primary mt-1 font-mono">{deliveries.length}</h3>
          <p className="text-[11px] text-text-secondary mt-0.5">Awaiting resident pickup</p>
        </div>
        <div
          onClick={() => navigate('/security/emergency')}
          className="bg-card hover:bg-red-950/20 rounded-2xl border border-status-danger/40 p-4 cursor-pointer transition"
        >
          <p className="text-xs font-semibold text-status-danger uppercase flex items-center justify-between">
            <span>Panic Station</span>
            <AlertTriangle className="w-4 h-4 text-status-danger" />
          </p>
          <h3 className="text-xl font-black text-status-danger mt-2 font-mono">0 ACTIVE</h3>
          <p className="text-[11px] text-text-muted mt-0.5">24x7 SOS Armed</p>
        </div>
      </div>

      {/* Gate Stream: Today's Visitors Table */}
      <div className="bg-card rounded-panel border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Gate Access Stream
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">Live pass validation & gate clearances</p>
          </div>
          <button
            onClick={() => navigate('/security/visitors')}
            className="text-xs text-primary hover:underline font-semibold"
          >
            Full Visitor Directory
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th className="py-2.5 px-3">Pass Code</th>
                <th className="py-2.5 px-3">Visitor Name</th>
                <th className="py-2.5 px-3">Destination Unit</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Expected Time</th>
                <th className="py-2.5 px-3 text-right">Gate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {visitors.map((v) => (
                <tr key={v.id} className="hover:bg-surface/50 transition">
                  <td className="py-3.5 px-3 font-mono font-bold text-primary">{v.passCode}</td>
                  <td className="py-3.5 px-3 font-semibold text-text-primary">
                    {v.name}
                    <span className="block text-[10px] text-text-muted font-normal">{v.phone}</span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-text-primary">
                    Flat {v.flat?.flatNumber}
                  </td>
                  <td className="py-3.5 px-3 text-text-secondary">{v.visitorType}</td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={v.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-3 text-text-muted">
                    {new Date(v.expectedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {v.status === 'EXPECTED' || v.status === 'APPROVED' ? (
                      <button
                        onClick={() => handleCheckIn(v.id)}
                        className="px-3 py-1.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-sm transition"
                      >
                        Check In
                      </button>
                    ) : v.status === 'CHECKED_IN' ? (
                      <button
                        onClick={() => handleCheckOut(v.id)}
                        className="px-3 py-1.5 rounded-xl bg-surface border border-border text-text-secondary hover:text-white font-semibold text-xs hover:bg-card transition"
                      >
                        Check Out
                      </button>
                    ) : (
                      <span className="text-text-muted text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verified Pass Popup Modal */}
      <Modal
        isOpen={!!verifiedVisitor}
        onClose={() => setVerifiedVisitor(null)}
        title="Visitor Pass Verification"
        subtitle="Confirm visitor identity and grant gate access"
      >
        {verifiedVisitor && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-card border border-primary/40 text-center shadow-orange-glow">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                Pass Code #{verifiedVisitor.passCode}
              </span>
              <h3 className="text-xl font-black text-white mt-1">{verifiedVisitor.name}</h3>
              <p className="text-xs text-primary font-semibold mt-0.5">{verifiedVisitor.visitorType} Access</p>
              <div className="mt-2 inline-block">
                <StatusBadge status={verifiedVisitor.status} size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-3.5 rounded-xl bg-surface border border-border">
              <div>
                <p className="text-text-muted">Destination:</p>
                <p className="font-bold text-text-primary text-sm mt-0.5">Flat {verifiedVisitor.flat?.flatNumber}</p>
              </div>
              <div>
                <p className="text-text-muted">Invited By:</p>
                <p className="font-bold text-text-primary text-sm mt-0.5">{verifiedVisitor.invitedBy?.name || 'Resident'}</p>
              </div>
              <div>
                <p className="text-text-muted">Vehicle Plate:</p>
                <p className="font-mono text-text-primary mt-0.5">{verifiedVisitor.vehicleNumber || 'No vehicle'}</p>
              </div>
              <div>
                <p className="text-text-muted">Expected At:</p>
                <p className="text-text-primary mt-0.5">
                  {new Date(verifiedVisitor.expectedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setVerifiedVisitor(null)}
                className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
              >
                Close
              </button>
              {verifiedVisitor.status === 'EXPECTED' || verifiedVisitor.status === 'APPROVED' ? (
                <button
                  onClick={() => handleCheckIn(verifiedVisitor.id)}
                  className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
                >
                  GRANT ENTRY & CHECK IN
                </button>
              ) : verifiedVisitor.status === 'CHECKED_IN' ? (
                <button
                  onClick={() => handleCheckOut(verifiedVisitor.id)}
                  className="px-5 py-2.5 rounded-xl bg-surface border border-border text-text-primary font-bold text-xs hover:bg-card transition"
                >
                  RECORD EXIT & CHECK OUT
                </button>
              ) : null}
            </div>
          </div>
        )}
      </Modal>

      {/* Parcel Delivery Modal */}
      <Modal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        title="Log Gate Parcel Delivery"
        subtitle="Notifies the resident instantly on arrival"
      >
        <form onSubmit={handleDeliverySubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Company / Service</label>
              <select
                value={delCompany}
                onChange={(e) => setDelCompany(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="Amazon">Amazon</option>
                <option value="Flipkart">Flipkart</option>
                <option value="Swiggy">Swiggy Food</option>
                <option value="Zomato">Zomato</option>
                <option value="BlueDart">BlueDart Courier</option>
                <option value="Blinkit">Blinkit / Zepto</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Target Flat Number</label>
              <input
                type="text"
                required
                value={delFlat}
                onChange={(e) => setDelFlat(e.target.value.toUpperCase())}
                placeholder="e.g. A-402"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary uppercase focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Tracking ID / Note (Optional)</label>
            <input
              type="text"
              value={delTracking}
              onChange={(e) => setDelTracking(e.target.value)}
              placeholder="e.g. AMZ-992140"
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowDeliveryModal(false)}
              className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
            >
              Record Delivery
            </button>
          </div>
        </form>
      </Modal>

      {/* Walk-in Visitor Modal */}
      <Modal
        isOpen={showRegisterVisitorModal}
        onClose={() => setShowRegisterVisitorModal(false)}
        title="Register Walk-In Visitor at Gate"
        subtitle="For guests arriving without prior digital pass"
      >
        <form onSubmit={handleRegisterVisitorSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Visitor Full Name</label>
            <input
              type="text"
              required
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="e.g. Suresh Gowda"
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Mobile Phone</label>
              <input
                type="tel"
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Destination Flat</label>
              <input
                type="text"
                required
                value={regFlat}
                onChange={(e) => setRegFlat(e.target.value.toUpperCase())}
                placeholder="A-402"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary uppercase focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowRegisterVisitorModal(false)}
              className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
            >
              Verify & Check In
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

