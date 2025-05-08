
import { GraphData, GraphNode, GraphLink } from '@/types/galaxy';

// Sample mock data for the galaxy visualization
export const mockGraphData: GraphData = {
  nodes: [
    {
      id: 'strategy-1',
      name: 'Content Marketing Strategy',
      type: 'strategy',
      status: 'approved',
      description: 'Comprehensive content marketing strategy for Q2',
      tags: ['marketing', 'content', 'blog'],
      createdAt: '2023-04-15T10:30:00Z'
    },
    {
      id: 'strategy-2',
      name: 'Email Drip Campaign',
      type: 'strategy',
      status: 'pending',
      description: 'Automated email sequence for new trial users',
      tags: ['email', 'automation', 'onboarding'],
      createdAt: '2023-04-18T14:20:00Z'
    },
    {
      id: 'plugin-1',
      name: 'Content Generator',
      type: 'plugin',
      status: 'active',
      description: 'AI-powered blog post generator',
      xp: 120,
      roi: 3.4,
      version: 1
    },
    {
      id: 'plugin-2',
      name: 'Email Composer',
      type: 'plugin',
      status: 'active',
      description: 'Creates personalized email templates',
      xp: 85,
      roi: 4.2,
      version: 2
    },
    {
      id: 'plugin-3',
      name: 'Social Scheduler',
      type: 'plugin',
      status: 'active',
      description: 'Schedules content across social platforms',
      xp: 95,
      roi: 2.8,
      version: 1
    },
    {
      id: 'agent-1',
      name: 'Blog Writer',
      type: 'agent',
      status: 'active',
      description: 'Specialized in writing SEO-optimized blog posts',
      performance: 4.7,
      version: 3
    },
    {
      id: 'agent-2',
      name: 'Email Copywriter',
      type: 'agent',
      status: 'active',
      description: 'Expert in email conversion copy',
      performance: 4.5,
      version: 2
    },
    {
      id: 'agent-3',
      name: 'Social Media Specialist',
      type: 'agent',
      status: 'active',
      description: 'Creates engaging social media content',
      performance: 4.2,
      version: 1
    }
  ],
  links: [
    { source: 'strategy-1', target: 'plugin-1', value: 1 },
    { source: 'strategy-1', target: 'plugin-3', value: 1 },
    { source: 'strategy-1', target: 'agent-1', value: 1 },
    { source: 'strategy-2', target: 'plugin-2', value: 1 },
    { source: 'strategy-2', target: 'agent-2', value: 1 },
    { source: 'plugin-1', target: 'agent-1', value: 1 },
    { source: 'plugin-2', target: 'agent-2', value: 1 },
    { source: 'plugin-3', target: 'agent-3', value: 1 }
  ]
};
