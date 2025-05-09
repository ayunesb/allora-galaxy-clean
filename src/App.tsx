
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './lib/theme';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { NotificationsProvider } from './context/NotificationsContext';
import RequireAuth from './components/auth/RequireAuth';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import OnboardingLayout from './layouts/OnboardingLayout';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import SystemLogs from './pages/admin/SystemLogs';
import AiDecisions from './pages/admin/AiDecisions';
import ApiKeysPage from './pages/admin/ApiKeysPage';
import CronJobsPage from './pages/admin/CronJobsPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <NotificationsProvider>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Index />} />
                <Route path="notifications" element={
                  <RequireAuth>
                    <NotificationsPage />
                  </RequireAuth>
                } />
              </Route>
              
              {/* Auth Routes */}
              <Route path="auth/*" element={<AuthLayout />} />
              
              {/* Onboarding Routes */}
              <Route path="onboarding/*" element={
                <RequireAuth>
                  <OnboardingLayout />
                </RequireAuth>
              } />
              
              {/* Admin Routes */}
              <Route path="admin" element={
                <RequireAuth roles={['admin', 'owner']}>
                  <MainLayout />
                </RequireAuth>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="logs" element={<SystemLogs />} />
                <Route path="ai-decisions" element={<AiDecisions />} />
                <Route path="api-keys" element={<ApiKeysPage />} />
                <Route path="cron-jobs" element={<CronJobsPage />} />
              </Route>
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            <Toaster />
          </NotificationsProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
