
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CodeExamples = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopy = (code: string, language: string) => {
    navigator.clipboard.writeText(code);
    setCopied(language);
    
    toast({
      title: "Code copied",
      description: `${language} code snippet copied to clipboard.`,
    });
    
    setTimeout(() => setCopied(null), 2000);
  };

  const examples = {
    javascript: `
// Using Fetch API
async function queryAlloraBrain(question) {
  const response = await fetch('https://api.allora.com/v1/brain/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      query: question,
      options: {
        max_tokens: 500,
        format: 'json'
      }
    })
  });
  
  return response.json();
}

// Example usage
queryAlloraBrain("How do I reduce customer churn?")
  .then(result => {
    console.log(result.strategy);
    console.log(result.recommendations);
  })
  .catch(error => console.error('Error:', error));
`,
    react: `
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

// Allora Brain React Hook
function useAlloraBrain() {
  const mutation = useMutation({
    mutationFn: async ({ query, options = {} }) => {
      const response = await fetch('https://api.allora.com/v1/brain/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({ query, options })
      });
      
      if (!response.ok) {
        throw new Error('Failed to query Allora Brain');
      }
      
      return response.json();
    }
  });
  
  return mutation;
}

// Example component usage
function AlloraBrainChat() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const alloraBrain = useAlloraBrain();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await alloraBrain.mutateAsync({ query });
    setResponse(result);
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask Allora Brain..."
        />
        <button type="submit" disabled={alloraBrain.isPending}>
          {alloraBrain.isPending ? 'Thinking...' : 'Ask'}
        </button>
      </form>
      
      {response && (
        <div>
          <h3>Strategy</h3>
          <p>{response.strategy}</p>
          
          <h3>Recommendations</h3>
          <ul>
            {response.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
`,
    python: `
import requests
import json

def query_allora_brain(question, api_key):
    url = "https://api.allora.com/v1/brain/query"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "query": question,
        "options": {
            "max_tokens": 500,
            "format": "json"
        }
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error {response.status_code}: {response.text}")

# Example usage
if __name__ == "__main__":
    API_KEY = "your_api_key_here"
    question = "How do I reduce customer churn?"
    
    try:
        result = query_allora_brain(question, API_KEY)
        print("Strategy:", result["strategy"])
        print("Recommendations:", result["recommendations"])
    except Exception as e:
        print(f"An error occurred: {e}")
`,
    curl: `
curl -X POST https://api.allora.com/v1/brain/query \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "query": "How do I reduce customer churn?",
    "options": {
      "max_tokens": 500,
      "format": "json"
    }
  }'
`
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integration Examples</CardTitle>
          <CardDescription>
            Sample code to integrate Allora Brain into your applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="javascript">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>
            
            {Object.entries(examples).map(([language, code]) => (
              <TabsContent key={language} value={language}>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm max-h-96">
                    <code>{code}</code>
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute top-2 right-2" 
                    onClick={() => handleCopy(code, language)}
                  >
                    {copied === language ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>API Usage Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Authentication</h3>
            <p className="text-sm text-muted-foreground">
              All API requests require an API key passed in the Authorization header.
              API keys can be managed in the Admin panel under API Keys.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-1">Rate Limiting</h3>
            <p className="text-sm text-muted-foreground">
              API requests are rate-limited based on your plan. Enterprise plans have higher limits.
              Rate limit information is returned in response headers.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-1">Response Format</h3>
            <p className="text-sm text-muted-foreground">
              Responses are returned as JSON objects containing strategy recommendations,
              possible actions, and relevant metrics from your tenant.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-1">SDK Status</h3>
            <p className="text-sm text-muted-foreground">
              Official client libraries for JavaScript, Python, and Ruby are coming soon.
              Subscribe to our developer newsletter for updates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeExamples;
