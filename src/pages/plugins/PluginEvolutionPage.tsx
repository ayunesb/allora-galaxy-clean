
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, MessageSquare, Zap } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface AgentVersion {
  id: string;
  version: string;
  created_at: string;
  updated_at: string;
  plugin_id: string;
  status: 'active' | 'deprecated';
  upvotes: number;
  downvotes: number;
  xp: number;
}

const PluginEvolutionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agentVersions, setAgentVersions] = useState<AgentVersion[]>([]);
  const [pluginName, setPluginName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPluginData();
  }, [id]);

  const fetchPluginData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch plugin details
      const { data: pluginData, error: pluginError } = await supabase
        .from('plugins')
        .select('name')
        .eq('id', id)
        .single();

      if (pluginError) throw pluginError;
      if (pluginData) {
        setPluginName(pluginData.name);
      }

      // Fetch agent versions for this plugin
      const { data: versionData, error: versionError } = await supabase
        .from('agent_versions')
        .select('id, version, created_at, updated_at, plugin_id, status, upvotes, downvotes, xp')
        .eq('plugin_id', id)
        .order('created_at', { ascending: true });

      if (versionError) throw versionError;
      if (versionData) {
        setAgentVersions(versionData);
      }
    } catch (err: any) {
      console.error('Error fetching plugin data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Plugin Evolution</h1>
          {pluginName && (
            <p className="text-muted-foreground mt-1">
              {pluginName} <span className="text-xs">(ID: {id})</span>
            </p>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Loading plugin data...</span>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-500">Error: {error}</p>
            <p className="mt-2">Please try again later or contact support.</p>
          </CardContent>
        </Card>
      ) : agentVersions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No agent versions found</h3>
            <p className="mt-2 text-muted-foreground">
              This plugin doesn't have any agent versions yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Version Evolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {agentVersions.map((version, index) => (
                  <div key={version.id} className="relative">
                    {index !== 0 && (
                      <div className="absolute left-4 -top-4 h-4 w-0.5 bg-gray-200 dark:bg-gray-800"></div>
                    )}
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                          <span className="text-sm text-primary-foreground font-medium">{index + 1}</span>
                        </div>
                      </div>
                      <Card className="flex-grow">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-medium">Version {version.version}</span>
                              <Badge variant={version.status === 'active' ? 'default' : 'secondary'}>
                                {version.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(parseISO(version.created_at), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            <div className="flex items-center">
                              <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                              <span className="font-medium">{version.xp} XP</span>
                            </div>
                            
                            <div className="flex items-center">
                              <div className="flex items-center">
                                <div className="flex items-center mr-4">
                                  <span className="text-green-600 mr-1">👍</span>
                                  <span>{version.upvotes}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-red-600 mr-1">👎</span>
                                  <span>{version.downvotes}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Last updated: {format(parseISO(version.updated_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PluginEvolutionPage;
