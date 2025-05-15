
/**
 * Mock data for error trends testing
 */
export const mockErrorTrends = [
  {
    id: '1',
    date: '2023-01-01',
    created_at: '2023-01-01T10:00:00Z',
    timestamp: '2023-01-01T10:00:00Z',
    module: 'api',
    level: 'error',
    event: 'api_error',
    event_type: 'error',
    description: 'API request failed',
    message: 'API Error',
    severity: 'high',
    error_type: 'NetworkError',
    context: { url: '/api/data' },
    metadata: { severity: 'high' },
    request_id: 'req-123',
    tenant_id: 'tenant-1',
    error_message: 'Network request failed with status 500'
  },
  {
    id: '2',
    date: '2023-01-02',
    created_at: '2023-01-02T11:30:00Z',
    timestamp: '2023-01-02T11:30:00Z',
    module: 'auth',
    level: 'error',
    event: 'auth_error',
    event_type: 'error',
    description: 'Authentication failed',
    message: 'Auth Error',
    severity: 'critical',
    error_type: 'AuthError',
    context: { userId: '123' },
    metadata: { severity: 'critical' },
    request_id: 'req-124',
    tenant_id: 'tenant-1',
    error_message: 'Invalid JWT token'
  },
  {
    id: '3',
    date: '2023-01-02',
    created_at: '2023-01-02T14:15:00Z',
    timestamp: '2023-01-02T14:15:00Z',
    module: 'database',
    level: 'error',
    event: 'db_error',
    event_type: 'error',
    description: 'Database query failed',
    message: 'Database Error',
    severity: 'medium',
    error_type: 'DatabaseError',
    context: { query: 'SELECT * FROM users' },
    metadata: { severity: 'medium' },
    request_id: 'req-125',
    tenant_id: 'tenant-1',
    error_message: 'Constraint violation'
  },
  {
    id: '4',
    date: '2023-01-03',
    created_at: '2023-01-03T09:45:00Z',
    timestamp: '2023-01-03T09:45:00Z',
    module: 'system',
    level: 'error',
    event: 'system_error',
    event_type: 'error',
    description: 'System process failed',
    message: 'System Error',
    severity: 'low',
    error_type: 'SystemError',
    context: { processId: '789' },
    metadata: { severity: 'low' },
    request_id: 'req-126',
    tenant_id: 'tenant-1',
    error_message: 'Process terminated unexpectedly'
  },
  {
    id: '5',
    date: '2023-01-04',
    created_at: '2023-01-04T16:20:00Z',
    timestamp: '2023-01-04T16:20:00Z',
    module: 'api',
    level: 'error',
    event: 'api_error',
    event_type: 'error',
    description: 'External API timeout',
    message: 'API Timeout',
    severity: 'high',
    error_type: 'TimeoutError',
    context: { endpoint: '/external/data' },
    metadata: { severity: 'high' },
    request_id: 'req-127',
    tenant_id: 'tenant-1',
    error_message: 'Request timed out after 30s'
  }
];

/**
 * Mock data for error groups testing
 */
export const mockErrorGroups = [
  {
    id: 'group-1',
    error_type: 'NetworkError',
    message: 'API request failed',
    count: 12,
    severity: 'high',
    first_seen: '2023-01-01T10:00:00Z',
    last_seen: '2023-01-04T14:30:00Z',
    affected_users: 5,
    affected_tenants: 1,
    modules: ['api'],
    examples: [mockErrorTrends[0]]
  },
  {
    id: 'group-2',
    error_type: 'AuthError',
    message: 'Authentication failed',
    count: 8,
    severity: 'critical',
    first_seen: '2023-01-02T11:30:00Z',
    last_seen: '2023-01-05T09:15:00Z',
    affected_users: 3,
    affected_tenants: 1,
    modules: ['auth'],
    examples: [mockErrorTrends[1]]
  },
  {
    id: 'group-3',
    error_type: 'DatabaseError',
    message: 'Database query failed',
    count: 5,
    severity: 'medium',
    first_seen: '2023-01-02T14:15:00Z',
    last_seen: '2023-01-04T11:40:00Z',
    affected_users: 2,
    affected_tenants: 1,
    modules: ['database'],
    examples: [mockErrorTrends[2]]
  }
];

/**
 * Function to generate mock error trends data for a date range
 */
export function generateMockErrorData(startDate: Date, endDate: Date, baseCount = 10) {
  const result = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split('T')[0];
    const randomFactor = Math.random() * 0.5 + 0.75; // Random between 0.75 and 1.25
    
    const criticalCount = Math.floor(baseCount * 0.1 * randomFactor);
    const highCount = Math.floor(baseCount * 0.3 * randomFactor);
    const mediumCount = Math.floor(baseCount * 0.4 * randomFactor);
    const lowCount = Math.floor(baseCount * 0.2 * randomFactor);
    const totalCount = criticalCount + highCount + mediumCount + lowCount;
    
    result.push({
      date: dateString,
      total: totalCount,
      critical: criticalCount,
      high: highCount,  
      medium: mediumCount,
      low: lowCount
    });
    
    // Increment to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
}
