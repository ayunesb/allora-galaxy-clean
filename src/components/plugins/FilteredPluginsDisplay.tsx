
import { Plugin } from '@/types/plugin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AllPluginsTab } from './tabs/AllPluginsTab';
import { ActivePluginsTab } from './tabs/ActivePluginsTab';
import { TopPerformersTab } from './tabs/TopPerformersTab';
import { TrendingPluginsTab } from './tabs/TrendingPluginsTab';
import { LeaderboardTab } from './tabs/LeaderboardTab';

interface FilteredPluginsDisplayProps {
  filteredPlugins: Plugin[];
  loading: boolean;
  onClearFilters: () => void;
}

export const FilteredPluginsDisplay = ({ 
  filteredPlugins, 
  loading, 
  onClearFilters 
}: FilteredPluginsDisplayProps) => {
  
  // Get active plugins
  const activePlugins = filteredPlugins.filter(p => p.status === 'active');

  // Get top performers by ROI
  const topPerformers = [...filteredPlugins]
    .sort((a, b) => (b.roi || 0) - (a.roi || 0))
    .slice(0, 6);

  // Get trending plugins by XP
  const trendingPlugins = [...filteredPlugins]
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .slice(0, 6);

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList>
        <TabsTrigger value="all">All Plugins</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
        <TabsTrigger value="trending">Trending</TabsTrigger>
        <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        <AllPluginsTab 
          plugins={filteredPlugins} 
          loading={loading} 
          onClearFilters={onClearFilters} 
        />
      </TabsContent>
      
      <TabsContent value="active">
        <ActivePluginsTab 
          plugins={activePlugins} 
          loading={loading} 
          onClearFilters={onClearFilters} 
        />
      </TabsContent>
      
      <TabsContent value="top-performers">
        <TopPerformersTab 
          plugins={topPerformers} 
          loading={loading} 
          onClearFilters={onClearFilters} 
        />
      </TabsContent>
      
      <TabsContent value="trending">
        <TrendingPluginsTab 
          plugins={trendingPlugins} 
          loading={loading} 
          onClearFilters={onClearFilters} 
        />
      </TabsContent>
      
      <TabsContent value="leaderboard">
        <LeaderboardTab plugins={filteredPlugins} />
      </TabsContent>
    </Tabs>
  );
};
