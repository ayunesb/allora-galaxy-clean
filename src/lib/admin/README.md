
# Admin System

This directory contains utilities and services for administrative functions and monitoring.

## Overview

The admin system includes tools for managing:

- System logs and error monitoring
- User and tenant management
- CRON job monitoring
- API key management
- System health and metrics

## Key Components

### System Logs

The system logs utilities provide access to application logs for monitoring and debugging:

```typescript
// Example usage
import { fetchSystemLogs, fetchLogModules } from '@/lib/admin/systemLogs';

// Fetch logs with filters
const logs = await fetchSystemLogs({
  searchTerm: 'error',
  module: 'api',
  dateRange: {
    from: new Date('2023-01-01'),
    to: new Date()
  }
});

// Get all available log modules for filtering
const modules = await fetchLogModules();
```

### Error Monitoring

Error monitoring utilities help track and analyze application errors:

```typescript
import { useErrorMonitoring } from '@/hooks/admin/useErrorMonitoring';

function ErrorMonitoring() {
  const { checkErrorThreshold, configureAlerts, isChecking } = useErrorMonitoring('tenant-123');
  
  // Configure alerts
  const setupAlerts = async () => {
    await configureAlerts({
      threshold: 5,
      timeframe: 60, // minutes
      recipients: ['admin@example.com'],
      notification_type: 'email',
      severity: 'critical'
    });
  };
  
  // Check current error status
  const checkStatus = async () => {
    const result = await checkErrorThreshold({
      threshold: 5,
      timeframe: 60,
      recipients: ['admin@example.com'],
      notification_type: 'email',
      severity: 'critical'
    });
    
    console.log('Error status:', result);
  };
  
  return (
    // UI implementation
  );
}
```

### CRON Job Monitoring

The CRON job monitoring system tracks scheduled jobs and their execution status:

```typescript
import { useCronJobsMonitoring } from '@/hooks/admin/useCronJobsMonitoring';

function CronMonitoring() {
  const {
    jobs,
    executions,
    isLoading,
    activeTab,
    setActiveTab,
    triggerJobNow
  } = useCronJobsMonitoring();
  
  return (
    // UI implementation
  );
}
```

## System Log Columns

The system provides standardized table columns for displaying logs:

```typescript
import { getSystemLogColumns } from '@/lib/admin/systemLogColumns';

function LogsTable() {
  const handleRowClick = (log) => {
    console.log('Log clicked:', log);
  };
  
  const columns = getSystemLogColumns(handleRowClick);
  
  return (
    <DataTable columns={columns} data={logs} />
  );
}
```

## Chart Data Utilities

The admin system includes utilities for preparing chart data:

```typescript
import { prepareErrorTrendsData } from '@/components/admin/errors/utils/chartDataUtils';

// Prepare data for error trend charts
const chartData = prepareErrorTrendsData(logs, {
  from: new Date('2023-01-01'),
  to: new Date()
});
```

## Best Practices

1. Use appropriate filtering to avoid loading excessive log data
2. Implement pagination for large datasets
3. Configure reasonable alert thresholds to avoid alert fatigue
4. Use appropriate time ranges for trend analysis
5. Include proper access control for admin functionality
6. Implement caching for frequently accessed monitoring data
7. Use optimistic updates for better UX in admin interfaces
