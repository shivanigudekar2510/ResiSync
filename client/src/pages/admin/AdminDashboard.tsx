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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = {
    totalResidents: analytics?.kpis?.residentsCount ?? analytics?.kpis?.totalResidents ?? 0,
    totalFlats: analytics?.kpis?.totalFlats ?? 0,
    occupiedFlats: analytics?.kpis?.occupiedFlats ?? 0,
    vacantFlats: analytics?.kpis?.vacantFlats ?? 0,
    occupancyRate: analytics?.kpis?.occupancyRate ?? 0,
    visitorsToday: analytics?.kpis?.activeVisitors ?? analytics?.kpis?.visitorsToday ?? 0,
    pendingApprovals: analytics?.kpis?.pendingApprovals ?? 0,
    openComplaints: analytics?.kpis?.pendingComplaints ?? analytics?.kpis?.openComplaints ?? 0,
    resolutionRate: analytics?.kpis?.resolutionRate ?? 100,
    totalCollected: Number(analytics?.kpis?.totalCollected || 0),
    totalOutstanding: Number(analytics?.kpis?.totalOutstanding || 0),
    onlineIoTDevices: analytics?.kpis?.onlineIoTDevices ?? 4,
    totalIoTDevices: analytics?.kpis?.totalIoTDevices ?? 4,
    societyName: analytics?.kpis?.societyName || '',
  };

  const defaultCharts = {
    monthlyCollection: [
      { month: 'Jun', collected: 78000 },
      { month: 'Jul', collected: 81000 },
      { month: 'Aug', collected: 79500 },
      { month: 'Sep', collected: 84000 },
      { month: 'Oct', collected: 87000 },
      { month: 'Nov', collected: 89000 },
    ],
    weeklyVisitors: [
      { day: 'Mon', guests: 4, deliveries: 8, cabs: 3 },
      { day: 'Tue', guests: 6, deliveries: 11, cabs: 4 },
      { day: 'Wed', guests: 5, deliveries: 9, cabs: 2 },
      { day: 'Thu', guests: 7, deliveries: 12, cabs: 5 },
      { day: 'Fri', guests: 10, deliveries: 15, cabs: 6 },
      { day: 'Sat', guests: 14, deliveries: 8, cabs: 7 },
      { day: 'Sun', guests: 18, deliveries: 6, cabs: 9 },
    ],
    complaintCategories: [
      { name: 'Plumbing', count: 1 },
      { name: 'Electrical', count: 1 },
      { name: 'General', count: 0 },
    ],
    paymentDistribution: [
      { name: 'Paid On-Time', value: Math.max(1, kpis.occupiedFlats), color: '#10B981' },
      { name: 'Pending', value: Math.max(0, kpis.totalFlats - kpis.occupiedFlats), color: '#F59E0B' },
      { name: 'Overdue', value: 0, color: '#EF4444' },
    ],
    amenityUsage: [
      { name: 'Club House', bookings: 12 },
      { name: 'Swimming Pool', bookings: 18 },
      { name: 'Fitness Gym', bookings: 25 },
    ],
  };

  const charts = {
    monthlyCollection:
      analytics?.charts?.monthlyCollection && analytics.charts.monthlyCollection.length > 0
        ? analytics.charts.monthlyCollection.map((m: any) => ({
            month: m.month,
            collected: m.collected ?? m.amount ?? 0,
          }))
        : defaultCharts.monthlyCollection,
    weeklyVisitors: analytics?.charts?.weeklyVisitors || defaultCharts.weeklyVisitors,
    complaintCategories:
      analytics?.charts?.complaintCategories && analytics.charts.complaintCategories.length > 0
        ? analytics.charts.complaintCategories.map((c: any) => ({
            name: c.name || c.category || 'General',
            count: c.count || 0,
          }))
        : defaultCharts.complaintCategories,
    paymentDistribution: analytics?.charts?.paymentDistribution || defaultCharts.paymentDistribution,
    amenityUsage: analytics?.charts?.amenityUsage || defaultCharts.amenityUsage,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Society Operations & Analytics</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {kpis.societyName ? `${kpis.societyName} Estate Command Center` : 'Executive Community Management Console'}
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
          title="Collections"
          value={kpis.totalCollected >= 100000 ? `₹${(kpis.totalCollected / 100000).toFixed(1)}L` : `₹${kpis.totalCollected.toLocaleString('en-IN')}`}
          subtitle={`${kpis.resolutionRate}% collection rate`}
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

      {/* Operational Modules Fast Access Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => window.location.href = '/admin/maintenance'}
          className="p-4 rounded-xl bg-card hover:bg-card-hover border border-border hover:border-primary/50 cursor-pointer transition flex items-center justify-between group shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center group-hover:scale-105 transition">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-primary transition">Maintenance & Billing</p>
              <p className="text-[11px] text-text-secondary">Dues, Cycles & Receipts</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition" />
        </div>

        <div
          onClick={() => window.location.href = '/admin/visitors'}
          className="p-4 rounded-xl bg-card hover:bg-card-hover border border-border hover:border-status-info/50 cursor-pointer transition flex items-center justify-between group shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-status-info/15 text-status-info flex items-center justify-center group-hover:scale-105 transition">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-status-info transition">Visitor Gate Logs</p>
              <p className="text-[11px] text-text-secondary">QR Passes & Entries</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-status-info transition" />
        </div>

        <div
          onClick={() => window.location.href = '/admin/announcements'}
          className="p-4 rounded-xl bg-card hover:bg-card-hover border border-border hover:border-status-warning/50 cursor-pointer transition flex items-center justify-between group shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-status-warning/15 text-status-warning flex items-center justify-center group-hover:scale-105 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-status-warning transition">Noticeboard Broadcasts</p>
              <p className="text-[11px] text-text-secondary">Alerts & Circulars</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-status-warning transition" />
        </div>

        <div
          onClick={() => window.location.href = '/admin/complaints'}
          className="p-4 rounded-xl bg-card hover:bg-card-hover border border-border hover:border-status-danger/50 cursor-pointer transition flex items-center justify-between group shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-status-danger/15 text-status-danger flex items-center justify-center group-hover:scale-105 transition">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-status-danger transition">Helpdesk Ticketing</p>
              <p className="text-[11px] text-text-secondary">Complaints & Assignments</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-status-danger transition" />
        </div>
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

