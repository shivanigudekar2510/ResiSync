import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Cpu,
  Droplets,
  Zap,
  Camera,
  Car,
  Wind,
  ShieldCheck,
  RefreshCw,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import api from '../../services/api';

export const ResidentSocietyStatus: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'power' | 'water' | 'aqi' | 'parking'>('power');

  const fetchIoT = async () => {
    setLoading(true);
    try {
      const res = await api.getIoTData();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIoT();
  }, []);

  const health = data?.systemHealth || {
    power: { value: 48.6, unit: 'kW', status: 'OPTIMAL', text: 'Grid Online (48.6 kW)' },
    water: { value: 78.4, unit: '%', status: 'NORMAL', text: 'Overhead Tanks 78%' },
    security: { value: 100, unit: 'ANPR', status: 'ARMED', text: '100% Cams & Boom Online' },
    airQuality: { value: 58, unit: 'AQI', status: 'NORMAL', text: 'AQI 58 (Good)' },
    parking: { value: 70, unit: '%', status: 'NORMAL', text: '18 Bays Available (70% Occupied)' },
  };

  const trendData = data?.history || [
    { time: '00:00', power: 32.1, water: 88, aqi: 45, parking: 40 },
    { time: '03:00', power: 26.4, water: 86, aqi: 40, parking: 42 },
    { time: '06:00', power: 41.2, water: 82, aqi: 52, parking: 41 },
    { time: '09:00', power: 58.7, water: 71, aqi: 68, parking: 28 },
    { time: '12:00', power: 52.3, water: 65, aqi: 62, parking: 30 },
    { time: '15:00', power: 49.0, water: 74, aqi: 59, parking: 32 },
    { time: '18:00', power: 64.8, water: 76, aqi: 74, parking: 39 },
    { time: '21:00', power: 56.2, water: 78, aqi: 65, parking: 42 },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Demo Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Smart Society IoT Telemetry</h2>
            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold border border-primary/30 uppercase tracking-wider">
              {data?.mode || 'DEMO_SIMULATION'}
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            Continuous sensor telemetry for water reservoirs, substation power, air quality index & parking
          </p>
        </div>

        <button
          onClick={fetchIoT}
          className="px-3.5 py-2 rounded-xl bg-surface border border-border text-text-secondary hover:text-white text-xs font-semibold flex items-center gap-2 self-start sm:self-auto transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* KPI Cards Row (Screen 9 Inspired) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Power Incomer */}
        <div
          onClick={() => setSelectedMetric('power')}
          className={`bg-card rounded-2xl border p-5 cursor-pointer transition-all ${
            selectedMetric === 'power' ? 'border-primary ring-1 ring-primary shadow-orange-glow' : 'border-border hover:border-border-light'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Substation Load</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mt-2 font-mono">
            {health.power.value} <span className="text-xs font-sans text-text-muted">kW</span>
          </h3>
          <p className="text-[11px] text-text-secondary mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-success" />
            <span>238V • Normal Consumption</span>
          </p>
        </div>

        {/* Water Reservoirs */}
        <div
          onClick={() => setSelectedMetric('water')}
          className={`bg-card rounded-2xl border p-5 cursor-pointer transition-all ${
            selectedMetric === 'water' ? 'border-primary ring-1 ring-primary shadow-orange-glow' : 'border-border hover:border-border-light'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Water Storage</span>
            <div className="p-2 rounded-xl bg-status-info/10 text-status-info">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mt-2 font-mono">
            {health.water.value} <span className="text-xs font-sans text-text-muted">%</span>
          </h3>
          <p className="text-[11px] text-text-secondary mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-info" />
            <span>78,400 L • Overhead & Sump</span>
          </p>
        </div>

        {/* Air Quality & Environment */}
        <div
          onClick={() => setSelectedMetric('aqi')}
          className={`bg-card rounded-2xl border p-5 cursor-pointer transition-all ${
            selectedMetric === 'aqi' ? 'border-primary ring-1 ring-primary shadow-orange-glow' : 'border-border hover:border-border-light'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Podium AQI & Temp</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mt-2 font-mono">
            {health.airQuality.value} <span className="text-xs font-sans text-text-muted">AQI</span>
          </h3>
          <p className="text-[11px] text-text-secondary mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-success" />
            <span>24.6°C • 56% Humidity</span>
          </p>
        </div>

        {/* Parking Grid */}
        <div
          onClick={() => setSelectedMetric('parking')}
          className={`bg-card rounded-2xl border p-5 cursor-pointer transition-all ${
            selectedMetric === 'parking' ? 'border-primary ring-1 ring-primary shadow-orange-glow' : 'border-border hover:border-border-light'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Visitor Parking</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mt-2 font-mono">
            18 <span className="text-xs font-sans text-text-muted">Slots Free</span>
          </h3>
          <p className="text-[11px] text-text-secondary mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-warning" />
            <span>Basement 1 • 70% Occupancy</span>
          </p>
        </div>
      </div>

      {/* Historical Telemetry Chart */}
      <div className="bg-card rounded-panel border border-border p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span>24-Hour Telemetry Trend: {selectedMetric.toUpperCase()}</span>
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Historical readings captured every 3 hours across Greenview Residency IoT nodes
            </p>
          </div>

          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
            {(['power', 'water', 'aqi', 'parking'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                className={`px-3 py-1 text-xs font-semibold capitalize rounded-lg transition ${
                  selectedMetric === m
                    ? 'bg-primary text-background'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF8A00" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF8A00" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#6C7A87" fontSize={11} />
              <YAxis stroke="#6C7A87" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#10171D',
                  borderColor: '#2B363F',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#F5F7FA',
                }}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric === 'parking' ? 'parkingOccupancy' : selectedMetric}
                stroke="#FF8A00"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Connected Physical Nodes Table */}
      <div className="bg-card rounded-panel border border-border p-5">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          Hardware Sensor Node Directory
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-text-muted uppercase">
                <th className="py-2.5 px-3">Device / Node Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Physical Location</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Battery / Power</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {(data?.devices || []).map((dev: any) => (
                <tr key={dev.id} className="hover:bg-surface/50">
                  <td className="py-3 px-3 font-semibold text-text-primary">{dev.name}</td>
                  <td className="py-3 px-3 font-mono text-text-muted text-[11px]">{dev.deviceType}</td>
                  <td className="py-3 px-3 text-text-secondary">{dev.location}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={dev.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-text-primary">
                    {dev.batteryLevel ? `${dev.batteryLevel}%` : 'AC Grid Mains'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

