
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Sparkles, RefreshCw, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const timeframeOptions = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'All time', value: 'all' },
];

const sortOptions = [
  { label: 'XP (highest first)', value: 'xp_desc' },
  { label: 'XP (lowest first)', value: 'xp_asc' },
  { label: 'Execution count (highest)', value: 'executions_desc' },
  { label: 'Execution count (lowest)', value: 'executions_asc' },
  { label: 'Success rate (highest)', value: 'success_desc' },
  { label: 'Success rate (lowest)', value: 'success_asc' },
  { label: 'ROI (highest)', value: 'roi_desc' },
  { label: 'ROI (lowest)', value: 'roi_asc' },
];

const PluginLeaderboard: React.FC = () => {
  const tenantId = useTenantId();
  const [timeframe, setTimeframe] = useState('30d');
  const [sortBy, setSortBy] = useState('xp_desc');
  
  const { data: plugins, isLoading, refetch } = useQuery({
    queryKey: ['plugin-leaderboard', tenantId, timeframe, sortBy],
    queryFn: async () => {
      if (!tenantId) return [];

      // Calculate the start date based on selected timeframe
      let startDate = null;
      const now = new Date();
      
      if (timeframe !== 'all') {
        startDate = new Date();
        const days = parseInt(timeframe.replace('d', ''));
        startDate.setDate(now.getDate() - days);
      }
      
      // Fetch plugins with their execution stats
      const { data: plugins, error } = await supabase
        .from('plugins')
        .select('id, name, description, category, status, icon, metadata, xp, roi, created_at')
        .eq('tenant_id', tenantId);
        
      if (error) {
        console.error('Error fetching plugins:', error);
        throw error;
      }
      
      // Get execution stats for each plugin within the timeframe
      const pluginsWithStats = await Promise.all(plugins.map(async (plugin) => {
        let query = supabase
          .from('plugin_logs')
          .select('id, status, execution_time, xp_earned, created_at')
          .eq('plugin_id', plugin.id)
          .eq('tenant_id', tenantId);
          
        if (startDate) {
          query = query.gte('created_at', startDate.toISOString());
        }
        
        const { data: logs, error: logsError } = await query;
        
        if (logsError) {
          console.error(`Error fetching logs for plugin ${plugin.id}:`, logsError);
          return {
            ...plugin,
            executions: 0,
            successful: 0,
            failed: 0,
            successRate: 0,
            totalXp: plugin.xp || 0,
            averageTime: 0,
          };
        }
        
        const executions = logs?.length || 0;
        const successful = logs?.filter(log => log.status === 'success').length || 0;
        const failed = executions - successful;
        const successRate = executions > 0 ? (successful / executions) * 100 : 0;
        const totalXp = logs?.reduce((sum, log) => sum + (log.xp_earned || 0), 0) || 0;
        const totalTime = logs?.reduce((sum, log) => sum + (log.execution_time || 0), 0) || 0;
        const averageTime = executions > 0 ? totalTime / executions : 0;
        
        return {
          ...plugin,
          executions,
          successful,
          failed,
          successRate,
          totalXp: (plugin.xp || 0) + totalXp,
          averageTime,
        };
      }));
      
      // Sort based on selected option
      return pluginsWithStats.sort((a, b) => {
        const [field, direction] = sortBy.split('_');
        const isAsc = direction === 'asc';
        const multiplier = isAsc ? 1 : -1;
        
        switch (field) {
          case 'xp':
            return (a.totalXp - b.totalXp) * multiplier;
          case 'executions':
            return (a.executions - b.executions) * multiplier;
          case 'success':
            return (a.successRate - b.successRate) * multiplier;
          case 'roi':
            return ((a.roi || 0) - (b.roi || 0)) * multiplier;
          default:
            return (a.totalXp - b.totalXp) * multiplier;
        }
      });
    },
    enabled: !!tenantId,
  });
  
  const handleRefresh = () => {
    refetch();
  };
  
  return (
    <RequireAuth>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Plugin Leaderboard</h1>
            <p className="text-muted-foreground mt-2">
              Track plugin performance, execution stats, and XP across your organization
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} className="mt-4 md:mt-0">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center">
              <CardTitle>Plugin Performance Rankings</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CardDescription>
              {timeframe === 'all' ? 'All-time' : timeframeOptions.find(o => o.value === timeframe)?.label} plugin performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center space-x-4 py-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : plugins && plugins.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Rank</TableHead>
                      <TableHead>Plugin</TableHead>
                      <TableHead className="text-right">XP</TableHead>
                      <TableHead className="text-right">Executions</TableHead>
                      <TableHead className="text-right">Success Rate</TableHead>
                      <TableHead className="text-right">Avg Time</TableHead>
                      <TableHead className="text-right">ROI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plugins.map((plugin, index) => (
                      <TableRow key={plugin.id}>
                        <TableCell className="font-medium">
                          {index === 0 && <Badge className="bg-yellow-500">🏆 {index + 1}</Badge>}
                          {index === 1 && <Badge variant="outline">🥈 {index + 1}</Badge>}
                          {index === 2 && <Badge variant="outline" className="bg-amber-700/20 text-amber-800">🥉 {index + 1}</Badge>}
                          {index > 2 && <span className="text-muted-foreground">{index + 1}</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              {plugin.icon || <Sparkles className="h-5 w-5 text-muted-foreground" />}
                            </div>
                            <div>
                              <div className="font-medium">{plugin.name}</div>
                              {plugin.category && (
                                <div className="text-sm text-muted-foreground">
                                  {plugin.category}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <div className="flex items-center justify-end gap-1">
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            {plugin.totalXp.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {plugin.executions.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {plugin.successRate >= 75 ? (
                              <ArrowUp className="h-4 w-4 text-green-500" />
                            ) : plugin.successRate >= 50 ? (
                              <TrendingUp className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <ArrowDown className="h-4 w-4 text-red-500" />
                            )}
                            {plugin.successRate.toFixed(1)}%
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {plugin.averageTime.toFixed(2)}s
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            {(plugin.roi || 0).toFixed(1)}%
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No plugin data yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Plugins will appear here after they've been executed. Start using plugins to see their performance metrics on this leaderboard.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
};

export default PluginLeaderboard;
