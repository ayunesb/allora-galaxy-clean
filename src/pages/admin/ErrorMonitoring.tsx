import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/layout/AdminLayout";
import { ErrorBoundary } from "@/components/errors";
import ErrorMonitoringFilters from "@/components/admin/errors/ErrorMonitoringFilters";
import ErrorGroupsList from "@/components/admin/errors/ErrorGroupsList";
import ErrorTrendsChart from "@/components/admin/errors/ErrorTrendsChart";
import AlertSettingsCard from "@/components/admin/errors/AlertSettingsCard";
import { useErrorMonitoring } from "@/hooks/admin/useErrorMonitoring";
import { LogGroup, LogFilters } from "@/types/logs";

const ErrorMonitoring: React.FC = () => {
  const {
    checkErrorThreshold,
    configureAlerts,
    isChecking,
    errorGroups,
    errorTrends,
    alertSettings,
    isLoading,
    filters,
    updateFilters,
    refetchErrors,
  } = useErrorMonitoring();

  const handleFilterChange = (newFilters: LogFilters) => {
    updateFilters(newFilters);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Error Monitoring"
          description="Monitor and analyze system errors and exceptions"
        />

        <ErrorBoundary>
          <ErrorMonitoringFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
            isLoading={isLoading}
            onRefresh={refetchErrors}
          />

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <ErrorGroupsList
                errorGroups={errorGroups}
                isLoading={isLoading}
                onViewDetails={() => {}}
              />
              <ErrorTrendsChart data={errorTrends} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="trends">
              <ErrorTrendsChart data={errorTrends} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="alerts">
              <AlertSettingsCard
                settings={alertSettings}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </ErrorBoundary>
      </div>
    </AdminLayout>
  );
};

export default ErrorMonitoring;
