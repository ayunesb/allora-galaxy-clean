
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';
import ErrorBoundary from './components/ErrorBoundary';
import AuthRoutes from './routes/AuthRoutes';
import OnboardingRoutes from './routes/OnboardingRoutes';
import PublicRoutes from './routes/PublicRoutes';
import ProtectedRoutes from './routes/ProtectedRoutes';
import Dashboard from './pages/dashboard/Dashboard';
import GalaxyPage from './pages/galaxy/GalaxyPage';
import PluginsPage from './pages/plugins/PluginsPage';
import AdminDashboard from './pages/admin';
import AiDecisions from './pages/admin/AiDecisions';
import PluginLogs from './pages/admin/PluginLogs';
import SystemLogs from './pages/admin/SystemLogs';
import UserManagement from './pages/admin/UserManagement';
import AgentPerformance from './pages/agents/AgentPerformance';
import KpiDashboard from './pages/insights/KpiDashboard';
import LaunchPage from './pages/launch/LaunchPage';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary tenant_id="system" supportEmail="support@alloraos.com">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth/*" element={<AuthRoutes />} />
              
              {/* Onboarding Routes */}
              <Route path="/onboarding/*" element={<OnboardingRoutes />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoutes />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="galaxy" element={<GalaxyPage />} />
                <Route path="plugins" element={<PluginsPage />} />
                <Route path="agents/performance" element={<AgentPerformance />} />
                <Route path="insights/kpis" element={<KpiDashboard />} />
                <Route path="launch" element={<LaunchPage />} />
                
                {/* Admin Routes */}
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/users" element={<UserManagement />} />
                <Route path="admin/plugin-logs" element={<PluginLogs />} />
                <Route path="admin/ai-decisions" element={<AiDecisions />} />
                <Route path="admin/system-logs" element={<SystemLogs />} />
              </Route>
              
              {/* Public Routes - catch any remaining routes */}
              <Route path="*" element={<PublicRoutes />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
