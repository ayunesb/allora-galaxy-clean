
import { WorkspaceOverview } from '@/components/admin/dashboard/WorkspaceOverview';
import { UserManagementCard } from '@/components/admin/dashboard/UserManagementCard';
import { CronJobsCard } from '@/components/admin/dashboard/CronJobsCard';
import { useUserData } from '@/components/admin/dashboard/useUserData';
import AdminLayout from '@/components/layout/AdminLayout';

const AdminDashboard = () => {
  const {
    users,
    loading,
    searchQuery,
    handleSearchChange,
    handleUpdateRole,
    handleRemoveUser
  } = useUserData();

  const handleOpenInviteDialog = () => {
    // Logic to open invite dialog
    console.log('Open invite dialog');
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <WorkspaceOverview />

          <UserManagementCard 
            users={users}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onUpdateRole={handleUpdateRole}
            onRemoveUser={handleRemoveUser}
            onOpenInviteDialog={handleOpenInviteDialog}
          />

          <CronJobsCard />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
