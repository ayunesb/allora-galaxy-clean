
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { OnboardingLayout } from '@/layouts/OnboardingLayout';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from '@/pages/auth';
import { DashboardPage } from '@/pages/dashboard';
import { AiDecisions, PluginLogs, SystemLogs, UserManagement, ApiKeysPage } from '@/pages/admin';
import { LaunchPage, StrategyBuilder } from '@/pages/launch';
import GalaxyPage from '@/pages/galaxy/GalaxyPage';
import PluginDetailPage from '@/pages/plugins/PluginDetailPage';
import PluginsPage from '@/pages/plugins/PluginsPage';
import PluginEvolutionPage from '@/pages/plugins/PluginEvolutionPage';
import Unauthorized from '@/pages/unauthorized';
import { NotFound } from '@/pages/NotFound';
import { SettingsPage } from '@/pages/settings';
import { KpiDashboard } from '@/pages/insights';
import { DeletionRequestPage, PrivacyPage, TermsPage } from '@/pages/legal';
import { OnboardingWizard } from '@/pages/onboarding';
import NotificationsPage from '@/pages/notifications/NotificationsPage';
import { AlloraBrainPage } from '@/pages/allora-brain/AlloraBrainPage';
import { AlloraBrainDocsPage } from '@/pages/allora-brain/AlloraBrainDocsPage';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/legal/terms" element={<TermsPage />} />
      <Route path="/legal/privacy" element={<PrivacyPage />} />
      <Route path="/legal/deletion-request" element={<DeletionRequestPage />} />
      
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      </Route>
      
      {/* Onboarding Routes */}
      <Route element={<OnboardingLayout />}>
        <Route path="/onboarding" element={
          <RequireAuth>
            <OnboardingWizard />
          </RequireAuth>
        } />
      </Route>
      
      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        } />
        <Route path="/dashboard" element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        } />
        <Route path="/galaxy" element={
          <RequireAuth>
            <GalaxyPage />
          </RequireAuth>
        } />
        <Route path="/launch" element={
          <RequireAuth>
            <LaunchPage />
          </RequireAuth>
        } />
        <Route path="/launch/new" element={
          <RequireAuth>
            <StrategyBuilder />
          </RequireAuth>
        } />
        <Route path="/plugins" element={
          <RequireAuth>
            <PluginsPage />
          </RequireAuth>
        } />
        <Route path="/plugins/:id" element={
          <RequireAuth>
            <PluginDetailPage />
          </RequireAuth>
        } />
        <Route path="/plugins/:id/evolution" element={
          <RequireAuth>
            <PluginEvolutionPage />
          </RequireAuth>
        } />
        <Route path="/admin/ai-decisions" element={
          <RequireAuth>
            <AiDecisions />
          </RequireAuth>
        } />
        <Route path="/admin/plugin-logs" element={
          <RequireAuth>
            <PluginLogs />
          </RequireAuth>
        } />
        <Route path="/admin/system-logs" element={
          <RequireAuth>
            <SystemLogs />
          </RequireAuth>
        } />
        <Route path="/admin/users" element={
          <RequireAuth>
            <UserManagement />
          </RequireAuth>
        } />
        <Route path="/admin/api-keys" element={
          <RequireAuth>
            <ApiKeysPage />
          </RequireAuth>
        } />
        <Route path="/settings" element={
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        } />
        <Route path="/insights/kpis" element={
          <RequireAuth>
            <KpiDashboard />
          </RequireAuth>
        } />
        <Route path="/notifications" element={
          <RequireAuth>
            <NotificationsPage />
          </RequireAuth>
        } />
        <Route path="/allora-brain" element={
          <RequireAuth>
            <AlloraBrainPage />
          </RequireAuth>
        } />
        <Route path="/allora-brain/docs" element={
          <RequireAuth>
            <AlloraBrainDocsPage />
          </RequireAuth>
        } />
      </Route>
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
