
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { Plugin, EnhancedPlugin } from '@/types/plugin';

export function usePlugins() {
  const [plugins, setPlugins] = useState<EnhancedPlugin[]>([]);
  const [topPlugins, setTopPlugins] = useState<EnhancedPlugin[]>([]);
  const [trendingPlugins, setTrendingPlugins] = useState<EnhancedPlugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [categories, setCategories] = useState<string[]>([]);
  const { tenantId } = useTenantId();

  useEffect(() => {
    fetchPlugins();
  }, [tenantId]);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!tenantId) {
        setLoading(false);
        return;
      }
      
      // Fetch all plugins for the tenant
      const { data, error } = await supabase
        .from('plugins')
        .select('*')
        .eq('tenant_id', tenantId);
      
      if (error) {
        throw error;
      }
      
      // Add trend_score to plugins (this would normally be calculated on the server)
      const enhancedPlugins = data.map(plugin => ({
        ...plugin,
        trend_score: Math.floor(Math.random() * 200) - 100 // Mock trend score for demo purposes
      }));
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(enhancedPlugins.map(plugin => plugin.category).filter(Boolean))
      ) as string[];
      
      setPlugins(enhancedPlugins);
      setCategories(uniqueCategories);
      
      // Sort by XP for top plugins
      const topByXp = [...enhancedPlugins].sort((a, b) => (b.xp || 0) - (a.xp || 0));
      setTopPlugins(topByXp.slice(0, 10));
      
      // Sort by trend score for trending plugins
      const topByTrend = [...enhancedPlugins]
        .sort((a, b) => {
          const scoreA = a.trend_score || 0;
          const scoreB = b.trend_score || 0;
          return Math.abs(scoreB) - Math.abs(scoreA);
        });
      setTrendingPlugins(topByTrend.slice(0, 10));
      
    } catch (err: any) {
      console.error('Error fetching plugins:', err);
      setError(err.message || 'Failed to fetch plugins');
    } finally {
      setLoading(false);
    }
  };

  // Filter plugins based on search query and category
  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = !searchQuery || 
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plugin.description && plugin.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || plugin.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'xp') {
      return (b.xp || 0) - (a.xp || 0);
    } else if (sortBy === 'roi') {
      return (b.roi || 0) - (a.roi || 0);
    } else {
      return 0;
    }
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('name');
  };

  return {
    plugins,
    topPlugins,
    trendingPlugins,
    loading,
    error,
    fetchPlugins,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    filteredPlugins,
    clearFilters,
    categories
  };
}
