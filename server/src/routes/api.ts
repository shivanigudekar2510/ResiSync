import { Router } from 'express';
import {
  login,
  register,
  getMe,
  forgotPassword,
  changePassword,
} from '../controllers/authController.js';
import {
  inviteVisitor,
  getVisitors,
  verifyPass,
  checkInVisitor,
  checkOutVisitor,
  updateVisitorStatus,
} from '../controllers/visitorController.js';
import {
  createDelivery,
  getDeliveries,
  markDeliveryCollected,
} from '../controllers/deliveryController.js';
import {
  getBills,
  getBillById,
  payBill,
  createBill,
} from '../controllers/maintenanceController.js';
import {
  getAmenities,
  getAmenityById,
  bookAmenity,
  getMyBookings,
  cancelBooking,
  updateAmenity,
} from '../controllers/amenityController.js';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  addComplaintComment,
  updateComplaintStatus,
} from '../controllers/complaintController.js';
import {
  getAnnouncements,
  createAnnouncement,
} from '../controllers/announcementController.js';
import {
  triggerEmergency,
  getEmergencies,
  resolveEmergency,
  getEmergencyContacts,
} from '../controllers/emergencyController.js';
import {
  getIoTDevices,
  updateSensorReading,
} from '../controllers/iotController.js';
import {
  getAdminAnalytics,
} from '../controllers/analyticsController.js';
import {
  getFlats,
  createFlat,
  getResidents,
  getAuditLogs,
  getNotifications,
  markNotificationRead,
} from '../controllers/adminController.js';
import {
  updateProfile,
  addFamilyMember,
  deleteFamilyMember,
  addVehicle,
  deleteVehicle,
} from '../controllers/userController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// ================= AUTH ROUTES =================
router.post('/auth/login', login);
router.post('/auth/register', register);
router.post('/auth/forgot-password', forgotPassword);
router.get('/auth/me', authenticateToken, getMe);
router.post('/auth/change-password', authenticateToken, changePassword);

// ================= USER PROFILE & PREFERENCES =================
router.patch('/users/profile', authenticateToken, updateProfile);
router.post('/users/family', authenticateToken, addFamilyMember);
router.delete('/users/family/:id', authenticateToken, deleteFamilyMember);
router.post('/users/vehicles', authenticateToken, addVehicle);
router.delete('/users/vehicles/:id', authenticateToken, deleteVehicle);

// ================= VISITOR MANAGEMENT =================
router.post('/visitors/invite', authenticateToken, inviteVisitor);
router.get('/visitors', authenticateToken, getVisitors);
router.get('/visitor-passes/:code', authenticateToken, verifyPass);
router.post('/visitors/:id/check-in', authenticateToken, requireRole('SECURITY', 'ADMIN'), checkInVisitor);
router.post('/visitors/:id/check-out', authenticateToken, requireRole('SECURITY', 'ADMIN'), checkOutVisitor);
router.patch('/visitors/:id/status', authenticateToken, updateVisitorStatus);

// ================= DELIVERIES =================
router.post('/deliveries', authenticateToken, requireRole('SECURITY', 'ADMIN'), createDelivery);
router.get('/deliveries', authenticateToken, getDeliveries);
router.patch('/deliveries/:id/collect', authenticateToken, markDeliveryCollected);

// ================= MAINTENANCE & PAYMENTS =================
router.get('/maintenance', authenticateToken, getBills);
router.get('/maintenance/:id', authenticateToken, getBillById);
router.post('/maintenance/:id/pay', authenticateToken, payBill);
router.post('/maintenance', authenticateToken, requireRole('ADMIN'), createBill);

// ================= AMENITIES BOOKING =================
router.get('/amenities', authenticateToken, getAmenities);
router.get('/amenities/:id', authenticateToken, getAmenityById);
router.post('/bookings', authenticateToken, bookAmenity);
router.get('/bookings/my', authenticateToken, getMyBookings);
router.post('/bookings/:id/cancel', authenticateToken, cancelBooking);
router.patch('/amenities/:id', authenticateToken, requireRole('ADMIN'), updateAmenity);

// ================= HELPDESK & COMPLAINTS =================
router.post('/complaints', authenticateToken, createComplaint);
router.get('/complaints', authenticateToken, getComplaints);
router.get('/complaints/:id', authenticateToken, getComplaintById);
router.post('/complaints/:id/comments', authenticateToken, addComplaintComment);
router.patch('/complaints/:id/status', authenticateToken, requireRole('ADMIN'), updateComplaintStatus);

// ================= ALERTS & ANNOUNCEMENTS =================
router.get('/announcements', authenticateToken, getAnnouncements);
router.post('/announcements', authenticateToken, requireRole('ADMIN'), createAnnouncement);

// ================= EMERGENCY ASSISTANCE =================
router.post('/emergency/sos', authenticateToken, triggerEmergency);
router.get('/emergency', authenticateToken, getEmergencies);
router.post('/emergency/:id/resolve', authenticateToken, requireRole('ADMIN', 'SECURITY'), resolveEmergency);
router.get('/emergency/contacts', authenticateToken, getEmergencyContacts);

// ================= IOT & SENSORS =================
router.get('/iot', authenticateToken, getIoTDevices);
router.post('/iot/reading', authenticateToken, updateSensorReading);

// ================= ANALYTICS =================
router.get('/analytics/dashboard', authenticateToken, requireRole('ADMIN'), getAdminAnalytics);

// ================= NOTIFICATIONS =================
router.get('/notifications', authenticateToken, getNotifications);
router.patch('/notifications/:id/read', authenticateToken, markNotificationRead);

// ================= ADMIN MANAGEMENT =================
router.get('/admin/flats', authenticateToken, requireRole('ADMIN', 'SECURITY'), getFlats);
router.post('/admin/flats', authenticateToken, requireRole('ADMIN'), createFlat);
router.get('/admin/residents', authenticateToken, requireRole('ADMIN'), getResidents);
router.get('/admin/audit-logs', authenticateToken, requireRole('ADMIN'), getAuditLogs);

export default router;

