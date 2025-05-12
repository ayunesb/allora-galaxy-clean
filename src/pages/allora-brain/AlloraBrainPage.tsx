
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import withRoleCheck from '@/lib/auth/withRoleCheck';
import { UserRole } from '@/types/user';

const AlloraBrainPage: React.FC = () => {
  const executeAction = (actionType: string) => {
    console.log(`Executing action: ${actionType}`);
    // Implementation for action execution
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Allora Brain</h1>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="control-panel">Control Panel</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Allora Brain</CardTitle>
              <CardDescription>
                AI-powered core of your business operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Allora Brain is the central AI system that powers all your automated workflows,
                strategies, and agent behavior. It continuously learns from your data and evolves
                to better serve your business goals.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <InfoCard 
                  title="87%" 
                  description="Overall System Health"
                  status="positive" 
                />
                <InfoCard 
                  title="143" 
                  description="Running Strategies"
                  status="neutral" 
                />
                <InfoCard 
                  title="16" 
                  description="Pending Actions"
                  status="warning" 
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>
                  System performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Performance metrics visualization coming soon.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Integration Status</CardTitle>
                <CardDescription>
                  Connected systems and services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Integration status dashboard coming soon.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="control-panel">
          <Card>
            <CardHeader>
              <CardTitle>Control Panel</CardTitle>
              <CardDescription>
                Manage and control Allora Brain operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ActionCard 
                  title="Sync Data" 
                  description="Synchronize data from external sources"
                  onAction={() => executeAction('sync')}
                />
                <ActionCard 
                  title="Run Analysis" 
                  description="Analyze current data and generate insights"
                  onAction={() => executeAction('analyze')}
                />
                <ActionCard 
                  title="Reset System" 
                  description="Reset system to default state"
                  onAction={() => executeAction('reset')}
                  variant="destructive"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>
                Detailed system activity logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                System logs module coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface InfoCardProps {
  title: string;
  description: string;
  status: 'positive' | 'negative' | 'neutral' | 'warning';
}

const InfoCard: React.FC<InfoCardProps> = ({ title, description, status }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      case 'warning': return 'text-amber-500';
      default: return 'text-blue-500';
    }
  };
  
  return (
    <div className="border rounded-lg p-4 text-center">
      <p className={`text-2xl font-bold ${getStatusColor()}`}>{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  onAction: () => void;
  variant?: 'default' | 'destructive';
}

const ActionCard: React.FC<ActionCardProps> = ({ 
  title, 
  description, 
  onAction,
  variant = 'default' 
}) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Button 
        onClick={onAction}
        variant={variant}
        className="w-full"
      >
        Execute
      </Button>
    </div>
  );
};

export default withRoleCheck(AlloraBrainPage, {
  roles: ['admin' as UserRole, 'user' as UserRole, 'owner' as UserRole],
  redirectTo: '/unauthorized'
});
