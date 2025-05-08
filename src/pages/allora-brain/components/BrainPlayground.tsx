
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendIcon, Sparkles } from 'lucide-react';

const BrainPlayground = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    try {
      setIsLoading(true);
      setResponse(null);
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Example response - in a real implementation this would come from the API
      const exampleResponse = {
        response: `Based on your query "${query}", I recommend the following strategy:\n\n1. Analyze current performance metrics\n2. Identify key areas for improvement\n3. Implement targeted optimizations\n4. Measure results and iterate`,
        actions: ["Launch campaign", "Update KPIs", "Schedule follow-up"]
      };
      
      setResponse(exampleResponse.response);
    } catch (error) {
      console.error('Error in API call:', error);
      setResponse('Sorry, there was an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Allora Brain Playground</CardTitle>
          <CardDescription>
            Test the Allora-as-a-Brain API directly in this playground
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="query" className="block text-sm font-medium mb-1">
                Ask Allora Brain
              </label>
              <Textarea
                id="query"
                placeholder="e.g., How do I reduce churn? or Why is my MRR flat?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-32"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!query.trim() || isLoading}
                className="flex gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <SendIcon className="h-4 w-4" />
                    Send Query
                  </>
                )}
              </Button>
            </div>
          </form>
          
          {response && (
            <div className="mt-6">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Allora Response</h3>
                </div>
                <div className="whitespace-pre-wrap">{response}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Sample Queries</CardTitle>
          <CardDescription>
            Try these example queries to see how Allora Brain works
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "How do I reduce customer churn?",
              "Why is our MRR growth slowing down?",
              "Create a marketing strategy for our new product",
              "Analyze our conversion funnel for bottlenecks",
              "What should we focus on for Q4 growth?",
              "Recommend three ways to improve our landing page conversion rate"
            ].map((example, index) => (
              <Button 
                key={index} 
                variant="outline" 
                className="justify-start overflow-hidden text-ellipsis whitespace-nowrap"
                onClick={() => setQuery(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrainPlayground;
