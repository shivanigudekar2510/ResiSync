export type UserRole = 'RESIDENT' | 'SECURITY' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  societyId?: string;
  society?: Society;
  flatId?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  flat?: Flat;
  residentProfile?: ResidentProfile;
  familyMembers?: FamilyMember[];
  vehicles?: Vehicle[];
}

export interface Society {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  totalFlats: number;
  societyCode: string;
}

export interface Building {
  id: string;
  name: string;
  societyId: string;
  totalFloors: number;
}

export interface Flat {
  id: string;
  flatNumber: string;
  floorNumber: number;
  buildingId: string;
  societyId: string;
  status: 'OCCUPIED' | 'VACANT';
  bhkType: string;
  sqFt: number;
  building?: Building;
  society?: Society;
  users?: User[];
}

export interface ResidentProfile {
  id: string;
  userId: string;
  flatId: string;
  occupancyType: 'OWNER' | 'TENANT';
  moveInDate?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relation: string;
  phone?: string;
  age?: number;
}

export interface Vehicle {
  id: string;
  userId: string;
  vehicleType: 'TWO_WHEELER' | 'FOUR_WHEELER' | 'EV';
  vehicleNumber: string;
  parkingSlot: string;
  makeModel?: string;
}

export type VisitorStatus = 'EXPECTED' | 'APPROVED' | 'REJECTED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
export type VisitorType = 'GUEST' | 'DELIVERY' | 'CAB' | 'SERVICE' | 'OTHER';

export interface Visitor {
  id: string;
  societyId: string;
  flatId: string;
  invitedById?: string;
  name: string;
  phone: string;
  visitorType: VisitorType;
  vehicleNumber?: string;
  expectedAt: string;
  status: VisitorStatus;
  purpose?: string;
  notes?: string;
  passCode: string;
  qrToken: string;
  checkInTime?: string;
  checkOutTime?: string;
  flat: Flat;
  invitedBy?: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface Delivery {
  id: string;
  societyId: string;
  flatId: string;
  company: string;
  trackingNumber?: string;
  deliveryPersonName?: string;
  phone?: string;
  status: 'AT_GATE' | 'HELD_AT_GATE' | 'COLLECTED' | 'RETURNED';
  gateEntryTime: string;
  collectedTime?: string;
  shelfSlot?: string;
  pickupOtp?: string;
  receivedAt?: string;
  flat: Flat;
}

export interface BillItem {
  id: string;
  billId: string;
  title: string;
  amount: number;
  category: string;
}

export interface MaintenanceBill {
  id: string;
  societyId: string;
  flatId: string;
  userId?: string;
  billNumber: string;
  billingMonth: string;
  billingYear: number;
  dueDate: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'FAILED';
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
  receiptUrl?: string;
  items: BillItem[];
  flat: Flat;
}

export interface Amenity {
  id: string;
  societyId: string;
  name: string;
  category: 'POOL' | 'GYM' | 'CLUBHOUSE' | 'HALL' | 'SPORTS' | 'GARDEN';
  description: string;
  capacity: number;
  openTime: string;
  closeTime: string;
  slotDurationMinutes: number;
  pricing: number;
  imageUrl: string;
  rules?: string;
  status: 'AVAILABLE' | 'MAINTENANCE';
  bookings?: AmenityBooking[];
}

export interface AmenityBooking {
  id: string;
  amenityId: string;
  userId: string;
  flatId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  guestsCount: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalFee: number;
  paymentStatus: string;
  amenity?: Amenity;
  flat?: Flat;
  user?: {
    id: string;
    name: string;
  };
}

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
export type ComplaintStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
export type ComplaintCategory = 'PLUMBING' | 'ELECTRICAL' | 'CLEANING' | 'SECURITY' | 'MAINTENANCE' | 'OTHER';

export interface ComplaintComment {
  id: string;
  complaintId: string;
  userId: string;
  authorName: string;
  authorRole: string;
  message: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  societyId: string;
  flatId: string;
  userId: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedStaffName?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  closureOtp?: string;
  createdAt: string;
  flat: Flat;
  user: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  comments?: ComplaintComment[];
}

export interface Announcement {
  id: string;
  societyId: string;
  title: string;
  content: string;
  category: 'URGENT' | 'IMPORTANT' | 'GENERAL' | 'EVENT' | 'MAINTENANCE';
  isPinned: boolean;
  authorName: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface EmergencyRequest {
  id: string;
  societyId: string;
  flatId: string;
  userId: string;
  residentName: string;
  residentPhone: string;
  flatNumber: string;
  emergencyType: 'SECURITY' | 'MEDICAL' | 'FIRE' | 'OTHER';
  status: 'ACTIVE' | 'RESOLVED';
  note?: string;
  resolvedBy?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface SensorReading {
  id: string;
  deviceId: string;
  sensorType: string;
  metricValue: number;
  unit: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  recordedAt: string;
}

export interface IoTDevice {
  id: string;
  societyId: string;
  name: string;
  deviceType: 'WATER_TANK' | 'POWER_GRID' | 'GATE_CAMERA' | 'PARKING_SENSOR' | 'AIR_QUALITY' | 'DG_GENSET';
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  batteryLevel?: number;
  lastHeartbeat: string;
  readings?: SensorReading[];
}

