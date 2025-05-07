
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, formatDistanceToNow } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, ChevronDown, Filter, RefreshCw } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTenantId } from '@/hooks/useTenantId';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

interface PluginLogType {
  id: string;
  plugin_id: string;
  plugin: { name: string };
  strategy_id: string | null;
  strategy: { title: string } | null;
  agent_version_id: string | null;
  agent_version: { version: string; plugin_id: string } | null;
  status: string;
  execution_time: number;
  xp_earned: number;
  input: any;
  output: any;
  error: string | null;
  created_at: string;
}

const PluginLogs: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const tenantId = useTenantId();

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['plugin_logs', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('plugin_logs')
        .select(`
          *,
          plugin:plugins(name),
          strategy:strategies(title),
          agent_version:agent_versions(version, plugin_id)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
        
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as PluginLogType[];
    }
  });

  // Group logs by plugin
  const groupedLogs = React.useMemo(() => {
    if (!logs) return {};
    
    return logs.reduce((acc, log) => {
      const pluginId = log.plugin_id;
      const pluginName = log.plugin?.name || 'Unknown Plugin';
      
      if (!acc[pluginId]) {
        acc[pluginId] = {
          name: pluginName,
          logs: []
        };
      }
      
      acc[pluginId].logs.push(log);
      return acc;
    }, {} as Record<string, { name: string; logs: PluginLogType[] }>);
  }, [logs]);

  // Toggle expanded state for a log
  const toggleExpanded = (logId: string) => {
    setExpandedLogs(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));

    // Log view details event
    if (!expandedLogs[logId]) {
      logSystemEvent(
        tenantId,
        'logs',
        'plugin_log_details_viewed',
        { log_id: logId }
      );
    }
  };

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Success</Badge>;
      case 'failure':
        return <Badge variant="destructive">Failure</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Convert JSON object to React element for display
  const renderJsonPreview = (json: any) => {
    if (!json) return <span className="text-gray-400">None</span>;
    
    try {
      return (
        <pre className="text-xs overflow-hidden text-ellipsis whitespace-pre-wrap max-h-20">
          {JSON.stringify(json, null, 2)}
        </pre>
      );
    } catch (e) {
      return <span className="text-red-500">Invalid JSON</span>;
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    
    // Log filter change
    logSystemEvent(
      tenantId,
      'logs',
      'plugin_logs_filtered',
      { filter: value }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Plugin Logs</h1>
      <p className="text-muted-foreground mt-2">Monitor plugin executions and errors</p>
      
      <div className="flex justify-between items-center my-6">
        <div className="flex items-center gap-3">
          <span className="text-sm">Filter by status:</span>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failure">Failure</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : logs && logs.length > 0 ? (
        <div>
          {/* Plugin Group Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(groupedLogs).map(([pluginId, pluginGroup]) => (
              <Card key={pluginId}>
                <CardHeader>
                  <CardTitle>{pluginGroup.name}</CardTitle>
                  <CardDescription>
                    {pluginGroup.logs.length} execution{pluginGroup.logs.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pluginGroup.logs.map((log) => (
                      <Collapsible 
                        key={log.id} 
                        open={expandedLogs[log.id]} 
                        onOpenChange={() => toggleExpanded(log.id)}
                        className="border rounded-md"
                      >
                        <div className="py-3 px-4 flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              {renderStatusBadge(log.status)}
                              <span className="font-medium text-sm">
                                {log.agent_version && `v${log.agent_version.version}`}
                              </span>
                              {log.strategy && (
                                <span className="text-xs text-muted-foreground">
                                  Strategy: {log.strategy.title}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">+{log.xp_earned} XP</Badge>
                            <Badge variant="secondary">{log.execution_time.toFixed(2)}s</Badge>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <ChevronDown className={`h-4 w-4 transition-transform ${expandedLogs[log.id] ? 'transform rotate-180' : ''}`} />
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                        
                        <CollapsibleContent>
                          <Separator />
                          <div className="p-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <h4 className="text-sm font-medium mb-1">Input</h4>
                                <div className="p-2 bg-muted rounded-md">
                                  {renderJsonPreview(log.input)}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Output</h4>
                                <div className="p-2 bg-muted rounded-md">
                                  {log.status === 'failure' && log.error ? (
                                    <div className="text-red-500 text-xs">{log.error}</div>
                                  ) : (
                                    renderJsonPreview(log.output)
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState 
          title="No logs found" 
          description="No plugin execution logs match your current filter criteria."
          icon={<Filter className="h-12 w-12" />}
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Refresh Logs
            </Button>
          }
        />
      )}
    </div>
  );
};

export default PluginLogs;
