
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentationCard from '@/components/documentation/DocumentationCard';
import DocumentationSection from '@/components/documentation/DocumentationSection';
import PageHelmet from '@/components/PageHelmet';
import { BookOpen, Code, Layers, Terminal, Settings, Users } from 'lucide-react';

const AlloraOSDocs: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-6xl">
      <PageHelmet title="Documentation" description="Allora OS documentation and guides" />
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Allora OS Documentation</h1>
        <p className="text-muted-foreground">
          Comprehensive guides and documentation for the Allora OS platform
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-6 h-auto p-1">
          <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
          <TabsTrigger value="getting-started" className="py-2">Getting Started</TabsTrigger>
          <TabsTrigger value="strategies" className="py-2">Strategies</TabsTrigger>
          <TabsTrigger value="plugins" className="py-2">Plugins</TabsTrigger>
          <TabsTrigger value="agents" className="py-2">Agents</TabsTrigger>
          <TabsTrigger value="api" className="py-2">API</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <DocumentationCard 
            title="What is Allora OS?" 
            description="A multi-tenant strategy-and-agent orchestration dashboard"
            icon={<Layers className="h-5 w-5 text-primary" />}
          >
            <div className="space-y-6">
              <DocumentationSection title="Project Overview">
                <p>
                  Allora OS is a comprehensive AI-native business management platform 
                  built on React, Shadcn-UI, Tailwind, Supabase, and Vercel. It provides 
                  tools for strategy generation, plugin management, and business intelligence 
                  through an intuitive user interface.
                </p>
                <p className="mt-2">
                  The platform enables organizations to build, deploy, and evolve agent-based strategies
                  with end-to-end tenant isolation and robust security policies.
                </p>
              </DocumentationSection>
              
              <DocumentationSection title="Key Features">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Multi-tenant architecture with robust RLS policies</li>
                  <li>AI-assisted strategy generation and optimization</li>
                  <li>Plugin ecosystem for extending functionality</li>
                  <li>Agent evolution and performance tracking</li>
                  <li>Galaxy explorer for visualizing connections</li>
                  <li>Unified admin console for system management</li>
                  <li>Real-time KPI tracking and visualization</li>
                </ul>
              </DocumentationSection>
              
              <DocumentationSection title="Architecture">
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Frontend</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <ul className="list-disc pl-4 space-y-1">
                          <li>React + TypeScript</li>
                          <li>Tailwind CSS</li>
                          <li>Shadcn UI Component Library</li>
                          <li>React Query for data fetching</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Backend</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Supabase for auth and database</li>
                          <li>Edge Functions for serverless compute</li>
                          <li>Row-Level Security policies</li>
                          <li>Postgres database</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Deployment</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Vercel for hosting</li>
                          <li>CI/CD workflow integration</li>
                          <li>Environment management</li>
                          <li>Performance monitoring</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </DocumentationSection>
            </div>
          </DocumentationCard>
        </TabsContent>
        
        <TabsContent value="getting-started" className="space-y-6">
          <DocumentationCard 
            title="Getting Started" 
            description="Setting up your environment and first steps"
            icon={<Terminal className="h-5 w-5 text-primary" />}
          >
            <div className="space-y-6">
              <DocumentationSection title="Installation">
                <div className="bg-muted p-4 rounded-md font-mono text-sm">
                  <p># Clone the repository</p>
                  <p>git clone git@github.com:yourorg/allora-galaxy.git</p>
                  <p className="mt-2"># Install dependencies</p>
                  <p>npm install</p>
                  <p className="mt-2"># Set up environment variables</p>
                  <p>cp .env.example .env.local</p>
                </div>
              </DocumentationSection>
              
              <DocumentationSection title="Environment Setup">
                <p>Required environment variables:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li><code>NEXT_PUBLIC_SUPABASE_URL</code>: Your Supabase project URL</li>
                  <li><code>SUPABASE_SERVICE_ROLE_KEY</code>: Service role key for admin operations</li>
                  <li><code>OPENAI_API_KEY</code>: API key for OpenAI integration</li>
                </ul>
                <p className="mt-2">Optional environment variables:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li><code>NEXT_PUBLIC_APP_NAME</code>: Custom application name</li>
                  <li><code>NEXT_PUBLIC_DEBUG_MODE</code>: Enable detailed logging (true/false)</li>
                </ul>
              </DocumentationSection>
              
              <DocumentationSection title="First Steps">
                <ol className="list-decimal pl-6 space-y-2">
                  <li>
                    <strong>Create an account</strong>: Navigate to the login page and sign up for a new account.
                  </li>
                  <li>
                    <strong>Create a workspace</strong>: Set up your organization's workspace with the onboarding wizard.
                  </li>
                  <li>
                    <strong>Explore the dashboard</strong>: Familiarize yourself with the main dashboard and navigation.
                  </li>
                  <li>
                    <strong>Create your first strategy</strong>: Use the Strategy Builder to create your first AI strategy.
                  </li>
                </ol>
              </DocumentationSection>
            </div>
          </DocumentationCard>
        </TabsContent>
        
        <TabsContent value="strategies" className="space-y-6">
          <DocumentationCard 
            title="Strategies" 
            description="Creating and managing business strategies"
            icon={<Settings className="h-5 w-5 text-primary" />}
          >
            <DocumentationSection title="Strategy Overview">
              <p>
                Strategies are AI-assisted plans that incorporate business goals, target metrics, 
                and execution steps. They leverage plugins and agents to implement business logic
                and track performance over time.
              </p>
            </DocumentationSection>
            
            <DocumentationSection title="Creating a Strategy">
              <ol className="list-decimal pl-6 space-y-2">
                <li>Navigate to the Strategy Builder</li>
                <li>Define your business objective</li>
                <li>Select relevant KPIs to track</li>
                <li>Choose plugins to integrate</li>
                <li>Configure execution parameters</li>
                <li>Review and launch your strategy</li>
              </ol>
            </DocumentationSection>
            
            <DocumentationSection title="Strategy Evolution">
              <p>
                Strategies evolve over time based on performance data and feedback.
                The Evolution Dashboard provides insights into strategy performance
                and suggests optimizations to improve results.
              </p>
              <p className="mt-2">
                Key metrics tracked include:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>Execution success rate</li>
                <li>Average run time</li>
                <li>Target KPI impact</li>
                <li>Resource utilization</li>
              </ul>
            </DocumentationSection>
          </DocumentationCard>
        </TabsContent>
        
        <TabsContent value="plugins" className="space-y-6">
          <DocumentationCard 
            title="Plugins" 
            description="Extending functionality with plugins"
            icon={<Code className="h-5 w-5 text-primary" />}
          >
            <DocumentationSection title="Plugin System">
              <p>
                Plugins are modular components that extend the Allora OS platform
                with additional functionality. They can integrate external services,
                implement business logic, or provide specialized analytics.
              </p>
            </DocumentationSection>
            
            <DocumentationSection title="Installing Plugins">
              <ol className="list-decimal pl-6 space-y-2">
                <li>Navigate to the Plugin Marketplace</li>
                <li>Browse available plugins</li>
                <li>Select a plugin to install</li>
                <li>Configure plugin settings</li>
                <li>Activate the plugin for your workspace</li>
              </ol>
            </DocumentationSection>
            
            <DocumentationSection title="Developing Custom Plugins">
              <p>
                Developers can create custom plugins using the Plugin SDK:
              </p>
              <div className="bg-muted p-4 rounded-md font-mono text-sm mt-2">
                <p>import { createPlugin } from '@allora/plugin-sdk';</p>
                <p className="mt-2">const myPlugin = createPlugin({'{'}</p>
                <p>  name: 'My Custom Plugin',</p>
                <p>  version: '1.0.0',</p>
                <p>  description: 'A custom plugin for Allora OS',</p>
                <p>  execute: async (context) => {'{'}</p>
                <p>    // Plugin implementation</p>
                <p>    return {'{'} success: true, data: {'{'} result: 'Hello world' } };</p>
                <p>  {'}'},</p>
                <p>{'}'});</p>
              </div>
              <p className="mt-2">
                Refer to the Plugin SDK documentation for detailed API reference.
              </p>
            </DocumentationSection>
          </DocumentationCard>
        </TabsContent>
        
        <TabsContent value="agents" className="space-y-6">
          <DocumentationCard 
            title="Agents" 
            description="AI agents and automation"
            icon={<Users className="h-5 w-5 text-primary" />}
          >
            <DocumentationSection title="Agent Overview">
              <p>
                Agents are autonomous AI entities that perform specific tasks within
                the Allora OS ecosystem. They can interact with plugins, execute
                strategies, and learn from performance data to improve over time.
              </p>
            </DocumentationSection>
            
            <DocumentationSection title="Agent Types">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Task Agents</strong>: Perform specific, well-defined tasks
                  such as data analysis or content generation.
                </li>
                <li>
                  <strong>Strategy Agents</strong>: Monitor and execute parts of a
                  business strategy, making decisions based on real-time data.
                </li>
                <li>
                  <strong>Assistant Agents</strong>: Provide support and insights to
                  users, answering questions and guiding decision-making.
                </li>
              </ul>
            </DocumentationSection>
            
            <DocumentationSection title="Agent Evolution">
              <p>
                Agents evolve through a performance-based system:
              </p>
              <ol className="list-decimal pl-6 space-y-1 mt-2">
                <li>Performance data is collected from agent executions</li>
                <li>User feedback is incorporated through voting</li>
                <li>The system identifies improvement opportunities</li>
                <li>New agent versions are generated with optimizations</li>
                <li>A/B testing verifies performance improvements</li>
                <li>Successful evolutions become the new standard</li>
              </ol>
              <p className="mt-2">
                Agent evolution is tracked in the Agent Performance dashboard, showing
                XP gained, success rates, and version history.
              </p>
            </DocumentationSection>
          </DocumentationCard>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-6">
          <DocumentationCard 
            title="API Reference" 
            description="Integrating with Allora OS via API"
            icon={<Code className="h-5 w-5 text-primary" />}
          >
            <DocumentationSection title="Authentication">
              <p>
                All API requests require authentication using an API key, which can be
                generated in the Admin panel. Include the key in the Authorization header:
              </p>
              <div className="bg-muted p-4 rounded-md font-mono text-sm mt-2">
                <p>Authorization: Bearer YOUR_API_KEY</p>
              </div>
            </DocumentationSection>
            
            <DocumentationSection title="API Endpoints">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Strategy Execution</h4>
                  <div className="bg-muted p-3 rounded-md font-mono text-xs mt-1">
                    <p>POST /api/executeStrategy</p>
                    <p className="mt-1">{'{'}</p>
                    <p>  "strategyId": "string",</p>
                    <p>  "params": {'{'} /* Optional parameters */ {'}'}</p>
                    <p>{'}'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Plugin Management</h4>
                  <div className="bg-muted p-3 rounded-md font-mono text-xs mt-1">
                    <p>GET /api/plugins</p>
                    <p>GET /api/plugins/:id</p>
                    <p>POST /api/plugins/:id/execute</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">KPI Data</h4>
                  <div className="bg-muted p-3 rounded-md font-mono text-xs mt-1">
                    <p>GET /api/kpis</p>
                    <p>GET /api/kpis/:id/trends</p>
                    <p>POST /api/kpis/:id/update</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm">
                For complete API documentation, see the API Reference Guide.
              </p>
            </DocumentationSection>
            
            <DocumentationSection title="Rate Limiting">
              <p>
                API requests are subject to rate limiting based on your plan. Rate limit
                information is returned in the following headers:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2 text-sm">
                <li><code>X-RateLimit-Limit</code>: Maximum requests per hour</li>
                <li><code>X-RateLimit-Remaining</code>: Remaining requests in current period</li>
                <li><code>X-RateLimit-Reset</code>: Time until rate limit resets (in seconds)</li>
              </ul>
            </DocumentationSection>
          </DocumentationCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlloraOSDocs;
