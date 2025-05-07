
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnDef,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { ChevronDown, AlertCircle, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Define types for plugin logs
interface PluginLog {
  id: string;
  plugin_id: string;
  plugin_name?: string;
  strategy_id: string;
  strategy_name?: string;
  agent_version_id: string;
  status: 'success' | 'failure' | 'pending';
  execution_time: number;
  xp_earned: number;
  created_at: string;
  error?: string;
  input?: any;
  output?: any;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const truncate = (str: string, length = 30) => {
  return str && str.length > length ? str.substring(0, length) + '...' : str;
};

const StatusBadge = ({ status }: { status: PluginLog['status'] }) => {
  const variant = 
    status === 'success' ? 'success' :
    status === 'failure' ? 'destructive' : 
    'outline';
  
  return <Badge variant={variant}>{status}</Badge>;
};

const PluginLogs: React.FC = () => {
  const [logs, setLogs] = useState<PluginLog[]>([]);
  const [plugins, setPlugins] = useState<{id: string, name: string}[]>([]);
  const [strategies, setStrategies] = useState<{id: string, title: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<string>('');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  const tenantId = useTenantId();
  const { toast } = useToast();
  const { currentRole } = useWorkspace();
  
  // Check if user has admin privileges
  const isAdmin = currentRole === 'admin' || currentRole === 'owner';
  
  // Define columns for the table
  const columns: ColumnDef<PluginLog>[] = useMemo(() => [
    {
      accessorKey: 'plugin_name',
      header: 'Plugin',
      cell: ({ row }) => <span className="font-medium">{row.original.plugin_name || 'Unknown Plugin'}</span>,
    },
    {
      accessorKey: 'strategy_name',
      header: 'Strategy',
      cell: ({ row }) => truncate(row.original.strategy_name || 'Direct Execution'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'execution_time',
      header: 'Time (ms)',
      cell: ({ row }) => <span>{row.original.execution_time.toFixed(2)}</span>,
    },
    {
      accessorKey: 'xp_earned',
      header: 'XP',
      cell: ({ row }) => <span>{row.original.xp_earned}</span>,
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => <span>{formatDate(row.original.created_at)}</span>,
    },
    {
      id: 'details',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Details <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-96">
            <div className="p-4">
              <h3 className="font-bold">Log Details</h3>
              {row.original.error && (
                <div className="mt-2">
                  <strong className="text-red-500">Error:</strong>
                  <pre className="text-xs text-red-500 mt-1 p-2 bg-red-50 rounded overflow-x-auto">
                    {row.original.error}
                  </pre>
                </div>
              )}
              {row.original.input && (
                <div className="mt-2">
                  <strong>Input:</strong>
                  <pre className="text-xs mt-1 p-2 bg-gray-50 rounded overflow-x-auto">
                    {JSON.stringify(row.original.input, null, 2)}
                  </pre>
                </div>
              )}
              {row.original.output && (
                <div className="mt-2">
                  <strong>Output:</strong>
                  <pre className="text-xs mt-1 p-2 bg-gray-50 rounded overflow-x-auto">
                    {JSON.stringify(row.original.output, null, 2)}
                  </pre>
                </div>
              )}
              <div className="mt-2">
                <strong>ID:</strong> <span className="text-xs">{row.original.id}</span>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);
  
  // Set up table
  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });
  
  // Function to load plugins for filter dropdown
  const loadPlugins = async () => {
    if (!tenantId) return;
    
    try {
      const { data, error } = await supabase
        .from('plugins')
        .select('id, name')
        .eq('tenant_id', tenantId);
      
      if (error) throw error;
      
      setPlugins(data || []);
    } catch (err: any) {
      console.error('Error loading plugins:', err);
    }
  };
  
  // Function to load strategies for filter dropdown
  const loadStrategies = async () => {
    if (!tenantId) return;
    
    try {
      const { data, error } = await supabase
        .from('strategies')
        .select('id, title')
        .eq('tenant_id', tenantId);
      
      if (error) throw error;
      
      setStrategies(data || []);
    } catch (err: any) {
      console.error('Error loading strategies:', err);
    }
  };
  
  // Function to load plugin logs
  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!tenantId) {
        throw new Error('No tenant selected');
      }
      
      // Base query
      let query = supabase
        .from('plugin_logs')
        .select(`
          id,
          plugin_id,
          strategy_id,
          agent_version_id,
          status,
          execution_time,
          xp_earned,
          created_at,
          error,
          input,
          output
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (selectedPlugin) {
        query = query.eq('plugin_id', selectedPlugin);
      }
      
      if (selectedStrategy) {
        query = query.eq('strategy_id', selectedStrategy);
      }
      
      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
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
      
      // Limited to 100 logs for now, could implement pagination for more
      query = query.limit(100);
      
      const { data: logData, error: logsError } = await query;
      
      if (logsError) throw logsError;
      
      // If there's no data, return early
      if (!logData?.length) {
        setLogs([]);
        setLoading(false);
        return;
      }
      
      // Get plugin names
      const pluginIds = [...new Set(logData.map(log => log.plugin_id).filter(Boolean))];
      const { data: pluginData, error: pluginError } = await supabase
        .from('plugins')
        .select('id, name')
        .in('id', pluginIds);
      
      if (pluginError) throw pluginError;
      
      const pluginLookup: Record<string, string> = {};
      pluginData?.forEach(p => {
        pluginLookup[p.id] = p.name;
      });
      
      // Get strategy names
      const strategyIds = [...new Set(logData.map(log => log.strategy_id).filter(Boolean))];
      const { data: strategyData, error: strategyError } = await supabase
        .from('strategies')
        .select('id, title')
        .in('id', strategyIds);
      
      if (strategyError) throw strategyError;
      
      const strategyLookup: Record<string, string> = {};
      strategyData?.forEach(s => {
        strategyLookup[s.id] = s.title;
      });
      
      // Combine the data
      const logsWithNames = logData.map(log => ({
        ...log,
        plugin_name: log.plugin_id ? pluginLookup[log.plugin_id] : undefined,
        strategy_name: log.strategy_id ? strategyLookup[log.strategy_id] : undefined
      }));
      
      setLogs(logsWithNames);
    } catch (err: any) {
      console.error('Error loading plugin logs:', err);
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
  
  // Load data when filters change
  useEffect(() => {
    if (tenantId) {
      loadLogs();
    }
  }, [tenantId, selectedPlugin, selectedStrategy, selectedDate, selectedStatus]);
  
  // Load dropdown data on initial load
  useEffect(() => {
    if (tenantId) {
      loadPlugins();
      loadStrategies();
    }
  }, [tenantId]);
  
  // Reset filters
  const resetFilters = () => {
    setSelectedPlugin('');
    setSelectedStrategy('');
    setSelectedDate(undefined);
    setSelectedStatus('');
  };
  
  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to access this page. Please contact your administrator.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Plugin Logs</CardTitle>
          <CardDescription>
            View execution logs for all plugins in your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <Select value={selectedPlugin} onValueChange={setSelectedPlugin}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Filter by plugin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All plugins</SelectItem>
                  {plugins.map(plugin => (
                    <SelectItem key={plugin.id} value={plugin.id}>
                      {plugin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto">
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Filter by strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All strategies</SelectItem>
                  {strategies.map(strategy => (
                    <SelectItem key={strategy.id} value={strategy.id}>
                      {strategy.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
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
            
            <Button variant="outline" onClick={resetFilters}>
              Clear filters
            </Button>
            
            <Button variant="outline" onClick={loadLogs} className="ml-auto">
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
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8">
                      <div className="flex justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                      </div>
                      <p className="mt-2 text-gray-500">Loading logs...</p>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8">
                      <p className="text-gray-500">No logs found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try changing the filters or run some plugin executions
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {loading ? (
                "Loading..."
              ) : (
                `Showing ${table.getRowModel().rows.length} of ${logs.length} logs`
              )}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginLogs;
