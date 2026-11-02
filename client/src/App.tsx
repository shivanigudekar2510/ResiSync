import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './components/layout/AppLayout';

// Public Pages
import { WelcomePage } from './pages/welcome/WelcomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { SocietyRegisterWizard } from './pages/auth/SocietyRegisterWizard';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Resident Pages
import { ResidentDashboard } from './pages/resident/ResidentDashboard';
import { ResidentVisitors } from './pages/resident/ResidentVisitors';
import { ResidentMaintenance } from './pages/resident/ResidentMaintenance';
import { ResidentAmenities } from './pages/resident/ResidentAmenities';
import { ResidentHelpdesk } from './pages/resident/ResidentHelpdesk';
import { ResidentAlerts } from './pages/resident/ResidentAlerts';
import { ResidentSocietyStatus } from './pages/resident/ResidentSocietyStatus';
import { ResidentProfile } from './pages/resident/ResidentProfile';

// Security Guard Pages
import { SecurityDashboard } from './pages/security/SecurityDashboard';
import { SecurityQRScanner } from './pages/security/SecurityQRScanner';
import { SecurityVisitors } from './pages/security/SecurityVisitors';
import { SecurityDeliveries } from './pages/security/SecurityDeliveries';
import { SecurityHistory } from './pages/security/SecurityHistory';
import { SecurityEmergency } from './pages/security/SecurityEmergency';

// Administrator Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminResidents } from './pages/admin/AdminResidents';
import { AdminFlats } from './pages/admin/AdminFlats';
import { AdminVisitors } from './pages/admin/AdminVisitors';
import { AdminMaintenance } from './pages/admin/AdminMaintenance';
import { AdminAmenities } from './pages/admin/AdminAmenities';
import { AdminComplaints } from './pages/admin/AdminComplaints';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminIoT } from './pages/admin/AdminIoT';
import { AdminSettings } from './pages/admin/AdminSettings';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('RESIDENT' | 'SECURITY' | 'ADMIN')[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text-muted">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono">Initializing RESISYNC...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    if (role === 'RESIDENT') return <Navigate to="/resident/dashboard" replace />;
    if (role === 'SECURITY') return <Navigate to="/security/dashboard" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/welcome" replace />;
  if (role === 'RESIDENT') return <Navigate to="/resident/dashboard" replace />;
  if (role === 'SECURITY') return <Navigate to="/security/dashboard" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/welcome" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register-society" element={<SocietyRegisterWizard />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Root Dispatcher */}
            <Route path="/" element={<RootRedirect />} />

            {/* Resident Protected Routes */}
            <Route
              path="/resident"
              element={
                <ProtectedRoute allowedRoles={['RESIDENT', 'ADMIN']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<ResidentDashboard />} />
              <Route path="visitors" element={<ResidentVisitors />} />
              <Route path="maintenance" element={<ResidentMaintenance />} />
              <Route path="amenities" element={<ResidentAmenities />} />
              <Route path="helpdesk" element={<ResidentHelpdesk />} />
              <Route path="alerts" element={<ResidentAlerts />} />
              <Route path="society-status" element={<ResidentSocietyStatus />} />
              <Route path="profile" element={<ResidentProfile />} />
              <Route path="settings" element={<ResidentProfile />} />
            </Route>

            {/* Security Guard Protected Routes */}
            <Route
              path="/security"
              element={
                <ProtectedRoute allowedRoles={['SECURITY', 'ADMIN']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<SecurityDashboard />} />
              <Route path="scan" element={<SecurityQRScanner />} />
              <Route path="visitors" element={<SecurityVisitors />} />
              <Route path="deliveries" element={<SecurityDeliveries />} />
              <Route path="history" element={<SecurityHistory />} />
              <Route path="emergency" element={<SecurityEmergency />} />
            </Route>

            {/* Administrator Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="residents" element={<AdminResidents />} />
              <Route path="flats" element={<AdminFlats />} />
              <Route path="visitors" element={<AdminVisitors />} />
              <Route path="maintenance" element={<AdminMaintenance />} />
              <Route path="payments" element={<AdminMaintenance />} />
              <Route path="amenities" element={<AdminAmenities />} />
              <Route path="complaints" element={<AdminComplaints />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="iot" element={<AdminIoT />} />
              <Route path="analytics" element={<AdminDashboard />} />
              <Route path="security" element={<AdminVisitors />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

