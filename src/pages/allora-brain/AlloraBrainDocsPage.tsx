
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { withRoleCheck } from '@/lib/auth/withRoleCheck';

const AlloraBrainDocsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/allora-brain">
            <ChevronLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Allora-as-a-Brain API Documentation</h1>
          <p className="text-muted-foreground">
            Technical documentation and reference for the Allora-as-a-Brain API
          </p>
        </div>
      </div>

      <Tabs defaultValue="reference">
        <TabsList>
          <TabsTrigger value="reference">API Reference</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="limits">Rate Limits</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reference" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Badge variant="outline" className="mr-2">POST</Badge>
                /allora-brain
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p>
                    Execute a query against Allora's brain to get strategic insights and execute plugins.
                    This endpoint accepts natural language queries and returns structured results.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Request Headers</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Header</th>
                          <th className="text-left py-2 px-4">Required</th>
                          <th className="text-left py-2 px-4">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">Content-Type</td>
                          <td className="py-2 px-4">Yes</td>
                          <td className="py-2 px-4">application/json</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">x-api-key</td>
                          <td className="py-2 px-4">Yes</td>
                          <td className="py-2 px-4">Your API key</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Request Body</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Parameter</th>
                          <th className="text-left py-2 px-4">Type</th>
                          <th className="text-left py-2 px-4">Required</th>
                          <th className="text-left py-2 px-4">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">query</td>
                          <td className="py-2 px-4">string</td>
                          <td className="py-2 px-4">Yes</td>
                          <td className="py-2 px-4">The natural language query to process</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">tenantId</td>
                          <td className="py-2 px-4">string</td>
                          <td className="py-2 px-4">No</td>
                          <td className="py-2 px-4">Optional tenant ID (must match the API key's tenant)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">strategy</td>
                          <td className="py-2 px-4">string</td>
                          <td className="py-2 px-4">No</td>
                          <td className="py-2 px-4">Optional strategy ID to use (instead of creating one)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">plugin</td>
                          <td className="py-2 px-4">string</td>
                          <td className="py-2 px-4">No</td>
                          <td className="py-2 px-4">Optional specific plugin ID to execute</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">context</td>
                          <td className="py-2 px-4">object</td>
                          <td className="py-2 px-4">No</td>
                          <td className="py-2 px-4">Optional context data to provide to the plugins</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Example Request</h3>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                    {`POST /functions/v1/allora-brain HTTP/1.1
Host: ijrnwpgsqsxzqdemtknz.supabase.co
Content-Type: application/json
x-api-key: your-api-key-here

{
  "query": "How can I improve my conversion rate on my Shopify store?",
  "context": {
    "storeUrl": "mystore.myshopify.com",
    "currentConversionRate": "2.1%"
  }
}`}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Response</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Field</th>
                          <th className="text-left py-2 px-4">Type</th>
                          <th className="text-left py-2 px-4">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">success</td>
                          <td className="py-2 px-4">boolean</td>
                          <td className="py-2 px-4">Whether the request was successful</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">strategy_id</td>
                          <td className="py-2 px-4">string</td>
                          <td className="py-2 px-4">ID of the strategy that was executed</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">execution_id</td>
                          <td className="py-2 px-4">string</td>
                          <td className="py-2 px-4">ID of the execution</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">status</td>
                          <td className="py-2 px-4">string</td>
                          <td className="py-2 px-4">Status of the execution (success, partial, failure)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">plugins_executed</td>
                          <td className="py-2 px-4">number</td>
                          <td className="py-2 px-4">Number of plugins executed</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">successful_plugins</td>
                          <td className="py-2 px-4">number</td>
                          <td className="py-2 px-4">Number of plugins that executed successfully</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">xp_earned</td>
                          <td className="py-2 px-4">number</td>
                          <td className="py-2 px-4">XP earned from this execution</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">results</td>
                          <td className="py-2 px-4">array</td>
                          <td className="py-2 px-4">Array of plugin execution results</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-mono text-sm">error</td>
                          <td className="py-2 px-4">string</td>
                          <td className="py-2 px-4">Error message if request failed</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Example Response</h3>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                    {`{
  "success": true,
  "strategy_id": "550e8400-e29b-41d4-a716-446655440000",
  "execution_id": "b5f8d4e3-9c62-4b5f-a574-292dd0a03918",
  "status": "success",
  "plugins_executed": 3,
  "successful_plugins": 3,
  "xp_earned": 30,
  "results": [
    {
      "plugin_id": "plugin-123",
      "plugin_name": "Shopify Analytics",
      "success": true,
      "output": {
        "result": "Based on your current conversion rate of 2.1%, here are recommendations to improve it...",
        "context": {
          "storeUrl": "mystore.myshopify.com",
          "currentConversionRate": "2.1%"
        },
        "timestamp": "2023-09-15T14:23:45.123Z"
      },
      "xp_earned": 10
    },
    {
      "plugin_id": "plugin-456",
      "plugin_name": "CRO Optimizer",
      "success": true,
      "output": {
        "result": "Analyzing your checkout flow shows these potential improvements...",
        "context": {
          "storeUrl": "mystore.myshopify.com",
          "currentConversionRate": "2.1%"
        },
        "timestamp": "2023-09-15T14:23:46.456Z"
      },
      "xp_earned": 10
    },
    {
      "plugin_id": "plugin-789",
      "plugin_name": "Content Recommender",
      "success": true,
      "output": {
        "result": "To improve engagement, consider these content updates...",
        "context": {
          "storeUrl": "mystore.myshopify.com",
          "currentConversionRate": "2.1%"
        },
        "timestamp": "2023-09-15T14:23:47.789Z"
      },
      "xp_earned": 10
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  The Allora-as-a-Brain API uses API keys for authentication. Each request must include
                  your API key in the <code>x-api-key</code> header.
                </p>
                
                <h3 className="font-medium text-lg">API Key Management</h3>
                <p>
                  You can manage your API keys in the 
                  <Link to="/admin/api-keys" className="text-primary mx-1">API Keys</Link>
                  section of the admin dashboard. API keys are tenant-specific and have the following properties:
                </p>
                
                <ul className="list-disc pl-5 space-y-2">
                  <li>Each API key belongs to a specific tenant</li>
                  <li>API keys expire after 1 year by default</li>
                  <li>Keys can be revoked at any time</li>
                  <li>Usage is tracked and logged in the system</li>
                </ul>
                
                <h3 className="font-medium text-lg">API Key Security</h3>
                <p>
                  Keep your API keys secure and never expose them in client-side code. 
                  If an API key is compromised, revoke it immediately and create a new one.
                </p>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md">
                  <h4 className="font-medium text-amber-800 dark:text-amber-300">Security Warning</h4>
                  <p className="text-amber-700 dark:text-amber-400">
                    Your API key has full access to execute strategies and plugins on your tenant.
                    Keep it secure and never include it in client-side code or public repositories.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Codes & Handling</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  The Allora-as-a-Brain API returns standard HTTP status codes to indicate
                  the success or failure of API requests. In addition to the status code,
                  error responses include a JSON body with more details.
                </p>
                
                <h3 className="font-medium text-lg">HTTP Status Codes</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Status Code</th>
                        <th className="text-left py-2 px-4">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-4">200 OK</td>
                        <td className="py-2 px-4">The request was successful</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">400 Bad Request</td>
                        <td className="py-2 px-4">The request was malformed or missing required parameters</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">401 Unauthorized</td>
                        <td className="py-2 px-4">Authentication failed (invalid or missing API key)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">403 Forbidden</td>
                        <td className="py-2 px-4">The API key does not have permission for this action</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">404 Not Found</td>
                        <td className="py-2 px-4">The requested resource was not found</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">429 Too Many Requests</td>
                        <td className="py-2 px-4">Rate limit exceeded</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">500 Internal Server Error</td>
                        <td className="py-2 px-4">An error occurred on the server</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <h3 className="font-medium text-lg">Error Response Format</h3>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  {`{
  "success": false,
  "error": "Detailed error message"
}`}
                </pre>
                
                <h3 className="font-medium text-lg">Common Errors</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Error Message</th>
                        <th className="text-left py-2 px-4">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-4">API key is required</td>
                        <td className="py-2 px-4">The x-api-key header is missing</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">Invalid or expired API key</td>
                        <td className="py-2 px-4">The provided API key is not valid</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">Query is required</td>
                        <td className="py-2 px-4">The query parameter is missing in the request body</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">Strategy not found or access denied</td>
                        <td className="py-2 px-4">The specified strategy ID doesn't exist or belongs to another tenant</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">Plugin not found or not active</td>
                        <td className="py-2 px-4">The specified plugin ID doesn't exist or is not active</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <h3 className="font-medium text-lg">Error Handling Best Practices</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Always check the success flag in the response</li>
                  <li>Implement retry logic with backoff for 429 and 5xx errors</li>
                  <li>Log detailed error messages for debugging</li>
                  <li>Display user-friendly error messages in your application</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="limits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  To ensure fair usage and system stability, the Allora-as-a-Brain API
                  enforces rate limits on API requests. These limits help prevent abuse
                  and ensure optimal performance for all users.
                </p>
                
                <h3 className="font-medium text-lg">Default Rate Limits</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Plan</th>
                        <th className="text-left py-2 px-4">Requests per Minute</th>
                        <th className="text-left py-2 px-4">Requests per Day</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-4">Standard</td>
                        <td className="py-2 px-4">60</td>
                        <td className="py-2 px-4">10,000</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">Enterprise</td>
                        <td className="py-2 px-4">300</td>
                        <td className="py-2 px-4">50,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <h3 className="font-medium text-lg">Rate Limit Headers</h3>
                <p>
                  The API includes rate limit information in the response headers:
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Header</th>
                        <th className="text-left py-2 px-4">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-4 font-mono text-sm">X-RateLimit-Limit</td>
                        <td className="py-2 px-4">Maximum number of requests allowed in the current time window</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4 font-mono text-sm">X-RateLimit-Remaining</td>
                        <td className="py-2 px-4">Number of requests remaining in the current time window</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4 font-mono text-sm">X-RateLimit-Reset</td>
                        <td className="py-2 px-4">Time in seconds until the rate limit resets</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <h3 className="font-medium text-lg">Handling Rate Limits</h3>
                <p>
                  When you exceed the rate limit, the API will return a 429 Too Many Requests
                  response with information about when you can retry:
                </p>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  {`HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 30
Retry-After: 30

{
  "success": false,
  "error": "Rate limit exceeded. Please retry after 30 seconds."
}`}
                </pre>
                
                <h3 className="font-medium text-lg">Best Practices</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Implement exponential backoff for retries</li>
                  <li>Monitor your usage and adjust your application accordingly</li>
                  <li>Cache responses when possible to reduce API calls</li>
                  <li>Batch requests together when possible</li>
                  <li>Contact support if you need higher rate limits</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withRoleCheck(AlloraBrainDocsPage, { roles: ['owner', 'admin'] });
