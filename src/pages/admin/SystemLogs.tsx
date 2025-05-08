import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertCircle, RefreshCw, Filter } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import AdminGuard from '@/components/guards/AdminGuard';

interface SystemLog {
  id: string;
  tenant_id: string;
  module: string;
  event: string;
  created_at: string;
  context: any;
}

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modules, setModules] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  
  const tenantId = useTenantId();
  const { toast } = useToast();
  
  const loadSystemLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!tenantId) {
        throw new Error('No tenant selected');
      }
      
      // Base query
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (selectedModule) {
        query = query.eq('module', selectedModule);
      }
      
      if (selectedEvent) {
        query = query.eq('event', selectedEvent);
      }
      
      if (selectedDate) {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());
      }
      
      if (searchTerm) {
        query = query.textSearch('event', searchTerm);
      }
      
      // Limited to 100 logs for now
      query = query.limit(100);
      
      const { data, error: logsError } = await query;
      
      if (logsError) throw logsError;
      
      setLogs(data || []);
      
      // Extract unique modules and events for filters
      if (data) {
        const uniqueModules = [...new Set(data.map(log => log.module))];
        const uniqueEvents = [...new Set(data.map(log => log.event))];
        setModules(uniqueModules);
        setEvents(uniqueEvents);
      }
      
    } catch (err: any) {
      console.error('Error loading system logs:', err);
      setError(err.message);
      toast({
        title: 'Error loading logs',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (tenantId) {
      loadSystemLogs();
    }
  }, [tenantId, selectedModule, selectedEvent, selectedDate]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  const getModuleBadge = (module: string) => {
    switch (module.toLowerCase()) {
      case 'auth':
        return <Badge variant="outline" className="bg-blue-100">Auth</Badge>;
      case 'strategy':
        return <Badge variant="outline" className="bg-green-100">Strategy</Badge>;
      case 'plugin':
        return <Badge variant="outline" className="bg-purple-100">Plugin</Badge>;
      case 'agent':
        return <Badge variant="outline" className="bg-yellow-100">Agent</Badge>;
      case 'system':
        return <Badge variant="outline" className="bg-gray-100">System</Badge>;
      default:
        return <Badge variant="outline">{module}</Badge>;
    }
  };
  
  const resetFilters = () => {
    setSelectedModule('');
    setSelectedEvent('');
    setSelectedDate(undefined);
    setSearchTerm('');
  };
  
  return (
    <AdminGuard>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>System Logs</CardTitle>
            <CardDescription>
              View system activity and event logs for your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="w-full sm:w-auto">
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All modules</SelectItem>
                    {modules.map(module => (
                      <SelectItem key={module} value={module}>
                        {module}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-auto">
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All events</SelectItem>
                    {events.map(event => (
                      <SelectItem key={event} value={event}>
                        {event}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-[200px] justify-start text-left font-normal"
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : "Filter by date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="w-full sm:w-auto flex-1">
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Button variant="outline" onClick={resetFilters}>
                Clear filters
              </Button>
              
              <Button variant="outline" onClick={loadSystemLogs}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Context</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex justify-center">
                          <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                        </div>
                        <p className="mt-2 text-gray-500">Loading logs...</p>
                      </TableCell>
                    </TableRow>
                  ) : logs.length ? (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>
                          {getModuleBadge(log.module)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{log.event}</span>
                        </TableCell>
                        <TableCell>
                          {log.context ? (
                            <pre className="text-xs whitespace-pre-wrap max-w-xs overflow-x-auto">
                              {JSON.stringify(log.context, null, 2)}
                            </pre>
                          ) : (
                            <span className="text-gray-500 italic">No context data</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <p className="text-gray-500">No logs found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try clearing filters or using the system to generate events
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
};

export default SystemLogs;
