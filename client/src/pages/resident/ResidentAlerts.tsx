import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Bell,
  AlertTriangle,
  Phone,
  Shield,
  Flame,
  CheckCircle2,
  Pin,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';
import { Announcement } from '../../types';

export const ResidentAlerts: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // SOS Modal
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosType, setSosType] = useState<'SECURITY' | 'MEDICAL' | 'FIRE' | 'OTHER'>('SECURITY');
  const [sosNote, setSosNote] = useState('');
  const [isTriggering, setIsTriggering] = useState(false);
  const [sosSuccess, setSosSuccess] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [annRes, contRes] = await Promise.all([
        api.getAnnouncements(activeCategory === 'ALL' ? undefined : activeCategory),
        api.getEmergencyContacts(),
      ]);
      if (annRes.success) setAnnouncements(annRes.announcements || []);
      if (contRes.success) setContacts(contRes.contacts || []);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeCategory]);

  const handleSosTrigger = async () => {
    setIsTriggering(true);
    try {
      const res = await api.triggerEmergency(sosType, sosNote);
      if (res.success) {
        setSosSuccess(true);
        showToast({
          type: 'emergency',
          title: '🚨 Emergency SOS Dispatched',
          message: 'Security desk at Main Gate 1 has been alerted.',
        });
        setTimeout(() => {
          setSosSuccess(false);
          setShowSosModal(false);
        }, 3000);
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'SOS Failed', message: err.message });
    } finally {
      setIsTriggering(false);
    }
  };

  // Normalize contacts: safely handles flat array, grouped array, or undefined
  const contactGroups = Array.isArray(contacts) && contacts.length > 0
    ? (contacts[0]?.contacts && Array.isArray(contacts[0].contacts)
        ? contacts
        : [
            {
              category: 'Immediate Emergency Contacts',
              contacts: contacts.map((c: any) => ({
                name: c.role || c.name || 'Emergency Helpline',
                phone: c.phone || '112',
                available: c.available || (c.priority === 1 ? '24x7 Gate Desk' : '24x7 Active'),
              })),
            },
          ])
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Alerts & Emergency Station</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Broadcast notices, utility maintenance warnings, and 24x7 gate security emergency response
          </p>
        </div>

        <button
          onClick={() => setShowSosModal(true)}
          className="px-5 py-2.5 rounded-xl bg-status-emergency hover:bg-red-700 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 animate-pulse self-start sm:self-auto"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>TRIGGER EMERGENCY SOS</span>
        </button>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Announcements & Notices */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border overflow-x-auto">
            {['ALL', 'URGENT', 'MAINTENANCE', 'EVENT', 'GENERAL'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                  activeCategory === cat
                    ? 'bg-primary text-background shadow-sm'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {cat.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Announcements Feed */}
          {announcements.length === 0 ? (
            <div className="p-8 bg-card rounded-2xl border border-dashed border-border text-center">
              <Bell className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-text-secondary">No notices in this category</p>
              <p className="text-[11px] text-text-muted mt-0.5">Check back later for society broadcasts and alerts</p>
            </div>
          ) : (
            announcements.map((ann) => (
              <div
                key={ann.id}
                className={`bg-card rounded-2xl border p-5 transition-all shadow-sm ${
                  ann.isPinned
                    ? 'border-primary/50 shadow-orange-glow'
                    : 'border-border hover:border-border-light'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        ann.category === 'URGENT'
                          ? 'bg-status-danger/15 text-status-danger border border-status-danger/30'
                          : ann.category === 'MAINTENANCE'
                          ? 'bg-status-warning/15 text-status-warning border border-status-warning/30'
                          : 'bg-primary/15 text-primary border border-primary/30'
                      }`}
                    >
                      {ann.category || 'GENERAL'}
                    </span>
                    {ann.isPinned && (
                      <span className="flex items-center gap-1 text-[11px] text-primary font-semibold">
                        <Pin className="w-3 h-3" /> Pinned Advisory
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {ann.createdAt
                      ? new Date(ann.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Recent'}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-text-primary mt-1">{ann.title || 'Untitled Notice'}</h3>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed whitespace-pre-line">
                  {ann.content || ''}
                </p>

                <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-text-muted flex items-center justify-between">
                  <span>Issued by: <strong className="text-text-secondary">{ann.authorName || 'Estate Management'}</strong></span>
                  <span>Greenview Society Management</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right 1 Col: Emergency Numbers Directory */}
        <div className="space-y-4">
          <div className="bg-card rounded-panel border border-border p-5">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              <span>Emergency Helpdesk</span>
            </h3>

            <div className="space-y-4">
              {contactGroups.length === 0 ? (
                <div className="p-4 rounded-xl bg-surface border border-border text-center text-xs text-text-muted">
                  No emergency directory contacts available.
                </div>
              ) : (
                contactGroups.map((group, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                      {group.category || 'Emergency Contacts'}
                    </p>
                    <div className="space-y-2">
                      {(group.contacts || []).map((c: any, cIdx: number) => (
                        <div
                          key={cIdx}
                          className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-semibold text-text-primary">{c.name || 'Emergency Helpline'}</p>
                            <p className="text-[10px] text-text-muted">{c.available || '24x7 Available'}</p>
                          </div>
                          <a
                            href={`tel:${c.phone}`}
                            className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-mono font-bold flex items-center gap-1 transition"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{c.phone || '112'}</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency SOS Modal */}
      <Modal
        isOpen={showSosModal}
        onClose={() => setShowSosModal(false)}
        title="🚨 CONFIRM EMERGENCY SOS TRIGGER"
        subtitle="This triggers immediate siren alerts to Gate 1 security and community response"
      >
        {sosSuccess ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-status-success mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Emergency Signal Broadcasted</h4>
            <p className="text-xs text-text-secondary">
              Security guard Vikram Singh has been notified at Gate 1 with your flat unit coordinates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-text-secondary leading-relaxed">
              Use this for immediate real-life security threats, medical emergencies, or fires. Gate officers will respond directly.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {(['SECURITY', 'MEDICAL', 'FIRE', 'OTHER'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSosType(t)}
                  className={`p-3 rounded-xl border text-xs font-bold transition text-left ${
                    sosType === t
                      ? 'bg-status-emergency/20 border-status-emergency text-red-300'
                      : 'bg-card border-border text-text-secondary'
                  }`}
                >
                  <span className="block text-sm mb-1">
                    {t === 'SECURITY' && '🛡️ Intruder / Threat'}
                    {t === 'MEDICAL' && '🚑 Medical Critical'}
                    {t === 'FIRE' && '🔥 Fire / Smoke'}
                    {t === 'OTHER' && '⚠️ General Panic'}
                  </span>
                  <span className="text-[10px] font-normal text-text-muted">High-priority dispatch</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Additional Note / Room Location (Optional)
              </label>
              <input
                type="text"
                value={sosNote}
                onChange={(e) => setSosNote(e.target.value)}
                placeholder="e.g. Master bedroom, elder parent breathing issue"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isTriggering}
                onClick={handleSosTrigger}
                className="px-5 py-2.5 rounded-xl bg-status-emergency text-white font-bold text-xs hover:bg-red-700 shadow-md transition"
              >
                {isTriggering ? 'Broadcasting...' : 'TRANSMIT SOS ALARM'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

