
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GalaxyData, GalaxyNode, GalaxyLink } from '@/types/galaxy';

/**
 * Custom hook to fetch and process data for the Galaxy Explorer
 */
export function useGalaxyData() {
  const [selectedNode, setSelectedNode] = useState<GalaxyNode | null>(null);
  
  // Fetch strategies, plugins, agents, and logs from Supabase
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['galaxyData'],
    queryFn: async () => {
      try {
        const [strategiesRes, pluginsRes, agentsRes, logsRes] = await Promise.all([
          supabase.from('strategies').select('*').order('created_at', { ascending: false }).limit(50),
          supabase.from('plugins').select('*').order('created_at', { ascending: false }).limit(50),
          supabase.from('agent_versions').select('*').order('created_at', { ascending: false }).limit(50),
          supabase.from('plugin_logs').select('*').order('created_at', { ascending: false }).limit(50)
        ]);
        
        // Handle errors
        if (strategiesRes.error) throw new Error(`Error fetching strategies: ${strategiesRes.error.message}`);
        if (pluginsRes.error) throw new Error(`Error fetching plugins: ${pluginsRes.error.message}`);
        if (agentsRes.error) throw new Error(`Error fetching agents: ${agentsRes.error.message}`);
        if (logsRes.error) throw new Error(`Error fetching logs: ${logsRes.error.message}`);
        
        // Process data into nodes and links
        const nodes: GalaxyNode[] = [];
        const links: GalaxyLink[] = [];
        
        // Process strategies
        strategiesRes.data.forEach((strategy: any) => {
          nodes.push({
            id: strategy.id,
            name: strategy.title || 'Unnamed Strategy',
            type: 'strategy',
            value: 10,
            color: '#FF6B6B',
            status: strategy.status,
            createdAt: strategy.created_at,
            updatedAt: strategy.updated_at,
            metadata: strategy
          });
        });
        
        // Process plugins
        pluginsRes.data.forEach((plugin: any) => {
          nodes.push({
            id: plugin.id,
            name: plugin.name || 'Unnamed Plugin',
            type: 'plugin',
            value: 7,
            color: '#4ECDC4',
            status: plugin.status,
            createdAt: plugin.created_at,
            updatedAt: plugin.updated_at,
            metadata: plugin
          });
          
          // Link plugins to strategies that use them
          logsRes.data
            .filter(log => log.plugin_id === plugin.id && log.strategy_id)
            .forEach((log: any) => {
              if (!links.some(link => link.source === plugin.id && link.target === log.strategy_id)) {
                links.push({
                  source: plugin.id,
                  target: log.strategy_id,
                  value: 1,
                  type: 'plugin-strategy'
                });
              }
            });
        });
        
        // Process agents
        agentsRes.data.forEach((agent: any) => {
          nodes.push({
            id: agent.id,
            name: `Agent v${agent.version}`,
            type: 'agent',
            value: 5,
            color: '#FFD166',
            status: agent.status,
            createdAt: agent.created_at,
            updatedAt: agent.updated_at,
            metadata: agent
          });
          
          // Link agents to their plugins
          if (agent.plugin_id) {
            links.push({
              source: agent.id,
              target: agent.plugin_id,
              value: 1,
              type: 'agent-plugin'
            });
          }
        });
        
        // Process logs (only a sample for performance)
        logsRes.data.slice(0, 20).forEach((log: any) => {
          const logId = `log-${log.id}`;
          nodes.push({
            id: logId,
            name: `Execution: ${log.status}`,
            type: 'log',
            value: 3,
            color: log.status === 'success' ? '#06D6A0' : '#EF476F',
            createdAt: log.created_at,
            metadata: log
          });
          
          // Link logs to plugins
          if (log.plugin_id) {
            links.push({
              source: logId,
              target: log.plugin_id,
              value: 1,
              type: 'log-plugin'
            });
          }
          
          // Link logs to agents
          if (log.agent_version_id) {
            links.push({
              source: logId,
              target: log.agent_version_id,
              value: 1,
              type: 'log-agent'
            });
          }
          
          // Link logs to strategies
          if (log.strategy_id) {
            links.push({
              source: logId,
              target: log.strategy_id,
              value: 1,
              type: 'log-strategy'
            });
          }
        });
        
        return { nodes, links };
      } catch (error: any) {
        console.error("Error fetching galaxy data:", error);
        throw new Error(`Failed to load Galaxy Explorer data: ${error.message}`);
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  const refreshData = async () => {
    await refetch();
  };
  
  // Return the processed data, loading state, and error
  return {
    data: data || { nodes: [], links: [] },
    isLoading,
    error: error ? (error as Error).message : null,
    refreshData,
    selectedNode,
    setSelectedNode
  };
}

export default useGalaxyData;
