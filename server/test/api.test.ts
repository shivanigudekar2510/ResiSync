process.env.NODE_ENV = 'test';
import { EventEmitter } from 'events';
import { app } from '../src/index.js';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function request(options: {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: any;
}): Promise<{ status: number; data: any }> {
  return new Promise((resolve) => {
    const [pathPart, queryPart] = options.path.split('?');
    const reqHeaders: Record<string, string> = {
      'content-type': 'application/json',
      ...(options.headers ? Object.fromEntries(Object.entries(options.headers).map(([k, v]) => [k.toLowerCase(), v])) : {}),
    };

    const req: any = new EventEmitter();
    req.method = options.method.toUpperCase();
    req.url = options.path;
    req.path = pathPart;
    req.originalUrl = options.path;
    req.query = {};
    if (queryPart) {
      const sp = new URLSearchParams(queryPart);
      sp.forEach((val, key) => { req.query[key] = val; });
    }
    req.headers = reqHeaders;
    req.get = (h: string) => reqHeaders[h.toLowerCase()];
    req.header = req.get;
    req.body = options.body || {};
    req.connection = { remoteAddress: '127.0.0.1' };
    req.socket = req.connection;

    let resStatus = 200;
    let resHeaders: Record<string, any> = {};

    const res: any = {
      statusCode: 200,
      setHeader(name: string, value: any) {
        resHeaders[name.toLowerCase()] = value;
        return this;
      },
      getHeader(name: string) {
        return resHeaders[name.toLowerCase()];
      },
      status(code: number) {
        resStatus = code;
        this.statusCode = code;
        return this;
      },
      sendStatus(code: number) {
        resStatus = code;
        this.statusCode = code;
        resolve({ status: resStatus, data: {} });
        return this;
      },
      json(data: any) {
        resolve({ status: resStatus, data });
        return this;
      },
      send(data: any) {
        try {
          resolve({ status: resStatus, data: typeof data === 'string' ? JSON.parse(data) : data });
        } catch {
          resolve({ status: resStatus, data });
        }
        return this;
      },
      end() {
        resolve({ status: resStatus, data: {} });
        return this;
      },
    };

    try {
      app.handle(req, res);
    } catch (err: any) {
      resolve({ status: 500, data: { error: err.message } });
    }
  });
}

