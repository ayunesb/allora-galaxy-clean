import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';

const ProtectedRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }
  
  // If no user is signed in, redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Otherwise, render the protected routes within the layout
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default ProtectedRoutes;
