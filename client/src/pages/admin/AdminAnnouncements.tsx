import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Pin,
  PinOff,
  Clock,
  Search,
  Send,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Users,
  Eye,
  FileText,
  Mail,
  MessageSquare,
  Shield,
  Layers,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';
import { Announcement } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const AdminAnnouncements: React.FC = () => {
  const { showToast } = useNotification();
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Creation Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('GOVERNANCE');
  const [priority, setPriority] = useState<'NORMAL' | 'IMPORTANT' | 'CRITICAL'>('NORMAL');
  const [targetAudience, setTargetAudience] = useState('All Towers');
  const [isPinned, setIsPinned] = useState(false);
  const [channels, setChannels] = useState<{ inApp: boolean; whatsapp: boolean; email: boolean }>({
    inApp: true,
    whatsapp: true,
    email: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.getAnnouncements();
      if (res && res.success && (res.announcements ?? []).length > 0) {
        setAnnouncements(res.announcements);
      } else {
        // Fallback default seeds if storage was empty
        setAnnouncements([
          {
            id: 'ann-cir-2026-114',
            referenceId: 'CIR-2026-114',
            societyId: 'soc-ego-blr-01',
            title: 'Quarterly General Body Meeting (AGM) & FY26 Accounts Review',
            category: 'GOVERNANCE',
            priority: 'CRITICAL',
            targetAudience: 'All Towers',
            authorName: 'Priya Nair (RWA President)',
            authorRole: 'RWA President',
            isPinned: true,
            readCount: 142,
            totalTargetFlats: 160,
            channels: ['IN_APP', 'WHATSAPP', 'EMAIL'],
            content: 'The Annual General Body Meeting will be held this Sunday at 10:00 AM in the Clubhouse Banquet Hall. Key agenda items include FY26 audited expenditure reports, vendor SLA audit, and resident voting on the proposed solar rooftop microgrid expansion.',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: 'ann-cir-2026-115',
            referenceId: 'CIR-2026-115',
            societyId: 'soc-ego-blr-01',
            title: 'Overhead Water Tank Chemical Disinfection & Pressure Test',
            category: 'MAINTENANCE',
            priority: 'IMPORTANT',
            targetAudience: 'Tower A',
            authorName: 'Vikram Menon (Facility Manager)',
            authorRole: 'Facility Manager',
            isPinned: true,
            readCount: 128,
            totalTargetFlats: 160,
            channels: ['IN_APP', 'WHATSAPP'],
            content: 'Semi-annual deep cleaning of Tower A overhead reservoir sumps is scheduled for Thursday from 10:00 AM to 02:00 PM. Water pressure will remain throttled during this window; please store sufficient domestic water in advance.',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'ann-cir-2026-116',
            referenceId: 'CIR-2026-116',
            societyId: 'soc-ego-blr-01',
            title: 'Diwali Deepotsav Gala & Cultural Community Food Festival',
            category: 'EVENTS',
            priority: 'NORMAL',
            targetAudience: 'All Towers',
            authorName: 'Priya Nair (RWA President)',
            authorRole: 'RWA President',
            isPinned: false,
            readCount: 98,
            totalTargetFlats: 160,
            channels: ['IN_APP'],
            content: 'Join the community at the central amphitheater for our annual cultural evening featuring musical performances, children talent showcase, artisanal food stalls, and eco-friendly diya illumination beginning at 6:30 PM.',
            createdAt: new Date(Date.now() - 43200000).toISOString(),
          },
          {
            id: 'ann-cir-2026-117',
            referenceId: 'CIR-2026-117',
            societyId: 'soc-ego-blr-01',
            title: 'Mandatory Fire Alarm & Security Evacuation Drill Advisory',
            category: 'EMERGENCY',
            priority: 'CRITICAL',
            targetAudience: 'All Towers',
            authorName: 'Apex Security Services',
            authorRole: 'Security Head',
            isPinned: false,
            readCount: 151,
            totalTargetFlats: 160,
            channels: ['IN_APP', 'WHATSAPP', 'SMS'],
            content: 'A mandatory 10-minute fire alarm and security evacuation simulation will take place on Saturday at 11:30 AM. Stationed guards will guide residents down fire stairwells to the primary assembly ground.',
            createdAt: new Date(Date.now() - 18000000).toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Actions
  const handleTogglePin = async (id: string, currentPin: boolean) => {
    try {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isPinned: !currentPin } : a))
      );
      const res = await api.togglePinAnnouncement(id);
      if (res && res.success) {
        showToast({
          title: !currentPin ? 'Circular Pinned to Top' : 'Circular Unpinned',
          message: 'Notice priority updated on resident feeds.',
          type: 'info',
        });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Action Failed', message: err.message });
      fetchAnnouncements();
    }
  };

  const handleSendReminder = (title: string, refId?: string) => {
    showToast({
      title: 'Push Reminder Dispatched',
      message: `Re-sent notification for ${refId || 'circular'} to all unacknowledged flats.`,
      type: 'success',
    });
  };

  const handleDelete = async (id: string, refId?: string) => {
    if (!confirm(`Are you sure you want to archive circular ${refId || ''}?`)) return;
    try {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      const res = await api.deleteAnnouncement(id);
      if (res && res.success) {
        showToast({
          title: 'Circular Archived',
          message: 'The announcement has been retired from the active resident board.',
          type: 'info',
        });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Archive Failed', message: err.message });
      fetchAnnouncements();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedChannels: string[] = [];
      if (channels.inApp) selectedChannels.push('IN_APP');
      if (channels.whatsapp) selectedChannels.push('WHATSAPP');
      if (channels.email) selectedChannels.push('EMAIL');

      const payload = {
        title: title.trim(),
        content: content.trim(),
        category,
        priority,
        targetAudience,
        isPinned,
        channels: selectedChannels,
      };

      const res = await api.createAnnouncement(payload);
      if (res && res.success) {
        showToast({
          title: 'Broadcast Published',
          message: `Notice broadcasted across selected channels.`,
          type: 'success',
        });
        setShowModal(false);
        setTitle('');
        setContent('');
        setIsPinned(false);
        fetchAnnouncements();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Publishing Failed', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered List
  const filteredList = (announcements ?? []).filter((ann) => {
    const matchesSearch =
      (ann.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ann.content ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ann.referenceId ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ann.targetAudience ?? '').toLowerCase().includes(searchQuery.toLowerCase());

    if (activeCategory === 'ALL') return matchesSearch;
    if (activeCategory === 'PINNED') return matchesSearch && ann.isPinned;
    return matchesSearch && (ann.category ?? '').toUpperCase() === activeCategory.toUpperCase();
  });

  // Calculate Metrics
  const activeCount = (announcements ?? []).length;
  const pinnedCount = (announcements ?? []).filter((a) => a.isPinned).length;
  const avgReadRate = Math.round(
    (announcements ?? []).reduce((acc, a) => {
      const read = Number(a.readCount ?? 120);
      const total = Number(a.totalTargetFlats ?? 160);
      return acc + (read / total) * 100;
    }, 0) / Math.max(1, activeCount)
  );

  const categoryTabs = [
    { id: 'ALL', label: 'All Circulars' },
    { id: 'PINNED', label: '📌 Pinned' },
    { id: 'GOVERNANCE', label: 'RWA / AGM Governance' },
    { id: 'MAINTENANCE', label: 'Maintenance & Outages' },
    { id: 'EVENTS', label: 'Community Events' },
    { id: 'EMERGENCY', label: 'Emergency Advisories' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text-primary tracking-tight">Society Announcements & Broadcasts</h2>
            <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-mono font-bold">
              {activeCount} Active Circulars
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Broadcast official notices, AGM resolutions, utility shutdowns, and emergency advisories to all resident dashboards.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Announcement / Publish Circular</span>
        </button>
      </div>

      {/* Filter & Analytics Bar */}
      <div className="space-y-4">
        {/* Summary Counter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Active Notices</span>
              <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <p className="font-mono font-black text-2xl text-text-primary mt-2">
              {activeCount} <span className="text-sm font-normal text-text-muted">Live Notices</span>
            </p>
            <span className="text-[11px] text-text-secondary mt-1 block">Live across resident feeds</span>
          </div>

          <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Pinned Broadcasts</span>
              <div className="w-8 h-8 rounded-xl bg-status-warning/15 text-status-warning flex items-center justify-center">
                <Pin className="w-4 h-4" />
              </div>
            </div>
            <p className="font-mono font-black text-2xl text-text-primary mt-2">
              {pinnedCount} <span className="text-sm font-normal text-text-muted">Priority Advisories</span>
            </p>
            <span className="text-[11px] text-primary font-medium mt-1 block">Pinned at top of resident app</span>
          </div>

          <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Average Resident Read Rate</span>
              <div className="w-8 h-8 rounded-xl bg-status-success/15 text-status-success flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="font-mono font-black text-2xl text-status-success mt-2">
              {avgReadRate || 89}% <span className="text-sm font-normal text-text-muted">Acknowledged</span>
            </p>
            <span className="text-[11px] text-status-success font-medium mt-1 block">142 / 160 Units Engaged</span>
          </div>
        </div>

        {/* Filter Tabs and Search Bar */}
        <div className="bg-card rounded-panel border border-border p-4 shadow-card space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(categoryTabs ?? []).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeCategory === tab.id
                      ? 'bg-primary text-background shadow-orange-glow'
                      : 'bg-surface hover:bg-border/60 text-text-secondary hover:text-text-primary border border-border'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Keyword Search */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search circulars by keyword..."
                className="w-full bg-surface border border-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Published Circulars Feed */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="bg-card rounded-panel border border-border p-12 text-center text-text-muted">
            <Bell className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-text-primary">No circulars found</p>
            <p className="text-xs text-text-secondary mt-1">Try clearing your search query or filter tab.</p>
          </div>
        ) : (
          (filteredList ?? []).map((ann) => {
            const isCritical = ann.priority === 'CRITICAL';
            const isImportant = ann.priority === 'IMPORTANT';
            const readCount = Number(ann.readCount ?? 142);
            const totalTargetFlats = Number(ann.totalTargetFlats ?? 160);
            const readPercentage = Math.round((readCount / totalTargetFlats) * 100);

            return (
              <div
                key={ann.id}
                className={`bg-card rounded-2xl border p-5 shadow-card transition flex flex-col justify-between ${
                  ann.isPinned
                    ? 'border-primary/50 shadow-orange-glow'
                    : isCritical
                    ? 'border-status-danger/40'
                    : 'border-border'
                }`}
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/70">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-primary text-xs px-2.5 py-0.5 rounded-md bg-surface border border-border">
                        {ann.referenceId || `CIR-${ann.id.slice(-4)}`}
                      </span>

                      {/* Category Badge */}
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                        {ann.category}
                      </span>

                      {/* Priority Badge */}
                      {isCritical ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-status-danger/15 text-status-danger border border-status-danger/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Critical Advisory
                        </span>
                      ) : isImportant ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-status-warning/15 text-status-warning border border-status-warning/30">
                          Important Notice
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface text-text-secondary border border-border">
                          Normal Circular
                        </span>
                      )}

                      {/* Target Audience */}
                      <span className="text-[11px] text-text-secondary flex items-center gap-1 font-medium">
                        <Users className="w-3 h-3 text-text-muted" /> {ann.targetAudience || 'All Towers'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1 text-[11px] font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(ann.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>

                      {ann.isPinned && (
                        <span className="px-2 py-0.5 rounded-md bg-primary text-background font-bold text-[10px] flex items-center gap-1 shadow-sm">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="pt-4">
                    <h3 className="font-bold text-base text-text-primary tracking-tight">{ann.title}</h3>
                    <p className="text-xs text-text-secondary mt-2 leading-relaxed whitespace-pre-line">
                      {ann.content}
                    </p>
                    <p className="text-[11px] text-text-muted mt-3">
                      Published by: <span className="font-semibold text-text-primary">{ann.authorName || 'Priya Nair (RWA President)'}</span>
                    </p>
                  </div>

                  {/* Read Receipt Progress Bar */}
                  <div className="mt-4 p-3 rounded-xl bg-surface border border-border">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-text-muted flex items-center gap-1.5 font-medium">
                        <Eye className="w-3.5 h-3.5 text-primary" /> Resident Read Acknowledgment:
                      </span>
                      <span className="font-mono font-bold text-text-primary">
                        {readCount} / {totalTargetFlats} Flats ({readPercentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, readPercentage))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-4 pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePin(ann.id, ann.isPinned)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                        ann.isPinned
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {ann.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                      <span>{ann.isPinned ? 'Unpin from Top' : 'Pin to Top'}</span>
                    </button>

                    <button
                      onClick={() => handleSendReminder(ann.title, ann.referenceId)}
                      className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-primary text-xs font-semibold text-text-secondary hover:text-primary transition flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reminder Push</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(ann.id, ann.referenceId)}
                    className="p-2 rounded-xl bg-surface border border-border hover:border-status-danger text-text-muted hover:text-status-danger transition"
                    title="Archive circular"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Publish New Circular Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Publish Society Broadcast Circular"
        subtitle="Dispatches official communication to all resident alert panels and notification channels"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="GOVERNANCE">RWA / AGM Governance</option>
                <option value="MAINTENANCE">Maintenance & Outages</option>
                <option value="EVENTS">Community Events</option>
                <option value="EMERGENCY">Emergency Advisory</option>
                <option value="GENERAL">General Circular</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Important (Amber Banner)</option>
                <option value="CRITICAL">Critical (Red Siren Escalation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="All Towers">All Towers (120 Units)</option>
                <option value="Tower A">Tower A Residents Only</option>
                <option value="Tower B">Tower B Residents Only</option>
                <option value="Tower C">Tower C Residents Only</option>
                <option value="Owners Only">Registered Owners Only</option>
                <option value="Tenants Only">Tenant Units Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Circular Headline / Subject</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Semi-Annual Water Tank Disinfection Schedule"
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Full Announcement Body</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Specify agenda, timings, impacted blocks, and instructions for residents..."
              className="w-full bg-card border border-border rounded-xl p-3 text-xs text-text-primary focus:border-primary focus:outline-none leading-relaxed"
            />
          </div>

          {/* Delivery Channels */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">Disbursement Channels</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="p-2.5 rounded-xl bg-surface border border-border flex items-center gap-2 cursor-pointer text-xs text-text-primary select-none">
                <input
                  type="checkbox"
                  checked={channels.inApp}
                  onChange={(e) => setChannels({ ...channels, inApp: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-0"
                />
                <Bell className="w-3.5 h-3.5 text-primary" />
                <span>In-App Noticeboard</span>
              </label>

              <label className="p-2.5 rounded-xl bg-surface border border-border flex items-center gap-2 cursor-pointer text-xs text-text-primary select-none">
                <input
                  type="checkbox"
                  checked={channels.whatsapp}
                  onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-0"
                />
                <MessageSquare className="w-3.5 h-3.5 text-status-success" />
                <span>WhatsApp Alert</span>
              </label>

              <label className="p-2.5 rounded-xl bg-surface border border-border flex items-center gap-2 cursor-pointer text-xs text-text-primary select-none">
                <input
                  type="checkbox"
                  checked={channels.email}
                  onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-0"
                />
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>Email Circular</span>
              </label>
            </div>
          </div>

          {/* Pin Checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs text-text-primary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-border text-primary"
              />
              <span className="font-semibold">Pin this notice to top of resident feed</span>
            </label>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Publishing...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Circular</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default AdminAnnouncements;
