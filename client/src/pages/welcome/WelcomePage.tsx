import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Building2,
  QrCode,
  CreditCard,
  Sparkles,
  LifeBuoy,
  Cpu,
  ArrowRight,
  CheckCircle,
  Users,
} from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const { isAuthenticated, role, quickLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === 'RESIDENT') navigate('/resident/dashboard');
      else if (role === 'SECURITY') navigate('/security/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
    }
  }, [isAuthenticated, role, navigate]);

  const handleDemoLogin = async (targetRole: 'RESIDENT' | 'SECURITY' | 'ADMIN') => {
    await quickLogin(targetRole);
    if (targetRole === 'RESIDENT') navigate('/resident/dashboard');
    if (targetRole === 'SECURITY') navigate('/security/dashboard');
    if (targetRole === 'ADMIN') navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-between selection:bg-primary/30">
      {/* Top Header */}
      <header className="h-20 border-b border-border/60 px-6 sm:px-12 flex items-center justify-between bg-surface/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center shadow-orange-glow text-background font-black text-lg">
            R
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wider text-text-primary font-sans">
              RESI<span className="text-primary font-black">SYNC</span>
            </h1>
            <p className="text-[10px] text-text-muted tracking-widest font-mono uppercase">
              Smart Residential Operations Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:border-primary/50 hover:bg-card transition"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 rounded-xl bg-primary text-background text-xs font-bold hover:bg-primary-hover shadow-orange-glow transition"
          >
            Register Flat
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 flex flex-col items-center text-center justify-center">
        {/* Modern Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Gated Community Living</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-3xl leading-tight font-sans">
          Intelligent Operations for Modern <span className="text-primary">Residential Societies</span>
        </h2>

        <p className="text-sm sm:text-base text-text-secondary max-w-2xl mt-4 leading-relaxed">
          Streamline visitor management with expiring QR passes, automated maintenance billing with itemized dues, effortless amenity reservations, and real-time smart IoT telemetry.
        </p>

        {/* Demo Fast-Login Cards */}
        <div className="w-full max-w-3xl mt-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
            Select a Demo Role to Experience the Platform Instantly
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Resident Card */}
            <div
              onClick={() => handleDemoLogin('RESIDENT')}
              className="bg-card hover:bg-card-hover border border-border hover:border-primary/50 p-5 rounded-2xl cursor-pointer text-left transition-all duration-200 hover:-translate-y-1 shadow-card group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-text-primary group-hover:text-primary transition">
                Resident Portal
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Rahul Sharma (Flat A-402). Manage guest QR passes, pay dues, book amenities.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                <span>Enter as Resident</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Security Guard Card */}
            <div
              onClick={() => handleDemoLogin('SECURITY')}
              className="bg-card hover:bg-card-hover border border-border hover:border-primary/50 p-5 rounded-2xl cursor-pointer text-left transition-all duration-200 hover:-translate-y-1 shadow-card group"
            >
              <div className="w-10 h-10 rounded-xl bg-status-info/15 text-status-info flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-text-primary group-hover:text-primary transition">
                Gate Security
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Vikram Singh (Gate 1). Scan QR codes, verify arrival passes, log parcel delivery.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                <span>Enter as Guard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Administrator Card */}
            <div
              onClick={() => handleDemoLogin('ADMIN')}
              className="bg-card hover:bg-card-hover border border-border hover:border-primary/50 p-5 rounded-2xl cursor-pointer text-left transition-all duration-200 hover:-translate-y-1 shadow-card group"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-text-primary group-hover:text-primary transition">
                Society Admin
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Priya Patel (Estate Office). Financial analytics, flat inventory, tickets, IoT grid.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                <span>Enter as Admin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="w-full max-w-4xl mt-16 pt-10 border-t border-border/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-text-primary">Expiring QR Passes</p>
              <p className="text-[11px] text-text-muted mt-0.5">Secure server-side token checks</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-text-primary">Instant SOS Panic</p>
              <p className="text-[11px] text-text-muted mt-0.5">24x7 gate security siren alert</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-text-primary">Double-Booking Safe</p>
              <p className="text-[11px] text-text-muted mt-0.5">Atomic transaction locks</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-text-primary">Live IoT Telemetry</p>
              <p className="text-[11px] text-text-muted mt-0.5">Water, power, AQI & parking</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border/50 text-center text-xs text-text-muted bg-[#080E13]">
        <p>RESISYNC Platform &copy; 2026. Built for Greenview Residency community operations.</p>
      </footer>
    </div>
  );
};

