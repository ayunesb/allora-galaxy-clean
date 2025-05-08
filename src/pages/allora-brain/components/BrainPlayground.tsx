
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, ClipboardCopy, Code, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const BrainPlayground = () => {
  const { toast } = useToast();
  const { currentTenant } = useWorkspace();
  const [query, setQuery] = useState('How can I improve my customer acquisition strategy?');
  const [apiKey, setApiKey] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'result' | 'code'>('result');

  const executeQuery = async () => {
    if (!query.trim()) {
      toast({
        title: 'Empty Query',
        description: 'Please enter a query to send to the Allora Brain.',
        variant: 'destructive',
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: 'API Key Required',
        description: 'Please enter an API key to authenticate your request.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      // Call the Allora Brain edge function
      const { data, error } = await supabase.functions.invoke('allora-brain', {
        body: {
          query,
          tenantId: currentTenant?.id,
        },
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (error) {
        throw new Error(`Error calling Allora Brain: ${error.message}`);
      }

      setResponse(data);

      toast({
        title: 'Query Executed',
        description: 'The Allora Brain has processed your query.',
      });
    } catch (error: any) {
      console.error('Error executing query:', error);
      
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while processing your query.',
        variant: 'destructive',
      });
      
      setResponse({
        success: false,
        error: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Content copied to clipboard.',
    });
  };

  const formatResponse = (response: any) => {
    if (!response) return '';
    return JSON.stringify(response, null, 2);
  };

  // Create code example
  const codeExample = `
// Example API request for Allora Brain
const axios = require('axios');

async function queryAlloraBrain() {
  try {
    const response = await axios({
      method: 'post',
      url: '${window.location.origin}/functions/allora-brain',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '${apiKey || 'YOUR_API_KEY'}'
      },
      data: {
        query: "${query || 'How can I improve my customer acquisition strategy?'}"
      }
    });
    
    console.log('Allora Brain Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
}

queryAlloraBrain();
`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Allora Brain Playground</CardTitle>
          <CardDescription>
            Test your API requests to the Allora Brain directly in this playground
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Input form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can create API keys in the Admin settings.
                </p>
              </div>

              <div>
                <Label htmlFor="query">Query</Label>
                <Textarea
                  id="query"
                  placeholder="Enter your question or request..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>

              <Button 
                onClick={executeQuery} 
                disabled={isLoading || !query.trim() || !apiKey.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="mr-2 h-4 w-4" />
                )}
                Execute Query
              </Button>
            </div>

            {/* Right side - Results */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Response</Label>
                <Tabs value={view} onValueChange={(value) => setView(value as 'result' | 'code')} className="mr-auto ml-4">
                  <TabsList>
                    <TabsTrigger value="result">Result</TabsTrigger>
                    <TabsTrigger value="code">Code</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(view === 'result' 
                    ? formatResponse(response) 
                    : codeExample
                  )}
                >
                  <ClipboardCopy className="h-4 w-4" />
                  <span className="sr-only">Copy to clipboard</span>
                </Button>
              </div>

              <div className="relative min-h-[300px]">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm font-medium">Processing your query...</p>
                    </div>
                  </div>
                )}

                {view === 'result' ? (
                  <pre className="bg-muted p-4 rounded-md overflow-auto h-[300px] font-mono text-sm">
                    {response ? formatResponse(response) : 'Execute a query to see results...'}
                  </pre>
                ) : (
                  <pre className="bg-muted p-4 rounded-md overflow-auto h-[300px] font-mono text-sm">
                    {codeExample}
                  </pre>
                )}
              </div>

              {response && response.success === false && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-md p-3 text-sm">
                  <strong>Error:</strong> {response.error}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrainPlayground;
