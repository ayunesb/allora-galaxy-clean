
import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { MainRoute, ProtectedRoute, AdminRoute } from './routes/ProtectedRoutes';
import AuthLayout from './layouts/AuthLayout';
import OnboardingLayout from './layouts/OnboardingLayout';
import Dashboard from './pages/dashboard/Dashboard';
import AuthPage from './pages/auth/AuthPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import OnboardingPage from './pages/onboarding/index';
import GalaxyPage from './pages/galaxy/GalaxyPage';
import LaunchPage from './pages/launch/LaunchPage';
import StrategyBuilder from './pages/launch/StrategyBuilder';
import PluginsPage from './pages/plugins/PluginsPage';
import PluginDetailPage from './pages/plugins/PluginDetailPage';
import PluginEvolutionPage from './pages/plugins/PluginEvolutionPage';
import KpiDashboard from './pages/insights/KpiDashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemLogs from './pages/admin/SystemLogs';
import AiDecisions from './pages/admin/AiDecisions';
import PluginLogs from './pages/admin/PluginLogs';
import ProfileSettings from './pages/settings/ProfileSettings';
import SettingsPage from './pages/settings/SettingsPage';
import NotFound from './pages/NotFound';
import NotificationsPage from './pages/notifications/NotificationsPage';
import AgentPerformance from './pages/agents/AgentPerformance';
import StrategyEngine from './pages/strategy/StrategyEngine';
import { Outlet } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/auth",
    element: <AuthLayout><Outlet /></AuthLayout>,
    children: [
      { index: true, element: <AuthPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
    ],
  },
  {
    path: "/onboarding",
    element: <OnboardingLayout><Outlet /></OnboardingLayout>,
    children: [
      { index: true, element: <OnboardingPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainRoute />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/galaxy", element: <GalaxyPage /> },
          { path: "/launch", element: <LaunchPage /> },
          { path: "/launch/create", element: <StrategyBuilder /> },
          { path: "/launch/strategy/:id", element: <StrategyEngine /> },
          { path: "/agents/performance", element: <AgentPerformance /> },
          { path: "/plugins", element: <PluginsPage /> },
          { path: "/plugins/:id", element: <PluginDetailPage /> },
          { path: "/plugins/:id/evolution", element: <PluginEvolutionPage /> },
          { path: "/insights/kpis", element: <KpiDashboard /> },
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/settings/profile", element: <ProfileSettings /> },
        ],
      },
      {
        path: "/admin",
        element: <AdminRoute />,
        children: [
          { index: true, element: <Navigate to="/admin/users" replace /> },
          { path: "users", element: <UserManagement /> },
          { path: "system-logs", element: <SystemLogs /> },
          { path: "ai-decisions", element: <AiDecisions /> },
          { path: "plugin-logs", element: <PluginLogs /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
