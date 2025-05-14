
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
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SystemLogsPage() {
  const [activeTab, setActiveTab] = useState('system');
  
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

  // Update module filter based on active tab
  React.useEffect(() => {
    let moduleFilter;
    
    switch (activeTab) {
      case 'system':
        moduleFilter = 'system';
        break;
      case 'auth':
        moduleFilter = 'auth';
        break;
      case 'tenant':
        moduleFilter = 'tenant';
        break;
      case 'all':
        moduleFilter = undefined;
        break;
      default:
        moduleFilter = undefined;
    }
    
    updateFilters({ ...filters, module: moduleFilter });
  }, [activeTab]);

  return (
    <div className="container mx-auto py-8">
      <PageHeader heading="System Logs" subheading="Monitor system activities and troubleshoot issues" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="tenant">Tenant</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Logs</CardTitle>
              <CardDescription>
                All system activities across modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemLogsList
                logs={logs}
                isLoading={isLoading}
                filters={filters}
                setFilters={updateFilters}
                onRefresh={refreshLogs}
                pagination={renderPagination()}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>
                Core system operations and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemLogsList
                logs={logs}
                isLoading={isLoading}
                filters={filters}
                setFilters={updateFilters}
                onRefresh={refreshLogs}
                pagination={renderPagination()}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Logs</CardTitle>
              <CardDescription>
                Login attempts, session management, and permission changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemLogsList
                logs={logs}
                isLoading={isLoading}
                filters={filters}
                setFilters={updateFilters}
                onRefresh={refreshLogs}
                pagination={renderPagination()}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tenant">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Logs</CardTitle>
              <CardDescription>
                Tenant creation, updates, and management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemLogsList
                logs={logs}
                isLoading={isLoading}
                filters={filters}
                setFilters={updateFilters}
                onRefresh={refreshLogs}
                pagination={renderPagination()}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
