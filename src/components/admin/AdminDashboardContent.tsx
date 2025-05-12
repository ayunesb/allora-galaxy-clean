
import { useState } from 'react';
import { WorkspaceOverview } from './dashboard/WorkspaceOverview';
import { UserManagementCard } from './dashboard/UserManagementCard';
import { CronJobsCard } from './dashboard/CronJobsCard';
import { useUserData } from './dashboard/useUserData';

const AdminDashboardContent = () => {
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
  );
};

export default AdminDashboardContent;
