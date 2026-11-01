import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Camera,
  Car,
  Clock,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import api from '../../services/api';
import { Visitor } from '../../types';

export const SecurityQRScanner: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [inputCode, setInputCode] = useState('');
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const samplePasses = [
    { code: '829410', label: 'Rohan Mehta (Guest - A-402)' },
    { code: '491204', label: 'Amazon Courier (Delivery - A-402)' },
    { code: '109382', label: 'Priya Desai (Checked-In)' },
  ];

  const handleScanCode = async (code: string) => {
    if (!code) return;
    setIsVerifying(true);
    setIsCheckedIn(false);
    try {
      const res = await api.verifyPass(code.trim());
      if (res.success && res.visitor) {
        setVisitor(res.visitor);
        showToast({
          type: 'success',
          title: 'QR Code Decoded',
          message: `Pass verified for ${res.visitor.name} (Unit ${res.visitor.flat?.flatNumber})`,
        });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Invalid QR Pass', message: err.message });
      setVisitor(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCheckInNow = async () => {
    if (!visitor) return;
    try {
      const res = await api.checkInVisitor(visitor.id);
      if (res.success) {
        setIsCheckedIn(true);
        setVisitor(res.visitor);
        showToast({
          type: 'success',
          title: 'Gate Barrier Lifted',
          message: `${visitor.name} checked in successfully!`,
        });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Check In Error', message: err.message });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/security/dashboard')}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gate Console</span>
        </button>
        <span className="text-xs font-mono font-bold text-primary">ANPR & PASS SCANNER ACTIVE</span>
      </div>

      {/* Interactive Scanner Viewport */}
      <div className="bg-card rounded-panel border-2 border-primary/50 overflow-hidden shadow-orange-glow relative">
        <div className="h-64 sm:h-80 bg-black/90 relative flex flex-col items-center justify-center p-6 text-center">
          {/* Animated Laser Scanning Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-bounce opacity-80" />

          {/* Camera Viewfinder Corners */}
          <div className="w-56 h-56 border-2 border-dashed border-primary/60 rounded-3xl relative flex flex-col items-center justify-center p-4">
            <Camera className="w-12 h-12 text-primary/40 mb-2 animate-pulse" />
            <p className="text-xs text-text-secondary font-medium">Position QR Code in Box</p>
            <p className="text-[10px] text-text-muted mt-1">High-speed optical recognition</p>
          </div>
        </div>

        {/* Manual Code Input Bar */}
        <div className="p-4 bg-surface border-t border-border flex items-center gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScanCode(inputCode)}
            placeholder="Type 6-digit code e.g. 829410 or paste token..."
            className="flex-1 bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary font-mono focus:border-primary focus:outline-none"
          />
          <button
            onClick={() => handleScanCode(inputCode)}
            className="px-4 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover transition"
          >
            Scan / Decode
          </button>
        </div>
      </div>

      {/* Quick Test Codes */}
      <div className="p-4 rounded-xl bg-surface border border-border">
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
          Quick Demo QR Passes (Click to simulate instant scan)
        </p>
        <div className="flex flex-wrap gap-2">
          {samplePasses.map((p) => (
            <button
              key={p.code}
              onClick={() => {
                setInputCode(p.code);
                handleScanCode(p.code);
              }}
              className="px-3 py-1.5 rounded-lg bg-card hover:bg-card-hover border border-border hover:border-primary/50 text-xs font-mono text-text-secondary hover:text-primary transition"
            >
              #{p.code} • {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Card Result */}
      {visitor && (
        <div className="bg-card rounded-2xl border border-primary/50 p-6 shadow-orange-glow space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono text-primary font-bold">
                VALID PASS #{visitor.passCode}
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">{visitor.name}</h3>
              <p className="text-xs text-text-secondary mt-0.5">{visitor.phone} • {visitor.visitorType}</p>
            </div>
            <StatusBadge status={visitor.status} size="md" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs p-3.5 rounded-xl bg-surface border border-border">
            <div>
              <p className="text-text-muted">Destination Flat:</p>
              <p className="font-bold text-text-primary text-base mt-0.5">Unit {visitor.flat?.flatNumber}</p>
              <p className="text-[11px] text-text-secondary">Greenview Residency</p>
            </div>
            <div>
              <p className="text-text-muted">Host Resident:</p>
              <p className="font-bold text-text-primary mt-0.5">{visitor.invitedBy?.name || 'Rahul Sharma'}</p>
              <p className="text-[11px] text-text-secondary">{visitor.invitedBy?.phone || ''}</p>
            </div>
            {visitor.vehicleNumber && (
              <div>
                <p className="text-text-muted">Vehicle License Plate:</p>
                <p className="font-mono text-primary font-bold mt-0.5">{visitor.vehicleNumber}</p>
              </div>
            )}
            <div>
              <p className="text-text-muted">Scheduled Arrival:</p>
              <p className="text-text-primary mt-0.5">
                {new Date(visitor.expectedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {isCheckedIn ? (
            <div className="p-4 rounded-xl bg-status-success/15 border border-status-success/30 text-status-success text-center font-bold text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-status-success" />
              <span>ENTRY AUTHORIZED — BOOM BARRIER OPEN</span>
            </div>
          ) : visitor.status === 'EXPECTED' || visitor.status === 'APPROVED' ? (
            <button
              onClick={handleCheckInNow}
              className="w-full py-3.5 rounded-xl bg-primary text-background font-extrabold text-sm hover:bg-primary-hover shadow-orange-glow transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>GRANT GATE ENTRY & CHECK IN</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-surface text-center text-xs text-text-muted border border-border">
              Pass is currently <strong className="text-text-primary">{visitor.status}</strong>. No further gate check-in required.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

