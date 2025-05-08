
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, Search, Star, TrendingUp, XCircle } from 'lucide-react';
import { Plugin } from '@/types/plugin';

const PluginsPage: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('xp');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plugins')
        .select('*')
        .order(sortBy === 'xp' ? 'xp' : 'roi', { ascending: false });

      if (error) {
        throw error;
      }

      setPlugins(data || []);

      // Extract unique categories
      const uniqueCategories = [...new Set((data || []).map(plugin => plugin.category).filter(Boolean))];
      setCategories(uniqueCategories as string[]);
    } catch (error: any) {
      toast({
        title: 'Error fetching plugins',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearchTerm = !searchTerm || 
      plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plugin.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || plugin.category === selectedCategory;
    
    return matchesSearchTerm && matchesCategory;
  });

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // Re-sort the plugins
    const sorted = [...plugins].sort((a, b) => {
      if (value === 'xp') {
        return (b.xp || 0) - (a.xp || 0);
      } else if (value === 'roi') {
        return (b.roi || 0) - (a.roi || 0);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    setPlugins(sorted);
  };

  const handlePluginClick = (plugin: Plugin) => {
    navigate(`/plugins/${plugin.id}`);
  };

  const renderPluginGrid = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredPlugins.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No plugins found</h3>
          <p className="text-muted-foreground mt-2">
            Try changing your search terms or filters
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
            }}
          >
            Clear filters
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlugins.map((plugin) => (
          <Card 
            key={plugin.id} 
            className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => handlePluginClick(plugin)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plugin.name}</CardTitle>
                {plugin.status === 'active' ? (
                  <Badge variant="success" className="bg-green-100 text-green-800">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
              {plugin.category && (
                <CardDescription>
                  <Badge variant="outline" className="mt-1">
                    {plugin.category}
                  </Badge>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {plugin.description || 'No description available'}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{plugin.xp || 0} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">{plugin.roi || 0}% ROI</span>
              </div>
              <Button size="sm" variant="ghost" className="ml-auto">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Plugin Marketplace</h1>
          <p className="text-muted-foreground">
            Browse, track, and integrate plugins that power your business strategies
          </p>
        </div>
        <Button
          onClick={() => navigate('/plugins/create')}
          className="shrink-0"
        >
          Create Plugin
        </Button>
      </div>

      <div className="bg-card border rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plugins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xp">Experience (XP)</SelectItem>
              <SelectItem value="roi">Return on Investment (ROI)</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Plugins</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {renderPluginGrid()}
        </TabsContent>
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlugins.filter(p => p.status === 'active').map((plugin) => (
              // Same card as above - refactor into a component if needed
              <Card 
                key={plugin.id} 
                className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => handlePluginClick(plugin)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plugin.name}</CardTitle>
                    <Badge variant="success" className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  {plugin.category && (
                    <CardDescription>
                      <Badge variant="outline" className="mt-1">
                        {plugin.category}
                      </Badge>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {plugin.description || 'No description available'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{plugin.xp || 0} XP</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">{plugin.roi || 0}% ROI</span>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-auto">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="top-performers">
          {/* Top performers (high ROI) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlugins
              .sort((a, b) => (b.roi || 0) - (a.roi || 0))
              .slice(0, 6)
              .map((plugin) => (
                // Same card as above
                <Card 
                  key={plugin.id} 
                  className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => handlePluginClick(plugin)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plugin.name}</CardTitle>
                      {plugin.status === 'active' ? (
                        <Badge variant="success" className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    {plugin.category && (
                      <CardDescription>
                        <Badge variant="outline" className="mt-1">
                          {plugin.category}
                        </Badge>
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {plugin.description || 'No description available'}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{plugin.xp || 0} XP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">{plugin.roi || 0}% ROI</span>
                    </div>
                    <Button size="sm" variant="ghost" className="ml-auto">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="trending">
          {/* Trending plugins (high XP) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlugins
              .sort((a, b) => (b.xp || 0) - (a.xp || 0))
              .slice(0, 6)
              .map((plugin) => (
                // Same card as above
                <Card 
                  key={plugin.id} 
                  className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => handlePluginClick(plugin)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plugin.name}</CardTitle>
                      {plugin.status === 'active' ? (
                        <Badge variant="success" className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    {plugin.category && (
                      <CardDescription>
                        <Badge variant="outline" className="mt-1">
                          {plugin.category}
                        </Badge>
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {plugin.description || 'No description available'}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{plugin.xp || 0} XP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">{plugin.roi || 0}% ROI</span>
                    </div>
                    <Button size="sm" variant="ghost" className="ml-auto">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PluginsPage;
