import React, { useState, useEffect } from 'react';
import { Building2, Plus, Home, Search } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';
import { Flat } from '../../types';

export const AdminFlats: React.FC = () => {
  const [flats, setFlats] = useState<Flat[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [flatNumber, setFlatNumber] = useState('');
  const [bhkType, setBhkType] = useState('3 BHK');
  const [floorNumber, setFloorNumber] = useState('3');
  const [sqFt, setSqFt] = useState('1550');
  const [loading, setLoading] = useState(true);

  const fetchFlats = async () => {
    setLoading(true);
    try {
      const res = await api.getFlats();
      if (res.success) setFlats(res.flats || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlats();
  }, []);

  const handleCreateFlat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createFlat({
        flatNumber,
        bhkType,
        floorNumber: Number(floorNumber),
        sqFt: Number(sqFt),
        status: 'VACANT',
      });
      if (res.success) {
        setShowAddModal(false);
        setFlatNumber('');
        fetchFlats();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Flat & Unit Inventory</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Tower A & Tower B residential units, floor allocation, and occupancy statuses
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Unit</span>
        </button>
      </div>

      <div className="bg-card rounded-panel border border-border p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th className="py-2.5 px-3">Unit Number</th>
                <th className="py-2.5 px-3">Tower / Building</th>
                <th className="py-2.5 px-3">Configuration</th>
                <th className="py-2.5 px-3">Area (Sq.Ft)</th>
                <th className="py-2.5 px-3">Floor</th>
                <th className="py-2.5 px-3">Occupant</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {flats.map((f) => (
                <tr key={f.id} className="hover:bg-surface/50">
                  <td className="py-3 px-3 font-mono font-bold text-primary">{f.flatNumber}</td>
                  <td className="py-3 px-3 text-text-primary font-medium">{f.building?.name || 'Tower A'}</td>
                  <td className="py-3 px-3 text-text-secondary">{f.bhkType}</td>
                  <td className="py-3 px-3 font-mono text-text-muted">{f.sqFt} sq.ft</td>
                  <td className="py-3 px-3 text-text-muted">Floor {f.floorNumber}</td>
                  <td className="py-3 px-3 text-text-primary">
                    {f.users && f.users[0] ? f.users[0].name : <span className="text-text-muted italic">Vacant</span>}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <StatusBadge status={f.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Unit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Residential Unit"
        subtitle="Expands society building inventory roster"
      >
        <form onSubmit={handleCreateFlat} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Unit Number</label>
              <input
                type="text"
                required
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value.toUpperCase())}
                placeholder="e.g. A-502"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary uppercase focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Floor Number</label>
              <input
                type="number"
                required
                value={floorNumber}
                onChange={(e) => setFloorNumber(e.target.value)}
                placeholder="5"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Layout Configuration</label>
              <select
                value={bhkType}
                onChange={(e) => setBhkType(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK Penthouse">4 BHK Penthouse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Super Built-up Area</label>
              <input
                type="number"
                value={sqFt}
                onChange={(e) => setSqFt(e.target.value)}
                placeholder="1550"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
            >
              Save Unit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

