import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage'; // Ensure this path matches your alias setup
import { Toaster } from '@/components/ui/sonner';
import { RequireAuth } from './components/auth/RequireAuth';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import OnboardingLayout from './layouts/OnboardingLayout';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import SystemLogs from './pages/admin/SystemLogs';
import AiDecisions from './pages/admin/AiDecisions';
import ApiKeysPage from './pages/admin/ApiKeysPage';
import CronJobsPage from './pages/admin/CronJobsPage';
import NotificationsPage from './pages/NotificationsPage';
import CookieConsent from './components/CookieConsent';
import { Providers } from './providers';
import EvolutionPage from './pages/evolution';

function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            <Route path="notifications" element={
              <RequireAuth>
                <NotificationsPage />
              </RequireAuth>
            } />
            
            {/* Evolution Routes */}
            <Route path="evolution" element={
              <RequireAuth>
                <EvolutionPage />
              </RequireAuth>
            } />
          </Route>
          
          {/* Auth Routes */}
          <Route path="auth/*" element={<AuthLayout children={undefined} />} />
          
          {/* Onboarding Routes */}
          <Route path="onboarding/*" element={
            <RequireAuth>
              <OnboardingLayout children={undefined} />
            </RequireAuth>
          } />
          
          {/* Admin Routes */}
          <Route path="admin" element={
            <RequireAuth roles={['admin', 'owner']}>
              <MainLayout />
            </RequireAuth>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="logs" element={<SystemLogs />} />
            <Route path="ai-decisions" element={<AiDecisions />} />
            <Route path="api-keys" element={<ApiKeysPage />} />
            <Route path="cron-jobs" element={<CronJobsPage />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <Toaster />
        <CookieConsent />
      </BrowserRouter>
    </Providers>
  );
}

export default App;
