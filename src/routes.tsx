
import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import LoadingScreen from '@/components/LoadingScreen';
import { RequireAuth } from '@/components/auth/RequireAuth';
import MainLayout from '@/components/layout/MainLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import OnboardingLayout from '@/components/layout/OnboardingLayout';

// Lazy load pages
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const Onboarding = lazy(() => import('@/pages/onboarding'));
const AdminDashboard = lazy(() => import('@/pages/admin').then(m => ({ default: m.default })));
const UserManagement = lazy(() => import('@/pages/admin').then(m => ({ default: m.Users })));
const SystemLogsPage = lazy(() => import('@/pages/admin').then(m => ({ default: m.SystemLogs })));
const ApiKeysPage = lazy(() => import('@/pages/admin').then(m => ({ default: m.ApiKeys })));
const NotFound = lazy(() => import('@/pages/NotFound'));
const LaunchPage = lazy(() => import('@/pages/launch/LaunchPage'));
const InsightsPage = lazy(() => import('@/pages/insights/InsightsPage'));
const KpisPage = lazy(() => import('@/pages/insights/KpisPage'));
const Galaxy = lazy(() => import('@/pages/galaxy/GalaxyPage'));
const PluginsPage = lazy(() => import('@/pages/plugins/PluginsPage'));
const PluginDetailsPage = lazy(() => import('@/pages/plugins/PluginDetailsPage'));
const PluginEvolutionPage = lazy(() => import('@/pages/plugins/PluginEvolutionPage'));
const AgentsPerformancePage = lazy(() => import('@/pages/agents/AgentsPerformancePage'));
const Notifications = lazy(() => import('@/pages/notifications/NotificationsPage'));
const EvolutionPage = lazy(() => import('@/pages/evolution'));
const AlloraBrainPage = lazy(() => import('@/pages/allora-brain/AlloraBrainPage'));
const AlloraBrainDocsPage = lazy(() => import('@/pages/allora-brain/AlloraBrainDocsPage'));
const StandaloneAgentOS = lazy(() => import('@/pages/standalone/StandaloneAgentOSPage'));

// Create a routes array with lazy-loaded components wrapped in Suspense
export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'launch',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <LaunchPage />
          </Suspense>
        ),
      },
      {
        path: 'insights',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <InsightsPage />
              </Suspense>
            ),
          },
          {
            path: 'kpis',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <KpisPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'galaxy',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Galaxy />
          </Suspense>
        ),
      },
      {
        path: 'plugins',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <PluginsPage />
              </Suspense>
            ),
          },
          {
            path: ':id',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <PluginDetailsPage />
              </Suspense>
            ),
          },
          {
            path: ':id/evolution',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <PluginEvolutionPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'agents',
        children: [
          {
            path: 'performance',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <AgentsPerformancePage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'admin',
        element: (
          <AdminLayout />
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <AdminDashboard />
              </Suspense>
            ),
          },
          {
            path: 'users',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <UserManagement />
              </Suspense>
            ),
          },
          {
            path: 'logs',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <SystemLogsPage />
              </Suspense>
            ),
          },
          {
            path: 'api-keys',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ApiKeysPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'notifications',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Notifications />
          </Suspense>
        ),
      },
      {
        path: 'evolution',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <EvolutionPage />
          </Suspense>
        ),
      },
      {
        path: 'allora-brain',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <AlloraBrainPage />
              </Suspense>
            ),
          },
          {
            path: 'docs',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <AlloraBrainDocsPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'standalone',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <StandaloneAgentOS />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/auth',
    element: (
      <AuthLayout>
        <></>
      </AuthLayout>
    ),
    children: [
      {
        path: 'login',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: 'register',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Register />
          </Suspense>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ForgotPassword />
          </Suspense>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ResetPassword />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/onboarding',
    element: (
      <OnboardingLayout>
        <></>
      </OnboardingLayout>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Onboarding />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
];
