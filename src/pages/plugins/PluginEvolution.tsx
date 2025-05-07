
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, CloudOff, BarChart2, LineChart as LineChartIcon, Table2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import PageHelmet from '@/components/PageHelmet';
import { useTenantId } from '@/hooks/useTenantId';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Import our new component tabs
import XpHistoryTab from './components/XpHistoryTab';
import RoiExecutionTab from './components/RoiExecutionTab';
import ExecutionsTab from './components/ExecutionsTab';
import AgentVersionsTab from './components/AgentVersionsTab';

const PluginEvolution = () => {
  const { id: pluginId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('xp-history');
  const { toast } = useToast();
  const navigate = useNavigate();
  const tenantId = useTenantId();

  // Fetch plugin details
  const { data: plugin, isLoading: loadingPlugin } = useQuery({
    queryKey: ['plugin', pluginId],
    queryFn: async () => {
      if (!pluginId) return null;
      
      const { data, error } = await supabase
        .from('plugins')
        .select('*')
        .eq('id', pluginId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!pluginId
  });

  // Fetch plugin logs
  const { data: pluginLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ['plugin_logs', pluginId],
    queryFn: async () => {
      if (!pluginId) return [];
      
      const { data, error } = await supabase
        .from('plugin_logs')
        .select('*, strategy:strategies(title)')
        .eq('plugin_id', pluginId)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!pluginId
  });

  // Fetch agent versions
  const { data: agentVersions, isLoading: loadingAgents } = useQuery({
    queryKey: ['agent_versions', pluginId],
    queryFn: async () => {
      if (!pluginId) return [];
      
      const { data, error } = await supabase
        .from('agent_versions')
        .select('*')
        .eq('plugin_id', pluginId)
        .order('version', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!pluginId
  });

  // Prepare data for XP history chart
  const xpHistoryData = React.useMemo(() => {
    if (!pluginLogs) return [];
    
    // Group logs by date and sum XP
    const xpByDate: Record<string, { date: string; xp: number; count: number }> = {};
    
    pluginLogs.forEach(log => {
      const date = log.created_at.split('T')[0];
      if (!xpByDate[date]) {
        xpByDate[date] = { date, xp: 0, count: 0 };
      }
      xpByDate[date].xp += log.xp_earned || 0;
      xpByDate[date].count += 1;
    });
    
    return Object.values(xpByDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [pluginLogs]);

  // Prepare data for ROI vs Execution Time scatter chart
  const scatterData = React.useMemo(() => {
    if (!pluginLogs) return [];
    
    return pluginLogs.map(log => ({
      execution_time: log.execution_time,
      xp_earned: log.xp_earned,
      status: log.status,
      date: format(new Date(log.created_at), 'PP')
    }));
  }, [pluginLogs]);

  // Flag an agent version for review
  const flagForReview = async (agentVersionId: string) => {
    try {
      await logSystemEvent(
        tenantId,
        'agent',
        'agent_version_flagged_for_review',
        { agent_version_id: agentVersionId, plugin_id: pluginId }
      );
      
      toast({
        title: 'Agent Version Flagged',
        description: 'This agent version has been flagged for human review.',
      });
    } catch (error: any) {
      console.error('Error flagging agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to flag agent version for review.',
        variant: 'destructive',
      });
    }
  };

  // Handle tab change and log the event
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    logSystemEvent(
      tenantId,
      'plugin',
      'evolution_tab_changed',
      { plugin_id: pluginId, tab: value }
    );
  };

  if (loadingPlugin || loadingLogs || loadingAgents) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!plugin) {
    return (
      <EmptyState
        title="Plugin not found"
        description="The requested plugin could not be found"
        icon={<CloudOff className="h-12 w-12" />}
        action={
          <Button onClick={() => navigate('/plugins')}>
            Back to Plugins
          </Button>
        }
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHelmet
        title={`${plugin.name} Evolution`}
        description={`View the evolution history for the ${plugin.name} plugin`}
      />
      
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/plugins')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{plugin.name} Evolution</h1>
          <p className="text-muted-foreground">{plugin.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Plugin Performance</CardTitle>
              <CardDescription>Evolution history and performance metrics</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{plugin.status}</Badge>
              <Badge variant="outline" className="font-mono">{plugin.xp} XP</Badge>
              <Badge variant="outline" className="font-mono">{plugin.roi}% ROI</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="xp-history" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <span>XP History</span>
              </TabsTrigger>
              <TabsTrigger value="roi-exec" className="flex items-center gap-2">
                <LineChartIcon className="h-4 w-4" />
                <span>ROI vs Execution Time</span>
              </TabsTrigger>
              <TabsTrigger value="executions" className="flex items-center gap-2">
                <LineChartIcon className="h-4 w-4" />
                <span>Recent Executions</span>
              </TabsTrigger>
              <TabsTrigger value="versions" className="flex items-center gap-2">
                <Table2 className="h-4 w-4" />
                <span>Agent Versions</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="xp-history">
              <XpHistoryTab xpHistoryData={xpHistoryData} />
            </TabsContent>

            <TabsContent value="roi-exec">
              <RoiExecutionTab scatterData={scatterData} />
            </TabsContent>

            <TabsContent value="executions">
              <ExecutionsTab pluginLogs={pluginLogs || []} />
            </TabsContent>

            <TabsContent value="versions">
              <AgentVersionsTab 
                agentVersions={agentVersions || []} 
                pluginId={pluginId || ''} 
                flagForReview={flagForReview}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginEvolution;
