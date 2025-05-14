
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthRoutes from './AuthRoutes';
import ProtectedRoutes from './ProtectedRoutes';
import PublicRoutes from './PublicRoutes';
import OnboardingRoutes from './OnboardingRoutes';
import NotFound from '@/pages/NotFound';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorStateExamplesPage from '@/pages/examples/ErrorStateExamplesPage';

// Lazy load the error examples page
const LazyErrorExamples = lazy(() => import('@/pages/examples/ErrorStateExamplesPage'));

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Auth routes (login, register, etc.) */}
      <Route path="/*" element={<AuthRoutes />} />
      
      {/* Protected routes (require authentication) */}
      <Route path="/*" element={<ProtectedRoutes />} />
      
      {/* Public routes */}
      <Route path="/*" element={<PublicRoutes />} />
      
      {/* Onboarding routes */}
      <Route path="/onboarding/*" element={<OnboardingRoutes />} />
      
      {/* Error state examples page */}
      <Route 
        path="/examples/error-states" 
        element={
          <Suspense fallback={<LoadingScreen />}>
            <LazyErrorExamples />
          </Suspense>
        } 
      />
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
