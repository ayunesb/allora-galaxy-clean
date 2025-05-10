import { RouteObject } from 'react-router-dom';
import PublicRoutes from './PublicRoutes';
import ProtectedRoutes from './ProtectedRoutes';
import AuthRoutes from './AuthRoutes';
import OnboardingRoutes from './OnboardingRoutes';
import MainLayout from '@/components/layout/MainLayout';

// Pages
import Dashboard from '@/pages/dashboard/Dashboard';
import GalaxyPage from '@/pages/galaxy/GalaxyPage';
import LaunchPage from '@/pages/launch/LaunchPage';
import KpiDashboard from '@/pages/insights/KpiDashboard';
import AgentPerformance from '@/pages/agents/AgentPerformance';
import PluginsPage from '@/pages/plugins/PluginsPage';
import PluginEvolutionPage from '@/pages/plugins/PluginEvolutionPage';
import ProfileSettings from '@/pages/settings/ProfileSettings';
import EvolutionDashboard from '@/components/evolution/EvolutionDashboard';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import SystemLogs from '@/pages/admin/SystemLogs';
import AiDecisions from '@/pages/admin/AiDecisions';
import CronJobsPage from '@/pages/admin/CronJobsPage';
import ApiKeysPage from '@/pages/admin/ApiKeysPage';
import { AdminGuard } from '@/components/guards/AdminGuard';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <ProtectedRoutes />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />
          },
          {
            path: 'dashboard',
            element: <Dashboard />
          },
          {
            path: 'galaxy',
            element: <GalaxyPage />
          },
          {
            path: 'launch',
            element: <LaunchPage />
          },
          {
            path: 'insights/kpis',
            element: <KpiDashboard />
          },
          {
            path: 'agents/performance',
            element: <AgentPerformance />
          },
          {
            path: 'plugins',
            element: <PluginsPage />
          },
          {
            path: 'plugins/:id/evolution',
            element: <PluginEvolutionPage />
          },
          {
            path: 'evolution',
            element: <EvolutionDashboard />
          },
          {
            path: 'evolution/:type',
            element: <EvolutionDashboard />
          },
          {
            path: 'settings/profile',
            element: <ProfileSettings />
          },
          {
            path: 'admin',
            element: <AdminGuard><AdminDashboard /></AdminGuard>
          },
          {
            path: 'admin/users',
            element: <AdminGuard><UserManagement /></AdminGuard>
          },
          {
            path: 'admin/system-logs',
            element: <AdminGuard><SystemLogs /></AdminGuard>
          },
          {
            path: 'admin/ai-decisions',
            element: <AdminGuard><AiDecisions /></AdminGuard>
          },
          {
            path: 'admin/cron-jobs',
            element: <AdminGuard><CronJobsPage /></AdminGuard>
          },
          {
            path: 'admin/api-keys',
            element: <AdminGuard><ApiKeysPage /></AdminGuard>
          }
        ]
      }
    ]
  },
  {
    path: '/auth/*',
    element: <AuthRoutes />
  },
  {
    path: '/onboarding',
    element: <OnboardingRoutes />
  },
  {
    path: '*',
    element: <PublicRoutes />
  }
];

export default routes;
