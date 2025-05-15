
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AsyncDataRenderer } from '@/components/ui/async-data-renderer';
import { calculatePerformance } from '@/lib/agents/evolution/calculatePerformance';
import AgentPerformanceMetrics from '@/components/agent/evolution/AgentPerformanceMetrics';
import AgentEvolutionChart from '@/components/agent/evolution/AgentEvolutionChart';

interface PluginEvolutionTabProps {
  initialPluginId?: string;
}

const PluginEvolutionTab: React.FC<PluginEvolutionTabProps> = ({ initialPluginId }) => {
  const [selectedPluginId, setSelectedPluginId] = useState<string>(initialPluginId || '');

  // Fetch available plugins
  const pluginsQuery = useQuery({
    queryKey: ['plugins-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plugins')
        .select('id, name, status, category')
        .order('name');
        
      if (error) throw error;
      return data;
    },
  });

  // Fetch agent versions for the selected plugin
  const agentVersionsQuery = useQuery({
    queryKey: ['agent-versions', selectedPluginId],
    queryFn: async () => {
      if (!selectedPluginId) return [];
      
      const { data, error } = await supabase
        .from('agent_versions')
        .select('*')
        .eq('plugin_id', selectedPluginId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Calculate performance metrics for each version
      const versionsWithPerformance = await Promise.all(
        data.map(async (version) => {
          try {
            const performance = await calculatePerformance(version.id);
            return {
              ...version,
              performance,
            };
          } catch (e) {
            console.error(`Failed to calculate performance for version ${version.id}:`, e);
            return version;
          }
        })
      );
      
      return versionsWithPerformance;
    },
    enabled: !!selectedPluginId
  });
  
  // Extract the evolution history for charting
  const evolutionHistory = agentVersionsQuery.data?.map(version => ({
    id: version.id,
    version: version.version,
    createdAt: version.created_at,
    performance: version.performance,
  })) || [];

  // Get the active version for detailed metrics
  const activeVersion = agentVersionsQuery.data?.find(v => v.status === 'active');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plugin Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Select 
              value={selectedPluginId} 
              onValueChange={setSelectedPluginId}
              disabled={pluginsQuery.isLoading}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select a plugin" />
              </SelectTrigger>
              <SelectContent>
                <AsyncDataRenderer
                  data={pluginsQuery.data}
                  isLoading={pluginsQuery.isLoading}
                  error={pluginsQuery.error instanceof Error ? pluginsQuery.error : null}
                  onRetry={() => pluginsQuery.refetch()}
                  renderData={(plugins) => (
                    <>
                      {plugins.map((plugin) => (
                        <SelectItem key={plugin.id} value={plugin.id}>
                          {plugin.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                />
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedPluginId && (
        <AsyncDataRenderer
          data={agentVersionsQuery.data}
          isLoading={agentVersionsQuery.isLoading}
          error={agentVersionsQuery.error instanceof Error ? agentVersionsQuery.error : null}
          onRetry={() => agentVersionsQuery.refetch()}
          renderData={(versions) => (
            <div className="space-y-6">
              {versions.length === 0 ? (
                <Card className="p-6 text-center">
                  <p>No agent versions found for this plugin.</p>
                </Card>
              ) : (
                <>
                  {activeVersion?.performance && (
                    <AgentPerformanceMetrics 
                      metrics={activeVersion.performance} 
                    />
                  )}
                  
                  {evolutionHistory.length > 1 && (
                    <AgentEvolutionChart history={evolutionHistory} />
                  )}
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Agent Version History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {versions.map(version => (
                          <div 
                            key={version.id} 
                            className="p-4 border rounded-md flex flex-col md:flex-row justify-between gap-4"
                          >
                            <div>
                              <h3 className="font-medium">Version {version.version}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(version.created_at).toLocaleDateString()} 
                                {version.status === 'active' && (
                                  <span className="ml-2 text-green-500 font-medium">• Active</span>
                                )}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(`/agents/versions/${version.id}`, '_blank')}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        />
      )}
    </div>
  );
};

export default PluginEvolutionTab;
