
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

const BrainPlayground = () => {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('playground');
  
  const handleSendRequest = async () => {
    if (!apiKey || !prompt) return;
    
    setIsLoading(true);
    setResponse('');
    
    try {
      // In a real implementation, this would call your API endpoint
      // For now we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResponse(`This is a simulated response for the prompt: "${prompt}"\n\nTo get actual responses, implement the Allora Brain API client integration.`);
    } catch (error) {
      console.error('Error sending request:', error);
      setResponse('An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Allora Brain Playground</CardTitle>
        <CardDescription>
          Test the Allora Brain API with your prompts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="playground">Playground</TabsTrigger>
            <TabsTrigger value="api-key">API Key</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api-key">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Your API Key</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter your API key to use the playground
                </p>
                
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <Button disabled={!apiKey}>Save Key</Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  Your API key is stored only in your browser and is never sent to our servers.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">API Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure your API settings (coming soon)
              </p>
              
              <div className="text-center py-8">
                <p>Settings configuration will be available in a future update.</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="playground">
            <div className="space-y-4">
              <div>
                <label htmlFor="prompt" className="text-sm font-medium">
                  Enter your prompt
                </label>
                <div className="mt-1">
                  <Textarea
                    id="prompt"
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSendRequest} 
                  disabled={isLoading || !apiKey || !prompt}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? 'Sending...' : 'Send'}
                </Button>
              </div>
              
              {response && (
                <div className="mt-6">
                  <label className="text-sm font-medium">Response</label>
                  <div className="mt-1 bg-muted p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">{response}</pre>
                  </div>
                </div>
              )}
              
              {!apiKey && (
                <div className="mt-4 bg-yellow-50 text-yellow-800 p-4 rounded-md">
                  <p className="text-sm">
                    Please set your API key in the "API Key" tab before using the playground.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BrainPlayground;
