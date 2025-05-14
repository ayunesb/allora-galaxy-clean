
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
import { Search, Filter, X, ChevronDown, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { SystemLog } from '@/types/logs';
import { supabase } from '@/integrations/supabase/client';

type SearchEntity = 'logs' | 'users' | 'plugins' | 'strategies' | 'executions';

interface SearchResult {
  id: string;
  type: SearchEntity;
  title: string;
  subtitle: string;
  date: string;
  badges: {
    text: string;
    variant?: string;
  }[];
  [key: string]: any;
}

const entityLabels: Record<SearchEntity, string> = {
  logs: 'System Logs',
  users: 'Users',
  plugins: 'Plugins',
  strategies: 'Strategies',
  executions: 'Executions'
};

export function AdvancedSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchEntity, setSearchEntity] = useState<SearchEntity>('logs');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{from?: Date; to?: Date}>({});
  
  const handleSearch = useCallback(async () => {
    if (!searchTerm && !dateRange.from && !dateRange.to) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      let query;
      
      switch (searchEntity) {
        case 'logs':
          query = supabase
            .from('system_logs')
            .select('*')
            .or(`event.ilike.%${searchTerm}%,module.ilike.%${searchTerm}%,context.ilike.%${searchTerm}%`)
            .order('created_at', { ascending: false })
            .limit(20);
            
          if (dateRange.from) {
            query = query.gte('created_at', dateRange.from.toISOString());
          }
          
          if (dateRange.to) {
            query = query.lte('created_at', dateRange.to.toISOString());
          }
          
          const { data: logData, error: logError } = await query;
          
          if (logError) throw logError;
          
          const transformedLogs = logData.map(log => ({
            id: log.id,
            type: 'logs' as const,
            title: log.event,
            subtitle: `Module: ${log.module}`,
            date: log.created_at,
            badges: [
              { text: log.module, variant: 'outline' },
              { text: log.severity || 'info', variant: getSeverityVariant(log.severity) }
            ],
            ...log
          }));
          
          setResults(transformedLogs);
          break;
          
        case 'users':
          // Mock data for users search - in a real app, use proper queries
          setResults([
            {
              id: '1',
              type: 'users',
              title: 'John Smith',
              subtitle: 'john.smith@example.com',
              date: new Date().toISOString(),
              badges: [{ text: 'admin', variant: 'default' }]
            },
            {
              id: '2',
              type: 'users',
              title: 'Alice Johnson',
              subtitle: 'alice.johnson@example.com',
              date: new Date().toISOString(),
              badges: [{ text: 'member', variant: 'outline' }]
            }
          ]);
          break;
          
        // Add other entity types as needed
        default:
          setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, searchEntity, dateRange]);
  
  // Get badge variant based on severity
  const getSeverityVariant = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'error':
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'debug':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  // View details handler
  const handleViewDetails = (result: SearchResult) => {
    console.log('View details:', result);
    // Implement navigation to detail view based on result type
  };
  
  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({});
    setResults([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Advanced Search</CardTitle>
        <CardDescription>
          Search across system data with advanced filtering
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <Select value={searchEntity} onValueChange={(value) => setSearchEntity(value as SearchEntity)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(entityLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <>Searching...</>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={clearFilters}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {showFilters && (
            <div className="p-4 border rounded-md bg-muted/20 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Add date pickers and other filters here */}
                <div>
                  <p className="text-sm font-medium mb-2">Date Range</p>
                  <div className="flex gap-2">
                    <Input 
                      type="date" 
                      value={dateRange.from?.toISOString().split('T')[0] || ''} 
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        setDateRange(prev => ({ ...prev, from: date }));
                      }}
                    />
                    <Input 
                      type="date"
                      value={dateRange.to?.toISOString().split('T')[0] || ''} 
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        setDateRange(prev => ({ ...prev, to: date }));
                      }}
                    />
                  </div>
                </div>
                
                {/* Additional filters based on entity type */}
                {searchEntity === 'logs' && (
                  <div>
                    <p className="text-sm font-medium mb-2">Log Severity</p>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All Severities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
          
          {/* Results table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Timestamp</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`loading-${index}`}>
                      <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-[70px] ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : results.length > 0 ? (
                  results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        <div className="font-medium">{result.title}</div>
                        <div className="text-sm text-muted-foreground">{result.subtitle}</div>
                      </TableCell>
                      <TableCell>{entityLabels[result.type]}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(result.date).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {result.badges.map((badge, idx) => (
                            <Badge key={idx} variant={badge.variant as any || 'secondary'}>
                              {badge.text}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(result)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      {searchTerm ? 'No results found. Try a different search term.' : 'Enter a search term to begin.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
