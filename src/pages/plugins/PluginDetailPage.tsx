
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Plugin, AgentVersion, PluginLog } from '@/types/plugin';
import { format } from 'date-fns';
import { ScatterDataPoint } from '@/components/plugins/execution/ScatterPlot';
import { 
  PluginDetailsTab, 
  AgentVersionsTab, 
  PluginHeader, 
  LogsExecutionTab,
  PluginDetailError,
  PluginDetailSkeleton
} from '@/components/plugins/detail';

const PluginDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [agentVersions, setAgentVersions] = useState<AgentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executionData, setExecutionData] = useState<ScatterDataPoint[]>([]);
  
  useEffect(() => {
    const fetchPluginDetails = async () => {
      try {
        if (!id) return;
        
        const { data: pluginData, error: pluginError } = await supabase
          .from('plugins')
          .select('*')
          .eq('id', id)
          .single();
          
        if (pluginError) throw pluginError;
        
        const { data: versionData, error: versionError } = await supabase
          .from('agent_versions')
          .select('*')
          .eq('plugin_id', id)
          .order('created_at', { ascending: false });
          
        if (versionError) throw versionError;

        // Fetch execution logs for the plugin
        const { data: logData, error: logsError } = await supabase
          .from('plugin_logs')
          .select('*')
          .eq('plugin_id', id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (logsError) throw logsError;
        
        setPlugin(pluginData);
        setAgentVersions(versionData);
        
        // Transform log data into scatter plot data points
        if (logData) {
          const scatterData: ScatterDataPoint[] = logData.map((log: PluginLog) => ({
            execution_time: log.execution_time || 0,
            xp_earned: log.xp_earned || 0,
            status: log.status,
            date: log.created_at ? format(new Date(log.created_at), 'PP') : ''
          }));
          setExecutionData(scatterData);
        }
      } catch (err: any) {
        console.error('Error fetching plugin details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPluginDetails();
  }, [id]);
  
  if (loading) {
    return <PluginDetailSkeleton />;
  }
  
  if (error || !plugin) {
    return <PluginDetailError error={error} />;
  }
  
  return (
    <div className="container mx-auto py-8">
      <PluginHeader plugin={plugin} id={id || ''} />
      
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="versions">Versions ({agentVersions.length})</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <PluginDetailsTab plugin={plugin} />
        </TabsContent>
        
        <TabsContent value="versions">
          <AgentVersionsTab versions={agentVersions} />
        </TabsContent>
        
        <TabsContent value="logs">
          <LogsExecutionTab executionData={executionData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PluginDetailPage;
