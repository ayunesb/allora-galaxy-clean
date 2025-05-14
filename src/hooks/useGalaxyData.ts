
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GraphData } from '@/types/galaxy';

export const useGalaxyData = () => {
  return useQuery({
    queryKey: ['galaxy_data'],
    queryFn: async (): Promise<GraphData> => {
      // Fetch strategies
      const { data: strategies, error: strategiesError } = await supabase
        .from('strategies')
        .select('*');
        
      if (strategiesError) throw strategiesError;
      
      // Fetch plugins
      const { data: plugins, error: pluginsError } = await supabase
        .from('plugins')
        .select('*');
        
      if (pluginsError) throw pluginsError;
      
      // Fetch agent versions
      const { data: agentVersions, error: agentsError } = await supabase
        .from('agent_versions')
        .select('*, plugins(id, name)');
        
      if (agentsError) throw agentsError;
      
      // Fetch plugin logs to establish relationships
      const { data: pluginLogs, error: logsError } = await supabase
        .from('plugin_logs')
        .select('strategy_id, plugin_id, agent_version_id');
        
      if (logsError) throw logsError;
      
      // Create nodes and links for the graph
      const nodes: any[] = [];
      const links: any[] = [];
      
      // Add strategy nodes
      strategies?.forEach((strategy) => {
        nodes.push({
          id: `strategy-${strategy.id}`,
          realId: strategy.id,
          name: strategy.title,
          type: 'strategy',
          ...strategy,
        });
      });
      
      // Add plugin nodes
      plugins?.forEach((plugin) => {
        nodes.push({
          id: `plugin-${plugin.id}`,
          realId: plugin.id,
          name: plugin.name,
          type: 'plugin',
          ...plugin,
        });
      });
      
      // Add agent version nodes
      agentVersions?.forEach((agent) => {
        nodes.push({
          id: `agent-${agent.id}`,
          realId: agent.id,
          name: `${agent.plugins?.name || 'Unknown'} v${agent.version}`,
          type: 'agent',
          ...agent,
        });
        
        // Link agent versions to plugins
        if (agent.plugin_id) {
          links.push({
            source: `agent-${agent.id}`,
            target: `plugin-${agent.plugin_id}`,
            type: 'is_version_of'
          });
        }
      });
      
      // Add links between strategies and plugins based on plugin logs
      pluginLogs?.forEach((log) => {
        if (log.strategy_id && log.plugin_id) {
          links.push({
            source: `strategy-${log.strategy_id}`,
            target: `plugin-${log.plugin_id}`,
            type: 'uses'
          });
        }
        
        if (log.plugin_id && log.agent_version_id) {
          links.push({
            source: `plugin-${log.plugin_id}`,
            target: `agent-${log.agent_version_id}`,
            type: 'executed'
          });
        }
      });
      
      return { nodes, links };
    }
  });
};
