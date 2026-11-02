import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { User, Mail, Phone, Lock, Home, Key, ArrowRight, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    flatNumber: 'A-301',
    societyCode: 'GRNVW-2026',
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        flatNumber: formData.flatNumber,
        societyCode: formData.societyCode,
      });
      navigate('/resident/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check society code and details.');
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-center items-center px-4 py-8">
      {/* Top Corner Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

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
            Resident Onboarding
          </p>
        </div>
      </div>

      {/* Register Card */}
      <div className="w-full max-w-lg bg-surface border border-border rounded-panel p-6 sm:p-8 shadow-elevated">
        <h2 className="text-xl font-bold text-white tracking-tight">Register Resident Account</h2>
        <p className="text-xs text-text-secondary mt-1">
          Link your apartment unit with Greenview Residency platform
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ananya Sen"
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ananya@example.com"
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 00000"
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Society Registration Code
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.societyCode}
                  onChange={(e) => setFormData({ ...formData, societyCode: e.target.value.toUpperCase() })}
                  placeholder="GRNVW-2026"
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary font-mono uppercase focus:border-primary focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-text-muted">Default demo: GRNVW-2026</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Flat / Apartment Number
              </label>
              <div className="relative">
                <Home className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.flatNumber}
                  onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. A-301 or B-202"
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary uppercase focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-text-secondary mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

