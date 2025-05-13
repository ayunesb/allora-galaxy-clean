
import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlugins } from '@/hooks/usePlugins';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PluginLeaderboard } from '@/components/plugins/PluginLeaderboard';

const PluginsLeaderboard: React.FC = () => {
  const { topPlugins, trendingPlugins, loading, plugins } = usePlugins();

  const sortedByRoi = React.useMemo(() => {
    return [...plugins].sort((a, b) => (b.roi || 0) - (a.roi || 0));
  }, [plugins]);

  return (
    <div className="container py-10">
      <PageHeader
        title="Plugins Leaderboard"
        description="Top performing and trending plugins in the platform"
      />

      <Tabs defaultValue="top" className="mt-6">
        <TabsList>
          <TabsTrigger value="top">Top Performers</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="roi">Best ROI</TabsTrigger>
        </TabsList>
        
        <TabsContent value="top" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Plugins</CardTitle>
            </CardHeader>
            <CardContent>
              <PluginLeaderboard 
                plugins={topPlugins} 
                isLoading={loading}
                metric="xp"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Trending Plugins</CardTitle>
            </CardHeader>
            <CardContent>
              <PluginLeaderboard 
                plugins={trendingPlugins} 
                isLoading={loading}
                metric="trend"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roi" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Best ROI Plugins</CardTitle>
            </CardHeader>
            <CardContent>
              <PluginLeaderboard 
                plugins={sortedByRoi.slice(0, 10)} 
                isLoading={loading}
                metric="roi"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PluginsLeaderboard;
