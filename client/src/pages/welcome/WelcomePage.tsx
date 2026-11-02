import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Shield,
  Clock,
  Zap,
  Lock,
  Activity,
  Layers,
  Check,
  Smartphone,
  CheckCircle2,
  Bell,
  Sliders,
  Database,
} from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const { isAuthenticated, role, quickLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'security' | 'billing' | 'amenities' | 'iot'>('security');

  const handleDemoLogin = async (targetRole: 'RESIDENT' | 'SECURITY' | 'ADMIN') => {
    await quickLogin(targetRole);
    if (targetRole === 'RESIDENT') navigate('/resident/dashboard');
    if (targetRole === 'SECURITY') navigate('/security/dashboard');
    if (targetRole === 'ADMIN') navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col selection:bg-primary/30 font-sans">
      {/* Top Corporate Header */}
      <header className="sticky top-0 z-50 h-20 border-b border-border/70 px-6 sm:px-12 flex items-center justify-between bg-background/85 backdrop-blur-xl">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-text-secondary">
          <a href="#features" className="hover:text-primary transition">Features</a>
          <a href="#interactive-preview" className="hover:text-primary transition">Live Platform</a>
          <a href="#architecture" className="hover:text-primary transition">Enterprise Security</a>
          <a href="#roles" className="hover:text-primary transition">Instant Demo</a>
        </nav>

        {/* Right Action CTAs */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => {
                if (role === 'RESIDENT') navigate('/resident/dashboard');
                else if (role === 'SECURITY') navigate('/security/dashboard');
                else if (role === 'ADMIN') navigate('/admin/dashboard');
              }}
              className="px-4 py-2 rounded-xl bg-primary text-background text-xs font-bold hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-1.5"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text-primary hover:border-primary/50 hover:bg-card transition"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register-society')}
                className="px-4 py-2 rounded-xl bg-primary text-background text-xs font-bold hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-1.5"
              >
                <span>Onboard Society</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 sm:px-12 flex flex-col items-center text-center overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[130px] pointer-events-none rounded-full" />

        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>v2.6 Enterprise Edition • Full Multi-Tenant Operations Suite</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.12]">
          Intelligent Operations for Modern <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Residential Societies</span>
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-text-secondary max-w-2xl mt-6 leading-relaxed">
          The all-in-one residential operations platform unifying gate security with expiring QR passes, itemized maintenance billing, conflict-free amenity bookings, and real-time smart IoT telemetry.
        </p>

        {/* CTA Group */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            onClick={() => handleDemoLogin('ADMIN')}
            className="px-6 py-3.5 rounded-xl bg-primary text-background font-bold text-xs sm:text-sm hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2"
          >
            <span>Explore Live Admin Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/register-society')}
            className="px-6 py-3.5 rounded-xl bg-surface hover:bg-card border border-border text-text-primary font-bold text-xs sm:text-sm transition flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-primary" />
            <span>Launch Society Registration Wizard</span>
          </button>
        </div>

        {/* Metrics Ticker Ribbon */}
        <div className="w-full max-w-5xl mt-16 pt-8 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-text-primary font-sans">140+</p>
            <p className="text-xs text-text-muted mt-0.5">Societies Onboarded</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-primary font-sans">48,000+</p>
            <p className="text-xs text-text-muted mt-0.5">Verified QR Passes</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-text-primary font-sans">&lt; 2.4s</p>
            <p className="text-xs text-text-muted mt-0.5">Gate Clearance Speed</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-status-success font-sans">99.98%</p>
            <p className="text-xs text-text-muted mt-0.5">IoT Telemetry Uptime</p>
          </div>
        </div>
      </section>

      {/* Interactive Live Platform Showcase */}
      <section id="interactive-preview" className="py-16 px-6 sm:px-12 bg-surface/30 border-y border-border/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Experience the RESISYNC Control Center
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-2">
              Explore how each operational subsystem delivers automated precision for residents, guards, and estate committees.
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              { id: 'security', label: 'Gate & Visitor Security', icon: QrCode },
              { id: 'billing', label: 'Maintenance & Financials', icon: CreditCard },
              { id: 'amenities', label: 'Amenity Marketplace', icon: Building2 },
              { id: 'iot', label: 'Smart IoT Telemetry', icon: Cpu },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                    isActive
                      ? 'bg-primary text-background shadow-orange-glow'
                      : 'bg-card text-text-secondary border border-border hover:border-primary/40 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mockup Display Card */}
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-elevated">
            {activeTab === 'security' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-1 space-y-4 text-left">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    Screen 4 & 11 Reference
                  </span>
                  <h3 className="text-xl font-bold text-white">Smart QR Passes & Gate Logs</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Residents generate time-bound, encrypted visitor QR passes with 6-digit backup codes. Security guards verify and check in guests instantly using the live camera laser console.
                  </p>
                  <ul className="space-y-2 text-xs text-text-muted">
                    <li className="flex items-center gap-2 text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Unpredictable expiring cryptographic tokens
                    </li>
                    <li className="flex items-center gap-2 text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Guard parcel & courier delivery tracking
                    </li>
                    <li className="flex items-center gap-2 text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Real-time resident push notifications
                    </li>
                  </ul>
                  <button
                    onClick={() => handleDemoLogin('SECURITY')}
                    className="mt-2 px-4 py-2 rounded-xl bg-primary text-background text-xs font-bold hover:bg-primary-hover shadow-orange-glow transition inline-flex items-center gap-1.5"
                  >
                    Open Guard Scanner Console <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Simulated Security Console UI */}
                <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-5 font-mono text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-ping" />
                      <span className="font-bold text-white font-sans">MAIN GATE SECURITY SCANNER</span>
                    </div>
                    <span className="text-[11px] text-text-muted">LIVE TELEMETRY</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-card border border-border">
                      <p className="text-text-muted text-[10px]">VERIFIED PASS</p>
                      <p className="font-bold text-text-primary text-sm mt-0.5">Kavita Iyer (Guest)</p>
                      <p className="text-primary font-black mt-1">CODE: 829-410</p>
                      <p className="text-text-muted text-[10px] mt-1">Flat A-402 • Entry Approved</p>
                    </div>
                    <div className="p-3 rounded-lg bg-card border border-border">
                      <p className="text-text-muted text-[10px]">RECENT DELIVERIES</p>
                      <p className="font-bold text-text-primary text-sm mt-0.5">Amazon Prime (Package #889)</p>
                      <p className="text-status-info font-semibold mt-1">AT GATE CONSOLE</p>
                      <p className="text-text-muted text-[10px] mt-1">Awaiting Resident Handover</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-between">
                    <span>Gate Access Status: RE-ENTRY PREVENTED • PASS SINGLE-USE</span>
                    <span className="font-bold">200 OK</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-1 space-y-4 text-left">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    Screen 5 Reference
                  </span>
                  <h3 className="text-xl font-bold text-white">Itemized Maintenance & Sandbox UPI</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Transparent dues breakdown across base society maintenance, water infrastructure, parking bay reservations, and diesel generator backup costs.
                  </p>
                  <ul className="space-y-2 text-xs text-text-muted">
                    <li className="flex items-center gap-2 text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Automated monthly billing cycle generation
                    </li>
                    <li className="flex items-center gap-2 text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Simulated UPI & Card payment sandbox
                    </li>
                    <li className="flex items-center gap-2 text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Downloadable PDF invoices with receipt stamps
                    </li>
                  </ul>
                  <button
                    onClick={() => handleDemoLogin('RESIDENT')}
                    className="mt-2 px-4 py-2 rounded-xl bg-primary text-background text-xs font-bold hover:bg-primary-hover shadow-orange-glow transition inline-flex items-center gap-1.5"
                  >
                    View Resident Billing Page <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Simulated Billing Table */}
                <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-5 text-xs text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                    <div>
                      <p className="text-text-muted text-[10px]">CURRENT BILLING CYCLE</p>
                      <h4 className="font-bold text-white text-sm">November 2026 • Flat A-402</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-status-success/15 text-status-success font-bold text-xs">
                      SETTLED (PAID)
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between py-1.5 border-b border-border/50 text-text-secondary">
                      <span>Standard Society Maintenance (1,650 sq.ft)</span>
                      <span className="font-mono text-white">₹3,200</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/50 text-text-secondary">
                      <span>Water Consumption & Filtration Infrastructure</span>
                      <span className="font-mono text-white">₹450</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/50 text-text-secondary">
                      <span>Basement Covered Parking Bay #B-24</span>
                      <span className="font-mono text-white">₹500</span>
                    </div>
                    <div className="flex justify-between py-2 text-text-primary font-bold">
                      <span>Total Net Payable</span>
                      <span className="font-mono text-primary text-base">₹4,150</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-card border border-border text-[11px] text-text-muted flex justify-between items-center">
                    <span>Receipt No: <strong className="text-text-primary font-mono">RCPT-2026-9481</strong></span>
                    <span className="text-status-success font-semibold">Instant Confetti Feedback Enabled</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'amenities' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-1 space-y-4 text-left">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    Screen 6 Reference
                  </span>
                  <h3 className="text-xl font-bold text-white">Conflict-Free Amenity Booking</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Interactive amenity marketplace with capacity restrictions, operating schedules, and database transaction locking to eliminate double-booking conflicts.
                  </p>
                  <ul className="space-y-2 text-xs text-text-muted">
                    <li className="flex items-center gap-2 text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Swimming pool, Gym, Clubhouse, Tennis Court
                    </li>
                    <li className="flex items-center gap-2 text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Overlap conflict safeguard (HTTP 409 guard)
                    </li>
                    <li className="flex items-center gap-2 text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Instant booking confirmation & pass badge
                    </li>
                  </ul>
                  <button
                    onClick={() => handleDemoLogin('RESIDENT')}
                    className="mt-2 px-4 py-2 rounded-xl bg-primary text-background text-xs font-bold hover:bg-primary-hover shadow-orange-glow transition inline-flex items-center gap-1.5"
                  >
                    Test Amenity Booking <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Simulated Amenity Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="p-4 rounded-xl bg-surface border border-border flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-white">Olympic Swimming Pool</span>
                        <p className="text-[11px] text-text-muted mt-0.5">Capacity: 25 Persons</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-status-success/15 text-status-success text-[10px] font-bold">
                        OPEN
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-muted">Hours: 06:00 - 21:00</span>
                      <span className="text-primary font-bold">Free for Residents</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-border flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-white">All-Weather Tennis Court</span>
                        <p className="text-[11px] text-text-muted mt-0.5">Floodlit Synthetic Turf</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-bold">
                        SLOTS OPEN
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-muted">Slot Duration: 60 min</span>
                      <span className="text-primary font-bold">Max 4 Guests</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'iot' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-1 space-y-4 text-left">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    Screen 9 Reference
                  </span>
                  <h3 className="text-xl font-bold text-white">Live Smart Society Telemetry</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Hardware sensor feeds monitoring overhead water reservoir levels, 250kVA diesel backup genset fuel, rooftop solar generation, and campus EV charging hubs.
                  </p>
                  <ul className="space-y-2 text-xs text-text-muted">
                    <li className="flex items-center gap-2 text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Live 3-second heartbeat telemetry
                    </li>
                    <li className="flex items-center gap-2 text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Low-level water & fuel depletion alerts
                    </li>
                    <li className="flex items-center gap-2 text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> 24x7 Emergency SOS Panic Station
                    </li>
                  </ul>
                  <button
                    onClick={() => handleDemoLogin('RESIDENT')}
                    className="mt-2 px-4 py-2 rounded-xl bg-primary text-background text-xs font-bold hover:bg-primary-hover shadow-orange-glow transition inline-flex items-center gap-1.5"
                  >
                    View Live IoT Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Simulated IoT Grid */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-3 text-left">
                  <div className="p-4 rounded-xl bg-surface border border-border">
                    <p className="text-text-muted text-[10px] font-mono">WATER OVERHEAD TANK</p>
                    <p className="text-2xl font-black text-status-success font-mono mt-1">84%</p>
                    <p className="text-[11px] text-text-secondary mt-1">42,000 / 50,000 Litres</p>
                    <div className="w-full bg-card h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-status-success h-full w-[84%]" />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-border">
                    <p className="text-text-muted text-[10px] font-mono">DIESEL GENSET 250kVA</p>
                    <p className="text-2xl font-black text-primary font-mono mt-1">91%</p>
                    <p className="text-[11px] text-text-secondary mt-1">Standby • 450L Diesel Reserve</p>
                    <div className="w-full bg-card h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-primary h-full w-[91%]" />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-border">
                    <p className="text-text-muted text-[10px] font-mono">ROOFTOP SOLAR ARRAY</p>
                    <p className="text-2xl font-black text-status-warning font-mono mt-1">38.4 kW</p>
                    <p className="text-[11px] text-text-secondary mt-1">Active Clean Generation</p>
                    <div className="w-full bg-card h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-status-warning h-full w-[76%]" />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-border">
                    <p className="text-text-muted text-[10px] font-mono">CAMPUS EV FAST CHARGERS</p>
                    <p className="text-2xl font-black text-status-info font-mono mt-1">4 / 6</p>
                    <p className="text-[11px] text-text-secondary mt-1">Bays Currently Available</p>
                    <div className="w-full bg-card h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-status-info h-full w-[66%]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Role-Based Fast Access Station */}
      <section id="roles" className="py-16 px-6 sm:px-12 max-w-6xl mx-auto w-full text-center">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">
          Instant Interactive Demonstrations
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
          Select a Role to Experience the Platform
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto mt-2">
          Jump straight into pre-seeded operational workflows with zero friction.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {/* Resident Card */}
          <div
            onClick={() => handleDemoLogin('RESIDENT')}
            className="bg-card hover:bg-card-hover border border-border hover:border-primary/50 p-6 rounded-2xl cursor-pointer text-left transition-all duration-200 hover:-translate-y-1 shadow-card group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-orange-glow">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-primary transition">
                Resident Portal
              </h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Invite visitors with QR passes, pay itemized maintenance dues with mock UPI, book sports courts, track packages, and trigger 24x7 emergency SOS.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-primary font-bold">
              <span>Launch A-402 Resident View</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Security Guard Card */}
          <div
            onClick={() => handleDemoLogin('SECURITY')}
            className="bg-card hover:bg-card-hover border border-border hover:border-status-info/50 p-6 rounded-2xl cursor-pointer text-left transition-all duration-200 hover:-translate-y-1 shadow-card group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-status-info/15 text-status-info flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-status-info transition">
                Security Gate Console
              </h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Scan visitor QR passes with the interactive camera laser, verify 6-digit codes, register walk-in guests, log courier deliveries, and manage gate activity.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-status-info font-bold">
              <span>Launch Main Gate Station</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Admin Card */}
          <div
            onClick={() => handleDemoLogin('ADMIN')}
            className="bg-card hover:bg-card-hover border border-border hover:border-orange-500/50 p-6 rounded-2xl cursor-pointer text-left transition-all duration-200 hover:-translate-y-1 shadow-card group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition">
                Society Administrator
              </h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Oversee society Recharts analytics, generate billing cycles, resolve helpdesk tickets, broadcast announcements, and configure Firebase Cloud Sync.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-orange-400 font-bold">
              <span>Launch Management HQ</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Security & Cloud Sync Architecture Banner */}
      <section id="architecture" className="py-16 px-6 sm:px-12 bg-surface/20 border-t border-border/60">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          <div className="space-y-3 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-[11px] font-bold">
              ENTERPRISE MULTI-TENANCY & CLOUD REPLICATION
            </span>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Firebase Integration & Real-Time Cloud Synchronization
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              RESISYNC features a dedicated Firebase & Cloud Sync engine supporting bidirectional Firestore document replication, real-time FCM push notifications, and tamper-resistant administrative audit logging.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/register-society')}
              className="px-5 py-3 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2"
            >
              <span>Onboard Your Society</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-3 rounded-xl bg-card border border-border font-bold text-xs text-text-primary hover:bg-card-hover transition"
            >
              Sign In to Existing Society
            </button>
          </div>
        </div>
      </section>

      {/* Corporate Footer */}
      <footer className="py-12 border-t border-border/60 px-6 sm:px-12 bg-background">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary text-background font-black flex items-center justify-center text-xs">
              R
            </div>
            <span className="font-bold text-text-primary">RESISYNC PLATFORM</span>
            <span>• Next-Gen Residential Operations</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span>Bank-Grade 256-Bit SSL</span>
            <span>ISO 27001 Aligned</span>
            <span>RERA Compliant</span>
            <span>© 2026 ResiSync Operations Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
