
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Play, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const BrainPlayground: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [context, setContext] = useState<string>('{}');
  const [response, setResponse] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [responseView, setResponseView] = useState<'pretty' | 'raw'>('pretty');
  const { toast } = useToast();

  const handleRunQuery = async () => {
    if (!query.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a query to run',
        variant: 'destructive',
      });
      return;
    }
    
    if (!apiKey.trim()) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your API key to run the query',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Parse context if provided
      let contextObj = {};
      try {
        contextObj = JSON.parse(context);
      } catch (e) {
        toast({
          title: 'Context Error',
          description: 'Invalid JSON in context field',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      // Make the API call
      const response = await fetch('https://ijrnwpgsqsxzqdemtknz.supabase.co/functions/v1/allora-brain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          query,
          context: contextObj,
        }),
      });
      
      const data = await response.json();
      setResponse(data);
      
      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to execute query',
          variant: 'destructive',
        });
      } else if (!data.success) {
        toast({
          title: 'Execution Error',
          description: data.error || 'Query execution failed',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Query executed successfully',
        });
      }
    } catch (error) {
      console.error('Error running query:', error);
      toast({
        title: 'Error',
        description: 'Failed to run query',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPrettyResponse = () => {
    if (!response) return null;
    
    if (!response.success) {
      return (
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <h3 className="font-medium text-red-700 dark:text-red-300">Error</h3>
            <p className="text-red-600 dark:text-red-400">{response.error}</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
            <h3 className="font-medium text-green-700 dark:text-green-300">Status</h3>
            <p className="text-green-600 dark:text-green-400 capitalize">{response.status}</p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
            <h3 className="font-medium text-blue-700 dark:text-blue-300">Plugins</h3>
            <p className="text-blue-600 dark:text-blue-400">
              {response.successful_plugins} / {response.plugins_executed} successful
            </p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md">
            <h3 className="font-medium text-purple-700 dark:text-purple-300">XP Earned</h3>
            <p className="text-purple-600 dark:text-purple-400">{response.xp_earned}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Plugin Results</h3>
          <div className="space-y-4">
            {response.results && response.results.map((result: any, index: number) => (
              <Card key={index}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {result.plugin_name}
                      <Badge variant={result.success ? 'success' : 'destructive'}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      +{result.xp_earned} XP
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {result.success ? (
                    <div>
                      <pre className="whitespace-pre-wrap font-sans">
                        {result.output?.result || JSON.stringify(result.output, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-red-500">
                      {result.error || 'Plugin execution failed'}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRawResponse = () => {
    if (!response) return null;
    
    return (
      <pre className="bg-muted p-4 rounded-md overflow-x-auto max-h-[500px]">
        {JSON.stringify(response, null, 2)}
      </pre>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Your Brain API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input 
              id="api-key" 
              placeholder="Enter your API key" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="query">Query</Label>
            <Textarea 
              id="query" 
              placeholder="Enter your natural language query (e.g., 'How can I improve my website's conversion rate?')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="context">Context (JSON)</Label>
            <Textarea 
              id="context" 
              placeholder='{"key": "value"}'
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Optional context data to provide with your query. Must be valid JSON.
            </p>
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={handleRunQuery}
              disabled={loading || !query.trim() || !apiKey.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Query...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Query
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {response && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Response</CardTitle>
              <Tabs value={responseView} onValueChange={(v) => setResponseView(v as any)}>
                <TabsList>
                  <TabsTrigger value="pretty">Pretty</TabsTrigger>
                  <TabsTrigger value="raw">
                    <Code className="mr-2 h-4 w-4" />
                    Raw
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {responseView === 'pretty' ? renderPrettyResponse() : renderRawResponse()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BrainPlayground;
