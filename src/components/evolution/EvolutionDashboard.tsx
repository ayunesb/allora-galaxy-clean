
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import AgentEvolutionTab from './AgentEvolutionTab';
import StrategyEvolutionTab from './StrategyEvolutionTab';
import PluginEvolutionTab from './PluginEvolutionTab';
import { supabase } from '@/lib/supabase';
import { DateRange } from '@/types/logs';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

// EvolutionFilter type to match the DateRange
export interface EvolutionFilter {
  dateRange?: DateRange;
  type?: string;
  status?: string;
  searchTerm?: string;
}

const EvolutionDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('strategy');
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>('');

  // Fetch audit logs using React Query
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    meta: {
      onError: (error: Error) => {
        toast({
          variant: "destructive",
          title: "Failed to load audit logs",
          description: error.message
        });
      }
    }
  });

  const filteredLogs = auditLogs?.filter(log => 
    !filter || 
    log.event?.toLowerCase().includes(filter.toLowerCase()) ||
    log.module?.toLowerCase().includes(filter.toLowerCase()) ||
    log.context?.toString().toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Evolution Dashboard</h1>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="strategy">Strategy Evolution</TabsTrigger>
          <TabsTrigger value="agent">Agent Evolution</TabsTrigger>
          <TabsTrigger value="plugin">Plugin Evolution</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="strategy">
          <StrategyEvolutionTab />
        </TabsContent>
        
        <TabsContent value="agent">
          <AgentEvolutionTab />
        </TabsContent>
        
        <TabsContent value="plugin">
          <PluginEvolutionTab />
        </TabsContent>
        
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Input
                  placeholder="Filter logs..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="max-w-sm"
                />
                <Button 
                  variant="outline" 
                  onClick={() => setFilter('')}
                  disabled={!filter}
                >
                  Clear
                </Button>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredLogs?.length ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.module}</Badge>
                          </TableCell>
                          <TableCell>{log.event}</TableCell>
                          <TableCell className="max-w-md truncate">
                            {log.context ? JSON.stringify(log.context) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p>No audit logs found</p>
                  {filter && <p className="text-sm">Try adjusting your filter</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EvolutionDashboard;
