
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, AlertCircle, Sparkle } from 'lucide-react';
import PageHelmet from '@/components/PageHelmet';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tenant } = useWorkspace();
  const { toast } = useToast();

  const adminModules = [
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: <Users className="h-6 w-6" />,
      path: '/admin/users'
    },
    {
      id: 'plugin-logs',
      title: 'Plugin Logs',
      description: 'View plugin execution logs and performance',
      icon: <FileText className="h-6 w-6" />,
      path: '/admin/plugin-logs'
    },
    {
      id: 'ai-decisions',
      title: 'AI Decisions',
      description: 'Review AI decision history and insights',
      icon: <Sparkle className="h-6 w-6" />,
      path: '/admin/ai-decisions'
    },
    {
      id: 'system-logs',
      title: 'System Logs',
      description: 'Monitor system events and errors',
      icon: <AlertCircle className="h-6 w-6" />,
      path: '/admin/system-logs'
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <PageHelmet
        title="Admin Dashboard"
        description="Allora OS - Administration Dashboard"
      />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your workspace, users, and system settings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {adminModules.map((module) => (
            <Card key={module.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="bg-primary/10 p-2 rounded-md">
                    {module.icon}
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 h-10">
                  {module.description}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => handleNavigate(module.path)}
                  className="w-full"
                >
                  Access
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
