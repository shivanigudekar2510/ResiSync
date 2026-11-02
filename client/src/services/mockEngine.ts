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
  NOTIFICATIONS: 'resisync_mock_notifications',
  FLATS: 'resisync_mock_flats',
  AUDIT_LOGS: 'resisync_mock_audit_logs',
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
    pricing: 350,
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
    pricing: 250,
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
    pricing: 400,
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
    purpose: 'Weekend Family Brunch & Visit',
    vehicleNumber: 'KA-05-MH-2041',
    flat: { flatNumber: 'A-402' },
    invitedBy: { name: 'Rahul Sharma', phone: '+91 98765 43210' },
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
    purpose: 'Air Conditioner Servicing & Coil Clean',
    vehicleNumber: 'KA-01-AB-4412',
    flat: { flatNumber: 'A-402' },
    invitedBy: { name: 'Rahul Sharma', phone: '+91 98765 43210' },
  },
  {
    id: 'vis-03',
    name: 'Amazon Prime Express',
    phone: '+91 91234 56789',
    visitorType: 'DELIVERY',
    expectedAt: new Date(Date.now() - 1800000).toISOString(),
    status: 'APPROVED',
    passCode: '491204',
    qrToken: 'qr-token-491204',
    purpose: 'E-commerce Parcel Box Delivery',
    vehicleNumber: 'KA-03-DL-8819',
    flat: { flatNumber: 'A-402' },
    invitedBy: { name: 'Rahul Sharma', phone: '+91 98765 43210' },
  },
  {
    id: 'vis-04',
    name: 'Dr. Sameer Sen',
    phone: '+91 94455 66778',
    visitorType: 'GUEST',
    expectedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'CHECKED_OUT',
    checkInTime: new Date(Date.now() - 86400000).toISOString(),
    checkOutTime: new Date(Date.now() - 82800000).toISOString(),
    passCode: '551920',
    qrToken: 'qr-token-551920',
    purpose: 'Medical Consultation',
    flat: { flatNumber: 'B-201' },
    invitedBy: { name: 'Ananya Deshmukh', phone: '+91 98112 33445' },
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
      name: body.adminName || 'Vikramaditya Rao',
      email: (body.adminEmail || 'admin@resisync.com').toLowerCase().trim(),
      phone: body.adminPhone || '+91 98200 12345',
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

  // ================= 1B. AUTH: REGISTER RESIDENT =================
  if (endpoint === '/auth/register' && method === 'POST') {
    const users = getStored<any[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const email = (body.email || '').toLowerCase().trim();

    const existing = users.find((u) => u.email.toLowerCase() === email);
    if (existing) {
      return Promise.resolve({
        success: false,
        message: 'An account with this email address already exists.',
      } as any);
    }

    const newResident = {
      id: `user-resident-${Date.now()}`,
      name: body.name || 'Resident Member',
      email: email,
      phone: body.phone || '+91 98000 00000',
      role: 'RESIDENT',
      flatId: `flat-${(body.flatNumber || 'A-301').toLowerCase().replace(/\s+/g, '-')}`,
      flat: { flatNumber: body.flatNumber || 'A-301', floorNumber: 3, bhkType: '3 BHK' },
      societyId: 'soc-greenview-01',
      societyCode: body.societyCode || 'GRNVW-2026',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      residentProfile: {
        occupancyType: 'OWNER',
        emergencyContactName: 'Family Member',
        emergencyContactPhone: body.phone || '+91 98000 00000',
      },
      familyMembers: [],
      vehicles: [],
    };

    users.push(newResident);
    setStored(STORAGE_KEYS.USERS, users);

    const mockToken = `resisync-mock-jwt-${newResident.id}-${Date.now()}`;

    return Promise.resolve({
      success: true,
      token: mockToken,
      user: newResident,
      message: 'Resident account created successfully!',
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
    const urlParams = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');
    const statusParam = urlParams.get('status');
    const filteredBills = (statusParam && statusParam !== 'ALL') ? bills.filter((b) => b.status === statusParam) : bills;

    const totalPending = bills
      .filter((b) => b.status === 'PENDING')
      .reduce((sum, b) => sum + b.totalAmount, 0);
    const totalCollected = bills
      .filter((b) => b.status === 'PAID')
      .reduce((sum, b) => sum + b.totalAmount, 0);
    const totalBilled = totalPending + totalCollected;
    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;

    return Promise.resolve({
      success: true,
      totalPending,
      bills: filteredBills,
      metrics: {
        totalBilled,
        totalCollected,
        totalPending,
        collectionRate,
      },
    } as any);
  }

  if (endpoint === '/maintenance' && method === 'POST') {
    const bills = getStored<any[]>(STORAGE_KEYS.BILLS, DEFAULT_BILLS);
    const defaultFlats: any[] = [
      { id: 'flat-a-101', flatNumber: 'A-101' },
      { id: 'flat-a-202', flatNumber: 'A-202' },
      { id: 'flat-a-303', flatNumber: 'A-303' },
      { id: 'flat-a-402', flatNumber: 'A-402' },
      { id: 'flat-b-101', flatNumber: 'B-101' },
      { id: 'flat-b-201', flatNumber: 'B-201' },
      { id: 'flat-c-101', flatNumber: 'C-101' },
    ];
    const flats = getStored<any[]>(STORAGE_KEYS.FLATS, defaultFlats);
    const targetFlat = flats.find((f: any) => f.id === body.flatId || f.flatNumber === body.flatNumber) || {
      id: body.flatId || 'flat-a-402',
      flatNumber: body.flatNumber || 'A-402',
    };

    const items = body.items && Array.isArray(body.items) && body.items.length > 0
      ? body.items.map((it: any, idx: number) => ({
          id: `bi-${Date.now()}-${idx}`,
          title: it.title || 'Society Assessment Charge',
          amount: Number(it.amount) || 0,
          category: it.category || 'MAINTENANCE',
        }))
      : [
          { id: 'bi-1', title: 'Base Society Maintenance', amount: Number(body.amount || body.baseAmount || 3200), category: 'MAINTENANCE' },
          { id: 'bi-2', title: 'Water Infrastructure Charges', amount: 450, category: 'WATER' },
          { id: 'bi-3', title: 'Covered Parking Bay', amount: 500, category: 'PARKING' },
        ];

    const totalAmount = items.reduce((sum: number, it: any) => sum + (Number(it.amount) || 0), 0);
    const billingMonth = body.billingMonth || body.month || 'December 2026';

    const newBill = {
      id: `bill-${Date.now()}`,
      billNumber: `BILL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      billingMonth,
      billingYear: body.billingYear || body.year || 2026,
      dueDate: body.dueDate || new Date(Date.now() + 86400000 * 15).toISOString(),
      totalAmount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      flat: { id: targetFlat.id, flatNumber: targetFlat.flatNumber, building: { name: targetFlat.buildingName || 'Tower A' } },
      items,
    };
    bills.unshift(newBill);
    setStored(STORAGE_KEYS.BILLS, bills);

    return Promise.resolve({
      success: true,
      bill: newBill,
      message: `Maintenance invoice generated for Flat ${targetFlat.flatNumber} (${billingMonth}) successfully.`,
    } as any);
  }

  if (endpoint.includes('/pay') && method === 'POST') {
    const bills = getStored<any[]>(STORAGE_KEYS.BILLS, DEFAULT_BILLS);
    const billId = endpoint.split('/')[2];
    const billIndex = bills.findIndex((b) => b.id === billId || b.status === 'PENDING');

    if (billIndex >= 0) {
      bills[billIndex].status = 'PAID';
      bills[billIndex].paidAt = new Date().toISOString();
      bills[billIndex].paymentMethod = body.paymentMethod || 'UPI';
      bills[billIndex].transactionId = `TXN-${Date.now().toString().slice(-8).toUpperCase()}`;
      bills[billIndex].receiptNumber = `RCPT-${Date.now().toString().slice(-6)}`;
      setStored(STORAGE_KEYS.BILLS, bills);

      return Promise.resolve({
        success: true,
        message: 'Payment processed successfully! Official digital receipt generated.',
        bill: bills[billIndex],
        receiptNumber: bills[billIndex].receiptNumber,
      } as any);
    }
  }

  // ================= 5. VISITORS =================
  if (endpoint.startsWith('/visitors') && method === 'GET') {
    const urlParams = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');
    const tab = urlParams.get('tab');
    const search = urlParams.get('search')?.toLowerCase() || '';
    let visitors = getStored<any[]>(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS);

    if (tab === 'inside') {
      visitors = visitors.filter((v) => v.status === 'CHECKED_IN');
    } else if (tab === 'today') {
      visitors = visitors.filter((v) => v.status === 'APPROVED' || v.status === 'EXPECTED');
    } else if (tab === 'history') {
      visitors = visitors.filter((v) => v.status === 'CHECKED_OUT' || v.status === 'CHECKED_IN' || v.checkInTime);
    }

    if (search) {
      visitors = visitors.filter(
        (v) =>
          v.name?.toLowerCase().includes(search) ||
          v.phone?.toLowerCase().includes(search) ||
          v.passCode?.toLowerCase().includes(search) ||
          v.flat?.flatNumber?.toLowerCase().includes(search) ||
          v.purpose?.toLowerCase().includes(search)
      );
    }

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
      purpose: body.purpose || 'Personal Visit / Guest Entry',
      vehicleNumber: body.vehicleNumber || '',
      flat: { flatNumber: body.flatNumber || 'A-402' },
      invitedBy: { name: 'Rahul Sharma', phone: '+91 98765 43210' },
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

  if (endpoint.includes('/check-out') && method === 'POST') {
    const visitors = getStored<any[]>(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS);
    const visId = endpoint.split('/')[2];
    const target = visitors.find((v) => v.id === visId) || visitors[0];
    if (target) {
      target.status = 'CHECKED_OUT';
      target.checkOutTime = new Date().toISOString();
      setStored(STORAGE_KEYS.VISITORS, visitors);
    }

    return Promise.resolve({
      success: true,
      visitor: target,
      message: 'Visitor checked out successfully',
    } as any);
  }

  if (endpoint.includes('/status') && endpoint.startsWith('/visitors') && method === 'PATCH') {
    const visitors = getStored<any[]>(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS);
    const visId = endpoint.split('/')[2];
    const target = visitors.find((v) => v.id === visId) || visitors[0];
    if (target) {
      target.status = body.status || 'APPROVED';
      setStored(STORAGE_KEYS.VISITORS, visitors);
    }

    return Promise.resolve({
      success: true,
      visitor: target,
      message: `Visitor status updated to ${body.status}`,
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

  if (endpoint.startsWith('/amenities/') && method === 'PATCH') {
    const amenities = getStored<any[]>(STORAGE_KEYS.AMENITIES, DEFAULT_AMENITIES);
    const amenId = endpoint.split('/')[2];
    const index = amenities.findIndex((a) => a.id === amenId);
    if (index >= 0) {
      amenities[index] = { ...amenities[index], ...body };
      setStored(STORAGE_KEYS.AMENITIES, amenities);
      return Promise.resolve({
        success: true,
        amenity: amenities[index],
        message: 'Amenity settings updated successfully.',
      } as any);
    }
    return Promise.resolve({ success: true, message: 'Amenity updated' } as any);
  }

  if (endpoint === '/bookings/my' && method === 'GET') {
    const defaultBookings = [
      {
        id: 'book-01',
        amenityId: 'amen-01',
        bookingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        startTime: '07:00',
        endTime: '08:00',
        guestsCount: 2,
        status: 'CONFIRMED',
        totalFee: 350,
        createdAt: new Date().toISOString(),
        amenity: DEFAULT_AMENITIES[0],
      },
    ];
    const bookings = getStored<any[]>(STORAGE_KEYS.BOOKINGS, defaultBookings);
    return Promise.resolve({
      success: true,
      bookings,
    } as any);
  }

  if (endpoint === '/bookings' && method === 'POST') {
    const bookings = getStored<any[]>(STORAGE_KEYS.BOOKINGS, []);
    const amenities = getStored<any[]>(STORAGE_KEYS.AMENITIES, DEFAULT_AMENITIES);
    const targetAmenity = amenities.find((a: any) => a.id === body.amenityId) || DEFAULT_AMENITIES[0];
    const calculatedFee = body.totalFee !== undefined && Number(body.totalFee) > 0
      ? Number(body.totalFee)
      : (Number(targetAmenity?.pricing) || 350);

    const newBooking = {
      id: `book-${Date.now()}`,
      amenityId: body.amenityId,
      bookingDate: body.bookingDate,
      startTime: body.startTime,
      endTime: body.endTime,
      guestsCount: body.guestsCount || 1,
      status: 'CONFIRMED',
      totalFee: calculatedFee,
      createdAt: new Date().toISOString(),
      amenity: targetAmenity,
    };
    bookings.push(newBooking);
    setStored(STORAGE_KEYS.BOOKINGS, bookings);

    return Promise.resolve({
      success: true,
      booking: newBooking,
      message: `Amenity slot reserved successfully! Fee: ₹${calculatedFee}`,
    } as any);
  }

  if (endpoint.includes('/cancel') && endpoint.startsWith('/bookings') && method === 'POST') {
    const bookings = getStored<any[]>(STORAGE_KEYS.BOOKINGS, []);
    const bookId = endpoint.split('/')[2];
    const target = bookings.find((b) => b.id === bookId);
    if (target) {
      target.status = 'CANCELLED';
      setStored(STORAGE_KEYS.BOOKINGS, bookings);
    }
    return Promise.resolve({
      success: true,
      message: 'Amenity booking cancelled successfully.',
    } as any);
  }

  // ================= 7. COMPLAINTS & HELPDESK =================
  if (endpoint.startsWith('/complaints') && method === 'GET') {
    const urlParams = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');
    const statusFilter = urlParams.get('status');
    const categoryFilter = urlParams.get('category');
    let complaints = getStored<any[]>(STORAGE_KEYS.COMPLAINTS, DEFAULT_COMPLAINTS);

    if (statusFilter && statusFilter !== 'ALL') {
      complaints = complaints.filter((c: any) => c.status === statusFilter);
    }
    if (categoryFilter && categoryFilter !== 'ALL') {
      complaints = complaints.filter((c: any) => c.category === categoryFilter);
    }

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
      flat: { flatNumber: body.flatNumber || 'A-402' },
      residentName: 'Rahul Sharma',
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

  if (endpoint.includes('/comments') && method === 'POST') {
    const complaints = getStored<any[]>(STORAGE_KEYS.COMPLAINTS, DEFAULT_COMPLAINTS);
    const compId = endpoint.split('/')[2];
    const target = complaints.find((c) => c.id === compId);
    const newComment = {
      id: `com-${Date.now()}`,
      authorName: 'Rahul Sharma (You)',
      authorRole: 'RESIDENT',
      message: body.message,
      createdAt: new Date().toISOString(),
    };
    if (target) {
      target.comments = target.comments || [];
      target.comments.push(newComment);
      setStored(STORAGE_KEYS.COMPLAINTS, complaints);
    }
    return Promise.resolve({
      success: true,
      comment: newComment,
      message: 'Comment posted successfully',
    } as any);
  }

  if (endpoint.includes('/status') && endpoint.startsWith('/complaints') && method === 'PATCH') {
    const complaints = getStored<any[]>(STORAGE_KEYS.COMPLAINTS, DEFAULT_COMPLAINTS);
    const compId = endpoint.split('/')[2];
    const target = complaints.find((c) => c.id === compId);
    if (target) {
      target.status = body.status || target.status;
      if (body.status === 'RESOLVED') {
        target.resolvedAt = new Date().toISOString();
      }
      if (body.assignedStaffName) target.assignedStaffName = body.assignedStaffName;
      setStored(STORAGE_KEYS.COMPLAINTS, complaints);
    }
    return Promise.resolve({
      success: true,
      complaint: target,
      message: 'Helpdesk ticket status updated successfully',
    } as any);
  }

  // ================= 8. ANNOUNCEMENTS =================
  if (endpoint.startsWith('/announcements') && method === 'GET') {
    const announcements = getStored<any[]>(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
    return Promise.resolve({
      success: true,
      announcements,
    } as any);
  }

  if (endpoint === '/announcements' && method === 'POST') {
    const announcements = getStored<any[]>(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
    const newNotice = {
      id: `ann-${Date.now()}`,
      title: body.title,
      content: body.content,
      category: body.category || 'GENERAL',
      priority: body.priority || 'MEDIUM',
      isPinned: !!body.isPinned,
      authorName: 'Priya Patel (Facility Admin)',
      createdAt: new Date().toISOString(),
    };
    announcements.unshift(newNotice);
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, announcements);

    // Broadcast notification to Resident & Guard notification bells
    const defaultNotifs: any[] = [
      {
        id: 'notif-01',
        title: 'Visitor Pass Approved',
        message: 'Security gate verified guest Aarush Patel for Flat A-402.',
        type: 'VISITOR',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
    ];
    let notifs = getStored<any[]>(STORAGE_KEYS.NOTIFICATIONS, defaultNotifs);
    notifs.unshift({
      id: `notif-${Date.now()}`,
      title: `📢 Notice: ${body.title}`,
      message: body.content?.slice(0, 120) + (body.content?.length > 120 ? '...' : ''),
      type: 'ANNOUNCEMENT',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);

    return Promise.resolve({
      success: true,
      announcement: newNotice,
      message: 'Notice broadcasted to society residents and staff successfully.',
    } as any);
  }

  // ================= 9. IOT TELEMETRY =================
  if (endpoint.startsWith('/iot')) {
    const iotData = {
      success: true,
      isDemoMode: true,
      mode: 'HARDWARE_SIMULATION',
      devices: DEFAULT_IOT,
      systemHealth: {
        power: { value: 48.6, unit: 'kW', status: 'OPTIMAL', text: 'Grid Online (48.6 kW)' },
        water: { value: 78.4, unit: '%', status: 'NORMAL', text: 'Overhead Tanks 78%' },
        security: { value: 100, unit: 'ANPR', status: 'ARMED', text: '100% Cams & Boom Online' },
        airQuality: { value: 58, unit: 'AQI', status: 'NORMAL', text: 'AQI 58 (Good)' },
        parking: { value: 70, unit: '%', status: 'NORMAL', text: '18 Bays Available (70% Occupied)' },
      },
      history: [
        { time: '00:00', power: 32.1, water: 88, aqi: 45, parking: 40 },
        { time: '04:00', power: 26.4, water: 86, aqi: 40, parking: 42 },
        { time: '08:00', power: 54.2, water: 81, aqi: 62, parking: 78 },
        { time: '12:00', power: 61.8, water: 76, aqi: 65, parking: 65 },
        { time: '16:00', power: 48.5, water: 74, aqi: 58, parking: 55 },
        { time: '20:00', power: 58.2, water: 72, aqi: 55, parking: 85 },
      ],
    };
    return Promise.resolve(iotData as any);
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

  // ================= 12. NOTIFICATIONS =================
  if (endpoint.startsWith('/notifications')) {
    const defaultNotifs: any[] = [
      {
        id: 'notif-01',
        title: 'Visitor Pass Approved',
        message: 'Security gate verified guest Aarush Patel for Flat A-402.',
        type: 'VISITOR',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: 'notif-02',
        title: 'Maintenance Bill Generated',
        message: 'Q4 Society Maintenance bill for ₹4,200 is due on Nov 15.',
        type: 'MAINTENANCE',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: 'notif-03',
        title: 'Scheduled Amenity Maintenance',
        message: 'Clubhouse gym equipment calibration completed.',
        type: 'SYSTEM',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ];

    let notifs = getStored(STORAGE_KEYS.NOTIFICATIONS, defaultNotifs);

    if (endpoint.includes('/read')) {
      const notifId = endpoint.split('/')[2];
      notifs = notifs.map((n: any) => (n.id === notifId ? { ...n, isRead: true } : n));
      setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
      return Promise.resolve({ success: true } as any);
    }

    const unreadCount = notifs.filter((n: any) => !n.isRead).length;
    return Promise.resolve({
      success: true,
      unreadCount,
      notifications: notifs,
    } as any);
  }

  // ================= 13. DELIVERIES =================
  if (endpoint.startsWith('/deliveries')) {
    const defaultDeliveries: any[] = [
      {
        id: 'del-01',
        company: 'Amazon Prime',
        trackingNumber: 'AMZ-IN-889021',
        deliveryPersonName: 'Kishore Kumar',
        phone: '+91 98334 11223',
        status: 'AT_GATE',
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        flat: { flatNumber: 'A-402' },
      },
      {
        id: 'del-02',
        company: 'Blinkit Express',
        trackingNumber: 'BLK-4421',
        deliveryPersonName: 'Sunil Rao',
        phone: '+91 98441 55667',
        status: 'COLLECTED',
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        flat: { flatNumber: 'B-104' },
      },
    ];

    let deliveries = getStored(STORAGE_KEYS.DELIVERIES, defaultDeliveries);

    if (method === 'POST') {
      const newDel = {
        id: `del-${Date.now().toString(36)}`,
        company: body.company || 'Courier Delivery',
        trackingNumber: body.trackingNumber || `PKG-${Date.now().toString().slice(-6)}`,
        deliveryPersonName: body.deliveryPersonName || 'Courier Partner',
        phone: body.phone || '+91 98000 00000',
        status: 'AT_GATE',
        createdAt: new Date().toISOString(),
        flat: { flatNumber: body.flatNumber || 'A-402' },
      };
      deliveries = [newDel, ...deliveries];
      setStored(STORAGE_KEYS.DELIVERIES, deliveries);
      return Promise.resolve({
        success: true,
        delivery: newDel,
        message: 'Delivery recorded and resident notified successfully.',
      } as any);
    }

    if (endpoint.includes('/collect') && method === 'PATCH') {
      const delId = endpoint.split('/')[2];
      const target = deliveries.find((d: any) => d.id === delId);
      if (target) {
        target.status = 'COLLECTED';
        target.collectedTime = new Date().toISOString();
        setStored(STORAGE_KEYS.DELIVERIES, deliveries);
      }
      return Promise.resolve({
        success: true,
        delivery: target,
        message: 'Package marked as collected by resident.',
      } as any);
    }

    return Promise.resolve({
      success: true,
      deliveries,
    } as any);
  }

  // ================= 14. EMERGENCY & SOS =================
  if (endpoint.startsWith('/emergency')) {
    const defaultEmergencies: any[] = [
      {
        id: 'emg-02',
        emergencyType: 'SECURITY',
        residentName: 'Anita Rao',
        residentPhone: '+91 98333 44556',
        flatNumber: 'B-101',
        status: 'ACTIVE',
        note: 'Suspicious individual loitering near ground floor parking bay P-101.',
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      },
      {
        id: 'emg-01',
        emergencyType: 'MEDICAL',
        residentName: 'Rahul Sharma',
        residentPhone: '+91 98765 43210',
        flatNumber: 'A-402',
        status: 'RESOLVED',
        note: 'First aid dispatch requested for sprained ankle.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
      },
    ];

    let emergencies = getStored(STORAGE_KEYS.EMERGENCIES, defaultEmergencies);

    if (endpoint === '/emergency/contacts') {
      return Promise.resolve({
        success: true,
        contacts: [
          { role: 'Main Gate Security Guard Desk', name: 'Vikram Singh', phone: '+91 98111 22334', priority: 1 },
          { role: 'Estate Manager / Society Office', name: 'Priya Patel', phone: '+91 98222 33445', priority: 2 },
          { role: 'Local Police Control Room', name: 'City Police HQ', phone: '100 / 112', priority: 3 },
          { role: 'Nearest Trauma & Ambulance', name: 'Manipal Hospital ER', phone: '108 / +91 80 2222 1111', priority: 4 },
          { role: 'Fire & Rescue Station', name: 'State Fire Services', phone: '101', priority: 5 },
        ],
      } as any);
    }

    if (endpoint === '/emergency/sos' && method === 'POST') {
      const newEmg = {
        id: `emg-${Date.now().toString(36)}`,
        emergencyType: body.emergencyType || 'SECURITY',
        residentName: 'Rahul Sharma',
        residentPhone: '+91 98765 43210',
        flatNumber: 'A-402',
        status: 'ACTIVE',
        note: body.note || 'Emergency SOS alarm triggered from mobile web application.',
        createdAt: new Date().toISOString(),
      };
      emergencies = [newEmg, ...emergencies];
      setStored(STORAGE_KEYS.EMERGENCIES, emergencies);
      return Promise.resolve({
        success: true,
        message: '🚨 Emergency SOS alert activated. Gate security desk and management notified immediately.',
        emergency: newEmg,
        verifiedDelivery: true,
      } as any);
    }

    if (endpoint.includes('/resolve') && method === 'POST') {
      const emgId = endpoint.split('/')[2];
      emergencies = emergencies.map((e: any) =>
        e.id === emgId ? { ...e, status: 'RESOLVED', resolvedAt: new Date().toISOString() } : e
      );
      setStored(STORAGE_KEYS.EMERGENCIES, emergencies);
      return Promise.resolve({
        success: true,
        message: 'Emergency status updated to resolved.',
      } as any);
    }

    return Promise.resolve({
      success: true,
      emergencies,
    } as any);
  }

  // ================= 15. ADMIN FLATS, RESIDENTS, AUDIT LOGS =================
  if (endpoint === '/admin/flats') {
    const defaultFlats: any[] = [
      { id: 'flat-a-101', flatNumber: 'A-101', floorNumber: 1, bhkType: '2 BHK', sqFt: 1150, status: 'OCCUPIED' },
      { id: 'flat-a-202', flatNumber: 'A-202', floorNumber: 2, bhkType: '3 BHK', sqFt: 1450, status: 'OCCUPIED' },
      { id: 'flat-a-303', flatNumber: 'A-303', floorNumber: 3, bhkType: '3 BHK', sqFt: 1450, status: 'OCCUPIED' },
      { id: 'flat-a-402', flatNumber: 'A-402', floorNumber: 4, bhkType: '3 BHK', sqFt: 1600, status: 'OCCUPIED' },
      { id: 'flat-b-101', flatNumber: 'B-101', floorNumber: 1, bhkType: '2 BHK', sqFt: 1150, status: 'VACANT' },
      { id: 'flat-b-201', flatNumber: 'B-201', floorNumber: 2, bhkType: '3 BHK', sqFt: 1450, status: 'OCCUPIED' },
      { id: 'flat-c-101', flatNumber: 'C-101', floorNumber: 1, bhkType: '4 BHK Penthouse', sqFt: 2400, status: 'OCCUPIED' },
    ];
    let flats = getStored(STORAGE_KEYS.FLATS, defaultFlats);

    if (method === 'POST') {
      const newFlat = {
        id: `flat-${Date.now().toString(36)}`,
        flatNumber: body.flatNumber?.toUpperCase() || 'A-501',
        floorNumber: Number(body.floorNumber) || 5,
        bhkType: body.bhkType || '3 BHK',
        sqFt: Number(body.sqFt) || 1400,
        status: body.status || 'VACANT',
      };
      flats = [...flats, newFlat];
      setStored(STORAGE_KEYS.FLATS, flats);
      return Promise.resolve({ success: true, message: 'Flat created', flat: newFlat } as any);
    }

    return Promise.resolve({ success: true, count: flats.length, flats } as any);
  }

  if (endpoint === '/admin/residents') {
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const residents = users.filter((u: any) => u.role === 'RESIDENT');
    return Promise.resolve({ success: true, count: residents.length, residents } as any);
  }

  if (endpoint === '/admin/audit-logs') {
    const defaultLogs: any[] = [
      { id: 'log-01', action: 'VISITOR_CHECK_IN', entity: 'VisitorPass', entityId: 'VP-8921', userEmail: 'guard@resisync.com', createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
      { id: 'log-02', action: 'FIREBASE_TELEMETRY_SYNC', entity: 'CloudSync', entityId: 'sync-prod', userEmail: 'admin@resisync.com', createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString() },
      { id: 'log-03', action: 'MAINTENANCE_PAYMENT_PROCESSED', entity: 'Bill', entityId: 'BILL-402', userEmail: 'resident@resisync.com', createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString() },
      { id: 'log-04', action: 'AMENITY_SLOT_RESERVED', entity: 'Booking', entityId: 'BKG-01', userEmail: 'resident@resisync.com', createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString() },
    ];
    const logs = getStored(STORAGE_KEYS.AUDIT_LOGS, defaultLogs);
    return Promise.resolve({ success: true, count: logs.length, logs } as any);
  }

  // ================= 16. USER PROFILE & SETTINGS =================
  if (endpoint === '/users/profile' && method === 'PATCH') {
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const updatedUsers = users.map((u: any) => (u.id === 'user-resident-01' ? { ...u, ...body } : u));
    setStored(STORAGE_KEYS.USERS, updatedUsers);
    return Promise.resolve({ success: true, user: updatedUsers[0], message: 'Profile updated successfully' } as any);
  }

  if (endpoint === '/users/family' && method === 'POST') {
    const users = getStored<any[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const newMember = {
      id: `fam-${Date.now()}`,
      name: body.name || 'Family Member',
      relation: body.relation || 'Dependent',
      phone: body.phone || '+91 98000 00000',
      age: Number(body.age) || 25,
    };
    if (users[0]) {
      users[0].familyMembers = users[0].familyMembers || [];
      users[0].familyMembers.push(newMember);
      setStored(STORAGE_KEYS.USERS, users);
    }
    return Promise.resolve({ success: true, member: newMember } as any);
  }

  if (endpoint.startsWith('/users/family/') && method === 'DELETE') {
    const famId = endpoint.split('/')[3];
    const users = getStored<any[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    if (users[0] && users[0].familyMembers) {
      users[0].familyMembers = users[0].familyMembers.filter((f: any) => f.id !== famId);
      setStored(STORAGE_KEYS.USERS, users);
    }
    return Promise.resolve({ success: true } as any);
  }

  if (endpoint === '/users/vehicles' && method === 'POST') {
    const users = getStored<any[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const newVehicle = {
      id: `veh-${Date.now()}`,
      vehicleType: body.vehicleType || 'FOUR_WHEELER',
      vehicleNumber: body.vehicleNumber || 'KA 01 AB 1234',
      parkingSlot: body.parkingSlot || 'P-402',
      makeModel: body.makeModel || 'Personal Vehicle',
    };
    if (users[0]) {
      users[0].vehicles = users[0].vehicles || [];
      users[0].vehicles.push(newVehicle);
      setStored(STORAGE_KEYS.USERS, users);
    }
    return Promise.resolve({ success: true, vehicle: newVehicle } as any);
  }

  if (endpoint.startsWith('/users/vehicles/') && method === 'DELETE') {
    const vehId = endpoint.split('/')[3];
    const users = getStored<any[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    if (users[0] && users[0].vehicles) {
      users[0].vehicles = users[0].vehicles.filter((v: any) => v.id !== vehId);
      setStored(STORAGE_KEYS.USERS, users);
    }
    return Promise.resolve({ success: true } as any);
  }

  if (endpoint === '/auth/forgot-password') {
    return Promise.resolve({
      success: true,
      message: 'Password reset link dispatched.',
      demoNotice: 'Demo mode active: Default password for all demo accounts is password123.',
    } as any);
  }

  if (endpoint === '/auth/change-password') {
    return Promise.resolve({
      success: true,
      message: 'Password changed successfully.',
    } as any);
  }

  // Default fallback response
  return Promise.resolve({
    success: true,
    message: 'Operation completed in standalone cloud client mode',
  } as any);
}

