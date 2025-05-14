
import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import { useSystemLogsData, SystemLogFilter } from '@/hooks/admin/useSystemLogsData';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AiDecisionsPage() {
  const [activeTab, setActiveTab] = useState('agent-decisions');
  
  // System logs data hook
  const {
    logs,
    totalCount,
    isLoading,
    currentPage,
    pageSize,
    filters,
    updateFilters,
    goToPage,
    changePageSize,
    refreshLogs,
  } = useSystemLogsData();

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  // Initialize with agent module filter
  React.useEffect(() => {
    updateFilters({
      ...filters,
      module: 'agent'
    });
  }, []);

  // Render pagination controls
  const renderPagination = () => (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to{" "}
        {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm">
          Page {currentPage} of {totalPages || 1}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Select value={pageSize.toString()} onValueChange={(value) => changePageSize(Number(value))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="25">25 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <PageHeader heading="AI Decisions" subheading="Review agent decisions and outcomes" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="agent-decisions">Agent Decisions</TabsTrigger>
          <TabsTrigger value="votes">Agent Votes</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agent-decisions">
          <Card>
            <CardHeader>
              <CardTitle>Agent Decisions</CardTitle>
              <CardDescription>
                Review decisions made by AI agents in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemLogsList
                logs={logs}
                isLoading={isLoading}
                filters={filters as SystemLogFilter}
                setFilters={updateFilters}
                onRefresh={refreshLogs}
                title="Agent Decisions"
                pagination={renderPagination()}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="votes">
          <Card>
            <CardHeader>
              <CardTitle>Agent Votes</CardTitle>
              <CardDescription>
                Review votes cast on agent versions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Agent voting data will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                View performance metrics and trends for agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Agent performance analytics will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
