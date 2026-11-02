// In-Browser Client-Side Storage & Mock Engine for Standalone / Static Host Deployment (e.g. Netlify)

const STORAGE_KEYS = {
  USERS: 'resisync_mock_users',
  SOCIETIES: 'resisync_mock_societies',
  VISITORS: 'resisync_mock_visitors',
  DELIVERIES: 'resisync_mock_deliveries',
  BILLS: 'resisync_mock_bills',
  AMENITIES: 'resisync_mock_amenities',
  BOOKINGS: 'resisync_mock_bookings',
  COMPLAINTS: 'resisync_mock_complaints',
  ANNOUNCEMENTS: 'resisync_mock_announcements',
  EMERGENCIES: 'resisync_mock_emergencies',
  FIREBASE: 'resisync_mock_firebase',
};

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage write failed', e);
  }
}

// Initial Seed Data
const DEFAULT_SOCIETY = {
  id: 'soc-greenview-01',
  name: 'Greenview Residency',
  address: 'Plot 42, Outer Ring Road, Bellandur',
  city: 'Bengaluru',
  state: 'Karnataka',
  zipCode: '560103',
  totalFlats: 140,
  societyCode: 'GRNVW-2026',
};

const DEFAULT_USERS = [
  {
    id: 'user-resident-01',
    name: 'Rahul Sharma',
    email: 'resident@resisync.com',
    phone: '+91 98765 43210',
    role: 'RESIDENT',
    flatId: 'flat-a-402',
    flat: { flatNumber: 'A-402', floorNumber: 4, bhkType: '3 BHK' },
    societyId: 'soc-greenview-01',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    residentProfile: {
      occupancyType: 'OWNER',
      emergencyContactName: 'Anjali Sharma',
      emergencyContactPhone: '+91 98765 43219',
    },
    familyMembers: [
      { id: 'fam-01', name: 'Anjali Sharma', relation: 'Spouse', phone: '+91 98765 43219', age: 32 },
      { id: 'fam-02', name: 'Aarav Sharma', relation: 'Son', age: 8 },
    ],
    vehicles: [
      { id: 'veh-01', vehicleType: 'FOUR_WHEELER', vehicleNumber: 'KA 01 MJ 4022', parkingSlot: 'P-402', makeModel: 'Honda City' },
      { id: 'veh-02', vehicleType: 'EV', vehicleNumber: 'KA 01 EV 1109', parkingSlot: 'EV-22', makeModel: 'Ather 450X' },
    ],
  },
  {
    id: 'user-guard-01',
    name: 'Vikram Singh',
    email: 'guard@resisync.com',
    phone: '+91 98111 22334',
    role: 'SECURITY',
    societyId: 'soc-greenview-01',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'user-admin-01',
    name: 'Priya Patel',
    email: 'admin@resisync.com',
    phone: '+91 98222 33445',
    role: 'ADMIN',
    societyId: 'soc-greenview-01',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  },
];

const DEFAULT_AMENITIES = [
  {
    id: 'amen-01',
    name: 'Olympic Swimming Pool',
    category: 'POOL',
    description: 'Temperature-controlled lap pool with dedicated kids splash area and certified lifeguard.',
    capacity: 25,
    openTime: '06:00',
    closeTime: '21:00',
    slotDurationMinutes: 60,
    pricing: 0,
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop&q=60',
    status: 'AVAILABLE',
  },
  {
    id: 'amen-02',
    name: 'Cardio & Strength Gym',
    category: 'GYM',
    description: 'State-of-the-art gym equipped with LifeFitness treadmills, smith machines, and free weights.',
    capacity: 20,
    openTime: '05:30',
    closeTime: '22:30',
    slotDurationMinutes: 60,
    pricing: 0,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60',
    status: 'AVAILABLE',
  },
  {
    id: 'amen-03',
    name: 'Club House Banquet Hall',
    category: 'CLUBHOUSE',
    description: 'Elegant air-conditioned hall with audio system for birthday parties and community gatherings.',
    capacity: 100,
    openTime: '09:00',
    closeTime: '23:00',
    slotDurationMinutes: 180,
    pricing: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=60',
    status: 'AVAILABLE',
  },
  {
    id: 'amen-04',
    name: 'All-Weather Tennis Court',
    category: 'SPORTS',
    description: 'Synthetic floodlit court with racquets and balls available at the security station.',
    capacity: 4,
    openTime: '06:00',
    closeTime: '21:00',
    slotDurationMinutes: 60,
    pricing: 0,
    imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=60',
    status: 'AVAILABLE',
  },
];

