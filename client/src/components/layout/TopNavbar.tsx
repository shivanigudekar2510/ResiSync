import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Menu,
  Bell,
  Search,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Shield,
  LifeBuoy,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import api from '../../services/api';

interface TopNavbarProps {
  onToggleSidebar: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [isTriggeringSos, setIsTriggeringSos] = useState(false);
  const [sosType, setSosType] = useState<'SECURITY' | 'MEDICAL' | 'FIRE' | 'OTHER'>('SECURITY');
  const [sosSuccess, setSosSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSosSubmit = async () => {
    setIsTriggeringSos(true);
    try {
      await api.triggerEmergency(sosType, 'SOS triggered from platform top bar');
      setSosSuccess(true);
      setTimeout(() => {
        setSosSuccess(false);
        setShowSosModal(false);
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTriggeringSos(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-surface/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-8">
        {/* Left Section: Menu Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-card lg:hidden transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs text-text-muted">
            <Search className="w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search flats, visitors, passes, tickets..."
              className="bg-transparent border-none outline-none text-xs text-text-primary placeholder:text-text-muted w-64"
            />
          </div>
        </div>

        {/* Right Section: Emergency SOS, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Emergency SOS Button */}
          <button
            onClick={() => setShowSosModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-status-emergency/15 text-red-400 border border-status-emergency/40 text-xs font-bold hover:bg-status-emergency/25 transition shadow-sm animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>SOS</span>
          </button>

          {/* IoT Society Status Indicator */}
          <div
            onClick={() => {
              if (role === 'RESIDENT') navigate('/resident/society-status');
              else if (role === 'ADMIN') navigate('/admin/iot');
            }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs cursor-pointer hover:border-primary/40 transition"
          >
            <span className="w-2 h-2 rounded-full bg-status-success live-pulse" />
            <span className="text-text-secondary text-[11px] font-medium">IoT Grid Normal</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-card border border-transparent hover:border-border transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-background font-bold text-[10px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-surface rounded-2xl border border-border shadow-elevated overflow-hidden z-50">
                <div className="p-3 border-b border-border flex items-center justify-between bg-card/60">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Notifications ({unreadCount})
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-text-muted">
                      No recent notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.link) navigate(n.link);
                          setShowNotifMenu(false);
                        }}
                        className={`p-3 text-xs cursor-pointer hover:bg-card transition ${
                          !n.isRead ? 'bg-primary/5 font-medium' : 'text-text-secondary'
                        }`}
                      >
                        <p className="font-semibold text-text-primary text-[11px] flex items-center justify-between">
                          <span>{n.title}</span>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          )}
                        </p>
                        <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-xl border border-border object-cover cursor-pointer"
              onClick={() => {
                if (role === 'RESIDENT') navigate('/resident/profile');
                else if (role === 'ADMIN') navigate('/admin/settings');
              }}
            />
          </div>
        </div>
      </header>

      {/* Emergency SOS Confirmation Modal */}
      <Modal
        isOpen={showSosModal}
        onClose={() => setShowSosModal(false)}
        title="🚨 RESISYNC Emergency Dispatch"
        subtitle="Broadcast immediate high-priority alarm to Gate Security & Society Command"
      >
        {sosSuccess ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-status-success mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Emergency SOS Transmitted!</h4>
            <p className="text-xs text-text-secondary max-w-xs mx-auto">
              Main Gate security desk (24x7) and society emergency response team have received your coordinates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-text-secondary leading-relaxed">
              Select the type of emergency for priority routing. Gate guards will be notified via audio siren immediately.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {(['SECURITY', 'MEDICAL', 'FIRE', 'OTHER'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSosType(type)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition ${
                    sosType === type
                      ? 'bg-status-emergency/20 border-status-emergency text-red-300 shadow-sm'
                      : 'bg-card border-border text-text-secondary hover:text-white'
                  }`}
                >
                  <span className="block text-sm mb-1">
                    {type === 'SECURITY' && '🛡️ Security Threat'}
                    {type === 'MEDICAL' && '🚑 Medical Emergency'}
                    {type === 'FIRE' && '🔥 Fire Incident'}
                    {type === 'OTHER' && '⚠️ Other Urgency'}
                  </span>
                  <span className="text-[10px] text-text-muted font-normal">
                    Direct dispatch to Gate 1
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSosModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-text-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={isTriggeringSos}
                onClick={handleSosSubmit}
                className="px-5 py-2.5 rounded-xl bg-status-emergency text-white font-bold text-xs hover:bg-red-700 shadow-md transition flex items-center gap-1.5"
              >
                {isTriggeringSos ? 'Transmitting...' : 'CONFIRM & SOUND SOS'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
