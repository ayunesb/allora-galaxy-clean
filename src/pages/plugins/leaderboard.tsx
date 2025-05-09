
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Star, Award, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const LeaderboardPage: React.FC = () => {
  const tenantId = useTenantId();
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month' | 'all'>('month');
  
  const { data: plugins, isLoading } = useQuery({
    queryKey: ['plugin-leaderboard', tenantId, timePeriod],
    queryFn: async () => {
      if (!tenantId) return [];
      
      // Get date range for the filter
      let dateFilter;
      const now = new Date();
      
      switch(timePeriod) {
        case 'day':
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          dateFilter = `created_at.gte.${yesterday.toISOString()}`;
          break;
        case 'week':
          const lastWeek = new Date(now);
          lastWeek.setDate(lastWeek.getDate() - 7);
          dateFilter = `created_at.gte.${lastWeek.toISOString()}`;
          break;
        case 'month':
          const lastMonth = new Date(now);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          dateFilter = `created_at.gte.${lastMonth.toISOString()}`;
          break;
        default:
          dateFilter = '';
      }
      
      // Get plugins with their XP and ROI sorted by XP
      const { data, error } = await supabase
        .from('plugins')
        .select('id, name, description, category, xp, roi')
        .eq('tenant_id', tenantId)
        .order('xp', { ascending: false })
        .limit(10);
        
      if (error) {
        console.error('Error fetching plugin leaderboard:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!tenantId
  });
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Plugin Leaderboard</h1>
      
      <div className="mb-8">
        <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as any)}>
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="day">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Top Plugins by XP
              </div>
            </CardTitle>
            <CardDescription>
              Plugins that have earned the most experience points
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Plugin</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">XP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plugins?.map((plugin, index) => (
                    <TableRow key={plugin.id}>
                      <TableCell className="font-medium">
                        {index === 0 && <Award className="h-5 w-5 text-yellow-500 inline mr-1" />}
                        {index === 1 && <Award className="h-5 w-5 text-gray-400 inline mr-1" />}
                        {index === 2 && <Award className="h-5 w-5 text-amber-700 inline mr-1" />}
                        {index > 2 && `#${index + 1}`}
                      </TableCell>
                      <TableCell>{plugin.name}</TableCell>
                      <TableCell>
                        {plugin.category && (
                          <Badge variant="outline">{plugin.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">{plugin.xp.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {(plugins?.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No plugins found for this period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-green-500" />
                Top Plugins by ROI
              </div>
            </CardTitle>
            <CardDescription>
              Plugins that have the highest return on investment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Plugin</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plugins?.sort((a, b) => b.roi - a.roi).map((plugin, index) => (
                    <TableRow key={plugin.id}>
                      <TableCell className="font-medium">
                        {index === 0 && <Award className="h-5 w-5 text-yellow-500 inline mr-1" />}
                        {index === 1 && <Award className="h-5 w-5 text-gray-400 inline mr-1" />}
                        {index === 2 && <Award className="h-5 w-5 text-amber-700 inline mr-1" />}
                        {index > 2 && `#${index + 1}`}
                      </TableCell>
                      <TableCell>{plugin.name}</TableCell>
                      <TableCell>
                        {plugin.category && (
                          <Badge variant="outline">{plugin.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">{plugin.roi}%</TableCell>
                    </TableRow>
                  ))}
                  {(plugins?.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No plugins found for this period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaderboardPage;
