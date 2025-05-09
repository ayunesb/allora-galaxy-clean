
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Gauge, TrendingUp } from 'lucide-react';

// Define time period options
const TIME_PERIODS = {
  '7d': '7 days',
  '30d': '30 days',
  '90d': '90 days',
  'all': 'All time'
};

// Custom plugin performance type
interface PluginPerformance {
  id: string;
  name: string;
  category?: string;
  xp: number;
  roi: number;
  execution_count: number;
  success_rate: number;
  avg_execution_time: number;
}

const PluginLeaderboard: React.FC = () => {
  const tenantId = useTenantId();
  const [timePeriod, setTimePeriod] = useState<string>('30d');
  const [sortMetric, setSortMetric] = useState<string>('xp');
  
  // Fetch plugin performance data
  const { data: plugins, isLoading } = useQuery({
    queryKey: ['pluginLeaderboard', tenantId, timePeriod],
    queryFn: async () => {
      if (!tenantId) return [];
      
      // Get date range based on selected period
      const getDateRange = () => {
        const now = new Date();
        
        switch (timePeriod) {
          case '7d':
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            return sevenDaysAgo.toISOString();
          case '30d':
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            return thirtyDaysAgo.toISOString();
          case '90d':
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(now.getDate() - 90);
            return ninetyDaysAgo.toISOString();
          case 'all':
          default:
            return null; // No date filtering for "all time"
        }
      };
      
      const startDate = getDateRange();
      
      // First fetch all plugins
      const { data: allPlugins, error: pluginsError } = await supabase
        .from('plugins')
        .select('id, name, category, xp, roi')
        .eq('tenant_id', tenantId);
        
      if (pluginsError) throw pluginsError;
      
      // For each plugin, get execution metrics
      const pluginsWithMetrics = await Promise.all(
        (allPlugins || []).map(async (plugin) => {
          // Build query for execution logs
          let query = supabase
            .from('plugin_logs')
            .select('status, execution_time')
            .eq('plugin_id', plugin.id);
            
          // Add date filter if needed
          if (startDate) {
            query = query.gte('created_at', startDate);
          }
          
          // Execute query
          const { data: logs, error: logsError } = await query;
          
          if (logsError) {
            console.error(`Error fetching logs for plugin ${plugin.id}:`, logsError);
            return {
              ...plugin,
              execution_count: 0,
              success_rate: 0,
              avg_execution_time: 0
            };
          }
          
          // Calculate metrics
          const executionCount = logs?.length || 0;
          const successfulExecutions = logs?.filter(log => log.status === 'success').length || 0;
          const successRate = executionCount > 0 
            ? (successfulExecutions / executionCount) * 100 
            : 0;
          
          const totalExecutionTime = logs?.reduce((sum, log) => sum + (log.execution_time || 0), 0) || 0;
          const avgExecutionTime = executionCount > 0 
            ? totalExecutionTime / executionCount 
            : 0;
          
          return {
            ...plugin,
            execution_count: executionCount,
            success_rate: successRate,
            avg_execution_time: avgExecutionTime
          };
        })
      );
      
      // Sort by the selected metric
      return pluginsWithMetrics.sort((a, b) => {
        if (sortMetric === 'success_rate') {
          return b.success_rate - a.success_rate;
        } else if (sortMetric === 'execution_count') {
          return b.execution_count - a.execution_count;
        } else if (sortMetric === 'roi') {
          return b.roi - a.roi;
        } else {
          // Default: sort by XP
          return b.xp - a.xp;
        }
      });
    },
    enabled: !!tenantId
  });
  
  // Function to get the appropriate category badge color
  const getCategoryBadgeColor = (category: string = '') => {
    switch (category.toLowerCase()) {
      case 'analytics': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-green-100 text-green-800';
      case 'content': return 'bg-purple-100 text-purple-800';
      case 'marketing': return 'bg-red-100 text-red-800';
      case 'sales': return 'bg-yellow-100 text-yellow-800';
      case 'service': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Plugin Leaderboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* XP Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gauge className="h-5 w-5 text-blue-500" />
              Total XP
            </CardTitle>
            <CardDescription>Experience points earned</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoading ? '...' : plugins?.reduce((sum, p) => sum + (p.xp || 0), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        
        {/* ROI Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Total ROI
            </CardTitle>
            <CardDescription>Return on investment</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoading ? '...' : plugins?.reduce((sum, p) => sum + (p.roi || 0), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        
        {/* Executions Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Total Executions
            </CardTitle>
            <CardDescription>Plugin runs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoading ? '...' : plugins?.reduce((sum, p) => sum + p.execution_count, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Plugin Performance</CardTitle>
          <CardDescription>
            Compare plugins based on different metrics
          </CardDescription>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIME_PERIODS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Tabs value={sortMetric} onValueChange={setSortMetric} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="xp">XP</TabsTrigger>
                <TabsTrigger value="roi">ROI</TabsTrigger>
                <TabsTrigger value="execution_count">Executions</TabsTrigger>
                <TabsTrigger value="success_rate">Success Rate</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plugin</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">XP</TableHead>
                <TableHead className="text-right">ROI</TableHead>
                <TableHead className="text-right">Executions</TableHead>
                <TableHead className="text-right">Success Rate</TableHead>
                <TableHead className="text-right">Avg Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Loading plugin data...
                  </TableCell>
                </TableRow>
              ) : plugins && plugins.length > 0 ? (
                plugins.map((plugin) => (
                  <TableRow key={plugin.id}>
                    <TableCell className="font-medium">{plugin.name}</TableCell>
                    <TableCell>
                      {plugin.category && (
                        <Badge variant="outline" className={getCategoryBadgeColor(plugin.category)}>
                          {plugin.category}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {plugin.xp.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {plugin.roi.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {plugin.execution_count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {plugin.success_rate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {plugin.avg_execution_time.toFixed(2)}ms
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No plugin data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginLeaderboard;
