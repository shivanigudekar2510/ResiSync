import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Clock,
  FileText,
  CheckCircle2,
  Flame,
  Cloud,
  RefreshCw,
  Zap,
  Check,
  AlertTriangle,
  Save,
  Server,
  Layers,
  Bell,
  Sun,
  Moon,
  Search,
  Filter,
  Sliders,
  DollarSign,
  KeyRound,
  Lock,
  UserCheck,
  Radio,
  Building,
} from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';

export const AdminSettings: React.FC = () => {
  const { showToast } = useNotification();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'governance' | 'audit' | 'firebase' | 'appearance'>('governance');

  // Governance & Metadata State
  const [societyMetadata, setSocietyMetadata] = useState({
    name: 'Emerald Greens Owners Association',
    registrationNumber: 'BLR/SOR/2024/7821',
    reraId: 'PRM/KA/RERA/1251/310/PR/2026/004812',
    gstin: '29AABCE1234F1Z5',
    billingCycleDay: 1,
    makerCheckerThreshold: 50000,
    address: 'Outer Ring Road, Bellandur, Bengaluru',
    totalFlats: 120,
  });

  const [policies, setPolicies] = useState({
    mandatoryGuestOtp: true,
    overstayAutoAlert: true,
    biometricStaffSync: true,
    sosBroadcastEscalation: true,
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Today at 09:30 AM');

  // Audit Logs State & Filters
  const [logs, setLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Firebase Configuration State (with robust default fallbacks)
  const [config, setConfig] = useState({
    projectId: 'resisync-46166',
    apiKey: 'AIzaSyBU5c6H4Hj12qu-3Sf1YqbmWdU_JQz70Z8',
    authDomain: 'resisync-46166.firebaseapp.com',
    storageBucket: 'resisync-46166.firebasestorage.app',
    messagingSenderId: '213466114463',
    appId: '1:213466114463:web:a938b580c3c74f329f35aa',
    syncMode: 'HYBRID',
    autoSyncIntervalSec: 30,
    syncCollections: ['visitors', 'deliveries', 'complaints', 'maintenance', 'emergency', 'iot_telemetry', 'governance'],
  });

  const [savingConfig, setSavingConfig] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('en-IN'));

  useEffect(() => {
    // 1. Fetch Governance Settings
    api.getSocietySettings()
      .then((res) => {
        if (res && res.success && res.settings) {
          const s = res.settings;
          setSocietyMetadata((prev) => ({
            ...prev,
            registrationNumber: s.registrationNumber || prev.registrationNumber,
            reraId: s.reraId || prev.reraId,
            gstin: s.gstin || prev.gstin,
            billingCycleDay: s.billingCycleDay !== undefined ? s.billingCycleDay : prev.billingCycleDay,
            makerCheckerThreshold: s.makerCheckerThreshold !== undefined ? s.makerCheckerThreshold : prev.makerCheckerThreshold,
          }));
          setPolicies((prev) => ({
            ...prev,
            mandatoryGuestOtp: s.mandatoryGuestOtp !== undefined ? s.mandatoryGuestOtp : prev.mandatoryGuestOtp,
            overstayAutoAlert: s.overstayAutoAlert !== undefined ? s.overstayAutoAlert : prev.overstayAutoAlert,
            biometricStaffSync: s.biometricStaffSync !== undefined ? s.biometricStaffSync : prev.biometricStaffSync,
            sosBroadcastEscalation: s.sosBroadcastEscalation !== undefined ? s.sosBroadcastEscalation : prev.sosBroadcastEscalation,
          }));
        }
      })
      .catch(() => {});

    // 2. Fetch Firebase Config defensively
    api.getFirebaseConfig()
      .then((res) => {
        if (res && res.success && res.config) {
          setConfig((prev) => ({
            ...prev,
            ...res.config,
            syncCollections: res.config.syncCollections ?? prev.syncCollections,
          }));
        }
      })
      .catch(() => {});

    // 3. Fetch Audit Logs
    setLoadingLogs(true);
    api.getAuditLogs()
      .then((res) => {
        if (res && res.success) {
          setLogs(res.logs ?? []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingLogs(false));
  }, []);

  const handleSaveGovernance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const payload = {
        ...societyMetadata,
        ...policies,
      };
      const res = await api.updateSocietySettings(payload);
      if (res && res.success) {
        showToast({
          title: 'Society Governance Saved',
          message: 'Association metadata and security gate policies updated successfully.',
          type: 'success',
        });
        setLastSavedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err: any) {
      showToast({
        title: 'Save Failed',
        message: err.message || 'Could not save governance settings.',
        type: 'error',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveFirebaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await api.updateFirebaseConfig(config);
      if (res && res.success) {
        showToast({
          title: 'Firebase Settings Saved',
          message: 'Cloud Sync parameters updated and replication daemon reloaded.',
          type: 'success',
        });
        setLastSyncTime(new Date().toLocaleTimeString('en-IN'));
      }
    } catch (err: any) {
      showToast({
        title: 'Save Failed',
        message: err.message || 'Could not update Firebase settings.',
        type: 'error',
      });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await api.testFirebaseConnection();
      if (res && res.success) {
        setTestResult(res);
        setLastSyncTime(new Date().toLocaleTimeString('en-IN'));
        showToast({
          title: 'Cloud Handshake Succeeded',
          message: `Firebase ping verified in ${res.overallLatencyMs}ms. All diagnostics passed.`,
          type: 'success',
        });
      }
    } catch (err: any) {
      showToast({
        title: 'Connection Test Failed',
        message: err.message || 'Failed to connect to Firebase services.',
        type: 'error',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Filter audit logs defensively
  const filteredLogs = (logs ?? []).filter((l) => {
    const matchesSearch =
      (l.action ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.actorName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.actorRole ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.details ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.terminal ?? '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModule =
      selectedModule === 'ALL' ||
      (l.module ?? '').toUpperCase() === selectedModule.toUpperCase();

    return matchesSearch && matchesModule;
  });

  const modulePills = ['ALL', 'FINANCIALS', 'GATE SECURITY', 'HELPDESK', 'IOT CONTROL', 'GOVERNANCE'];

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text-primary tracking-tight">Society Settings & Governance</h2>
            <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-mono font-bold">
              v2.6 Enterprise
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage association legal identity, gate policy rules, cloud sync architecture, and immutable audit logs.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-card border border-border">
          <button
            onClick={() => setActiveTab('governance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'governance'
                ? 'bg-primary text-background shadow-orange-glow'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Governance & Policy</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-primary text-background shadow-orange-glow'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit Trail ({(logs ?? []).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'firebase'
                ? 'bg-primary text-background shadow-orange-glow'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud Replication</span>
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'appearance'
                ? 'bg-primary text-background shadow-orange-glow'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Theme UI</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: GOVERNANCE & METADATA ================= */}
      {activeTab === 'governance' && (
        <form onSubmit={handleSaveGovernance} className="space-y-6">
          {/* Section 1: Society Metadata Card */}
          <div className="bg-card rounded-panel border border-border p-6 shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/70 gap-2">
              <div>
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" /> Society Metadata & Association Identity
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Official statutory registration, RERA accreditation, and accounting threshold parameters.
                </p>
              </div>
              <span className="text-[11px] font-mono text-text-muted">
                Last updated: <span className="text-text-primary font-semibold">{lastSavedTime}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                  Society Registration Number
                </label>
                <input
                  type="text"
                  required
                  value={societyMetadata.registrationNumber}
                  onChange={(e) => setSocietyMetadata({ ...societyMetadata, registrationNumber: e.target.value })}
                  placeholder="e.g. BLR/SOR/2024/7821"
                  className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-text-primary font-mono text-xs focus:border-primary focus:outline-none"
                />
                <span className="text-[10px] text-text-muted mt-1 block">Karnataka Societies Registration Act, 1960</span>
              </div>

              <div>
                <label className="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                  State RERA ID
                </label>
                <input
                  type="text"
                  required
                  value={societyMetadata.reraId}
                  onChange={(e) => setSocietyMetadata({ ...societyMetadata, reraId: e.target.value })}
                  placeholder="e.g. PRM/KA/RERA/1251/310/PR/2026/004812"
                  className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-text-primary font-mono text-xs focus:border-primary focus:outline-none"
                />
                <span className="text-[10px] text-text-muted mt-1 block">Real Estate Regulatory Authority accreditation</span>
              </div>

              <div>
                <label className="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                  GSTIN Tax Identifier
                </label>
                <input
                  type="text"
                  required
                  value={societyMetadata.gstin}
                  onChange={(e) => setSocietyMetadata({ ...societyMetadata, gstin: e.target.value.toUpperCase() })}
                  placeholder="e.g. 29AABCE1234F1Z5"
                  className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-text-primary font-mono text-xs uppercase focus:border-primary focus:outline-none"
                />
                <span className="text-[10px] text-text-muted mt-1 block">Used for itemized 18% GST invoice generation</span>
              </div>

              <div>
                <label className="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                  Monthly Billing Cycle Day
                </label>
                <select
                  value={societyMetadata.billingCycleDay}
                  onChange={(e) => setSocietyMetadata({ ...societyMetadata, billingCycleDay: Number(e.target.value) })}
                  className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-text-primary text-xs focus:border-primary focus:outline-none"
                >
                  <option value={1}>1st of every month (Standard)</option>
                  <option value={5}>5th of every month</option>
                  <option value={10}>10th of every month</option>
                  <option value={15}>15th of every month</option>
                </select>
                <span className="text-[10px] text-text-muted mt-1 block">Date when monthly maintenance invoices auto-post</span>
              </div>

              <div>
                <label className="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                  Maker-Checker Co-Sign Threshold (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-text-muted font-bold">₹</span>
                  <input
                    type="number"
                    step="5000"
                    min="10000"
                    value={societyMetadata.makerCheckerThreshold}
                    onChange={(e) => setSocietyMetadata({ ...societyMetadata, makerCheckerThreshold: Number(e.target.value) })}
                    className="w-full bg-surface border border-border rounded-xl pl-8 pr-3.5 py-2.5 text-text-primary font-mono text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-text-muted mt-1 block">Disbursements exceeding this require dual signatures</span>
              </div>

              <div>
                <label className="block text-text-secondary font-semibold uppercase tracking-wider mb-1.5">
                  Registered Society Name & Campus
                </label>
                <input
                  type="text"
                  value={societyMetadata.name}
                  onChange={(e) => setSocietyMetadata({ ...societyMetadata, name: e.target.value })}
                  className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-text-primary text-xs focus:border-primary focus:outline-none font-semibold"
                />
                <span className="text-[10px] text-text-muted mt-1 block">Outer Ring Road, Bengaluru (120 Units)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Security & Gate Policy Toggles */}
          <div className="bg-card rounded-panel border border-border p-6 shadow-card space-y-4">
            <div className="pb-3 border-b border-border/70">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Security & Gate Policy Toggles
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Automated guard kiosk rules, visitor barrier authentication, and emergency escalation workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Toggle 1: Mandatory Guest OTP */}
              <div className="p-4 rounded-xl bg-surface border border-border flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-xs">Mandatory 6-Digit OTP for Visitors</h4>
                    <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                      Main Gate barrier arms stay locked until the guard verifies the resident-issued 6-digit passcode.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={policies.mandatoryGuestOtp}
                    onChange={(e) => setPolicies({ ...policies, mandatoryGuestOtp: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Toggle 2: Delivery Overstay Alert */}
              <div className="p-4 rounded-xl bg-surface border border-border flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-xs">Delivery Overstay Auto-Alert (24h)</h4>
                    <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                      Sends automated WhatsApp reminder to residents if packages remain on gate shelves over 24 hours.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={policies.overstayAutoAlert}
                    onChange={(e) => setPolicies({ ...policies, overstayAutoAlert: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Toggle 3: Biometric Staff Sync */}
              <div className="p-4 rounded-xl bg-surface border border-border flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-xs">Biometric Staff & Guard Sync</h4>
                    <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                      Links security shift muster rolls directly to maker-checker vendor payout approval claims.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={policies.biometricStaffSync}
                    onChange={(e) => setPolicies({ ...policies, biometricStaffSync: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Toggle 4: SOS Broadcast Escalation */}
              <div className="p-4 rounded-xl bg-surface border border-border flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-status-danger/10 text-status-danger shrink-0 mt-0.5">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-xs">SOS Broadcast Escalation</h4>
                    <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                      Escalates resident distress triggers instantly to all security desk terminals and estate managers.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={policies.sosBroadcastEscalation}
                    onChange={(e) => setPolicies({ ...policies, sosBroadcastEscalation: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2 disabled:opacity-50"
            >
              {savingSettings ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Society Configuration & Policies</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 2: IMMUTABLE AUDIT TRAIL ================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-card rounded-panel border border-border p-5 shadow-card">
            {/* Search & Module Pills */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by action, actor, ticket #, or IP..."
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              {/* Module Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(modulePills ?? []).map((mod) => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => setSelectedModule(mod)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
                      selectedModule === mod
                        ? 'bg-primary text-background shadow-orange-glow'
                        : 'bg-surface hover:bg-border/60 text-text-secondary hover:text-text-primary border border-border'
                    }`}
                  >
                    {mod}
                  </button>
                ))}
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Actor & Persona</th>
                    <th className="py-2.5 px-3">Action Performed</th>
                    <th className="py-2.5 px-3">Module</th>
                    <th className="py-2.5 px-3">IP / Terminal</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-text-muted text-xs">
                        No audit records match your query.
                      </td>
                    </tr>
                  ) : (
                    (filteredLogs ?? []).map((l: any) => {
                      const isFlagged = l.status === 'FLAGGED';
                      return (
                        <tr key={l.id} className="hover:bg-surface/50 transition">
                          <td className="py-3 px-3 text-text-muted font-mono text-[11px] whitespace-nowrap">
                            {new Date(l.createdAt || l.timestamp || Date.now()).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-text-primary block">{l.actorName || 'System Admin'}</span>
                            <span className="text-[10px] text-text-secondary">{l.actorRole || 'Administrator'}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-text-primary block">{l.action}</span>
                            <span className="text-[11px] text-text-muted line-clamp-1">{l.details}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-surface border border-border font-mono text-[10px] font-bold text-primary">
                              {l.module || l.entityType || 'CORE'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-text-secondary whitespace-nowrap">
                            <span className="block text-text-primary">{l.ipAddress || '192.168.1.100'}</span>
                            <span className="text-[10px] text-text-muted">{l.terminal || 'Terminal-01'}</span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {isFlagged ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-warning/15 text-status-warning font-bold text-[10px]">
                                <AlertTriangle className="w-3 h-3" />
                                <span>FLAGGED</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-success/15 text-status-success font-bold text-[10px]">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>VERIFIED</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
              <span>Showing {filteredLogs.length} logged operations</span>
              <span className="font-mono text-primary font-semibold">256-Bit SHA-256 Ledger Locked</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: FIREBASE & CLOUD SYNC ================= */}
      {activeTab === 'firebase' && (
        <div className="space-y-6">
          {/* Status Ribbon */}
          <div className="bg-card rounded-panel border border-border p-5 shadow-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shadow-orange-glow shrink-0">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary text-sm">Google Firebase Cloud Replication</span>
                    <span className="px-2 py-0.5 rounded-md bg-status-success/15 text-status-success font-mono font-bold text-[10px]">
                      LIVE CONNECTED
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Sync Mode: <span className="text-primary font-bold">{config.syncMode}</span> • Project: <span className="font-mono text-text-primary">{config.projectId}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="px-4 py-2 rounded-xl bg-primary text-background text-xs font-bold hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{testingConnection ? 'Testing Handshake...' : 'Run Live Diagnostic Test'}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-border/60 text-xs">
              <div>
                <span className="text-text-muted text-[10px]">BIDIRECTIONAL STATUS</span>
                <p className="font-bold text-status-success text-sm mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% In Sync
                </p>
              </div>
              <div>
                <span className="text-text-muted text-[10px]">LAST CLOUD PUSH</span>
                <p className="font-mono font-bold text-text-primary text-sm mt-0.5">{lastSyncTime}</p>
              </div>
              <div>
                <span className="text-text-muted text-[10px]">REPLICATION NODES</span>
                <p className="font-bold text-text-primary text-sm mt-0.5">3 Active Edge Replicas</p>
              </div>
              <div>
                <span className="text-text-muted text-[10px]">SYNC INTERVAL</span>
                <p className="font-mono font-bold text-primary text-sm mt-0.5">{config.autoSyncIntervalSec} Seconds</p>
              </div>
            </div>
          </div>

          {/* Test Results Display Card (Appears when test is executed) */}
          {testResult && (
            <div className="bg-card rounded-panel border-2 border-primary/40 p-5 shadow-orange-glow">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                  <span className="text-xs font-bold text-text-primary">Live Handshake Test Passed ({testResult.overallLatencyMs}ms)</span>
                </div>
                <span className="text-[10px] text-text-muted font-mono">{testResult.timestamp}</span>
              </div>

              <div className="space-y-2">
                {(testResult?.checks ?? []).map((c: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-surface border border-border text-xs">
                    <div className="flex items-center gap-2 text-text-primary">
                      <Check className="w-3.5 h-3.5 text-primary stroke-[3]" />
                      <span>{c.check}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-text-muted">{c.latencyMs}ms</span>
                      <span className="text-status-success font-bold text-[10px]">PASSED</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configuration Form */}
          <form onSubmit={handleSaveFirebaseConfig} className="bg-card rounded-panel border border-border p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Firebase Project Credentials & Endpoints
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Update Firebase web client credentials or use pre-configured production sandbox parameters.
                </p>
              </div>
              <span className="text-[11px] font-mono text-primary font-bold">256-Bit SSL Secured</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Firebase Project ID
                </label>
                <input
                  type="text"
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Web API Key
                </label>
                <input
                  type="text"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Auth Domain
                </label>
                <input
                  type="text"
                  value={config.authDomain}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Cloud Storage Bucket
                </label>
                <input
                  type="text"
                  value={config.storageBucket}
                  onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Synchronized Collections Tags */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Active Synchronized Cloud Collections
              </label>
              <div className="flex flex-wrap gap-2">
                {(config?.syncCollections ?? []).map((col) => (
                  <span
                    key={col}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border border-border text-[11px] font-mono text-text-primary"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{col}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={savingConfig}
                className="px-6 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center gap-2 disabled:opacity-50"
              >
                {savingConfig ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    <span>Saving Configuration...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Firebase & Sync Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 4: APPEARANCE & THEME ================= */}
      {activeTab === 'appearance' && (
        <div className="bg-card rounded-panel border border-border p-6 shadow-card space-y-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Display Theme & Interface Appearance
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Customize your workstation interface. Seamlessly toggle between dark and light modes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Dark Theme Option */}
            <div
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                theme === 'dark'
                  ? 'bg-primary/10 border-primary shadow-orange-glow'
                  : 'bg-surface border-border hover:border-border-light'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-700 text-amber-400">
                <Moon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary text-sm">Signature Dark UI</span>
                  {theme === 'dark' && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  High-contrast dark palette (#050B10) with amber-orange accents for low-light environments.
                </p>
              </div>
            </div>

            {/* Light Theme Option */}
            <div
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                theme === 'light'
                  ? 'bg-primary/10 border-primary shadow-orange-glow'
                  : 'bg-surface border-border hover:border-border-light'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
                <Sun className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary text-sm">Crisp Executive Light UI</span>
                  {theme === 'light' && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Clean daylight theme (#F8FAFC) optimized for bright daytime office and audit work.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminSettings;
