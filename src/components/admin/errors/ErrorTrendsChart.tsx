
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, startOfDay, eachDayOfInterval } from 'date-fns';
import { SystemLog } from '@/types/logs';
import { Skeleton } from '@/components/ui/skeleton';

interface ErrorTrendsChartProps {
  logs: SystemLog[];
  dateRange: {
    from: Date;
    to: Date | undefined;
  };
  isLoading: boolean;
  type?: 'full' | 'rate' | 'module';
}

const ErrorTrendsChart: React.FC<ErrorTrendsChartProps> = ({ logs, dateRange, isLoading, type = 'full' }) => {
  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    
    const end = dateRange.to || new Date();
    
    // Create dates array for the range
    const dates = eachDayOfInterval({
      start: dateRange.from,
      end
    });
    
    // Initialize counts for each date
    const dateErrorCounts = dates.map(date => ({
      date,
      total: 0,
      critical: 0,
      warning: 0,
      modules: {} as Record<string, number>
    }));
    
    // Count errors per day
    logs.forEach(log => {
      const logDate = startOfDay(parseISO(log.created_at));
      const dateIndex = dateErrorCounts.findIndex(item => 
        item.date.getTime() === logDate.getTime()
      );
      
      if (dateIndex !== -1) {
        dateErrorCounts[dateIndex].total += 1;
        
        // Track by module
        const module = log.module || 'unknown';
        if (!dateErrorCounts[dateIndex].modules[module]) {
          dateErrorCounts[dateIndex].modules[module] = 0;
        }
        dateErrorCounts[dateIndex].modules[module] += 1;
        
        // Track by severity (if available in context)
        const context = log.context || {};
        const severity = context.severity || (
          context.error_type?.includes('Critical') ? 'critical' : 'warning'
        );
        
        if (severity === 'critical') {
          dateErrorCounts[dateIndex].critical += 1;
        } else {
          dateErrorCounts[dateIndex].warning += 1;
        }
      }
    });
    
    // Format for chart display
    return dateErrorCounts.map(item => ({
      date: format(item.date, 'MMM dd'),
      total: item.total,
      critical: item.critical,
      warning: item.warning,
      ...item.modules
    }));
  }, [logs, dateRange]);
  
  // Get unique modules for module-based chart
  const modules = useMemo(() => {
    if (type !== 'module') return [];
    
    const modulesSet = new Set<string>();
    logs.forEach(log => {
      if (log.module) modulesSet.add(log.module);
    });
    
    return Array.from(modulesSet);
  }, [logs, type]);
  
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }
  
  if (chartData.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No error data available for the selected period</div>;
  }
  
  // Render different chart types based on the type prop
  const renderChart = () => {
    switch (type) {
      case 'rate':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d32f2f" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#d32f2f" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#d32f2f" fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'module':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {modules.map((module, index) => (
                <Area 
                  key={module}
                  type="monotone" 
                  dataKey={module} 
                  stackId="1"
                  stroke={`hsl(${index * 40}, 70%, 50%)`} 
                  fill={`hsl(${index * 40}, 70%, 50%)`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'full':
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d32f2f" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#d32f2f" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f57c00" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f57c00" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="critical" stackId="1" stroke="#d32f2f" fillOpacity={1} fill="url(#colorCritical)" name="Critical Errors" />
              <Area type="monotone" dataKey="warning" stackId="1" stroke="#f57c00" fillOpacity={1} fill="url(#colorWarning)" name="Warnings" />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };
  
  return renderChart();
};

export default ErrorTrendsChart;
