import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Download, FileText, CheckCircle2, Clock, ShieldCheck, Check, X, Building, AlertCircle, FileCheck, Layers } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import { MaintenanceBill, Flat } from '../../types';

export const AdminMaintenance: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const isPresident = user?.email === 'president@emeraldgreens.in';
  const isVendor = user?.email === 'vendor@emeraldgreens.in';
  const [activeTab, setActiveTab] = useState<'maker-checker' | 'invoices'>(
    isPresident || isVendor ? 'maker-checker' : 'maker-checker'
  );

  const [bills, setBills] = useState<MaintenanceBill[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [nocs, setNocs] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Bill Generation Modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [billingMonth, setBillingMonth] = useState('December 2026');
  const [targetFlatId, setTargetFlatId] = useState('');
  const [flats, setFlats] = useState<any[]>([]);
  const [baseAmount, setBaseAmount] = useState('4000');
  const [waterAmount, setWaterAmount] = useState('1000');
  const [parkingAmount, setParkingAmount] = useState('1000');
  const [sinkingAmount, setSinkingAmount] = useState('500');

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const [billRes, flatRes, payRes, nocRes, vioRes] = await Promise.all([
        api.getBills().catch(() => ({ success: false, bills: [] as MaintenanceBill[], metrics: {} })),
        api.getFlats().catch(() => ({ success: false, flats: [] as Flat[] })),
        api.getPayouts().catch(() => ({ success: false, payouts: [] as any[] })),
        api.getNocs().catch(() => ({ success: false, nocs: [] as any[] })),
        api.getViolations().catch(() => ({ success: false, violations: [] as any[] })),
      ]);

      if (billRes && 'bills' in billRes) setBills(billRes.bills || []);
      if (flatRes && 'flats' in flatRes) {
        setFlats(flatRes.flats || []);
        if (flatRes.flats.length > 0) setTargetFlatId(flatRes.flats[0].id);
      }
      if (payRes && 'payouts' in payRes) setPayouts(payRes.payouts || []);
      if (nocRes && 'nocs' in nocRes) setNocs(nocRes.nocs || []);
      if (vioRes && 'violations' in vioRes) setViolations(vioRes.violations || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const handleCosignPayout = async (payoutId: string) => {
    try {
      const res = await api.cosignPayout(payoutId);
      if (res.success) {
        showToast({
          type: 'success',
          title: 'Maker-Checker Payout Released',
          message: res.message || 'Vendor voucher co-signed and payment disbursed.',
        });
        fetchFinancials();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Co-Sign Failed', message: err.message });
    }
  };

  const handleApproveNoc = async (nocId: string) => {
    try {
      const res = await api.approveNoc(nocId);
      if (res.success) {
        showToast({
          type: 'success',
          title: 'Move-In NOC Approved',
          message: res.message || 'NOC approved and security gate pass auto-generated!',
        });
        fetchFinancials();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Approval Failed', message: err.message });
    }
  };

  const handleWaiveViolation = async (id: string) => {
    try {
      const res = await api.waiveViolation(id);
      if (res.success) {
        showToast({ type: 'info', title: 'Appeal Waived', message: 'Violation fine waived.' });
        fetchFinancials();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  const handleUpholdViolation = async (id: string) => {
    try {
      const res = await api.upholdViolation(id);
      if (res.success) {
        showToast({ type: 'info', title: 'Penalty Upheld', message: 'Violation penalty upheld.' });
        fetchFinancials();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

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
        fetchFinancials();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white tracking-tight">
              RWA Financial Management & Maker-Checker Hub
            </h2>
            {isPresident && (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
                RWA President Portal
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Multi-signature vendor disbursements, tenant move-in NOCs, violation appeals, and ledger auditing
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
            <button
              onClick={() => setActiveTab('maker-checker')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'maker-checker'
                  ? 'bg-primary text-background shadow-sm'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Billing & Maker-Checker</span>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'invoices'
                  ? 'bg-primary text-background shadow-sm'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <span>Flat Invoices & Collections ({bills.length})</span>
            </button>
          </div>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Invoice</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Maker-Checker Payouts, NOCs, & Violation Appeals */}
      {activeTab === 'maker-checker' && (
        <div className="space-y-6">
          {/* Section A: Attendance-Linked Vendor Payouts */}
          <div className="bg-card rounded-panel border border-border p-5 space-y-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span>Attendance-Linked Vendor Payouts (Maker-Checker Workflow)</span>
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Requires two executive signatures before automated bank transfer release
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {payouts.map((pay) => {
                const isReleased = pay.status === 'RELEASED';
                return (
                  <div
                    key={pay.id}
                    className="p-4 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{pay.voucherNumber}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-card text-text-muted border border-border">
                          {pay.category}
                        </span>
                        {isReleased ? (
                          <span className="px-2 py-0.5 rounded-full bg-status-success/10 text-status-success border border-status-success/30 text-[10px] font-bold">
                            RELEASED & DISBURSED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-status-warning/10 text-status-warning border border-status-warning/30 text-[10px] font-bold">
                            PENDING PRESIDENT CO-SIGN
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-text-primary">{pay.vendorName}</h4>
                      <p className="text-xs text-text-secondary">{pay.description}</p>
                      <div className="flex items-center gap-4 text-[11px] text-text-muted pt-1">
                        <span>Maker Approved By: <strong className="text-text-primary">{pay.makerName}</strong></span>
                        {isReleased && (
                          <span>Co-Signed By: <strong className="text-primary">{pay.checkerSignerName}</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-baseline sm:items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-text-muted block">Voucher Amount</span>
                        <span className="text-xl font-black text-text-primary font-mono">
                          ₹{pay.amount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {!isReleased ? (
                        <button
                          onClick={() => handleCosignPayout(pay.id)}
                          className="px-4 py-2.5 rounded-xl bg-primary text-background font-black text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                          <span>Co-Sign & Release Payout</span>
                        </button>
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl bg-status-success/10 text-status-success border border-status-success/30 text-xs font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Disbursed via Auto-Debit</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Tenant Move-In NOCs & Gate Pass Auto-Generation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-panel border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary" />
                    <span>Tenant Move-In NOC Approvals</span>
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Approval auto-generates digital security gate pass for moving trucks
                  </p>
                </div>
              </div>

              {nocs.map((noc) => {
                const isApproved = noc.status === 'APPROVED';
                return (
                  <div key={noc.id} className="p-4 rounded-xl bg-surface border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">{noc.nocNumber}</span>
                      {isApproved ? (
                        <span className="px-2 py-0.5 rounded-full bg-status-success/10 text-status-success border border-status-success/30 text-[10px] font-bold">
                          GATE PASS ISSUED ({noc.gatePassNumber})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-status-warning/10 text-status-warning border border-status-warning/30 text-[10px] font-bold">
                          PENDING APPROVAL
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-text-primary">{noc.applicantName}</h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Moving into Flat <strong className="text-primary">{noc.flatNumber}</strong> on {noc.moveInDate}
                      </p>
                      <p className="text-[11px] text-text-muted mt-1">
                        Move-in deposit ₹{noc.depositAmount?.toLocaleString('en-IN')} paid • Police Verification on file
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] text-text-muted">Documents Verified</span>
                      {!isApproved ? (
                        <button
                          onClick={() => handleApproveNoc(noc.id)}
                          className="px-4 py-1.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-sm transition"
                        >
                          Approve Move-In NOC & Auto-Generate Gate Pass
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-status-success font-mono">
                          Gate Pass: {noc.gatePassNumber}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Section C: Society Violation Appeals */}
            <div className="bg-card rounded-panel border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-status-warning" />
                    <span>Society Violation Appeals</span>
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Review and decide on contested community rule penalty notices
                  </p>
                </div>
              </div>

              {violations.map((vio) => (
                <div key={vio.id} className="p-4 rounded-xl bg-surface border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{vio.violationNumber}</span>
                    <span className="text-xs font-bold text-text-primary font-mono">Fine: ₹{vio.penaltyAmount}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-text-primary">{vio.violationType}</h4>
                    <p className="text-xs text-text-secondary mt-0.5">Flat {vio.flatNumber} • {vio.residentName}</p>
                    <div className="mt-2 p-2 rounded-lg bg-card border border-border/80 text-[11px] text-text-muted italic">
                      "{vio.appealReason}"
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <StatusBadge status={vio.status} size="sm" />
                    {vio.status === 'PENDING_REVIEW' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleWaiveViolation(vio.id)}
                          className="px-3 py-1 rounded-lg bg-surface border border-border text-xs text-status-success hover:border-status-success font-semibold"
                        >
                          Waive Penalty
                        </button>
                        <button
                          onClick={() => handleUpholdViolation(vio.id)}
                          className="px-3 py-1 rounded-lg bg-surface border border-border text-xs text-status-danger hover:border-status-danger font-semibold"
                        >
                          Uphold Penalty
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-text-muted">{vio.resolution || 'Resolved'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: All Flat Invoices Table */}
      {activeTab === 'invoices' && (
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
                  <th className="py-2.5 px-3 text-right">Transaction Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {bills.map((b) => (
                  <tr key={b.id} className="hover:bg-surface/50">
                    <td className="py-3 px-3 font-mono font-bold text-text-primary">{b.billNumber}</td>
                    <td className="py-3 px-3 font-bold text-primary">Flat {b.flat?.flatNumber}</td>
                    <td className="py-3 px-3 text-text-secondary">{b.billingMonth}</td>
                    <td className="py-3 px-3 font-mono font-bold text-text-primary">
                      ₹{(b.totalAmount || (b as any).amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-text-muted font-medium">{b.paymentMethod || '—'}</td>
                    <td className="py-3 px-3 text-right font-mono text-[11px] text-text-primary font-semibold">
                      {b.transactionId ? (
                        <span className="text-status-success flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {b.transactionId}
                        </span>
                      ) : (
                        <span className="text-status-warning">Pending Payment</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
export default AdminMaintenance;

