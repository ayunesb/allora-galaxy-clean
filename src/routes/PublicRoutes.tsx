
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import TermsPage from '@/pages/legal/TermsPage';
import PrivacyPage from '@/pages/legal/PrivacyPage';
import DeletionRequestPage from '@/pages/legal/DeletionRequestPage';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/unauthorized';

const PublicRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Legal pages */}
      <Route path="/terms" element={
        <AuthLayout>
          <TermsPage />
        </AuthLayout>
      } />
      <Route path="/privacy" element={
        <AuthLayout>
          <PrivacyPage />
        </AuthLayout>
      } />
      <Route path="/deletion-request" element={
        <AuthLayout>
          <DeletionRequestPage />
        </AuthLayout>
      } />
      
      {/* Error pages */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default PublicRoutes;
