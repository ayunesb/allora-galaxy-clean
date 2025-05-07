
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import AuthRoutes from './AuthRoutes';
import OnboardingRoutes from './OnboardingRoutes';
import ProtectedRoutes from './ProtectedRoutes';
import PublicRoutes from './PublicRoutes';

const AppRoutes: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { currentTenant, loading: workspaceLoading } = useWorkspace();
  const location = useLocation();

  if (authLoading || (user && workspaceLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If the user is authenticated but on the auth or root route, redirect to dashboard
  if (user && (location.pathname === '/auth' || location.pathname === '/')) {
    // If they have a workspace, go to dashboard, otherwise to onboarding
    if (currentTenant) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/onboarding" replace />;
    }
  }

  // If the user is not authenticated and not on a public route, redirect to auth
  if (!user && !location.pathname.startsWith('/auth') && 
      !location.pathname.startsWith('/terms') && 
      !location.pathname.startsWith('/privacy') &&
      !location.pathname.startsWith('/unauthorized')) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/auth/*" element={<AuthRoutes />} />
      
      {/* Onboarding routes */}
      <Route path="/onboarding/*" element={<OnboardingRoutes />} />
      
      {/* Protected routes */}
      <Route path="/*" element={<ProtectedRoutes />} />
      
      {/* Public routes */}
      <Route path="/*" element={<PublicRoutes />} />
    </Routes>
  );
};

export default AppRoutes;
