import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for RESISYNC...');

  // Clean existing data in appropriate order
  await prisma.auditLog.deleteMany();
  await prisma.sensorReading.deleteMany();
  await prisma.ioTDevice.deleteMany();
  await prisma.emergencyRequest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.complaintComment.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.amenityBooking.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.billItem.deleteMany();
  await prisma.maintenanceBill.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.visitor.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.residentProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.flat.deleteMany();
  await prisma.building.deleteMany();
  await prisma.society.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // 1. Create Society: Greenview Residency
  const society = await prisma.society.create({
    data: {
      id: 'soc-greenview-01',
      name: 'Greenview Residency',
      address: 'Plot 42, Silicon Valley Boulevard, Outer Ring Road, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560103',
      totalFlats: 140,
      societyCode: 'GRNVW-2026',
    },
  });

  // 2. Create Buildings
  const towerA = await prisma.building.create({
    data: {
      id: 'bld-tower-a',
      name: 'Tower A - Aster',
      societyId: society.id,
      totalFloors: 14,
    },
  });

  const towerB = await prisma.building.create({
    data: {
      id: 'bld-tower-b',
      name: 'Tower B - Begonia',
      societyId: society.id,
      totalFloors: 14,
    },
  });

  // 3. Create Flats
  const flatA402 = await prisma.flat.create({
    data: {
      id: 'flat-a-402',
      flatNumber: 'A-402',
      floorNumber: 4,
      buildingId: towerA.id,
      societyId: society.id,
      status: 'OCCUPIED',
      bhkType: '3 BHK',
      sqFt: 1550,
    },
  });

  const flatA102 = await prisma.flat.create({
    data: {
      id: 'flat-a-102',
      flatNumber: 'A-102',
      floorNumber: 1,
      buildingId: towerA.id,
      societyId: society.id,
      status: 'OCCUPIED',
      bhkType: '2 BHK',
      sqFt: 1200,
    },
  });

  const flatB101 = await prisma.flat.create({
    data: {
      id: 'flat-b-101',
      flatNumber: 'B-101',
      floorNumber: 1,
      buildingId: towerB.id,
      societyId: society.id,
      status: 'OCCUPIED',
      bhkType: '3 BHK',
      sqFt: 1600,
    },
  });

  const flatB204 = await prisma.flat.create({
    data: {
      id: 'flat-b-204',
      flatNumber: 'B-204',
      floorNumber: 2,
      buildingId: towerB.id,
      societyId: society.id,
      status: 'OCCUPIED',
      bhkType: '2 BHK',
      sqFt: 1180,
    },
  });

  const flatB502 = await prisma.flat.create({
    data: {
      id: 'flat-b-502',
      flatNumber: 'B-502',
      floorNumber: 5,
      buildingId: towerB.id,
      societyId: society.id,
      status: 'VACANT',
      bhkType: '4 BHK Penthouse',
      sqFt: 2400,
    },
  });

  // Common password hash for password123
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 4. Create Users
  // Resident: Rahul Sharma
  const residentUser = await prisma.user.create({
    data: {
      id: 'user-resident-01',
      name: 'Rahul Sharma',
      email: 'resident@resisync.com',
      phone: '+91 98765 43210',
      password: hashedPassword,
      role: 'RESIDENT',
      flatId: flatA402.id,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isActive: true,
      residentProfile: {
        create: {
          id: 'res-prof-01',
          flatId: flatA402.id,
          occupancyType: 'OWNER',
          moveInDate: new Date('2023-01-15'),
          emergencyContactName: 'Anjali Sharma',
          emergencyContactPhone: '+91 98765 43219',
        },
      },
      familyMembers: {
        create: [
          {
            id: 'fam-01',
            name: 'Anjali Sharma',
            relation: 'Spouse',
            phone: '+91 98765 43219',
            age: 32,
          },
          {
            id: 'fam-02',
            name: 'Aarav Sharma',
            relation: 'Son',
            age: 8,
          },
        ],
      },
      vehicles: {
        create: [
          {
            id: 'veh-01',
            vehicleType: 'FOUR_WHEELER',
            vehicleNumber: 'KA 01 MJ 4022',
            parkingSlot: 'P-402',
            makeModel: 'Honda City (Pearl White)',
          },
          {
            id: 'veh-02',
            vehicleType: 'EV',
            vehicleNumber: 'KA 01 EV 1109',
            parkingSlot: 'EV-22',
            makeModel: 'Ather 450X (Space Grey)',
          },
        ],
      },
    },
  });

  // Guard: Vikram Singh
  const guardUser = await prisma.user.create({
    data: {
      id: 'user-guard-01',
      name: 'Vikram Singh',
      email: 'guard@resisync.com',
      phone: '+91 98111 22334',
      password: hashedPassword,
      role: 'SECURITY',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isActive: true,
    },
  });

  // Admin: Priya Patel
  const adminUser = await prisma.user.create({
    data: {
      id: 'user-admin-01',
      name: 'Priya Patel',
      email: 'admin@resisync.com',
      phone: '+91 98222 33445',
      password: hashedPassword,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      isActive: true,
    },
  });

  // Additional Resident: Amit Verma
  await prisma.user.create({
    data: {
      id: 'user-resident-02',
      name: 'Amit Verma',
      email: 'amit@resisync.com',
      phone: '+91 98333 44556',
      password: hashedPassword,
      role: 'RESIDENT',
      flatId: flatB101.id,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      isActive: true,
      residentProfile: {
        create: {
          id: 'res-prof-02',
          flatId: flatB101.id,
          occupancyType: 'TENANT',
          moveInDate: new Date('2024-03-01'),
        },
      },
    },
  });

  // 5. Visitors
  const now = new Date();
  const todayFourPM = new Date();
  todayFourPM.setHours(16, 30, 0, 0);

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.visitor.create({
    data: {
      id: 'vis-01',
      societyId: society.id,
      flatId: flatA402.id,
      invitedById: residentUser.id,
      name: 'Rohan Mehta',
      phone: '+91 98200 11223',
      visitorType: 'GUEST',
      vehicleNumber: 'KA 03 HK 9081',
      expectedAt: todayFourPM,
      status: 'APPROVED',
      purpose: 'Personal Catchup & Dinner',
      notes: 'Car parked in visitor slot V-04',
      passCode: '829410',
      qrToken: 'qr-pass-rohan-829410',
    },
  });

  await prisma.visitor.create({
    data: {
      id: 'vis-02',
      societyId: society.id,
      flatId: flatA402.id,
      invitedById: residentUser.id,
      name: 'Mahesh Kumar (Amazon)',
      phone: '+91 98777 66554',
      visitorType: 'DELIVERY',
      vehicleNumber: 'KA 05 Y 3312',
      expectedAt: now,
      status: 'EXPECTED',
      purpose: 'Package delivery',
      passCode: '491204',
      qrToken: 'qr-pass-amazon-491204',
    },
  });

  await prisma.visitor.create({
    data: {
      id: 'vis-03',
      societyId: society.id,
      flatId: flatA402.id,
      invitedById: residentUser.id,
      name: 'Priya Desai',
      phone: '+91 98111 44332',
      visitorType: 'GUEST',
      expectedAt: new Date(Date.now() - 45 * 60 * 1000),
      checkInTime: new Date(Date.now() - 35 * 60 * 1000),
      status: 'CHECKED_IN',
      purpose: 'Family Visit',
      passCode: '109382',
      qrToken: 'qr-pass-priya-109382',
      checkedInByGuardId: guardUser.id,
    },
  });

  await prisma.visitor.create({
    data: {
      id: 'vis-04',
      societyId: society.id,
      flatId: flatA402.id,
      invitedById: residentUser.id,
      name: 'Dr. R. K. Gupta',
      phone: '+91 99000 88776',
      visitorType: 'SERVICE',
      expectedAt: yesterday,
      checkInTime: yesterday,
      checkOutTime: new Date(yesterday.getTime() + 60 * 60 * 1000),
      status: 'CHECKED_OUT',
      purpose: 'Routine Home Health Checkup',
      passCode: '551928',
      qrToken: 'qr-pass-drgupta-551928',
      checkedInByGuardId: guardUser.id,
      checkedOutByGuardId: guardUser.id,
    },
  });

  // 6. Deliveries at gate
  await prisma.delivery.create({
    data: {
      id: 'del-01',
      societyId: society.id,
      flatId: flatA402.id,
      company: 'Amazon',
      trackingNumber: 'AMZ-99214088',
      deliveryPersonName: 'Sunil R.',
      phone: '+91 98450 99881',
      status: 'AT_GATE',
      guardId: guardUser.id,
    },
  });

  await prisma.delivery.create({
    data: {
      id: 'del-02',
      societyId: society.id,
      flatId: flatB101.id,
      company: 'Swiggy',
      deliveryPersonName: 'Karthik N.',
      phone: '+91 97410 22331',
      status: 'COLLECTED',
      collectedTime: new Date(Date.now() - 20 * 60 * 1000),
      guardId: guardUser.id,
    },
  });

  await prisma.delivery.create({
    data: {
      id: 'del-03',
      societyId: society.id,
      flatId: flatA102.id,
      company: 'BlueDart',
      trackingNumber: 'BD-78901234',
      deliveryPersonName: 'Prakash M.',
      phone: '+91 98860 11990',
      status: 'AT_GATE',
      guardId: guardUser.id,
    },
  });

  // 7. Maintenance Bills
  const dueNov = new Date();
  dueNov.setDate(dueNov.getDate() + 10);

  const billNov = await prisma.maintenanceBill.create({
    data: {
      id: 'bill-nov-2026-a402',
      societyId: society.id,
      flatId: flatA402.id,
      userId: residentUser.id,
      billNumber: 'BILL-2026-11-0402',
      billingMonth: 'November 2026',
      billingYear: 2026,
      dueDate: dueNov,
      totalAmount: 6500,
      status: 'PENDING',
      items: {
        create: [
          {
            title: 'Base Society Maintenance & Security',
            amount: 4000,
            category: 'MAINTENANCE',
          },
          {
            title: 'Treated Water & STP Consumption Charges',
            amount: 1000,
            category: 'WATER',
          },
          {
            title: 'Covered Stilt Parking Slot P-402',
            amount: 1000,
            category: 'PARKING',
          },
          {
            title: 'Capital Sinking & Emergency Fund',
            amount: 500,
            category: 'SINKING_FUND',
          },
        ],
      },
    },
  });

  // Paid bills for history
  const octDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const billOct = await prisma.maintenanceBill.create({
    data: {
      id: 'bill-oct-2026-a402',
      societyId: society.id,
      flatId: flatA402.id,
      userId: residentUser.id,
      billNumber: 'BILL-2026-10-0402',
      billingMonth: 'October 2026',
      billingYear: 2026,
      dueDate: octDate,
      totalAmount: 6500,
      status: 'PAID',
      paidAt: new Date(octDate.getTime() - 2 * 24 * 60 * 60 * 1000),
      paymentMethod: 'UPI',
      transactionId: 'UPI/98124098124/HDFC',
      receiptUrl: '/receipts/BILL-2026-10-0402.pdf',
      items: {
        create: [
          { title: 'Base Society Maintenance', amount: 4000, category: 'MAINTENANCE' },
          { title: 'Water Charges', amount: 1000, category: 'WATER' },
          { title: 'Parking Slot P-402', amount: 1000, category: 'PARKING' },
          { title: 'Sinking Fund', amount: 500, category: 'SINKING_FUND' },
        ],
      },
      payments: {
        create: {
          amount: 6500,
          method: 'UPI',
          transactionRef: 'UPI/98124098124/HDFC',
          status: 'SUCCESS',
        },
      },
    },
  });

  const sepDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  await prisma.maintenanceBill.create({
    data: {
      id: 'bill-sep-2026-a402',
      societyId: society.id,
      flatId: flatA402.id,
      userId: residentUser.id,
      billNumber: 'BILL-2026-09-0402',
      billingMonth: 'September 2026',
      billingYear: 2026,
      dueDate: sepDate,
      totalAmount: 6500,
      status: 'PAID',
      paidAt: new Date(sepDate.getTime() - 3 * 24 * 60 * 60 * 1000),
      paymentMethod: 'CARD',
      transactionId: 'CARD/TXN-7788192',
      receiptUrl: '/receipts/BILL-2026-09-0402.pdf',
      items: {
        create: [
          { title: 'Base Society Maintenance', amount: 4000, category: 'MAINTENANCE' },
          { title: 'Water Charges', amount: 1000, category: 'WATER' },
          { title: 'Parking Slot P-402', amount: 1000, category: 'PARKING' },
          { title: 'Sinking Fund', amount: 500, category: 'SINKING_FUND' },
        ],
      },
    },
  });

  // Overdue bill for another flat (for admin dashboard metrics)
  await prisma.maintenanceBill.create({
    data: {
      id: 'bill-sep-2026-b204',
      societyId: society.id,
      flatId: flatB204.id,
      billNumber: 'BILL-2026-09-0204',
      billingMonth: 'September 2026',
      billingYear: 2026,
      dueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      totalAmount: 11800,
      status: 'OVERDUE',
      items: {
        create: [
          { title: 'Base Maintenance (B-204)', amount: 7800, category: 'MAINTENANCE' },
          { title: 'Clubhouse Assessment Penalty', amount: 4000, category: 'OTHER' },
        ],
      },
    },
  });

  // 8. Amenities
  const pool = await prisma.amenity.create({
    data: {
      id: 'amenity-pool',
      societyId: society.id,
      name: 'Infinity Swimming Pool',
      category: 'POOL',
      description: 'Temperature-controlled lap pool with dedicated kids splash area and certified lifeguard on duty.',
      capacity: 25,
      openTime: '06:00',
      closeTime: '21:00',
      slotDurationMinutes: 60,
      pricing: 0,
      imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600',
      rules: 'Shower before entry. Swimming cap mandatory. Children below 10 must be accompanied by adults.',
      status: 'AVAILABLE',
    },
  });

  const gym = await prisma.amenity.create({
    data: {
      id: 'amenity-gym',
      societyId: society.id,
      name: 'Fitness & High-Performance Gym',
      category: 'GYM',
      description: 'State-of-the-art gym equipped with Technogym cardio machines, Olympic power racks, and free weights.',
      capacity: 30,
      openTime: '05:30',
      closeTime: '22:30',
      slotDurationMinutes: 60,
      pricing: 0,
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
      rules: 'Clean sports shoes mandatory. Wipe down equipment after use. Personal trainers allowed only with society badge.',
      status: 'AVAILABLE',
    },
  });

  const clubhouse = await prisma.amenity.create({
    data: {
      id: 'amenity-clubhouse',
      societyId: society.id,
      name: 'Royal Clubhouse Lounge & Billiards',
      category: 'CLUBHOUSE',
      description: 'Air-conditioned leisure lounge with pool tables, table tennis, board games library, and Wi-Fi workspace.',
      capacity: 50,
      openTime: '09:00',
      closeTime: '23:00',
      slotDurationMinutes: 120,
      pricing: 250,
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
      rules: 'Prior booking required. Food allowed only in designated cafeteria corner.',
      status: 'AVAILABLE',
    },
  });

  const partyHall = await prisma.amenity.create({
    data: {
      id: 'amenity-hall',
      societyId: society.id,
      name: 'Celebration Banquet & Party Hall',
      category: 'HALL',
      description: 'Acoustically treated multi-purpose hall with staging, audio visual equipment, and private pantry kitchen.',
      capacity: 150,
      openTime: '10:00',
      closeTime: '23:00',
      slotDurationMinutes: 240,
      pricing: 2500,
      imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600',
      rules: 'Loud music must stop by 10:00 PM per city noise bylaws. Security deposit refundable after post-event inspection.',
      status: 'AVAILABLE',
    },
  });

  const tennisCourt = await prisma.amenity.create({
    data: {
      id: 'amenity-sports',
      societyId: society.id,
      name: 'Floodlit Tennis & Badminton Courts',
      category: 'SPORTS',
      description: 'Synthetic acrylic surfaced courts with high-intensity LED floodlighting for late evening matches.',
      capacity: 8,
      openTime: '06:00',
      closeTime: '21:30',
      slotDurationMinutes: 60,
      pricing: 0,
      imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600',
      rules: 'Non-marking gum sole shoes mandatory. Max 2 slots per flat per week during peak hours.',
      status: 'AVAILABLE',
    },
  });

  const garden = await prisma.amenity.create({
    data: {
      id: 'amenity-garden',
      societyId: society.id,
      name: 'Zen Reflexology & Landscaped Garden',
      category: 'GARDEN',
      description: 'Tranquil open green space with acupressure pebble walkway, gazebos, and aromatic flora.',
      capacity: 60,
      openTime: '05:00',
      closeTime: '22:00',
      slotDurationMinutes: 60,
      pricing: 0,
      imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600',
      rules: 'Pet leashing required. Plucking of flowers or disturbing yoga groups prohibited.',
      status: 'AVAILABLE',
    },
  });

  // 9. Amenity Bookings
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  await prisma.amenityBooking.create({
    data: {
      amenityId: gym.id,
      userId: residentUser.id,
      flatId: flatA402.id,
      bookingDate: todayStr,
      startTime: '18:00',
      endTime: '19:00',
      guestsCount: 1,
      status: 'CONFIRMED',
      totalFee: 0,
      paymentStatus: 'PAID',
    },
  });

  await prisma.amenityBooking.create({
    data: {
      amenityId: pool.id,
      userId: residentUser.id,
      flatId: flatA402.id,
      bookingDate: tomorrowStr,
      startTime: '07:00',
      endTime: '08:00',
      guestsCount: 2,
      status: 'CONFIRMED',
      totalFee: 0,
      paymentStatus: 'PAID',
    },
  });

  // 10. Complaints
  const comp1 = await prisma.complaint.create({
    data: {
      id: 'comp-01',
      ticketNumber: 'RES-8921',
      societyId: society.id,
      flatId: flatA402.id,
      userId: residentUser.id,
      category: 'PLUMBING',
      subject: 'Master bathroom concealed flush valve leaking continuously',
      description: 'There is a persistent seep near the wall tiles causing water wastage. Need plumber to replace valve washer.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedStaffName: 'Ramesh Carpenter & Plumber (ID: S-12)',
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
      comments: {
        create: [
          {
            userId: residentUser.id,
            authorName: 'Rahul Sharma',
            authorRole: 'RESIDENT',
            message: 'Leakage started yesterday evening around 7 PM.',
          },
          {
            userId: adminUser.id,
            authorName: 'Priya Patel (Admin)',
            authorRole: 'ADMIN',
            message: 'Assigned Ramesh. He will inspect today between 3 PM and 5 PM.',
          },
        ],
      },
    },
  });

  await prisma.complaint.create({
    data: {
      id: 'comp-02',
      ticketNumber: 'RES-8850',
      societyId: society.id,
      flatId: flatA402.id,
      userId: residentUser.id,
      category: 'ELECTRICAL',
      subject: 'Flickering corridor lighting outside Flat A-402 entrance',
      description: 'The ceiling LED panel is blinking intermittently and buzzing.',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      assignedStaffName: 'Manoj Electrician',
      resolutionNotes: 'Driver unit replaced with new Philips 18W ballast. Tested functional.',
      resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
  });

  await prisma.complaint.create({
    data: {
      id: 'comp-03',
      ticketNumber: 'RES-8994',
      societyId: society.id,
      flatId: flatB101.id,
      userId: 'user-resident-02',
      category: 'MAINTENANCE',
      subject: 'Gym Treadmill #2 slipping speed belt',
      description: 'When running above 8 km/h, the belt lags and poses trip risk.',
      priority: 'LOW',
      status: 'OPEN',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
  });

  // 11. Announcements
  await prisma.announcement.create({
    data: {
      id: 'ann-01',
      societyId: society.id,
      title: 'Scheduled Water Tank Deep Cleaning & Disinfection',
      content: 'Underground sumps and overhead tanks will undergo semi-annual scientific UV & chemical disinfection on Thursday, Nov 5 from 10:00 AM to 02:00 PM. Water supply will be suspended during this interval. Residents are advised to store sufficient water beforehand.',
      category: 'MAINTENANCE',
      isPinned: true,
      authorName: 'Priya Patel (Estate Manager)',
    },
  });

  await prisma.announcement.create({
    data: {
      id: 'ann-02',
      societyId: society.id,
      title: 'Annual Diwali & Winter Cultural Gala — Register Your Performances',
      content: 'RESISYNC Community Committee invites all residents, children, and musical groups to register for the upcoming Winter Cultural Fiesta on Nov 15th at the Central Amphitheatre.',
      category: 'EVENT',
      isPinned: false,
      authorName: 'Cultural Committee',
    },
  });

  await prisma.announcement.create({
    data: {
      id: 'ann-03',
      societyId: society.id,
      title: 'Automated RFID Gate Boom Barrier Activation from Nov 10',
      content: 'Vehicles without active RESISYNC RFID tags will require manual security clearance at Gate 1. Please collect tags from the Estate Office between 10 AM - 6 PM.',
      category: 'URGENT',
      isPinned: false,
      authorName: 'Security Ops Command',
    },
  });

  // 12. Notifications for Resident
  await prisma.notification.createMany({
    data: [
      {
        userId: residentUser.id,
        title: 'Visitor Pass Approved',
        message: 'Pass #829410 created for Rohan Mehta. Expected arrival at 04:30 PM.',
        type: 'VISITOR',
        isRead: false,
        link: '/resident/visitors',
      },
      {
        userId: residentUser.id,
        title: 'Maintenance Bill Generated',
        message: 'November 2026 maintenance invoice of ₹6,500 is ready for review.',
        type: 'MAINTENANCE',
        isRead: false,
        link: '/resident/maintenance',
      },
      {
        userId: residentUser.id,
        title: 'Plumber Assigned',
        message: 'Ramesh Carpenter & Plumber assigned to ticket RES-8921.',
        type: 'COMPLAINT',
        isRead: true,
        link: '/resident/helpdesk',
      },
      {
        userId: residentUser.id,
        title: 'Water Supply Advisory',
        message: 'Tank cleaning scheduled for Nov 5, 10 AM to 2 PM.',
        type: 'ANNOUNCEMENT',
        isRead: false,
        link: '/resident/alerts',
      },
    ],
  });

  // 13. IoT Devices & Readings
  const tankDevice = await prisma.ioTDevice.create({
    data: {
      id: 'iot-tank-01',
      societyId: society.id,
      name: 'Overhead Water Tank — Tower A',
      deviceType: 'WATER_TANK',
      location: 'Tower A Rooftop Utility Deck',
      status: 'ONLINE',
      batteryLevel: 98,
      readings: {
        create: [
          { sensorType: 'WATER_LEVEL_PERCENT', metricValue: 78.4, unit: '%', status: 'NORMAL' },
          { sensorType: 'VOLUME_LITERS', metricValue: 78400, unit: 'L', status: 'NORMAL' },
          { sensorType: 'INFLOW_RATE', metricValue: 42.5, unit: 'L/min', status: 'NORMAL' },
        ],
      },
    },
  });

  const powerDevice = await prisma.ioTDevice.create({
    data: {
      id: 'iot-power-01',
      societyId: society.id,
      name: 'Main Substation Grid Incomer & HT Transformer',
      deviceType: 'POWER_GRID',
      location: 'Substation Ground Yard',
      status: 'ONLINE',
      readings: {
        create: [
          { sensorType: 'ACTIVE_LOAD', metricValue: 48.6, unit: 'kW', status: 'NORMAL' },
          { sensorType: 'VOLTAGE_PHASE_R', metricValue: 238.2, unit: 'V', status: 'NORMAL' },
          { sensorType: 'POWER_FACTOR', metricValue: 0.98, unit: 'PF', status: 'NORMAL' },
        ],
      },
    },
  });

  const gensetDevice = await prisma.ioTDevice.create({
    data: {
      id: 'iot-genset-01',
      societyId: society.id,
      name: 'Backup Diesel Generator 250 kVA (Auto-Mains Failure)',
      deviceType: 'DG_GENSET',
      location: 'Basement 2 Utility Room',
      status: 'ONLINE',
      batteryLevel: 100,
      readings: {
        create: [
          { sensorType: 'DIESEL_LEVEL_PERCENT', metricValue: 92.0, unit: '%', status: 'NORMAL' },
          { sensorType: 'COOLANT_TEMP', metricValue: 41.5, unit: '°C', status: 'NORMAL' },
          { sensorType: 'STANDBY_STATE', metricValue: 1.0, unit: 'READY', status: 'NORMAL' },
        ],
      },
    },
  });

  const gateCamera = await prisma.ioTDevice.create({
    data: {
      id: 'iot-gate-01',
      societyId: society.id,
      name: 'Gate 1 AI ANPR & Security Cam',
      deviceType: 'GATE_CAMERA',
      location: 'Main North Gate Security Post',
      status: 'ONLINE',
      readings: {
        create: [
          { sensorType: 'FPS_STREAM', metricValue: 30.0, unit: 'fps', status: 'NORMAL' },
          { sensorType: 'PLATES_RECOGNIZED_TODAY', metricValue: 142.0, unit: 'vehicles', status: 'NORMAL' },
        ],
      },
    },
  });

  const parkingSensors = await prisma.ioTDevice.create({
    data: {
      id: 'iot-parking-01',
      societyId: society.id,
      name: 'Basement 1 Smart Ultrasonic Parking Grid',
      deviceType: 'PARKING_SENSOR',
      location: 'Basement 1 Visitor & Resident Bay',
      status: 'ONLINE',
      readings: {
        create: [
          { sensorType: 'OCCUPIED_SLOTS', metricValue: 42, unit: 'slots', status: 'NORMAL' },
          { sensorType: 'TOTAL_SLOTS', metricValue: 60, unit: 'slots', status: 'NORMAL' },
          { sensorType: 'OCCUPANCY_RATE', metricValue: 70.0, unit: '%', status: 'NORMAL' },
        ],
      },
    },
  });

  const airQuality = await prisma.ioTDevice.create({
    data: {
      id: 'iot-air-01',
      societyId: society.id,
      name: 'Central Courtyard Environmental & AQI Station',
      deviceType: 'AIR_QUALITY',
      location: 'Central Podium Park',
      status: 'ONLINE',
      readings: {
        create: [
          { sensorType: 'AQI_PM2_5', metricValue: 58.0, unit: 'AQI', status: 'NORMAL' },
          { sensorType: 'AMBIENT_TEMP', metricValue: 24.6, unit: '°C', status: 'NORMAL' },
          { sensorType: 'HUMIDITY', metricValue: 56.0, unit: '%', status: 'NORMAL' },
        ],
      },
    },
  });

  // 14. Audit Log
  await prisma.auditLog.createMany({
    data: [
      {
        societyId: society.id,
        userId: adminUser.id,
        action: 'BILL_CYCLE_GENERATE',
        entityType: 'MaintenanceBill',
        details: 'Generated November 2026 billing batch for 140 units.',
      },
      {
        societyId: society.id,
        userId: guardUser.id,
        action: 'VISITOR_CHECK_IN',
        entityType: 'Visitor',
        details: 'Checked in Priya Desai (Pass #109382) to Flat A-402.',
      },
      {
        societyId: society.id,
        userId: residentUser.id,
        action: 'AMENITY_BOOK',
        entityType: 'AmenityBooking',
        details: 'Reserved Fitness Gym slot for today 18:00 - 19:00.',
      },
    ],
  });

  console.log('✅ RESISYNC database successfully seeded!');
  console.log('📋 Demo Accounts created:');
  console.log('   👤 RESIDENT: resident@resisync.com / password123 (Rahul Sharma, Flat A-402)');
  console.log('   🛡️ SECURITY: guard@resisync.com    / password123 (Vikram Singh, Main Gate)');
  console.log('   👑 ADMIN:    admin@resisync.com    / password123 (Priya Patel, Society Office)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

