
import React from 'react';
import AdminDashboardContent from '@/components/admin/AdminDashboardContent';
import withRoleCheck from '@/lib/auth/withRoleCheck';

const AdminDashboard = () => {
  return <AdminDashboardContent />;
};

export default withRoleCheck(AdminDashboard, {
  roles: ['admin', 'owner'],
  redirectTo: '/unauthorized'
});
