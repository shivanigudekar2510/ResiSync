import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import {
  Building2,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Users,
  Lock,
  Mail,
  Phone,
  Check,
  Plus,
  Trash2,
  Rocket,
  Flame,
  Award,
} from 'lucide-react';

const AVAILABLE_AMENITIES = [
  { id: 'Club House', name: 'Club House & Banquet', icon: '🏛️' },
  { id: 'Swimming Pool', name: 'Infinity Swimming Pool', icon: '🏊' },
  { id: 'Fitness Gym', name: 'Cardio & Strength Gym', icon: '🏋️' },
  { id: 'Tennis Court', name: 'All-Weather Tennis Court', icon: '🎾' },
  { id: 'Badminton Court', name: 'Indoor Badminton Arena', icon: '🏸' },
  { id: 'Children Park', name: 'Kid Zone & Landscaped Garden', icon: '🌳' },
  { id: 'EV Charging Hub', name: 'EV Supercharger Bays', icon: '⚡' },
  { id: 'Solar Microgrid', name: 'Rooftop Solar Telemetry', icon: '☀️' },
];

export const SocietyRegisterWizard: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Society Info
  const [societyName, setSocietyName] = useState('');
  const [reraId, setReraId] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Step 2: Infrastructure
  const [wings, setWings] = useState<string[]>(['Tower A', 'Tower B']);
  const [newWingInput, setNewWingInput] = useState('');
  const [totalFlats, setTotalFlats] = useState<number>(40);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Club House',
    'Swimming Pool',
    'Fitness Gym',
  ]);

  // Step 3: Admin Account
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 4: Output
  const [registeredSociety, setRegisteredSociety] = useState<any>(null);

  const addWing = () => {
    if (newWingInput.trim() && !wings.includes(newWingInput.trim())) {
      setWings([...wings, newWingInput.trim()]);
      setNewWingInput('');
    }
  };

  const removeWing = (wing: string) => {
    if (wings.length > 1) {
      setWings(wings.filter((w) => w !== wing));
    }
  };

  const toggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1) {
      if (!societyName.trim() || !address.trim() || !city.trim() || !zipCode.trim()) {
        setError('Please fill in all mandatory society details.');
        return;
      }
    } else if (currentStep === 2) {
      if (wings.length === 0) {
        setError('At least one Tower / Wing is required.');
        return;
      }
      if (totalFlats <= 0) {
        setError('Total units must be greater than zero.');
        return;
      }
    } else if (currentStep === 3) {
      if (!adminName.trim() || !adminEmail.trim() || !adminPhone.trim()) {
        setError('Please fill in all administrator contact details.');
        return;
      }
      if (adminPassword.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (adminPassword !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      // Submit registration
      submitRegistration();
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const submitRegistration = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.registerSociety({
        societyName,
        reraId,
        address,
        city,
        state,
        zipCode,
        wings,
        totalFlats: Number(totalFlats),
        adminName,
        adminEmail,
        adminPhone,
        adminPassword,
        amenities: selectedAmenities,
      });

      if (res.success) {
        setRegisteredSociety(res);
        try {
          localStorage.setItem('resisync_society_name', res.society?.name || societyName);
          localStorage.setItem('resisync_society_code', res.societyCode || 'PRSTG-2026');
          if (res.society?.id) {
            localStorage.setItem('resisync_society_id', res.society.id);
          }
        } catch {}
        if (setAuthUser) {
          setAuthUser(res.user, res.token);
        }
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FF8A00', '#FFAE42', '#10B981', '#FFFFFF'],
        });
        setCurrentStep(4);
      } else {
        setError(res.message || 'Society onboarding failed. Please verify your entries.');
      }
    } catch (err: any) {
      setError(err.message || 'Society onboarding failed. Please verify your entries.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-between selection:bg-primary/30">
      {/* Top Navbar */}
      <header className="h-20 border-b border-border/60 px-6 sm:px-12 flex items-center justify-between bg-surface/50 backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/welcome')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center shadow-orange-glow text-background font-black text-lg">
            R
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wider text-text-primary font-sans">
              RESI<span className="text-primary font-black">SYNC</span>
            </h1>
            <p className="text-[10px] text-text-muted tracking-widest font-mono uppercase">
              Enterprise Society Onboarding Wizard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/welcome"
            className="text-xs text-text-secondary hover:text-text-primary transition"
          >
            Cancel & Return
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-border text-xs font-semibold text-text-primary transition"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Wizard Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        {/* Wizard Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />

            {[
              { step: 1, label: 'Society Profile', icon: Building2 },
              { step: 2, label: 'Campus Units', icon: Layers },
              { step: 3, label: 'Administrator', icon: Users },
              { step: 4, label: 'Live Launch', icon: Rocket },
            ].map((s) => {
              const Icon = s.icon;
              const isDone = currentStep > s.step;
              const isCurrent = currentStep === s.step;

              return (
                <div key={s.step} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                      isDone
                        ? 'bg-primary text-background shadow-orange-glow'
                        : isCurrent
                        ? 'bg-card border-2 border-primary text-primary shadow-orange-glow'
                        : 'bg-surface border border-border text-text-muted'
                    }`}
                  >
                    {isDone ? <Check className="w-5 h-5 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-2 hidden sm:block ${
                      isCurrent ? 'text-primary' : isDone ? 'text-text-primary' : 'text-text-muted'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Card Body */}
        <div className="bg-surface border border-border rounded-panel p-6 sm:p-10 shadow-elevated">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {/* STEP 1: SOCIETY PROFILE */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" /> Society & Association Information
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Enter the official registered details of your residential community or condominium.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Society Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={societyName}
                    onChange={(e) => setSocietyName(e.target.value)}
                    placeholder="e.g. Prestige Falcon City"
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    State RERA / Registration No. (Optional)
                  </label>
                  <input
                    type="text"
                    value={reraId}
                    onChange={(e) => setReraId(e.target.value)}
                    placeholder="e.g. PRM/KA/RERA/1251/310/PR/..."
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Street Address <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Kanakapura Main Road, Near Metro Station"
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    City <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    State <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Postal Pincode <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="e.g. 560062"
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INFRASTRUCTURE & AMENITIES */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" /> Campus Architecture & Common Facilities
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Configure towers, wings, residential unit count, and community amenities to provision.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Towers / Blocks / Wings ({wings.length} Configured)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {wings.map((wing) => (
                    <span
                      key={wing}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold text-text-primary"
                    >
                      <span>{wing}</span>
                      <button
                        type="button"
                        onClick={() => removeWing(wing)}
                        className="text-text-muted hover:text-status-danger transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    value={newWingInput}
                    onChange={(e) => setNewWingInput(e.target.value)}
                    placeholder="e.g. Tower E or Villa Cluster"
                    className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addWing}
                    className="px-3 py-2 rounded-xl bg-surface hover:bg-card border border-border text-xs font-bold text-text-primary flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              <div className="max-w-xs">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Total Flats / Residential Units
                </label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  value={totalFlats}
                  onChange={(e) => setTotalFlats(Number(e.target.value))}
                  className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Select Society Amenities to Provision
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AVAILABLE_AMENITIES.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity.id);
                    return (
                      <div
                        key={amenity.id}
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition text-left flex flex-col justify-between h-24 ${
                          isSelected
                            ? 'bg-primary/10 border-primary shadow-orange-glow text-white'
                            : 'bg-card border-border text-text-secondary hover:border-border-light'
                        }`}
                      >
                        <span className="text-2xl">{amenity.icon}</span>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold leading-tight">{amenity.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ADMINISTRATOR ACCOUNT */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Society President / Estate Manager Credentials
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  This user will hold full administrator permissions, access keys, and society-wide analytics.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Management Officer Full Name <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Vikramaditya Rao"
                      className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Official Email (Login Identifier) <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="e.g. admin@falconcity.com"
                      className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Contact Mobile Number <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      placeholder="e.g. +91 98450 11223"
                      className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Admin Master Password <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Confirm Password <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Security Policy Badge */}
              <div className="p-3.5 rounded-xl bg-card border border-border flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  By completing registration, you will receive an immutable 256-bit tenant isolation token. 
                  All gate visitor logs, financial records, and IoT data remain private to your society.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS & LAUNCH */}
          {currentStep === 4 && registeredSociety && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-status-success/20 border border-status-success/40 text-status-success flex items-center justify-center mx-auto shadow-orange-glow">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">
                  Enterprise Onboarding Complete
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  {registeredSociety.society?.name || societyName} is Now Live!
                </h2>
                <p className="text-xs text-text-secondary max-w-md mx-auto mt-2">
                  Your residential management database, gate security passes, and facility booking calendars have been initialized.
                </p>
              </div>

              {/* Society Code Banner */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-card border-2 border-primary/40 shadow-orange-glow text-left">
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  Official Society Invitation Code
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-2xl font-black font-mono text-primary tracking-widest">
                    {registeredSociety.societyCode}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-status-success/15 text-status-success text-[10px] font-bold">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary mt-2">
                  Share this code with your residents and guards so they can self-onboard onto the platform.
                </p>
              </div>

              {/* Launch CTA */}
              <div className="pt-4">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="px-8 py-3.5 rounded-xl bg-primary text-background text-sm font-bold hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2 mx-auto"
                >
                  <Rocket className="w-4 h-4" /> Enter Society Management Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Wizard Controls Footer */}
          {currentStep < 4 && (
            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-card flex items-center gap-2 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-primary text-background text-xs font-bold hover:bg-primary-hover shadow-orange-glow flex items-center gap-2 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    <span>Provisioning Society...</span>
                  </>
                ) : currentStep === 3 ? (
                  <>
                    <span>Generate Society & Launch</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Continue to Step {currentStep + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border/40 text-center text-xs text-text-muted">
        RESISYNC Smart Residential Operations Platform • Enterprise Edition
      </footer>
    </div>
  );
};

