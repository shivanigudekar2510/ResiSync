import React, { useState, useEffect } from 'react';
import { Package, Plus, CheckCircle, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import api from '../../services/api';
import { Delivery } from '../../types';

export const SecurityDeliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [company, setCompany] = useState('Amazon');
  const [flatNumber, setFlatNumber] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [deliveryPerson, setDeliveryPerson] = useState('');
  const [phone, setPhone] = useState('');

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
        setShowModal(false);
        setFlatNumber('');
        setTrackingNumber('');
        fetchDeliveries();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMarkCollected = async (id: string) => {
    try {
      await api.markDeliveryCollected(id);
      fetchDeliveries();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Gate Deliveries & Parcels</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Log incoming parcels from Amazon, Swiggy, Flipkart, and notify flats immediately
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Incoming Package</span>
        </button>
      </div>

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
                    {new Date(del.gateEntryTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={del.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    {del.status === 'AT_GATE' ? (
                      <button
                        onClick={() => handleMarkCollected(del.id)}
                        className="px-3 py-1 rounded-lg bg-surface border border-border text-status-success hover:border-status-success font-semibold text-[11px]"
                      >
                        Mark Handed Over
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

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Log Gate Delivery"
        subtitle="Registers parcel and triggers instant resident alert"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Company</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="Amazon">Amazon</option>
                <option value="Flipkart">Flipkart</option>
                <option value="Swiggy">Swiggy</option>
                <option value="Zomato">Zomato</option>
                <option value="BlueDart">BlueDart</option>
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
            <label className="block text-xs font-medium text-text-secondary mb-1">Tracking Number</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. AMZ-8921"
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
              Save Delivery
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

