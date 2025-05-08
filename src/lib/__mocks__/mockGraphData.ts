
import { GraphData, GraphNode, GraphLink } from '@/types/galaxy';

export const mockGraphData: GraphData = {
  nodes: [
    {
      id: 'strategy-1',
      name: 'Social Media Strategy',
      type: 'strategy',
      color: '#9c27b0',
      status: 'approved',
      metadata: {
        id: 'strategy-1',
        description: 'Comprehensive social media marketing strategy'
      }
    },
    {
      id: 'plugin-1',
      name: 'Twitter Analytics',
      type: 'plugin',
      color: '#1e88e5',
      status: 'active',
      metadata: {
        id: 'plugin-1',
        description: 'Analyze Twitter engagement metrics'
      }
    },
    {
      id: 'agent-1',
      name: 'Content Agent',
      type: 'agent',
      color: '#43a047',
      status: 'active',
      metadata: {
        id: 'agent-1',
        description: 'AI agent for content creation'
      }
    }
  ],
  links: [
    {
      source: 'strategy-1',
      target: 'plugin-1',
      value: 1
    },
    {
      source: 'strategy-1',
      target: 'agent-1',
      value: 1
    },
    {
      source: 'plugin-1',
      target: 'agent-1',
      value: 1
    }
  ]
};

export const emptyGraphData: GraphData = {
  nodes: [],
  links: []
};
