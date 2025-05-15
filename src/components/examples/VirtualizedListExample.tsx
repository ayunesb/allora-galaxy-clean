
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VirtualizedDataTable } from '@/components/ui/virtualized-data-table';
import { useToast } from '@/components/ui/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, RefreshCw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useOptimizedDebounce } from '@/hooks/useOptimizedDebounce';

// Example data type
interface ExampleItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  created: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

// Generate sample data
const generateData = (count: number): ExampleItem[] => {
  const statuses = ['active', 'inactive', 'pending'] as const;
  const categories = ['marketing', 'sales', 'support', 'product', 'engineering'];
  const priorities = ['low', 'medium', 'high'] as const;
  
  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 365));
    
    return {
      id: `item-${i}`,
      name: `Example Item ${i}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      created: date.toISOString(),
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)]
    };
  });
};

const VirtualizedListExample: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<ExampleItem[]>(generateData(100));
  const [activeTab, setActiveTab] = useState('small');
  
  // Use optimized debounce hook for search
  const { debouncedValue: debouncedSearch } = useOptimizedDebounce(searchQuery, 300);
  
  // Memoized columns definition
  const columns = useMemo<ColumnDef<ExampleItem>[]>(() => [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        let className = 'px-2 py-1 rounded-full text-xs capitalize';
        
        switch (status) {
          case 'active':
            className += ' bg-green-100 text-green-800';
            break;
          case 'inactive':
            className += ' bg-gray-100 text-gray-800';
            break;
          case 'pending':
            className += ' bg-amber-100 text-amber-800';
            break;
        }
        
        return <span className={className}>{status}</span>;
      }
    },
    {
      id: 'created',
      header: 'Created',
      cell: ({ row }) => {
        return new Date(row.original.created).toLocaleDateString();
      }
    },
    {
      id: 'category',
      header: 'Category',
      cell: ({ row }) => <span className="capitalize">{row.original.category}</span>
    },
    {
      id: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.original.priority;
        let className = 'px-2 py-1 rounded-full text-xs capitalize';
        
        switch (priority) {
          case 'high':
            className += ' bg-red-100 text-red-800';
            break;
          case 'medium':
            className += ' bg-blue-100 text-blue-800';
            break;
          case 'low':
            className += ' bg-green-100 text-green-800';
            break;
        }
        
        return <span className={className}>{priority}</span>;
      }
    }
  ], []);
  
  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!debouncedSearch) return items;
    
    const lowercaseQuery = debouncedSearch.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery) ||
      item.status.toLowerCase().includes(lowercaseQuery)
    );
  }, [items, debouncedSearch]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const count = activeTab === 'small' ? 100 : 
                   activeTab === 'medium' ? 1000 : 
                   10000;
                   
      setItems(generateData(count));
      setIsLoading(false);
      
      toast({
        title: `Refreshed ${count} items`,
        description: 'The data has been regenerated',
      });
    }, 500);
  };
  
  // Handle row click
  const handleRowClick = (item: ExampleItem) => {
    toast({
      title: `Selected: ${item.name}`,
      description: `Category: ${item.category}, Status: ${item.status}`,
    });
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsLoading(true);
    
    setTimeout(() => {
      const count = value === 'small' ? 100 : 
                   value === 'medium' ? 1000 : 
                   10000;
                   
      setItems(generateData(count));
      setIsLoading(false);
      
      toast({
        title: `Loaded ${count} items`,
        description: 'The data set has been changed',
      });
    }, 500);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Virtualized List Example</CardTitle>
        <CardDescription>
          Demonstrating optimized rendering of large datasets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="small">Small (100 items)</TabsTrigger>
              <TabsTrigger value="medium">Medium (1,000 items)</TabsTrigger>
              <TabsTrigger value="large">Large (10,000 items)</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Tabs>
        
        <div className="mb-2 text-sm text-muted-foreground">
          Showing {filteredData.length} items
          {debouncedSearch && ` matching "${debouncedSearch}"`}
        </div>
        
        <VirtualizedDataTable
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          height="500px"
          pagination={activeTab === 'small'}
          pageSize={25}
          className="border rounded-md"
          virtualizeRows={activeTab !== 'small'}
        />
      </CardContent>
    </Card>
  );
};

export default React.memo(VirtualizedListExample);
