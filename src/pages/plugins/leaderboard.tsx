
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Award, TrendingUp } from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  xp: number;
  roi: number;
  category: string;
  execution_count?: number;
  success_rate?: number;
}

const PluginsLeaderboard: React.FC = () => {
  const tenantId = useTenantId();
  const [metric, setMetric] = React.useState<'xp' | 'roi'>('xp');

  // Fetch plugins data
  const { data: plugins, isLoading } = useQuery({
    queryKey: ['plugins-leaderboard', tenantId, metric],
    queryFn: async () => {
      if (!tenantId) return [];

      // Get plugins with their base metrics
      const { data, error } = await supabase
        .from('plugins')
        .select('id, name, xp, roi, category, status')
        .eq('tenant_id', tenantId)
        .order(metric, { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching plugins:', error);
        throw error;
      }

      // Get execution statistics for each plugin
      const pluginsWithStats = await Promise.all(
        (data || []).map(async (plugin) => {
          // Count successful executions
          const { count: successCount, error: successError } = await supabase
            .from('plugin_logs')
            .select('id', { count: 'exact', head: true })
            .eq('plugin_id', plugin.id)
            .eq('status', 'success');

          // Count total executions
          const { count: totalCount, error: totalError } = await supabase
            .from('plugin_logs')
            .select('id', { count: 'exact', head: true })
            .eq('plugin_id', plugin.id);

          if (successError || totalError) {
            console.error('Error fetching execution stats:', successError || totalError);
          }

          const executionCount = totalCount || 0;
          const successRate = executionCount > 0 ? ((successCount || 0) / executionCount) * 100 : 0;

          return {
            ...plugin,
            execution_count: executionCount,
            success_rate: successRate
          };
        })
      );

      return pluginsWithStats;
    },
    enabled: !!tenantId
  });

  const getCategoryBadgeColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'marketing': return 'bg-pink-100 text-pink-800';
      case 'sales': return 'bg-blue-100 text-blue-800';
      case 'content': return 'bg-purple-100 text-purple-800';
      case 'analytics': return 'bg-green-100 text-green-800';
      case 'social': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Plugin Leaderboard</h1>

      <Tabs 
        value={metric} 
        onValueChange={(value) => setMetric(value as 'xp' | 'roi')} 
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="xp">
            <Sparkles className="mr-2 h-4 w-4" />
            Experience Points
          </TabsTrigger>
          <TabsTrigger value="roi">
            <TrendingUp className="mr-2 h-4 w-4" />
            Return on Investment
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-6 w-6 mr-2 text-amber-500" />
            Top Performing Plugins
          </CardTitle>
          <CardDescription>
            {metric === 'xp' 
              ? 'Plugins ranked by experience points earned through successful executions' 
              : 'Plugins ranked by return on investment impact'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : plugins && plugins.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Plugin</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Executions</TableHead>
                    <TableHead className="text-right">Success Rate</TableHead>
                    <TableHead className="text-right">
                      {metric === 'xp' ? 'XP' : 'ROI'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plugins.map((plugin, index) => (
                    <TableRow key={plugin.id}>
                      <TableCell className="font-medium">
                        {index === 0 ? (
                          <Badge variant="default" className="bg-amber-500">
                            #{index + 1}
                          </Badge>
                        ) : index <= 2 ? (
                          <Badge variant="outline" className="border-amber-500 text-amber-500">
                            #{index + 1}
                          </Badge>
                        ) : (
                          <span>#{index + 1}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{plugin.name}</TableCell>
                      <TableCell>
                        {plugin.category && (
                          <Badge 
                            variant="outline" 
                            className={getCategoryBadgeColor(plugin.category)}
                          >
                            {plugin.category}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{plugin.execution_count?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        {plugin.success_rate !== undefined 
                          ? `${plugin.success_rate.toFixed(1)}%` 
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {metric === 'xp' ? plugin.xp.toLocaleString() : `${plugin.roi.toLocaleString()}%`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No plugins found. Start creating and executing plugins to see them here.</p>
              <Button variant="outline" className="mt-4">
                Create Your First Plugin
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginsLeaderboard;
