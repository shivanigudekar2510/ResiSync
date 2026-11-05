export interface TestPersona {
  id: string;
  roleNumber: number;
  roleTitle: string;
  name: string;
  unitOrPost: string;
  email: string;
  password: string;
  role: 'RESIDENT' | 'SECURITY' | 'ADMIN';
  personaType: 'RESIDENT' | 'GUARD' | 'RWA' | 'FACILITY' | 'TECH' | 'VENDOR';
  defaultRoute: string;
  testCodesSummary: string;
  badgeColor: string;
  avatarUrl: string;
  description: string;
}

export const TEST_PERSONAS: TestPersona[] = [
  {
    id: 'user-ego-resident-a402',
    roleNumber: 1,
    roleTitle: 'Resident (Owner)',
    name: 'Aarav Sharma',
    unitOrPost: 'Flat A-402',
    email: 'resident@emeraldgreens.in',
    password: 'Pass@123',
    role: 'RESIDENT',
    personaType: 'RESIDENT',
    defaultRoute: '/resident/dashboard',
    testCodesSummary: 'Guest OTP: 482910 • Parcel OTP: 7741 • Ticket Closure OTP: 5529',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    description: 'Owner of Flat A-402. Pre-approves guests, manages home maintenance bills, and inspects helpdesk repairs.',
  },
  {
    id: 'user-ego-guard-gate1',
    roleNumber: 2,
    roleTitle: 'Security Guard Kiosk',
    name: 'Ramesh Kumar',
    unitOrPost: 'Main Gate #1',
    email: 'guard@emeraldgreens.in',
    password: 'Gate@123',
    role: 'SECURITY',
    personaType: 'GUARD',
    defaultRoute: '/security/dashboard',
    testCodesSummary: 'Verify Guest OTP 482910, Parcel OTP 7741, or log a new Walk-In delivery',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    description: 'Gate 1 Fast-Lane Kiosk officer. Operates automated boom barrier, checks in visitors, and manages the parcel desk.',
  },
  {
    id: 'user-ego-president',
    roleNumber: 3,
    roleTitle: 'RWA Committee',
    name: 'Priya Nair',
    unitOrPost: 'RWA President',
    email: 'president@emeraldgreens.in',
    password: 'Admin@123',
    role: 'ADMIN',
    personaType: 'RWA',
    defaultRoute: '/admin/dashboard',
    testCodesSummary: 'Pending Maker-Checker payout (VP-501), Move-In NOC (NOC-301), & Violation Appeal (VIO-11)',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    description: 'RWA Board President. Co-signs attendance-linked payouts, approves move-in NOCs, and audits society accounting.',
  },
  {
    id: 'user-ego-facility',
    roleNumber: 4,
    roleTitle: 'Facility & IoT Manager',
    name: 'Vikram Menon',
    unitOrPost: 'Control Room',
    email: 'facility@emeraldgreens.in',
    password: 'Facility@123',
    role: 'ADMIN',
    personaType: 'FACILITY',
    defaultRoute: '/admin/iot',
    testCodesSummary: 'Live Tower A Water TDS (245 ppm), Tank Levels (82%), & QR Waste Audit',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    description: 'Infrastructure lead. Monitors overhead reservoir levels, water TDS telemetry, diesel generator reserves, and waste compliance.',
  },
  {
    id: 'user-ego-tech',
    roleNumber: 5,
    roleTitle: 'Maintenance Technician',
    name: 'Suresh Babu',
    unitOrPost: 'Shift A',
    email: 'tech@emeraldgreens.in',
    password: 'Tech@123',
    role: 'ADMIN',
    personaType: 'TECH',
    defaultRoute: '/admin/complaints',
    testCodesSummary: 'Close Ticket TKT-801 using Resident OTP 5529 or TKT-802 using 8812',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    description: 'On-duty electrician & plumber. Enforces zero unverified closures by requiring the resident confirmation code.',
  },
  {
    id: 'user-ego-vendor',
    roleNumber: 6,
    roleTitle: 'External Vendor',
    name: 'Apex Security Services',
    unitOrPost: 'VND-204',
    email: 'vendor@emeraldgreens.in',
    password: 'Vendor@123',
    role: 'ADMIN',
    personaType: 'VENDOR',
    defaultRoute: '/admin/maintenance',
    testCodesSummary: 'Vendor Invoice VP-501 (₹1,45,000) for Gate Security Staffing awaiting committee release',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    description: 'Contracted security services provider. Submits monthly staffing attendance logs and tracks maker-checker disbursements.',
  },
];

