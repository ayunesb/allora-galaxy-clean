
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import RequireAuth from '@/components/auth/ProtectedRoute';
import OnboardingLayout from '@/components/layout/OnboardingLayout';
import { AdminGuard } from '@/components/guards/AdminGuard';
import AdminLayout from '@/components/layout/AdminLayout';
import NotificationsPage from '@/pages/NotificationsPage';

// Import your other pages here

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<div>Login Page</div>} />
        <Route path="register" element={<div>Register Page</div>} />
        <Route path="forgot-password" element={<div>Forgot Password Page</div>} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Route>
      
      {/* Onboarding routes */}
      <Route path="/onboarding" element={
        <RequireAuth>
          <OnboardingLayout />
        </RequireAuth>
      }>
        <Route path="company" element={<div>Company Setup</div>} />
        <Route path="persona" element={<div>Persona Setup</div>} />
        <Route path="strategy" element={<div>Strategy Setup</div>} />
        <Route path="*" element={<Navigate to="/onboarding/company" replace />} />
      </Route>
      
      {/* Main app routes */}
      <Route path="/" element={
        <RequireAuth>
          <MainLayout />
        </RequireAuth>
      }>
        <Route path="dashboard" element={<div>Dashboard Page</div>} />
        <Route path="strategies" element={<div>Strategies Page</div>} />
        <Route path="galaxy" element={<div>Galaxy Page</div>} />
        <Route path="agents" element={<div>Agents Page</div>} />
        <Route path="plugins" element={<div>Plugins Page</div>} />
        <Route path="insights" element={<div>Insights Page</div>} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="" element={<Navigate to="/dashboard" replace />} />
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <RequireAuth>
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        </RequireAuth>
      }>
        <Route path="users" element={<div>Users Admin Page</div>} />
        <Route path="logs" element={<div>System Logs Page</div>} />
        <Route path="settings" element={<div>System Settings Page</div>} />
        <Route path="" element={<Navigate to="/admin/users" replace />} />
      </Route>
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
