
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchIcon, TrendingUpIcon, StarIcon, BarChartIcon, UsersIcon, BoltIcon } from 'lucide-react';
import PageHelmet from '@/components/PageHelmet';

const ExplorePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const pluginCategories = [
    { name: 'Analytics', count: 24, icon: <BarChartIcon className="h-4 w-4" /> },
    { name: 'Marketing', count: 37, icon: <TrendingUpIcon className="h-4 w-4" /> },
    { name: 'Customer Support', count: 18, icon: <UsersIcon className="h-4 w-4" /> },
    { name: 'Automation', count: 29, icon: <BoltIcon className="h-4 w-4" /> },
    { name: 'Featured', count: 12, icon: <StarIcon className="h-4 w-4" /> },
  ];

  const featuredPlugins = [
    {
      id: 1,
      name: 'HubSpot Integration',
      description: 'Sync data between Allora and HubSpot CRM',
      category: 'Marketing',
      xp: 1245,
      rating: 4.8,
      usersCount: 328
    },
    {
      id: 2,
      name: 'Email Drip Campaign',
      description: 'Automated email sequences for lead nurturing',
      category: 'Marketing',
      xp: 987,
      rating: 4.6,
      usersCount: 256
    },
    {
      id: 3,
      name: 'Google Analytics Connector',
      description: 'Import and visualize GA4 metrics',
      category: 'Analytics',
      xp: 876,
      rating: 4.5,
      usersCount: 193
    },
    {
      id: 4,
      name: 'Slack Notifications',
      description: 'Real-time alerts and digests in Slack',
      category: 'Automation',
      xp: 654,
      rating: 4.7,
      usersCount: 312
    }
  ];

  const trendingPlugins = [
    {
      id: 5,
      name: 'AI Content Generator',
      description: 'Generate marketing content with AI',
      category: 'Marketing',
      xp: 542,
      rating: 4.3,
      usersCount: 187
    },
    {
      id: 6,
      name: 'Customer Segmentation',
      description: 'Automatically segment customers based on behavior',
      category: 'Analytics',
      xp: 432,
      rating: 4.4,
      usersCount: 143
    },
    {
      id: 7,
      name: 'WhatsApp Business API',
      description: 'Send automated WhatsApp messages to customers',
      category: 'Customer Support',
      xp: 398,
      rating: 4.5,
      usersCount: 98
    }
  ];

  const newPlugins = [
    {
      id: 8,
      name: 'Shopify Integration',
      description: 'Connect your Shopify store to Allora',
      category: 'Integration',
      xp: 87,
      rating: 4.0,
      usersCount: 45
    },
    {
      id: 9,
      name: 'LinkedIn Ads Connector',
      description: 'Manage and track LinkedIn ad campaigns',
      category: 'Marketing',
      xp: 76,
      rating: 3.9,
      usersCount: 32
    },
    {
      id: 10,
      name: 'Lead Scoring',
      description: 'Score leads based on engagement and fit',
      category: 'Analytics',
      xp: 65,
      rating: 4.1,
      usersCount: 28
    }
  ];

  const renderPlugin = (plugin: any) => (
    <Card key={plugin.id} className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{plugin.name}</CardTitle>
            <CardDescription className="mt-1">{plugin.description}</CardDescription>
          </div>
          <Badge variant="outline">{plugin.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm">
          <div className="flex items-center text-yellow-500">
            <StarIcon className="h-4 w-4 mr-1" />
            <span>{plugin.rating}</span>
            <span className="text-muted-foreground ml-1">({plugin.usersCount})</span>
          </div>
          <div>
            <span className="text-muted-foreground">XP: </span>
            <span className="font-medium">{plugin.xp}</span>
          </div>
          <Button size="sm" variant="default">Add</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHelmet 
        title="Explore Plugins" 
        description="Discover and install plugins for your Allora workspace"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Plugins</h1>
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

          <Tabs defaultValue="featured">
            <TabsList className="mb-4">
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="installed">Installed</TabsTrigger>
            </TabsList>

            <TabsContent value="featured">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredPlugins.map(renderPlugin)}
              </div>
            </TabsContent>

            <TabsContent value="trending">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingPlugins.map(renderPlugin)}
              </div>
            </TabsContent>

            <TabsContent value="new">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {newPlugins.map(renderPlugin)}
              </div>
            </TabsContent>

            <TabsContent value="installed">
              <div className="p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No plugins installed yet</h3>
                <p className="text-muted-foreground">
                  Browse the marketplace to find plugins that enhance your workflow
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ExplorePage;
