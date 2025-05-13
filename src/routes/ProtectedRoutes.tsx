
import { Route, Routes, Navigate } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';
import MainLayout from '@/components/layout/MainLayout';

// Import dashboard and main pages
import Dashboard from '@/pages/dashboard/Dashboard';
import LaunchPage from '@/pages/launch/LaunchPage';
import GalaxyPage from '@/pages/galaxy/GalaxyPage';
import Evolution from '@/pages/evolution/Evolution';

// Import plugins pages
import PluginsPage from '@/pages/plugins';
import PluginDetailPage from '@/pages/plugins/PluginDetailPage';
import PluginEvolutionPage from '@/pages/plugins/PluginEvolutionPage';
import PluginsLeaderboard from '@/pages/plugins/PluginsLeaderboard';

// Import agents pages
import AgentPerformance from '@/pages/agents/AgentPerformance';

// Import insights pages
import KpiDashboard from '@/pages/insights/KpiDashboard';

// Import settings pages
import SettingsPage from '@/pages/settings/SettingsPage';
import ProfileSettings from '@/pages/settings/ProfileSettings';

// Import admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import SystemLogs from '@/pages/admin/SystemLogs';
import PluginLogs from '@/pages/admin/PluginLogs';
import AiDecisions from '@/pages/admin/AiDecisions';
import ApiKeysPage from '@/pages/admin/ApiKeysPage';
import CronJobsPage from '@/pages/admin/CronJobsPage';
import DeletionRequestsPage from '@/pages/admin/DeletionRequestsPage';

// Import notifications pages
import NotificationsPage from '@/pages/notifications/NotificationsPage';

// Import exploration page
import ExplorePage from '@/pages/explore/ExplorePage';

// Import Allora Brain pages
import AlloraBrainPage from '@/pages/allora-brain/AlloraBrainPage';
import AlloraBrainDocsPage from '@/pages/allora-brain/AlloraBrainDocsPage';

// Import legal pages
import TermsPage from '@/pages/legal/TermsPage';
import PrivacyPage from '@/pages/legal/PrivacyPage';
import DeletionRequestPage from '@/pages/legal/DeletionRequestPage';

// Import error pages
import Unauthorized from '@/pages/errors/Unauthorized';
import NotFound from '@/pages/NotFound';

const ProtectedRoutes = () => {
  // Remove the unused workspace reference
  
  return (
    <Routes>
      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        {/* Dashboard and main routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/launch" element={<LaunchPage />} />
        <Route path="/galaxy" element={<GalaxyPage />} />
        <Route path="/evolution" element={<Evolution />} />
        
        {/* Plugins section */}
        <Route path="/plugins" element={<PluginsPage />} />
        <Route path="/plugins/:id" element={<PluginDetailPage />} />
        <Route path="/plugins/:id/evolution" element={<PluginEvolutionPage />} />
        <Route path="/plugins/leaderboard" element={<PluginsLeaderboard />} />
        
        {/* Agents section */}
        <Route path="/agents/performance" element={<AgentPerformance />} />
        
        {/* Insights section */}
        <Route path="/insights/kpis" element={<KpiDashboard />} />
        
        {/* Settings */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/profile" element={<ProfileSettings />} />
        
        {/* Admin section */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/system-logs" element={<SystemLogs />} />
        <Route path="/admin/plugin-logs" element={<PluginLogs />} />
        <Route path="/admin/ai-decisions" element={<AiDecisions />} />
        <Route path="/admin/api-keys" element={<ApiKeysPage />} />
        <Route path="/admin/cron-jobs" element={<CronJobsPage />} />
        <Route path="/admin/deletion-requests" element={<DeletionRequestsPage />} />
        
        {/* Notifications */}
        <Route path="/notifications" element={<NotificationsPage />} />
        
        {/* Exploration */}
        <Route path="/explore" element={<ExplorePage />} />
        
        {/* Allora Brain */}
        <Route path="/allora-brain" element={<AlloraBrainPage />} />
        <Route path="/allora-brain/docs" element={<AlloraBrainDocsPage />} />
        
        {/* Legal pages */}
        <Route path="/legal/terms" element={<TermsPage />} />
        <Route path="/legal/privacy" element={<PrivacyPage />} />
        <Route path="/legal/deletion-request" element={<DeletionRequestPage />} />
        
        {/* Fallbacks */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default ProtectedRoutes;
