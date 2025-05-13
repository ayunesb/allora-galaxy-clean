
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { plugin } from '@/types/plugin';

interface EnhancedPlugin extends plugin {
  trend_score?: number;
}

export function usePlugins() {
  const [plugins, setPlugins] = useState<EnhancedPlugin[]>([]);
  const [topPlugins, setTopPlugins] = useState<EnhancedPlugin[]>([]);
  const [trendingPlugins, setTrendingPlugins] = useState<EnhancedPlugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      
      setPlugins(enhancedPlugins);
      
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

  return {
    plugins,
    topPlugins,
    trendingPlugins,
    loading,
    error,
    fetchPlugins,
  };
}
