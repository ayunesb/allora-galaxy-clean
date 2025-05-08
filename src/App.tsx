
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { Toaster } from './components/ui/toaster';
import ErrorBoundary from './components/ErrorBoundary';
import AuthRoutes from './routes/AuthRoutes';
import OnboardingRoutes from './routes/OnboardingRoutes';
import PublicRoutes from './routes/PublicRoutes';
import ProtectedRoutes from './routes/ProtectedRoutes';
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
            <WorkspaceProvider>
              <NotificationsProvider>
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/auth/*" element={<AuthRoutes />} />
                  
                  {/* Onboarding Routes */}
                  <Route path="/onboarding/*" element={<OnboardingRoutes />} />
                  
                  {/* Protected Routes */}
                  <Route path="/*" element={<ProtectedRoutes />} />
                  
                  {/* Public Routes - catch any remaining routes */}
                  <Route path="*" element={<PublicRoutes />} />
                </Routes>
                <Toaster />
              </NotificationsProvider>
            </WorkspaceProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
