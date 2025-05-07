
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { Toaster } from './components/ui/toaster';
import ErrorBoundary from './components/ErrorBoundary';
import AuthRoutes from './routes/AuthRoutes';
import OnboardingRoutes from './routes/OnboardingRoutes';
import PublicRoutes from './routes/PublicRoutes';
import { ProtectedRoute, MainRoute, AdminRoute } from './routes/ProtectedRoutes';
import Dashboard from './pages/dashboard/Dashboard';
import KpiDashboard from './pages/insights/KpiDashboard';
import BillingPage from './pages/billing/BillingPage';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

// Lazy loaded components
const NotificationsPage = React.lazy(() => import('./pages/notifications/NotificationsPage'));
const ProfileSettings = React.lazy(() => import('./pages/settings/ProfileSettings'));
const PluginsPage = React.lazy(() => import('./pages/plugins/PluginsPage'));
const GalaxyPage = React.lazy(() => import('./pages/galaxy/GalaxyPage'));
const AgentPerformance = React.lazy(() => import('./pages/agents/AgentPerformance'));
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));
const SystemLogs = React.lazy(() => import('./pages/admin/SystemLogs'));
const AiDecisions = React.lazy(() => import('./pages/admin/AiDecisions'));
const PluginLogs = React.lazy(() => import('./pages/admin/PluginLogs'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary tenant_id="system" supportEmail="support@alloraos.com">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <WorkspaceProvider>
              <NotificationsProvider>
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/auth/*" element={<AuthRoutes />} />
                  
                  {/* Onboarding Routes */}
                  <Route path="/onboarding/*" element={<OnboardingRoutes />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<MainRoute />}>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/insights/kpis" element={<KpiDashboard />} />
                      <Route path="/billing" element={<BillingPage />} />
                      <Route
                        path="/notifications"
                        element={
                          <React.Suspense fallback={<LoadingScreen />}>
                            <NotificationsPage />
                          </React.Suspense>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <React.Suspense fallback={<LoadingScreen />}>
                            <ProfileSettings />
                          </React.Suspense>
                        }
                      />
                      <Route
                        path="/plugins/*"
                        element={
                          <React.Suspense fallback={<LoadingScreen />}>
                            <PluginsPage />
                          </React.Suspense>
                        }
                      />
                      <Route
                        path="/galaxy"
                        element={
                          <React.Suspense fallback={<LoadingScreen />}>
                            <GalaxyPage />
                          </React.Suspense>
                        }
                      />
                      <Route
                        path="/agents/performance"
                        element={
                          <React.Suspense fallback={<LoadingScreen />}>
                            <AgentPerformance />
                          </React.Suspense>
                        }
                      />
                    </Route>
                    <Route path="/admin" element={<AdminRoute />}>
                      <Route index element={<Navigate to="/admin/users" replace />} />
                      <Route
                        path="users"
                        element={
                          <React.Suspense fallback={<LoadingScreen />}>
                            <UserManagement />
                          </React.Suspense>
                        }
                      />
                      <Route
                        path="system-logs"
                        element={
                          <React.Suspense fallback={<LoadingScreen />}>
                            <SystemLogs />
                          </React.Suspense>
                        }
                      />
                      <Route
                        path="ai-decisions"
                        element={
                          <React.Suspense fallback={<LoadingScreen />}>
                            <AiDecisions />
                          </React.Suspense>
                        }
                      />
                      <Route
                        path="plugin-logs"
                        element={
                          <React.Suspense fallback={<LoadingScreen />}>
                            <PluginLogs />
                          </React.Suspense>
                        }
                      />
                    </Route>
                  </Route>
                  
                  {/* Public Routes */}
                  <Route path="/*" element={<PublicRoutes />} />
                </Routes>
                <Toaster />
              </NotificationsProvider>
            </WorkspaceProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
