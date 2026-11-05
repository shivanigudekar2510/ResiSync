import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, Zap, Droplets, Wind, Car, Camera, Send, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const AdminIoT: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTogglingTds, setIsTogglingTds] = useState(false);

  // Manual Demo Reading Injector
  const [selectedDevice, setSelectedDevice] = useState<string>('iot-tank-01');
  const [sensorType, setSensorType] = useState('WATER_LEVEL_PERCENT');
  const [metricValue, setMetricValue] = useState('85');
  const [unit, setUnit] = useState('%');
  const [isInjecting, setIsInjecting] = useState(false);

  const fetchIoT = async () => {
    setLoading(true);
    try {
      const res = await api.getIoTData();
      if (res.success) setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIoT();
  }, []);

  const handleToggleTdsAlert = async () => {
    setIsTogglingTds(true);
    try {
      const res = await api.toggleTdsAlert();
      if (res.success) {
        const isAlert = res.iotState?.isTdsAlert;
        showToast({
          type: isAlert ? 'warning' : 'success',
          title: isAlert ? 'High TDS Alert Broadcasted (365 ppm)' : 'Water TDS Restored (245 ppm)',
          message: isAlert
            ? 'Water quality warning active! Live alert and automated RO filtration dispatched to resident dashboards.'
            : 'Tower A water quality back to optimal potable status.',
        });
        fetchIoT();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Action Failed', message: err.message });
    } finally {
      setIsTogglingTds(false);
    }
  };

  const handleInjectReading = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInjecting(true);
    try {
      const res = await fetch('/api/iot/reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('resisync_token')}`,
        },
        body: JSON.stringify({
          deviceId: selectedDevice,
          sensorType,
          metricValue: Number(metricValue),
          unit,
        }),
      });
      if (res.ok) {
        fetchIoT();
      }
    } finally {
      setIsInjecting(false);
    }
  };

  const currentTds = Number(data?.systemHealth?.waterTds || 245);
  const isAlertActive = !!data?.systemHealth?.isTdsAlert || currentTds > 300;
  const tankLevel = Number(data?.systemHealth?.tankLevel || 82);
  const wasteScore = Number(data?.systemHealth?.wasteAuditScore || 94);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Facility & Smart IoT Control Room
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold border border-primary/30 uppercase">
              {data?.mode || 'HYBRID_HARDWARE'}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Tower A telemetry streams, tank reservoirs, QR waste audits, and live anomaly simulation
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchIoT}
            className="px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-semibold hover:border-primary text-text-secondary hover:text-white flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Grid</span>
          </button>
        </div>
      </div>

      {/* Featured Telemetry & TDS Anomaly Simulation Card */}
      <div className="bg-card rounded-panel border border-border p-6 shadow-card space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Central Water & Waste Infrastructure Monitor
            </span>
            <h3 className="text-xl font-black text-white mt-0.5">
              Tower A Inflow & Reservoir Telemetry
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Sensor readings update automatically and synchronize across resident overview dashboards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleTdsAlert}
              disabled={isTogglingTds}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 shadow-sm ${
                isAlertActive
                  ? 'bg-status-success text-background hover:bg-emerald-400'
                  : 'bg-amber-500 text-background hover:bg-amber-400 shadow-orange-glow'
              }`}
            >
              {isAlertActive ? (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  <span>Reset Water to Optimal (245 ppm)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Trigger High TDS Alert (365 ppm)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3 Prominent Telemetry KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* 1. Water TDS */}
          <div
            className={`p-4 rounded-2xl border transition ${
              isAlertActive
                ? 'bg-amber-500/10 border-amber-500/50 shadow-orange-glow'
                : 'bg-surface border-border'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-text-muted uppercase">Tower A Water TDS</span>
              <Droplets className={`w-4 h-4 ${isAlertActive ? 'text-amber-400' : 'text-primary'}`} />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span
                className={`text-3xl font-black font-mono ${
                  isAlertActive ? 'text-amber-300' : 'text-text-primary'
                }`}
              >
                {currentTds}
              </span>
              <span className="text-xs text-text-muted font-bold font-mono">ppm</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1.5 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isAlertActive ? 'bg-status-warning animate-ping' : 'bg-status-success'
                }`}
              />
              <span>
                {isAlertActive
                  ? 'High TDS Threshold Exceeded (>300 ppm)!'
                  : 'Normal Potable Water (Optimal: 150 - 300 ppm)'}
              </span>
            </p>
          </div>

          {/* 2. Tank Levels */}
          <div className="p-4 rounded-2xl bg-surface border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-text-muted uppercase">Tank Levels</span>
              <Activity className="w-4 h-4 text-status-info" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black font-mono text-text-primary">{tankLevel}%</span>
              <span className="text-xs text-text-muted font-mono">(78,500 L)</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-success" />
              <span>Overhead reservoir capacity 95,000 L</span>
            </p>
          </div>

          {/* 3. Waste Audit */}
          <div className="p-4 rounded-2xl bg-surface border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-text-muted uppercase">QR Waste Audit</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black font-mono text-text-primary">{wasteScore}%</span>
              <span className="text-xs text-emerald-400 font-bold">Green Leaf</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-success" />
              <span>Wet / Dry / E-Waste segregation score</span>
            </p>
          </div>
        </div>
      </div>

      {/* Hardware Nodes Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(data?.devices || []).map((dev: any) => (
          <div key={dev.id} className="bg-card rounded-panel border border-border p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-text-primary">{dev.name}</h3>
                  <p className="text-[10px] font-mono text-primary uppercase mt-0.5">{dev.deviceType}</p>
                </div>
                <StatusBadge status={dev.status} size="sm" />
              </div>
              <p className="text-xs text-text-muted mt-2">{dev.location}</p>

              {/* Latest Readings */}
              <div className="mt-4 pt-4 border-t border-border/60 space-y-2">
                <p className="text-[10px] font-bold uppercase text-text-muted">Live Telemetry Metrics</p>
                {(dev.readings || []).map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">{r.sensorType.replace(/_/g, ' ')}</span>
                    <span className="font-mono font-bold text-text-primary">
                      {r.metricValue} {r.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 text-[10px] text-text-muted flex items-center justify-between">
              <span>Heartbeat: {new Date().toLocaleTimeString('en-IN')}</span>
              <span>Power: {dev.batteryLevel ? `${dev.batteryLevel}% Battery` : 'Grid Line'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Simulator Control Box */}
      <div className="bg-card rounded-panel border border-border p-5">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-2">
          Manual Sensor Reading Injector
        </h3>
        <p className="text-xs text-text-secondary mb-4">
          Emit simulated hardware telemetry readings to verify WebSocket broadcast alerts
        </p>

        <form onSubmit={handleInjectReading} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-text-muted mb-1">Target Device</label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="iot-tank-01">Central Water Reservoir</option>
              <option value="iot-power-01">Main Substation Grid Meter</option>
              <option value="iot-dg-01">Backup Generator Tank</option>
            </select>
          </div>

          <div>
            <label className="block text-text-muted mb-1">Sensor Metric Type</label>
            <select
              value={sensorType}
              onChange={(e) => setSensorType(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="WATER_LEVEL_PERCENT">Water Reservoir %</option>
              <option value="GRID_LOAD_KW">Grid Power Demand kW</option>
              <option value="DIESEL_FUEL_PERCENT">DG Fuel Level %</option>
            </select>
          </div>

          <div>
            <label className="block text-text-muted mb-1">Simulated Value</label>
            <input
              type="number"
              value={metricValue}
              onChange={(e) => setMetricValue(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-text-primary focus:border-primary focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isInjecting}
              className="w-full py-2 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Telemetry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AdminIoT;

