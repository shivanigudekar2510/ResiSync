import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Users } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('resident@resisync.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(identifier, password);
      navigate('/resident/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  const handleQuickRole = async (role: 'RESIDENT' | 'SECURITY' | 'ADMIN') => {
    setError(null);
    try {
      await quickLogin(role);
      if (role === 'RESIDENT') navigate('/resident/dashboard');
      if (role === 'SECURITY') navigate('/security/dashboard');
      if (role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-8">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/welcome')}>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center shadow-orange-glow text-background font-black text-lg">
          R
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-wider text-text-primary font-sans">
            RESI<span className="text-primary font-black">SYNC</span>
          </h1>
          <p className="text-[10px] text-text-muted tracking-widest font-mono uppercase">
            Residential Operations
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-surface border border-border rounded-panel p-6 sm:p-8 shadow-elevated">
        <h2 className="text-xl font-bold text-white tracking-tight">Sign In to RESISYNC</h2>
        <p className="text-xs text-text-secondary mt-1">
          Access your residential operations dashboard & services
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs">
            {error}
          </div>
        )}

        {/* Demo Fast Account Switcher Buttons */}
        <div className="mt-5 p-3 rounded-xl bg-card border border-border">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 text-center">
            Instant 1-Click Demo Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickRole('RESIDENT')}
              className="py-1.5 px-2 rounded-lg bg-surface hover:bg-primary/20 hover:text-primary border border-border text-[11px] font-semibold text-text-secondary transition flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-primary" /> Resident
            </button>
            <button
              type="button"
              onClick={() => handleQuickRole('SECURITY')}
              className="py-1.5 px-2 rounded-lg bg-surface hover:bg-status-info/20 hover:text-status-info border border-border text-[11px] font-semibold text-text-secondary transition flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-status-info" /> Guard
            </button>
            <button
              type="button"
              onClick={() => handleQuickRole('ADMIN')}
              className="py-1.5 px-2 rounded-lg bg-surface hover:bg-orange-500/20 hover:text-orange-400 border border-border text-[11px] font-semibold text-text-secondary transition flex items-center justify-center gap-1"
            >
              <Users className="w-3.5 h-3.5 text-orange-400" /> Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Email or Mobile Number
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com or phone"
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-card border border-border rounded-xl pl-10 pr-10 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-text-muted hover:text-text-secondary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-text-secondary select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border bg-card text-primary focus:ring-0"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-primary hover:underline font-medium text-xs"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-text-secondary mt-6">
          New resident?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Register your flat unit
          </Link>
        </p>
      </div>
    </div>
  );
};

