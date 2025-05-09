
import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';

// Layouts
import MainLayout from '@/components/layout/MainLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Routes
import OnboardingRoutes from './OnboardingRoutes';

// Pages
import Dashboard from '@/pages/dashboard/Dashboard';
import { lazy } from 'react';
import { useOnboardingRedirect } from '@/hooks/useOnboardingRedirect';
import NotificationsPage from '@/pages/notifications/NotificationsPage';
import Unauthorized from '@/pages/unauthorized';

// Admin pages
import { 
  SystemLogs, 
  AdminDashboard, 
  AiDecisions, 
  ApiKeysPage, 
  CronJobsPage,
  UserManagement,
  PluginLogs
} from '@/pages/admin';

// Lazy-loaded pages
const GalaxyPage = lazy(() => import('@/pages/galaxy/GalaxyPage'));
const LaunchPage = lazy(() => import('@/pages/launch/LaunchPage'));
const PluginsPage = lazy(() => import('@/pages/plugins/PluginsPage'));
const PluginEvolutionPage = lazy(() => import('@/pages/plugins/PluginEvolutionPage'));
const PluginDetailPage = lazy(() => import('@/pages/plugins/PluginDetailPage'));
const AgentPerformance = lazy(() => import('@/pages/agents/AgentPerformance'));
const KpiDashboard = lazy(() => import('@/pages/insights/KpiDashboard'));
const StrategyBuilder = lazy(() => import('@/pages/launch/StrategyBuilder'));
const StrategyEngine = lazy(() => import('@/pages/strategy/StrategyEngine'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const ProfileSettings = lazy(() => import('@/pages/settings/ProfileSettings'));
const BillingPage = lazy(() => import('@/pages/billing/BillingPage'));

/**
 * ProtectedRoutes component that handles authentication and onboarding redirects
 */
const ProtectedRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  const { shouldRedirectToOnboarding, loading: onboardingLoading } = useOnboardingRedirect();

  // Show loading screen while checking authentication
  if (loading || onboardingLoading) {
    return <LoadingScreen />;
  }

  // Redirect to login page if user is not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to onboarding if needed
  if (shouldRedirectToOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <Routes>
      {/* Onboarding routes */}
      <Route path="/onboarding/*" element={<OnboardingRoutes />} />
      
      {/* Main app routes wrapped in MainLayout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        <Route path="notifications" element={<NotificationsPage />} />
        
        {/* Galaxy routes */}
        <Route path="galaxy" element={
          <Suspense fallback={<LoadingScreen />}>
            <GalaxyPage />
          </Suspense>
        } />
        
        {/* Launch routes */}
        <Route path="launch" element={
          <Suspense fallback={<LoadingScreen />}>
            <LaunchPage />
          </Suspense>
        } />
        <Route path="launch/new" element={
          <Suspense fallback={<LoadingScreen />}>
            <StrategyBuilder />
          </Suspense>
        } />
        
        {/* Strategy routes */}
        <Route path="strategies/:strategyId" element={
          <Suspense fallback={<LoadingScreen />}>
            <StrategyEngine />
          </Suspense>
        } />
        
        {/* Plugin routes */}
        <Route path="plugins" element={
          <Suspense fallback={<LoadingScreen />}>
            <PluginsPage />
          </Suspense>
        } />
        <Route path="plugins/:pluginId" element={
          <Suspense fallback={<LoadingScreen />}>
            <PluginDetailPage />
          </Suspense>
        } />
        <Route path="plugins/:pluginId/evolution" element={
          <Suspense fallback={<LoadingScreen />}>
            <PluginEvolutionPage />
          </Suspense>
        } />
        
        {/* Agent routes */}
        <Route path="agents/performance" element={
          <Suspense fallback={<LoadingScreen />}>
            <AgentPerformance />
          </Suspense>
        } />
        
        {/* Insights routes */}
        <Route path="insights/kpis" element={
          <Suspense fallback={<LoadingScreen />}>
            <KpiDashboard />
          </Suspense>
        } />
        
        {/* Settings routes */}
        <Route path="settings" element={
          <Suspense fallback={<LoadingScreen />}>
            <SettingsPage />
          </Suspense>
        } />
        <Route path="settings/profile" element={
          <Suspense fallback={<LoadingScreen />}>
            <ProfileSettings />
          </Suspense>
        } />
        <Route path="settings/billing" element={
          <Suspense fallback={<LoadingScreen />}>
            <BillingPage />
          </Suspense>
        } />
        
        {/* Unauthorized access page */}
        <Route path="unauthorized" element={<Unauthorized />} />
      </Route>
      
      {/* Admin routes wrapped in AdminLayout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="logs" element={<SystemLogs />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="ai-decisions" element={<AiDecisions />} />
        <Route path="cron-jobs" element={<CronJobsPage />} />
        <Route path="api-keys" element={<ApiKeysPage />} />
        <Route path="plugin-logs" element={<PluginLogs />} />
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default ProtectedRoutes;
