
import { GraphData } from '@/types/galaxy';

export const mockGraphData: GraphData = {
  nodes: [
    {
      id: 'strategy-1',
      name: 'Content Marketing Strategy',
      type: 'strategy',
      description: 'A strategy focused on content marketing techniques',
      realId: '1' // Added to match the expected interface
    },
    {
      id: 'plugin-1',
      name: 'SEO Analyzer',
      type: 'plugin',
      version: '1.0.0',
      realId: '1' // Added to match the expected interface
    },
    {
      id: 'agent-1',
      name: 'SEO Analyzer v1.2',
      type: 'agent',
      plugin_id: '1',
      realId: '1' // Added to match the expected interface
    }
  ],
  links: [
    {
      source: 'strategy-1',
      target: 'plugin-1',
      type: 'uses'
    },
    {
      source: 'plugin-1',
      target: 'agent-1',
      type: 'executed'
    }
  ]
};

export default mockGraphData;