const DEFAULT_BILLS = [
  {
    id: 'bill-nov-2026',
    billNumber: 'BILL-2026-11-A402',
    billingMonth: 'November 2026',
    billingYear: 2026,
    dueDate: '2026-11-15T00:00:00.000Z',
    totalAmount: 4150,
    status: 'PAID',
    paidAt: '2026-11-01T10:30:00.000Z',
    paymentMethod: 'UPI',
    flat: { flatNumber: 'A-402', building: { name: 'Tower A' } },
    items: [
      { id: 'bi-1', title: 'Monthly Maintenance (1,550 sq.ft)', amount: 3200, category: 'MAINTENANCE' },
      { id: 'bi-2', title: 'Water Infrastructure Charges', amount: 450, category: 'WATER' },
      { id: 'bi-3', title: 'Covered Parking Bay #P-402', amount: 500, category: 'PARKING' },
    ],
  },
  {
    id: 'bill-dec-2026',
    billNumber: 'BILL-2026-12-A402',
    billingMonth: 'December 2026',
    billingYear: 2026,
    dueDate: '2026-12-15T00:00:00.000Z',
    totalAmount: 4150,
    status: 'PENDING',
    flat: { flatNumber: 'A-402', building: { name: 'Tower A' } },
    items: [
      { id: 'bi-4', title: 'Monthly Maintenance (1,550 sq.ft)', amount: 3200, category: 'MAINTENANCE' },
      { id: 'bi-5', title: 'Water Infrastructure Charges', amount: 450, category: 'WATER' },
      { id: 'bi-6', title: 'Covered Parking Bay #P-402', amount: 500, category: 'PARKING' },
    ],
  },
];

const DEFAULT_VISITORS = [
  {
    id: 'vis-01',
    name: 'Kavita Iyer',
    phone: '+91 98888 77665',
    visitorType: 'GUEST',
    expectedAt: new Date(Date.now() + 3600000).toISOString(),
    status: 'APPROVED',
    passCode: '829410',
    qrToken: 'qr-token-829410',
    purpose: 'Weekend Brunch',
    flat: { flatNumber: 'A-402' },
  },
  {
    id: 'vis-02',
    name: 'Suresh Kumar',
    phone: '+91 97777 66554',
    visitorType: 'SERVICE',
    expectedAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'CHECKED_IN',
    checkInTime: new Date(Date.now() - 3600000).toISOString(),
    passCode: '319082',
    qrToken: 'qr-token-319082',
    purpose: 'AC Servicing',
    flat: { flatNumber: 'A-402' },
  },
];

const DEFAULT_DELIVERIES = [
  {
    id: 'del-01',
    company: 'Amazon Prime',
    trackingNumber: 'AMZ-IN-889912',
    deliveryPersonName: 'Vikram Singh',
    phone: '+91 91234 56789',
    status: 'AT_GATE',
    gateEntryTime: new Date(Date.now() - 1800000).toISOString(),
    flat: { flatNumber: 'A-402' },
  },
  {
    id: 'del-02',
    company: 'BlueDart',
    trackingNumber: 'BLU-990182',
    deliveryPersonName: 'Manoj Kumar',
    phone: '+91 98765 11223',
    status: 'COLLECTED',
    gateEntryTime: new Date(Date.now() - 86400000).toISOString(),
    collectedTime: new Date(Date.now() - 82800000).toISOString(),
    flat: { flatNumber: 'A-402' },
  },
];

