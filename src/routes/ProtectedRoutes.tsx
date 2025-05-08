
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import NotFound from '@/pages/NotFound';
import RequireAuth from '@/components/auth/ProtectedRoute';
import AdminGuard from '@/components/guards/AdminGuard';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { UserRole } from '@/lib/auth/roleTypes';

// Import pages
import Dashboard from '@/pages/dashboard/Dashboard';
import GalaxyPage from '@/pages/galaxy/GalaxyPage';
import GalaxyExplorer from '@/pages/galaxy/GalaxyExplorer';
import LaunchPage from '@/pages/launch/LaunchPage';
import StrategyBuilder from '@/pages/launch/StrategyBuilder';
import AgentPerformance from '@/pages/agents/AgentPerformance';
import PluginsPage from '@/pages/plugins/PluginsPage';
import PluginDetailPage from '@/pages/plugins/PluginDetailPage';
import PluginEvolution from '@/pages/plugins/PluginEvolution';
import PluginEvolutionPage from '@/pages/plugins/PluginEvolutionPage';
import KpiDashboard from '@/pages/insights/KpiDashboard';
import StrategyEngine from '@/pages/strategy/StrategyEngine';
import SettingsPage from '@/pages/settings/SettingsPage';
import ProfileSettings from '@/pages/settings/ProfileSettings';
import BillingPage from '@/pages/billing/BillingPage';

// Admin pages
import AiDecisions from '@/pages/admin/AiDecisions';
import UserManagement from '@/pages/admin/UserManagement';
import PluginLogs from '@/pages/admin/PluginLogs';
import SystemLogs from '@/pages/admin/SystemLogs';
import DeletionRequestsPage from '@/pages/admin/DeletionRequestsPage';

// Legal pages
import DeletionRequestPage from '@/pages/legal/DeletionRequestPage';
import TermsPage from '@/pages/legal/TermsPage';
import PrivacyPage from '@/pages/legal/PrivacyPage';

// Notifications
import NotificationsPage from '@/pages/notifications/NotificationsPage';

const AdminLayout = () => {
  return (
    <AdminGuard>
      <Outlet />
    </AdminGuard>
  );
};

const ProtectedRoutes = () => {
  const { currentRole } = useWorkspace();

  return (
    <RequireAuth>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Strategy/Galaxy routes */}
          <Route path="/galaxy" element={<GalaxyPage />} />
          <Route path="/galaxy/explorer" element={<GalaxyExplorer />} />
          <Route path="/launch" element={<LaunchPage />} />
          <Route path="/launch/build" element={<StrategyBuilder />} />
          <Route path="/strategy/:id" element={<StrategyEngine />} />
          
          {/* Plugin routes */}
          <Route path="/plugins" element={<PluginsPage />} />
          <Route path="/plugins/:id" element={<PluginDetailPage />} />
          <Route path="/plugins/:id/evolution" element={<PluginEvolutionPage />} />
          <Route path="/plugins/evolution/:id" element={<PluginEvolution />} />
          
          {/* Agent routes */}
          <Route path="/agents/performance" element={<AgentPerformance />} />
          
          {/* Insights routes */}
          <Route path="/insights/kpis" element={<KpiDashboard />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="ai-decisions" element={<AiDecisions />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="plugin-logs" element={<PluginLogs />} />
            <Route path="system-logs" element={<SystemLogs />} />
            <Route path="deletion-requests" element={<DeletionRequestsPage />} />
          </Route>
          
          {/* Settings routes */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/profile" element={<ProfileSettings />} />
          <Route path="/settings/billing" element={<BillingPage />} />
          
          {/* Notification routes */}
          <Route path="/notifications" element={<NotificationsPage />} />
          
          {/* Legal routes */}
          <Route path="/legal/deletion-request" element={<DeletionRequestPage />} />
          <Route path="/legal/terms" element={<TermsPage />} />
          <Route path="/legal/privacy" element={<PrivacyPage />} />
          
          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </RequireAuth>
  );
};

export default ProtectedRoutes;
