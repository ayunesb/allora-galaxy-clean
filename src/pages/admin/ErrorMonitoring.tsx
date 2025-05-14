
import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import ErrorTrendsChart from '@/components/admin/errors/ErrorTrendsChart';
import ErrorGroupsList from '@/components/admin/errors/ErrorGroupsList';
import ErrorRateAlerts from '@/components/admin/errors/ErrorRateAlerts';
import ErrorImpactAnalysis from '@/components/admin/errors/ErrorImpactAnalysis';
import ErrorMonitoringFilters from '@/components/admin/errors/ErrorMonitoringFilters';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Calendar } from 'lucide-react';
import { addDays } from 'date-fns';

const ErrorMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date | undefined;
  }>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // Initialize with error filter
  const { 
    errorLogs,
    isLoading, 
    filters, 
    updateFilters, 
    refetch,
    errorStats
  } = useSystemLogsData({
    module: ['system', 'database', 'auth', 'api'], 
    level: ['error'],
    fromDate: dateRange.from.toISOString(),
    toDate: dateRange.to?.toISOString(),
  });
  
  // Handle date range change
  const handleDateRangeChange = (range: { from: Date; to: Date | undefined }) => {
    setDateRange(range);
    updateFilters({
      fromDate: range.from.toISOString(),
      toDate: range.to?.toISOString()
    });
  };
  
  return (
    <div className="container py-6">
      <PageHeader
        title="Error Monitoring"
        description="Monitor and analyze system errors across your application"
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <ErrorMonitoringFilters 
          filters={filters} 
          onFiltersChange={updateFilters} 
          isLoading={isLoading}
          onRefresh={refetch}
        />
        
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 opacity-50" />
          <DatePickerWithRange
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Error Trends</TabsTrigger>
          <TabsTrigger value="groups">Error Groups</TabsTrigger>
          <TabsTrigger value="impact">User Impact</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <ErrorTrendsChart 
                  logs={errorLogs} 
                  dateRange={dateRange} 
                  isLoading={isLoading} 
                  type="rate"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Alert Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <ErrorRateAlerts />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Errors</CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-destructive"></span>
                    <span className="text-muted-foreground">Critical: {errorStats.criticalErrors}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <span className="text-muted-foreground">High: {errorStats.highErrors}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    <span className="text-muted-foreground">Other: {errorStats.mediumErrors + errorStats.lowErrors}</span>
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ErrorGroupsList 
                  logs={errorLogs.slice(0, 10)} 
                  isLoading={isLoading} 
                  showPriority 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Error Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorTrendsChart 
                logs={errorLogs} 
                dateRange={dateRange} 
                isLoading={isLoading} 
                type="full"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle>Error Groups</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ErrorGroupsList 
                logs={errorLogs} 
                isLoading={isLoading} 
                showPriority
                showFrequency
                showFirstSeen
                showLastSeen
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="impact">
          <ErrorImpactAnalysis 
            logs={errorLogs} 
            isLoading={isLoading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ErrorMonitoring;