const DEFAULT_COMPLAINTS = [
  {
    id: 'comp-01',
    ticketNumber: 'RES-7821',
    category: 'PLUMBING',
    subject: 'Low water pressure in master bedroom bathroom',
    description: 'The overhead booster pump pressure dropped below 2 bar since yesterday evening.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedStaffName: 'Ramesh (Chief Plumber)',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    flat: { flatNumber: 'A-402' },
    comments: [
      { id: 'com-1', authorName: 'Priya Patel (Admin)', authorRole: 'ADMIN', message: 'Assigned to facility plumber Ramesh.', createdAt: new Date(Date.now() - 43200000).toISOString() },
    ],
  },
  {
    id: 'comp-02',
    ticketNumber: 'RES-7820',
    category: 'ELECTRICAL',
    subject: 'Corridor light flickering near elevator landing',
    description: 'Tower A 4th floor corridor LED panel needs ballast replacement.',
    priority: 'LOW',
    status: 'RESOLVED',
    assignedStaffName: 'Suresh (Electrician)',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    resolvedAt: new Date(Date.now() - 86400000).toISOString(),
    flat: { flatNumber: 'A-402' },
    comments: [],
  },
];

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 'ann-01',
    title: 'Solar Inverter Maintenance & Switchover Test',
    content: 'Grid backup switchover testing scheduled between 10:00 AM and 11:30 AM this Thursday. Diesel backup will remain active without power disruption.',
    category: 'MAINTENANCE',
    isPinned: true,
    authorName: 'Estate Management',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'ann-02',
    title: 'Annual Society General Body Meeting (AGM 2026)',
    content: 'All resident owners are requested to attend the upcoming AGM at the Clubhouse Banquet Hall on Sunday, Nov 22nd at 10:30 AM.',
    category: 'GENERAL',
    isPinned: true,
    authorName: 'Society Secretary',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const DEFAULT_IOT = [
  {
    id: 'iot-01',
    name: 'Main Water Overhead Reservoir',
    deviceType: 'WATER_TANK',
    location: 'Rooftop Utility Zone',
    status: 'ONLINE',
    batteryLevel: 98,
    readings: [{ metricValue: 84, unit: '%', sensorType: 'WATER_LEVEL' }],
    metrics: { level: 84, capacityLitres: 50000, currentLitres: 42000, status: 'NORMAL' },
  },
  {
    id: 'iot-02',
    name: 'Cummins Diesel Generator 250kVA',
    deviceType: 'DG_GENSET',
    location: 'Basement Substation',
    status: 'ONLINE',
    batteryLevel: 100,
    readings: [{ metricValue: 42, unit: 'kW', sensorType: 'POWER_OUTPUT' }],
    metrics: { fuelLevelPercent: 91, fuelLitres: 450, outputKW: 42, status: 'NORMAL' },
  },
  {
    id: 'iot-03',
    name: 'Rooftop Solar Array 50kW',
    deviceType: 'POWER_GRID',
    location: 'Terrace Grid Inverter',
    status: 'ONLINE',
    batteryLevel: 100,
    readings: [{ metricValue: 38.4, unit: 'kW', sensorType: 'SOLAR_GENERATION' }],
    metrics: { generationKW: 38.4, efficiencyPercent: 94, status: 'NORMAL' },
  },
  {
    id: 'iot-04',
    name: 'Campus EV Fast Charging Hub',
    deviceType: 'EV_CHARGER',
    location: 'Visitor Parking Bay',
    status: 'ONLINE',
    batteryLevel: 100,
    readings: [{ metricValue: 4, unit: 'bays', sensorType: 'AVAILABLE_SLOTS' }],
    metrics: { totalBays: 6, availableBays: 4, powerDeliveredKWh: 128, status: 'NORMAL' },
  },
];

