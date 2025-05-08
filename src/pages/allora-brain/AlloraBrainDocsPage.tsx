
import React from 'react';
import { withRoleCheck } from '@/lib/auth/withRoleCheck';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, File, FileJson, FileText } from 'lucide-react';

const AlloraBrainDocsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/allora-brain">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground">
            Comprehensive documentation for the Allora-as-a-Brain API
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Allora-as-a-Brain API</CardTitle>
              <CardDescription>
                Access Allora's strategic intelligence directly from any application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <p>
                  The Allora-as-a-Brain API gives you programmatic access to all of Allora's 
                  strategic capabilities. With a simple REST interface, you can query the API 
                  with natural language and receive actionable business insights and 
                  execution plans in return.
                </p>
                
                <h3 className="text-lg font-bold mt-6 mb-2">Base URL</h3>
                <pre className="bg-muted p-4 rounded-lg">https://api.allora.com/v1</pre>
                
                <h3 className="text-lg font-bold mt-6 mb-2">Authentication</h3>
                <p>
                  All API requests require an API key to be sent in the Authorization header:
                </p>
                <pre className="bg-muted p-4 rounded-lg">
                  Authorization: Bearer YOUR_API_KEY
                </pre>
                
                <p className="mt-2">
                  You can manage your API keys in the <Link to="/admin/api-keys" className="text-primary">API Keys section</Link> of 
                  your Allora dashboard.
                </p>
                
                <h3 className="text-lg font-bold mt-6 mb-2">Response Format</h3>
                <p>
                  All responses are returned as JSON objects. Successful responses include a <code>success</code> field 
                  set to <code>true</code>, while error responses include an <code>error</code> field with details.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>
                Get up and running with the Allora-as-a-Brain API in minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">1. Get your API key</h3>
                  <p className="text-sm text-muted-foreground">
                    Create an API key in the <Link to="/admin/api-keys" className="text-primary">API Keys section</Link> of your dashboard.
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">2. Make your first request</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the following curl command to make your first request to the Allora Brain:
                  </p>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                    curl -X POST https://api.allora.com/v1/brain/query \<br />
                    &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                    &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY" \<br />
                    &nbsp;&nbsp;-d '&#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"query": "How do I reduce customer churn?",<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"options": &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"max_tokens": 500,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"format": "json"<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                    &nbsp;&nbsp;&#125;'
                  </pre>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">3. Integrate into your application</h3>
                  <p className="text-sm text-muted-foreground">
                    Check out the <Link to="/allora-brain?tab=integration" className="text-primary">Integration examples</Link> for 
                    code snippets in various programming languages.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                All available endpoints of the Allora-as-a-Brain API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded-md text-xs font-medium">POST</div>
                    <h3 className="font-medium">/brain/query</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1 mb-3">
                    Ask a question to the Allora Brain and get strategic insights as response.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm">Request Body</h4>
                      <div className="flex gap-4 mt-2">
                        <div className="flex-1">
                          <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                            &#123;<br />
                            &nbsp;&nbsp;"query": "How do I reduce customer churn?",<br />
                            &nbsp;&nbsp;"options": &#123;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;"max_tokens": 500,<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;"format": "json",<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;"plugins": ["analytics", "crm"]<br />
                            &nbsp;&nbsp;&#125;<br />
                            &#125;
                          </pre>
                        </div>
                        <div className="flex-1">
                          <div className="space-y-2">
                            <p className="text-xs"><span className="font-mono font-medium">query</span> <span className="text-muted-foreground">(string, required)</span></p>
                            <p className="text-xs text-muted-foreground">The natural language query to send to Allora Brain</p>
                            
                            <p className="text-xs"><span className="font-mono font-medium">options.max_tokens</span> <span className="text-muted-foreground">(integer, optional)</span></p>
                            <p className="text-xs text-muted-foreground">Maximum length of response in tokens</p>
                            
                            <p className="text-xs"><span className="font-mono font-medium">options.format</span> <span className="text-muted-foreground">(string, optional)</span></p>
                            <p className="text-xs text-muted-foreground">Response format: "json" or "text"</p>
                            
                            <p className="text-xs"><span className="font-mono font-medium">options.plugins</span> <span className="text-muted-foreground">(array, optional)</span></p>
                            <p className="text-xs text-muted-foreground">List of plugin IDs to use for the query</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm">Response</h4>
                      <div className="flex gap-4 mt-2">
                        <div className="flex-1">
                          <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                            &#123;<br />
                            &nbsp;&nbsp;"success": true,<br />
                            &nbsp;&nbsp;"strategy": "To reduce customer churn...",<br />
                            &nbsp;&nbsp;"recommendations": [<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;"Implement an early warning system",<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;"Create a customer success program",<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;"Analyze churn patterns by segment"<br />
                            &nbsp;&nbsp;],<br />
                            &nbsp;&nbsp;"metrics": &#123;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;"current_churn_rate": 5.2,<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;"industry_average": 3.8<br />
                            &nbsp;&nbsp;&#125;,<br />
                            &nbsp;&nbsp;"execution_id": "exec-123456"<br />
                            &#125;
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md text-xs font-medium">GET</div>
                    <h3 className="font-medium">/brain/execution/:id</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1 mb-3">
                    Retrieve details about a previous execution.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm">Path Parameters</h4>
                      <p className="text-xs mt-2"><span className="font-mono font-medium">id</span> <span className="text-muted-foreground">(string, required)</span></p>
                      <p className="text-xs text-muted-foreground">The execution ID</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm">Response</h4>
                      <div className="mt-2">
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                            &#123;<br />
                            &nbsp;&nbsp;"success": true,<br />
                            &nbsp;&nbsp;"execution": &#123;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;"id": "exec-123456",<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;"created_at": "2025-05-01T12:34:56Z",<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;"query": "How do I reduce customer churn?",<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;"status": "completed",<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;"plugins_used": ["analytics", "crm"],<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;"execution_time": 1.25<br />
                            &nbsp;&nbsp;&#125;<br />
                            &#125;
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md text-xs font-medium">GET</div>
                      <h3 className="font-medium">/brain/plugins</h3>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1 mb-1">
                      List all available plugins for your tenant.
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md text-xs font-medium">PATCH</div>
                      <h3 className="font-medium">/brain/settings</h3>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1 mb-1">
                      Update brain settings for your tenant.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Models</CardTitle>
              <CardDescription>
                Reference for all data models used in the Allora-as-a-Brain API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-md">Query</CardTitle>
                        <FileJson className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-mono font-medium">query</span> <span className="text-muted-foreground">(string)</span></p>
                        <p><span className="font-mono font-medium">options</span> <span className="text-muted-foreground">(object)</span></p>
                        <p><span className="font-mono font-medium">options.max_tokens</span> <span className="text-muted-foreground">(integer)</span></p>
                        <p><span className="font-mono font-medium">options.format</span> <span className="text-muted-foreground">(string)</span></p>
                        <p><span className="font-mono font-medium">options.plugins</span> <span className="text-muted-foreground">(array)</span></p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-md">Response</CardTitle>
                        <FileJson className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-mono font-medium">success</span> <span className="text-muted-foreground">(boolean)</span></p>
                        <p><span className="font-mono font-medium">strategy</span> <span className="text-muted-foreground">(string)</span></p>
                        <p><span className="font-mono font-medium">recommendations</span> <span className="text-muted-foreground">(array)</span></p>
                        <p><span className="font-mono font-medium">metrics</span> <span className="text-muted-foreground">(object)</span></p>
                        <p><span className="font-mono font-medium">execution_id</span> <span className="text-muted-foreground">(string)</span></p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-md">Execution</CardTitle>
                        <FileJson className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-mono font-medium">id</span> <span className="text-muted-foreground">(string)</span></p>
                        <p><span className="font-mono font-medium">created_at</span> <span className="text-muted-foreground">(string)</span></p>
                        <p><span className="font-mono font-medium">query</span> <span className="text-muted-foreground">(string)</span></p>
                        <p><span className="font-mono font-medium">status</span> <span className="text-muted-foreground">(string)</span></p>
                        <p><span className="font-mono font-medium">plugins_used</span> <span className="text-muted-foreground">(array)</span></p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-md">Plugin</CardTitle>
                        <FileJson className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-mono font-medium">id</span> <span className="text-muted-foreground">(string)</span></p>
                        <p><span className="font-mono font-medium">name</span> <span className="text-muted-foreground">(string)</span></p>
                        <p><span className="font-mono font-medium">description</span> <span className="text-muted-foreground">(string)</span></p>
                        <p><span className="font-mono font-medium">category</span> <span className="text-muted-foreground">(string)</span></p>
                        <p><span className="font-mono font-medium">status</span> <span className="text-muted-foreground">(string)</span></p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-md">Error</CardTitle>
                        <FileJson className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-mono font-medium">success</span> <span className="text-muted-foreground">(boolean)</span></p>
                        <p><span className="font-mono font-medium">error</span> <span className="text-muted-foreground">(string)</span></p>
                        <p><span className="font-mono font-medium">code</span> <span className="text-muted-foreground">(string)</span></p>
                        <p><span className="font-mono font-medium">details</span> <span className="text-muted-foreground">(object)</span></p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-md">Settings</CardTitle>
                        <FileJson className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-mono font-medium">default_plugins</span> <span className="text-muted-foreground">(array)</span></p>
                        <p><span className="font-mono font-medium">max_tokens</span> <span className="text-muted-foreground">(integer)</span></p>
                        <p><span className="font-mono font-medium">default_format</span> <span className="text-muted-foreground">(string)</span></p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Schema Documentation</h3>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    OpenAPI Specification
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Example Requests</CardTitle>
              <CardDescription>
                Sample requests and responses to get started quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="font-medium text-lg mb-4">Basic Query</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <File className="h-4 w-4 text-primary" /> Request
                      </h4>
                      <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                        POST /v1/brain/query<br /><br />
                        &#123;<br />
                        &nbsp;&nbsp;"query": "How do I reduce customer churn?"<br />
                        &#125;
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <File className="h-4 w-4 text-green-600" /> Response
                      </h4>
                      <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                        &#123;<br />
                        &nbsp;&nbsp;"success": true,<br />
                        &nbsp;&nbsp;"strategy": "To reduce customer churn, focus on improving customer satisfaction...",<br />
                        &nbsp;&nbsp;"recommendations": [<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;"Implement an early warning system",<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;"Create a customer success program",<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;"Analyze churn patterns by segment"<br />
                        &nbsp;&nbsp;],<br />
                        &nbsp;&nbsp;"execution_id": "exec-123456"<br />
                        &#125;
                      </pre>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-lg mb-4">Advanced Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <File className="h-4 w-4 text-primary" /> Request
                      </h4>
                      <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                        POST /v1/brain/query<br /><br />
                        &#123;<br />
                        &nbsp;&nbsp;"query": "Analyze our MRR growth and suggest improvements",<br />
                        &nbsp;&nbsp;"options": &#123;<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;"max_tokens": 1000,<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;"format": "json",<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;"plugins": ["analytics", "crm", "stripe"]<br />
                        &nbsp;&nbsp;&#125;<br />
                        &#125;
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <File className="h-4 w-4 text-green-600" /> Response
                      </h4>
                      <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                        &#123;<br />
                        &nbsp;&nbsp;"success": true,<br />
                        &nbsp;&nbsp;"strategy": "Your MRR growth has slowed from 8% to 3% MoM...",<br />
                        &nbsp;&nbsp;"analysis": &#123;<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;"current_mrr": 52000,<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;"growth_rate": 0.03,<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;"churn_impact": -4500,<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;"expansion_revenue": 2200<br />
                        &nbsp;&nbsp;&#125;,<br />
                        &nbsp;&nbsp;"recommendations": [<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;"Focus on expansion revenue with mid-tier customers",<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;"Address the churn spike in enterprise segment",<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;"Optimize onboarding for faster time-to-value"<br />
                        &nbsp;&nbsp;],<br />
                        &nbsp;&nbsp;"execution_id": "exec-789012"<br />
                        &#125;
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withRoleCheck(AlloraBrainDocsPage, { roles: ['admin', 'owner'] });
