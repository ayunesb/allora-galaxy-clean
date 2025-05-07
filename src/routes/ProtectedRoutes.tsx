import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import { useRoleCheck } from '@/lib/auth/useRoleCheck';

// Lazy-loaded pages
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const GalaxyExplorer = lazy(() => import('@/pages/galaxy/GalaxyExplorer'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const PluginLogs = lazy(() => import('@/pages/admin/PluginLogs'));
const SystemLogs = lazy(() => import('@/pages/admin/SystemLogs'));
const AiDecisions = lazy(() => import('@/pages/admin/AiDecisions'));
const AgentPerformance = lazy(() => import('@/pages/agents/AgentPerformance'));
const PluginsPage = lazy(() => import('@/pages/plugins/PluginsPage'));
const StrategyEngine = lazy(() => import('@/pages/strategy/StrategyEngine'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const KpiDashboard = lazy(() => import('@/pages/insights/KpiDashboard'));
const BillingPage = lazy(() => import('@/pages/billing/BillingPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const UnauthorizedPage = lazy(() => import('@/pages/unauthorized'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const ProtectedRoutes: React.FC = () => {
  // Pre-check admin access to avoid route flicker
  const { hasAccess: isAdmin } = useRoleCheck({ 
    requiredRole: ['admin', 'owner'],
    silent: true
  });
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Main layout routes */}
        <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Galaxy */}
          <Route path="/galaxy" element={<GalaxyExplorer />} />
          
          {/* Agents */}
          <Route path="/agents/performance" element={<AgentPerformance />} />
          
          {/* Plugins */}
          <Route path="/plugins" element={<PluginsPage />} />
          
          {/* Strategy */}
          <Route path="/strategies" element={<StrategyEngine />} />
          
          {/* Insights */}
          <Route path="/insights" element={<KpiDashboard />} />
          <Route path="/insights/kpis" element={<KpiDashboard />} />
          
          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Billing */}
          <Route path="/billing" element={<BillingPage />} />
          
          {/* Admin routes */}
          <Route path="/admin">
            <Route element={<AdminLayout />}>
              <Route path="users" element={<UserManagement />} />
              <Route path="plugin-logs" element={<PluginLogs />} />
              <Route path="system-logs" element={<SystemLogs />} />
              <Route path="ai-decisions" element={<AiDecisions />} />
            </Route>
          </Route>
          
          {/* Other routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default ProtectedRoutes;
