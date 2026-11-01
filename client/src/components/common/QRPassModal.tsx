import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from './Modal';
import { Visitor } from '../../types';
import { Copy, Check, Download, ShieldCheck, Calendar, MapPin, Car } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface QRPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitor: Visitor | null;
}

export const QRPassModal: React.FC<QRPassModalProps> = ({ isOpen, onClose, visitor }) => {
  const [copied, setCopied] = useState(false);

  if (!visitor) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(visitor.passCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(visitor.expectedAt).toLocaleString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="RESISYNC Digital Gate Pass"
      subtitle="Present this QR code or 6-digit pass code to Gate Security"
      maxWidth="md"
    >
      <div className="flex flex-col items-center">
        {/* Pass Card Container */}
        <div className="w-full bg-card rounded-2xl border border-primary/30 p-6 flex flex-col items-center shadow-orange-glow relative overflow-hidden">
          {/* Subtle watermark / brand tag */}
          <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-primary" />
            RESISYNC VERIFIED PASS
          </div>
          <div className="absolute top-3 right-4">
            <StatusBadge status={visitor.status} size="sm" />
          </div>

          {/* QR Code Container */}
          <div className="mt-7 p-3.5 bg-white rounded-xl shadow-md border-4 border-[#10171D]">
            <QRCodeSVG
              value={visitor.qrToken || visitor.passCode}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* 6-Digit Code */}
          <div className="mt-4 text-center">
            <p className="text-xs text-text-secondary uppercase tracking-widest font-mono">
              6-Digit Gate Entry Code
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-3xl font-extrabold tracking-widest text-primary font-mono bg-surface px-4 py-1.5 rounded-lg border border-border">
                {visitor.passCode}
              </span>
              <button
                onClick={handleCopyCode}
                title="Copy pass code"
                className="p-2 rounded-lg bg-surface border border-border text-text-secondary hover:text-primary transition"
              >
                {copied ? <Check className="w-5 h-5 text-status-success" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Visitor Details Grid */}
          <div className="w-full mt-6 pt-4 border-t border-border grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-text-muted">Visitor Name</p>
              <p className="font-semibold text-text-primary text-sm mt-0.5">{visitor.name}</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-surface text-text-secondary border border-border">
                {visitor.visitorType}
              </span>
            </div>
            <div>
              <p className="text-text-muted">Destination Unit</p>
              <p className="font-semibold text-text-primary text-sm mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" /> Flat {visitor.flat?.flatNumber}
              </p>
              <p className="text-text-secondary text-[11px]">Greenview Residency</p>
            </div>
            <div>
              <p className="text-text-muted">Expected Schedule</p>
              <p className="font-medium text-text-primary mt-0.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary" /> {formattedDate}
              </p>
            </div>
            {visitor.vehicleNumber && (
              <div>
                <p className="text-text-muted">Registered Vehicle</p>
                <p className="font-medium text-text-primary mt-0.5 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-primary" /> {visitor.vehicleNumber}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between w-full mt-5 gap-3">
          <button
            onClick={() => {
              window.print();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl border border-border bg-card text-text-primary hover:bg-card-hover font-medium text-xs flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" /> Download / Print Pass
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-primary text-background font-semibold text-xs hover:bg-primary-hover transition"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

