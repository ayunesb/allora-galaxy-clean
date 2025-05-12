import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MoreVertical, Edit, Copy, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import { SystemLog } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';

const PluginDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [plugin, setPlugin] = useState<any>(null);
  const [pluginVersions, setPluginVersions] = useState<any[]>([]);
  const [pluginLogs, setPluginLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [hasLoadedLogs, setHasLoadedLogs] = useState(false);
  const [hasLoadedVersions, setHasLoadedVersions] = useState(false);
  const [logDetail, setLogDetail] = useState<SystemLog | null>(null);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getPluginData(id);
  }, [id]);

  const getPluginData = async (id: string | undefined) => {
    if (!id) return;
    
    try {
      const { data: plugin, error } = await supabase
        .from('plugins')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      setPlugin(plugin);
      
      // Get versions
      const { data: versions, error: versionsError } = await supabase
        .from('agent_versions')
        .select('*')
        .eq('plugin_id', id)
        .order('created_at', { ascending: false });
        
      if (versionsError) throw versionsError;
      
      setPluginVersions(versions || []);
      
      // Get logs
      const { data: logs, error: logsError } = await supabase
        .from('plugin_logs')
        .select('*')
        .eq('plugin_id', id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (logsError) throw logsError;
      
      setPluginLogs(logs || []);
    } catch (error) {
      console.error('Error fetching plugin:', error);
      setError('Failed to load plugin data');
    } finally {
      setLoading(false);
    }
  };

  const loadPluginLogs = async (pluginId: string) => {
    try {
      const { data: logs, error: logsError } = await supabase
        .from('plugin_logs')
        .select('*')
        .eq('plugin_id', pluginId)
        .order('created_at', { ascending: false });
        
      if (logsError) throw logsError;
      
      setPluginLogs(logs || []);
    } catch (error) {
      console.error('Error fetching plugin logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load plugin logs',
        variant: 'destructive'
      });
    }
  };

  const loadPluginVersions = async (pluginId: string) => {
    try {
      const { data: versions, error: versionsError } = await supabase
        .from('agent_versions')
        .select('*')
        .eq('plugin_id', pluginId)
        .order('created_at', { ascending: false });
        
      if (versionsError) throw versionsError;
      
      setPluginVersions(versions || []);
    } catch (error) {
      console.error('Error fetching plugin versions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load plugin versions',
        variant: 'destructive'
      });
    }
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const id = plugin?.id;
    if (!id) return;
    
    if (newTab === 'logs' && !hasLoadedLogs) {
      loadPluginLogs(id);
      setHasLoadedLogs(true);
    } else if (newTab === 'versions' && !hasLoadedVersions) {
      loadPluginVersions(id);
      setHasLoadedVersions(true);
    }
  };

  const openLogDetail = (log: SystemLog) => {
    setLogDetail(log);
    setIsLogDialogOpen(true);
  };

  const closeLogDetail = () => {
    setIsLogDialogOpen(false);
    setLogDetail(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading plugin...
    </div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!plugin) {
    return <div>Plugin not found.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">{plugin.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Copy Plugin ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Deactivate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={plugin.icon} alt={plugin.name} />
                <AvatarFallback>{plugin.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{plugin.name}</p>
                <p className="text-sm text-muted-foreground">
                  Version {plugin.version}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-muted-foreground">{plugin.description}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Status</h3>
              <Badge variant="secondary">{plugin.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="mt-4" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                This plugin provides basic information and controls.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>Versions</CardTitle>
            </CardHeader>
            <CardContent>
              {pluginVersions.length > 0 ? (
                <ul>
                  {pluginVersions.map((version) => (
                    <li key={version.id} className="py-2">
                      {version.version} - {version.created_at}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No versions available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {pluginLogs.length > 0 ? (
                <div className="divide-y divide-border">
                  {pluginLogs.map((log) => (
                    <div key={log.id} className="py-2 cursor-pointer hover:bg-secondary" onClick={() => openLogDetail(log)}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">{log.module} - {log.event}</p>
                        <p className="text-xs text-muted-foreground">{log.created_at}</p>
                      </div>
                      {log.context?.description && (
                        <p className="text-xs text-muted-foreground">{log.context.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No logs available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <LogDetailDialog 
        log={logDetail}
        open={isLogDialogOpen}
        onOpenChange={setIsLogDialogOpen}
      />
    </div>
  );
};

export default PluginDetailPage;
