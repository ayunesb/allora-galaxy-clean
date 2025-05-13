
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from './useTenantId';
import type { Plugin } from '@/types/plugin'; // Using type-only import to avoid unused warning

export interface UsePluginsProps {
  category?: string;
  status?: string;
  limit?: number;
  withXp?: boolean;
}

export function usePlugins(props?: UsePluginsProps) {
  const { category, status, limit, withXp } = props || {};
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { tenantId } = useTenantId();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  const categories = [
    'analytics',
    'communication',
    'content',
    'crm',
    'integration',
    'marketing',
    'utility',
    'social'
  ];

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('plugins')
        .select('*');

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      if (category || selectedCategory) {
        query = query.eq('category', category || selectedCategory);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      if (withXp) {
        query = query.order('xp', { ascending: false });
      } else if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'name') {
        query = query.order('name', { ascending: true });
      } else if (sortBy === 'xp') {
        query = query.order('xp', { ascending: false });
      } else if (sortBy === 'roi') {
        query = query.order('roi', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setPlugins(data || []);
    } catch (err: any) {
      console.error('Error fetching plugins:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, [tenantId, category, status, limit, withXp, selectedCategory, sortBy]);

  // Filter plugins based on search query
  const filteredPlugins = useMemo(() => {
    if (!searchQuery) return plugins;
    
    return plugins.filter(plugin => 
      plugin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [plugins, searchQuery]);

  // Generate top plugins based on XP
  const topPlugins = useMemo(() => {
    return [...plugins].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 10);
  }, [plugins]);

  // Generate trending plugins based on recent activity
  const trendingPlugins = useMemo(() => {
    // Mock trending calculation - in a real app, this would use more sophisticated logic
    return plugins
      .map(plugin => ({
        ...plugin,
        trend_score: Math.floor(Math.random() * 200) - 100 // Random trend score for demonstration
      }))
      .sort((a, b) => Math.abs(b.trend_score) - Math.abs(a.trend_score))
      .slice(0, 10);
  }, [plugins]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('newest');
  };

  return {
    plugins,
    loading,
    error,
    fetchPlugins,
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
}
