
import React, { useState } from 'react';
import PageHelmet from '@/components/PageHelmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSystemLogsData, SystemLog } from '@/hooks/admin/useSystemLogsData';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';

const AiDecisionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('prompts');
  const { 
    logs, 
    loading, 
    filters, 
    updateFilters, 
    refresh, 
    availableModules 
  } = useSystemLogsData({ 
    searchTerm: '',
    module: 'ai' 
  });
  
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewLog = (log: SystemLog) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  return (
    <>
      <PageHelmet 
        title="AI Decisions" 
        description="Review AI decision-making history" 
      />
      
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">AI Decisions</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Decision History</CardTitle>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="prompts">Prompt History</TabsTrigger>
                <TabsTrigger value="decisions">System Decisions</TabsTrigger>
                <TabsTrigger value="user-feedback">User Feedback</TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent>
              <div className="mb-6 mt-2">
                <SystemLogFilters 
                  filters={filters}
                  onFilterChange={updateFilters}
                  availableModules={availableModules}
                  onRefresh={refresh}
                  isLoading={loading}
                />
              </div>
              
              <TabsContent value="prompts" className="mt-0">
                <SystemLogsList 
                  logs={logs.filter(log => log.context?.type === 'prompt')} 
                  isLoading={loading}
                  onViewLog={handleViewLog}
                />
              </TabsContent>
              
              <TabsContent value="decisions" className="mt-0">
                <SystemLogsList 
                  logs={logs.filter(log => log.context?.type === 'decision')} 
                  isLoading={loading}
                  onViewLog={handleViewLog}
                />
              </TabsContent>
              
              <TabsContent value="user-feedback" className="mt-0">
                <SystemLogsList 
                  logs={logs.filter(log => log.context?.type === 'feedback')} 
                  isLoading={loading}
                  onViewLog={handleViewLog}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
      
      <LogDetailDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        log={selectedLog}
      />
    </>
  );
};

export default AiDecisionsPage;
