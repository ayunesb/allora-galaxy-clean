import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Clock, FileText, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AiDecisions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTenant } = useWorkspace();
  const [decisions, setDecisions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    if (currentTenant?.id) {
      fetchDecisions();
    }
  }, [currentTenant?.id, activeTab]);

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('ai_decisions')
        .select('*')
        .eq('tenant_id', currentTenant?.id);
      
      if (activeTab !== 'all') {
        query = query.eq('category', activeTab);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      setDecisions(data || []);
    } catch (err: any) {
      console.error('Error fetching AI decisions:', err);
      toast({
        title: 'Error',
        description: 'Failed to load AI decisions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchDecisions();
      return;
    }
    
    const filteredDecisions = decisions.filter(
      (decision) =>
        decision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        decision.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        decision.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setDecisions(filteredDecisions);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchQuery('');
  };

  const handleViewDecision = (id: string) => {
    navigate(`/admin/ai-decisions/${id}`);
  };

  const getCategoryBadge = (category: string) => {
    const categories: Record<string, { color: string; label: string }> = {
      strategy: { color: 'bg-blue-100 text-blue-800', label: 'Strategy' },
      content: { color: 'bg-green-100 text-green-800', label: 'Content' },
      marketing: { color: 'bg-purple-100 text-purple-800', label: 'Marketing' },
      product: { color: 'bg-yellow-100 text-yellow-800', label: 'Product' },
      support: { color: 'bg-red-100 text-red-800', label: 'Support' },
    };

    const categoryInfo = categories[category.toLowerCase()] || {
      color: 'bg-gray-100 text-gray-800',
      label: category,
    };

    return (
      <Badge className={`${categoryInfo.color}`}>
        {categoryInfo.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">AI Decisions</h1>
        <Button onClick={() => navigate('/admin')}>Back to Admin</Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filter Decisions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-3 md:grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="strategy">Strategy</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="marketing">Marketing</TabsTrigger>
                <TabsTrigger value="product">Product</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <form onSubmit={handleSearch} className="flex w-full md:w-auto">
              <Input
                placeholder="Search decisions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mr-2"
              />
              <Button type="submit" variant="secondary">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
        </div>
      ) : decisions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No decisions found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery
                ? "No decisions match your search criteria. Try a different search term."
                : "There are no AI decisions recorded for this category yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {decisions.map((decision) => (
            <Card key={decision.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium mb-1">{decision.title}</h3>
                    <p className="text-muted-foreground line-clamp-2 mb-3">
                      {decision.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {format(new Date(decision.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>
                          {format(new Date(decision.created_at), 'h:mm a')}
                        </span>
                      </div>
                      {getCategoryBadge(decision.category)}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDecision(decision.id)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
