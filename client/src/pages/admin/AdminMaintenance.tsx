import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Download, FileText, CheckCircle2, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';
import { MaintenanceBill } from '../../types';

export const AdminMaintenance: React.FC = () => {
  const [bills, setBills] = useState<MaintenanceBill[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [billingMonth, setBillingMonth] = useState('December 2026');
  const [targetFlatId, setTargetFlatId] = useState('');
  const [flats, setFlats] = useState<any[]>([]);
  const [baseAmount, setBaseAmount] = useState('4000');
  const [waterAmount, setWaterAmount] = useState('1000');
  const [parkingAmount, setParkingAmount] = useState('1000');
  const [sinkingAmount, setSinkingAmount] = useState('500');

  const fetchBills = async () => {
    try {
      const [billRes, flatRes] = await Promise.all([
        api.getBills(),
        api.getFlats(),
      ]);
      if (billRes.success) setBills(billRes.bills || []);
      if (flatRes.success) {
        setFlats(flatRes.flats || []);
        if (flatRes.flats.length > 0) setTargetFlatId(flatRes.flats[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      const res = await api.createBill({
        flatId: targetFlatId,
        billingMonth,
        billingYear: 2026,
        dueDate: dueDate.toISOString(),
        items: [
          { title: 'Base Society Maintenance', amount: Number(baseAmount), category: 'MAINTENANCE' },
          { title: 'Treated Water Charges', amount: Number(waterAmount), category: 'WATER' },
          { title: 'Dedicated Stilt Parking', amount: Number(parkingAmount), category: 'PARKING' },
          { title: 'Capital Sinking Fund', amount: Number(sinkingAmount), category: 'SINKING_FUND' },
        ],
      });

      if (res.success) {
        setShowGenerateModal(false);
        fetchBills();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Society Maintenance & Billing Control</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Issue monthly assessment bills, track society-wide collections, and audit payments
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Flat Invoice</span>
        </button>
      </div>

      <div className="bg-card rounded-panel border border-border p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th className="py-2.5 px-3">Invoice No</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">Billing Cycle</th>
                <th className="py-2.5 px-3">Total Due</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3 text-right">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {bills.map((b) => (
                <tr key={b.id} className="hover:bg-surface/50">
                  <td className="py-3 px-3 font-mono font-bold text-text-primary">{b.billNumber}</td>
                  <td className="py-3 px-3 font-bold text-primary">Flat {b.flat?.flatNumber}</td>
                  <td className="py-3 px-3 text-text-secondary">{b.billingMonth}</td>
                  <td className="py-3 px-3 font-mono font-bold text-text-primary">
                    ₹{b.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={b.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-text-muted">{b.paymentMethod || '—'}</td>
                  <td className="py-3 px-3 text-right font-mono text-[11px] text-text-muted">
                    {b.transactionId || 'Unpaid'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Bill Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Flat Maintenance Bill"
        subtitle="Issues itemized assessment invoice for specified flat unit"
      >
        <form onSubmit={handleGenerateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Target Flat</label>
              <select
                value={targetFlatId}
                onChange={(e) => setTargetFlatId(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                {flats.map((f) => (
                  <option key={f.id} value={f.id}>Flat {f.flatNumber}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Billing Month</label>
              <input
                type="text"
                required
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                placeholder="December 2026"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-text-muted mb-1">Base Maintenance (₹)</label>
              <input
                type="number"
                value={baseAmount}
                onChange={(e) => setBaseAmount(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-text-primary focus:border-primary focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1">Water Supply (₹)</label>
              <input
                type="number"
                value={waterAmount}
                onChange={(e) => setWaterAmount(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-text-primary focus:border-primary focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1">Dedicated Parking (₹)</label>
              <input
                type="number"
                value={parkingAmount}
                onChange={(e) => setParkingAmount(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-text-primary focus:border-primary focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1">Sinking Fund (₹)</label>
              <input
                type="number"
                value={sinkingAmount}
                onChange={(e) => setSinkingAmount(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-text-primary focus:border-primary focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowGenerateModal(false)}
              className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
            >
              Publish Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

