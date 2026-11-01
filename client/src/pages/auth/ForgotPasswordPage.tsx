import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setSubmitted(true);
      if (res.demoNotice) {
        setDemoNotice(res.demoNotice);
      }
    } catch (err) {
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-surface border border-border rounded-panel p-6 sm:p-8 shadow-elevated">
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </button>

        <h2 className="text-xl font-bold text-white tracking-tight">Reset Password</h2>
        <p className="text-xs text-text-secondary mt-1">
          Enter your registered email address to receive recovery instructions.
        </p>

        {submitted ? (
          <div className="mt-6 p-4 rounded-xl bg-card border border-border text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-status-success mx-auto" />
            <h4 className="text-sm font-semibold text-text-primary">Instructions Dispatched</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              If an account is associated with <span className="text-primary font-mono">{email}</span>, a secure recovery code has been sent.
            </p>
            {demoNotice && (
              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-medium">
                {demoNotice}
              </div>
            )}
            <Link
              to="/login"
              className="inline-block mt-3 px-4 py-2 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover transition"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="resident@resisync.com"
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? 'Sending Instructions...' : 'Send Reset Code'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

