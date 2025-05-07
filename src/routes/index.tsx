
import React from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute, MainRoute, AdminRoute } from './ProtectedRoutes';
import Dashboard from '@/pages/dashboard/Dashboard';
import KpiDashboard from '@/pages/insights/KpiDashboard';
import BillingPage from '@/pages/billing/BillingPage';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import LoadingScreen from '@/components/LoadingScreen';
import ProfileSettings from '@/pages/settings/ProfileSettings';

const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('@/pages/auth/ResetPasswordPage'));
const AuthLayout = React.lazy(() => import('@/layouts/AuthLayout'));
const OnboardingLayout = React.lazy(() => import('@/layouts/OnboardingLayout'));

const LaunchPage = React.lazy(() => import('@/pages/launch/LaunchPage'));
const PluginsPage = React.lazy(() => import('@/pages/plugins/PluginsPage'));
const PluginDetailPage = React.lazy(() => import('@/pages/plugins/PluginDetailPage'));
const PluginEvolutionPage = React.lazy(() => import('@/pages/plugins/PluginEvolutionPage'));
const GalaxyPage = React.lazy(() => import('@/pages/galaxy/GalaxyPage'));
const AgentsPerformancePage = React.lazy(() => import('@/pages/agents/PerformancePage'));
const UserManagement = React.lazy(() => import('@/pages/admin/UserManagement'));
const SystemLogs = React.lazy(() => import('@/pages/admin/SystemLogs'));
const AiDecisions = React.lazy(() => import('@/pages/admin/AiDecisions'));
const NotificationsPage = React.lazy(() => import('@/pages/notifications/NotificationsPage'));

const routes: RouteObject[] = [
  // Public routes
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: '',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },
  
  // Onboarding
  {
    path: '/onboarding',
    element: <OnboardingLayout />,
    children: [
      {
        path: '',
        element: <OnboardingWizard />,
      }
    ]
  },
  
  // Protected routes
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainRoute />,
        children: [
          // Main routes that require main layout
          {
            path: '',
            element: <Dashboard />,
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'launch',
            element: 
              <React.Suspense fallback={<LoadingScreen />}>
                <LaunchPage />
              </React.Suspense>,
          },
          {
            path: 'plugins',
            element: 
              <React.Suspense fallback={<LoadingScreen />}>
                <PluginsPage />
              </React.Suspense>,
          },
          {
            path: 'plugins/:id',
            element: 
              <React.Suspense fallback={<LoadingScreen />}>
                <PluginDetailPage />
              </React.Suspense>,
          },
          {
            path: 'plugins/:id/evolution',
            element: 
              <React.Suspense fallback={<LoadingScreen />}>
                <PluginEvolutionPage />
              </React.Suspense>,
          },
          {
            path: 'galaxy',
            element: 
              <React.Suspense fallback={<LoadingScreen />}>
                <GalaxyPage />
              </React.Suspense>,
          },
          {
            path: 'agents/performance',
            element: 
              <React.Suspense fallback={<LoadingScreen />}>
                <AgentsPerformancePage />
              </React.Suspense>,
          },
          {
            path: 'insights/kpis',
            element: <KpiDashboard />,
          },
          {
            path: 'billing',
            element: <BillingPage />,
          },
          {
            path: 'notifications',
            element: 
              <React.Suspense fallback={<LoadingScreen />}>
                <NotificationsPage />
              </React.Suspense>,
          },
          {
            path: 'settings',
            element: <ProfileSettings />,
          },
        ]
      },
      {
        path: 'admin',
        element: <AdminRoute />,
        children: [
          {
            path: 'users',
            element: 
              <React.Suspense fallback={<LoadingScreen />}>
                <UserManagement />
              </React.Suspense>,
          },
          {
            path: 'system-logs',
            element: 
              <React.Suspense fallback={<LoadingScreen />}>
                <SystemLogs />
              </React.Suspense>,
          },
          {
            path: 'ai-decisions',
            element: 
              <React.Suspense fallback={<LoadingScreen />}>
                <AiDecisions />
              </React.Suspense>,
          },
        ],
      },
    ],
  },
];

export default routes;
