
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AsyncDataRenderer } from '@/components/ui/async-data-renderer';

interface PluginEvolutionTabProps {
  pluginId?: string;
}

const PluginEvolutionTab: React.FC<PluginEvolutionTabProps> = ({ pluginId = 'default' }) => {
  const [selectedPluginId, setSelectedPluginId] = useState<string>(pluginId);

  const { data: plugins, isLoading: loadingPlugins, error: pluginsError, refetch: refetchPlugins } = useQuery({
    queryKey: ['plugins-for-evolution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plugins')
        .select('id, name, status, category')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
  });

  const { data: pluginVersions, isLoading: loadingVersions, error: versionsError, refetch: refetchVersions } = useQuery({
    queryKey: ['plugin-versions', selectedPluginId],
    queryFn: async () => {
      if (!selectedPluginId || selectedPluginId === 'default') return [];
      
      const { data, error } = await supabase
        .from('plugin_versions')
        .select('*')
        .eq('plugin_id', selectedPluginId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPluginId && selectedPluginId !== 'default',
  });

  // Helper to render status badges
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'deprecated':
        return <Badge variant="destructive">Deprecated</Badge>;
      case 'beta':
        return <Badge variant="warning">Beta</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Plugin Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedPluginId} 
            onValueChange={setSelectedPluginId}
            disabled={loadingPlugins}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a plugin" />
            </SelectTrigger>
            <SelectContent>
              {plugins?.map((plugin) => (
                <SelectItem key={plugin.id} value={plugin.id}>
                  {plugin.name} {renderStatusBadge(plugin.status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {(pluginsError || versionsError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load plugin evolution data: {pluginsError?.message || versionsError?.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="plugins" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plugins">Plugin Details</TabsTrigger>
          <TabsTrigger value="versions">Version History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plugins">
          <AsyncDataRenderer 
            data={plugins}
            isLoading={loadingPlugins}
            error={pluginsError}
            onRetry={refetchPlugins}
          >
            {(pluginsData) => (
              <div className="grid gap-4">
                {pluginsData.map((plugin) => (
                  <Card key={plugin.id}>
                    <CardHeader>
                      <CardTitle>{plugin.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div>Status: {renderStatusBadge(plugin.status)}</div>
                        <div>Category: {plugin.category || 'Uncategorized'}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </AsyncDataRenderer>
        </TabsContent>
        
        <TabsContent value="versions">
          <AsyncDataRenderer 
            data={pluginVersions}
            isLoading={loadingVersions}
            error={versionsError}
            onRetry={refetchVersions}
          >
            {(versionsData) => (
              <div className="space-y-4">
                {versionsData.map((version) => (
                  <Card key={version.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Version {version.version_number}</CardTitle>
                        {version.is_current && (
                          <Badge variant="default">Current</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div>Created: {new Date(version.created_at).toLocaleString()}</div>
                        <div>Author: {version.created_by || 'System'}</div>
                        {version.notes && (
                          <div>
                            <h4 className="font-medium">Release Notes:</h4>
                            <p className="text-sm text-muted-foreground mt-1">{version.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </AsyncDataRenderer>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PluginEvolutionTab;
