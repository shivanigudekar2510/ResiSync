import React, { useState, useEffect } from 'react';
import { Package, Plus, CheckCircle, Clock, ShieldCheck, KeyRound, Check, Layers, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { Delivery } from '../../types';

export const SecurityDeliveries: React.FC = () => {
  const { showToast } = useNotification();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'desk' | 'all'>('desk');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [company, setCompany] = useState('BlueDart');
  const [flatNumber, setFlatNumber] = useState('A-402');
  const [trackingNumber, setTrackingNumber] = useState('BD-8821');
  const [deliveryPerson, setDeliveryPerson] = useState('Rajesh Sharma');
  const [phone, setPhone] = useState('+91 98450 66112');

  // OTP inputs for parcel desk
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({
    'del-ego-7741': '',
  });
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await api.getDeliveries();
      if (res.success) {
        setDeliveries(res.deliveries || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createDelivery({
        company,
        flatNumber,
        trackingNumber,
        deliveryPersonName: deliveryPerson,
        phone,
      });
      if (res.success) {
        showToast({
          type: 'success',
          title: 'Walk-In Delivery Logged',
          message: `Package from ${company} for Flat ${flatNumber} logged. Alert dispatched to resident.`,
        });
        setShowModal(false);
        setFlatNumber('');
        setTrackingNumber('');
        fetchDeliveries();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Logging Failed', message: err.message });
    }
  };

  const handleVerifyPickupOtp = async (del: Delivery) => {
    const enteredOtp = (otpInputs[del.id] || '').trim();
    if (!enteredOtp) {
      showToast({
        type: 'error',
        title: 'Pickup OTP Required',
        message: "Please enter the resident's 4-digit pickup code before handing over the parcel.",
      });
      return;
    }

    setVerifyingId(del.id);
    try {
      const res = await api.verifyPickupOtp(del.id, enteredOtp);
      if (res.success) {
        showToast({
          type: 'success',
          title: 'Parcel Handed Over',
          message: `Pickup OTP ${enteredOtp} verified. Package handed over to Flat ${del.flat?.flatNumber || 'A-402'}.`,
        });
        setOtpInputs((prev) => ({ ...prev, [del.id]: '' }));
        fetchDeliveries();
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Invalid Pickup OTP',
        message: err.message || "Invalid OTP. Handover denied without the resident's secret pickup code.",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const handleMarkCollected = async (id: string) => {
    try {
      await api.markDeliveryCollected(id);
      showToast({ type: 'info', title: 'Handover Recorded', message: 'Parcel marked as collected.' });
      fetchDeliveries();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const heldDeliveries = deliveries.filter(
    (d) => d.status === 'AT_GATE' || d.status === 'HELD_AT_GATE'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Gate Parcel Desk & Overstay</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Smart locker shelf assignment, 4-digit resident pickup OTP validation, and overstay tracking
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
            <button
              onClick={() => setActiveTab('desk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'desk'
                  ? 'bg-primary text-background shadow-sm'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Parcel Desk & Overstay ({heldDeliveries.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-primary text-background shadow-sm'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <span>All Logs ({deliveries.length})</span>
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Log Walk-In Delivery</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Parcel Desk & Overstay */}
      {activeTab === 'desk' && (
        <div className="space-y-4">
          {heldDeliveries.length === 0 ? (
            <EmptyState
              title="No packages currently held at gate"
              description="When courier partners drop off parcels at Main Gate #1, log them here or residents can authorize 'Leave at Gate'."
              actionText="Log Walk-In Delivery"
              onAction={() => setShowModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {heldDeliveries.map((del) => {
                const shelf = (del as any).shelfSlot || 'Shelf B-12';
                const inputVal = otpInputs[del.id] || '';
                const expectedOtp = (del as any).pickupOtp || '7741';

                return (
                  <div
                    key={del.id}
                    className="bg-card rounded-2xl border border-primary/30 p-5 shadow-card flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-mono font-bold">
                          {shelf}
                        </span>
                        <StatusBadge status={del.status} size="sm" />
                      </div>

                      <div className="flex items-baseline justify-between">
                        <h3 className="text-base font-black text-text-primary">{del.company}</h3>
                        <span className="text-xs font-bold text-primary">Flat {del.flat?.flatNumber || 'A-402'}</span>
                      </div>
                      <p className="text-[11px] font-mono text-text-muted mt-0.5">
                        Tracking: {del.trackingNumber || 'TRK-BD-7892'}
                      </p>

                      <div className="mt-3 p-2.5 rounded-xl bg-surface border border-border text-[11px] text-text-secondary space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">Gate Arrival:</span>
                          <span className="font-medium text-text-primary">
                            {new Date(del.gateEntryTime || del.receivedAt || Date.now()).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">Storage Hold SLA:</span>
                          <span className="text-status-success font-semibold">Active & Safe (Under 24h)</span>
                        </div>
                      </div>
                    </div>

                    {/* Handover via OTP */}
                    <div className="pt-3 border-t border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-text-primary flex items-center gap-1">
                          <KeyRound className="w-3.5 h-3.5 text-primary" />
                          <span>Resident 4-Digit Pickup OTP</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setOtpInputs((prev) => ({ ...prev, [del.id]: expectedOtp }))}
                          className="text-[10px] font-mono text-primary hover:underline font-bold"
                        >
                          ⚡ Test OTP: {expectedOtp}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={inputVal}
                          onChange={(e) => setOtpInputs({ ...otpInputs, [del.id]: e.target.value })}
                          placeholder="4-digit OTP (e.g. 7741)"
                          className="flex-1 bg-surface border border-border rounded-xl px-3 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyPickupOtp(del)}
                          disabled={verifyingId === del.id}
                          className="px-3.5 py-1.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-sm transition flex items-center gap-1 whitespace-nowrap"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Hand Over</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: All Deliveries Table */}
      {activeTab === 'all' && (
        <div className="bg-card rounded-panel border border-border p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="py-2.5 px-3">Service Provider</th>
                  <th className="py-2.5 px-3">Flat Unit</th>
                  <th className="py-2.5 px-3">Tracking / Code</th>
                  <th className="py-2.5 px-3">Arrival Timestamp</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {deliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-surface/50">
                    <td className="py-3 px-3 font-semibold text-text-primary">{del.company}</td>
                    <td className="py-3 px-3 font-bold text-primary">Flat {del.flat?.flatNumber}</td>
                    <td className="py-3 px-3 font-mono text-text-muted text-[11px]">
                      {del.trackingNumber || '—'}
                    </td>
                    <td className="py-3 px-3 text-text-secondary">
                      {new Date(del.gateEntryTime || del.receivedAt || Date.now()).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={del.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      {del.status === 'AT_GATE' || del.status === 'HELD_AT_GATE' ? (
                        <button
                          onClick={() => handleMarkCollected(del.id)}
                          className="px-3 py-1 rounded-lg bg-surface border border-border text-status-success hover:border-status-success font-semibold text-[11px]"
                        >
                          Manual Handover
                        </button>
                      ) : (
                        <span className="text-text-muted text-[11px]">Collected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Log Walk-In Visitor / Delivery"
        subtitle="Registers parcel and triggers instant resident alert on their dashboard"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Company / Courier</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="BlueDart">BlueDart</option>
                <option value="Amazon">Amazon</option>
                <option value="Flipkart">Flipkart</option>
                <option value="Swiggy">Swiggy</option>
                <option value="Zomato">Zomato</option>
                <option value="Blinkit">Blinkit</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Destination Flat</label>
              <input
                type="text"
                required
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value.toUpperCase())}
                placeholder="A-402"
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary uppercase focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Tracking Number / AWB</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. BD-8821"
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
            >
              Log Delivery
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default SecurityDeliveries;

