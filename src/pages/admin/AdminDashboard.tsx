
import AdminDashboardContent from '@/components/admin/AdminDashboardContent';
import withRoleCheck from '@/lib/auth/withRoleCheck';
import { UserRole } from '@/types/user';

const AdminDashboard = () => {
  return <AdminDashboardContent />;
};

export default withRoleCheck(AdminDashboard, {
  roles: ['admin' as UserRole, 'owner' as UserRole],
  redirectTo: '/unauthorized'
});
