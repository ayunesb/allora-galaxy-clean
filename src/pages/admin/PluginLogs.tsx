import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Filter, RefreshCw, Search, Tag, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenantId } from '@/hooks/useTenantId';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { LogStatus } from '@/types/shared';

// Define internal status type that includes all possible values from the database
type PluginLogStatus = 'success' | 'failure' | 'warning' | 'info' | 'error' | 'pending' | 'running';

interface PluginLog {
  id: string;
  plugin_id?: string;
  strategy_id?: string;
  tenant_id?: string;
  agent_version_id?: string;
  status: PluginLogStatus;
  input?: any;
  output?: any;
  error?: string;
  created_at?: string;
  execution_time?: number;
  xp_earned?: number;
  plugin_name?: string;
  strategy_title?: string;
}

const getStatusBadge = (status: PluginLogStatus) => {
  switch (status) {
    case 'success':
      return <Badge variant="success">Success</Badge>;
    case 'failure':
      return <Badge variant="destructive">Failure</Badge>;
    case 'error':
      return <Badge variant="destructive">Error</Badge>;
    case 'pending':
      return <Badge variant="outline">Pending</Badge>;
    case 'running':
      return <Badge variant="outline">Running</Badge>;
    case 'warning':
      return <Badge variant="secondary">Warning</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
const PluginLogs: React.FC = () => {
  const [logs, setLogs] = useState<PluginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PluginLogStatus | ''>('');
  const [pluginFilter, setPluginFilter] = useState('');
  const [strategyFilter, setStrategyFilter] = useState('');
  const [availablePlugins, setAvailablePlugins] = useState<string[]>([]);
  const [availableStrategies, setAvailableStrategies] = useState<string[]>([]);
  const { toast } = useToast();
  const { tenantId } = useTenantId();

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!tenantId) {
        throw new Error('No tenant selected');
      }

      let query = supabase
        .from('plugin_logs')
        .select(
          `
          id, plugin_id, strategy_id, tenant_id, agent_version_id, status, input, output, error, created_at, execution_time, xp_earned,
          plugins (name),
          strategies (title)
        `
        )
        .eq('tenant_id', tenantId);

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const pluginLogs: PluginLog[] = data.map((log: any) => ({
        id: log.id,
        plugin_id: log.plugin_id,
        strategy_id: log.strategy_id,
        tenant_id: log.tenant_id,
        agent_version_id: log.agent_version_id,
        status: log.status,
        input: log.input,
        output: log.output,
        error: log.error,
        created_at: log.created_at,
        execution_time: log.execution_time,
        xp_earned: log.xp_earned,
        plugin_name: log.plugins?.name,
        strategy_title: log.strategies?.title,
      }));

      setLogs(pluginLogs);

      // Extract available plugins and strategies
      const plugins = [...new Set(pluginLogs.map((log) => log.plugin_name).filter(Boolean))];
      const strategies = [...new Set(pluginLogs.map((log) => log.strategy_title).filter(Boolean))];

      setAvailablePlugins(plugins);
      setAvailableStrategies(strategies);
    } catch (err: any) {
      console.error('Error loading plugin logs:', err);
      setError(err.message);
      toast({
        title: 'Error loading plugin logs',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      loadLogs();
    }
  }, [tenantId, statusFilter]);

  const filteredLogs = logs.filter((log) => {
    const searchMatch =
      (log.plugin_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (log.strategy_title?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const pluginMatch = !pluginFilter || log.plugin_name === pluginFilter;
    const strategyMatch = !strategyFilter || log.strategy_title === strategyFilter;

    return searchMatch && pluginMatch && strategyMatch;
  });

  const formatDate = (dateString: string) => {
    return dateString ? format(new Date(dateString), 'MMM dd, yyyy HH:mm') : 'N/A';
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <CardTitle>Plugin Logs</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="w-full sm:w-auto flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by plugin or strategy..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Button variant="outline" size="sm" onClick={() => {}}>
                  Filters
                </Button>
              </div>
            </div>

            <Button variant="outline" onClick={loadLogs}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <select
                className="w-full sm:w-[180px] px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PluginLogStatus)}
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="error">Error</option>
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="warning">Warning</option>
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <select
                className="w-full sm:w-[180px] px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={pluginFilter}
                onChange={(e) => setPluginFilter(e.target.value)}
              >
                <option value="">All Plugins</option>
                {availablePlugins.map((plugin) => (
                  <option key={plugin} value={plugin}>
                    {plugin}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <select
                className="w-full sm:w-[180px] px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={strategyFilter}
                onChange={(e) => setStrategyFilter(e.target.value)}
              >
                <option value="">All Strategies</option>
                {availableStrategies.map((strategy) => (
                  <option key={strategy} value={strategy}>
                    {strategy}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPluginFilter('');
                setStrategyFilter('');
              }}
            >
              Clear filters
            </Button>
          </div>

          {error && (
            <div className="rounded-md bg-red-100 p-4 text-red-500 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plugin</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Execution Time</TableHead>
                  <TableHead className="text-right">XP Earned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                      </div>
                      <p className="mt-2 text-gray-500">Loading logs...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span>{log.plugin_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{log.strategy_title || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>{formatDate(log.created_at || '')}</TableCell>
                      <TableCell className="text-right">{log.execution_time?.toFixed(2) || 'N/A'}s</TableCell>
                      <TableCell className="text-right">{log.xp_earned || 0}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-gray-500">No logs found</p>
                      {(searchTerm || statusFilter || pluginFilter || strategyFilter) && (
                        <p className="text-sm text-gray-400 mt-1">Try clearing your filters</p>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginLogs;
