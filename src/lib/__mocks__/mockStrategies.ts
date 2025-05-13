
import { Strategy } from '@/types';

export const mockStrategies: Strategy[] = [
  {
    id: 'mock-strategy-1',
    tenant_id: 'mock-tenant-1',
    title: 'Q4 2025 Marketing Campaign',
    description: 'Launch a comprehensive marketing campaign targeting new market segments with a focus on social media and content marketing.',
    status: 'pending',
    created_by: 'mock-user-1',
    approved_by: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    tags: ['marketing', 'growth', 'social-media'],
    completion_percentage: 25
  },
  {
    id: 'mock-strategy-2',
    tenant_id: 'mock-tenant-1',
    title: 'Product Feature Prioritization',
    description: 'Analyze user feedback and market trends to prioritize the next set of product features for development in Q1 2026.',
    status: 'draft',
    created_by: 'mock-user-1',
    approved_by: undefined,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: undefined,
    priority: 'medium',
    tags: ['product', 'development', 'user-feedback'],
    completion_percentage: 0
  },
  {
    id: 'mock-strategy-3',
    tenant_id: 'mock-tenant-1',
    title: 'Competitive Analysis Report',
    description: 'Complete a detailed analysis of our top 5 competitors, including their strengths, weaknesses, pricing strategies, and market positioning.',
    status: 'pending',
    created_by: 'mock-user-1',
    approved_by: undefined,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'low',
    tags: ['research', 'competitive-analysis', 'market'],
    completion_percentage: 60
  }
];
