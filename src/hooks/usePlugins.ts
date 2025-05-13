
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plugin } from '@/types/plugin';

export const usePlugins = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('xp');
  const { toast } = useToast();

  // Fetch plugins from Supabase
  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plugins')
        .select('*')
        .order(sortBy === 'xp' ? 'xp' : sortBy === 'roi' ? 'roi' : 'name', { ascending: sortBy === 'name' });

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

  // Apply sorting when sortBy changes
  useEffect(() => {
    if (plugins.length > 0) {
      const sorted = [...plugins].sort((a, b) => {
        if (sortBy === 'xp') {
          return (b.xp || 0) - (a.xp || 0);
        } else if (sortBy === 'roi') {
          return (b.roi || 0) - (a.roi || 0);
        } else {
          return a.name.localeCompare(b.name);
        }
      });
      
      setPlugins(sorted);
    }
  }, [sortBy]);

  // Filter plugins based on search query and category
  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearchTerm = !searchQuery || 
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plugin.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    
    return matchesSearchTerm && matchesCategory;
  });

  // Get top plugins by XP
  const topPlugins = [...plugins].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 10);
  
  // Get trending plugins
  const trendingPlugins = [...plugins]
    .filter(plugin => plugin.trend_score !== undefined && plugin.trend_score !== null)
    .sort((a, b) => (b.trend_score || 0) - (a.trend_score || 0))
    .slice(0, 10);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return {
    plugins,
    loading,
    isLoading: loading,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    filteredPlugins,
    clearFilters,
    topPlugins,
    trendingPlugins
  };
};
