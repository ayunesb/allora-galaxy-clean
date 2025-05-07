
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';

// Main pages
import Dashboard from '@/pages/dashboard/Dashboard';
import StrategyEngine from '@/pages/strategy/StrategyEngine';
import StrategyBuilder from '@/pages/launch/StrategyBuilder';
import PluginsPage from '@/pages/plugins/PluginsPage';
import PluginEvolutionPage from '@/pages/plugins/PluginEvolutionPage';
import GalaxyExplorer from '@/pages/galaxy/GalaxyExplorer';
import AgentPerformance from '@/pages/agents/AgentPerformance';
import KpiDashboard from '@/pages/insights/KpiDashboard';
import SettingsPage from '@/pages/settings/SettingsPage';
import DeletionRequestPage from '@/pages/legal/DeletionRequestPage';

// Admin pages
import AiDecisions from '@/pages/admin/AiDecisions';
import PluginLogs from '@/pages/admin/PluginLogs';
import SystemLogs from '@/pages/admin/SystemLogs';
import UserManagement from '@/pages/admin/UserManagement';
import DeletionRequestsPage from '@/pages/admin/DeletionRequestsPage';

const ProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        } />
        <Route path="/launch" element={
          <MainLayout>
            <StrategyEngine />
          </MainLayout>
        } />
        <Route path="/launch/builder" element={
          <MainLayout>
            <StrategyBuilder />
          </MainLayout>
        } />
        <Route path="/plugins" element={
          <MainLayout>
            <PluginsPage />
          </MainLayout>
        } />
        <Route path="/plugins/:id/evolution" element={
          <MainLayout>
            <PluginEvolutionPage />
          </MainLayout>
        } />
        <Route path="/explore" element={
          <MainLayout>
            <GalaxyExplorer />
          </MainLayout>
        } />
        <Route path="/agents/performance" element={
          <MainLayout>
            <AgentPerformance />
          </MainLayout>
        } />
        <Route path="/insights/kpis" element={
          <MainLayout>
            <KpiDashboard />
          </MainLayout>
        } />
        <Route path="/settings" element={
          <MainLayout>
            <SettingsPage />
          </MainLayout>
        } />
        <Route path="/deletion-request" element={
          <MainLayout>
            <DeletionRequestPage />
          </MainLayout>
        } />
        
        {/* Admin routes */}
        <Route path="/admin/ai-decisions" element={
          <MainLayout>
            <AiDecisions />
          </MainLayout>
        } />
        <Route path="/admin/plugin-logs" element={
          <MainLayout>
            <PluginLogs />
          </MainLayout>
        } />
        <Route path="/admin/system-logs" element={
          <MainLayout>
            <SystemLogs />
          </MainLayout>
        } />
        <Route path="/admin/users" element={
          <MainLayout>
            <UserManagement />
          </MainLayout>
        } />
        <Route path="/admin/deletion-requests" element={
          <MainLayout>
            <DeletionRequestsPage />
          </MainLayout>
        } />
      </Route>
    </Routes>
  );
};

export default ProtectedRoutes;
