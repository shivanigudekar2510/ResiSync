import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Sparkles,
  LifeBuoy,
  Bell,
  Cpu,
  UserCheck,
  QrCode,
  Package,
  History,
  AlertTriangle,
  Building2,
  FileText,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose }) => {
  const { user, role, logout, quickLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const residentNav = [
    { label: 'Dashboard', path: '/resident/dashboard', icon: LayoutDashboard },
    { label: 'Visitor Passes', path: '/resident/visitors', icon: UserCheck },
    { label: 'Maintenance & Dues', path: '/resident/maintenance', icon: CreditCard },
    { label: 'Amenities', path: '/resident/amenities', icon: Sparkles },
    { label: 'Helpdesk & Support', path: '/resident/helpdesk', icon: LifeBuoy },
    { label: 'Alerts & Emergency', path: '/resident/alerts', icon: AlertTriangle },
    { label: 'Society IoT Status', path: '/resident/society-status', icon: Cpu },
    { label: 'Profile & Flat', path: '/resident/profile', icon: Settings },
  ];

  const securityNav = [
    { label: 'Gate Console', path: '/security/dashboard', icon: LayoutDashboard },
    { label: 'Scan Visitor QR', path: '/security/scan', icon: QrCode },
    { label: 'Expected Visitors', path: '/security/visitors', icon: UserCheck },
    { label: 'Gate Deliveries', path: '/security/deliveries', icon: Package },
    { label: 'Entry/Exit Log', path: '/security/history', icon: History },
    { label: 'Emergency Panic', path: '/security/emergency', icon: AlertTriangle },
  ];

  const adminNav = [
    { label: 'Executive Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Residents Roster', path: '/admin/residents', icon: Users },
    { label: 'Flats & Inventory', path: '/admin/flats', icon: Building2 },
    { label: 'Visitors Log', path: '/admin/visitors', icon: UserCheck },
    { label: 'Maintenance Billing', path: '/admin/maintenance', icon: CreditCard },
    { label: 'Amenities Control', path: '/admin/amenities', icon: Sparkles },
    { label: 'Helpdesk Operations', path: '/admin/complaints', icon: LifeBuoy },
    { label: 'Announcements', path: '/admin/announcements', icon: Bell },
    { label: 'Smart IoT Hub', path: '/admin/iot', icon: Cpu },
    { label: 'Society & Audit Logs', path: '/admin/settings', icon: Settings },
  ];

  let currentNav = residentNav;
  if (role === 'SECURITY') currentNav = securityNav;
  if (role === 'ADMIN') currentNav = adminNav;

  const handleRoleSwitch = async (newRole: 'RESIDENT' | 'SECURITY' | 'ADMIN') => {
    await quickLogin(newRole);
    if (newRole === 'RESIDENT') navigate('/resident/dashboard');
    if (newRole === 'SECURITY') navigate('/security/dashboard');
    if (newRole === 'ADMIN') navigate('/admin/dashboard');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-border bg-[#0A1016]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center shadow-orange-glow text-background font-black text-sm">
              R
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wider text-text-primary flex items-center gap-1 font-sans">
                RESI<span className="text-primary font-black">SYNC</span>
              </span>
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-mono">
                Smart Operations
              </p>
            </div>
          </div>
        </div>

        {/* Current Society & Flat Pill */}
        <div className="p-3 mx-3 my-3 rounded-xl bg-card border border-border/80">
          <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary">
            <span className="truncate">{(user as any)?.society?.name || localStorage.getItem('resisync_society_name') || 'Greenview Residency'}</span>
            <span className="w-2 h-2 rounded-full bg-status-success live-pulse" title="System Online" />
          </div>
          <div className="flex items-center justify-between mt-1 text-xs">
            <span className="text-text-primary font-medium">
              {role === 'RESIDENT' ? `Unit ${user?.flat?.flatNumber || 'A-402'}` : role === 'SECURITY' ? 'Gate 1 Post' : 'Society Office'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary border border-primary/30">
              {role}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary text-background font-semibold shadow-orange-glow'
                    : 'text-text-secondary hover:text-text-primary hover:bg-card'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-background' : 'text-text-secondary'}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-background" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Role Switcher for seamless testing */}
        <div className="px-3 py-2 border-t border-border bg-[#0C1217]">
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted px-1 mb-1.5">
            Quick Switch Demo Role
          </p>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => handleRoleSwitch('RESIDENT')}
              className={`py-1 text-[11px] rounded font-medium transition ${
                role === 'RESIDENT' ? 'bg-primary text-background font-bold' : 'bg-card text-text-secondary hover:text-white'
              }`}
            >
              Resident
            </button>
            <button
              onClick={() => handleRoleSwitch('SECURITY')}
              className={`py-1 text-[11px] rounded font-medium transition ${
                role === 'SECURITY' ? 'bg-primary text-background font-bold' : 'bg-card text-text-secondary hover:text-white'
              }`}
            >
              Guard
            </button>
            <button
              onClick={() => handleRoleSwitch('ADMIN')}
              className={`py-1 text-[11px] rounded font-medium transition ${
                role === 'ADMIN' ? 'bg-primary text-background font-bold' : 'bg-card text-text-secondary hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* User Footer Profile & Logout */}
        <div className="p-3 border-t border-border bg-[#0A1016] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full border border-border object-cover"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-text-primary truncate">{user?.name || 'Rahul Sharma'}</p>
              <p className="text-[10px] text-text-muted truncate">{user?.email || 'resident@resisync.com'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 rounded-lg text-text-secondary hover:text-status-danger hover:bg-card transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};

