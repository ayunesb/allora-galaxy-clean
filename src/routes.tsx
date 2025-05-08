
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from "@/components/layout/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import OnboardingLayout from "@/layouts/OnboardingLayout";
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { LoadingScreen } from '@/components/LoadingScreen';

// Lazy-loaded pages
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const Login = lazy(() => import('@/pages/auth/Login'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const Register = lazy(() => import('@/pages/auth/Register'));
const Onboarding = lazy(() => import('@/pages/onboarding'));
const Galaxy = lazy(() => import('@/pages/galaxy'));
const LaunchPage = lazy(() => import('@/pages/launch'));
const PluginsPage = lazy(() => import('@/pages/plugins'));
const AdminPage = lazy(() => import('@/pages/admin'));
const SystemLogs = lazy(() => import('@/pages/admin/SystemLogs'));
const UsersPage = lazy(() => import('@/pages/admin/Users'));
const ApiKeys = lazy(() => import('@/pages/admin/ApiKeys'));
const InsightsPage = lazy(() => import('@/pages/insights'));
const KPIDashboard = lazy(() => import('@/pages/insights/KPIDashboard'));
const StrategyPage = lazy(() => import('@/pages/strategy'));
const StrategyDetails = lazy(() => import('@/pages/strategy/StrategyDetails'));
const StrategyEngine = lazy(() => import('@/pages/strategy/StrategyEngine'));
const AgentPerformance = lazy(() => import('@/pages/agents/performance'));
const PluginDetails = lazy(() => import('@/pages/plugins/PluginDetails'));
const PluginEvolutionPage = lazy(() => import('@/pages/plugins/PluginEvolutionPage'));
const AlloraBrain = lazy(() => import('@/pages/allora-brain'));
const BillingPage = lazy(() => import('@/pages/billing/BillingPage'));
const EvolutionPage = lazy(() => import('@/pages/evolution'));

// Wrap with Suspense for lazy loading
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <SuspenseWrapper><Dashboard /></SuspenseWrapper>,
      },
    ],
  },
  {
    path: '/galaxy',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <SuspenseWrapper><Galaxy /></SuspenseWrapper>,
      },
    ],
  },
  {
    path: '/launch',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <SuspenseWrapper><LaunchPage /></SuspenseWrapper>,
      },
    ],
  },
  {
    path: '/plugins',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <SuspenseWrapper><PluginsPage /></SuspenseWrapper>,
      },
      {
        path: ':id',
        element: <SuspenseWrapper><PluginDetails /></SuspenseWrapper>,
      },
      {
        path: ':id/evolution',
        element: <SuspenseWrapper><PluginEvolutionPage /></SuspenseWrapper>,
      },
    ],
  },
  {
    path: '/agents/performance',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <SuspenseWrapper><AgentPerformance /></SuspenseWrapper>,
      },
    ],
  },
  {
    path: '/insights',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/insights/kpis" replace />,
      },
      {
        path: 'kpis',
        element: <SuspenseWrapper><KPIDashboard /></SuspenseWrapper>,
      },
      {
        path: '*',
        element: <SuspenseWrapper><InsightsPage /></SuspenseWrapper>,
      },
    ],
  },
  {
    path: '/strategy',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <SuspenseWrapper><StrategyPage /></SuspenseWrapper>,
      },
      {
        path: ':id',
        element: <SuspenseWrapper><StrategyDetails /></SuspenseWrapper>,
      },
      {
        path: ':id/execute',
        element: <SuspenseWrapper><StrategyEngine /></SuspenseWrapper>,
      },
    ],
  },
  {
    path: '/evolution',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <SuspenseWrapper><EvolutionPage /></SuspenseWrapper>,
      },
    ],
  },
  {
    path: '/allora-brain',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <SuspenseWrapper><AlloraBrain /></SuspenseWrapper>,
      },
    ],
  },
  {
    path: '/billing',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <SuspenseWrapper><BillingPage /></SuspenseWrapper>,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <AdminGuard>
          <MainLayout />
        </AdminGuard>
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <SuspenseWrapper><AdminPage /></SuspenseWrapper>,
      },
      {
        path: 'logs',
        element: <SuspenseWrapper><SystemLogs /></SuspenseWrapper>,
      },
      {
        path: 'users',
        element: <SuspenseWrapper><UsersPage /></SuspenseWrapper>,
      },
      {
        path: 'api-keys',
        element: <SuspenseWrapper><ApiKeys /></SuspenseWrapper>,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
      {
        path: 'login',
        element: <SuspenseWrapper><Login /></SuspenseWrapper>,
      },
      {
        path: 'register',
        element: <SuspenseWrapper><Register /></SuspenseWrapper>,
      },
      {
        path: 'forgot-password',
        element: <SuspenseWrapper><ForgotPassword /></SuspenseWrapper>,
      },
      {
        path: 'reset-password',
        element: <SuspenseWrapper><ResetPassword /></SuspenseWrapper>,
      },
    ],
  },
  {
    path: '/onboarding',
    element: <OnboardingLayout />,
    children: [
      {
        index: true,
        element: <SuspenseWrapper><Onboarding /></SuspenseWrapper>,
      },
    ],
  },
]);
