import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  CreditCard,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ShieldCheck,
  ChevronRight,
  Receipt,
  QrCode,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import api from '../../services/api';
import { MaintenanceBill } from '../../types';

export const ResidentMaintenance: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [bills, setBills] = useState<MaintenanceBill[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Pay Modal
  const [selectedBillForPay, setSelectedBillForPay] = useState<MaintenanceBill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);

  // Receipt Modal
  const [receiptBill, setReceiptBill] = useState<MaintenanceBill | null>(null);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await api.getBills();
      if (res.success) {
        setBills(res.bills || []);
        setMetrics(res.metrics || null);
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handlePaySubmit = async (mockSuccess: boolean = true) => {
    if (!selectedBillForPay) return;
    setIsProcessing(true);
    try {
      const res = await api.payBill(selectedBillForPay.id, {
        paymentMethod,
        mockSuccess,
      });

      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF8A00', '#10B981', '#3B82F6'],
        });

        showToast({
          type: 'success',
          title: 'Payment Confirmed',
          message: res.message,
        });

        setSelectedBillForPay(null);
        fetchBills();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Payment Failed', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingBill = bills.find((b) => b.status === 'PENDING' || b.status === 'OVERDUE');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Maintenance & Society Dues</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Transparent itemized billing statements, online fee settlement, and payment records
          </p>
        </div>

        {/* Sandbox Indicator Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Sandbox Mock Payment Active</span>
        </div>
      </div>

      {/* Main Billing Banner (Screen 5 Inspired) */}
      {loading ? (
        <LoadingSkeleton height="h-44" rows={1} />
      ) : pendingBill ? (
        <div className="bg-gradient-to-r from-card via-[#121B22] to-card border border-primary/40 rounded-panel p-6 shadow-orange-glow relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                <Receipt className="w-4 h-4" />
                <span>Current Invoice • {pendingBill.billingMonth}</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 font-sans">
                ₹{pendingBill.totalAmount.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-status-warning mt-1 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Due by {new Date(pendingBill.dueDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-[11px] text-text-muted mt-2">
                Invoice #{pendingBill.billNumber} • Flat {user?.flat?.flatNumber || 'A-402'} (Greenview Residency)
              </p>
            </div>

            {/* Itemized Quick Breakdown */}
            <div className="bg-surface/80 rounded-xl p-4 border border-border sm:min-w-[280px]">
              <p className="text-[11px] font-bold uppercase text-text-muted mb-2 tracking-wider">
                Itemized Charges
              </p>
              <div className="space-y-1.5 text-xs">
                {pendingBill.items?.map((it) => (
                  <div key={it.id} className="flex items-center justify-between">
                    <span className="text-text-secondary">{it.title}</span>
                    <span className="font-semibold text-text-primary">₹{it.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border flex items-center justify-between font-bold text-primary">
                  <span>Total Due</span>
                  <span>₹{pendingBill.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBillForPay(pendingBill)}
                className="w-full mt-4 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
              >
                Pay Outstanding Bill
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-status-success/30 rounded-panel p-6 flex items-center gap-4 text-status-success">
          <div className="p-3 rounded-xl bg-status-success/15">
            <CheckCircle2 className="w-8 h-8 text-status-success" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">All Dues Paid in Full</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              No outstanding maintenance balances for unit {user?.flat?.flatNumber || 'Assigned Unit'}. Thank you!
            </p>
          </div>
        </div>
      )}

      {/* Payment History & Invoices Table */}
      <div className="bg-card rounded-panel border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Payment & Invoice Ledger
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">Verified receipts and historical transactions</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th className="py-3 px-3">Billing Month</th>
                <th className="py-3 px-3">Invoice No</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Txn Reference</th>
                <th className="py-3 px-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {bills.map((b) => (
                <tr key={b.id} className="hover:bg-surface/50 transition">
                  <td className="py-3.5 px-3 font-semibold text-text-primary">{b.billingMonth}</td>
                  <td className="py-3.5 px-3 font-mono text-text-secondary">{b.billNumber}</td>
                  <td className="py-3.5 px-3 text-text-muted">
                    {new Date(b.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-text-primary font-mono">
                    ₹{b.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={b.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-3 text-text-muted font-mono text-[11px]">
                    {b.transactionId || '—'}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {b.status === 'PAID' ? (
                      <button
                        onClick={() => setReceiptBill(b)}
                        className="px-2.5 py-1 rounded-lg bg-surface border border-border text-primary hover:border-primary/40 font-medium inline-flex items-center gap-1.5 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedBillForPay(b)}
                        className="px-2.5 py-1 rounded-lg bg-primary text-background font-bold text-[11px] hover:bg-primary-hover shadow-sm transition"
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Bill Sandbox Modal */}
      <Modal
        isOpen={!!selectedBillForPay}
        onClose={() => setSelectedBillForPay(null)}
        title="Pay Maintenance Invoice"
        subtitle={`Invoice: ${selectedBillForPay?.billNumber} • Amount: ₹${selectedBillForPay?.totalAmount.toLocaleString('en-IN')}`}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-card border border-border">
            <p className="text-[11px] text-text-muted uppercase font-bold tracking-wider mb-2">
              Select Payment Method
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['UPI', 'CARD', 'NETBANKING'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                    paymentMethod === method
                      ? 'bg-primary/15 border-primary text-primary shadow-sm'
                      : 'bg-surface border-border text-text-secondary hover:text-white'
                  }`}
                >
                  {method === 'UPI' && '⚡ UPI / QR'}
                  {method === 'CARD' && '💳 Card'}
                  {method === 'NETBANKING' && '🏦 NetBanking'}
                </button>
              ))}
            </div>
          </div>

          {/* Itemized Review */}
          <div className="p-3.5 rounded-xl bg-surface border border-border text-xs space-y-1.5">
            <p className="text-[11px] font-bold text-text-muted uppercase">Bill Breakdown</p>
            {selectedBillForPay?.items.map((it) => (
              <div key={it.id} className="flex items-center justify-between text-text-secondary">
                <span>{it.title}</span>
                <span className="font-semibold text-text-primary">₹{it.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-border flex items-center justify-between font-bold text-primary text-sm">
              <span>Total Payable</span>
              <span>₹{selectedBillForPay?.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-[11px] text-primary">
            ℹ️ <span className="font-semibold">Developer Sandbox Mode:</span> Simulates instant server-side payment verification and receipt generation.
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setSelectedBillForPay(null)}
              className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handlePaySubmit(true)}
              className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition"
            >
              {isProcessing ? 'Processing...' : `Authorize Payment (₹${selectedBillForPay?.totalAmount})`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Downloadable / Printable Receipt Modal */}
      <Modal
        isOpen={!!receiptBill}
        onClose={() => setReceiptBill(null)}
        title="Official Maintenance Receipt"
        subtitle="RESISYNC Certified Society Payment Acknowledgment"
        maxWidth="lg"
      >
        {receiptBill && (
          <div className="p-6 bg-card rounded-2xl border border-border space-y-5">
            {/* Receipt Header */}
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
                <p className="text-[11px] text-text-muted mt-1 font-mono">{receiptBill.billNumber}</p>
              </div>
            </div>

            {/* Resident & Unit Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-text-muted">Billed To:</p>
                <p className="font-bold text-text-primary text-sm mt-0.5">{user?.name || 'Rahul Sharma'}</p>
                <p className="text-text-secondary">Flat Unit {receiptBill.flat?.flatNumber || 'A-402'}</p>
              </div>
              <div className="text-right">
                <p className="text-text-muted">Payment Date & Txn:</p>
                <p className="font-semibold text-text-primary mt-0.5">
                  {receiptBill.paidAt ? new Date(receiptBill.paidAt).toLocaleDateString('en-IN') : 'Paid'}
                </p>
                <p className="font-mono text-primary text-[11px]">{receiptBill.transactionId || 'UPI/TXN98124'}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <table className="w-full text-xs text-left border-t border-b border-border my-2">
              <thead>
                <tr className="text-text-muted uppercase text-[10px] border-b border-border">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {receiptBill.items?.map((it) => (
                  <tr key={it.id}>
                    <td className="py-2 text-text-secondary">{it.title}</td>
                    <td className="py-2 text-right font-mono font-medium text-text-primary">
                      {it.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold text-sm text-text-primary">
                  <td className="py-2.5">Total Paid</td>
                  <td className="py-2.5 text-right font-mono text-primary">
                    ₹{receiptBill.totalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Print button */}
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

