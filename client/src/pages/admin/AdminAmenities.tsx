import React, { useState, useEffect } from 'react';
import { Sparkles, Settings, Clock, Users, Edit3 } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';
import { Amenity } from '../../types';

export const AdminAmenities: React.FC = () => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [pricing, setPricing] = useState('0');
  const [status, setStatus] = useState('AVAILABLE');
  const [capacity, setCapacity] = useState('20');
  const [rules, setRules] = useState('');

  const fetchAmenities = async () => {
    try {
      const res = await api.getAmenities();
      if (res.success) setAmenities(res.amenities || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity) return;
    try {
      const res = await api.updateAmenity(selectedAmenity.id, {
        pricing: Number(pricing),
        status,
        capacity: Number(capacity),
        rules,
      });
      if (res.success) {
        setSelectedAmenity(null);
        fetchAmenities();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Amenities Administration</h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Configure operating hours, pricing tariffs, and maintenance shutdown status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {amenities.map((a) => (
          <div key={a.id} className="bg-card rounded-panel border border-border p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-text-primary">{a.name}</h3>
                  <span className="text-[10px] text-primary font-bold uppercase">{a.category}</span>
                </div>
                <StatusBadge status={a.status} size="sm" />
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-text-muted">
                <p>Operating Hours: <strong className="text-text-primary">{a.openTime} - {a.closeTime}</strong></p>
                <p>Max Capacity: <strong className="text-text-primary">{a.capacity} persons</strong></p>
                <p>Slot Tariff: <strong className="text-primary">{a.pricing === 0 ? 'Complimentary' : `₹${a.pricing}`}</strong></p>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedAmenity(a);
                setPricing(a.pricing.toString());
                setStatus(a.status);
                setCapacity(a.capacity.toString());
                setRules(a.rules || '');
              }}
              className="mt-5 w-full py-2 rounded-xl bg-surface border border-border hover:border-primary text-xs font-semibold text-text-primary hover:text-primary transition flex items-center justify-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure Facility</span>
            </button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedAmenity}
        onClose={() => setSelectedAmenity(null)}
        title={`Configure ${selectedAmenity?.name}`}
        subtitle="Manage resident fees and operational status"
      >
        {selectedAmenity && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Operational State</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="AVAILABLE">AVAILABLE (Open)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Closed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Tariff per Slot (₹)</label>
                <input
                  type="number"
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  placeholder="0 for free"
                  className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary font-mono focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Max Capacity Limit</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Rules & Guidelines</label>
              <textarea
                rows={3}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                className="w-full bg-card border border-border rounded-xl p-3 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedAmenity(null)}
                className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
              >
                Save Settings
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

