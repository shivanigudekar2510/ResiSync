import { handleMockRequest } from './mockEngine';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('resisync_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('resisync_token', token);
    } else {
      localStorage.removeItem('resisync_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('resisync_token');
    }
    return this.token;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type') || '';

      // If backend endpoint is 404, 405 (Netlify static host without backend proxy),
      // 502/503 (upstream server offline), OR if Netlify's SPA rewrite returned index.html for an API route
      if (
        response.status === 404 ||
        response.status === 405 ||
        response.status === 502 ||
        response.status === 503 ||
        contentType.includes('text/html') ||
        contentType.includes('text/plain')
      ) {
        return handleMockRequest<T>(endpoint, options, this.token);
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          this.setToken(null);
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      // If the response is unexpectedly empty (e.g. static hosting returning empty 200)
      if (typeof data === 'object' && Object.keys(data).length === 0) {
        return handleMockRequest<T>(endpoint, options, this.token);
      }

      return data;
    } catch (err: any) {
      // In case of network error, CORS, or static hosting
      return handleMockRequest<T>(endpoint, options, this.token);
    }
  }

  // Auth
  login(identifier: string, password: string) {
    return this.request<{ success: boolean; token: string; user: any; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  }

  register(payload: any) {
    return this.request<{ success: boolean; token: string; user: any; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  registerSociety(payload: any) {
    return this.request<{ success: boolean; token: string; user: any; society: any; societyCode: string; message: string }>('/auth/register-society', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getMe() {
    return this.request<{ success: boolean; user: any }>('/auth/me');
  }

  forgotPassword(email: string) {
    return this.request<{ success: boolean; message: string; demoNotice?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Profile & User
  updateProfile(payload: any) {
    return this.request<{ success: boolean; user: any; message: string }>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  addFamilyMember(payload: any) {
    return this.request<{ success: boolean; member: any }>('/users/family', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  deleteFamilyMember(id: string) {
    return this.request<{ success: boolean }>('/users/family/' + id, {
      method: 'DELETE',
    });
  }

  addVehicle(payload: any) {
    return this.request<{ success: boolean; vehicle: any }>('/users/vehicles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  deleteVehicle(id: string) {
    return this.request<{ success: boolean }>('/users/vehicles/' + id, {
      method: 'DELETE',
    });
  }

  // Visitors
  inviteVisitor(payload: any) {
    return this.request<{ success: boolean; visitor: any; message: string }>('/visitors/invite', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getVisitors(params?: { tab?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; visitors: any[] }>(`/visitors${query ? `?${query}` : ''}`);
  }

  verifyPass(code: string) {
    return this.request<{ success: boolean; visitor: any }>(`/visitor-passes/${code}`);
  }

  checkInVisitor(id: string) {
    return this.request<{ success: boolean; visitor: any; message: string }>(`/visitors/${id}/check-in`, {
      method: 'POST',
    });
  }

  checkOutVisitor(id: string) {
    return this.request<{ success: boolean; visitor: any; message: string }>(`/visitors/${id}/check-out`, {
      method: 'POST',
    });
  }

  updateVisitorStatus(id: string, status: string) {
    return this.request<{ success: boolean; visitor: any }>(`/visitors/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Deliveries
  createDelivery(payload: any) {
    return this.request<{ success: boolean; delivery: any; message: string }>('/deliveries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getDeliveries(status?: string) {
    return this.request<{ success: boolean; deliveries: any[] }>(`/deliveries${status ? `?status=${status}` : ''}`);
  }

  markDeliveryCollected(id: string) {
    return this.request<{ success: boolean; delivery: any }>('/deliveries/' + id + '/collect', {
      method: 'PATCH',
    });
  }

  // Maintenance
  getBills(status?: string) {
    return this.request<{ success: boolean; bills: any[]; metrics: any }>(`/maintenance${status ? `?status=${status}` : ''}`);
  }

  getBillById(id: string) {
    return this.request<{ success: boolean; bill: any }>(`/maintenance/${id}`);
  }

  payBill(id: string, payload: { paymentMethod: string; mockSuccess?: boolean }) {
    return this.request<{ success: boolean; bill: any; receiptNumber: string; message: string }>(`/maintenance/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  createBill(payload: any) {
    return this.request<{ success: boolean; bill: any }>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Amenities
  getAmenities(category?: string) {
    return this.request<{ success: boolean; amenities: any[] }>(`/amenities${category ? `?category=${category}` : ''}`);
  }

  bookAmenity(payload: any) {
    return this.request<{ success: boolean; booking: any; message: string }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getMyBookings() {
    return this.request<{ success: boolean; bookings: any[] }>('/bookings/my');
  }

  cancelBooking(id: string) {
    return this.request<{ success: boolean; message: string }>(`/bookings/${id}/cancel`, {
      method: 'POST',
    });
  }

  updateAmenity(id: string, payload: any) {
    return this.request<{ success: boolean; amenity: any }>(`/amenities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Complaints
  createComplaint(payload: any) {
    return this.request<{ success: boolean; complaint: any; message: string }>('/complaints', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getComplaints(params?: any) {
    const query = new URLSearchParams(params || {}).toString();
    return this.request<{ success: boolean; complaints: any[] }>(`/complaints${query ? `?${query}` : ''}`);
  }

  getComplaintById(id: string) {
    return this.request<{ success: boolean; complaint: any }>(`/complaints/${id}`);
  }

  addComplaintComment(id: string, message: string) {
    return this.request<{ success: boolean; comment: any }>(`/complaints/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  updateComplaintStatus(id: string, payload: any) {
    return this.request<{ success: boolean; complaint: any }>(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Announcements
  getAnnouncements(category?: string) {
    return this.request<{ success: boolean; announcements: any[] }>(`/announcements${category ? `?category=${category}` : ''}`);
  }

  createAnnouncement(payload: any) {
    return this.request<{ success: boolean; announcement: any }>('/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Emergency
  triggerEmergency(emergencyType: string, note?: string) {
    return this.request<{ success: boolean; message: string; emergency: any }>('/emergency/sos', {
      method: 'POST',
      body: JSON.stringify({ emergencyType, note }),
    });
  }

  getEmergencies() {
    return this.request<{ success: boolean; emergencies: any[] }>('/emergency');
  }

  resolveEmergency(id: string) {
    return this.request<{ success: boolean; emergency: any }>(`/emergency/${id}/resolve`, {
      method: 'POST',
    });
  }

  getEmergencyContacts() {
    return this.request<{ success: boolean; contacts: any[] }>('/emergency/contacts');
  }

  // IoT
  getIoTData() {
    return this.request<{
      success: boolean;
      mode: string;
      isDemoMode: boolean;
      devices: any[];
      history: any[];
      systemHealth: any;
    }>('/iot');
  }

  // Analytics
  getAdminAnalytics() {
    return this.request<{ success: boolean; kpis: any; charts: any }>('/analytics/dashboard');
  }

  // Admin Management
  getFlats() {
    return this.request<{ success: boolean; flats: any[] }>('/admin/flats');
  }

  createFlat(payload: any) {
    return this.request<{ success: boolean; flat: any }>('/admin/flats', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getResidents() {
    return this.request<{ success: boolean; residents: any[] }>('/admin/residents');
  }

  getAuditLogs() {
    return this.request<{ success: boolean; logs: any[] }>('/admin/audit-logs');
  }

  // Firebase & Cloud Sync
  getFirebaseConfig() {
    return this.request<{ success: boolean; config: any; telemetry: any }>('/admin/firebase-config');
  }

  updateFirebaseConfig(payload: any) {
    return this.request<{ success: boolean; message: string; config: any }>('/admin/firebase-config', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  testFirebaseConnection() {
    return this.request<{
      success: boolean;
      message: string;
      timestamp: string;
      overallLatencyMs: number;
      projectId: string;
      syncMode: string;
      checks: Array<{ check: string; status: string; latencyMs: number }>;
      activeCollectionsCount: number;
    }>('/admin/firebase-test', {
      method: 'POST',
    });
  }

  // Notifications
  getNotifications() {
    return this.request<{ success: boolean; unreadCount: number; notifications: any[] }>('/notifications');
  }

  markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }
}

export const api = new ApiService();
export default api;

