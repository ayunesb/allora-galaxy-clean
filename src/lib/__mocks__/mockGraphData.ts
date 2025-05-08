
import { GraphData } from '@/types/galaxy';

export const mockGraphData: GraphData = {
  nodes: [
    {
      id: 'strategy-1',
      name: 'Email Onboarding Campaign',
      type: 'strategy',
      status: 'approved',
      description: 'A comprehensive email onboarding campaign for new users'
    },
    {
      id: 'plugin-1',
      name: 'Email Sender',
      type: 'plugin',
      description: 'Plugin to send automated emails'
    },
    {
      id: 'agent-1',
      name: 'Email Content Generator',
      type: 'agent',
      description: 'AI agent that generates email content'
    }
  ],
  links: [
    {
      source: 'strategy-1',
      target: 'plugin-1',
      value: 1
    },
    {
      source: 'plugin-1',
      target: 'agent-1',
      value: 1
    }
  ]
};
