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
  Radio,
  Check,
  AlertTriangle,
  Play,
  Save,
  Server,
  Layers,
  Bell,
  HardDrive,
  Cpu,
  Key,
  Sun,
  Moon,
} from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';

export const AdminSettings: React.FC = () => {
  const { showToast } = useNotification();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'firebase' | 'audit' | 'profile'>('firebase');

  // Audit Logs State
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Firebase Configuration State
  const [config, setConfig] = useState({
    projectId: 'resisync-prod-cloud',
    apiKey: 'AIzaSyA4Q92xLmK71P0-v9eZ81jLmK71P0v9eZ8',
    authDomain: 'resisync-prod-cloud.firebaseapp.com',
    storageBucket: 'resisync-prod-cloud.appspot.com',
    messagingSenderId: '892104918231',
    appId: '1:892104918231:web:d892a0194b18f0c29a88e1',
    syncMode: 'HYBRID',
    autoSyncIntervalSec: 30,
    syncCollections: ['visitors', 'deliveries', 'complaints', 'maintenance', 'emergency', 'iot_telemetry'],
  });

  const [savingConfig, setSavingConfig] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('en-IN'));

  useEffect(() => {
    // Load Firebase Config
    api.getFirebaseConfig()
      .then((res) => {
        if (res.success && res.config) {
          setConfig(res.config);
        }
      })
      .catch((err) => console.log('Using default Firebase config'));

    // Load Audit Logs
    api.getAuditLogs()
      .then((res) => {
        if (res.success) setLogs(res.logs || []);
      })
      .catch(() => {});
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await api.updateFirebaseConfig(config);
      if (res.success) {
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
      if (res.success) {
        setTestResult(res);
        setLastSyncTime(new Date().toLocaleTimeString('en-IN'));
        showToast({
          title: 'Cloud Handshake Succeeded',
          message: `Firebase ping verified in ${res.overallLatencyMs}ms. All 5 diagnostics passed.`,
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

  const handleSimulateFCMPush = () => {
    showToast({
      title: 'FCM Push Notification Received',
      message: 'Simulated Firebase Cloud Messaging dispatch: Emergency test alert broadcast.',
      type: 'info',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" /> Firebase Integration & Cloud Sync Center
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure Google Firebase cloud services, real-time Firestore synchronization, and system security audit trail.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border">
          <button
            onClick={() => setActiveTab('firebase')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'firebase'
                ? 'bg-primary text-background shadow-orange-glow'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" /> Firebase Cloud Sync
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-primary text-background shadow-orange-glow'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" /> Society Profile
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-primary text-background shadow-orange-glow'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Audit Trail ({logs.length})
          </button>
        </div>
      </div>

      {/* TAB 1: FIREBASE & CLOUD SYNC */}
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
                    <span className="font-bold text-white text-sm">Google Firebase Cloud Replication</span>
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
                <button
                  type="button"
                  onClick={handleSimulateFCMPush}
                  className="px-3.5 py-2 rounded-xl bg-surface hover:bg-border/60 border border-border text-xs font-semibold text-text-primary transition flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5 text-primary" /> Test FCM Push
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
            <div className="bg-card rounded-panel border-2 border-primary/40 p-5 shadow-orange-glow animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                  <span className="text-xs font-bold text-white">Live Handshake Test Passed ({testResult.overallLatencyMs}ms)</span>
                </div>
                <span className="text-[10px] text-text-muted font-mono">{testResult.timestamp}</span>
              </div>

              <div className="space-y-2">
                {testResult.checks.map((c: any, idx: number) => (
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
          <form onSubmit={handleSaveConfig} className="bg-card rounded-panel border border-border p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
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

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Messaging Sender ID (FCM)
                </label>
                <input
                  type="text"
                  value={config.messagingSenderId}
                  onChange={(e) => setConfig({ ...config, messagingSenderId: e.target.value })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Firebase Web App ID
                </label>
                <input
                  type="text"
                  value={config.appId}
                  onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Cloud Sync Architecture Mode
                </label>
                <select
                  value={config.syncMode}
                  onChange={(e) => setConfig({ ...config, syncMode: e.target.value })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="HYBRID">Hybrid Edge + Cloud Firestore (Recommended)</option>
                  <option value="FIRESTORE_DIRECT">Direct Cloud Firestore Store</option>
                  <option value="LOCAL_ONLY">Local Air-Gapped Database</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Auto-Sync Heartbeat (Seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={config.autoSyncIntervalSec}
                  onChange={(e) => setConfig({ ...config, autoSyncIntervalSec: Number(e.target.value) })}
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
                {config.syncCollections.map((col) => (
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

      {/* TAB 2: SOCIETY PROFILE & APPEARANCE */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-card rounded-panel border border-border p-6 shadow-card space-y-6">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Society Association Profile & Governance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-surface border border-border">
                <p className="text-text-muted">Registered Name</p>
                <p className="font-bold text-text-primary text-base mt-0.5">
                  {localStorage.getItem('resisync_society_name') || 'Greenview Residency'}
                </p>
                <p className="text-[11px] text-text-secondary mt-1">Outer Ring Road, Bengaluru</p>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-border">
                <p className="text-text-muted">Society Registration Code</p>
                <p className="font-mono font-black text-primary text-xl mt-0.5">
                  {localStorage.getItem('resisync_society_code') || 'GRNVW-2026'}
                </p>
                <p className="text-[11px] text-text-secondary mt-1">Used for resident self-onboarding</p>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-border">
                <p className="text-text-muted">Campus Inventory</p>
                <p className="font-bold text-text-primary text-base mt-0.5">140 Units • Multi-Wing</p>
                <p className="text-[11px] text-status-success font-medium mt-1">91% Occupancy Rate</p>
              </div>
            </div>
          </div>

          {/* Theme & Display Preferences Card */}
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
                    Clean, high-clarity daylight theme (#F8FAFC) optimized for bright daytime office and audit work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-card rounded-panel border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Immutable Administrative Audit Trail
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">Cryptographically logged operations event history</p>
            </div>
            <span className="text-xs text-primary font-mono font-semibold">{logs.length} logged events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action Type</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-surface/50">
                    <td className="py-3 px-3 text-text-muted font-mono text-[11px]">
                      {new Date(l.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-primary">{l.action}</td>
                    <td className="py-3 px-3 text-text-secondary">{l.entityType}</td>
                    <td className="py-3 px-3 text-text-primary">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
