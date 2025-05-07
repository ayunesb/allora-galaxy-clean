
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';

const PluginLogs: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: logs, isLoading } = useQuery({
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
        .order('created_at', { ascending: false });
        
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    }
  });

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Plugin Logs</h1>
      <p className="text-muted-foreground mt-2">Monitor plugin executions and errors</p>
      
      <div className="flex justify-between items-center my-6">
        <div className="flex items-center gap-3">
          <span className="text-sm">Filter by status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
      </div>
      
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : logs && logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="py-3 px-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">
                      {log.plugin?.name || 'Unknown Plugin'}
                      {log.agent_version && ` (v${log.agent_version.version})`}
                    </CardTitle>
                    {log.strategy && (
                      <p className="text-sm text-muted-foreground">
                        Strategy: {log.strategy.title}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {renderStatusBadge(log.status)}
                    <Badge variant="outline" className="font-mono">+{log.xp_earned} XP</Badge>
                    <Badge variant="secondary">{log.execution_time.toFixed(2)}s</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-3">
                <div className="text-sm text-muted-foreground mb-2">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </div>
                
                <Separator className="my-2" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No logs found</p>
        </div>
      )}
    </div>
  );
};

export default PluginLogs;
