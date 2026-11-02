import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Users,
  Building2,
  Sparkles,
  Check,
  Shield,
  KeyRound,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<'RESIDENT' | 'SECURITY' | 'ADMIN'>('RESIDENT');
  const [identifier, setIdentifier] = useState('resident@resisync.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyDemoRole = (role: 'RESIDENT' | 'SECURITY' | 'ADMIN') => {
    setSelectedRole(role);
    setError(null);
    if (role === 'RESIDENT') {
      setIdentifier('resident@resisync.com');
      setPassword('password123');
    } else if (role === 'SECURITY') {
      setIdentifier('guard@resisync.com');
      setPassword('password123');
    } else if (role === 'ADMIN') {
      setIdentifier('admin@resisync.com');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(identifier, password);
      if (selectedRole === 'RESIDENT') navigate('/resident/dashboard');
      else if (selectedRole === 'SECURITY') navigate('/security/dashboard');
      else if (selectedRole === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/resident/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  const handleInstantLaunch = async (role: 'RESIDENT' | 'SECURITY' | 'ADMIN') => {
    setError(null);
    try {
      await quickLogin(role);
      if (role === 'RESIDENT') navigate('/resident/dashboard');
      else if (role === 'SECURITY') navigate('/security/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-8 selection:bg-primary/30 font-sans">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => navigate('/welcome')}>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center shadow-orange-glow text-background font-black text-lg">
          R
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-wider text-text-primary font-sans">
            RESI<span className="text-primary font-black">SYNC</span>
          </h1>
          <p className="text-[10px] text-text-muted tracking-widest font-mono uppercase">
            Society Sign-In Portal
          </p>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-lg bg-surface border border-border rounded-panel p-6 sm:p-8 shadow-elevated">
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-white tracking-tight">Society Portal Sign In</h2>
          <p className="text-xs text-text-secondary mt-1">
            Sign in with your registered email or select a pre-filled demo role.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-2">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Role Selection & Instant Demo Pre-fills */}
        <div className="mt-5 p-3.5 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Instant Role Demo Pre-Fills
            </span>
            <span className="text-[10px] text-text-muted font-mono">Greenview Residency</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Resident Role Tab */}
            <button
              type="button"
              onClick={() => applyDemoRole('RESIDENT')}
              className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                selectedRole === 'RESIDENT'
                  ? 'bg-primary/15 border-primary text-primary shadow-orange-glow'
                  : 'bg-surface border-border text-text-secondary hover:border-border-light hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4 text-primary" />
              <span>Resident</span>
              <span className="text-[9px] font-normal text-text-muted">Flat A-402</span>
            </button>

            {/* Guard Role Tab */}
            <button
              type="button"
              onClick={() => applyDemoRole('SECURITY')}
              className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                selectedRole === 'SECURITY'
                  ? 'bg-status-info/15 border-status-info text-status-info'
                  : 'bg-surface border-border text-text-secondary hover:border-border-light hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-status-info" />
              <span>Security</span>
              <span className="text-[9px] font-normal text-text-muted">Gate Console</span>
            </button>

            {/* Admin Role Tab */}
            <button
              type="button"
              onClick={() => applyDemoRole('ADMIN')}
              className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                selectedRole === 'ADMIN'
                  ? 'bg-orange-500/15 border-orange-500 text-orange-400'
                  : 'bg-surface border-border text-text-secondary hover:border-border-light hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-orange-400" />
              <span>Admin</span>
              <span className="text-[9px] font-normal text-text-muted">Facility HQ</span>
            </button>
          </div>

          {/* Quick 1-Click Launch Button for the selected demo role */}
          <button
            type="button"
            onClick={() => handleInstantLaunch(selectedRole)}
            disabled={isLoading}
            className="w-full mt-2.5 py-2 rounded-xl bg-surface hover:bg-border/60 border border-border text-xs font-bold text-text-primary transition flex items-center justify-center gap-1.5"
          >
            <span>Instant 1-Click Launch as {selectedRole}</span>
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
          </button>
        </div>

        {/* Manual Credentials Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Registered Email or Mobile Number
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@resisync.com or phone"
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Account Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-primary hover:text-primary-hover transition"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-card border border-border rounded-xl pl-10 pr-10 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-text-muted hover:text-text-primary transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border text-primary focus:ring-0 bg-card w-3.5 h-3.5"
              />
              <span>Remember this workstation</span>
            </label>
            <span className="text-[11px] text-text-muted font-mono">Code: GRNVW-2026</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                <span>Authenticating with Gateway...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Action Links */}
        <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
          <Link to="/register" className="hover:text-primary transition">
            Resident Registration →
          </Link>
          <Link to="/register-society" className="text-primary font-bold hover:underline">
            Onboard New Society →
          </Link>
        </div>
      </div>
    </div>
  );
};
