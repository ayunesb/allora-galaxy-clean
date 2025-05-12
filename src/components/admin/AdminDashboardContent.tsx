import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CronJobsMonitoring from './cron/CronJobsMonitoring';
import UserTable from './users/UserTable';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const AdminDashboardContent = () => {
  const { currentWorkspace } = useWorkspace();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Workspace Overview</CardTitle>
            <CardDescription>
              Details about the current workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentWorkspace ? (
              <>
                <p>Name: {currentWorkspace.name}</p>
                <p>ID: {currentWorkspace.id}</p>
                <p>Description: {currentWorkspace.description}</p>
              </>
            ) : (
              <p>No workspace selected.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage users and their roles within the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserTable />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cron Jobs Monitoring</CardTitle>
            <CardDescription>
              Monitor the status and history of scheduled tasks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CronJobsMonitoring />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardContent;
