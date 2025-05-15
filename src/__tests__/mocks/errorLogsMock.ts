
export const mockErrorLogs = [
  {
    id: '1',
    message: 'Connection timeout',
    module: 'database',
    level: 'error',
    count: 5,
    first_seen: '2023-06-01T10:00:00Z',
    last_seen: '2023-06-01T11:00:00Z',
  },
  {
    id: '2',
    message: 'API rate limit exceeded',
    module: 'api',
    level: 'warning',
    count: 12,
    first_seen: '2023-06-01T09:30:00Z',
    last_seen: '2023-06-01T10:45:00Z',
  },
  {
    id: '3',
    message: 'User authentication failed',
    module: 'auth',
    level: 'error',
    count: 3,
    first_seen: '2023-06-01T08:15:00Z',
    last_seen: '2023-06-01T09:20:00Z',
  }
];

export const mockErrorTrends = [
  { date: '2023-05-25', total: 12, critical: 2, high: 4, medium: 4, low: 2 },
  { date: '2023-05-26', total: 8, critical: 1, high: 3, medium: 2, low: 2 },
  { date: '2023-05-27', total: 15, critical: 3, high: 5, medium: 4, low: 3 },
  { date: '2023-05-28', total: 10, critical: 1, high: 3, medium: 4, low: 2 },
  { date: '2023-05-29', total: 7, critical: 0, high: 2, medium: 3, low: 2 },
  { date: '2023-05-30', total: 14, critical: 2, high: 4, medium: 5, low: 3 },
  { date: '2023-05-31', total: 11, critical: 1, high: 3, medium: 4, low: 3 },
];

export const mockErrorGroups = [
  {
    id: '1',
    name: 'Database Connection Issues',
    count: 245,
    severity: 'critical',
    last_occurred: '2023-06-01T10:30:00Z',
    trend: 'increasing',
    affected_users: 58,
    first_seen: '2023-05-15T08:25:00Z',
  },
  {
    id: '2',
    name: 'Authentication Failures',
    count: 187,
    severity: 'high',
    last_occurred: '2023-06-01T09:15:00Z',
    trend: 'stable',
    affected_users: 42,
    first_seen: '2023-05-20T14:10:00Z',
  },
  {
    id: '3',
    name: 'API Response Timeouts',
    count: 136,
    severity: 'medium',
    last_occurred: '2023-06-01T11:05:00Z',
    trend: 'decreasing',
    affected_users: 87,
    first_seen: '2023-05-18T11:30:00Z',
  },
  {
    id: '4',
    name: 'UI Rendering Errors',
    count: 98,
    severity: 'low',
    last_occurred: '2023-06-01T08:45:00Z',
    trend: 'increasing',
    affected_users: 31,
    first_seen: '2023-05-25T16:20:00Z',
  },
];
