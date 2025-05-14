
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchIcon, TrendingUpIcon, StarIcon, BarChartIcon, UsersIcon, BoltIcon } from 'lucide-react';
import PageHelmet from '@/components/PageHelmet';
import PluginCard from '@/components/plugins/PluginCard';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Plugin {
  id: string | number;
  name: string;
  description: string;
  category: string;
  installed?: boolean;
  rating?: number;
  usersCount?: number;
  xp?: number;
  version?: string;
}

const PluginsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('featured');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch plugins data
  const { data: plugins = [], isLoading } = useQuery({
    queryKey: ['plugins'],
    queryFn: async () => {
      // In a real app, we'd fetch from Supabase
      // This is mock data for now
      return [
        {
          id: 1,
          name: 'HubSpot Integration',
          description: 'Sync data between Allora and HubSpot CRM',
          category: 'Marketing',
          xp: 1245,
          rating: 4.8,
          usersCount: 328,
          version: '2.1.0'
        },
        {
          id: 2,
          name: 'Email Drip Campaign',
          description: 'Automated email sequences for lead nurturing',
          category: 'Marketing',
          xp: 987,
          rating: 4.6,
          usersCount: 256,
          version: '1.3.2'
        },
        {
          id: 3,
          name: 'Google Analytics Connector',
          description: 'Import and visualize GA4 metrics',
          category: 'Analytics',
          xp: 876,
          rating: 4.5,
          usersCount: 193,
          version: '2.0.1'
        },
        {
          id: 4,
          name: 'Slack Notifications',
          description: 'Real-time alerts and digests in Slack',
          category: 'Automation',
          xp: 654,
          rating: 4.7,
          usersCount: 312,
          version: '1.4.0',
          installed: true
        },
        {
          id: 5,
          name: 'AI Content Generator',
          description: 'Generate marketing content with AI',
          category: 'Marketing',
          xp: 542,
          rating: 4.3,
          usersCount: 187,
          version: '0.9.5'
        },
        {
          id: 6,
          name: 'Customer Segmentation',
          description: 'Automatically segment customers based on behavior',
          category: 'Analytics',
          xp: 432,
          rating: 4.4,
          usersCount: 143,
          version: '1.2.1'
        },
        {
          id: 7,
          name: 'WhatsApp Business API',
          description: 'Send automated WhatsApp messages to customers',
          category: 'Customer Support',
          xp: 398,
          rating: 4.5,
          usersCount: 98,
          version: '0.8.0'
        },
        {
          id: 8,
          name: 'Shopify Integration',
          description: 'Connect your Shopify store to Allora',
          category: 'Integration',
          xp: 87,
          rating: 4.0,
          usersCount: 45,
          version: '0.5.2'
        },
        {
          id: 9,
          name: 'LinkedIn Ads Connector',
          description: 'Manage and track LinkedIn ad campaigns',
          category: 'Marketing',
          xp: 76,
          rating: 3.9,
          usersCount: 32,
          version: '0.4.0'
        },
        {
          id: 10,
          name: 'Lead Scoring',
          description: 'Score leads based on engagement and fit',
          category: 'Analytics',
          xp: 65,
          rating: 4.1,
          usersCount: 28,
          version: '0.3.1'
        }
      ] as Plugin[];
    }
  });

  // Plugin categories
  const pluginCategories = [
    { name: 'Analytics', count: 24, icon: <BarChartIcon className="h-4 w-4" /> },
    { name: 'Marketing', count: 37, icon: <TrendingUpIcon className="h-4 w-4" /> },
    { name: 'Customer Support', count: 18, icon: <UsersIcon className="h-4 w-4" /> },
    { name: 'Automation', count: 29, icon: <BoltIcon className="h-4 w-4" /> },
    { name: 'Featured', count: 12, icon: <StarIcon className="h-4 w-4" /> },
  ];

  // Filter plugins based on search term and active tab
  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          plugin.category.toLowerCase().includes(searchTerm.toLowerCase());
                          
    if (activeTab === 'featured') {
      return matchesSearch && plugin.rating && plugin.rating >= 4.5;
    }
    
    if (activeTab === 'installed') {
      return matchesSearch && plugin.installed === true;
    }
    
    if (activeTab === 'trending') {
      return matchesSearch && plugin.usersCount && plugin.usersCount > 150;
    }
    
    if (activeTab === 'new') {
      return matchesSearch && plugin.version && plugin.version.startsWith('0.');
    }
    
    return matchesSearch;
  });

  const handleInstall = useCallback((id: string | number) => {
    toast({
      title: "Plugin Installation Started",
      description: "Installing plugin...",
    });
    
    // Simulate installation
    setTimeout(() => {
      toast({
        title: "Plugin Installed",
        description: "The plugin has been successfully installed.",
      });
    }, 1500);
  }, [toast]);
  
  const handleUninstall = useCallback((id: string | number) => {
    toast({
      title: "Plugin Uninstalled",
      description: "The plugin has been removed successfully.",
      variant: "destructive",
    });
  }, [toast]);
  
  const handlePluginClick = useCallback((id: string | number) => {
    navigate(`/plugins/${id}`);
  }, [navigate]);

  const renderPluginGrid = (plugins: Plugin[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {plugins.map(plugin => (
        <PluginCard
          key={plugin.id}
          id={plugin.id}
          name={plugin.name}
          description={plugin.description}
          category={plugin.category}
          rating={plugin.rating}
          usersCount={plugin.usersCount}
          xp={plugin.xp}
          version={plugin.version}
          installed={plugin.installed}
          onInstall={handleInstall}
          onUninstall={handleUninstall}
          onClick={handlePluginClick}
        />
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHelmet 
        title="Plugin Marketplace" 
        description="Discover and install plugins for your Allora workspace"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Plugin Marketplace</h1>
        <p className="text-muted-foreground">
          Discover and add plugins to enhance your Allora workspace
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <SearchIcon className="h-4 w-4 mr-2" /> All Plugins
                </Button>
                {pluginCategories.map(category => (
                  <Button key={category.name} variant="ghost" className="w-full justify-start">
                    {category.icon}
                    <span className="ml-2">{category.name}</span>
                    <Badge variant="secondary" className="ml-auto">{category.count}</Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plugins..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="installed">Installed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Card key={i} className="h-[200px]">
                      <CardHeader>
                        <div className="h-5 w-48 bg-muted rounded animate-pulse mb-2"></div>
                        <div className="h-3 w-32 bg-muted rounded animate-pulse"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-3 w-full bg-muted rounded animate-pulse mb-2"></div>
                        <div className="h-3 w-3/4 bg-muted rounded animate-pulse"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredPlugins.length > 0 ? (
                renderPluginGrid(filteredPlugins)
              ) : (
                <div className="p-8 text-center">
                  <h3 className="text-lg font-medium mb-2">No plugins found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PluginsPage;