// Mock Request Router
export function handleMockRequest<T = any>(endpoint: string, options: RequestInit = {}, token: string | null = null): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};

  // ================= 1. AUTH: REGISTER SOCIETY =================
  if (endpoint === '/auth/register-society' && method === 'POST') {
    const societies = getStored<any[]>(STORAGE_KEYS.SOCIETIES, [DEFAULT_SOCIETY]);
    const users = getStored<any[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);

    const cleanPrefix = (body.societyName || 'RESI').replace(/[^A-Za-z]/g, '').slice(0, 5).toUpperCase() || 'RESI';
    const societyCode = `${cleanPrefix}-${new Date().getFullYear()}`;

    const newSociety = {
      id: `soc-${Date.now()}`,
      name: body.societyName,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      totalFlats: body.totalFlats || 100,
      societyCode,
      createdAt: new Date().toISOString(),
    };

    const newAdmin = {
      id: `user-admin-${Date.now()}`,
      name: body.adminName,
      email: body.adminEmail.toLowerCase().trim(),
      phone: body.adminPhone,
      role: 'ADMIN',
      societyId: newSociety.id,
      societyCode,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    };

    societies.push(newSociety);
    users.push(newAdmin);

    setStored(STORAGE_KEYS.SOCIETIES, societies);
    setStored(STORAGE_KEYS.USERS, users);

    const mockToken = `resisync-mock-jwt-${newAdmin.id}-${Date.now()}`;

    return Promise.resolve({
      success: true,
      message: `Society "${newSociety.name}" successfully registered! Code: ${societyCode}`,
      societyCode,
      society: newSociety,
      token: mockToken,
      user: newAdmin,
    } as any);
  }

  // ================= 2. AUTH: LOGIN =================
  if (endpoint === '/auth/login' && method === 'POST') {
    const users = getStored<any[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const identifier = (body.identifier || '').toLowerCase().trim();

    let matchedUser = users.find(
      (u) => u.email.toLowerCase() === identifier || u.phone.trim() === identifier
    );

    // If identifier was role-like
    if (!matchedUser) {
      if (identifier.includes('guard')) matchedUser = users.find((u) => u.role === 'SECURITY');
      else if (identifier.includes('admin')) matchedUser = users.find((u) => u.role === 'ADMIN');
      else matchedUser = users.find((u) => u.role === 'RESIDENT') || users[0];
    }

    const mockToken = `resisync-mock-jwt-${matchedUser.id}-${Date.now()}`;
    return Promise.resolve({
      success: true,
      token: mockToken,
      user: matchedUser,
      message: 'Login successful (Offline/Demo Mode)',
    } as any);
  }

  // ================= 3. AUTH: ME =================
  if (endpoint === '/auth/me') {
    const users = getStored<any[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    let currentUser = users[0];

    if (token) {
      const match = users.find((u) => token.includes(u.id));
      if (match) currentUser = match;
    }

    return Promise.resolve({
      success: true,
      user: currentUser,
    } as any);
  }

  // ================= 4. MAINTENANCE BILLS =================
  if (endpoint.startsWith('/maintenance') && method === 'GET') {
    const bills = getStored<any[]>(STORAGE_KEYS.BILLS, DEFAULT_BILLS);
    const totalPending = bills
      .filter((b) => b.status === 'PENDING')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    return Promise.resolve({
      success: true,
      totalPending,
      bills,
    } as any);
  }

  if (endpoint.includes('/pay') && method === 'POST') {
    const bills = getStored<any[]>(STORAGE_KEYS.BILLS, DEFAULT_BILLS);
    const billId = endpoint.split('/')[2];
    const billIndex = bills.findIndex((b) => b.id === billId || b.status === 'PENDING');

    if (billIndex >= 0) {
      bills[billIndex].status = 'PAID';
      bills[billIndex].paidAt = new Date().toISOString();
      bills[billIndex].receiptNumber = `RCPT-${Date.now().toString().slice(-6)}`;
      setStored(STORAGE_KEYS.BILLS, bills);

      return Promise.resolve({
        success: true,
        message: 'Payment processed successfully!',
        bill: bills[billIndex],
        receiptNumber: bills[billIndex].receiptNumber,
      } as any);
    }
  }

  // ================= 5. VISITORS =================
  if (endpoint === '/visitors' && method === 'GET') {
    const visitors = getStored<any[]>(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS);
    return Promise.resolve({
      success: true,
      visitors,
    } as any);
  }

  if (endpoint === '/visitors/invite' && method === 'POST') {
    const visitors = getStored<any[]>(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS);
    const passCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newVisitor = {
      id: `vis-${Date.now()}`,
      name: body.name,
      phone: body.phone,
      visitorType: body.visitorType || 'GUEST',
      expectedAt: body.expectedAt || new Date().toISOString(),
      status: 'APPROVED',
      passCode,
      qrToken: `qr-token-${passCode}`,
      purpose: body.purpose || 'Visit',
      flat: { flatNumber: 'A-402' },
    };
    visitors.unshift(newVisitor);
    setStored(STORAGE_KEYS.VISITORS, visitors);

    return Promise.resolve({
      success: true,
      visitor: newVisitor,
      message: 'Visitor pass generated successfully',
    } as any);
  }

  if (endpoint.startsWith('/visitor-passes/')) {
    const code = endpoint.split('/')[2];
    const visitors = getStored<any[]>(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS);
    const visitor = visitors.find((v) => v.passCode === code) || visitors[0];

    return Promise.resolve({
      success: true,
      visitor,
    } as any);
  }

  if (endpoint.includes('/check-in') && method === 'POST') {
    const visitors = getStored<any[]>(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS);
    const visId = endpoint.split('/')[2];
    const target = visitors.find((v) => v.id === visId) || visitors[0];
    target.status = 'CHECKED_IN';
    target.checkInTime = new Date().toISOString();
    setStored(STORAGE_KEYS.VISITORS, visitors);

    return Promise.resolve({
      success: true,
      visitor: target,
      message: 'Visitor checked in at main gate',
    } as any);
  }

  // ================= 6. AMENITIES =================
  if (endpoint === '/amenities' && method === 'GET') {
    const amenities = getStored<any[]>(STORAGE_KEYS.AMENITIES, DEFAULT_AMENITIES);
    return Promise.resolve({
      success: true,
      amenities,
    } as any);
  }

  if (endpoint === '/bookings' && method === 'POST') {
    const bookings = getStored<any[]>(STORAGE_KEYS.BOOKINGS, []);
    const newBooking = {
      id: `book-${Date.now()}`,
      amenityId: body.amenityId,
      bookingDate: body.bookingDate,
      startTime: body.startTime,
      endTime: body.endTime,
      guestsCount: body.guestsCount || 1,
      status: 'CONFIRMED',
      totalFee: 0,
      createdAt: new Date().toISOString(),
      amenity: DEFAULT_AMENITIES.find((a) => a.id === body.amenityId) || DEFAULT_AMENITIES[0],
    };
    bookings.push(newBooking);
    setStored(STORAGE_KEYS.BOOKINGS, bookings);

    return Promise.resolve({
      success: true,
      booking: newBooking,
      message: 'Amenity slot reserved successfully!',
    } as any);
  }

  // ================= 7. COMPLAINTS =================
  if (endpoint === '/complaints' && method === 'GET') {
    const complaints = getStored<any[]>(STORAGE_KEYS.COMPLAINTS, DEFAULT_COMPLAINTS);
    return Promise.resolve({
      success: true,
      complaints,
    } as any);
  }

  if (endpoint === '/complaints' && method === 'POST') {
    const complaints = getStored<any[]>(STORAGE_KEYS.COMPLAINTS, DEFAULT_COMPLAINTS);
    const ticketNum = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const newComplaint = {
      id: `comp-${Date.now()}`,
      ticketNumber: ticketNum,
      category: body.category || 'MAINTENANCE',
      subject: body.subject,
      description: body.description,
      priority: body.priority || 'MEDIUM',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      flat: { flatNumber: 'A-402' },
      comments: [],
    };
    complaints.unshift(newComplaint);
    setStored(STORAGE_KEYS.COMPLAINTS, complaints);

    return Promise.resolve({
      success: true,
      complaint: newComplaint,
      message: `Helpdesk ticket ${ticketNum} filed successfully.`,
    } as any);
  }

  // ================= 8. ANNOUNCEMENTS =================
  if (endpoint === '/announcements' && method === 'GET') {
    const announcements = getStored<any[]>(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
    return Promise.resolve({
      success: true,
      announcements,
    } as any);
  }

  // ================= 9. IOT TELEMETRY =================
  if (endpoint === '/iot') {
    return Promise.resolve({
      success: true,
      isDemoMode: true,
      devices: DEFAULT_IOT,
      systemHealth: { security: 'NORMAL', power: 'NORMAL', water: 'NORMAL', internet: 'NORMAL' },
    } as any);
  }

  // ================= 10. ANALYTICS =================
  if (endpoint === '/analytics/dashboard') {
    return Promise.resolve({
      success: true,
      kpis: {
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
      },
      charts: {
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
        amenityUsage: [
          { name: 'Gym', bookings: 84 },
          { name: 'Pool', bookings: 62 },
          { name: 'Tennis', bookings: 48 },
          { name: 'Clubhouse', bookings: 29 },
        ],
        paymentDistribution: [
          { name: 'Paid On-Time', value: 112, color: '#10B981' },
          { name: 'Pending', value: 20, color: '#F59E0B' },
          { name: 'Overdue', value: 8, color: '#EF4444' },
        ],
      },
    } as any);
  }

  // ================= 11. FIREBASE CONFIG & TEST =================
  if (endpoint === '/admin/firebase-config') {
    const config = getStored(STORAGE_KEYS.FIREBASE, {
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

    if (method === 'POST') {
      setStored(STORAGE_KEYS.FIREBASE, { ...config, ...body });
      return Promise.resolve({
        success: true,
        message: 'Firebase configuration saved successfully',
        config: { ...config, ...body },
      } as any);
    }

    return Promise.resolve({
      success: true,
      config,
    } as any);
  }

  if (endpoint === '/admin/firebase-test') {
    return Promise.resolve({
      success: true,
      message: 'All Firebase cloud connectivity and synchronization tests passed successfully!',
      timestamp: new Date().toISOString(),
      overallLatencyMs: 84,
      projectId: 'resisync-prod-cloud',
      syncMode: 'HYBRID',
      checks: [
        { check: 'DNS Resolution for Google Firebase API Host', status: 'PASSED', latencyMs: 14 },
        { check: 'Identity Token Verification & Auth Domain Check', status: 'PASSED', latencyMs: 22 },
        { check: 'Cloud Firestore Bidirectional Read/Write Handshake', status: 'PASSED', latencyMs: 28 },
        { check: 'Firebase Cloud Storage (GCS) Bucket Write Authorization', status: 'PASSED', latencyMs: 12 },
        { check: 'Firebase Cloud Messaging (FCM) Push Service Endpoint', status: 'PASSED', latencyMs: 8 },
      ],
      activeCollectionsCount: 6,
    } as any);
  }

  // Default fallback response
  return Promise.resolve({
    success: true,
    message: 'Operation completed in standalone cloud client mode',
  } as any);
}