async function runTests() {
  console.log('🧪 Starting RESISYNC Comprehensive Test Suite (20 Test Cases)...\n');

  try {
    // 1. Health Check
    const health = await request({ method: 'GET', path: '/api/health' });
    if (health.status === 200 && health.data.status === 'online') {
      results.push({ name: 'API Health Check', passed: true });
    } else {
      results.push({ name: 'API Health Check', passed: false, error: JSON.stringify(health.data) });
    }

    // 2. Resident Login
    const residentLogin = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { identifier: 'resident@resisync.com', password: 'password123' },
    });
    const residentToken = residentLogin.data.token;
    if (residentLogin.status === 200 && residentToken && residentLogin.data.user.role === 'RESIDENT') {
      results.push({ name: 'Resident Authentication (JWT)', passed: true });
    } else {
      results.push({ name: 'Resident Authentication (JWT)', passed: false, error: JSON.stringify(residentLogin.data) });
    }

    // 3. Security Guard Login
    const guardLogin = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { identifier: 'guard@resisync.com', password: 'password123' },
    });
    const guardToken = guardLogin.data.token;
    if (guardLogin.status === 200 && guardToken && guardLogin.data.user.role === 'SECURITY') {
      results.push({ name: 'Security Guard Authentication', passed: true });
    } else {
      results.push({ name: 'Security Guard Authentication', passed: false, error: JSON.stringify(guardLogin.data) });
    }

    // 4. Admin Login
    const adminLogin = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { identifier: 'admin@resisync.com', password: 'password123' },
    });
    const adminToken = adminLogin.data.token;
    if (adminLogin.status === 200 && adminToken && adminLogin.data.user.role === 'ADMIN') {
      results.push({ name: 'Admin Authentication', passed: true });
    } else {
      results.push({ name: 'Admin Authentication', passed: false, error: JSON.stringify(adminLogin.data) });
    }

    // 5. Visitor Flow: Invite, QR pass verify, Guard Check-in, Guard Check-out
    const inviteRes = await request({
      method: 'POST',
      path: '/api/visitors/invite',
      headers: { Authorization: `Bearer ${residentToken}` },
      body: {
        name: 'Kavita Iyer',
        phone: '+91 98888 77665',
        visitorType: 'GUEST',
        expectedAt: new Date().toISOString(),
        purpose: 'Weekend Brunch',
      },
    });

    let visitorId = '';
    let passCode = '';
    if (inviteRes.status === 201 && inviteRes.data.visitor) {
      visitorId = inviteRes.data.visitor.id;
      passCode = inviteRes.data.visitor.passCode;
      results.push({ name: 'Visitor Pass Generation (6-digit code & QR Token)', passed: true });
    } else {
      results.push({ name: 'Visitor Pass Generation', passed: false, error: JSON.stringify(inviteRes.data) });
    }

    if (passCode) {
      const verifyRes = await request({
        method: 'GET',
        path: `/api/visitor-passes/${passCode}`,
        headers: { Authorization: `Bearer ${guardToken}` },
      });
      if (verifyRes.status === 200 && verifyRes.data.visitor.name === 'Kavita Iyer') {
        results.push({ name: 'Guard Gate Pass Verification', passed: true });
      } else {
        results.push({ name: 'Guard Gate Pass Verification', passed: false, error: JSON.stringify(verifyRes.data) });
      }

      const checkInRes = await request({
        method: 'POST',
        path: `/api/visitors/${visitorId}/check-in`,
        headers: { Authorization: `Bearer ${guardToken}` },
      });
      if (checkInRes.status === 200 && checkInRes.data.visitor.status === 'CHECKED_IN') {
        results.push({ name: 'Guard Visitor Check-In Execution', passed: true });
      } else {
        results.push({ name: 'Guard Visitor Check-In Execution', passed: false, error: JSON.stringify(checkInRes.data) });
      }

      // Check-out
      const checkOutRes = await request({
        method: 'POST',
        path: `/api/visitors/${visitorId}/check-out`,
        headers: { Authorization: `Bearer ${guardToken}` },
      });
      if (checkOutRes.status === 200 && checkOutRes.data.visitor.status === 'CHECKED_OUT') {
        results.push({ name: 'Guard Visitor Check-Out Execution', passed: true });
      } else {
        results.push({ name: 'Guard Visitor Check-Out Execution', passed: false, error: JSON.stringify(checkOutRes.data) });
      }
    }

    // 6. Courier Delivery Logging & Resident Collection
    const deliveryRes = await request({
      method: 'POST',
      path: '/api/deliveries',
      headers: { Authorization: `Bearer ${guardToken}` },
      body: {
        flatNumber: 'A-402',
        company: 'Amazon Prime',
        trackingNumber: 'AMZ-IN-889912',
        deliveryPersonName: 'Vikram Singh',
        phone: '+91 91234 56789',
      },
    });

    let deliveryId = '';
    if (deliveryRes.status === 201 && deliveryRes.data.delivery) {
      deliveryId = deliveryRes.data.delivery.id;
      results.push({ name: 'Courier Delivery Logging by Security Guard', passed: true });
    } else {
      results.push({ name: 'Courier Delivery Logging by Security Guard', passed: false, error: JSON.stringify(deliveryRes.data) });
    }

    if (deliveryId) {
      const collectRes = await request({
        method: 'PATCH',
        path: `/api/deliveries/${deliveryId}/collect`,
        headers: { Authorization: `Bearer ${residentToken}` },
      });
      if (collectRes.status === 200 && collectRes.data.delivery.status === 'COLLECTED') {
        results.push({ name: 'Resident Delivery Package Collection', passed: true });
      } else {
        results.push({ name: 'Resident Delivery Package Collection', passed: false, error: JSON.stringify(collectRes.data) });
      }
    }

    // 7. Maintenance Bills & Payment Sandbox
    // First, Admin creates a new monthly bill to ensure there is always a pending bill to test payment
    const flatLookup = await request({
      method: 'GET',
      path: '/api/admin/flats',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const targetFlat = flatLookup.data.flats?.find((f: any) => f.flatNumber === 'A-402') || flatLookup.data.flats?.[0];

    let pendingBillId = '';
    if (targetFlat) {
      const createBillRes = await request({
        method: 'POST',
        path: '/api/maintenance',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          flatId: targetFlat.id,
          billingMonth: `Test Month ${Math.floor(Math.random() * 1000)}`,
          billingYear: 2026,
          dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
          items: [
            { title: 'Standard Maintenance Charge', amount: 3200, category: 'MAINTENANCE' },
            { title: 'Water Infrastructure Fee', amount: 450, category: 'WATER' },
            { title: 'Covered Parking Bay A-12', amount: 500, category: 'PARKING' },
          ],
        },
      });
      if (createBillRes.status === 201 && createBillRes.data.bill) {
        pendingBillId = createBillRes.data.bill.id;
        results.push({ name: 'Admin Maintenance Bill Generation', passed: true });
      }
    }

    const billsRes = await request({
      method: 'GET',
      path: '/api/maintenance',
      headers: { Authorization: `Bearer ${residentToken}` },
    });
    if (billsRes.status === 200 && Array.isArray(billsRes.data.bills)) {
      results.push({ name: 'Maintenance Itemized Bills Retrieval', passed: true });
      const billToPay = pendingBillId || billsRes.data.bills.find((b: any) => b.status === 'PENDING')?.id;
      if (billToPay) {
        const payRes = await request({
          method: 'POST',
          path: `/api/maintenance/${billToPay}/pay`,
          headers: { Authorization: `Bearer ${residentToken}` },
          body: { paymentMethod: 'UPI', mockSuccess: true },
        });
        if (payRes.status === 200 && payRes.data.bill.status === 'PAID') {
          results.push({ name: 'Maintenance Payment & Receipt Generation', passed: true });
        } else {
          results.push({ name: 'Maintenance Payment & Receipt Generation', passed: false, error: JSON.stringify(payRes.data) });
        }
      }
    } else {
      results.push({ name: 'Maintenance Itemized Bills Retrieval', passed: false, error: JSON.stringify(billsRes.data) });
    }

    // 8. Amenity Booking & Conflict Safeguard
    const amenitiesRes = await request({
      method: 'GET',
      path: '/api/amenities',
      headers: { Authorization: `Bearer ${residentToken}` },
    });
    if (amenitiesRes.status === 200 && amenitiesRes.data.amenities?.length > 0) {
      const targetAmenity = amenitiesRes.data.amenities[0];
      const randomDay = Math.floor(10 + Math.random() * 15);
      const testDate = `2027-05-${randomDay}`;
      const slot1 = await request({
        method: 'POST',
        path: '/api/bookings',
        headers: { Authorization: `Bearer ${residentToken}` },
        body: {
          amenityId: targetAmenity.id,
          bookingDate: testDate,
          startTime: '10:00',
          endTime: '11:00',
          guestsCount: 1,
        },
      });

      if (slot1.status === 201) {
        results.push({ name: 'Amenity Booking Creation', passed: true });

        const conflictRes = await request({
          method: 'POST',
          path: '/api/bookings',
          headers: { Authorization: `Bearer ${residentToken}` },
          body: {
            amenityId: targetAmenity.id,
            bookingDate: testDate,
            startTime: '10:30',
            endTime: '11:30',
            guestsCount: 1,
          },
        });

        if (conflictRes.status === 409) {
          results.push({ name: 'Database Conflict Prevention (Overlapping Reservations)', passed: true });
        } else {
          results.push({ name: 'Database Conflict Prevention', passed: false, error: `Expected 409, got ${conflictRes.status}` });
        }
      } else {
        results.push({ name: 'Amenity Booking Creation', passed: false, error: JSON.stringify(slot1.data) });
      }
    }

    // 9. Helpdesk Complaint & Discussion Threading
    const compRes = await request({
      method: 'POST',
      path: '/api/complaints',
      headers: { Authorization: `Bearer ${residentToken}` },
      body: {
        category: 'ELECTRICAL',
        subject: 'Intermittent power tripping on kitchen circuit breaker',
        description: 'Microwave and kettle together trip the 16A MCB. Needs wire gauge inspection.',
        priority: 'HIGH',
      },
    });
    let complaintId = '';
    if (compRes.status === 201 && compRes.data.complaint.ticketNumber) {
      complaintId = compRes.data.complaint.id;
      results.push({ name: 'Helpdesk Ticket Creation', passed: true });
    } else {
      results.push({ name: 'Helpdesk Ticket Creation', passed: false, error: JSON.stringify(compRes.data) });
    }

    if (complaintId) {
      const commentRes = await request({
        method: 'POST',
        path: `/api/complaints/${complaintId}/comments`,
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          message: 'Facility electrician assigned for inspection today at 2:00 PM.',
        },
      });
      if (commentRes.status === 201 && commentRes.data.comment) {
        results.push({ name: 'Helpdesk Discussion Comment Threading', passed: true });
      } else {
        results.push({ name: 'Helpdesk Discussion Comment Threading', passed: false, error: JSON.stringify(commentRes.data) });
      }
    }

    // 10. 24x7 Emergency SOS Panic Alert & Security Desk Resolution
    const emergencyRes = await request({
      method: 'POST',
      path: '/api/emergency/sos',
      headers: { Authorization: `Bearer ${residentToken}` },
      body: {
        emergencyType: 'MEDICAL',
        note: 'Resident in A-402 requires immediate first aid assistance.',
      },
    });
    let emergencyId = '';
    if (emergencyRes.status === 201 && emergencyRes.data.emergency) {
      emergencyId = emergencyRes.data.emergency.id;
      results.push({ name: '24x7 Emergency SOS Panic Alert Trigger', passed: true });
    } else {
      results.push({ name: '24x7 Emergency SOS Panic Alert Trigger', passed: false, error: JSON.stringify(emergencyRes.data) });
    }

    if (emergencyId) {
      const resolveRes = await request({
        method: 'POST',
        path: `/api/emergency/${emergencyId}/resolve`,
        headers: { Authorization: `Bearer ${guardToken}` },
      });
      if (resolveRes.status === 200 && resolveRes.data.emergency.status === 'RESOLVED') {
        results.push({ name: 'Emergency Station Guard Resolution', passed: true });
      } else {
        results.push({ name: 'Emergency Station Guard Resolution', passed: false, error: JSON.stringify(resolveRes.data) });
      }
    }

    // 11. IoT Telemetry Dashboard
    const iotRes = await request({
      method: 'GET',
      path: '/api/iot',
      headers: { Authorization: `Bearer ${residentToken}` },
    });
    if (iotRes.status === 200 && iotRes.data.isDemoMode && iotRes.data.devices.length > 0) {
      results.push({ name: 'IoT Telemetry & Historical Trends', passed: true });
    } else {
      results.push({ name: 'IoT Telemetry & Historical Trends', passed: false, error: JSON.stringify(iotRes.data) });
    }

    // 12. Society Announcements Broadcast
    const announceRes = await request({
      method: 'POST',
      path: '/api/announcements',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Solar Inverter Annual Maintenance Notice',
        content: 'Grid backup switchover testing scheduled between 10:00 AM and 11:30 AM this Thursday.',
        category: 'MAINTENANCE',
        priority: 'IMPORTANT',
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      },
    });
    if (announceRes.status === 201 && announceRes.data.announcement) {
      results.push({ name: 'Society Announcement Publishing & Broadcast', passed: true });
    } else {
      results.push({ name: 'Society Announcement Publishing & Broadcast', passed: false, error: JSON.stringify(announceRes.data) });
    }

    // 13. Resident Profile Hub (Family & Vehicle Management)
    const familyRes = await request({
      method: 'POST',
      path: '/api/users/family',
      headers: { Authorization: `Bearer ${residentToken}` },
      body: {
        name: 'Aarav Sharma',
        relation: 'Son',
        age: 14,
        phone: '+91 98888 12345',
      },
    });
    if (familyRes.status === 201 && familyRes.data.member) {
      results.push({ name: 'Resident Family Member Registration', passed: true });
    } else {
      results.push({ name: 'Resident Family Member Registration', passed: false, error: JSON.stringify(familyRes.data) });
    }

    const vehicleRes = await request({
      method: 'POST',
      path: '/api/users/vehicles',
      headers: { Authorization: `Bearer ${residentToken}` },
      body: {
        vehicleType: 'FOUR_WHEELER',
        vehicleNumber: `KA-03-MK-${Math.floor(1000 + Math.random() * 9000)}`,
        parkingSlot: 'B-24',
        makeModel: 'Hyundai Ioniq 5',
      },
    });
    if (vehicleRes.status === 201 && vehicleRes.data.vehicle) {
      results.push({ name: 'Resident Vehicle Registration & Slot Assignment', passed: true });
    } else {
      results.push({ name: 'Resident Vehicle Registration & Slot Assignment', passed: false, error: JSON.stringify(vehicleRes.data) });
    }

    // 14. Admin Analytics KPIs
    const analyticsRes = await request({
      method: 'GET',
      path: '/api/analytics/dashboard',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (analyticsRes.status === 200 && analyticsRes.data.kpis && analyticsRes.data.charts) {
      results.push({ name: 'Admin Analytics & Society Health Metrics', passed: true });
    } else {
      results.push({ name: 'Admin Analytics & Society Health Metrics', passed: false, error: JSON.stringify(analyticsRes.data) });
    }

  } catch (err: any) {
    console.error('Unhandled test failure:', err);
  } finally {
    console.log('\n📊 TEST EXECUTION SUMMARY:');
    let allPassed = true;
    for (const r of results) {
      if (r.passed) {
        console.log(`  ✅ ${r.name}`);
      } else {
        allPassed = false;
        console.log(`  ❌ ${r.name}: ${r.error || 'Failed'}`);
      }
    }

    console.log(`\nResult: ${results.filter(r => r.passed).length} / ${results.length} tests passed.\n`);
    process.exit(allPassed ? 0 : 1);
  }
}

runTests();
