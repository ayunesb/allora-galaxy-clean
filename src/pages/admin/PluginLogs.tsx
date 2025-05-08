import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent
} from '@/components/ui/dropdown-menu';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  ChevronDown, Filter, RefreshCw, Calendar, Clock, 
  CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface PluginLog {
  id: string;
  strategy_id?: string;
  plugin_id?: string;
  agent_version_id?: string;
  tenant_id?: string;
  status: string;
  input?: any;
  output?: any;
  error?: string;
  created_at?: string;
  execution_time?: number;
  xp_earned?: number;
}

export default function PluginLogs() {
  const { currentTenant } = useWorkspace();
  const { toast } = useToast();
  const [pluginLogs, setPluginLogs] = useState<PluginLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchPluginLogs();
  }, [currentTenant?.id, statusFilter, dateFilter, sortBy, sortOrder]);

  const fetchPluginLogs = async () => {
    if (!currentTenant?.id) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('plugin_logs')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (dateFilter) {
        const formattedDate = format(dateFilter, 'yyyy-MM-dd');
        query = query.gte('created_at', `${formattedDate} 00:00:00`).lt('created_at', `${formattedDate} 23:59:59`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setPluginLogs(data as PluginLog[]);
    } catch (error: any) {
      console.error('Error fetching plugin logs:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch plugin logs: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setDateFilter(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failure': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 mr-2" />;
      case 'failure': return <XCircle className="h-4 w-4 mr-2" />;
      case 'pending': return <Clock className="h-4 w-4 mr-2" />;
      default: return <AlertCircle className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Plugin Logs</CardTitle>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8">
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Filters</span>
                  <ChevronDown className="h-4 w-4 ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <div className="px-2 py-1">
                  <p className="text-sm font-medium">Status</p>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failure">Failure</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="px-2 py-1">
                  <p className="text-sm font-medium">Date</p>
                  {/* Implement Date Picker Here */}
                  <Button variant="ghost" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    {dateFilter ? format(dateFilter, 'MMM d, yyyy') : 'Select Date'}
                  </Button>
                </div>
                <Separator />
                <div className="p-2">
                  <Button variant="ghost" className="w-full justify-start" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="h-8" onClick={fetchPluginLogs} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Plugin</TableHead>
                <TableHead>Agent Version</TableHead>
                <TableHead>Execution Time</TableHead>
                <TableHead>XP Earned</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  {Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                    </TableRow>
                  ))}
                </>
              ) : pluginLogs.length > 0 ? (
                pluginLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge className={getStatusColor(log.status)}>
                        {getStatusIcon(log.status)}
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.strategy_id}</TableCell>
                    <TableCell>{log.plugin_id}</TableCell>
                    <TableCell>{log.agent_version_id}</TableCell>
                    <TableCell>{log.execution_time}</TableCell>
                    <TableCell>{log.xp_earned}</TableCell>
                    <TableCell>
                      {log.created_at ? format(new Date(log.created_at), 'MMM d, yyyy h:mm:ss a') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No plugin logs found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
