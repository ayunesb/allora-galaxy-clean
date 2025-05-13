
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Plugin } from '@/types/plugin';
import { Skeleton } from '@/components/ui/skeleton';

interface PluginEvolutionTabProps {
  onPluginSelect?: (pluginId: string | undefined) => void;
}

const PluginEvolutionTab: React.FC<PluginEvolutionTabProps> = ({ onPluginSelect }) => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedPluginId, setSelectedPluginId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlugins = async () => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('plugins')
          .select('*')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        setPlugins(data || []);
      } catch (error) {
        console.error('Error fetching plugins:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlugins();
  }, []);

  const handlePluginChange = (pluginId: string) => {
    setSelectedPluginId(pluginId);
    if (onPluginSelect) {
      onPluginSelect(pluginId);
    }
  };

  const clearSelection = () => {
    setSelectedPluginId(undefined);
    if (onPluginSelect) {
      onPluginSelect(undefined);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-8 w-64" /></CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Plugin Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Select
              value={selectedPluginId}
              onValueChange={handlePluginChange}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a plugin" />
              </SelectTrigger>
              <SelectContent>
                {plugins.map(plugin => (
                  <SelectItem key={plugin.id} value={plugin.id}>
                    {plugin.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedPluginId && (
              <Button variant="outline" onClick={clearSelection}>
                Clear selection
              </Button>
            )}
          </div>

          {selectedPluginId ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Evolution history for {plugins.find(p => p.id === selectedPluginId)?.name}
              </h3>
              {/* Plugin evolution details would be shown here */}
              <p>Showing evolution history and metrics for the selected plugin</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Select a plugin to view its evolution history</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginEvolutionTab;
