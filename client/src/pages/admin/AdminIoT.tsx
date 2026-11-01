import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, Zap, Droplets, Wind, Car, Camera, Send } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import api from '../../services/api';

export const AdminIoT: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Smart Society IoT Operations Console</h2>
            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold border border-primary/30 uppercase">
              {data?.mode || 'DEMO_SIMULATION'}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time hardware telemetry streams, threshold alerts, and sensor simulation triggers
          </p>
        </div>

        <button
          onClick={fetchIoT}
          className="px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-semibold hover:border-primary text-text-secondary hover:text-white flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Grid</span>
        </button>
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
              <span>Heartbeat: {new Date(dev.lastHeartbeat).toLocaleTimeString('en-IN')}</span>
              <span>Power: {dev.batteryLevel ? `${dev.batteryLevel}% Battery` : 'Grid Line'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Simulator Control Box */}
      <div className="bg-card rounded-panel border border-border p-5">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-2">
          Demo Sensor Reading Injector
        </h3>
        <p className="text-xs text-text-secondary mb-4">
          Emit simulated telemetry readings to verify WebSocket broadcast alerts to resident dashboards
        </p>

        <form onSubmit={handleInjectReading} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-text-muted mb-1">Target Device</label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none"
            >
              {(data?.devices || []).map((d: any) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-text-muted mb-1">Sensor Metric Type</label>
            <input
              type="text"
              value={sensorType}
              onChange={(e) => setSensorType(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-primary font-mono focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-text-muted mb-1">Value & Unit</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={metricValue}
                onChange={(e) => setMetricValue(e.target.value)}
                className="w-2/3 bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-primary font-mono focus:border-primary focus:outline-none"
              />
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-1/3 bg-surface border border-border rounded-xl px-2 py-2 text-xs text-text-primary font-mono focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isInjecting}
              className="w-full py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-orange-glow transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Reading</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

