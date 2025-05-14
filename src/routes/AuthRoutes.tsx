
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AuthPage from '@/pages/auth/AuthPage';
import AuthLayout from '@/components/layout/AuthLayout';

const AuthRoutes: React.FC = () => {
  return (
    <AuthLayout>
      <Routes>
        <Route path="/*" element={<AuthPage />} />
      </Routes>
    </AuthLayout>
  );
};

export default AuthRoutes;
