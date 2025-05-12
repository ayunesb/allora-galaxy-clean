
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import withRoleCheck from '@/lib/auth/withRoleCheck';

const AlloraBrainPage: React.FC = () => {
  const { toast } = useToast();
  
  const handleAction = () => {
    toast({
      title: "Coming Soon",
      description: "Allora Brain features are currently under development.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Allora Brain</h1>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Allora Brain Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Allora Brain is the central intelligence system powering your automated marketing strategy.
                This feature is under active development.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Brain Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configure your Allora Brain settings here. (Coming Soon)
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plugins">
          <Card>
            <CardHeader>
              <CardTitle>Brain Plugins</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Extend your Allora Brain with powerful plugins. (Coming Soon)
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withRoleCheck(AlloraBrainPage, {
  roles: ['admin', 'user', 'owner'],
  redirectTo: '/unauthorized'
});
