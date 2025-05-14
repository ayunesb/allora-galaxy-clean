
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { ErrorState } from '@/components/ui/error-state';

interface SearchResult {
  id: string;
  type: 'user' | 'log' | 'strategy' | 'agent' | 'plugin';
  title: string;
  description: string;
  timestamp: string;
  url: string;
}

interface AdvancedSearchProps {
  placeholder?: string;
  onResultSelected?: (result: SearchResult) => void;
}

export function AdvancedSearch({ 
  placeholder = "Search...",
  onResultSelected 
}: AdvancedSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<string>('all');
  const [submittedSearch, setSubmittedSearch] = useState<{term: string, type: string} | null>(null);

  // Search query
  const { data, isLoading, error } = useQuery({
    queryKey: ['advanced-search', submittedSearch],
    queryFn: async () => {
      if (!submittedSearch || !submittedSearch.term) {
        return { results: [], count: 0 };
      }

      const { term, type } = submittedSearch;

      try {
        const { data, error } = await supabase.functions.invoke('advanced-search', {
          body: { 
            searchTerm: term,
            type: type === 'all' ? undefined : type,
            limit: 20
          }
        });

        if (error) throw new Error(error.message);
        return data as { results: SearchResult[], count: number };
      } catch (err) {
        console.error('Search error:', err);
        throw err;
      }
    },
    enabled: !!submittedSearch?.term,
    staleTime: 60000
  });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setSubmittedSearch({
        term: searchTerm.trim(),
        type: searchType
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      handleSearch();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultSelected) {
      onResultSelected(result);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <Select
          value={searchType}
          onValueChange={setSearchType}
        >
          <SelectTrigger className="w-full sm:w-[120px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="log">Logs</SelectItem>
            <SelectItem value="strategy">Strategies</SelectItem>
            <SelectItem value="agent">Agents</SelectItem>
            <SelectItem value="plugin">Plugins</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} disabled={!searchTerm.trim() || isLoading}>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="animate-spin h-6 w-6 border-t-2 border-primary rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <ErrorState 
          title="Search Error" 
          message={(error as Error).message || "An error occurred during search"} 
          variant="destructive"
          retryable
          onRetry={handleSearch}
        />
      )}

      {data && data.results.length === 0 && submittedSearch?.term && !isLoading && !error && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p>No results found for "{submittedSearch.term}"</p>
          </CardContent>
        </Card>
      )}

      {data && data.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {data.count} {data.count === 1 ? 'result' : 'results'} found
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {data.results.map((result) => (
                <div 
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="p-4 hover:bg-accent cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{result.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                      {result.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {result.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(result.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
