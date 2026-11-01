import React, { useState, useEffect } from 'react';
import { Bell, Plus, Pin, Clock } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';
import { Announcement } from '../../types';

export const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [isPinned, setIsPinned] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.getAnnouncements();
      if (res.success) setAnnouncements(res.announcements || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createAnnouncement({
        title,
        content,
        category,
        isPinned,
      });
      if (res.success) {
        setShowModal(false);
        setTitle('');
        setContent('');
        fetchAnnouncements();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Society Announcements & Broadcasts</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Broadcast official notices, utility shutdowns, and emergency advisories to all resident dashboards
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`bg-card rounded-2xl border p-5 transition-all shadow-sm ${
              ann.isPinned ? 'border-primary/50 shadow-orange-glow' : 'border-border'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface text-primary border border-primary/30 uppercase">
                  {ann.category}
                </span>
                {ann.isPinned && (
                  <span className="flex items-center gap-1 text-[11px] text-primary font-semibold">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
              </div>
              <span className="text-[11px] text-text-muted flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(ann.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
            </div>

            <h3 className="font-bold text-sm text-text-primary">{ann.title}</h3>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed whitespace-pre-line">
              {ann.content}
            </p>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Publish Society Announcement"
        subtitle="Will appear on all resident dashboard alert panels"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="GENERAL">General Notice</option>
                <option value="URGENT">Urgent Advisory</option>
                <option value="MAINTENANCE">Maintenance Supply</option>
                <option value="EVENT">Community Event</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs text-text-primary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-border bg-card text-primary"
                />
                <span>Pin to top of feed</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Semi-Annual Water Tank Disinfection"
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
              placeholder="Specify timings, impact, and resident instructions..."
              className="w-full bg-card border border-border rounded-xl p-3 text-xs text-text-primary focus:border-primary focus:outline-none"
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
              Publish Notice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

