
import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons'; // You might need to create this component
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Mock data for demonstration
const TRENDING_STRATEGIES = [
  { 
    id: '1', 
    title: 'Email Onboarding Campaign', 
    description: 'A comprehensive email onboarding flow for new users',
    category: 'marketing',
    popularity: 'high'
  },
  { 
    id: '2', 
    title: 'Product Launch Promotion', 
    description: 'Strategy for promoting new product launches across channels',
    category: 'marketing',
    popularity: 'medium'
  },
  { 
    id: '3', 
    title: 'Customer Retention Program', 
    description: 'Tactics for increasing customer loyalty and reducing churn',
    category: 'customer success',
    popularity: 'high'
  },
];

const FEATURED_PLUGINS = [
  { 
    id: '1', 
    name: 'Email Automation', 
    description: 'Automate email sequences based on user behavior',
    category: 'communication',
    xp: 350
  },
  { 
    id: '2', 
    name: 'Social Media Publisher', 
    description: 'Schedule and publish content across social platforms',
    category: 'social media',
    xp: 275
  },
  { 
    id: '3', 
    name: 'Analytics Dashboard', 
    description: 'Visualize key metrics and campaign performance',
    category: 'analytics',
    xp: 410
  },
];

const ExplorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("strategies");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="container py-6">
      <PageHeader
        title="Explore"
        description="Discover trending strategies and plugins to enhance your marketing efforts"
      />
      
      <div className="mb-6">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search strategies, plugins, or agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </form>
      </div>
      
      <Tabs defaultValue="strategies" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="strategies">Trending Strategies</TabsTrigger>
          <TabsTrigger value="plugins">Featured Plugins</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="strategies" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRENDING_STRATEGIES.map(strategy => (
              <Card key={strategy.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{strategy.title}</CardTitle>
                    <Badge>{strategy.category}</Badge>
                  </div>
                  <CardDescription>{strategy.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/strategy/${strategy.id}`)}>
                    View Strategy
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="plugins" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_PLUGINS.map(plugin => (
              <Card key={plugin.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{plugin.name}</CardTitle>
                    <Badge variant="secondary">{plugin.xp} XP</Badge>
                  </div>
                  <CardDescription>{plugin.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/plugins/${plugin.id}`)}>
                    View Plugin
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <p className="text-muted-foreground">Coming soon! Templates will be available in the next update.</p>
              <Button variant="link" onClick={() => setActiveTab("strategies")}>
                Explore strategies instead
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExplorePage;
