import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { TEST_PERSONAS, TestPersona } from '../../data/testPersonas';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Zap,
  KeyRound,
  Shield,
  Cpu,
  Wrench,
  Truck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storedSocietyName = localStorage.getItem('resisync_society_name');
  const storedSocietyCode = localStorage.getItem('resisync_society_code');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password.trim()) {
      setError('Please enter both your registered email/phone and password.');
      return;
    }

    try {
      const loggedUser = await login(identifier.trim(), password);
      if (loggedUser) {
        if (loggedUser.role === 'ADMIN') navigate('/admin/dashboard');
        else if (loggedUser.role === 'SECURITY') navigate('/security/dashboard');
        else navigate('/resident/dashboard');
      } else {
        setError('Login failed. Please verify your credentials or register your society.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  const handleAutoFillAndLogin = async (persona: TestPersona) => {
    setError(null);
    setIdentifier(persona.email);
    setPassword(persona.password);
    try {
      const loggedUser = await login(persona.email, persona.password);
      if (loggedUser) {
        navigate(persona.defaultRoute);
      }
    } catch (err: any) {
      setError(err.message || 'Auto-login failed.');
    }
  };

  const getPersonaIcon = (type: string) => {
    switch (type) {
      case 'RESIDENT':
        return Users;
      case 'GUARD':
        return Shield;
      case 'RWA':
        return Building2;
      case 'FACILITY':
        return Cpu;
      case 'TECH':
        return Wrench;
      case 'VENDOR':
        return Truck;
      default:
        return KeyRound;
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-center items-center px-4 py-8 selection:bg-primary/30 font-sans">
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
            Society Sign-In Portal
          </p>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-surface border border-border rounded-panel p-6 sm:p-8 shadow-elevated">
        <div className="text-center sm:text-left mb-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-text-primary tracking-tight">Society Portal Sign In</h2>
            {storedSocietyCode && (
              <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                {storedSocietyCode}
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary">
            {storedSocietyName
              ? `Access portal for ${storedSocietyName}`
              : 'Sign in to access your society administrative, resident, or security dashboard.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-2">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="e.g. admin@society.com or resident@email.com"
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
              <span>Remember this session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
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
          <Link to="/register" className="hover:text-primary transition flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            Resident Registration
          </Link>
          <Link to="/register-society" className="text-primary font-bold hover:underline flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            Register New Society
          </Link>
        </div>
      </div>

      {/* Test Login Credentials Section (Single Society: EGO-BLR-01) */}
      <div className="w-full max-w-4xl mt-8">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Test Login Credentials (Single Society: EGO-BLR-01)</span>
          </div>
          <p className="text-xs text-text-secondary max-w-2xl mx-auto">
            You can type these credentials into the login screen, click <span className="text-primary font-semibold">Auto-Fill & Login</span> on any role card below, or use the <span className="text-text-primary font-semibold">Quick Switch Role bar</span> at the top of the app to jump between personas without losing your session state:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {TEST_PERSONAS.map((persona) => {
            const Icon = getPersonaIcon(persona.personaType);
            return (
              <div
                key={persona.id}
                className="bg-surface/90 hover:bg-surface border border-border/80 hover:border-primary/40 rounded-2xl p-4 transition shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-card text-text-muted border border-border">
                      Persona #{persona.roleNumber}
                    </span>
                    <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                      <Icon className="w-3.5 h-3.5" />
                      {persona.roleTitle}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-text-primary">{persona.name}</h3>
                  <p className="text-xs text-text-secondary font-medium">{persona.unitOrPost}</p>

                  <div className="mt-3 p-2.5 rounded-xl bg-card border border-border/60 text-[11px] space-y-1 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Login ID:</span>
                      <span className="text-text-primary font-semibold select-all">{persona.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Password:</span>
                      <span className="text-text-primary font-semibold select-all">{persona.password}</span>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-0.5">
                      Pre-Loaded Test Codes & Data:
                    </span>
                    <p className="text-[11px] text-text-secondary leading-snug">
                      {persona.testCodesSummary}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAutoFillAndLogin(persona)}
                  disabled={isLoading}
                  className="mt-4 w-full py-2 px-3 rounded-xl bg-card hover:bg-primary hover:text-background border border-border hover:border-primary text-text-primary font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm group"
                >
                  <Zap className="w-3.5 h-3.5 text-primary group-hover:text-background transition" />
                  <span>Auto-Fill & Login</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
