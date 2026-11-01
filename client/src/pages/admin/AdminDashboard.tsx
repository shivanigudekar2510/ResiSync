import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  Building2,
  UserCheck,
  CreditCard,
  LifeBuoy,
  Cpu,
  ArrowUpRight,
  TrendingUp,
  Download,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import api from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminAnalytics()
      .then((res) => {
        if (res.success) {
          setAnalytics(res);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const kpis = analytics?.kpis || {
    totalResidents: 142,
    totalFlats: 140,
    occupiedFlats: 128,
    vacantFlats: 12,
    occupancyRate: 91,
    visitorsToday: 24,
    pendingApprovals: 2,
    openComplaints: 3,
    resolutionRate: 88,
    totalCollected: 890000,
    totalOutstanding: 65000,
    onlineIoTDevices: 6,
    totalIoTDevices: 6,
  };

  const charts = analytics?.charts || {
    monthlyCollection: [
      { month: 'Jun', collected: 780000 },
      { month: 'Jul', collected: 810000 },
      { month: 'Aug', collected: 795000 },
      { month: 'Sep', collected: 840000 },
      { month: 'Oct', collected: 870000 },
      { month: 'Nov', collected: 890000 },
    ],
    weeklyVisitors: [
      { day: 'Mon', guests: 24, deliveries: 45, cabs: 18 },
      { day: 'Tue', guests: 19, deliveries: 52, cabs: 22 },
      { day: 'Wed', guests: 28, deliveries: 48, cabs: 16 },
      { day: 'Thu', guests: 31, deliveries: 60, cabs: 25 },
      { day: 'Fri', guests: 45, deliveries: 65, cabs: 34 },
      { day: 'Sat', guests: 72, deliveries: 40, cabs: 42 },
      { day: 'Sun', guests: 88, deliveries: 35, cabs: 48 },
    ],
    complaintCategories: [
      { name: 'Plumbing', count: 4 },
      { name: 'Electrical', count: 3 },
      { name: 'Maintenance', count: 2 },
      { name: 'Security', count: 1 },
      { name: 'Cleaning', count: 1 },
    ],
    paymentDistribution: [
      { name: 'Paid On-Time', value: 112, color: '#10B981' },
      { name: 'Pending', value: 20, color: '#F59E0B' },
      { name: 'Overdue', value: 8, color: '#EF4444' },
    ],
    amenityUsage: [
      { name: 'Gym', bookings: 84 },
      { name: 'Pool', bookings: 62 },
      { name: 'Tennis', bookings: 48 },
      { name: 'Clubhouse', bookings: 29 },
      { name: 'Hall', bookings: 12 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Society Operations & Analytics</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Greenview Residency Estate Executive Command Center
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-semibold hover:border-primary text-text-secondary hover:text-white flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Monthly Report</span>
        </button>
      </div>

      {/* KPI Stats Grid (Screen 10 Inspired) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Residents"
          value={kpis.totalResidents}
          subtitle={`${kpis.occupancyRate}% occupancy`}
          icon={Users}
        />
        <StatCard
          title="Flats Occupied"
          value={`${kpis.occupiedFlats} / ${kpis.totalFlats}`}
          subtitle={`${kpis.vacantFlats} vacant units`}
          icon={Building2}
        />
        <StatCard
          title="Visitors Today"
          value={kpis.visitorsToday}
          subtitle={`${kpis.pendingApprovals} pending check`}
          icon={UserCheck}
        />
        <StatCard
          title="Open Tickets"
          value={kpis.openComplaints}
          subtitle={`${kpis.resolutionRate}% resolved`}
          icon={LifeBuoy}
          variant={kpis.openComplaints > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Nov Collections"
          value={`₹${(kpis.totalCollected / 100000).toFixed(1)}L`}
          subtitle="94% collection rate"
          icon={CreditCard}
          variant="success"
        />
        <StatCard
          title="Smart IoT Grid"
          value={`${kpis.onlineIoTDevices} / ${kpis.totalIoTDevices}`}
          subtitle="All nodes active"
          icon={Cpu}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collection Trend */}
        <div className="bg-card rounded-panel border border-border p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Monthly Maintenance Collection (₹)
              </h3>
              <p className="text-xs text-text-secondary">Historical monthly billing inflows</p>
            </div>
            <span className="text-xs font-bold text-status-success">+6.8% vs last qtr</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyCollection}>
                <XAxis dataKey="month" stroke="#6C7A87" fontSize={11} />
                <YAxis stroke="#6C7A87" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#10171D', borderColor: '#2B363F', borderRadius: '12px' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Collected']}
                />
                <Bar dataKey="collected" fill="#FF8A00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Visitor Trends */}
        <div className="bg-card rounded-panel border border-border p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Weekly Gate Traffic
              </h3>
              <p className="text-xs text-text-secondary">Guests vs Delivery couriers vs Cabs</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.weeklyVisitors}>
                <XAxis dataKey="day" stroke="#6C7A87" fontSize={11} />
                <YAxis stroke="#6C7A87" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#10171D', borderColor: '#2B363F', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="guests" stroke="#FF8A00" strokeWidth={2.5} name="Guests" />
                <Line type="monotone" dataKey="deliveries" stroke="#3B82F6" strokeWidth={2} name="Deliveries" />
                <Line type="monotone" dataKey="cabs" stroke="#10B981" strokeWidth={2} name="Cabs" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Amenity Utilization */}
        <div className="bg-card rounded-panel border border-border p-5 shadow-card">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-1">
            Amenity Slot Utilization
          </h3>
          <p className="text-xs text-text-secondary mb-4">Total reservations this month</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.amenityUsage} layout="vertical">
                <XAxis type="number" stroke="#6C7A87" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#6C7A87" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#10171D', borderColor: '#2B363F', borderRadius: '12px' }}
                />
                <Bar dataKey="bookings" fill="#10B981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Distribution */}
        <div className="bg-card rounded-panel border border-border p-5 shadow-card">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-1">
            Maintenance Settlement Breakdown
          </h3>
          <p className="text-xs text-text-secondary mb-4">Units paid on-time vs pending vs overdue</p>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.paymentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.paymentDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#10171D', borderColor: '#2B363F', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

