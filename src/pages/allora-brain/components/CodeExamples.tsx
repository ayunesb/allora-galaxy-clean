
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CodeExamples: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('javascript');
  const { toast } = useToast();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Code Copied',
      description: 'The code example has been copied to your clipboard',
    });
  };

  const javascriptCode = `// Example: Using Allora Brain with JavaScript (Node.js or browser)
const fetchAlloraBrain = async (query, context = {}) => {
  const response = await fetch('https://ijrnwpgsqsxzqdemtknz.supabase.co/functions/v1/allora-brain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key-here'
    },
    body: JSON.stringify({
      query,
      context
    })
  });
  
  return response.json();
};

// Example usage
const result = await fetchAlloraBrain(
  'How can I improve my website conversion rate?',
  { currentRate: '2.3%', industry: 'ecommerce' }
);

if (result.success) {
  console.log('Strategy executed successfully!');
  
  // Process plugin results
  result.results.forEach(plugin => {
    if (plugin.success) {
      console.log(\`\${plugin.plugin_name}: \${plugin.output.result}\`);
    }
  });
} else {
  console.error('Error:', result.error);
}`;

  const reactCode = `// Example: Using Allora Brain with React
import { useState } from 'react';

// Allora Brain Hook
const useAlloraBrain = (apiKey) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const executeQuery = async (query, context = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://ijrnwpgsqsxzqdemtknz.supabase.co/functions/v1/allora-brain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          query,
          context
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute query');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  return { executeQuery, loading, error };
};

// Example Component
const BusinessAdvisor = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const { executeQuery, loading, error } = useAlloraBrain('your-api-key-here');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await executeQuery(query);
    setResults(result);
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a business question..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Get Advice'}
        </button>
      </form>
      
      {error && <div className="error">{error}</div>}
      
      {results?.success && (
        <div className="results">
          {results.results.map((plugin, i) => (
            <div key={i} className="plugin-result">
              <h3>{plugin.plugin_name}</h3>
              {plugin.success ? (
                <p>{plugin.output.result}</p>
              ) : (
                <p className="error">{plugin.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};`;

  const pythonCode = `# Example: Using Allora Brain with Python
import requests
import json

def query_allora_brain(query, context=None, api_key=None):
    """
    Query the Allora Brain API.
    
    Args:
        query (str): The natural language query to process
        context (dict, optional): Additional context data
        api_key (str): Your API key
        
    Returns:
        dict: The API response
    """
    if not api_key:
        raise ValueError("API key is required")
        
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key
    }
    
    payload = {
        "query": query
    }
    
    if context:
        payload["context"] = context
        
    response = requests.post(
        "https://ijrnwpgsqsxzqdemtknz.supabase.co/functions/v1/allora-brain",
        headers=headers,
        json=payload
    )
    
    return response.json()

# Example usage
if __name__ == "__main__":
    API_KEY = "your-api-key-here"
    
    # Simple query
    result = query_allora_brain(
        "How can we reduce customer churn?",
        {"current_churn_rate": "5.2%", "industry": "SaaS"},
        API_KEY
    )
    
    if result.get("success"):
        print(f"Strategy executed: {result['strategy_id']}")
        print(f"Status: {result['status']}")
        print(f"Plugins executed: {result['plugins_executed']}")
        
        for plugin_result in result.get("results", []):
            print(f"\n--- {plugin_result['plugin_name']} ---")
            if plugin_result['success']:
                print(f"Result: {plugin_result['output']['result']}")
            else:
                print(f"Error: {plugin_result.get('error', 'Unknown error')}")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")`;

  const slackCode = `// Example: Integrating Allora Brain with a Slack Bot (Node.js)
const { App } = require('@slack/bolt');
const fetch = require('node-fetch');

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

// Function to query Allora Brain
async function queryAlloraBrain(query, context = {}) {
  const response = await fetch('https://ijrnwpgsqsxzqdemtknz.supabase.co/functions/v1/allora-brain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ALLORA_API_KEY
    },
    body: JSON.stringify({
      query,
      context
    })
  });
  
  return response.json();
}

// Listen for messages mentioning the bot
app.event('app_mention', async ({ event, say }) => {
  try {
    // Extract query from message text (remove the bot mention)
    const query = event.text.replace(/<@[A-Z0-9]+>/, '').trim();
    
    if (!query) {
      await say("👋 Hello! Please ask me a business question.");
      return;
    }
    
    await say(\`Processing your query: "\${query}"...\`);
    
    // Call Allora Brain API
    const result = await queryAlloraBrain(query);
    
    if (!result.success) {
      await say(\`❌ Error: \${result.error || 'Failed to process your query'}\`);
      return;
    }
    
    // Format and send successful results
    let responseText = "🧠 *Allora Brain Results*\\n\\n";
    
    for (const plugin of result.results) {
      responseText += \`*\${plugin.plugin_name}*\\n\`;
      
      if (plugin.success) {
        responseText += \`\${plugin.output.result}\\n\\n\`;
      } else {
        responseText += \`❌ This plugin encountered an error: \${plugin.error}\\n\\n\`;
      }
    }
    
    await say(responseText);
  } catch (error) {
    console.error(error);
    await say("❌ Sorry, something went wrong while processing your request.");
  }
});

// Start the app
(async () => {
  await app.start();
  console.log('⚡️ Allora Slack Bot is running!');
})();`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integration Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="slack">Slack Integration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="javascript">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2"
                  onClick={() => handleCopyCode(javascriptCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code className="language-javascript">{javascriptCode}</code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="react">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2"
                  onClick={() => handleCopyCode(reactCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code className="language-jsx">{reactCode}</code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="python">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2"
                  onClick={() => handleCopyCode(pythonCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code className="language-python">{pythonCode}</code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="slack">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2"
                  onClick={() => handleCopyCode(slackCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code className="language-javascript">{slackCode}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Common Integration Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Slack Command Bot</h3>
              <p className="text-muted-foreground mb-2">
                Create a Slack app that responds to slash commands like <code>/allora</code> with AI-powered business insights.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Process user queries in natural language</li>
                <li>Present results directly in Slack threads</li>
                <li>Enable team-wide access to Allora's capabilities</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Business Dashboard Integration</h3>
              <p className="text-muted-foreground mb-2">
                Embed Allora's insights directly in your internal dashboards with easy API calls.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Analyze KPI data in real-time</li>
                <li>Provide AI-powered recommendations</li>
                <li>Generate strategic insights automatically</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Shopify App</h3>
              <p className="text-muted-foreground mb-2">
                Build a Shopify app that provides AI-powered recommendations for store optimization.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Analyze store performance metrics</li>
                <li>Generate personalized marketing strategies</li>
                <li>Provide actionable insights to merchants</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Scheduled Intelligence</h3>
              <p className="text-muted-foreground mb-2">
                Set up automated agents that run on a schedule and report findings to your team.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Monitor business metrics automatically</li>
                <li>Generate weekly/monthly strategic reports</li>
                <li>Send alerts when key thresholds are crossed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeExamples;
