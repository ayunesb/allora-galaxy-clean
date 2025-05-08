
import React from 'react';
import { useRoleCheck } from '@/lib/auth/useRoleCheck';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { hasAccess, loading: checking } = useRoleCheck({ requiredRoles: ['admin', 'owner'] });
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentPath = location.pathname.split('/').pop() || '';
  
  const handleTabChange = (value: string) => {
    navigate(`/admin/${value}`);
  };
  
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!hasAccess) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You must be an admin or owner to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Administration</h1>
      
      <Tabs 
        defaultValue={currentPath} 
        value={currentPath}
        onValueChange={handleTabChange}
        className="mb-8"
      >
        <TabsList className="grid grid-cols-4 sm:grid-cols-5 md:w-[600px]">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="plugin-logs">Plugin Logs</TabsTrigger>
          <TabsTrigger value="system-logs">System Logs</TabsTrigger>
          <TabsTrigger value="ai-decisions">AI Decisions</TabsTrigger>
          <TabsTrigger value="settings" className="hidden sm:block">Settings</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {children}
    </div>
  );
};

export default AdminLayout;
